---
title: Model Intelligence Layer Phase A, session S, the standard and the verify prompt
date: 2026-11-22
status: complete
branch: main
scope:
  - standards/
  - artifacts/runs/
  - plans/
touched:
  - standards/MODELS.md
  - standards/MODELS-VERIFY.md
  - standards/README.md
  - standards/INDEX.json
  - standards/SESSION-LOOP.md
  - standards/AUDIT-STANDARD.md
  - standards/HOOKS.md
  - artifacts/runs/2026-11-22-mil-verify-claude.md
  - artifacts/runs/2026-11-22-model-intelligence-layer-phase-a.md
  - plans/model-intelligence-layer-phase-a.md
consulted:
  - VOICE.md#do-not-sound-like-the-machine
  - DECISIONS.md
skills:
  - voice
plans:
  - model-intelligence-layer-phase-a | steps 8 and 9, plus the Claude Code verify run
gates:
  - bun run check | tsc clean, exit 0
  - bun test | 1014 pass, 13 fail; the same 13 fail with this change stashed
  - bun tools/lint-gate.ts | did not run, the oxlint binary is not in node_modules on this PC
  - bun run lint:voice on the two new standards | 0 flags
  - bun run standards:index | 28 standards, 236 sections
diffstat: 10 files, two new standards, one index row, three one-line pointers, two run reports
unpushed: committed locally | push is owner-gated
verifiedBy: nobody yet, the owner reviews before push
doctor: checklist at session start ended NOT loaded on the PANTRY pane row only; the Model Intelligence Layer row was ok
---

# Run report: Model Intelligence Layer, Phase A, session S

Session C built steps 1 to 7 in claude-config, and session A recorded the Windows acceptance there
(claude-config's own run report of the same date). This session wrote steps 8 and 9 in this
repository and ran MODELS-VERIFY on Claude Code as the first harness.

## What changed

- **`standards/MODELS.md`**, the policy: what the layer owns, the six roles on three tiers, the main
  session on execution, escalation by delegation and why a model switch is not used, the three
  decisions (preferred assignment, fallback, escalation), the effort ceiling, the registry as the only
  home of identifiers, the five conformance levels, and D8. No model identifier appears in it.
- **`standards/MODELS-VERIFY.md`**, the copy-paste prompt: the verifier command per harness, the model,
  envelope, delegation, 16-hex canary and human-lane probes with pass criteria, the Codex instructions
  to record its spawn tool and payload and to set `verified: true` in claude-config, and the report
  shape.
- **Wiring:** an index row in `standards/README.md`, `INDEX.json` regenerated, a one-line pointer
  from SESSION-LOOP §6 and from AUDIT-STANDARD's model-tier paragraph, and OpenCode added to HOOKS
  §4c as a fourth harness, unsupported. The §4c heading still says three harnesses, because the
  scope cap allowed the row and not the heading.

## Where the build differs from the plan, and MODELS.md follows the build

- The escalation hook names the auditor and the writer as well as the planner and goldfish. MODELS.md
  says so in one sentence.
- The later-phase verifier rows carry the level unsupported with result NOT TESTED. MODELS.md does
  not restate the table, so nothing in it depends on that choice.
- None of the differences changes policy, so no ask was raised for them.

## Gate output

| Gate | Result |
|---|---|
| `bun run check` | exit 0 |
| `bun test` | 1014 pass, 13 fail, across 58 files. All 13 also fail with this session's changes stashed: analytics `load` and `localSnapshot` (6), an uncached-fence test, two DSH slug tests, two issued-manifest tests, the real run-report tree, and the AGENTS.md alias. They read as the Windows symlink and path environment, and were not fixed, per the brief. |
| `bun tools/lint-gate.ts` | did not run: `oxlint binary not found at node_modules\.bin\oxlint`. Environmental. |
| `bun run lint:voice` on both new standards | 0 flags after removing three backticks |

## The Claude Code verify run

Recorded in [2026-11-22-mil-verify-claude.md](2026-11-22-mil-verify-claude.md). The verifier passed
every Phase A check. The envelope, delegation, freshness and human-lane probes passed. **The model
probe failed:** this session ran as Opus while the registry's main tier is Sonnet, because the parent
session started it with a model of its own choosing. The device configuration is correct. That
failure is an ask-trigger in the brief, so the plan's status stays at doing and the question went
to the parent session.

## What was not done

- **Remaining:** the owner reruns MODELS-VERIFY in a fresh Claude Code session started normally,
  not from another session. The plan goes to done when that run passes, and it stays at doing
  until then.
- **Finding for a later plan:** a session started by another session inherits the parent's model,
  so the main-tier rule can be bypassed by spawning a session. Neither the verifier nor any hook
  sees it; only the model probe caught it.
- Follow-ups carried from session C stand: `human-lane.sh` and the `python3` stub, the DSH plugin
  passing the agent type, and the plan's `touches` list missing the DSH guard files.
