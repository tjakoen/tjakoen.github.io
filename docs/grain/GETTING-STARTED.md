---
title: "Getting started with GRAIN"
---

GRAIN is the AI-interaction design system: a UI where every surface is addressable and operable by
both a human and an AI through one shared vocabulary, with the AI's presence shown as a visible
signal (*grain = AI*). It runs on a substrate (BATCH is the reference one) but imports nothing from
it. The full reasoning is [`GRAIN.md`](GRAIN.md); the contract is [`AI-INTERFACE.md`](AI-INTERFACE.md).

## Install

GRAIN is published on npm as `@tjakoen/grain`. Add it to a Bun app with:

```sh
bun add @tjakoen/grain
```

With npm, use `npm install @tjakoen/grain`. The package resolves from the public npm registry, so a
fresh project needs no `.npmrc` or registry token. The GRAIN monorepo uses Bun workspaces for its
internal packages; a separate app installs the published package.

## Two layers — start with just the design system

GRAIN is two things, one-directional, so you can adopt only what you need:

- **The design system** (always usable, no AI required) — the `b-*` atoms, the default theme (`styles/variables.css` → `styles/global.css` → `styles/grain.css`), and grade-as-signal (useful on its own: draft vs. saved, focus/editing, in-transit vs. committed).
- **The AI-interaction layer** (opt-in) — `ai/*` (the door, the contract, the manifest), the dispatcher island (`scripts/ai-dispatch.js`), and `ai/ai.css` (the "AI is acting" spotlight).

To use just the design system in a plain BATCH app, link the three stylesheets and the `b-*` atoms,
then skip `ai/`. Add the AI layer later by following the setup in the
[GRAIN package README](https://github.com/tjakoen/grain/tree/main/packages/grain#readme).

## The markup conventions in one table

| Attribute | On | Means |
|---|---|---|
| `data-surface="kind:id"` | any region | its address — what render ops target |
| `data-action="verb"` | a control | clicking it becomes `POST /intent` with that verb |
| `data-kind` + `data-accepts="v1 v2"` | a component root | harvested into the AI manifest |
| `data-grade="grain\|smooth\|accent"` | any ancestor | provenance: grain = AI, smooth = human |

The verbs themselves live in the closed registry, `ai/contract.ts` (`ActionName` / `SurfaceKind` /
`ACTIONS`) — the single source of truth; never hardcode a verb as a magic string.

## Next steps

- Read [`GRAIN.md`](GRAIN.md) for the full design (surfaces, one vocabulary, render ops, manifest).
- Read [`AI-INTERFACE.md`](AI-INTERFACE.md) for the wire contract (the intent envelope, render-op kinds, the SSE push channel, the AI-acts protocol).
- Browse every component live at [`/catalog`](/catalog) — it's self-documenting.
- See it running end to end on the [`/grain`](/grain) showcase — its "watch the AI act" demo drives a real surface through the one door.
- Follow [`TUTORIAL.md`](TUTORIAL.md) to build one operable surface end to end, with a real captured request/response.
