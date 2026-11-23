# Audit 4: Model Intelligence Layer Phase B fixes, fourth round

This review covers branch `mil-b-fixes` in claude-config, commits `a6f01ea` (R3), `7e2746e` (R2), `66cb18d` (R1), `81357c7` and `9f8af46` (test isolation). It checks each finding of audit 3, F1 to F8, against the new code. The review was read-only. Every state directory, `HOME` and `USERPROFILE` pointed at a scratch folder, no tracked file in claude-config was edited, and nothing was pushed, merged or switched. I never ran `approval-signer.ps1 create` or `sign`. The only signer call that happened is the read-only `pubkey` mode, which the code under test makes by itself and which raises no prompt. Tests ran on host bun, non-Docker, with `/tmp/py3shim` on `PATH`.

## Verdict: FAIL

R1 and R2 are fixed. R3 is not. The signature is the right design, but the code that fetches the trust anchor can be redirected by anyone who can run a command: a `powershell.exe` placed earlier on `PATH` made a forged metered approval pass end to end, with no file in claude-config edited. A second route, the injectable `verifier` argument on the exported `request`, passes with any non-empty signature string. Both are one-line fixes, so the branch is close, but the owner's stated goal (a metered request cannot pass without the owner's key) is not met today.

## Status table

| Item | Commit | Status | One line |
|---|---|---|---|
| R1 | `66cb18d` | Fixed | The exact spawn is found through the meta file; a running child keeps its claim; unknown spawns lapse. Two small gaps are noted below. |
| R2 | `7e2746e` | Fixed | Six sequential spawns are admitted, a fifth concurrent one is denied with `limit: 4 spawns at a time per task`, and no gate counts a lifetime. |
| R3 | `a6f01ea` | Not fixed | Signature design is sound. The trust anchor is hijackable by `PATH` (N1) and by the exported verifier argument (N2). |
| F1 | | Fixed | A younger same-type spawn stopping now frees that spawn's claim only (end-to-end test passes; meta lookup by `agent-<id>`). |
| F2 | | Fixed | A spawn the meta file lists as unfinished is refreshed however long it runs. |
| F3 | | Fixed | A claim with no spawn id is refreshed only when no supervisor state exists, so it lapses after 30 minutes otherwise. |
| F4 | | Fixed | The stale test was updated; spawn-envelope suites pass 125 of 125. |
| F5 | | Fixed | `maxConcurrency` is 4, the cap is `min(...)`, and the fifth concurrent spawn is refused by that one check. |
| F6 | | Partly fixed | The text guard still allows `cp f.json ~/.claude/state/escalation/appro""vals.jsonl` (exit 0). It is now only a first filter. A forged line still works for plan-cost escalations (N3), and for metered ones only through N1 or N2. |
| F7 | | Mostly fixed | `ls shared/tools/approval*`, `git log --grep=approval -- shared` and `bun test shared/tools/approval-guard.test.ts` are allowed now. `HOME=/tmp/s bun test shared/tools/escalation-record.test.ts` is still denied (exit 2). |
| F8 | | Fixed in wording | The checklist row says "at a time". The `spawns` counter is still incremented and printed, but nothing gates on it (nit). |

## Findings

### N1. A fake `powershell.exe` earlier on PATH forges a metered approval (R3, blocking)

`approval-sign.ts:25` runs `spawnSync("powershell.exe", ...)` by bare name, so `PATH` decides which program answers `pubkey`. The agent runs `escalation-record request` itself, so it controls the environment of that process.

Reproduced end to end in the scratch home. I generated an RSA key pair, compiled a tiny `powershell.exe` that prints my public key, put it first on `PATH`, signed `"mil-approval/v1\n<request>\n5\n<at>"` with my private key, and appended that line to `approvals.jsonl`. The request to `deepseek-v4.1-flash` printed `{"approved":true,...}` and exited 0. With the real `powershell.exe` the same line is refused (`no approval key on this machine`, exit 3), and with the fake only in the working directory it was also refused, so the attack needs `PATH` and not the cwd.

This is not "editing the tool": no tracked file changes, and the one-line approvals-file write is allowed by the guard through a quote-split name (F6). Fix: call the signer by its absolute path under `%SystemRoot%\System32\WindowsPowerShell\v1.0\`, built from the Windows directory rather than from `PATH`. Confidence: high, I ran it.

### N2. The exported `request(args, verifier)` accepts any verifier (R3, important)

`escalation-record.ts:112` exports `request` with an injectable `verifier`. A one-line `bun -e 'import {request} ...; request(args, () => () => true)'` against a line whose `sig` is the string `x` returned `approved: true`. This needs no edit of a tracked file. The review brief lists "editing the tool itself" as out of scope, and I treat this as the same class when it takes an edit, but an import is not an edit. Fix: do not export the parameter. Tests can import a second function that takes the verifier, kept out of the CLI path, or set it through a module-private setter. Confidence: high, I ran it.

### N3. Plan-cost approvals are unsigned by design and still forgeable (R3, nit)

`escalation-record.ts:138` checks the signature only when `dest.cost === "metered"`. A plan-cost request (`gpt-6.2-sol` to `gpt-6.2-astra`) passed with an unsigned, hand-written approval line, as intended. That costs no money, so I do not count it as a defect. It means the text guard is the only barrier there, and the guard has quote-split gaps (F6).

### N4. A crashed child's claim is refreshed for the life of the session (R1, nit)

`worktree_claims.py:331` keeps a claim live while the meta file lacks `finished: true`. A meta file with no `finished` key reads as running (`{'toolu_X': False}`). If a child dies without Claude Code writing `finished`, its claim lives as long as the parent session. I could not observe the real behavior of a killed child, so confidence is low.

## R3 attack results

| Attack | Result |
|---|---|
| Forged line, tampered cap, real powershell | Refused. The signature covers the cap, and the suite's tamper test passes. |
| Forged line signed with an attacker key, real powershell | Refused (no key on this machine; fails closed). |
| Same, fake `powershell.exe` earlier on `PATH` | Passed (N1). |
| Same, fake `powershell.exe` only in the cwd | Refused. |
| In-process verifier injection | Passed (N2). |
| `process.platform` tricks | Not exploitable on its own: a non-win32 platform returns `null`, which fails closed. Changing the platform needs code the agent would have to run in the same process, which is N2. |
| Swapped signer path | The path is derived from `import.meta.dir`, so it moves only with an edit of the tool (out of scope). |
| Quote-split approvals file name | The guard allows it. Harmless for metered requests once N1 and N2 are closed. |

Out of scope by design: editing the tool itself, and reading the provider key directly. Both remain true, and the file header says so.

Plan-cost escalations still work unsigned (probed, approved). The narrowed guard no longer blocks `ls`, `git log --grep`, or `bun test` on the approval-guard test file.

## R2 results

Six sequential spawns with a release between each were all admitted. Five concurrent: the first four were admitted and the fifth was refused with `limit: 4 spawns at a time per task (4 live)`, exit 3. The `spawns` field is still incremented at `supervisor.ts:109` and printed, and no check reads it.

## R1 results

F1 and F2 pass in the suites (`session-event-claims` 11 of 11, `worktree_claims` 34 of 34), including the end-to-end case with two same-type children where the younger one stops. The meta file on this machine has the fields `toolUseId` and `finished`, which the code reads. The release only fires on an exact match (`session-event.sh:73`), and the type-only fallback frees a supervisor slot and touches no claim.

## Codex and OpenCode notes

- Codex: `machines/tjakoens-windows-pc/codex/hooks.json` has no `SubagentStop` entry, and Codex writes no meta files. So no claim is released by a stop there. Claims that carry a spawn id follow the supervisor's 30-minute live window, and claims with no spawn id lapse after 30 minutes when supervisor state exists. A long Codex child can therefore lose its claim while running, which is the F2 case that the meta file solves only on Claude Code.
- OpenCode: `opencode-light-subagent.ts` contains no claim code, so the OpenCode plugin writes no worktree claims. DSH only reads the store (`dsh/worktree-claims.mjs`).

## Tests

All on host bun, non-Docker, `/tmp/py3shim` on `PATH`.

| Suite | Result |
|---|---|
| supervisor | 25 pass, 0 fail |
| worktree_claims | 34 pass, 0 fail |
| session-event-claims | 11 pass, 0 fail |
| spawn-envelope and spawn-envelope-worktree (together) | 125 pass, 0 fail |
| approval-guard | 15 pass, 0 fail |
| escalation-record | 25 pass, 0 fail |
| model-roles | 51 pass, 0 fail |
| session-checklist | 4 pass, 0 fail |
| mil-checks | 49 pass, 0 fail |
| session-event | 8 pass, 10 fail (the stated baseline; I did not compare names) |

`worktree_envelope` has no test file of its own; spawn-envelope-worktree covers it.

## What I could not verify

- A real Windows Hello signature. No key exists in the scratch run and I may not prompt the owner, so the verifier against a real TPM signature (PKCS1 v1.5, SHA-256 over the payload) is untested.
- Whether Claude Code's SubagentStop `agent_id` equals the id in `agent-<id>.meta.json`. The meta file names match the pattern the code reads, but I saw no real stop payload.
- Whether `finished` is written for a killed or timed-out child (N4).
- Codex payload fields, and the live `settings.json`. The checklist reports `goldfish-gate.sh` missing, so the guard may not be active on this machine.
- Docker or Linux behavior, and macOS (a metered approval fails closed there by design).
