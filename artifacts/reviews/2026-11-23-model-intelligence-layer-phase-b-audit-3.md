# Audit 3: Model Intelligence Layer Phase B fixes R1 to R3

This review covers branch `mil-b-fixes` in claude-config, commits `103f82f`, `1920202` and `f61c56e`. The previous audit failed the branch on three blockers, R1 to R3, and these commits are the fixes. The review was read-only. Every state directory, `HOME` and `USERPROFILE` pointed at a scratch folder, no tracked file in claude-config was edited, and nothing was pushed, merged or switched. All probes ran against the real scripts with synthetic payloads. Tests ran on host bun, non-Docker, with `/tmp/py3shim` on `PATH`.

## Verdict: FAIL

R2 is fixed in the code but not in its own test suite, and the cap it sets cannot fire with the shipped registry. R1 works for the single-spawn case but frees the wrong spawn when two spawns share an agent type. R3 is still bypassable by a trivial spelling: a file name split with quotes forged an approval end to end. A fourth item, a stale test, is a plain regression of the R2 commit.

## Status of the three blockers

| Blocker | Commit | Status | One line |
|---|---|---|---|
| R1 | `1920202` | Partly fixed | The release chain works for one spawn. With two concurrent spawns of one type, the wrong claim is released. |
| R2 | `103f82f` | Fixed in code, with a stale test and a dead cap | Six sequential spawns are admitted. The cap of four never fires, and one test still asserts the lifetime cap. |
| R3 | `f61c56e` | Not fixed | Approvals no longer follow `ESCALATION_STATE_DIR`, but several spellings of the file name and of the environment override pass the guard. |

## Findings

### F1. SubagentStop frees the oldest spawn of the type, so a running child can lose its claim (R1, important)

`session-event.sh:64` calls `supervisor.ts release` with `--agent-type` and the stopping subagent's `agent_id`. The supervisor keys live spawns by the spawn's `tool_use_id` (`spawn-envelope.sh:167`), which is not the subagent's own id, so the id never matches and `release` falls back to the oldest live spawn of that type. `session-event.sh:72` then releases the worktree claim of whichever id came back.

Scenario, reproduced: two general-purpose spawns, `toolu_B1` then `toolu_B2`, each with a claim. The younger one, B2, stops. The supervisor frees B1, the older and still running child, and its claim is marked released. `worktree_claims.conflict()` for another session on B1's worktree then returns no conflict, so a second session can take a worktree a live child is editing. B2, which has finished, keeps its live entry and its claim, and both keep being refreshed. The mix-up evens out only when B1 stops later and the supervisor frees B2.

This is the R1 failure class: two live sessions sharing a worktree. Confidence: high, because I ran it. Whether Claude Code ever sends an `agent_id` that equals the spawn's `tool_use_id` is the one thing I could not check.

### F2. A child that runs past 30 minutes loses its live entry and then its claim (R1, important)

`supervisor.ts:75` drops live entries older than 30 minutes (`STALE_MS`) on the next `admit`. `worktree_claims.py:314` refreshes a claim only while its spawn is in the supervisor's live set. After any later admit, a child that has run for more than 30 minutes disappears from the set, its claim stops being refreshed, and it lapses within 30 minutes. I reproduced the drop: with `toolu_L` backdated 31 minutes, the next admit left only `toolu_M` live. I did not run the follow-on refresh skip, which follows from the line quoted above. The claim TTL in `worktree_claims.py` is also 30 minutes, so the two windows line up and nothing renews a long child. Confidence: medium-high.

### F3. A spawn with no `tool_use_id` keeps its claim for the life of the session (R1, important)

When `tool_use_id` is missing, the claim is written with an empty spawn (`worktree_envelope.py:150`) while the supervisor's agent id falls back to the first word of the description (`spawn-envelope.sh:167`). `release_spawn` matches on the spawn id, so it never finds the claim. `refresh` treats an empty spawn as "refresh always" (`worktree_claims.py:314`). Reproduced: the claim of a finished child stayed refreshed at `now + 120 s`. This is the same condition as the earlier R9 nit, now with a consequence. Confidence: high for the behavior, low for how often it happens, since Claude Code normally sends `tool_use_id`. Codex payloads are untested.

### F4. The R2 commit leaves a failing test that still asserts lifetime counting (R2, important)

`spawn-envelope-worktree.test.ts:248` seeds `spawns: 4, live: {}` and `:251` expects `limit: spawns 4 per task`. After `103f82f` the spawn is admitted, so the test fails (`33 pass, 1 fail`, reproduced with `SUPERVISOR_STATE_DIR` unset). It is not one of the 10 session-event baseline failures. I could not run the parent commit's version of this suite, so I cannot show it passed before. The code path is unambiguous, though. Confidence: high.

### F5. The new cap of four cannot fire with the shipped registry (R2, important)

`model-roles.json` sets `maxConcurrency: 3` and `maxSpawnsPerTask: 4`. `supervisor.ts:105` checks concurrency before `supervisor.ts:107` checks the spawn cap. With live spawns counted by both, the spawn cap is always the weaker limit, so the cap never fires. Reproduced: spawns a1 to a3 admitted, a4 and a5 refused with `limit: concurrency 3`. Six sequential spawns were all admitted, which satisfies the decision. The new test for the cap works only because it sets `maxConcurrency: 10` (`supervisor.test.ts`, "a fifth live spawn is refused"). If the owner meant "four at a time", the effective cap is three. If the owner meant to keep three concurrent, the spawn cap is dead configuration. Confidence: high on the behavior, and the reading of the decision is the owner's.

### F6. The approval guard still has many ways around it (R3, blocking)

`approval-guard.sh:85` to `:88` match the literal word `approval`, and `:83` matches only `NAME=` after a literal variable name. Both are text checks. Reproduced against the real script (exit 0 means allowed):

- `cp f.json ~/.claude/state/escalation/appro""vals.jsonl` is allowed. I ran it in the scratch home. It created `approvals.jsonl`, and `escalation-record request` for the metered destination then passed the approval gate and failed only on the missing `DEEPSEEK_API_KEY`. So a quote-split file name forges an approval end to end. The same holds for `'appr'ovals.jsonl`, `{appr,x}ovals.jsonl`, `a*s.jsonl` (when the file already exists) and a name built from a variable, `${n}ovals.jsonl`.
- The environment override is missed by `export "HOME"=`, `export HO""ME=`, `process.env["HOME"]=`, `Object.assign(process.env,{HOME:...})`, `Set-Item Env:HOME`, `[Environment]::SetEnvironmentVariable` and `declare -x HOME`. Each lacks a literal `home=`.
- A script file written first and run later (`bash s.sh`, `bun mk.ts`) is allowed. The guard header documents this one as a known limit.

Confidence: high, all of it executed. The first bullet matters most: it is a one-line forgery, so the claim "every spelling" is not met.

What held: an `export` on an earlier line of the same command, `env HOME=`, `ESCALATION_STATE_DIR=`, `cd x && USERPROFILE=`, `$env:HOME =`, `set HOME=`, `bun -e 'process.env.HOME = ...'` and the Write tool aimed at `.../approvals.jsonl` under a redirected `HOME` were all denied (exit 2). So were the mixed-case, dotted and `::$DATA` spellings of the file name for Write. The reader no longer follows `ESCALATION_STATE_DIR`, and `escalation-record.test.ts` passes.

### F7. The guard blocks ordinary work (R3, nit)

Denied (exit 2) when they should not be: `HOME=/tmp/s bun test shared/tools/escalation-record.test.ts`, `bun test shared/tools/approval-guard*.test.ts`, `ls shared/tools/approval*` and `git log --grep='approval' -- 'shared/*'`. Allowed: `git status`, `git diff` on the guard, `git commit -m "Close approval bypasses"`, plain `bun test` on the supervisor, escalation-record and approval-guard files, and `escalation-record approve <id>`. The false positives are cheap to rephrase, but the first one blocks the documented way to run the escalation tests. Confidence: high.

### F8. The spawn-cap wording still says the old thing (R2, nit)

`session-checklist.sh:179` and `session-checklist.test.ts:69` print and match "4 spawns per task". The supervisor's counter `spawns` is still incremented (`supervisor.ts:109`) and printed on admit (`:191`), but no gate reads it. That is harmless but is the one piece of lifetime counting left. Confidence: high.

## Tests

All runs used host bun, non-Docker, with `/tmp/py3shim` on `PATH`.

| Suite | Result |
|---|---|
| supervisor | 25 pass, 0 fail |
| worktree_claims | 30 pass, 0 fail |
| approval-guard | 15 pass, 0 fail |
| escalation-record | 19 pass, 0 fail |
| session-event | 8 pass, 10 fail |
| spawn-envelope | 91 pass, 0 fail |
| spawn-envelope-worktree (the worktree-envelope suite) | 33 pass, 1 fail (F4) |
| mil-checks (all files) | 49 pass, 0 fail |

The session-event count of 10 matches the stated baseline. I did not compare the failing names against the parent commit. The pass counts for the guard and escalation suites show that the existing tests cover the cases the fixes added, and F6 shows that they do not cover the spellings above.

## R1 quoting check

The Python embedded in `session-event.sh` sits inside bash single quotes. The lines the commit added contain no apostrophe, and the file runs end to end in my synthetic SubagentStop probes. With one spawn, the claim was released and the supervisor's live set emptied. The `import worktree_claims` inside the block works because the earlier `sys.path.insert` runs under the same `if session:` condition.

## What I could not verify

- The real Claude Code payload fields: whether `tool_use_id` is always present on spawns, and how SubagentStop's `agent_id` relates to it. F1 and F3 depend on both.
- Codex wiring for the guard, the release and the claims. I tested the scripts with synthetic payloads only.
- The live `settings.json`, which I was told not to read. The session checklist reported that `goldfish-gate.sh` is missing and that the settings entry has not been applied, so the guard may not be active on this machine at all.
- The parent-commit failing set for `spawn-envelope-worktree.test.ts` and for session-event, because an extracted checkout of the parent could not run the suites.
- Windows short names such as `APPROV~1.JSO`. The guard allowed the command, but no such name exists on the scratch disk.
- Behavior on Docker or Linux. Everything ran on Windows host bun.
