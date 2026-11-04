---
title: X-ray v2 panel, the batch 0.3 bump, and closing course badges
date: 2026-11-04
status: complete
lane: gated
branch: claude/portfolio-improvements-07be98
scope: [src/ai/xray-panel.ts, src/server.ts, view/components/organisms/portfolio-frame, e2e/xray-panel.e2e.ts, e2e/persistence.e2e.ts, plans/ai-agency-navigation.md, plans/course-badges.md, package.json, bun.lock, artifacts/runs]
touched:
  - package.json
  - bun.lock
  - plans/course-badges.md
  - plans/ai-agency-navigation.md
  - src/ai/xray-panel.ts
  - src/server.ts
  - view/components/organisms/portfolio-frame/portfolio-frame.html
  - view/components/organisms/portfolio-frame/portfolio-frame.css
  - e2e/xray-panel.e2e.ts
  - e2e/persistence.e2e.ts
  - artifacts/runs/2026-11-04-xray-v2-and-due-items.md
diffstat: 7 files changed, 153 insertions and 4 deletions for x-ray v2, plus package.json, bun.lock and two plan status lines in earlier commits
unpushed: 4 | two earlier commits plus this run's two; not pushed, a push needs the owner's consent
verifiedBy: none | no independent pass this run; the e2e suite and a screenshot are the only evidence
doctor: 0 failing, 2 due | carried the three 2026-10-14 builder reports' evidence and the Claude memory budget
---

# X-ray v2 panel, the batch 0.3 bump, and closing course badges

## Envelope

The owner asked for three things in chat: clear the doctor's due items, close the course badges plan,
and start P5 of the AI agency plan, the x-ray v2 surface. Nothing was pushed, because a push needs
the owner's consent.

## Result

The batch layer moved from 0.2.1 to 0.3.0. The refresh script could not do it alone, because a caret
range on a zero major never crosses a minor version, so the pin moved by hand. The stale skill was
synced. The course badges plan is closed on the owner's word.

X-ray v2 is a panel that opens whenever grain's x-ray switch is on. It lists what the desk can do on
the current page, grouped as See, Navigate and Operate, and it reads that list from the same
capability catalog the desk reasons with, so it cannot promise a verb the desk lacks. Below the
groups it lists every outlined surface by the label grain stamps on it. The status bar carries a
labelled "AI view" button whose pressed state follows the switch, and the shareable ?xray link and
the keyboard chord still work. The panel lives in the portfolio rather than grain because the
See, Navigate and Operate catalog is the portfolio's own; grain still owns the switch and outlines.

## Gate output

These are this session's terminal summaries, copied from the runs.

```text
$ tsc --noEmit
(clean)

bun test
 869 pass
 0 fail
 3666 expect() calls
Ran 869 tests across 47 files.

playwright test --ignore-snapshots (full suite)
  3 failed
  475 passed (8.6m)

playwright rerun of the three failures plus their files
  20 passed (2.2m)
```

The three full-suite failures were projects-layout line 214, seo line 45 and the canonical-routes
viewport test. None touches the x-ray, and all three pass when run alone, so they read as load
flakes under four workers rather than regressions.

The graph freshness flag cleared after the skills sync. The evidence missing from three 2026-10-14
builder reports is carried by name, not fixed, because rebuilding their gate output would be a
reconstruction.

## What was not done

- The optional hover hint from P5, which would show the operation the desk would emit, is unbuilt.
- The three 2026-10-14 builder run reports still lack evidence sections.
- PANTRY refused the plan claim (connection refused), so this work ran unclaimed.
- The visual baselines were not re-run on macOS, and the status bar gained a button on every page.

## What needs human eyes

- The panel in light theme and on a phone width; only dark desktop was looked at.
- Whether "AI view" is the right label beside the existing ⊹ title-bar toggle, which stays.
- The stray node_modules/node_modules symlink in this worktree points at the main checkout and splits
  Playwright into two instances; the e2e runs above moved it aside and put it back.
