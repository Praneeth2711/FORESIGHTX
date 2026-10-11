import asyncio
import time
import json
import re
from app.ai.gemma_client import get_client
from app.schemas.scenario import ScenarioExtractionResponse

async def test_fast_prompt():
    client = get_client()
    test_text = "Our keynote speaker is delayed by 30 minutes. We have 250 attendees and the venue must close by 5 PM (180 minutes from start). There is 1 backup speaker in the green room."

    # Concise schema format (much smaller than full Pydantic JSON schema)
    concise_schema = {
        "event_type": "string",
        "disruption": "string",
        "delay_duration": "string",
        "attendee_count": "string",
        "constraints": ["string"],
        "objectives": ["string"],
        "alternative_decisions": [
            {"decision": "string", "reasoning": "string"}
        ],
        "explicit_assumptions": ["string"]
    }

    # Prompt: enforce 3 decisions, concise, max_tokens=1800
    prompt = f"""Extract scenario into JSON strictly matching this schema:
{json.dumps(concise_schema)}

Requirements:
- Unknown values = 'Unknown'. Do not invent missing facts.
- Provide exactly 3 alternative decisions with brief 1-sentence reasoning each.
- Be extremely concise. Keep reasoning under 2 sentences.

Scenario: {test_text}"""

    for model in ["models/gemma-4-26b-a4b-it", "models/gemma-4-31b-it"]:
        print(f"\n--- Testing {model} ---")
        t0 = time.time()
        try:
            r = await client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are a fast scenario extraction engine. Do not overthink. Keep internal reasoning to under 2 sentences. Output JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=1800
            )
            dt = time.time() - t0
            content = r.choices[0].message.content
            has_thought = "</thought>" in content
            body = content.split("</thought>")[-1] if has_thought else content
            m = re.search(r"```(?:json)?\s*(.*?)\s*```", body, re.DOTALL)
            if m:
                body = m.group(1).strip()
            
            data = json.loads(body)
            parsed = ScenarioExtractionResponse(**data)
            print(f"SUCCESS in {dt:.2f}s! Decisions count: {len(parsed.alternative_decisions)}")
            for d in parsed.alternative_decisions:
                print(f"  - {d.decision}")
        except Exception as e:
            dt = time.time() - t0
            print(f"FAILED in {dt:.2f}s: {e}")

if __name__ == "__main__":
    asyncio.run(test_fast_prompt())
