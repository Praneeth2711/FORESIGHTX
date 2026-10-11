from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.schemas.scenario import ScenarioExtractionRequest, ScenarioExtractionResponse
from app.schemas.contract import DecisionContractRequest, DecisionContractResponse
from app.schemas.simulation import (
    SimulationInput,
    SimulationResult,
    DisruptionInjectionRequest,
    RecalculationResult,
)
from app.simulation.engine import run_simulation, recalculate_simulation
from app.ai import gemma_client
import time

app = FastAPI(title="FORESIGHTX AI Engine & Simulation Architecture")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health():
    return {"status": "ok"}

@app.get("/api/ai/health")
async def ai_health():
    try:
        start_time = time.time()
        response = await gemma_client.test_inference()
        latency = time.time() - start_time
        return {
            "status": "connected",
            "model": gemma_client.settings.GEMMA_MODEL_ID,
            "latency_seconds": round(latency, 2),
            "response": response
        }
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Provider failed: {str(e)}")

@app.post("/api/ai/extract-scenario", response_model=ScenarioExtractionResponse)
async def extract_scenario(req: ScenarioExtractionRequest):
    try:
        return await gemma_client.extract_scenario(req.text)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Inference failed: {str(e)}")

@app.post("/api/ai/decision-contract", response_model=DecisionContractResponse)
async def create_decision_contract(req: DecisionContractRequest):
    try:
        return await gemma_client.generate_decision_contract(req.scenario)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Inference failed: {str(e)}")

# ==============================================================================
# DETERMINISTIC SIMULATION ENGINE ENDPOINTS
# ==============================================================================

@app.post("/api/simulations/run", response_model=SimulationResult)
async def run_simulation_endpoint(input_params: SimulationInput):
    """Executes deterministic evaluation across Decisions A (Delay), B (Alternative Activity), and C (Backup Speaker)."""
    try:
        return run_simulation(input_params)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation calculation error: {str(e)}")

@app.post("/api/simulations/recalculate", response_model=RecalculationResult)
async def recalculate_simulation_endpoint(req: DisruptionInjectionRequest):
    """Recalculates simulation upon secondary disruption injection, identifying newly infeasible decisions and metric deltas."""
    try:
        return recalculate_simulation(req.base_parameters, req.injected_disruption)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recalculation error: {str(e)}")

@app.get("/api/simulations/example")
async def example_simulation():
    """Returns a canonical example scenario ready for deterministic simulation and UI inspection."""
    example_input = SimulationInput(
        event_name="Global Tech Keynote 2026",
        event_duration=180,
        current_event_time=30,
        speaker_delay=35,
        number_of_attendees=350,
        available_backup_speakers=1,
        internet_available=True,
        available_alternative_activities=[
            "Audience Q&A & Lightning Discussions",
            "Structured Networking Sprint"
        ],
        event_end_time_constraint=210,
        equipment_functional=True,
        attendee_capacity=400,
        backup_requires_internet=False,
        activity_requires_internet=False,
    )
    result = run_simulation(example_input)
    return {
        "example_input": example_input,
        "sample_computed_result": result,
    }

