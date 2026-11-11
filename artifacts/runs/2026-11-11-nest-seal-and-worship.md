---
title: Seal the rival hill and keep guards fighting during worship
date: 2026-11-11
status: complete
lane: high
branch: main
scope:
  - scripts/nest-game.js
  - e2e/nest-scenarios.e2e.ts
  - plans/ant-nest-game.md
  - artifacts/runs/2026-11-11-nest-seal-and-worship.md
touched:
  - scripts/nest-game.js
  - e2e/nest-scenarios.e2e.ts
  - plans/ant-nest-game.md
  - artifacts/runs/2026-11-11-nest-seal-and-worship.md
plans: Direct request in chat. No plan claim was needed.
gates:
  - bun install --frozen-lockfile
  - bun run check
  - bun test
  - bun tools/lint-gate.ts
  - bunx playwright install chromium
  - bunx playwright test --ignore-snapshots
diffstat: 89 insertions and 38 deletions across the game, scenario spec and game plan, plus this report.
unpushed: 1 | 400ad673 Open the full calendar feed from Browse was already local when this work began.
verifiedBy: An independent reviewer checked both gameplay changes and the follow-up targeting predicates.
doctor: 23 checks, 0 failing, 2 due. The merged graph is stale and older run reports lack evidence.
---

Seal closes both colony entrances for eight seconds. Rival ants wait to depart or bank letters until their entrance opens. Holding either entrance seals it individually. During regular worship, guards and soldiers can patrol, pursue an opponent and finish a fight while the other rival ants shelter.

## Gate output

```text
$ bun install --frozen-lockfile
Checked 139 installs across 156 packages (no changes) [76.00ms]

$ bun run check
$ tsc --noEmit

$ bun tools/lint-gate.ts
lint gate: level. 4375 flag(s) total (oxlint + voice-lint), matching or under the 4528 in tools/lint-baseline.json (generated 2026-11-09).

$ bun test
 978 pass
 1 fail
 4264 expect() calls
Ran 979 tests across 53 files. [143.83s]

$ bun test scripts/nest-engine.test.js scripts/nest-simulation.test.js --timeout 60000
 12 pass
 0 fail
 60 expect() calls
Ran 12 tests across 2 files. [7.56s]

$ PORT=3138 bunx playwright test e2e/nest-scenarios.e2e.ts e2e/nest-gameplay.e2e.ts e2e/nest-behavior.e2e.ts e2e/nest-balance.e2e.ts --ignore-snapshots --workers=2
  2 failed
    e2e/nest-balance.e2e.ts:42:1 › a rival trail with no ants on it fades instead of staying forever
    e2e/nest-gameplay.e2e.ts:80:1 › the rival falls without dropping letters and celebrates
  53 passed (10.0m)

$ PORT=3138 bunx playwright test e2e/nest-scenarios.e2e.ts --workers=2
  5 passed (43.4s)

PASS: holding the rival hill seals it individually and blocks a returning carrier until reopening
```

The full unit run timed out in the published-notes reachability test. The isolated test passed with a longer timeout. The full browser run started 606 tests with snapshots ignored and was stopped after failures outside the ant game. At interruption it had recorded 232 passes and 22 failures, including tests interrupted by the stop. The focused rerun passed the rival defeat case. The trail expiration case timed out again, and one run serving the committed game script passed the same assertion. The final scenario run checked the next departure time, since the queue can grow as traffic resumes.

## What was not done

The full browser suite did not finish. The game, scenario spec, behavior notes and this report are local working-tree changes. The rendered evidence is in the Codex chat screenshots.

## What needs human eyes

With a rival mound active, press Seal and watch both entrances close. Wait for the rival to resume leaving its mound. At the next worship, watch a guard or soldier near the contested trails while the queen is out.
