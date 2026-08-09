---
id: nimbalyst-in-the-loop
status: doing
track: ai
depends: []
touches:
  - CLAUDE.md
  - standards/LOOP.md
  - standards/SESSION-LOOP.md
  - docs/CONTENT-BACKLOG.md
owner: unassigned
---

# The harness is part of the loop, so say which one

Asked 2026-08-10. Every standard here describes a loop that some harness has to run, and until now
the harness was the one unnamed variable in it. The estate had already made the opposite call three
times, for caveman, rtk and headroom: personal tooling stays out of canon, because a standard that
assumes your setup is a standard nobody else can follow.

Nimbalyst is a different case, and the difference is worth stating rather than assumed. Those three
are conveniences layered on top of the loop. This one supplies capabilities the standards already
demand and could not previously check: attribution of dirty files, a spawn that turns a handoff into
an open session, a permission gate that runs per action instead of per session.

## The call, made 2026-08-10

**The capability goes in canon; the tool is named as the example.** Each standard states what a
harness must provide and why the loop is worse without it, then names Nimbalyst once as the concrete
thing this estate runs. A reader on plain Claude Code gets a requirement they can meet another way,
and nobody has to reverse-engineer which product the prose is quietly describing. The alternative,
writing Nimbalyst in as the assumed harness, was rejected: it would reverse the caveman precedent for
a much larger dependency and make the published standards unusable to the people they are published
for.

## What it actually buys, in the owner's words

Recorded because a plan that lists features loses the reason six months later:

- **Seeing the subagents.** A fan-out that reports only at the end is trusted less than one you can
  watch, and less trust means smaller delegations than the work deserves (SESSION-LOOP §7).
- **Sessions organised into workstreams, with tabs.** Related work stays together instead of becoming
  a flat list of transcripts to scan.
- **Per-session commit tracking.** Which session left what uncommitted, which is the exact blind spot
  that made the machine-level durable-state guard report another session's mess as this one's.
- **A permission gate judged per action**, with the model deciding whether to interrupt, rather than
  one blanket approval at the start of the run.
- **The automations**, the previews and the inline viewing: a rendered change can be shown rather
  than described, which is what TOUR-STANDARD wants and what a chat summary cannot do.
- **Control from a phone, over the whole setup rather than one session at a time.** This is the one
  with no equivalent elsewhere: the comparison is not "better mobile UI", it is that the unit of
  control is the workstream instead of a single conversation.

## Tasks

- [x] Decide how far into canon the tool goes. Capability in canon, tool as example.
- [x] SESSION-LOOP §5: the handoff's last paragraph said opening the next session unasked is LOOP
      §4b's territory. It still is, and §4b now answers it: a sibling session is reversible and
      inward-facing, so it is gated rather than human. Also records the mechanical limit that a shell
      hook cannot spawn, since only the model holds that tool.
- [x] SESSION-LOOP §7: visibility of a fan-out changes how much gets delegated, stated as a
      requirement of the setup rather than a product recommendation.
- [x] LOOP §4b: per-action approval and per-session attribution of dirty work, as the two harness
      capabilities that turn a lane from a promise into a mechanism.
- [x] CLAUDE.md: a short "what this is worked in" section, including that `.nimbalyst/` and
      `nimbalyst-local/` are gitignored private working material.
- [x] CONTENT-BACKLOG: the note about the setup.
- [x] `plans/session-handoff-automation.md` last task, now half-answered by this one. The spawn is
      available to the model and gated rather than forbidden, so what remains is only whether the
      trigger recommends or the model asks. Close that plan against this decision rather than
      leaving it open on a blocker that no longer holds. **Closed 2026-08-10 on "the hook
      recommends, the model asks".** The spawning CLI was the other option and was rejected: it
      would couple a committed hook to one editor's internals to save a sentence, in a lane where a
      human confirms anyway. That plan is done and now lives in `plans/done/`.
- [ ] Decide whether the automations surface belongs in the loop at all, or stays a personal
      convenience like caveman. Not urgent, and not to be answered by enthusiasm: the test is whether
      a standard is worse without it.
- [ ] Check the other repos' CLAUDE.md files. If the harness is worth naming here it is worth naming
      where the same work happens, and if it is not worth naming there, this section is decoration.
