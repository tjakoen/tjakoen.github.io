---
id: note-anyjev-decision-model
status: done
track: content
depends: []
touches: [content/notes/the-decision-model-i-did-not-install.md, content/media/notes/the-decision-model-i-did-not-install-social.png, tools/social-card-decision-model.ts, package.json, docs/CONTENT-BACKLOG.md]
owner: ai
---

# The note on AnyJev, and what it changed in the loop

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
- [x] Draft the note with two figures and a full share block.
- [x] Render the 1200 by 1200 social card.
- [x] Run the voice, link, build and test gates.
- [x] Render the draft and show the opener, the figures and the share block.
- [x] Commit the draft. The backlog entry follows a PUBLISHED status, which is the owner's call.

## Acceptance

- A DRAFT note at `content/notes/the-decision-model-i-did-not-install.md` with complete frontmatter.
- Two figures built to FIGURES, each with an accessible name.
- The four wiring receipts named, with the exact commands and the model ids.
- AnyJev's four benchmark numbers attributed in the sentence that uses them.
- `bun run lint:voice`, `bun run lint:links`, `bun run check` and `bun test` green.
- The draft rendered and shown, with the page URL.

## Hard stops

- Do not set `status: PUBLISHED`.
- Do not claim AnyJev improves this loop. It has not been run here.
- Do not name anyone beyond the public authors of the repo.

## What we learned

- Topic: notes
- Changed: Drafted the AnyJev note, rewrote it around the repo after the planner drift, and corrected the strong-lane sentence.
- Why: The ask was the trending decision-model repo; the loop test is one section, not the spine.
- Dropped: A note framed as a planner postmortem. It answered a question nobody asked and buried the subject.
- Remember: A live pick is not the design. Run the counterfactual before writing a negative claim.
- Closed: 2026-11-24T14:37:38.956Z by codex (deepseek-v4.1-flash) on Tjakoens-MacBook-Air.local
