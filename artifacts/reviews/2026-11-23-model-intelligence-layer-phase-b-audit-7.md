# Model Intelligence Layer Phase B: audit 7, release readiness

This review covers branch `mil-b-fixes` in claude-config (commits `8042b5a` and `b345b0c`, plus the R1 and R2 work beneath them) and MODELS.md section 12 at `85fa840b` on `mil-b-standards`. It audits against the owner's stated threat model: agents never hold a provider key, the paid provider runs on a prepaid balance, and the approval record is an audit trail and a check against a careless or mistaken agent. It does not audit against an agent that rewrites files or runs its own code.

Hard stops held. No tracked file in either repository was edited before this review was written, nothing was pushed, merged or switched, and `~/.claude/settings.json` and the real `~/.claude/state` were not read or written. `HOME`, `USERPROFILE`, `SUPERVISOR_STATE_DIR`, `ESCALATION_STATE_DIR`, `ESCALATION_APPROVALS_DIR` and `USAGE_LEDGER_DIR` pointed at a scratch folder for every run. Tests ran on host bun 1.4.2 (host bun, non-Docker) with `/tmp/py3shim` first on `PATH`.

## Verdict: PASS

Nothing in the branch fails the owner's threat model. The approval record behaves correctly for an honest or careless caller on every point the brief lists. The removed signing code is gone from both repositories apart from one stale comment. R1 and R2 hold. The guard blocks no ordinary git, ls or bun test command, with two rephrasable exceptions. A fresh machine has every file its settings point at.

The findings below are small. Two are worth fixing soon (F1, F2) because they cost the owner time, not money. None blocks the merge.

## Findings

### F1. A crashed request leaves a lock that nothing removes (low to medium, confidence high that it happens, medium that it matters)

`escalation-record.ts:79-93`. `consume` takes `approvals.lock` with an exclusive create, and removes it in a `finally`. If the process is killed between those two points, the file stays. Every later request for any id then waits two seconds and returns false, and `request` reports "approval ... was used by another request just now; the owner must approve it again" (line 181). That message is wrong, and re-approving does not help. I reproduced it: with a stale `approvals.lock` present, a request with a live approval exited 3 with that message, and it succeeded the moment I deleted the lock.

The window is a few milliseconds, so it is rare. The cost is a confusing stall on a path the owner uses seldom, so it would take a while to diagnose. A fix is to treat a lock older than a few seconds as stale and remove it, or to name the lock in the error text.

### F2. A non-metered request can pass `--id` and burn any approval (low, confidence high)

`escalation-record.ts:137` and `:141`. The `--id` rule is enforced for metered destinations only. I ran `request --to claude-haiku-5-5 --id <id of a metered approval>`. It exited 0, wrote a used record against the metered approval, and wrote an `approved` ledger line for haiku under the metered request id. No money moved, because haiku is plan cost. The owner's approval was spent on the wrong request, and the ledger now shows an approved escalation that never ran.

A careless agent would have to pass `--id` on purpose, and the usage line at `:123` no longer mentions the flag, so this is unlikely. Refusing `--id` for every destination, or checking that a supplied id equals the computed one, closes it. This matches what the commit message for `8042b5a` says the rule is for.

### F3. `outcome` accepts a negative actual spend and any request id (low, confidence high)

`escalation-record.ts:201-203`. `outcome <id> ok --actual-usd -100` is accepted, and `escalationSpendUsd` then counts the negative number (`usage-ledger.ts:73`). I confirmed that a request with an estimate of $0.90 and a cap of $1 was approved a second time after a `-100` outcome, where without it the second request was denied for going over cap. It also writes a line for an id that was never requested. A typo with a minus sign is the honest way to hit this. Rejecting negative values in `num` for the outcome path would close it.

### F4. `approve` shows the owner an opaque hash (low, confidence medium)

`escalation-record.ts:194-199`. The owner types `approve <16 hex>` without seeing the destination, the estimate or the reason. The ledger line holds those, and the denial message names only the id. That works for an audit trail, but the owner has to open the ledger to know what they are approving. Printing the matching denied ledger line before the prompt would make the approval an informed one. I did not verify `process.stdin.isTTY` under Git Bash on this machine: bun here has no interactive stdin, so whether the owner's own mintty window reports a terminal is unchecked. The owner should run one real `approve` before relying on it.

### F5. The guard blocks two ordinary commands (low, confidence high)

`approval-guard.sh:84` and `:89-91`.

- `HOME=/tmp/x bun test escalation-record.test.ts` is denied, because the redirect rule matches any `HOME=` beside the word `escalation-record`. Running the tests under a scratch home is the normal way to run them on this branch.
- `bun test approval-guard.test.ts 2>&1 | grep "[0-9] pass"` is denied, because the `>` counts as a write and the `[` sits within 40 characters of "approval".

Both can be rephrased (`export HOME=...` first, or `grep -E`), and the guard says why. The guard header already accepts false positives as the price of the filter. Every other ordinary command I tried passed: `git status`, `git log --oneline -5`, `git diff approvals`, `ls escalation`, `bun test escalation-record.test.ts`, a commit message mentioning approval, and `ls ~/.claude/state/escalation`. Naming `approvals.jsonl` in any command, including `grep -rn approvals.jsonl docs`, is denied, as documented.

### F6. Stale text left by the signing removal (nit, confidence high)

- `escalation-record.test.ts:35` still says "no test can supply a trust anchor (audit 4, N2)". There is no trust anchor now.
- `escalation-record.test.ts:30` keeps an unused `key?: null` option in `approveFile`.
- `escalation-record.ts:51-52` has two doc comments stacked above `keyOf`; the first describes `findApproval`, which is further down.

### F7. MODELS.md section 12 is slightly narrower than the code (nit, confidence high)

`standards/MODELS.md:322-327`. The section says a paid model is named by its registry id "when its name is shared with a plan-cost entry". The code (`escalation-record.ts:130`) refuses a name shared by entries of any different costs, including free ones. The section does not mention the 24-hour expiry or that a metered request takes no `--id` of its own. Neither error misleads the owner about the money.

## What I checked and found correct

- **Request ids.** `requestId` hashes `JSON.stringify([from, to, reason])` and keeps 16 hex characters. A request ending in a newline and one with the field shifted give different ids. The metered denial message and the mil-checks regex both use 16 characters.
- **Shared names.** `DeepSeek V4.1 Flash` matches a plan entry and a metered entry. By name it exits 2 and lists the ids. By id (`deepseek-v4.1-flash`) it goes through.
- **Metered rules.** No `--est-usd`, or zero, exits 2. A wrong `--id` exits 2 and prints the right id. `Infinity` and `abc` read as missing and exit 2.
- **Single use.** After a use, the same approval is void. Re-appending the owner's line after its `used` record revives nothing, because the used record names `request@at`. The key is the approval's own millisecond timestamp, so two approvals written in the same millisecond would share it. The tool cannot produce that.
- **Cap.** $0.90 approved under a $1 cap, then a second $0.90 request, is denied as over cap with the recorded spend shown. The estimate stays counted after its actual arrives, so the total errs high, as the code comment says.
- **Expiry.** A 2020 approval is refused with the 24-hour message. An unparsable date is treated as expired.
- **Exit codes.** 0 approved, 2 usage or bad destination, 3 for no approval, expired, over cap, repeated denial (stderr starts `ask: `) and a refused `approve` without a terminal, 6 for the missing `DEEPSEEK_API_KEY`. Credentials are checked before the approval is consumed, so a missing key does not burn it.
- **Removed signing code.** No reference to `approval-sign`, `approval-signer`, `setup-key`, a signer, a trust anchor or Windows Hello remains in `claude-config` (`shared/`, `machines/*/settings.json`, top-level docs) or in the portfolio standards, plans and docs, apart from F6. Earlier reviews in `artifacts/reviews` still describe the old design, which is correct for them.
- **R1.** `session-event.sh:152` and `worktree_claims.py:255-282` read the launching tool use id from the subagent meta file. A claim is released on an exact match only. The end-to-end test with two same-type children where the younger stops passes, and a running child's claim keeps refreshing.
- **R2.** `supervisor.ts:41` holds `maxConcurrency` and `maxSpawnsPerTask` at 4, with one check and no lifetime count. The supervisor tests pass.
- **MODELS.md section 12 and voice-lint.** `bun tools/voice-lint.ts standards/MODELS.md` from the portfolio worktree reports 0 flags. The section matches the code on the three commands, the seven ledger fields, the typed phrase, the guarantees, the exit codes and the statement that the money is held outside the tool.
- **Fresh machine.** Every hook script named in the three `settings.json` files, `expected-hooks.txt`, `loop-manifest.json` and `loop-mounts.json` exists on the branch, including `approval-guard.sh` and `goldfish-gate.sh`. All three machines wire both hooks. `shared/tools` is linked whole, so the two removed scripts leave nothing dangling. `model-roles.json` validates (model-roles tests and mil-checks pass), and `link-machine.test.ts` and `loop-manifest.test.ts` pass.

## Status table

| Item | Result | Evidence |
| --- | --- | --- |
| 1. Approval record, honest caller | Pass, with F1, F2, F3 | Ran 13 scripted scenarios against the real CLI in a scratch state |
| 2. No references to removed signing code | Pass, one stale comment (F6) | Searched both repositories |
| 3. R1 and R2 | Pass | supervisor 25, worktree_claims 34, session-event-claims 11, spawn-envelope 91 and 34 |
| 4. Guard blocks no ordinary command | Pass, two rephrasable cases (F5) | 20 commands through the hook |
| 5. MODELS.md section 12 | Pass, two nits (F7) | voice-lint 0 flags |
| 6. Fresh machine | Pass | Hooks, links and registry checked; one live-machine item below |

Test runs (host bun, non-Docker): supervisor 25 pass; worktree_claims 34 pass; session-event-claims 11 pass; session-event 8 pass and 10 fail, which is the stated baseline; spawn-envelope 91 pass; spawn-envelope-worktree 34 pass; approval-guard 15 pass; escalation-record 23 pass; model-roles 51 pass; session-checklist 4 pass; usage-ledger 15 pass and usage-ledger-v2 6 pass; route-check 51 pass; mil-checks and mil-verify 69 pass across 8 files; link-machine and loop-manifest 26 pass. `worktree_envelope.py` has no test file of its own; `spawn-envelope-worktree.test.ts` exercises it. The claude-config working tree was clean after the runs.

## Before merge

1. Nothing blocks the merge under the stated threat model.
2. Recommended in the same pass, each a few lines: F1 (stale lock), F2 (refuse `--id` off the metered path), F3 (reject a negative actual) and F6 (three stale lines).
3. After merge, the owner runs `link-machine.sh --apply-settings`. This machine's session checklist already fails its hooks row for `goldfish-gate.sh`, because the live settings predate the entry. That row clears once the settings are applied. The command refuses while the main checkout has 49 unpushed commits and is one behind, so those need pushing and pulling first.
4. The owner runs one real `escalation-record approve` in their own terminal to confirm the terminal check (F4) passes there.

## What I could not check

- A real `approve` from an interactive terminal, since no tool here has one.
- Any call to the paid provider. The tool makes none, and no key was set beyond a dummy value.
- Behavior under macOS or the Mac machines' bash; the runs were Windows with Git Bash.
