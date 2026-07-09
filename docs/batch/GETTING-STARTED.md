# Getting started with BATCH

BATCH is a no-build, server-rendered hypermedia substrate: Bun runs the TypeScript directly (even
client `.ts` is transpiled on request), there's no bundler, and htmx handles reads/nav. This page is
the fastest path from a clone to a running app; the reasoning behind every decision here is
[`ARCHITECTURE.md`](ARCHITECTURE.md), and the build rules are [`CONVENTIONS.md`](CONVENTIONS.md).

## Install and run

```sh
bun install            # or: npm install (bun came in via npm here)
bun run dev            # http://localhost:3000 — hot reload, no build step
bun run check          # tsc --noEmit — must stay green
bun test               # unit + integration
```

That's the whole loop: edit a file, refresh the browser. There is nothing to compile or bundle
between your source and the server.

## What you get out of the box

- **The composition engine** — server-rendered HTML from `.html` templates + a binding vocabulary (`data-field`, `data-bind-<attr>`, `each`, component tags) — see CONVENTIONS §2–4.
- **A generic SSE push hub** (`batch/http/stream.ts`) — the transport GRAIN's render ops ride on.
- **Sitemap, robots.txt, and `/llms.txt`** generated from one route source — SEO/AEO for free.
- **A static exporter** (`batch/export`) that freezes the running server's output — never a second renderer (ARCHITECTURE §18).
- **A framework-generic perf + SEO/AEO audit** (`bun run audit`).

## Next steps

- Read [`ARCHITECTURE.md`](ARCHITECTURE.md) for the substrate's full reasoning (start here if you want to understand *why*, not just *how*).
- Read [`CONVENTIONS.md`](CONVENTIONS.md) for the component/layering/testing rules before you add code.
- If you also want the AI-interaction layer (a UI a human *and* an AI can operate through one vocabulary), see [GRAIN's getting-started](/grain/docs/getting-started) — it builds on BATCH but imports nothing from it.
- Browse every component live at [`/catalog`](/catalog).
