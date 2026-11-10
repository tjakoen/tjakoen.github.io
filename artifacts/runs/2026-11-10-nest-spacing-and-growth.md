---
title: Give the ants room to fight and the colony room to build
date: 2026-11-10
status: complete
lane: gated
branch: perf/nest-lazy-load
scope:
  - scripts/nest-game.js
  - content/notes/the-site-has-ants.md
  - e2e/nest-behavior.e2e.ts
  - e2e/nest-gameplay.e2e.ts
  - e2e/nest-scenarios.e2e.ts
  - e2e/terminal.e2e.ts
  - artifacts/runs/2026-11-10-nest-spacing-and-growth.md
touched:
  - scripts/nest-game.js
  - content/notes/the-site-has-ants.md
  - e2e/nest-behavior.e2e.ts
  - e2e/nest-gameplay.e2e.ts
  - e2e/nest-scenarios.e2e.ts
  - e2e/terminal.e2e.ts
  - artifacts/runs/2026-11-10-nest-spacing-and-growth.md
plans: none. This was direct work requested in chat.
gates:
  - bun run check
  - bun tools/lint-gate.ts
  - bun test
  - targeted gameplay, behavior, scenario, and terminal browser tests
diffstat: 211 insertions and 56 deletions across the six source, note, and test files, plus this report.
unpushed: 90 | the branch has no upstream and remains local at the owner's instruction.
verifiedBy: independent read-only review by verify_nest, browser regressions, and a staged before-and-after browser capture.
doctor: 23 checks, 0 failing, 3 due when run.
---

# Give the ants room to fight and the colony room to build

Nearby ants draw a little farther apart, with extra room during combat. The draw positions leave trails, attack range, and letter crews in the simulation's own coordinates. A staged three-ant fight went from a shared screen position to a minimum center separation of 22.66 pixels.

During worship, rival ants head to their mound and shelter there. They bank letters on arrival, and outbound workers restart from the beginning of their trail when worship ends. Pending fights are released without casualties while the rivals retreat. The note now describes the rival retreat.

The sidebar counts workers in the nest and on the page, including builders. Counts refresh each frame. Full stores can reassign a worker at the population cap, so a second hill can finish without adding another ant. Restore cancels a build before it moves the mound, and combat removal clears a builder's unfinished mound.

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
Ran 905 tests across 51 files. [54.25s]

$ PORT=3184 bunx playwright test e2e/nest-gameplay.e2e.ts e2e/nest-behavior.e2e.ts e2e/nest-scenarios.e2e.ts e2e/terminal.e2e.ts --grep 'home mound|colony reads|queen|guard|duel|combat|fight|rival|worker stat|frame budget|stores send|staff a second|bait|sealing|cap|Nest tools' --workers=2
  45 passed (2.2m)

$ PORT=3184 bunx playwright test e2e/nest-gameplay.e2e.ts e2e/nest-behavior.e2e.ts e2e/nest-scenarios.e2e.ts e2e/terminal.e2e.ts --grep 'staff a second|shelter at their own|separate fighters|guarded mound|sealing a hill' --workers=1
  5 passed (36.3s)

$ bun ../pantry/cli.ts doctor .
23 checks, 0 failing, 3 due
```

The first browser run exposed the cap stall and missing rival retreat. A separate visual comparison reproduced the overlap on the previous commit with the same starting positions. The broader regression caught a stale count between meter refreshes and a guard test that counted ants from other mounds. The final wide pass covered both, and the smaller pass checked the entrance and builder corrections from independent review. The staged fight and note captures serve as the visual review in place of a separate tour.

## What was not done

The second hill check supplied full stores in a capped colony. Build timing in free play still depends on what the ants collect and where the page has room for a hill.

## What needs human eyes

Watch a crowded fight and check whether the opposing ants remain distinct. At worship, follow the red ants back to their mound and watch them leave again after the queen returns.

## Doctor findings carried forward

The worktree doctor named the Grain 0.1.29 pin, unmounted local skills, and missing evidence in the close-gate and nest-lazy-load reports. The inherited plan and review folder remain untracked.
