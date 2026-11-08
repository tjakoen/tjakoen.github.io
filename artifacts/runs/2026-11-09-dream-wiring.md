---
title: The dream joins the close path, in all three harnesses
date: 2026-11-09
status: complete
lane: gated
branch: main
scope: [tools, plans, standards, artifacts]
touched:
  - tools/dream.ts
  - tools/dream.test.ts
  - tools/dsh-loop/close.ts
  - plans/memory-dream.md
  - plans/memory-dream-notes.md
  - standards/SESSION-LOOP.md
  - artifacts/runs/2026-11-09-dream-wiring.md
diffstat: 6 files changed, 289 insertions(+), 8 deletions(-), this report not counted
unpushed: 2, this turn's wiring commit and the threshold fix, left for the owner to push
verifiedBy: 950 portfolio tests, 185 agent-config tests, the typecheck, the lint gate at 4483, four hand-run gate cases, and both harness paths exercised
doctor: not re-run; the context row was already carried forward by the previous report
---

## What was asked

Close what was open, and make the dream fit the loop so it works in Claude Code and Codex, not only
in DSH.

## What was open

Three things. The dream had no trigger, so it ran only when someone remembered it. The plan's second
dream, the one allowed to touch the notes, was a task without a home. And the prior report had left
the store's contradictions named but unfixed.

## What was built

`bun run dream due` answers one question: has enough landed since the memory index was written to be
worth reading back. It compares the index's own modification time against the run reports and the
session logs, so **the index is its own marker** and there is no second file to keep in step. It is due
at eight pieces of new work, or at thirty days with at least one new piece. Two environment overrides
exist for ops and for tests, and zero is a real threshold rather than a missing value, which was a bug
on the first attempt and now has a test.

## How it fires in the three harnesses

- **Claude Code and Codex** both run `finish-gate.sh stop` at their Stop event, from the same shared
  script in `agent-config`, and both already have it in `expected-hooks.txt`. The gate now asks the
  project's own tool whether the store is due and, if it is, the dream becomes an item in the one block
  the gate emits. No hook was registered, because the hook already existed.
- **DSH** never runs that script. Its stop hook builds the checkpoint from `close --json`, so the dream
  is a fact there and `stop.mjs` prints it beside the report and the push state.
- **Any other harness** gets nothing until it runs one of those two paths, which is the same bar every
  other gate in this estate sets.

The dream is never started unasked: the block says it is a judgment pass, and the session puts it to
the owner. If the answer is not now, the session records that in its recap and the question returns at
the next close, because a store that is due stays due until it is dreamed. That is the heartbeat
working, not a loop.

## Evidence, by hand

Four cases, all run against the real gate script:

```text
1. dirty tree, store not due   -> block, one item: 1 uncommitted path
2. dirty tree, store forced due -> block, two items: uncommitted path, then the dream line
3. clean tree, store not due    -> no output, exit 0
4. clean tree, store due        -> block, dream only, with the put-it-to-the-owner paragraph
```

The fourth case needed a store older than the threshold, so it ran in a throwaway repository at
`/tmp/dream-gate-test` under a temporary `HOME`, with the index dated forty days back. That test caught
the real defect in this turn: the first version read the project from the module's real path, which on
macOS is `/private/tmp/...`, while the store is named after the path the session was opened in. The
tool now walks up from the working directory to the folder holding `tools/dream.ts`, so both agree.

## What closed

- `plans/memory-dream.md` is done. The wiring task is checked, with the reason each path was chosen.
- The second dream moved to `plans/memory-dream-notes.md`, which carries the 35 queued facts and the
  three cross-note contradictions as its tasks. The queue no longer depends on a session remembering
  it.
- SESSION-LOOP section 4 now names the dream as the store's maintenance step, and the mounted
  `session-loop` skill was re-synced from the canon, so a Claude or Codex session reads the same rule
  a DSH session does.

## Gate output

```text
### bun run check
$ tsc --noEmit
### bun test
 950 pass
 0 fail
 3996 expect() calls
Ran 950 tests across 50 files. [6.52s]
### bun tools/lint-gate.ts
lint gate: level. 4483 flag(s) total (oxlint + voice-lint), matching or under the 4483 in
tools/lint-baseline.json (generated 2026-11-08).
### agent-config bun test shared/tools/
 185 pass
 0 fail
 479 expect() calls
Ran 185 tests across 12 files. [23.19s]
```

## What the gate did not cover

No hook was fired end to end inside a real Claude or Codex session; the gate was called with the same
payload shape those hooks pass, which is what its own tests do too. The DSH side was exercised through
`close --json` and through the stop module's tests, not by closing a DSH turn.

## Not done, and what needs human eyes

- The notes are untouched. Three contradictions are named in `plans/memory-dream-notes.md` and none
  are fixed, because settling them needs a measurement rather than a reading.
- The doctor's context row still warns at 28,834 characters across four files. The index is no longer
  the largest; the repo front door is, and trimming it is its own piece of work.
- Two repositories carry commits here, the portfolio and `agent-config`, and neither is pushed yet.
