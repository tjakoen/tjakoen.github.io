---
id: note-anyjev-decision-model
status: doing
track: content
depends: []
touches: [content/notes/the-planner-i-said-i-had.md, content/media/notes/the-planner-i-said-i-had-social.png, tools/social-card-planner.ts, package.json, docs/CONTENT-BACKLOG.md]
owner: ai
---

# The note on AnyJev, and the planner my loop did not have

The owner shared AnyJev as a possible way to make the agent loop smarter, more deterministic and
faster, and asked for a note because the repo was trending. Reading it surfaced a live gap: OpenCode
has no `planner` agent even though the registry and the escalation hook both name one.

## Why

The note is the honest version of the session that found the gap. It separates what transfers from a
decision-model library (typed decisions, probabilities, order-bias correction, capped escalation) from
what does not (logits and open weights, a local GPU service), and it uses the loop's own routing state
as the receipt.

## Decisions

- Personal note, not a guide. The subject is a thing the owner checked, not a program for a company.
- The claim under test comes from the published Model Intelligence Layer notes, so the note cites them
  rather than repeating the layer.
- AnyJev's numbers are attributed to AnyJev and flagged as their benchmark, not as a measurement here.
- The note does not announce an installation. It records what was borrowed and what was declined.

## Steps

- [x] Collect the routing and wiring receipts from the live configuration.
- [ ] Draft the note with two figures and a full share block.
- [ ] Render the 1200 by 1200 social card.
- [ ] Run the voice, link, build and test gates.
- [ ] Render the draft and show the opener, the figures and the share block.
- [ ] Add the backlog entry and commit the draft.

## Acceptance

- A DRAFT note at `content/notes/the-planner-i-said-i-had.md` with complete frontmatter.
- Two figures built to FIGURES, each with an accessible name.
- The four wiring receipts named, with the exact commands and the model ids.
- AnyJev's four benchmark numbers attributed in the sentence that uses them.
- `bun run lint:voice`, `bun run lint:links`, `bun run check` and `bun test` green.
- The draft rendered and shown, with the page URL.

## Hard stops

- Do not set `status: PUBLISHED`.
- Do not claim AnyJev improves this loop. It has not been run here.
- Do not name anyone beyond the public authors of the repo.
