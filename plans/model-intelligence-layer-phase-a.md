---
id: model-intelligence-layer-phase-a
status: ready
track: ai
depends: []
touches:
  - standards/MODELS.md
  - standards/MODELS-VERIFY.md
  - standards/SESSION-LOOP.md
  - standards/AUDIT-STANDARD.md
  - standards/HOOKS.md
  - standards/README.md
  - standards/INDEX.json
  - artifacts/reviews/2026-11-22-model-intelligence-layer-phase-a.md
  - artifacts/runs/2026-11-22-model-intelligence-layer-phase-a.md
  - artifacts/runs/*-mil-verify-*.md
  - claude-config:artifacts/runs/2026-11-22-model-intelligence-layer-phase-a.md
  - claude-config:shared/model-roles.json
  - claude-config:shared/tools/model-roles.ts
  - claude-config:shared/tools/model-roles.test.ts
  - claude-config:shared/tools/model-escalation.sh
  - claude-config:shared/tools/model-escalation.test.ts
  - claude-config:shared/tools/mil-verify.ts
  - claude-config:shared/tools/mil-verify.test.ts
  - claude-config:shared/tools/config-reconcile.sh
  - claude-config:shared/tools/config-reconcile.test.ts
  - claude-config:shared/tools/windows-links.sh
  - claude-config:shared/tools/link-machine.sh
  - claude-config:shared/tools/session-checklist.sh
  - claude-config:shared/tools/dsh/session-checklist.sh
  - claude-config:shared/tools/spawn-envelope.sh
  - claude-config:shared/tools/spawn-envelope.test.ts
  - claude-config:shared/personal-agents/*.md
  - claude-config:shared/codex/agents/*.toml
  - claude-config:machines/*/settings.json
  - claude-config:machines/*/codex/config.toml
  - claude-config:machines/*/codex/hooks.json
  - claude-config:shared/tools/link-machine.test.ts
owner: ai
---

# Model Intelligence Layer, Phase A: one model policy, verified on every harness

## Why

The loop already routes work by tier, guards spawns, measures context and runs fresh goldfish
reviews. What it lacks is one place that says which model plays which role on which harness, a check
that each device still matches that place, and a way to prove the whole thing works on Claude Code,
Codex, DSH and OpenCode alike. Today the answers are scattered across five agent files, five Codex
TOML files and three machine configs, and they disagree: the Codex goldfish and auditor run Astra,
the other Codex agents run Sol 6.1, and the Windows PC runs Opus as its main model while both
MacBooks and the escalation hook assume Sonnet.

This is Phase A of the owner's Model Intelligence Layer brief (v2.0, 2026-11-22). Fallback,
escalation records, predictive context budgeting, recovery checkpoints and Model Scout are later
phases and out of scope.

## Decisions (owner, 2026-11-22, in chat)

- **D1. Policy in the standard, identifiers in configuration.** `standards/MODELS.md` owns portable
  model policy and names no model. The concrete table lives in `claude-config:shared/model-roles.json`.
  SESSION-LOOP §6 already requires this, and it keeps its routing guidance while pointing at MODELS.md
  for the role contract.
- **D2. Six roles on three tiers.** Orchestration, review, implementation, research, lightweight and
  prose map onto SESSION-LOOP's strong, execution and cheapest tiers. Planning and architecture are
  orchestration capabilities, not roles. Prose stays flagged unconfirmed.
- **D3. Review follows AUDIT-STANDARD.** Auditors run on the execution tier, the synthesis that ranks
  their findings runs on the strong tier, and goldfish run on the strong tier.
- **D4. Astra is never a default.** The Codex goldfish and auditor leave it.
- **D5. The tier table is the mapping.** The brief's table already names each harness's equivalents,
  so the registry records them directly:

  | Tier | Claude Code | Codex | DSH | OpenCode |
  |---|---|---|---|---|
  | strong | `opus` | `gpt-6.2-sol`, effort medium | not pinned (see below) | Sol 6.2 Medium |
  | execution | `sonnet` | `gpt-6.2-sol`, effort low | not pinned | Sol 6.2 Low |
  | cheapest | `haiku` | `gpt-6-luna`, effort medium | not pinned | Luna Medium |

  The Codex id `gpt-6.2-sol` follows the naming of the ids already in use (`gpt-6.1-sol`,
  `gpt-6.2-astra`, `gpt-6-luna`). It is entered with `verified: false`, because Codex is not
  installed on the Windows PC. The owner's Codex run of MODELS-VERIFY confirms it, and the session
  that reads that run commits `verified: true`. DSH sets its model outside this repository, so the
  registry records `pinned: false` for it rather than inventing ids. OpenCode is recorded as
  `supported: false` with the brief's preferences as notes.
- **D6. Sonnet runs the main session, and escalation happens by delegation.** Every machine's main
  model is the execution tier (Sonnet). The owner's requirement is that the session recognizes when
  the next piece of work is planning, orchestration or review, uses Opus for it, and returns to
  Sonnet when it is done. A hook cannot switch the main session's model, and switching it mid-session
  discards the prompt cache (`model-escalation.sh` documents both, with the measured cost). So
  escalation means handing that piece to a subagent pinned to the strong tier, whose context ends
  when the piece does. A new agent, `planner`, carries planning and architecture work; goldfish and
  the review synthesis already run on the strong tier.
- **D7. The escalation hook advises delegation, every turn it applies.** `model-escalation.sh` keeps
  its five cases and stops suggesting `/model opus`. It suggests the agent that fits: planner for
  planning and for ranking a review's findings, goldfish for a plan review, auditor for reading a
  change; and it may
  fire on any prompt, not only the first, because a delegation costs no cache. It still fires at most
  once per case per session, so it cannot nag.
- **D8. A device resolves its own conflicts, except the permission surface.** When the session
  checklist finds drift, it repairs everything outside the human lane by itself: links, agent files
  and the Windows symlink setup. The machine slug is derived on every run (step 5), so it is never
  stored and has nothing to repair. For `~/.claude/settings.json` and
  `~/.codex/config.toml` it prepares the exact repair, shows the diff, and applies it only when the
  owner approves at that session start. human-lane.sh is not changed. The owner accepted this on
  2026-11-22 after the review argued that an unattended writer of the permission surface gives up a
  safety property to save one step.
- **D9.** The checklist row reads `Model Intelligence Layer verified`.

## Session order

The work spans two repositories, and SESSION-LOOP gives each its own session and envelope. The order
is fixed, and nothing runs in parallel:

1. **Session C** in claude-config does steps 1 to 7 and commits. It goes first, so the standard
   describes what was built rather than what was hoped for.
2. **Owner checkpoint.** Session C ends by printing the `link-machine.sh --apply-settings` command
   and stops. The owner runs it on the Windows PC, which installs the new main model and matcher, and
   says so in chat. Only then does the Windows acceptance run. No session runs that command itself.
3. **Session A**, a short acceptance session opened in claude-config after the owner checkpoint,
   records the Windows acceptance in claude-config's run report: the verified row in its own
   checklist, then one agent file deliberately broken, a new session started, and the repair shown.
   It edits only that one agent file, and the reconcile puts it back.
4. **Session S** in the portfolio repo does steps 8 and 9, then runs MODELS-VERIFY on Claude Code on
   the Windows PC.

Every behavior-changing step writes its failing test first. The terms used below are defined in the
linked files: lane, scope cap, hard stops and ask-triggers in LOOP §4b; the envelope guard in
`claude-config:shared/tools/spawn-envelope.sh`; the context reader in
`claude-config:shared/tools/context-usage.ts`, which already counts cached input tokens
(`input_tokens + cache_creation_input_tokens + cache_read_input_tokens`); the human-lane guard in
`claude-config:shared/tools/human-lane.sh`. DSH is the DeepSeek Harness, whose loop plugin lives in
`claude-config:shared/tools/dsh/`. The agents are auditor, goldfish, implementer, locator and writer,
plus the new planner, in `shared/personal-agents/*.md` for Claude Code and `shared/codex/agents/*.toml`
for Codex. Explore is Claude Code's built-in read-only search agent. OpenCode is not installed on any
machine.

## Steps

1. **Registry and resolver.** `shared/model-roles.json`:

   ```json
   {
     "version": 1,
     "tiers": ["strong", "execution", "cheapest"],
     "roles": {
       "orchestration":  { "tier": "strong" },
       "review":         { "tier": "execution", "synthesis": "strong" },
       "implementation": { "tier": "execution" },
       "research":       { "tier": "execution" },
       "lightweight":    { "tier": "cheapest" },
       "prose":          { "tier": "strong", "confirmed": false }
     },
     "main": { "tier": "execution" },
     "agents": {
       "planner":     { "tier": "strong" },
       "goldfish":    { "tier": "strong" },
       "auditor":     { "tier": "execution" },
       "implementer": { "tier": "execution" },
       "locator":     { "tier": "cheapest" },
       "writer":      { "tier": "strong" }
     },
     "harnesses": {
       "claude": {
         "strong":    { "model": "opus",   "verified": true },
         "execution": { "model": "sonnet", "verified": true },
         "cheapest":  { "model": "haiku",  "verified": true }
       },
       "codex": {
         "strong":    { "model": "gpt-6.2-sol", "effort": "medium", "verified": false },
         "execution": { "model": "gpt-6.2-sol", "effort": "low",    "verified": false },
         "cheapest":  { "model": "gpt-6-luna",  "effort": "medium", "verified": false }
       },
       "dsh":      { "pinned": false },
       "opencode": { "supported": false, "notes": "Sol 6.2 Medium / Sol 6.2 Low / Luna Medium" }
     },
     "forbiddenDefaults": ["astra"],
     "escalation": {
       "codex":    { "model": "gpt-6.2-astra", "effort": "low", "approval": "required", "wired": false },
       "opencode": { "provider": "deepseek-paid", "approval": "required", "wired": false }
     }
   }
   ```

   Agents map to tiers only, never to roles, so the resolver has one kind of value to read. A main
   model is written as `sonnet[1m]` in settings; the resolver compares the part before `[`. "Registry
   valid" means: the file parses; every role and agent names a known tier; every harness that is
   neither `pinned: false` nor `supported: false` defines all three tiers; no effort is `high`; and no
   model id outside `escalation` contains any string in `forbiddenDefaults`.

   `shared/tools/model-roles.ts` resolves a tier for a harness and lists every pinned model: agent
   frontmatter `model:`, Codex agent TOML `model` and `model_reasoning_effort`, each machine's
   `settings.json` `model`, and each machine's `codex/config.toml` `model`.

   Tests first, in `model-roles.test.ts`, in two kinds, so the registry is not only checked against
   the files it was written to match:
   - **Rule tests on fixtures:** a fixture registry with Astra in a tier fails; a fixture with `high`
     effort fails; a fixture agent naming an unknown tier fails; a fixture main model `opus[1m]` fails
     against `main: execution`.
   - **The real-repo test:** every real pin matches the real registry. It fails today on the Codex
     goldfish and auditor (Astra), on the other Codex agents (Sol 6.1), on the Windows main model
     (Opus) and on the missing planner.
2. **Align the pins.** Add `planner` (`shared/personal-agents/planner.md` and
   `shared/codex/agents/planner.toml`): read-only tools, strong tier, for planning and architecture,
   returning a plan in the plan-file shape. Update the five existing agents in both harnesses, set
   every machine's main model to `sonnet[1m]`, and give every machine's Codex config the
   execution-tier model and its effort (`model = "gpt-6.2-sol"`, `model_reasoning_effort = "low"`).
   The resolver reads `model_reasoning_effort` from Codex configs as well as `model`, so an effort
   mismatch fails `pins.match`. The real-repo test turns green.
3. **Escalation by delegation.** Test first in `model-escalation.test.ts`: a planning prompt yields
   advice naming the planner agent and not `/model`; the same case does not fire twice in one
   session; two different cases may each fire once; an Edge path still skips. Then change
   `model-escalation.sh` to match D7. The hook stays wired and stays in `expected-hooks.txt`.
4. **Close the envelope hole.** Tests first in `spawn-envelope.test.ts`:
   - an `Agent` call whose `subagent_type` is general-purpose, implementer or writer, or is missing or
     unknown, is denied unless the prompt carries all four headings: Lane, Scope cap, Hard stops and
     Ask-triggers, matched by the patterns already in the script;
   - an `Agent` call whose `subagent_type` is goldfish, locator, planner or Explore needs only Scope
     cap;
   - the same rules apply to `Task`;
   - a test reads the frontmatter of every agent on the read-only list and fails if any grants Edit,
     Write, NotebookEdit or Bash, so the list cannot drift from the files.

   The rule is the fixed list. A type not on it is treated as editing. The PreToolUse matcher in every
   machine's `settings.json` gains `Agent|Task`. Codex and DSH are handled separately:
   - **Codex.** Which tool name and payload a Codex agent spawn sends is not known on this PC, where
     Codex is not installed. The Codex matcher is left unchanged, `envelope.denies` reports NOT
     TESTED for codex, and the owner's Codex run of MODELS-VERIFY records the observed tool name and
     payload in its report. Wiring the Codex guard is the first item of the next plan, not a guess
     made here.
   - **DSH** already guards `subagent` and `subagent_fork` in `dsh/guard.mjs` for the same four
     headings. It gets the same read-only list, with its own test in `dsh/guard.test.ts`.
5. **Shared Windows link helper.** `shared/tools/windows-links.sh` is sourced by both
   `link-machine.sh` and `config-reconcile.sh`, so the Windows logic exists once. It sets
   `MSYS=winsymlinks:nativestrict`; it takes the machine slug from `MACHINE_SLUG`, then from the one
   `machines/` directory whose name matches `hostname` lowercased; and it detects Developer Mode by
   creating and removing a test symlink in a temporary directory. When that fails, it reports
   Developer Mode off and makes no copies.
6. **Self-resolution.** `shared/tools/config-reconcile.sh` runs first in the session checklist. It is
   silent when the device is in sync. Tests first in `config-reconcile.test.ts`, against a fixture
   home directory and a fixture repo whose origin is a local bare repository, so no test touches the
   network. The tests cover: in sync; a wrong link; a missing agent file; settings drift with a clean
   and pushed repo; settings drift with a dirty repo; with unpushed commits; when behind origin; when
   the fetch times out; with no remote; and on a detached HEAD.
   - **Outside the human lane** (links and agent files), it repairs from the repository
     unconditionally and prints one line per repair.
   - **The permission surface** (`settings.json`, `codex/config.toml`, `codex/hooks.json`): it never
     writes these by itself. It prints the drift as a diff summary and the one command that applies
     it, `link-machine.sh --apply-settings`, which the owner runs or approves. That command refuses
     unless the repository is clean and level with origin after a fetch that finished. The fetch
     outcome is read from git's exit status within a five-second limit: timeout, no remote and
     detached HEAD all count as "origin unknown", and an unknown origin always refuses.
   - **Backups:** before any settings write, the live file is copied to
     `~/.claude/state/settings-backups/<file>.<timestamp>`. The newest ten are kept, and
     `link-machine.sh --restore-settings` puts back the newest one. That command is the documented
     way back from a bad apply, and it works even when hooks are broken, because the owner runs it
     from a terminal.
   - It makes one attempt per session and reports anything it could not fix, rather than looping.
   - The two new `link-machine.sh` flags get their own tests first, in `link-machine.test.ts`, on the
     same fixtures: `--apply-settings` refuses on a dirty repo, unpushed commits, behind origin, a
     fetch timeout, no remote and a detached HEAD, and applies with a backup when clean and level;
     `--restore-settings` puts back the newest backup, and refuses when there is none.
7. **The verifier and the checklist row.** `shared/tools/mil-verify.ts` runs as
   `bun "$HOME/.claude/tools/mil-verify.ts" --harness <claude|codex|dsh|opencode>`. The checklist
   calls it after the reconcile, so the row describes the device as it is after repairs. When bun is
   missing, the row says so and fails. The verifier prints one JSON line per check and writes the full
   report to `~/.claude/state/mil-verify-<harness>.json`. Each line has `id`, `level` (the conformance
   level the check proves when it passes: configured, mechanically enforced, verified by test,
   assisted or unsupported) and `result` (PASS, FAIL, UNSUPPORTED or NOT TESTED).

   | Check | Level | What it does |
   |---|---|---|
   | `registry.valid` | verified by test | the step 1 rules |
   | `pins.match` | verified by test | every pin matches the registry; a pin whose registry entry has `verified: false` still passes, because the pin matches |
   | `ids.verified` | configured | one row per registry id with `verified: false`, reported NOT TESTED, so an unconfirmed id is visible without failing the row |
   | `live.match` | configured | the live settings and hooks are byte-identical to this machine's repo copies, which is the comparison `link-machine.sh --check` already makes, because the linker copies them unchanged; UNSUPPORTED for a harness not installed |
   | `hooks.wired` | configured | every line of `expected-hooks.txt` is in the live hook config, and the envelope matcher covers `Agent` and `Task`; UNSUPPORTED for a harness not installed |
   | `envelope.denies` | mechanically enforced | runs the hook command exactly as the live config names it, with an unenveloped `Agent` payload, and expects exit 2, so it proves the wiring, not only the script |
   | `context.cached` | verified by test | context-usage.ts, fed a fixture transcript, counts cached input |
   | `escalation.delegates` | verified by test | model-escalation.sh, fed a planning prompt, names the planner |
   | `escalation.gated` | configured | every paid escalation entry is approval-required and unwired |
   | later phases | — | fallback, escalation records, budgeting, recovery, goldfish freshness enforcement and Scout, each NOT TESTED by name |

   `mil-verify.test.ts` is written first: on a fixture device with one deliberate drift, the verifier
   reports exactly that check as FAIL and every other check as PASS; on a fixture with Codex absent,
   `live.match` and `hooks.wired` report UNSUPPORTED for codex and the row stays ok.

   `session-checklist.sh` and `dsh/session-checklist.sh` print one row: `ok   Model Intelligence
   Layer verified` when no check is FAIL, or `fail` with the failing ids, in which case the verdict
   line fails too. No check is ever dropped for speed. The fetch is skipped when no settings drift
   was found. When the verifier takes longer than five seconds, the row keeps its result and appends
   the time taken, so slowness is visible but never turns the row red.

   **Per harness.** For `--harness dsh`: `registry.valid` and `context.cached` run as for Claude Code;
   `pins.match` reports UNSUPPORTED because DSH is `pinned: false`; `live.match` and `hooks.wired`
   report UNSUPPORTED because DSH keeps no hook config file this repository owns; and
   `envelope.denies` runs `dsh/guard.mjs` with an unenveloped `subagent` payload and expects a denial.
   For `--harness codex`: every check applies, except `envelope.denies` (NOT TESTED, see step 4). For
   `--harness opencode`: every check reports UNSUPPORTED.
8. **`standards/MODELS.md`.** Session S writes it once C's tests are green. Frontmatter with `title`,
   `summary` and `when`, following DECISIONS. It covers: what the layer owns and does not; the six
   roles, the tier mapping and the main-session tier; escalation by delegation, and why a mid-session
   model switch is not used; the three distinct decisions (preferred assignment, operational
   fallback, capability escalation), of which Phase A defines the first and the delegation form of
   the third; the effort policy; the registry as the only home of identifiers; the five conformance
   levels; and D8. It links to AI-DEVELOPMENT §6, LOOP §2a and §4b, SESSION-LOOP §5 and §6 and
   DECISIONS rather than restating them, and its prose follows VOICE. Then wire it in: an index row in
   README.md's pattern, INDEX.json regenerated with `bun run standards:index` in the same commit, a
   one-line pointer from SESSION-LOOP §6 and from AUDIT-STANDARD's model-tier paragraph, and OpenCode
   added to HOOKS §4c as a fourth harness, marked unsupported.
9. **`standards/MODELS-VERIFY.md`.** A prompt the owner copies into a fresh session on any harness.
   The session runs the verifier for its harness, then the probes a script cannot run:
   - it reports the model it runs as, against the registry's main tier;
   - it spawns an agent with no envelope and confirms the denial;
   - it delegates a small planning question and confirms the planner answered on the strong tier;
   - **freshness:** it generates a random token of 16 hex characters, writes it in its own visible
     reply, spawns a goldfish whose brief does not contain it, and asks the goldfish to quote every
     16-hex-character string present in its context. PASS when the goldfish quotes none or quotes
     strings other than the token, and FAIL when the token appears. With 16 hex characters, a chance
     match is negligible;
   - it confirms a human-lane write is refused.
   It writes `artifacts/runs/<date>-mil-verify-<harness>.md` in the repository it runs from, as a table
   of check, level and result, and it never reports a capability as working on configuration alone.

## Acceptance

- Every test named in steps 1 to 7 was red before its change and is green after it, with the output in
  claude-config's run report.
- On the Windows PC, a fresh session's checklist prints `ok   Model Intelligence Layer verified`.
- A real drift on the Windows PC (one agent file deliberately broken) is repaired by the next session
  start, and a settings drift is shown with its apply command rather than written.
- MODELS.md is published and indexed, and it duplicates no table owned elsewhere.
- MODELS-VERIFY passes on Claude Code on the Windows PC before handover.
- The owner then runs it on Codex and DSH on a MacBook. The Codex run is what confirms the Codex ids:
  when it is started inside claude-config, it sets `verified: true` on each id it observed running
  and commits that change locally; when it is started elsewhere, its report lists the exact registry
  edit for the owner. Either way, the next session's `ids.verified` rows turn PASS. OpenCode is
  reported as not installed, which is the honest Phase A result, not a pass.
- Commits follow COMMIT-STANDARD in each repository. Nothing is pushed.

## Hard stops

No push. No Edge repository. No later-phase behavior. No change to human-lane.sh. No session writes
`~/.claude/settings.json` or `~/.codex/*` with its own tool call; only the owner-run
`link-machine.sh --apply-settings` does.
