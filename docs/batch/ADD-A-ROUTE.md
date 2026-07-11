# How to: add a route

Two kinds of route exist; pick the one that matches what you're adding.

## A hand-authored page

Drop a file under `pagesDir` (`config.ts`, default `pages/`) and it's live on the next refresh —
nothing to register:

```sh
# a new page at /widgets
mkdir tjakoen.github.io/pages/widgets
echo '<!DOCTYPE html><html>...</html>' > tjakoen.github.io/pages/widgets/index.html
```

`makePageServer` ([`http/pages.ts`](https://github.com/tjakoen/batch/blob/main/http/pages.ts)) maps the URL straight onto the file
under `pagesDir`; the sitemap and the static-export allowlist both derive from the same pages tree,
so a new page reaches SEO and the export automatically — nothing else to wire.

## A generated / API route

Server-level routes (JSON endpoints, the AI door, anything that isn't a page) are added directly in
`Bun.serve({ routes: {...} })` at the composition root
([`server.ts`](../../server.ts)):

```ts
Bun.serve({
  routes: {
    "/my-route": async (req) => Response.json({ ok: true }),
    // …
  },
});
```

For a family of related routes (methods, params), group them into a builder like
[`routes/ai-routes.ts`](../../routes/ai-routes.ts) does (`buildAiRoutes(...)`
returns a `routes` object spread into `Bun.serve`), rather than growing `server.ts` inline.

## Next steps

- If the route serves content that should be crawlable, make sure `createSitemap` sees it (pages do, automatically; a hand-added API route usually shouldn't be in the sitemap).
- If it's a static-exportable page, `tools/export.ts`'s `pageRoutes()` picks it up from the same sitemap — nothing to add there either, unless the route is **operable** (behind `/intent`+SSE), in which case add it to `export.ts`'s `OPERABLE` set so the static export excludes it (ARCHITECTURE §18).
