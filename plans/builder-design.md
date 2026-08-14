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
- [~] **D3. The desk operates it.** The VOCABULARY half shipped 2026-08-14 (grain d1a5993, portfolio
      2b3f08f): `block` is a kind in grain's contract, `block.remove` / `block.span` / `block.move`
      are verbs, both new ops are in the dispatcher, and every cell carries its address now that
      something can reach it. What is left is the half that chooses: nothing turns "drop the second
      card" into `block.remove` on `b2` yet, and that is where the small model earns its place.
      The original note follows.
- [x] **D5. The model does the choosing** (2026-08-14, same day, owner's reversal). D3b's word list
      worked and the owner's read was that a page whose whole argument is building with AI should not
      be reaching its decisions without one. It is the right read: the demo's claim was doing less
      than the page said. The 0.5B now reads grain's live manifest and answers with one move;
      grain parses it, grain validates it against that same manifest, and `src/ai/block-reasoner.ts`
      narrows the survivors to the three block verbs and checks their closed word lists, which
      validation does not. Only then does an Intent go out the door. **No fallback**: when the model
      cannot run, the page says so and stops, which was the owner's explicit call over a word list
      that would let the page claim an AI edit for something no AI touched. What survives of D3b is
      the ROUTER, the one question that cannot wait on a model, because building a page has to keep
      working where editing does not.
- [x] **D3b. Something chooses the verbs** (2026-08-14, commit `f6a1df6`, superseded by D5 the same
      day). A deterministic word list resolved a sentence against the blocks on the canvas and
      answered with one of the three verbs. Two things it established survived the reversal and are
      the reason it was worth building: the Intent goes out through `window.grain.door` and never
      through the page's own `applyOp`, because sending a verb and an address down the same wire a
      rail button uses is the whole claim; and a reading that cannot be resolved changes nothing and
      says so, on the line under the prompt bar. What did not survive is the choosing.
- [x] **The kind question, settled 2026-08-14.** Option 1: `block` stays. The estate's own precedent
      decided it, not generality: `check` was made its own kind rather than folded into `field`
      exactly so the advertisement stayed honest per control, every kind grain has is concrete, and
      `region.resize` taking full, half or third reads wrong because those are grid words rather than
      bounds. Renaming later costs one contract edit and one attribute, and by then a second
      rearrangeable surface would be shaping the name instead of a guess.
- [x] **The rail pass** (2026-08-14, commit `4561a9d`). Owner's read after D2: the blocks panel
      should be simplified and collapsible. Simplified by WEIGHT rather than by hiding, so all seven
      controls per row stay present, clickable and tabbable and six of them stop shouting; the chips
      lost their borders because the border was never the information. Collapsible from the rail's
      own head, which becomes the rail: the count stays readable and the canvas takes 167px back.
      A dev-loop defect surfaced and was fixed with it: the module server caches every transpile and
      only grain's `ai/` was watched, so editing one of the portfolio's own browser modules left the
      page running the previous build.
- [x] **D4. The copy** (2026-08-14). The honest-limits drawer rewritten for someone operating a tool
      rather than reading an argument: what you can type first, the vocabulary as a four-line list
      rather than five paragraphs, the editing sentence in it at all, and the two kinds of refusal
      kept because they are the honest half. Shorter than what it replaced. Closed by default, which
      was the owner's call the same day: still there for anyone who came for the argument, out of the
      way of anyone who came to build.

## D3's shape, and the asymmetry it closes

As of D2 a human can remove a block, reorder one and change its span. The model cannot. Its only
lever on this page is writing a description into `field:builder-ask`, which is the right lever for
picking components and the wrong one for everything else: there is no phrase that means "drop the
second card" because the matcher only ever adds. That asymmetry is the gap, and it is exactly the
one the tick box had before `check.set`.

**Why an existing verb will not do.** `field.set` writes text into a control. `navigate` changes
screen. Neither can drop a block from a composition, and stretching one to try is the mistake
`check.set` exists to record: a kind is a promise about which verbs work, so a block wearing a
`field:` address would advertise a write that lands, reports success and changes nothing.

**The verbs, shaped for a SMALL model.** Every payload is either a closed enum or something visible
on the page, because that is the whole of what a 0.5B does reliably.

| Verb | Payload | Why this shape |
| --- | --- | --- |
| `block.remove` | none | Idempotent by construction: `removeBlock` on an id that is gone already returns the same composition. |
| `block.span` | `span: "full" \| "half" \| "third"` | Three words, the same closed set the human presses. A SET, not a cycle, so a replay lands in the state it names. |
| `block.move` | `direction: "up" \| "down"` | Two words rather than a target index. An index is a number a small model drifts on, and the rail's own buttons are already up and down, so the verb matches the affordance rather than the data structure. |

**Adding stays out of the vocabulary on purpose.** A block is added by writing the composer and
building, which is `field.set` plus a control the human or the model presses. That keeps the closed
set closed: the model never names a component, which is the one rule this whole demo rests on.

**Where this lands was the question, and it is answered.** The kinds and verbs live in
`grain/ai/contract.ts`, and the portfolio consumes the stack rather than forking it, so a `block`
kind is a GRAIN change and a fleet-wide one. Three ways were on the table and the owner took the
first on 2026-08-14:

1. **A `block` kind in grain**, on the argument that an ordered list of components a person
   rearranges is a general GRAIN pattern rather than this page's private idea. **Taken.**
2. **A more general kind**, `region` or `slot`, with `region.remove` / `region.move` /
   `region.resize`, covering any rearrangeable list including a dashboard or a form designer.
   Rejected as generalizing before a second consumer exists to shape the name.
3. **Nothing in grain.** The blocks stay push-only addresses with no verbs, the model keeps its one
   lever, and the honest version of this page says the AI can compose but not edit.

## What the model is not allowed to have chosen

grain's `validateMove` is the safety boundary and it is not the whole fence. Measured on 2026-08-14
rather than assumed: it checks that the verb exists, that the target is a surface on this screen,
that the surface accepts the verb, and that the payload matches the SCHEMA. It does not check the
payload's closed WORD list, so `span: "wide"` is a string where a string was required and passes.
The dispatcher would refuse it a beat later into the console, which a visitor reads as nothing
happening after the page announced a change. So `block-reasoner.ts` checks the three width words and
the two directions itself, before the page says anything.

Two more narrowings live there. A validated move that is not one of the three block verbs is
refused, because `field.set` on this page's own prompt box is a perfectly legal move and would have
the model type into the box you asked the question in. And a reply-without-acting is a first-class
answer rather than a failure, because "the card should mention pricing" has no verb and saying so is
the correct response.

**The limit that cannot be engineered away.** Nothing catches a move that is legal and WRONG. Asked
for the second card, a small model may hand back the first, and b2 is as real an address as b4. The
page therefore names the block it is about to touch before the op lands. The honest demo is the one
where you can watch it pick the wrong block, not the one that cannot.

## What routes, and what it will not guess

Something has to decide whether a prompt is describing a page or editing the one already here, and
that decision cannot go to the model. A description has to compose on a machine that cannot run a
model at all: that is this page's whole no-JavaScript, no-WebGPU, static-host story and it predates
the desk by months. If every prompt waited on a completion to find out what kind of prompt it was,
building a page would stop working wherever editing does. So the router runs first, it runs on
nothing, and only what it routes to an edit ever reaches the model.

**It is grammar rather than vocabulary, and that was bought with a defect.** The first version asked
whether the sentence carried a verb word, and a real prompt broke it the day it shipped: "a form to
sign up" contains " up ", so it was read as a move, went looking for a form to move, found none, and
refused to build the form it was being asked for. A word list can only ever grow another hole. You
edit "the card" and you ask for "a card", so the question is which one the sentence said.

Three ways to be pointing at something here. A bare id, because the rail prints them and nothing
else looks like one. A pronoun, because a page that does not exist yet has no "it". Or a definite
marker with a block noun AFTER it, and the order is the whole rule: "the second card" points at a
card, while "a card above the fold" carries both words and points at nothing, because the card comes
first and what follows "the" is a fold.

Both mistakes cost something real, which is why the rule tightened once before it was right. A false
NO sends an edit to the matcher, which adds rather than edits. A false YES sends a description to
the model, which answers that no verb applies, and the description is never built at all.

One guard is load-bearing and not obvious: an EMPTY page is never an edit whatever the words say,
because "drop in a card" is an ordinary way to ask for a card and where there is nothing to drop it
can only mean the add it sounds like.

## Verification

- **D1:** the composed page at three window widths and with the assistant column both open and shut;
  `half` is half of the canvas pane every time. Shown in the session, not asserted.
- **D2:** build a page, remove the middle block, and check the ids of what is left are unchanged;
  press a span chip and watch one block resize without the others moving. The e2e adds a remove and a
  span case; the pure functions are already covered.
- **The form path keeps working at its own address**, which is the same rule P2 and P3 kept:
  `desk-form-build.e2e.ts` passes, and the tour step that asks the desk in the chat is rewritten to
  press the assistant toggle first, since that is now the honest flow.
- **D5:** nothing in its e2e applies an op by hand. Only the prompt bar is touched, so a passing test
  means the whole chain ran: the router asked, grain built the prompt, the model answered, grain
  validated it against the live manifest, the door took the Intent, the dispatcher moved the DOM, and
  the page read its composition back off it. Seven e2e cases split across the two honest states, a
  scripted engine standing in for the 0.5B because headless CI has no WebGPU, and the refusals are
  the ones that matter: a bad move must change nothing at all.
- **The REAL 0.5B, measured 2026-08-14, and it does not choose right.** `tools/desk-audit.ts` grew
  five `/builder` scenarios, and they are the first thing that has ever asked the live model to edit
  a page: the sentence goes into the canvas composer rather than into chat, and the CANVAS is what
  gets graded, because the said line is a claim about an op and the canvas is whether the op
  happened. Eighteen model answers across five runs. Not one of them landed a correct op, and not one
  of them targeted a block at all. Sixteen of eighteen answered `move`, which is not a verb in the
  vocabulary; fifteen aimed it at `builder-rail`, which is a real surface on the page that accepts no
  verb. One answered `block.remove` on `builder-said`, the line the page writes its own status to.
  One ran away into a payload nesting `builder-rail` inside itself until it hit the token cap. The
  payload key drifted between `direction` and `move`, and every answer carried a confident reply
  saying the page had been changed.
- **It is the vocabulary, not the reference.** The obvious reading is that "the second card" is a
  filter and a count and a 0.5B cannot do either, so `builder-bare-id` asks the same thing the other
  way: "drop b4", the address handed over literally, nothing left to resolve. Same answer, `move` on
  `builder-rail`. No amount of better referring language reaches this, which is worth knowing before
  anyone spends a day on the phrasing.
- **The prompt is not the problem either.** It was read rather than assumed: the manifest handed over
  lists `block:b1` through `block:b4` against all three block verbs, and this page's own line under it
  names the four ids, the three width words and the two directions.
- **What the same runs DO prove, and it is not nothing.** Every failure was caught. The router routed
  the sentence to the edit path, grain built the prompt off the live manifest, grain refused what came
  back, the page said which refusal it was, and the canvas was byte-identical in all eighteen runs.
  The honest claim is now the other way around from the one this section used to make: the fence is
  measured and holds, and the thing inside it cannot yet do the job.
- **D4:** read only the four-line list in the drawer and try to operate the page from it. Then check
  the drawer was shut on arrival.

## Open

0. **The catalog visual spec fails in the FULL e2e suite and passes alone.** `Timeout 5000ms
   exceeded`, no pixel diff, measured at HEAD and with the diff, alone and in the suite. It is load,
   not a regression: this work added fifteen tests to the parallel run. Raising that timeout is
   tuning a gate until it passes, so it is the owner's call and was left red rather than nudged.
1. **Whether the collapsed assistant column should persist across visits.** The screen sets it in
   markup, so the shell's toggle wins for the session and the screen's default wins on the next load.
   That is a per-screen default rather than a preference, and someone who wants the chat pinned on
   this page cannot have it.
2. **Whether a composition should have a name.** The canvas head says `untitled.html`, which is a
   promise D4 either keeps or drops.
3. **What to do about a model that cannot use the vocabulary.** The measurement above is a result
   rather than a bug report, and the fix is a design call rather than a session's. Three directions
   are visible from the data and they are not equally cheap:
   - **Narrow what the screen offers the reasoner.** The manifest this page hands the model is 14
     actions and 53 targets, 17 of which are chat message ids, and the model reliably picks a
     plausible-looking surface out of that list rather than a block. That is the strongest lead, and
     it is GRAIN's: `manifestForReasoner` is grain's function and narrowing it is a fleet-wide
     change, not one page's fix.
   - **Retune `blockMessage` here**, which is the portfolio's own and therefore the cheap one, on the
     bet that a shorter, more repetitive user turn beats a longer manifest. Worth one attempt, and
     the audit now measures whether it worked.
   - **Say so on the page.** The page already argues that the honest demo is one where you can watch
     it pick the wrong block. A demo where it never picks a block at all is a different sentence, and
     if the first two directions do not land, that sentence is what the drawer should say.
