---
title: Watch the colony before picking up a tool
date: 2026-11-10
status: complete
lane: gated
branch: perf/nest-lazy-load
scope:
  - content/notes/the-site-has-ants.md
  - e2e/nest-gameplay.e2e.ts
  - scripts/figure-nest.js
  - scripts/nest-assets.js
  - scripts/nest-game.js
  - scripts/nest-simulation.test.js
  - view/components/molecules/live-figure/live-figure.css
  - artifacts/runs/2026-11-10-nest-play-and-note-polish.md
touched:
  - content/notes/the-site-has-ants.md
  - e2e/nest-gameplay.e2e.ts
  - scripts/figure-nest.js
  - scripts/nest-assets.js
  - scripts/nest-game.js
  - scripts/nest-simulation.test.js
  - view/components/molecules/live-figure/live-figure.css
  - artifacts/runs/2026-11-10-nest-play-and-note-polish.md
plans: none. This was direct work requested in chat.
gates:
  - bun install --frozen-lockfile
  - bun run check
  - bun tools/lint-gate.ts
  - bun test
  - Playwright game and note regressions
diffstat: 109 insertions and 97 deletions across seven source and test files, plus this report.
unpushed: 87 | the branch has no upstream and remains local at the owner's instruction.
verifiedBy: independent read-only review by verify_nest and an author-led browser pass.
doctor: 23 checks, 0 failing, 3 due. The worktree findings and the canonical checkout's run ledger are named below.
---

# Watch the colony before picking up a tool

The first screen asks visitors to watch one scout find a letter and see what the workers do with its trail. The sidebar now leaves room for that instruction, keeps the Links state readable and points to the field notes. The note gives the reader one experiment to try with Wipe and explains how the live boxes replay particular events using the game's rules.

The game and the figures use one sprite definition for each caste. Soldiers and rival guards have matching geometry, and the rivals keep their red tint in a fight. The figures use one centered SVG per ant. The fight gives the opposing groups three spaced lanes along the curve and preserves those positions through the clash. The figure clock ignores a negative first frame delta, which could otherwise send an actor already at its target to an invalid position.

The queen's first egg now waits for six seconds of active time. Speed changes affect the movement step, and pausing stops the egg clock. At the population cap, a missing spare worker delays a replacement soldier without skipping the rest of the simulation frame or starting its cooldown early.

## Gate output

```text
$ bun install --frozen-lockfile
bun install v1.3.14 (0d9b296a)
Checked 139 installs across 155 packages (no changes) [87.00ms]

$ bun run check
$ tsc --noEmit

$ bun tools/lint-gate.ts
lint gate: level. 4486 flag(s) total (oxlint + voice-lint), matching or under the 4486 in tools/lint-baseline.json (generated 2026-11-09).

$ bun test
 905 pass
 0 fail
 3954 expect() calls
Ran 905 tests across 51 files. [5.58s]

$ PORT=3136 bunx playwright test e2e/nest-gameplay.e2e.ts e2e/nest-behavior.e2e.ts e2e/nest-scenarios.e2e.ts --workers=2
  33 passed (1.5m)

$ PORT=3184 bunx playwright test e2e/terminal.e2e.ts --grep 'note mounts its six live colony boxes|note has a separate self-running colony|Nest tools lock links' --workers=1
  3 passed (1.5m)

$ PORT=3184 bunx playwright test e2e/nest-gameplay.e2e.ts --grep 'first egg' --workers=1
  1 passed (4.0s)

$ bun ../pantry/cli.ts doctor .
23 checks, 0 failing, 3 due
```

The six event boxes completed two cycles in the browser. The cutaway completed two cycles with the queen at home. The game suite covered foraging, mounds, combat and the rival milestones. An earlier combined browser run reported a builder timing failure, a trail timing failure and stalled note figures. The separate game suite passed after the opening egg returned to its original six-second pace at every speed. The separate note suite passed after the frame clock guard went in.

A live home-page run at 4× used the ordinary speed control. It delivered letters, built two mini mounds, completed two worship cycles and saw the new rival take a letter. The browser reported no page errors. That run exercised the sequence from the initial colony, while the game suite also exercised staged combat and rival events. The final fight screenshot showed six actors with zero overlapping bounds at both 1280 and 390 pixels.

## What was not done

The live note boxes start from chosen scenarios and replay them with the shared rules. The full game still controls its own world. This pass did not measure long-session balance or the time to the first rival at normal speed across multiple sessions.

The inherited untracked plan and review folder were left in the worktree. The changed paths match the declared scope.

## What needs human eyes

Open the game from the note, wait for the first trail, then try Wipe. Check that the visible trail and the sidebar make the interruption legible. In the note, watch the red guards approach and clash with the main soldiers. Desktop and narrow-width screenshots are attached to the chat in place of a separate tour.

## Doctor findings carried forward

The worktree still has the Grain 0.1.29 pin, unmounted local skills, and incomplete evidence in the older close-gate and nest-lazy-load reports. The code graph was refreshed. The canonical checkout's run ledger still names analytics-fallback, budget-scope, dream-wiring and memory-dream. The three unrelated watched checkouts were parked at the owner's direction.
