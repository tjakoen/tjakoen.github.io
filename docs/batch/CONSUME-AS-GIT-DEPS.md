---
title: "How to: consume BATCH / GRAIN as a dependency"
---

**As of the 2026-07-19 consolidation, this is real.** `grain` is now a monorepo holding
`packages/{grain,mill,proof,crumb}`, and `grain`, `mill`, and `proof` are **published to GitHub
Packages** as `@tjakoen/{grain,mill,proof}`. Inside the monorepo those layers resolve as Bun
**workspaces** (`workspace:*`); a separate app consumes the published versions. `batch` stays a
standalone repo consumed as a **Bun git dependency** — it is the substrate, and it is not published.

## The shape

A separate app pins the published layers by version and keeps `batch` as a git dependency:

```json
{
  "dependencies": {
    "@tjakoen/batch": "github:tjakoen/batch#main",
    "@tjakoen/grain": "^0.1.0",
    "@tjakoen/mill": "^0.1.0",
    "@tjakoen/proof": "^0.1.0"
  }
}
```

The `@tjakoen` scope resolves from GitHub Packages, so the app also needs an `.npmrc` (the auth
token lives in the environment / `~/.npmrc`, never committed):

```
@tjakoen:registry=https://npm.pkg.github.com
```

A single monorepo git dependency cannot expose the sub-packages by their own names — that is why the
layers are published, rather than pinned as `github:tjakoen/grain#<sha>` subpaths.

## Why this, specifically

- **Layer docs travel inside the package.** `/batch/docs` and `/grain/docs` are rendered via `import.meta.resolve("@tjakoen/grain/docs/GRAIN.md")` — never a hardcoded `../grain/docs` relative path (see [`packages/mill/serve.ts`](https://github.com/tjakoen/grain/blob/main/packages/mill/serve.ts)). The *same* code resolves the workspace package inside the grain monorepo and the installed published package in a consumer — zero copied files, zero drift.
- **`bun update`** on that dependency is how you pick up a new layer version — no publish step, no registry to keep in sync.
- GRAIN itself only needs three things from a host (an `OpChannel`, a compatible renderer, a filesystem) — see [`grain/README.md`](https://github.com/tjakoen/grain/blob/main/packages/grain/README.md) §1. It names no concrete dependency beyond that.

## Next steps

- [`GETTING-STARTED.md`](GETTING-STARTED.md) (this layer) and [`../../grain/docs/GETTING-STARTED.md`](../../grain/docs/GETTING-STARTED.md) for what you get once installed.
- [`SPLIT-PLAN.md`](https://github.com/tjakoen/bread/blob/main/SPLIT-PLAN.md) for the full repo-split plan and timeline.
