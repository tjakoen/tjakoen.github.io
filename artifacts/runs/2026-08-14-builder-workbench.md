---
title: The layout was not what made it a builder
date: 2026-08-14
status: complete
lane: gated
branch: main
scope:
  - plans
  - view/pages/builder.html
  - view/components/pages/builder
  - view/components/molecules/block-row
  - src/ai
  - e2e
  - content/tours
  - artifacts/runs
touched:
  - plans/builder-design.md
  - view/pages/builder.html
  - view/components/pages/builder/builder.css
  - view/components/molecules/block-row/block-row.html
  - src/ai/builder-page.ts
  - src/ai/builder-page.test.ts
  - src/ai/builder-canvas.ts
  - src/ai/canvas-dom.ts
  - src/ai/canvas.ts
  - e2e/builder-canvas.e2e.ts
  - content/tours/review-builder-workbench.md
  - content/tours/review-page-builder-canvas.md
skills:
  - tour-standard
  - loop-standard
  - voice
plans:
  - builder-design, D1 and D2 | plans/builder-design.md
gates:
  - bunx tsc --noEmit | exit 0, no output
  - bun test | 504 pass, 0 fail, 1827 expect() calls, 31 files
  - bunx playwright test (full) | 270 passed, 1 skipped, 0 failed
  - bun tools/lint-gate.ts | net ZERO on this diff, measured against a stash
  - bunx crumb check content/tours | 17 tours, all pass
  - bun run export + a plain static file server over dist/ | the workbench composes and its ops work with no app server
diffstat: 12 files changed, one commit, c254c77
unpushed: 50 | portfolio 50 once this report lands, 49 before it, of which 5 are this session's. Grain 14. Pushing stays the owner's call and was not taken.
verifiedBy: nobody yet. content/tours/review-builder-workbench.md is written, its five surfaces resolve, two steps are stamped needs-verification and none is stamped verified.
doctor: four flags due, all four carried by name below, none fixed.
---

# The layout was not what made it a builder

The owner's reaction to P2 and P3 was that the page does not feel like a builder: "we have our dev
style console portfolio and it doesn't fit with that, it looks like every other mill generated page
on the site." That reading was correct and it was structural rather than a matter of taste.
`/builder` was built out of the same parts as an essay: the shared reading column, a masthead, a
lede, five muted paragraphs, section heads, a docs-list. The canvas was a band inside an article.

## What the mockups changed

Three layouts were built against the real shell with real tokens and real block markup rather than
described, and looking at them moved the answer off all three.

**The layout is not what makes it a builder. The rail is.** One row per block, the id in mono, the
span as three chips you press, a remove at the end. That row was identical in every mockup, and it
is the whole difference between a page that renders a result and a tool you operate.

**A command line under the canvas collides with the terminal dock.** Not a styling problem: two
things want the same edge of the screen. The replacement is better than the idea, because the
terminal already is the log. The desk thinks out loud there, and a second narration strip would have
competed with the one that exists.

**The best thing in the artboard mockup was not the artboard.** It was the file-name line above it.
One mono row saying `untitled.html · 5 blocks · 6 col` does more work than a plate and a shadow.

## The one that mattered was not visual at all

You could not delete a block. Or move one. Or change its span. `composition.ts` has had
`removeBlock`, `moveBlock` and `setSpan` since the day it was written, pure and tested, and nothing
but a unit test had ever called one. The canvas was append-only, so every mistake was permanent
until you started the page over. No amount of chrome fixes that, and it is why D1 and D2 shipped
together rather than shell first.

## Three decisions worth the words

**The canvas grid keys off its own pane, not the viewport.** A container query rather than a media
query, because `half` has to mean half of what you can SEE and the canvas pane is not the window. It
shrinks when the assistant column opens, when the preview-width toggle goes to tablet, and when the
rail is beside it, and a viewport breakpoint is wrong in all three. Measured: opening the assistant
column takes the stage from 784px to 464px and every block goes full, with the window untouched.

**This screen gives up the assistant column by default**, the call `/plans` already makes for the
same reason, set in markup so it is the screen's default rather than a stored preference. The prompt
lives in the workbench now, so the chat is not the way in; it is still how you ask the desk to build,
one press of the title-bar toggle away. Nine `desk-form-build` tests pass unchanged, because they
drive the desk from the home page and the door does not need a visible panel.

**The rail stays in the main column and is not a fourth mode of the assistant panel.** That was the
owner's suggestion and it is a good one for width, but these are controls: a remove button that a
chrome toggle can close is a control you cannot rely on.

## What the static-host test caught

Composing from the address left the prompt box empty under a page it had supposedly just built. The
composer binds over its own one-item spec and the fill deliberately skips it, so on the live server
the server had seeded it and on a frozen page nobody had. Found by an e2e assertion rather than by
looking, which is the point of having one.

## Gate output

```
$ bunx tsc --noEmit
(no output, exit 0)

$ bun test
 504 pass
 0 fail
Ran 504 tests across 31 files. [2.60s]

$ bunx playwright test
  1 skipped
  270 passed (1.4m)

$ bunx crumb check content/tours
  ✓ review-builder-workbench — 5 step(s), dev      (17 tours, all pass)

$ bun run export
[export] done: 120/120 pages, 86/86 data routes, 33 frozen modules, 93 asset files.

$ python3 -m http.server 8899        # in dist/, no app server anywhere
  /builder/?ask=…  → five blocks, remove b2, press full on b4 → four blocks, stat full, ids unchanged
```

## Verification, and where it was done

The ops were driven on BOTH the live server and the frozen export, because the browser is the only
thing that runs them and the frozen page is where the demo actually lives. Seven new e2e cases cover
the rail: one row per block with the current span pressed, a span change that moves nothing else, a
remove that renumbers nothing, a move clamped at the ends rather than wrapped, an emptied page
returning the empty state rather than a matched-nothing notice, an add after a delete taking the next
issued id rather than the next index, and the rail still reading as a list with JavaScript off.

## The lint ratchet is flat

Four lints sit above the baseline and all four are pre-existing. This diff added one
`eslint(no-shadow)`, a local `ask()` helper shadowing the submit handler's own `ask`, and it was
renamed rather than absorbed. The `voice:backtick` count moved by one this session and it is not
this diff's: stashing the whole working tree and re-running the linter produced an identical
per-file count, so the change came from outside it.

## Session doctor flags, carried by name

Four due, none fixed, and the same four the last three runs carried. `graphify freshness`. `layer
pins current`, one behind on purpose while grain 0.1.22 is held unpublished. `run ledger`, older
reports from sessions that are gone. `unpushed work`, 49 at the last reading and 50 once this report lands, of which 5 are this session's. Grain
resolves through a symlink to the working tree, so every green gate above says nothing about the
published package.

## What was NOT done

- **D3, the desk operating the builder.** No `block:` surface ships here, deliberately: an address
  that lands before a working verb advertises an operation nothing can perform, which is the tick
  box's lesson written down in the plan. That is the phase the 2GB model ask needs.
- **D4, the copy.** The honest-limits prose moved into a drawer unedited. It is good writing aimed at
  a reader of an argument, and the page it now sits on has a different job.
- **The block set is still five.**
- **Nothing pushed, nothing published.**

## The review

<https://tjakoen.github.io/builder?ask=An%20intro%2C%20two%20cards%20side%20by%20side%2C%20a%20callout%2C%20a%20stat%2C%20and%20a%20form%20with%20a%20name%2C%20an%20email%2C%20a%20topic%20and%20a%20box%20to%20agree%20to%20the%20terms&crumb=review-builder-workbench&crumb-mode=dev&crumb-frame>

Five steps: the rail, the prompt bar, the canvas and its container query, the refusals in their new
home, and the drawers. Two are stamped `needs-verification` and both are judgment calls rather than
bugs.

## What needs human eyes

1. **Whether burying the honest-limits prose in a closed drawer buries it.** A work surface should
   not open with five paragraphs of argument, and nobody opens a closed drawer. Both are true.
2. **Whether the collapsed assistant column should stick when you open it.** Today the screen's
   default wins on the next load, so someone who wants the chat pinned on this page cannot have it.
3. **Whether a composition should have a name.** The canvas head says `untitled.html`, which is a
   promise D4 either keeps or drops.
4. **Push.** 50 portfolio commits and 14 grain.
