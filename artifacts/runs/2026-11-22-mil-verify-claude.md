---
title: MODELS-VERIFY on Claude Code, the first harness
date: 2026-11-22
status: complete
branch: main
scope:
  - artifacts/runs/
touched:
  - artifacts/runs/2026-11-22-mil-verify-claude.md
consulted:
  - VOICE.md#do-not-sound-like-the-machine
  - DECISIONS.md
skills:
  - voice
plans:
  - model-intelligence-layer-phase-a | step 9, the Claude Code run
gates:
  - mil-verify --harness claude | 9 PASS, 6 NOT TESTED (later phases), exit 0
  - probes | 4 PASS, 1 FAIL (model probe)
diffstat: 1 file, the report itself
unpushed: committed locally | push is owner-gated
verifiedBy: nobody yet, one pass by the session that ran the probes
doctor: not run in this session; the checklist row was ok at session start
---

# Run report: MODELS-VERIFY on Claude Code

- **Harness:** Claude Code (desktop app, Code tab), started as a side session of the Phase A parent session
- **Machine:** the Windows PC (`tjakoens-windows-pc`)
- **Repository:** tjakoen.github.io, branch `main`
- **Date:** 2026-11-22
- **Model the session ran as:** `claude-opus-5-5`
- **Prompt followed:** [MODELS-VERIFY](../../standards/MODELS-VERIFY.md), steps 1 to 6 and 8. Step 7 applies to Codex only.

## Results

| Check | Level | Result | Evidence |
|---|---|---|---|
| `registry.valid` | verified by test | PASS | verifier line |
| `pins.match` | verified by test | PASS | verifier line |
| `ids.verified` | configured | PASS | verifier line; every Claude id is already verified |
| `live.match` | configured | PASS | verifier line |
| `hooks.wired` | configured | PASS | verifier line |
| `envelope.denies` | mechanically enforced | PASS | verifier line |
| `context.cached` | verified by test | PASS | verifier line |
| `escalation.delegates` | verified by test | PASS | verifier line |
| `escalation.gated` | configured | PASS | verifier line |
| `later.*` (six checks) | unsupported | NOT TESTED | a later phase, by design |
| Model probe | assisted | **FAIL** | The session ran as `claude-opus-5-5`; the registry's main tier is execution, which is `sonnet` on Claude Code. See below. |
| Envelope probe | assisted | PASS | A general-purpose spawn with no headings was refused by `spawn-envelope.sh`, naming Lane, Scope cap, Hard stops and Ask-triggers. The agent never ran. |
| Delegation probe | assisted | PASS | The planner answered the tier question and reported `claude-opus-5-5`, the strong tier. |
| Freshness probe | assisted | PASS | Canary `9b2357f11204e722` came from `openssl rand -hex 8` and was written in the parent's visible reply. The goldfish was a new agent, not a fork, and its brief did not carry the token. It quoted one 16-hex string, `57c22b24fce58967`, from the scratchpad path, and not the canary. |
| Human-lane probe | assisted | PASS | An Edit to `~/.claude/settings.json` was blocked by `human-lane.sh` with the rule for the permission surface. The file's sha256 prefix was `4d9a37e3a725cbc8` before and after. |

The verifier, verbatim (`bun "$HOME/.claude/tools/mil-verify.ts" --harness claude`, exit 0), with the six later-phase lines folded:

```
registry.valid        verified by test        PASS
pins.match            verified by test        PASS
ids.verified          configured              PASS
live.match            configured              PASS
hooks.wired           configured              PASS
envelope.denies       mechanically enforced   PASS
context.cached        verified by test        PASS
escalation.delegates  verified by test        PASS
escalation.gated      configured              PASS
later.fallback, later.escalation-records, later.context-budgeting,
later.recovery, later.goldfish-freshness, later.model-scout
                      unsupported             NOT TESTED
```

## The model probe

The machine's configuration is right: `live.match` passes, and the live settings name `sonnet[1m]`.
This session still ran on Opus, because it was started from another session through the desktop
app's session tool, and the model it ran as was set by that start rather than by the settings
default. The probe exists to catch exactly that gap, a session whose model the registry never saw,
so it is recorded as FAIL rather than explained away. A session opened fresh by the owner, with no
model override, is the clean rerun.

## Did not pass

- Model probe: FAIL, for the reason above.
