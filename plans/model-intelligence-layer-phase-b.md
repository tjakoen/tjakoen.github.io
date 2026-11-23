---
id: model-intelligence-layer-phase-b
status: doing
track: ai
depends: [model-intelligence-layer-phase-a, model-guard-respawn, model-tokenomics]
touches:
  - standards/MODELS.md
  - standards/MODELS-VERIFY.md
  - standards/INDEX.json
  - artifacts/reviews/model-intelligence-layer-phase-b.md (the goldfish review)
  - artifacts/reviews/<date>-model-intelligence-layer-phase-b-audit.md (the auditor review)
  - standards/HOOKS.md
  - claude-config:shared/model-roles.json
  - claude-config:shared/tools/model-roles.ts
  - claude-config:shared/tools/route-check.ts
  - claude-config:shared/tools/usage-ledger.ts
  - claude-config:shared/tools/escalation-record.ts
  - claude-config:shared/tools/goldfish-gate.sh
  - claude-config:shared/tools/finish-gate.sh
  - claude-config:shared/tools/session-event.sh
  - claude-config:shared/tools/mil-checks/
  - claude-config:shared/tools/spawn-envelope.sh
  - claude-config:shared/tools/context-trigger.sh
  - claude-config:shared/tools/model-guard.sh
  - claude-config:shared/tools/model-roles.py
  - claude-config:shared/tools/dsh/guard.mjs
  - claude-config:shared/tools/supervisor.ts
  - claude-config:shared/tools/context-budget.ts
  - claude-config:shared/tools/checkpoint.ts
  - claude-config:shared/commands/handoff.md
  - claude-config:shared/tools/run-report.ts
  - claude-config:shared/tools/model-scout.ts
  - claude-config:shared/tools/mil-verify.ts
  - claude-config:shared/tools/session-checklist.sh
  - claude-config:shared/tools/dsh/session-checklist.sh
  - claude-config:shared/opencode/
  - claude-config:machines/*/settings.json
  - claude-config:machines/*/codex/hooks.json
owner: ai
---

# Model Intelligence Layer, Phase B: finish the layer

## Goal

The layer is done when `mil-verify.ts` lists nothing under LATER. Today it still reports six
capabilities as NOT TESTED: fallback, escalation records, context budgeting, recovery, goldfish
freshness and Model Scout. Every one of them must turn into a PASS, or into an UNSUPPORTED that names
its reason, on each harness, without weakening any human gate. Phase B covers the owner's v2.0 brief,
sections 6 to 16. Section 17, the personal-assistant portability, gets a plan of its own.

The gap check that produced this plan said for every section of the brief whether it is built, partly
built or missing, with the file that proves it. That check was a read, not a test run.

## Decisions made in planning (the owner can overturn any of them)

- **M1. The supervisor is code, not an agent.** It is a deterministic `supervisor.ts` command that
  the hooks and the OpenCode plugin call.
- **M2. Each new record gets one home.**
  - Escalation and fallback transitions go into the existing usage ledger as a new `kind`.
  - A recovery checkpoint goes to `artifacts/handoffs/<date>-<plan>-recovery.md`. A clean handoff
    keeps its current form, so the two never blur.
  - Model Scout's evidence goes to `artifacts/scout/`, and its recommendations go to the DECISIONS
    inbox.
- **M3. Context metadata lives in the registry.** Each model entry gets a `context` block:
  advertised, usable, maxOut, overhead, method and confidence. A model nobody has calibrated gets
  `confidence: unverified` and no thresholds. The existing `CONTEXT_WARN` and `CONTEXT_STOP` stay
  authoritative.
- **M4. The goldfish gate checks the order, the location and the findings of a review.** It cannot
  prove a review's context was isolated. That proof stays with the freshness-token probe, which
  becomes `goldfish.fresh` in mil-verify.
- **M5. Each editing spawn gets its own worktree.** The envelope names a `Worktree:` path that is not
  the parent's folder and is not claimed by another live session. Read-only spawns are exempt.

## Owner decisions (2026-11-22, in chat)

- **O1. Paid DeepSeek is escalation only.** It leaves `lightChain`. Every paid call needs a
  recorded approval, and that overrides tokenomics D10. When the plans and the free chain are both
  spent, the result is checkpoint and stop, plus an escalation request.
- **O2. Approving the free models:** not asked yet. The default is that the per-repository clearance
  from tokenomics D5 counts as the approval. The owner can overturn it.
- **O3. Plans that need a goldfish review:** plans marked `lane: gated`, plus any plan whose
  `touches` name hooks, settings or `standards/`.
- **O4. Supervisor limits:** concurrency 3, delegation depth 2, retries 2, spawns 4 per task.
- **O5. Model Scout runs by hand only.**
- **O6. Confirming the prose role, and the Phase A model-probe FAIL:** still open. Only the final
  verification waits on it.
- **O7. The auditor at finish warns** and does not block.

## Contracts (fixed before the build, from the goldfish review)

- **The brief.** The owner's v2.0 brief is stored privately at
  `claude-config:artifacts/briefs/2026-11-22-model-intelligence-layer-v2.md`. Section 7 lists the
  seven fields an escalation record carries: reason, source model and role, destination model,
  capability justification, approval, actual or estimated resource use, and outcome. Section 11
  lists the per-model context metadata and the eight decisions.
- **Related plans.** [Phase A](model-intelligence-layer-phase-a.md),
  [the model guard](model-guard-respawn.md) (whose restart path is in
  `claude-config:shared/tools/model-guard.sh`) and [tokenomics](model-tokenomics.md).
- **What replaces each LATER row.** An entry leaves `LATER` in `mil-verify.ts` only in the commit that
  adds its replacement check, and only once that check passes. A test asserts that every id once in
  `LATER` is now a live check id.

  | Was in LATER | Becomes | Step |
  |---|---|---|
  | fallback | `fallback.recorded` (transition lines and the exhaustion exit) | 2 |
  | escalation-records | `escalation.recorded` | 1 |
  | context-budgeting | `context.budgeted` (metadata valid, budget fixtures) | 10, 11 |
  | recovery | `recovery.lineage` (checkpoint, verify, supersede) | 12, 13 |
  | goldfish-freshness | `goldfish.fresh` and `goldfish.gated` | 4, 5 |
  | model-scout | `scout.readonly` (the registry hash is unchanged by recommend) | 15 |

- **Exit codes.** Every new command uses route-check's codes, so callers read them the same way:
  - 0 means ok and 2 a usage error.
  - 3 means ask the owner. That covers both an unapproved escalation and a supervisor limit, and the
    printed reason tells the two apart.
  - 4 means no private model is available, and 5 a gate refusal.
  - **6 and 7 are new and get added to route-check's usage text in step 1:** 6 means credentials
    are missing, and 7 means every candidate is spent, so checkpoint and stop.
  - Any other exit is a crash. The caller fails closed and treats it as a refusal.
- **The goldfish gate's trigger.** Its three triggers are listed under Third review fixes.
- **The side-effect key.** It is stored at `~/.claude/state/route-check/effects.jsonl`, one JSON line
  per key: `{key, model, at, state}`, where state is started or done. Whoever runs the side effect
  writes done. A retry against a done key exits 5.
- **Context metadata schema.**
  - `method` is one of transcript, provider-usage or estimate.
  - `confidence` is one of measured, estimated or unverified.
  - The next-task estimate is the byte size of the plan's `touches` files divided by 4, plus a fixed
    allowance for tool output, plus maxOut.
  - The thresholds are the measured `CONTEXT_WARN` and `CONTEXT_STOP`. A model without them gets
    70 and 85, marked unverified, as the brief allows.
- **The way back.** Each new gate has an off switch, named in the hooks standard, `standards/HOOKS.md`, which step 17 updates. The goldfish gate
  is `GOLDFISH_GATE=off` and the worktree rule is `ENVELOPE_WORKTREE=off`. Reverting the step's commit
  also restores the old behavior.
- **The baseline.** Step 0 records the current `bun test shared/tools` totals and failing test names
  in the run report before anything changes.
- **One resolver.** `model-roles.py` is read by no hook or settings file (checked by grep,
  2026-11-22). Step 0 records the callers that remain. If none remain, it is retired in that step,
  with the owner told in the run report.
- **Owner-applied steps.** A step marked OWNER APPLIES is done in the build once its tests pass. Its
  live check waits for `--apply-settings`. Step 9's wiring is tested against the script, and its
  live row stays NOT TESTED until the owner has applied the settings.
- **The worktree claim store.** `~/.claude/state/worktrees.jsonl` holds one line per claim:
  `{path, session, at, released}`.
  - The envelope hook writes the line when it admits an editing spawn.
  - The spawning session's finish gate writes `released`.
  - A claim is live when it has no `released` and its `at` is under 30 minutes old, PANTRY's own
    expiry. The heartbeat refreshes `at`.
  - A missing or unreadable store denies nothing. The rule fails open on a broken store, so a bad
    file cannot lock every spawn out, and it prints a warning.
- **Which plans the goldfish gate covers.** A plan with `track: chat`, the ones auto-plan.py creates,
  is never gated. Neither is a plan with three steps or fewer: that is what a small fix means here.
  Every other plan that meets O3 is gated.
- **Every harness.** `mil-verify.ts` builds its OpenCode rows on a separate path (lines 83 to 89),
  where `later.*` rows are hardcoded. Step 5 removes that path, so every harness builds its rows from
  the same check list. A test asserts that `--harness opencode` prints no `later.*` rows.
- **Shared formats.** These are fixed here so builders working side by side agree:
  - **Ledger kinds:** `usage` stays as it is. Step 2 adds `transition`:
    `{kind, from, to, role, cause, at}`. Step 1 adds `escalation`, with the seven brief fields.
    These are format version 2 lines, and version 1 readers skip any unknown kind.
  - **Approval:** a line in `~/.claude/state/escalation/approvals.jsonl`,
    `{request, approvedBy: "owner", at, capUsd}`. Only `escalation-record approve` writes it, and
    the command asks for a typed confirmation on the terminal. An agent runs with no terminal input
    and cannot answer, so it is refused with exit 3. `human-lane.sh` stays unchanged.
  - **Tool-output allowance:** a fixed 8,000 tokens per task.
  - **LOOP's ask:** exit 3, with a stderr line that starts `ask: ` and names the repeated cause.
### Third review fixes

- **One integrator owns `mil-verify.ts`.** A workstream never edits it. Each one ships its checks in
  its own file, `shared/tools/mil-checks/<capability>.ts`, with their tests. A single integrator
  session then adds each capability's rows and removes its LATER entry, one commit per capability,
  so the per-commit rule holds and no two builders touch the file. The integrator also owns
  `session-checklist.sh`, and runs once the workstreams are committed.
- **Approval has one source:** `approvals.jsonl`, written only by the owner's typed `approve`. Step
  1's test uses a fixture approvals file. A DECISIONS answer is never approval.
- **The goldfish gate's triggers.** All three are PreToolUse hooks:
  - Edit or Write to `plans/*.md` that sets `status: doing`.
  - Bash whose command writes to `plans/` and contains `status: doing`.
  - `mcp__pantry__pantry_claim` on a plan that qualifies.

  auto-plan.py is not a trigger, because it only ever touches exempt chat plans.
- **Worktree claims stay live.**
  - The existing per-tool hook, `session-event.sh`, refreshes `at` on every claim the session holds,
    keyed by the session id. A working session never expires.
  - The finish gate releases every claim carrying its own session id.
  - `session-event.sh` and `finish-gate.sh` are in `touches`.
- **Counting steps for the small-fix exemption.** Every line under `## Steps` that is a numbered item
  or a checkbox, at any depth, counts. Three or fewer means the plan is exempt.
- **"Same cause twice."** One function, `sameCauseTwice(kind, key)` in `usage-ledger.ts`, reads
  today's and yesterday's ledgers.
  - For route-check, the key is model plus cause on `transition` lines.
  - For escalation, the key is the denial reason on `escalation` lines.
  - Two matches inside the cooldown window give the LOOP ask: exit 3 and `ask: `.
- **Resolving `touches` for the budget.**
  - A `claude-config:` prefix resolves to the claude-config root.
  - Directories are summed recursively, and globs are expanded.
  - A path that does not resolve counts as zero and lowers the estimate's confidence to estimated.
  - It never fails closed, because the budget is advice.
- **Every check names its harnesses.** Each check declares the harnesses it applies to. On any other
  harness it reports UNSUPPORTED, with the reason "not on <harness>". The hook file comes from one
  map:
  - claude uses `settings.json`;
  - codex uses `hooks.json`;
  - opencode uses the plugin under `shared/opencode/`;
  - dsh uses its profile.
- **Two finish lines.**
  - **Build-done:** every new test is green, nothing sits under LATER, and the auditor review is
    written. A row that waits on the owner reads NOT TESTED with the reason "owner apply pending".
  - **Layer-done:** after the owner has applied the settings, answered O6, and the Mac run has
    finished.
### Readiness fixes (fourth review)

- **Who wrote the audit.** An auditor review is `artifacts/reviews/<date>-<plan-id>-audit.md`, and
  its frontmatter carries `session:`, the writing session's id. The finish gate compares that with
  its own session id and with the `session` on the plan's claim. A match with either one means the
  builder audited its own work, and the gate warns.
- **The window for "same cause twice"** is the routing block's `cooldownDefaultMinutes`, 60 minutes.
  `sameCauseTwice` reads today's ledger and yesterday's, so a window that crosses midnight is still
  counted.
- **Where the claim refresh goes.** In `session-event.sh`, the refresh runs first, before the Edge
  exit, the event filter and the throttle, and it is throttled on its own to once every 60 seconds.
  It rewrites `worktrees.jsonl` atomically: an exclusive lock file, a write to a temporary file, then
  a rename. It stays silent.
- **Exit 4 wins over exit 7.** When every candidate is gone because only private models were
  allowed, route-check exits 4. Exit 7 means candidates existed and every one failed.
- **Two review files, one folder.**
  - The goldfish review is `artifacts/reviews/<plan-id>.md`.
  - The auditor review is `artifacts/reviews/<date>-<plan-id>-audit.md`.
  - Both live in the repository that holds the plan file. The gates find that repository by
    walking up from the plan's path to its git root. This plan's reviews are in the portfolio repo.
- **Claim-refresh files.**
  - The throttle stamp is `~/.claude/state/worktrees.refresh`, holding the epoch seconds of the
    last refresh.
  - The lock is `~/.claude/state/worktrees.lock`, created with an exclusive create.
  - When the lock is held, the refresh is skipped; the next tool call tries again.
  - A lock older than 30 seconds counts as left behind and is removed before the next try. Each
    removal writes one line to `~/.claude/state/worktrees.log`, so a stuck lock leaves a trace.
- **The Docker command on Windows:**
  `MSYS_NO_PATHCONV=1 docker run --rm -v C:/Users/tjako/claude-config:/app -w /app
  oven/bun:1.4.2-slim bun test shared/tools`, run from Git Bash. The same image runs the BREAD
  gates. On the Mac, tests run on the host, where symlinks work.
- **The Mac payload.** The Codex hook payload that the Mac's MODELS-VERIFY run records goes to
  `claude-config:shared/tools/fixtures/codex/spawn-payload.json`. Step 8 reads it from there.
- **Where the baseline runs.** On Windows, step 0 and every later test run use the Docker gate
  environment, because the host cannot make symlinks. Each run report names the environment it
  used.
- **What done means on each machine.** Windows is done when every Claude Code row passes and no row
  sits under LATER. Codex and OpenCode rows may read assisted or NOT TESTED with the reason "Mac run
  pending". The layer is done when the Mac run (W7) turns those rows into PASS or UNSUPPORTED.

## Steps

0. Record the test baseline, and decide the future of `model-roles.py` (see Contracts).

Every step that changes behavior writes its failing test first, and the run report records the red
output and then the green one. A step marked OWNER APPLIES stops at the `link-machine.sh
--apply-settings` command and never runs it.

**W1. Escalation and fallback records**

1. `escalation-record.ts`.
   - Without approval, a request exits 3 and writes no approved line.
   - An approval read from a fixture approvals.jsonl writes all seven fields the brief lists in
     section 7.
   - Missing credentials exit 6 without making a network call.
   - Two failures with the same cause trigger LOOP's ask.
   - `mil-verify` shows `escalation.recorded` PASS.
2. `route-check` changes.
   - `fail` writes a transition line: source, destination, role and cause.
   - `pick --prefer-return` brings the preferred model back once its cooldown ends, at the next
     delegation only, never in the middle of a session.
   - A side-effect key already recorded as done makes a retry refuse.
   - When every candidate is spent, it exits 7 for "checkpoint and stop".
3. Apply O1 to `lightChain` and to its tests.

**W2. Elephant-Goldfish enforcement**

4. `goldfish-gate.sh`.
   - A plan that qualifies under O3 cannot move to `doing` without
     `artifacts/reviews/<plan-id>.md` holding Comprehension, Critic and Readiness, in that order, ending
     in GO.
   - A review filed under `plans/` is rejected.
   - A failed Comprehension stops the sequence there.
   - A small fix passes without a review.
   - OWNER APPLIES.
5. `goldfish.fresh` in mil-verify. Claude Code is checked by test. Codex and OpenCode stay "assisted"
   until the Mac runs them.
6. The auditor check in `finish-gate.sh`. A behavior change with no auditor artifact, or with one
   written by the session that built it, warns (O7). It never blocks.

**W3. Spawn, worktree and claim**

7. `spawn-envelope.sh` and `dsh/guard.mjs`.
   - An editing spawn is denied when it has no `Worktree:`, when its worktree is the parent's folder,
     or when another session has claimed that worktree.
   - A scope cap outside the repository with no `Repo:` heading is denied.
   - OWNER APPLIES.
8. The Codex envelope in `machines/*/codex/hooks.json`, on the Mac. It needs the payload that the
   Mac's MODELS-VERIFY run recorded. Without that payload the step reports NOT TESTED.

**W4. The supervisor**

9. `supervisor.ts`.
   - `decide` returns the role, the model taken from route-check, and whether to delegate.
   - `admit-spawn` exits 3 at the O4 limits.
   - It defers to `human-lane.sh` and never overrides it.
   - Wired into the envelope after step 7.

**W5. Context and continuation**

10. Context metadata in the registry, with its validation.
11. `context-budget.ts`.
    - It returns one of: continue, narrow, delegate, compact, checkpoint, fresh-session, transfer,
      stop-handoff.
    - It uses the measured usage, an estimate of the next task, and the maxOut reserve.
    - It is advice from context-trigger.sh, never a block.
12. `checkpoint.ts`: write, validate, lineage and supersede.
    - A recovery checkpoint records the dirty tree.
    - A complete checkpoint refuses a red gate.
    - supersede refuses until the successor has written `recovered: verified`.
13. Continuation on Claude Code reuses the model guard's restart path.
    - The successor's prompt carries the envelope and the checkpoint, and never "pick the next
      backlog item".
    - The archive is offered only after the lineage is verified.
    - This is assisted, not automatic: archiving needs the owner's approval.

**W6. Ledger, Scout and the runtime brief**

14. `run-report.ts`. It generates the run report's skeleton, including the model transitions taken
    from the ledger.
15. `model-scout.ts`: inventory, evaluate and recommend.
    - It never writes the registry, which a hash check before and after proves.
    - An unapproved provider is never added to `lightChain`.
    - Evaluations against free models run on the Mac.
16. The runtime brief in `session-checklist.sh`. A healthy start still prints one line. Drift, or
    `--brief`, prints the policy, the cooldowns, the context confidence and the capability levels.
    It shows the preferred model and the active model side by side.
17. The standard: MODELS.md and MODELS-VERIFY gain each new piece, the standards index is refreshed
    in the same commit, and LOOP and SESSION-LOOP are linked rather than restated.

**W7. Mac and OpenCode**

18. A handoff for the Mac. It covers:
    - the OpenCode plugin calling the supervisor, route-check and escalation-record;
    - verifying the free model ids;
    - the Codex envelope;
    - MODELS-VERIFY runs on Codex and OpenCode;
    - the brief's fallback scenarios.

    DSH is on hold (owner, 2026-11-23). Its rows read UNSUPPORTED with the reason "on hold".

19. **Main-session failover in OpenCode,** a first-class acceptance requirement (owner, 2026-11-23).
    Today only bounded light subagents fall back, through `routed_subagent`. An OpenCode main
    session running on the Codex-backed Sol allowance stops when that allowance runs out, and does
    not move to DeepSeek Flash. A wired API token does not keep the main session going.
    - **Investigate first.** Read OpenCode's actual request and failure hooks and what it can do to
      switch models, from its source and documentation, before choosing an approach. Record the
      findings in the run report.
    - **Keep the rules.** The conversation context, the repository's privacy clearance, explicit
      approval for metered spend (O1: paid Flash is escalation), the cooldowns, and a bounded retry
      of at most two.
    - **If seamless switching in place is supported,** wire it through route-check, so the quota
      failure is recorded as a `transition` line and the next model comes from `pick`.
    - **If it is not supported,** build an honest, resumable handoff instead: a recovery checkpoint
      (step 12) plus a new session on the next eligible model, which carries the conversation
      summary and the envelope. Document it as assisted, not automatic.
    - **Acceptance needs a live event.** Deterministic tests are required but not enough. The check
      `opencode.main-failover` stays NOT TESTED until a real transition from quota exhaustion to
      the next provider has happened on its own and been recorded in the ledger and the run report.
    - **Covers OpenCode and Codex.** The Codex side is the same: what happens to a Codex main
      session when its plan runs out, recorded honestly as supported, assisted or unsupported.

## Order

- **Can run side by side, since they touch different files:**
  - W2;
  - W3;
  - steps 14 and 15;
  - steps 11 and 12, once step 10 has landed.
- **Must run one after another, because they share files:**
  - The registry, in the order 10, then 1 and 3, then 9.
  - The ledger, in step 1, before steps 2 and 14.
  - The envelope, in step 7, before step 9's wiring.
  - mil-verify and the checklist (steps 5 and 16) last.
  - Step 13 after step 12.
  - Step 17 after all the claude-config work.
  - W7 after the owner pushes.

## Hard stops

- No push, merge or delete; the owner does those.
- No CareerEdgeDevOps/edge, and work context stays on company Claude and Codex.
- No session writes `~/.claude/settings.json` or `~/.codex/*`.
- No change to `human-lane.sh` or pr-review-kit.
- No AI trailers in commits.
- No paid call without a recorded approval.
- Model Scout never writes the registry.
- Nothing picks the next backlog item on its own.

## Ask-triggers

- An open owner decision when its step comes up.
- A test that cannot be made red first.
- The same gate red twice for the same cause.
- A harness payload that differs from its fixture.

## Verification

- `mil-verify --harness claude` prints no `later.*` rows.
- Every new test was red, then green.
- `bun test shared/tools` shows no new failures against the baseline.
- An auditor review in `artifacts/reviews/`, written by a session other than the builder's.
- A goldfish pass on this plan before it is built.
- MODELS-VERIFY runs on the Mac for Codex, DSH and OpenCode.

## Points where the brief conflicts with what exists

1. **Section 7 against tokenomics D10.** The brief keeps paid DeepSeek out of the fallback chain,
   while D10 lets it run at the end of the chain under a daily cap. This is O1.
2. **The section 16 banner.** A full banner on every start is noise, so it prints only on drift or
   on request.
3. **Sections 4 and 16 show OpenCode on Sol**, while its light tiers now run free models first. The
   brief should show the preferred model and the active model side by side.
4. **Section 8.** A goldfish on Claude Code still loads CLAUDE.md and memory. Isolation from the
   main conversation can be proven; "no memory at all" cannot, so it is recorded as assisted.
5. **Section 12.** Archiving needs the owner's approval, so continuation is assisted, not automatic.
6. **Section 6.** The main session's model cannot be switched mid-session, so a return to the
   preferred model happens at the next delegation or the next session.
7. **Section 17** stays out of this plan.
8. **Two resolvers exist,** `model-roles.py` and `model-roles.ts`. One should be retired.
