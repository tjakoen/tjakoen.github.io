---
title: SESSION-LOOP.md — the working loop, memory, and handoff
summary: How a session with an AI runs start to finish - the loop it repeats, what it writes down, and how it hands off.
---

# SESSION-LOOP.md — the working loop, memory, and handoff

How a session with an AI actually runs, start to finish: how it orients, the loop it repeats,
what it writes down so the next session inherits it, and how it hands off. Portable — drop it into
any repo alongside [`AI-DEVELOPMENT.md`](AI-DEVELOPMENT.md).

> Split of responsibility: **[`AI-DEVELOPMENT.md`](AI-DEVELOPMENT.md) owns the standards** — the
> working relationship, the definition of done, the conventions every change is held to. **This file
> owns the mechanics** — the session lifecycle, the memory format, the handoff. When they overlap,
> AI-DEVELOPMENT wins on *what good work is*; this file wins on *how a session moves through it*.
> Don't restate the standards here, point at them.

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
| About to say "done" | Run the green gate (AI-DEVELOPMENT §8). Red gate = stop-the-line. |
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
(§4). A handoff that points at uncommitted, untested work is a trap.

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

*Living document. When the loop changes, update it — the same rule it asks of everything else.*
