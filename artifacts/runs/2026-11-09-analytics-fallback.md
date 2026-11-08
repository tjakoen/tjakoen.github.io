---
title: Keep the view counts when the Cloudflare pull fails
date: 2026-11-09
status: complete
lane: gated
branch: main
scope: [src, tools, docs, artifacts/runs]
touched:
  - src/analytics.ts
  - src/analytics.test.ts
  - tools/analytics-pull.ts
  - tools/analytics-pull.test.ts
  - tools/export.ts
  - docs/HACKING.md
  - artifacts/runs/2026-11-09-analytics-fallback.md
diffstat: 6 files changed, 203 insertions(+), 21 deletions(-), this report not counted
unpushed: 0 | working tree left uncommitted for the owner to commit
verifiedBy: 905 unit tests (36 across the two analytics files), the typecheck, the lint gate at 4483, a full export with verify-export clean, two simulated pull failures, and two screenshots of the status bar, one with counts and one without
doctor: 23 checks, 0 failing, 1 due | the Claude Code context budget, a machine setting
---

## What was asked

Three things: why the DSH checklist did not run, raise the analytics timeout, and show the previous
values when the pull fails.

## Why the bar had no numbers

The status bar's counts are baked at export time, and the scheduled deploy on 8 November hit the old
20 second cap in the Cloudflare GraphQL call. The script logged "pull failed, rendering without
numbers", exited 0 by design, and the deploy shipped a site whose views span was empty on every page.
The beacon was never the problem: it shipped, Cloudflare had 2,650 visits across 131 paths, and the
pull had succeeded half an hour earlier.

## What changed

**The pull gets a real window.** Sixty seconds per attempt and one retry two seconds apart. The old
cap was cutting off a query that groups every path over three months, and the deploy can afford two
minutes far more easily than it can afford a bar with no numbers.

**A failed pull keeps the last numbers.** The script now falls back in two steps: the snapshot already
on disk, then the snapshot the previous deploy published at /analytics.json. The bar dates what it
shows ("as of 9 Nov"), so a kept snapshot is honest rather than a claim of freshness. With neither
source it prints a GitHub warning and renders no numbers, which is the first-deploy case and the only
one where the bar still empties.

**The export publishes the snapshot it baked.** dist/analytics.json is written from the same cache
the pages read, and only when data exists. A local export with no cache leaves no file, so an empty
snapshot can never be mistaken for real numbers on the next build.

**One shape check for both sources.** parseAnalytics in src/analytics.ts now validates the cache file
and the fetched snapshot the same way, and rejects a partial object rather than half-rendering it.

docs/HACKING.md gained the fallback and the dates in the row that answers "where do the view counts
come from".

## The DSH checklist

The script reads stdin at its first line (`input="$(cat 2>/dev/null || true)"`). The plugin runs it
through execFile, whose stdin pipe is never closed, so cat waited forever, the plugin's 20 second
exec timeout killed the script with SIGTERM, and runChecklist returned null. The session then got
either the "printed nothing" fallback notice or, as measured in this session, no notice at all.

I reproduced it with a copy of the plugin and instrumented it: `checklist text=null`, `THREW
Command failed: bash ... signal=SIGTERM`. Running the same script by hand closes stdin and finishes
in a quarter of a second. With the caller redirecting stdin from /dev/null, the copy delivered the
full block, verdict line included, in a headless run.

The fix belongs in the machine's plugin, at ~/.dsh/loop/plugin.mjs, which is outside this repository
and is the guard's own file, so it is handed over rather than edited here:

```js
// was: execFileAsync('bash', [script], { ... })
const { stdout, stderr } = await execFileAsync(
  'bash',
  ['-c', 'exec "$1" </dev/null', 'bash', script],
  { ... },
);
```

One related gap is not explained: in the GUI session no dsh-loop notice reached the transcript at
all, while the same fallback notice lands in a headless run. Closing stdin may well be enough, since
it removes the 20 second stall the GUI's first step was spending, but that needs a restart and a
look at the next session header before it is called fixed.

## Evidence

- `bun run check`, `bun test` (905 pass, 0 fail), `bun tools/lint-gate.ts` matching the 4,483
  baseline.
- `PUBLIC_ORIGIN=https://portfolio.tjakoen.com bun run export` then `bun tools/verify-export.ts`: OK,
  1,681 pages, 1,638 data routes.
- A fixture snapshot produced "2,682 visits · 940 views here · as of 9 Nov" in the status bar and
  dist/analytics.json; screenshots are in screenshots/analytics-status-bar.png and
  screenshots/analytics-status-bar-note.png (gitignored).
- A bogus token against the real endpoint exercised both failure paths: with a cache, "keeping the
  snapshot of 2026-11-09 already on disk" and the file unchanged; without one, the GitHub warning and
  no file written.

## Not done, and what needs human eyes

- The plugin patch above is a machine config change, so it is the owner's to apply.
- The first deploy of this change still needs a successful pull, because the live site has no
  /analytics.json yet. Only after that deploy does the fallback have something to show.
- The checklist fix needs a DSH restart before it can be seen in a session, and the GUI notice gap
  above should be rechecked then.
