import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.schemas.simulation import (
    SimulationInput,
    InjectedDisruption,
    DisruptionType,
    DisruptionInjectionRequest,
)
from app.simulation.engine import run_simulation, recalculate_simulation

client = TestClient(app)


def get_base_params(speaker_delay: int = 30) -> SimulationInput:
    return SimulationInput(
        event_name="Product Launch Keynote",
        event_duration=180,
        current_event_time=30,
        speaker_delay=speaker_delay,
        number_of_attendees=250,
        available_backup_speakers=1,
        internet_available=True,
        available_alternative_activities=["Interactive Q&A Session", "Roundtable Discussion"],
        event_end_time_constraint=210,
        equipment_functional=True,
        attendee_capacity=300,
        backup_requires_internet=False,
        activity_requires_internet=False,
    )


# 1. Test: Speaker delayed 30 minutes
def test_speaker_delayed_30_minutes():
    params = get_base_params(speaker_delay=30)
    result = run_simulation(params)

    # Option A: Delay event
    # delay = 30m, waiting = 30m, completion = 180 + 30 = 210m (curfew is 210m, so <= 210 -> feasible)
    assert result.outcomes["A"].feasible is True
    assert result.outcomes["A"].schedule_delay == 30
    assert result.outcomes["A"].attendee_waiting_time == 30
    assert result.outcomes["A"].event_completion_time == 210

    # Option B: Alternative activity
    # waiting time = 5m (transition), schedule delay = min(15, 30) = 15m, completion = 195m <= 210m
    assert result.outcomes["B"].feasible is True
    assert result.outcomes["B"].schedule_delay == 15
    assert result.outcomes["B"].attendee_waiting_time == 5
    assert result.outcomes["B"].event_completion_time == 195

    # Option C: Backup speaker
    # delay = 10m, waiting = 10m, completion = 190m <= 210m
    assert result.outcomes["C"].feasible is True
    assert result.outcomes["C"].schedule_delay == 10
    assert result.outcomes["C"].attendee_waiting_time == 10
    assert result.outcomes["C"].event_completion_time == 190


# 2. Test: Speaker delayed 60 minutes
def test_speaker_delayed_60_minutes():
    # If delay is 60m and curfew is 210m:
    # Option A: 180 + 60 = 240m > 210m -> INFEASIBLE (exceeds curfew)
    params = get_base_params(speaker_delay=60)
    result = run_simulation(params)

    assert result.outcomes["A"].feasible is False
    assert any("exceeds hard curfew" in v for v in result.outcomes["A"].constraint_violations)
    assert result.outcomes["A"].event_completion_time == 240

    # Option B: schedule delay = 15m, completion = 195m <= 210m -> FEASIBLE
    assert result.outcomes["B"].feasible is True
    assert result.outcomes["B"].schedule_delay == 15
    assert result.outcomes["B"].event_completion_time == 195

    # Option C: schedule delay = 10m, completion = 190m <= 210m -> FEASIBLE
    assert result.outcomes["C"].feasible is True
    assert result.outcomes["C"].schedule_delay == 10
    assert result.outcomes["C"].event_completion_time == 190


# 3. Test: Internet unavailable
def test_internet_unavailable():
    # Scenario: Activity and Backup require internet, but internet is false
    params = get_base_params(speaker_delay=20)
    params.internet_available = False
    params.activity_requires_internet = True
    params.backup_requires_internet = True

    result = run_simulation(params)

    # Option A does not require internet
    assert result.outcomes["A"].feasible is True

    # Option B requires internet -> Infeasible
    assert result.outcomes["B"].feasible is False
    assert any("requires internet" in v for v in result.outcomes["B"].constraint_violations)

    # Option C requires internet -> Infeasible
    assert result.outcomes["C"].feasible is False
    assert any("internet" in v.lower() for v in result.outcomes["C"].constraint_violations)


# 4. Test: Backup speaker unavailable
def test_backup_speaker_unavailable():
    params = get_base_params(speaker_delay=20)
    params.available_backup_speakers = 0

    result = run_simulation(params)

    assert result.outcomes["C"].feasible is False
    assert any("Zero qualified backup speakers" in v for v in result.outcomes["C"].constraint_violations)


# 5. Test: Multiple simultaneous disruptions
def test_multiple_simultaneous_disruptions():
    # Disruption: Speaker delay 70m (> 60m threshold & breaches curfew),
    # internet down with internet-dependent activity, equipment malfunction
    params = get_base_params(speaker_delay=70)
    params.internet_available = False
    params.activity_requires_internet = True
    params.equipment_functional = False
    params.available_backup_speakers = 0

    result = run_simulation(params)

    # All options must be infeasible under catastrophic simultaneous disruptions
    assert result.outcomes["A"].feasible is False
    assert result.outcomes["B"].feasible is False
    assert result.outcomes["C"].feasible is False

    # Check that multiple violations are collected
    assert len(result.outcomes["A"].constraint_violations) >= 2
    assert any("equipment malfunction" in v for v in result.outcomes["A"].constraint_violations)
    assert any("exceeds hard curfew" in v for v in result.outcomes["A"].constraint_violations)


# 6. Test: Invalid parameters
def test_invalid_parameters():
    # Event duration <= 0
    with pytest.raises(ValueError):
        SimulationInput(
            event_name="Invalid",
            event_duration=0,
            current_event_time=0,
            speaker_delay=10,
            number_of_attendees=100,
            available_backup_speakers=1,
            available_alternative_activities=["Q&A"],
            event_end_time_constraint=100,
        )

    # Attendees < 1
    with pytest.raises(ValueError):
        SimulationInput(
            event_name="Invalid",
            event_duration=120,
            current_event_time=10,
            speaker_delay=10,
            number_of_attendees=0,
            available_backup_speakers=1,
            available_alternative_activities=["Q&A"],
            event_end_time_constraint=150,
        )

    # current_event_time > event_end_time_constraint
    with pytest.raises(ValueError):
        SimulationInput(
            event_name="Invalid",
            event_duration=120,
            current_event_time=200,
            speaker_delay=10,
            number_of_attendees=50,
            available_backup_speakers=1,
            available_alternative_activities=["Q&A"],
            event_end_time_constraint=150,
        )


# 7. Test: Identical inputs producing identical outputs (Strict Determinism)
def test_strict_determinism():
    params = get_base_params(speaker_delay=45)
    
    run_1 = run_simulation(params).model_dump()
    run_2 = run_simulation(params).model_dump()
    run_3 = run_simulation(params).model_dump()

    assert run_1 == run_2
    assert run_2 == run_3


# 8. Test: Disruption Injection & Recalculation
def test_recalculate_disruption_injection():
    base_params = get_base_params(speaker_delay=20)
    # Base: all 3 feasible
    base_result = run_simulation(base_params)
    assert base_result.outcomes["A"].feasible is True
    assert base_result.outcomes["B"].feasible is True
    assert base_result.outcomes["C"].feasible is True

    # Inject disruption: speaker delay increases by +45m (total 65m, breaches curfew of 210m)
    # and backup requires internet which drops
    disruption = InjectedDisruption(
        disruption_type=DisruptionType.SPEAKER_DELAY,
        description="Severe transit stoppage: speaker delayed additional 45 minutes",
        additional_speaker_delay=45,
    )

    recalc = recalculate_simulation(base_params, disruption)

    # Option A was feasible, now breaches curfew -> newly infeasible
    assert "Option A (Delay the Event)" in recalc.newly_infeasible_decisions
    assert recalc.updated_outcomes["A"].feasible is False
    assert any("Speaker delay increased" in c for c in recalc.changed_constraints)


# 9. Test: API Endpoints Integration
def test_api_run_simulation():
    payload = get_base_params(speaker_delay=25).model_dump()
    res = client.post("/api/simulations/run", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "outcomes" in data
    assert "A" in data["outcomes"]
    assert "B" in data["outcomes"]
    assert "C" in data["outcomes"]
    assert "react_flow_graph" in data
    assert "recharts_data" in data


def test_api_recalculate_simulation():
    base = get_base_params(speaker_delay=20).model_dump()
    req = {
        "base_parameters": base,
        "injected_disruption": {
            "disruption_type": "speaker_delay",
            "description": "Additional delay +50m",
            "additional_speaker_delay": 50
        }
    }
    res = client.post("/api/simulations/recalculate", json=req)
    assert res.status_code == 200
    data = res.json()
    assert "original_outcomes" in data
    assert "updated_outcomes" in data
    assert "newly_infeasible_decisions" in data
    assert "comparison_data" in data


def test_api_example_simulation():
    res = client.get("/api/simulations/example")
    assert res.status_code == 200
    data = res.json()
    assert "example_input" in data
    assert "sample_computed_result" in data
    assert data["example_input"]["event_name"] == "Global Tech Keynote 2026"
