---
id: run-report-retrieval-trace
status: done
track: ai
depends: []
touches:
  - artifacts/runs/README.md
  - standards/LOOP.md
  - standards/SESSION-LOOP.md
  - tools/run-report-lint.ts
  - tools/run-report-lint.test.ts
  - package.json
  - tools/dream.ts
owner: ai
---
# A run report names what it read

A run report says what changed and which gates passed. It does not say whether the run read the rule
before it wrote under it. "I followed VOICE" is a claim with nothing behind it, and LOOP section 4a
already says how to treat that: unverified.

The fix is one frontmatter field, consulted, holding a short list of what the run actually opened:
standard sections in the form VOICE.md#section-slug, skill names, and graph queries. It is a list and
not a log. One line per thing read, not one line per tool call.

The section form matches the standards index a sibling session is building (standards/INDEX.json, with
section anchors), and the slug is MILL's slugifyHeading, the same function that stamps the id on the
rendered heading. So an entry is a deep link that resolves on the published page.

## Tasks

- [x] Write artifacts/runs/README.md: the run-report frontmatter shape, with consulted in it.
- [x] Add the rule to LOOP section 4a and the checkbox to LOOP section 9; point at it from
      SESSION-LOOP section 1, where the reading happens.
- [x] Build tools/run-report-lint.ts: entries well formed, every standard file exists, every anchor
      resolves to a heading in that file, and a report dated on or after 2026-11-17 carries the field.
- [x] Test it, wire it as bun run lint:runs.
- [x] Write this run's report using the field, with gate output pasted.

## Scope growth

tools/dream.ts was not in the first cut. It counts every Markdown file in artifacts/runs as a run and
folds each into the dream corpus, so the new README would have been read as a report. It now skips
README.md by name, two lines.

## Limits

The lint proves an entry points at a real section. It cannot prove the run read it, only that the run
named something that exists. A fabricated but valid list passes. The trace makes the claim specific
enough to be checked against a transcript by a person or a later audit, which is the step up from no
claim at all.
