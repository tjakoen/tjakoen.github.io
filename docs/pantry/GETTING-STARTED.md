---
title: "Getting started with PANTRY"
---

PANTRY is an **app**, not a layer: a single server you drop into any project that composes BATCH,
GRAIN, MILL, and PROOF into one "developer cockpit". Run it in a project and both you and your coding
AI get that project's own task board, the framework docs, a generated component/vocabulary reference,
and a machine-readable index of all of it, all addressable in one place. Nothing imports PANTRY; it
imports everything below it. This page is the fastest path from a bare project to a running cockpit.
The full design lives in [`PLAN.md`](https://github.com/tjakoen/pantry/blob/main/PLAN.md); the
composition itself (which route comes from which layer) is documented in
[`WHAT-IT-COMPOSES.md`](WHAT-IT-COMPOSES.md).

Two terms worth pinning down before anything else, since PANTRY's own README leans on them without
defining them:

- **"Host project"** is whatever project you run PANTRY inside. PANTRY calls it that throughout its
  own source and config, so this page does too.
- **"AI-legible, not AI-powered"** is PANTRY's one hard constraint: it runs no language model of its
  own. It never calls an API and never generates text. What it does is expose your project's plans
  and docs as plain, fetchable JSON and text (`/knowledge.json`, `/llms.txt`) so *your own* coding
  agent can read them while it works. PANTRY is a librarian, not a chatbot.

## Install

PANTRY publishes to GitHub Packages, alongside the rest of the BREAD stack. Point npm/bun at that
registry for the `@tjakoen` scope, then add the package as a dev dependency (it's tooling for the
project, not something the project ships):

```
# .npmrc
@tjakoen:registry=https://npm.pkg.github.com
```

```sh
bun add -d @tjakoen/pantry
```

That one install brings BATCH, GRAIN, MILL, and PROOF with it as regular dependencies, plus the
portfolio package (`tjakoen.github.io`) which is where BATCH's and GRAIN's *explanatory* docs and the
personal writing standards are canonically homed. You do not add those separately.

## Scaffold, then run

```sh
bunx pantry init             # scaffolds plans/ + pantry.config.json in the current project
bunx proof check              # lints the scaffolded plans (pantry init delegates plan scaffolding to PROOF)
bunx pantry serve              # boots the cockpit; prints a local URL (default port 4400)
```

`pantry init` is non-invasive: it only ever writes *new* files. It never touches an existing
`CLAUDE.md`, never overwrites an existing `pantry.config.json` (unless you pass `--force`), and never
moves or copies any docs your project already has. What it creates:

- `plans/`, a starter plan (`000-welcome.md`) and `plans/README.md`, via PROOF's own `init` (PANTRY
  mounts PROOF's board, it doesn't reimplement plan scaffolding).
- `pantry.config.json`, a minimal starting config: your project's folder name, `plansDir: "./plans"`,
  `docsDirs: ["./docs"]`.

After that, edit `pantry.config.json` to point `docsDirs` at wherever your project's *own* docs
already live (see Config, below), then `bunx pantry serve`.

## The hard rule: PANTRY is a lens, never a destination

Everything PANTRY renders, it reads from your files in place. It never copies your plans or docs into
itself, never moves them, and never edits the framework docs it bundles. Your plan files stay the
single source of truth for the plan board; the board at `/plans` is a read-only projection of them.
If you're handing the install off to a coding agent rather than doing it by hand, `INSTALL.md`
(bundled with the package) has a copy-pasteable prompt block that states these rules explicitly to
the agent, plus the exact numbered steps above.

## Config

PANTRY reads an optional `pantry.config.(json|ts|js)` from the host project's working directory.
Every field is optional; a project with none of the below still runs with sane defaults.

| Field | Default | Meaning |
|---|---|---|
| `projectName` | the project folder's name | Shown in the nav and the home page lede. |
| `plansDir` | `"./plans"` | Where PROOF's board reads plan files from. |
| `docsDirs` | `["./docs"]`, only if it exists | This project's *own* docs folders, mounted read-only, one MILL collection per folder. Pointers to existing folders, never a copy. |
| `graphDir` | `"./graphify-out"` | Where the mindmap (`/map`) looks for a `merged-graph.json` or `graph.json` written by the external `graphify` tool. See `WHAT-IT-COMPOSES.md`. |
| `surfaces` | every surface `true` | Turn individual surfaces off: `{ plans, docs, reference, catalog, standards }`. |

## Run it

```sh
bunx pantry serve --port 4400   # -p also works; default port is 4400
bunx pantry check                # CI-able: lints doc bodies for dead in-namespace links, exits nonzero on a break
```

Bare `bunx pantry` (no subcommand) is the same as `pantry serve`. On boot it prints the surfaces it
mounted:

```
PANTRY cockpit on http://localhost:4400
  /          the stack, composed
  /plans     this project's plan board
  /docs      the framework docs + this project's
  /reference the generated AI vocabulary + token slots
  /catalog   the GRAIN component catalog
```

A surface whose underlying source is missing (no `plans/`, no docs folder, the portfolio package not
installed for `/standards`) disables itself quietly rather than erroring: the route and its nav link
just don't appear. `pantry check` is a separate, narrower thing from `proof check`: it lints your doc
*prose* for links that point at a route or `.md` twin the cockpit doesn't actually serve, so a
renamed doc collection or a deleted page shows up as a build failure instead of a silent 404.

## Compose it yourself instead

If you're building your own server rather than running PANTRY as-is, you don't have to import PANTRY
at all (it isn't offered as an importable layer, by design). Import `createProofRoutes` and
`createMillRoutes` straight from `@tjakoen/proof` and `@tjakoen/mill` into your own app; PANTRY's own
`app.ts` is the reference implementation of exactly that composition. See
[`WHAT-IT-COMPOSES.md`](WHAT-IT-COMPOSES.md) for how the pieces fit together.

## Next steps

- Read [`WHAT-IT-COMPOSES.md`](WHAT-IT-COMPOSES.md) for how BATCH/GRAIN/MILL/PROOF each contribute a
  piece of the cockpit, what every mounted surface actually is, and what the "AI-legible" surfaces
  return.
- Read [BATCH's getting-started](/batch/docs/getting-started) and
  [GRAIN's getting-started](/grain/docs/getting-started) for the two layers PANTRY runs on top of.
- The canonical, most detailed source is PANTRY's own `PLAN.md` and `INSTALL.md`, bundled with the
  package.
