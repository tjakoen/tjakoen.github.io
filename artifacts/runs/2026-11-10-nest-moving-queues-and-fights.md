---
title: Trail traffic keeps moving and fighters step into place
date: 2026-11-10
status: complete
lane: gated
branch: perf/nest-lazy-load
scope:
  - scripts/nest-game.js
  - scripts/nest-simulation.js
  - scripts/nest-simulation.test.js
  - e2e/nest-behavior.e2e.ts
  - artifacts/runs/2026-11-10-nest-moving-queues-and-fights.md
touched:
  - scripts/nest-game.js
  - scripts/nest-simulation.js
  - scripts/nest-simulation.test.js
  - e2e/nest-behavior.e2e.ts
  - artifacts/runs/2026-11-10-nest-moving-queues-and-fights.md
plans: none. This was direct work requested in chat.
gates:
  - bun run check
  - bun tools/lint-gate.ts
  - bun test
  - Nest behavior, gameplay, scenario, and terminal browser tests
diffstat: 197 insertions and 45 deletions across four source and test files, plus this report.
unpushed: 91 | the branch has no upstream and remains local at the owner's instruction.
verifiedBy: independent review by verify_nest identified reciprocal queue blocking and loaded-ant spacing. Browser checks covered the resulting motion and existing combat results.
doctor: 23 checks, 0 failing, 4 due when run.
---

# Trail traffic keeps moving and fighters step into place

A worker's next step uses only the room left by the ant ahead on its trail. When that ant moves, the follower can move again without a stuck timer. Returning ants use the opposite side of the trail. Empty workers queue behind the center of a loaded crew, and two ants converging at a bend yield in a consistent order.

Guards slow as they close on an opponent. Once a fight begins, the participants walk to distinct spots, turn to face the other side, and make small advances and retreats. A crew carrying a letter keeps its grip. The fight still resolves on the same timing and odds, and reinforcements are counted around the original encounter.

## Gate output

```text
$ bun run check
$ tsc --noEmit

$ bun tools/lint-gate.ts
lint gate: level. 4486 flag(s) total (oxlint + voice-lint), matching or under the 4486 in tools/lint-baseline.json (generated 2026-11-09).

$ bun test
 908 pass
 0 fail
 3964 expect() calls
Ran 908 tests across 51 files. [25.60s]

$ PORT=3184 bunx playwright test e2e/nest-gameplay.e2e.ts --grep 'frame budget' --workers=1
  1 passed (12.2s)

$ bun ../pantry/cli.ts doctor .
23 checks, 0 failing, 4 due
```

The 49-case browser run passed 46, including the note loops. It exposed a line that still wandered too far from its route, a slow frame-budget sample, and a rival hint read after the temporary stock had changed. The subsequent focused checks passed the moving line, moving duel, foraging, and rival wipe. The frame-budget check passed in isolation. The seeded baseline and current runs both measured roughly 18 milliseconds at the 95th percentile under the same worker load.

The staged three-ant clip shows the fighters walking into place and moving through the clash. It serves as the visual review in place of a separate tour.

## What was not done

The figures in the note retain their bounded event choreography. This change addresses the live game's movement. The staged motion checks do not judge the feel of every crowd or map position.

## What needs human eyes

Open the local Nest and watch three workers on the same trail. Follow a returning worker past the outbound line, then watch a rival fight. The fighters should keep distinct positions and visibly move until the result.

## Doctor findings carried forward

The worktree doctor named graph freshness, the Grain 0.1.29 pin, unmounted local skills, and missing evidence in the close-gate and nest-lazy-load reports. The inherited plan and review folder remain untracked.
