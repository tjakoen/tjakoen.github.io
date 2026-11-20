---
title: Make the voice file note teach words the writer would use
date: 2026-11-21
status: complete
lane: direct
branch: main
scope:
  - content/notes/the-voice-file.md
  - content/media/notes/the-voice-file-social-ticket.png
  - scripts/figure-voice.js
  - scripts/figures.js
  - view/components/molecules/live-figure/live-figure.css
  - tools/social-card-voice.ts
  - e2e/voice-file.e2e.ts
  - content/tours/review-voice-file.md
  - package.json
  - standards/INDEX.json
  - plans/voice-file-reader-first.md
  - artifacts/runs/
touched:
  - content/notes/the-voice-file.md
  - content/media/notes/the-voice-file-social-ticket.png
  - scripts/figure-voice.js
  - scripts/figures.js
  - view/components/molecules/live-figure/live-figure.css
  - tools/social-card-voice.ts
  - e2e/voice-file.e2e.ts
  - content/tours/review-voice-file.md
  - package.json
  - standards/INDEX.json
  - plans/voice-file-reader-first.md
  - artifacts/runs/voice-file-desktop.png
  - artifacts/runs/voice-file-phone.png
  - artifacts/runs/voice-file-opener.png
  - artifacts/runs/2026-11-21-voice-file-reader-first.md
plans: voice-file-reader-first
consulted:
  - skill:voice
  - skill:note-standard
  - skill:figures
  - skill:loop-standard
  - skill:tour-standard
  - skill:create-note
  - skill:ai-development
  - skill:session-loop
  - skill:graph
  - graph:the-voice-file
  - graph:mount
gates:
  - bun install --frozen-lockfile
  - bun run check
  - bun test
  - bun run lint:voice -- content/notes/the-voice-file.md
  - bun run lint:links
  - bun tools/lint-gate.ts
  - bunx playwright test e2e/voice-file.e2e.ts --reporter=line
  - bunx playwright test
  - bun node_modules/@tjakoen/crumb/cli.ts check content/tours
  - bun ../pantry/cli.ts doctor .
diffstat: 15 task files, including three rendered screenshots and this report. The pre-existing bun.lock and GRAIN dependency changes are excluded from this task's scope.
unpushed: 1
verifiedBy: An independent agent reviewed the note, starter, figure, and rendered card twice, including the owner's correction to keep the facts identical. It reported no findings on the final comparison.
doctor: 15 checks, 0 failing, 0 due. Settings drift, missing skill links, and the stranded work named at session start were left untouched.
---

# Words the writer can explain

The note now opens with the effort an AI draft passes to its reader. The main example rewrites a
sign-in report into words the writer would use. The ticket layout lesson follows it, and the starter
contains both examples. The social copy carries the owner's approved message.

The owner caught a problem in the first comparison: its AI draft claimed consistency across devices,
while the rewrite said the phone was untested. That mixed wording with factual accuracy. The final
comparison gives both versions the same facts: laptop sign-in worked, the dashboard opened, and phone
testing is pending. Only the wording changes, including in the card and the starter.

The HTML figure has keyboard-operable controls for the AI draft, the rewrite, and both versions. The
server sends both examples, so no JavaScript is needed to read them. Print shows both even after the
reader selects one. Its module loads only on pages that use it. The card renderer produces the matching
1200 by 1200 PNG and checks text against the canvas bounds.

## Gate output

```text
bun install --frozen-lockfile
Checked 139 installs across 156 packages, no changes.

bun run check
tsc --noEmit: passed.

bun test
Initial run: 1026 pass, 1 fail. The committed standards index had a stale DESIGN-STANDARD summary.
Regenerated standards/INDEX.json without editing the standard.
Final run: 1027 pass, 0 fail, 5425 expect() calls, 58 files.

bun run lint:voice -- content/notes/the-voice-file.md
0 flags across 1 file.

bun run lint:links
82 rendered files, no dead relative links.

bun tools/lint-gate.ts
Advisory differences: voice:emoji 73 -> 95; oxlint:eslint(no-shadow) 0 -> 3.
The baseline was not changed. Oxlint on the new figure, card renderer, and browser test was clean.

bunx playwright test e2e/voice-file.e2e.ts --reporter=line
Before implementation: 2 failed because the figure and its controls did not exist.
After implementation and the wording correction: 2 passed.
Covered keyboard operation, version switching, phone width, and the no-JavaScript fallback.

bunx playwright test
633 passed, 7 failed, 640 tests, 24.5 minutes. The complete suite included the macOS visual comparisons.
The note's two tests passed within this full run as well.
Failures: desk-tour full walk; grain-page Welcome content; grain-page AI demonstration;
nest-scenarios rival trails; visual Welcome baseline; visual catalog baseline;
welcome-flagship proof links. No baselines were replaced and none of these other surfaces was edited.

bun node_modules/@tjakoen/crumb/cli.ts check content/tours
All 32 tours parsed, including the new four-step review tour.

bun ../pantry/cli.ts doctor .
15 checks, 0 failing, 0 due.

tokensave sync
Completed; reported existing tool-permission and hidden-file exclusions.
```

## Rendered evidence

The desktop and phone screenshots were inspected after the wording correction. The social PNG was
inspected separately. The independent reviewer also confirmed that print restores both versions after
selecting a single version.

- [Opening](voice-file-opener.png)
- [Desktop comparison](voice-file-desktop.png)
- [Phone comparison](voice-file-phone.png)
- [Social image](../../content/media/notes/the-voice-file-social-ticket.png)

## Retrieval trace

Read the live note and its local source, the VOICE and NOTE-STANDARD instructions, FIGURES' HTML figure
contract, the create-note procedure, and the relevant loop and review-tour instructions. PANTRY supplied
the project orientation and available plans. The code graph located the figure loader and existing
social card renderers; source inspection supplied their actual contracts.

## What was not done

Nothing was deployed or pushed. The note's publication status and original date were preserved. The
pre-existing GRAIN dependency update in package.json and bun.lock was left intact; this run added only
the social card command to package.json. The unrelated machine wiring and stranded repositories were
left untouched. No new page skill was created after inspecting the existing coverage.

The finish gate requested a local commit. This run's files and only its social card command in
package.json are included. The dependency update remains uncommitted. The memory dream is carried
forward: its index is seven days old and eight run reports have landed. It needs the export and the
analyzer and organizer passes in plans/memory-dream.md; that separate review was not run here.

## What needs human eyes

The owner should read the revised wording comparison and social card for voice. The broader browser
suite is not green: its seven failures are outside the note's targeted checks and need separate triage.
The original suite completed before an attempted cancellation; all 640 tests have final results.

[Review the change locally](http://localhost:3132/notes/the-voice-file?crumb=review-voice-file&crumb-mode=dev&crumb-frame)
