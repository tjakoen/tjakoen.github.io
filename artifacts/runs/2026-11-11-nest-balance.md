---
title: The colony gets a fair fight and a real ending
date: 2026-11-11
status: complete
lane: gated
branch: main
scope:
  - scripts/nest-game.js
  - scripts/nest-simulation.js
  - scripts/nest-simulation.test.js
  - content/notes/the-site-has-ants.md
  - e2e/nest-balance.e2e.ts
  - e2e/nest-gameplay.e2e.ts
  - e2e/nest-scenarios.e2e.ts
  - e2e/terminal.e2e.ts
  - artifacts/runs/2026-11-11-nest-balance.md
  - artifacts/runs/2026-11-11-nest-balance/stats-127.png
  - artifacts/runs/2026-11-11-nest-balance/finale.png
  - artifacts/runs/2026-11-11-nest-balance/live-local.png
touched:
  - scripts/nest-game.js
  - scripts/nest-simulation.js
  - scripts/nest-simulation.test.js
  - content/notes/the-site-has-ants.md
  - e2e/nest-balance.e2e.ts
  - e2e/nest-gameplay.e2e.ts
  - e2e/nest-scenarios.e2e.ts
  - e2e/terminal.e2e.ts
  - artifacts/runs/2026-11-11-nest-balance.md
  - artifacts/runs/2026-11-11-nest-balance/stats-127.png
  - artifacts/runs/2026-11-11-nest-balance/finale.png
  - artifacts/runs/2026-11-11-nest-balance/finale-panel.png
  - artifacts/runs/2026-11-11-nest-balance/live-local.png
plans: none. This was direct work requested in chat.
gates:
  - bun run check
  - bun test
  - bun tools/lint-gate.ts
  - Nest browser regressions, 54 passed
  - Terminal and note colony regressions, 15 passed
diffstat: 479 lines changed in the game, 295 lines of new browser regressions, 39 lines of note and test copy updates, and this report.
verifiedBy: Balance probes ran six and ten simulated minutes without a player, and the long regression repeated at the final settings.
doctor: 23 checks, 0 failing, 4 due at the worktree check.
---

# The colony gets a fair fight and a real ending

The rival was a mirror of the main colony, which made it a wall. It now sizes itself from the whole nest, including the guards and flyers on the mini hills, at a little over half that total. That share grows slowly with each later rival. The main nest keeps a separate worker roster, so mini hills cannot fill the population cap with guards and flyers and leave nobody to forage. A long run ends with the rival broken and workers still on the page.

The worship schedule runs 2, 3, 4 and 5, then every fifth worship after that: 10, 15, 20. A beaten rival returns at the next point in that sequence. If one is still alive when a point passes, that slot is skipped. Each new rival sizes itself from the live colony instead of a fixed number.

The rest of the changes are the failures seen in play:

- A trail with no ants on it fades, on both sides. Rival trails were never aged out before.
- Page left counts every hidden letter, whether the main colony took it or the rival took it and later ate it. It also counts only text the ants can reach, so `aria-hidden` decoration is not part of the score.
- Rival guards raid main mini hills, and a raid bites the hill down while its guards try to answer.
- Flyers come from a separate staff roster, at two guards and up to three flyers per hill, so a full colony can still hold twelve staff and twenty workers.
- A rival mound has 16 hit points, up from 8, and it keeps sending replacements when its ants die. War starts after two and a half uncontested minutes and sends three soldiers at a time. Two ants can work the mound; a lone ant cannot.
- Rival flyers steal letters instead of only roaming.
- A broken rival mini has a twenty-four second cooldown before another can be raised.
- If the colony loses every ant, the queen restarts it even when a mini hill is still standing. A foraging watchdog also sends a scout back out when letters remain and nothing has been picked up for a while.
- The squashed counter belongs to the player's squash tool alone. Combat deaths, rival kills and main losses no longer inflate it.
- The stat grid gives three-digit values room, so 127 is not clipped to `12..`.
- When the page empties, the queen keeps her circle forever, part of the colony wanders the page, and every hill keeps a dancer on top.
- Clear and close refreshes the page instead of trying to rebuild the copy from patched text nodes.

The note now describes the new rival share, the two-ant mound crew, the rival raids, the fading trails and the permanent celebration.

## Gate output

```text
$ bun run check
$ tsc --noEmit

$ bun test
 979 pass
 0 fail
 4283 expect() calls
Ran 979 tests across 53 files. [5.48s]

$ bun tools/lint-gate.ts
lint gate: level. 4374 flag(s) total (oxlint + voice-lint), matching or under the 4528 in tools/lint-baseline.json (generated 2026-11-09).

$ bunx playwright test e2e/nest-behavior.e2e.ts e2e/nest-gameplay.e2e.ts e2e/nest-scenarios.e2e.ts e2e/nest-balance.e2e.ts
 54 passed (1.8m)

$ bunx playwright test e2e/terminal.e2e.ts --grep "Nest|lazy|colony|speed control|stray|rival colony founds"
 15 passed (28.6s)

$ pantry doctor .
23 checks, 0 failing, 4 due
```

The balance probe ran the live game under a fake clock with no player input. In the ten-minute run the rival was broken by worship seven. At ten minutes the colony still had twelve workers, seven flyers and active trails, and page left had fallen to 42 percent, which is slow but not stalled. The endgame regression repeats the broken-rival check at the final settings.

## Screenshots

![The stat grid with a three-digit squash count](artifacts/runs/2026-11-11-nest-balance/stats-127.png)

![The permanent celebration, with the queen circle and dancers around the page](artifacts/runs/2026-11-11-nest-balance/finale.png)

## What was not done

The balance test measures one long uncontested session per run, not a distribution of hundreds of seeds. The page-left score is accurate for the current page when the colony opens; a page that changes while the colony is running does not recompute its total.

## What needs human eyes

Open the Nest on the home page and leave it alone through worship five. Then let a rival guard reach a main mini hill and watch the raid. The permanent celebration is also worth seeing on a real page rather than the forced test state.

## Doctor findings carried forward

The doctor reports the older graph snapshot, stale local skills, and ten dirty paths, including `.claude/settings.local.json` at 83 days. It also reports the run reports missing evidence, including the untracked voice-file work from another session. Those are not part of this change.
