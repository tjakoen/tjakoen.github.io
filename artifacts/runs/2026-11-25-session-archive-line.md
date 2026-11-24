---
status: complete
consulted: [BRIEF.md, GLOSSARY.md#the-loop, SESSION-LOOP.md#8-a-session-wears-the-name-of-its-work, MODELS.md#10-the-model-guard, VOICE.md, LOOP.md#9-verification-before-a-session-is-called-done, skill:brief, skill:voice]
plan: plans/session-archive-line.md
verifiedBy: >
  portfolio: 1063 tests pass, voice-lint reports 0 flags on BRIEF.md and GLOSSARY.md, link-lint finds no
  dead relative links across 92 rendered files, the lint gate reads 4498 flags against a baseline of
  4528, the standards index regenerated to 31 standards and 279 sections, and the rendered section was
  read from the dev server at localhost:3000/standards/brief.
unpushed: 0 | the commit is on origin/main
doctor: The session-start checklist reported Agentic Loop Loaded, with warns for in-flight plans and a dirty tree in avero and agent-config.
touched:
  - standards/BRIEF.md
  - standards/GLOSSARY.md
  - standards/INDEX.json
  - plans/session-archive-line.md
---

# Every message ends by saying whether the session can be archived

Asked in chat on 2026-11-25: end each message by telling the owner whether the session can be archived,
built from what the session did, what is still open, and, for a child, whether its parent has been told.

## What the standard now says

- **BRIEF section 11** owns the line: it sits last, after the state table, and carries four facts, the
  work in the session's label words, what is still open, the parent when there is one, and a verdict.
- **Three verdicts**, each with the fact that makes it true: Archive now, Archive after this answer, and
  Keep open. The verdict follows the gates, so an open plan, an uncommitted path of the session's own or
  an unpushed commit all read Keep open.
- **A child reports before it says Archive now.** The report is part of the work, and a child that has
  not reported is not archivable because the parent's next step depends on it.
- **A parent asks about its children once**, in one line, or one card when a single answer covers the
  batch, with keeping them as the default. Archiving a parent archives its children, so the parent's own
  verdict waits on them.
- **GLOSSARY** gains Archive, in the loop table, so the word means one thing across the estate.

The three worked examples in the section are the shapes to copy: a finished child, a child with work
left, and a parent whose children hold it.

## Why these three words and not the close command's four

`source-command-close` answers a heavier question, at the end of a session, with gates run on purpose:
CLOSE, CLOSE WITH NOTES, HAND OFF or DO NOT CLOSE. The archive line is read after every message, so it
carries the same evidence in three words and points at LOOP for what decides them. A session that wants
the long form still runs the close command.

## What this does not do

- It does not archive anything. Archiving stays the owner's click, as MODELS section 10 says.
- It does not tell a child how to report. SESSION-LOOP section 8 owns that, and the new section links to
  it rather than restating it.
- It reaches other projects through the generated skill views, which `pantry skills sync` rewrites from
  this file. The sync has to be run before a project's copy carries the rule.
