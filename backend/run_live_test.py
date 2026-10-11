import asyncio
from app.ai.gemma_client import test_inference, extract_scenario
import time

async def run():
    print("=== LIVE INFERENCE TEST ===")
    try:
        t0 = time.time()
        res = await test_inference()
        t1 = time.time()
        print(f"Latency: {t1-t0:.2f}s")
        print(f"Response: {res}")
    except Exception as e:
        print(f"Inference failed: {e}")

    print("\n=== SCENARIO EXTRACTION TEST ===")
    prompt = "Our keynote speaker is delayed by 30 minutes. There are 300 attendees and the event must finish by 5 PM."
    try:
        t0 = time.time()
        res = await extract_scenario(prompt)
        t1 = time.time()
        print(f"Latency: {t1-t0:.2f}s")
        print(f"Extraction Result:\n{res.model_dump_json(indent=2)}")
    except Exception as e:
        print(f"Extraction failed: {e}")

if __name__ == "__main__":
    asyncio.run(run())
