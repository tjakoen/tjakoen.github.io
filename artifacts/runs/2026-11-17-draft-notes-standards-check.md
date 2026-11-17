---
title: Check two draft notes against NOTE-STANDARD and VOICE
date: 2026-11-17
status: complete
lane: content
branch: masthead-byline
scope:
  - content/notes/vectorless-rag-by-accident.md
  - content/notes/pantry-beside-the-work.md
touched:
  - artifacts/runs/2026-11-17-draft-notes-standards-check.md
consulted:
  - NOTE-STANDARD.md#frontmatter-template
  - NOTE-STANDARD.md#guardrails-this-repo-is-public
  - VOICE.md#punctuation-formatting-conventions
  - VOICE.md#content-guardrails-this-repo-is-public
gates:
  - bun run lint:runs on this report
unpushed: 16 commits already on the branch before this run; this run added none
verifiedBy: Both notes rendered from the local dev server under /drafts and screenshotted in the session.
---

# Check two draft notes against NOTE-STANDARD and VOICE

This was a test run of the retrieval workflow. The standards were reached through the section index
rather than loaded whole: one table of contents for the set, one for each of the two standards, and
four section reads. No whole standard or skill was loaded.

## What was checked

The frontmatter of both notes was held against the template in NOTE-STANDARD. Every required field
is present in both: title, subtitle, author, status, type, date, readingTime, tags, summary, social,
socialImage and socialImageAlt. Both social images exist under content/media/notes. The extra
fields, audience, level and layout, are ones the site reads and the template does not forbid.

The body of each note was searched for em-dashes, for backticks outside fenced blocks, and for money
figures or exact ratios.

## What was found

Nothing needed fixing, so neither note was edited.

- The vectorless RAG note has no em-dash, no inline backtick and no money.
- The PANTRY note has three em-dashes, all inside a fenced console block that quotes git log output
  verbatim. Fenced code is the exception VOICE names, and changing them would falsify the commit
  titles.
- The PANTRY note sets one date, Nov 14, as inline code. VOICE's console exception allows the dates
  of a dated story to be set that way, and this note is laid out as a timeline, so it stays.
- Neither note mentions money.

## Rendering

Drafts are not served under /notes; they live at the unlisted /drafts route. Both pages rendered
there with their draft banner, masthead, tags and summary, and were screenshotted.

## Session start

The freshness check reported all 21 mounted skills behind their source in standards/, and the code
graph older than tools/standards-index.ts. Neither was refreshed in this run, because the index was
read straight from standards/ and the graph was not used. The doctor carried one due item, worktree
isolation, which this run did not act on.
