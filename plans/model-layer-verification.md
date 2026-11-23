---
id: model-layer-verification
status: todo
track: ""
depends: []
touches: [shared/tools/mil-verify.ts, shared/tools/mil-watch.ts, shared/tools/mil-probe.ts]
owner: human
---

# Model Intelligence Layer — what is not yet proven

**Status:** TODO. Everything mechanically closeable is closed. What remains needs an event, an
external fix, or a decision, and none of it can be produced honestly on demand.

## Open on OpenCode (this Mac)

| Row | Closes when | Who |
| --- | --- | --- |
| `opencode.main-failover` | a real main-session quota transition appears in the ledger. `mil-watch` now writes the receipt itself at session start. | nobody, it closes itself |
| `ids.verified.gpt-6.2-sol` | a child lands on Sol, which needs free, Go and Luna all answered first. | nobody, it needs the event |
| `goldfish.fresh` | a canary run from a repository cleared for non-private models. | a session, in pantry |
| `ids.verified.main` | both `openai/gpt-6.2-sol` and `opencode/deepseek-v4.1-flash-free` observed in the main chain. | same event as the Sol row |

## Open on Codex

| Row | Closes when | Who |
| --- | --- | --- |
| `runtime.planner`, `runtime.goldfish`, `goldfish.fresh` | the app can spawn a custom agent type. It lists them in `spawn_agent`'s own description and refuses them all, including `implementer` at the session's own effort. | Codex |
| `ids.verified.strong` | a medium-effort session, which `model-guard` refuses because the main pin is `execution` low. | decision |
| `envelope.denies` | never, as built: `spawn_agent` marks `message` encrypted, so no envelope can be read. | closed as unenforceable |

Evidence and the full trace: `artifacts/runs/2026-11-24-codex-role-spawn-blocked.md` in claude-config.

## The one decision

Should a registry role's own pin be sanctioned when spawning, so `planner` may run at medium from a
low session? Yes opens Codex's strong tier and the planner probe. No leaves both NOT TESTED for good.

## How you find out

Nothing here needs a reminder. Every session start runs `mil-verify` for its harness and `mil-watch`,
which reports unverified routes, new retry candidates and main-session recoveries. The
`opencode.main-failover` row closes itself; the rest appear as NOT TESTED until something real happens.
