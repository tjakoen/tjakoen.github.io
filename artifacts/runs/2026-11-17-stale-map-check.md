---
title: Say when the map is older than the ground
date: 2026-11-17
status: complete
lane: gated
branch: claude/ai-workflow-staleness-check
scope:
  - tools/map-freshness.ts
  - tools/map-freshness.test.ts
  - tools/dsh-loop/cli.mjs
  - .claude/settings.json
  - .claude/hooks/map-freshness.sh
  - docs/HARNESS-DSH.md
  - tools/dsh-loop/README.md
  - CLAUDE.md
touched:
  - plans/stale-map-check.md
  - tools/map-freshness.ts
  - tools/map-freshness.test.ts
  - tools/dsh-loop/cli.mjs
  - tools/dsh-loop/README.md
  - .claude/settings.json
  - .claude/hooks/map-freshness.sh
  - docs/HARNESS-DSH.md
  - CLAUDE.md
  - artifacts/runs/2026-11-17-stale-map-check.md
plans: stale-map-check
consulted:
  - CLAUDE.md
  - VOICE.md
gates:
  - bun install --frozen-lockfile
  - bun run check
  - bun test
  - bun tools/lint-gate.ts
  - bun tools/voice-lint.ts on the four prose files touched
  - bunx playwright test --ignore-snapshots (could not launch a browser here, see below)
unpushed: 0
verifiedBy: The new suite, plus an end-to-end run in a scratch copy of the repo with all 21 standards mounted by an emulated sync, before and after an edit to VOICE.md and src/server.ts.
---

# Say when the map is older than the ground

An agent here navigates by two derived maps: the skills under .claude/skills, generated from
standards/ by the pantry sync, and the code graph under graphify-out. Nothing at session start said
when either had fallen behind its source. The start command printed the graph's age in minutes,
which is the wrong question, and the stale voice skill on 11 November was found by diffing by hand.

tools/map-freshness.ts now answers it. Skills are compared by content: a hash of each mounted
skill's body and description against the standard's body and when line, with whitespace normalized
so a refolded when line is not a false alarm. The slug follows the skill key, else the lowercased
filename. The graph is compared by mtime against the newest tracked or untracked code file, because
this repo cannot read per-file hashes out of graphify's output; the line says "by mtime" so nobody
mistakes it for more. A missing mount or a missing graph is a skip, not a warning.

The standards index the sibling session is adding plugs in through derivedFile: a path and a
function that builds the expected bytes in memory. Registering it is one entry in ARTIFACTS once its
generator can be imported. The plan names this, and a test exercises the extension point both ways.

It runs in three places. bun tools/dsh-loop/cli.mjs start prints the freshness lines after the graph
age. A second SessionStart entry in .claude/settings.json runs .claude/hooks/map-freshness.sh, which
prints only when something is behind and exits silently without bun. By hand, the tool takes --json
and --strict.

## What was not done

- The check was not run against a real pantry sync. This container has no pantry checkout, so the
  end-to-end run used a stand-in sync written from the rules in plans/skills-runtime.md: name,
  JSON-encoded description, body unchanged. If the real sync differs in a way whitespace
  normalization does not absorb, every skill will read stale on the first run on the owner's
  machine, which is loud rather than quiet, and the fix is in bodyOf.
- The standards index is not registered, because it does not exist on this branch yet.
- The Playwright suite did not run. The project pins a Playwright build whose browser is not in this
  container, and every test failed at browser launch. No rendered surface changed.

## What needs human eyes

- The first session start on the owner's machine, to confirm the skills line reads ok after a fresh
  sync rather than 21 stale.
- Whether the machine-level session-doctor in agent-config should call this tool too. It lives in a
  private repo outside this session's scope.

## Gate output

```text
$ bun install --frozen-lockfile
Checked 139 installs across 156 packages (no changes) [6.00ms]

$ bun run check
$ tsc --noEmit

$ bun test tools/map-freshness.test.ts
 11 pass
 0 fail
 32 expect() calls
Ran 11 tests across 1 file. [266.00ms]

$ bun test
 996 pass
 1 fail
 4655 expect() calls
Ran 997 tests across 56 files. [7.49s]
(fail) retrieval scenario evals (real corpus) > "What can the desk assistant do?" grounds on facts
  The same test fails on the base commit with these changes stashed (10 pass, 1 fail in that file).

$ bun tools/lint-gate.ts
lint gate: 2 lint(s) regressed against tools/lint-baseline.json:
  voice:emoji: baseline 73 -> now 94 (+21)
  oxlint:eslint(no-shadow): baseline 0 -> now 3 (+3)
  Identical output on the base commit with these changes stashed. The new files add no flags.

$ bun tools/voice-lint.ts plans/stale-map-check.md docs/HARNESS-DSH.md CLAUDE.md tools/dsh-loop/README.md
voice-lint: 34 flag(s) across 4 file(s) (33 tell, 1 warn).
  34 before these edits as well, all in the existing CLAUDE.md code spans.

$ bunx playwright test --ignore-snapshots --trace off
Error: browserType.launch: Executable doesn't exist at /opt/pw-browsers/chromium_headless_shell-1234/...
  2 passed (2.3m); the rest failed at browser launch.
```

## The end-to-end run

```text
== after sync
freshness: skills ok, 21 match their source
freshness: graph ok, newer than every code file (newest sync.ts, by mtime)
== hook (silent expected):
[end]
== after editing VOICE.md and src/server.ts
freshness: WARNING skills: 1 of 21 behind their source: voice (stale)
  voice: standards/VOICE.md body changed since the sync
  fix: bun cli.ts skills sync ../tjakoen.github.io (from the pantry repo)
freshness: WARNING graph: 1 of 1 behind their source: graphify-out/graph.json (stale)
  graphify-out/graph.json: src/server.ts changed 0 minutes after the graph was built (by mtime)
  fix: graphify update .
strict exit: 1
```

In this checkout, with nothing mounted:

```text
$ bun tools/dsh-loop/cli.mjs start
DSH loop start: /home/user/tjakoen.github.io
doctor: not run (no ~/.claude/tools/session-doctor.sh)
skills: no .claude/skills; run the pantry sync first
graph: no graphify-out/graph.json
freshness: skills skipped, no mounted skills (a cloud or unsynced checkout)
freshness: graph skipped, no graph built in this checkout
end: bun tools/dsh-loop/cli.mjs end
```
