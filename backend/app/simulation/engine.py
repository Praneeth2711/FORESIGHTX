from typing import Dict, List, Any
from app.schemas.simulation import (
    SimulationInput,
    DecisionOutcome,
    DecisionId,
    SimulationResult,
    ReactFlowGraph,
    ReactFlowNode,
    ReactFlowEdge,
    RechartsMetricPoint,
    InjectedDisruption,
    RecalculationComparison,
    RecalculationResult,
)


GLOBAL_ASSUMPTIONS: List[str] = [
    "Assumption 1: Venue curfew (event_end_time_constraint) is strictly non-negotiable.",
    "Assumption 2: Waiting with no active programming generates 1:1 idle attendee wait time.",
    "Assumption 3: Deploying an alternative activity absorbs idle time after a 5-minute transition overhead.",
    "Assumption 4: Activating a backup speaker requires a standard 10-minute technical handoff and AV check.",
    "Assumption 5: Calculations are 100% deterministic with zero randomized heuristics.",
]


def evaluate_decision_a(params: SimulationInput) -> DecisionOutcome:
    """Decision A: Delay the event.
    Wait idle for the primary speaker to arrive, holding the main stage agenda.
    """
    violations: List[str] = []
    reasons: List[str] = []
    assumptions: List[str] = [
        "Plenary hall remains in passive waiting state until speaker arrives.",
        "Audio-visual technicians maintain standby stage state.",
    ]

    schedule_delay = params.speaker_delay
    attendee_waiting_time = params.speaker_delay
    completion_time = params.event_duration + schedule_delay

    # Check curfew constraint
    if completion_time > params.event_end_time_constraint:
        overrun = completion_time - params.event_end_time_constraint
        violations.append(
            f"Event completion ({completion_time}m) exceeds hard curfew ({params.event_end_time_constraint}m) by {overrun}m."
        )

    # Check equipment malfunction
    if not params.equipment_functional:
        violations.append(
            "Stage AV equipment malfunction prevents holding the session without technical repair."
        )

    # Check passive tolerance threshold
    if params.speaker_delay > 60:
        violations.append(
            f"Speaker delay of {params.speaker_delay}m exceeds maximum recommended passive wait tolerance (60m)."
        )

    feasible = len(violations) == 0

    if feasible:
        reasons.append(
            f"Feasible: Speaker delay ({params.speaker_delay}m) fits within venue curfew ({params.event_end_time_constraint}m)."
        )
    else:
        reasons.extend(violations)

    overtime = max(0, completion_time - params.event_duration)
    resources = {
        "staff_overtime_minutes": overtime,
        "room_extension_required": overtime > 0,
        "additional_speaker_cost": 0,
        "av_technicians_active": 1 if params.equipment_functional else 0,
    }

    return DecisionOutcome(
        decision_id=DecisionId.OPTION_A,
        title="Delay the Event",
        description="Hold the schedule and wait for the delayed primary speaker to arrive.",
        feasible=feasible,
        feasibility_status="FEASIBLE" if feasible else "INFEASIBLE",
        feasibility_reasons=reasons,
        schedule_delay=schedule_delay,
        attendee_waiting_time=attendee_waiting_time,
        event_completion_time=completion_time,
        resource_requirements=resources,
        constraint_violations=violations,
        assumptions=assumptions,
    )


def evaluate_decision_b(params: SimulationInput) -> DecisionOutcome:
    """Decision B: Start an alternative activity.
    Engage attendees immediately with a backup workshop, interactive Q&A, or structured networking.
    """
    violations: List[str] = []
    reasons: List[str] = []
    assumptions: List[str] = [
        "Alternative session absorbs idle speaker delay after a 5-minute transition.",
        "Active participant engagement replaces idle waiting time.",
    ]

    # Transition buffer is at most 5 minutes
    transition_overhead = min(5, params.speaker_delay)
    attendee_waiting_time = transition_overhead

    # The activity absorbs the delay; net schedule delay is capped at 15 minutes or actual delay
    schedule_delay = min(15, params.speaker_delay)
    completion_time = params.event_duration + schedule_delay

    # Check available alternative activities
    if not params.available_alternative_activities:
        violations.append(
            "Zero pre-planned alternative activities are configured or available in the inventory."
        )

    # Check internet requirement
    if params.activity_requires_internet and not params.internet_available:
        violations.append(
            "Selected alternative activity requires internet connectivity, which is currently offline."
        )

    # Check venue capacity constraint against attendees
    if params.attendee_capacity is not None and params.number_of_attendees > params.attendee_capacity:
        excess = params.number_of_attendees - params.attendee_capacity
        violations.append(
            f"Attendee count ({params.number_of_attendees}) exceeds workshop breakout capacity ({params.attendee_capacity}) by {excess} participants."
        )

    # Check curfew constraint
    if completion_time > params.event_end_time_constraint:
        overrun = completion_time - params.event_end_time_constraint
        violations.append(
            f"Event completion ({completion_time}m) exceeds hard curfew ({params.event_end_time_constraint}m) by {overrun}m."
        )

    feasible = len(violations) == 0

    if feasible:
        activity_name = params.available_alternative_activities[0] if params.available_alternative_activities else "Interactive Session"
        reasons.append(
            f"Feasible: '{activity_name}' absorbs delay, limiting passive wait to {transition_overhead}m."
        )
    else:
        reasons.extend(violations)

    overtime = max(0, completion_time - params.event_duration)
    resources = {
        "facilitators_allocated": min(len(params.available_alternative_activities), 2),
        "primary_activity": params.available_alternative_activities[0] if params.available_alternative_activities else "None",
        "staff_overtime_minutes": overtime,
        "material_kits_needed": params.number_of_attendees,
    }

    return DecisionOutcome(
        decision_id=DecisionId.OPTION_B,
        title="Start Alternative Activity",
        description="Immediately deploy a secondary interactive session, workshop, or structured networking.",
        feasible=feasible,
        feasibility_status="FEASIBLE" if feasible else "INFEASIBLE",
        feasibility_reasons=reasons,
        schedule_delay=schedule_delay,
        attendee_waiting_time=attendee_waiting_time,
        event_completion_time=completion_time,
        resource_requirements=resources,
        constraint_violations=violations,
        assumptions=assumptions,
    )


def evaluate_decision_c(params: SimulationInput) -> DecisionOutcome:
    """Decision C: Activate a backup speaker.
    Call upon a prepared standby speaker to take the stage with a 10-minute setup buffer.
    """
    violations: List[str] = []
    reasons: List[str] = []
    assumptions: List[str] = [
        "Backup speaker requires a 10-minute technical handoff and AV briefing buffer.",
        "Primary delayed speaker's slot is either canceled or shifted asynchronously.",
    ]

    setup_buffer = min(10, params.speaker_delay) if params.speaker_delay > 0 else 0
    schedule_delay = setup_buffer
    attendee_waiting_time = setup_buffer
    completion_time = params.event_duration + schedule_delay

    # Check backup speaker availability
    if params.available_backup_speakers < 1:
        violations.append(
            "Zero qualified backup speakers are available on standby."
        )

    # Check internet dependency if backup speaker is remote
    if params.backup_requires_internet and not params.internet_available:
        violations.append(
            "Standby backup speaker requires remote video uplink, but internet connectivity is down."
        )

    # Check equipment status
    if not params.equipment_functional:
        violations.append(
            "Stage AV equipment malfunction prevents backup speaker from presenting."
        )

    # Check curfew constraint
    if completion_time > params.event_end_time_constraint:
        overrun = completion_time - params.event_end_time_constraint
        violations.append(
            f"Event completion ({completion_time}m) exceeds hard curfew ({params.event_end_time_constraint}m) by {overrun}m."
        )

    feasible = len(violations) == 0

    if feasible:
        reasons.append(
            f"Feasible: Standby speaker ready; transition completes in {setup_buffer}m with minimal schedule drift."
        )
    else:
        reasons.extend(violations)

    overtime = max(0, completion_time - params.event_duration)
    resources = {
        "backup_speakers_deployed": 1 if feasible else 0,
        "backup_speakers_remaining": max(0, params.available_backup_speakers - 1),
        "av_reconfiguration_required": True,
        "staff_overtime_minutes": overtime,
    }

    return DecisionOutcome(
        decision_id=DecisionId.OPTION_C,
        title="Activate Backup Speaker",
        description="Deploy a vetted standby speaker to deliver an alternative keynote with minimal transition delay.",
        feasible=feasible,
        feasibility_status="FEASIBLE" if feasible else "INFEASIBLE",
        feasibility_reasons=reasons,
        schedule_delay=schedule_delay,
        attendee_waiting_time=attendee_waiting_time,
        event_completion_time=completion_time,
        resource_requirements=resources,
        constraint_violations=violations,
        assumptions=assumptions,
    )


def generate_react_flow_graph(
    params: SimulationInput, outcomes: Dict[str, DecisionOutcome]
) -> ReactFlowGraph:
    """Builds a deterministic React Flow node and edge tree for UI visualization."""
    net_status = "Online" if params.internet_available else "Offline"
    root_label = f"Disruption Event: Speaker Delay {params.speaker_delay}m | Net: {net_status}"

    nodes: List[ReactFlowNode] = [
        ReactFlowNode(
            id="node-origin",
            type="input",
            data={
                "label": root_label,
                "speaker_delay": params.speaker_delay,
                "internet_available": params.internet_available,
                "attendees": params.number_of_attendees,
            },
            position={"x": 300.0, "y": 20.0},
            style={"background": "#1e293b", "color": "#f8fafc", "border": "1px solid #475569", "borderRadius": "8px", "padding": "10px"},
        )
    ]

    edges: List[ReactFlowEdge] = []

    branch_x_coords = {"A": 50.0, "B": 300.0, "C": 550.0}

    for key in ["A", "B", "C"]:
        outcome = outcomes[key]
        x_pos = branch_x_coords[key]
        is_feas = outcome.feasible

        branch_color = "#10b981" if is_feas else "#ef4444"
        branch_bg = "#064e3b" if is_feas else "#450a0a"

        decision_node_id = f"node-decision-{key}"
        nodes.append(
            ReactFlowNode(
                id=decision_node_id,
                type="default",
                data={
                    "label": f"Option {key}: {outcome.title}",
                    "feasible": outcome.feasible,
                    "delay": outcome.schedule_delay,
                    "waiting_time": outcome.attendee_waiting_time,
                },
                position={"x": x_pos, "y": 160.0},
                style={
                    "background": branch_bg,
                    "color": "#f8fafc",
                    "border": f"2px solid {branch_color}",
                    "borderRadius": "8px",
                    "padding": "8px",
                },
            )
        )

        edges.append(
            ReactFlowEdge(
                id=f"edge-origin-to-{key}",
                source="node-origin",
                target=decision_node_id,
                label=f"Evaluate {key}",
                animated=is_feas,
                style={"stroke": branch_color, "strokeWidth": 2},
            )
        )

        outcome_node_id = f"node-outcome-{key}"
        nodes.append(
            ReactFlowNode(
                id=outcome_node_id,
                type="output",
                data={
                    "label": f"End: {outcome.event_completion_time}m | Wait: {outcome.attendee_waiting_time}m",
                    "status": outcome.feasibility_status,
                    "violations": outcome.constraint_violations,
                },
                position={"x": x_pos, "y": 300.0},
                style={
                    "background": "#0f172a",
                    "color": "#e2e8f0",
                    "border": f"1px dashed {branch_color}",
                    "borderRadius": "6px",
                    "padding": "6px",
                },
            )
        )

        edges.append(
            ReactFlowEdge(
                id=f"edge-{key}-to-outcome",
                source=decision_node_id,
                target=outcome_node_id,
                label=outcome.feasibility_status,
                style={"stroke": branch_color, "strokeDasharray": "4 2" if not is_feas else None},
            )
        )

    return ReactFlowGraph(nodes=nodes, edges=edges)


def generate_recharts_data(outcomes: Dict[str, DecisionOutcome]) -> List[RechartsMetricPoint]:
    """Generates structured chart points for Recharts bar/line components."""
    data: List[RechartsMetricPoint] = []
    for key in ["A", "B", "C"]:
        outcome = outcomes[key]
        data.append(
            RechartsMetricPoint(
                decision_id=key,
                decision_name=outcome.title,
                schedule_delay=outcome.schedule_delay,
                waiting_time=outcome.attendee_waiting_time,
                completion_time=outcome.event_completion_time,
                feasible=outcome.feasible,
            )
        )
    return data


def run_simulation(params: SimulationInput) -> SimulationResult:
    """Runs deterministic calculations across all three decision paths."""
    outcome_a = evaluate_decision_a(params)
    outcome_b = evaluate_decision_b(params)
    outcome_c = evaluate_decision_c(params)

    outcomes = {
        "A": outcome_a,
        "B": outcome_b,
        "C": outcome_c,
    }

    react_flow_graph = generate_react_flow_graph(params, outcomes)
    recharts_data = generate_recharts_data(outcomes)

    return SimulationResult(
        event_name=params.event_name,
        parameters=params,
        outcomes=outcomes,
        simulation_assumptions=GLOBAL_ASSUMPTIONS,
        react_flow_graph=react_flow_graph,
        recharts_data=recharts_data,
    )


def apply_disruption(base: SimulationInput, disruption: InjectedDisruption) -> SimulationInput:
    """Creates a modified SimulationInput by applying injected disruption parameters."""
    data = base.model_dump()

    # Apply parameter shifts
    if disruption.additional_speaker_delay > 0:
        data["speaker_delay"] += disruption.additional_speaker_delay

    if disruption.internet_available is not None:
        data["internet_available"] = disruption.internet_available

    if disruption.equipment_functional is not None:
        data["equipment_functional"] = disruption.equipment_functional

    if disruption.available_backup_speakers is not None:
        data["available_backup_speakers"] = disruption.available_backup_speakers

    if disruption.additional_attendees > 0:
        data["number_of_attendees"] += disruption.additional_attendees

    if disruption.activity_requires_internet is not None:
        data["activity_requires_internet"] = disruption.activity_requires_internet

    if disruption.backup_requires_internet is not None:
        data["backup_requires_internet"] = disruption.backup_requires_internet

    return SimulationInput(**data)


def recalculate_simulation(
    base_params: SimulationInput, disruption: InjectedDisruption
) -> RecalculationResult:
    """Recalculates all three decision paths after injecting a secondary disruption."""
    original_result = run_simulation(base_params)
    updated_params = apply_disruption(base_params, disruption)
    updated_result = run_simulation(updated_params)

    # Track changed constraints
    changed_constraints: List[str] = []
    if base_params.internet_available != updated_params.internet_available:
        changed_constraints.append(
            f"Internet connectivity changed from {base_params.internet_available} to {updated_params.internet_available}."
        )
    if base_params.speaker_delay != updated_params.speaker_delay:
        changed_constraints.append(
            f"Speaker delay increased from {base_params.speaker_delay}m to {updated_params.speaker_delay}m (+{updated_params.speaker_delay - base_params.speaker_delay}m)."
        )
    if base_params.equipment_functional != updated_params.equipment_functional:
        changed_constraints.append(
            f"Equipment status changed from {base_params.equipment_functional} to {updated_params.equipment_functional}."
        )
    if base_params.available_backup_speakers != updated_params.available_backup_speakers:
        changed_constraints.append(
            f"Available backup speakers changed from {base_params.available_backup_speakers} to {updated_params.available_backup_speakers}."
        )
    if base_params.number_of_attendees != updated_params.number_of_attendees:
        changed_constraints.append(
            f"Attendee count changed from {base_params.number_of_attendees} to {updated_params.number_of_attendees} (+{updated_params.number_of_attendees - base_params.number_of_attendees})."
        )
    if base_params.activity_requires_internet != updated_params.activity_requires_internet:
        changed_constraints.append(
            f"Alternative activity internet dependency set to {updated_params.activity_requires_internet}."
        )
    if base_params.backup_requires_internet != updated_params.backup_requires_internet:
        changed_constraints.append(
            f"Backup speaker internet dependency set to {updated_params.backup_requires_internet}."
        )

    # Identify newly infeasible decisions and side-by-side comparisons
    newly_infeasible: List[str] = []
    comparisons: List[RecalculationComparison] = []

    for key in ["A", "B", "C"]:
        orig_out = original_result.outcomes[key]
        upd_out = updated_result.outcomes[key]

        if orig_out.feasible and not upd_out.feasible:
            newly_infeasible.append(f"Option {key} ({upd_out.title})")
            status_change = "NEWLY_INFEASIBLE"
        elif not orig_out.feasible and upd_out.feasible:
            status_change = "NEWLY_FEASIBLE"
        elif orig_out.feasible and upd_out.feasible:
            status_change = "MAINTAINED_FEASIBLE"
        else:
            status_change = "MAINTAINED_INFEASIBLE"

        d_delay = upd_out.schedule_delay - orig_out.schedule_delay
        d_wait = upd_out.attendee_waiting_time - orig_out.attendee_waiting_time
        d_comp = upd_out.event_completion_time - orig_out.event_completion_time

        summary_parts = []
        if d_delay != 0:
            summary_parts.append(f"Delay delta: {'+' if d_delay > 0 else ''}{d_delay}m")
        if d_wait != 0:
            summary_parts.append(f"Wait time delta: {'+' if d_wait > 0 else ''}{d_wait}m")
        if status_change == "NEWLY_INFEASIBLE":
            summary_parts.append(f"Violations: {'; '.join(upd_out.constraint_violations)}")
        elif status_change == "MAINTAINED_FEASIBLE":
            summary_parts.append("Remains fully viable within scenario bounds.")
        elif status_change == "MAINTAINED_INFEASIBLE":
            summary_parts.append("Remains non-viable.")

        tradeoff = " | ".join(summary_parts) if summary_parts else "No metric deviation."

        comparisons.append(
            RecalculationComparison(
                decision_id=key,
                decision_title=upd_out.title,
                original_feasible=orig_out.feasible,
                updated_feasible=upd_out.feasible,
                status_change=status_change,
                delta_schedule_delay=d_delay,
                delta_waiting_time=d_wait,
                delta_completion_time=d_comp,
                tradeoff_summary=tradeoff,
            )
        )

    return RecalculationResult(
        injected_disruption=f"{disruption.disruption_type.value}: {disruption.description}",
        original_outcomes=original_result.outcomes,
        updated_outcomes=updated_result.outcomes,
        changed_constraints=changed_constraints,
        newly_infeasible_decisions=newly_infeasible,
        comparison_data=comparisons,
        react_flow_graph=updated_result.react_flow_graph,
        recharts_data=updated_result.recharts_data,
    )
