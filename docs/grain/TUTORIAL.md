---
title: "Tutorial: build your first operable surface"
---

This walks through **one real verb on one real surface** in the live stack, piece by piece, in the
order you'd build it: `item.archive` on a mail row. Every file and line quoted below is code the
running site executes, and the request/response at the end is captured from an integration test that
POSTs to the real door and reads the ops back off a live SSE connection. The full contract is
[`AI-INTERFACE.md`](AI-INTERFACE.md); this page is the fastest way to see it work before reading the
whole thing.

**The goal:** one surface a human can operate *and* a decision-maker (a reasoner; a real model at
[ROADMAP.md](https://github.com/tjakoen/bread/blob/main/ROADMAP.md#the-one-milestone-that-changes-what-this-is)'s
M★) can act on, through the exact same door, validated against the same closed vocabulary, rendered
back the same way.

**Where it lives.** The site is one app window; the home route `/` is the desk, and its rail routes
you to `/mail`, where each letter is an operable `item` surface. That row is what we make operable and
what the archive verb targets.

## The five pieces, in build order

### 1. Name the surface and the verb, the contract

Everything operable is declared in one closed registry,
[`ai/contract.ts`](https://github.com/tjakoen/grain/blob/main/ai/contract.ts), never a magic string
elsewhere:

```ts
export type SurfaceKind = "item" | "reflection" | "say-stream" | "screen" | "chat-log" | "notepad" | "field";
export const surface = (kind: SurfaceKind, id?: string): Surface => (id ? `${kind}:${id}` : kind);

export type ActionName =
  | "item.archive" | "say.set" | "say.stream" | "demo.run" | "desk.stop" | "chat.send"
  | "note.append" | "note.replace" | "navigate" | "field.set";

export const ACTIONS: Record<ActionName, ActionDef> = {
  "item.archive": { name: "item.archive", depth: "light", accepts: ["item"],
    description: "Archive an item (stands in for task.complete on the optimistic light path).",
    payload: {}, hints: { idempotent: true } },   // re-archiving is a harmless no-op
  // …
};
```

`"item"` is a surface kind; `"item.archive"` is a verb whose `accepts` list contains it. An address
like `item:mail-welcome` (built with `surface("item", "mail-welcome")`, never hand-concatenated) is
what render ops target. The registry also carries the verb's calling contract, an empty `payload`
(`item.archive` takes no arguments) and its `hints` (`idempotent`, so a replay is harmless), which is
what a reasoner reads from the manifest to invoke it safely.

### 2. Mark the surface in markup

The mail row
([`view/components/molecules/mail-row/mail-row.html`](https://github.com/tjakoen/tjakoen.github.io/blob/main/view/components/molecules/mail-row/mail-row.html))
declares itself operable on its root element:

```html
<a class="mailbox__item" data-kind="item" data-accepts="item.archive"
   data-bind-href="href" data-bind-data-folder="folder" data-bind-data-surface="surface">
  <span class="mailbox__item-from" data-field="from"></span>
  <span class="mailbox__item-subject" data-field="subject"></span>
  <span class="mailbox__item-snippet" data-field="snippet"></span>
</a>
```

`data-kind` plus `data-accepts` are harvested into the AI manifest, so the verb this component
accepts is declared once, here, not hand-listed anywhere else. The `data-surface` value is computed
server-side (`server.ts` sets `surface: item:mail-<id>` on each message view model), so the row that
renders for the welcome letter carries `data-surface="item:mail-welcome"`. That address is what
render ops target and what the live-DOM manifest (and the x-ray overlay) reads back off the page.

### 3. Wire the one door, the composition root

[`src/server.ts`](https://github.com/tjakoen/tjakoen.github.io/blob/main/src/server.ts), the only
place BATCH, GRAIN, MILL, and the app meet, builds the interaction layer once:

```ts
const stream = createStream();
const reasoner = makeStubReasoner({ failRate: Number(Bun.env.AI_FAIL_RATE ?? 0) });
const aiLayer = createInteractionLayer({
  reasoner, stream,
  archiveItem: async () => undefined,
  renderSurface: async () => "",
  logSink: createStreamLogSink(stream),   // record every door crossing to the timeline (§5g)
});
```

`stream` is the `OpChannel` port (push-to-a-session); `archiveItem` and `renderSurface` are the
scoped write capability the reasoner is handed, so GRAIN never reaches storage on its own. Every
request that reaches `POST /intent` ends up at `aiLayer.handleIntent(...)`
([`src/routes/ai-routes.ts`](https://github.com/tjakoen/tjakoen.github.io/blob/main/src/routes/ai-routes.ts)),
which validates the intent against the registry from step 1 before it reaches your code
([`ai/interaction-layer.ts`](https://github.com/tjakoen/grain/blob/main/ai/interaction-layer.ts)):

```ts
if (!isAction(intent.action)) { /* reject: unknown verb, echo the known ones */ }
else if (!ACTIONS[intent.action].accepts.includes(surfaceKind(intent.surface))) { /* reject: wrong surface kind */ }
else decision = await reasoner.decide(intent, tools);
```

> **Honest note on this repo's wiring.** When the `/loop` board retired (2026-07-26) it took the
> only live domain backing for `item.archive` with it, so `archiveItem` and `renderSurface` collapse
> to stubs above. The crossing still validates, commits, and logs (see the captured transcript
> below); only the host-side re-render is a no-op today. Where a visitor actually watches a letter
> get archived (the `/mail` list), the desk drives the reader's own Archive control through its
> client door (`src/ai/desk-door.ts`), the same button a human clicks, so the visible move stays
> honest without a server backing. See the `TODO(owner)` at the end.

### 4. Teach the reasoner the verb

[`ai/reasoner.ts`](https://github.com/tjakoen/grain/blob/main/ai/reasoner.ts) is the single writer,
the only place a verb's effect gets decided. It reaches storage and rendering through **scoped
tools** (`ReasonTools`), never directly. `item.archive` is the light path:

```ts
// item.archive: commit the write, then emit the confirmed (clean) fragment.
const id = surfaceId(intent.surface);
await tools.archiveItem(id);                          // the real write, through the scoped tool
const html = await tools.renderSurface(intent.surface); // the committed (clean) fragment
return {
  ok: true,
  reply: "Archived.",
  ops: [{ target: intent.surface, op: "replace", html, provenance: "ai", commit: "committed" }],
};
```

Note what this is *not*: there's no bespoke "archive endpoint." A verb's whole behavior is this one
branch, write then hand back a `RenderOp` addressed at the surface it touched. Set `AI_FAIL_RATE=1`
and the same branch takes the rollback path instead: a `flash` op with `provenance: "system"` and no
write, so the optimistic state clears and the failure surfaces.

### 5. Drive it, grade-as-signal made visible

A click on a control marked `data-action="item.archive"` is turned by the client dispatcher
([`grain/scripts/ai-dispatch.js`](https://github.com/tjakoen/grain/blob/main/scripts/ai-dispatch.js))
into `POST /intent`. The HTTP door always stamps `source: "user"`; the client can never self-declare
as the AI (`parseIntent` in
[`src/routes/ai-routes.ts`](https://github.com/tjakoen/tjakoen.github.io/blob/main/src/routes/ai-routes.ts)
ignores the client's `source`). What you built in step 4 runs identically no matter what triggered
it: a plain click, or (once a real model is wired at M★) an in-process decision.

On the **light path**, the grade tells the story (`AI-INTERFACE.md` §5): the moment the control is
used it goes `data-commit="pending"` and renders grain (in transit), and when the committed
`replace` lands over SSE the surface settles clean. That is the whole grade-as-signal contract, grain
means AI or in-flight, clean means human and committed, expressed with one op.

## Run it yourself

```sh
bun run dev   # http://localhost:3000
```

`POST /intent` returns `202` immediately (fire-and-forget: the door acknowledges, the result lands
over SSE), and the `/stream` connection pushes the confirmed op back. Captured from the integration
test that spins up the real door and reads the ops off a live SSE connection
([`src/routes/ai-routes.integration.test.ts`](https://github.com/tjakoen/tjakoen.github.io/blob/main/src/routes/ai-routes.integration.test.ts)):

```
POST /intent {"source":"user","session":"s1","screen":"mail","surface":"item:mail-welcome","action":"item.archive","payload":{}}
→ 202

event: op
data: {"target":"item:mail-welcome","op":"replace","provenance":"ai","commit":"committed","html":""}

event: op
data: {"target":"timeline","op":"log","provenance":"user", …}   // the human's request

event: op
data: {"target":"timeline","op":"log","provenance":"ai", …}     // the AI's response
```

Two things to read here. The committed `replace` is the op step 4 returned, addressed at the surface
it touched; its `html` is empty on this repo because the host-side write is a stub today (the honest
note in step 3). And every crossing, the request *and* the response, is recorded to the `timeline`
surface as a `log` op, source-tagged, one door and one format for both operators (`AI-INTERFACE.md`
§5g).

Alongside it, `GET /ai/manifest?screen=mail` returns the machine-readable map of what's operable, the
same registry from step 1 telling you (or a model) what's invokable right now. The manifest route
advertises the global-chrome surfaces (`reflection`, `chat-log`); to see the mail rows themselves as
operable `item` surfaces with `item.archive` on them, open `/mail?xray` (the x-ray overlay) or run
`context` in the terminal island, both read the live-DOM manifest straight off the rendered
`[data-surface]` markup from step 2.

## Add your own verb

The procedure above generalizes to any new verb. The bare checklist lives in
[`MAKE-A-SURFACE-OPERABLE.md`](MAKE-A-SURFACE-OPERABLE.md); in short:

1. `ai/contract.ts` add the `ActionName` plus its `ACTIONS` entry (`accepts` the right
   `SurfaceKind`s, with a `payload` schema and `hints`).
2. A reasoner branch (`ai/reasoner.ts`) decide what the verb does, return the `RenderOp`s.
3. A component marks itself with `data-kind` plus `data-accepts`, no other wiring needed for the
   manifest to pick it up.
4. A test per tier, a reasoner unit test and a door integration test (see
   [`CONVENTIONS.md`](../../batch/docs/CONVENTIONS.md) §6).
5. Sync [`AI-INTERFACE.md`](AI-INTERFACE.md)'s vocabulary section.

For adding a whole component or a new render-op kind, see
[`ADD-A-COMPONENT.md`](ADD-A-COMPONENT.md) and
[`ADD-A-RENDER-OP-KIND.md`](ADD-A-RENDER-OP-KIND.md) in the [developer docs hub](/docs).

---

`TODO(owner):` This tutorial teaches `item.archive` end to end through the real door, and the
door-level transcript is genuinely reproducible (it's an integration test). But the *visible*
end-to-end (a visitor watches a `/mail` letter settle grain then clean over the server SSE channel)
is not wired on the live site: the domain backing retired with the `/loop` board, so `archiveItem` /
`renderSurface` are stubs and the committed fragment is empty, and the `/mail` archive a visitor sees
is a client-island DOM move driven by the desk, not a server-door re-render. If you want the "watch
it settle over SSE" step to be literally reproducible in a browser (not only in the integration
test), re-wire a small host-surface backing for `item.archive` against a real `/mail`-style board, or
retarget this tutorial's piece 5 onto a verb whose live effect is already server-rendered.
