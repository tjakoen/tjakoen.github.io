# Audit 6: Model Intelligence Layer Phase B, release readiness, sixth round

This review covers the whole `mil-b-fixes` branch in claude-config (head `b2ac276`), with the focus on `b2ac276`, and the MODELS.md section 12 change at `917d1c00` on `mil-b-standards`. It checks audit 5's findings N5, N6 and N8, reruns audit 4's R1 and R2 checks, and rechecks the approval guard for false positives.

Hard stops held. No tracked file in either repository was edited, and nothing was pushed, merged or switched. `HOME`, `USERPROFILE`, `SUPERVISOR_STATE_DIR`, `CLAUDE_CONFIG_DIR`, `ESCALATION_STATE_DIR`, `ESCALATION_APPROVALS_DIR` and `USAGE_LEDGER_DIR` pointed at a scratch folder for every run. The real `~/.claude/settings.json` and `~/.claude/state` were never read or written. I never ran `approval-signer.ps1 create` or `sign`; the only signer call is the read-only `pubkey` mode. The committed tool ran from the worktree unmodified, except where a row says "stand-in", which means a scratch copy whose `pubkey` call returns my own test key (this machine has no owner key, and I may not prompt Hello). A stand-in run proves the logic of a check, not that a real Hello key behaves the same.

The accepted limit is respected. Code running inside the tool (`bun --preload`, `bunfig.toml`, `BUN_OPTIONS`) and a direct call to the provider are not findings here. Every finding below needs neither.

## Verdict: FAIL

N5 and N8 are fixed, and N6 is fixed for the exact forms audit 5 named. R1 and R2 hold. But the owner's goal, that a metered request cannot return approved without the owner's Hello key, is still not met. Three routes remain, and none of them runs agent code inside the tool:

1. The model name `DeepSeek V4.1 Flash` resolves to a plan-cost registry entry, so a metered DeepSeek request named that way needs no signature at all (N10).
2. The request id is a hash over fields joined by a newline, and the flags can contain a newline, so an approval the owner signs for a plan-cost request can be spent on the metered destination (N11).
3. A signed approval is not single-use, and its cap is not enforced: re-appending the owner's signed line after its `used` record makes it valid again, ten times in a row in my run (N12).

Each is a small, local fix. I verified the logic of N10 against the real tool and of N11 and N12 with a stand-in anchor.

## Findings

### N10. Naming the destination by its model string selects a plan-cost entry and skips the signature (blocking)

`escalation-record.ts:121` finds the destination with `x.e.id === to || x.e.model === to`, which returns the first match. The registry holds `DeepSeek V4.1 Flash` three times as a plan-cost entry under the `dsh` harness (`model-roles.json:188-218`, `"cost": "plan"`, no id) and twice as a metered entry (`:289`, id `deepseek-v4.1-flash`, "paid DeepSeek API", and `:433`). `allEntries` lists the harness entries first, so `--to "DeepSeek V4.1 Flash"` resolves to the plan-cost one. Line 167 then skips the signature, because `dest.cost` is `plan`, and the `--id` and `--est-usd` rules at line 127 are skipped too.

Reproduced against the committed tool, real PowerShell, no owner key, `DEEPSEEK_API_KEY` unset: a hand-written owner line for the request id, no `sig`, and `request --to "DeepSeek V4.1 Flash"` printed `{"request":"88e455ba1c8a","approved":true,"to":"DeepSeek V4.1 Flash","capUsd":5}` and exited 0. The control, the same request with `--to deepseek-v4.1-flash`, was refused with `unsigned approval` (exit 3). The ledger line for the first records `provider: "deepseek"`, `cost: "plan"`.

Two things keep this from being a one-liner for an agent today. The hand-written owner line needs the guard to let the write through, and audit 4 showed the quote-split spelling gets past it (rechecked below). And whether DSH's DeepSeek use really is covered by a plan is the owner's fact, not mine. But the same model string is the paid API in the OpenCode entry, the tool has no harness argument, and an approved line is what a caller reads as permission to spend. The signature is the stated lock, and here it does not apply to the name the tool itself prints on its approval.

Fix: when several registry entries match `to`, take the most expensive cost among them (metered over plan over free), or refuse an ambiguous name and ask for the id. Add a registry check that no two entries share a model with different costs unless they carry distinct ids. Confidence: high, run end to end.

### N11. The request id hashes fields joined by a newline, so a signed plan-cost id can be spent on a metered request (blocking)

`requestId` (`escalation-record.ts:40-42`) hashes `${from}\n${to}\n${reason}`. All three come from flags and any of them may contain a newline. The N6 check at lines 127-132 accepts an id that equals `requestId(from, dest.model, reason)`, so a request whose fields shift one line produces the same id.

Scenario, run with a stand-in anchor: the owner signs the id of a plan-cost request, `--from sonnet --to gpt-6.2-astra --reason $'deepseek-v4.1-flash\nR'`, which is id `3beca502a3af`. The agent then runs `--from $'sonnet\ngpt-6.2-astra' --to deepseek-v4.1-flash --reason R --est-usd 1`. Same hash string, same id. Result: `{"request":"3beca502a3af","approved":true,"to":"DeepSeek V4.1 Flash","capUsd":5}`, exit 0. The signature verified, and it says nothing about the destination. The sanity control, a metered request that names `--id 3beca502a3af` without the collision, is refused with the hash it should have used.

This is the N6 gap in a different spelling, and it needs the owner to sign an id the agent chose. The owner cannot see the destination when answering the Hello prompt (MODELS.md says so), so a plausible plan-cost request with a long reason is enough. Two smaller notes on the same function. The id is 12 hex characters, 48 bits, so a signed id can also be matched by brute force against a chosen reason, at a cost I did not measure. And `request` is the only thing the signature binds; the destination and the cap's meaning are not in the payload.

Fix: put the destination model id and the estimated cost in the signed payload (`payloadOf`), and build the request id from a length-prefixed or JSON encoding of the three fields, never a newline join. Confidence: high on the collision, run end to end with a stand-in anchor.

### N12. A signed approval is replayable, and the cap does not bind it (blocking)

`findApproval` (`escalation-record.ts:46-61`) walks the file in order, and a `used` record only sets `current = null` for the lines before it (line 53). A later copy of the owner's original signed line sets `current` again (line 54), and the signature is still valid, so the approval is live again until the 24 hours run out. `consume` writes the `used` record into the same agent-writable file, so nothing outlasts the replay.

Run with a stand-in anchor, cap $5. The first request was approved and the second was refused (`approval required`), which is the intended single use. Then I re-appended the owner's signed line three times, running a request after each: all three approved. In a separate run, ten replays at `--est-usd 4` each against a $5 cap were approved ten times, $40 of declared spend on one signature.

The cap does not stop it. `escalationSpendUsd` (`usage-ledger.ts:70`) sums only `basis: "actual"` lines, which exist only if the caller reports them through `escalation-record outcome`. Estimates are never added, and `--est-usd` is the caller's own number. With cap 0 and `--est-usd 0` a request is approved (`0 + 0 > 0` is false), also run. So the cap is advisory today, and the "single-use" and "cap" sentences in the file header do not hold against anyone who can append to `approvals.jsonl`. The guard denies the plain file name, and `cat one.line >> .../appro""vals.jsonl` is still exit 0 (rechecked below), so the append is not hard to make.

Audit 5's table lists "`used` record after the line, then replay: Refused". That tested a `used` record appended after the signed line, which is the order the code handles. It did not test a signed line appended after the `used` record, which is this finding.

Fix, in order of strength: bind the owner's signature to a one-time nonce the tool records in a place the agent cannot rewrite (not possible with a plain file, which is why the broker the owner plans is the real answer); short of that, make `used` sticky by the digest of the signature (any `used` for a signature voids every copy of it, wherever it sits in the file), count approved estimates in `escalationSpendUsd` as spend, and refuse a request whose estimate is missing or zero for a metered destination. Those raise the cost of the replay to rewriting the file and the ledger, which is the same class as the accepted limit. Confidence: high, run end to end with a stand-in anchor.

### N13. N5 holds for every variable I tried, but the allowlist still copies the caller's `SystemRoot`, `windir`, `USERPROFILE`, `APPDATA`, `LOCALAPPDATA`, `TEMP` and `TMP` (important, hardening)

`signerEnv` (`approval-sign.ts:38-45`) copies these from the agent's environment. I could not turn any of them into code execution, but one of them demonstrably changes what the child does: `SystemRoot` pointed at a scratch folder makes Windows PowerShell die with "Internal Windows PowerShell error" and exit code 0, with empty output. The tool stays closed only because `osVerifier` also requires non-empty output (`approval-sign.ts:63`); a signer that exits 0 with nothing is a trap for the next edit. The child reads the caller's `SystemRoot`, so a fake tree laid out like Windows is the next thing to try, and I could not stage one. Confidence: medium that this is exploitable, high that it is a real input the agent controls and does not need.

Fix: pin `SystemRoot`, `windir`, `SystemDrive`, `ProgramFiles*` and `CommonProgramFiles` to the system constants as `PSModulePath` is pinned; copy only `USERNAME`, `USERDOMAIN`, `COMPUTERNAME` and the per-user paths the Hello call actually needs, and have the owner run `escalation-record approve` once to confirm Hello still signs.

### N14. Nits

- `approval-guard.sh` still denies `HOME=/tmp/x bun test shared/tools/escalation-record.test.ts` (exit 2). It is the last false positive from audit 3's F7.
- The supervisor still increments and prints `spawns` (`supervisor.ts:109`, `:191`), and nothing gates on it. Harmless; it is also why admits print `"spawns":11` after eleven sequential launches.
- `osVerifier` and `osSign` accept exit 0 with a missing or crashed child only because of the output check. A non-zero exit for a crashed signer would be easier to read.
- MODELS.md section 12 states two things the code does not do, so the section is wrong today; see below.

## Status of the open items

| Item | Status | Evidence |
|---|---|---|
| R1, a spawn's worktree claim ends with it | Fixed | `session-event.sh:63-80` frees the exact spawn through the meta file and touches no claim without an exact match. Suites: session-event-claims 11 of 11, worktree_claims 34 of 34, session-event-release 3 of 3. I read the release code and ran the suites; I did not rerun a hand-built long-running-child probe this round. |
| R2, four spawns at a time | Fixed | Six sequential spawns with a release between each were all admitted. Four launched in parallel were admitted and the fifth was refused with `limit: 4 spawns at a time per task (4 live)`, exit 3. A burst of eight in parallel admitted exactly four. |
| R3, a metered request needs the owner's Hello key | Not fixed | N10, N11 and N12. The named routes of audits 4 and 5 are closed. |
| N5, `PSModulePath` and the environment | Fixed as named, hardening left | Positive control: the old code's raw environment with `PSModulePath` set returned `FORGED-KEY-LOADED` from the real PowerShell, exit 0; the allowlisted environment refused it. The `COR_*`, `COMPlus_*`, `DOTNET_*`, `__PSLockdownPolicy` and `PSExecutionPolicyPreference` set is dropped (the raw control with `COMPLUS_Version=v9.9.9` changed the child's behavior; the guarded run did not). See N13. |
| N6, `--id` and the missing estimate | Fixed for the named forms | `--id` is refused for a metered destination unless it equals the hash, and `--est-usd` is required. Still open through the hash itself (N11) and through the destination's name (N10). |
| N7, agent code inside the tool | Accepted by the owner | Not counted. MODELS.md section 12 states it. |
| N8, the new attack tests | Fixed | See below. |

### N8 in detail

New tests, 32 pass and 0 fail on `b2ac276`. Against the sources of `202ce58`, 3 fail: the `PSModulePath` attack test, the allowlist test and the N6 id test. With only the N5 hunk reverted, 2 fail. With only the N6 hunk reverted, 1 fails. Against `9f8af46`'s bare-name `approval-sign.ts`, both PATH tests fail, including the one that runs a working fake `powershell.exe` first on `PATH`. So every attack test now fails against the code before its fix. All of this ran in scratch copies. The suite does not cover N10, N11 or N12, which is how they got through.

## Attack table

"Refused" means exit 2 or 3 and no approved line. "Passed" means the request printed `approved` and exited 0 without a signature the owner gave for that request.

| Route | Anchor | Result |
|---|---|---|
| `PSModulePath` to a module that replaces `Add-Type`, old environment handling | real PowerShell | **Passed** (control: harness works) |
| Same, through the committed tool | real PowerShell | Refused |
| `PATH` set to a folder holding the module | real PowerShell | Refused |
| `COR_PROFILER`, `COR_ENABLE_PROFILING`, `COMPlus_*`, `DOTNET_*`, `__PSLockdownPolicy`, `PSExecutionPolicyPreference` | real PowerShell | Refused (dropped by the allowlist; the raw control showed they act) |
| `USERPROFILE` with planted `Documents\WindowsPowerShell\Modules` and `Documents\PowerShell\Modules` | real PowerShell | Refused, same as raw |
| `APPDATA`, `LOCALAPPDATA`, `TEMP`, `TMP` redirected | real PowerShell | Refused |
| `ProgramFiles`, `ProgramData`, `ProgramW6432`, `CommonProgramFiles` to the module folder | real PowerShell | Refused |
| `SystemDrive=Z:`, `windir` alone, `USERNAME`, `USERDOMAIN`, `COMPUTERNAME`, `OS`, `PROCESSOR_ARCHITECTURE` | real PowerShell | Refused |
| `SystemRoot` alone, or with `windir` | real PowerShell | Child crashes, exit 0, no output, so closed only by the output check (N13) |
| Metered request, `--to deepseek-v4.1-flash`, unsigned owner line | real PowerShell | Refused |
| Metered request named `--to "DeepSeek V4.1 Flash"`, unsigned owner line (N10) | real PowerShell | **Passed** |
| `--to "DeepSeek V4.1"` (dsh metered entry), no approval | real PowerShell | Refused |
| Destination in lower case, with a leading space, upper-case id, trailing space | real PowerShell | Refused (`unknown destination model`, exit 2) |
| `--id` of another request, no collision | stand-in | Refused, hash named in the message |
| Metered request with no `--est-usd` | stand-in | Refused |
| Newline in `--from` shifting the hash fields, id signed for a plan-cost request (N11) | stand-in | **Passed** |
| Owner's signed line re-appended after its `used` record, 3 and 10 times (N12) | stand-in | **Passed** each time |
| Cap 0 with `--est-usd 0` (N12) | stand-in | **Passed** |
| `--est-usd 999` against cap 5 | stand-in | Refused (`over cap`) |
| Plan-cost request, unsigned owner line | real PowerShell | Approved by design |
| Agent code inside the tool, direct provider call | | Out of scope, accepted |

## Approval guard

Ordinary commands: all exit 0, covering `git status`, `git diff`, `git log`, `git log --grep=approval -- shared`, `git commit -m 'Tighten approval checks'`, `ls`, `ls shared/tools/approval*`, `bun test`, `bun test` on the supervisor, approval-guard and escalation-record files, `bun test shared/tools/*.test.ts`, `git diff` and `git show` on the guard, `grep -n approval` on the guard, `cat` on the signer, `ls ~/.claude/state` and `escalation-record approve <id>`. One false positive: `HOME=/tmp/x bun test shared/tools/escalation-record.test.ts` exits 2 (N14).

Forged-approval routes: the plain `>>` to `approvals.jsonl` and `ESCALATION_APPROVALS_DIR=...` are denied. A quote-split name, a glob and a `${n}ovals.jsonl` expansion in a `>>` write are still exit 0, as are a script file, a request carrying a newline in `--from`, `PSModulePath=` beside the request, and `--to 'DeepSeek V4.1 Flash'`. The header already calls the guard a first filter and the signature the lock, which is why N10, N11 and N12 matter: they are the cases where the lock does not hold. I could not tell whether the guard is active on the owner's machine, because the session checklist reports `goldfish-gate.sh` missing and the settings entry not applied.

## MODELS.md section 12

`bun tools/voice-lint.ts standards/MODELS.md` from the portfolio worktree: 0 flags across 1 file. The repo-wide run exits 1 with flags in other files, which predates this change. I did not run the standards index check.

The section matches the code on these points: the three commands, the seven ledger fields, the typed phrase for plan-cost escalations, signing through Windows Hello, the public key read through PowerShell at its fixed path, the clean environment, the required estimate, the Mac failing closed, the exit codes, and the stated limit about code inside the tool and a direct provider call. It does not match on two:

- "The signed id is the hash of source, destination and reason, so a metered request cannot borrow an id signed for another model." N11 borrows exactly that. The signature binds the id only, and the id collides through a newline.
- "A request to a metered destination counts an approval only when that signature verifies." N10 reaches a metered provider through an entry the tool classes as plan-cost, and N12 counts a signature again after it was used.

Reword after the fixes, not before.

## What must happen before merge

1. N10: make the destination lookup resolve to the most expensive match, or refuse an ambiguous name. Add a registry check against two entries sharing a model with different costs and no distinct id.
2. N11: sign the destination id and the estimated cost, and build the request id from an encoding that cannot collide on a newline.
3. N12: make a `used` record void every copy of its signature, count approved estimates as spend, and reject a metered estimate of zero or none. State in the file header that the cap is advisory until the broker exists.
4. Add attack tests for N10, N11 and N12, each with a positive control that fails against the code before its fix, as the N8 tests now do.
5. Correct the two MODELS.md sentences listed above, and the "single-use" and "cap" wording in the `escalation-record.ts` header, so they say what the fixed code does.
6. The owner runs `escalation-record approve` once after the N13 change and confirms Hello still signs under the pinned environment. I could not.

## What can wait

- N13: pin `SystemRoot`, `windir` and the `ProgramFiles` family to constants. It is hardening, and the tool fails closed today.
- The 48-bit request id: lengthen it when the payload changes for N11.
- The `HOME=` false positive in the guard, and the unused `spawns` counter.
- The broker that holds the provider key. It is the stated hard stop for the accepted limit and, as N12 shows, the only real fix for a file the agent can write.
- Codex has no `SubagentStop` entry and OpenCode writes no claims (audit 4's notes); nothing changed this round.

## Tests

Host bun, non-Docker, `/tmp/py3shim` on `PATH`, state directories and ledger in the scratch folder.

| Suite | Result |
|---|---|
| supervisor | 25 pass, 0 fail |
| worktree_claims | 34 pass, 0 fail |
| session-event-claims | 11 pass, 0 fail |
| session-event-release | 3 pass, 0 fail |
| spawn-envelope-worktree (covers worktree_envelope, which has no test file of its own) | 34 pass, 0 fail |
| spawn-envelope | 91 pass, 0 fail |
| approval-guard | 15 pass, 0 fail |
| escalation-record | 32 pass, 0 fail |
| model-roles | 51 pass, 0 fail |
| session-checklist | 4 pass, 0 fail |
| mil-checks (all files) | 49 pass, 0 fail |
| session-event | 8 pass, 10 fail |

The 10 session-event failures are the baseline. I ran the same suite on the merge base with `main` (`cbb216be`) and the failing test names are identical.

## What I could not verify

- A real Windows Hello signature. No key exists on this machine and I may not prompt the owner, so N11 and N12 ran with a stand-in anchor, and I could not confirm that Hello still signs under the pinned environment.
- Whether the DSH DeepSeek entries are covered by a subscription, which decides how serious N10 is in money terms. The registry says plan, and the tool prints the same provider for both entries.
- A fake `SystemRoot` tree that lets the child start (N13), and a junction at the PowerShell path, which needs elevation.
- A hand-built long-running-child probe for R1 this round; I read the code and ran the suites.
- The live `settings.json` hook wiring, and Linux, macOS and Docker behavior.
- That `standards/INDEX.json` matches `MODELS.md` after `917d1c00`.
