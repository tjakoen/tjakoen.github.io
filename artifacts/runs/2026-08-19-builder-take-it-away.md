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
  - src/ai/
  - view/pages/builder.html
  - view/components/pages/builder/
  - e2e/
  - src/server.ts
  - content/tours/
  - plans/site-builder.md
scopeGrowth: the list above is the envelope this run finished inside, restated on 2026-08-19 so the
  ledger measures every touched file against something. The envelope P4 was handed was narrower:
  src/ai/composition.ts and src/ai/builder-page.ts by name, plus src/server.ts only if a route
  proved necessary. Seven files sit outside that original list, every one of them named and reasoned
  in the Scope section below, and builder-page.ts was declared and never needed to change.
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
unpushed: 0 | the count was 2 when this report was written, because pushing is the owner's call and
  had not been given. Both commits, 8d65cb0 and its follow-up 4367a48, reached origin/main later the
  same day and the repo reads ahead=0.
verifiedBy: nobody yet. This is the author's own account and the tour is stamped accordingly.
doctor: 21 checks, 0 failing, 4 due at session start, all four carried by name rather than fixed:
  cold-start context over the 20,000 budget, graphify freshness, mill pinned 0.3.0 behind 0.4.0, and
  the run-ledger row that this file itself was the subject of. None is in P4's path. The ledger row
  is the one this revision answers.
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

## Gate output

Verbatim, so the claim above is checkable rather than summarized.

```
$ bun run check
$ tsc --noEmit
(no output, exit 0)

$ bun test
 592 pass
 0 fail
 2028 expect() calls
Ran 592 tests across 36 files. [2.74s]

$ bun run lint:links
link-lint: 53 rendered file(s), no dead relative links.

$ bunx playwright test e2e/builder-canvas.e2e.ts
  46 passed (10.2s)

$ bunx playwright test
  3 failed
    e2e/visual.e2e.ts:53:3 > welcome (/) matches its visual baseline
    e2e/visual.e2e.ts:53:3 > catalog (/catalog) matches its visual baseline
    e2e/visual.e2e.ts:53:3 > resume (/resume) matches its visual baseline
  1 skipped
  295 passed (2.8m)

$ bun tools/lint-gate.ts
lint gate: 1 lint(s) regressed against tools/lint-baseline.json:
  voice:backtick: baseline 3071 -> now 3075 (+4)

$ bunx crumb check content/tours
(every tour parses; review-builder-take-it-away, 3 step(s), dev)

$ bun tools/verify-export.ts
[verify-export] sitemap.xml: every <loc> resolves to a real file, all trailing-slash canonical
[verify-export] dead-link walk: every internal href/src across the exported HTML resolves
[verify-export] OK
```

## Scope, and where it grew

The brief named six paths. Seven files outside them were touched and each one is named here rather
than absorbed, because growth past the cap is the run's to declare and not the run's to judge.

- **src/ai/builder-export.ts and its test.** The new module. The brief named the files P4 would
  change and not the file it would add, so this is growth in the letter rather than in the spirit.
- **src/ai/builder-canvas.ts.** The browser island. Nothing on this page can hand over a file without
  it, and it was not in the held list.
- **src/ai/canvas-dom.ts.** One entry in the template library, for the refusal line the browser could
  not render. Genuinely unforeseen and genuinely required: import owes a named refusal.
- **src/server.ts.** Two lines in the existing /builder route to inject grain's byline. The brief
  allowed server.ts for a route, and this modifies one rather than adding one.
- **content/tours/review-builder-take-it-away.md and plans/site-builder.md.** The tour a rendered
  change owes, and the plan phase it closes. Both are the standard's own asks rather than scope.

Nothing declared was left untouched except src/ai/builder-page.ts, which turned out not to need a
change: the view already carried the flag the export controls bind their visibility to.

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

## A correction landed after the commit, and it is not this run's change

A parallel agent took the owner's decision on the AI edit path while this was finishing: a bare
block id now resolves up to the long address on the READ side, when and only when the live manifest
holds exactly one target at it. That made three pieces of copy stale, one of them in a file this run
held, so this run fixed all three rather than editing around a sentence it had made wrong to leave.

- **The drawer on /builder** described a fence that no longer exists. The 2026-08-15 counts stay, as
  a dated measurement, and a new paragraph says the fence changed, that the five near misses would
  pass it, and that this is a deduction because **nobody has run the live model against the new
  fence.** The two sentences that had drifted from measured to unverified, only the first line works
  end to end and this model cannot do it yet, now say what was last measured rather than what is.
- **content/tours/review-builder-honest-copy.md**, whose second step told a reviewer to be suspicious
  of a refusal that is gone, and whose closing ask was the decision that has now been answered. The
  ask is now the re-run.
- **plans/builder-design.md Open 3**, which described the normalization as untaken.

**No copy anywhere claims the model can now edit a page.** That claim has no run behind it, and an
unverified improvement is exactly the case honest limits over hype exists for. The next honest move
is one desk-audit pass over the same five scenarios.

## Doctor

Four rows were due at session start and all four are carried by name rather than fixed: cold-start
context over budget, graphify freshness, mill pinned one minor behind, and the run-ledger row this
file was itself the subject of. That last one is answered here rather than carried: the ledger
wanted a verbatim gate section, a real number for the unpushed count, the scope growth named, and a
doctor line. All four are above. The other three are not in P4's path and were not touched.
