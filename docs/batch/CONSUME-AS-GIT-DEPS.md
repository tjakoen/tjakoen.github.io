---
title: "How to: consume BATCH / GRAIN as a dependency"
---

**Today, in this monorepo, this is aspirational** — `batch`, `grain`, `mill`, and the portfolio are
Bun **workspaces**, not separately published packages (see the root `package.json`). This page
describes the intended shape once each layer splits into its own repo
([`SPLIT-PLAN.md`](https://github.com/tjakoen/bread/blob/main/SPLIT-PLAN.md)); until then, build inside this monorepo (see
[`GETTING-STARTED.md`](GETTING-STARTED.md)) and treat this as the target, not a command to run yet.

## The intended shape

Once split, another app consumes a layer as a **Bun git dependency** — no npm registry, no build
step on the dependency itself:

```json
{
  "dependencies": {
    "@tjakoen/batch": "github:tjakoen/batch#main",
    "@tjakoen/grain": "github:tjakoen/grain#main"
  }
}
```

## Why this, specifically

- **Layer docs travel inside the package.** `/batch/docs` and `/grain/docs` are rendered via `import.meta.resolve("@tjakoen/grain/docs/GRAIN.md")` — never a hardcoded `../grain/docs` relative path (see [`mill/serve.ts`](https://github.com/tjakoen/mill/blob/main/serve.ts)). The *same* code resolves the sibling folder in the monorepo today and the installed package after the split — zero copied files, zero drift.
- **`bun update`** on that dependency is how you pick up a new layer version — no publish step, no registry to keep in sync.
- GRAIN itself only needs three things from a host (an `OpChannel`, a compatible renderer, a filesystem) — see [`grain/README.md`](https://github.com/tjakoen/grain/blob/main/README.md) §1. It names no concrete dependency beyond that.

## Next steps

- [`GETTING-STARTED.md`](GETTING-STARTED.md) (this layer) and [`../../grain/docs/GETTING-STARTED.md`](../../grain/docs/GETTING-STARTED.md) for what you get once installed.
- [`SPLIT-PLAN.md`](https://github.com/tjakoen/bread/blob/main/SPLIT-PLAN.md) for the full repo-split plan and timeline.
