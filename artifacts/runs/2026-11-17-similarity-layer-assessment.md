---
title: A similarity layer for the flat piles is assessed and deferred
date: 2026-11-17
status: complete
lane: low
branch: claude/ai-workflow-similarity-assessment
scope:
  - plans/similarity-layer-assessment.md
  - artifacts/runs/2026-11-17-similarity-layer-assessment.md
touched:
  - plans/similarity-layer-assessment.md
  - artifacts/runs/2026-11-17-similarity-layer-assessment.md
plans: similarity-layer-assessment, written by this run and left blocked on its triggers.
gates:
  - bun tools/voice-lint.ts on the two new files
diffstat: One new plan and this report. No code.
unpushed: none beyond this commit.
verifiedBy: Not independently reviewed. The trial is reproducible from the patterns in the plan.
doctor: Not run. The cloud container has no PANTRY or machine hooks.
---

The ask was an assessment of whether the notes, run reports and audits need a similarity layer
before the agent reads them. They do not, yet. The plan records the measurements, the ten trial
questions with how many grep patterns each needed, four triggers that would justify a build, and the
cheapest build in order: frontmatter summaries, then a BM25 script in Bun, then local embeddings only
if BM25 fails the paraphrase questions.

```text
$ for d in content/notes artifacts/runs; do echo "$d: $(ls $d | wc -l) files, $(cat $d/* | wc -w) words"; done
content/notes: 25 files, 90437 words
artifacts/runs: 80 files, 106972 words
$ cat docs/AUDIT-*.md | wc -w
32826
```

The artifacts/runs count of 80 includes one directory; 79 are Markdown reports.

## What was not done

- **Graphify was not run.** It is not installed in this container, and installing it was refused by
  the session's permission check. The plan reasons from the GRAPH standard instead (query by symbol,
  not prose) and leaves a task open to run the ten questions through it on a machine that has it.
- **No prototype.** The evidence did not clearly say yes, so nothing was built.
- **No rendered change,** so no screenshot or tour. The plan renders on the board as Markdown only.
- **The full gate suite was not run.** Nothing in src, tools or tests changed.
