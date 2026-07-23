---
id: repo-structure-reorg
status: proposed
track: D
depends: []
touches: [server.ts, config.ts, content.ts, render.ts, seo.ts, llms.ts, plans.ts, package.json, tsconfig.json, playwright.config.ts]
owner: human
---

# Repo structure reorg — tame the root

> **Proposed 2026-07-23.** The repo root carries 23 tracked top-level dirs plus 8 loose source
> `.ts` files sitting next to config, with tests scattered across three conventions and long-form
> docs split between the root and `docs/`. Nothing is broken, but the root no longer reads as a map.
> This plan tidies it in risk-ordered phases, each behind the full gate (unit + desk e2e + export +
> verify:export). Phases are independent — green-light any subset.

## The mess (what an opener sees today)

- **Loose source at root (8 files):** `server.ts` `config.ts` `content.ts` `render.ts` `seo.ts`
  `llms.ts` `plans.ts` interleaved with `package.json` / `tsconfig.json` / `playwright.config.ts`.
  No `src/` — code and config share the same ls output.
- **Test conventions split three ways:** colocated at root (`content.test.ts`, `seo.test.ts`),
  colocated in `ai/` and `routes/`, and separate in `e2e/`.
- **Docs split:** `PHILOSOPHY.md` `HACKING.md` `CONTENT-BACKLOG.md` live at root while
  `docs/` holds the rest (`architecture/`, `grain/`, `batch/`).
- **Content mixed with code at the top level:** `notes/` `events/` `tours/` `standards/` `data/`
  `media/` are authored content, sitting as siblings of `ai/` `routes/` `components/` `render.ts`.
- **23 top-level dirs** — high cognitive load before you find the file you want.

## Landmines (why this is not a blind `git mv`)

1. **`standards/` is a published package export.** `package.json` maps `"./standards/*":
   "./standards/*"` so **PANTRY resolves those files as a package subpath**, and `content.ts:166`
   reads them via `join(import.meta.dir, "standards")`. Moving `standards/` OR moving `content.ts`
   away from it breaks `/standards` rendering and the PANTRY resolve. Treat `standards/` as pinned;
   relocating it is its own phase with the export map + constant updated together.
2. **`content.ts` path constants** reference content dirs as strings — `notes/` (7 refs),
   `standards/` (2), `media/` (1), `data/` (1). Every content-dir move updates these.
3. **Entry paths in `package.json`:** `bun server.ts`, `bun --hot server.ts`, `bun tools/export.ts`.
   Moving `server.ts` updates 3 scripts + `tsconfig` + `playwright.config` webServer command.
4. **`import.meta.dir` is location-sensitive.** Any file that resolves a sibling dir by
   `import.meta.dir` breaks when the file moves; audit each before moving (`content.ts` is the
   known one).
5. **`dist/` export + GitHub Pages** — `tools/export.ts` walks the routes; confirm every phase with
   `bun run export && bun run verify:export` (the dead-link walk) before pushing.
6. **`audit/` is generated** (`bun run audit` writes `audit/report.{json,md}`) but tracked as an
   intentional build baseline. Leave it tracked; do not gitignore.

## Blast radius (measured)

- Only **4 files** import the root source modules (`server.ts`, `render.ts`, and the two colocated
  tests). Moving them into `src/` is a ~4-site import rewrite plus the entry paths.
- Content-dir string coupling is **~11 refs**, almost all in `content.ts`.
- So the reorg is cheap — the cost is discipline (one phase at a time, gate each), not volume.

## Target layout

```
tjakoen.github.io/
├─ src/                    app + composition code
│  ├─ server.ts            (entry — package.json points here)
│  ├─ config.ts content.ts render.ts seo.ts llms.ts plans.ts
│  ├─ ai/  routes/
│  └─ *.test.ts            (colocated, one convention)
├─ view/                   GRAIN view layer  (components/ + pages/ — Phase 3, optional)
├─ content/               authored words
│  ├─ notes/ events/ tours/ data/ media/
│  └─ standards/           (Phase 4 only — PANTRY-coupled; may stay at root)
├─ docs/                  ALL long-form docs (PHILOSOPHY, HACKING, CONTENT-BACKLOG folded in)
├─ tools/ scripts/ e2e/ vendor/ audit/
├─ config: package.json tsconfig.json playwright.config.ts bun.lock
└─ root-pinned: README NOTICE LICENSE CLAUDE.md AGENTS.md
```

`standards/` and `components/`+`pages/` are the two expensive moves; both are gated behind their own
phases and can be skipped without blocking the cheap wins.

## Phases (risk-ordered — green-light any subset)

### Phase 0 — docs tidy (zero risk, no code)
- `git mv PHILOSOPHY.md HACKING.md CONTENT-BACKLOG.md docs/` (or `docs/architecture/` for the
  latter two). Update the 3–4 relative links in `CLAUDE.md` + `README.md` that point at them.
- **Gate:** `bun run verify:export` (dead-link walk catches any missed doc link). No tests needed.

### Phase 1 — `src/` consolidation (low risk)
- `git mv` the 8 root `.ts` + `ai/` + `routes/` into `src/`; keep tests colocated.
- Rewrite ~4 relative imports; update `package.json` scripts (`server.ts` → `src/server.ts`,
  keep `tools/export.ts` path or move under `src/` too), `tsconfig.json`, `playwright.config.ts`
  webServer command.
- Audit `import.meta.dir` users — `content.ts` resolves `standards/`; if `content.ts` moves to
  `src/`, its `standards` join must become `join(import.meta.dir, "../standards")` (or standards
  moves in Phase 4). This is the one real gotcha in Phase 1.
- **Gate:** full — unit + desk e2e + export + verify:export.

### Phase 2 — `content/` consolidation (low–medium risk)
- `git mv notes events tours data media content/`.
- Update the ~11 string path constants in `content.ts` (and any tool that walks these).
- **Leave `standards/` out** — Phase 4.
- **Gate:** full. Watch the export route walk (content dirs feed `/notes` etc.).

### Phase 3 — `view/` layer (optional, medium risk)
- `git mv components pages view/`. Heaviest render-path coupling; only worth it if the top-level
  count still grates after 0–2. Update render/template path constants + export walker.
- **Gate:** full + a browser drive of `/`, `/notes`, `/grain/docs` (render paths are the risk).

### Phase 4 — `standards/` relocation (deferred / maybe never)
- Only if `content/` feels incomplete without it. Move `standards/` under `content/`, and in the
  SAME commit update `package.json` export (`"./content/standards/*"`) and the `content.ts` join.
  Verify PANTRY still resolves (this repo is a PANTRY package source) — the reason this is last and
  may be judged not worth the coupling churn.
- **Gate:** full + confirm `/standards` renders + PANTRY resolve unbroken.

## Out of scope
- No content edits, no route/URL changes (paths on disk move; published URLs stay).
- No gitignore change for `audit/` (intentional baseline).
- No grain/batch/mill changes — this is the app repo only.

## Recommended cut
Phases **0 + 1 + 2** buy most of the tidiness for little risk and leave the two coupled moves
(`view/`, `standards/`) as opt-in. Do them as **three separate commits**, gate between each.
