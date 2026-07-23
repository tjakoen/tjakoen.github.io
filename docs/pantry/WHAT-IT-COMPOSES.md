---
title: "What PANTRY composes"
---

PANTRY is a composition root, not a framework of its own: every surface it serves is a real layer's
own code, mounted, not a reimplementation. This page walks through what each of BATCH, GRAIN, MILL,
and PROOF contributes, then lists every route the composed server answers and what each one actually
returns. See [`GETTING-STARTED.md`](GETTING-STARTED.md) for installing and running it.

## The four layers, and what each one gives PANTRY

| Layer | Contributes |
|---|---|
| **BATCH** | The server itself: request handling (`bunRuntime`), static-file serving, a CSS bundler for GRAIN's component styles, and the SSE push transport the live plan board rides on. |
| **GRAIN** | The visual design system (the stylesheets every PANTRY page links), the component catalog at `/catalog`, and the generated AI-vocabulary reference at `/reference` (read from GRAIN's real token/render-op registries, not hand-copied). |
| **MILL** | The markdown-to-page renderer. Every doc collection PANTRY serves (the bundled framework docs, each layer's own `PLAN.md`, `/standards`, and your project's own `./docs`) is a MILL collection, rendered through the same `createMillRoutes` any BATCH app would use. |
| **PROOF** | Your project's plan board. `plans/*.md` files in, a read-only board out, via `createProofRoutes`, plus a live file-watch (`watchPlans`) that pushes board updates over BATCH's SSE stream so the board updates without a refresh. |

Nothing here is bespoke to PANTRY: `pantry/app.ts` (the composition root) is meant to double as a
worked example of wiring these four layers into one server, which is why "compose the layers
yourself instead of running PANTRY" is one of the two supported ways to use the stack (see
`GETTING-STARTED.md`).

## Package-resolved, always

Every bundled asset PANTRY serves (the framework docs, the layer stylesheets, the layer `PLAN.md`
files, the writing standards) is located with `import.meta.resolve("@tjakoen/…")` at boot, never a
relative sibling path. That's what lets the exact same `app.ts` run correctly whether it's sitting
inside the BREAD monorepo during development or installed as a plain published dependency in an
unrelated host project. One consequence worth knowing: BATCH's and GRAIN's own *explanatory* docs
(the pages under `/docs/batch` and `/docs/grain`) and the writing standards (`/standards`) are
canonically homed in the portfolio package (`tjakoen.github.io/docs/…`, `tjakoen.github.io/standards/…`),
not in the `@tjakoen/batch` or `@tjakoen/grain` packages themselves. PANTRY resolves them from that
package, which is why `@tjakoen/pantry` pulls the portfolio package in as a dependency automatically.
If a future host doesn't have it installed, those two doc surfaces and `/standards` simply disable
themselves rather than error.

## Every surface, what it is

```
/                    the HOST project's front door: its plan board, then the AI-facing surfaces
/about               the "here's the BREAD stack" showcase (moved off the front door on purpose)
/plans               the host's own PROOF board, read-only, from ./plans/*.md
/plans/plans.json    the board's machine index
/standards           the writing / README / voice standards, rendered through MILL
/docs                an index of every mounted doc collection (bundled + the host's own)
/docs/batch          BATCH's explanatory docs, resolved from the portfolio package
/docs/grain          GRAIN's explanatory docs, resolved from the portfolio package
/docs/plans          each layer's own canonical PLAN.md (grain, mill, proof, pantry), distinct
                     from /plans, which is THIS project's task board, not the framework's
/docs/<slug>         the host's own docs, one collection per docsDirs entry, rendered in place
/reference           the generated GRAIN vocabulary + design tokens, read from the real source
/catalog             the GRAIN component catalog
/llms.txt            the AI session context pack (see "AI-legible", below)
/knowledge.json      the same brain as /llms.txt, as machine JSON
/map                 the mindmap: a whole-codebase knowledge graph, for the human
/map.json            the mindmap's machine twin
/stream              the SSE channel the live plan board updates ride on
```

Every route above except the static asset routes (`/styles/*`, `/components.css`, `/*.css`,
`/*.js`) is gated by a `surfaces` toggle in `pantry.config.json` (`plans`, `docs`, `reference`,
`catalog`, `standards`); a surface set to `false`, or whose underlying package can't be resolved,
disappears from the nav and its route stops answering, rather than 500ing.

### The home page, in detail

Home is deliberately **not** a pitch for the BREAD stack (that's what `/about` is for). It's the
host project's own front door: a card linking to the plan board, a "Working with AI" section with
two teasers (AI-retrieval, pointing at `/llms.txt`; the mindmap, pointing at `/map`), and a demoted
"Reference surfaces" row linking `/docs`, `/reference`, and `/catalog` for whoever wants them without
putting three framework links ahead of the project's own plans.

### `/about`

The stack showcase that used to be the home page: a card per layer (BATCH, GRAIN, MILL, PROOF, and
PANTRY itself) with an honestly-stated status (`built`, `core + board built`, `early`) rather than a
uniform "done" badge.

## "AI-legible, not AI-powered": `/knowledge.json` and `/llms.txt`

PANTRY runs no language model. What it does is assemble one machine-readable snapshot of everything
the human surfaces render, and expose it two ways:

- **`/knowledge.json`**: the full payload. The project's name, every mounted doc collection and its
  pages, the plan board as PROOF's own derived index, and GRAIN's AI vocabulary (the render-op kinds
  and API endpoints an agent needs to act through GRAIN's door). It carries a literal `runsModel:
  false` field, stated for the machine as well as the human reading the source.
- **`/llms.txt`**: the same brain, rendered as a plain-text, markdown-linked index in the
  [llms.txt](https://llmstxt.org) convention: "what an agent should read first here." A coding agent
  dropped into the host project can fetch this one file and get pointers to the plan board, every doc
  page, and the reference surfaces, without you needing to hand-curate a context file.

Both are derived from the exact same in-memory object (`buildKnowledge`), so the human pages and the
machine payload can't drift apart; there's no second copy to fall out of sync.

## The mindmap: `/map` and `/map.json`

The mindmap is "a picture of the AI's brain for this project": a node-link graph of the codebase and
its docs, clustered and drawn for a human at `/map`, with the identical model exported as JSON at
`/map.json`. Two things worth being explicit about, since the name invites the wrong assumption:

- **PANTRY does not generate this graph.** It reads one, written by a separate command-line tool
  called `graphify` (`graphify update .` in the host project, or `graphify merge-graphs` to combine
  several repos into one whole-stack map) into a `graphify-out/` folder (configurable via
  `graphDir`). PANTRY only parses and visualizes whatever's already there.
- **It runs no analysis and no model of its own.** If `graphify-out/` doesn't exist yet, `/map`
  doesn't error, it shows the exact command to run instead, the same "degrade to guidance, never
  crash" posture every other optional surface follows.

When a graph is present, PANTRY computes node degree from the graph's links, surfaces the
highest-degree "central nodes" (the load-bearing files and symbols, minus vendored/minified noise
like a bundled `htmx.min.js`), and groups nodes by repo and by `graphify`'s own community detection.
All of that is pure computation over data `graphify` already produced.

## `pantry check`: the doc-drift lint

Because PANTRY's *generated* surfaces can't drift (one brain, two projections, as above), the one
thing that still can is hand-written doc prose linking to a route that no longer exists, say a doc
page that got renamed or a plan whose id changed. `bunx pantry check` reads the same knowledge brain
the server serves, scans every doc body for root-relative links inside PANTRY's own namespace
(`/docs/…`, `/standards/…`, `/plans…`, or a raw `.md` source twin), and fails, nonzero, on any link
that wouldn't actually resolve. It's narrow on purpose: links outside that namespace (external URLs,
`/`, `/about`, anchors) aren't PANTRY's to adjudicate, so it skips them rather than guessing.

## Next steps

- [`GETTING-STARTED.md`](GETTING-STARTED.md) for installing, scaffolding, and running PANTRY in a
  project.
- [BATCH's getting-started](/batch/docs/getting-started) and
  [GRAIN's getting-started](/grain/docs/getting-started) for the two substrate layers PANTRY's
  server and design system come from.
- PANTRY's own `PLAN.md` (bundled with the package) for the full build order and the host contract
  in its original wording.
