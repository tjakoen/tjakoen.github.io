---
status: complete
consulted: [MODELS.md#10-the-model-guard, MODELS.md#11-cost-and-privacy, MODELS.md#19-what-is-on-hold-and-what-is-not-tested, BRIEF.md#the-checklist, LOOP.md, skill:brief]
plan: plans/opencode-main-tier.md
verifiedBy: Two spawned sessions read the standard as it stands; the second answered on deepseek-v4-pro with the table rule applied.
unpushed: 0
doctor: The session-start checklist reported the instruction budget at 19,926 characters against 20,000, and PANTRY serving with the plan claim refused for the tool name opencode.
touched:
  - ~/Local/agent-config/shared/model-roles.json
  - ~/Local/agent-config/shared/tools/route-check.ts
  - ~/Local/agent-config/shared/tools/spawn-session.sh
  - ~/Local/agent-config/shared/CLAUDE.md
  - standards/MODELS.md
  - plans/opencode-main-tier.md
---

# The OpenCode main session stops sitting on a light model

The owner's Codex usage ran out, the main chain did what it was designed to do, and the session that
resulted was hard to read. The first question was whether that was a bug. It was not. The second was
whether it was wired, and checking it found three breaks in the path around the fallback, plus a
registry entry naming a model the provider does not serve.

## What changed

- **DeepSeek V4 Pro is second in the main chain** (D13). The owner asked why the hop is not Sonnet; the
  Go plan carries none, so the hop is the cheapest model on Go that sits a tier above Flash.
- **The strong lane names V4 Pro too.** It had named `opencode-go/claude-sonnet-5-5`, which the provider
  could not serve. The live catalog is the check that caught it.
- **spawn-session starts a successor on the main chain.** It defaulted to the execution tier, which is
  the light chain, so every new session began on Flash no matter what the main chain said.
- **A routing refusal prints before it exits.** Under `set -e`, exit 3 from the pick killed the script
  before the reason reached the screen.
- **A repository is keyed by its physical path.** A spawned shell reports `/private/var/...` and Node
  reports `/var/...`, so one directory had two clearance keys.
- **Reviews have a Go seat.** reviewer-go is pinned to Gemini 4 Argon at medium effort, chosen because
  the main session writes on DeepSeek and a review must not share its family.
- **The global pointer names bullets and tables again.** The trimmed version had lost them.

## The live test

Two spawned sessions, each given a normal task with no format instruction in it, so anything good in the
reply came from the standard rather than from the prompt.

| Run | Model | Reply | Tables |
|---|---|---|---|
| 1, before the pointer fix | deepseek-v4-pro | Three longest standards as a numbered list, then a paragraph | Missed |
| 2, after the pointer fix | deepseek-v4-pro | Three longest notes in a table with a header row, then two bullets | Applied |

Run 1 also led with the answer and used no filler, so the failure was narrow: one rule that had been
dropped from the only text in context every turn. The pointer is the load-bearing part, not the skill,
because a skill fires only when the model chooses it.

## Verification

```text
bun shared/tools/model-roles.ts check          registry valid, every pin matches
bun shared/tools/route-check.ts pick ... main  opencode-go/deepseek-v4-pro
spawn-session.sh --dry-run                     --model opencode-go/deepseek-v4-pro
spawned session                                build · deepseek-v4-pro (twice)
bun test (agent-config, full)                  1041 pass, 3 fail, every fail a 5s timeout in a shell-hook test
bun test (those two files, alone)              33 pass, 0 fail
bun test (portfolio)                           1052 pass, 0 fail
```

## What was not done

- **The writer agent is still pinned to gpt-6.2-sol.** With the Codex plan out, prose work has no route.
  It needs the same second-seat treatment as the reviewer.
- **The full agent-config suite is flaky under load.** Its shell-hook tests carry a 5 second timeout and
  time out while a deploy runs beside them; the routing, recovery, spawn and registry files pass alone.
- **Quality on V4 Pro is unmeasured.** One line of output proves it serves, not that it plans well. The
  Go meter and the owner's own read are the evidence for that, over the next week.
