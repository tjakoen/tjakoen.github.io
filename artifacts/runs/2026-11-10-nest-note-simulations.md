---
title: The note's ants stop piling up, and the queen stays home
date: 2026-11-10
status: complete
lane: gated
branch: perf/nest-lazy-load
scope:
  - scripts/
  - view/components/molecules/live-figure/live-figure.css
  - e2e/terminal.e2e.ts
  - artifacts/runs/
touched:
  - scripts/figure-colony.js
  - scripts/figure-nest.js
  - scripts/nest-assets.js
  - scripts/nest-engine.js
  - scripts/nest-game.js
  - scripts/nest-simulation.js
  - scripts/nest-simulation.test.js
  - view/components/molecules/live-figure/live-figure.css
  - e2e/terminal.e2e.ts
  - artifacts/runs/2026-11-10-nest-note-simulations.md
plans: none. This was direct work requested in chat.
gates:
  - bun run check | exit 0, no output
  - bun tools/lint-gate.ts | level, 4,486 flags, no increase over baseline
  - bun test --timeout=20000 scripts/nest-simulation.test.js scripts/nest-engine.test.js | 9 pass, 0 fail
  - PORT=3133 bunx playwright test e2e/terminal.e2e.ts --grep "note mounts its six live colony boxes|note has a separate self-running colony" | 2 passed
  - PORT=3132 bunx playwright test e2e/nest-gameplay.e2e.ts e2e/nest-behavior.e2e.ts e2e/nest-scenarios.e2e.ts | 32 passed
  - bun ../pantry/cli.ts doctor . | 23 checks, 0 failing, 4 due
diffstat: 9 code and test files changed before this report; final diffstat recorded by git at commit.
unpushed: 86 | this branch has no upstream and is 85 commits ahead of origin/main before this commit; the owner asked for local commits only.
verifiedBy: author ran the specified gates, the 2-cycle note test, the game regression suite and a local browser review; independent review is still needed.
doctor: graphify freshness, Grain 0.1.29 pin, 19 unmounted skills, and two old run reports carried by name below; unrelated machine and watched-repository findings left untouched at the owner's direction.
---

# The note's ants stop piling up, and the queen stays home

The note was using the game's movement math without its spacing rule. The fight scene put its two groups too close to the trail, and the separate colony cutaway borrowed the worship phase. Those differences made the page look as though it ran a different colony.

The game and note figures now use the same trail-follow blocking rule from `nest-simulation.js`. It checks for an ant ahead on the same trail, moving in the same direction, and gives a waiting ant the same chance to move on. The six event figures still have their own starting conditions and state transitions, but their actors use the game's movement, heading, combat, food, building and worship rules.

The colony cutaway renders through the same measured Braille `<pre>` grid, soil layout, tunnel composition and color classes as the sidebar. Worship stays in its separate figure. The queen remains in her chamber while letters move through the larder, stores fill, and the colony resets for another cycle.

The fight box now starts three main soldiers and three rival guards at the same size. They approach from opposite ends of a curved, broken trail, form spaced rows in the center, and resolve with the shared combat rules. The fight box has no solid baseline. Rival color and flyer wing motion match the game's tokens, SVG art and flicker.

## What each box simulates

- **Letters:** a scout finds letters, lays the route, and the workers carry letters home.
- **Building:** workers turn letters into stores, then a builder raises a mini mound.
- **Worship:** the queen leaves, workers gather and circle, stores fill, and the queen returns.
- **Rival:** the second mound builds and gathers letters before the main colony drives it off.
- **Fight:** main soldiers and rival guards approach, meet in the middle, lose health and resolve.
- **Castes:** worker, soldier, flyer, queen and rival guard move by role. The flyer uses the game's wing animation.
- **Colony interior:** ants move through the sidebar's nest cutaway; the queen stays home, stores rise, and the loop resets.

## What changed in the note implementation

The custom fixed-size SVG cell drawing for the colony was removed. The flyer-specific JavaScript wing rotation was removed, along with the rival-worker scale reduction. The article and its captions were left intact.

## Gate output

```
$ bun run check
$ tsc --noEmit
(no output, exit 0)

$ bun tools/lint-gate.ts
lint gate: level. 4486 flag(s) total (oxlint + voice-lint), matching or under the 4486 in tools/lint-baseline.json (generated 2026-11-09).

$ bun test --timeout=20000 scripts/nest-simulation.test.js scripts/nest-engine.test.js
9 pass
0 fail
49 expect() calls
Ran 9 tests across 2 files.

$ PORT=3133 bunx playwright test e2e/terminal.e2e.ts --grep "note mounts its six live colony boxes|note has a separate self-running colony"
2 passed (1.2m)

$ PORT=3132 bunx playwright test e2e/nest-gameplay.e2e.ts e2e/nest-behavior.e2e.ts e2e/nest-scenarios.e2e.ts
32 passed (49.7s)

$ bun ../pantry/cli.ts doctor .
23 checks, 0 failing, 4 due
OK
```

The note browser run watched all six event figures for two completed cycles. The colony test also confirmed the added interior box completed two store-and-reset cycles, kept `data-worship` at `home`, changed color with the site theme, stayed inside its box and produced no page errors. A local browser check measured the fight groups at 21 pixels each and found no floor line.

## What was not done

The game and note share their assets and movement and event rules, but the game controller is not yet the note's one shared state engine. `nest-game.js` still owns the playable colony in a DOM-coupled closure; `nest-engine.js` owns the compact autonomous colony loop. Extracting one DOM-free engine with commands, snapshots and effects would close that seam. The event boxes use the actual shared rules and are simulations with targets and state, not keyframe loops.

The independent verification pass is also still open. The note article itself was not edited, so its current captions remain as written.

## What needs human eyes

Refresh the note at `/notes/the-site-has-ants`. Watch the fight approach and clash, then watch the colony box through a full reset. Confirm the queen remains in the lower chamber between cycles, the shared trail keeps ants apart while they walk, and the red guards match the main soldiers in size. The screenshots shown in this session are the centered fight and the sidebar-rendered colony interior.

## Doctor findings carried forward

- **Graphify freshness:** twelve changed files are not in the extracted graph. `graphify update .` remains due.
- **Dependency pin:** the Grain pin is `0.1.29`, while `0.1.30` is current. `bun run deps:refresh` remains due.
- **Mounted skills:** nineteen skills are not mounted, including `figures`, `voice`, `loop-standard`, `note-standard`, and `tour-standard`. `pantry skills sync` remains due.
- **Run ledger:** `2026-11-08-close-gate` has no Gate output and touched paths outside scope; `2026-11-08-nest-lazy-load` has no reason beside its unpushed count. Both are untouched.

The startup report also named unrelated `agent-config`, HAU and course-platform work. The owner said to leave those stranded items alone, so they remain untouched.
