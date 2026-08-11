# Grain's token debt, G1 to G4, and the card that unblocked it

2026-08-11. Closes `plans/grain-token-debt.md`. G0 shipped in the previous session and waited on one
answer; this run spent that answer and finished the plan.

## The answer, and what it decided

The owner walked `review-grain-status` and finished the card. Two asks, both recorded in
`plans/decisions/answers.jsonl`:

- **treatment**: "I like B, but FILL on hover as well for DELETE"
- **chips**: "same answer"

So the vocabulary is weight, never hue, and the one place a solid fill is spent is the hover on the
control you cannot undo. Everything below follows from that and from nothing this session decided.

A first attempt at reading the answer timed out at 5 seconds and the session stopped rather than
pick a treatment. That was the right call on the evidence and the wrong wait: the answer landed
minutes later. A wait measured in seconds is not a wait.

## What shipped

**G1, `b-button.css`.** `data-status="danger"` takes a doubled rule at rest and a solid ink fill with
a paper label on hover. `data-status="success"` gets no visual rule at all — the answered candidate
rendered Default and Save identically, so success stays semantic and ranking stays `data-variant`'s
job. The four `--btn-accent*` tokens are deleted, not wired: `--color-success` and `--color-danger`
both resolve to `var(--ink)`, so connecting them could never have produced a difference.

**G2, `crumb.css`.** `--accent` to `--color-accent`, `--ink-soft` to `--ink-muted`, `--font-ui` to
`--font-smooth`. Not `--type-font`: that is the grade switch, and using it would flip the review
chrome to the grain face under any `data-grade` ancestor. `--ok` and `--warn` are gone, so the literal
green and orange that reached the screen through a fallback nobody chose are gone with them. The three
`--ink-soft` fallbacks had drifted to 55%, 60% and 62% of ink while all meaning "secondary text"; one
token removes the drift as well as the phantom.

**G3, `packages/grain/styles/vars-defined.test.ts`.** Every `var(--…)` in the package set resolves or
the test says so, and a fallback is not an excuse — that is the whole point, since `var(--nope)` gets
noticed within the hour and `var(--nope, green)` ships. **It found three more of the same class on its
first run**, each hidden by a plausible fallback: `--editor-header-h` (three organisms agreeing on a
magic 2.9rem that none of them defined), `--z-presentation` (a z-index missing from the ladder it
belongs to), and `--color-grain` (one reference in the whole estate, with no hue to point it at).
All three now resolve at the values that already rendered, so nothing moves visually and the
agreement becomes real. Seven references are allowlisted with a receipt each: three written at runtime
by `cmdk.js`, four documented per-instance knobs the caller supplies inline.

**G4, the leaks.** Defining "leak" was the job. A leak is a raw px/rem literal that RESTATES a token
on the spacing, radius or type scale. Rule thicknesses, breakpoints, layout dimensions, em/ch values,
calc offsets and one-offs matching no token are not leaks. Measured against that: **7 leaks in 2
files**, now fixed. Of 291 raw occurrences, 28 were inside comments and never code. The audit's "100"
was not a measurement and neither was the "292".

**The two card asks**, raised mid-run and both in CRUMB: the paste block is now a `<details>` shut by
default, and the card scrolls instead of growing off the screen.

## What the walk found that reading would not

**The check's own first run was wrong.** It reported `--ok` and `--warn` as still undefined in
`crumb.css` — reading them out of the comment that explained they had just been removed. It blanks
comments before scanning now. A checker that reads prose invents defects, which costs more trust than
the ones it catches.

**`max-height: 100dvh` did not fix the card, and the test that said it did was the test.** The card is
`position: fixed` with an inline top and grows downward, so a card shorter than the viewport still runs
off the bottom if it starts low enough. Opening the paste block did exactly that. The budget is now
computed in `placeCard`, where the top is decided, and the card re-places when the block toggles.

**A headless renderer lied about `backgroundColor`.** Reading computed style said the hover fill was
not applying — and said the same for a plain `background: #1C1B17` set inline, which is impossible.
The paint was correct all along; the readback was not. Verified in pixels instead. Border widths read
true in the same session, so the trap is specific and quiet. This is the second time a headless probe
has faked a defect here.

**The portfolio does not consume local grain.** `node_modules/@tjakoen/grain` is a real directory at
`^0.1.19`, not a link, so none of G1 to G4 reaches the running site until grain is published. The
files were staged into `node_modules` to verify the render and **restored afterwards**; the tree is
back to the published state.

## Gates

- grain, `bun run --filter '*' test`: 577 pass, 0 fail across 5 packages.
- portfolio, `bun test`: 365 pass, 0 fail.
- `bunx proof verify plans`: OK. Three warnings, none from this work: two belong to other plans and
  one to another session's staged file.
- Tour walked in both presentations, popover and framed sidebar, with screenshots. G1 at rest and on
  hover, the chip treatment, the collapsed paste block, and the scroll under a card forced past the
  viewport (content 1348px clamped to 846px, body scrolled, Finish still on screen).

## Left open, deliberately

- **Grain is committed but NOT pushed.** Pushing to main publishes any package whose version changed,
  and whether to cut a grain release is the owner's call, not this session's. Until then G1 to G4 are
  real in the repo and invisible on the site.
- The review page `view/pages/review/grain-status.html` and its tour are deleted, and `REVIEW_ONLY` in
  `tools/export.ts` is now empty. The tour went with the page because it walked a route that would
  otherwise 404; the answer survives in `answers.jsonl` and in the plan.
- A visual overlap between the nav rail and the detail pane in the framed sidebar, seen in the
  screenshot when the rail is long. Not touched: it is outside what this run changed, and it is
  reported rather than quietly fixed or quietly ignored.
