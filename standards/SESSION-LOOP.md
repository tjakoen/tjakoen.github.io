---
title: SESSION-LOOP.md — the working loop, memory, and handoff
summary: How a session with an AI runs start to finish - the loop it repeats, what it writes down, and how it hands off.
when: >
  Read this BEFORE orienting in a repo you have not worked today, and again BEFORE writing an agent-memory
  entry, a handoff prompt, or a plan file. It owns the inside of one session: how to orient cold, the
  loop to repeat, the recurring chores, what belongs in memory versus a committed doc, and how to end
  so the next session starts oriented. LOOP.md is the sibling that owns the gates across sessions and
  repos. Don't skip because you already have the context - context is the exact thing the next session
  will not have.
---

# The working loop, memory, and handoff

How a session with an AI actually runs, start to finish: how it orients, the loop it repeats,
what it writes down so the next session inherits it, and how it hands off. Portable — drop it into
any repo alongside [`AI-DEVELOPMENT.md`](AI-DEVELOPMENT.md).

> Split of responsibility: **[`AI-DEVELOPMENT.md`](AI-DEVELOPMENT.md) owns the standards** — the
> working relationship, the definition of done, the conventions every change is held to. **This file
> owns the mechanics** — the session lifecycle, the memory format, the handoff. When they overlap,
> AI-DEVELOPMENT wins on *what good work is*; this file wins on *how a session moves through it*.
> Don't restate the standards here, point at them.
>
> One floor up: **[`LOOP.md`](LOOP.md) owns the system *around* the sessions** — the work-triggered
> heartbeat, the shared kit shape, and the accountability contract that spans a whole estate of repos.
> This file owns one session; LOOP owns how the sessions add up. The session-start doctor step (§1) and
> the recurring chores (§3) are this file's end of LOOP's heartbeat.

---

## 1. Session start (orient before you touch anything)

1. **Read the room.** Load this repo's `CLAUDE.md`/`AGENTS.md`, then only the standards the task
   actually needs (the [`standards/README.md`](README.md) index exists so you fetch the one doc, not
   all of them).
2. **Recall, then verify.** Read any prior memory/decision record. Treat it as a *cache, not truth* —
   if a recalled fact names a file, flag, or function, confirm it still exists before you rely on it.
   Code wins over any memory (→ AI-DEVELOPMENT §1).
3. **Orient from the graph, not a cold read.** If the repo has a knowledge-graph index (graphify;
   AI-DEVELOPMENT §4), query it to place the work before grepping raw files.
4. **Restate the goal in one line.** What "done" means for *this* task, and the non-negotiables you
   were handed. If that line is fuzzy and the choice is genuinely the human's, ask once — with a
   recommendation, not a survey.

---

## 2. The loop (repeat until done)

The problem→solution loop lives in **AI-DEVELOPMENT §6**; the standing gate is **§3/§8**. The
session mechanics around them:

1. **Act when the info is there.** Don't re-ask what's answered or re-litigate a settled call.
2. **Report at load-bearing moments** — a plan before a big move, an honest status after (what
   passed, what was skipped, what's still red). No "done!" when it isn't.
3. **Hit the gate before you call anything done** — typecheck + tests + docs synced + diff read.
   The full checklist is AI-DEVELOPMENT §8; run it, don't paraphrase it.
4. **The gate is also the commit trigger.** Once it's green, commit (see §3 below). Don't leave
   finished, verified work sitting uncommitted.

---

## 3. Recurring chores (the things done every time)

These fire on a trigger, not on being asked. Standardize them so no session forgets:

| Trigger | Do, every time |
|---|---|
| Behavior changed | Add/adjust the test at the right tier *as you build*, not after. |
| Something that renders changed | Leave a CRUMB dev tour: one step per changed surface, what moved, and a verify line the reviewer can run. The rule and its limits are LOOP §4a. No rendered surface, no tour. |
| About to say "done" | Run the green gate (AI-DEVELOPMENT §8). Red gate = stop-the-line. Where the repo runs a plans board, `proof verify` reads the diff against the plan's `touches`. |
| Gate green on a real change | Commit — `type: imperative summary`, body only when the *why* isn't obvious. No AI-attribution trailers. Branch off main for anything non-trivial. |
| A non-obvious decision got made | Write a memory (§4). |
| A repeatable task finished | Emit a handoff (§5). |

**Commit/push and anything outward-facing stay human-gated.** Commit only when the gate is green
*and* committing is in scope; push only when asked.

---

## 4. Self-learning: memory (so the next session doesn't relitigate)

The point of memory is that **a lesson is learned once**. When a real decision gets made, or
something non-obvious gets discovered, write it down; the next session (human or AI) starts where
this one ended instead of rediscovering it.

**What earns a memory:** a decision and its *why*; a non-obvious constraint the code doesn't show; a
recurring pitfall and its guard; a pointer to an external resource. **What doesn't:** anything the
code, git history, or `CLAUDE.md` already records; anything that only matters for this one
conversation.

**Where it lives** depends on durability:
- **Durable, repo-worthy rule** (a convention everyone must follow) → it belongs *in the repo*:
  `CLAUDE.md`, a `CONVENTIONS.md`, or a `docs/DECISIONS.md`. Committed, reviewed, permanent.
- **Session-to-session context** (in-flight state, a working assumption, a "trust the code over
  this") → the agent's own memory store if it has one (Claude Code keeps per-project memory outside
  the repo). Durable across sessions, but not code.

**The format** (one fact per entry, so recall stays scoped):

```markdown
---
name: <short-kebab-case-slug>
description: <one line — this is what a future session reads to decide if the entry is relevant>
type: decision | constraint | pitfall | reference
---
<The fact. For a decision or pitfall, follow with **Why:** and **How to apply:**.
Link related entries with [[their-slug]] so the web is navigable.>
```

**Keep an index.** One line per entry — `- [slug](file) — one-line hook` — in a single index file
(`MEMORY.md` for the agent store; the doc's own table if it's in-repo). The index is what gets
scanned every session; the entries are fetched only when the hook matches. Same "load only what you
need" move as the standards index itself.

**Maintenance:** before writing, check for an entry that already covers it and update *that* rather
than forking a second copy. When a memory turns out wrong, fix or delete it — a stale memory that
contradicts the code is worse than none. Convert relative dates to absolute ("today" rots).

---

## 5. Handoff (end a session so the next one starts cold-but-oriented)

When a bounded task finishes — a feature landed, the gate green, the commit made — don't just stop.
**Make the state durable, then emit a compact handoff prompt** the human can paste into a fresh
session (or hand to a parallel one). This is the "send me a prompt to hand off after a specific task
finishes" standard.

A handoff is worth emitting when: a self-contained task completed, or the session is long enough that
a fresh context would be cheaper and clearer than continuing (long threads drift and cost more per
turn), or the *next* step is genuinely a different job (e.g. "code landed → now write the note").

**Before emitting, make state durable:** gate green, work committed, decisions written to memory
(§4). A handoff that points at uncommitted, untested work is a trap. Treat this as a precondition
rather than a reminder, which means it is checked and not recited: the same turn-end hook that
reports the window is filling reports alongside it whether the tree is clean, whether anything is
unpushed, and whether the gate is green. A trigger that tells a session to make its state durable
without naming what is currently undurable is giving advice, and advice is what gets nodded at.

**The handoff prompt contains, tightly:**
- **Where things stand** — what just landed, what's committed, gate status.
- **The next task** — one clear goal, stated as intent (the *why*), not just a task.
- **The map** — the 2–4 files/docs the next session should read first (and *only* those, so it
  doesn't cold-read the repo).
- **The traps** — anything non-obvious that will bite: a constraint, a flaky step, a decision already
  made so it isn't reopened.
- **The right model for the next job** — see §6.

If the harness has a handoff generator (Claude Code exposes a `/handoff` skill), use it; the shape
above is what it should produce. If not, write the prompt by hand to that shape.

**The "long enough" half is measurable, so measure it rather than feeling it.** Claude Code writes a
`usage` block on every assistant turn of its transcript, and the input side of the newest one is the
context the session is actually carrying. That makes the second trigger above a number, not a hunch,
and it belongs on the turn-end hook with the rest of the mechanical tier (LOOP §2). Two things to get
right, because both have already been got wrong here. Count the cached reads: once the cache is warm
the raw `input_tokens` field is single digits, so a reader that trusts it reports a full session as
empty. And measure the window before setting a line in it: the remembered figure for a context limit
is usually an older model's, and a threshold set there fires halfway through an ordinary session.

The trigger is built rather than proposed: a reader that tails the transcript, called from the
turn-end hook in a quiet mode that prints nothing until the reading crosses the warn line. It belongs
at machine level rather than in any one repo, and so does the durable-state check beside it, because
neither is about the repo it runs in: one reads a transcript, the other reads git. Wired once in the
agent config, every repo on the machine inherits both, and the config being a repo of its own is what
carries the trigger to a second device. A per-repo copy is the version that covers one repo today and
becomes three drifting copies later.

The defaults are the measurement and not a memory, and the two lines deliberately answer different
questions. The stop line is a fact about the window: 900k of the 1M this model carries, past which
continuing risks losing work. The warn line is a judgment about productivity, and it sits far lower,
at 200k. A thread longer than that starts re-litigating decisions it already made, and every turn
re-reads a prefix that only grows, so handing off there buys sharpness rather than survival. The gap
between the two is the point. A session may sail past the first line for good reasons, and one that
did exactly that produced this paragraph; no session should sail past the second.

Both are overridable per run, which is also the only way to watch the trigger fire without waiting to
fill a window, so a repo adopting it can confirm it works on the day it lands instead of hoping.
Re-measure before trusting either number anywhere else, because they describe one model on one
machine, and check the window rather than recalling it: the remembered figure for a context limit is
usually an older model's, and both of these numbers mean something different against a smaller one.

One exclusion is worth stating out loud, since a machine-level hook runs everywhere by definition:
any path that is off limits stays off limits, and a check that only prints is still contact. The
guard excludes it by prefix before it reads anything at all, including git.

Whatever the trigger, **the handoff is emitted by default, and opening the next session is a lane
call rather than a hard stop.** Run it through LOOP §4b: a sibling session is reversible (close it)
and inward-facing (it writes nothing anyone else can see), so it lands in the gated lane, not the
human one. Gated means a person is in the loop for the decision, not that the decision is forbidden.
Emit the brief; open the next session when asked, or when the human is present to see it happen.

There is a mechanical limit worth knowing before designing around it, because it is easy to plan a
trigger that cannot exist. **The thing that detects the moment and the thing that can act on it are
not the same process.** The trigger is a shell hook, and spawning a session is a tool the model
holds, so the hook cannot reach it: the honest shape is the hook printing and the model offering.
Some harnesses do expose spawning to the model. This estate runs on Nimbalyst, whose `spawn_session`
opens the next session as a sibling in the same workstream, inheriting the working directory and the
model, which is how a handoff here goes from a brief to an open tab without a copy and paste. On a
harness without that, the brief is the deliverable and the human opens the tab, which is the same
loop with one more step and no less rigour.

---

## 6. Model economy (be smart about which brain runs)

Bigger models cost more and are slower; smaller ones are cheaper and faster. Match the model to the
*kind* of thinking the task needs, not to every task uniformly.

**The default posture: plan and orchestrate in Opus, execute and delegate to Sonnet subagents wherever possible.** Reason with
the top tier while the shape is still uncertain (planning, architecture, hard debugging); once the
plan is approved and the rest is grind, drop to the mid tier; push wide reads out to a small-tier
subagent. Stay on the big model only for the parts that are actually still *thinking*. The main
thread can't silently swap models mid-task, so this is partly a human lever — the standard is that
**the AI names when a switch would pay off** and the human flips it (or `/model opusplan` automates
the plan→execute half).

**Rule of thumb:**

| Task shape | Model | Why |
|---|---|---|
| Planning, architecture, ambiguous debugging, "why is this wrong" | **the strongest** (Opus / the top tier) | The reasoning is the value; a wrong plan is expensive downstream. |
| Executing an already-approved plan, mechanical edits, wiring, tests | **the mid tier** (Sonnet) | The thinking is done; you're paying for throughput, not insight. |
| Wide reads — "where is X used", "map this dir", locating code | **the small tier** (Haiku), via a subagent | Search is cheap cognition; don't burn the big model reading files. |

**How to actually get the savings:**
- **Plan-then-execute auto-switch.** If the harness offers a hybrid mode that reasons big in planning
  and drops to a mid model for execution (Claude Code's `/model opusplan`), prefer it as the default —
  it captures most of the win with zero babysitting.
- **Pin subagents to small models.** A read-only locator or reviewer subagent should run on the small
  tier; the main thread stays on the big one and eats a compressed result. Free savings, fully
  automatic once configured.
- **Ask for the switch when the phase turns.** When a session crosses from "figuring out" into "grind
  it out" (or the reverse), the AI says so: *"plan's approved and the rest is mechanical — consider
  `/model sonnet`"*. One sentence, real money.

Carry the model recommendation into the handoff (§5): the next task's shape usually implies its tier.

---

## 7. Delegation (fan out, don't grind)

§6 asks which brain runs. This asks how many. The default is wrong in one direction far more often
than the other: a session grinds through work serially that it could have handed to four subagents,
because delegating feels like overhead right up until the point it obviously was not.

**Fan out when the work is wide and the answer is small.** Reading twelve files to answer one
question, auditing four repos against one rubric, checking a convention across every call site,
drafting three independent approaches to compare. The main thread eats a compressed result instead of
the file dumps, which is the same win as §6 from a different angle.

**Stay inline when the work is deep and stateful.** A single tricky fix, anything where each step
depends on what the last one found, anything touching files another agent is already in. Delegation
buys parallelism, and parallelism costs coherence.

**What a subagent prompt owes** (a vague one comes back vague, and the round trip is wasted):

- **A bounded scope, named as paths.** Which files are yours, which explicitly are not. Overlapping
  scopes produce duplicate work and findings that have to be merged by hand.
- **Read-only stated outright when it is read-only.** Parallel agents writing to one tree is how a
  fan-out becomes a merge conflict.
- **The full rubric or question, not a slice.** An agent asked only about types reports only types,
  including in the file where the real problem was something else.
- **The output format, fixed.** Same columns from every agent merges for free. Prose from six agents
  gets re-read and re-typed by the main thread, which is the cost the fan-out was supposed to avoid.
- **Evidence rules.** Cite `file:line`, no speculation. Without that line, a subagent will happily
  return something plausible, and plausible is the failure mode that survives review.
- **The context it cannot see.** It starts cold. Name the repo's `CLAUDE.md`, the constraint, the
  decision already made, or it will rediscover them badly.

**Merging is the main thread's job**, and it is real work: de-duplicate across scopes, rank, drop
whatever came back without evidence, and reconcile two agents that disagree by reading the code
yourself. A subagent result is a claim, held to the same bar as any other (AI-DEVELOPMENT §1).

**You will delegate more when you can see it happening.** A fan-out that reports only at the end is
trusted less than one whose agents are visible while they run, and less trust means smaller
delegations than the work deserves. That is a property of the harness rather than the standard, so
the standard states the requirement and not the product: prefer a setup that shows subagents and
parallel sessions as they work, and that groups related sessions rather than leaving one flat list to
scan. This estate gets it from Nimbalyst, which puts sibling sessions in a workstream with their
tabs and their edited files together. Where a harness does not offer it, ask for narrower fan-outs
and a fixed output format, since the format is what buys back the confidence the view would have.

The audit is the worked example of all of this: [`AUDIT-STANDARD.md`](AUDIT-STANDARD.md) §4.

---

*Living document. When the loop changes, update it — the same rule it asks of everything else.*
