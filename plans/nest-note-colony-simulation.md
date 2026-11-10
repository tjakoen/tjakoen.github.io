---
id: nest-note-colony-simulation
status: done
track: feature
depends: []
touches:
  - scripts/nest-game.js
  - scripts/nest-engine.js
  - scripts/nest-engine.test.js
  - scripts/nest-simulation.js
  - scripts/nest-assets.js
  - scripts/figure-nest.js
  - scripts/figures.js
  - view/components/molecules/live-figure/live-figure.css
  - content/notes/the-site-has-ants.md
  - e2e/terminal.e2e.ts
  - e2e/nest-behavior.e2e.ts
  - e2e/nest-gameplay.e2e.ts
  - e2e/nest-scenarios.e2e.ts
owner: human
---

# Add one live colony simulation to the note

Keep the six event figures and add one compact, self-running view of the colony interior shown in
the Nest sidebar. The new figure shows the mound cross-section, tunnels, queen, larder, stores,
nursery, eggs and workers moving between them. It leaves out the sidebar controls, meters and
activity log, along with the page sentence and the ants moving outside the nest. Its colony has
private state and cannot affect the article or the real page game.

This figure shows the main colony's interior only. The rival and combat remain in their existing
event figures; this view demonstrates the queen's chamber, the food path, the larder, stores and
nursery as their state changes.

## Why this needs an engine seam

The note figures use selected starting conditions and a local event loop. The actual game is a
single page-bound instance in [nest-game.js](../scripts/nest-game.js). It reads letter positions from
the page, creates a sidebar and a page-wide ant layer, and keeps its game state and tick loop inside
one closure. Reusing only the movement helpers would make another note-only colony, which is not the
requested result.

Extract an engine instance boundary with this contract:

```js
const engine = createNestEngine({ world, settings, seed, initialFrame });
const result = engine.step(dt, worldFrame);
const result = engine.command(action);
const state = engine.snapshot();
engine.reset(worldFrame);
engine.destroy();
```

`world` is immutable source identity: `{ id: string, letters: Array<{ id: string, text: string }> }`.
`initialFrame` is required and uses the same schema as each later frame:
`{ width, height, nowMs, home, letters, obstacles, moundSites }`. `home` is `{ x, y, holeX, holeY,
width, height }`. Each letter contains
`{ id, x, y, width, height, claimable }`, each obstacle is `{ x, y, width, height }`, and each mound
site is `{ id, x, y, width, height }`. Frame geometry refreshes while source IDs remain stable.
`settings` is `{ rivals: "enabled" | "disabled", maxAnts: 20, partyThresholds: [20, 50, 90,
140, 200, 280, 380] }`; the game passes enabled and the note passes disabled. Initial actors use the
game's actual start of one scout and three workers, positioned from `home`. The queen starts in the
home mound. The engine sets the first egg deadline to `initialFrame.nowMs + 6000`, matching the
game's startup timer. That wall-clock deadline is not shifted by pause or speed changes; if it expires
while paused, the egg is added on the first resumed step. Later egg incubation and hatching use the
regular engine transitions. `seed` is an unsigned 32-bit integer consumed
by a single `mulberry32` stream. Every random draw used by an engine-owned transition, including
scouting, path choice, combat, rival decisions, bait and mound placement, consumes this stream;
there are no `Math.random()` calls in the engine. The game adapter makes one seed per game; tests
provide a fixed seed. With the same seed, frame sequence and commands, the engine produces the same
transitions and snapshots.

Each instance owns its state, random source and monotonically increasing effect sequence. `step`
and `command` return `{ snapshot, effects }`; `snapshot` returns a detached, deeply frozen plain
data view. An effect is emitted only on the transition that creates it, carries a unique sequence
number, and is applied synchronously once by its adapter before the next step or command. Duplicate
sequence numbers are ignored by the adapter. The sequence remains monotonic across resets so a
restoration effect cannot be mistaken for an earlier event. `reset` restores the original source IDs
and positions, settings and seed, and returns the reset snapshot and effects needed to restore the
world. It uses the supplied latest frame's geometry for those IDs, including letters currently in
transit, and returns them to free; a direct reset intentionally aborts in-flight state. The note
adapter calls reset only after its drain condition. Reset clears elapsed simulation time and cadence
accumulation, resets the PRNG to the original seed, and emits restoration effects only for letters
currently hidden. The game adapter uses `restoreWorld` for its continue-running button;
full reset is for the note after the colony has drained. `destroy` marks the instance unusable and
releases its state without changing another instance. Any method called after destroy throws
`Error("Nest engine destroyed")`. The engine does not read or write the document, create DOM nodes,
start a frame loop, or hold singleton state.

`worldFrame` has local width and height, the home mound geometry, usable letters with stable IDs and
geometry, obstacle rectangles, candidate mound sites, and monotonic `nowMs`. The game adapter owns a persistent mapping
between each existing letter record and its stable ID, even when hiding a glyph splits a text node.
The note adapter assigns stable IDs to its private source glyphs. Both world ports refresh geometry
without changing IDs. The engine owns letter assignment and all actor decisions. The world effect
union is:

- letterClaimed with letterId and antId exactly when a glyph changes from free to gather;
- letterRestored with letterId and local x/y;

Mound creation, growth and removal live in engine state and each snapshot; the renderer draws them
from the snapshot. Snapshot data has this schema (all IDs are stable within an engine instance):

```ts
type NestSnapshot = {
  elapsedMs: number;
  colony: { paused: boolean; over: boolean; overrun: boolean; queenDead: boolean;
    stores: number; larder: string[]; built: number; stolenTotal: number; peak: number;
    worshipIndex: number; worshipThreshold: number;
    worshipPhase: "home" | "gathering" | "dance" | "returning" };
  queen: { x: number; y: number; visible: boolean };
  ants: Array<{ id: string; role: string; job: string; location: "nest" | "world";
    x: number; y: number; heading: number; walkPhase: number; health: number;
    targetId?: string; trailId?: string; letterId?: string; moundId?: string }>;
  letters: Array<{ id: string; x: number; y: number; state: string; carrierIds: string[] }>;
  trails: Array<{ id: string; side: "main" | "rival"; state: string; points: number[][];
    antIds: string[]; letterIds: string[] }>;
  mounds: Array<{ id: string; x: number; y: number; progress: number; health: number }>;
  eggs: Array<{ id: string; x: number; y: number; progress: number }>;
  rival: null | { active: boolean; stores: number; stolenTotal: number;
    ants: Array<{ id: string; role: string; job: string; x: number; y: number;
      heading: number; walkPhase: number; health: number; letterId?: string }>;
    mounds: Array<{ id: string; x: number; y: number; progress: number; health: number }> };
};
```

Engine internals may use Maps, Sets and object references, but snapshots never expose them. The
snapshot fully drives ant, trail, queen, egg and mound rendering. Effects exist only for external
world changes (`letterClaimed: { letterId, antId }`, `letterRestored: { letterId, x, y }`) and game
feedback (`log: { message }`, `sound: { tone, durationMs, waveform, volume }`). Every effect is
`{ sequence: number, type: string, payload: object }`. `step` and `command` emit no repeated effect
for the same transition.

The action union is:

```ts
type NestAction =
  | { type: "squashAnt"; antId: string }
  | { type: "wipeTrail"; trailId: string; x: number; y: number }
  | { type: "baitWorld"; x: number; y: number }
  | { type: "sealMound"; moundId: string }
  | { type: "restoreWorld" }
  | { type: "setPaused"; paused: boolean }
  | { type: "setSpeed"; multiplier: 1 | 2 | 4 };
```

The existing speed control cycles 1× → 2× → 4× → 1×. Preserve that order and the current button
labels in the game adapter.

Unknown IDs, non-finite coordinates, unsupported speed values and invalid payloads produce no state
change and return the current snapshot with no effects. Commands never mutate caller payloads. A
letter emits `letterClaimed` once on its free-to-gather transition, never again when it moves through
carried or stored; it emits `letterRestored` once when `restoreWorld` or `reset` returns it to free.
`step` advances the same transition groups in this order, using seconds for `dt` and the supplied
simulation timestamp for deadlines:

1. Complete active worship with `stepParty`, if the queen is away.
2. Process queued scouts, then each living actor through `stepNest` or `stepPage` according to its
   location. `stepPage` retains its existing target selection, trail creation, assignment and letter
   carrying decisions; DOM geometry becomes world-frame geometry.
3. Advance rival combat, attack and founding decisions for full-game instances. Rival-disabled
   instances do not create rival actors or transitions.
4. Advance queen feeding and egg incubation/hatching, then soldier recruitment and colony caps.
5. On a 100 ms simulation cadence, expire trails, check colony wipe/scout recovery, start worship
   when `stolenTotal` reaches the existing `TUNING.party[nextParty]`, and advance `tickMinis` mound
   construction. The engine keeps a 100 ms accumulator; `step(dt, worldFrame)` adds clamped,
   speed-scaled `dt` only while active and runs each due cadence tick once. The supplied monotonic
   `worldFrame.nowMs` drives existing absolute deadlines, including pause-duration deadlines; reset
   clears the accumulator and elapsed simulation time. Hidden-page pausing belongs to each adapter.
6. Return the frozen snapshot and effects. Drawing, sounds, logging, and scheduling remain adapter
   work and are not transitions.

The game adapter applies world effects exactly once after each step and renders the returned
snapshot. Game controls translate user input to one action and call command(); they do not mutate
engine state. The note adapter applies effects only to its private sentence and view.

The engine owns colony setup and teardown; ant roles and lifecycle; movement and heading; scouting,
trail creation and decay, letter assignment and carrying; larder, food, stores and eggs; hatching;
builders and mound progress; worship timing and return; rival and combat state for the full game;
and tool-driven state transitions such as squash, wipe, bait, seal and restore. It uses the current
shared pure rules from nest-simulation.js and the assets from nest-assets.js.

The existing game adapter owns the page-wide layer, real text geometry, sidebar markup, controls,
user input, page lifecycle, sound, logging and rendering. It builds each worldFrame by measuring live text,
obstacles and mound sites. The engine returns letterClaimed and letterRestored effects; the adapter
maps their IDs back to actual text nodes and hides or restores those glyphs. The adapter creates one
engine instance, translates the existing controls to the named actions, applies each returned
effect once, renders snapshot(), and drives step() from its frame loop. The existing
`window.__nest` exists only on `?nest-debug` and remains an adapter-owned compatibility facade with
the current entry points and signatures. In debug mode only, `state`, `rival` and `home` are direct
references to the engine's actual mutable state, with the existing property names and value shapes.
E2E setup mutations take effect immediately on that instance; the next `snapshot()` reflects them
without a proxy or synchronization step. This is the sole mutable-state escape hatch and is absent
from production and the note adapter. Snapshot immutability applies outside this debug facade.
Preserve these helpers and exact current signatures as adapter-owned wrappers over that same engine
instance: `startParty(final?)`, `wipeTrail(trail, at)`, `retire(trail)`, `squash(ant)`,
`makeMini(spot)`, `findMiniSpot()`, `newAnt(role, route, d)`, `label(ant)`, `foundRival()`,
`startRival()`, `forceRivalSteal()`, `finishFights()`, `spawnPageAnt(role, at, mini)`,
`spawnRivalUnit(job, at, path, sweet)`, `rivalCombat(now)`, `retreatRival()`,
`removeRivalAnt(ant)` and `needOf(node)`. Rendering-only wrappers may touch the DOM; their state
transitions must call engine-owned transitions before rendering. Preserve all existing debug
properties read or mutated by the four linked E2E suites.

Add the debug-only helper `setTestRandom(value: number | null)`. A finite value in `[0, 1)` overrides
the engine's next and subsequent random draws with that constant; `null` restores the seeded stream
at its current state. Migrate the two combat tests in `e2e/nest-behavior.e2e.ts` that currently stub
`Math.random` to call this helper and clear it in `finally`. Their exact 60% guard and 75% flyer
outcome assertions remain unchanged. This hook does not exist in production or in the note adapter.

The note adapter owns a private sentence and its bounded DOM world. It creates a separate engine
instance with rival systems disabled, sends only local bounds and targets, applies effects only to
the private sentence, renders the main nest and colony actors, and owns the local frame loop. It
never reads article text, reaches the application sidebar, or creates the full game's page-wide
layer. The note simulation runs one main colony; rival founding and combat remain in the six
existing event figures. Those six bounded figures keep their event choreography and continue to
call the shared pure rules. They are not the source of the new continuous colony simulation.

The existing [nest-simulation.js](../scripts/nest-simulation.js) remains the shared home for pure
rules already used by both renderers. The existing [nest-assets.js](../scripts/nest-assets.js)
remains the source for ant cells, caste appearances and mound art. Do not copy those assets or rules
into the new renderer.

## Instance behavior

The note instance starts an independent colony with the actual game's autonomous rules. Scouts find
letters in its sentence, workers follow trails and carry them home, food feeds the queen and stores,
eggs hatch, and a builder can raise a small mound. Worship follows the game rule: the queen leaves,
available ants gather and circle, stores refill, and she returns. The deterministic fixture source
is the sentence `ants carry the colony forward, one small letter at a time, and bring each word home`.
Its renderer wraps and repeats that sentence as separate source lines until the world contains
exactly seventy-two usable letter IDs; spaces and punctuation are not claimable. IDs remain stable
throughout a cycle. That is enough to reach the real first and second worship thresholds but not the
third threshold of ninety. The game keeps delivered glyphs hidden and counts them in its stores, so
the cycle is depleted when all source glyphs have been claimed and stored, the queen has returned,
and no actor has a claimed letter in transit. At that point the note adapter calls `reset()`; its
`letterRestored` effects visibly restore every hidden glyph and it shows the fresh nest/source state
before stepping again. Do not lower the game threshold to make the figure cycle faster.

Rival founding and combat are outside this figure. The note already shows those as separate events,
and a second colony is not needed to show the main colony's everyday loop.

The reset may choose when the world starts again. It must not choose actor positions frame by frame
or schedule a predetermined sequence of actions. Ant positions, targets, hatching, carrying, food,
building and worship must come from the same state transitions used by the real game.

Render the stateful figure as a responsive HTML surface with an accessible name. Its composition is
one small source text at the top, a mound near one end, a curved scent path between source and mound,
and ants following or scouting that route. The mound interior is clipped and contains no visible
actors. There are no labels or meter panels inside the view; stores show through source glyph gaps
and mound progression. At 390×844 the box is the article width and 180 px tall. At 1280×900 it is at
most 720 px wide and 220 px tall. All actors and trails stay inside at both sizes. Completion
includes screenshots of both sizes and an in-browser review of two complete cycles. All colors come
from active theme tokens. Clip the world to its own viewport, and pause its frame loop while the
document is hidden. Reduced motion may remove leg-frame animation but must not replace simulation
movement with CSS motion.

## Keep the boundary honest

- The new figure owns a separate engine instance and never starts the sidebar game.
- The note host exposes testable engine-instance identity and state progress so coverage proves that
  the shared engine drives it.
- Contract tests prove two engine instances do not share ants, letters, pause state or reset state;
  identical seeds, frames and commands reproduce snapshots; reset uses current-frame geometry and
  emits restoration only for hidden glyphs; invalid commands are no-ops; destroyed instances reject
  later calls; and effect sequences are unique and increasing.
- The engine test verifies reset restores the first worship threshold and that an in-flight carry
  cannot trigger the note's completion reset.
- The existing six bounded event figures remain, unchanged in purpose.
- No iframe, screenshot, GIF, hand-authored keyframes or second copy of the game rules or ant art.
- A test must show that the note instance advances colony state, hatches or builds, reaches worship,
  resets after exhausting its world, and keeps every rendered actor inside its viewport.
- The real game tests must continue to pass with its page-wide text and sidebar adapters.
- The note test must confirm that no sidebar game or extra page-wide ant layer starts on the note.
- Verify theme switching, reduced motion, two complete note simulation cycles and no page errors.

## Implementation order

1. Add failing engine contract tests for two isolated instances, deterministic seeded transitions,
   every effect and command, exactly-once effect sequencing, detached frozen snapshots, reset and
   destroyed-instance behavior.
2. Move colony transitions into `scripts/nest-engine.js` and import that module from
   `nest-game.js`. Extract state construction and each named transition group without changing its
   decisions. Keep DOM reads/writes and UI work in the adapter. Immediately run the targeted game
   E2E cases against the adapter before mounting another instance.
3. Preserve `window.__nest` behind its existing debug query guard, with the exact live-state, helper
   and test-RNG compatibility contract above. Migrate the two Math.random-stubbing combat tests to
   `setTestRandom`. Run `nest-behavior.e2e.ts`, `nest-gameplay.e2e.ts`,
   `nest-scenarios.e2e.ts`, and the terminal colony cases before mounting a second instance.
4. Mount the note world's bounded sentence, mound and actor layer through a second engine instance,
   with rival systems disabled. Verify separate instance identity and that stepping/resetting either
   one leaves the other instance unchanged.
5. Add the new figure and its external caption while leaving the six event figures and surrounding
   story in place.
6. Verify two complete cycles at both target viewport sizes, both worships before reset, source
   restoration after all carries reach stores, visible reset, actor containment, theme response,
   reduced motion, and no sidebar game,
   page-wide ant layer, console errors or page errors on the note.

## Known risk

The current game loop contains many page and sidebar references. If separating those references
requires copying the game loop or changing the real game's behavior beyond the adapter boundary,
stop and report the exact remaining dependency instead of shipping a second mini-engine.
