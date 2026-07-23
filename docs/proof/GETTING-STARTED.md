---
title: "Getting started with PROOF"
---

PROOF turns an AI's development plans, written as `.md` files in a `plans/` folder, into a
kanban board that *renders* them, never the other way around. Files are the source of truth; the
board is a projection that never writes back. The full design law and the schema are
[`HOW-IT-WORKS.md`](HOW-IT-WORKS.md); this page gets a board on screen.

## Install

PROOF is published to GitHub Packages as `@tjakoen/proof`, the same pattern as `@tjakoen/grain` and
`@tjakoen/mill` (it depends on both):

```json
{
  "dependencies": {
    "@tjakoen/batch": "github:tjakoen/batch#main",
    "@tjakoen/grain": "^0.1.0",
    "@tjakoen/mill": "^0.1.0",
    "@tjakoen/proof": "^0.1.0"
  }
}
```

```
@tjakoen:registry=https://npm.pkg.github.com
```

## Mount it over a plans directory

PROOF is a **mountable layer**, not a server of its own. `createProofRoutes(deps)` returns a
transport-generic pathname handler, mirroring MILL's `createMillRoutes`:

```ts
import { createProofRoutes } from "@tjakoen/proof/routes.ts";

const proofRoutes = createProofRoutes({
  plansDir: "./plans",
  prefix: "/plans",                              // "" mounts the board at "/"
  chrome: (title, body) => `<html><head><title>${title}</title></head><body>${body}</body></html>`,
});

// inside your own fetch handler, before your other routes:
const hit = await proofRoutes(new URL(req.url).pathname);
if (hit) return hit;
```

`chrome` is the one thing PROOF asks the host for: it owns the board's *body*, the host owns the
`<head>`/asset links, the same "the layer owns the content, the host owns the shell" split MILL
uses.

## Zero code: `bunx proof serve`

No app to wire it into yet? `bunx proof serve [dir] [--port N]` boots its own self-contained
BATCH+GRAIN server and reads `./plans/` from the current directory (or `dir`, if given). Either
path, the plans stay in your repo. PROOF only ever reads them.

## Verify it

```sh
bun run dev
# then visit /plans              the board, one column per status
#            /plans/plan/<id>    a card's full plan body, rendered through MILL
#            /plans/plans.json   the derived index (the machine "tasks.json")
```

`<id>` is a plan's frontmatter `id`, which is also its filename stem.

## Next steps

- Read [`HOW-IT-WORKS.md`](HOW-IT-WORKS.md) for the schema, the statuses, and why the board never
  writes.
- `proof check [dir]` lints a plans folder (schema validity, dangling `depends`, a `done` plan with
  unticked tasks, a stale `doing`) and exits nonzero, so it's CI-able.
- `proof init [dir]` scaffolds `plans/` plus a contract section for the host's own `CLAUDE.md`,
  non-invasively, it never edits a host's existing files.
- See it live at the portfolio's own [`/plans`](https://tjakoen.github.io/plans), this repo mounts
  PROOF over its own `plans/` folder, `PLANS_DIR`/`PLANS_PREFIX` in `src/plans.ts`.
- The canonical plan (design, seams, what's built vs. deferred) is
  [`proof/PLAN.md`](https://github.com/tjakoen/grain/blob/main/packages/proof/PLAN.md).
