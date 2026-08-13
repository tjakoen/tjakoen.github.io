---
id: loop-story-and-talk
status: todo
track: content
depends:
  - agent-autonomy-tiers
  - session-handoff-automation
  - runs-surface-polish
touches:
  - docs/CONTENT-BACKLOG.md
  - content/notes/
  - standards/
  - ../pantry/README.md
owner: unassigned
---

# Say what the loop actually does, once it actually does it

Queued 2026-08-09, deliberately not started. Educating is one of the goals of this whole estate, and
the loop being built across the three plans above is the most teachable thing in it. This plan is the
pass that turns it into something a person can learn from, and eventually a note and a talk.

**The gate on starting is not a date, it is a demonstration.** None of this begins until the loop
runs unattended and does what we expect in the three repos it was scoped to: `tjakoen.github.io`,
`pantry` and `bread`. Audited, polished, implemented, tested. Writing the teaching material before
that point is the exact failure the material would be warning about, and a talk about a loop that
half runs is worse than no talk, because it is a claim someone can check.

## What "it works in the three repos" has to mean before this starts

- Each of the three closes a real run with a report, and the owner gets the `/runs` link rather than
  a chat summary, without anyone remembering to ask.
- The conformance prompt has been run end to end in each, and its findings are fixed or filed rather
  than admired.
- The handoff fires on its own trigger at least once and the next session picks up cleanly.
- Whatever the autonomy work settles on is wired, not written down.
- The verify rule is satisfied by someone who did not build it.

## Then, in order

**1. The doc pass, because the story cannot be truer than the docs.** Walk the whole set against what
the code now does, not what it did when each file was written: every `CLAUDE.md`, `DOCS.md`, the
standards set, PANTRY's own docs and README, the five README footers that already vary from the
standard. A doc that describes a loop step that moved is the drift this estate keeps finding, and it
is the one thing that would make the note wrong in public.

**2. Record what actually happens, not what we meant to build.** A real run, captured: the trigger
firing, the report being written, the link being handed over, the review happening on the page. The
repo already has the channel for this (`bun run shots`, the CRUMB dev tours, the artifacts surface),
so this is capture rather than construction. Recording it before the doc pass is a good way to
discover which docs are wrong.

**3. The figures.** Per FIGURES: the two inline-SVG scaffolds, the palette, no mermaid on a published
page. The loop is a flow and the ledger is a series, so both scaffolds get used. Osmani's three-lane
figure is the reference for what "one picture that carries the argument" looks like, and the autonomy
plan already owes one, so build them as a set rather than one per note.

**4. The note.** Per NOTE-STANDARD, and it belongs in `docs/CONTENT-BACKLOG.md` before it is drafted
so it does not jump the queue that already has ten unpublished drafts in it. The subject is the loop:
how a session orients, what evidence it owes, what the machine checks, and where the human still
lands every change. The honest half is the point, the same as `ten-times-zero`: what it cost, what it
still cannot do, what was measured rather than asserted.

**5. The talk.** There is already a home for one (`/talk`, the student deck, live on grain) and a
format that worked, so this is a second deck rather than a new mechanism. Two audiences that want
different halves: teaching the AI loop is the transferable part, and PANTRY as a concept is the
concrete one. Do not let the second eat the first, because a talk that turns into a product pitch
stops teaching at the slide where it turns.

**6. The tutorial, which is a separate plan.** `loop-tutorial` is the follow-along version: a reader
builds this loop on a small project of their own, PANTRY included. It waits on this plan rather than
running beside it, because a tutorial is a set of commands the reader executes and cannot be as
honest about a half-built step as a note can.

## The honest blockers, named now so they do not surprise the talk

- **PANTRY is unpublished** and its install docs say so truthfully. Selling it as a concept is fine;
  telling a room to go install it is not, until that is resolved.
- **A talk needs the loop to have run for a while**, not once. The interesting slide is the ledger
  with enough entries to show a trend, which is the same thing `runs-surface-polish` is waiting on.
- **Ten notes are already drafted and unpublished.** Adding an eleventh before any of them ship makes
  the backlog the problem rather than the writing.

## Tasks

- [ ] Confirm the gate: the loop demonstrably runs in all three repos. Nothing below starts first.
- [ ] The doc pass, one repo at a time, fixing drift in the same change that finds it.
- [ ] Capture a real run end to end as the raw material.
- [ ] The figure set, built once and shared by the note and the talk.
- [ ] Add the note to `docs/CONTENT-BACKLOG.md` and place it against the existing queue.
- [ ] Draft the note per NOTE-STANDARD, with the limits section written first.
- [ ] The talk, after the note, reusing the deck mechanism that already ships.
