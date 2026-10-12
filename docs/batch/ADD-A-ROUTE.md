---
title: "How to: add a route"
---

Two kinds of route exist; pick the one that matches what you're adding.

## A hand-authored page

From the repository root, drop a file under `pagesDir` (`config.ts`, default `pages/`) and it's live
on the next refresh, with nothing to register:

```sh
# a new page at /widgets, using the default pages/ root
mkdir -p pages/widgets
echo '<!DOCTYPE html><html>...</html>' > pages/widgets/index.html
```

`makePageServer` ([`http/pages.ts`](https://github.com/tjakoen/batch/blob/main/http/pages.ts)) maps the URL straight onto the file
under `pagesDir`. The sitemap and the portfolio exporter both enumerate that tree, so an ordinary
page reaches search and static export without a second route entry. The portfolio also excludes
review-only and operable routes, and adds generated pages such as /cv explicitly. A route outside
the pages tree needs its own sitemap and export entry if it should be discoverable and included in
the static site.

## A generated / API route

Server-level routes (JSON endpoints, the AI door, anything that isn't a page) are added directly in
`Bun.serve({ routes: {...} })` at the composition root
([`server.ts`](https://github.com/tjakoen/tjakoen.github.io/blob/main/src/server.ts)):

```ts
Bun.serve({
  routes: {
    "/my-route": async (req) => Response.json({ ok: true }),
    // …
  },
});
```

For a family of related routes (methods, params), group them into a builder like
[`src/routes/ai-routes.ts`](https://github.com/tjakoen/tjakoen.github.io/blob/main/src/routes/ai-routes.ts) does (`buildAiRoutes(...)`
returns a `routes` object spread into `Bun.serve`), rather than growing `server.ts` inline.

## Next steps

- If the route serves content that should be crawlable, make sure `createSitemap` sees it (pages do, automatically; a hand-added API route usually shouldn't be in the sitemap).
- If it's a static-exportable page, `tools/export.ts`'s `pageRoutes()` picks it up from the same sitemap — nothing to add there either, unless the route is **operable** (behind `/intent`+SSE), in which case add it to `export.ts`'s `OPERABLE` set so the static export excludes it (ARCHITECTURE §18).
