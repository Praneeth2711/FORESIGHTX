import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type {
  DecisionOutcome,
  DecisionContractResponse,
} from '../../lib/api';

export interface AutopilotTask {
  id: string;
  title: string;
  suggested_role: string;
  isProposed: boolean;
  completed: boolean;
}

export type DependencyStatus = 'unknown' | 'available' | 'unavailable';

export interface AutopilotDependency {
  id: string;
  label: string;
  status: DependencyStatus;
  critical: boolean;
  impactReason: string;
}

export interface AutopilotFallback {
  title: string;
  action_steps: { id: string; title: string; completed: boolean }[];
  isActive: boolean;
}

export interface ActiveAutopilotPlan {
  decisionId: 'A' | 'B' | 'C';
  title: string;
  strategyDescription: string;
  reasoning: string;
  tasks: AutopilotTask[];
  dependencies: AutopilotDependency[];
  failureTriggers: string[];
  fallbackPlan: AutopilotFallback;
  assumptions: string[];
  isFallbackActivated: boolean;
}

export interface PreviousPlanRecord {
  decisionId: 'A' | 'B' | 'C';
  title: string;
  status: 'BLOCKED' | 'SUPERSEDED' | 'FALLBACK_ACTIVATED';
  reason: string;
  completedTasks: number;
  totalTasks: number;
  timestamp: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type:
    | 'ACTIVATION'
    | 'TASK_DONE'
    | 'TASK_UNDONE'
    | 'TASK_CONFIRMED'
    | 'DEP_CHANGE'
    | 'BLOCKED'
    | 'FALLBACK_TRIGGERED';
  message: string;
}

interface DecisionAutopilotProps {
  activeDecision: 'A' | 'B' | 'C';
  contract?: DecisionContractResponse | null;
  outcomes?: Record<string, DecisionOutcome>;
  internetLost?: boolean;
  onSwitchDecision?: (decisionId: 'A' | 'B' | 'C') => void;
  forcedPlanId?: 'A' | 'B' | 'C' | null;
  onPlanActivated?: (id: 'A' | 'B' | 'C') => void;
}

const formatTime = () => {
  const d = new Date();
  return d.toTimeString().split(' ')[0];
};

export const DecisionAutopilot: React.FC<DecisionAutopilotProps> = ({
  activeDecision,
  contract,
  outcomes,
  internetLost = false,
  onSwitchDecision,
  forcedPlanId,
  onPlanActivated,
}) => {
  const [activePlan, setActivePlan] = useState<ActiveAutopilotPlan | null>(null);
  const [previousPlans, setPreviousPlans] = useState<PreviousPlanRecord[]>([]);
  const [activityHistory, setActivityHistory] = useState<ActivityLog[]>([]);

  // Build a generic, cross-industry plan dynamically from the Gemma 4 Decision Contract
  const buildPlan = (id: 'A' | 'B' | 'C'): ActiveAutopilotPlan => {
    // 1. Primary path: Use the dynamic AI Decision Contract returned by Gemma 4
    if (contract && contract.alternatives) {
      const alt = contract.alternatives.find((a) => a.id === id) || contract.alternatives[0];
      if (alt) {
        return {
          decisionId: id,
          title: alt.title || `Strategy Option ${id}`,
          strategyDescription: alt.description || alt.reasoning || `Execution pathway for ${contract.domain}`,
          reasoning: alt.reasoning || '',
          tasks: (alt.action_steps || []).map((step, idx) => ({
            id: step.id || `step-${id}-${idx + 1}`,
            title: step.title,
            suggested_role: step.suggested_role || 'Operations Lead',
            isProposed: true, // Marked proposed until operator confirms
            completed: step.status === 'completed',
          })),
          dependencies: (alt.dependencies || []).map((dep, idx) => ({
            id: dep.id || `dep-${id}-${idx + 1}`,
            label: dep.label,
            // When no dependency status is confirmed, display UNKNOWN
            status: (dep.status as DependencyStatus) || 'unknown',
            critical: dep.critical !== false,
            impactReason: `Critical prerequisite for Option ${id} execution in ${contract.domain}.`,
          })),
          failureTriggers: alt.failure_triggers || [],
          fallbackPlan: {
            title: alt.fallback_plan?.title || `Contingency Protocol ${id}`,
            action_steps: (alt.fallback_plan?.action_steps || []).map((s, sIdx) => ({
              id: s.id || `fallback-step-${id}-${sIdx + 1}`,
              title: s.title,
              completed: s.status === 'completed',
            })),
            isActive: false,
          },
          assumptions: alt.assumptions || [],
          isFallbackActivated: false,
        };
      }
    }

    // 2. Secondary path: If event simulation outcomes exist, create neutral strategy wrapper
    const outcome = outcomes ? outcomes[id] : null;
    return {
      decisionId: id,
      title: outcome ? outcome.title : `Strategy Option ${id}`,
      strategyDescription: outcome ? outcome.description : `Operational Plan ${id}`,
      reasoning: outcome?.feasibility_reasons?.join(', ') || 'Selected operational course of action.',
      tasks: [
        {
          id: `step-${id}-1`,
          title: `Mobilize response team for Option ${id}`,
          suggested_role: 'Operations Lead',
          isProposed: true,
          completed: false,
        },
        {
          id: `step-${id}-2`,
          title: `Verify critical infrastructure and communication channels`,
          suggested_role: 'Technical Lead',
          isProposed: true,
          completed: false,
        },
        {
          id: `step-${id}-3`,
          title: `Deploy primary execution protocol`,
          suggested_role: 'Execution Team',
          isProposed: true,
          completed: false,
        },
      ],
      dependencies: [
        {
          id: `dep-${id}-1`,
          label: 'Primary communication network available',
          status: 'unknown',
          critical: true,
          impactReason: 'Command and control communication required for synchronization.',
        },
        {
          id: `dep-${id}-2`,
          label: 'Designated response personnel on-site',
          status: 'unknown',
          critical: true,
          impactReason: 'Operational staff must be actively deployed.',
        },
      ],
      failureTriggers: ['Loss of primary communication', 'Critical resource unavailable'],
      fallbackPlan: {
        title: `Emergency Secondary Protocol for Option ${id}`,
        action_steps: [
          { id: `fallback-step-${id}-1`, title: 'Halt current deployment and isolate state', completed: false },
          { id: `fallback-step-${id}-2`, title: 'Transition to backup operational channel', completed: false },
        ],
        isActive: false,
      },
      assumptions: ['Operating conditions verified by site lead'],
      isFallbackActivated: false,
    };
  };

  // Sync forcedPlanId if specified by parent
  useEffect(() => {
    if (forcedPlanId && (!activePlan || activePlan.decisionId !== forcedPlanId)) {
      handleActivateDecision(forcedPlanId);
    }
  }, [forcedPlanId]);

  // When a contract is freshly loaded or updated, reset or re-evaluate active plan
  useEffect(() => {
    if (contract && (!activePlan || !activePlan.tasks.length)) {
      // Auto-initialize plan to activeDecision if contract is loaded
      handleActivateDecision(activeDecision);
    }
  }, [contract]);

  // External disruption sync (e.g. internet disruption toggle in event simulation)
  useEffect(() => {
    if (activePlan && internetLost) {
      setActivePlan((prev) => {
        if (!prev) return null;
        let changed = false;
        const updatedDeps = prev.dependencies.map((d) => {
          if (d.label.toLowerCase().includes('internet') || d.label.toLowerCase().includes('network') || d.label.toLowerCase().includes('wi-fi')) {
            if (d.status !== 'unavailable') {
              changed = true;
              return { ...d, status: 'unavailable' as DependencyStatus };
            }
          }
          return d;
        });

        if (changed) {
          setActivityHistory((hist) => [
            {
              id: Math.random().toString(36).substring(7),
              timestamp: formatTime(),
              type: 'BLOCKED',
              message: `External disruption injected: Network dependency marked UNAVAILABLE. Plan Option ${prev.decisionId} is BLOCKED.`,
            },
            ...hist,
          ]);
          return { ...prev, dependencies: updatedDeps };
        }
        return prev;
      });
    }
  }, [internetLost]);

  // Activate decision into live autopilot execution
  const handleActivateDecision = (id: 'A' | 'B' | 'C') => {
    const newPlan = buildPlan(id);
    setActivePlan(newPlan);
    onPlanActivated?.(id);
    setActivityHistory((prev) => [
      {
        id: Math.random().toString(36).substring(7),
        timestamp: formatTime(),
        type: 'ACTIVATION',
        message: `Activated Decision Option ${id}: "${newPlan.title}" (${contract?.domain || 'Cross-Domain'}) into Autopilot execution.`,
      },
      ...prev,
    ]);
  };

  // Toggle task completed state
  const handleToggleTask = (taskId: string) => {
    if (!activePlan) return;
    setActivePlan((prev) => {
      if (!prev) return null;
      let taskTitle = '';
      let isNowComplete = false;
      const updatedTasks = prev.tasks.map((t) => {
        if (t.id === taskId) {
          taskTitle = t.title;
          isNowComplete = !t.completed;
          return { ...t, completed: isNowComplete, isProposed: false };
        }
        return t;
      });

      setActivityHistory((hist) => [
        {
          id: Math.random().toString(36).substring(7),
          timestamp: formatTime(),
          type: isNowComplete ? 'TASK_DONE' : 'TASK_UNDONE',
          message: isNowComplete ? `Task completed: "${taskTitle}"` : `Task reopened: "${taskTitle}"`,
        },
        ...hist,
      ]);

      return { ...prev, tasks: updatedTasks };
    });
  };

  // Confirm proposed task
  const handleConfirmTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activePlan) return;
    setActivePlan((prev) => {
      if (!prev) return null;
      let confirmedTitle = '';
      let role = '';
      const updatedTasks = prev.tasks.map((t) => {
        if (t.id === taskId) {
          confirmedTitle = t.title;
          role = t.suggested_role;
          return { ...t, isProposed: false };
        }
        return t;
      });

      setActivityHistory((hist) => [
        {
          id: Math.random().toString(36).substring(7),
          timestamp: formatTime(),
          type: 'TASK_CONFIRMED',
          message: `Proposed action confirmed: "${confirmedTitle}" (Role: ${role}).`,
        },
        ...hist,
      ]);

      return { ...prev, tasks: updatedTasks };
    });
  };

  // Update dependency status: Cycles through unknown -> available -> unavailable -> available
  const handleCycleDependency = (depId: string) => {
    if (!activePlan) return;
    setActivePlan((prev) => {
      if (!prev) return null;
      let depLabel = '';
      let newStatus: DependencyStatus = 'unknown';

      const updatedDeps = prev.dependencies.map((d) => {
        if (d.id === depId) {
          depLabel = d.label;
          if (d.status === 'unknown') newStatus = 'available';
          else if (d.status === 'available') newStatus = 'unavailable';
          else newStatus = 'available';
          return { ...d, status: newStatus };
        }
        return d;
      });

      setActivityHistory((hist) => {
        const newLogs: ActivityLog[] = [
          {
            id: Math.random().toString(36).substring(7),
            timestamp: formatTime(),
            type: 'DEP_CHANGE',
            message: `Dependency status updated: "${depLabel}" marked ${newStatus.toUpperCase()}.`,
          },
        ];
        if (newStatus === 'unavailable') {
          newLogs.unshift({
            id: Math.random().toString(36).substring(7),
            timestamp: formatTime(),
            type: 'BLOCKED',
            message: `Plan Option ${prev.decisionId} is BLOCKED: Critical requirement "${depLabel}" is UNAVAILABLE.`,
          });
        }
        return [...newLogs, ...hist];
      });

      return { ...prev, dependencies: updatedDeps };
    });
  };

  // Direct toggle dependency unavailable / available
  const handleSetDependencyStatus = (depId: string, status: DependencyStatus) => {
    if (!activePlan) return;
    setActivePlan((prev) => {
      if (!prev) return null;
      let depLabel = '';
      const updatedDeps = prev.dependencies.map((d) => {
        if (d.id === depId) {
          depLabel = d.label;
          return { ...d, status };
        }
        return d;
      });

      setActivityHistory((hist) => {
        const newLogs: ActivityLog[] = [
          {
            id: Math.random().toString(36).substring(7),
            timestamp: formatTime(),
            type: 'DEP_CHANGE',
            message: `Dependency status set: "${depLabel}" → ${status.toUpperCase()}.`,
          },
        ];
        if (status === 'unavailable') {
          newLogs.unshift({
            id: Math.random().toString(36).substring(7),
            timestamp: formatTime(),
            type: 'BLOCKED',
            message: `Plan Option ${prev.decisionId} BLOCKED: Critical requirement "${depLabel}" reported unavailable.`,
          });
        }
        return [...newLogs, ...hist];
      });

      return { ...prev, dependencies: updatedDeps };
    });
  };

  // Check if active plan is currently blocked by any critical unavailable dependency
  const failedDependency = activePlan?.dependencies.find((d) => d.critical && d.status === 'unavailable');
  const isPlanBlocked = Boolean(failedDependency);

  // Trigger fallback plan activation
  const handleActivateFallback = () => {
    if (!activePlan) return;
    const completedCount = activePlan.tasks.filter((t) => t.completed).length;

    // 1. Preserve previous plan status in history
    const previousRecord: PreviousPlanRecord = {
      decisionId: activePlan.decisionId,
      title: activePlan.title,
      status: 'BLOCKED',
      reason: failedDependency
        ? `Critical dependency "${failedDependency.label}" failed.`
        : 'Operator initiated fallback transition.',
      completedTasks: completedCount,
      totalTasks: activePlan.tasks.length,
      timestamp: formatTime(),
    };

    setPreviousPlans((prev) => [previousRecord, ...prev]);

    // 2. Transition active plan to use the prepared fallback action steps
    const fallbackTasks: AutopilotTask[] = activePlan.fallbackPlan.action_steps.map((s, idx) => ({
      id: s.id || `fallback-step-${idx + 1}`,
      title: s.title,
      suggested_role: 'Contingency Lead',
      isProposed: false,
      completed: s.completed,
    }));

    setActivePlan((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        title: `Fallback: ${prev.fallbackPlan.title}`,
        tasks: fallbackTasks,
        isFallbackActivated: true,
        fallbackPlan: {
          ...prev.fallbackPlan,
          isActive: true,
        },
      };
    });

    // 3. Record transition in activity history
    setActivityHistory((prev) => [
      {
        id: Math.random().toString(36).substring(7),
        timestamp: formatTime(),
        type: 'FALLBACK_TRIGGERED',
        message: `ADAPTIVE FALLBACK ACTIVATED: Transitioned from Option ${activePlan.decisionId} to Fallback Plan: "${activePlan.fallbackPlan.title}". Prior execution preserved.`,
      },
      ...prev,
    ]);

    onSwitchDecision?.(activePlan.decisionId);
  };

  // Calculate progress
  const completedTasksCount = activePlan ? activePlan.tasks.filter((t) => t.completed).length : 0;
  const totalTasksCount = activePlan ? activePlan.tasks.length : 0;
  const progressPercent =
    totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <div className="bg-white border border-[#D8D0C5] rounded-2xl p-6 sm:p-8 shadow-sm">
      {/* Autopilot Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#D8D0C5]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#171615] flex items-center justify-center text-[#F4EFE7] shadow-sm">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="mono-val text-[11px] font-semibold text-[#F06445] tracking-[0.15em] uppercase">
                Adaptive Execution
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider mono-val bg-[#EAE3D8] text-[#171615]">
                {contract?.domain ? contract.domain.toUpperCase() : 'CROSS-INDUSTRY ENGINE'}
              </span>
            </div>
            <h2 className="text-[20px] sm:text-[22px] font-semibold text-[#171615] tracking-[-0.02em]">
              FORESIGHTX LIVE — Decision Autopilot
            </h2>
          </div>
        </div>

        {/* Global Autopilot Status Badge */}
        <div className="flex items-center gap-2">
          {!activePlan ? (
            <span className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-[#F4EFE7] text-[#756D65] border border-[#D8D0C5] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#A39B93]" />
              STANDBY — NO PLAN DEPLOYED
            </span>
          ) : isPlanBlocked ? (
            <span className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-200 flex items-center gap-2 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              PLAN BLOCKED: DEPENDENCY FAILURE
            </span>
          ) : activePlan.isFallbackActivated ? (
            <span className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
              FALLBACK ADAPTATION ACTIVE
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-green-100 text-green-700 border border-green-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              LIVE EXECUTION: OPTION {activePlan.decisionId} ACTIVE
            </span>
          )}
        </div>
      </div>

      {/* Activation prompt or Active Plan UI */}
      {!activePlan ? (
        <div className="py-10 text-center max-w-[620px] mx-auto">
          <div className="w-12 h-12 rounded-full bg-[#F4EFE7] border border-[#D8D0C5] flex items-center justify-center mx-auto mb-4 text-[#756D65]">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h3 className="text-[17px] font-medium text-[#171615] mb-2">No Active Decision Deployed</h3>
          <p className="text-[13px] text-[#756D65] leading-relaxed mb-6">
            Select an alternative below to deploy structured action steps, track live dependency guardrails, and prepare adaptive fallback triggers.
          </p>
          <button
            onClick={() => handleActivateDecision(activeDecision)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#171615] text-[#F4EFE7] text-[13px] font-semibold hover:bg-[#241F1B] transition-all shadow-sm"
          >
            <span>⚡</span>
            ACTIVATE DECISION (OPTION {activeDecision}) NOW
          </button>
        </div>
      ) : (
        <div className="pt-6 space-y-6">
          {/* Top Plan Banner */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              isPlanBlocked
                ? 'border-red-300 bg-red-50/70'
                : activePlan.isFallbackActivated
                ? 'border-purple-300 bg-purple-50/50'
                : 'border-[#D8D0C5] bg-[#F4EFE7]'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <span className="mono-val text-[10px] font-bold text-[#F06445] uppercase tracking-widest">
                  {activePlan.isFallbackActivated ? 'Adaptive Fallback Plan' : 'Active Execution Plan'}
                </span>
                <h3 className="text-[18px] sm:text-[20px] font-semibold text-[#171615] flex items-center gap-2">
                  Option {activePlan.decisionId}: {activePlan.title}
                  {isPlanBlocked && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold mono-val bg-red-600 text-white">
                      BLOCKED
                    </span>
                  )}
                  {activePlan.isFallbackActivated && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold mono-val bg-purple-700 text-white">
                      ADAPTED
                    </span>
                  )}
                </h3>
                {activePlan.strategyDescription && (
                  <p className="text-[13px] text-[#756D65] mt-1 max-w-[800px]">
                    {activePlan.strategyDescription}
                  </p>
                )}
              </div>

              {/* Switch or Re-activate button */}
              <div className="flex items-center gap-2">
                {activeDecision !== activePlan.decisionId && (
                  <button
                    onClick={() => handleActivateDecision(activeDecision)}
                    className="px-3 py-1.5 rounded-lg border border-[#D8D0C5] bg-white text-[12px] font-medium text-[#241F1B] hover:border-[#171615] transition-colors"
                  >
                    Switch to Option {activeDecision}
                  </button>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between items-center text-[12px] mb-1.5">
                <span className="font-medium text-[#241F1B]">
                  Actionable Checklist Execution Progress
                </span>
                <span className="mono-val font-semibold text-[#171615]">
                  {completedTasksCount} of {totalTasksCount} completed ({progressPercent}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#D8D0C5]/60 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full transition-colors ${
                    isPlanBlocked
                      ? 'bg-red-500'
                      : activePlan.isFallbackActivated
                      ? 'bg-purple-600'
                      : progressPercent === 100
                      ? 'bg-[#10b981]'
                      : 'bg-[#171615]'
                  }`}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Blocked Dependency Alert & Fallback CTA */}
            {isPlanBlocked && failedDependency && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 p-4 rounded-xl border border-red-300 bg-white shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[14px] font-semibold text-red-700">
                      Operational Guardrail Triggered: "{failedDependency.label}" is UNAVAILABLE
                    </h4>
                    <p className="text-[12px] text-red-600 mt-1 leading-relaxed">
                      {failedDependency.impactReason}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <button
                        onClick={handleActivateFallback}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white text-[12px] font-semibold hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm"
                      >
                        <span>⚡</span>
                        ACTIVATE PREPARED FALLBACK: {activePlan.fallbackPlan.title}
                      </button>
                      <span className="text-[11px] text-[#756D65]">
                        Deterministic transition preserving prior logs & history
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Grid: Action Checklist (Left) & Dependencies / History (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6">
            {/* Actionable Checklist */}
            <div className="bg-[#F4EFE7] border border-[#D8D0C5] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#171615]" />
                  <span className="mono-val text-[11px] font-bold text-[#171615] tracking-widest uppercase">
                    Execution Checklist
                  </span>
                </div>
                <span className="mono-val text-[11px] text-[#756D65]">
                  Click checkbox to complete
                </span>
              </div>

              <div className="space-y-2.5">
                {activePlan.tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                      task.completed
                        ? 'bg-white/60 border-green-300 text-[#756D65]'
                        : 'bg-white border-[#D8D0C5] hover:border-[#171615] text-[#241F1B] shadow-sm'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded mt-0.5 flex items-center justify-center shrink-0 border transition-colors ${
                        task.completed
                          ? 'bg-[#10b981] border-[#10b981] text-white'
                          : 'border-[#A39B93] bg-[#F4EFE7]'
                      }`}
                    >
                      {task.completed && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className={`text-[13px] font-medium leading-snug ${
                            task.completed ? 'line-through text-[#756D65]' : 'text-[#241F1B]'
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.isProposed && (
                          <span className="mono-val text-[9px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                            PROPOSED BY AI
                          </span>
                        )}
                        <span className="mono-val text-[9px] px-1.5 py-0.5 rounded bg-[#EAE3D8] text-[#756D65]">
                          {task.suggested_role}
                        </span>
                      </div>
                      {task.isProposed && !task.completed && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <button
                            onClick={(e) => handleConfirmTask(task.id, e)}
                            className="mono-val text-[10px] font-semibold text-[#F06445] hover:underline"
                          >
                            ✓ Confirm Proposed Action
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Fallback Action Preview */}
              <div className="mt-5 p-3.5 rounded-xl bg-white/70 border border-[#D8D0C5] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="mono-val text-[10px] font-bold px-2 py-0.5 rounded bg-[#EAE3D8] text-[#171615] shrink-0">
                    PREPARED FALLBACK
                  </span>
                  <span className="text-[12px] text-[#756D65] truncate">
                    {activePlan.fallbackPlan.title}
                  </span>
                </div>
                {!isPlanBlocked && !activePlan.isFallbackActivated && (
                  <button
                    onClick={handleActivateFallback}
                    className="mono-val text-[11px] text-[#F06445] hover:underline font-semibold shrink-0"
                  >
                    Activate Fallback →
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Dependencies & Activity History */}
            <div className="space-y-6">
              {/* Critical Dependencies with UNKNOWN by default & Interactive State */}
              <div className="bg-[#F4EFE7] border border-[#D8D0C5] rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#F06445]" />
                    <span className="mono-val text-[11px] font-bold text-[#171615] tracking-widest uppercase">
                      Critical Dependencies
                    </span>
                  </div>
                  <span className="mono-val text-[10px] text-[#756D65] uppercase">
                    Live Guardrails
                  </span>
                </div>
                <p className="text-[11px] text-[#756D65] mb-3">
                  Report live conditions below. Failing a critical dependency flags the plan as blocked:
                </p>

                <div className="space-y-2.5">
                  {activePlan.dependencies.map((dep) => (
                    <div
                      key={dep.id}
                      className={`p-3 rounded-xl border transition-all bg-white ${
                        dep.status === 'unavailable'
                          ? 'border-red-300 bg-red-50/50'
                          : dep.status === 'available'
                          ? 'border-green-300'
                          : 'border-[#D8D0C5]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="text-[12px] font-semibold text-[#241F1B] block leading-snug">
                            {dep.label}
                          </span>
                          <span className="mono-val text-[9px] text-[#A39B93]">
                            {dep.critical ? 'CRITICAL REQUIREMENT' : 'SECONDARY PREREQUISITE'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {dep.status === 'unknown' ? (
                            <button
                              onClick={() => handleCycleDependency(dep.id)}
                              className="mono-val text-[10px] font-bold px-2 py-1 rounded bg-[#EAE3D8] text-[#756D65] hover:bg-green-100 hover:text-green-700 transition-colors"
                              title="Click to report condition"
                            >
                              ? UNKNOWN
                            </button>
                          ) : dep.status === 'available' ? (
                            <button
                              onClick={() => handleCycleDependency(dep.id)}
                              className="mono-val text-[10px] font-bold px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700 transition-colors"
                              title="Click to toggle"
                            >
                              ✓ AVAILABLE
                            </button>
                          ) : (
                            <button
                              onClick={() => handleCycleDependency(dep.id)}
                              className="mono-val text-[10px] font-bold px-2 py-1 rounded bg-red-600 text-white hover:bg-green-600 transition-colors"
                              title="Click to toggle"
                            >
                              ✗ UNAVAILABLE
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Quick action buttons */}
                      <div className="mt-2 pt-2 border-t border-[#F4EFE7] flex items-center justify-between text-[10px]">
                        <span className="text-[#A39B93] mono-val">Set status:</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSetDependencyStatus(dep.id, 'available')}
                            className={`px-1.5 py-0.5 rounded mono-val font-semibold ${
                              dep.status === 'available'
                                ? 'bg-green-600 text-white'
                                : 'text-[#756D65] hover:text-[#241F1B]'
                            }`}
                          >
                            Available
                          </button>
                          <button
                            onClick={() => handleSetDependencyStatus(dep.id, 'unavailable')}
                            className={`px-1.5 py-0.5 rounded mono-val font-semibold ${
                              dep.status === 'unavailable'
                                ? 'bg-red-600 text-white'
                                : 'text-[#756D65] hover:text-red-600'
                            }`}
                          >
                            Unavailable
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity History & Transitions */}
              <div className="bg-[#F4EFE7] border border-[#D8D0C5] rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                    <span className="mono-val text-[11px] font-bold text-[#171615] tracking-widest uppercase">
                      Activity History & Audit
                    </span>
                  </div>
                  <span className="mono-val text-[10px] text-[#756D65]">
                    {activityHistory.length} events
                  </span>
                </div>

                {/* Previous Plans Log if any */}
                {previousPlans.length > 0 && (
                  <div className="mb-3 p-2.5 bg-amber-50/80 border border-amber-200 rounded-lg">
                    <span className="mono-val text-[9px] font-bold uppercase tracking-wider text-amber-800">
                      Preserved Prior Plans
                    </span>
                    {previousPlans.map((prev, idx) => (
                      <div key={idx} className="text-[11px] text-amber-900 mt-1 flex items-start gap-1.5">
                        <span className="font-semibold mono-val">[{prev.timestamp}]</span>
                        <span>
                          Option {prev.decisionId} ({prev.title}) — Status:{' '}
                          <strong className="text-red-700">{prev.status}</strong> ({prev.completedTasks}/
                          {prev.totalTasks} tasks completed).
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="max-h-[200px] overflow-y-auto space-y-1.5 pr-1">
                  {activityHistory.length === 0 ? (
                    <div className="text-[11px] text-[#756D65] italic py-2">
                      No activity recorded yet.
                    </div>
                  ) : (
                    activityHistory.map((item) => (
                      <div
                        key={item.id}
                        className={`text-[11px] p-2 rounded border leading-relaxed flex items-start gap-2 ${
                          item.type === 'BLOCKED'
                            ? 'bg-red-50 border-red-200 text-red-700'
                            : item.type === 'FALLBACK_TRIGGERED'
                            ? 'bg-purple-50 border-purple-200 text-purple-800 font-medium'
                            : item.type === 'TASK_DONE'
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : item.type === 'TASK_CONFIRMED'
                            ? 'bg-amber-50 border-amber-200 text-amber-900'
                            : 'bg-white border-[#D8D0C5] text-[#241F1B]'
                        }`}
                      >
                        <span className="mono-val text-[10px] text-[#756D65] shrink-0 font-medium">
                          {item.timestamp}
                        </span>
                        <span className="min-w-0 break-words">{item.message}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
