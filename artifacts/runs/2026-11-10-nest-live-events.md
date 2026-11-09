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
  - scripts/page-islands.js
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
  - voice
gates:
  - bun run check | exit 0
  - bun tools/lint-gate.ts | 4486 flags, matching the committed baseline
  - bun test scripts/nest-simulation.test.js | 7 pass, 0 fail, 35 expectations
  - PORT=3185 bunx playwright test e2e/terminal.e2e.ts -g 'the queen leaves the nest for the page dance|the note mounts its six live colony boxes' | 2 passed
  - PORT=3185 bunx playwright test e2e/terminal.e2e.ts -g 'note figures keep their event loops with reduced motion enabled' | 1 passed
diffstat: ten files covering shared rules and assets, game and note integration, event figures, note copy, checks, and this report
unpushed: 84 | This work is committed locally only, as requested. The branch has no upstream.
verifiedBy: independent read-only second-pass review; findings fixed and rechecked
doctor: graph current; inherited report evidence, local layer pin, skill mount, and shell stream are carried below
---

The six ant figures in the note run bounded, scenario-driven simulations. Each starts from chosen
conditions and follows a deliberate event order, while actor movement and event outcomes use rules
shared with the game. They are controlled scenarios rather than unrestricted runs of the full game.

## What changed

The shared rule module in scripts/nest-simulation.js owns the movement step, role and carry speeds,
food portions, combat power and health, duel odds, group resolution, store thresholds, build
progress, worship timing, rival founding time, mound health, bite timing, and mound damage. The game in
scripts/nest-game.js calls those helpers. The shared asset module in scripts/nest-assets.js owns the
ant cells, ant markup, role classes, and mini-mound art used by both renderers.

The six note scenes cover scouting and carrying letters, a group fight, store-funded mound
construction, caste movement, worship, and rival founding followed by defeat. In the rival scene,
both colonies forage from one sentence, then three main soldiers fight the rival guards and destroy
the rival mound beside the established main mound. Each soldier applies one shared bite per game
interval. Actors have per-box state, move through eased
headings with shared movement rules, and alternate the game's ant leg frames while walking. Every
scene completes, clears for a short reset, and starts again.

The note boxes no longer show store glyphs, internal labels, or explanatory copy. Store counts still
rise in simulation state, while each figure ends at the scene floor and omits the unused area below
it. Actors are hidden inside a mound. The rival scene draws one trail from each colony toward the
shared sentence. Rival foragers follow sampled points along their colony's trail to the sentence
and back while carrying. The two fighting groups walk opposite sampled trail segments before the
shared combat rules resolve the clash. The fight trail follows a shallow, organic route through the
approach and clash area. The actual game worship now gathers available ants around the queen before they circle her;
the pending scout queue pauses during the dance so it cannot pull dancers away. The note links open
and start the full game on the home page, and the note page suppresses the full game's idle stray
ant. The event loop continues when reduced motion is enabled, with the CSS leg frames suppressed.
The technical description now refers to a few JavaScript modules instead of one file. The captions
and story remain outside the event boxes.

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
(pass) shared nest rules > mound bites remove one shared hit point without going below zero
(pass) shared nest rules > movement eases heading and uses its explicit clock for sway [0.21ms]
(pass) shared nest rules > carried letters keep the game's load and role speeds [0.09ms]
(pass) shared nest rules > feed portions alternate between stores and meals, including a dead queen [0.05ms]
(pass) shared nest rules > combat values preserve role health, group threshold, and duel odds [0.07ms]
(pass) shared nest rules > store, build, and worship thresholds keep the game's values [0.06ms]
(pass) shared nest rules > ant roles and progressive mounds use shared game assets [0.45ms]

7 pass
0 fail
35 expect() calls
Ran 7 tests across 1 file.
```

```text
Running 2 tests using 2 workers
  ✓  the queen leaves the nest for the page dance (11.8s)
  ✓  the note mounts its six live colony boxes (1.2m)
  2 passed
```

```text
Running 1 test using 1 worker
  ✓  note figures keep their event loops with reduced motion enabled (14.0s)
  1 passed
```

## What was not done

The complete whole-page colony engine was not moved into a shared module. Route choice and event
stage scheduling remain in the note adapter, while movement, speed, food, combat, building, worship,
stores, mound damage, ant assets, and mound art come from shared code the real game also calls. The
full game does not run on the note page. Its launcher and stray ant are redirected or suppressed;
the figures continue their own loops there.

## What needs human eyes

The focused Playwright test watched each box through at least two full cycles and visible resets. It
checked one actor layer per scene, expected sentence counts, shared rule use, actor containment,
theme changes, hidden mound actors, store counts without glyphs, the two sentence-bound rival trails,
the three-soldier rival defeat, and note-side console and page errors. A separate test confirmed
that the event loop continues under reduced motion. The actual game worship test checks that the
ants gather before their orbit. The note, rival trails, fight trail, and shortened scene boxes were
opened and visually reviewed in the browser.

Port 3184 belongs to the main checkout, so it could not verify this worktree. The focused suite ran
on port 3185, where Playwright started the server from this branch. A broader suite was stopped
after it reused the wrong checkout; its partial failures are not evidence about this branch.

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
