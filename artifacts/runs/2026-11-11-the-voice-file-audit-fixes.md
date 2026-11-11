---
title: Voice file audit fixes
date: 2026-11-11
status: complete
lane: direct
branch: main
scope:
  - content/notes/the-voice-file.md
  - standards/VOICE.md
  - standards/NOTE-STANDARD.md
  - content/media/notes/the-voice-file-social-ticket.png
  - src/content.ts
  - view/components/molecules/share-block/share-block.css
touched:
  - content/notes/the-voice-file.md
  - standards/VOICE.md
  - standards/NOTE-STANDARD.md
  - content/media/notes/the-voice-file-social-ticket.png
  - src/content.ts
  - view/components/molecules/share-block/share-block.css
  - artifacts/runs/2026-11-11-the-voice-file-audit-fixes.md
plans: none. The owner asked for the page audit fixes in chat.
gates:
  - bun install --frozen-lockfile
  - bun run check
  - bun test
  - bun tools/lint-gate.ts
  - bun run lint:voice -- content/notes/the-voice-file.md
  - bun run lint:links
  - bunx playwright install chromium
  - bunx playwright test --ignore-snapshots --workers=5
  - bun ../pantry/cli.ts doctor .
diffstat: Four tracked files changed. The draft note, its social card, and this report are new.
unpushed: One local commit on main for this run, as requested.
verifiedBy: An independent audit checked the source claims, starter, and shared clipboard behavior. Its two follow-up findings were corrected and the updated copy was checked in Chromium.
doctor: 23 checks, 0 failing, 2 due. Merged graph freshness and ten inherited run-ledger gaps were carried forward.
---

# Voice file audit fixes

The note and the canonical VOICE standard keep the observed counts and drop the estimate of how much visible text was proof. The experiment now names the models, identifies the metric, and gives both banned-word results. The note shows the same export ticket before and after the question moves to line one. It dates the lower adoption of folded feedback to before the format change.

The starter shows the same observations and caveat in both versions of a ticket comment. The revised version puts the question first and folds the two observations under a count. The template wraps on a phone and uses the existing clipboard behavior, which also serves the social copy block.

## Gate output

```text
$ bun install --frozen-lockfile
137 packages installed [2.16s]

$ bun run check
$ tsc --noEmit

$ bun test
 979 pass
 0 fail
 4282 expect() calls
Ran 979 tests across 53 files. [70.24s]

$ bun run lint:voice -- content/notes/the-voice-file.md
voice-lint: 0 flag(s) across 1 file(s) (0 tell, 0 warn).

$ bun run lint:links
link-lint: 66 rendered file(s), no dead relative links.

$ bun tools/lint-gate.ts
lint gate: level. 4374 flag(s) total (oxlint + voice-lint), matching or under the 4528 in tools/lint-baseline.json (generated 2026-11-09).

$ bunx playwright test e2e/calendar.e2e.ts --ignore-snapshots -g 'event share block reports copy success'
  1 passed (5.8s)

320px: figure labels fit (12.9px minimum), template wraps, both copy controls match clipboard text
390px: figure labels fit (15.7px minimum), template wraps, both copy controls match clipboard text
1280px: figure labels fit (15.7px minimum), template wraps, both copy controls match clipboard text
Canonical VOICE: corrected source and model rendered
Final preview: clipboard has the matching before/after evidence; canonical source renders the corrected figures.
404 http://localhost:3000/notes/the-voice-file
404 http://localhost:3000/notes/the-voice-file.md
200 http://localhost:3000/standards/voice

$ bun ../pantry/cli.ts doctor .
23 checks, 0 failing, 2 due
OK
```

## Full browser run

The run recorded 569 passes and eight failures before it stopped producing results. I ended it after three minutes without output, with 28 of 605 cases still unreported. The calendar heading assertion and a representative desk navigation timeout also occurred on the server running the pre-change code. The other failures involved desk navigation, the nest simulation, and a canonical-route test that read a sitemap cached during the temporary preview.

A freshly started server returned 404 for the draft and omitted it from the sitemap. The route chunk rerun on that server stalled beyond its three-minute timeout and did not report a result before I stopped it.

```text
$ bunx playwright test --ignore-snapshots --workers=5
Running 605 tests using 5 workers
  ✓  562 e2e/terminal.e2e.ts:809:1 › the interactive terminal (third client of the one door) › the note mounts its six live colony boxes (19.6s)

Fresh server sitemap omits the draft.
```

## What was not done

The raw review data was outside scope. The note is back in `DRAFT`, and the note and standards changes have not been published. The Chromium checks cover the changed page, the clipboard output, and the narrowest tested layout. They do not establish whether team adoption improves.

## What needs human eyes

The local screenshots show the mobile figure and template and the corrected section of VOICE. The release decision belongs to the owner. The backlog already marks the note as a draft. PANTRY regenerated the mounted VOICE skill and refreshed two other stale generated skills during the same sync.

The isolated worktree remains attached because Codex marks it as this chat’s primary checkout. The four implementation files were verified byte for byte against the main checkout before the archive attempt.

The final social card uses the export ticket example and the typography of the existing portfolio cards. The note and VOICE standards now require an image and alt text with new social post copy. Chromium showed the revised figure and card at 320 and 1280 pixels, and the card downloaded from the share block.
