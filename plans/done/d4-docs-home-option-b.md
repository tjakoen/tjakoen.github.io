---
id: d4-docs-home-option-b
status: done
track: D
depends: []
touches: [docs/, content.ts, package.json]
owner: ai
---

# Docs-home option (b): move the layer docs into this repo

Owner decision (2026-07-09): explanatory docs physically move here (`docs/<layer>/`); layer repos
keep thin pointers. Plans and each layer's `PLAN.md` stay in their repos (the PROOF contract).
The seam is proven: `docs/` + the `./docs/*` package export exist (see `docs/OPTION-B-SEAM.md`),
and a scratch consumer resolved through the git-dep (~4.9 MB package weight, 4 MB of it `e2e/`).

Bun caveat (memory `bread-split-audit-2026-07`): bun 1.3.14 races on concurrent github-spec
resolution — re-pin one package per `bun add`; installs from a committed lock are safe.

## Tasks (in order; each step keeps both doc surfaces rendering)

- [x] Move `batch/docs/*` and `grain/docs/*` into `docs/batch/`, `docs/grain/` here (git mv in
      each repo pair; history note in commit messages)
- [x] Rewire the two collections in `content.ts` from `packageDocsSource` to `dirSource(./docs/…)`
- [x] Pantry: add the portfolio git-dep; repoint its framework-docs surface to
      `tjakoen.github.io/docs/*`; keep the auto-disable-when-absent behavior
- [x] Drop `./docs/*` from batch/grain exports + files maps; leave a thin pointer in each README
      ("canonical docs: https://tjakoen.github.io/<layer>/docs")
- [x] Update pantry `INSTALL.md` host-contract wording ("bundled framework docs" now resolve from
      the portfolio package)
- [x] Fix cross-doc relative links (SPLIT-PLAN S4 inventory) — they broke on the move. Three fixes,
      by category: (1) an accidental extra `tjakoen.github.io/` path segment on same-repo targets
      (PHILOSOPHY.md, server.ts, routes/ai-routes.ts, a component) — dropped it; (2) links into a
      layer's own SOURCE tree (`ai/contract.ts`, `scripts/ai-dispatch.js`, `README.md`, `ROADMAP.md`
      in the bread umbrella repo, the `project` repo) — those files live in a *different* repo now,
      not reachable by any relative path, so repointed to the layer's GitHub blob URL; (3)
      grain⇄batch cross-layer DOC links (`GRAIN.md`↔`ARCHITECTURE.md` etc.) — left exactly as
      authored (`../../<layer>/docs/<FILE>.md`): `content.ts`'s `docsLink` adapter already rewrites
      that literal shape to the rendered route (`/batch/docs/architecture`) at request time, and
      "fixing" them to a plain relative path silently defeats that rewrite (caught by
      `content.test.ts`'s "docs cross-layer links rewrite to rendered routes" — tsc + all 17 tests
      stayed green). Verified zero dangling links remain under `docs/` once (3)'s adapter-handled
      shape is accounted for, and spot-checked the rendered pages (200s, correct hrefs) on a local
      dev server.
- [x] Re-pin cascade (one add at a time), export + deploy, verify /batch/docs + /grain/docs +
      pantry's docs surface all render — re-pinned at 1195d6d; /batch/docs, /batch/docs/architecture,
      /grain/docs, and /grain/docs/grain all verified 200 against the running dev server.
