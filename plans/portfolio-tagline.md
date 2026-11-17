---
id: portfolio-tagline
title: Use the personal email tagline on the portfolio
status: done
owner: ai
track: ai
depends: []
touches:
  - view/pages/index.html
  - plans/portfolio-tagline.md
---

Replace the homepage introduction with “I lead teams, build tools, and teach software engineering.” Keep the remaining homepage copy unchanged. Verify the rendered homepage and capture a screenshot for review.

## Follow-up scope

The owner requested a stronger supporting paragraph beneath the new tagline, grounded in the leading and teaching pages and recent notes. Update only that paragraph to connect engineering leadership and mentoring, multi-model AI workflows, and teaching with concrete work. Keep the approved tagline. Verify the rendered result and commit the follow-up locally without pushing.

## Verification

The Playwright browser check produced:

```text
PASS: rendered homepage tagline matches the approved sentence.
PASS: mobile screenshot captured.
```

The desktop screenshot was visually inspected and shown in the chat. The independent reviewer confirmed the exact sentence and found no unrelated tracked edits. The diff whitespace check passed. This copy change did not require the full application test suite.

The implementation diff is one insertion and one deletion in view/pages/index.html. Consulted VOICE, GRAPH, TOUR-STANDARD, AI-DEVELOPMENT and LOOP, along with the route map in docs/HACKING.md and the tokensave welcome query. No deployment was made. Human review covers the wording and screenshot. The source and this plan are committed together. The commit remains local pending the owner’s decision to publish it.
