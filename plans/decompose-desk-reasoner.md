---
id: decompose-desk-reasoner
status: todo
track: ai
depends: []
touches: [src/ai/desk-reasoner.ts, src/ai/desk-reasoner/, src/ai/desk-turn.ts]
owner: ai
---

# Split the desk reasoner's one thousand line factory

`makeDeskReasoner` is a single 1,436-line factory in `src/ai/desk-reasoner.ts`. The audit of
2026-11-24 filed it as F4 and split `content.ts` in the same pass; this is the half that was not
done, because it is a behavioural refactor of a model-driven surface rather than a move.

## The seam that works

The factory is a closure over six pieces of mutable state and about ten helpers. Every stage already
has a name, so the split is a context object, not a redesign.

1. Define `interface DeskCtx` with the deps (`DeskDeps`), the mutable state (`seq`, `history`,
   `degraded`, `enginePromise`, `lastTarget`), and the helpers each stage uses (`typeOut`,
   `applyOp`, `minThink`, `getCatalog`, `travelAndNavigate`).
2. `src/ai/desk-engine.ts`: `ensureEngine`, `downloadAllowed`, the model-loading progress path.
3. `src/ai/desk-turn.ts`: `decide`, the deterministic branches, the agent loop, the model tail.
4. `src/ai/desk-arrive.ts`: the returned `arrive` generator and its arrival prompt.
5. `makeDeskReasoner` keeps the wiring: build the context, return `{ decide, arrive }`.

## The order, and why

1. Engine first. It is the only stage with no dependency on `history` or the model loop, and its
   progress callback is already explicit.
2. Arrival second. It reads `lastTarget` and writes through `applyOp`, both of which move onto the
   context first.
3. `decide` last, in two commits: the deterministic half (patterns, actions, navigation) and the
   model half (the tail and the agent loop). Splitting a 900-line method in one commit is how a
   silent behaviour change ships.

## The finish line

- `desk-reasoner.ts` under 250 lines: the context type, the wiring, and nothing else.
- No stage file over 500 lines.
- The existing tests (`desk-reasoner.test.ts`, 1,984 lines) pass unchanged. They call the factory,
  so they are the contract; a test that has to change to compile is a behaviour change to justify.
- `bunx playwright test e2e/desk-intent.e2e.ts e2e/grain-page.e2e.ts e2e/welcome-flagship.e2e.ts`
  green, because the desk's behaviour is what those specs actually assert.
- A screenshot of the desk after a real turn, in the session or in a CRUMB tour.
