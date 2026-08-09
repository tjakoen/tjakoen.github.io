# Documentation audit — 2026-08-09

The second half of the 2026-08-09 pass. [AUDIT-2026-08-09.md](AUDIT-2026-08-09.md) covers the code;
this covers what the docs say about it. Four read-only auditors, one per surface, each required to run
the commands the docs tell a reader to run rather than to read them sympathetically.

Scope: the whole public-facing BREAD stack. Every published package, every rendered doc set, every
README, and the live site.

---

## 1. The one-line verdict

The route surface is clean and the code is in better shape than its documentation. **No page 404s**,
all 75 internal links on the site resolve, and the layer boundary is stated correctly and consistently
everywhere it appears. What is broken is the accuracy of the claims: most of the doc set was written
against the pre-split monorepo, before the catalog moved to grain, before the npm publish, and before
mill, proof and crumb folded into the grain repo. Nobody re-verified afterward.

The stranger test, which is the only test that matters for a public stack, is failed by four of the
six layers.

| Layer | Can a competent stranger get from the docs to a working use? |
|---|---|
| **MILL** | **Yes.** The getting-started sample was run verbatim against published 0.2.0 and served three routes at 200. Only stumble: the README's own code sample names fields that do not exist. |
| **PROOF** | **Yes**, and it is the strongest of the six. `init` then `check` then `serve` was run end to end in a clean repo and works. The gap is that `proof verify` is invisible on the published site. |
| **BATCH** | **No.** Stuck about ninety seconds in. |
| **GRAIN** | **No**, though it is close. The one copy-pasteable snippet does not resolve. |
| **CRUMB** | **No.** Its own docs tell the reader a working feature is broken. |
| **PANTRY** | **No.** Blocked at step one, on the install line. |

---

## 2. The security finding

`grain/packages/grain-mcp/README.md:37,43` instructs the reader to run:

```
bunx grain-mcp ./dist
claude mcp add grain-mcp -- bunx grain-mcp /abs/path
```

`@tjakoen/grain-mcp` is not published. But the **unscoped** name `grain-mcp` is taken on npm, at
version 1.3.0, by an unrelated project (`github.com/sir-ad/grain`). So the documented command silently
downloads and executes a stranger's package on the reader's machine, and inside their agent harness.

The same README says the package is workspace-only, 25 lines further down.

This is the one finding in the audit that should be fixed regardless of what else happens, because it
is the only one where following the docs harms the reader. The fix is one line: use
`bun packages/grain-mcp/cli.ts ./dist` while the package is unpublished.

---

## 3. Blockers, by layer

**BATCH.** The designated on-ramp, `docs/batch/GETTING-STARTED.md:12-17`, promises "the fastest path
from a clone to a running app" and hands the reader `bun run dev`, which fails immediately with
`error: Script not found "dev"`, because batch is a library with no server. Its own README says so at
line 37. Line 28 then offers `bun run audit`, which falls through to the macOS `audit(8)` binary and
exits 255. And **no document in the batch set contains the string `bun add @tjakoen/batch` or a single
import from it**: it is a live npm package at 0.2.0 whose documentation never tells you its name. The
only install instructions that exist, in `CONSUME-AS-GIT-DEPS.md:23`, pin `^0.1.0`, which cannot reach
0.2.0 across the caret-on-zero boundary.

**GRAIN.** `docs/grain/GETTING-STARTED.md:16` gives a git-dependency install that `grain/RELEASE.md:5`
separately records as verified not to work ("a single monorepo git-dep cannot expose the sub-packages
by their own names, verified 2026-07-19"). The README's only wiring example imports from
`"grain/ai/interaction-layer.ts"` when the package is `@tjakoen/grain`, so the one snippet a reader
would copy resolves to nothing. The correct install line does exist, buried in the monorepo README,
which is not where either getting-started sends anyone.

**CRUMB.** `docs/crumb/GETTING-STARTED.md:67-69` tells the reader in bold, as a "caveat confirmed in
source", that only the default `/crumb` mount works. This is false: `crumb-live.js:24` reads a
`data-crumb-prefix` attribute and documents it three lines above. A reader either abandons a custom
mount or spends an hour disproving their own documentation. Meanwhile `crumb/PLAN.md:3`, the canonical
plan, opens with **"Status: PLANNING ONLY (2026-07-19). Nothing built."** while 0.1.7 is on npm and
running in production.

**PANTRY.** `README.md:24` and the load-bearing `INSTALL.md:70` both say `bun add -d @tjakoen/pantry`,
which returns a 404 from the registry. The portfolio's own page for pantry has it right and says
plainly that the package is not published, so two of this project's docs contradict the third. A
reader who works past that with the git-dep form then follows a documented `init` then `doctor`
sequence that exits nonzero (2 of 14 checks failing, because the documented `init` omits `--kit`), and
an `INSTALL.md` step telling them to run `skills sync` and confirm the result, which on the shipped pin
produces nothing at all.

**PROOF and MILL** carry no blockers, only staleness.

---

## 4. The recurring shapes

**Docs describing a repo layout that changed underneath them.** The grain monorepo fold-in moved
grain's own source down a level, so every `grain/styles`, `grain/scripts`, `grain/ai/contract.ts` path
in the docs is now wrong. It appears in five separate files including `HACKING.md`, which is the
route-to-source map every session uses as its fast path. Several published GitHub links built from
those paths return 404.

**Plans that never got un-ticked, and plans that never got ticked.** `PLAN.md` claims a build-info
stamp shipped, and the attribute it names appears nowhere in the repo. `crumb/PLAN.md` says nothing is
built. `mill/PLAN.md` lists as "next" four AI-facing outputs that all shipped. `proof/PLAN.md` says
`serve.ts` and `cli.ts` moved to pantry; both still ship and `proof serve` was verified booting.
`pantry/PLAN.md` marks a piece TODO three lines above its own "Built:" note for the same piece.

**Capability that exists and is documented nowhere.** The largest concentration is pantry: five CLI
subcommands (`doctor`, `deps`, `skills`, `graph merge`, `scope`) and four served surfaces
(`/decisions`, `/artifacts`, `/timeline`, `/runs.json`) have no published page. Its README understates
the app by roughly half. `proof verify` is built, CI-able, and has zero mentions across the entire
published docs tree. In grain, eleven shipped browser islands and four AI-layer modules are absent from
every README.

**Counting the layers wrong, in public.** `/bread` says "Four layers, one direction" in its masthead
and "built in five layers" two paragraphs later, above five layer cards. The shared `stack-diagram`
molecule labels its frame "the four" over five drawn bars, and it renders on **every** layer page.

**A claim that is falsifiable in one click, on the worst possible page.** `/proof` tells visitors the
plan board "updates as the files change, no refresh needed". `src/server.ts:236` says the live SSE
refresh is a follow-up, and `watchPlans` appears nowhere in `src/`. The one page whose entire subject
is verifiable plans makes a claim a reader can disprove by watching it.

---

## 5. Packaging and metadata

- **crumb ships no license text at all.** It declares Apache-2.0 and its README badge points at
  `../../LICENSE`, which does not exist inside the tarball. mill and proof both carry their own.
- **NOTICE does not travel.** batch, grain and proof each have a NOTICE file in the repo, none list it
  in `files`, and npm only auto-includes LICENSE and README. Apache-2.0 section 4(d) asks for it.
- **pantry's `files` omits three modules its own shipped code imports** (`graph.ts`, `runs.ts`,
  `timeline.ts`). A tarball built from that list throws on first import, which is what its README's
  install line promises the reader.
- **All five published packages ship their tests**: grain 36 files, batch 6 plus 4 HTML fixtures, mill
  5, proof 3, crumb 1.
- **No package declares `keywords`**, so none is discoverable by npm search.
- **The batch pin, estate-wide.** batch is published at 0.2.0; bread, pantry and the portfolio all pin
  `^0.1.0`. The current published batch is unreachable from every repo, and `bread run deps` prescribes
  a `deps:refresh` that provably cannot cross the boundary.

No badge in the estate asserts something false, and every license badge matches a real Apache-2.0
LICENSE at the path it links to. The badge row is in better shape than anything else audited.

---

## 6. What was fixed

The mechanical path and link drift was corrected in one wave: the stale `grain/` filesystem paths
across five files, the dead PHILOSOPHY and PLAN links in the estate doc map, the `pages/` paths that
predate `view/pages/`, the relative pantry README links that break when GitHub renders them, and the
four missing doc-set rows in `bread/DOCS.md`.

Everything else in this report is left open on purpose. Product claims ("is the SSE board shipped",
"four layers or five"), install instructions that need a decision (publish pantry, or rewrite its
docs around the git-dep), and the batch version pin are all the owner's call, not a background
agent's.

---

## 7. Not covered

- **greenroom's docs** were not audited; the repo was excluded from this pass.
- **Prose style and voice** were explicitly out of scope for all four auditors. This is an accuracy
  audit, not an editing pass.
- **The rendered visual state** of the doc pages was not checked, only their content and status codes.
- The auditors read the working tree during an active fix wave, so a small number of findings about
  file headers and `exports` maps were already being corrected as they were written.
