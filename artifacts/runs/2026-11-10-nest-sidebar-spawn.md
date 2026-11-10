---
title: Place the mound after the sidebar opens
date: 2026-11-10
status: complete
lane: gated
branch: perf/nest-lazy-load
scope:
  - scripts/nest-game.js
  - e2e/nest-gameplay.e2e.ts
  - artifacts/runs/2026-11-10-nest-sidebar-spawn.md
touched:
  - scripts/nest-game.js
  - e2e/nest-gameplay.e2e.ts
  - artifacts/runs/2026-11-10-nest-sidebar-spawn.md
plans: none. This was direct work requested in chat.
gates:
  - bun run check
  - bun tools/lint-gate.ts
  - bun test
  - Nest gameplay, behavior, and scenario browser tests
diffstat: 32 insertions across the game and its browser test, plus this report.
unpushed: 88 | the branch has no upstream and remains local at the owner's instruction.
verifiedBy: independent read-only review by verify_nest, the red and green regression, and a desktop browser check.
doctor: the existing Grain pin, local skill mounts and two older worktree run reports remain due.
---

# Place the mound after the sidebar opens

The Nest reopened the hidden sidebar and immediately placed the mound while the page was still wide. In the regression, it measured 1,009 pixels and the page settled at 676. The launcher now finishes the shell's column transition before placement. The regression starts with a hidden sidebar and checks both the width at spawn and the mound's final horizontal bounds.

## Gate output

```text
$ bun run check
$ tsc --noEmit

$ bun tools/lint-gate.ts
lint gate: level. 4486 flag(s) total (oxlint + voice-lint), matching or under the 4486 in tools/lint-baseline.json (generated 2026-11-09).

$ PORT=3184 bunx playwright test e2e/nest-gameplay.e2e.ts e2e/nest-behavior.e2e.ts e2e/nest-scenarios.e2e.ts --workers=2
  34 passed (2.7m)

$ PORT=3184 bunx playwright test e2e/nest-gameplay.e2e.ts --grep 'home mound fits'
  1 passed (10.9s)

$ bun test
 905 pass
 0 fail
 3954 expect() calls
Ran 905 tests across 51 files. [83.07s]
```

The first unit run overlapped the browser suite and two tests exceeded their timeouts. The isolated run passed both. The desktop browser check verified that the whole mound fit in the reading pane after opening the sidebar. A screenshot is attached to the chat in place of a separate tour.

## What was not done

The change covers initial placement when opening the Nest. It does not reposition an established colony when the window changes size during play.

## What needs human eyes

Hide the assistant panel, open the Nest from the status bar, and find the mound in the page to the left of the Nest panel.

## Doctor findings carried forward

The worktree still has the Grain 0.1.29 pin, unmounted local skills, and incomplete evidence in the older close-gate and nest-lazy-load reports. The code graph was refreshed. The inherited plan and review folder remain untracked.
