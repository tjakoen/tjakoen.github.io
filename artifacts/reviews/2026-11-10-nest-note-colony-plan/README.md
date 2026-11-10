# Plan review: the note's live colony

The comprehension pass found that the first draft left the rival-colony scope unclear. The plan now
states that the new figure runs the main colony only; rival founding and combat stay in the existing
event figures.

The critic pass found three gaps:

1. The engine boundary did not name state creation, ticking, rendering, or teardown. The plan now
   assigns those responsibilities to an engine instance and gives world and view adapters explicit
   jobs.
2. The private sentence could run out before worship. The plan now requires at least fifty usable
   letters, keeps the real worship thresholds, and resets only after the second worship and source
   exhaustion.
3. The note test could pass on a separate scripted loop. The plan now requires visible engine
   instance identity and state progress as test evidence.

The first readiness pass was NO-GO because the plan still asked the implementer to choose which
transitions the engine owned. The plan now defines `createNestEngine`, its step, command, snapshot
and reset operations, the worldFrame input, the returned effect list, and the transitions that live
in the engine. It assigns DOM effects, world geometry, controls, frame scheduling and rendering to
the two adapters.

The next readiness pass was also NO-GO. It found four remaining contracts to settle:

1. Direct E2E mutation through `window.__nest.state` conflicted with routing gameplay mutations
   through engine commands. The plan now makes that mutable reference an explicit debug-only escape
   hatch to the same instance; production and note adapters receive only immutable snapshots.
2. The state boundary needed a data shape. The plan now specifies stable IDs and a detached frozen
   snapshot for ants, letters, trails, mounds, eggs, worship, colony stores and rival state, while
   leaving Maps, Sets and object references private to the engine.
3. Rendering effects needed a clear split. Snapshots drive actors, trails and colony structures;
   sequenced effects drive text glyph changes and game feedback. The plan defines those payloads.
4. The frame cadence needed to work across timing and pause. The plan now uses a 100 ms engine
   accumulator, clamped speed-scaled dt, a supplied monotonic timestamp for existing deadlines, and
   reset of the accumulator.

The source depletion rule now follows the game: claimed letters stay hidden after delivery and count
as stores. Reset waits for all 72 letters to be stored, the queen to return, and no letter to remain
in transit; restoring the source is part of the visible reset. A fresh readiness pass checks the
revised plan before implementation.

That readiness pass found a final source mismatch and control detail: the running game starts one
scout and three workers, and its speed control cycles 1×, 2×, 4×, then 1×. The plan now matches both.
It also records the complete existing `window.__nest` helper surface as adapter wrappers around the
same engine instance and requires all engine-owned random draws to use the seeded stream. The final
readiness pass checks those corrections before implementation.

The next readiness pass caught that the game creates its first egg six seconds after startup and
that engine setup depends on measured home geometry. The plan now requires an initial world frame,
places the initial ants and queen from that frame, and preserves the first egg's six-second wall
clock deadline across pause and speed changes.

That reviewer found a test compatibility gap: two combat assertions currently stub `Math.random`,
while the engine must own a private seeded stream. The plan now exposes a debug-only constant random
override, `setTestRandom`, and migrates those two tests to it while retaining the same outcome
assertions. The final readiness pass checks this compatibility seam.
