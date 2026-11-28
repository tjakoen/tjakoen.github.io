---
title: Wire grain's desk stage into the portfolio behind a Desk view button
date: 2026-11-28
status: partial
lane: gated
branch: claude/pensive-cori-w04xrv
skills: [voice]
scope: [src/server.ts, view/components/organisms/portfolio-frame]
scopeGrowth: none
touched: [src/server.ts, portfolio-frame.html, portfolio-frame.css]
dirty: []
plans: []
gates: ["bun run check | clean", "bun test | 1146 pass, 0 fail, 2 skip", "bun tools/lint-gate.ts | level, 4592 flags against a baseline of 4592"]
diffstat: three files, one commit
unpushed: "0 | pushed with the commit"
consulted: none
doctor: standards skills not synced on the cloud machine, published copies used
verifiedBy: nobody yet
---

## What changed

A Desk view button in the title bar, next to the scheme and terminal controls, zooms the whole app
window out into a 3D monitor on a desk. The server wraps the body content in grain's desk stage, and
only on pages that carry the shell. The wrap and the script link are both conditional on the installed
grain actually shipping the stage, so an install without it renders exactly what it did before and the
button stays hidden.

## Checked on the real site

Run against this repo's own server, with the new grain files copied over the installed package (which
is NOT the release yet, see below), at 1440 by 900:

- the stage built, the button showed, zooming out put the live portfolio on the monitor screen, and
  Escape returned to flat with no console errors
- the wrapped page against the same page with the wrapper removed: 663 of 1.3 million pixels differ,
  which is live content (a clock and animations) and not layout
- before and after a round trip: 1988 pixels differ, the same kind of noise
- an install with the stage script removed rendered no wrapper and no script link

## What was not done

- **Release.** Grain 0.1.40 (the desk stage) was published to npm from the merged grain PR, and the
  dependency is bumped to ^0.1.40 in this change. The checks above were first run against a local copy of
  the files, then re-run against the real installed 0.1.40: stage built, button showed, zoom out and
  back worked, no console errors.
- **Playwright e2e and the visual suite were not run**, and the visual baselines are macOS-specific.
  A wrapper element now sits between body and the shell, so a spec that selects the shell as a direct
  child of body would break. The one such rule in the portfolio's CSS was changed to a descendant selector.
- **Real devices.** Nothing was tried on a phone, a classic scrollbar, or a real GPU. Phones refuse the
  feature by script and CSS gate, tested only by resizing a desktop browser.
- Dark mode and the lamp were driven in the grain harness and not again on the real site.

## What needs human eyes

The zoom on the live site, in light and dark, with the Brioche flavor the site was on, and the drag.
