import asyncio
import time
import json
import re
from app.ai.gemma_client import get_client

async def test_prompts():
    client = get_client()
    test_text = "Our keynote speaker is delayed by 30 minutes. We have 250 attendees and the venue must close by 5 PM (180 minutes from start). There is 1 backup speaker in the green room."
    schema_str = json.dumps({
        "event_type": "string",
        "disruption": "string",
        "delay_duration": "string",
        "attendee_count": "string",
        "constraints": ["string"],
        "objectives": ["string"],
        "alternative_decisions": [{"decision": "string", "reasoning": "string"}],
        "explicit_assumptions": ["string"]
    })

    tests = [
        {
            "name": "26b-a4b: Short thinking constraint in prompt",
            "model": "models/gemma-4-26b-a4b-it",
            "messages": [
                {"role": "system", "content": "You are a fast scenario extraction engine. Do not overthink. Keep internal reasoning to under 3 sentences."},
                {"role": "user", "content": f"Extract scenario into JSON strictly matching schema: {schema_str}\n\nScenario: {test_text}"}
            ],
            "max_tokens": 1200
        },
        {
            "name": "26b-a4b: Standard prompt with max_tokens=1200",
            "model": "models/gemma-4-26b-a4b-it",
            "messages": [
                {"role": "user", "content": f"You are an AI decision intelligence engine. Extract the scenario details from the user input.\nUnknown values must be marked as 'Unknown'. Do not invent missing facts.\nProvide exactly 3 alternative decisions.\nOutput exactly and only valid JSON matching this schema: {schema_str}\nUser Input: {test_text}"}
            ],
            "max_tokens": 1200
        },
        {
            "name": "31b-it: Short thinking constraint in prompt",
            "model": "models/gemma-4-31b-it",
            "messages": [
                {"role": "system", "content": "You are a fast scenario extraction engine. Do not overthink. Keep internal reasoning to under 3 sentences."},
                {"role": "user", "content": f"Extract scenario into JSON strictly matching schema: {schema_str}\n\nScenario: {test_text}"}
            ],
            "max_tokens": 1200
        }
    ]

    for t in tests:
        print(f"\nRunning: {t['name']}")
        try:
            t0 = time.time()
            r = await client.chat.completions.create(
                model=t["model"],
                messages=t["messages"],
                temperature=0.1,
                max_tokens=t["max_tokens"]
            )
            dt = time.time() - t0
            content = r.choices[0].message.content
            thought_len = len(content.split("</thought>")[0]) if "</thought>" in content else 0
            body = content.split("</thought>")[-1] if "</thought>" in content else content
            # Try parse JSON
            json_str = body
            m = re.search(r"```(?:json)?\s*(.*?)\s*```", body, re.DOTALL)
            if m:
                json_str = m.group(1).strip()
            try:
                parsed = json.loads(json_str)
                valid_json = True
                keys = list(parsed.keys())
            except Exception as e:
                valid_json = False
                keys = str(e)
            print(f"Time: {dt:.2f}s | Thought chars: {thought_len} | Body chars: {len(body)} | Valid JSON: {valid_json}")
            if valid_json:
                print(f"Keys extracted: {keys}")
                print(f"Decisions: {[d.get('decision', '')[:30] for d in parsed.get('alternative_decisions', [])]}")
            else:
                print(f"Preview: {body[:200]}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_prompts())
