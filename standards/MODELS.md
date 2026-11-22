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
2. **Operational fallback.** What runs when the preferred model is unavailable. Not defined yet; a
   later phase.
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

| Tier | Claude Code | Codex |
|---|---|---|
| strong | opus, low effort | gpt-6.2-sol, medium |
| execution (main) | sonnet, medium effort | gpt-6.2-sol, low |
| cheapest | haiku, low effort | gpt-6-luna, medium |

DeepSeek Harness and OpenCode are not pinned, so the guard reports no equivalent for them. The Codex
rows and its restart flags are marked unverified in the registry, because Codex is not installed on the
machine where the guard was proven. The guard is proven on the Claude Code desktop app only.

## Verification

- [ ] The verifier for the harness run (the command is in MODELS-VERIFY step 1), no line FAIL.
- [ ] The checklist row reads *ok Model Intelligence Layer verified*.
- [ ] A new pin was added to the registry first, and the pin collector reports it as matching.
- [ ] The MODELS-VERIFY run report for the harness exists and is dated.
