---
title: "How to: install the BREAD stack packages"
---

The BREAD stack's published packages install from the public npm registry. BATCH is published from
its own repository. GRAIN, MILL, PROOF, and CRUMB are published from the GRAIN monorepo; its
workspace-only `grain-mcp` package is not published.

Install only the layers your app uses. To add the full stack with Bun, run these commands:

```sh
bun add @tjakoen/batch @tjakoen/grain
bun add @tjakoen/mill @tjakoen/proof
bun add @tjakoen/crumb
```

With npm, run the equivalent commands:

```sh
npm install @tjakoen/batch @tjakoen/grain
npm install @tjakoen/mill @tjakoen/proof
npm install @tjakoen/crumb
```

The packages resolve from the public npm registry. Installing PROOF also fetches its current BATCH
dependency from a pinned public GitHub commit. That fetch needs network access to GitHub, but no
GitHub token. A new project needs no `.npmrc` or npm registry token.

## The shape

The package manager writes the resolved versions to your package manifest and lockfile. To update
them later, use `bun update` or `npm update`. Publishing a package release is a separate maintainer
action. PROOF's pinned BATCH dependency changes only when a new PROOF release updates it.

## Why this, specifically

- **MILL can render Markdown from an installed package.** `packageDocsSource` resolves a published Markdown file through the package's exports. The portfolio's layer guides live in this repository's `docs/<layer>/` folders and are served with `dirSource`; they are not part of the published packages. See [`packages/mill/serve.ts`](https://github.com/tjakoen/grain/blob/main/packages/mill/serve.ts).
- **`bun update`** picks up versions that maintainers have already published. Each package remains responsible for its own release.
- GRAIN itself only needs three things from a host (an `OpChannel`, a compatible renderer, a filesystem) — see [`grain/README.md`](https://github.com/tjakoen/grain/blob/main/packages/grain/README.md) §1. It names no concrete dependency beyond that.

## Next steps

- [`GETTING-STARTED.md`](GETTING-STARTED.md) (this layer) and [`../../grain/docs/GETTING-STARTED.md`](../../grain/docs/GETTING-STARTED.md) for what you get once installed.
- The [GRAIN monorepo README](https://github.com/tjakoen/grain#readme) lists its published packages and explains its workspace layout.
