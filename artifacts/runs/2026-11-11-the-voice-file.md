---
title: The voice file note
date: 2026-11-11
status: complete
lane: direct
branch: integration/nest-continuation
scope:
  - content/notes/the-voice-file.md
  - docs/CONTENT-BACKLOG.md
touched:
  - content/notes/the-voice-file.md
  - docs/CONTENT-BACKLOG.md
  - artifacts/runs/2026-11-11-the-voice-file.md
plans: none. This was direct work requested in chat.
gates:
  - bun run check
  - bun test
  - bun tools/lint-gate.ts
  - bun tools/voice-lint.ts content/notes/the-voice-file.md
  - bun tools/link-lint.ts
  - bun tools/dsh-loop/cli.mjs end
  - bun ../pantry/cli.ts doctor .
diffstat: a new 221-line note with 1,454 words of prose plus a starter template, 12 lines in the content backlog, and this report.
unpushed: 0
verifiedBy: Rendered at /notes/the-voice-file on a local server at 1280px and 390px, with a geometry check over the figure reporting no intersecting boxes. The canonical standards/VOICE.md was diffed against the stale mounted voice skill; the console exception is the only substantive change, and the starter template was corrected for it. The note was flipped to PUBLISHED for the local review and is uncommitted. Screenshots sit in the gitignored screenshots directory.
doctor: 23 checks, 0 failing, 4 due (graphify freshness, two stale skills, the inherited run-ledger gaps, and 15 commits since the newest report).
---

# The voice file note

The owner approved publication on 2026-11-11. The note now carries PUBLISHED status and the
backlog records the publication date. The rest of this report records the earlier draft review.

A company-facing guide on why AI-drafted tickets, review comments and chat are hard to read, and
the short file a team commits to stop it. The argument is that teams wrote down how their code
should be built and left the writing unspecified, so the agent fills the gap with its default:
context first, the ask in paragraph four, proof before action.

The missing artifact is a voice file, committed as VOICE.md at the repository root. The note gives
the rules that transfer between teams rather than the taste that does not: front the ask, fold the
proof under one counted label, never fold a hedge, keep a one-line comment to one line, and give
each surface its own register. It names the idea once, then refers back to the file.

The evidence is the review snapshot already published in VOICE: 25 review bodies with the verdict
on the last line in all 25, and 41 comments averaging 694 visible characters where the claim and
the ask ran a median of 253. The note flags it as a snapshot and as a floor rather than proof,
because the adoption question is still open.

The artifact carries a flow figure, a copyable starter template, and a link to the published
standard as the long reference rather than as the team's own file. The backlog entry records the
draft.

The first figure render let the two outcome boxes share 20 user units, so the emphasis box covered
the left box's border. The second pass widened the canvas to 440 by 290, spaced the outcome boxes
20 units apart, and moved the branch labels with them. A geometry check over every rect reports no
intersections.

The mounted voice skill is stale. It was synced on 2026-11-08 and the canonical VOICE.md gained
the console exception on 2026-11-10. A diff shows that as the only substantive change. The note's
prose uses no inline code, so no prose line moved. The starter template did conflict: its blanket
"Code blocks only" would forbid the literal terminal output a ticket comment often needs, so it now
reads "Code and literal terminal output only, never for emphasis." A second first-person line was
also cut, leaving the guide's single allowed line.

The note was DRAFT at the end of the content pass. For the local review it was flipped to
PUBLISHED and served at localhost:3000. It is uncommitted, and the flip goes back to DRAFT when the
review ends.

## Gate output

```text
$ bun run check
$ tsc --noEmit

$ bun tools/lint-gate.ts
lint gate: level. 4374 flag(s) total (oxlint + voice-lint), matching or under the 4528 in tools/lint-baseline.json (generated 2026-11-09).

$ bun test
 979 pass
 0 fail
 4283 expect() calls
Ran 979 tests across 53 files. [19.10s]

$ bun tools/voice-lint.ts content/notes/the-voice-file.md
voice-lint: 0 flag(s) across 1 file(s) (0 tell, 0 warn).

$ bun tools/link-lint.ts
link-lint: 66 rendered file(s), no dead relative links.

$ bun tools/dsh-loop/cli.mjs end
graphify update: ok
bun run check: ok
bun tools/lint-gate.ts: ok
git status: dirty
  M docs/CONTENT-BACKLOG.md
  ?? content/notes/the-voice-file.md
unpushed: 0

$ bun ../pantry/cli.ts doctor .
23 checks, 0 failing, 4 due
```

## What was not done

Published. The note stays DRAFT, per the note standard, until the owner says otherwise. The
screenshots were taken under a temporary PUBLISHED flip, and the flip is reverted.

No social image. The frontmatter carries ready-to-post copy, but a card is a separate asset.

No CRUMB tour. The rendered page is shown as screenshots at desktop and phone widths, which the
repo's non-negotiable allows for a page, so the reviewer sees the real render rather than a patch.

## What needs human eyes

Read the note for voice. The argument is mine, but the register is a guide, and only the owner can
say whether it sounds like him.

Check the two examples in the template. They are illustrative rather than taken from a real
tracker, and the note tells the reader to replace them. A real pair from the team would be better.

Decide the publish state, and whether the starter template should also exist as a file another team
can take without copying it out of the note.

The doctor's carried warnings are unchanged from before this run: the merged graph predates this
repository's extraction, intake and voice are stale in the skills mount, and the run ledger's
inherited gaps remain. None of them touch the note.
