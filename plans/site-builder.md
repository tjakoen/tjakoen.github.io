---
id: site-builder
status: todo
track: demo
depends: [builder-sandbox]
touches:
  - src/ai/block-set.ts
  - src/ai/composition.ts
  - src/ai/builder-page.ts
  - src/ai/field-matcher.ts
  - src/ai/desk-reasoner.ts
  - src/server.ts
  - view/pages/builder.html
  - view/components/pages/builder/
  - view/components/molecules/page-foot/
  - scripts/
  - e2e/
owner: ai
---

# The builder becomes a page builder, not a form builder

## What this is, and what it is not

**A proof of concept: GRAIN composed by an AI.** That is the claim being tested, and it is the
reason the scope is ONE page. It is not a website builder, it is not a CMS, and multi-page is not a
missing feature to be added later. One page is enough to answer the question, and the question is
whether a design system can be shaped so a model picks from it rather than inventing against it.

**The bar is a SMALL model, not a good one.** The 0.5B in the browser is the target, and it is the
target on purpose: anything that only works when the model is large is a demo of the model rather
than of the design system. So every decision here is shaped by what a small model can do reliably,
which is choose from a closed list and fill a tiny payload, and by what it cannot, which is invent a
name or write a paragraph. The closed block set, the three layout words and the code-owned sample
content are all that rule applied.

**The route to getting there is the one the tick box took.** Prove no existing verb can do the job,
add a KIND (a kind is a promise about which verbs work), add the verb shaped as a SET rather than a
toggle so a replay is safe, add the render op, and put the address on the element LAST. An address
that lands before a working verb advertises an operation nothing can perform, and it fails at the
moment nobody is watching. See `grain/packages/grain/plans/check-set-op.md`.

## Context

Two different things have been sharing one word, and this plan separates them.

**"Form builder" meant building forms from data**, and that is done: grain's `b-field`, `b-choice`,
`b-memo` and `b-check` render a form from a JSON spec, the frame carries hints, errors and the
required marker, and as of 2026-08-14 the AI can operate every control including a tick box. That
work is finished and stays finished.

**"The builder" on the site means prompt to GRAIN**, and that has not been built. What ships at
`/builder` is a form generator wearing the sandbox's name: its title is "Describe a form. Get one
back.", its closed set is field kinds, and its whole argument is about picking field names. The
sandbox plan already says that framing does not carry over. A run earlier today read that plan's
piece 2 too narrowly and widened the *form* matcher with a tick box rather than starting the
component dimension, which is more of the thing that was already done rather than a step toward the
thing that was not.

Vision settled with the owner, 2026-08-14: **one page, blocks that can sit in a layout, each prompt
adds to what is already there, and you can take the result away as JSON, as rendered HTML, and as
the tag source a developer would have written.** Every exported page carries the GRAIN byline.

## Two findings that change the shape

**1. Composing GRAIN from data needs no new engine.** `createRenderer` returns
`render(name, data, props)` and it takes the component name as a **runtime string**
([`batch/render/render.ts`](../../batch/render/render.ts), re-exported by
[`src/render.ts`](../src/render.ts)). A composition is therefore a list of
`{component, data, props}` rendered by a loop. The closed set stays code-owned exactly as
`field-matcher.ts`'s tables are, and the model never gets to name a component.

**2. The published `/builder` does nothing, and has never done anything.** The demo is a GET round
trip the *server* interprets, and the site exports to static hosting. `dist/builder/index.html` is a
single file frozen at `data-builder-state="empty"`; no `?ask=` variant is exported and there is no
server on Pages to interpret one. So on the real site, every Examples link and every desk-driven
build lands on an empty page. It works in dev and only in dev. Whatever replaces it has to compose
in the browser, and that requirement should drive the design rather than be discovered late.

## The model

**A composition is an ordered list of blocks.** One block:

```json
{ "id": "b3", "component": "callout", "span": "half",
  "data": { "title": "Honest limits", "body": "Nothing here submits anywhere." },
  "props": { "tone": "quiet" } }
```

- `component` is a name from the **closed block set**, never model-authored.
- `data` is what the component's own bindings read, the same shape a catalog doc's example carries.
- `props` are config attributes, the same ones a hand-author would put on the tag.
- `span` is the layout vocabulary and it is deliberately tiny: `full`, `half`, `third`. Not free CSS.
  The sandbox plan's warning about layout decisions is answered by making layout a closed set of
  three words, so a description can ask for two things side by side and the matcher answers with
  `half` rather than inventing a grid.

**The block set, v1** (the owner chose the self-contained content blocks plus a few organisms):
`card`, `stat-tile`, `callout`, `figure`, `media-card`, `chip-group`, `status-list`, `table`,
`gallery`, `code-block`, `lede`, `made-with`, plus `timeline`, `note`, `chat-log`, `presentation`,
plus **`form`** as one block whose internals are today's field tables. Everything else refuses out
loud, by name, with a reason: `app-shell`, `side-rail` and `topbar` are page furniture a description
cannot sensibly ask for, and saying so is the honest half of the demo.

**P1 shipped five of them**, `lede`, `card`, `callout`, `stat` and `form`, which is the spine rather
than the set: each one needed a template written, and widening the table is mechanical from here.
Two refusals in the shipped set are worth reading, because they are different kinds. Page furniture
is refused **on principle**: a description asking for a side rail has misunderstood what is being
built. Everything else is refused as a **gap with a date on it**. A refusal that cannot say which of
the two it is teaches nobody anything, and the images one is the honest example: a figure or a
gallery needs a real image to point at, and an invented `src` is a broken picture with a confident
name.

## Where the composition lives, and the static-host answer

The composition is **client state**, because the site it lives on has no server. The URL keeps
carrying the latest prompt, which is cheap, shareable, and what makes an example link work; the
composition itself does not go in the URL, because a whole page of blocks grows past what a link can
carry and turns the address into a blob.

**Rendering it in the browser without building a second renderer.** The page ships every block in the
set **pre-rendered once by the real server-side renderer**, hidden, as a template library. Adding a
block clones that node and fills it by reading the same `data-field` and `data-bind-*` attributes the
templates already carry. That is not a parallel system: it is the same contract, read in the browser,
over markup the one renderer produced. It is the same family of work as `ai-dispatch.js` reading
`data-surface`.

**Each add goes through the one door.** A prompt raises an Intent; the reasoner picks blocks from the
closed set and returns ops that append them to the canvas surface. Reorder and delete are ops too.
This buys the spotlight, the timeline and the AI-as-actor treatment for free, and keeps the rule that
there is no privileged AI-to-DOM channel.

## Phases

Each is a session's worth and each ends with something you can look at.

- [x] **P1. The composition spec and the block set** (2026-08-14). `src/ai/block-set.ts` (the closed
      table, the layout vocabulary, the refusals) and `src/ai/composition.ts` (the spec, add, remove,
      move, span, and the export document). The form block wraps `field-matcher.ts` untouched.
      **One thing had to come with it that the plan did not foresee:** the blocks needed templates
      before the table could name them. Not one of grain's molecules or organisms ships an `.html`
      file, so `render("card", …)` had nothing to expand, and a table naming an unrenderable
      component is the same false promise as an address advertising a verb that does not exist. Five
      thin templates now live in `view/components/molecules/block-*`, each emitting exactly the
      markup grain's own doc for that molecule documents and declaring no class of its own. A test
      renders every block in the set through the real renderer and fails if one of them expands to
      nothing.
- [x] **P2. The canvas renders a composition server-side** (2026-08-14). `/builder` renders a
      composition into a six-column grid keyed on `span`, through `render(name, data, props)` in a
      loop. The page copy, the title and the examples all argue about blocks now. The form path is
      unchanged at its own address: the `builder-form` surface moved onto the block template so the
      review tour and both e2e specs keep resolving. **One decision came with it that P4 was going
      to have to make anyway:** the renderer leaves a component's HTML comment in its output, which
      is fine for a page whose components carry a line and wrong for one whose block templates carry
      a paragraph of design commentary, so the canvas strips comments at its own edge. The
      `data-field` and `data-bind-*` directives are deliberately kept, because P3 reads them.
- [x] **P3. The browser composes** (2026-08-14). The hidden template library, the client-side fill,
      and the composer appending rather than round-tripping. Proved the honest way: `bun run export`,
      then a plain static file server over `dist/`, then a five-block page built with no app server
      running. Two things the plan did not foresee. A library entry cannot carry a live
      `data-surface`, because a hidden template answering to an address puts a second element on a
      name meant to name one thing, so an address is parked on the way in and renamed back on clone.
      And the export crawler seeds its module graph from `MODULE_ENTRIES` only, never from a page's
      own script tag, so the island had to be listed there or the frozen page 404s on the very
      script that makes it work. The **desk appending to the canvas through the door is NOT wired**:
      the desk still drives this page the way it always did, by navigating to `?ask=`, which now
      works on the static host too.
- [ ] **P4. Take it away.** Three exports off one spec: the JSON (round-trips through import), the
      rendered HTML with grain's stylesheet, and the tag source a developer would have hand-written.
      Every exported page carries the byline. Import is a file picker plus the same validation the
      matcher uses, so a hand-edited JSON degrades to a named refusal rather than a broken page.
- [ ] **P5. The preview tab and the catalog sidebar**, the sandbox plan's pieces 4 and 5, unchanged
      in intent. The sidebar already has a catalog pane
      ([`portfolio-frame.html`](../view/components/organisms/portfolio-frame/portfolio-frame.html)),
      so that piece is close to a default flip.

## The signature, and how to keep it across GRAIN

The owner asked for "built with GRAIN" on every builder-exported page, and for suggestions on holding
the signature across GRAIN generally. There is already a canonical answer in the estate, and the
portfolio is the one repo not using it.

**What exists.** `madeWith()` in
[`grain/scripts/made-with.js`](../../grain/packages/grain/scripts/made-with.js) returns
`made with GRAIN by tjakoen` as markup, with a `made-with` molecule for the styling, and its own doc
says it is mounted at the bottom of every GRAIN app's shell so provenance reads identically across
the fleet. Pantry, greenroom, proof and mill import it.

**Four things worth doing, smallest first.**

1. **Mount it on the portfolio.** Grep finds no use of `madeWith` or `made-with` anywhere in `src/`
   or `view/`. The site that owns GRAIN is the one app not carrying GRAIN's byline, which is the
   funniest possible gap and close to a one-line fix in the shell.
2. **Stop hand-copying the footer.** The `page-foot` prose ("Part of tjakoen.github.io, built with
   itself", plus the Built-with-Claude paragraph) is duplicated verbatim in five page files. It has a
   CSS file and a doc but no template. Make it a real component so the two signatures, GRAIN
   provenance and AI provenance, can never drift page to page.
3. **Every builder export carries it, and carries it in the source.** The footer is the visible half
   and someone will delete it; an HTML comment at the top of the exported file, and a
   `data-made-with` attribute on the root, are the half that survives a deletion without being a dark
   pattern. Say in the export copy that it is there.
4. **A signature is more than a line, and the rest is already there.** The default flavour, the mono
   voice, the grain-against-clean grade: an exported page that ships with the token file carries the
   look even where the byline gets stripped. Worth stating once in the export copy rather than
   building anything.

## What this supersedes and what it drops

- [`builder-sandbox.md`](builder-sandbox.md) pieces 2 to 5 are replaced by P1 to P5 here. Piece 1,
  the composer, shipped on 2026-08-14 and carries over unchanged.
- **Nothing is deleted.** The form path stays reachable, the field tables become the form block's
  internals, and the tick-box work of 2026-08-14 is what lets a generated form still be AI-operable.
- The page's form-builder framing does go: the title, the lede, and the prose that argues about field
  names specifically.

## Verification

- **P1:** `bun test src/ai/` — the block set's tokens match, an unknown component refuses by name,
  add/remove/reorder are pure and order-stable.
- **P2:** an ask for two blocks side by side renders both at half span; a form-shaped ask still
  renders a form. Shown in the session, not just asserted.
- **P3:** the honest one, and it is `bun run export`, then serving `dist/` and building a page there
  with no server running. That is the test the current demo would fail today.
- **P4:** export a composition, import the JSON back, and diff the rendered output against the
  original. Byline present in all three export forms.
- **e2e** through `desk-form-build.e2e.ts`'s existing harness, plus a review tour whose steps are the
  canvas, one generated block, and the export dialog.

## Open, and they are the owner's

1. **Whether P3's static-host fix is worth its complexity**, or whether `/builder` should honestly
   say it needs the live app. The demo has been silently empty on the published site for its whole
   life, so doing nothing is also a choice, it is just not the current one by intent.
2. **What a block's `data` comes from** when a description does not supply it. Sample content from
   the block table is the deterministic answer; the model composing it is the wording seam, and on a
   0.5B that is where invention starts.
