# bread, greenroom and project, read by the audit, 2026-11-25

Two independent read-only children read these three repos, which is the same cross-check GRAIN got.
They agreed on every shared finding: the `/runs/` traversal, the malformed-body widening, bread's
runbook greps, the stale badge and the docs-only gate. Neither ran a gate.

## greenroom (the real app here, about 7k lines)

| file:line | severity | dimension | problem | fix |
|---|---|---|---|---|
| `server.ts:907` | blocker | validation | `/runs/<own>/%2e%2e/<other>/index.html` checked scope on the raw first segment, which is the caller's own run, then `safeResolve` normalised `..` into the other run and served it. The private-run wall was bypassable, leaking screenshots and video that can carry app-under-test credentials. | Resolve first, scope on the resolved first segment, refuse malformed escapes. **Fixed 2026-11-25** in `lib/binary.ts:resolveRunTarget`, with a test. |
| `lib/tests-lib.ts:380` | blocker | error handling | `renameTest` renames the spec and re-keys `tests-meta.json`, but nothing writes `test.filePath`. In the platform edition the row-to-file link that `pages/editor-api.ts:88` and `lib/run-scope.ts:76` rely on is dead, and `canReadFile` returns true for "no rows", so a renamed private spec becomes readable and editable by everyone. | Update `test.filePath` and the run-scope key with the rename, or refuse rename in the platform edition. |
| `server.ts:360` + `:819` | major | error handling | `readBody` returns `{}` on invalid JSON, so a malformed body means "no files", and `/api/tests/adapt` then adapts every spec. The empty-body case is documented as "all", so the defect is that an invalid body is indistinguishable from an intentional empty one. | Make `readBody` reject invalid JSON, and require `files` or an explicit `"all": true`. |
| `lib/envs.ts:87` | major | error handling | `saveEnv` builds from `loadUrls()`, which returns `{}` when `config/urls.json` is malformed, then writes `{}` plus one environment back, destroying the rest, and ignores the config error it just set. | Return the error before mutating. |
| `lib/tests-share.ts:113` | major | efficiency | Zip import inflates attacker-supplied entries with no decompressed-size or entry-count cap, so one authenticated upload can expand until the process dies. | Cap bytes and entries; 400 past the cap. |
| `run.sh:19`; `record.sh:21` | major | error handling | `node -e require('./config/urls.json')` under `set -e`, where the file is gitignored and only seeded at boot, so the documented first-run path dies with a raw stack. | Seed from the example file when missing. |
| `pages/run.js:49` | major | error handling | `api()` has no `.catch` and never checks `r.ok`, so a failed fetch or a 500 leaves the Run page unchanged, indistinguishable from "still waiting". | Toast the failure and render the server's error. |
| `auth/index.ts:40` | major | validation | `TRUSTED_ORIGINS` hardcodes port 4321 while the server tells the user to retry on 4322 when 4321 is busy, so sign-in fails with no message naming the port. | Derive loopback origins from `PORT`. |
| `lib/adapt.ts:70` | major | tests | The product's central promise, rewriting a foreign spec to run here, has no test; deleting the file breaks nothing. | Fixtures for matched and unmatched host, import swap, login injection. |
| `.github/workflows/ci.yml:28` | major | tests | CI runs `bun test lib` only; the shipped Playwright specs and `check:legacy` never run. | Add the typecheck job and state that e2e is local-only. |
| `server.ts:406` | major | clean code | `handle()` is 510 lines dispatching every route by string literal. | Split per surface, as the `*-api.ts` modules already do. |
| `lib/record` reads: `lib/records.ts:167`, `pages/accounts-api.ts:38` | major | types, DRY | `collectRecords` returns `record: any` from unvalidated JSON, and `json`/`readBody` are copied five times. | A typed record validated at read; one `lib/http.ts`. |
| `lib/run-queue.ts:87`; `lib/records.ts:46` | major | efficiency | A count materialises every row; `pruneRuns` walks the archive with `statSync` per file on every run close, blocking requests and SSE. | `select count()`; persist the size and prune off the request path. |
| minors | minor | mixed | `.references` missing on `runResult.testId`; hardcoded hues in the PDF; repeated inline `margin-bottom:0`; the Monaco palette hardcoded by hex; a corrupt manifest swallowed; 2.9 MB of dead Playwright output under `demo/test-results/`; the README badge says Claude only; "organised four ways" lists three. | Each is one line or one deletion. |

## bread (docs, compose and three hooks; no runtime code)

| file:line | severity | dimension | problem | fix |
|---|---|---|---|---|
| `AUDIT.md:27` (+ `:28`, `:39`, `:50`) | blocker | tests | The layering check greps `batch` and `grain` as subdirectories. They are siblings, so grep exits 2 on a missing path and the printed bar ("expect none") is met by never checking anything: a check that passes when it could not run. | Point at `../batch` and `../grain`, or say layer purity is audited per layer. |
| `AUDIT.md:20` | major | tests | The runbook's first check prescribes `bun run check` (tsc), `bun test` and `test:e2e`; `check` here is `bunx pantry check` and there is no `test` script at all. | Restate the umbrella's real gate. |
| `CLAUDE.md:90` | major | readability | Definition of done demands "tsc + bun test green" in a repo with no TypeScript and no test. | Say the gate is the umbrella's. |
| `compose.yml:65` | major | tests | The portfolio gate ends in `bun run lint`, which the portfolio does not have (it has `lint:voice`, `lint:links`, `lint:runs`), so the gates container has never finished green. | `bun run lint:voice`. |
| minors | minor | mixed | `compose.yml:91` cites a `previewTarget` key that does not exist; the Codex hook list lacks the SessionStart hook Claude has; no lint script; the README badge names one model; "every commit is co-authored with an AI" contradicts the estate rule and the log (0 trailers); no `.github` at all. | Each is a one-line fix. |

## project (docs-only archive, 15 files)

| file:line | severity | dimension | problem | fix |
|---|---|---|---|---|
| `docs/MVP.md:3` | major | readability | The spec's status says "Design phase: functionality first" while the README and CLAUDE say PAUSED and the slice it specs was dropped. | Put the PAUSED banner on it. |
| `package.json:7` | major | tests | No runbook, no scripts, no test, and no statement that this is by design, so a session cannot tell a paused archive from an unmaintained one. | One paragraph saying the gate is "docs-only, link check only". |
| minors | minor | readability | A stale "monorepo root is authoritative" comment; links on the retired host; "the four concerns" points at a section bread does not have. | One line each. |

## Not covered

No gate was run in any of the three: no `bun test`, `tsc`, `pantry check`, `oxlint`, Playwright or
link check. The greenroom traversal was proved by reading `server.ts:907-915` and `lib/binary.ts`, and
was then fixed and tested rather than executed against a live server. Neither script in `run.sh` was
run. Migrations were not compared to the schema. XSS was sampled, not audited across all 69
`innerHTML` sites.
