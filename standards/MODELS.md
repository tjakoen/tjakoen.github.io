---
title: MODELS — which model plays which role, on every harness
summary: The portable model policy of the loop. Six roles on three tiers, a main session on the execution tier, escalation by delegation rather than by switching models, the effort ceiling, one registry as the only home of model identifiers, five conformance levels, and how a device repairs its own drift.
when: >
  Read this BEFORE pinning a model in an agent file, a settings file or a Codex config, before adding
  an agent, before reaching for a model switch mid-session, and before claiming a harness runs the
  loop's model policy. It owns which role sits on which tier and how the strong tier is reached; the
  registry in claude-config owns the identifiers, and SESSION-LOOP section 6 owns the routing advice.
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
   it: the light chain, its cooldowns, and the strong tier when both plans are out.
3. **Capability escalation.** Moving a piece of work up a tier because it needs more judgment.
   Defined here only in its delegation form (section 3). Paid escalation to a model outside the
   tiers is recorded in the registry as approval-required and unwired, and stays that way until a
   later phase wires it with an approval step.

## 5. Effort

No pin sets reasoning effort to high. The strong tier earns its place through the model, and an
execution-tier model at high effort is a strong-tier bill without a strong-tier choice behind it. A
harness that exposes effort gets a setting per tier, and the registry records which. Claude Code pins
it too: the registry holds an effort beside each Claude tier, and the agent files carry the same value,
so it is a pin the verifier checks like the model. Codex records its own settings in the same place.

A model the registry lists as forbidden as a default never appears in a tier. It may appear only as a
paid escalation entry, gated as section 4 says.

## 6. The registry is the only home of identifiers

The concrete table lives in claude-config, in its shared model-roles file: the tiers, the roles, the
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
is not pinned and its pin checks report unsupported. OpenCode is not installed on any machine, so it
is unsupported, with its preferred models kept in the registry as notes. Handoffs between them follow
[SESSION-LOOP §5](SESSION-LOOP.md).

## 10. The model guard

Every main session runs the registry's main tier, and nothing in a menu or a spawner's defaults changes
that. A session started by another session inherits that session's model, and the owner can pick any
model from the picker, so the rule needed something that enforces it. The model guard is that: one
script in claude-config, shared/tools/model-guard.sh, wired to SessionStart, UserPromptSubmit, PreToolUse
and Stop. It was built and passed live acceptance on 2026-11-22, after six runs, and the run report in
claude-config holds the evidence. The desktop app's SessionStart carries no model, so the guard reads
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
| strong | opus, low effort | gpt-6.2-sol, medium | DeepSeek V4.1 Flash | the Codex model, gpt-6.2-sol, medium | Claude and Codex private; DeepSeek not private |
| execution (main) | sonnet, medium effort | gpt-6.2-sol, low | DeepSeek V4.1 Flash | the free chain first, then the Codex model, gpt-6.2-sol, low | free models and DeepSeek not private; Claude and Codex private |
| cheapest | haiku, low effort | gpt-6-luna, medium | DeepSeek V4.1 Flash | the free chain first, then the Codex model, gpt-6-luna, medium | free models and DeepSeek not private; Claude and Codex private |
| escalation, on approval | none, delegate to strong | gpt-6.2-astra, low | DeepSeek V4.1 | the paid DeepSeek API, while credits remain | Codex private; DeepSeek, paid API included, not private |

DeepSeek Harness runs Flash on every tier and reaches the full DeepSeek V4.1 only as a rare escalation
the owner approves. OpenCode borrows the Codex models while a Codex plan has usage left. Light work on OpenCode tries the free chain first (DeepSeek V4.1 Flash Free, MiMo V2.6 Flash Free,
LongCat 2.5 Free, Nemotron 3.5 Lightning Free, Flint 40B Free), then the cheaper Codex models while the
Codex plan has usage left, then DeepSeek V4.1 Flash on the paid API. Section 11 holds that order and the
privacy rules behind it. The chain is recorded in the registry and not yet wired.

Every row outside Claude Code is marked unverified in the registry. Codex, DeepSeek Harness and OpenCode
are not installed on the machine where the guard was proven, and OpenCode is not installed anywhere yet.
The guard is proven on the Claude Code desktop app only.

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
- D3. The fallback order for light work on OpenCode is the free chain in registry order, then the
  cheaper Codex models while the Codex plan is not marked out (gpt-6-luna, then gpt-6.2-sol at low
  effort), then DeepSeek V4.1 Flash on the paid DeepSeek API.
- D4. Every model is private or not private. Claude and Codex models are private. Every free model and
  every DeepSeek model, the paid API included, is not private. The registry records it per model.
- D5. A repository is cleared for non-private models once, by the owner. The first time the route check
  runs in a repository with no entry, it stops and asks, and records the answer. On yes the full D3
  chain applies. On no only Claude and Codex are candidates, so work still runs but never leaves those
  two providers. Nothing is cleared by default.
- D6. The route check and the usage record are built in claude-config, with every limit a registry
  setting.
- D7. Every session and subagent writes usage records, and PANTRY reports them, split by harness, model,
  cost class and privacy.
- D8. Codex comes before the paid API in D3, because the Codex plan is already paid for.
- D9. A plan is marked out by its quota error, until the reset time the error gives, or six hours when
  it gives none.
- D10. The paid API runs up to a daily cap of five dollars. Past the cap each further use asks the owner
  first. This replaces the approval gate on the OpenCode escalation for the D3 fallback only, and a
  deliberate escalation still asks.

**What the registry holds.** Every per-model entry carries a cost, which is free, plan or metered, and a
private flag. The OpenCode fallback is an ordered list named lightChain, ending in the Codex entries and
the paid API, plus one entry named strongWhenPlansOut for D2. A routing block holds the four numbers the
route check uses: the default cooldown in minutes, the failures in a row that demote a model for the day,
the default hours a plan stays marked out, and the daily cap in dollars. Validation fails when an entry
lacks a cost or a private flag, when a chain entry is incomplete, when two entries with one id disagree,
and when a routing number is missing or not positive. A free entry keeps a null id until a run on the
Mac proves it, and validation accepts a null id only where verified is false.

**The route check.** One script, route-check.ts in claude-config, decides which model a light task
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

## Verification

- [ ] The verifier for the harness run (the command is in MODELS-VERIFY step 1), no line FAIL.
- [ ] The checklist row reads *ok Model Intelligence Layer verified*.
- [ ] A new pin was added to the registry first, and the pin collector reports it as matching.
- [ ] The MODELS-VERIFY run report for the harness exists and is dated.
