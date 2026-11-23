# Audit 5: Model Intelligence Layer Phase B, owner-signed approvals (R3), fifth round

This review covers commit `202ce58` on branch `mil-b-fixes` in claude-config. It checks whether the two ways around the owner's signature that audit 4 found are closed: N1 (a fake `powershell.exe` earlier on `PATH`) and N2 (the exported `request(args, verifier)`). The scope was read-only review of `approval-sign.ts`, `approval-signer.ps1`, `escalation-record.ts`, `approval-guard.sh` and their tests.

Hard stops held. No tracked file in claude-config was edited (the working tree was clean before and after). Nothing was pushed, merged or switched. `HOME`, `USERPROFILE`, `ESCALATION_STATE_DIR`, `ESCALATION_APPROVALS_DIR` and `USAGE_LEDGER_DIR` pointed at a scratch folder for every run, and the real `~/.claude/settings.json` and `~/.claude/state` were never read or written. I never ran `approval-signer.ps1 create` or `sign`. The only signer call is the read-only `pubkey` mode that the tool under test makes on its own. Every attack ran against a copy-free invocation of the committed tool unless a row says it used a scratch copy.

## Verdict: FAIL

N1 and N2 are fixed as stated. The named `PATH` route and the named `verifier` export are both closed, and I confirmed the fix against a positive control. But the owner's goal, that a metered request cannot return approved without the owner's Hello key, is still not met. A different environment variable, `PSModulePath`, redirects the real `powershell.exe` to attacker code and forges the trust anchor with no edit of any file and no code inside the tool's process (N5). Separately, a signature the owner really gives for one request can be spent on a different destination through `--id` (N6), and any code the agent supplies to the tool's own process still overrides the verifier (N7). N5 is a one-line fix and I verified a candidate fix in a scratch copy. N6 is a small change to the signed payload.

## Status of the two audit 4 findings

| Item | Status | Evidence |
|---|---|---|
| N1, fake `powershell.exe` on `PATH` | Fixed for `PATH`, `PATHEXT`, `SystemRoot`, `windir` and `ComSpec`. The signer runs from the fixed System32 path and fails closed when it is missing. | The same fake binary that forged an approval against the commit before the fix (exit 0, approved) is refused against `202ce58` (exit 3). |
| N2, injectable verifier | Fixed as named. `request` is no longer exported and takes no verifier. | `escalation-record.ts` now exports `approvalSigned`, `approve` and `requestId` only. `approvalSigned` returns a boolean and approves nothing. |
| The same class, through other doors | Not fixed | N5, N6 and N7 below. |

## Findings

### N5. `PSModulePath` redirects the real PowerShell to attacker code and forges the trust anchor (blocking)

`approval-sign.ts:33` starts the real Windows PowerShell with no `env` option, so the child inherits whatever environment the agent set for its own command. PowerShell autoloads cmdlets from the folders in `PSModulePath`. `approval-signer.ps1` calls `Add-Type` as its first cmdlet, so a module folder that exports a function named `Add-Type` runs before the script reaches the key store. That function can print the attacker's public key and exit 0, and `osVerifier()` then trusts it.

Reproduced end to end. I generated an RSA key pair, forged a metered approval for `deepseek-v4.1-flash` signed with my private key, put a one-file module in a scratch folder, and ran the committed tool unmodified with only `PSModulePath` pointing at that folder. Result: `{"request":"e324806ead87","approved":true,...}`, exit 0. The same call without the variable is refused (`no approval key on this machine`, exit 3). A direct probe of the real `approval-signer.ps1 pubkey` showed the attacker's key on stdout with exit 0, which confirms the child loaded the module. The harness is valid: against the commit before the fix, a fake `powershell.exe` on `PATH` passes with the same forged line, so the refusals elsewhere in this review are real refusals.

The guard does not stop this. `approval-guard.sh` denies only commands that set `ESCALATION_APPROVALS_DIR`, `ESCALATION_STATE_DIR`, `HOME` or `USERPROFILE` beside `escalation-record` (line 84). A command that sets `PSModulePath`, writes the forged line through a script file that never names the approvals file, and runs `escalation-record request` is exit 0 from the guard in all three steps (I ran the guard on each payload).

I verified one fix in a scratch copy of the tool (counts as editing the tool, so it only proves the fix works): pass `env` to `spawnSync` built from an allowlist (`SystemRoot`, `windir`, `SystemDrive`, `TEMP`, `TMP`, `USERNAME`, `USERPROFILE`, `APPDATA`, `LOCALAPPDATA`, `ProgramData`, `ProgramFiles`, `ProgramFiles(x86)`, and a few others) plus `PSModulePath` set to `C:\Windows\System32\WindowsPowerShell\v1.0\Modules`. With that change the `PSModulePath` attack is refused. I could not check that Windows Hello still signs under that clean environment, because this machine has no owner key and I may not prompt Hello. The owner should run `escalation-record approve` once after the change. An allowlist is better than deleting `PSModulePath` alone, because `PSModulePath` is one of several variables that change what a .NET Framework process loads, and I tested only that one.

Confidence: high, reproduced with a positive control.

### N6. The signature does not bind the destination, so one owner approval can be spent on another model (important)

`payloadOf` signs `request`, `capUsd` and `at` (`approval-sign.ts:24`). `request` is a plain string, and the tool takes it from `--id` whenever the caller passes one (`escalation-record.ts:123`), skipping the hash of source, destination and reason. The check at line 158 looks only at `dest.cost` of the destination the caller names, then verifies a signature that says nothing about that destination. So an approval the owner signs for a plan-cost request (which the owner will sign whenever a key exists, because `approve` signs whenever `osVerifier()` is non-null) can be spent on `deepseek-v4.1-flash` by running the metered request with `--id <that id>`.

The cap does not close it. The cap is compared with `--est-usd`, which the caller supplies, and an omitted estimate is 0, so a $0 cap and no estimate gives `0 + 0 > 0`, which is false.

Reproduced with a stand-in: I let the tool trust my own public key (through a bun preload, see N7) and approved id `planreq0001` with cap 0 for no particular model. The metered request with `--id planreq0001` and no estimate returned approved, exit 0, with the real PowerShell refusing the same line (no key). This shows the logic gap; it does not show it with an owner signature, which I cannot produce. Confidence: high on the gap, since the code path is plain. Medium on how often it fires, since it needs an unspent signed approval within its 24 hours.

Fix: sign the destination model id and the estimated cost, or sign a digest of the full request, and refuse `--id` for a metered destination unless the id equals the hash of source, destination and reason. Also treat a missing `--est-usd` on a metered request as an error rather than 0.

### N7. Agent code in the tool's own process overrides the verifier (important, same class as N2)

Removing the export closed the named door. The class is open: anything that can make bun load code before the tool runs can replace `child_process.spawnSync` or `crypto.verify`. All four of these passed with no tracked file edited:

- `bun --preload ./hook.ts escalation-record.ts request ...` where the hook mocks `spawnSync` to return the attacker's key.
- The same hook mocking `crypto.verify` to return true and `spawnSync` to return anything, with the line unsigned by the owner.
- A `bunfig.toml` with `preload` in the working directory.
- `BUN_OPTIONS=--preload ./hook.ts`.

`NODE_OPTIONS=--require ...` did not work (bun ignored it). The guard allows every one of these command lines.

I want to be plain about what this means. These routes put agent-written code inside the process that makes the decision, which is the same position as editing the tool. The tool makes no network call, and nothing downstream enforces the `approved` line (the only readers are `mil-checks`, which is a self-test). So the signature makes the owner's approval record trustworthy against a plain request and against forged files, and it cannot make the record trustworthy against an agent that runs its own code in the tool's process, any more than it can stop the agent from reading the provider key and calling the provider itself. If the owner wants a hard stop, the check has to run in a process the agent does not start, for example a broker that holds the provider key and releases it only against a signature. I list this as important rather than blocking because the brief names "agent's own code" as outside the design. I record it because it is the answer to "importing the tool or mocking its modules", and N2's fix does not change it.

### N8. The new N1 regression test cannot fail, and metered coverage was lost (important, test coverage)

I ran the new test file against `202ce58` with the old bare-name `approval-sign.ts` swapped in (a scratch copy). The behavioral test "a fake powershell.exe first on PATH cannot pass a metered request" passed. Its fake `powershell.exe` is the text "not a program", which Windows cannot run, so the old code also fails closed and the test is green either way. Only the source check (`not.toMatch(/spawnSync\("powershell/)`) failed, and that check is fragile: `spawnSync('powershell'` or a variable holding the name would pass it. The same test file also gates the behavioral test on `process.platform === "win32"`, so it does not run on Linux, which is fine, but the fake needs to be a real executable to prove anything. The attack harness in this review uses a compiled `bun` binary named `powershell.exe` that prints a public key, which does forge an approval against the old code.

Coverage lost when `request` stopped being injectable:

- There is no test left of a metered request with a valid signature being approved, consumed and written to the ledger. Every metered test now ends at the signature gate.
- "spend on another request does not count" now asserts only `not.toContain("over cap")`, which a signature refusal also satisfies. It no longer proves the spend rule.
- "the CLI, with no owner key reachable from a test, refuses a metered request" returns early on Windows (line 250), so on the owner's machine it tests nothing.
- Single-use, expiry and cap logic are still covered through plan-cost requests and through the cap tests, which run before the signature gate, so those did not lose coverage.

Fix: keep a positive test through a seam that cannot be reached from the CLI, for example a second module-private function that takes the verifier and is tested through a file the CLI never imports, with the CLI entry importing only the sealed one. Or accept the gap and say so in the header. Confidence: high, reproduced.

### N9. Nits

- `escalation-record.ts:158` and `:159` call `osVerifier()` twice. It is cached, so it costs nothing, but the second call exists only for the error text.
- A signed line with `at` in the future stays valid past 24 hours (`escalation-record.ts:58` accepts a negative age). Only the owner's key can sign `at`, and `approve` writes the current time, so I could not make it matter.
- `capUsd` given as the string `"5"` or the array `[5]` passes the signature because the payload turns it into the same text. It gains nothing, because the value is the same.
- `approve()` is exported and writes an unsigned line without a terminal, and `appendLedger` is exported. Both are the same class as N7.

## Attack table

"Refused" means the metered request exited 3 and the ledger shows no `approved` line. Every refusal on the real PowerShell had a second cause on this machine: no owner key exists, so the real signer would refuse any key. A refusal therefore shows that the attacker's key was not accepted, and it cannot show that a real key would reject a forgery. The forged-field matrix below used a stand-in anchor to cover that.

| Route | Result |
|---|---|
| Control, forged line, real PowerShell, no tricks | Refused |
| Fake `powershell.exe` (compiled binary) first on `PATH` | Refused |
| Fake `powershell.cmd` first on `PATH` | Refused |
| Fake `powershell.bat` first on `PATH` | Refused |
| Fake `.cmd` first on `PATH` with `PATHEXT=.CMD;.EXE` | Refused |
| `SystemRoot` pointed at the fake folder | Refused |
| `windir` pointed at the fake folder | Refused |
| `ComSpec` pointed at the fake `.cmd` | Refused |
| All four at once | Refused |
| Positive control: the same fake `.exe` against the commit before the fix | **Passed** (approved, exit 0), so the harness works |
| `PSModulePath` to a one-file module that exports `Add-Type` (N5) | **Passed** |
| Copied tool with a fake `approval-signer.ps1` beside it | **Passed**. It takes editing the tool (a copy), which is out of scope. It needs a copy of the tool and its siblings, and the path is `import.meta.dir`, so the real tool is unaffected. |
| `bun --preload` mocking `spawnSync` (N7) | **Passed** |
| `bun --preload` mocking `crypto.verify`, line unsigned by the owner (N7) | **Passed** |
| `bunfig.toml` with `preload` in the working directory (N7) | **Passed** |
| `BUN_OPTIONS=--preload` (N7) | **Passed** |
| `NODE_OPTIONS=--require` | Refused (bun did not apply it) |
| Importing `escalation-record.ts` to call `request` | Refused. It is not exported. Exports are `approvalSigned`, `approve`, `requestId`. |
| Importing `approval-sign.ts` to reach the `osVerifier` cache | Refused. `cached` is module-private and has no setter. `osVerifier()` returned null on the real PowerShell. Re-assigning `POWERSHELL` throws `TypeError`. |
| Junction or symlink in place of the PowerShell path | Not attempted. `powershell.exe` and its folder grant Users read and execute only, with `TrustedInstaller` full control, so replacing it needs elevation. Judged not reachable without admin. I did not create one. |
| Metered approval reused for another destination through `--id` (N6) | **Passed**, with a stand-in anchor (see N6) |

### Forged approval line, every field combination

Run with the attacker's public key as a stand-in anchor, so the signature logic itself is exercised. The unmodified `valid` row shows the harness approves a correctly signed line.

| Line | Result and gate |
|---|---|
| Valid signature over `request`, `capUsd`, `at` | Approved (stand-in for the owner) |
| No `sig` | Refused, unsigned approval |
| `sig` empty string, a number, an array, or invalid base64 | Refused, unsigned approval |
| `capUsd` raised after signing | Refused, unsigned approval |
| `capUsd` as the string `"5"` or array `[5]`, same value | Approved, same signed text |
| `request` changed after signing | Refused, no approval (the id no longer matches) |
| `approvedBy` set to `Owner` or `agent` | Refused, no approval |
| `at` changed after signing | Refused, unsigned approval |
| Signature over a different `at` | Refused, unsigned approval |
| `used` record after the line, then replay | Refused, no approval |
| `at` three days in the future, validly signed | Approved (N9, needs the owner's key to matter) |

## Other checks

Plan-cost escalations still work unsigned: a request to `gpt-6.2-astra` with an unsigned owner line exited 0 and printed the approved record. `mil-checks` covers it too.

Test results, all on host bun, non-Docker, with `/tmp/py3shim` on `PATH`, and `HOME`, `USERPROFILE`, the state directories and the ledger pointed at a scratch folder:

| Suite | Result |
|---|---|
| escalation-record | 29 pass, 0 fail |
| approval-guard | 15 pass, 0 fail |
| mil-checks | 49 pass, 0 fail |

## What stays out of scope by design

- Editing the tool. A copy of the tool with a fake signer beside it passes, and so would any edit. The signature does not defend against an agent that rewrites the check.
- Reading the provider key directly. The key is in the agent's environment for a metered call, so an agent that reads it needs no approval at all.
- Calling the provider with the agent's own code. The tool makes no network call, so the `approved` line is a record, not a lock.

N7 sits on the edge of these three. I list it as a finding because the committed header says an approval stops a plain forged line, and a reader could take it to cover mocking the process. It does not.

## What I could not verify

- A real Windows Hello signature. No key exists in the scratch run and I may not prompt the owner, so I could not check that a genuine signature verifies end to end on commit `202ce58`, or that Hello signs under the clean environment N5 recommends.
- Whether a signed approval the owner actually creates carries a `request` id the owner sees. N6 assumes `escalation-record approve <id>` signs the id it is given.
- Variables other than `PSModulePath`. I did not test `COMPlus_*`, `DOTNET_*` or `APPDOMAIN_MANAGER_*` against Windows PowerShell 5.1. They are why the fix should be an allowlist and not a single deleted variable.
- A junction or symlink at the PowerShell path (needs elevation). I checked the ACLs only.
- A Windows install outside `C:\Windows`. The tool fails closed there by design, and I did not test it.
- Linux, macOS and Docker behavior. A metered approval fails closed off Windows by design.
- The live `settings.json` hook wiring. The session checklist on this machine reports `goldfish-gate.sh` missing, so I cannot say whether `approval-guard.sh` is active on the owner's machine.
