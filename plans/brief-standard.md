---
id: brief-standard
status: doing
track: standards
depends: []
touches: [standards/BRIEF.md, standards/README.md, standards/INDEX.json, content/notes/the-voice-file.md]
owner: ai
---

# A brief standard: how a run talks to the owner

The owner asked for the other half of VOICE.md: not how the AI sounds like him, but how it talks to
him. The ask first, numbered steps that carry the prompt, a link to anything that renders, bullets for
detail, a table once three things are compared, and plain words. Credited to Kercwin Ocampo, whose
own file pointed the other way first.

- [x] Write standards/BRIEF.md, with the ask first, the prompt rule, the running-link rule, bullets, tables, plain words, one shape per surface, and the light-model note.
- [x] Add the index row in standards/README.md and regenerate standards/INDEX.json.
- [x] Mount it as a skill and point the shared instruction file at it, so it fires on every harness.
- [x] Extend content/notes/the-voice-file.md with the other half of a voice file, and update its frontmatter.
- [x] Run the gates: typecheck, 1,052 tests, link lint, voice lint, lint gate, diagram cache, standards index.
- [x] Render both pages on the dev server and screenshot them.

## What we learned

- Topic: standards
- Changed: A run now has a written shape for everything it says to the owner, on every harness.
- Why: A light model on the OpenCode fallback chain wrote reports with the ask buried, and nothing in the canon owned that surface.
- Dropped: The machine check. A checker for brief shape would need to read meaning, and the checklist plus the review pass is honest about being prose.
