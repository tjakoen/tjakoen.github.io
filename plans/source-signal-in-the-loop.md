---
id: source-signal-in-the-loop
status: todo
track: loop
depends: []
touches:
  - ../pantry/tiers.ts
  - ../pantry/doctor.ts
  - .claude/skills/session-loop/SKILL.md
  - standards/
  - docs/CONTENT-BACKLOG.md
owner: human
---

# Make an outside source a signal the loop acts on

The owner keeps noticing the same pattern: a post from outside changes a design, and the work then
owes two things, a citation and a note. Today both depend on someone remembering. This plan proposes
the smallest change that makes the loop carry it. It is a proposal for the owner to approve, not
work an agent should pick up.

## What the loop does today

Checked on 2026-11-17.

- **Nothing notices an outside source entering the work.** No hook reads a prompt or a plan for a
  link or a named post. auto-plan.py opens a chat plan on the first edit with a fixed body and no
  field for where the idea came from (plans/chat-2026-11-17-a4ca1216.md as written by the hook). The
  intake skill turns a pasted brief into an envelope but asks nothing about its origin
  (.claude/skills/intake/SKILL.md:181 is the only place it speaks of citing, and that cites the
  brief by filename).
- **Nothing requires a citation outside a note.** The note standard asks to cite people by name
  (.claude/skills/note-standard/SKILL.md:175), so a note gets one if a note is written. A plan gets
  none: PANTRY's plan schema check reads id, status, owner and depends and nothing else
  (../pantry/tiers.ts:95-111).
- **Nothing turns sourced work into a backlog entry or a note draft.** docs/CONTENT-BACKLOG.md is
  edited by hand, and its sourced entries were written that way (docs/CONTENT-BACKLOG.md:324 records
  a standard sourced from Addy Osmani's writing). No hook or doctor row compares closed plans with
  the backlog. finish-gate.sh checks for leftover branches and worktrees on finish, not for owed
  content (../../../agent-config/shared/tools/finish-gate.sh:2-15).

The loop-standard and session-loop skills cite their own sources well, but nothing turns that habit
into a check.

## The proposal

Three small pieces. Each one leans on machinery that already runs.

1. **A sources: field in plan frontmatter.** It is a list of URLs, optional, and absent means the
   work did not come from outside. The PANTRY schema check (tiers.ts, planSchemaProblems) adds two
   problems: sources is not a list, and a plan has sources but no ## Sources heading in its
   body, which is where each source gets its line on what the plan took.
2. **A doctor row for owed content.** When a plan with sources reaches status: done, the doctor
   looks for its id in docs/CONTENT-BACKLOG.md and reports DUE until a line names it. The line can
   say "no note, because" just as well as point at a draft, so the row asks for a decision rather
   than forcing a note.
3. **A line in session-loop's plan section.** When an outside post, repo or talk changes the design,
   set sources: on the plan in the same edit. That is the noticing step; the two checks above are
   what make forgetting it visible.

Deliberately not proposed: a hook that scans prompts for links. Most links in a prompt are
references, not design changes, and a nudge that fires on all of them would be ignored by the
second day.

## Steps

- [ ] Owner approves the three pieces, or cuts one.
- [ ] Add the sources checks to planSchemaProblems with a test for each problem.
- [ ] Add the owed-content row to the doctor, as DUE and never failing.
- [ ] Add the line to the session-loop standard in standards/ and resync the skills.
- [ ] Backfill sources: on grain/plans/grain-lint.md and the builder plan, and add their
      CONTENT-BACKLOG lines, so the row starts clean.

## Done means

A plan that names an outside source fails the schema check until it cites it, and closing it puts a
DUE row in front of the next session until the backlog says what became of it.
