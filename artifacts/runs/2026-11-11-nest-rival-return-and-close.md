---
title: Rivals return after a missed worship and the Nest closes cleanly
date: 2026-11-11
status: complete
lane: high
branch: main
scope:
  - scripts/nest-game.js
  - e2e/nest-balance.e2e.ts
  - content/notes/the-site-has-ants.md
  - artifacts/runs/2026-11-11-nest-rival-return-and-close.md
touched:
  - scripts/nest-game.js
  - e2e/nest-balance.e2e.ts
  - content/notes/the-site-has-ants.md
  - artifacts/runs/2026-11-11-nest-rival-return-and-close.md
plans: Direct request in chat. No plan claim was needed.
gates:
  - bun run check
  - bun test
  - bun tools/lint-gate.ts
  - Eight Playwright tests for rival founding, worship, sealing and closing
diffstat: Three game, browser test and note files, plus this report. The game file also contains the earlier Seal and Worship changes.
unpushed: 1 | 400ad673 Open the full calendar feed from Browse was already local when this work began.
verifiedBy: An independent reviewer checked the schedule and compared the sidebar at unload in Chromium before and after the change.
doctor: 23 checks, 0 failing, 2 due. The merged graph is stale and older run reports lack evidence.
---

When a rival survives past a scheduled return, the latest missed milestone stays due until the rival falls. One new colony can then arrive after the cooldown. The worship counter keeps going after the seven fixed letter thresholds, so the tenth worship and later returns can happen.

The sidebar reads The Nest, matching the launcher. Confirming a close freezes the colony while the browser reloads. The old document keeps the sidebar visible, and the clean document restores the letters.

```text
$ bun run check
$ tsc --noEmit

$ bun test
 979 pass
 0 fail
 4264 expect() calls
Ran 979 tests across 53 files. [49.72s]

$ bun tools/lint-gate.ts
lint gate: level. 4375 flag(s) total (oxlint + voice-lint), matching or under the 4528 in tools/lint-baseline.json (generated 2026-11-09).

$ PORT=3138 bunx playwright test e2e/nest-balance.e2e.ts e2e/nest-scenarios.e2e.ts -g 'rivals return|missed rival|keeps counting|keeps the Nest|worship|Seal closes' --workers=3
  8 passed (45.5s)
```

## What was not done

Browser verification covered the Nest scenarios in Chromium. It did not repeat the site-wide browser run or measure the browser's own reload paint on other engines. The four touched files are local working-tree changes.

## What needs human eyes

Open the Nest and look for the new title. Close it and confirm. The sidebar should stay put until the page returns with all its letters. The chat screenshot shows a replacement rival mound and the new title.
