---
title: The conformance prompt, and the run link as the handover
date: 2026-08-09
status: complete
branch: main
scope:
  - standards/
  - content/tours/
touched:
  - standards/CONFORMANCE.md
  - standards/README.md
  - standards/KICKSTART.md
  - standards/LOOP.md
  - content/tours/review-conformance-standard.md
skills:
  - loop-standard
  - session-loop
  - voice
plans:
  - session demo-loop backlog items 1, 2 and 3 | no plan file; the backlog lives in agent memory
gates:
  - bun run check | tsc clean
  - bun test | 328 pass, 0 fail
  - bun run lint | warnings only, all pre-existing
  - bun cli.ts check (pantry) | 27 pages, 0 problems
diffstat: 5 files changed, 288 insertions(+), 4 deletions(-)
unpushed: 2 | push is owner-gated, and the published pages only exist after Pages rebuilds
verifiedBy: nobody yet — this run wrote its own change and its own tour, which is one pass
doctor: 0 failing, 2 due — graphify merged-graph stale, crumb pin 0.1.7 behind 0.1.8 (unpublishable, E401)
---

## Gate output

```
$ bun run check
$ tsc --noEmit

$ bun test
 328 pass
 0 fail
 1297 expect() calls
Ran 328 tests across 20 files. [2.72s]

$ bun ~/Local/Development/bread-repos/pantry/cli.ts check
27 pages, 0 problems
OK

$ grep -rhoE 'https://tjakoen\.github\.io/[^ )"`>]+' --include='*.md' standards/CONFORMANCE.md \
    | sed 's/[.,;:]*$//' | sort -u \
    | while read u; do echo "$(curl -sL -o /dev/null -w '%{http_code}' "$u") $u"; done
200 https://tjakoen.github.io/notes/ten-times-zero
200 https://tjakoen.github.io/standards
200 https://tjakoen.github.io/standards/ai-repo-standard
200 https://tjakoen.github.io/standards/audit-standard
200 https://tjakoen.github.io/standards/graph
200 https://tjakoen.github.io/standards/loop
200 https://tjakoen.github.io/standards/session-loop
```

## What was not done

- **The prompt was never run end to end against a foreign repo.** Its mechanical parts were executed
  here (the doctor, the link check, C6 read against this repo's own `.claude/settings.json`), but no
  full C1 to C8 pass has been produced for any repo. The first real run is the test of it.
- **C6 found a hole in the canon home and it was left open.** There is no session-start doctor hook in
  this repo: `.claude/settings.json` wires a Stop hook and a PostToolUse graphify hook, and nothing
  runs the doctor at orientation. Fixing it is a separate change with its own decision (which hook
  event, and whether a slow doctor at every session start is worth it).
- **Crumb P2, prefill through the door**, the fourth item on the session's list. Not started.
- **The conformance standard is unpublished** until the push and the Pages rebuild, so
  `/standards/conformance` 404s on the live site right now and links to it from anywhere else will
  fail until then.

## What needs human eyes

- **Are these the right eight checks.** C1 to C8 are a judgement about what matters, made once. The
  cheapest time to argue with the list is before it is run in five repos and its findings become the
  backlog.
- **The twelfth standard is a twelfth mounted skill** in every repo's listing, costing context in
  every session that reads the listing. That was accepted when the placement was chosen; it is worth
  re-reading once the listing is actually longer.
- **The verify rule is unsatisfied.** This run wrote the standard, wrote the tour that reviews it, and
  ran the gate. LOOP §2 asks for a second pass by someone who did not write it, and that is owed.
