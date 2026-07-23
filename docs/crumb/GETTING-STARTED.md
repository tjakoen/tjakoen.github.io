---
title: "Getting started with CRUMB"
---

CRUMB is the GRAIN stack's guided-tour layer: it turns a folder of markdown files into a walkthrough
that highlights real, live surfaces in your app, one at a time, using GRAIN's own traveling lamp. A
tour never edits your app or your data; it only reads and highlights. The same tour doubles as an
AI-review walkthrough (a "here's what changed, mark it verified" mode) when you flip it to dev mode.
It is live in production on this site: the "Tour" entry point on the desk runs on this exact package.
The full design reasoning is in [`PLAN.md`](https://github.com/tjakoen/grain/blob/main/packages/crumb/PLAN.md);
this page is the fastest path from install to a running tour.

## Install

CRUMB publishes to GitHub Packages, alongside the rest of the GRAIN stack. Point npm/bun at that
registry for the `@tjakoen` scope, then add the package:

```
# .npmrc
@tjakoen:registry=https://npm.pkg.github.com
```

```sh
bun add @tjakoen/crumb    # or: npm install @tjakoen/crumb
```

CRUMB depends on `@tjakoen/grain` and `@tjakoen/mill`; both need to already be installed and wired
into your app (CRUMB reuses GRAIN's lamp and MILL's frontmatter parser rather than shipping its own).

## Mount it over a tours folder

CRUMB's library is transport-generic: `createCrumbRoutes` returns a plain
`(pathname) => Promise<Response | null>` handler, the same shape MILL and PROOF use. Mount it in
front of your own routing and let it fall through (`null`) for anything it doesn't answer:

```ts
import { createCrumbRoutes } from "@tjakoen/crumb/routes.ts";

const crumbRoutes = createCrumbRoutes({
  toursDir: "./content/tours",   // a folder of tour .md files
  // prefix: "/crumb",           // optional; defaults to "/crumb"
});

// inside your request handler, before your own page routes:
const fromCrumb = await crumbRoutes(pathname);
if (fromCrumb) return fromCrumb;
```

That's the whole server-side wiring. `toursDir` is the only required option; `prefix` defaults to
`/crumb` and only needs to change if that path collides with something else your app already serves.

## Serve the client assets

`createCrumbRoutes` only serves tour *data* (parsed markdown as JSON). The client that actually
drives the lamp and the popover, `crumb-live.js`, plus its stylesheet `crumb.css`, are static files
inside the package. Your host resolves and serves them itself, the same way it serves any other
static asset:

```ts
import { fileURLToPath } from "node:url";

const CRUMB_LIVE = fileURLToPath(import.meta.resolve("@tjakoen/crumb/crumb-live.js"));
const CRUMB_CSS = fileURLToPath(import.meta.resolve("@tjakoen/crumb/crumb.css"));
```

Then link `crumb.css` in your page `<head>` and load `crumb-live.js` as a native ES module
(`<script type="module" src="/crumb-live.js">`) on every page a tour might run on. `crumb-live.js`
imports `/scripts/ai-spotlight.js`, GRAIN's traveling lamp, at that exact root-relative path, so your
host needs to be serving GRAIN's scripts there already (the same script the AI-interaction layer
uses for its own spotlight).

**Caveat, confirmed in source:** `crumb-live.js` fetches tour data from a hardcoded `/crumb/tours/…`
path. If you mount `createCrumbRoutes` at a non-default `prefix`, the shipped client will not find
your tours; only the default `/crumb` mount works with the client as published today.

## What it serves

Once mounted, CRUMB answers two read-only routes under your prefix (default `/crumb`):

| Route | Returns |
|---|---|
| `GET /crumb/tours.json` (or `/crumb/tours`) | A manifest: every tour in `toursDir` as `{ id, title, mode, route, steps }` (`steps` is a count, not the step bodies), what a launcher UI would list. |
| `GET /crumb/tours/<id>.json` | The full parsed `Tour` for one tour (frontmatter + intro + every step). 404 with `"tour not found"` if the id doesn't resolve to a `<id>.md` file in `toursDir`. |

Both are plain reads; nothing under `/crumb` ever writes. `<id>` must match `^[a-z0-9][a-z0-9._-]*$`
(a traversal-safe id shape) or the route falls through as not-found.

## Starting a tour on the page

`crumb-live.js` exposes a declarative launcher, no inline JS required:

```html
<a data-crumb-start="portfolio" data-crumb-mode="demo">Take the tour</a>
```

`data-crumb-mode` (`demo` or `dev`) and `data-crumb-frame` (presence = run in the framed app-shell
variant instead of a floating popover) are both optional. The same behavior is available
programmatically as `window.crumb.start(id, { mode, frame })`, plus `window.crumb.next()`,
`.prev()`, `.end()`, and `.setMode("demo" | "dev")`. Progress lives in `sessionStorage`, so a tour
step that requires a real page navigation survives the reload.

## Lint your tours

```sh
bunx crumb check tours    # or: bunx crumb check   (defaults to ./tours)
```

Reports each tour's step count and mode, or the parse problems for any tour that has them
(duplicate ids, an invalid `mode`/`status`, a step with no surface, a tour with zero steps). Exits
nonzero on any problem, so it's CI-able. `crumb check` is the only subcommand implemented today;
`crumb serve` and `crumb init` are named in `cli.ts`'s help text but not yet built (planned, see
`PLAN.md`'s phased build). Until then, a host wires `createCrumbRoutes` into its own server as
shown above, and writes tour files by hand.

## Next steps

- Read [`WRITE-A-TOUR.md`](WRITE-A-TOUR.md) for the tour markdown format: frontmatter, the
  `## <surface>` step grammar, and a real worked example from this site.
- Read CRUMB's [`PLAN.md`](https://github.com/tjakoen/grain/blob/main/packages/crumb/PLAN.md) for
  the full design: why tours are markdown, the reuse-not-rebuild table against GRAIN's existing
  mechanisms, and the flagship AI-review tour that projects itself from GRAIN's audit trail.
- See it running at the "Tour" entry point on this site, or read the live mount in
  `tjakoen.github.io`'s `src/server.ts` (search for `CRUMB_TOURS`).
- If you haven't already, read [GRAIN's getting-started](/grain/docs/getting-started): CRUMB
  builds entirely on top of GRAIN's addressable surfaces and traveling lamp.
