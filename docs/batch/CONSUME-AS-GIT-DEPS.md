---
title: "How to: consume BATCH / GRAIN as a dependency"
---

**As of the 2026-07-19 consolidation this is real, and since 2026-07-30 it needs no credentials.**
`grain` is now a monorepo holding `packages/{grain,mill,proof,crumb}`, and all four are **published
on the public npm registry** as `@tjakoen/{grain,mill,proof,crumb}`. Inside the monorepo those layers
resolve as Bun **workspaces** (`workspace:*`); a separate app consumes the published versions.
`batch` stays a standalone repo, published from there as `@tjakoen/batch`.

Despite this page's title, none of the layers are git dependencies any more. They were published to
GitHub Packages first, whose npm registry demands an auth token **even for public packages**, so
every consumer still had to mint a `read:packages` PAT before installing anything. Moving the scope
to npmjs removed that last step.

## The shape

A separate app pins every layer by version:

```json
{
  "dependencies": {
    "@tjakoen/batch": "^0.1.0",
    "@tjakoen/grain": "^0.1.12",
    "@tjakoen/mill": "^0.2.0",
    "@tjakoen/proof": "^0.1.2",
    "@tjakoen/crumb": "^0.1.4"
  }
}
```

That is all of it. The `@tjakoen` scope resolves from npmjs by default, so the app carries **no
`.npmrc`** — and should not: a committed scope mapping outranks both `publishConfig` and
`--registry`, and a committed `_authToken=${GITHUB_TOKEN}` is worse still (unset, it resolves to an
empty string, overrides the developer's own valid token, and 401s every install on a cold cache).

A single monorepo git dependency cannot expose the sub-packages by their own names — that is why the
layers are published, rather than pinned as `github:tjakoen/grain#<sha>` subpaths.

## Why this, specifically

- **Layer docs travel inside the package.** `/batch/docs` and `/grain/docs` are rendered via `import.meta.resolve("@tjakoen/grain/docs/GRAIN.md")` — never a hardcoded `../grain/docs` relative path (see [`packages/mill/serve.ts`](https://github.com/tjakoen/grain/blob/main/packages/mill/serve.ts)). The *same* code resolves the workspace package inside the grain monorepo and the installed published package in a consumer — zero copied files, zero drift.
- **`bun update`** on that dependency is how you pick up a new layer version — no publish step, no registry to keep in sync.
- GRAIN itself only needs three things from a host (an `OpChannel`, a compatible renderer, a filesystem) — see [`grain/README.md`](https://github.com/tjakoen/grain/blob/main/packages/grain/README.md) §1. It names no concrete dependency beyond that.

## Next steps

- [`GETTING-STARTED.md`](GETTING-STARTED.md) (this layer) and [`../../grain/docs/GETTING-STARTED.md`](../../grain/docs/GETTING-STARTED.md) for what you get once installed.
- [`SPLIT-PLAN.md`](https://github.com/tjakoen/bread/blob/main/docs/history/SPLIT-PLAN.md) for the full repo-split plan and timeline.
