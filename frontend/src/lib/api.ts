// FORESIGHTX API service layer
// All calls proxy through the FastAPI backend — no API keys in frontend code

const BASE_URL = 'http://localhost:8000';

// ─── Types mirroring backend schemas ─────────────────────────────────────────

export interface AlternativeDecision {
  decision: string;
  reasoning: string;
}

export interface ActionStep {
  id: string;
  title: string;
  suggested_role: string;
  status: string;
}

export interface FallbackStep {
  id: string;
  title: string;
  status: string;
}

export interface FallbackPlan {
  title: string;
  action_steps: FallbackStep[];
}

export interface Dependency {
  id: string;
  label: string;
  status: 'unknown' | 'available' | 'unavailable' | string;
  critical: boolean;
}

export interface Alternative {
  id: 'A' | 'B' | 'C';
  title: string;
  description: string;
  reasoning: string;
  action_steps: ActionStep[];
  dependencies: Dependency[];
  failure_triggers: string[];
  fallback_plan: FallbackPlan;
  assumptions: string[];
}

export interface DecisionContractResponse {
  domain: string;
  problem_summary: string;
  objectives: string[];
  constraints: string[];
  alternatives: Alternative[];
}

export interface ScenarioExtractionResponse {
  event_type: string;
  disruption: string;
  delay_duration: string;
  attendee_count: string;
  constraints: string[];
  objectives: string[];
  alternative_decisions: AlternativeDecision[];
  explicit_assumptions: string[];
}

export interface SimulationInput {
  event_name: string;
  event_duration: number;
  current_event_time: number;
  speaker_delay: number;
  number_of_attendees: number;
  available_backup_speakers: number;
  internet_available: boolean;
  available_alternative_activities: string[];
  event_end_time_constraint: number;
  equipment_functional: boolean;
  attendee_capacity: number | null;
  backup_requires_internet: boolean;
  activity_requires_internet: boolean;
}

export interface DecisionOutcome {
  decision_id: 'A' | 'B' | 'C';
  title: string;
  description: string;
  feasible: boolean;
  feasibility_status: string;
  feasibility_reasons: string[];
  schedule_delay: number;
  attendee_waiting_time: number;
  event_completion_time: number;
  resource_requirements: Record<string, unknown>;
  constraint_violations: string[];
  assumptions: string[];
}

export interface RechartsMetricPoint {
  decision_id: string;
  decision_name: string;
  schedule_delay: number;
  waiting_time: number;
  completion_time: number;
  feasible: boolean;
}

export interface SimulationResult {
  event_name: string;
  parameters: SimulationInput;
  outcomes: Record<string, DecisionOutcome>;
  simulation_assumptions: string[];
  recharts_data: RechartsMetricPoint[];
}

export interface InjectedDisruption {
  disruption_type: string;
  description: string;
  additional_speaker_delay?: number;
  internet_available?: boolean;
  equipment_functional?: boolean;
  available_backup_speakers?: number;
  additional_attendees?: number;
  activity_requires_internet?: boolean;
  backup_requires_internet?: boolean;
}

export interface RecalculationComparison {
  decision_id: string;
  decision_title: string;
  original_feasible: boolean;
  updated_feasible: boolean;
  status_change: string;
  delta_schedule_delay: number;
  delta_waiting_time: number;
  delta_completion_time: number;
  tradeoff_summary: string;
}

export interface RecalculationResult {
  injected_disruption: string;
  original_outcomes: Record<string, DecisionOutcome>;
  updated_outcomes: Record<string, DecisionOutcome>;
  changed_constraints: string[];
  newly_infeasible_decisions: string[];
  comparison_data: RecalculationComparison[];
  recharts_data: RechartsMetricPoint[];
}

// ─── API functions ────────────────────────────────────────────────────────────

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? 'Request failed');
  }
  return res.json();
}

export const api = {
  health: () => request<{ status: string }>('/api/health'),

  extractScenario: (text: string) =>
    request<ScenarioExtractionResponse>('/api/ai/extract-scenario', {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  decisionContract: (scenario: string) =>
    request<DecisionContractResponse>('/api/ai/decision-contract', {
      method: 'POST',
      body: JSON.stringify({ scenario }),
    }),

  runSimulation: (params: SimulationInput) =>
    request<SimulationResult>('/api/simulations/run', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  recalculate: (base_parameters: SimulationInput, injected_disruption: InjectedDisruption) =>
    request<RecalculationResult>('/api/simulations/recalculate', {
      method: 'POST',
      body: JSON.stringify({ base_parameters, injected_disruption }),
    }),

  exampleSimulation: () => request<{ example_input: SimulationInput; sample_computed_result: SimulationResult }>('/api/simulations/example'),
};
