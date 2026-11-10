---
title: One queen comes home, and a duel rolls once
date: 2026-11-10
status: complete
lane: gated
branch: perf/nest-lazy-load
scope:
  - scripts/nest-game.js
  - e2e/nest-behavior.e2e.ts
  - e2e/terminal.e2e.ts
  - artifacts/runs/2026-11-10-nest-worship-and-duels.md
touched:
  - scripts/nest-game.js
  - e2e/nest-behavior.e2e.ts
  - e2e/terminal.e2e.ts
  - artifacts/runs/2026-11-10-nest-worship-and-duels.md
plans: none. This was direct work requested in chat.
gates:
  - bun run check
  - bun tools/lint-gate.ts
  - bun test
  - Nest worship, combat, and sidebar browser regressions
diffstat: 127 insertions and 83 deletions across the game and two browser specs, plus this report.
unpushed: 89 | the branch has no upstream and remains local at the owner's instruction.
verifiedBy: independent review by verify_nest identified the squash and moving entrance cases. The final browser regressions cover the normal handoff and the combat cases.
doctor: 23 checks, 0 failing, 4 due at the worktree check.
---

# One queen comes home, and a duel rolls once

The page queen uses the same 40-pixel sprite as the note. The chamber is empty when she leaves, and it only shows her again after the page sprite reaches the current entrance and disappears. This removes the separate animated copy in the sidebar. The dance now enters its return phase even if the group takes too long to gather.

The guard odds were already 60 percent for the main colony and 40 percent for the rival. The combat scan ran several times while the first duel was still pending. In the regression, the rival won the first roll and died to a second roll of the same duel. The game now keeps each ant in one pending fight, releases both sides on resolution, and cancels the duel result if either ant has been squashed. Eligible nearby ants can still contribute to group fights.

## Gate output

```text
$ bun run check
$ tsc --noEmit

$ bun tools/lint-gate.ts
lint gate: level. 4486 flag(s) total (oxlint + voice-lint), matching or under the 4486 in tools/lint-baseline.json (generated 2026-11-09).

$ bun test
 905 pass
 0 fail
 3954 expect() calls
Ran 905 tests across 51 files. [13.50s]

$ PORT=3184 bunx playwright test e2e/nest-gameplay.e2e.ts e2e/nest-behavior.e2e.ts e2e/nest-scenarios.e2e.ts e2e/terminal.e2e.ts --grep 'queen|guard|duel|combat|fight|rival|home mound fits' --workers=2
  33 passed (3.4m)

$ bun ../pantry/cli.ts doctor .
23 checks, 0 failing, 4 due
```

The red runs captured a 60-pixel page sprite, a separate panel sprite after the return, and three rolls for one guard duel. The final browser tests check the shared sprite size, an empty chamber during the return, the chamber filling after the queen disappears from the page, and the rival surviving its winning roll. The screenshot in the chat serves as the visual review in place of a separate tour.

## What was not done

The checks exercise duels and group fights in controlled browser scenarios. They do not measure an overall rival win rate in free play.

## What needs human eyes

Open the local Nest and let the first worship run. Watch the queen cross to the entrance, then look at the chamber in the sidebar. Keep the colony running past the second worship to see the rival establish itself.

## Doctor findings carried forward

The doctor reported the older graph snapshot, the Grain 0.1.29 pin, unmounted local skills, and missing evidence in the close-gate and nest-lazy-load reports. The inherited plan and review folder remain untracked.
