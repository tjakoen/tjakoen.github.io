---
id: model-tokenomics
status: ready
track: ai
depends: [model-intelligence-layer-phase-a, model-guard-respawn]
touches:
  - plans/model-tokenomics.md
  - standards/MODELS.md
  - standards/MODELS-VERIFY.md
  - standards/INDEX.json
  - artifacts/reviews/2026-11-22-model-tokenomics.md
  - claude-config:shared/model-roles.json
  - claude-config:shared/tools/model-roles.ts
  - claude-config:shared/tools/model-roles.test.ts
  - claude-config:shared/tools/route-check.ts
  - claude-config:shared/tools/route-check.test.ts
  - claude-config:shared/tools/fixtures/route-check/*
  - claude-config:shared/tools/usage-ledger.ts
  - claude-config:shared/tools/usage-ledger.test.ts
  - claude-config:shared/tools/usage-ledger.sh
  - claude-config:shared/tools/expected-hooks.txt
  - claude-config:machines/tjakoens-windows-pc/settings.json
  - claude-config:machines/tjakoens-macbook-air/settings.json
  - claude-config:machines/tjakoens-macbook-pro/settings.json
  - claude-config:artifacts/runs/<date>-model-tokenomics.md
  - claude-config:artifacts/handoffs/<date>-model-tokenomics-mac.md
owner: ai
---

# Spend free models first, fall back by rule, and record what every session used

## Why

Phase A made one registry the home of every model choice, and the model guard keeps a main session on the
tier the registry names. Neither one knows what a model costs or where its prompts go. On OpenCode, the
light work (implementation, research, extraction) runs on the cheaper Codex models today, which spends plan
usage that orchestration and planning need more. Free models can do much of that light work. They also run
out fast and without warning, and a free endpoint may keep what it is sent.

The owner wants three things. Light work goes to free models first, on repositories the owner has cleared
for them. When a model is spent or failing, the session moves to the next choice by a fixed rule. And every
session and subagent records which model it used, whether it was free or paid, and whether it was private,
so PANTRY can show where the usage went.

## Decisions (owner, 2026-11-22, in chat)

- **D1. Free models replace the light tiers, not the strong one.** On OpenCode, the execution and cheapest
  tiers try the free chain first. Orchestration and planning stay on the strong tier: Opus on Claude Code,
  Sol on Codex and OpenCode.
- **D2. Flash takes the strong tier only when both paid plans are out.** When the Claude and Codex plans
  are both marked out, the strong tier on OpenCode runs on DeepSeek V4.1 Flash.
- **D3. The fallback order for light work on OpenCode** is the free chain in registry order, then the
  cheaper Codex models while the Codex plan is not marked out (gpt-6-luna, then gpt-6.2-sol at low
  effort), then DeepSeek V4.1 Flash on the paid DeepSeek API.
- **D4. Every model is private or not private.** Claude and Codex models are private. Every free model and
  every DeepSeek model, the paid API included, is not private. The registry records it per model and
  MODELS.md shows it in the equivalents table.
- **D5. A repository is cleared for non-private models once, by the owner.** The first time the route check
  runs in a repository with no entry, it stops and asks the owner whether non-private models may see it,
  and records the answer. On yes, the full D3 chain applies. On no, only private models are candidates:
  Claude and Codex. Work still runs; it just never leaves those two providers. Nothing is cleared by
  default.
- **D6. Build the route check and the usage record here,** with every limit a registry setting, so the Mac
  run tunes numbers rather than rebuilding logic.
- **D7. Every session and subagent writes usage records, and PANTRY reports them,** split by harness,
  model, cost class and privacy.

The owner did not answer three narrower questions; the plan takes the defaults below, each one a registry
setting the owner can change without a code change.

- **D8 (default). Codex before the paid API** in D3, because the Codex plan is already paid for.
- **D9 (default). A plan is marked out by its quota error,** until the reset time the error gives, or six
  hours when it gives none. `route-check plan out <claude|codex>` and `route-check plan clear
  <claude|codex>` set and clear it by hand.
- **D10 (default). The paid API runs up to a daily cap** of five dollars, then each further use asks the
  owner first. This replaces the approval gate on escalation.opencode for the D3 fallback only; a
  deliberate escalation still asks.

## What exists

- shared/model-roles.json holds the tiers per harness, escalation entries, and an unwired free chain under
  fallback.opencode.chain whose note says it is for when every paid plan is exhausted. OpenCode is
  `supported: false` with `tiersFrom: codex`, so resolveTier returns null for it.
- shared/tools/context-usage.ts reads the newest non-sidechain turn's input side from a Claude Code
  transcript. It does not sum turns, count output tokens, or read subagent turns, so the usage record
  needs its own reader.
- shared/tools/model-guard.sh enforces the main tier and runs on Stop, where it can exit 2.
- The run ledger, artifacts/runs/, holds Markdown reports for people. It is not the data source here.

## Registry changes

Every per-model entry (each tier entry under harnesses, each escalation entry, each fallback chain entry)
gains two keys:

- `cost`: one of `free`, `plan` or `metered`.
- `private`: `true` or `false`, per D4.

Each free chain entry also gains `provider` (the OpenRouter provider slug, for example `openrouter`) and
`id` (the model id the provider takes, `verified: false` until the Mac run).

The fallback.opencode block is rewritten to hold the D3 chain in order as `lightChain`, a list of entries
of the form `{ "model", "id", "provider", "cost", "private" }`, ending in the Codex and paid API entries.
Its note is replaced with "free first, then Codex, then the paid API". An entry `strongWhenPlansOut` names
DeepSeek V4.1 Flash on the paid API, per D2.

A new top-level `routing` block holds every setting the route check uses:

```json
"routing": {
  "cooldownDefaultMinutes": 60,
  "demoteAfterFailures": 3,
  "planOutDefaultHours": 6,
  "paidDailyCapUsd": 5
}
```

validateRegistry gains three rules: every per-model entry has `cost` and `private`; every `lightChain`
entry is complete; and `routing` has all four keys as positive numbers.

The repository clearances live outside the registry, in state, because they are the owner's answers on
one machine and not policy: `~/.claude/state/route-check/repos.json`, a map from a repository key to
`true` or `false`. The key is the absolute path of the git top-level folder, lower-cased, with forward
slashes, so two repositories with the same folder name never collide and a subfolder or worktree maps to
its own top level.

## Route check

shared/tools/route-check.ts, run with bun. Commands:

- `route-check pick <harness> <tier> [--cwd <dir>]` prints one line of JSON,
  `{"model", "id", "provider", "cost", "private", "reason"}`, and exits 0. Exit 3 means it needs the
  owner (an unanswered repository, or the paid cap reached), with the question in `reason`.
- `route-check fail <model> <cause> [--until <iso>]` records a failure. `cause` is one of `rate-limit`,
  `quota`, `error`. A `quota` failure on a Codex or Claude model also marks that plan out (D9).
- `route-check ok <model>` resets the model's failure streak.
- `route-check plan out|clear <claude|codex> [--until <iso>]`.
- `route-check repo allow|deny [--cwd <dir>]` records the owner's D5 answer.

What `pick` returns:

- Harness `claude` or `codex`: the registry tier as today, with its `cost` and `private`. These harnesses
  never route to a non-private model.
- Harness `dsh`: the registry tier, which is not private. In a repository not cleared, exit 3 asks.
- Harness `opencode`, tier `execution` or `cheapest`: the first `lightChain` entry not skipped. In a
  repository cleared `false`, the non-private entries are skipped, so the answer is a Codex entry.
- Harness `opencode`, tier `strong`: Sol at medium effort while the Codex plan is not marked out, else
  `strongWhenPlansOut` when the Claude plan is also out, else exit 3 asking the owner.

A candidate is skipped when it is not private and the repository is not cleared; when it has an unexpired
cooldown; when it is demoted for today; or when it is a Codex entry and the Codex plan is marked out.
A `rate-limit` failure sets a cooldown until `--until`, or `cooldownDefaultMinutes` from now. Failures of
the same cause in a row, reset by `route-check ok`, demote the model until local midnight once they reach
`demoteAfterFailures`. When everything before the paid API is skipped, it is picked while today's paid
spend, summed from the usage records, is under `paidDailyCapUsd`; past the cap, exit 3 asks.

State is one file, `~/.claude/state/route-check/state.json`, with `cooldowns`, `streaks`, `demoted` and
`plans`, written through a temporary file and a rename so parallel subagents never leave it half-written.
Every test sets `ROUTE_CHECK_STATE_DIR` and `MODEL_ROLES_PATH` to fixtures under
shared/tools/fixtures/route-check/, so no test reads or changes the real registry or state.

The route check is not on Claude Code's delegation path: Claude Code subagents are pinned in their agent
files and stay private. It is the contract OpenCode calls in step 7. Calling it before delegation and on a
failure is the OpenCode adapter's job, done by its plugin there, not left to a model's memory.

## Model guard

Unchanged. The guard covers the Claude Code main session, which never runs on a non-Claude model, so D2
never reaches it. D2 lives in the route check's `opencode strong` answer, and OpenCode's own session
guard stays manual and unverified until the Mac run.

## Usage record

One JSON line per Stop and per SubagentStop event, appended to `~/.claude/state/usage/<YYYY-MM-DD>.jsonl`,
local date. Fields and units:

```json
{"v":1,"at":"<iso>","machine":"<machines/ slug>","harness":"claude","project":"<repo key>",
 "plan":"<plan id or null>","session":"<session id>","agent":"<subagent type or null>",
 "model":"<message.model id>","provider":"anthropic","cost":"plan","private":true,
 "inTokens":0,"cacheTokens":0,"outTokens":0,"usd":null,"picked":"pinned"}
```

- The token counts are the sums over the assistant turns since that session's previous record, so nothing
  is counted twice. The offset of the last line read is kept per session in
  `~/.claude/state/usage/offsets.json`. Cache reads and cache writes go in `cacheTokens`, not `inTokens`.
- A SubagentStop record sums the sidechain turns for that subagent's agent id in the same transcript; a
  Stop record sums the main turns only.
- `provider`, `cost` and `private` are looked up in the registry by the model id; an unknown id records
  `"unknown"` and `private: false`, so an unlisted model is never counted as private.
- `usd` is filled only where the provider reports cost; Claude Code does not, so it is null there.
- `picked` is `pinned` on Claude Code, `route-check` or `owner` on OpenCode, where the plugin knows.
- `machine` is the machines/ slug from `MACHINE_SLUG`, or the hostname when it is unset.
- `project` is the repository key used for clearances, or the working directory outside a repository.
  The file never leaves the machine except through PANTRY on the same machine.

usage-ledger.sh is a thin wrapper that runs `bun usage-ledger.ts <event>` and always exits 0, so a ledger
failure can never block a session. The guard and the ledger both run on Stop, and hooks on one event run in
parallel, so a session the guard stops still gets its record. Files older than ninety days are deleted at
the first write of each day. `v` versions the format for the PANTRY reader.

## Precise rules

These settle the second readiness review and override any looser wording above.

- **Entry shape.** Every `lightChain` entry is `{ "model", "id", "provider", "cost", "private",
  "effort", "verified" }`; `effort` is null where the provider takes none. Codex tier entries gain `id`
  equal to their `model` and `provider: "openai"`. The paid DeepSeek entry is `id:
  "deepseek-v4.1-flash"`, `provider: "deepseek"`, with `usdPerMTokIn` and `usdPerMTokOut` set to null
  until the Mac run reads the price list. Free entries keep `id: null` until the Mac run, and validation
  accepts a null `id` only where `verified` is false. `pick` output adds `effort`.
- **Lookup by id.** A usage record finds its model by exact `id` across harness tiers, `lightChain`,
  `strongWhenPlansOut` and escalation, in that order. Validation fails if two entries with one `id`
  disagree on `cost` or `private`. An unmatched id records `provider`, `cost` and `private` as
  `"unknown"`, `"unknown"` and `false`.
- **Paid spend.** A metered record with `usd: null` is costed from its tokens at the entry's two prices;
  while those are null, each metered record counts as the whole cap, so the cap trips at the first paid
  call and asks rather than spending blind. Every date (usage file, cap, demotion) is the machine's local
  date.
- **Streaks.** A failure with a different cause starts a new streak at one. `rate-limit` and `quota` set
  a cooldown; `error` only counts toward demotion.
- **No private candidate.** When a repository is denied and every private candidate is skipped (DeepSeek
  Harness always; OpenCode when the Codex plan is out), `pick` exits 4 with the reason "no private model
  available here; use Claude Code". The same exit covers `opencode strong` with the Codex plan out and
  the Claude plan not out. An unknown harness or tier exits 2. Outside a git repository the key is the
  working directory, normalized the same way.
- **Who relays an ask.** Exit 3 prints the question on stdout. On OpenCode the plugin shows it to the
  owner and runs `repo allow` or `repo deny` with the answer. Claude Code never calls the route check, so
  never asks. DeepSeek Harness relays it through its loop plugin in the Mac phase; until then a DSH
  session in an uncleared repository is told to run `route-check repo allow|deny` by hand.
- **The plan field.** The id of the one plan in the repository's plans/ folder with `status: doing`;
  null when there is none or more than one.
- **Offsets.** `offsets.json` is written through a temporary file and a rename, like `state.json`. A main
  Stop keeps its offset per session id; a SubagentStop keeps its own per agent id, so the two never share
  a counter. If subagent turns turn out to live in a separate transcript file, the record reads that file;
  if the payload names neither, that is the step 4 ask-trigger.
- **Wiring.** Each new hook entry copies the shape of the model-guard entry already in the same settings
  file, with `"timeout": 10`. The expected-hooks.txt line copies the format of the lines already there.
  usage-ledger.sh is reached through ~/.claude/tools, which link-machine.sh already links to the repo, so
  no copy is made. The machines/*/settings.json files are repository copies; the live file is
  ~/.claude/settings.json, which only the owner's apply command writes.
- **Gates.** The suite is `bun test shared/tools`; the run report records its failure count before step 1
  as the baseline. The fixture registry names its first free entry `fixture-free-a` and its Codex entry
  `gpt-6-luna`, and the probe expects those two. The run report is
  `artifacts/runs/<build date>-model-tokenomics.md` and the handoff
  `artifacts/handoffs/<build date>-model-tokenomics-mac.md`, dated by the day the build ends.
- **Past the paid cap.** `route-check paid allow [--hours <n>]` records the owner's yes in
  `state.json` as `paidAllowedUntil`, default the end of the local day. While it holds, `pick` returns the
  paid API past the cap; the OpenCode plugin runs it when the owner says yes to the exit 3 question.
- **OpenCode tiers.** `pick` reads OpenCode's strong tier through `tiersFrom`, so Sol at medium comes
  from `harnesses.codex.strong`. `supported` stays false and `resolveTier`, `validateRegistry` and
  `equivalents` are untouched.
- **Cost values.** DeepSeek Harness tiers are `cost: "plan"` (its own plan), `private: false`.
  `escalation.codex` is `plan`, `private: true`. `escalation.dsh` and `escalation.opencode` are
  `metered`, `private: false`; `escalation.opencode` gains `model: "DeepSeek V4.1 Flash"`, `id:
  "deepseek-v4.1-flash"` and `provider: "deepseek"`, replacing `deepseek-paid`, so it agrees with the
  paid `lightChain` entry.
- **Test directories.** `USAGE_LEDGER_DIR` overrides `~/.claude/state/usage/` for both the ledger and
  the cap sum, and `MODEL_ROLES_PATH`, a path to a registry file, is added to `loadRegistry` beside its
  repository-root argument. Every test sets all three variables to temporary or fixture paths.
- **Strong with both plans out.** `strongWhenPlansOut` is not private, so it follows D5: an uncleared
  repository exits 3, a denied one exits 4.
- **Smaller points.** A `quota` cooldown without `--until` uses `cooldownDefaultMinutes`. Free entries use
  `provider: "openrouter"`. The old `chain` key is deleted and the `fallback` type in model-roles.ts
  changes with it. The command is `bun ~/.claude/tools/route-check.ts`, reached through the same link as
  the other tools. The fixture's `lightChain` is `fixture-free-a`, `gpt-6-luna`, `gpt-6.2-sol` at low,
  then the paid entry.
- **Section 9 text.** The sentence in MODELS.md that begins "When every paid plan is spent, it falls back
  to a chain of free models" is replaced with the D3 order.

## Steps

Steps 1 to 6 run on this Windows PC in Claude Code. Steps 7 to 9 run on the owner's Mac in OpenCode, from
the handoff file step 6 writes.

1. **Tests first:** model-roles.test.ts for the new keys and validation rules; route-check.test.ts for each
   `pick` case above, each skip rule, cooldown expiry, the streak and demotion, plan marking, the paid cap,
   exit 3 for an unanswered repository, and the atomic state write; usage-ledger.test.ts for a main
   record, a subagent record, the no-double-count offset, an unknown model, and exit 0 on a bad payload.
2. **Registry keys, the rewritten fallback block, the routing block, and validation.**
3. **The route check.**
4. **The usage record.** Hooks in all three machines files: on Windows,
   `"C:\\Program Files\\Git\\bin\\bash.exe" "C:\\Users\\tjako\\.claude\\tools\\usage-ledger.sh" stop`
   and `subagent-stop`; on both MacBooks, `bash "$HOME"/.claude/tools/usage-ledger.sh stop` and
   `subagent-stop`; each with a ten-second timeout. usage-ledger.sh goes in expected-hooks.txt. The owner
   applies settings with `link-machine.sh --apply-settings`.
5. **Standard.** In MODELS.md: a privacy column in the equivalents table and a new section on cost and
   privacy (D1 to D10, the route check commands, the record fields), and the section 9 text that says the
   free chain is only for when every paid plan is spent is corrected. In MODELS-VERIFY.md: a probe that
   runs `route-check pick opencode execution` against the fixture registry for a cleared and an uncleared
   repository and expects a free model and a Codex model. Then `bun run standards:index`.
6. **Run report and handoff.** The run report, and
   claude-config:artifacts/handoffs/<date>-model-tokenomics-mac.md, a prompt the owner pastes into OpenCode
   on the Mac naming steps 7 to 9, the record format, and what this PC proved.
7. **OpenCode wiring (Mac).** Install OpenCode, wire the free chain and the paid DeepSeek API, and add a
   plugin that calls `route-check pick` before a delegation and `fail` or `ok` after a model call, and
   writes the usage record at the end of each turn.
8. **Verification (Mac).** Run MODELS-VERIFY for Codex, DeepSeek Harness and OpenCode, check each free
   model id, and flip each `verified` flag the run proves.
9. **PANTRY views (Mac).** Read the usage files and show use by project, plan, session and subagent, split
   by harness, model, cost class and privacy, with free kept apart from metered. A separate PANTRY plan in
   that repository owns the view code.

## Acceptance

**This PC, by the build session:**

- Every test in step 1 red first and green after, the full shared/tools suite with no new failure, and
  `model-roles.ts check` clean.
- `route-check pick opencode execution` against the fixture registry gives a free model for a cleared
  repository, a Codex model for a denied one, exit 3 for an unanswered one, and the paid API when every
  earlier entry is cooling down.
- The MODELS-VERIFY probe passes, and the standards index test passes.
- The handoff file exists and names steps 7 to 9.

**This PC, after the owner applies settings:** one Claude Code session and one subagent each leave one
record per stop with the right model id, `cost: plan`, `private: true`, and token sums that equal the
transcript's usage blocks for those turns.

**The Mac:** an OpenCode session on a cleared personal repository uses a free model, falls back on a forced
rate limit, and PANTRY shows its records split free and metered, private and not private.

## Envelope

- Lane: gated. Hooks and settings are reviewed by the owner before they go live.
- Scope cap: the touches list.
- Hard stops: no push; no session writes live settings or state files outside a test's temporary
  directory; no Edge repository; no non-private model for a repository not cleared.
- Ask-triggers: a test cannot be made red first; a gate goes red twice on the same cause; the SubagentStop
  payload does not identify the subagent's turns.
