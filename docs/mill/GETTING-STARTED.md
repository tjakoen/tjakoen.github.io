---
title: "Getting started with MILL"
---

MILL, **Markdown In, Living Layouts**, is a Markdown → GRAIN-pages CMS: feed it a folder of `.md`
files (frontmatter + prose) and it renders them as real GRAIN pages by mapping Markdown nodes to
components. It sits a layer above the stack (`batch → grain → MILL`), depending on both and
extending neither. The full mapping model is [`ARCHITECTURE.md`](ARCHITECTURE.md); this page is the
fastest path to a rendered page.

## Install

MILL is published to GitHub Packages as `@tjakoen/mill`, alongside `@tjakoen/grain`:

```json
{
  "dependencies": {
    "@tjakoen/batch": "github:tjakoen/batch#main",
    "@tjakoen/grain": "^0.1.0",
    "@tjakoen/mill": "^0.1.0"
  }
}
```

The `@tjakoen` scope resolves from GitHub Packages, so the consumer also needs an `.npmrc` (the
auth token lives in the environment, never committed):

```
@tjakoen:registry=https://npm.pkg.github.com
```

Inside the grain monorepo itself, MILL is a sibling workspace package (`workspace:*`), no install
step needed there.

## A minimal collection

A collection is a folder of `.md` plus a `MillCollection` describing where it lives and what route
prefix it answers:

```ts
import { createMillRoutes, dirSource } from "@tjakoen/mill/serve.ts";

const collections = [
  {
    prefix: "/docs",
    title: "Docs",
    description: "Guides, rendered from Markdown.",
    source: dirSource("./content/docs"),   // a folder of .md files
  },
];

const serveContent = createMillRoutes({ collections });

// inside your own fetch handler, before your other routes:
const hit = await serveContent(new URL(req.url).pathname);
if (hit) return hit;
```

`createMillRoutes` returns a transport-generic pathname handler, `(pathname) =>
Promise<Response | null>`. `null` means "not a MILL route", so the caller falls through to
whatever serves everything else. With no `compose` passed, the default chrome ships as written
(no component-tag expansion); pass `compose` (BATCH's `renderPage`) once you're wiring an app, so
the chrome and any escape-hatch component tags in the Markdown compose at request time.

## Verify it

```sh
bun run dev
# then visit /docs            the index, built from every .md's frontmatter
#            /docs/<slug>      one entry, rendered from that file's body
#            /docs/<slug>.md   the raw source, MILL's "honest source" twin route
```

Every filename minus `.md`, lowercased, becomes its slug (`GETTING-STARTED.md` → `getting-started`).

## Next steps

- Read [`ARCHITECTURE.md`](ARCHITECTURE.md) for the mapping model (frontmatter → layout, block →
  component), the content-source port, and the escape hatch.
- Read [`ADD-A-COLLECTION.md`](ADD-A-COLLECTION.md) for the full `MillCollection` shape, using the
  portfolio's own wiring as the worked example.
- See it live: this very page renders through MILL, and so do the layer docs it builds on,
  [GRAIN's getting-started](grain/docs/GETTING-STARTED.md) and
  [BATCH's getting-started](batch/docs/GETTING-STARTED.md).
- The canonical plan (design, seams, what's built vs. deferred) is
  [`mill/PLAN.md`](https://github.com/tjakoen/grain/blob/main/packages/mill/PLAN.md).
