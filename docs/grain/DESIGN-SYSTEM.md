# 🍞 Sourdough — GRAIN's default theme

*Sourdough* is the visual identity GRAIN ships by default; a consuming product re-skins by overriding token
slots (CONVENTIONS §1), never by editing components. A monochrome, e-ink / Swiss-editorial aesthetic. The whole identity rests on three
things: a warm paper surface, soft inky black, and Redaction's grainy serif. No
color, no shadows, no gradients. Restraint is the brand.

> **Implementation status (2026-06-30): built and live across the app.** What runs
> in the monorepo vs. what's still on the page:
> - ✅ **Tokens** — the monochrome palette is the Layer-1 primitives; the existing
>   semantic aliases were re-pointed at them, so every component re-themed with no
>   per-component edits (`grain/styles/variables.css` — GRAIN's default theme; a product
>   overrides these slots to re-skin).
> - ✅ **Redaction self-hosted** — grades clean / 35 / 50 / 70 as `@font-face`
>   families in `grain/fonts/` (the grain grade is GRAIN's signature). The working
>   **grain grade is 50** (bumped from 35 for visibility; see §3).
> - ✅ **Grade as signal** — the inherited `--type-font` atom; grain = AI / in-transit,
>   clean = human / committed. AI speech *stays* grain (provenance persists). The
>   MECHANISM lives in GRAIN (`grain/styles/grain.css`); drives text, fields, pending
>   cards, and the catalog Human/AI toggle.
> - ✅ **Paper grain layer, masthead, hairlines, crisp radius, underlined links,
>   reduced-motion** — the skin in `grain/styles/global.css`; buttons ink-bordered, no fill.
> - ✅ **Non-text grain** — an AI/in-transit **button** wears a dashed "terminal"
>   edge + block caret (the grain equivalent for a non-text atom; §3 extension).
> - ⏳ **Not built yet** — the **dot matrix** (life grid) signature element; a
>   distinct heavier 8-bit/terminal texture beyond Redaction's own grain.
>
> See `AI-INTERFACE.md` §5 for how grade ties to the interaction layer.

---

## 1. The vibe, decoded

What makes the reference feel like e-ink, in order of impact:

1. **Paper background, not white.** A warm desaturated grey. Pure `#FFF` instantly kills it.
2. **Soft black, not pure black.** Ink is `~#1C` something, so it reads printed, not screen-lit.
3. **Disciplined display type, tight hierarchy.** The reference used a Helvetica-style grotesque; this system swaps in Redaction (see Typography) — a serif whose built-in grain doubles as a state signal.
4. **Masthead pattern.** Small sentence-case eyebrow → big bold headline → hairline rule.
5. **The dot matrix.** Week-trackers and the life grid. This is the signature element.
6. **Crisp edges + hairline rules.** Near-zero border-radius, 1px borders.
7. **No effects.** No box-shadow, no gradient fill, no blur. Flatness is intentional.

---

## 2. Color tokens (the system legend)

Monochrome only. Six values do everything.

```css
:root {
  --paper:        #E2E0D8; /* page background — dimmed warm grey, NOT bright */
  --paper-2:      #E8E6DF; /* subtle hover surface */
  --panel:        #E8E6DF; /* grouped "sheet" — a hair brighter than the page */
  --ink:          #1C1B17; /* primary text, filled dots, rules */
  --ink-muted:    #6E6C64; /* secondary text, section labels */
  --ink-faint:    #ABA89F; /* fading insights, empty/future dots */
  --hairline:     #1C1B17; /* solid rules (under headlines) */
  --line-soft:    rgba(28,27,23,.14); /* translucent border for quiet grouping */
}
```

Note: states are made with **opacity + size**, not new colors. A "today" dot is just
a bigger `--ink` dot. An "off" tracker dot is `--ink-faint`. Keep the palette closed.

### The one signature hue (accent doctrine)

The palette stays closed, with **exactly one exception: a single accent hue.** GRAIN ships a
`--color-accent` slot (+ `-hover`/`-contrast`/`-soft`) that a theme or consuming product sets — the
one brand knob.

- **Full reach.** The accent reaches everywhere brand colour belongs: **links, focus rings,
  `::selection`, the primary button fill** (`--color-primary` chains to it), and the workspace's
  identity marks — the **rail brand icon** and the **presence star** (online). Set one token,
  colour the whole surface.
- **One hue, still closed.** There is **only ever one** accent. **Success and danger keep no hue of
  their own** — they're signalled by weight/treatment/opulence, never a red or green (the "no red
  errors" rule holds).
- **Hueless by default.** The default theme (Sourdough) sets `--color-accent: var(--ink)`, so it
  renders identically to the pure-monochrome system — only `::selection` gains a subtle *ink* tint,
  not a colour. Accented flavors (Baguette's soft blue, Brioche's honey-gold) opt in by overriding
  just the four accent tokens. See `styles/variables.css` (the accent + flavor blocks).

### The two theming axes

Theming is **two orthogonal attribute axes on `<html>`**, both pure token re-skins
(`styles/variables.css`):

- **`data-color-scheme`** — `light` | `dark`; unset = follow the OS. One attribute flips the
  paper/ink stack; components never know.
- **`data-theme`** — the *flavor*. The consumer declares its ordered list on
  `<html data-themes="sourdough baguette brioche">`; the **first entry is the default** (rendered by
  the bare `:root`, so it carries no attribute). GRAIN hardcodes no theme names — add/rename/reorder
  a flavor purely in the markup + a `[data-theme="…"]` token block. Each accented flavor is a
  **reference file** under `styles/themes/` (`baguette.css`, `brioche.css`), `@imported` from
  `variables.css`; copy the annotated **`styles/themes/_template.css`** to add one.

The controls are declarative (`scripts/theme.js`: `data-toggle-scheme`, `data-cycle-theme`,
`data-set-theme`/`data-set-scheme` on any element) and persist to `localStorage`;
`theme-boot.js` (render-blocking, injected by the composition root) pre-sets the saved attributes
before first paint so navigation never flashes the default (the FOUC guard). The server's boot
drift-guard scans `variables.css` + `styles/themes/*.css` and warns on any referenced flavor that
has no token block — a typo can't silently no-op.
Ships today as **Sourdough** (default, hueless, in `variables.css`), **Baguette** (clean, soft blue
accent), and **Brioche** (warm, honey-gold accent) — the latter two as `themes/` reference files.

---

## 3. Typography

**Family — Redaction (MCKL).** A serif drawn from US legal-document typography, with
built-in *degradation grades* (clean → 10 → 20 → 35 → 50 → 70 → 100) that mimic faxed and
photocopied print. Chosen deliberately over a neutral grotesque: it pulls the identity
toward institutional / legal — an archival, records-room gravity — and, crucially, its
grades let the type carry *meaning* (see Grade as signal, below).

- **Weight:** Regular (400) is the house weight, including for headlines — at this grade the
  grain reads finer and more refined than bold. Bold (700) is reserved for rare extra punch.
- **Grades in play:** `Redaction` (clean) and `Redaction 50` are the working pair. `Redaction 70`
  is the display accent — never body text. (`Redaction 100` exists in the type family but is not
  loaded in this bundle.)
- **Body:** clean `Redaction` holds up at reading sizes; `Redaction 50` stays legible for
  short passages but not long body copy.

```css
:root {
  --font-smooth: "Redaction", "Times New Roman", Georgia, serif;     /* clean — human/default */
  --font-grain:  "Redaction 50", "Times New Roman", Georgia, serif;  /* grain — AI/draft */
  --font-accent: "Redaction 70", "Times New Roman", Georgia, serif;  /* display accent only */
}
```

**Loading.** Self-host via Fontsource — one package per grade used:
`npm i @fontsource/redaction @fontsource/redaction-35` (add `-70` for accents), then
`import "@fontsource/redaction"; import "@fontsource/redaction-35";`. Redaction is free for
personal use — confirm MCKL's terms before any commercial release.

**Type scale** (mobile-first, rem @ 16px base):

| Role            | Size            | Weight | Tracking  | Case      | Notes                          |
|-----------------|-----------------|--------|-----------|-----------|--------------------------------|
| Eyebrow         | 0.875rem (14px) | 400    | normal    | Sentence  | name underlined inline         |
| Display (H1)    | 2.25rem (36px)  | 400    | -0.01em   | Title     | line-height 1.02, the headline |
| Section heading | 1.3rem (21px)   | 400    | normal    | Title     | "Overview", "Insights"         |
| Body            | 0.9375rem (15px)| 400    | normal    | Sentence  | line-height 1.55, clean grade  |
| List label      | 0.875rem (14px) | 400    | normal    | Title     | tracker row labels             |
| Caption / muted | 0.8125rem (13px)| 400    | normal    | Sentence  | insight lines, fades out       |
| Button label    | 0.8125rem (13px)| 500    | 0.08em    | UPPERCASE | "START A SESSION"              |

### Grade as signal — giving the font a job

The grades aren't decoration; they encode *state*. This is the system's signature move:
you can tell what kind of text you're looking at from its texture alone — clean means
settled and present, grain means machine-made or in-transit.

A working **grade legend**:

| Grade          | Means                           | Where it shows up                       |
|----------------|---------------------------------|-----------------------------------------|
| Clean          | Human / committed / present     | What you wrote; saved, settled content  |
| Redaction 50   | Machine / in-transit / draft    | AI output, streaming text, unsaved edits|
| 70 / 100       | Heavily ephemeral / decorative  | Rare display accents only               |

Two patterns this enables:

- **Provenance (AI vs human).** Render AI-generated text in `50`, human text clean. The
  grain reads as "transmitted, not-quite-settled" — a fitting metaphor for machine output.
  **AI text *stays* grain after it finishes** — grain = AI, so provenance persists; it must not
  resolve to clean (that would make machine output look human). Only a *human's* optimistic value
  settles to clean once committed. (See `AI-INTERFACE.md` §5 — an earlier "resolve to clean on
  completion" flourish was dropped for exactly this reason.)
- **Focus / editing.** A field or card sits at `35` at rest and snaps to clean while the
  person edits it (or the reverse). The smooth state says "this is yours, right now."

**Implementation notes.**
- Each grade is a *separate font-family*, so switching grade = swapping the family (a class
  change). It's instant, not interpolated.
- For a smooth transition, stack two copies of the text (clean + `35`) and cross-fade their
  opacity — a font swap alone can't tween, but a cross-fade gives the "settling" effect.
- Trigger on `:focus` / `:focus-within`, or toggle a `.is-ai` / `.is-draft` class in JS.

**Guardrails.**
- Readability floor: never use grades above `35` for anything the user must actually read.
- Don't let grain be the *only* provenance cue where trust matters — pair it with a label
  or icon; texture reinforces, it isn't a sole source of truth.
- Offer a way to dampen or disable the effect, and honor it.

### As an atom (inherited grade)

The feature belongs in the **typography atom** so every component inherits it. Use one
inherited custom property; state lives on ancestors, and CSS inheritance distributes it.

```css
:root { --type-font: var(--font-smooth); }   /* default = human/clean */

/* the atom: every type primitive reads the switch */
.t, h1,h2,h3,h4,h5,h6, p, li, label, button, input, textarea {
  font-family: var(--type-font);
}

/* state lives on any ancestor — inheritance does the rest */
.is-ai,    [data-grade="grain"]  { --type-font: var(--font-grain); }
.is-human, [data-grade="smooth"] { --type-font: var(--font-smooth); }
[data-grade="accent"]            { --type-font: var(--font-accent); }

.field              { --type-font: var(--font-grain); }   /* draft at rest  */
.field:focus-within { --type-font: var(--font-smooth); }  /* clean on edit  */
```

Atomic mapping: the **atom** reads `--type-font` (knows nothing about grades). A **molecule**
(message bubble, input field) sets the grade via a class or `data-grade`. An **organism**
(chat thread) just composes them. Add `class="is-ai"` to a bubble and its whole subtree
flips to 35 — no per-component wiring.

**Typing / streaming.** A blinking caret is pure CSS; a single-line `steps()` typewriter is
pure CSS but needs a monospace font and no wrapping. For real (multi-line, proportional, or
AI-streamed) text, append characters in JS — for a chatbot the stream already does this, so
you just style the live text with the grain grade and a CSS caret, optionally resolving to
clean on completion via a two-layer opacity cross-fade.

---

## 4. Spacing, radius, rules

```css
:root {
  /* 4px base scale */
  --s1: 0.25rem;  --s2: 0.5rem;  --s3: 0.75rem;
  --s4: 1rem;     --s6: 1.5rem;  --s8: 2rem;
  --s12: 3rem;    --s16: 4rem;

  --radius: 4px;          /* buttons — crisp, almost square */
  --rule: 1.5px solid var(--hairline);   /* under-headline rule */
  --border: 1px solid var(--hairline);   /* buttons, dotted dividers */

  --page-pad: var(--s6);  /* consistent left/right page margin */
}
```

Layout is **left-aligned, single column, generous air**. One consistent left margin
that everything hangs off — the masthead, section labels, list rows, and insights all
share it.

---

## 5. Components

### Masthead
Eyebrow (with underlined name) → bold display headline → hairline rule.
```
Hello, Helly R.            ← eyebrow, name underlined
You're 54% through life    ← display, bold, tight
─────────────────────────  ← 1.5px rule
```

### Section header
Label left, underlined action link right, baseline-aligned.
```
Overview                              Adjust
Insights & Motivation                See All
```

### Tracker row (week dots)
Label left, a row of 7 dots right. Filled `--ink` = done/active, `--ink-faint` = off.
```
Deep Focus        ● ● ● ● ●  ◦ ◦
Movement Breaks   ● ● ●  ◦ ◦ ◦ ◦
```
Build: flex row; dots are `width/height` + `border-radius:50%`, color swap by state.

### Dot matrix (life grid) — the signature
A full grid of dots. Lived days = `--ink`, today = larger `--ink` dot, future = `--ink-faint`.
Build: CSS grid (`repeat(N, 1fr)`), each cell a circle. ~14 columns reads well on mobile.
Caption sits beneath in muted text.

### Dotted divider
A row of tiny faint dots separating list content from the `+ Add New` affordance.
Build: `border-bottom: 1.5px dotted var(--ink-faint)` (cheapest) or a repeated dot row.

### Insight list
Primary line in `--ink`, then each subsequent line steps down toward `--ink-faint`
(a literal fade). Inline actions are underlined links.

### Buttons
- **Primary:** full-width, `--border`, `--radius`, uppercase tracked label, transparent fill.
- **Icon square:** bordered square holding a single glyph (timer, menu dots).
- **Bottom bar:** three bordered elements in a row — icon / primary / icon.
- **Prompt button:** full-width bordered, sentence-case ("Do you feel good about your time spent?").

No fills, no shadows. Hover = a **quiet ink wash** (`color-mix(in srgb, var(--ink) 8%, transparent)`) —
never a full invert and never a new hue. (The old invert-to-ink hover read as a loud accent block and
made ghost buttons — invisible at rest — pop in as a rounded box out of nowhere; retired 2026-07-04.)

### Links
Always underlined, inline, same ink color. The underline *is* the affordance — no color change.

---

## 6. Nailing the e-ink feel (the details that sell it)

- **No crisp UI shadows or gradients.** The *only* shadow allowed is one very soft,
  warm, large-blur shadow used to lift a grouped sheet off the page (see Grouping).
  Everything else stays flat — no drop shadows on buttons, no gradient fills.
- **Group flat, not floating.** Group content by whitespace + a hairline rule, by a faint
  `--panel` tone, or by a thin translucent `--line-soft` border — the same quiet border the
  color swatches use. Avoid drop shadows for grouping; even a soft one reads as too 3D
  against e-ink's flatness. Reserve solid `--hairline` ink for headline rules, and hard
  borders for things you tap (buttons, inputs).
- **Don't go too bright.** Keep the paper a muted warm grey (`~#E2E0D8`, not `#E9E7E1`).
  The slight dimness plus grain is what reads as a screen-lit e-ink panel rather than
  white paper.
- **Paper grain.** One fixed, full-screen SVG `feTurbulence` layer at ~8% opacity with
  `mix-blend-mode: multiply` — multiply makes it *darken* the surface like fibre instead
  of sitting on top as a grey film. Tune `baseFrequency` ~0.85 for fine grain, and let it
  cover everything including content so the whole surface feels like one sheet.
- **Crisp rules.** 1–1.5px solid hairlines. Avoid sub-pixel blur — round to whole px.
- **Respect `prefers-reduced-motion`** and keep motion minimal anyway; e-ink implies
  stillness. If anything animates, a slow fade fits; bouncy easing breaks the spell.
- **One accent of boldness only:** the display headline weight + the dot matrix. Keep
  everything else quiet.

---

## 7. Responsiveness

Mobile-first. The layout **never becomes multi-column** — it just breathes more as the
screen grows. The discipline that makes the aesthetic work is the same discipline that
makes it responsive: one column, consistent margins, fluid type.

```css
:root {
  --content-max: 768px;                      /* cap the editorial column   */
  --page-pad:  clamp(1.25rem, 5vw, 2.5rem);  /* margins grow with viewport */
  --display:   clamp(2rem, 6vw, 2.75rem);    /* headline scales, body fixed */
}
```

Principles:

- **Constrain the reading column.** Cap content at ~720–768px and center it, so the
  column keeps its proportions on desktop instead of stretching edge to edge.
- **Fluid type with `clamp()`.** The display headline scales between mobile and desktop;
  body stays fixed (~15px) for steady readability.
- **Fluid page padding with `clamp()`** so side margins expand on larger screens.
- **Dot matrix scales, never reflows.** Fix the column count (e.g. 14) and size dots
  relatively (`grid 1fr` + `aspect-ratio: 1`); the whole grid shrinks proportionally.
  Pick a column count that stays legible down to 320px.
- **Tracker rows:** the label flexes, the 7-dot group stays fixed-width on one line at
  every size. Dots don't wrap.
- **Touch targets ≥ 44px** for buttons and icon squares.
- **Hairlines stay 1px** — don't scale rules, or they go blurry.
- **Respect `prefers-reduced-motion`**; keep motion minimal regardless.
- **Test floor: 320px up**, no horizontal scroll.

---

## 8. Build feasibility

| Element            | Difficulty | How                                            |
|--------------------|------------|------------------------------------------------|
| Paper + ink        | Trivial    | Two CSS vars                                   |
| Masthead + rule    | Trivial    | Type scale + `border-bottom`                   |
| Tracker dots       | Easy       | Flex row of `border-radius:50%` circles        |
| Life dot matrix    | Easy       | CSS grid of circles, state by class            |
| Underlined links   | Trivial    | `text-decoration: underline`                   |
| Buttons / bar      | Easy       | Borders + spacing, no fills                    |
| The "right" font   | Medium     | Free stand-in (Inter) or license Helvetica-like|

Verdict: fully achievable with plain HTML/CSS, no JS or framework needed. The only real
decision is the font budget. Everything else is spacing and discipline.
