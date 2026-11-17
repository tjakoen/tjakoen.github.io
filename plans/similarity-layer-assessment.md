---
id: similarity-layer-assessment
status: blocked
track: ai
depends: []
touches:
  - content/notes/
  - artifacts/runs/
  - docs/
  - tools/
owner: ai
---
# A similarity layer for the flat piles: not yet

> Asked on 2026-11-17: the loop retrieves by reasoning (structured docs, skills, the code graph),
> which suits the standards. The flat, growing piles answer a different kind of question, "have I
> written about X?" or "has a past run hit this failure?", and hybrid RAG would shortlist them by
> similarity before the agent reads the shortlist. This is the assessment, not the build.

## The verdict

Do not build it yet. Grep found the right file for every one of ten realistic questions in one or two
tries, in under ten milliseconds, over a corpus a single session could nearly read whole. The
failures it had were vocabulary failures (the run said "a stale development server was occupying
port" and the first pattern asked about a port collision), and a second, looser pattern fixed both.
A ranking layer would save one retry per question at this size, which is less than it costs to keep
an index honest.

The status is blocked rather than todo on purpose: nothing here should be picked up until one of the
triggers below fires.

## What the piles weigh

Measured on 2026-11-17 at commit f62bca1 on the branch this plan was written on.

| Pile | Files | Words | Bytes |
|---|---|---|---|
| content/notes | 25 | 90,437 | 652 KB |
| artifacts/runs (Markdown) | 79 | 106,972 | about 0.8 MB of text, 2.3 MB with four PNGs |
| docs/AUDIT-*.md | 11 | 32,826 | |
| Total | 115 | about 230,000 | |

At a rough 1.3 tokens a word that is around 300,000 tokens for all three piles together. Runs grow
fastest: 39 in August, 4 in October, 36 in the first half of November. Notes grow by a handful a
month. Twenty-two of the twenty-five notes already carry a summary in their frontmatter, and the
titles and summaries together come to 1,749 characters, which is a free shortlist on its own.

## The trial

Ten questions, written the way a session would actually ask them, run with grep against the pile
each belongs to. "Tries" counts the patterns it took before the right file showed up.

| # | Question | Pile | Tries | Result |
|---|---|---|---|---|
| 1 | Has a past run hit a port collision? | runs | 2 | Missed on "EADDRINUSE" and "port in use"; found on a plain "port" pass, phrased as "a stale development server was occupying port" |
| 2 | Has a run hit a stale code graph? | runs | 1 | 7 files, all on point |
| 3 | Has a run hit a flaky test? | runs | 1 | 9 files on "flak", all on point, and they name the parallel-load flake family |
| 4 | Has a run been fooled by a server serving old code? | runs | 2 | Missed on "stale bundle" and "old build"; found on a plain "stale" pass, the same report as question 1 |
| 5 | Has a run been hurt by symlinks on Windows? | runs | 1 | 16 on "symlink", 3 on "windows", the intersection is the answer |
| 6 | Did an audit flag colour contrast? | audits and runs | 1 | 4 files, two audits and two runs |
| 7 | Have I written about em-dashes? | notes | 1 | 2 notes, both right |
| 8 | Have I written about grading? | notes | 1 | 17 of 25 notes match, so the hit list is the whole shelf; the titles do the ranking |
| 9 | Have I written about cheap models? | notes | 1 | 7 on "deepseek", 20 on "cheap or cost"; the narrow word wins |
| 10 | Have I written about drowning in open workspaces? | notes | 1 | "overwhelm" gives 3, the right one among them |

Two honest gaps sit in that table. Questions 1 and 4 are exactly the paraphrase case a similarity
layer is for, and both landed on the second try only because the asker knew to loosen the pattern.
Questions 8 and 9 show the opposite failure: a broad word matches most of the shelf, and grep has no
way to rank. At 25 notes a session reads 17 titles and moves on. At 250 it would not.

The code graph was not run. The graphify binary is not installed in this cloud container and
installing it was refused, so that half of the trial is reasoned rather than measured. The GRAPH
standard settles it anyway: it says to query by symbol, not by prose, because a fuzzy phrase lands on
documentation headings and misses. Every question above is prose. The graph is the wrong tool for
these piles, which is the premise of the ask, now with the standard's own words behind it.

The memory dream (plans/memory-dream.md) already reads every run report backwards and distills it
into the store a session reads at start. A recurring failure that matters has a second road in
through that store, so the runs pile is less of a blind spot than its size suggests.

## What would trigger the build

Any one of these is enough. Each is something a session can notice without new tooling.

1. **The pile outgrows a skim.** Any one pile passes 300 files, or the three together pass 750,000
   words (about one million tokens). At the November rate the runs pile gets there first, in roughly
   a year.
2. **The retries add up.** A run report records three or more questions in a single session that
   needed three or more grep patterns before the right file appeared. Write it under "What was not
   done" so it is findable, by grep, which is the joke.
3. **A known file is missed.** A session concludes "never written about" or "never hit before" and a
   later session finds the file that says otherwise. One documented case is enough, because that is
   the failure that costs real work.
4. **The broad words drown.** A note question on a common word (grading, cost, loop) matches more
   than 40 files, past where reading titles is a reasonable shortlist.

## The cheapest build, when it comes

In order, stopping at the first step that clears the eval below.

1. **Titles and summaries first.** Give the three notes without a summary one, and give run reports
   a one-line summary in frontmatter the way notes have. A grep over frontmatter is the shortlist,
   and it costs nothing to run.
2. **BM25 over the piles.** One Bun script under tools/, no dependency, under two hundred lines: split
   each file into heading-sized chunks, build the index in memory on every call (230,000 words index
   in well under a second), print the top ten chunks with file and heading. No cache file, so there
   is nothing to go stale. BM25 ranks, which fixes questions 8 and 9, and its looser term matching
   helps 1 and 4 without a model.
3. **Local embeddings only if BM25 fails the paraphrase questions.** A small local model through the
   same script, vectors cached beside the content in a gitignored file keyed by content hash, fused
   with the BM25 ranking. This is the first step that brings an index someone has to keep honest, so
   it waits until step 2 has been tried and has failed in writing.

## The eval that decides it

The ten questions above are the eval set, with the expected file for each. A build is done when it
puts the expected file in its top five for all ten on the first try, with the question asked in plain
English, and the gate is a test in the suite rather than a claim in a report. If step 2 passes, step 3
is never built.

## Tasks

- [x] Measure the three piles
- [x] Run ten questions with grep and record tries and misses
- [ ] Run the same questions through graphify on a machine that has it, and add the result here
- [ ] Watch for a trigger; when one fires, move this plan to todo and start at step 1
