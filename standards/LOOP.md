---
title: LOOP.md — one AI workflow across every repo
summary: The system around the sessions - how every repo is worked the same way, the heartbeat that makes skipped chores visible, and the contract that keeps an unattended run honest.
skill: loop-standard
when: >
  Read this at session start before touching anything, and again BEFORE calling work done,
  committing, opening a PR, writing a handoff, or ending a session. Covers verify-by-second-pass, the
  run evidence a session owes, and uncommitted or unpushed work piling up across sessions. Don't skip
  because you wrote it and checked it yourself - that is one pass, not two - and don't rerun a
  failing gate hoping it is flaky.
---

# One AI workflow across every repo

The standard for how *every* project is operated with an AI, so any repo of mine runs the same way:
the same session shape, the same recurring chores, the same evidence left behind. One person can run a
dozen repos only if the twelfth one behaves exactly like the first. This file is that "exactly like."

> Split of responsibility: **[`SESSION-LOOP.md`](SESSION-LOOP.md) owns one session** — how a single
> run orients, loops, remembers, and hands off. **This file owns the system around the sessions** — the
> heartbeat that spans them, the kit shape they all share, the accountability contract that holds when
> nobody is watching. When they overlap, SESSION-LOOP wins on *how a session moves*; this file wins on
> *how the sessions add up to a governed estate*. It sits one floor above SESSION-LOOP and points down
> at [`AI-DEVELOPMENT.md`](AI-DEVELOPMENT.md) (the standards) and
> [`AI-REPO-STANDARD.md`](AI-REPO-STANDARD.md) (the repo kit) for the detail. Don't restate them here,
> point at them.

**The architecture in one line:** the agent *does* (AI sessions, human-run), the standard *governs*
(this folder), PANTRY *shows and checks* (the board, retrieval, the doctor), and the heartbeat fires on
push and at session start — no cron, no scheduled agents. The loop is work-triggered: the standards hold
*as* the work happens, not because a robot runs at night.

---

## 1. The primitives (Osmani's five, mapped to this stack)

The loop is built from five reusable primitives (see *Why a loop at all* below for the source). Four of
them map cleanly onto what this estate already runs; the fifth is adapted on purpose.

| Primitive | What it is | Where it lives here |
|---|---|---|
| **Skills** | Reusable instructions the agent loads on demand | The standards set + the per-repo `CLAUDE.md` kit ([`AI-REPO-STANDARD.md`](AI-REPO-STANDARD.md)). Load the one the task needs, not all six. |
| **Persistent state** | Memory that survives a session | Memory discipline + the PROOF board (SESSION-LOOP §4), and CRUMB dev tours as the run evidence a rendered change leaves behind (§4a). Durable facts get promoted to committed docs; scratch stays in the agent store. |
| **Sub-agents** | Delegate scoped work to a cheaper brain | The model economy (SESSION-LOOP §6): plan in the top tier, execute in the mid tier, push wide reads to a small-tier subagent. |
| **Worktrees** | Isolated checkouts so parallel work doesn't collide | Git worktrees for parallel sessions (§2). One branch, one worktree, one run — no two agents editing the same tree. |
| **Connectors** | Tools the agent reaches out through | grain-mcp + PANTRY retrieval. Built, and standardized here rather than left per-repo. |

The fifth primitive is **automations** — a scheduled agent that runs on a timer. **We consciously do not
adopt it** (decided 2026-07-26). No cron, no Routines, no nightly agent. The reasoning is in §2: the
heartbeat is work-triggered instead, because a check that fires *when you are already working* is a check
you will act on, and a check that fires at 3am is a report nobody reads. If the estate ever outgrows
in-session cadence, scheduled automations are the researched fallback — revisit then, not before.

---

## 2. The heartbeat (work-triggered, two tiers)

The chores that get skipped are the boring recurring ones: the e2e suite, the lint pass, the audit that's
three weeks overdue. A heartbeat makes skipping *visible*. Not by running a robot at night — by making
every push and every session *show what's due*. Two tiers.

**Tier 1 — mechanical (no model, fires on a machine trigger).**

| Trigger | What runs | On red |
|---|---|---|
| Push | The doctor + typecheck + tests + e2e + lint (CI, where the repo is on GitHub). | CI fails the push visibly. Nonzero exit, no merge. |
| Session start | The doctor, as the first orientation step (SESSION-LOOP §1 grows this rule). | Its findings land in `plans/` triage — the session sees them before touching code. |
| Turn end | `proof verify` over the diff, and a nudge for the dev tour §4a asks of a rendered change. | The run does not get to say "done" yet. Both are cheap, so this fires often and stays quiet when there is nothing to say. |

The mechanical tier never needs a model. It is grep, exit codes, and file-age math. Its whole job is to
*surface*: kit compliance, drift, and staleness flags (audit overdue, graphify stale, e2e suite missing).
This is what PANTRY's `doctor` command is for (P2).

**Tier 2 — cognitive (a normal working session, human-run).**

A session picks up what the doctor flagged. When a staleness flag says the audit is due, it runs
[`AUDIT.md`](AI-REPO-STANDARD.md) in-session, drafts fixes on a branch, and stops at the merge — the human
gates it. The cognitive tier is where judgment lives; it always leaves evidence (board findings, a branch,
a run report). It does not land anything.

**Why work-triggered and not scheduled.** A scheduled agent that finds a problem at 3am has nobody to hand
it to; its output is a notification that competes with every other notification. A check that fires at
session start hands its finding to the one context that is *already about to change the code*. Skipping
stays impossible not because something runs unattended, but because the due work is in front of whoever is
working. Cheaper, honest, and no unattended agent making changes nobody asked for.

**Worktree isolation.** Parallel sessions get parallel worktrees — one branch each, isolated checkouts, no
two agents mutating the same tree. This is the `worktrees` primitive doing real work: it is what makes
"run a couple of these at once" safe instead of a race.

**The verify rule (no grading your own homework).** A change is verified by a session or agent that *did
not write it*. The author's own "looks right" does not count as verification — a second pass walks the run
report against the diff before human review. This is the one rule that keeps an autonomous loop from
confidently shipping its own mistakes.

The dev tour in §4a does **not** satisfy this rule and must never be sold as though it does. The agent that
wrote the change writes the tour, so a tour is still the first pass wearing better clothes. What it changes
is the cost of the second: the reviewing session walks named surfaces instead of cold-reading a patch, and
the human walks the live page instead of trusting a screenshot. Cheaper to verify is not the same as
verified.

---

## 3. The thin CLAUDE.md kit shape

Every repo carries the same shape, and the shape is deliberately thin. The `CLAUDE.md` holds the
irreducible cold-start minimum; everything else is a pantry-mounted directory the agent fetches only when
the task needs it. (The standard owns this shape; the P4 rollout applies it to `CLAUDE.starter.md`.)

**In `CLAUDE.md` (the front door, nothing more):**

- **What this is** — one paragraph, so a cold agent knows where it landed.
- **Commands** — how to build, test, run. The two or three that matter.
- **The five non-negotiables** — the rules a change is held to, stated flat.
- **"`bunx pantry` for the rest"** — the one pointer that mounts the depth (the board, the docs, the
  plans, the decisions) on demand.

**Everything else lives in the pantry-mounted dirs**, not the front door: `docs/`, `plans/`,
`decisions/`, `artifacts/`. A cold read of `CLAUDE.md` should take under a minute; the depth is one command
away when it is actually needed. A `CLAUDE.md` that has grown into a config dump is a bug — it means
content that belongs in a mounted dir leaked into the front door.

**Standards are referenced by URL, never forked into the repo.** Every repo points at
<https://tjakoen.github.io/standards>; none carries its own copy. Two copies drift, and then both are
suspect. (This is the reference-don't-fork rule from the standards index, made a kit requirement.)

**Memory discipline** (the SESSION-LOOP §4 split, with one public-repo teeth): a durable, repo-worthy fact
gets *promoted to a committed doc*. Scratch and private working context stays in the agent's own memory
store. In a **public** repo this is not a preference — an in-repo memory file would publish your working
context to the world. The doctor flags an agent store bloated with facts that should have been promoted,
and a repo that leaks scratch into a committed file.

---

## 4. The accountability contract (keep an unattended run honest)

An AI run that touches code without a human watching each step needs a contract, or "trust me" is doing all
the load-bearing work. This is human verification made mechanical: not a vibe, a checklist the run must
satisfy. Two halves.

### (a) The run ledger — evidence or it didn't happen

- **Claim before you touch.** Claim a plan item before editing code, so two sessions don't collide on the
  same work and so the trail starts before the diff does.
- **Checkpoint at load-bearing moments.** A short note at each real decision or risky move — not a
  play-by-play, the moments that would matter to someone reconstructing the run.
- **Close with a run report.** Gate results *verbatim* (not "tests pass" — the actual output), the
  diffstat, **what was not done**, and **what needs human eyes**. A report that only lists wins is a
  report that is hiding something.
- **A change a person can see owes a tour.** When the diff touches something that renders, the run
  closes with a CRUMB dev tour as well as the report: one step per changed surface, each carrying
  what moved and a verify line the reviewer can actually execute. A diff describes the edit; a tour
  shows the thing. The reviewer walks the real page instead of reconstructing it from a patch, and
  the per-step status is a machine-readable form of "what needs human eyes". Nothing else in this
  list is replaced by it. A change with no rendered surface, a parser, a CLI flag, a doc, owes no
  tour, and asking for one anyway is how the habit gets muted.

The rule underneath all four: **evidence or it didn't happen.** A claim of "verified" with no gate output
attached is treated as unverified.

**Where the repo runs PANTRY, hand over the link, not the summary.** The cockpit renders the run
ledger at `/runs`, the plan board at `/plans`, the open questions at `/decisions` and the evidence at
`/artifacts`, all read-only and all from the files the run already wrote. A session that closes by
pasting its own account into chat has written the one version of events it controls; a link points at
the parsed report, including the §9 items it is missing and any scope it grew past. Localhost is the
link, the same call the decision inbox already made, so this applies while the owner is at the machine
the work happened on and not from a phone. Where a repo does not run PANTRY, the report file itself is
the handover and chat carries the path to it. Neither replaces the report: the surface only renders
what the run was already honest enough to write down.

### (b) The rails — a declared envelope per run

Before an autonomous run starts, it declares its envelope, and the envelope is enforced (mechanically where
the tooling allows — Claude Code hooks blocking the forbidden commands; P3):

- **Scope cap** — the files or the area this run is allowed to touch. Growth past it is an ask-trigger, not
  a judgment call the run makes alone.
- **Hard stops** — no merge, no push to main, no deletes, nothing outward-facing. The loop *drafts*; a
  human *lands*. These are absolute, not defaults.
- **Ask-triggers** — stop and ask when: scope grows past the cap, a decision is genuinely the owner's, or a
  gate goes red twice on the same cause. That last one matters: **a gate red twice on one cause means stop
  and file a finding, not thrash.** An agent retrying the same failing approach is burning tokens to look
  busy.

Autonomous runs route every ask through the decision inbox (P2) — chat has nobody in it. Interactive
sessions use the inbox for artifact-heavy decisions and chat for the quick ones.

---

## 5. Why a loop at all (the precedent, and the receipt)

This is not a new instinct, and it is not only mine. The industry converged on the same shape from three
directions, and the convergence is the argument.

**The primitives are named and defended.** Addy Osmani's
[Loop Engineering](https://addyosmani.com/blog/loop-engineering/) sets out the five reusable primitives
this file maps in §1 (automations, worktrees, skills, connectors, sub-agents over persistent state) — the
case that durable AI work is built from a small set of composable parts, not a clever prompt. His
[Beyond Vibe Coding](https://beyond.addy.ie) carries the harder half: the "70% problem" (an AI gets you
most of the way and the last stretch is where unmanaged work rots), plan-first over prompt-and-pray, and
quality gates as non-negotiable. That book is why the heartbeat (§2) and the gate (SESSION-LOOP §2) exist
at all.

**The verification discipline is named.** Alfonso Graziano's
[Learning AI-Native Software Engineering](https://alfonsograziano.it/book) is where the context-engineering
and spec-driven-development framing comes from, and the verification gates that §4's contract makes
mechanical. His "human verification is non-negotiable" is the sentence §4 turns into a checklist.

**The spec-first shape is formalized.** [GitHub's Spec Kit](https://github.com/github/spec-kit) formalizes
spec-driven development — a versioned spec becomes a plan becomes atomic tasks becomes code, governed by a
"constitution" of project principles. Our `PLAN.md` and PROOF culture is already this; the cite is external
validation, and *constitution* is a good word for what the five non-negotiables in every `CLAUDE.md`
already are.

Two honest caveats, the same posture as the STE cite in [`VOICE.md`](VOICE.md): the two books are being
read as this is written, so this section is a living base, not a finished literature review — it gets
revisited after the read. And none of these sources is a study of *this* estate; they are the shape the
field agrees on, and this file is one person applying it, not proof it scales to a team.

**The comprehension-debt warning.** Osmani's sharpest point, and the one this whole file is built around:
a loop that ships code faster than anyone understands it is not a productivity win, it is *debt* — you can
run a repo you no longer comprehend right up until the day you have to fix it. This is exactly the
[ten-times-zero](https://tjakoen.github.io/notes/ten-times-zero) thesis: the multiplier is real, and
anything times zero is still zero. The verify rule (§2), the run ledger (§4), and the human gate on every
merge exist precisely so speed never outruns comprehension. The loop draft; the human, who still
understands the code, lands.

---

## 6. Adoption checklist

Mirrors [`AI-REPO-STANDARD.md`](AI-REPO-STANDARD.md) §12 — one floor up, for the loop rather than the repo.

Day one (an hour):

- [ ] `pantry init --kit` (or by hand): thin `CLAUDE.md` from the starter, `AGENTS.md → CLAUDE.md` symlink,
      `plans/`, config. Standards referenced by URL, not forked.
- [ ] Run `pantry doctor` once. Fix what it flags. Green doctor is day-one done.
- [ ] Wire the mechanical heartbeat: CI on push where the repo is on GitHub; doctor at session start
      everywhere.

First month (as the work happens, not as a project):

- [ ] First staleness flag fires → run the cognitive tier: draft the fix on a branch, human gates the
      merge, leave the run report.
- [ ] First autonomous run → declare the rails (§4b), write the run ledger, close with a report carrying
      gate output verbatim.
- [ ] First artifact-heavy or owner-only decision → route it through the decision inbox, not chat.
- [ ] `CLAUDE.md` grew past the front-door minimum → move the depth into a pantry-mounted dir.

Steady state: the estate behaves identically. Any repo, `bunx pantry`, same surfaces, same loop, same
evidence trail. Doctor green estate-wide, no repo "doing its own thing." The proof of the loop is that you
cannot tell the repos apart by how they are worked.

---

## 7. Rationalizations (what talks a run out of the contract)

The contract in §4 is rarely rejected. It is talked out of, one reasonable-sounding sentence at a time.

| Rationalization | Reality |
|---|---|
| "I wrote it and I checked it, that counts." | That is one pass. §2 asks for a second by someone who did not write it, because the author's eye reads what it meant to write, not what it wrote. |
| "The gate is flaky, run it again." | A gate red twice on one cause is a stop and a finding (§4b), not a retry. Rerunning with no edit in between is burning tokens to look busy. |
| "I'll commit at the end, it's all one change." | The end is where sessions get interrupted. Uncommitted work does not survive a crash, a context limit, or a change of mind. |
| "Pushing is the owner's call, so I'll leave it local." | Leaving it local is right. Leaving it local and unrecorded is not: the handoff names what is unpushed and why, or the next session inherits a surprise. |
| "The tests passed, that's the evidence." | "Tests passed" is a claim. The gate output verbatim is the evidence, and §4a treats the claim alone as unverified. |
| "Nothing worth reporting, the run went fine." | A report listing only wins is the exact report §4a warns about. What was not done and what needs human eyes are the load-bearing lines. |
| "I'll summarize the run in chat, it is faster to read." | Faster, and written by the party with an interest in how it reads. §4a asks for the link where the repo runs PANTRY, because the rendered ledger names the evidence items the report is missing and the summary never will. |
| "The scope only grew a little." | Growth past the cap is an ask-trigger, not a judgment the run makes alone (§4b). The size of the growth does not change who owns the call. |
| "Doctor is noisy, I'll deal with it later." | Later is the next session, which reads the same flags and makes the same excuse. That is how a flag becomes furniture. |

---

## 8. Red flags

- **Uncommitted work spanning more than one session, in any repo.** This is the estate's real one, and
  it is the one that keeps recurring.
- Work committed but unpushed, with no line in the handoff saying so.
- The same gate rerun with no edit in between.
- A run report with no "what was not done" section.
- "Verified" written with no gate output attached to it.
- Scope grew past the declared cap and no ask was raised.
- A plan item edited before it was claimed.
- Doctor flags carried across three or more sessions untouched.
- A session ended with no handoff because "it is obvious where this is."
- Two sessions working the same area with no claim between them.

---

## 9. Verification (before a session is called done)

Short, mechanical, evidence-shaped, and meant to be machine-checkable: this list is the schema the
run ledger is checked against, not a vibe pass.

- [ ] Gate output pasted verbatim in the run report, not summarized.
- [ ] Diffstat in the report.
- [ ] "What was not done" written, even when the answer is nothing.
- [ ] "What needs human eyes" written, even when the answer is nothing.
- [ ] Every touched file is either committed or named in the handoff as deliberately left dirty.
- [ ] Unpushed commits counted and named, with the reason they are unpushed.
- [ ] The second pass was done by a session or agent that did not write the change (§2).
- [ ] Declared scope compared against what was actually touched, and any growth was asked about
      rather than absorbed. `proof verify` does this mechanically against a plan's `touches`; a run
      that reasoned it out by hand instead should say so.
- [ ] A change that renders left a dev tour, or the report says why it did not owe one.
- [ ] Doctor run, and every flag either fixed or carried forward by name.

---

*Living document. When the workflow changes, update this file — the same rule it asks of everything else.
The research base (§5) is revisited after the two books are read.*
