# How to: add a RenderOp kind

Adding a new *kind* of effect (today's set: `replace` / `append` / `remove` / `flash` / `type` /
`spotlight`) touches two files that must agree on the shape, plus the docs and a test.

## 1. Add the kind to the contract

[`ai/contract.ts`](../ai/contract.ts):

```ts
export type RenderOpKind = /* … */ | "my-op";

export interface RenderOp {
  target: Surface;
  op: RenderOpKind;
  // add any new field this op needs, e.g.:
  myField?: string;
  provenance: Provenance;
  commit: Commit;
}
```

## 2. Teach the client dispatcher

[`scripts/ai-dispatch.js`](../scripts/ai-dispatch.js), inside `applyOneOp`'s `switch (op.op)`:

```js
case "my-op":
  if (el) { /* apply the effect to el using op.myField */ }
  return;
```

A few things every op handler shares, worth reusing rather than re-deriving:
- a **committed** op (or a `flash`) releases the control's pending trigger — `if (op.commit === "committed" || op.op === "flash") clearTrigger(op.target);` runs before the switch, for every op kind, automatically.
- `find(op.target)` resolves the surface address to a DOM element the same way for every op.

## 3. Emit it from the reasoner

Wherever a verb's effect calls for it:

```ts
tools.emit({ target: intent.surface, op: "my-op", myField: "…", provenance: "ai", commit: "committed" });
```

## 4. Test it

A dispatcher-level test (does the DOM update correctly for this op) plus a reasoner test (does the
verb emit the right op). If the op has a visible client effect a `RenderOp` unit test can't observe
(an animation, a scroll), that's what the e2e tier is for.

## 5. Sync the docs

Add the kind to [`AI-INTERFACE.md`](AI-INTERFACE.md)'s render-op table — same rule as a new verb:
undocumented means the next person re-derives it from the dispatcher source instead of reading it.
