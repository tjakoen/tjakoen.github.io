---
title: MODELS — which model plays which role, on every harness
summary: The portable model policy of the loop. Six roles on three tiers, a main session on the execution tier, escalation by delegation rather than by switching models, the effort ceiling, one registry as the only home of model identifiers, five conformance levels, and how a device repairs its own drift.
when: >
  Read this BEFORE pinning a model in an agent file, a settings file or a Codex config, before adding
  an agent, before reaching for a model switch mid-session, and before claiming a harness runs the
  loop's model policy. It owns which role sits on which tier and how the strong tier is reached; the
  registry in agent-config owns the identifiers, and SESSION-LOOP section 6 owns the routing advice.
  Don't skip because the agent file already names a model - a pin nobody checked against the
  registry is how five files came to disagree.
---

# MODELS: one model policy, verified on every harness

This file came out of a small embarrassment. In November 2026 the answer to "which model does the
goldfish run" was spread over five agent files, five Codex agent files and three machine configs, and
they disagreed. The Codex goldfish ran a model the policy had never chosen, one machine ran its main
session a tier higher than the other two, and the escalation hook assumed the lower one. Nothing was
broken loudly. It was just wrong in three places at once.

So the policy now lives here, the identifiers live in one registry, and a verifier checks every
device against both at session start.

## 1. What this file owns, and what it does not

It owns the portable policy: the roles, the tiers they map to, the tier the main session runs on, how
work reaches the strong tier, the effort ceiling, the conformance levels a harness is graded on, and
how a device resolves drift.

It does not own:

- **Model identifiers.** Not one appears in this file. They live in the registry (section 6).
- **Routing advice** for a given piece of work. [SESSION-LOOP §6](SESSION-LOOP.md) owns that, and
  [AI-DEVELOPMENT §6](AI-DEVELOPMENT.md) owns what the human owes the model before handing it the
  typing.
- **The envelope** a delegated piece carries. [LOOP §4b](LOOP.md) owns the lane, scope cap, hard
  stops and ask-triggers, and [HOOKS](HOOKS.md) owns the guard that refuses a spawn without them.
- **Where a question to the owner lands.** That is [DECISIONS](DECISIONS.md).

## 2. Six roles on three tiers

The tiers are SESSION-LOOP's: strong, execution and cheapest. A role is a kind of work, and each role
sits on one tier.

| Role | Tier | Note |
|---|---|---|
| Orchestration | strong | Planning and architecture are orchestration capabilities, not roles of their own. |
| Review | execution | The synthesis that ranks and de-duplicates findings runs on the strong tier, per [AUDIT-STANDARD](AUDIT-STANDARD.md). |
| Implementation | execution | Settled work against a stated contract. |
| Research | execution | Reading and summarizing with judgment. |
| Lightweight | cheapest | Location and extraction, after a graph query failed to answer. |
| Prose | strong | Unconfirmed. It sits here until a measured run says otherwise. |

Agents map to a tier, never to a role, so a pin has exactly one kind of value to be checked against.
The goldfish and the planner sit on the strong tier, the auditor and the implementer on execution,
the locator on cheapest, and the writer on strong.

**The main session runs on the execution tier.** Every machine, every harness that can pin it. The
main session spends most of its turns typing, reading and wiring, which is execution work, and paying
strong-tier prices for that is the cost this policy exists to stop.

## 3. Escalation is delegation, not a switch

The owner's requirement is plain: when the next piece of work is planning, orchestration or review,
it should run on the strong tier, and the session should come back down when the piece is done.

The obvious way to do that is to switch the main session's model. It is not used, for two reasons. A
hook cannot switch the main session's model at all, so the switch would depend on a model remembering
to ask for it. And switching mid-session throws away the prompt cache, so the whole conversation is
paid for again at the new tier's price on the next turn.

So escalation hands the piece to a subagent pinned to the strong tier. Its context ends when the
piece does, and the main session keeps its cache. The planner agent carries planning and
architecture; the goldfish carries a plan review; the review synthesis already runs on the strong
tier. The escalation hook watches each prompt and names the agent that fits, at most once per case
per session, so it advises and never nags. In the build it also names the auditor for reading a
change and the writer for published prose.

## 4. Three decisions that look like one

"Which model" hides three separate decisions, and mixing them up is how a fallback quietly becomes a
default.

1. **Preferred assignment.** Which tier a role or agent runs on when everything works. This file and
   the registry define it.
2. **Operational fallback.** What runs when the preferred model is unavailable. Section 11 defines
   it: the light chain, its cooldowns, and the strong tier when both plans are out. The chain holds
   free and plan models only. Each move along it is written to the usage ledger as a transition, and
   when every candidate is spent the route check exits 7, which means checkpoint and stop (section
   15), then ask the owner for an escalation. It never reaches for a metered model on its own.
3. **Capability escalation.** Moving a piece of work up a tier because it needs more judgment, or
   past the chain to a metered model. The delegation form is section 3. Paid DeepSeek is escalation
   only (owner decision O1, 2026-11-22): it left the light chain, and every paid call needs an
   approval the owner typed, as section 12 describes. That overrides D10 in section 11.

## 5. Effort

No pin sets reasoning effort to high. The strong tier earns its place through the model, and an
execution-tier model at high effort is a strong-tier bill without a strong-tier choice behind it. A
harness that exposes effort gets a setting per tier, and the registry records which. Claude Code pins
it too: the registry holds an effort beside each Claude tier, and the agent files carry the same value,
so it is a pin the verifier checks like the model. Codex records its own settings in the same place.

A model the registry lists as forbidden as a default never appears in a tier. It may appear only as a
paid escalation entry, gated as section 4 says.

## 6. The registry is the only home of identifiers

The concrete table lives in agent-config, in its shared model-roles file: the tiers, the roles, the
main tier, each agent's tier, each harness's model for each tier, the forbidden defaults and the
gated escalation entries. Every agent file, every Codex agent, every machine's settings and every
machine's Codex config is a pin, and a pin is correct only when it matches that file.

A harness whose identifiers nobody has seen running carries them with *verified: false*. That is not
a failure; the pin still matches. It is a promise that a run on that harness will confirm the id, and
the verifier keeps it visible as NOT TESTED until one does. A harness that sets its model outside the
repository is recorded as not pinned, rather than given invented ids. A harness that is not installed
anywhere is recorded as unsupported.

## 7. Five conformance levels

Every check is graded by what it proves when it passes, and a capability is never reported as working
on configuration alone.

| Level | What a PASS means |
|---|---|
| Configured | The file says so. Nothing has run. |
| Mechanically enforced | A hook refused the wrong thing, called exactly as the live config calls it. |
| Verified by test | A test fed it a fixture and read the result. |
| Assisted | A session ran the probe and reported what it saw. |
| Unsupported | The harness cannot do it, said out loud rather than skipped. |

The verifier prints one line per check with its level and its result (PASS, FAIL, UNSUPPORTED or NOT
TESTED), and the session checklist turns that into one row, "Model Intelligence Layer verified". A
check is never dropped for speed. The probes a script cannot run, such as whether a fresh agent really
is fresh, are in [MODELS-VERIFY](MODELS-VERIFY.md).

## 8. A device resolves its own drift, except the permission surface

At session start a reconcile runs before the verifier, so the row describes the device after repairs.

- **Outside the human lane** (links and agent files) it repairs from the repository by itself and
  prints one line per repair.
- **The permission surface** (the harness settings and Codex config and hooks) is never written by a
  session. The reconcile shows the drift and the one command that applies it, and the owner runs that
  command. It refuses unless the repository is clean and level with origin after a fetch that
  finished, and it backs up the live file first so a bad apply has a way back.

An unattended writer of the permission surface would give up a safety property to save one step, and
the owner chose the step. The human lane itself is [LOOP §4b](LOOP.md); which rung of checking the row sits
on, and what would earn it a higher one, is [LOOP §2a](LOOP.md).

## 9. Harnesses

Claude Code and Codex pin every tier. DeepSeek Harness sets its model outside the repository, so it
is not pinned and its pin checks report unsupported. OpenCode is installed and runs on the MacBook Air,
where its route check, its launch plugin and the Go allowance read have run live. Handoffs between them follow
[SESSION-LOOP §5](SESSION-LOOP.md).

## 10. The model guard

Every main session runs the registry's main tier, and nothing in a menu or a spawner's defaults changes
that. A session started by another session inherits that session's model, and the owner can pick any
model from the picker, so the rule needed something that enforces it. The model guard is that: one
script in agent-config, shared/tools/model-guard.sh, wired to SessionStart, UserPromptSubmit, PreToolUse
and Stop. It was built and passed live acceptance on 2026-11-22, after six runs, and the run report in
agent-config holds the evidence. The desktop app's SessionStart carries no model, so the guard reads
it from the transcript at the first tool call or the first Stop, with grep and sed only.

**The override.** The phrase *keep this model*, in the owner's first prompt, records an exception for
that session id and nothing else. Sent while a restart is pending, it lifts the restart. There is no
standing exemption, and a session started on the strong tier on purpose is respawned like any other.
Work that needs the strong tier delegates to a strong-tier agent, as section 3 says.

**The desktop flow.** A mismatched session stops before it does any work. It proposes a restart card
titled *Restart on* followed by the alias, with the registry's model and effort, and the card carries the
prompt behind a line reading respawned-by-model-guard. The owner clicks the card, and the replacement
runs the task. The stopped session then wakes and shows two reply buttons, *Archive it* and *Keep it*.
On *Archive it* it detaches the replacement first and archives itself second. That order is not
taste. Auto mode refuses a hook-requested archive or start, which is why the restart is a card the owner
clicks and the archive is a reply the owner sends, and archiving a parent archives its children, so
without the detach the replacement would go with it.

A replacement that is still on the wrong model never respawns again. It takes the blocking path below, so
a desktop app that ignored the model argument produces one blocked session and never a loop.

**Every other harness.** The guard exits 2 on the first prompt, prints the restart command and asks the
owner to paste the prompt again. For Claude Code that is claude --model with the alias. The prompt is
never put into a command, so no shell quoting is involved.

**A stuck session.** Delete the file ~/.claude/state/model-guard/ followed by the session id and .json.
With no state file the guard does nothing for that session. Typing *keep this model* is the gentler way
out, and it works whenever a restart is pending.

**What does not carry over.** Attachments and images in the first prompt. The replacement gets the text
only, and the stopped session tells the owner to add them again.

**Per-harness equivalents.** The registry, shared/model-roles.json, is the only place these live, and the
guard prints them in both its restart card and its blocking message.

| Tier | Claude Code | Codex | DeepSeek Harness | OpenCode | Privacy |
|---|---|---|---|---|---|
| strong | opus, low effort | gpt-6.2-sol, medium | DeepSeek V4.1 Flash | the Codex model, gpt-6.2-sol, medium; then DeepSeek V4 Pro on the Go plan | Claude and Codex private; DeepSeek not private |
| execution (main) | sonnet, medium effort | gpt-6.2-sol, low | DeepSeek V4.1 Flash | the Codex model, gpt-6.2-sol, low; then DeepSeek V4 Pro on the Go plan; then the light chain | free, Go and DeepSeek models not private; Claude and Codex private |
| cheapest | haiku, low effort | gpt-6-luna, medium | DeepSeek V4.1 Flash | the light chain, then the Codex model, gpt-6-luna, medium | free, Go and DeepSeek models not private; Claude and Codex private |
| escalation, on approval | none, delegate to strong | gpt-6.2-astra, low | DeepSeek V4.1 | the paid DeepSeek API, while credits remain | Codex private; DeepSeek, paid API included, not private |

DeepSeek Harness runs Flash on every tier and reaches the full DeepSeek V4.1 only as a rare escalation
the owner approves. OpenCode borrows the Codex models while a Codex plan has usage left. Light work on OpenCode tries
DeepSeek V4.1 Flash Free first, then the same model on the OpenCode Go plan, then the cheaper Codex
models while the Codex plan has usage left. The paid API is no longer part of that order; it is an
escalation the owner approves (section 12). Section 11 holds that order, the privacy rules behind it,
and why the light chain holds one free model and one Go model (D11). The main chain holds a second Go
model, DeepSeek V4 Pro, for the reason D13 gives.

The main OpenCode session has a recovery order of its own. When the Codex allowance stops Sol, it moves
to DeepSeek V4 Pro on the Go plan, and only when that route is unavailable does it fall to the free
model and then to the cheaper Go DeepSeek. A paid request comes last, as an escalation the owner
approves (section 12).

The order was settled on 2026-11-24, in two steps. The old order was seen live for the first time that
day: gpt-6.2-sol stopped on its quota at 05:15 UTC, the free model had already been rate-limited at
05:09, and the session landed on Flash, a light model writing the main conversation. The owner asked
why that hop was not Claude Sonnet 5.5. It cannot be: the Go provider serves Haiku 5.5 and no Sonnet,
and Sonnet is metered on the opencode provider at 2 in and 10 out per million tokens. The hop is
DeepSeek V4 Pro instead, the cheapest model on Go that sits above Flash: 0.66 in, 1.98 out and cache at
0.022, against Flash's 0.15, 0.6 and 0.003. It burns the shared Go allowance about four times as fast
per token, and it is still the cheapest strong option the plan carries (D13, section 11).

Every row outside Claude Code is marked unverified in the registry. Codex, DeepSeek Harness and OpenCode
are not installed on the machine where the guard was proven. OpenCode is installed and runs on the
MacBook Air. The guard is proven on the Claude Code desktop app only.

## 11. Cost and privacy

Phase A made one registry the home of every model choice. It did not say what a model costs or where
its prompts go. On OpenCode the light work runs on the cheaper Codex models, which spends plan usage
that orchestration and planning need more, and a free endpoint may keep whatever it is sent. This
section adds cost and privacy to the registry, along with the rules that use them. The numbers are
registry settings, so tuning one is never a code change.

**The decisions.** The owner made D1 to D7 in chat on 2026-11-22 and left D8 to D10 to the defaults
below, each of which the owner can change in the registry.

- D1. Free models replace the light tiers, not the strong one. On OpenCode the execution and cheapest
  tiers try the free chain first. Orchestration and planning stay on the strong tier: Opus on Claude
  Code, Sol on Codex and OpenCode.
- D2. Flash takes the strong tier only when both paid plans are out. With the Claude and Codex plans
  both marked out, the strong tier on OpenCode runs on DeepSeek V4.1 Flash.
- D3, superseded (see below). The fallback order for light work on OpenCode is the free chain in registry order, then the
  cheaper Codex models while the Codex plan is not marked out (gpt-6-luna, then gpt-6.2-sol at low
  effort), then DeepSeek V4.1 Flash on the paid DeepSeek API.
- D4. Every model is private or not private. Claude and Codex models are private. Every free model and
  every DeepSeek model, the paid API included, is not private. The registry records it per model.
- D5. A repository is cleared for non-private models once, by the owner. The first time the route check
  runs in a repository with no entry, it stops and asks, and records the answer. On yes the full D3
  chain applies. On no only Claude and Codex are candidates, so work still runs but never leaves those
  two providers. Nothing is cleared by default.
- D6. The route check and the usage record are built in agent-config, with every limit a registry
  setting.
- D7. Every session and subagent writes usage records, and PANTRY reports them, split by harness, model,
  cost class and privacy.
- D8. Codex comes before the paid API in D3, because the Codex plan is already paid for.
- D9. A plan is marked out by its quota error, until the reset time the error gives, or six hours when
  it gives none.
- D10, superseded (see below). The paid API runs up to a small daily cap. Past the cap each further use asks the owner
  first. This replaces the approval gate on the OpenCode escalation for the D3 fallback only, and a
  deliberate escalation still asks.

**Superseded on 2026-11-22.** Owner decision O1 took paid DeepSeek out of the light chain, so the
last step of D3 and the whole of D10 no longer apply. The chain now ends at the Codex models, and a
paid call is an escalation that needs a recorded approval (section 12). D3 and D10 stay listed above
so the history reads straight.

**One free model, then OpenCode Go (2026-11-23).** The owner made D11 and D12 after the free chain ran out in
one go on the Mac.

- D11. OpenCode's free models share one daily message cap, so when one runs out they all do, and a
  chain of five free models was one fallback in practice. The light chain now holds a single free
  model, DeepSeek V4.1 Flash Free, then DeepSeek V4.1 Flash on the OpenCode Go plan, then the Codex
  models. Go is a fixed monthly subscription whose models share one allowance, with a five-hour, a
  weekly and a monthly limit, so the chain holds one Go model as well. Go counts as plan cost and
  not private. Its Extra Usage setting stays off, because with it on, an exhausted allowance would
  bill console credits with no approval in between. Iceman Contributor Free stays out of the chain:
  it is free only for a limited time and trains on what it is sent.
- D12. The free model stays ahead of Go (owner, 2026-11-23). Free first spends nothing until the shared
  daily cap runs out and keeps the Go allowance for after it; Go first would buy steadier service and
  readable limits from the first request at the cost of allowance spent on work the free model does
  for nothing. The order is reviewed on 2026-11-30 against a week of usage records in PANTRY, split by
  provider: how often the free cap ran out, and how much of the Go allowance was left.
- D13. The main session takes a strong Go model, not a light one (owner, 2026-11-24). D12 stays for
  light work. The conversation the owner sits in does not drop to a light model while the Go plan can
  answer, because the cost of a light model there is the reader's clarity rather than tokens. DeepSeek
  V4 Pro is the cheapest strong model on Go: 0.66 in, 1.98 out and cache at 0.022, against Kimi K3.1
  Pro and Gemini 4 Argon at 2 and 10, Qwen4 Max at 1.5 and 4.5, and Flash at 0.15 and 0.6. It therefore
  comes second in the main chain, ahead of the free model and ahead of Flash on the same plan. Sonnet
  5.5 was the first choice and is not available: the Go provider serves Haiku, and Sonnet is metered
  on the opencode provider. The shared Go allowance is the limit that matters, and V4 Pro burns it
  about four times as fast per token as Flash, so the meter is worth watching for the first week.

The same model id is now served at two costs: DeepSeek V4.1 Flash is plan cost on Go and metered on
the DeepSeek API. An escalation therefore refuses that id alone and takes it with its provider, the
usage ledger counts an id it cannot place as the costlier entry, and the registry checks id agreement
per provider.

**What the registry holds.** Every per-model entry carries a cost, which is free, plan or metered, and a
private flag. The OpenCode fallback is an ordered list named lightChain, ending in the Codex entries, plus one entry named strongWhenPlansOut for D2. A routing block holds the four numbers the
route check uses: the default cooldown in minutes, the failures in a row that demote a model for the day,
the default hours a plan stays marked out, and the daily cap in dollars. Validation fails when an entry
lacks a cost or a private flag, when a chain entry is incomplete, when two entries with one provider and id disagree,
and when a routing number is missing or not positive. A free entry keeps a null id until a run on the
Mac proves it, and validation accepts a null id only where verified is false.

**The route check.** One script, route-check.ts in agent-config, decides which model a light task
takes. It is the contract OpenCode's plugin calls before a delegation and after a model call. Claude Code
never calls it, because its subagents are pinned in their agent files and stay private.

```text
route-check pick <harness> <tier> [--cwd <dir>]
route-check fail <model> <rate-limit|quota|error> [--until <iso>]
route-check ok <model>
route-check plan out|clear <claude|codex> [--until <iso>]
route-check repo allow|deny [--cwd <dir>]
route-check paid allow [--hours <n>]
```

Pick prints one line of JSON with the model, id, provider, cost, private, effort and the reason. Exit 3
means it needs the owner, with the question on stdout: an unanswered repository, or the paid cap
reached. Exit 4 means no private model is available, which happens when a repository is denied and every
private candidate is out. Exit 2 is an unknown harness or tier. A candidate is skipped when it is not
private and the repository is not cleared, when it is cooling down, when it is demoted for the day, or
when it is a Codex entry and the Codex plan is out. A rate-limit or quota failure sets a cooldown, an
error only counts toward demotion, and a quota failure on a Codex or Claude model also marks that plan
out. The repository key is the lower-cased absolute path of the git top level, so a subfolder or a
worktree maps to its own top level.

**The usage record.** The Stop and SubagentStop hooks each run usage-ledger.sh, which appends one JSON
line to a file named for the local date under the usage state directory. The fields are the format
version, the time, the machine, the harness, the project key, the plan id, the session id, the agent
type, the model id, the provider, the cost class, the private flag, the input, cache and output token
counts, the dollar cost where the provider reports one, and how the model was picked. The token counts
are sums over the turns since that session's previous record, so nothing is counted twice. Cache reads
and writes count as cache tokens. Provider, cost and private come from the registry by exact model id,
and an unknown id records unknown and not private, so an unlisted model is never counted as private. The
wrapper always exits 0, so a ledger failure can never block a session, and files older than ninety days
are deleted on the first write of each day.

**What is proven where.** The route check and the record are tested on the Windows PC against fixture
registries. The free model ids, the OpenCode plugin, the price list for the paid API and the PANTRY views
wait for a run on the Mac, so every free entry stays unverified until then.

## 12. Escalation records and the owner's typed approval

Phase B gave every escalation a record and every paid call an approval with one source. The tool is
escalation-record.ts in agent-config, and it has three commands: request, approve and outcome.

A request writes one escalation line to the usage ledger carrying the seven fields the owner's brief
asks for: the reason, the source model and role, the destination model, the capability
justification, the approval, the resource use (estimated first, actual once known) and the outcome.
The same source, destination and reason always produce the same request id, so a repeated request
is recognizably the same one.

**Approval is given by the owner, on a terminal, and nowhere else.** The approve command appends a
line to the approvals file under the escalation state directory, and that file is the only place
approval lives. An answer in the DECISIONS inbox is not approval, and neither is a sentence in chat.
An agent has no terminal input, so the command refuses it with exit 3.

**What the approval guarantees.** The request id is a hash of the source, destination and reason,
encoded so that no field can spill into the next, so an approval given for one destination cannot be
spent on another, and a request may not name an id of its own. A model is named by its registry id
when its name is shared by entries of different costs, and a metered request states an estimated
cost above zero. A request that uses an approval records which approval it used, and every copy of
that approval is void afterwards. An approval expires 24 hours after it was given. The cap counts
reported spend plus the estimates of requests already approved.

**What holds the money.** The approvals file and the ledger are files an agent can write, so the
record guards against a careless or mistaken agent, not a determined one. Six audits in Phase B
showed that a file cannot be made forgery proof from inside the tool that reads it, and the owner
chose not to chase that. The money is held by two plain facts instead: agents never hold a provider
key, and the paid provider runs on a prepaid balance the owner tops up, which is a ceiling no agent
can raise. The approval record is the audit trail and the check against mistakes.

The exit codes are the route check's. Exit 3 means ask the owner, for an unapproved request or for
the same denial twice inside the cooldown window, and in the second case the stderr line starts with
*ask:* and names the repeated cause, which is LOOP's ask. Exit 6 means the credentials are missing,
and it is decided before any network call. The tool makes no network call at all.

## 13. The supervisor and its limits

The supervisor is code, not an agent (decision M1). It is supervisor.ts in agent-config, and it does
two jobs. The decide command returns a role's tier, the model the route check gives for it, and
whether the piece should be delegated. The admit-spawn command counts the agents a task has live and
refuses past the owner's limits (O4). A task is one session, so each session, and each project running
its own sessions, has its own count:

| Limit | Value |
|---|---|
| Agents live at once, per session | 4 |
| Delegation depth | 2 |
| Retries | 2 |

The owner settled O4 on 2026-11-23 as four spawns per task at a time. The registry keeps two numbers for
it, maxConcurrency and maxSpawnsPerTask, both 4, and the live cap is the smaller of the two; nothing
counts spawns over a session's lifetime. The values are read from the registry's supervisor block, and
the same numbers are the fallback when the block is absent. A limit refusal exits 3 with a reason that names the limit. An agent that has not
been heard from in thirty minutes stops counting as live.

It defers to the human lane and never overrides it. A path in the lane is held for the owner, and the
lane's own answer is final. Where it is wired is in [HOOKS](HOOKS.md) section 4, in the spawn
envelope. What a session owes before it delegates at all stays in [SESSION-LOOP §6](SESSION-LOOP.md).

## 14. Context metadata and the budget

Each model entry in the registry may carry a context block: the advertised window, the usable
window, the output reserve (maxOut), the overhead, the method it was measured by (transcript,
provider usage or estimate) and a confidence (measured, estimated or unverified). A model nobody has
calibrated is marked unverified and gets no thresholds of its own (decision M3).

context-budget.ts answers one question, whether the next task fits, and its answer is advice. It
always exits 0, never blocks, and fails open. The context trigger passes its line on to the model.
The decision is one of continue, narrow, delegate, compact, checkpoint, fresh-session, transfer or
stop-handoff.

The estimate is the byte size of the plan's touched files divided by four, plus a fixed allowance of
8,000 tokens for tool output, plus the model's output reserve. A path that does not resolve counts as
zero and lowers the confidence to estimated. The thresholds are the measured CONTEXT_WARN and
CONTEXT_STOP, which stay authoritative. A model without measured thresholds gets 70 and 85 percent of
its usable window, marked unverified, and that is the only place those generic percentages are
allowed. When to hand off on context pressure is [SESSION-LOOP §5](SESSION-LOOP.md); this section
only says how the number is reached.

## 15. Continuation and recovery checkpoints

A recovery checkpoint is not a handoff. A clean, task-complete handoff keeps the form the handoff
command gives it. A recovery checkpoint is the emergency record for context pressure, a provider
failure or an interrupted environment, and it lives at artifacts/handoffs/ under the date, the plan
id and the word recovery. The two never blur.

checkpoint.ts writes, validates, lists the lineage of, and supersedes these files. A checkpoint
records the dirty tree and the pending operations. One marked complete refuses any gate result but
green, so it can never claim a task finished on a red suite. A predecessor is superseded only after
its successor has written *recovered: verified* into the same file, and the successor cannot be the
session that wrote it. Refusals exit 5.

On Claude Code, continuation reuses the model guard's restart path (section 10). The successor's
prompt carries the envelope and the checkpoint, never an instruction to pick the next backlog item.
The archive of the old session is offered only after the lineage is verified, and archiving still
needs the owner's click. **Continuation is assisted, not automatic.**

## 16. Model Scout

model-scout.ts researches models and recommends them. It has three commands: inventory reads the
registry, evaluate scores trial results a person or the Mac run recorded, and recommend turns the
scores into requests. It runs by hand only (O5), and it makes no network calls.

It never writes the registry. The recommend command hashes the registry before and after, and a
changed hash is a failure with exit 5. Every recommendation says the model is not added to the light
chain. A model from a provider the registry does not already carry becomes a request for the owner
to approve the provider first. Evaluations against free models run on the Mac.

## 17. The runtime brief

The session checklist keeps a healthy start to one row, *Model Intelligence Layer verified*. When the
layer drifts, or when the checklist is run with --brief, it adds the runtime brief: the policy line
(paid models are escalation only, the supervisor limits and the cooldown), which models are cooling
down, how many registry entries sit at each context confidence, the level each capability has
reached, and the preferred model beside the active one. The checklist itself is owned by
[SESSION-LOOP](SESSION-LOOP.md); this is only what the layer adds to it.

## 18. Where each record lives

Every new record has one home (decision M2), so a reader looking for one never has to search two
places.

| Record | Home |
|---|---|
| Fallback transitions and escalation lines | The usage ledger, as transition and escalation lines in format version 2. A version 1 reader skips them. |
| Approvals | The approvals file under the escalation state directory, written only by the owner's typed approve. |
| Side-effect keys | The effects file under the route check's state directory. A retry against a key already done is refused with exit 5. |
| Supervisor counts | One file per task under the supervisor's state directory. |
| Worktree claims | The worktrees file under the state directory ([HOOKS](HOOKS.md) section 4). |
| Recovery checkpoints | artifacts/handoffs/, one file per interrupted task. |
| Scout evidence and requests | artifacts/scout/, with requests in its inbox until the DECISIONS inbox renders them. |
| Run reports | artifacts/runs/, as [LOOP](LOOP.md) names them. run-report.ts writes the skeleton and pulls the model transitions from the ledger. |

## 19. What is on hold and what is not tested

- **DeepSeek Harness is on hold** (owner, 2026-11-23). The verifier reports every DSH row as
  UNSUPPORTED with the reason *on hold*, so none of them is a claim about a working harness.
- **OpenCode main-session failover passed on 2026-11-24.** A real quota transition happened on its own:
  gpt-6.2-sol stopped at 05:15 UTC, the free model had already been rate-limited at 05:09, and the
  session moved down the chain to the Go plan. The receipt is in the mil-probes file and the transition
  is in the usage ledger.
- **The Go plan carries no Sonnet, so its strong lane is DeepSeek V4 Pro.** The registry briefly named
  opencode-go/claude-sonnet-5-5 on 2026-11-24. The provider serves Haiku 5.5 and no Sonnet, and Sonnet
  is metered on the opencode provider, so that lane could not run. It now names V4 Pro, which the Go
  plan does carry. A spawned session answered on it on 2026-11-24, so the entry is verified for
  serving. Its quality on real work is unmeasured, and that is the next thing the ledger can show.
- **Reviews have a second seat.** The reviewer agent is pinned to gpt-6.2-sol, so a review stops when the
  Codex plan does. The OpenCode config carries reviewer-go, pinned to Gemini 4 Argon on the Go plan at
  medium effort. Family independence is the reason, not price: the main session writes on DeepSeek, so the
  reviewer must not, and Gemini is the medium-effort entry in that band. The limit is honest: a review is
  asked for by agent name, so nothing silently routes to it.

## Verification

- [ ] The verifier for the harness run (the command is in MODELS-VERIFY step 1), no line FAIL.
- [ ] The checklist row reads *ok Model Intelligence Layer verified*.
- [ ] A new pin was added to the registry first, and the pin collector reports it as matching.
- [ ] The MODELS-VERIFY run report for the harness exists and is dated.
