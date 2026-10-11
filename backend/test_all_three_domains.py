import asyncio
import time
import json
from app.ai.gemma_client import generate_decision_contract

SCENARIOS = [
    {
        "id": "TEST 1 (Events)",
        "scenario": "Our keynote speaker is 30 minutes late and the event must end by 5 PM.",
        "expected_domain_keywords": ["event", "entertainment"],
        "disallowed_keywords": ["server", "database", "truck", "delivery"]
    },
    {
        "id": "TEST 2 (IT Operations)",
        "scenario": "Our production server crashed and customers cannot access the website.",
        "expected_domain_keywords": ["it", "infrastructure", "software", "tech", "operations"],
        "disallowed_keywords": ["keynote", "speaker", "ballroom", "curfew", "truck"]
    },
    {
        "id": "TEST 3 (Logistics)",
        "scenario": "Our delivery truck broke down with 500 packages awaiting delivery.",
        "expected_domain_keywords": ["logistic", "supply", "transport", "delivery", "fleet"],
        "disallowed_keywords": ["keynote", "speaker", "ballroom", "curfew", "server", "database"]
    }
]

async def run_domain_tests():
    print("=================================================================")
    print("STARTING CROSS-INDUSTRY GEMMA 4 DECISION CONTRACT LIVE TESTS")
    print("=================================================================\n")

    results = []

    for sc_info in SCENARIOS:
        print(f"--> Executing: {sc_info['id']}")
        print(f"    Scenario Prompt: \"{sc_info['scenario']}\"")
        t0 = time.time()
        try:
            res = await generate_decision_contract(sc_info["scenario"])
            elapsed = time.time() - t0
            print(f"    [SUCCESS] Response received in {elapsed:.2f}s")
            print(f"    Domain Detected: '{res.domain}'")
            print(f"    Problem Summary: '{res.problem_summary}'")
            print(f"    Objectives: {len(res.objectives)} | Constraints: {len(res.constraints)}")
            print(f"    Alternatives Count: {len(res.alternatives)}")

            assert len(res.alternatives) == 3, f"Expected 3 alternatives, got {len(res.alternatives)}"

            # Verify alternatives
            for alt in res.alternatives:
                print(f"      Alternative [{alt.id}]: {alt.title}")
                print(f"        Action Steps: {len(alt.action_steps)} (e.g., '{alt.action_steps[0].title}' - Role: {alt.action_steps[0].suggested_role})")
                print(f"        Dependencies: {len(alt.dependencies)} (e.g., '{alt.dependencies[0].label}' - Status: {alt.dependencies[0].status})")
                print(f"        Fallback Plan: '{alt.fallback_plan.title}' ({len(alt.fallback_plan.action_steps)} steps)")

                # Verify dependencies default to unknown
                for dep in alt.dependencies:
                    assert dep.status == "unknown", f"Expected dependency status 'unknown', got '{dep.status}'"
                    assert dep.critical is True, f"Expected critical=True"

                # Verify fallback plan
                assert alt.fallback_plan is not None
                assert len(alt.fallback_plan.action_steps) > 0

                # Verify domain separation: no disallowed keywords in IT or Logistics
                all_text = (alt.title + " " + alt.description + " " + alt.reasoning + " " + 
                            " ".join(s.title for s in alt.action_steps)).lower()
                for disallowed in sc_info["disallowed_keywords"]:
                    if disallowed in all_text:
                        print(f"    [WARNING] Found disallowed keyword '{disallowed}' in {sc_info['id']}!")

            results.append({
                "id": sc_info["id"],
                "status": "PASSED",
                "domain": res.domain,
                "latency": round(elapsed, 2),
                "alternatives": [a.title for a in res.alternatives]
            })
            print(f"    --> {sc_info['id']}: ALL VALIDATIONS PASSED\n")

        except Exception as e:
            elapsed = time.time() - t0
            print(f"    [FAILED] {sc_info['id']} in {elapsed:.2f}s: {e}\n")
            results.append({
                "id": sc_info["id"],
                "status": "FAILED",
                "error": str(e),
                "latency": round(elapsed, 2)
            })

    print("=================================================================")
    print("FINAL SUMMARY OF DOMAIN TESTS:")
    print(json.dumps(results, indent=2))
    print("=================================================================")

if __name__ == "__main__":
    asyncio.run(run_domain_tests())
