import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import type {
  DecisionContractResponse,
  SimulationInput,
  SimulationResult,
  RecalculationResult,
  DecisionOutcome,
} from '../lib/api';
import { DecisionAutopilot } from '../components/workspace/DecisionAutopilot';

// ─── Supported Event Simulation Strategies ────────────────────────────────────

const SUPPORTED_STRATEGIES: Record<string, { id: 'A' | 'B' | 'C'; label: string; description: string }> = {
  A: { id: 'A', label: 'Delay the Event', description: 'Hold the schedule and wait for the delayed primary speaker to arrive.' },
  B: { id: 'B', label: 'Start Alternative Activity', description: 'Deploy a secondary interactive session, workshop, or structured networking.' },
  C: { id: 'C', label: 'Activate Backup Speaker', description: 'Deploy a vetted standby speaker to deliver an alternative keynote.' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const Label = ({ children }: { children: React.ReactNode }) => (
  <div className="mono-val text-[10px] sm:text-[11px] font-semibold text-[#A39B93] uppercase tracking-widest mb-1">{children}</div>
);

const Spinner = () => (
  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

// SVG decision graph
const WorkspaceGraph = ({
  outcomes,
  activeId,
  onSelect,
  disrupted,
}: {
  outcomes: Record<string, DecisionOutcome>;
  activeId: 'A' | 'B' | 'C';
  onSelect: (id: 'A' | 'B' | 'C') => void;
  disrupted: boolean;
}) => {
  const nodes = {
    start: { x: 80, y: 280 },
    A: { x: 310, y: 130 },
    B: { x: 310, y: 280 },
    C: { x: 310, y: 430 },
    outA: { x: 540, y: 130 },
    outB: { x: 540, y: 280 },
    outC: { x: 540, y: 430 },
  };

  const bezier = (s: { x: number; y: number }, e: { x: number; y: number }) => {
    const cp1x = s.x + (e.x - s.x) * 0.45;
    const cp2x = s.x + (e.x - s.x) * 0.55;
    return `M ${s.x} ${s.y} C ${cp1x} ${s.y}, ${cp2x} ${e.y}, ${e.x} ${e.y}`;
  };

  const getPathColor = (id: string) => {
    if (activeId === id) return disrupted ? '#F06445' : '#171615';
    return '#D8D0C5';
  };

  const getNodeLabel = (id: 'A' | 'B' | 'C') => {
    const out = outcomes[id];
    if (!out) return '';
    return out.feasible ? out.title : `✗ ${out.title}`;
  };

  return (
    <div className="w-full min-w-0">
      <svg viewBox="0 0 840 560" className="w-full h-auto select-none" preserveAspectRatio="xMidYMid meet">
        {disrupted && (
          <motion.circle cx={nodes.start.x} cy={nodes.start.y} r={36} fill="#F06445" opacity={0.08}
            animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.12, 0.05] }}
            transition={{ repeat: Infinity, duration: 2.5 }} />
        )}

        {(['A', 'B', 'C'] as const).map(id => {
          const isActive = activeId === id;
          const out = outcomes[id];
          const color = getPathColor(id);
          const outNode = nodes[`out${id}` as keyof typeof nodes];

          return (
            <g key={id} className="cursor-pointer" onClick={() => onSelect(id)}>
              <path d={bezier(nodes.start, nodes[id])} fill="none" stroke="transparent" strokeWidth={30} />
              <path d={bezier(nodes[id], outNode)} fill="none" stroke="transparent" strokeWidth={30} />

              <motion.path d={bezier(nodes.start, nodes[id])} fill="none" stroke={color} strokeWidth={isActive ? 3 : 1.5}
                animate={{ stroke: color, strokeWidth: isActive ? 3 : 1.5 }} />
              <motion.path d={bezier(nodes[id], outNode)} fill="none"
                stroke={isActive ? (out?.feasible ? '#10b981' : '#ef4444') : '#D8D0C5'}
                strokeWidth={isActive ? 3 : 1.5}
                strokeDasharray={isActive && !out?.feasible ? '6,4' : undefined}
                animate={{ stroke: isActive ? (out?.feasible ? '#10b981' : '#ef4444') : '#D8D0C5', strokeWidth: isActive ? 3 : 1.5 }} />

              {/* Decision node */}
              <circle cx={nodes[id].x} cy={nodes[id].y} r={isActive ? 10 : 6}
                fill={isActive ? '#171615' : '#F4EFE7'}
                stroke={isActive ? '#171615' : '#A39B93'} strokeWidth={isActive ? 0 : 2} />
              <text x={nodes[id].x} y={nodes[id].y - 20} textAnchor="middle" fill={isActive ? '#171615' : '#A39B93'}
                fontSize={11} fontFamily="monospace" fontWeight={600}>
                PATH {id}
              </text>
              <text x={nodes[id].x} y={nodes[id].y + 24} textAnchor="middle"
                fill={isActive ? '#241F1B' : '#756D65'} fontSize={13} fontWeight={500}>
                {SUPPORTED_STRATEGIES[id]?.label || `Option ${id}`}
              </text>

              {/* Outcome node */}
              <circle cx={outNode.x} cy={outNode.y} r={isActive ? 8 : 5}
                fill={isActive ? (out?.feasible ? '#10b981' : '#ef4444') : '#D8D0C5'} />
              <text x={outNode.x + 14} y={outNode.y + 5} textAnchor="start"
                fill={isActive ? (out?.feasible ? '#10b981' : '#ef4444') : '#756D65'}
                fontSize={12} fontWeight={500}>
                {getNodeLabel(id)}
              </text>
            </g>
          );
        })}

        {/* Origin node */}
        <circle cx={nodes.start.x} cy={nodes.start.y} r={8} fill={disrupted ? '#F06445' : '#171615'} />
        <circle cx={nodes.start.x} cy={nodes.start.y} r={16} fill="transparent"
          stroke={disrupted ? '#F06445' : '#171615'} strokeWidth={1} opacity={0.3} />
        <text x={nodes.start.x} y={nodes.start.y - 30} textAnchor="middle"
          fill={disrupted ? '#F06445' : '#241F1B'} fontSize={10} fontFamily="monospace" fontWeight={700}>
          {disrupted ? 'DISRUPTED' : 'EVENT'}
        </text>
        <text x={nodes.start.x} y={nodes.start.y + 30} textAnchor="middle" fill="#756D65" fontSize={12}>
          Speaker Delayed
        </text>
      </svg>
    </div>
  );
};

// Params editor for event simulation
const ParamField = ({
  label,
  value,
  onChange,
  type = 'number',
  min,
}: {
  label: string;
  value: number | string;
  onChange: (v: string) => void;
  type?: string;
  min?: number;
}) => (
  <div className="flex flex-col gap-1">
    <label className="mono-val text-[10px] uppercase tracking-widest text-[#A39B93]">{label}</label>
    <input
      type={type}
      min={min}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="px-3 py-2 bg-[#F4EFE7] border border-[#D8D0C5] rounded-lg text-[13px] text-[#241F1B] focus:outline-none focus:border-[#171615] mono-val"
    />
  </div>
);

// ─── Main Workspace Page ──────────────────────────────────────────────────────

type Phase = 'input' | 'analyzing' | 'contract';

export const Workspace: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('input');
  const [scenarioText, setScenarioText] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Gemma 4 Decision Contract (Single AI Request)
  const [contract, setContract] = useState<DecisionContractResponse | null>(null);
  const [activeDecision, setActiveDecision] = useState<'A' | 'B' | 'C'>('A');

  // Event simulation engine state (preserved for supported event scenarios)
  const [isEventSimulationEnabled, setIsEventSimulationEnabled] = useState(false);
  const [showEventSimConfig, setShowEventSimConfig] = useState(false);
  const [isSimRunning, setIsSimRunning] = useState(false);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [recalcResult, setRecalcResult] = useState<RecalculationResult | null>(null);
  const [internetLost, setInternetLost] = useState(false);
  const [recalcLoading, setRecalcLoading] = useState(false);
  const [autopilotPlanId, setAutopilotPlanId] = useState<'A' | 'B' | 'C' | null>(null);

  const [params, setParams] = useState<SimulationInput>({
    event_name: 'Event Keynote',
    event_duration: 180,
    current_event_time: 30,
    speaker_delay: 30,
    number_of_attendees: 300,
    available_backup_speakers: 1,
    internet_available: true,
    available_alternative_activities: ['Audience Q&A', 'Networking Session'],
    event_end_time_constraint: 210,
    equipment_functional: true,
    attendee_capacity: null,
    backup_requires_internet: false,
    activity_requires_internet: false,
  });

  // Handle single AI request for general-purpose Decision Contract
  async function handleAnalyze() {
    if (!scenarioText.trim()) return;
    setError(null);
    setPhase('analyzing');
    try {
      const contractResult = await api.decisionContract(scenarioText);
      setContract(contractResult);
      setActiveDecision('A');

      // Check if domain is an event scenario to configure deterministic simulation
      const domainLower = contractResult.domain.toLowerCase();
      const textLower = scenarioText.toLowerCase();
      const isEventDomain =
        domainLower.includes('event') ||
        textLower.includes('speaker') ||
        textLower.includes('keynote') ||
        textLower.includes('attendee');

      setIsEventSimulationEnabled(isEventDomain);

      // Pre-populate simulation params if event-related numbers present
      if (isEventDomain) {
        const delayMatch = scenarioText.match(/(\d+)\s*(?:min|minute)/i);
        const attendeeMatch = scenarioText.match(/(\d+)\s*attendee/i);
        setParams(p => ({
          ...p,
          event_name: contractResult.problem_summary.slice(0, 35) || 'Event Keynote',
          speaker_delay: delayMatch ? parseInt(delayMatch[1]) : 30,
          number_of_attendees: attendeeMatch ? parseInt(attendeeMatch[1]) : 300,
        }));
      }

      setPhase('contract');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Decision Contract generation failed. Ensure backend is running.');
      setPhase('input');
    }
  }

  // Deterministic simulation handler for supported event scenarios
  async function handleRunSimulation() {
    setError(null);
    setIsSimRunning(true);
    try {
      const result = await api.runSimulation(params);
      setSimResult(result);
      setRecalcResult(null);
      setInternetLost(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Event simulation failed.');
    } finally {
      setIsSimRunning(false);
    }
  }

  // Disruption toggle for event simulation
  async function handleDisruptionToggle() {
    if (!simResult) return;
    const next = !internetLost;
    setInternetLost(next);
    if (!next) {
      setRecalcResult(null);
      return;
    }
    setRecalcLoading(true);
    setError(null);
    try {
      const result = await api.recalculate(simResult.parameters, {
        disruption_type: 'internet_failure',
        description: 'Venue internet and Wi-Fi dropped completely',
        internet_available: false,
        activity_requires_internet: true,
        backup_requires_internet: false,
      });
      setRecalcResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Recalculation failed.');
      setInternetLost(false);
    } finally {
      setRecalcLoading(false);
    }
  }

  const activeOutcome = simResult?.outcomes[activeDecision];
  const activeUpdated = recalcResult?.updated_outcomes[activeDecision];
  const displayOutcome = recalcResult ? (activeUpdated ?? activeOutcome) : activeOutcome;

  return (
    <div className="min-h-screen bg-[#F4EFE7] pt-20">
      {/* Header bar */}
      <div className="border-b border-[#D8D0C5] bg-[#EAE3D8]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mono-val text-[10px] font-semibold text-[#F06445] tracking-[0.15em] uppercase mb-1">
              AI Decision Intelligence
            </div>
            <h1 className="text-[22px] sm:text-[26px] font-medium text-[#171615] tracking-[-0.02em]">
              Cross-Industry Decision & Adaptive Execution Workspace
            </h1>
          </div>
          {phase === 'contract' && (
            <button
              onClick={() => {
                setPhase('input');
                setContract(null);
                setSimResult(null);
                setRecalcResult(null);
                setScenarioText('');
                setError(null);
              }}
              className="mono-val text-[11px] uppercase tracking-widest text-[#756D65] hover:text-[#241F1B] transition-colors px-3 py-2 border border-[#D8D0C5] rounded-lg bg-white"
            >
              ← New Scenario
            </button>
          )}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-8">
        {/* ── Phase: Input ──────────────────────────────────────────────────── */}
        {(phase === 'input' || phase === 'analyzing') && (
          <div className="max-w-[760px] mx-auto">
            <div className="bg-white border border-[#D8D0C5] rounded-2xl p-6 sm:p-8 shadow-sm">
              <Label>Describe an operational challenge in any domain</Label>
              <textarea
                className="w-full mt-2 p-4 bg-[#F4EFE7] border border-[#D8D0C5] rounded-xl text-[14px] sm:text-[15px] text-[#241F1B] resize-none focus:outline-none focus:border-[#171615] leading-relaxed transition-colors min-h-[160px]"
                placeholder={`Describe a challenge in any domain.

Example:
Our production server is down,
customers cannot access our platform,
and we need to restore service quickly.`}
                value={scenarioText}
                onChange={e => setScenarioText(e.target.value)}
                disabled={phase === 'analyzing'}
              />

              {error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-[13px] text-red-700 break-words">
                  {error}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={handleAnalyze}
                  disabled={phase === 'analyzing' || !scenarioText.trim()}
                  className="flex items-center gap-2 px-6 py-3 bg-[#171615] text-[#F4EFE7] rounded-full text-[13px] font-semibold hover:bg-[#241F1B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {phase === 'analyzing' ? (
                    <>
                      <Spinner /> Generating Decision Contract with Gemma 4…
                    </>
                  ) : (
                    'Generate Decision Contract →'
                  )}
                </button>
                <span className="mono-val text-[11px] text-[#A39B93] uppercase tracking-widest">
                  Single Request · Gemma 4
                </span>
              </div>

              {/* Quick test scenario buttons */}
              <div className="mt-6 pt-6 border-t border-[#D8D0C5]">
                <Label>Cross-Industry Benchmark Scenarios</Label>
                <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      tag: 'Events',
                      text: 'Our keynote speaker is 30 minutes late and the event must end by 5 PM.',
                    },
                    {
                      tag: 'IT Ops',
                      text: 'Our production server crashed and customers cannot access the website.',
                    },
                    {
                      tag: 'Logistics',
                      text: 'Our delivery truck broke down with 500 packages awaiting delivery.',
                    },
                  ].map((sc, i) => (
                    <button
                      key={i}
                      onClick={() => setScenarioText(sc.text)}
                      className="p-3 border border-[#D8D0C5] rounded-xl text-left bg-[#F4EFE7] hover:border-[#171615] hover:bg-white transition-all text-[#241F1B]"
                    >
                      <div className="mono-val text-[10px] font-bold text-[#F06445] uppercase tracking-wider mb-1">
                        Test {i + 1} ({sc.tag})
                      </div>
                      <div className="text-[12px] text-[#756D65] line-clamp-2">
                        {sc.text}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Phase: Decision Contract & Execution Workspace ────────────────── */}
        {phase === 'contract' && contract && (
          <div className="space-y-8">
            {/* Top Domain & Problem Summary Bar */}
            <div className="bg-white border border-[#D8D0C5] rounded-2xl p-6 sm:p-7 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider mono-val bg-[#171615] text-[#F4EFE7]">
                    DETECTED DOMAIN: {contract.domain.toUpperCase()}
                  </span>
                  <span className="mono-val text-[11px] text-[#10b981] font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                    Gemma 4 Decision Contract Active
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                <div className="lg:col-span-1">
                  <Label>Operational Disruption</Label>
                  <p className="text-[15px] font-medium text-[#241F1B] leading-snug">
                    {contract.problem_summary}
                  </p>
                </div>

                <div>
                  <Label>Primary Objectives</Label>
                  <ul className="mt-1 space-y-1.5">
                    {contract.objectives.map((obj, i) => (
                      <li key={i} className="text-[12px] text-[#241F1B] flex items-start gap-2">
                        <span className="text-[#10b981] font-bold shrink-0">✓</span>
                        <span className="break-words">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <Label>Operational Constraints</Label>
                  <ul className="mt-1 space-y-1.5">
                    {contract.constraints.map((c, i) => (
                      <li key={i} className="text-[12px] text-[#756D65] flex items-start gap-2">
                        <span className="text-[#F06445] font-bold shrink-0">↳</span>
                        <span className="break-words">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Alternatives Grid (Options A, B, C) */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label>Evaluated Alternative Courses of Action</Label>
                  <h3 className="text-[18px] sm:text-[20px] font-semibold text-[#171615]">
                    Select Strategy Alternative to Deploy
                  </h3>
                </div>
                <span className="mono-val text-[11px] text-[#756D65]">
                  3 Alternatives Generated
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {contract.alternatives.map(alt => {
                  const isSelected = activeDecision === alt.id;
                  return (
                    <motion.div
                      key={alt.id}
                      onClick={() => setActiveDecision(alt.id)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#171615] text-[#F4EFE7] border-[#171615] shadow-md'
                          : 'bg-white text-[#241F1B] border-[#D8D0C5] hover:border-[#171615]'
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span
                          className={`mono-val text-[10px] font-bold px-2 py-0.5 rounded ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-[#EAE3D8] text-[#171615]'
                          }`}
                        >
                          OPTION {alt.id}
                        </span>
                        <span
                          className={`mono-val text-[10px] ${
                            isSelected ? 'text-[#D8D0C5]' : 'text-[#756D65]'
                          }`}
                        >
                          {alt.action_steps.length} Steps · {alt.dependencies.length} Deps
                        </span>
                      </div>

                      <h4 className="text-[15px] font-semibold leading-snug mb-2">
                        {alt.title}
                      </h4>
                      <p
                        className={`text-[12px] leading-relaxed mb-4 line-clamp-3 ${
                          isSelected ? 'text-[#D8D0C5]' : 'text-[#756D65]'
                        }`}
                      >
                        {alt.description}
                      </p>

                      <div
                        className={`p-2.5 rounded-xl border text-[11px] mb-4 ${
                          isSelected
                            ? 'border-white/10 bg-white/5 text-[#EAE3D8]'
                            : 'border-[#EAE3D8] bg-[#F4EFE7] text-[#756D65]'
                        }`}
                      >
                        <strong className="block text-[10px] mono-val uppercase mb-0.5">
                          Reasoning:
                        </strong>
                        <span className="line-clamp-2">{alt.reasoning}</span>
                      </div>

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setActiveDecision(alt.id);
                          setAutopilotPlanId(alt.id);
                          const el = document.getElementById('decision-autopilot-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`w-full py-2 px-3 rounded-lg text-[12px] font-semibold mono-val transition-colors ${
                          isSelected
                            ? 'bg-[#F06445] text-white hover:bg-[#D04525]'
                            : 'bg-[#171615] text-[#F4EFE7] hover:bg-[#241F1B]'
                        }`}
                      >
                        Deploy Option {alt.id} →
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* PART 3: Numerical Simulation Calibration & Domain Notice */}
            {isEventSimulationEnabled ? (
              <div className="bg-white border border-[#D8D0C5] rounded-2xl p-6 sm:p-7 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                      <Label>Deterministic Simulation Engine Available</Label>
                    </div>
                    <h3 className="text-[17px] font-semibold text-[#171615]">
                      Numerical Event Disruption Simulation
                    </h3>
                    <p className="text-[12px] text-[#756D65] mt-0.5">
                      Deterministic schedule constraint evaluation is currently available for supported Event disruption models.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowEventSimConfig(!showEventSimConfig)}
                      className="px-3 py-1.5 rounded-lg border border-[#D8D0C5] text-[12px] mono-val font-medium text-[#241F1B] hover:border-[#171615]"
                    >
                      {showEventSimConfig ? 'Hide Parameters' : 'Adjust Simulation Parameters'}
                    </button>
                    <button
                      onClick={handleRunSimulation}
                      disabled={isSimRunning}
                      className="px-4 py-1.5 rounded-lg bg-[#171615] text-[#F4EFE7] text-[12px] mono-val font-semibold hover:bg-[#241F1B] transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSimRunning ? <><Spinner /> Computing…</> : 'Run Simulation →'}
                    </button>
                  </div>
                </div>

                {/* Optional Parameter Editor */}
                {showEventSimConfig && (
                  <div className="p-4 bg-[#F4EFE7] border border-[#D8D0C5] rounded-xl mb-5">
                    <Label>Supported Simulation Parameters</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                      <ParamField label="Speaker Delay (min)" value={params.speaker_delay}
                        onChange={v => setParams(p => ({ ...p, speaker_delay: parseInt(v) || 0 }))} min={0} />
                      <ParamField label="Attendees" value={params.number_of_attendees}
                        onChange={v => setParams(p => ({ ...p, number_of_attendees: parseInt(v) || 1 }))} min={1} />
                      <ParamField label="Curfew (min)" value={params.event_end_time_constraint}
                        onChange={v => setParams(p => ({ ...p, event_end_time_constraint: parseInt(v) || 0 }))} min={1} />
                      <ParamField label="Backup Speakers" value={params.available_backup_speakers}
                        onChange={v => setParams(p => ({ ...p, available_backup_speakers: parseInt(v) || 0 }))} min={0} />
                    </div>
                  </div>
                )}

                {/* If Simulation Result is Available */}
                {simResult && (
                  <div className="pt-4 border-t border-[#D8D0C5] space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
                      <div className="bg-[#F4EFE7] border border-[#D8D0C5] rounded-xl p-4">
                        <Label>Counterfactual Decision Graph</Label>
                        <WorkspaceGraph
                          outcomes={recalcResult ? recalcResult.updated_outcomes : simResult.outcomes}
                          activeId={activeDecision}
                          onSelect={setActiveDecision}
                          disrupted={internetLost}
                        />
                      </div>

                      <div className="space-y-4">
                        <Label>Computed Path Metrics (Option {activeDecision})</Label>
                        {displayOutcome && (
                          <div className="p-4 bg-[#F4EFE7] border border-[#D8D0C5] rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[14px] font-semibold text-[#171615]">{displayOutcome.title}</span>
                              <span className={`mono-val text-[10px] font-bold px-2 py-0.5 rounded ${displayOutcome.feasible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {displayOutcome.feasibility_status}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#D8D0C5]">
                              <div>
                                <div className="mono-val text-[9px] text-[#A39B93]">DELAY</div>
                                <div className="text-[13px] font-semibold mono-val">{displayOutcome.schedule_delay}m</div>
                              </div>
                              <div>
                                <div className="mono-val text-[9px] text-[#A39B93]">WAIT</div>
                                <div className="text-[13px] font-semibold mono-val">{displayOutcome.attendee_waiting_time}m</div>
                              </div>
                              <div>
                                <div className="mono-val text-[9px] text-[#A39B93]">END</div>
                                <div className="text-[13px] font-semibold mono-val">{displayOutcome.event_completion_time}m</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Secondary disruption injection toggle */}
                        <div
                          className={`flex items-center justify-between p-3.5 border rounded-xl cursor-pointer transition-colors ${
                            internetLost ? 'border-[#F06445] bg-[#F06445]/5' : 'border-[#D8D0C5] bg-[#F4EFE7] hover:border-[#171615]'
                          }`}
                          onClick={handleDisruptionToggle}
                        >
                          <div>
                            <div className="text-[13px] font-medium text-[#241F1B]">Internet connection lost</div>
                            <div className="text-[11px] text-[#756D65]">Simulate venue Wi-Fi & hardline outage</div>
                          </div>
                          {recalcLoading ? (
                            <Spinner />
                          ) : (
                            <div className={`w-11 h-6 rounded-full relative transition-colors ${internetLost ? 'bg-[#F06445]' : 'bg-[#D8D0C5]'}`}>
                              <motion.div
                                className="w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm"
                                animate={{ left: internetLost ? '24px' : '4px' }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#EAE3D8] border border-[#D8D0C5] rounded-2xl p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="mono-val text-[14px]">ℹ️</span>
                  <div>
                    <h4 className="text-[13px] font-semibold text-[#171615]">
                      Domain Simulation Engine Status
                    </h4>
                    <p className="text-[12px] text-[#756D65] mt-1 leading-relaxed">
                      Deterministic numerical simulation is currently calibrated and available for supported Event disruption models.
                      For <strong className="text-[#171615]">{contract.domain}</strong>, FORESIGHTX provides Gemma 4 AI Decision Intelligence, structured alternative generation, critical dependency guardrails, and live Decision Autopilot below.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* FORESIGHTX LIVE — Decision Autopilot */}
            <div id="decision-autopilot-section" className="scroll-mt-24">
              <DecisionAutopilot
                activeDecision={activeDecision}
                contract={contract}
                outcomes={simResult?.outcomes}
                internetLost={internetLost}
                onSwitchDecision={id => setActiveDecision(id)}
                forcedPlanId={autopilotPlanId}
                onPlanActivated={id => setAutopilotPlanId(id)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
