# Portfolio and framework quality review, October 31, 2026

This is the original audit snapshot. The November 1 disposition below records later implementation
and supersedes its original open status; the earlier failures remain as evidence.

The portfolio's existing finish line does not establish that the framework or its development tools
are reliable in every consumer. This sampled review found concrete failures at import, model,
verification, packaging, and decision-log boundaries. These should precede a broader AI contact
feature or a visual redesign.

This is an audit and improvement proposal. No implementation fixes were applied. Findings are open,
proposed for deferral until the owner selects implementation work; deferral has not been accepted.
The audit is not a clean bill of health or a complete release certification.

## Scope and method

Three independent read-only auditors covered portfolio AI and Builder; BATCH and the GRAIN workspace,
including MILL, PROOF and CRUMB; and PANTRY with a read-only examination of the course-platform
development workflow. The coordinating session inspected browser presentation, maintenance,
verification instructions, and independently reproduced the principal boundary failures.

All auditors used the nine dimensions in AUDIT-STANDARD. Graph queries supplied navigation leads;
source reads verified locations because several graph results were stale or incomplete. The scope is
sampled rather than every line of every package. No badges were audited or changed. No private course
data appears here.

The local intake brief is artifacts/briefs/2026-10-31-portfolio-framework-audit.md and is ignored.
The accepted envelope is: gated review; write only audit evidence and plans; no implementation,
push, merge, deployment, deletion, badge changes, course-platform edits, or messages to other chats.
Scope expansion and owner product decisions stop dependent work; independent checks may continue.

## Findings

Severity describes consequence. A blocker prevents trusting the affected workflow, not every unrelated
portfolio route. Framework-source findings are not assumed to occur in the currently pinned portfolio
package without checking that consumer separately.

| ID | Severity | Dimension | Location | Problem and consequence | Proposed fix |
|---|---|---|---|---|---|
| F01 | blocker | Error handling | ../grain/packages/proof/verify.ts:55 | Failed Git commands become empty diffs. A nonexistent comparison ref returns an affirmative verification result with zero files. | Distinguish command failure from an empty successful diff and fail verification explicitly. |
| F02 | blocker | Error handling | ../grain/packages/grain/ai/model-reasoner.ts:78 | The generic reasoner accepts a registered field action but falls through to success without emitting an operation. Direct field.set reproduced this. | Implement advertised actions or reject unsupported ones; check handler coverage against the registry. |
| F03 | blocker | Tests and distribution | ../pantry/package.json:20 | The package allowlist omits sessions.ts, context.ts, hygiene.ts, hooks.ts and pantry-control.js. Runtime imports and an asset route require them. Source-checkout testing misses the broken package closure. | Include required modules/assets and smoke-test a packed installation. |
| F04 | blocker | Error handling | ../pantry/answers.ts:312 | An unreadable existing decision log returns the same healthy empty state as a missing log. Pending answers disappear from readers without an error. | Preserve read errors and surface them in the CLI, doctor and UI. |
| F05 | major | Error handling | ../grain/packages/grain/ai/model-reasoner.ts:125 | Cancellation during model completion does not prevent the subsequent mutation. An already-cancelled execution still archived an item in the auditor's reproduction. | Check cancellation after completion and before structural effects and navigation. |
| F06 | major | Input validation and types | ../grain/packages/grain/ai/model.ts:147 | Numeric reply text is accepted by parsing and then throws at trim instead of producing a validation failure. | Validate the complete model payload from unknown before execution. |
| F07 | major | Error handling | ../batch/export/export.ts:81 | A missing asset directory produces zero files and no report warning when the optional logger is absent. An export can lose required styles without a machine-readable failure. | Represent required asset failures in the report or throw; distinguish optional mounts. |
| F08 | major | Error handling | ../grain/packages/proof/live.ts:63 | An asynchronous watcher rebuild can reject without handling; stop does not drain in-flight work. The workspace gate produced an unhandled ENOENT during fixture cleanup. | Serialize rebuilds, report failures, and await shutdown before cleanup. |
| F09 | major | Tests | ../grain/packages/proof/live.test.ts:33 | Fixed waits assume the broadcast completed. The actual run missed the expected broadcast and raced cleanup. | Await an observable broadcast and an asynchronous watcher shutdown. |
| F10 | major | Input validation | src/ai/composition.ts:144 | Imported duplicate block IDs are retained without refusal. Deleting one ID deletes both blocks; resizing changes both. Generated fallback IDs can also collide. | Validate uniqueness and address syntax at import, with explicit refusal or deterministic reassignment. |
| F11 | major | Input validation | src/ai/prompt.ts:123 | The first context chunk is included even with no remaining budget; the current query is never bounded. The declared assembled prompt ceiling is not enforced. | Bound input and account for all sections; clip the first chunk too. Test the assembled prompt budget. |
| F12 | major | Error handling | src/ai/desk-door.ts:474 | Contact draft persistence silently swallows storage failure. The reasoner at src/ai/desk-reasoner.ts:1063 then navigates and returns success, although the destination cannot recover the draft. | Return a checked handover result, retain recoverable text, and explain denied storage before navigating. |
| F13 | major | Input validation and types | ../pantry/answers.ts:320 | Persisted JSON with only kind and id is accepted as an answer. answersFor later dereferences its absent request and crashes. | Validate complete answer/ack records and diagnose malformed lines at the read boundary. |
| F14 | major | DRY and correctness | ../pantry/context.ts:141 | Context measurement defaults to ~/.claude while sessions.ts:166 honors CLAUDE_CONFIG_DIR. It can measure a different account's configuration. | Share configuration resolution and identify the active harness explicitly. |
| F15 | minor | Readability and alignment | plans/ai-agency-navigation.md:144 | Historical unchecked tasks describe field setting and cross-page drafting as absent although implementation and behavior tests exist. | Reconcile implemented, remaining and superseded requirements; make the human-only send contract explicit. |
| F16 | minor | Readability | src/ai/block-set.ts:159 | The comment describes replacing fallback fields with model prose; the current Builder discards raw generated prose and derives copy from supplied phrases. | Document the current source-grounded copy contract. |
| F17 | major | Documentation and verification | CLAUDE.md:101 | Gate instructions require a sibling compose setup absent from this checkout and name an obsolete 618-test baseline. Current CI uses host Bun and the local suite discovers 855 tests. | Provide one working verification path and derive counts from evidence rather than an old fixed baseline. |
| F18 | minor | Documentation | docs/HACKING.md:103 | The contributor map still describes the live model as a future milestone and points demo changes at the scripted stub. | Distinguish production DESK, model-driven Builder, and scripted demos; point each to its real entry point. |
| F19 | major | Tests and gate | ../pantry/pantry-review.js:184 | The current lint command fails on the unnecessary fallback in a spread expression. | Remove the fallback and verify the intended expression, then run the gate. |
| F20 | major | Efficiency and error handling | src/server.ts:853 | Each local knowledge request rebuilds the corpus through serial source reads at src/content.ts:595. The audit observed empty responses at the server's ten-second idle timeout, preventing grounded answers. The deployed frozen file remained reachable. | Cache and share in-flight corpus construction with explicit development invalidation; bound source-read concurrency and test cold/warm delivery latency and failure recovery. |

The audit also found oversized controllers: src/ai/desk-reasoner.ts spans 1,858 lines and combines many
tasks; PANTRY app.ts spans 2,005 lines. These justify bounded decomposition proposals, not a cosmetic
rewrite during correctness work. Each extraction needs its own behavior-preservation evidence.

## Independent reproductions

The coordinator reran these cases against source without changing repository files:

```text
builder import: refusals=[], before=2, afterDelete=0, resized=["half","half"]
proof invalid ref: {"ok":true,"problems":[],"planCount":0,"fileCount":0,"base":"AUDIT_INVALID_REF_20261031"}
answers parsed: entries=[{"kind":"answer","id":"x"}], malformed=0
answersFor crash: undefined is not an object (evaluating 'a.request.ref')
existing directory as answer log: entries=[], malformed=0
model parse: {"ok":true,"move":{"action":null,"reply":42}}
model validation crash: (move.reply ?? "").trim is not a function
prompt budget: {"budget":1400,"approxActualTokens":2164}
```

The prompt reproduction uses the ordinary question “What is the BREAD stack?” repeated 300 times and
a small context chunk. It establishes the exported budget-contract failure; it does not establish
an observed live-model context-overflow error. The decision-log reproduction used a temporary
directory and synthetic records, removed afterward.

## What the current AI already does

Contact prefill works through registered fields, navigation, a cross-page draft handover, and the
human's compose controls. Its browser tests explicitly preserve human-only sending. A generic
multi-step planner, missing-information conversation, and chat-based review cards are separate
possible enhancements. Adding form submission is a product decision, not completing a forgotten
unchecked task.

The Builder obtains structure from a local model, validates the closed block vocabulary, reconciles
required types/counts/exclusions, and derives visible copy from supplied phrases. Acceptance follows
a review step. A successful final page proves the guarded workflow, not reliable raw model writing
or unrestricted language understanding. Deterministic browser tests and historical model captures
answer different questions and must remain labelled separately.

## Browser experience

The coordinator captured /, /projects, /grain/builder, /mail, /grain, /docs and /pantry at 1440px and
390px. All fourteen loads returned 200, all had a page heading, and no page-level horizontal overflow
or pageerror was observed. A heuristic found no completely unnamed button; this is not an accessible
name computation or a full accessibility audit. Screenshots and machine-readable measurements are
local in screenshots/audit-2026-10-31/.

The home page gives a clear selected-work action and links to inspectable evidence. The Builder
names its small block vocabulary, local-model download cost, and review requirement. At phone width
its empty canvas and empty Blocks panel stack before the output disclosures. The desktop entry
depends mainly on writing a prompt, with a text link to the editable example.

Opening the four-block example exposes working span, move and delete controls. These already exist;
the improvement is making them discoverable during first use. Natural-language copy editing remains
explicitly unsupported, which limits a visitor treating this as a page builder.

Proposed UX experiment: make a small editable example or a few explicit presets a primary entry
point, introduce the existing direct controls, and evaluate a bounded copy-editing path alongside
natural-language layout editing. Measure time to a useful editable page, successful edits, recovery from an import, and the
clarity of review/undo/export. This is a testable product proposal, not a demonstrated usability
failure or an authorization to redesign the shell.

Full keyboard, screen-reader, contrast, motion, all-theme, physical-phone, and deployed-site checks
were not completed in this sample. The browser measured local source rendering, not the deployed
artifact. Downloading the matching browser runtime was necessary before the checks could run.

## PANTRY in actual development

The inspected consumer has plans, documentation and a PANTRY configuration. Its development guide
requires an externally configured trusted PANTRY source checkout for doctor access. Durable workflow
instructions already operate through repository files. PANTRY's session reader defaults to Claude's
project-event location, and this review did not verify a native Codex emitter bridge.

These observations establish setup and harness friction. They do not prove that the dashboard has
no value or that a new integration is the right answer. A dependency and tour files alone do not
prove that a browser mounts the review experience. No private course material is needed to make
these distinctions.

Before expanding PANTRY, walk one actual development task through both the current Codex workflow
and PANTRY. Compare finding current scope, finding an unanswered decision, reviewing rendered
evidence, checking verification, and handing work over. Record extra setup, duplicate entry, and
actions the tool uniquely enables. Keep useful CLI checks independently usable. Choose dashboard
integration, simplification, or retirement only after this comparison; increased dashboard usage
is not itself an outcome.

## Nine-dimension coverage

| Dimension | Status and evidence |
|---|---|
| Clean code | Oversized multi-purpose controllers identified; no broad refactor proposed as a mechanical fix. |
| DRY and atomicity | Harness configuration resolution differs between PANTRY readers; generic action handling drifts from the registry. |
| Design-system use | Sampled UI is coherent at both widths; framework token-conformance tests were observed passing. No new verified token violation. No exhaustive component or theme pass. |
| Efficiency | Local grounding delivery exceeded the request idle budget during the fresh AI run. No throughput benchmark is claimed. Whole-board derivation remains a profiling candidate; local content tests also timed out under concurrent audit load. |
| Error handling | Verified silent success, swallowed persistence/read failures, missing export warnings and watcher rejection. |
| Input validation | Duplicate imported addresses, malformed model replies and incomplete persisted-answer schemas reproduced. |
| Types | Unsafe boundary casts conceal the malformed-reply and answer-log failures; runtime validation is required. |
| Tests | Meaningful behavior assertions exist, but package-install coverage and failure-boundary cases are missing; baseline gates are not all green. |
| Readability and documentation | Source explains the architecture, but contributor instructions, AI plan state and Builder comments drift from current behavior. |

## Verification evidence

Required container gates were not run: this checkout has no sibling compose file matching the
documented command. Host checks are recorded as diagnostic evidence, not substituted silently for
the required environment. No failed test was repeatedly rerun hoping for a pass. Browser attempts
were repeated only after resolving distinct missing-runtime or server-startup prerequisites.

Portfolio typecheck exited 0. Full host unit run:

```text
848 pass
7 fail
2860 expect() calls
Ran 855 tests across 46 files. [176.60s]
```

All seven failures were five-second timeouts in content/anchor/preflight checks. A concurrent focused
AI run returned 693 pass, 1 fail, 694 tests across 29 files, with the real-corpus anchor check timing
out. Concurrency is relevant context, not proof that these failures are harmless.

The focused browser command was:

```sh
PORT=3347 bunx playwright test desk-contact-prefill desk-actions builder-canvas mobile-layout docs-entry-points ia-nav --ignore-snapshots --workers=2
```

```text
1 failed
  e2e/desk-actions.e2e.ts:83:3 › THE DESK drives the page (deterministic actions, no WebGPU needed) › capabilities: 'what can I do here?' lists the actions in the chat
109 passed (5.2m)
```

The failed assertion expected “summarize this page” while the reply still showed Thinking. It does
not establish that the action is absent. Contact prefill passed on Mail and across navigation;
Builder controls, proposal review/cancellation, export/reopen and undo cases passed. These tests
use deterministic controls or scripted model results, so they do not replace fresh inference.
The initial full-suite attempt could not start the server in its configured window. A subsequent
attempt against the ready server was stopped after revealing the missing Playwright browser runtime;
no full 442-case result is claimed. The focused run followed browser installation.

```text
link-lint: 57 rendered file(s), no dead relative links.
lint gate: level. 4478 flag(s) total (oxlint + voice-lint), matching or under the 4479 in tools/lint-baseline.json (generated 2026-10-14).
```

BATCH typecheck, lint and unit command exited 0; lint had warnings:

```text
55 pass
0 fail
124 expect() calls
Ran 55 tests across 7 files. [2.78s]
```

GRAIN workspace typechecks passed and lint had warnings. The workspace test command exited 1 at PROOF:

```text
Expected: 1
Received: 0
at .../grain/packages/proof/live.test.ts:35:41
ENOENT: no such file or directory, open '.../002-second.md'
at async loadPlans (.../proof/loader.ts:70:23)
at async rebuildAndBroadcast (.../proof/live.ts:44:41)
65 pass
2 fail
2 errors
150 expect() calls
Ran 67 tests across 10 files. [21.30s]
@tjakoen/proof test: Exited with code 1
```

CRUMB's observed summary was 61 pass, 0 fail. Complete GRAIN/MILL package summaries were not retained
by that agent, so this report makes no claim about their full totals.

PANTRY typecheck passed. Lint failed at pantry-review.js:184 with
unicorn(no-useless-fallback-in-spread), plus warnings. Its host unit run encountered a five-second
skills-test timeout and a late assertion; no complete passing suite is claimed. A pack dry-run
listed 32 files and confirmed the missing runtime dependency closure. A fresh packed installation
was not attempted.

The doctor returned 23 checks, 0 failing, 4 due: cold-start context above budget, stale merged graph,
four stale skills plus the unmounted local-AI skill, and three incomplete run reports. All answer-log
entries were acknowledged, package pins were current, and the initial tree was clean and up to date
with origin/main. Advisory doctor success does not invalidate the source defects above.

The fresh WebGPU task run selected Qwen2.5-0.5B-Instruct-q4f16_1-MLC and completed:

```text
== 2/5 passed, 3 failed, 0 not run — .cache/desk-audit/report-audit-2026-10-31.json ==
  ✗ bread-stack — missing any of [batch]; missing any of [grain]; missing any of [mill]
  ✗ who-is-tj — missing any of [teach]; missing any of [Career Team, dev manager, tech lead]
  ✗ grain-built — missing any of [grain]; missing any of [read more]
  ✓ nav-fuzzy-mill
  ✓ cap-det
```

All three failed grounded scenarios reported an empty response fetching /knowledge.json; replies
disclosed an error rather than supplying the expected answer. Even the passing navigation and
capability scenarios recorded the failed knowledge request. A WebGPU adapter and download progress
were observed, but this result does not establish fresh successful model inference or score model
answer quality. Scenario labels alone do not prove which route used the model.

```text
[Bun.serve]: request timed out after 10 seconds. Pass `idleTimeout` to configure.
local knowledge curl: exit 52, status=000 bytes=0 seconds=9.114188
deployed knowledge curl: status=200 bytes=1058144 seconds=2.030456
```

The direct local request was an isolated diagnostic reproduction, not a repeated test-suite run.
Concurrent browser testing was active, so these timings describe this audit environment. The static
deployment result contradicts any claim of a demonstrated deployed grounding outage. Source confirms
uncached per-request compilation and serial source reads. The rejected knowledge promise is also
retained for the page instance at src/ai/desk-door.ts:126; recovery deserves a separate browser case.
The next AI-quality run must first establish successful knowledge delivery. Fresh Builder inference
and a broad held-out model matrix were not run.

## Prioritized improvement plan

1. Restore trustworthy verification and failure reporting. Address F01–F04 and the PROOF watcher
   lifecycle first. Add negative tests proving that unavailable evidence cannot produce success.
   Add a packed-install smoke test so the PANTRY distribution cannot omit its runtime closure.
2. Restore local grounding delivery, then repair visitor-facing boundaries. Enforce unique Builder
   IDs, checked draft handover, strict model
   payload validation, cancellation before effects, and an assembled prompt limit. Reproduce each
   failure before its fix and retain that case afterward.
3. Reconcile maintenance and documentation. Repair the runnable gate instructions, reconcile the
   navigation plan and Builder copy contract, refresh graph/skills deliberately, reduce unnecessary
   cold-start context, and complete the historical run evidence. Do not alter shared machine setup
   while treating this as a portfolio-only edit.
   Add a verified contributor walkthrough that installs the public packages, adds one component and
   registered action, tests its refusal path, and explains server versus static-browser transport.
   The walkthrough must run from its own instructions rather than point at a future milestone.
4. Test Builder improvements with actual tasks. Start from an editable example, make two direct
   changes, request a natural-language edit, inspect the review, undo it, then export and reopen.
   Include Open→Undo as a decision/test case: current Open replaces state without recording that
   outgoing state while retaining prior history. Choose record-versus-reset behavior explicitly.
5. Scope the remaining contact experience from current behavior. Measure discovery, collecting
   missing details, preview, correction and cancellation. Retain human-only sending unless the
   owner explicitly changes that contract. A generic planner is not a prerequisite for a useful flow.
6. Test PANTRY's value in one real course-platform development task, read-only at first. Compare
   completed work and review quality against the existing workflow before choosing integration or
   removing surfaces. Keep doctor and evidence checks usable without a mandatory dashboard.

Implementation belongs in each owning repository and follows targeted review. Badges and the
course-platform implementation remain outside this work. Open findings have not been accepted as
deferred; the next owner decision is which bounded implementation slice to take first.

## Review and disposition

Independent framework review confirmed F01, F02 and F05–F09 against the original reproductions.
Independent portfolio-AI review confirmed the import, prompt-budget, persistence, stale-documentation
and local-grounding findings, including the limits on what the live run establishes. The coordinator
independently reproduced the principal invalid-ref, malformed-answer, malformed-reply and duplicate-ID
failures. PANTRY findings were source-checked, including runtime imports against the package allowlist.

No implementation was changed, no failed gate was declared green, and no commit or push was made.
Reports remain local and uncommitted because the baseline gates are red. The review phase has produced
its findings and priority proposal; remediation and accepted deferrals remain open.

## Implementation disposition, November 1

All twenty initial findings have local source changes with regression evidence. This does not mean
the public site or packages have been released. The implementation run report is
artifacts/runs/2026-11-01-portfolio-reliability.md; sibling repositories hold their own scoped reports.

| Findings | Local disposition | Evidence |
|---|---|---|
| F01, F08, F09 | PROOF fails closed on Git errors and reports/drains watcher work. | PROOF 85 tests, including the nested-directory follow-up; independent framework review. |
| F02, F05, F06 | Generic model capabilities match implemented actions; unsupported moves fail explicitly, cancellation gates effects, malformed field types fail validation. | GRAIN workspace 706 tests before the final PROOF fixture, followed by PROOF 85 tests and all package typechecks; independent review. |
| F03, F04, F13, F14, F19 | PANTRY package closure, installed-runtime smoke, log validation/read diagnostics, account configuration selection and lint fixed. | PANTRY 740 tests, typecheck/lint; desktop and 390px error-state inspection. |
| F07 | BATCH reports configured asset-directory failures in export warnings. | BATCH 58 tests, typecheck/lint; root diff review. |
| F10 | Imported block addresses are validated and unique through later additions, including numeric exhaustion. | Composition 21 tests and browser import/operate coverage. |
| F11 | Assembled prompt estimates honor the configured ceiling or return an explicit refusal. | Prompt and reasoner regressions; seven ordinary actual-corpus queries fit the budget. |
| F12 | Failed contact persistence retains a copyable draft without navigation. | Five contact browser cases, including denied writes and denied storage access. |
| F15, F16, F17, F18 | Navigation-plan state, Builder contract comments, runnable gate instructions and contributor map reconciled with source. | Contributor walkthrough: 118 reasoner/integration tests, contact/recovery browser checks, frozen install and doc-anchor checks. |
| F20 | Grounding uses an explicit source allowlist, bounded reads and a shared retryable cache with authored-content invalidation. | 17 content/cache tests; same-page fetch-recovery browser case; cold request 83ms and warm 6ms in the measured local sample. |

Fresh DESK tasks passed 5/5. Fresh Builder tasks passed 4/4: deletion, one card, prohibited card and
two separately worded cards. Raw model output still proposed extra blocks in some cases; reconciliation
removed them before review. These are measured guarded outcomes, not general model intelligence.

The portfolio unit suite passed 867 tests. The broad browser run passed 445 cases while its single
aggregate plan-detail test exceeded sixty seconds. That test was split into independently bounded
per-plan cases, preserving source-to-board parity, layout and local-link assertions; all 31 passed.
The final verification record distinguishes these runs rather than claiming one combined green run.

Closeout scope verification exposed another PROOF issue: Git evidence commands ran from the nested
plans directory, so untracked paths and added-line pathspecs could disagree with repository-relative
paths. The follow-up runs evidence commands from the resolved repository root and canonicalizes
filesystem aliases before matching plan paths. A real-Git fixture failed before the fix and passed
after it; root independently reviewed the diff and reran scope verification.

Builder Open now remembers the replaced composition for Undo. Its editable example is a visible
button and its review copy explains the actual source-grounded contract. The new review tour names
those surfaces; desktop and phone captures show no horizontal overflow on the sampled updated pages.

The PANTRY workflow evaluation used a private consumer read-only. It supports optional rendered review
and CLI checks, but does not establish native Codex event integration or that a dashboard improves the
owner's daily workflow. No consumer migration or new integration was selected. Detailed source
observations remain in the ignored local brief; no private course content was published.

Remaining limits are explicit: no releases, pushes or deployment; no physical-phone inference or
exhaustive assistive-technology study; no architectural decomposition; no arbitrary natural-language
copy editing or AI mail submission. Private memory size and missing historical stdout remain named
maintenance debt. New local source verification does not retroactively establish old run evidence.
