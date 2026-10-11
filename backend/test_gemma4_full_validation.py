import asyncio
import time
import json
import re
from app.ai.gemma_client import get_client
from app.schemas.scenario import ScenarioExtractionResponse

async def test_full_scenario():
    client = get_client()
    test_text = "Our keynote speaker is delayed by 30 minutes. We have 250 attendees and the venue must close by 5 PM (180 minutes from start). There is 1 backup speaker in the green room."
    
    schema = ScenarioExtractionResponse.model_json_schema()
    
    sys_prompt = "You are an AI decision intelligence engine. Output ONLY valid JSON matching the exact schema provided. Do NOT output <thought> tags, explanations, or markdown fences. Be precise and fast."
    user_prompt = f"""Extract scenario details from the text.
Requirements:
1. Unknown values must be marked as 'Unknown'. Do not invent missing facts.
2. Provide exactly 3 feasible alternative decisions with clear reasoning.
3. Output strictly valid JSON matching this schema:
{json.dumps(schema)}

User Scenario: {test_text}"""

    for model in ["models/gemma-4-26b-a4b-it", "models/gemma-4-31b-it"]:
        print(f"\n==========================================")
        print(f"Testing model: {model}")
        print(f"==========================================")
        
        for run_idx in range(1, 4):
            t0 = time.time()
            try:
                r = await client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": sys_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.1,
                    max_tokens=1000
                )
                dt = time.time() - t0
                content = r.choices[0].message.content
                has_thought = "</thought>" in content
                
                # Clean content
                cleaned = content
                if "</thought>" in cleaned:
                    cleaned = cleaned.split("</thought>")[-1].strip()
                m = re.search(r"```(?:json)?\s*(.*?)\s*```", cleaned, re.DOTALL)
                if m:
                    cleaned = m.group(1).strip()
                
                data = json.loads(cleaned)
                parsed = ScenarioExtractionResponse(**data)
                
                print(f"Run {run_idx}: Latency = {dt:.2f}s | Thought tags: {has_thought} | Validated decisions = {len(parsed.alternative_decisions)}")
                for i, d in enumerate(parsed.alternative_decisions, 1):
                    print(f"  Decision {i}: {d.decision[:60]} -> {d.reasoning[:60]}")
            except Exception as e:
                dt = time.time() - t0
                print(f"Run {run_idx}: FAILED in {dt:.2f}s - {e}")

if __name__ == "__main__":
    asyncio.run(test_full_scenario())
