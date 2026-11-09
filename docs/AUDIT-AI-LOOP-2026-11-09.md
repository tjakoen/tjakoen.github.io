# Audit: the AI loop and workflow, 2026-11-09

The owner asked for a loop audit after a reading pass over two Anthropic harness articles. This is
not the repo audit of 2026-11-08, which judged the site's code. This one asks a narrower question:
when a session starts, works, and closes, which of the loop's rules are enforced by a machine, which
are enforced by a model remembering, and which are only written down?

Four read-only auditors read one bounded area each and returned findings with a file and a line: the
standards documents, the machine hooks and the DSH plugin, this repo's loop tooling, and the evidence
trail. The synthesis, the ranking, and the fixes below are one pass. The gate was green before the
pass and after it. Every finding is either fixed in this pass or deferred with a reason in section 7.

Line numbers are the tree at the start of the pass. The fixes marked as landed move a few of them by
a line or two.

## 1. The loop as it actually runs

| Step | Claude Code | Codex | DeepSeek Harness |
|---|---|---|---|
| Session start | doctor, config sync, checklist, session event | the same five | the checklist only, and it does not arrive (F1) |
| Before a write | human lane on Edit, Write, MultiEdit, NotebookEdit (F6) | a matcher that matches none of Codex's write tools (F2) | the plugin guard (F7) |
| Before a spawn | envelope check | envelope check | envelope check, values not checked (F30) |
| After a tool call | context trigger, output bounds, discovery nudge | the same | the same, fewer nudges |
| Turn end | review gate and finish gate on Stop | the same | `cli.mjs end`, manual, exits 0 on red (F5) |
| Close | finish gate | finish gate | stop report, then `close` (F10) |
| Evidence | run report with gate output | the same | the same, checked by PANTRY (F24, F25) |

The repo's own front door says "the loop is the same in all three; the adapter is what changes". The
table above is the audit of that sentence, and it is not yet true. The adapters differ by more than
syntax: two harnesses enforce the doctor and the config-sync report at start and DSH does not, and the
Codex write guard is wired to names its own tool set does not use.

## 2. Findings

| # | Severity | Dimension | Location | Problem | Fix | Status |
|---|---|---|---|---|---|---|
| F1 | blocker | error handling | `~/.dsh/loop/plugin.mjs:169,178,357` | The checklist script reads stdin at its first line. The plugin runs it through execFile without closing stdin, so the read waits on a pipe that never ends, the 20 second timeout kills the script, and runChecklist returns null. The fallback notice that should say the checklist did not run also failed to reach this session's transcript, so the failure is silent. Two observed sessions, one code path. | Close stdin in the exec call (`bash -c 'exec "$1" </dev/null'`), and surface the fallback notice as an ordinary message. The reproduction and patch are in `artifacts/runs/2026-11-09-analytics-fallback.md`. | Reported. Machine file; the doc now carries the defect. |
| F2 | blocker | input validation | `~/.codex/hooks.json:82` | The Codex human-lane row is matcher-gated on `Edit\|Write\|MultiEdit\|NotebookEdit`, names from Claude Code. This machine's Codex sessions show 203 calls named `exec` and zero named Edit or Write; the binary exposes `exec_command` and `apply_patch`. The guard cannot fire on a Codex file write. | Match Codex's write tools (`apply_patch`), and test it with one real Codex write. | Reported. Machine file. |
| F3 | blocker | tests | `agent-config/shared/tools/session-checklist.sh:115` | The expected-hooks row greps each expected filename as a substring of every joined hook command. It ignores event and matcher, so the dead Codex row in F2 counts as wired and the verdict prints Agentic Loop Loaded. A check that cannot fail is why F2 stayed invisible. | Validate per event and matcher, against the tool names the harness actually exposes. | Reported. |
| F4 | major | error handling | `~/.dsh/loop/plugin.mjs:350`; `standards/LOOP.md:72`; `~/.dsh/AGENTS.md:66` | The global rule says config sync runs at session start on every machine, and LOOP's tier 1 says session start runs the doctor. Claude and Codex do both. DSH runs neither: the plugin runs the checklist only, and `cli.mjs start` is a command the model must remember. Nothing noticed that this session skipped it. | Have the plugin run the doctor's warn rows and the config-sync report, or fold both into the checklist. | Reported. |
| F5 | major | error handling | `tools/dsh-loop/cli.mjs:135-140` | `end()` prints the typecheck and lint gate results through `printExit`, which only prints. It never sets `process.exitCode`, so the command named "end" exits 0 when the typecheck is red. The turn-end gate in DSH cannot fail. | Capture the check result and set `process.exitCode` when it is nonzero; add a test that a red check exits 1. | Reported. |
| F6 | major | input validation | `agent-config/shared/tools/human-lane.sh:35-46` | With empty or unparseable stdin the python extractor prints nothing, the target is empty, and the script exits 0, which allows the write. A write tool whose payload is malformed is never judged. It also dies quietly if python3 is absent. | If the tool is a write tool and no target can be extracted, block with a diagnostic. | Reported. |
| F7 | major | error handling | `~/.dsh/loop/plugin.mjs:159-165,103` | `guard()` catches every exception and returns undefined, which is an allow. `writeGuard` returns silently when the write tool carries no `file_path`, `notebook_path` or `path`. A guard bug or an unexpected argument shape passes the write with no log line. | Deny write tools whose target cannot be read, and log the exception. | Reported. |
| F8 | major | error handling | `agent-config/shared/tools/session-checklist.sh:104,125` | The DSH MCP row tests only `mcp-pantry` but prints all three servers. The DSH style-override row is an unconditional `ok` with no test behind it, so a style override cannot turn the DSH verdict red. | Test each server id and name the missing one; run the style grep or print `skip`. | Reported. |
| F9 | major | tests | `agent-config/shared/tools/dsh/README.md:78` | The checklist decides green against red and has no automated test. Its README says it is exercised by its own DSH run, which is manual. The guard, plugin and stop modules all carry tests; the verdict script does not. | Add a shell test that stubs PATH and config to force each failing row and asserts the verdict is NOT loaded. | Reported. |
| F10 | major | error handling | `tools/dsh-loop/close.ts:482,510` | Two false notes. It compares a historical run report's unpushed count with live git in both directions, so a report whose commits were later pushed produces "claims 2 unpushed, git counts 0" and CLOSE WITH NOTES on clean main. And when attribution is unknown it says "the notes belong to the estate, not to this session" about a note that was itself about missing attribution. | Fire the unpushed note only when git counts more than the report claimed; branch the close line on `mine.known`. | Reported. |
| F11 | major | DRY | `standards/LOOP.md:71` | The push row claims the doctor runs in CI. `.github/workflows/ci.yml` runs the typecheck, tests, lint gate and e2e, and no doctor. This is the same claim the 2026-08-13 audit filed as F4. | Remove the doctor from the push row. | Fixed. |
| F12 | major | DRY | `standards/CONFORMANCE.md:34,60,64` | The conformance pass is told to run `bunx pantry doctor`. `LOOP.md` section 6 says PANTRY is unpublished, that `bunx pantry` will not resolve, and that the unscoped npm name belongs to an unrelated package. A pass that follows this either cannot run or runs someone else's package. | Point at the install caveat, or name the checkout command the pass actually uses. | Reported. |
| F13 | major | tests | `standards/CONFORMANCE.md:97` | C4's link check greps only `https://tjakoen.github.io`, the retired host. The address the estate prints is portfolio.tjakoen.com, so the check tests the address nobody links to, and a zero-match run reports clean. | Grep both hosts, and make a zero-match run a finding. | Fixed. |
| F14 | major | DRY | `standards/AI-REPO-STANDARD.md:298` | The day-one checklist says "copy in AI-DEVELOPMENT.md and this file". LOOP section 3 says standards are referenced by URL and never copied, and the doctor's forked-standards check fails a repo that copies them. | Link the published URLs instead of copying. | Fixed. |
| F15 | major | DRY | `standards/SESSION-LOOP.md:228` | Section 5 says the context trigger is "called from the turn-end hook in a quiet mode", then argues at length that turn-end is the wrong event and PostToolUse is the only one that reaches the model. The live wiring is PostToolUse, which makes the first sentence a test of whether the reader got that far. | Say PostToolUse. | Fixed. |
| F16 | major | DRY | `standards/HOOKS.md:317` | The end-of-turn row claims the typecheck, the lint count, the graph refresh and the two report lines. `tools/review-gate.sh` runs tsc, proof verify, the tour nudge, the lint count and the handoff nudge. There is no graph refresh and no report-line ask there; both belong to `dsh-loop end`. | Make the row match the gate, and name where the graph refresh actually fires. | Reported. |
| F17 | major | DRY | `standards/HOOKS.md:130` | The file says every gate exits 0 except "the two PreToolUse denials in this file". The estate wires three denials: the two here and the Edge push guard. | Name the third. | Fixed. |
| F18 | major | DRY | `standards/CONFORMANCE.md:36` | The pass says the doctor owns fourteen checks. It runs 23, and the list omits the answer-log check that the session-start row of LOOP depends on. | Drop the count. | Fixed. |
| F19 | major | tests | `tools/link-lint.ts:23` | RENDERED_DIRS leaves out `content/events` and `content/badges`, so the check covers 61 of 865 rendered files. The weekly link-rot job in the heartbeat inherits the gap. | Add both directories; check the runtime before adding 767 badge pages to a weekly job. | Reported. |
| F20 | major | tests | `plans/decisions/2026-08-05-skills-self-trigger.md:4`; `2026-08-18-loop-practice-gaps.md:4`; `2026-09-16-proactive-loops.md:4` | Three of the five decisions are marked resolved on 2026-11-08 with no answer line in `answers.jsonl`; the newest answer is 2026-11-04. A commit resolved all three without touching the log, so a later session cannot tell what was decided or by whom. | Re-ask the three in chat and log one answer each, or demote them to "answered in chat, unlogged" so the record says what it knows. | Reported. |
| F21 | major | tests | `plans/decisions/2026-08-17-context-budget.md:4` | The file records `decided: 2026-08-18` and an answer saying the number "is now agreed". The only recorded answer for that decision is dated 2026-11-04. The file claims the owner's consent 78 days before he gave it. | Correct the date and note that the earlier entry was a session's assumption. | Reported. |
| F22 | major | tests | `plans/README.md:51` | The only plan check is done-with-open-items. Nothing ties a ticked task to the evidence that it was met, so a session can tick a task with no acceptance and no checker notices. This is the gap the harness reading named, in this estate's own board. | Require a `done: <evidence ref>` on each checked task, at least for plans with `owner: ai`. | Reported. |
| F23 | major | readability | `plans/pantry-review-layer.md:3`; `plans/pantry-control-center.md:3` | Both plans have been blocked for four weeks, both depend on plans that are now done, and the schema has no field for why a plan is blocked or what would unblock it. The reason lives in prose hundreds of lines long. | Add a required `blocked:` line to the schema and re-derive both statuses now their dependencies are met. | Reported. |
| F24 | major | tests | `artifacts/runs/2026-11-09-memory-dream.md:21` and the three other reports dated today | All four reports from today are flagged by the run ledger: `unpushed` written as prose after the number, and a merged heading "Not done, and what needs human eyes" that the checker reads as no human-eyes section. Zero of the 55 earlier reports are flagged, so the drift is at the tip. | Keep the pair form `N \| reason`, and keep the human-eyes section its own heading. Teaching the checker merged headings is the alternative. | Reported. |
| F25 | major | tests | `artifacts/runs/2026-08-11-status-without-a-hue.md:91`; `artifacts/runs/2026-08-11-grain-token-debt-g1-g4.md:147` | Two reports carry reconstructed gate fences that open with "NOT A PASTE". The reports are honest; the ledger is not, because it prints "carries its evidence" for both. The check asks for a fenced block and cannot tell a paste from a reconstruction. | Carry an `evidence: reconstructed` field and count those separately on `/runs`. | Reported. |
| F26 | minor | error handling | `~/.dsh/AGENTS.md:111` | The global rule points at `tools/expected-hooks.txt`. No such file exists in this repo or at the agent-config root; the real file is `agent-config/shared/tools/expected-hooks.txt`. A reader who follows the rule from a repo finds nothing. | Correct the path. | Reported. |
| F27 | minor | tests | `pantry/doctor.ts:618` | There is still no `AUDIT.md` runbook, and the doctor reports the absence as information rather than as a gap. The 2026-08-13 audit filed this as F12, so the audit's mechanical half has had no per-repo home for three months. | Write the runbook from the gates in `package.json` and `.github/workflows`. | Reported. |
| F28 | minor | readability | `MEMORY.md:6` (project memory index) | The index line says "open calls only" for a file that is mostly struck-through closed items. A session that trusts the one-liner reads a closed log looking for open calls. | Retitle the line to what the file is, or move closed items out. | Reported. |
| F29 | minor | readability | `artifacts/runs/2026-11-09-budget-scope.md:7` | `scope:` entries are directory prefixes, so a root file cannot be declared. Both reports flagged for scope growth this week edited a root file that was in scope in spirit and out of scope as written. | Accept exact file paths in `scope:` as well as prefixes. | Reported. |
| F30 | minor | input validation | `agent-config/shared/tools/spawn-envelope.sh:140` | The envelope test is heading presence only. `Lane:` with an empty value passes, and the DSH twin behaves the same. | Require non-empty text after each heading. | Reported. |
| F31 | minor | error handling | `tools/lint-gate.ts:208` | The regression message says rerun `bun run lint:baseline` to accept a rise, but that command refuses a rise without `--accept`. | Print `--accept`. | Fixed. |
| F32 | minor | tests | `tools/voice-lint.ts:128` | SCOPE's comment claims every surface a person reads as prose. It omits `content/badges` and `content/data`, so badge copy is ungraded by the only prose gate. | Add badge copy, or correct the comment to say what is covered. | Reported. |
| F33 | minor | tests | `tools/diagram-cache-gate.test.ts:142` | The test timed out at 5,108ms while four auditors ran and the suite was under load, then passed alone and in the clean run. A subprocess-heavy test with no explicit timeout is flaky by construction under local parallelism. | Give the subprocess tests an explicit timeout. | Reported. |

## 3. Per-dimension status

1. **Clean code.** Clean for the loop's own code. `tools/desk-audit.ts` is 889 lines, over the 800
   line threshold, and is reported here only as size; it is the SEO audit, not the loop.
2. **DRY.** The weakest dimension. Eight findings across five standards files describe machinery that
   differs from what is wired. Six are fixed; F12 needs a decision about the install path, and F16
   needs a table row rewritten against the tool it describes.
3. **Design system.** Not touched. This pass changed no rendered surface, so no token or component
   question arose.
4. **Efficiency.** One finding, F19, which is coverage rather than speed. The full e2e suite ran past
   25 minutes and the audit subset past 12, so both were cancelled; one WCAG chunk passed on its own.
5. **Error handling.** The strongest result and the worst news. Three blockers, all of them a check
   that cannot fail or a guard that cannot fire. The class the 2026-11-08 audit closed in the repo's
   tools is alive one layer up, in the harness.
6. **Input validation.** F2 and F6, both at the trust boundary a hook reads its payload from. F30 is
   the same shape in the envelope.
7. **Types.** No finding. The loop's shell and plugin code carries no types by nature, and the
   TypeScript tools compile clean.
8. **Tests.** F3, F9, F20, F21, F22, F24, F25, F33. The pattern is a checker that tests presence
   instead of effect: a filename in a command string, a fence under a heading, a ticked box, a heading
   exactly spelled.
9. **Readability.** F23, F28, F29. The record is usually honest and often hard to read, and the two
   blocked plans show what that costs when a reader has to reconstruct a decision from prose.

## 4. Recurrence, and what that says

Three findings from earlier audits are still open or have moved:

- **The doctor at session start.** The 2026-08-13 audit's F1 was that the doctor never ran by itself.
  It now runs in Claude Code and Codex. In DSH it still does not, and the doc says so, which makes it
  a known gap rather than a mystery (F4).
- **The human lane guarded by nothing.** The 2026-08-13 audit's F6 closed when the two guards shipped.
  The Codex matcher means one of the two harnesses still has no write guard (F2), and the checklist
  cannot see it (F3).
- **The run ledger decaying.** The 2026-08-13 audit's F8 closed when PANTRY started checking reports.
  It now decays at the tip instead of the tail: four of four reports written today are flagged, none
  of the 55 older ones (F24).

The 2026-11-08 repo audit closed a class it called "a check that can report a pass without doing the
work": five repo tools that scanned zero pages or swallowed a failure and stayed green. Four of this
pass's blockers and majors are the same class in the harness instead of the repo: the checklist that
cannot arrive, the hook check that cannot see a dead matcher, the `end` command that cannot exit
non-zero, the ledger that cannot tell a paste from a reconstruction. The lesson is not that the fix
failed. It is that the class has a second home, and the machine layer had no audit until now.

## 5. What is working, stated as plainly

- **The spawn envelope.** Four subagent spawns in this session were denied for missing the four
  headings, and the denial was specific enough to fix. That is the guard doing its job on its first
  real test, in the harness this audit was most worried about.
- **The checklist itself.** Run by hand, it returns eleven accurate rows and a verdict in under a
  second. The script is good; the transport is broken.
- **The doctor.** Twenty-three checks, none failing, and it caught the one thing this session broke:
  the mounted `loop-standard` skill was stale after the standards edit, and the doctor said so.
- **The repo gates.** 950 unit tests, a clean typecheck, a lint gate that holds its baseline, and a
  link check that now refuses to pass on zero files. The 2026-11-08 fixes held.
- **The run ledger's judgement.** It flagged today's four reports correctly enough to be useful, even
  where its heading matching is too literal. It is the only reason F24 was visible at all.

## 6. Gate output

```text
$ bun run check
$ tsc --noEmit

$ bun test
 950 pass
 0 fail
 3996 expect() calls
Ran 950 tests across 50 files. [46.19s]

$ bun tools/lint-gate.ts
lint gate: level. 4528 flag(s) total (oxlint + voice-lint), matching or under the 4528 in tools/lint-baseline.json (generated 2026-11-09).

$ bun run lint:links
link-lint: 61 rendered file(s), no dead relative links.

$ bun ../pantry/cli.ts doctor
23 checks, 0 failing, 2 due
[warn] graphify freshness: merged-graph.json predates this repo's own extraction — run pantry graph merge
[info] audit freshness: no AUDIT.md runbook in this repo
[info] answer log: 22 answers, all acted on
[info] session events: 29 session(s) recorded here, 1 alive now
[ok  ] uncommitted work: working tree clean
[ok  ] unpushed work: up to date with origin/main

$ bash ~/.dsh/loop/session-checklist.sh (DSH mode, run by hand)
Agentic loop check, tjakoen.github.io (PANTRY project, DSH)
 ok   DSH
 ok   Instructions: global + repo, 17k chars of the 20k budget
 ok   Memory: 97 notes, index loads whole
 ok   DSH loop: plugin linked and mounted
 ok   MCP: pantry, tokensave, headroom configured
 ok   No style override
 ok   Standards: 21 skills mounted (voice, loop, session-loop...)
 ok   PANTRY: serving tjakoen.github.io at http://localhost:4403/__pantry/, 2 ready, 0 claimed
 ok   tokensave: indexed, 1 day(s) old
 ok   graphify: graph 0 day(s) old
 ok   Git: main, 0 uncommitted
Agentic Loop Loaded (DSH)

$ bunx playwright test e2e/wcag.e2e.ts -g "light, part 4" --ignore-snapshots --workers=1
  ✓  1 e2e/wcag.e2e.ts:36:3 › canonical routes pass axe WCAG 2.2 AA (light, part 4 of 8) (2.3m)
  1 passed (2.3m)
```

One number in that block moved during the pass. The lint baseline went from 4,483 to 4,528 and was
accepted with the gate's own `--accept` flag. The increase is 47 backticked paths in this report's
findings table, partly offset by two flags the standards edits removed. That is the one rise the
ratchet allows and the reason accepting one takes a second flag.

The e2e line is one chunk, not the suite. The full run went past 25 minutes and the four-file subset
the 2026-11-08 audit used went past 12 minutes, so both were cancelled. The single WCAG chunk above is
the e2e evidence this pass owns. Section 7 says what that leaves uncovered.

## 7. Deferred, with reasons

- **The machine fixes (F1, F2, F3, F4, F6, F7, F8, F9, F26, F30).** They live in `agent-config` and
  `~/.dsh`, outside this repository. The plugin patch for F1 was already handed over in the run
  report of 2026-11-09 and is the owner's to apply. F3 and F9 are the same change seen from two
  sides: the checklist needs a test before it can be trusted to fail.
- **F5 and F10.** Real code with a test to update. Both are small, and both change a command's exit
  or verdict, so they want a session that can run the change end to end rather than an audit patch.
- **F12.** The fix needs a decision the audit should not make: whether `@tjakoen/pantry` is published,
  whether the conformance pass should use a checkout, or whether the command should carry the caveat.
- **F16.** One table row describing a different tool. The row should be rewritten against
  `review-gate.sh`, not word-swapped.
- **F19.** Adding `content/badges` to the weekly link check adds 767 pages to a scheduled job. That is
  a runtime decision, not a coverage one.
- **F20, F21.** The owner's record. Re-asking him what he already decided is worth more than a session
  inventing dates, so the report names the three and stops.
- **F22, F23, F25.** Schema changes in PANTRY and PROOF: an evidence ref on a done task, a blocked
  reason, a reconstructed-evidence flag. Each needs its own plan and its own tests.
- **F24.** The four reports are evidence and are not rewritten. The next report should keep the
  headings apart; the checker could also learn to read a merged one.
- **F27, F28, F29, F32, F33.** Small and true. The rest wait for the pass that touches their file.
- **The full e2e suite and the estate.** Both the full suite and the prior audit's four-file subset
  were started and cancelled at 25 and 12 minutes; one WCAG chunk passed on its own. That proves the
  e2e harness runs, not that the docs this pass changed render end to end. The local dev server also
  answers 404 for every `/docs/project` page, including untouched ones, so this report has not been
  seen rendered. The other six repos, PANTRY's own source beyond `runs.ts`, the DSH application
  internals, and the PR review skills were not read. The Codex tool-name finding rests on this
  machine's archived sessions and the binary's strings, not on Codex documentation.

## 8. What was fixed in this pass

| Commit | Fix |
|---|---|
| `9eacc3c` | The harness sources and the expiry rule, before the audit began. |
| the commit carrying this report | F11, F13, F14, F15, F17, F18, F31, the known-defect note in `docs/HARNESS-DSH.md`, and the deliberate lint-baseline move. The mounted skills were re-synced after the standards edits. |

The fix wave is one commit on purpose. Each item is a claim that contradicted another file in the same
set, and splitting them would leave the standards disagreeing with themselves between commits.
