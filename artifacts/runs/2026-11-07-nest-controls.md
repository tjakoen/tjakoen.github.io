---
title: Moving the Nest unlock to the terminal and giving each tool a cursor
date: 2026-11-07
status: complete
lane: gated
branch: codex/nest-terminal-controls
scope: [scripts, content/notes/the-site-has-ants.md, content/tours/review-nest-controls.md, plans/ant-nest-game.md, e2e/terminal.e2e.ts, artifacts/runs]
touched:
  - scripts/desk-commands.js
  - scripts/page-islands.js
  - scripts/nest-mockup.js
  - content/notes/the-site-has-ants.md
  - content/tours/review-nest-controls.md
  - plans/ant-nest-game.md
  - e2e/terminal.e2e.ts
  - artifacts/runs/2026-11-07-nest-controls.md
diffstat: eight files including the review tour and this run report
unpushed: 0 | the patch is left in the working tree for review
verifiedBy: independent Codex pass on the gameplay and unlock diff, followed by browser checks of the corrections
doctor: 23 checks, 0 failing, 2 due | the context budget and mounted Loop skill remain due
---

The scope covers the Nest launcher, the game controls, the trail response, and the copy that teaches those controls. The terminal command keeps the status bar ant as the launcher. Squash and Wipe Trail intercept page links. Use Page Links hands the page back and follows the colony through navigation.

The independent pass found that ants could intercept a wipe gesture and that a letter in flight could outlive the colony that dropped it. Ant buttons now yield to the trail while wiping. Closing the game cancels the return animations and restores their letters.

## Gate output

The typecheck and the focused browser run passed. A separate Chromium check wiped a live trail, observed ant movement, then closed the colony.

```text
$ tsc --noEmit
2 passed (45.4s)
Browser check passed: terminal unlock, control rendering, trail wipe, ant movement, and close.
```

The first Bun run passed. The next run hit ten timeouts and found the missing review prefix in the tour title. After correcting the title, all 875 tests passed again. The full browser run was interrupted after failures outside the Nest tests.

```text
875 pass
0 fail
3732 expect() calls
Ran 875 tests across 48 files. [72.25s]

13 failed
4 interrupted
291 did not run
191 passed (15.1m)
```

The advisory lint gate still finds five categories above the committed baseline. Comparing the Nest module with its parent version shows the patch removes a lint diagnostic and adds none. PANTRY also flagged the context budget, the mounted Loop skill, and the run ledger cadence. The run leaves the existing local Claude settings file alone.

The follow-up gives mini hills a smaller footprint and lets builders use gaps left by stolen letters. The browser check staged missing letters in a 506-pixel pane on the real note, grew a mini hill, and exercised Restore Page and pane resizing. Independent review also caught a builder that bait could strand, and construction that could survive an invalidating resize. Bait now leaves builders working, and a resize that takes away their spot cancels construction and keeps the stores.

```text
875 pass
0 fail
3732 expect() calls
Ran 875 tests across 48 files. [17.89s]

2 passed (2.4s)
499 passed (6.2m)

Bait leaves the builder working. Resize cancels a construction site that no longer fits and keeps its stores.
Open ground still works. Restore preserves its hills, and shrinking the pane leaves only hills that fit.
A compact hill grew in stolen text and cleared when the letters returned.

lint gate: 4 lint(s) regressed against tools/lint-baseline.json:
  oxlint:eslint(no-unused-expressions): baseline 0 -> now 4 (+4)
  oxlint:eslint(no-shadow): baseline 0 -> now 4 (+4)
  oxlint:unicorn(prefer-add-event-listener): baseline 1 -> now 3 (+2)
  oxlint:unicorn(no-array-reverse): baseline 1 -> now 2 (+1)
```

## What was not done

The full browser suite passed on the follow-up. The patch is local. The phone layout hides the terminal and status bar, so the launch flow requires the desktop layout.

## What needs human eyes

Try Wipe Trail with two trails active and watch how the scattered ants choose a route. Check that each icon reads quickly when you hover it.

[Walk the review tour](http://localhost:3183/notes/the-site-has-ants?crumb=review-nest-controls&crumb-mode=dev&crumb-frame)
