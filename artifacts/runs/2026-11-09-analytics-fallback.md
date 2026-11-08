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
diffstat: 7 files changed, 476 insertions(+), 54 deletions(-), this report not counted
unpushed: 0 | three commits pushed and deployed
verifiedBy: 915 unit tests, the typecheck, the lint gate at 4483, a full export with verify-export clean, live checks of three deployed pages and the published snapshot, two simulated pull failures, and a fixture screenshot of the bar
doctor: 23 checks, 0 failing, 1 due | the Claude Code context budget, a machine setting
---

## What was asked

Three things: why the DSH checklist did not run, raise the analytics timeout, and show the previous values when the pull fails. The bar had been empty since the scheduled deploy on 8 November.

## What the first deploy found

The timeout fix shipped and the bar came back with the wrong numbers: 0 visits on one run, then 1,000 visits with no per page counts on the next. The cause was the query, not the new code. Cloudflare's adaptive dataset returns rows bucketed by time, and the site total asked for one row with limit 1, so that row was never the total. It was whichever bucket the API picked. The page query had the same flaw at the other end: 5,000 rows over three months truncates, so the path count moved between 131, 23 and none.

Both are now summed across 30 day windows. Every window is small enough to come back whole, the visit sum is added across all rows, and every page row is folded, so the number is the cumulative figure the bar always claimed to show. A window that does hit the 5,000 row limit says so in the log instead of shrinking the result quietly.

## What changed

**The pull gets a real window.** Sixty seconds per attempt and one retry two seconds apart, because the old 20 second cap was cutting off a slow query.

**A failed pull keeps the last numbers.** The script falls back to the snapshot already on disk, then to the snapshot the previous deploy published at /analytics.json. The bar dates what it shows ("as of 8 Nov"), so a kept snapshot is honest rather than a claim of freshness.

**A zero result is not data.** Zero visits and no paths is a query that failed, not a site nobody read. The rule now lives in one place and every reader and writer applies it: the pull throws so the retry and the fallback run, the cache loader refuses it, and the export publishes no snapshot. Without that, the 0 visits run would have put "0 visits" on every page and poisoned the fallback for the next deploy.

**The export publishes what it baked.** dist/analytics.json is written from the same cache the pages read, so the next failed pull has something real to show.

## The DSH checklist

The script reads stdin at its first line (`input="$(cat 2>/dev/null || true)"`). The plugin runs it through execFile, whose stdin pipe is never closed, so cat waited forever, the plugin's 20 second timeout killed the script with SIGTERM, and runChecklist returned null. The session then got either the "printed nothing" fallback notice or, as measured in this session, no notice at all.

I reproduced it with a copy of the plugin and instrumented it: `checklist text=null`, `THREW Command failed: bash ... signal=SIGTERM`. Running the same script by hand closes stdin and finishes in a quarter of a second. With the caller redirecting stdin from /dev/null, the copy delivered the full block, verdict line included, in a headless run.

The fix belongs in the machine's plugin, at ~/.dsh/loop/plugin.mjs, which is outside this repository and is the guard's own file, so it is handed over rather than edited here:

```js
// was: execFileAsync('bash', [script], { ... })
const { stdout, stderr } = await execFileAsync(
  'bash',
  ['-c', 'exec "$1" </dev/null', 'bash', script],
  { ... },
);
```

One related gap is not explained: in the GUI session no dsh-loop notice reached the transcript at all, while the same fallback notice lands in a headless run. Closing stdin may well be enough, since it removes the 20 second stall, but that needs a restart and a look at the next session before it is called fixed.

## Evidence

- `bun run check`, `bun test` (915 pass, 0 fail), `bun tools/lint-gate.ts` matching the 4,483 baseline.
- `PUBLIC_ORIGIN=https://portfolio.tjakoen.com bun run export` then `bun tools/verify-export.ts`: OK with the snapshot present and absent.
- The deployed site now reads 2,710 visits on the home page, 150 views on the ten-times-zero note and 210 on /grain, and /analytics.json serves the same snapshot.
- A fixture export produced "2,682 visits · 940 views here · as of 9 Nov"; the screenshots are in screenshots/analytics-status-bar.png and screenshots/analytics-status-bar-note.png (gitignored).
- A bogus token exercised both failure paths: with a cache, "keeping the snapshot of 2026-11-09 already on disk" and the file unchanged; without one, the warning and no file written.

## Not done, and what needs human eyes

- The plugin patch above is a machine config change, so it is the owner's to apply, and DSH needs a restart before the block can appear in a session.
- The page counts come back in round tens, which is Cloudflare's sampling at that window size. The site total is stable because every row is summed; the per page numbers are estimates and the bar presents them as counts.
- The snapshot date is the runner's UTC day, so a build at 17:55 UTC on 8 November prints "as of 8 Nov" while it is already the 9th in Manila. Worth deciding whether the date should follow the site's own timezone.
