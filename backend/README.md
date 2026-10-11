# FORESIGHTX Backend — AI Engine & Simulation Architecture

## Overview
FORESIGHTX utilizes a hybrid architecture:
1. **Mathematical Simulation Engine**: Deterministic counterfactual calculation engine evaluating schedule delays, attendee waiting times, curfew limits, and resource requirements without AI hallucinations.
2. **Permanent Core AI Model**: **Google Gemma 4 (`models/gemma-4-31b-it`)**. Gemma 4 interprets user-described disruption scenarios, generates structured decision options, and provides qualitative trade-off reasoning.

## Gemma 4 Integration
- **Model ID**: `models/gemma-4-31b-it`
- **Inference Gateway**: Google AI Studio OpenAI-compatible endpoint (`https://generativelanguage.googleapis.com/v1beta/openai/`)
- **Reasoning Stream Parsing**: Built-in regex and XML parser strips `<thought>` chain-of-thought blocks from Gemma 4 outputs to ensure clean, strictly validated Pydantic JSON extraction.

## Environment Configuration
```env
GEMMA_API_KEY=your_google_ai_studio_api_key_here
GEMMA_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
GEMMA_MODEL_ID=models/gemma-4-31b-it
```

## API Endpoints
- `GET /api/health` — Base service health check
- `GET /api/ai/health` — Gemma 4 connectivity test and latency measurement
- `POST /api/ai/extract-scenario` — Scenario parsing and decision generation via Gemma 4
- `POST /api/simulations/run` — Deterministic scenario simulation across Decisions A, B, and C
- `POST /api/simulations/recalculate` — Secondary disruption injection & delta analysis
- `GET /api/simulations/example` — Canonical example event disruption scenario

## Running Tests
```bash
python -m pytest
```
