---
title: The builder lets you leave with what you built, and bring it back
date: 2026-08-19
status: complete
lane: gated
branch: main
skills:
  - voice
  - tour-standard
  - loop-standard
scope:
  - src/ai/composition.ts
  - src/ai/builder-page.ts
  - view/pages/builder.html
  - view/components/pages/builder/
  - e2e/
  - src/server.ts, only if a route was genuinely required
touched:
  - src/ai/builder-export.ts
  - src/ai/builder-export.test.ts
  - src/ai/builder-canvas.ts
  - src/ai/canvas-dom.ts
  - src/ai/composition.ts
  - src/server.ts
  - view/pages/builder.html
  - view/components/pages/builder/builder.css
  - e2e/builder-canvas.e2e.ts
  - content/tours/review-builder-take-it-away.md
  - plans/site-builder.md
plans: plans/site-builder.md, phase P4. Marked done in this run, with the three things the plan did
  not foresee written into the phase rather than left in a session.
gates:
  - bun run check | tsc --noEmit, exit 0, no output
  - bun test | 592 pass, 0 fail, 2028 expect() calls, 36 files
  - bun run lint:links | 53 rendered file(s), no dead relative links
  - bunx playwright test e2e/builder-canvas.e2e.ts | 46 passed
  - bunx playwright test (whole suite) | 295 passed, 1 skipped, 3 failed, all three pre-existing
  - bun tools/lint-gate.ts | +4 backtick, pre-existing, proved against a clean HEAD worktree
  - bunx crumb check content/tours | every tour parses, the new one at 3 steps, dev
  - bun run export + bun tools/verify-export.ts | 124/124 pages, 36 frozen modules, verify OK
diffstat: 11 files. 497 insertions and 17 deletions across the eight tracked ones, plus three new
  files at 481 lines.
unpushed: 1, this run's commit. Nothing was pushed, because pushing is the owner's call.
verifiedBy: nobody yet. This is the author's own account and the tour is stamped accordingly.
---

# What P4 is, in one line

Three files come off one composition and one of them comes back. Before this the builder could
compose a page and there was no way to leave with it.

## What shipped

**The three exports, at the file-name edge.** JSON, Page and Tags sit beside the file name and the
block count, because that line already said what you are building. The three hide until there is
something to export and Open deliberately does not, since reading a composition in is exactly what
you do to an empty page.

- **The JSON** is the composition document plus one line naming GRAIN, and it is the only form that
  comes back through Open.
- **The Page** is a whole document: doctype, the four stylesheets this site loads, the six-column
  grid inline, every cell at the width it was built at, and the byline as a footer.
- **The Tags** are the markup on its own, indented for pasting into a page that already loads GRAIN.

**Open, and the same validation the matcher uses.** The import reader keeps every block this build can
render and refuses the rest by name. Open replaces the canvas rather than adding to it, and an
opened file with nothing renderable in it replaces nothing at all.

**The new module, [src/ai/builder-export.ts](../../src/ai/builder-export.ts)**, is pure and string-in string-out. The browser feeds it markup read off
the canvas; a test feeds it markup the same renderer produced. No DOM, no renderer, no second
implementation of either.

## Three things the plan did not foresee

**The byline could not be written into the page.** grain's own byline helper owns the wording, and the
signature section of the plan argues in as many words against each app carrying its own copy. So
server.ts injects grain's markup into an inert template on the page and the browser reads it back
when you press one of the three buttons. That also survives the freeze, for the same reason the
template library does.

**Both HTML exports have to strip the builder's instrumentation.** The block addresses, the block
ids and the renderer's binding directives all come off. An exported page ships no dispatcher, so an
address on it advertises an operation nothing can perform, which is the tick box's lesson pointed at
the export instead of at the page.

**Refusals were rendered by the server only, and nobody had noticed.** A prompt typed into the page
raised the Can't build head over an empty list, so the page that argues hardest about saying out
loud what it will not fake had been, in the browser, saying nothing. The refusal line joined the
template library and the browser now names what it will not build. This was not optional decoration:
a named refusal is the whole of what import owes a hand-edited file.

## The round trip, driven twice

The claim is the round trip rather than the export, so it is asserted on the FILE rather than on the
function. Export writes bytes, so the unit test parses those bytes and imports them; a test that
only checked the export serializes would not be testing the claim.

Then the honest one, the same shape P3 used. A static export, a plain file server over the frozen
directory, no app server anywhere:

```
built from the address on a static host: 4 cells
exported untitled.json, madeWith = "made with GRAIN by tjakoen"
exported untitled.html, 2295 bytes, byline in source: true
exported untitled.tags.html, 1496 bytes
fresh static page cells: 0
opened it back: 4 cells
ROUND TRIP identical markup: true
said: untitled.json: 4 blocks opened.
```

## What was not done

- **P5 is untouched**, which was the brief. No preview tab, no catalog sidebar.
- **Neither open owner question was answered**, and neither had to be. Nothing in P4 forced the
  question of whether P3's static-host fix is worth its complexity, and nothing here changed where a
  block's data comes from: the exports carry whatever the block table put there.
- **The composition still has no name.** The three files go out under a placeholder stem, which agrees with the
  one line on screen that already named the thing. Whether a composition should have a name of its
  own is open in the design plan and stayed open.
- **The portfolio shell still does not carry GRAIN's byline.** Item 1 of the plan's signature section
  is a shell change rather than a builder one, and this run stayed inside P4.
- **Nothing was pushed.**

## What needs human eyes

- **The drawer copy is five paragraphs under a tool**, and the whole design argument for this screen
  is that prose belongs out of the work area. It is closed by default and it is still five
  paragraphs. That is a judgment call, stamped needs-verification in the tour.
- **The page export needs the network to look right**, because it links this site's stylesheets
  rather than copying them. The alternative is four inlined stylesheets and a file nobody wants to
  open, and the cost is stated in the drawer rather than discovered. Worth a second opinion.
- **The exported page has no theme control.** It comes up in whatever colour scheme the reader's
  machine prefers, through grain's own tokens. That reads correct and was not designed.

## Three reds that are not this run's, each proved rather than asserted

- **The lint gate puts the backtick count at 3071 in the baseline and 3075 now.** A clean git
  worktree of HEAD produces
  a byte-identical per-file census and the same +4, so the baseline is stale against HEAD rather than
  breached by this diff. Not re-baselined, because the baseline file was held by another
  session when this run started.
- **Three visual specs fail: welcome, catalog, resume.** Run in the same clean HEAD worktree, on a
  separate port, with none of this work present: the same three fail. Nothing here touches those
  pages, and the only global artifact this diff moves is the per-component stylesheet bundle, whose
  added rules are every one of them scoped to the builder screen.
- **One red that WAS this run's, and it is fixed.** The test checking that the model is handed the
  ids actually on the page began failing under the full parallel run and passing alone. It was a race this test hid
  until the suite grew: the assertion before the read waits on a chip that is already pressed, since
  the callout it names is at full span from the start, so the read landed before the model had
  answered. It waits for the prompt now, which is what the test is about.

## The tour

[review-builder-take-it-away.md](../../content/tours/review-builder-take-it-away.md), three steps: the export controls, the named refusal
an opened file earns, and the drawer that says what does not travel. Two are stamped
needs-verification, and neither is a bug: one is the misclick-safety path, the other is the copy.

```
http://localhost:3000/builder?crumb=review-builder-take-it-away&crumb-mode=dev&crumb-frame
```

## Doctor

Four rows were due at session start and all four are carried by name rather than fixed: cold-start
context over budget, graphify freshness, run reports behind the commit count (this file is one
answer to that row), and two uncommitted paths in the config repo. None of them is in P4's path and
none was touched.
