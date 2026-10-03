---
title: "How to: export and deploy the portfolio"
---

This guide covers the portfolio app's exporter. BATCH supplies the export mechanism, while the
portfolio repository boots the app, crawls its routes, and writes the static files. The portfolio's
[GitHub Pages workflow](https://github.com/tjakoen/tjakoen.github.io/blob/main/.github/workflows/pages.yml)
runs the export and link verifier, then deploys the result on pushes to `main` and on its daily
refresh. BATCH itself is a library and does not own a site deployment workflow.

## Run it

Run these commands from the portfolio repository:

```sh
bun run export
bun run verify:export
```

The export writes to `dist/` with root-absolute paths for a custom domain. For a repository hosted
at `user.github.io/repo`, set `PUBLIC_BASE_PATH=/repo`. Set `PUBLIC_ORIGIN` to the deployed origin
so the sitemap, robots file, and language-model index carry public URLs.

Serve the result with any static file server, such as `bunx serve dist`, or deploy `dist/` to a
static host. The output is plain files and does not need the BATCH server at runtime.

## What actually gets frozen

The exporter (`tools/export.ts`, on top of the generic `@tjakoen/batch/export/export.ts`) **fetches the
running server and freezes its output — it never re-renders** (ARCHITECTURE §18: the export is a
*projection*, not a second renderer). Concretely, it:

1. boots `server.ts` on a throwaway port,
2. crawls every page route (the same sitemap the live server uses) + MILL's content routes
   (`/notes`, `/grain/docs`, `/batch/docs`) + `/catalog`,
3. copies every asset mount (`config.ts`'s `assetDirs` + fonts) verbatim,
4. rewrites the baked-in origin/base-path if you passed `PUBLIC_ORIGIN` / `PUBLIC_BASE_PATH`.

## The one boundary: operable pages don't export

A static host has no backend, so anything behind the one door (`/intent` + SSE) is **excluded** from
the crawl — see `tools/export.ts`'s `OPERABLE` set (empty today, so no route is export-excluded). The `/grain` showcase still
works in the static copy: its demo is flipped to the **client-side door** (a browser-only version of
the same vocabulary, ARCHITECTURE §19.3, `CLIENT_DOOR_PAGES`), so the pitch ("watch the AI act")
survives with zero server.

## If you add a new operable page

Add its route to `OPERABLE` in `tools/export.ts` (or to `CLIENT_DOOR_PAGES` if you're giving it a
client-side door like `/grain`'s) — otherwise the export will try to crawl a page that needs a
backend it won't have.
