# PANTRY and BATCH, read by the audit, 2026-11-25

Two repositories, one read-only child on the light lane, no gate run beyond `tsc --noEmit` (exit 0 in
both). The tables below are its findings, kept verbatim so the report can point at them. Severity
means consequence: blocker is wrong now or fails silent, major is a bug or a wasted afternoon soon,
minor is true and deferrable.

## PANTRY

| file:line | severity | dimension | problem | fix |
|---|---|---|---|---|
| `hub.ts:170, 174, 225` | blocker | validation | The hub's `Bun.serve` passes no `hostname`, so it binds every interface, the condition `app.ts:678` itself names, and nothing on `/mcp` (174) or `/report`/`/report.json` (225) calls `isLoopbackRequest`, while the child server gates `/control` and `/sessions.json` for exactly that reason. Anyone on the LAN can call `pantry_claim`/`pantry_release` (`mcp.ts:248-252`) and read every project's brief, run ledger and claim log. | `hostname: "127.0.0.1"` on the hub, or gate `/mcp`, `/report*` and `/health?path=` with the same check. |
| `config.ts:225, 238` | major | validation | `JSON.parse(pantry.config.json)` is unguarded and `docsDirs` is `.map`ped with no `Array.isArray`, so one trailing comma throws a raw SyntaxError out of `loadPantryConfig` and every command, `serve` included, dies with a stack naming no field. | Wrap the parse and say which file and line; validate `docsDirs` as an array. |
| `hub.ts:33, 37-40, 143-150` | major | error handling | `readRegistry` parses unchecked and `writeRegistry` writes non-atomically, while `sync()` re-reads every 5s from a `setInterval` with no try/catch: a truncated `projects.json` becomes an uncaught throw in a timer, so the hub dies and dies again on each restart. | try/catch the read with an empty-registry fallback and a log line; write via tmp plus rename. |
| `hub.ts:119` | major | validation | The hub refuses to start a project unless `pantry.config.json` exists, but `config.ts:217` accepts `.ts` and `.js` too, so such a project is registered and served as permanently down. | Check all three names. |
| `mcp.ts:302-305` (via `hub.ts:176`) | major | error handling | `tools/call` has no try/catch: one malformed plan or claims line makes `loadProjectWork`/`readClaims` throw, and the MCP client receives Bun's 500 HTML where a JSON-RPC error belongs. | try/catch around `callTool`, return `{code:-32603, message}`. |
| `app.ts:653, 725, 769, 797, 881, 959`; `hub.ts:207` | major | validation | `decodeURIComponent` on the raw URL segment at seven sites, none guarded: `GET /runs/%`, `/decisions/%`, `/artifacts/raw/%`, `/design/%`, `/open/%` throw URIError inside the fetch handler. | One `decodeSegment` returning null, answered with 400. |
| `answers.ts:280-284`; `decisions-page.ts:243` | major | error handling | When the repo log is not writable, `appendAnswer` silently appends to the machine inbox, but the receipt still answers `path: logPath`. The owner is told the answer is in the repo log while it is not, so it never reaches git. | Return the path actually written and report that. |
| `retrieval.ts:141, 159` | minor | efficiency | `buildKnowledge` runs `loadPlans` twice in one request, once for the index and once for the timeline count, and `/llms.txt` is fetched by every `pantry_orient`. | Load once, derive both. |
| `app.ts:1027` | minor | error handling | `servePantry` passes no `error` handler, so any throw becomes Bun's default 500 with no line of ours. | `error(err) { console.error(err); return new Response("Internal Server Error", { status: 500 }) }`. |
| `orchestrator.ts:119` | minor | validation | `Date.parse(v.lastAt)` with no validity check: a hand-edited claim line yields NaN, the claim never expires, and the plan stays unofferable with nothing on screen saying why. | Treat NaN age as expired and flag the line. |
| `cli.ts:97-98` | minor | DRY | `--port N` goes through `numberFlag`, `--port=N` through `Number`, so `--port=abc` yields NaN, the class the comment at 64-71 records as fixed for `--timeout`. | `numberFlag` on both. |
| `doctor.ts:402-1250` | minor | clean code | `runDoctor` is one ~850-line function holding every check, so a new check has no obvious home. | Split into `checkX()` returning `DoctorCheck`. |
| `pantry.css:136-144` | minor | DRY | The dark map palette is typed twice, byte-identical, in the media query and the `[data-theme="dark"]` rule. | One shared selector list. |
| `certify.ts:39-43` | minor | DRY | `readGates` is a second reader of `pantry.config.json` that knows only `.json`, so a `.ts`-configured repo silently gets `DEFAULT_GATES`. | Read through `loadPantryConfig`. |
| `mcp.ts:276-278` | minor | error handling | `clearTimeout` sits after `Promise.all`, so a rejection leaves the 120s timer armed against an exited child. | `clearTimeout` in `finally`. |
| `app.ts:476` | minor | efficiency | The claims watcher's async listener is not serialized, so two quick changes can run two full board renders at once and the older result can land last. | A running flag that skips or re-queues. |
| `hub.ts:281` | minor | validation | `/theme.json` POST rejects a mismatched Origin but accepts a request with no Origin, so anything reaching the port can overwrite the owner's theme. | Reject when Origin is absent. |

Mechanical: `cli.ts:98` `Number(...)` becomes `numberFlag(...)`; `cli.ts:437` usage string lists the
commands that exist; `mcp.ts:278` `clearTimeout` moves into a `finally`.

## BATCH

| file:line | severity | dimension | problem | fix |
|---|---|---|---|---|
| `render/render.ts:242` | major | error handling | `data="user.adress"` that does not resolve renders the component against `undefined` and says nothing, while the same typo in `each=` (236) calls `onMissing` and warns or throws under `missing: "throw"`. The pinning typo is the failure this config exists to make loud, and this branch is the silent one. | Resolve, call `onMissing` when not found, then use the value. |
| `export/rewrite.ts:41-42` | major | validation | `srcset` is captured whole and prefixed once, so `srcset="/a.png 1x, /b.png 2x"` becomes `/<bp>/a.png 1x, /b.png 2x`: every candidate after the first keeps a root-absolute path and 404s on a subpath host. | Split on commas, prefix each candidate, add a two-candidate test. |
| `http/modules.ts:103` | minor | validation | `roots[rootName]` inherits from `Object.prototype`, so `/modules/toString/x` passes the `!root` guard and throws TypeError out of `resolve(join(...))`. | `Object.hasOwn(roots, rootName) ? roots[rootName] : undefined`. |
| `http/modules.ts:122` | minor | efficiency | `findServerOnlyImports` builds a fresh `Bun.Transpiler` on every cache miss, though the module already holds one at line 88. | Pass the shared transpiler in. |
| `export/export.ts:126, 149, 170` | minor | types | `(e as Error).message` turns a thrown string or Response into the literal `undefined` in the report and the log, so a failed page reports no reason. | `e instanceof Error ? e.message : String(e)`. |
| `http/sitemap.ts:14`; `assets/style-bundle.ts:11` | minor | efficiency | `readdirSync` walks the page tree on the request path for `/sitemap.xml`, `/robots.txt` and the nav; cached, but it blocks the event loop on first request. | Async `readdir`, or build the route list at boot. |
| `http/static.ts:39` | minor | efficiency | Every static request reads the whole file and sends no `Cache-Control` or ETag, and PANTRY mounts `/styles` and `/scripts` through this. | `Cache-Control` plus an mtime ETag and 304. |
| `http/stream.ts:22-77` | minor | tests | The SSE hub has no test and no cleanup path: a dropped client stays in the map until the next broadcast throws, and there is no keepalive frame. | One subscribe/push/cancel test and a periodic comment frame. |
| `render/render.ts:131` | minor | validation | `selfCloseRe` joins component names with no regex escaping, so `x-a.b.html` compiles `.` as a wildcard and rewrites `<x-abb>`. | Escape each name. |
| `render/render.ts:73, 188, 257, 265` | minor | types | `data: any` is the engine's public API, unchecked at the boundary where template paths resolve against it. | `unknown` plus a `JsonValue` alias. |
| `export/rewrite.ts:95` vs `41` | minor | DRY | `extractRefs` scans only `href`/`src` while `rewriteHtml` also rewrites `action`, `poster`, `data-src` and `srcset`, so the dead-link check cannot see a broken `action=` or a srcset candidate. | One attribute list both read. |

Mechanical: `modules.ts:103` uses `Object.hasOwn`; `render.ts:131` escapes each component name;
`export.ts:126,127,149,170` use `e instanceof Error ? e.message : String(e)`.

## Status by dimension

PANTRY: clean code minor, DRY minor, design system clean, efficiency minor, error handling major,
validation blocker, types minor, tests good (no e2e suite, URIError paths untested), readability clean
apart from `runDoctor`.

BATCH: clean code clean (largest file 272 lines), DRY minor, design system not applicable (serves
bytes, ships no visual tokens), efficiency minor, error handling major, validation major, types minor,
tests strong per module except `stream.ts`, `style-bundle.ts`, `errors.ts`, `validate.ts` and `watch.ts`,
readability clean.

## Not covered

- No gate was run beyond `tsc --noEmit`: the tests write temp fixtures, so "would deleting the feature
  break a test" is answered by reading imports and grep, not by running them.
- PANTRY read but not audited line by line: `sessions.ts`, `capture.ts`, `doctor.ts` beyond the
  function-size finding, `design.ts`, `graph.ts`, `usage.ts`, `where.ts`, `report.ts`, `hub-home.ts`,
  `owner.ts`, `timeline.ts`, `init.ts`, `deps.ts`, `drift.ts`, `learn.ts`, `resume.ts`, the browser
  files, and the Tauri app.
- BATCH: `audit/audit.ts` and the test files themselves.
- Nothing was booted, so no claim here rests on runtime behaviour.

## A second reader's additions

A second independent child read the same two repos and found a browser-origin hole the first did not,
plus several error paths worth recording.

| file:line | severity | dimension | problem | fix |
|---|---|---|---|---|
| `pantry/decisions-page.ts:227` (+ `app.ts:545`) | blocker | validation | The answers write path trusts the loopback socket and checks neither `Origin` nor `Content-Type`. Any page the owner visits can POST a forged answer to `http://127.0.0.1:4400/answers`, which a session then acts on. The comment at `answers.ts:194-199` argues the socket check replaces header trust, which is the wrong guard for a browser-origin attack; `hub.ts:278-282` already does it right for `/theme.json`. | Require JSON content type and a same-origin Origin, or a custom header that forces a preflight; test a cross-origin POST as 403. |
| `pantry/decisions.ts:177` | blocker | error handling | A decision file whose frontmatter throws is dropped with no count, so `buildDecisionsPayload` returns fewer decisions and the plan that file blocks becomes claimable. A human gate disappears silently, where `answers.ts:95` counts `malformed` for exactly this reason. | Collect `unparsed` into the payload, render it, and treat it as blocking. |
| `pantry/mcp.ts:288` | major | error handling | `id === null` treats JSON-RPC id `0` as a notification, so a valid request is answered 202 with no body and the client waits forever. | Test for the key's absence. |
| `pantry/app.ts:1027` | major | validation | The project server also binds every interface, so `/plans`, `/decisions`, `/answers.json` and `/runs` are readable from the LAN, not just the hub. | `hostname: "127.0.0.1"` by default, with an explicit LAN flag. |
| `pantry/config.ts:216-227` | major | validation | The host config is a cast, not a validation: an unguarded `JSON.parse` and no key checked, so `"plansDir": 5` kills boot with a raw error. | Validate each key and name `file:key` on rejection. |
| `pantry/hub.ts:33` | major | validation | `readRegistry` parses unchecked and trusts the shape; a half-written `projects.json` breaks the hub and an entry without a port becomes `:undefined`. | Catch, and reject entries missing name, path or port. |
| `pantry/orchestrator.ts:324` | major | error handling | The plan path is rebuilt from a lowercased id, so `001-Timeline.md` becomes `001-timeline.md` and a card written on a case-sensitive filesystem lands in a second file nobody reads. | Carry the real filename. |
| `pantry/resume.ts:30` + `learn.ts:27` | major | DRY | The render/parse/replace/write quartet exists twice and has already drifted on the truncation cap (400 vs 500). | One parameterised module. |
| `pantry/app.ts:540` | major | clean code | `pantryRoutes` is a 350-line function inside a 1046-line file. | Split per surface family. |
| `pantry/app.ts:815` | major | error handling | `/timeline` globs the plans directory before checking it exists, so a host without `plans/` gets ENOENT and a 500, contradicting the comment above it. | Guard with `existsSync`. |
| `pantry/mcp.ts:304` | major | error handling | `tools/call` has no try/catch, so a throw becomes an HTTP 500 instead of a JSON-RPC error object. The other reader found the same. | Wrap and return `-32603`. |
| `pantry/mcp.ts:146` + `:168` | major | error handling | Both unread-answer lookups catch everything and return empty, so a heartbeat says "no answers" when the log is unreadable. | Return the read error. |
| `pantry/app.ts:466-471` | major | error handling | `annotate` swallows failures, so a claims read that throws renders a board with no claim badges, identical to "nobody holds anything". | Warn and stamp a visible notice. |
| `batch/package.json:29` + `audit/audit.ts:13` | major | error handling | `./audit/*` is a published export that imports `@playwright/test`, a devDependency, so a consumer gets MODULE_NOT_FOUND while the docs say Playwright never ships. | Optional peer, or drop the export. |
| `batch/export/export.ts:62` | major | error handling | `fetch` has no timeout, so one hanging route stalls the export with no output. | `AbortSignal.timeout(30_000)`. |
| `batch/export/export.ts:188-201` | major | error handling | The dead-link check never consults `modules`, so every site using `moduleEntries` is warned about its own frozen scripts. | Add the module routes to `resolves()`. |
| `batch/audit/audit.ts:57` | major | tests | `waitForTimeout(200)` before sampling timings, and the audit's product is the number. | Wait on load, or drop the sleep. |
| `batch/http/stream.ts`, `sitemap.ts`, `style-bundle.ts`, `audit.ts`, `platform/watch.ts` | major | tests | Five exported modules with no test, and PANTRY serves three of them in another repo. | Colocated tests. |
| minors | minor | mixed | Unlocked read-modify-write on open counts; a leaked `waiters` closure; `/timeline` per-request scan; `Bun.Glob` ENOENT; `srcset`; `--port=abc`; `data: any`; a hand-rolled preview error page. | Each is a small fix. |

The two readers agreed on the hub's interface binding, the registry parse, `tools/call` and the
`srcset` rewrite. Neither ran a gate.
