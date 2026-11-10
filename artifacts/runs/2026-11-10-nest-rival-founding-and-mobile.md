---
title: Rival builders walk in and the Nest stays on desktop
date: 2026-11-10
status: complete
lane: gated
branch: perf/nest-lazy-load
scope:
  - content/notes/the-site-has-ants.md
  - e2e/mobile.e2e.ts
  - e2e/nest-behavior.e2e.ts
  - e2e/nest-scenarios.e2e.ts
  - scripts/desk-commands.js
  - scripts/nest-availability.js
  - scripts/nest-game.js
  - scripts/page-islands.js
  - src/content.ts
  - artifacts/runs/2026-11-10-nest-rival-founding-and-mobile.md
touched:
  - content/notes/the-site-has-ants.md
  - e2e/mobile.e2e.ts
  - e2e/nest-behavior.e2e.ts
  - e2e/nest-scenarios.e2e.ts
  - scripts/desk-commands.js
  - scripts/nest-availability.js
  - scripts/nest-game.js
  - scripts/page-islands.js
  - src/content.ts
  - artifacts/runs/2026-11-10-nest-rival-founding-and-mobile.md
plans: none. This was direct work requested in chat.
gates:
  - bun run check
  - bun tools/lint-gate.ts
  - bun test
  - Playwright Nest gameplay, note, terminal, and responsive checks
diffstat: 345 insertions and 112 deletions across nine source and test files, plus this report.
unpushed: 92 | the branch remains local for review.
verifiedBy: verify_nest reviewed the combat, construction, and device gates. Browser tests exercised the fixes to that review.
doctor: 23 checks, 0 failing, 3 due when run in the game worktree.
---

# Rival builders walk in and the Nest stays on desktop

Every fighter tracks a live opponent from its own spot. The three attackers in a three-on-one fight turn toward the defender at three different angles. The defender faces the nearest attacker from the assigned formation. Existing fight odds and reservations still decide the result.

Three rival founders approach the main site on foot. The first trail opens after the mound finishes, and rivals leave at intervals. A builder walks from the rival entrance to each mini site and stays there as the mound takes shape. That builder becomes the first guard, and other defenders arrive as space opens under the population cap.

The game requires a viewport at least 769 CSS pixels wide and a primary pointer that is fine and supports hover. The note keeps its six live figures on touch devices. A desktop game shuts down and releases its page controls when the window becomes too narrow.

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
Ran 908 tests across 51 files. [7.24s]

$ PORT=3184 bunx playwright test e2e/mobile.e2e.ts e2e/nest-scenarios.e2e.ts e2e/nest-behavior.e2e.ts e2e/nest-gameplay.e2e.ts e2e/terminal.e2e.ts --grep 'rival|guard|fight|duel|Nest|nest|stray|direct play|note mounts its six|note has a separate|frame budget|colony reads' --workers=2
  53 passed (3.4m)

$ PORT=3184 bunx playwright test e2e/mobile.e2e.ts e2e/nest-scenarios.e2e.ts e2e/nest-behavior.e2e.ts --grep 'direct play stay off|narrowing a desktop|builds with builders|three-on-one|breaks patrol' --workers=2
  5 passed (15.1s)

$ PORT=3184 bunx playwright test e2e/terminal.e2e.ts --grep 'the note opens the colony' --workers=1
  1 passed (1.3s)

$ bun ../pantry/cli.ts doctor .
23 checks, 0 failing, 3 due
```

## What was not done

Mobile verification used Chromium touch emulation in portrait and landscape. Physical phones were outside this run. The local recording stages a rival arrival with the debug hook.

## What needs human eyes

Open the local game on desktop and wait for the rivals to approach. Watch the founders reach the main site, then follow a mini builder as it leaves the entrance. The staged founding clip and mini mound screenshot were shared with the review. On a phone, open the note and scroll through the figures. The note should show its illustrations with the game entry links hidden.

## Doctor findings carried forward

The worktree doctor named the Grain 0.1.29 pin, the missing local skill mounts, and the missing evidence in the close-gate and nest-lazy-load reports. The session startup doctor also reported run ledger evidence gaps in the main checkout.
