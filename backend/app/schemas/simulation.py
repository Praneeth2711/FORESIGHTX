from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, model_validator


class DisruptionType(str, Enum):
    SPEAKER_DELAY = "speaker_delay"
    INTERNET_FAILURE = "internet_failure"
    EQUIPMENT_MALFUNCTION = "equipment_malfunction"
    SCHEDULE_CONFLICT = "schedule_conflict"
    ATTENDEE_SURGE = "attendee_surge"


class DecisionId(str, Enum):
    OPTION_A = "A"
    OPTION_B = "B"
    OPTION_C = "C"


class SimulationInput(BaseModel):
    event_name: str = Field(default="Annual Tech Keynote", description="Name of the event")
    event_duration: int = Field(..., gt=0, description="Total scheduled duration in minutes (e.g., 180)")
    current_event_time: int = Field(..., ge=0, description="Current elapsed minutes into the event (e.g., 30)")
    speaker_delay: int = Field(..., ge=0, description="Minutes the primary speaker is delayed (e.g., 30)")
    number_of_attendees: int = Field(..., ge=1, description="Current confirmed attendee count")
    available_backup_speakers: int = Field(..., ge=0, description="Number of qualified backup speakers ready")
    internet_available: bool = Field(True, description="Whether network connectivity is operational")
    available_alternative_activities: List[str] = Field(
        default_factory=list,
        description="List of ready-to-deploy alternative activities (e.g. ['Audience Q&A', 'Networking Session'])"
    )
    event_end_time_constraint: int = Field(
        ...,
        gt=0,
        description="Hard curfew / maximum allowable end time in minutes from event start (e.g., 180 or 210)"
    )
    # Additional scenario variables
    equipment_functional: bool = Field(True, description="Whether AV and presentation equipment is functional")
    attendee_capacity: Optional[int] = Field(default=None, description="Maximum venue capacity for attendees")
    backup_requires_internet: bool = Field(False, description="Whether backup speaker requires remote connectivity")
    activity_requires_internet: bool = Field(False, description="Whether alternative activities require internet")

    @model_validator(mode="after")
    def validate_curfew_vs_elapsed(self):
        if self.current_event_time > self.event_end_time_constraint:
            raise ValueError(
                f"current_event_time ({self.current_event_time}m) cannot exceed event_end_time_constraint ({self.event_end_time_constraint}m)"
            )
        return self


class DecisionOutcome(BaseModel):
    decision_id: DecisionId
    title: str
    description: str
    feasible: bool
    feasibility_status: str = Field(description="'FEASIBLE' or 'INFEASIBLE'")
    feasibility_reasons: List[str]
    schedule_delay: int = Field(description="Net delay added to overall event in minutes")
    attendee_waiting_time: int = Field(description="Minutes attendees spend idle with no activity")
    event_completion_time: int = Field(description="Calculated total minutes from start to finish")
    resource_requirements: Dict[str, Any]
    constraint_violations: List[str]
    assumptions: List[str]


class ReactFlowNode(BaseModel):
    id: str
    type: str = "default"
    data: Dict[str, Any]
    position: Dict[str, float]
    style: Optional[Dict[str, Any]] = None


class ReactFlowEdge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None
    animated: bool = False
    style: Optional[Dict[str, Any]] = None


class ReactFlowGraph(BaseModel):
    nodes: List[ReactFlowNode]
    edges: List[ReactFlowEdge]


class RechartsMetricPoint(BaseModel):
    decision_id: str
    decision_name: str
    schedule_delay: int
    waiting_time: int
    completion_time: int
    feasible: bool


class SimulationResult(BaseModel):
    event_name: str
    parameters: SimulationInput
    outcomes: Dict[str, DecisionOutcome]
    simulation_assumptions: List[str]
    react_flow_graph: ReactFlowGraph
    recharts_data: List[RechartsMetricPoint]


class InjectedDisruption(BaseModel):
    disruption_type: DisruptionType
    description: str
    additional_speaker_delay: int = Field(0, ge=0)
    internet_available: Optional[bool] = None
    equipment_functional: Optional[bool] = None
    available_backup_speakers: Optional[int] = Field(None, ge=0)
    additional_attendees: int = Field(0, ge=0)
    activity_requires_internet: Optional[bool] = None
    backup_requires_internet: Optional[bool] = None


class DisruptionInjectionRequest(BaseModel):
    base_parameters: SimulationInput
    injected_disruption: InjectedDisruption


class RecalculationComparison(BaseModel):
    decision_id: str
    decision_title: str
    original_feasible: bool
    updated_feasible: bool
    status_change: str = Field(description="MAINTAINED_FEASIBLE, NEWLY_INFEASIBLE, MAINTAINED_INFEASIBLE, NEWLY_FEASIBLE")
    delta_schedule_delay: int
    delta_waiting_time: int
    delta_completion_time: int
    tradeoff_summary: str


class RecalculationResult(BaseModel):
    injected_disruption: str
    original_outcomes: Dict[str, DecisionOutcome]
    updated_outcomes: Dict[str, DecisionOutcome]
    changed_constraints: List[str]
    newly_infeasible_decisions: List[str]
    comparison_data: List[RecalculationComparison]
    react_flow_graph: ReactFlowGraph
    recharts_data: List[RechartsMetricPoint]
