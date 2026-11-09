---
title: Six note figures share the colony rules
date: 2026-11-10
status: complete
lane: gated
branch: perf/nest-lazy-load
scope: [scripts, content/notes, e2e, view/components, artifacts/runs]
touched:
  - content/notes/the-site-has-ants.md
  - e2e/terminal.e2e.ts
  - scripts/figure-nest.js
  - scripts/nest-assets.js
  - scripts/nest-game.js
  - scripts/nest-simulation.js
  - scripts/nest-simulation.test.js
  - view/components/molecules/live-figure/live-figure.css
  - artifacts/runs/2026-11-10-nest-live-events.md
skills:
  - ai-development
  - figures
  - loop-standard
  - note-standard
  - session-loop
  - tour-standard
gates:
  - bun run check | exit 0
  - bun tools/lint-gate.ts | 4486 flags, matching the committed baseline
  - bun test scripts/nest-simulation.test.js | 6 pass, 0 fail
  - PORT=3184 bunx playwright test e2e/terminal.e2e.ts -g 'the note mounts its six live colony boxes' | 1 passed
diffstat: nine files covering the shared rules, both renderers, the note figures, focused checks, and this report
unpushed: 82 | The owner requested a local-only commit, and the branch has no upstream.
verifiedBy: independent read-only second-pass review; two findings fixed and rechecked
doctor: graph current; inherited report evidence, local layer pin, skill mount, and shell stream are carried below
---

The six ant figures in the note now run bounded event simulations. The note figures and the game
call the same movement, speed, feeding, combat, construction, worship return timing, and store rules. They also
use the same ant markup, role classes, and progressive mini-mound generator.

## What changed

The shared rule module in scripts/nest-simulation.js owns the movement step, role and carry speeds,
food portions, combat power and health, duel odds, group resolution, store thresholds, build
progress, and worship thresholds. The game in scripts/nest-game.js now calls those helpers. The
shared asset module in scripts/nest-assets.js owns the ant cells, ant markup, role classes, and
mini-mound art used by both renderers.

The six note scenes cover scouting and carrying letters, a group fight, store-funded mound
construction, caste movement, worship, and rival founding followed by defeat. Actors have per-box
state, move through eased headings with the shared movement calculation, and alternate the shared
leg frames while walking. Each scene completes, clears for a short reset, and starts again.

The note no longer contains fallback explanatory paragraphs inside the boxes. Captions remain
outside the boxes. The replacement removes the former room diagram, internal headings and hints,
static fight illustration, duplicate mound artwork, and the CSS fight loop. The article prose
remains intact.

## Gate output

```text
$ tsc --noEmit
```

```text
lint gate: level. 4486 flag(s) total (oxlint + voice-lint), matching or under the 4486 in tools/lint-baseline.json (generated 2026-11-09).
```

```text
bun test v1.3.14 (0d9b296a)

scripts/nest-simulation.test.js:
(pass) shared nest rules > movement eases heading and uses its explicit clock for sway [0.21ms]
(pass) shared nest rules > carried letters keep the game's load and role speeds [0.09ms]
(pass) shared nest rules > feed portions alternate between stores and meals, including a dead queen [0.05ms]
(pass) shared nest rules > combat values preserve role health, group threshold, and duel odds [0.07ms]
(pass) shared nest rules > store, build, and worship thresholds keep the game's values [0.06ms]
(pass) shared nest rules > ant roles and progressive mounds use shared game assets [0.45ms]

6 pass
0 fail
29 expect() calls
Ran 6 tests across 1 file. [65.00ms]
```

```text
Running 1 test using 1 worker

(node:21321) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  ✓  1 e2e/terminal.e2e.ts:662:1 › the note mounts its six live colony boxes (54.6s)

1 passed (55.5s)
```

## What was not done

The complete whole-page colony engine was not moved into a shared module. Route choice and event
stage scheduling remain in the note adapter, while each movement, speed, food, combat, build,
worship return, store, ant, and mini-mound rule used by those stages comes from code that the real
game also calls. The main game design was left unchanged. No push was made.

## What needs human eyes

The focused Playwright test watched each box through at least two full cycles. It checked the
reset counter, one actor layer per scene, the expected sentence count, shared rules used by each
event, actor containment, theme changes, and note-side console and page errors. Six current box
captures were reviewed in the session.

The local site shell emits three failed reconnect requests to its long-lived /stream EventSource
while the note runs. The request URL is outside the note module, and the test excludes only that
known shell transport path. No page exceptions or other console errors came from the note figures.
The site shell already documents this transport behavior in scripts/site.js. Fixing the shell
stream is outside this change.

The project doctor also reports inherited run evidence that remains untouched:

- 2026-11-09-analytics-fallback lacks Gate output and What needs human eyes sections.
- 2026-11-09-budget-scope lacks What needs human eyes, has a nonnumeric unpushed count, and lists
  claude.md outside its declared scope.
- 2026-11-09-dream-wiring lacks What needs human eyes and has a nonnumeric unpushed count.
- 2026-11-09-memory-dream lacks What needs human eyes, has a nonnumeric unpushed count, and lists
  package.json outside its declared scope.
- The audit worktree doctor also reported incomplete evidence for 2026-11-08-close-gate and
  2026-11-08-nest-lazy-load.
- The audit worktree doctor reports grain 0.1.29 behind 0.1.30 and 19 unmounted standards skills.
  Neither the dependency pin nor generated skill mounts were changed in this note task.

The unrelated agent-config and HAU work was left parked at the owner's direction.
