# Decision — scheduled work is adopted, under a gate

- **Date:** 2026-09-16
- **Amends:** the 2026-07-26 call recorded in LOOP §1 and `plans/ai-workflow-loop.md`: *no cron, no
  scheduled agents, the loop is work-triggered*.
- **Verdict:** **The blanket rejection is lifted and replaced by a four-condition promotion gate.**
  Five chores move to a trigger nobody is present for. The hard stops do not move at all.

## What this is, and what it is not

This is an owner call, not a research verdict, and it belongs in the same folder as
`2026-08-18-loop-practice-gaps.md` for the same reason: the next session needs to know the reversal
was deliberate rather than defaulted into. It was prompted by Addy Osmani's *four kinds of loops*,
which sorts loops by what you hand off, and by the observation that the estate had been sitting on
rung one while describing rung four as a thing it had considered and declined.

It is **not** a decision to run an agent unattended. Nothing adopted here writes source, and nothing
adopted here can merge. What was adopted is a *trigger*, and the trigger is attached only to chores
whose result a machine can grade.

## The 2026-07-26 argument, and the part of it that was wrong

The original reasoning, quoted from LOOP §2 as it stood:

> A scheduled agent that finds a problem at 3am has nobody to hand it to; its output is a
> notification that competes with every other notification.

Every clause of that is true, and it is an argument about **where the finding lands**, not about
timers. It was written as though it were about timers. That conflation is the whole of the error: a
scheduled run whose finding arrives as a notification is worthless for exactly the reason given, and
a scheduled run whose finding arrives as an issue in the tracker, or as a draft pull request, or as a
line in the triage file the session-start doctor already reads, is the same finding arriving at the
same desk, earlier and for free.

Preserving the true part as a **condition** rather than a veto is what LOOP §2a condition 3 does. The
July call would have passed its own test if it had been stated as a test.

## What actually changed since July, which is the honest reason this is being reopened now

Three things, and the first two matter more than the prompt that started this.

1. **The checks now exist.** In July there was no `lint:links` with a nonzero exit, no committed lint
   baseline with a ratchet, and no answer log to count acks against. Every one of those arrived
   between then and now, written in response to a failure that had already happened. The promotion
   gate in §2a asks for a deterministic check, and in July the honest answer for nearly every chore
   was that there was not one. A blanket no was the correct approximation of that answer. It is no
   longer the correct approximation.
2. **The lanes and the hard stops exist.** §4b's three lanes and its path classifier were written
   after July. They are what makes it possible to say *this scheduled thing may open a branch and may
   not merge* as a mechanism rather than a hope.
3. **The prompt.** The four-rungs framing gave the estate vocabulary it did not have. Its load-bearing
   line, *more autonomy is not the upgrade, the check is*, is the same claim the verify rule and the
   run ledger already make, arrived at from the direction this estate had not tried.

## What was decided

**Adopted.** The four-condition promotion gate (LOOP §2a) and the promotion table (LOOP §2b). Five
chores climb: link rot, cold build drift, unacked answers, dependency upgrades, and a responder on a
red default branch. A sixth, the uncommitted-work sweep across the estate, stays where it is and is
recorded as **not wired** by name, because a hosted runner cannot see local repositories.

**Not adopted, and named so a later session does not have to rediscover the reasoning.**

- Any chore that edits source on a schedule.
- Any chore whose output is a judgment rather than an exit code.
- The audit on a timer. Its findings need the cognitive tier, and filing them without it produces a
  list nobody can act on, which is the 3am objection wearing a better outfit.

**Unchanged, explicitly.** Every hard stop in §4b. No merge, no push to a default branch, no deletes,
nothing outward-facing. The loop drafts and a human lands. This was the part of the July posture
worth keeping and it was never the part under discussion.

## The cost being accepted

Named here rather than discovered later.

- **A new place for rot to hide.** A workflow that has been green for two months is trusted more than
  it has earned. §2a condition 2 and the §8 red flag about green-for-completing are the answer, and
  both depend on somebody actually asking the question.
- **Issue fatigue.** Mitigated by one reopened issue rather than one per run, which is a real
  mitigation and not a complete one.
- **`.github/**` is the human lane.** Every workflow added here was written in a session the owner
  scoped first, and the permission blocks are the part that wants reading, not the scripts.

## Demotion, which is the half that makes this reversible

A promoted chore drops back to work-triggered when its findings go three cycles unacted, or when its
check goes red twice on the same cause. Both are countable. This is written into §2a rather than left
as a good intention, because the failure mode of a promotion gate with no demotion path is a
permissions system that only ever grants, and §4b already refuses to build one of those.
