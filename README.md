# FORESIGHTX

<p align="center">
  <strong>Think Beyond the Decision.</strong><br />
  <em>AI-Powered Decision Intelligence & Adaptive Execution Platform</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Model-Google%20Gemma%204%20(31B)--orange?style=flat-square" alt="Gemma 4" />
  <img src="https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.12-blue?style=flat-square" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Frontend-React%2019%20%7C%20TypeScript%20%7C%20Vite-61dafb?style=flat-square" alt="React" />
  <img src="https://img.shields.io/badge/Tests-16%20Passed-brightgreen?style=flat-square" alt="Tests" />
  <img src="https://img.shields.io/badge/License-MIT-lightgrey?style=flat-square" alt="License" />
</p>

---

## Overview

**FORESIGHTX** transforms operational crisis response from reactive guesswork into structured, adaptive execution. Powered by **Google Gemma 4 (`models/gemma-4-31b-it`)**, FORESIGHTX accepts arbitrary natural-language operational challenges across any industry—**IT Operations, Logistics, Manufacturing, Education, Healthcare, Business Operations, and Event Management**—and synthesizes a comprehensive **Decision Contract** in a single AI request.

Once formulated, strategies are deployed directly into **FORESIGHTX LIVE Decision Autopilot**, where operational teams track assigned roles, complete tasks, report real-time dependency conditions, and deterministically activate prepared contingency fallbacks if critical requirements fail.

---

## Key Capabilities

### 1. Cross-Industry AI Decision Intelligence
- **Domain Independent**: Analyzes operational disruptions in any industry without hardcoded playbooks.
- **Single-Request Decision Contracts**: Synthesizes problem summaries, objectives, operational constraints, and **three distinct actionable alternatives** (Options A, B, and C).
- **Structured Pydantic Validation**: Guarantees typed outputs with sequential action steps, suggested roles, critical dependency guardrails, failure triggers, and prepared fallbacks.

### 2. FORESIGHTX LIVE — Decision Autopilot
- **Dynamic Task Checklists**: Action steps tailored to the detected domain with assigned operational roles (e.g. *SRE Engineer, Systems Administrator, Fleet Manager, Procurement Lead, Event Coordinator*).
- **AI-Proposed Action Review**: AI-generated actions and resources are marked as proposed until reviewed and confirmed by an operator.
- **Live Dependency Guardrails**: Essential resources and operational conditions initialize to `UNKNOWN` by default.
- **Deterministic UI Blocker**: Failing a critical dependency triggers an immediate blocked state with zero hallucinated state updates and without repeated AI calls.
- **Adaptive Fallback Activation**: Instantly transitions to pre-planned contingency action steps while preserving the blocked plan and history in an immutable audit log.

### 3. Preserved Deterministic Event Simulation Engine
- **Mathematical Constraint Engine**: For supported event disruption scenarios, a deterministic Python engine computes numerical schedule delays, attendee waiting times, and curfew violations.
- **Counterfactual Causal Graph**: Interactive SVG branching graph visualizing baseline vs. disrupted paths.
- **Compounding Disruption Injection**: Simulate secondary failures (e.g. venue Wi-Fi and network drops) to recalculate feasibility and identify newly infeasible strategies.
- **Transparent Domain Boundaries**: Clear, explicit labeling distinguishes calibrated numerical event simulation from general-purpose AI decision planning across other industries.

### 4. Editorial Visual Aesthetic
- Curated warm minimalist palette (`#EAE3D8`, `#171615`, `#F06445`).
- Interactive Three.js/Canvas 3D decision sculpture.
- GSAP ScrollTrigger-bound interactive narrative chapters.

---

## System Architecture

```
                                  User Scenario
                     ("Describe a challenge in any domain...")
                                        │
                                        ▼
                         POST /api/ai/decision-contract
                                        │
                                        ▼
                        Google Gemma 4 (31B Parameter)
                                        │
                                        ▼
                         Validated Decision Contract
        ┌───────────────────────────────┴───────────────────────────────┐
        │                                                               │
   Event Domain                                                Other Domains
(Events, Keynotes, etc.)                                  (IT Ops, Logistics, etc.)
        │                                                               │
        ▼                                                               ▼
Deterministic Simulation Engine                             Transparent Scope Notice
• Delay minutes & attendee metrics                          • AI Decision Intelligence
• Counterfactual SVG graph                                  • Strategy Alternatives A, B, C
• Secondary disruption injection                            • No fabricated metrics
        │                                                               │
        └───────────────────────────────┬───────────────────────────────┘
                                        │
                                        ▼
                      FORESIGHTX LIVE — Decision Autopilot
                      ├─ Action checklist with assigned roles
                      ├─ "Proposed by AI" operator confirmation
                      ├─ Dependency Guardrails (UNKNOWN by default)
                      ├─ Deterministic blocker on dependency failure
                      ├─ Prepared fallback plan activation
                      └─ Comprehensive audit history log
```

---

## Cross-Industry Benchmarks

FORESIGHTX has been validated against three diverse live operational scenarios:

### Test 1: Event Management
- **Scenario**: *"Our keynote speaker is 30 minutes late and the event must end by 5 PM."*
- **Detected Domain**: `Event Management`
- **Generated Alternatives**:
  - **Option A (Schedule Compression)**: Coordinate with MC for compressed address (`Event Coordinator`).
  - **Option B (Interactive Buffer Insertion)**: Deploy audience polling and networking (`AV Technician`).
  - **Option C (Virtual Pivot)**: Connect speaker remotely via high-speed link (`Speaker Liaison`).
- **Simulation**: Calibrated numerical simulation enabled (delay minutes, attendee waiting time, curfew limits).

### Test 2: IT Operations
- **Scenario**: *"Our production server crashed and customers cannot access the website."*
- **Detected Domain**: `IT Operations`
- **Generated Alternatives**:
  - **Option A (Rapid Restart and Hotfix)**: Hard reboot instance and inspect crash dump (`Systems Administrator`).
  - **Option B (Failover to Disaster Recovery Site)**: Promote DR replica database and reroute DNS (`DBA / Network Lead`).
  - **Option C (Infrastructure as Code Redeployment)**: Provision clean cloud instances via Terraform (`Security / DevOps`).
- **Dependencies**: IPMI access, DR snapshot sync, CI/CD pipeline health (zero event-specific contamination).

### Test 3: Logistics & Supply Chain
- **Scenario**: *"Our delivery truck broke down with 500 packages awaiting delivery."*
- **Detected Domain**: `Logistics`
- **Generated Alternatives**:
  - **Option A (Internal Fleet Redistribution)**: Dispatch nearest spare vehicle to cross-load packages (`Fleet Manager`).
  - **Option B (3PL Emergency Outsourcing)**: Engage pre-approved regional courier fleet (`Procurement Officer`).
  - **Option C (Hub-and-Spoke Consolidation)**: Tow vehicle to central sorting depot for priority re-sort (`Fleet Dispatcher`).
- **Dependencies**: Spare vehicle capacity, 3PL dispatch SLA, heavy towing service availability.

---

## API Reference

### 1. Decision Contract Endpoint
`POST /api/ai/decision-contract`

**Request:**
```json
{
  "scenario": "Our production server crashed and customers cannot access the website."
}
```

**Response (Schema-validated):**
```json
{
  "domain": "IT Operations",
  "problem_summary": "Production server crash causing website downtime for all users.",
  "objectives": [
    "Restore website availability as quickly as possible",
    "Prevent data loss and verify database integrity"
  ],
  "constraints": [
    "Strict 99.9% uptime SLA",
    "Limited senior DevOps availability during outage"
  ],
  "alternatives": [
    {
      "id": "A",
      "title": "Rapid Restart and Service Recovery",
      "description": "Hard reboot instance and restart web, app, and DB services in sequence.",
      "reasoning": "Fastest recovery path if issue was transient memory exhaustion.",
      "action_steps": [
        {
          "id": "step-1",
          "title": "Perform hard reboot of production server",
          "suggested_role": "Systems Administrator",
          "status": "pending"
        }
      ],
      "dependencies": [
        {
          "id": "dep-1",
          "label": "Out-of-band console access (IPMI/KVM)",
          "status": "unknown",
          "critical": true
        }
      ],
      "failure_triggers": [
        "Server fails to POST or boot from disk"
      ],
      "fallback_plan": {
        "title": "Emergency Disaster Recovery Failover",
        "action_steps": [
          {
            "id": "fallback-1",
            "title": "Switch DNS records to point to standby DR site",
            "status": "pending"
          }
        ]
      },
      "assumptions": [
        "Underlying hypervisor hardware is healthy"
      ]
    }
  ]
}
```

### 2. Simulation Endpoints
- `POST /api/simulations/run`: Runs deterministic calculation across Decisions A, B, and C for event scenarios.
- `POST /api/simulations/recalculate`: Recalculates metrics upon injected secondary disruption (e.g. Wi-Fi failure).
- `GET /api/simulations/example`: Returns canonical benchmark simulation parameters and computed outcomes.
- `GET /api/health`: Service health check.
- `GET /api/ai/health`: Google Gemma 4 latency and connectivity check.

---

## Project Structure

```
FORESIGHTX/
├── backend/
│   ├── app/
│   │   ├── ai/
│   │   │   └── gemma_client.py        # Gemma 4 OpenAI client & contract parsing
│   │   ├── core/
│   │   │   └── config.py              # Environment configuration & settings
│   │   ├── schemas/
│   │   │   ├── contract.py            # General-purpose Decision Contract Pydantic schemas
│   │   │   ├── scenario.py            # Event scenario extraction schemas
│   │   │   └── simulation.py          # Deterministic simulation schemas
│   │   ├── simulation/
│   │   │   └── engine.py              # Deterministic event constraint simulation engine
│   │   └── main.py                    # FastAPI application & route definitions
│   ├── tests/
│   │   ├── test_api.py                # FastAPI endpoint unit tests
│   │   └── test_simulation.py         # Deterministic engine tests
│   ├── test_all_three_domains.py      # Live benchmark test runner across 3 domains
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/                # Brand logo & UI primitives
│   │   │   ├── landing/
│   │   │   │   ├── DecisionSculpture.tsx   # Interactive Three.js/Canvas 3D sculpture
│   │   │   │   ├── HeroSection.tsx         # Hero section with new positioning
│   │   │   │   ├── HowItWorksSection.tsx   # 5-step workflow overview
│   │   │   │   ├── FeaturesSection.tsx     # 5 core capability pillars
│   │   │   │   ├── IndustrySection.tsx     # Cross-industry operational showcase
│   │   │   │   ├── Storytelling.tsx        # GSAP ScrollTrigger narrative
│   │   │   │   └── scenario/               # Interactive branching preview
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx              # Navigation header
│   │   │   │   └── Footer.tsx              # Footer with Gemma 4 attribution
│   │   │   └── workspace/
│   │   │       └── DecisionAutopilot.tsx   # Generic execution tracking & fallbacks
│   │   ├── lib/
│   │   │   └── api.ts                 # Typed API client
│   │   ├── pages/
│   │   │   ├── Landing.tsx            # Main landing page
│   │   │   └── Workspace.tsx          # Cross-industry decision workspace
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites
- **Node.js** 18+ and **npm**
- **Python** 3.11+
- **Google AI Studio API Key** (for Google Gemma 4 access)

---

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   ```bash
   # Windows
   python -m venv .venv
   .venv\Scripts\activate

   # macOS / Linux
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set your Google AI Studio API key:
   ```env
   GEMMA_API_KEY=your_google_ai_studio_api_key_here
   GEMMA_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
   GEMMA_MODEL_ID=models/gemma-4-31b-it
   ```

5. **Run the backend server**:
   ```bash
   uvicorn app.main:app --port 8000 --reload
   ```
   The backend will be live at `http://127.0.0.1:8000`. Verify via `http://127.0.0.1:8000/api/health`.

---

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   The application will be live at `http://localhost:5173`.

---

## Running Tests

### 1. Backend Unit Tests
Execute the comprehensive test suite covering API endpoints and the deterministic simulation engine:
```bash
cd backend
python -m pytest
```
*Expected output: `16 passed`*

### 2. Live Cross-Domain Benchmark
Execute live inference tests for the 3 operational benchmark domains (Events, IT Ops, Logistics) against Google Gemma 4:
```bash
cd backend
python test_all_three_domains.py
```

### 3. Frontend Production Build
Validate TypeScript compilation and bundle generation:
```bash
cd frontend
npm run build
```

---

## Technology Stack

- **AI Core**: Google Gemma 4 (`models/gemma-4-31b-it`) via Google AI Studio API
- **Backend**: FastAPI, Pydantic v2, Uvicorn, OpenAI Python SDK, Pytest
- **Frontend**: React 19, TypeScript, Vite, TailwindCSS, Framer Motion, GSAP ScrollTrigger
- **Visuals**: Three.js / Canvas 3D sculpture rendering

---

## License

This project is licensed under the MIT License.
