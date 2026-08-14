---
id: builder-design
status: doing
track: demo
depends: [site-builder]
touches:
  - view/pages/builder.html
  - view/components/pages/builder/builder.css
  - src/ai/builder-page.ts
  - src/ai/builder-canvas.ts
  - src/ai/canvas.ts
  - src/ai/composition.ts
  - e2e/
owner: ai
---

# The builder stops looking like a page about a builder

## Context

P2 and P3 shipped a working page builder on 2026-08-14 and the owner's first reaction was that it
does not feel like one: "we have our dev style console portfolio and it doesn't fit with that, it
looks like every other mill generated page on the site."

That reading is correct, and it is structural rather than a matter of taste.

**`/builder` is built out of the same parts as an essay.** `.board` is the shared reading column,
and the page is a masthead, a lede, five muted paragraphs, section heads and a docs-list. That is
the same skeleton as `/notes`, `/grain/docs` and `/standards`. The canvas is a band inside an
article. Nothing on the screen is chrome: no panes, no work area, no mono, no toolbar.

**The site already owns the tool vocabulary and this page is not using it.** `/mail` is the
precedent: a wider board, a full-height grid, panes with `--line-soft` borders and their own scroll,
`--paper-2` pane heads, mono for counts. `/plans` is the precedent for a screen that gives up the
assistant column because it has no conversation to hold.

**And the biggest reason it does not feel like a builder is not visual at all.** You cannot delete a
block. Or move one. Or change its span. `composition.ts` has `removeBlock`, `moveBlock` and
`setSpan` as pure, tested functions with no control anywhere on them, so the canvas is append-only
and every mistake is permanent until you start over. No amount of chrome fixes that.

## What three mockups settled

Three layouts were built against the real shell with real tokens and real block markup, and looking
at them changed the answer.

**The layout is not what makes it a builder. The block rail is.** One row per block, the id in mono,
the span as three chips you press, a remove at the end. That row was identical in all three mockups
and it is the whole difference between a page that renders a result and a tool you operate.

**A command line at the bottom of the canvas collides with the terminal dock.** Not a styling
problem: two things want the same edge of the screen. The fix is better than the idea it replaces,
because **the terminal already is the log**. The desk thinks out loud there, and a second narration
strip would compete with the one that exists.

**The best thing in the artboard mockup was not the artboard.** It was the file-name edge above it,
`untitled.html · 6 col · 5 blocks`. One mono line does more work than a plate and a drop shadow.

**Half span inside a narrow pane is cramped.** The grid keys off the viewport, so `half` stopped
meaning half of what you can see the moment the canvas stopped being the whole page.

## The shape, settled with the owner 2026-08-14

A workbench: prompt bar across the top where it does not fight the terminal dock, a canvas pane
headed with the file name and the block count, the block rail down the right, and the desk narrating
into the terminal that is already there.

- **The prose leaves the work area.** Five muted paragraphs of honest limits go into a collapsible
  under the tool, closed by default. Still on the page for anyone who came for the argument, out of
  the way of anyone who came to build.
- **The canvas grid keys off its own pane**, through a container query, so `half` means half of what
  you can see whatever the window, the assistant column and the preview-width toggle are doing.
- **The assistant column is collapsed by default on this screen** and the shell's own toggle brings
  it back. The prompt lives in the canvas now, so the chat is not the way in; it is still how you ask
  the desk to build, which is one press away rather than gone.
- **The block rail stays in the main column**, deliberately not a fourth mode of the assistant panel:
  those are controls, and a control that a chrome toggle can close is a control you cannot rely on.

## Phases

- [x] **D1. The shell** (2026-08-14). The workbench grid, the panes, the file-name head, the prompt bar, the
      container query, the collapsed aside, and the prose into a disclosure. No behaviour change: the
      same composition, in a tool instead of an essay.
- [x] **D2. The ops** (2026-08-14). The block rail with a remove and three span chips per row, wired to the
      `removeBlock`, `moveBlock` and `setSpan` functions that already exist and have never been
      called by anything but a test. This is the phase that changes how the page feels.
- [ ] **D3. The desk operates it.** Addresses on the blocks and the vocabulary to reach them, so the
      2GB model can build a page rather than only navigate to a prompt. Deliberately last, and the
      ordering is the tick box's lesson: an address that lands before a working verb advertises an
      operation nothing can perform. No `block:` surface ships until the verb does.
- [ ] **D4. The copy.** The honest-limits prose rewritten for a tool rather than an essay. It is good
      writing aimed at a reader of an argument, and the page it now sits on has a different job.

## Verification

- **D1:** the composed page at three window widths and with the assistant column both open and shut;
  `half` is half of the canvas pane every time. Shown in the session, not asserted.
- **D2:** build a page, remove the middle block, and check the ids of what is left are unchanged;
  press a span chip and watch one block resize without the others moving. The e2e adds a remove and a
  span case; the pure functions are already covered.
- **The form path keeps working at its own address**, which is the same rule P2 and P3 kept:
  `desk-form-build.e2e.ts` passes, and the tour step that asks the desk in the chat is rewritten to
  press the assistant toggle first, since that is now the honest flow.

## Open

1. **Whether the collapsed assistant column should persist across visits.** The screen sets it in
   markup, so the shell's toggle wins for the session and the screen's default wins on the next load.
   That is a per-screen default rather than a preference, and someone who wants the chat pinned on
   this page cannot have it.
2. **Whether a composition should have a name.** The canvas head says `untitled.html`, which is a
   promise D4 either keeps or drops.
