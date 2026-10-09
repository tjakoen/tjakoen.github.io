---
title: "Getting started with BATCH"
---

BATCH is a no-build, server-rendered hypermedia substrate: Bun runs the TypeScript directly, there
is no bundler, and htmx handles reads and navigation. BATCH is a library, not a server of its own.
The portfolio is the composition root that shows it running with GRAIN and MILL. The reasoning
behind the package is in [`ARCHITECTURE.md`](ARCHITECTURE.md), and the build rules are in
[`CONVENTIONS.md`](CONVENTIONS.md).

## Install and run

To use BATCH in a Bun app, install the package:

```sh
bun add @tjakoen/batch
```

For npm, run `npm install @tjakoen/batch`. The package has no server command. To develop BATCH from
its repository, clone it and run:

```sh
bun install
bun test
bun run check
```

To see BATCH composed into a running site, clone the
[portfolio repository](https://github.com/tjakoen/tjakoen.github.io) and follow its development
instructions. That app wires BATCH, GRAIN, and MILL together.

## What you get out of the box

- **The composition engine** — server-rendered HTML from `.html` templates and a binding vocabulary (`data-field`, `data-bind-<attr>`, `each`, component tags); see CONVENTIONS §2–4.
- **A generic SSE push hub** (`@tjakoen/batch/http/stream.ts`) carries the transport for GRAIN's render ops.
- **Route-derived sitemap and robots helpers**, plus a separate renderer for host-authored
  `/llms.txt` entries. The package provides the formats; the composition root supplies its routes
  and descriptions.
- **A static-export library** (`@tjakoen/batch/export/*`) that a host app can use to freeze server output without building a second renderer (ARCHITECTURE §18).
- **A framework-generic performance and SEO/AEO audit library.** The portfolio wraps that library in its own `bun run audit` command.

## Next steps

- Read [`ARCHITECTURE.md`](ARCHITECTURE.md) for the substrate's full reasoning (start here if you want to understand *why*, not just *how*).
- Read [`CONVENTIONS.md`](CONVENTIONS.md) for the component/layering/testing rules before you add code.
- If you also want the AI-interaction layer (a UI a human *and* an AI can operate through one vocabulary), see [GRAIN's getting-started](/grain/docs/getting-started) — it builds on BATCH but imports nothing from it.
- Browse GRAIN's components in the live [`/catalog`](/catalog).
