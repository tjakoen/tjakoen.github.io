---
id: opencode-main-tier
status: done
track: models
depends: []
touches: [shared/model-roles.json, shared/tools/spawn-session.sh, shared/tools/route-check.ts, standards/MODELS.md]
owner: ai
---

# The OpenCode main session stops falling to a light model

The owner's Codex usage ran out, the session moved to DeepSeek Flash by design, and the reports that
came back were harder to read than the work deserved. The question was whether that was wired right. It
was, and checking it found three breaks in the path around it.

- [x] Confirm the fallback order in the registry and the live ledger, with the times of each transition.
- [x] Record the failover receipt, so the verifier row moves off NOT TESTED.
- [x] Check the Go plan's strong lane against the live provider catalog; it named a Sonnet the provider does not serve.
- [x] Order the Go candidates by token price and pick the cheapest tier above Flash, which is DeepSeek V4 Pro (D13).
- [x] Put V4 Pro second in the main chain and in the strong lane.
- [x] Make spawn-session default to the main chain, so a successor does not start on the light one.
- [x] Fix the silent routing refusal under set -e, and key a repository by its physical path.
- [x] Prove serving with a spawned session that answered deepseek-v4-pro.
- [x] Give reviews a Go seat: reviewer-go on Gemini 4 Argon at medium effort.

## What we learned

- Topic: models
- Changed: The OpenCode main chain reaches a strong model before any light one, and the spawn path asks for it.
- Why: The fallback was correct and invisible, and the spawn path still started successors on the light chain.
- Dropped: A Sonnet lane. The Go plan does not carry Sonnet, and the metered one is a spending decision the owner has not made.
