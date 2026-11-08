---
title: The context budget now counts what a repo can move
date: 2026-11-09
status: complete
lane: gated
branch: main
scope: [docs, artifacts]
touched:
  - CLAUDE.md
  - artifacts/runs/2026-11-09-budget-scope.md
diffstat: 1 file changed, 53 insertions(+), 72 deletions(-), this report not counted
unpushed: 2 here and 1 in pantry, left for the owner to push
verifiedBy: 950 portfolio tests, 841 pantry tests, the typecheck, the lint gate under its baseline at 4480, and the doctor row before and after
doctor: 23 checks, the context row now inside the budget at 16,483 of 20,000, and the machine share named but not counted
---

## What was asked

After the dream closed, two things were still open. The three note-level contradictions, settled
earlier today in their own commit. And the doctor's context row, which stayed red however well the
index was maintained.

## Why the row could not be fixed by trimming

The row summed four files: the repo front door, the memory index, the machine front door and the
machine's import. The last two are 10,272 characters on every repository on this machine, so the two
files a repo can actually act on were 18,562 against a 20,000 budget. Trimming the front door to
nothing would still have read as over. The budget was measuring a constant and blaming the repo for it.

## The change

PANTRY's context check now budgets the two sources a repo can move, its own front door and the memory
index, and reports the machine share beside the number without counting it. The warning line says so
in as many words, because a message that hides a third of the cost would be the same bug in the other
direction. `context.ts` carries the reason next to the constant. Two tests pin it: a 40,000 character
machine front door leaves a small repo inside the budget, and a machine front door over a repo with no
front door of its own reads as info rather than a warn about nothing.

## The trim

`CLAUDE.md` went from 10,049 characters to 7,976. Nothing was dropped: the reading-order list keeps
all ten entries and every rule, with the explanations that each linked document already owns cut back
to the clause that decides whether to open it. The published URLs went too, because the skills line
already says a standard is mounted and the standards index carries every address. The Nimbalyst
paragraph keeps the three properties that change how work is done here and points at the plan that
holds the rest.

## Before and after

```text
before  [warn] Claude Code context: 28,834 chars over 4 files, over the 20,000 budget — CLAUDE.md is 10,066 of it
after   [ok  ] Claude Code context: 16,483 chars over 2 files this repo pays (its front door and the memory index),
               inside the 20,000 budget — MEMORY.md is 8,496 of it; the machine front door adds 10,272 and is
               not counted, because no repo can move it
```

The checklist row that opens every session moved with it, from `warn Instructions: global + repo, 20k
chars of the 20k budget` to `ok Instructions: global + repo, 18k chars of the 20k budget`.

Two things worth noticing in the after line. The memory index is now the largest file the repo pays
for, which is the one the dream maintains, so the next growth is the dream's business. And the
machine share is still on the page, so nobody reads 16,483 as the whole cost of a cold start.

## Gate output

```text
### bun test (portfolio)
 950 pass
 0 fail
 3996 expect() calls
Ran 950 tests across 50 files. [5.73s]
### bun run check
$ tsc --noEmit
### bun tools/lint-gate.ts
lint gate: level. 4480 flag(s) total (oxlint + voice-lint), matching or under the 4483 in
tools/lint-baseline.json (generated 2026-11-08).
### bun test (pantry)
 841 pass
 0 fail
 2183 expect() calls
Ran 841 tests across 35 files. [9.21s]
```

## What the gate did not cover

The doctor was run by hand in this repo before and after, and in both cases the machine share came
from the real `~/.claude`. No other repository was measured, so the first session in another repo is
where the new message meets a different shape of front door.

## Not done, and what needs human eyes

- Nothing in this scope. The 35 queued facts and the fold clusters in
  `plans/memory-dream-notes.md` remain, and they are the store's next pass rather than this one.
- The pantry change is committed in its own repository. It is not pushed, and neither is this.
