---
id: voice-file-reader-first
status: done
track: chat
owner: ai
depends: []
touches:
  - content/notes/the-voice-file.md
  - scripts/figure-voice.js
  - scripts/figures.js
  - view/components/molecules/live-figure/live-figure.css
  - e2e/voice-file.e2e.ts
  - package.json
  - standards/INDEX.json
  - tools/social-card-voice.ts
  - content/media/notes/the-voice-file-social-ticket.png
  - content/tours/review-voice-file.md
  - artifacts/runs/
---

# Make the voice file note teach language the writer understands

The owner wants the note and social copy to explain why pasted AI wording burdens the reader.
Lead with the sign-in report rewrite, keep ticket layout as a second lesson, and carry both examples
into the VOICE.md starter. Add an accessible interactive comparison and regenerate the social card.

- [x] Revise the note, starter, and social copy.
- [x] Add an interactive before-and-after and matching social card.
- [x] Verify the rendered note at desktop and phone widths and record checks.

Scope ends at local changes and preview. Preserve existing publication status and unrelated edits.

Verification found one stale generated DESIGN-STANDARD section summary in standards/INDEX.json.
Regenerate the index to restore the unit gate; do not edit the standard itself.

## What we learned

- Topic: voice file note
- Changed: Revised the note, template and social copy; added an interactive comparison and regenerated its social card.
- Why: Show the reader cost of AI wording while preserving exactly the same facts in both versions.
- Dropped: Dropped the original across-devices claim because it changed the facts instead of isolating the wording.
- Remember: Both examples say laptop sign-in worked, the dashboard opened, and phone testing is pending. The full browser suite has seven failures outside the note's targeted checks.
- Closed: 2026-11-20T22:46:57.109Z by codex on Tjakoens-MacBook-Air.local
