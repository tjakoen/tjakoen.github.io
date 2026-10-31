---
title: "How to: make a surface operable"
---

The worked example, with real code and a captured request/response, is
[`TUTORIAL.md`](TUTORIAL.md). This page is the bare checklist — use it once you've read the
tutorial once and just need the steps.

## 1. Add the verb to the contract

[`ai/contract.ts`](https://github.com/tjakoen/grain/blob/main/packages/grain/ai/contract.ts) is the one closed registry — never a magic string elsewhere:

```ts
export type ActionName = /* … */ | "my.verb";
export const ACTIONS: Record<ActionName, ActionDef> = {
  /* … */
  "my.verb": {
    name: "my.verb",
    depth: "light",
    accepts: ["my-kind"],
    description: "Apply the supported change to this surface.",
    payload: {},
    hints: {},
  },
};
```

If `"my-kind"` isn't an existing `SurfaceKind`, add it too.

The description, payload schema, and behavior hints are required fields. Describe any input in
the payload schema so the manifest tells a model how to call the verb. Set a behavior hint only
when the operation actually satisfies it.

## 2. Mark the component

On the component's root element:

```html
<article
  data-kind="my-kind"
  data-accepts="my.verb"
  data-bind-data-surface="surface">
  <button
    data-bind-data-action="action.name">
    …
  </button>
</article>
```

`data-kind` + `data-accepts` are harvested at boot into the AI manifest — no separate registration.

## 3. Teach the reasoner

Add a branch in [`ai/reasoner.ts`](https://github.com/tjakoen/grain/blob/main/packages/grain/ai/reasoner.ts)'s `decide()`:

```ts
if (intent.action === "my.verb") {
  // Write through a scoped tool.
  const html = await tools
    .renderSurface(intent.surface);
  return {
    ok: true,
    ops: [{
      target: intent.surface,
      op: "replace",
      html,
      provenance: "ai",
      commit: "committed",
    }],
  };
}
```

## 4. Test it

- **Unit**: the reasoner branch — given an intent, does it return the right ops?
- **Server-door integration**: send the verb to *POST /intent* and confirm the right operation
  reaches */stream*. The portfolio's *bun run dev:stub* selects this transport.
- **Client-door integration**: if the verb should work on a static host, exercise it through the
  browser door and inspect the resulting surface. The portfolio's default development command
  and static export use this transport. A verb that needs storage or server rendering also needs
  a supported client implementation before it can work there; adding it to the registry alone
  does not provide those capabilities.

(CONVENTIONS §6 has the full 3-tier bar; e2e only if the interaction needs a browser to observe,
e.g. a client-side visual effect.)

## 5. Sync the docs

Add the verb to [`AI-INTERFACE.md`](AI-INTERFACE.md)'s vocabulary section. The contract remains the
registry's source of truth; the guide explains the operation and its transport limits to the next
person who needs to use it.

## Walk the existing contact field before adding another verb

The portfolio is a runnable consumer example. From its repository root, install the frozen lockfile
and the matching browser runtime, then exercise both transports:

```sh
bun install --frozen-lockfile
bunx playwright install chromium
bun run check
bun test src/ai/desk-reasoner.test.ts
bunx playwright test desk-contact-prefill desk-grounding-recovery --workers=1
```

The browser cases use the real registered contact field and client door with model availability
disabled. They verify on-page filling, cross-page drafting, missing-message refusal and denied
storage. The field changes through field.set and exposes AI provenance until the visitor edits it.
The denied-storage cases must retain a copyable draft without navigation. None sends a message.

For the server transport, run the integration case that submits an intent and reads its SSE result:

```sh
bun test src/routes/ai-routes.integration.test.ts
bun run dev:stub
```

The stub is intentional choreography for the server example. The normal development command and
static export use the browser client door; a successful server handler does not prove that a static
page can execute that verb. Natural-language generation needs a separate WebGPU run. The generic
model reasoner rejects registered verbs it does not implement, so adding a contract entry alone is
not enough. Follow the file and component steps above, then add the corresponding behavior and
refusal assertions for the new surface.
