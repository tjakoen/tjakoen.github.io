---
title: Verify the skill freshness fix from commit aa4eaa8
date: 2026-11-18
status: complete
lane: verification
branch: main
scope:
  - tools/map-freshness.ts
  - .claude/skills/.freshness.json
  - standards/FIGURES.md (temporary one-word edit, reverted)
touched:
  - artifacts/runs/2026-11-18-skill-freshness-verification.md
consulted: none
gates:
  - bun tools/map-freshness.ts, run six times across the steps below
  - bun cli.ts skills sync ../tjakoen.github.io, run twice from the pantry repo
  - bun run lint:runs on this report
unpushed: 1, this report's commit, which waits on the owner
verifiedBy: Each step's output is pasted below exactly as the command printed it. Nothing was fixed; findings are reported only.
---

# Verify the skill freshness fix from commit aa4eaa8

The steps ran on 2026-11-17, on main at 3eefc110, which includes aa4eaa8. The report was written the
next day, after the session resumed. The tree was clean before the run and is clean after it, apart
from this report. The pantry repo had 27 uncommitted paths before both syncs and the same 27 after.

## Results

| Step | Expected | Actual | Result |
|---|---|---|---|
| 1. Session-start check, stamp absent | baseline, nothing stale | The session start ran before aa4eaa8 was in the tree and reported 21 of 21 stale. The stamp file was absent when the run began, and the first run of the fixed check baselined and reported nothing stale | pass, with a caveat |
| 2. Check after baseline | 0 stale | skills ok, 21 match their source | pass |
| 3. One-word edit to FIGURES.md | exactly one stale skill, figures | 1 of 21, figures | pass |
| 4. Check again, no change | still names figures | 1 of 21, figures | pass |
| 5. Sync, then check | 0 stale | skills ok, 21 match; the sync wrote 4 skills | pass, with a finding |
| 6. Revert, sync, check | 0 stale | skills ok, 21 match; the sync wrote 1 skill | pass |
| 7. Instructions budget | under 20k | 20,678 characters, shown rounded as 20k with a warn | fail |

## Findings

**The baseline can absorb staleness that already exists.** The first sync in step 5 wrote four
skills, not one. FIGURES.md was the only standard edited, so the other three skill files were already
different from what the sync would produce before the run began. The step 2 baseline recorded them as
in sync anyway, because a missing stamp is taken to mean that every mounted skill matches its source.
The sync output was not kept line by line, so the three names are unknown. A fresh baseline is
therefore only as trustworthy as the last sync before it.

**The sync does not rewrite unchanged files.** The second sync wrote one file, the reverted figures
skill, which rules out the failure where every sync rewrites every file. The check can tell a sync
happened.

**The instructions budget is still over.** The check adds the global file, 10,561 characters, the
RTK import, 964, and this repo's CLAUDE.md, 9,153. The total is 20,678, and the rule in
session-checklist.sh warns above 20,000. The row reads 20k because it rounds down, which hides the
overrun. Trimming the repo file alone would need 678 characters; the brief named the global file as
the next place to trim.

**The graph warning was present in every run** and is outside this fix: graphify-out/graph.json was
older than src/server.ts by a minute.

## Outputs, verbatim

Step 1, the session-start hook at the original session start, before aa4eaa8 was in the tree:

```
freshness: WARNING skills: 21 of 21 behind their source: ai-development (stale), ai-repo-standard (stale), audit-standard (stale), claude-starter (stale), commit-standard (stale), conformance (stale), decisions (stale), figures (stale), and 13 more
  ai-development: standards/AI-DEVELOPMENT.md body changed since the sync
  ai-repo-standard: standards/AI-REPO-STANDARD.md body changed since the sync
  audit-standard: standards/AUDIT-STANDARD.md body changed since the sync
  fix: bun cli.ts skills sync ../tjakoen.github.io (from the pantry repo)
freshness: WARNING graph: 1 of 1 behind their source: graphify-out/graph.json (stale)
  graphify-out/graph.json: tools/standards-index.ts changed 36 minutes after the graph was built (by mtime)
  fix: graphify update .
```

Before step 2:

```
ls: .claude/skills/.freshness.json: No such file or directory
```

Step 2:

```
freshness: skills ok, 21 match their source
freshness: WARNING graph: 1 of 1 behind their source: graphify-out/graph.json (stale)
  graphify-out/graph.json: src/server.ts changed 1 minute after the graph was built (by mtime)
  fix: graphify update .
```

Step 3, after the edit:

```
-> dependencies and every figure is a member of the same family: you re-skin them all by editing tokens,
+> dependencies and each figure is a member of the same family: you re-skin them all by editing tokens,
```

```
freshness: WARNING skills: 1 of 21 behind their source: figures (stale)
  figures: standards/FIGURES.md changed since the sync
  fix: bun cli.ts skills sync ../tjakoen.github.io (from the pantry repo)
freshness: WARNING graph: 1 of 1 behind their source: graphify-out/graph.json (stale)
  graphify-out/graph.json: src/server.ts changed 1 minute after the graph was built (by mtime)
  fix: graphify update .
```

Step 4:

```
freshness: WARNING skills: 1 of 21 behind their source: figures (stale)
  figures: standards/FIGURES.md changed since the sync
  fix: bun cli.ts skills sync ../tjakoen.github.io (from the pantry repo)
freshness: WARNING graph: 1 of 1 behind their source: graphify-out/graph.json (stale)
  graphify-out/graph.json: src/server.ts changed 1 minute after the graph was built (by mtime)
  fix: graphify update .
```

Step 5, the tail of the sync and then the check:

```
  skip  CLAUDE.md: no when: key — not a skill
  skip  README.md: no when: key — not a skill
21 skills mounted, 4 written, 0 pruned
Generated and gitignored — never commit .claude/skills; re-run after a canon change.
```

```
freshness: skills ok, 21 match their source
freshness: WARNING graph: 1 of 1 behind their source: graphify-out/graph.json (stale)
  graphify-out/graph.json: src/server.ts changed 1 minute after the graph was built (by mtime)
  fix: graphify update .
```

Step 6, the revert, the sync summary and the check:

```
Updated 1 path from the index
21 skills mounted, 1 written, 0 pruned
```

```
freshness: skills ok, 21 match their source
freshness: WARNING graph: 1 of 1 behind their source: graphify-out/graph.json (stale)
  graphify-out/graph.json: src/server.ts changed 1 minute after the graph was built (by mtime)
  fix: graphify update .
```

Step 7, the row and the sizes behind it:

```
 warn Instructions: global + repo, 20k chars of the 20k budget
```

```
10561 /Users/tjakoenstolk/.claude/CLAUDE.md
     964 /Users/tjakoenstolk/Local/agent-config/shared/RTK.md
    9153 CLAUDE.md
   20678 total
```

## Consulted

No standard section was read in this run. The run checked tool behaviour, and the run report shape
was taken from the previous report in this directory.
