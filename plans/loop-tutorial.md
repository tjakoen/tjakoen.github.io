---
id: loop-tutorial
status: todo
track: content
depends:
  - loop-story-and-talk
touches:
  - content/notes/
  - docs/CONTENT-BACKLOG.md
  - standards/
  - ../pantry/README.md
owner: human
---

# A tutorial someone can follow to build this loop on a small project

Queued 2026-08-14 at the owner's ask, deliberately not started. The sibling plan
`loop-story-and-talk` turns the loop into a story: what it is, why it exists, what it cost. This one
turns it into instructions: a reader with an empty directory and a Claude Code install follows along
and ends the hour with a loop that actually runs on a project of their own, with PANTRY wired in.

The two are not the same artifact and should not be merged. A note can be honest about a half-built
thing; a tutorial cannot, because every step is a claim the reader will execute. That is the whole
reason this waits.

## The gate

Same gate as the story plan, and it is not a date. The loop has to run unattended in the three repos
it was scoped to, the standards have to be settled enough that a reader is not learning a version
about to change, and PANTRY has to be installable by the person following along. Today it is not
published, which alone is enough to hold this: a tutorial whose second command fails is worse than
no tutorial, because the reader blames themselves and leaves.

Write the story first, then the tutorial. The story pass includes the doc sweep, and the tutorial is
only as correct as the docs it is built from.

## The shape it should take

Small project, not a toy and not the estate. Something a reader can hold in their head while the
loop is the thing they are actually learning: one page, one script, one test, and enough real work
that a session has something to get wrong. Building the estate in front of them teaches the estate,
not the loop.

Each step earns its place by fixing a problem the reader has already felt in the previous step. The
order that does that, roughly:

1. A session with no rails, so the reader sees the failure modes first hand: the confident wrong
   answer, the silent scope creep, work that vanishes between sessions.
2. `CLAUDE.md` from the starter template, and the same task again, so the difference is visible
   rather than asserted.
3. Plans as files, so intent has provenance the same way output does.
4. The evidence a run owes: what was done, what was not, what needs human eyes.
5. PANTRY: the doctor at session start, the run ledger, the review surface, the answer channel. This
   is where the reader stops taking the loop on faith and starts being told by a tool what is due.
6. The handoff, so the reader's second session begins oriented instead of cold.

## What it must be honest about

The same limits the note carries, said plainly rather than buried: this is one person's setup, the
standards name capabilities rather than products so the loop survives a change of harness, and a
reader on a different harness will lose the parts that depend on this one. Say which steps are
portable and which are not, at the step, not in a footnote at the end.

Also honest about cost. A loop is overhead before it is leverage, and a reader on a weekend project
may correctly decide to stop after step three. Tell them where that line reasonably falls.

## Where it lives

Undecided, and worth deciding before drafting rather than during. A note under `content/notes` is
the path of least resistance and the wrong shape for something a reader follows with a terminal
open. The alternatives are a page of its own on the site, or a public template repo that the
tutorial walks through, which has the advantage that every step is checkable by cloning it. Whatever
wins, it goes through `docs/CONTENT-BACKLOG.md` first so it does not jump the queue.

## Tasks

- [ ] Hold until the gate in `loop-story-and-talk` is met and the story pass has landed.
- [ ] Decide the home: note, standalone page, or template repo. Owner's call.
- [ ] Pick the sample project and build it once, so the tutorial is written from a run rather than
      from memory.
- [ ] Walk the six steps as a real reader would, on a clean machine profile, recording where it
      breaks.
- [ ] Draft, with the portability limits written into each step rather than collected at the end.
- [ ] Verify by second pass: someone who did not write it follows it start to finish.
