---
id: session-archive-line
status: done
owner: ai
track: standards
depends: []
touches: [standards/BRIEF.md, standards/GLOSSARY.md, standards/INDEX.json, artifacts/runs/]
---

# End every message with whether the session can be archived

- [x] Give BRIEF section 11 the closing archive line: the work, what is open, the parent when there is
  one, and one of three verdicts.
- [x] Add the checklist item, the rationalisations and the verification bullets that hold the line to
  its evidence.
- [x] Define Archive in GLOSSARY and regenerate the standards index.
- [x] Run the prose gates and look at the rendered section.

## Verification

The section sits in `standards/BRIEF.md` after section 10 and before the checklist, with three worked
lines: a finished child, a child with work left, and a parent held by its children. The checklist gained
item 13, the rationalisations table gained three rows, and the verification list gained two bullets, all
holding the verdict to the gates the run actually ran.

`bun run standards:index` rewrote `standards/INDEX.json` to 31 standards and 279 sections. `bun test`
passed 1063 of 1063, `bun run check` was clean, voice-lint reported 0 flags on BRIEF.md and GLOSSARY.md,
link-lint found no dead relative links across 92 rendered files, `bun run lint:runs` reported 0 problems,
and the lint gate read 4498 flags against a baseline of 4528.

The rendered page was read from the dev server at `localhost:3000/standards/brief`: one heading, one
table of four rows and three code blocks, and no em dash in the new text.
