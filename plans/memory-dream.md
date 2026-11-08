---
id: memory-dream
status: doing
track: ai
depends: []
touches:
  - tools/
  - plans/
  - standards/
  - artifacts/runs/
  - package.json
  - view/pages/
owner: ai
---
# Memory dream — a hindsight pass over the store

> Asked by the owner on 2026-11-09: look at Brad Abrams' dreaming cookbook and apply what it can to
> the loop. The store this project's sessions read every morning had never been read backwards, and
> the index had grown to 11,162 characters, the largest single file a session reads before it starts.

## Source, and what is owed to it

Brad Abrams, **Dreaming with a dynamic workflow**, Claude Cookbook, published 2 November 2026, at
[the cookbook](https://platform.claude.com/cookbook/managed-agents-cma-dreaming-with-a-dynamic-workflow).
The code and the example transcripts are Anthropic's; the pattern is his.


What is taken: the shape of the pass. Finished work is exported to plain text, one file per unit; an
analyzer reads each file and distills it into small linked memory files; one organizer runs once,
after every analyzer, and tidies the store. Facts go stale and must be dated and superseded rather
than copied. Tool results carry the evidence. Coverage is checked, not assumed.

What is changed, and why. His lead agent runs on Managed Agents and the pass runs nightly from cron.
Ours runs in the session, on the store, at the close of work, for the reason in "The trigger" below.
His inputs are session transcripts only. Ours are two lanes, because this project already writes a
cheaper and better input than a transcript: the run report.

Whoever changes the analyzer prompt changes what the store keeps, which is his own warning about the
one place to edit.

The credit also sits on `/reading`, in the shelf and its card, because that page is where a reader
goes to see whose work shaped this one, and a citation that only a standards page carries is a
citation the reader never meets.

## The two lanes

`bun run dream export` builds the corpus and writes a manifest; `bun run dream verify <run-dir>`
proves every source in the manifest has an output, which is his coverage check.

- **runs**: `artifacts/runs/*.md`, this project's own run reports as one corpus, 57 of them and
  556 KB at the 2026-11-09 export. Compact, dated, written with hindsight, and the lane to read
  first.
- **sessions**: DeepSeek Harness transcripts from `~/.dsh/sessions`, one text file per session. Rich
  and enormous. At the 2026-11-09 02:20 export: 19 sessions, 31.3 MB compressed, 5.8 MB delivered
  under a cap of 700,000 characters per session, which is about 724 KB once UTF-8 is counted. A
  further 9.2 MB was clipped and 127.6 MB never reached the page at all, because it was reasoning,
  system prompt or harness boilerplate. Both figures are in the manifest. The count grows
  while a session is open, because the harness writes a transcript per spawned child, so those
  numbers are dated rather than durable. The renderer drops the
  reasoning, the harness preamble and the workspace-instruction block the harness repeats in user
  turns, which is most of what a raw transcript holds. A trimmed transcript is never reported as read
  whole, and no analyzer may record a fact that only the elided middle could have carried.

## How to run one

```sh
bun run dream export                                  # both lanes, into a private temporary dir
bun run dream export --lane runs --since 2026-08-01   # just the run reports, from a date
bun run dream export --lane sessions                  # just this project's transcripts
bun run dream verify <run-dir>                        # every source has an output worth reading
```

The export prints the run directory and writes `manifest.json` beside the text. One analyzer gets
one unit: a single session file, or the runs corpus, or a half of the store. The organizer gets all
the proposals and nothing else, and is the only agent that writes. Applying its index is a copy over
`MEMORY.md` in the store, taken after the current file has been copied into the run directory, and
the next session's checklist is the check that the store still loads.

What proves it worked, rather than that it ran: every note file has a line in the new index, and no
line points at a file that is not on disk.

```sh
bun run dream check-index <store-dir>
```

It reads `MEMORY.md`, lists the notes beside it, and exits nonzero on an unindexed note, a dead link
or a note linked twice. The index this plan produced reports 99 links across 99 notes, every note
covered and every line real. That command exists instead of a shell one-liner because the obvious
one, `grep -o '](.*\.md)'`, is greedy and mangles a line that carries three links, which is exactly
the line the old index had.

## The trigger: session close, never a schedule

LOOP section 2b rules out, in its own words, "no chore whose output is a judgment", and a dream's
output is exactly that: which facts are still true. So it does not go on the promotion table and it
does not run from cron, however well it worked on a cron in the cookbook. It runs in the cognitive
tier, at the end of a bounded piece of work, where a person is already reading what it produced. The
cookbook's nightly job is a fine thing to run when a store has no owner watching it. This one does.

## Guardrails

- **Private run directory.** A transcript holds every tool result the session saw, secrets included.
  This is a public repository and `artifacts/` is served at `/artifacts`, so `tools/dream.ts` refuses
  an `--out` inside the project, creates the directory 0700, and writes session files 0600. Only the
  run report, written by hand, is published.
- **One project at a time, which bounds the source and not the content.** The dream reads this
  project's transcripts and this project's store. An estate-wide dream would pull employer and
  student material into one place, which is the human lane for a reason. The bound is a filter and
  not a guarantee: a session run here can hold a tool result that quotes another repository, and the
  renderer cannot tell one path from another. Treat a transcript as possibly carrying someone else's
  material, and keep the run directory private for that reason as much as for the secrets.
- **A snapshot before a write.** The store is a git repository. Copy `MEMORY.md` and any file about to
  change into the run directory first, and show the diff before it is committed.
- **The store is a cache.** A memory that contradicts the code is wrong. The dream may propose that a
  fact is stale; only a command settles it. Anything unproven goes in the report as unproven.
- **Retire is not delete.** SESSION-LOOP section 4 says a memory that turns out wrong is fixed or
  deleted. A dream does the fixing half: a note whose fact has died is marked, its replacement named,
  and it moves to the closed shelf rather than vanishing. Deletion is for a duplicate whose survivor
  already carries every sentence, and that is a change a person reads before it happens, not one a
  pass performs.

## The analyzer prompt

One per lane unit. Absolute dates, full prose, no inference presented as observation.

```text
You are one analyzer in a dream. Read the source you were assigned in full.
If it carries an elision marker, that span is unknown to you: never assert a fact that only the
elided part could have carried, and say in your report that the source was partial.
Record only what the source shows, with an absolute date taken from it.

A fact that newer evidence supersedes gets a dated replacement, never a silent overwrite.
A fact the store already holds, differently worded, is a duplicate and gets merged, not copied.
A fact about work that has shipped or been deleted is orphaned and gets retired.

Write a proposal, never a store edit, with these sections: store health, entries to update,
entries to retire, facts missing from the store, and where the evidence was too thin to decide.
Never copy a secret, a token, or a private person's detail into the proposal.
```

## The organizer prompt

One per dream, after every analyzer. This is the only agent that writes, and it writes the index.

```text
You are the organizer. Merge the analyzers' proposals into a new index for the store, MEMORY.new.md,
and a report. Every existing line that is still true survives, shortened if it must be, and never
silently dropped. One line per entry: the link, a separator, then enough to decide whether to open
it. At most eight section headings. Do not invent an entry that no analyzer proposed and no existing
line covers. The budget is 8,500 characters for this index, against a cold start of 20,000
characters across the four files a session loads, and the index was 11,162 bytes when the pass
began. Report the character and line counts before and after, every
entry retired, every entry added, and every line you kept that an analyzer wanted gone along with
why. Exit through nothing but the index: the notes themselves change on a later pass, with a person
reading the diff.
```

## Tasks

- [x] Read the cookbook and map it to this loop. **Done 2026-11-09.** Reproducible finding: the store
      format SESSION-LOOP section 4 asks for is the cookbook's store format, arrived at independently.
      The missing piece was never the format, it was the pass that reads it backwards.
- [x] `tools/dream.ts` with the two lanes, the trim, the manifest and the coverage check, and
      `tools/dream.test.ts` covering the renderer, the trim, the slug rules and the out-of-repo rule.
      **Done 2026-11-09.**
- [x] Run the export on this project and record the real sizes. **Done 2026-11-09**, numbers in "The
      two lanes".
- [x] Credit the source in LOOP section 5's research base, where this project's citations live.
      **Done 2026-11-09**, and the mounted loop-standard skill was re-synced from the canon the same
      day, because a citation that only exists in a standard no agent mounts is not a citation.
- [x] Dream the store once: three analyzers (run reports, each half of the store), one organizer, a
      new `MEMORY.md` applied over a snapshot. **Done 2026-11-09.** The index went from 11,162 bytes
      and 120 lines to 8,496 bytes and 133 lines, 99 links for 99 notes, 33 hooks corrected, and the
      store carries its own commit. The notes themselves were not touched, which is the second task
      below.
- [x] Write the run report at `artifacts/runs/2026-11-09-memory-dream.md`. **Done 2026-11-09.**
- [ ] Wire the pass to session close, in the close skill, so the trigger is the one this plan argues
      for rather than a step someone remembers.
- [ ] A second dream, later, that is allowed to merge and retire the notes themselves, once the index
      pass has shown the proposals are worth acting on.

## What this does not do

It does not schedule anything. It does not prove that a session is free of another project's
material, only that the run is bounded by this project's transcript directory. It does not touch another project's store. It does not delete a note.
It does not claim the transcripts were read whole when the manifest says they were trimmed. And it
does not publish the store, because the store holds the working context a public repository must not.
