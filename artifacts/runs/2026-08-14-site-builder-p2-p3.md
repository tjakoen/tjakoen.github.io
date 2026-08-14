---
title: The builder gets a canvas, and starts working on the site it ships to
date: 2026-08-14
status: complete
lane: gated
branch: main
scope:
  - src/ai/
  - src/server.ts
  - view/pages/builder.html
  - view/components/
  - e2e/
  - content/tours/
  - plans/
  - artifacts/runs/
  - tools/export.ts (ONE line, outside the scope cap, called out below)
touched:
  - src/ai/builder-page.ts
  - src/ai/builder-page.test.ts
  - src/ai/canvas.ts
  - src/ai/canvas.test.ts
  - src/ai/canvas-dom.ts
  - src/ai/builder-canvas.ts
  - src/ai/block-set.ts
  - src/server.ts
  - view/pages/builder.html
  - view/components/molecules/block-form/block-form.html
  - view/components/pages/builder/builder.css
  - e2e/builder-canvas.e2e.ts
  - content/tours/review-page-builder-canvas.md
  - tools/export.ts
  - plans/site-builder.md
skills:
  - loop-standard
  - tour-standard
  - voice
plans:
  - site-builder, P2 and P3 | plans/site-builder.md
gates:
  - bunx tsc --noEmit | exit 0, no output
  - bun test | 504 pass, 0 fail, 1827 expect() calls, 31 files
  - bunx playwright test (full) | 263 passed, 1 skipped, 0 failed
  - bun tools/lint-gate.ts | net ZERO on this diff, see below
  - bunx crumb check content/tours | 16 tours, all pass
  - bun run export + a plain static file server over dist/ | a five-block page built with no app server running
diffstat: 14 files changed (1163 insertions, 160 deletions) across two commits, 14026e2 and 8c60643
unpushed: 46 | portfolio 46, of which 2 are this session's. Grain 14. Pushing stays the owner's call and was not taken.
verifiedBy: nobody yet. content/tours/review-page-builder-canvas.md is written and its five surfaces all resolve; no step this session wrote about its own work is stamped verified.
doctor: four flags due, all four carried by name below, none fixed.
---

# The builder gets a canvas, and starts working on the site it ships to

Two phases, and only the second one is interesting.

**P2 was the reframing.** `/builder` renders a composition now: an ordered list of blocks from the
closed set, laid out in a six-column grid keyed on the three-word span vocabulary. The engine is one
loop calling the one renderer, because `render(name, data, props)` takes the component name as a
runtime string, which is the finding the whole feature rests on. The title, the lede, the examples
and the prose all argue about GRAIN blocks instead of field names. A form is one block.

**P3 was the one to be nervous about, and it was right to be.**

## What was actually broken

The published `/builder` has never done anything. The demo is a GET round trip the *server*
interprets, this site exports to static hosting, and a static host serves one frozen file whatever
the address says. So `dist/builder/index.html` was one file frozen at the empty state, no `?ask=`
variant existed, and every Examples link and every desk-driven build landed on an empty page. For
the page's whole life. It worked in dev and only in dev.

That is now fixed, and the fix is verifiable rather than argued: `bun run export`, then a plain
static file server over `dist/`, then a five-block page built with nothing running that could have
helped.

## The two rules the fix does not break

**No second matcher.** `block-set.ts`, `composition.ts` and the page's own view seam are pure and
client-safe, so the browser imports the same modules the server calls. The closed set, the three
layout words, the refusals and the page's state flags are decided once, in one place, and the two
sides agree because it is the same answer rather than two that match.

**No second renderer.** The page ships every block pre-rendered once by the real server-side
renderer, hidden, as a template library. Composing clones a node and fills it through the same
`data-field` and `data-bind-*` attributes the template already carries. What runs in the browser is
a *filler*: it expands no tag, discovers no component, resolves no props, and knows exactly five
repeats because a closed set has exactly five. Everything structural was settled by the one engine
before the browser woke up.

## Three things the plan did not foresee

**A library entry cannot carry a live address.** The form block declares `data-surface="builder-form"`
as a literal attribute, so the hidden shell answered to the same address the real one does. A tour's
lamp could light a node nobody can see and the manifest would list it, and both failures are the
quiet kind. The library now parks every address as `data-template-surface` on the way in and the
browser renames it back on clone, which keeps the rule generic: no block has to know it carries one.
Caught by checking each tour step's surface against its own page and finding a count of two.

**The export crawler does not follow a page's own script tag.** It seeds the module graph from
`MODULE_ENTRIES` and from nothing else, so the frozen page shipped the island's URL and would have
404ed on it. That is one line in `tools/export.ts`, and `tools/` is outside this run's scope cap. It
is called out here, in the commit message and in the tour's handoff rather than absorbed, because
the owner's acceptance test for P3 is the export, and the export cannot carry this feature without
it. If the call is that the cap wins, the line comes out and P3 works in dev only, which is the state
it was in this morning.

**The comment strip is P3's decision, not P4's.** The previous run flagged that the renderer leaves
a component's HTML comment in its output and that an export would carry every block template's
internal commentary with it. It got decided here instead, because P3's library ships on every load
of this page whether anything is composed or not, so the cost arrived early. Block output is stripped
of comments at the canvas edge. The `data-field` and `data-bind-*` directives are deliberately kept:
the browser reads them to fill a clone, so they are the contract rather than the commentary. Deciding
it at render time rather than at export time means a page that is clean when served is clean when
frozen, and P4 inherits it with no second rule to keep in sync.

## The form path did not move

`field-matcher.ts` is untouched. Every control keeps its address, the tick box still carries a
`check:` address rather than a `field:` one, and the desk still builds and fills a form the way it
did this morning. `desk-form-build.e2e.ts` passes unchanged, all nine tests, and the `builder-form`
surface moved onto the block template precisely so the review tour and both specs keep resolving.

One honest consequence of append semantics is worth stating rather than discovering: a second prompt
naming a form adds a *second* form, because the op set is add, remove, move and span, and there is no
modify. The page says a prompt adds; it does not pretend a prompt edits.

## Gate output

```
$ bunx tsc --noEmit
(no output, exit 0)

$ bun test
 504 pass
 0 fail
 1827 expect() calls
Ran 504 tests across 31 files. [2.60s]

$ bunx playwright test
  1 skipped
  263 passed (1.4m)

$ bunx crumb check content/tours
  ✓ review-page-builder-canvas — 5 step(s), dev      (16 tours, all pass)

$ bun run export
[export] done: 119/119 pages, 85/85 data routes, 33 frozen modules, 93 asset files.
  ⧉ modules  (33 frozen from 6 entries)

$ python3 -m http.server 8899        # in dist/, no app server anywhere
  /builder/?ask=…  → five blocks, a working select, a tick box, one builder-form address
```

## Mutation proof

Four assertions carry the design rather than describe it, and each was made to fail before it was
kept.

| Mutation | What went red |
| --- | --- |
| The comment strip also takes the `data-bind-*` directives | 2 e2e fail: the browser fills nothing, on the static host and on the live one |
| A prompt re-rolls the composition instead of adding to it | 2 e2e fail: the second prompt wipes the first prompt's blocks |
| `b-memo`'s `rows` in the library drifts from `block-form.html` | 1 unit fail: the drift test reads the template and compares |
| (found, not mutated) a library entry keeping its live `data-surface` | the tour's own surface check counted two elements on one address |

## The lint ratchet is flat

Four lints sit above the baseline and all four are pre-existing, measured against a worktree at
`dcb229c`: `voice:backtick` (+70), `unicorn(no-array-sort)` (+10, none of them in a file this diff
touched), `voice:emoji` (+2) and `eslint(no-control-regex)` (+1, `field-matcher.ts`). This diff added
two `no-useless-spread` errors and both were fixed rather than absorbed. One of the two was a real
find: `el.attributes` is a live NamedNodeMap and the fill loop removes attributes as it goes, so the
copy is load-bearing and now says so, while the sibling walk over `root.children` never needed one.

## Session doctor flags, carried by name

Four due, none fixed, and all four are the same four the last two runs carried. `graphify freshness`.
`layer pins current`, one behind on purpose while grain 0.1.22 is held unpublished. `run ledger`,
three older reports from sessions that are gone. `unpushed work`, now 46, of which 2 are this
session's. Grain resolves through a symlink to the working tree, so every green gate above says
nothing about the published package.

## What was NOT done

- **The desk does not append to the canvas through the door.** It still drives this page by
  navigating to `?ask=`, which is what it always did and which now works on the static host too.
  Wiring an append op means new vocabulary in `desk-reasoner.ts`, which is its own piece.
- **The block set is still five.** Widening it is mechanical and P2 was the canvas.
- **Nothing pushed, nothing published.**

## The review

<https://tjakoen.github.io/builder?ask=An%20intro%2C%20two%20cards%20side%20by%20side%2C%20and%20a%20callout&crumb=review-page-builder-canvas&crumb-mode=dev&crumb-frame>

Five steps: the canvas, the form as a block, the composer that adds, the refusals from two tables,
and the spec pane that is now also the page's own memory. Two of them are stamped
`needs-verification` and none is stamped `verified`, because the person who wrote them is the person
who wrote the change.

## What needs human eyes

1. **Whether P3 was worth its complexity.** It shipped, it works, and the cost is a hidden library on
   every load of the page plus one line in the export config. The alternative was `/builder` saying
   honestly that it needs the live app, and that option is still open: the change is two commits and
   comes out cleanly.
2. **Where a block's words come from.** Still deterministic samples from the block table, so every
   card on every composed page says the same thing. The wording seam exists and is not wired, and a
   0.5B is exactly where invention starts.
3. **The one line outside the cap**, `tools/export.ts` `MODULE_ENTRIES`. Kept because the run's own
   acceptance test needs it; removed on request.
4. **Push.** 46 portfolio commits and 14 grain, oldest over a day.
