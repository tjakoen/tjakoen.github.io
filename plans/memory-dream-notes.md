---
id: memory-dream-notes
status: todo
track: ai
depends:
  - memory-dream
touches:
  - plans/
  - standards/
owner: ai
---
# Memory dream, second pass: the notes themselves

> The first dream rewrote the index and left every note on disk. It queued 35 facts the store does
> not hold and found three notes that contradict each other. This plan is that queue, written down so
> it does not evaporate with the session that found it.

## Where the queue came from

Three analyzers read all 99 notes and the 56 run reports on 2026-11-09. Their proposals are in the
dream run report, `artifacts/runs/2026-11-09-memory-dream.md`, and the full organizer accounting is in
the run directory's `organizer-report.md`. The index that came out of that pass is committed in
`agent-config`, and `bun run dream check-index` proves it still covers every note.

## The three contradictions, worst first

1. **The context window.** `session-context-measured.md` says 835k in its description while its body
   says 1M and that 835k was one session. Every session budgets against this number, so a wrong one
   costs the most.
2. **The answer channel.** `answer-channel-drops-answers.md` and `answer-channel-p2-p3.md` describe a
   channel that loses answers, while `p5-answer-on-finish.md` says the Record button was deleted and
   finishing the card writes the answer. No proposal shows an answer reaching `plans/decisions/answers.jsonl`,
   so one of the two is still unverified.
3. **DRAFT status.** `folding-a-note.md` records the 2026-08-14 call that DRAFT gates nothing; the
   2026-08-20 report shows status now hides a note from eight surfaces. Anyone reading the note alone
   will publish or unpublish on a rule that was reversed six days later.

## Tasks

- [x] Settle the context window in `session-context-measured.md`. **Done 2026-11-09.** The body
      already said 1M and named 835k as the largest of twelve sessions; the description was the wrong
      half. Corrected, with a dated line saying which half was wrong.
- [x] Fix or refute the answer channel. **Done 2026-11-09, and refuted.** `plans/decisions/answers.jsonl`
      carries answers and acks through 2026-11-05, and PANTRY owns the route that writes it. The two
      old notes now say they describe the era before P5, and point at `p5-answer-on-finish` for the
      current write path. The defect they recorded was the Record button, not a dropping log.
- [x] Correct the DRAFT paragraph in `folding-a-note.md`. **Done 2026-11-09.** `src/content.ts` now
      hides an explicit DRAFT, so the 2026-08-14 sentence was reversed on 2026-08-20; the older line
      stays as history and is marked reversed.
- [ ] Work the 35 queued facts in the organizer report, in the order it lists them. Each one gets a
      note only if it still holds, and a note is one fact, per SESSION-LOOP section 4.
- [ ] Fold the six duplicate clusters the analyzers named, deleting only where the survivor already
      carries every sentence.
- [ ] Re-run `bun run dream check-index` after the folds, because a fold is where an index breaks.
- [ ] Run one more dream over the result, with the analyzer prompt unchanged, and compare what it
      finds against this list.

## What this is not

Not a rewrite of the store. The 99 notes are mostly right, and the first pass proved the index could
be fixed without touching them. This plan only moves the ones a reader would otherwise be misled by.
