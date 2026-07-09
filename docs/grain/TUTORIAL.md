# Tutorial: build your first operable surface

This walks through **one real, already-running example** in this repo — `item.archive` on the
`/loop` demo — piece by piece, in the order you'd build it. It's not a toy: every file and line
quoted below is the code the live site runs, and the transcript in "run it yourself" is a real
request/response captured against a running server, not a mockup. The full contract is
[`AI-INTERFACE.md`](AI-INTERFACE.md); this page is the fastest way to see it work before reading
the whole thing.

**The goal:** one surface — a task card — that a human can click *and* a decision-maker (a
reasoner; a real model at [ROADMAP.md](../../ROADMAP.md)'s M★) can act on, through the exact same
door, validated against the same closed vocabulary, rendered back the same way.

## The five pieces, in build order

### 1. Name the surface and the verb — the contract

Everything operable is declared in one closed registry,
[`ai/contract.ts`](../ai/contract.ts) — never a magic string elsewhere:

```ts
export type SurfaceKind = "item" | "reflection" | "say-stream" | "screen" | "chat-log";
export const surface = (kind: SurfaceKind, id?: string): Surface => (id ? `${kind}:${id}` : kind);

export type ActionName = "item.archive" | "say.set" | "say.stream" | "demo.run" | "desk.stop" | "chat.send";

export const ACTIONS: Record<ActionName, ActionDef> = {
  "item.archive": { name: "item.archive", depth: "light", accepts: ["item"] },
  // …
};
```

`"item"` is a surface kind; `"item.archive"` is a verb that `accepts` it. An address like
`item:ITM-seed-1` (built with `surface("item", "ITM-seed-1")`, never hand-concatenated) is what
render ops target.

### 2. Mark the surface in markup

[`components/molecules/loop-card/loop-card.html`](../../tjakoen.github.io/components/molecules/loop-card/loop-card.html):

```html
<article class="loop-card" data-kind="item" data-accepts="item.archive"
         data-bind-data-surface="surface" data-bind-data-commit="commit">
  <b-text as="h3" class="loop-card__title" data="name"></b-text>
  <span class="loop-card__status" data-field="status.label"></span>
  <button class="btn" data-bind-data-action="action.name" data-field="action.label">Archive</button>
</article>
```

`data-kind` + `data-accepts` are harvested at boot into the AI manifest (`/ai/manifest`) — so the
verb this component accepts is declared once, here, not hand-listed anywhere else. The rendered
button carries `data-action="item.archive"`; clicking it is what the dispatcher turns into a
request.

### 3. Wire the one door — the composition root

[`server.ts`](../../tjakoen.github.io/server.ts) (the *only* place BATCH + GRAIN meet) builds the
interaction layer once:

```ts
const stream = createStream();
const reasoner = makeStubReasoner({ failRate: Number(Bun.env.AI_FAIL_RATE ?? 0) });
const aiLayer = createInteractionLayer({
  reasoner, stream,
  archiveItem: (id) => service.archiveTask(id).then(() => undefined),
  renderSurface,
});
```

`stream` is the `OpChannel` port (push-to-a-session); `archiveItem`/`renderSurface` are the scoped
write capability GRAIN is handed — it never reaches storage on its own. Every request that reaches
`POST /intent` ends up at `aiLayer.handleIntent(...)`
([`routes/ai-routes.ts`](../../tjakoen.github.io/routes/ai-routes.ts)), which validates the intent
against the registry from step 1 before it ever reaches your code:

```ts
if (!isAction(intent.action)) { /* reject: unknown action */ }
else if (!ACTIONS[intent.action].accepts.includes(surfaceKind(intent.surface))) { /* reject: wrong surface */ }
else decision = await reasoner.decide(intent, tools);
```

### 4. Teach the reasoner the verb

[`ai/reasoner.ts`](../ai/reasoner.ts) is the single writer — the only place a verb's effect gets
decided. `item.archive` falls through to the default path:

```ts
const id = surfaceId(intent.surface);
await tools.archiveItem(id);                          // the real write, through the scoped tool
const html = await tools.renderSurface(intent.surface); // the committed (clean) fragment
return { ok: true, reply: "Archived.",
  ops: [{ target: intent.surface, op: "replace", html, provenance: "ai", commit: "committed" }] };
```

Note what this is *not*: there's no bespoke "archive endpoint." A verb's whole behavior is this one
branch — write, then hand back a `RenderOp` addressed at the surface it touched.

### 5. Drive it

A click on the button (`data-action="item.archive"`) is turned by the client dispatcher
(`grain/scripts/ai-dispatch.js`) into `POST /intent`. The HTTP door always stamps
`source: "user"` — the client can never self-declare as the AI
([`routes/ai-routes.ts`](../../tjakoen.github.io/routes/ai-routes.ts) `parseIntent`). What you
watched happen in step 4 runs identically no matter what triggered it: a plain click, or (once a
real model is wired at M★, see [ROADMAP.md](../../ROADMAP.md)) an in-process decision. Same door,
same registry, same reasoner — that symmetry is the whole point.

## Run it yourself

```sh
bun run dev   # http://localhost:3000
```

Open `/loop`, click **Archive** on a task card. In the Network tab you'll see `POST /intent` return
`202` immediately (fire-and-forget — the door acknowledges, the result lands over SSE) and the
`/stream` connection push the confirmed op back. Captured for real against a running server:

```
POST /intent {"session":"…","screen":"loop","surface":"item:ITM-seed-1","action":"item.archive"}
→ 202

event: op
data: {"target":"item:ITM-seed-1","op":"replace","provenance":"ai","commit":"committed",
       "html":"<article class=\"loop-card\" …><span …>Archived</span>…</article>"}
```

The card the dispatcher swaps in is the exact HTML step 4 rendered. Open `/ai/manifest?screen=loop`
alongside it — that's the same registry from step 1, telling you (or a model) what's operable
right now.

## Add your own verb

The procedure above generalizes to any new verb. The checklist (from this repo's
[`CLAUDE.md`](../../CLAUDE.md) alignment table):

1. `ai/contract.ts` — add the `ActionName` + its `ACTIONS` entry (`accepts` the right `SurfaceKind`s).
2. A reasoner branch (`ai/reasoner.ts`) — decide what the verb does, return the `RenderOp`s.
3. A component marks itself with `data-kind` + `data-accepts` — no other wiring needed for the manifest to pick it up.
4. A test per tier — a reasoner unit test, a door integration test (see [`CONVENTIONS.md`](../../batch/docs/CONVENTIONS.md) §6).
5. Sync [`AI-INTERFACE.md`](AI-INTERFACE.md)'s vocabulary section.

A dedicated how-to guide for this (and for adding a route, a component, or a render-op kind) is
planned but not written yet — see the [developer docs hub](/docs) for what's next.
