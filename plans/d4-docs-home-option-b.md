---
id: d4-docs-home-option-b
status: todo
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

- [ ] Move `batch/docs/*` and `grain/docs/*` into `docs/batch/`, `docs/grain/` here (git mv in
      each repo pair; history note in commit messages)
- [ ] Rewire the two collections in `content.ts` from `packageDocsSource` to `dirSource(./docs/…)`
- [ ] Pantry: add the portfolio git-dep; repoint its framework-docs surface to
      `tjakoen.github.io/docs/*`; keep the auto-disable-when-absent behavior
- [ ] Drop `./docs/*` from batch/grain exports + files maps; leave a thin pointer in each README
      ("canonical docs: https://tjakoen.github.io/<layer>/docs")
- [ ] Update pantry `INSTALL.md` host-contract wording ("bundled framework docs" now resolve from
      the portfolio package)
- [ ] Fix cross-doc relative links (SPLIT-PLAN S4 inventory) — they break on the move
- [ ] Re-pin cascade (one add at a time), export + deploy, verify /batch/docs + /grain/docs +
      pantry's docs surface all render
