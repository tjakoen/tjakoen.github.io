---
id: desk-download-consent
status: done
track: chat
depends: []
touches: [src/ai/, scripts/site.js, e2e/]
owner: ai
---

# Ask before the desk downloads 350 MB

The desk used to start the model download on a visitor's first message, without asking. A 350 MB
download is too large to start for someone who was not told, so the desk now asks first. A visitor
who agrees sees the progress bar and the answer. A visitor who says not now downloads nothing and is
pointed to Browse. A visitor with a saved copy is never asked, because nothing downloads.

- [x] Add the download question to the desk's chat, with a yes and a not now button
- [x] Ask before both places the desk starts a visible load, and never when a saved copy or engine exists
- [x] Keep the question out of the saved chat history, and update the e2e tests that script the model
- [x] Unit tests, e2e tests and a screenshot of the question, the yes path and the not now path

The run report is artifacts/runs/2026-11-22-desk-download-consent.md.

## What we learned

- Topic: desk
- Changed: The desk asks before it downloads the model, with the size and Download or Not now buttons in its own bubble. A saved copy or a loaded engine skips the question.
- Why: A 350 MB download is too large to start for someone who was not told, and the first message used to start it on its own.
- Dropped: A modal dialog and a separate banner, because the desk already asks questions as chat bubbles with buttons.
- Remember: Seven e2e files that script the model pre-answer the question in their init script, so a new model-scripting test needs the same line.
- Closed: 2026-11-22T17:48:56.394Z by claude (claude-sonnet-5-5) on TJ
