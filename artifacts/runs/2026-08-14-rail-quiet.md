---
title: The rail goes quiet, and a gate I am not going to tune
date: 2026-08-14
status: complete
lane: gated
branch: main
scope:
  - view/pages/builder.html
  - view/components/pages/builder
  - src/ai
  - src/server.ts
  - e2e
  - artifacts/runs
touched:
  - view/components/pages/builder/builder.css
  - view/pages/builder.html
  - src/ai/builder-canvas.ts
  - src/server.ts
  - e2e/builder-canvas.e2e.ts
skills:
  - loop-standard
  - voice
plans:
  - builder-design, the rail pass | plans/builder-design.md
gates:
  - bunx tsc --noEmit | exit 0, no output
  - bun test | 504 pass, 0 fail, 31 files
  - bunx playwright test (full) | 278 passed, 1 skipped, 1 FAILED (visual/catalog, see below)
  - bun tools/lint-gate.ts | net ZERO on this diff, measured against a stash
diffstat: 5 files changed, one commit, 4561a9d
unpushed: 55 | portfolio 55, grain 15. Both held; pushing stays the owner's call and was not taken.
verifiedBy: nobody yet. No new tour: this changes the weight and the width of a surface two existing tours already step through, and a fourth tour for a restyle would be noise. The rail steps in review-builder-workbench and review-block-verbs both still resolve.
doctor: four flags due, carried by name below, none fixed.
---

# The rail goes quiet, and a gate I am not going to tune

The owner's read: the blocks panel should be simplified and collapsible. Both done.

## Simplified by weight, not by hiding

Seven hit targets per row in a 20rem column, every one of them bordered or arrowed, made a wall of
boxes. The fix keeps all seven present, clickable, tabbable and testable, and makes six of them stop
shouting. The chips lose their borders, because the border was never the information: which span is
ON is, and that now reads as ink, weight and an underline, the same status-is-not-a-hue rule the rest
of this estate follows. The row lifts together on `:hover` and on `:focus-within`, so a keyboard gets
what a mouse gets.

**What was deliberately NOT done: hiding controls until hover.** It reads as tidy and it costs a
touch user the control outright. An e2e case asserts all six ops are visible without hovering.

## Collapsible, and the head becomes the rail

Collapsed it is 40px tall and 168px wide, still showing the block count, so you never lose track of
what is on the page. The canvas takes the width back: the stage goes from 784px to 951px and each
half-span block from 368px to 451px, measured. The attribute lands on the workbench rather than the
rail, because collapsing is a layout change and the grid owns layout, which is the shape the shell's
own aside and console toggles already use. Remembered in `sessionStorage`: a preference expressed by
pressing a button should survive a rebuild of the page and not outlive the visit.

## A dev-loop defect that cost a debugging round

The module server caches every transpile, and only grain's `ai/` directory was watched. Editing one
of the portfolio's own browser modules left the page running the previous build until someone
restarted the server, so a correct change read as a dead control. `watchComponents` cannot cover it,
because it ignores anything that is not `.html`, `.css` or `.md`. `src/` now has its own watcher.

The failure is the bad kind: the code is right, the browser is running last week's, and nothing says
so. Worth knowing before the next person loses the same twenty minutes.

## The gate I am not going to tune

`e2e/visual.e2e.ts` catalog fails in the FULL suite and passes alone. Measured rather than assumed,
per the standing rule about blaming a red gate:

- At HEAD with this session's work stashed, alone: passes.
- With this session's work, alone: passes.
- With this session's work, full suite: fails, twice, on separate runs.
- The failure is `Timeout 5000ms exceeded` with **no pixel diff reported**, so it is not a visual
  regression. The catalog is the heaviest page in the suite and this diff added fifteen tests to the
  parallel load.

Raising that timeout would be tuning a gate until it passes, which is the owner's call rather than a
session's. Filed rather than retried, and filed rather than fixed.

## The answer channel swallowed a third round

The owner answered all three review tours. `pantry answers list` reports "Nothing unread" with a
newest entry of 2026-08-13, and `plans/decisions/answers.jsonl` contains none of the three tour ids.
That is the third time answers have not landed. A review channel that silently drops an answer is
worse than no channel, because the session waits on something that already happened.

## Gate output

```
$ bunx tsc --noEmit
(no output, exit 0)

$ bun test
 504 pass  0 fail            Ran 504 tests across 31 files.

$ bunx playwright test
  1 failed
    e2e/visual.e2e.ts:53:3 › catalog (/catalog) matches its visual baseline
  1 skipped
  278 passed (3.1m)

$ bunx playwright test visual -g catalog        # the same spec, alone
  1 passed (12.1s)

$ bun tools/lint-gate.ts
  four lints above baseline, all four pre-existing, measured against a stash
```

## Session doctor flags, carried by name

Four due, none fixed, the same four as the last five runs. `graphify freshness`. `layer pins
current`, one behind on purpose while grain 0.1.22 is held. `run ledger`, older reports from sessions
that are gone. `unpushed work`, now 55 in the portfolio and 15 in grain, both held on the owner's
standing call.

## What was not done

Gathered on 2026-08-15 by a later session clearing the run ledger. Every item below was already
stated somewhere above; the section is the part this report was missing, and nothing here is new.

1. **Hiding the rail's controls until hover.** It reads as tidy and it costs a touch user the control
   outright, so all six ops stay visible and an e2e case asserts it.
2. **Tuning the catalog visual spec's timeout.** It fails under full-suite load and passes alone,
   with no pixel diff. Raising a timeout until a gate goes green is the owner's call rather than a
   session's, so it was filed instead of retried and instead of fixed.
3. **A fourth review tour.** This run changed the weight and the width of a surface that two existing
   tours already step through, and both of those steps still resolve.
4. **Pushing, and publishing.** Fifty-five portfolio commits and fifteen in grain were left held on
   the owner's standing call.
5. **Fixing any of the four due doctor flags.** They are carried by name above rather than closed.
6. **Repairing the answer channel.** Three rounds of tour answers not reaching the log is reported
   here and nothing was changed to stop the fourth.

## What needs human eyes

1. **The catalog visual spec's 5s timeout under full-suite load.** Raise it, or accept a suite that
   is red on one spec until the load drops.
2. **The answer channel.** Three rounds of tour answers have not reached the log.
3. **Push, and publish.** 55 portfolio commits, 15 grain, and grain 0.1.22 still unpublished.
