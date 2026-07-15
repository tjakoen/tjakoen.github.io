---
title: "How to: static export + deploy"
---

**Status: the export itself is built and works today; a zero-ops GitHub Pages Actions workflow is
still planned** (see [`README.md`](../../README.md)). This
guide covers what runs now.

## Run it

```sh
bun run export                                # → dist/, absolute paths (root host / custom domain)
PUBLIC_BASE_PATH=/repo bun run export         # → dist/ for user.github.io/<repo>/ (subpath host)
PUBLIC_ORIGIN=https://you.com bun run export  # bake the real origin into sitemap.xml/robots.txt
```

Serve the result with any static file server: `bunx serve dist`, or push `dist/` to any static
host (GitHub Pages, Netlify, S3 — it's plain files, nothing server-specific left in them).

## What actually gets frozen

The exporter (`tools/export.ts`, on top of the generic `batch/export/export.ts`) **fetches the
running server and freezes its output — it never re-renders** (ARCHITECTURE §18: the export is a
*projection*, not a second renderer). Concretely, it:

1. boots `server.ts` on a throwaway port,
2. crawls every page route (the same sitemap the live server uses) + MILL's content routes
   (`/notes`, `/grain/docs`, `/batch/docs`) + `/catalog`,
3. copies every asset mount (`config.ts`'s `assetDirs` + fonts) verbatim,
4. rewrites the baked-in origin/base-path if you passed `PUBLIC_ORIGIN` / `PUBLIC_BASE_PATH`.

## The one boundary: operable pages don't export

A static host has no backend, so anything behind the one door (`/intent` + SSE) is **excluded** from
the crawl — see `tools/export.ts`'s `OPERABLE` set (today: `/loop`). The `/grain` showcase still
works in the static copy: its demo is flipped to the **client-side door** (a browser-only version of
the same vocabulary, ARCHITECTURE §19.3, `CLIENT_DOOR_PAGES`), so the pitch ("watch the AI act")
survives with zero server.

## If you add a new operable page

Add its route to `OPERABLE` in `tools/export.ts` (or to `CLIENT_DOOR_PAGES` if you're giving it a
client-side door like `/grain`'s) — otherwise the export will try to crawl a page that needs a
backend it won't have.
