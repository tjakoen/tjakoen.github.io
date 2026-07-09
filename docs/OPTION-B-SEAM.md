# docs/ — the option (b) docs home

Decision (2026-07-09): the portfolio is the physical home of the stack's explanatory docs
(option b). The layer docs now live here under `docs/<layer>/` (`docs/batch/`, `docs/grain/`);
the layer repos keep a thin README pointer and no longer ship a `docs/` folder.

- This site renders them through MILL: `content.ts` resolves `/batch/docs` and `/grain/docs` with
  `dirSource(docs/<layer>)`.
- Other consumers (PANTRY) resolve them out of THIS repo's package via the `./docs/*` export
  (`import.meta.resolve("tjakoen.github.io/docs/<layer>/…")`), never each layer's package.

Plans and each layer's `PLAN.md` stay in their own repos (the PROOF contract). Migration executed per
`plans/d4-docs-home-option-b.md`.
