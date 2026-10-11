import asyncio
import time
import json
import re
from app.ai.gemma_client import get_client

async def run_tests():
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

    # Test A: Test models/gemma-4-26b-a4b-it
    print("--- Test A: models/gemma-4-26b-a4b-it (MoE active-4B variant) ---")
    prompt_a = f"""Extract scenario details from text as JSON. Unknown values = 'Unknown'. Provide exactly 3 alternative decisions.
Schema: {schema_str}
Input: {test_text}"""
    try:
        t0 = time.time()
        r = await client.chat.completions.create(
            model="models/gemma-4-26b-a4b-it",
            messages=[{"role": "user", "content": prompt_a}],
            temperature=0.1,
            max_tokens=600,
        )
        dt = time.time() - t0
        content = r.choices[0].message.content
        has_thought = "</thought>" in content
        print(f"Result 26b-a4b: time={dt:.2f}s, length={len(content)}, has_thought={has_thought}")
        if has_thought:
            th, bd = content.split("</thought>", 1)
            print(f"Thought len: {len(th)}, Body len: {len(bd)}")
        else:
            print(f"Content: {content[:200]}")
    except Exception as e:
        print("26b-a4b error:", e)

    # Test B: Test models/gemma-4-31b-it with max_tokens and direct prompt
    print("\n--- Test B: models/gemma-4-31b-it with concise prompt & max_tokens=600 ---")
    prompt_b = f"""Respond strictly with a single JSON object. Do not include thinking or preambles.
Schema: {schema_str}
Input: {test_text}"""
    try:
        t0 = time.time()
        r = await client.chat.completions.create(
            model="models/gemma-4-31b-it",
            messages=[{"role": "user", "content": prompt_b}],
            temperature=0.1,
            max_tokens=600,
        )
        dt = time.time() - t0
        content = r.choices[0].message.content
        has_thought = "</thought>" in content
        print(f"Result 31b-it with max_tokens=600: time={dt:.2f}s, length={len(content)}, has_thought={has_thought}")
        if has_thought:
            th, bd = content.split("</thought>", 1)
            print(f"Thought len: {len(th)}, Body len: {len(bd)}")
        else:
            print(f"Content: {content[:200]}")
    except Exception as e:
        print("31b-it error:", e)

    # Test C: Check response_format={"type": "json_object"}
    print("\n--- Test C: models/gemma-4-31b-it with response_format json_object ---")
    try:
        t0 = time.time()
        r = await client.chat.completions.create(
            model="models/gemma-4-31b-it",
            messages=[{"role": "user", "content": prompt_b}],
            response_format={"type": "json_object"},
            temperature=0.1,
            max_tokens=600,
        )
        dt = time.time() - t0
        content = r.choices[0].message.content
        print(f"Result response_format: time={dt:.2f}s, length={len(content)}")
    except Exception as e:
        print("response_format error:", e)

if __name__ == "__main__":
    asyncio.run(run_tests())
