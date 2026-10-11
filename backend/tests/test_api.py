import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_ai_health_missing_key(monkeypatch):
    monkeypatch.setattr(settings, "GEMMA_API_KEY", "")
    response = client.get("/api/ai/health")
    assert response.status_code == 500
    assert "GEMMA_API_KEY is not configured" in response.json()["detail"]

def test_extract_scenario_invalid_input():
    # Missing 'text' field
    response = client.post("/api/ai/extract-scenario", json={"wrong_field": "data"})
    assert response.status_code == 422

def test_decision_contract_invalid_input():
    # Missing 'scenario' field
    response = client.post("/api/ai/decision-contract", json={"wrong_field": "data"})
    assert response.status_code == 422

def test_decision_contract_mocked(monkeypatch):
    from app.schemas.contract import DecisionContractResponse, Alternative, ActionStep, Dependency, FallbackPlan, FallbackStep

    dummy_response = DecisionContractResponse(
        domain="IT Operations",
        problem_summary="Production server crash causing website downtime.",
        objectives=["Restore website availability", "Prevent data loss"],
        constraints=["SLA requirements", "Limited staff"],
        alternatives=[
            Alternative(
                id="A",
                title="Rapid Reboot",
                description="Hard reboot instance.",
                reasoning="Fastest recovery path.",
                action_steps=[
                    ActionStep(id="step-1", title="Reboot server", suggested_role="SRE Engineer", status="pending")
                ],
                dependencies=[
                    Dependency(id="dep-1", label="Server console access", status="unknown", critical=True)
                ],
                failure_triggers=["Hardware failure"],
                fallback_plan=FallbackPlan(
                    title="DR Failover",
                    action_steps=[FallbackStep(id="fallback-1", title="Switch DNS", status="pending")]
                ),
                assumptions=["Hardware intact"]
            ),
            Alternative(
                id="B",
                title="Disaster Recovery Failover",
                description="Reroute traffic to DR region.",
                reasoning="Bypasses primary hardware issue.",
                action_steps=[
                    ActionStep(id="step-2", title="Promote DR replica", suggested_role="DBA", status="pending")
                ],
                dependencies=[
                    Dependency(id="dep-2", label="DR sync health", status="unknown", critical=True)
                ],
                failure_triggers=["Replication lag"],
                fallback_plan=FallbackPlan(
                    title="Cold Backup Restore",
                    action_steps=[FallbackStep(id="fallback-2", title="Spin up new instance", status="pending")]
                ),
                assumptions=["DR site configured"]
            ),
            Alternative(
                id="C",
                title="IaC Provisioning",
                description="Rebuild instance via Terraform.",
                reasoning="Guarantees clean state.",
                action_steps=[
                    ActionStep(id="step-3", title="Run terraform apply", suggested_role="DevOps", status="pending")
                ],
                dependencies=[
                    Dependency(id="dep-3", label="Cloud quota", status="unknown", critical=True)
                ],
                failure_triggers=["API quota reached"],
                fallback_plan=FallbackPlan(
                    title="Manual Config",
                    action_steps=[FallbackStep(id="fallback-3", title="Configure minimal proxy", status="pending")]
                ),
                assumptions=["Terraform state locked"]
            ),
        ]
    )

    async def mock_generate(scenario: str):
        return dummy_response

    from app.ai import gemma_client
    monkeypatch.setattr(gemma_client, "generate_decision_contract", mock_generate)

    response = client.post("/api/ai/decision-contract", json={"scenario": "Our production server crashed"})
    assert response.status_code == 200
    data = response.json()
    assert data["domain"] == "IT Operations"
    assert len(data["alternatives"]) == 3
    assert data["alternatives"][0]["id"] == "A"
    assert data["alternatives"][0]["dependencies"][0]["status"] == "unknown"
    assert data["alternatives"][0]["dependencies"][0]["critical"] is True

