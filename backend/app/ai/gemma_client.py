from openai import AsyncOpenAI
import json
import re
from app.core.config import settings
from app.schemas.scenario import ScenarioExtractionResponse
from app.schemas.contract import DecisionContractResponse
import logging

logger = logging.getLogger(__name__)

def get_client():
    if not settings.GEMMA_API_KEY:
        raise ValueError("GEMMA_API_KEY is not configured. Please provide it in .env")
    
    return AsyncOpenAI(
        api_key=settings.GEMMA_API_KEY,
        base_url=settings.GEMMA_BASE_URL,
    )

async def test_inference() -> str:
    client = get_client()
    response = await client.chat.completions.create(
        model=settings.GEMMA_MODEL_ID,
        messages=[{"role": "user", "content": "Explain counterfactual reasoning in two sentences."}],
        max_tokens=1500
    )
    return response.choices[0].message.content

async def extract_scenario(text: str) -> ScenarioExtractionResponse:
    client = get_client()
    schema = ScenarioExtractionResponse.model_json_schema()
    
    prompt = f"""You are an AI decision intelligence engine. Extract the scenario details from the user input.
Unknown values must be marked as 'Unknown'. Do not invent missing facts.
Provide exactly 3 alternative decisions.
Output exactly and only valid JSON matching this schema: {json.dumps(schema)}
User Input: {text}"""
    
    response = await client.chat.completions.create(
        model=settings.GEMMA_MODEL_ID,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1
    )
    
    content = response.choices[0].message.content
    
    if "<thought>" in content and "</thought>" in content:
        content = content.split("</thought>")[-1].strip()
        
    # Use regex to extract JSON block if wrapped in markdown
    json_match = re.search(r'```(?:json)?\s*(.*?)\s*```', content, re.DOTALL)
    if json_match:
        content = json_match.group(1).strip()
        
    try:
        data = json.loads(content)
        return ScenarioExtractionResponse(**data)
    except Exception as e:
        logger.error(f"Failed to parse Gemma output: {content}")
        raise ValueError(f"Invalid model output: {e}")

async def generate_decision_contract(scenario: str) -> DecisionContractResponse:
    client = get_client()
    schema = DecisionContractResponse.model_json_schema()
    
    system_prompt = (
        "You are FORESIGHTX, a cross-industry AI decision intelligence and adaptive execution engine. "
        "Analyze operational challenges across any industry (e.g., IT Operations, Logistics, Manufacturing, "
        "Education, Healthcare, Business Operations, Event Management). "
        "Output strictly valid JSON matching the provided schema. Do not output preamble, markdown fences, or postamble."
    )
    
    prompt = f"""Generate a comprehensive Decision Contract for the operational scenario below.
Requirements:
1. Identify the specific industry domain (e.g. IT Operations, Logistics, Manufacturing, Education, Healthcare, Business Operations, Event Management).
2. Summarize the problem, key objectives, and operational constraints.
3. Provide EXACTLY 3 distinct, actionable alternatives (IDs must be "A", "B", and "C").
4. For EACH alternative:
   - Provide concrete action_steps with an id, title, suggested_role, and status="pending".
   - Provide critical dependencies with an id, label, status="unknown", and critical=true.
   - Provide specific failure_triggers that would invalidate the plan.
   - Provide a prepared fallback_plan with title and concrete action_steps.
   - List key assumptions.
5. Output strictly valid JSON matching this schema:
{json.dumps(schema)}

Scenario:
{scenario}"""

    response = await client.chat.completions.create(
        model=settings.GEMMA_MODEL_ID,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        temperature=0.1,
        max_tokens=3000
    )
    
    content = response.choices[0].message.content
    
    if "</thought>" in content:
        content = content.split("</thought>")[-1].strip()
    elif "</think>" in content:
        content = content.split("</think>")[-1].strip()
        
    json_match = re.search(r'```(?:json)?\s*(.*?)\s*```', content, re.DOTALL)
    if json_match:
        content = json_match.group(1).strip()
    elif not (content.strip().startswith("{") and content.strip().endswith("}")):
        start = content.find("{")
        end = content.rfind("}")
        if start != -1 and end != -1 and end > start:
            content = content[start:end+1].strip()
        
    try:
        data = json.loads(content)
        
        # Normalize alternatives to guarantee exactly 3 labeled A, B, C
        if "alternatives" in data and isinstance(data["alternatives"], list):
            valid_alts = data["alternatives"][:3]
            # Ensure at least 3 alternatives if model provided fewer
            while len(valid_alts) < 3:
                idx = len(valid_alts)
                alt_id = ["A", "B", "C"][idx]
                valid_alts.append({
                    "id": alt_id,
                    "title": f"Alternative {alt_id}: Adaptive Operational Contingency",
                    "description": f"Secondary operational path {alt_id} for {data.get('domain', 'operations')}.",
                    "reasoning": "Maintains mission-critical service continuity and risk mitigation.",
                    "action_steps": [
                        {"id": f"step-{idx}-1", "title": "Assess current operational state", "suggested_role": "Operations Lead", "status": "pending"},
                        {"id": f"step-{idx}-2", "title": "Deploy tactical contingency measures", "suggested_role": "Team Lead", "status": "pending"}
                    ],
                    "dependencies": [
                        {"id": f"dep-{idx}-1", "label": "Operational communication channels active", "status": "unknown", "critical": True}
                    ],
                    "failure_triggers": ["Communication blackout", "Resource depletion"],
                    "fallback_plan": {
                        "title": f"Fallback Plan {alt_id}: Emergency Standby",
                        "action_steps": [
                            {"id": f"fallback-step-{idx}-1", "title": "Initiate emergency containment protocol", "status": "pending"}
                        ]
                    },
                    "assumptions": ["Core operations personnel available"]
                })
            for idx, alt in enumerate(valid_alts):
                alt["id"] = ["A", "B", "C"][idx]
                if "dependencies" in alt and isinstance(alt["dependencies"], list):
                    for dep in alt["dependencies"]:
                        if not dep.get("status"):
                            dep["status"] = "unknown"
                if "action_steps" in alt and isinstance(alt["action_steps"], list):
                    for step_idx, step in enumerate(alt["action_steps"]):
                        if not step.get("id"):
                            step["id"] = f"step-{idx}-{step_idx+1}"
                        if not step.get("status"):
                            step["status"] = "pending"
                if "fallback_plan" in alt and isinstance(alt["fallback_plan"], dict):
                    fb = alt["fallback_plan"]
                    if "action_steps" in fb and isinstance(fb["action_steps"], list):
                        for fb_idx, fb_step in enumerate(fb["action_steps"]):
                            if not fb_step.get("id"):
                                fb_step["id"] = f"fallback-step-{idx}-{fb_idx+1}"
                            if not fb_step.get("status"):
                                fb_step["status"] = "pending"
            data["alternatives"] = valid_alts
            
        return DecisionContractResponse(**data)
    except Exception as e:
        logger.error(f"Failed to parse Gemma Decision Contract output: {content}")
        raise ValueError(f"Invalid model output for Decision Contract: {e}")

