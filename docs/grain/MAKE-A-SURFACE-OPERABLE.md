# How to: make a surface operable

The worked example, with real code and a captured request/response, is
[`TUTORIAL.md`](TUTORIAL.md). This page is the bare checklist — use it once you've read the
tutorial once and just need the steps.

## 1. Add the verb to the contract

[`ai/contract.ts`](../ai/contract.ts) is the one closed registry — never a magic string elsewhere:

```ts
export type ActionName = /* … */ | "my.verb";
export const ACTIONS: Record<ActionName, ActionDef> = {
  /* … */
  "my.verb": { name: "my.verb", depth: "light", accepts: ["my-kind"] },
};
```

If `"my-kind"` isn't an existing `SurfaceKind`, add it too.

## 2. Mark the component

On the component's root element:

```html
<article data-kind="my-kind" data-accepts="my.verb" data-bind-data-surface="surface">
  <button data-bind-data-action="action.name">…</button>
</article>
```

`data-kind` + `data-accepts` are harvested at boot into the AI manifest — no separate registration.

## 3. Teach the reasoner

Add a branch in [`ai/reasoner.ts`](../ai/reasoner.ts)'s `decide()`:

```ts
if (intent.action === "my.verb") {
  // do the write through a scoped tool (never reach storage directly)
  const html = await tools.renderSurface(intent.surface);
  return { ok: true, ops: [{ target: intent.surface, op: "replace", html, provenance: "ai", commit: "committed" }] };
}
```

## 4. Test it

- **Unit**: the reasoner branch — given an intent, does it return the right ops?
- **Integration**: the door — `POST /intent` with the verb, does the right op land on `/stream`?

(CONVENTIONS §6 has the full 3-tier bar; e2e only if the interaction needs a browser to observe,
e.g. a client-side visual effect.)

## 5. Sync the docs

Add the verb to [`AI-INTERFACE.md`](AI-INTERFACE.md)'s vocabulary section — it's the contract's
single source, and a verb that isn't documented there is a verb the next person won't know exists.
