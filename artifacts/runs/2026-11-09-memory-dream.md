---
title: A memory dream, and the credit for it
date: 2026-11-09
status: complete
lane: gated
branch: main
scope: [tools, plans, standards, artifacts, view]
touched:
  - tools/dream.ts
  - tools/dream.test.ts
  - plans/memory-dream.md
  - standards/LOOP.md
  - package.json
  - artifacts/runs/2026-11-09-memory-dream.md
  - artifacts/reviews/2026-11-09-memory-dream/plan.png
  - artifacts/reviews/2026-11-09-memory-dream/loop-credit.png
  - artifacts/reviews/2026-11-09-memory-dream/reading-shelf.png
  - artifacts/reviews/2026-11-09-memory-dream/reading-card.png
  - view/pages/reading.html
diffstat: 10 files changed, 1123 insertions(+), 1 deletion(-), this report not counted
unpushed: 3, the change and its two follow-ups, left for the owner to push
verifiedBy: 942 unit tests, the typecheck, the lint gate at 4483, 27 tests in the new file, a second-pass review by an agent that did not write the change, and four screenshots
doctor: run at 02:16, the context row still warns at 28,834 characters across four files, the index is no longer the largest of them
---

## What was asked

Two messages. The first pointed at Brad Abrams' cookbook page and asked how it relates to the AI
workflow here. The second said to do it, improve what we could, and credit the author accordingly.

## What the cookbook is

A background pass over finished sessions that rewrites the memory a future session reads. Sessions
are exported as plain text, one file each; an analyzer distills each file into small linked memory
notes; one organizer runs after every analyzer and tidies the store. Facts that go stale are dated
and superseded rather than copied, and coverage is checked rather than assumed. It runs nightly from
cron on Managed Agents. Credit and links are in `plans/memory-dream.md`, in the header of
`tools/dream.ts`, in both prompts, and in LOOP section 5.

## What the mapping found

The store format the cookbook describes is the one SESSION-LOOP section 4 already asks for: one fact
per entry, a description line, wikilinks, and a single index that gets scanned every session. Two
projects arrived at the same shape independently. The gap was never the format, it was the pass that
reads the store backwards. Nothing in this estate had ever done that, and the measured evidence was
sitting in the store: 99 notes, 448,593 bytes, and an index that had grown to 11,162 characters,
which made it the largest single file a session read before it started work.

## What was built

`tools/dream.ts`, with `bun run dream export` and `bun run dream verify <run-dir>`. Two lanes, where
the cookbook has one:

- `runs`: this project's 56 run reports, 542 KB. Dated, compact, already written with hindsight.
- `sessions`: DeepSeek Harness transcripts from `~/.dsh/sessions`, rendered to labeled plain text.
  At the 02:20 export this was 19 sessions, 31.3 MB compressed, 5.8 MB delivered under a cap of
  700,000 characters, with 9.2 MB clipped and 127.6 MB that never reached the page at all.

The renderer keeps user turns, agent text, tool calls and tool results, and drops the reasoning, the
harness preamble, the system prompt, and the workspace-instruction block the harness repeats in every
user turn, which is most of what a raw transcript holds. A transcript over the cap keeps its head and
its tail and says in the text how much it dropped, so no analyzer can record a fact that only the
elided middle carried. `verify` proves every source in the manifest has an output, and it fails when
an output exists but nothing was read into it, when a log line would not parse, or when a lane
exported nothing at all.

The out directory defaults to the system temporary directory and is refused inside the project, since
a transcript holds every tool result a session saw and this repository serves `artifacts/` at
`/artifacts`. The check runs twice: once before creating the directory and once after, through
`realpath`, because a symlink from a temporary directory into the repository would otherwise read as
outside it.

## The dream, and what it changed

Three analyzers ran: the run reports against the store, and each half of the store read in full by one
agent. Their proposals are 77 KB and are the durable half of this run. Counts, by their own accounting:
of the 99 notes, 40 are still true, 24 superseded, 7 duplicate, 21 too big, 7 unclear.

One organizer merged them into a new index. Measured on disk: 11,162 characters and 120 lines before,
8,496 characters and 133 lines after. Coverage is 99 links for 99 notes, no unindexed file and no
dangling link, checked mechanically rather than trusted. Thirty-three hooks changed their claim, so a
session that opens nothing is no longer told that the 0.5B model got 18 of 18 wrong without being told
it landed 7 of 15 after the 2026-08-15 narrowing, that DRAFT gates nothing, that the talk lives at
/talk, or that "wired almost nowhere" is the current state of the loop.

The line count rose because the old index packed 24 notes into grouped lines and the new one gives
almost every note its own bullet, which is what makes the coverage auditable.

The passes also produced 35 proposed new notes, queued rather than created, and three contradictions
across the halves that the index now states but the notes still carry. Both are in
`plans/memory-dream.md`'s sibling report and in the handover below.

## The credit

Brad Abrams, **Dreaming with a dynamic workflow**, Claude Cookbook, 2 November 2026,
[the cookbook](https://platform.claude.com/cookbook/managed-agents-cma-dreaming-with-a-dynamic-workflow).
The code and transcripts in it are Anthropic's; the pattern is his.

It lands in four places: a paragraph in LOOP section 5's research base, the plan, the tool header, and
both prompts. The LOOP paragraph is the one that matters, because that section is where this project
puts the sources it argues from, and the mounted `loop-standard` skill was re-synced from the canon the
same day so an agent reads it too rather than only a browser.

## Gate output

```text
### bun run check
$ tsc --noEmit
### bun test
 942 pass
 0 fail
 3986 expect() calls
Ran 942 tests across 50 files. [10.96s]
### bun tools/lint-gate.ts
lint gate: level. 4483 flag(s) total (oxlint + voice-lint), matching or under the 4483 in
tools/lint-baseline.json (generated 2026-11-08).
```

## What the gate did not cover

The unit suite does not run the browser, so the rendered surfaces were screenshotted instead: the
plan at `/plans/plan/memory-dream`, the credit paragraph on `/standards/loop`, and the shelf and card
on `/reading`, all in `artifacts/reviews/2026-11-09-memory-dream/`.

The static export was run as well, with `PUBLIC_ORIGIN=https://portfolio.tjakoen.com`, and
`verify:export` returned OK: every internal href and src in the exported HTML resolves, and every
mermaid fence in served content is named and cached. The same export without the origin bakes
`http://localhost:3330` into the sitemap and fails 428 checks, all of them the origin, none of them a
page. That is a local-export artifact rather than a property of this change, and it is worth knowing
before someone reads a red run as a broken page.

The doctor's context row still warns. It now measures four files rather than two, and the total is
28,834 characters, so the warning did not clear even though the index lost 2,666 of them. The four are
the repo front door at 10,066, the machine front door at 9,308, the index at 8,496, and the machine
import at 964. The honest reading is that the index is no longer the largest, and the next cut is the
repo's own front door, which is not this pass's business.

Nothing here measured whether an analyzer's proposal is right. Three of them were spot-checked against
the notes they describe, which is not the same as checking the other thirty-three.

## Not done, and what needs human eyes

- The 35 queued notes were not created, and no note was merged, split or deleted. A fold is a store
  edit, and an index may not point at a file that does not exist, so the queue waits for a second pass.
- Three cross-half contradictions are stated in the index but not fixed in the notes: the context
  window (835k in one description, 1M in its body), the answer channel (a deleted Record button beside
  a write nobody has shown reaching the log), and DRAFT status (gated nowhere on 2026-08-14, hiding
  eight surfaces on 2026-08-20).
- The dream is not wired to session close. The plan argues the trigger and leaves the wiring as a task,
  because LOOP section 2b forbids putting a judgment on a schedule and the cookbook's cron is exactly
  what this one declines.
- The memory store is a separate git repository, `~/Local/agent-config`, and it carries its own
  commit for the new index, with a copy of the previous one at
  `nimbalyst-local/dream-2026-11-09/MEMORY.before.md`. It is not pushed. `wcag-gate.md` was already
  untracked in that repository before this run and was left for whoever wrote it.
- The transcript lane has never been read by an analyzer. The dream this session ran read the run
  reports and the store; the 5.7 MB of session text is exported, verified and unread.

## The second pass

A separate agent that did not write the change reviewed all four files and returned SHIP WITH FIXES,
with fifteen findings: four must fix, nine should fix, two notes. The four must-fix findings were real
and are fixed:

- `isInside` read any name starting with two dots as a climb, so `--out /repo/..foo` was allowed and
  would have written transcripts inside the repository the guard exists to protect. Only `..` and
  `../x` count as outside now, and a test pins it.
- The root came from the shell's working directory, so running the tool from `tools/` with
  `--out ../artifacts` put session text in the served public tree. The root is now derived from the
  module's own directory and a test proves it is the repository.
- A session id became a filename without sanitizing, so a log naming itself `../x` could write outside
  the private run directory. Ids are sanitized, refused ones are named in the export output, and a
  test covers the traversal.
- The tool advertised a 700 KB cap but enforced 700,000 characters, and the header was appended after
  the trim, so the largest delivered file was 724 KB. The cap is now characters, the header and the
  marker are paid for inside it, and a test asserts the length.

The should-fix findings were accepted too, apart from one. The runs lane was one manifest row per
report pointing at a single shared file, which double-counted its bytes and would have multiplied any
trim by 56; it is now one corpus row. Coverage passed on a header-only file, which is now an EMPTY
failure, and unparseable lines are counted and reported rather than skipped in silence. The plan
gained the missing `package.json` in its touches, a budget number in the organizer prompt, a sentence
in the analyzer prompt about what an elision marker means, a reconciliation with SESSION-LOOP's
fix-or-delete rule, and a correction of the "one project at a time" guardrail, which bounds the
source and not the content. Four tests were added for the cases the reviewer named as uncaught.

The declined finding is small: the plan asked for plans/memory-dream.md to be a link in LOOP, and a
relative climb out of standards/ fails the link checker by design (the same class as
`../docs/PHILOSOPHY.md`, which is flagged dead). The standard names the file in plain text, and this
report carries the link.

## Follow-up, after checking the work

Three things came out of exercising it rather than reading it.

The credit also sits where a person reads it: `/reading` gained a shelf entry and a card for the
cookbook, in his name, with the address of the chapter. The shelf now holds thirteen works and wraps
to a second line, which is what its stylesheet is built for.

The tool had a real defect that only a run would show. Frontmatter was read from the first 400
characters, and a real run report spends more than that on its title and fields, so `date:` fell
outside the window, every report came back undated, and `--since` skipped all of them. The filter
looked like it worked because it returned nothing quietly. It now reads the whole frontmatter block,
a test carries a title long enough to reproduce the bug, and `--since 2026-11-01` returns 14 reports
where it returned none.

The coverage claim was a paragraph and a fragile shell one-liner, and the one-liner was wrong: the
obvious `grep -o '](.*\.md)'` is greedy and mangles the one index line that carries three links. It
is now `bun run dream check-index <store-dir>`, with three tests, and it reports 99 links across 99
notes, every note covered and every line real.

## Files

`tools/dream.ts` and `tools/dream.test.ts` are new. `plans/memory-dream.md` is new. `standards/LOOP.md`
gained one paragraph, and the mounted skill was re-synced from it. `package.json` gained one script,
then a second command inside the same tool. `view/pages/reading.html` gained one shelf entry, one
card and a name in the description. No route changed: `/reading` already existed and the shelf wraps.
