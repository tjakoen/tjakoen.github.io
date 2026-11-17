---
id: standards-section-index
status: done
track: ai
depends: []
touches:
  - tools/standards-index.ts
  - tools/standards-index.test.ts
  - standards/INDEX.json
  - package.json
  - CLAUDE.md
  - artifacts/runs/2026-11-17-standards-section-index.md
owner: ai
---

# A table of contents the agent can read before it reads a standard

Twenty-three standards sit in standards/, about 5,700 lines between them. Today an agent that needs
one rule loads one whole file, and the heavy ones (VOICE, LOOP, HOOKS, SESSION-LOOP) run past four
hundred lines each. The question it brought usually lives in one section.

This is retrieval by reasoning rather than by embedding, the move people have started calling
vectorless RAG. The model reads a table of contents, picks the branch that answers its question,
and loads only that. No vector store, no similarity score to trust: the tree is the index, and the
choice is one the model can explain.

## What gets built

A generator, tools/standards-index.ts, reads every real standards/*.md (the AGENTS.md symlink is an
alias and is skipped, the same rule the rendered collection follows) and writes standards/INDEX.json.
For each standard it records the slug, the published URL, the skill it mounts as, the frontmatter
title, summary and when, and a tree of its H2 and H3 sections. Each section carries:

- its heading and the anchor the rendered page gives it, computed with the one slug function MILL
  stamps on the page, so a deep link can never drift from the real heading id;
- the first and last line of the section in the file, so the agent can read exactly that range;
- a one-line summary, the section's own opening sentence;
- the other standards it links to or names, with the target anchor when the link carries one.

Each standard also gets the list of standards that point back at it, computed from the same refs.

A test, tools/standards-index.test.ts, covers the parser on fixtures and then regenerates the index
and compares it to the committed file. A standard edited without a regenerated index fails bun test,
which is the machine version of the folder's own rule that a standard and its index change together.

## Why standards/INDEX.json

Three reasons, in order of weight.

1. **PANTRY can already reach it.** The package exports ./standards/*, which is how PANTRY resolves
   the standards today, so the index rides the same path with no new wiring on either side.
2. **It sits beside what it describes.** An agent that has opened the folder finds it next to
   README.md, the human index, which is the twin it is.
3. **It does not render.** The /standards collection harvests only .md, so a .json file in the
   folder never becomes a page.

The folder's own rules say it is a docs set and no code creeps in. The index is data, generated and
checked, and the code that writes it lives in tools/. That keeps the letter and the reason of the
rule.

## Honest limits

The section summaries are extractive: the opening sentence of each section, trimmed. That is only as
good as the writing, and a section that opens with a list or a table falls back to its first item.
Writing a summary by model would read better and would be a second thing to keep true by hand, so
the extractive version ships first and the quality question stays open.

Cross-references are links and explicit filename mentions only. A sentence that says "the voice
standard" with no link is not counted.

## What should move to PANTRY later

PANTRY resolves the standards for every repo, so the parser is more naturally its code than this
site's. The PANTRY repo is not attached to this session, so the generator stays here for now. These
are follow-ups for a session with PANTRY attached, not open items of this plan.

- Move the heading tree and ref parser into PANTRY beside its standards resolver.
- Have PANTRY serve the index (and a section-by-anchor read) to sessions over its MCP server, so
  the agent asks for a section by name rather than reading a line range.
- Have the skills sync emit the index into each mounted skill set, so a repo that mounts the
  standards gets the tree with them.
- Name the index in standards/CLAUDE.md's definition of done. Left out of this run because that file
  renders as a public page and owes a screenshot; the root CLAUDE.md and the freshness test carry the
  rule until then.

## Tasks

- [x] Claim this plan.
- [x] Generator under tools/ with a package script.
- [x] Test: parser fixtures plus a committed-index freshness check.
- [x] Generate and commit standards/INDEX.json.
- [x] Point CLAUDE.md's Start here at the index.
- [x] Gates run and pasted into a run report.
