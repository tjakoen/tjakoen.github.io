---
id: nimbalyst-in-the-loop
status: done
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
- [x] Decide whether the automations surface belongs in the loop at all, or stays a personal
      convenience like caveman. Not urgent, and not to be answered by enthusiasm: the test is whether
      a standard is worse without it. **Answered 2026-08-10: it stays out, and the question turned
      out to be aimed at the wrong surface.** A standard is not worse without automations, because an
      automation is a clock. It fires whether or not there is work, where the thing the loop actually
      needs fires because a piece of work outgrew the session carrying it. Two smaller facts settle
      it beyond the argument: an automation lives in `nimbalyst-local/`, which is gitignored, so it
      can never be committed machinery that another repo or another device inherits; and the caveman
      precedent applies unchanged.

      What the surface question was really pointing at is `spawn_session`, and that needed no new
      decision at all. It is a tool the model already holds, so nothing committed learns about
      Nimbalyst by using it, and the lane call was settled on 2026-08-10 at the stop line. The gap
      was that the same rule stopped at 900k. Extended to the warn line this session, on the owner's
      call: a session whose task will not fit in the room it has left commits, opens the successor,
      and hands it that same task. The bound is the task and not the backlog, so the chain ends when
      the piece of work is done rather than when the plans run dry.

      The reason for putting it at the warn line rather than leaving it at the stop line is the one
      the owner named, and it is not about running out of room. A new session runs SESSION-LOOP from
      the top: it orients, reads the plans, runs the doctor, meets the gates cold. A thread that
      keeps going skips all of that, because it remembers doing it once. Handing off early is how the
      checks get re-run. Built in `~/.claude/tools/context-usage.ts`, held by a test, and watched
      firing through `CONTEXT_WARN=1`.
- [x] Check the other repos' CLAUDE.md files. **Walked 2026-08-10: none of them earns the section,
      and the reason is not that the harness is decoration but that the premise was wrong.** Six
      sibling repos carry a `CLAUDE.md` (batch, bread, grain, greenroom, pantry, project;
      `graphify-out/` and `test-results/` are outputs, not repos). The same work does not happen in
      them. Since Nimbalyst was adopted around 2026-07-23, every session has rooted in the portfolio
      (81 transcripts, still today), the sibling repos are reached across by relative path from that
      root, and exactly one session outside it ever ran under the harness at all: greenroom,
      2026-08-01, one of six. The parent `bread-repos/` root has been cold since 2026-07-24, and no
      session has ever rooted in grain, batch, bread, pantry or project.

      That places the three consequences the portfolio's section names in the workspace root rather
      than in each repo. `.nimbalyst/` and `nimbalyst-local/` exist in one tree and are named in one
      `.gitignore`, the portfolio's; a reader of grain's front door will never meet those paths.
      Per-session attribution is a fact about the repo a session is rooted in. So the section is
      correctly placed and stays, but the conditional in this task never fires, because "where the
      same work happens" turned out to be one repo.

      There is a second reason not to pad it in, and it is the caveman precedent again. Four of the
      six publish: grain and batch ship to npm, pantry installs into someone else's project, and
      greenroom's whole promise is a non-coder pressing a VS Code task button. Naming this estate's
      editor in their front doors would tell a contributor about a harness they are not running.
      PANTRY makes the point hardest by building capture itself (P4d) rather than borrowing the
      harness's, precisely so a host without one still gets it.
