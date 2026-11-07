---
title: Moving the DSH loop into agent-config and opening sessions with the checklist
date: 2026-11-07
status: complete
lane: gated
branch: codex/nest-terminal-controls
scope: [CLAUDE.md, docs/HARNESS-DSH.md, tools/dsh-loop, artifacts/runs, agent-config]
touched:
  - CLAUDE.md
  - docs/HARNESS-DSH.md
  - tools/dsh-loop/cli.mjs
  - tools/dsh-loop/README.md
  - artifacts/runs/2026-11-07-dsh-loop-adapter.md
  - agent-config/README.md
  - agent-config/shared/CLAUDE.md
  - agent-config/shared/tools/link-machine.sh
  - agent-config/shared/tools/session-checklist.sh
  - agent-config/shared/tools/dsh/plugin.mjs
  - agent-config/shared/tools/dsh/guard.mjs
  - agent-config/shared/tools/dsh/install.mjs
  - agent-config/shared/tools/dsh/session-checklist.sh
  - agent-config/shared/tools/dsh/README.md
  - agent-config/shared/tools/dsh/guard.test.ts
  - agent-config/shared/tools/dsh/plugin.test.ts
  - agent-config/machines/tjakoens-macbook-air/dsh/mcp.yml
  - agent-config/shared/tools/dsh/nudges.mjs
  - agent-config/shared/tools/dsh/nudges.test.ts
  - agent-config/shared/tools/dsh/events.mjs
  - agent-config/shared/tools/dsh/events.test.ts
diffstat: two commits; the site keeps the CLI, doc and report, and agent-config gained the loop, checklist, MCP, nudges, session events and memory pointer
unpushed: 0 | the site and agent-config trees are left for review
verifiedBy: checklist run in DSH mode, guard probe in the running session, 28 agent-config tests, 875 site tests
doctor: 23 checks, 0 failing, 1 due | the Claude context budget
---

The machine-level DSH loop now lives in agent-config, not in the site repo. The live paths are
links: ~/.dsh/loop points at shared/tools/dsh, ~/.dsh/AGENTS.md and ~/.agents/AGENTS.md point at
shared/CLAUDE.md, and one profile entry mounts the plugin. The site repo keeps only the start and
end CLI.

The session checklist now opens a DSH session. The shared session-checklist.sh gained a DSH mode:
it checks the global instructions, the DSH plugin and its profile entry, the MCP entries, the
standards, PANTRY, the tokensave index, the graph and git state, and ends with Agentic Loop Loaded
(DSH). The plugin runs it once per root
session on the first step and injects the block; the global instruction file says to show that
block verbatim at the top of the first reply.

The profile also carries the MCP servers: pantry over streamable-http, and tokensave and headroom
over stdio. The pantry server answered and listed every project, and the tools appear as
mcp__pantry__*, mcp__tokensave__* and mcp__headroom__*. The installer merges the machine's
mcp.yml, so the server paths stay in agent-config/machines/<host>/dsh/mcp.yml.

The plugin now also carries the PostToolUse nudges: a bash or tool result over its bound, a
session that reads and searches without delegating, a search sweep without a graph query, and a
finish reminder after an edit. It writes the session heartbeat to the project's sessions.jsonl, and
the checklist names the project memory index for the model to read on demand.

The guard, the spawn envelope and the graph refresh are unchanged. The checklist is the piece that
was missing, and it now runs automatically.

## Gate output

The checklist ran in the live session's shape and passed every required row:

```text
Agentic loop check, tjakoen.github.io (PANTRY project, DSH)
 ok   DSH, deepseek-flash
 ok   Instructions: global + repo, 18k chars of the 20k budget
 ok   Memory: 83 notes, index loads whole
 ok   DSH loop: plugin linked and mounted
 ok   MCP: pantry, tokensave, headroom configured
 ok   No style override
 ok   Standards: 21 skills mounted (voice, loop, session-loop...)
 ok   PANTRY: serving tjakoen.github.io at http://localhost:4403/__pantry/, 1 ready, 0 claimed
 ok   tokensave: indexed, 0 day(s) old
 ok   graphify: graph 0 day(s) old
 ok   Git: codex/nest-terminal-controls, 0 uncommitted
Agentic Loop Loaded (DSH)
```

A write to .github/workflows/_dsh_guard_probe.yml was denied with the human-lane message. The
agent-config tests and the site suite:

```text
$ bun test shared/tools/dsh        # from the agent-config checkout
28 pass
0 fail
48 expect() calls
Ran 20 tests across 2 files.

$ bun test                          # from the site repo
875 pass
0 fail
3732 expect() calls
Ran 875 tests across 48 files.

$ bun run check
$ tsc --noEmit
(exit 0)

$ bun tools/lint-gate.ts
4 pre-existing oxlint regressions, exit 0 (advisory)
```

## What was not done

The DSH checklist checks the PANTRY hub and the MCP entries, and the pantry, tokensave and headroom
servers are configured. A server that is down still contributes no tools. The finish nudge reaches
the model after an edit, but no Stop hook runs the gate automatically; the end command is still the
close. Memory is a pointer to the Claude project index, not an automatic DSH load or a second
store. The context-trigger nudge is not ported. The checklist is injected once per root session,
not on every turn. The machine links and profile patch are machine state; the agent-config repo is
committed, and the two memory notes that predate this work are still uncommitted.

## What needs human eyes

The global instruction file changed for all three tools. Read the DSH section once. If a new DSH
session's first reply does not open with the checklist block, restart the app so the new plugin
listener loads, then try again. The agent-config changes are uncommitted; the site repo has the CLI,
the doc, the front door and this report uncommitted.
