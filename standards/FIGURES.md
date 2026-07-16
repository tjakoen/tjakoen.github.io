---
title: FIGURES.md — figures & visualizations
summary: The standard for every diagram and chart - two tokenized inline-SVG scaffolds (data-viz and flow), one palette each, no mermaid on the published site.
---

# Figures & visualizations: the standard

> The standard for every diagram and chart in Tjakoen's notes, docs, and pages. Companion to
> [`VOICE.md`](VOICE.md) (which owns the prose); this file owns the pictures. The point is that a
> figure should be built to a **contract**, not hand-drawn from zero each time. Every figure here is
> **inline SVG**, built to one of two scaffolds, so it renders on the published no-build site with zero
> dependencies and every figure is a member of the same family: you re-skin them all by editing tokens,
> never by editing shapes. Same philosophy as the rest of the stack: tokens are the theme, DRY to a
> fault, design tells the truth.

## Two figure shapes, one medium (the one rule)

Everything is inline SVG. Which of the two scaffolds you copy is decided by what the figure *is*:

| The figure is… | Copy | Palette | Why |
|---|---|---|---|
| **Quantitative data-viz** — bars, ratios, timelines, the multiplier | the **data-viz scaffold** below | self-contained e-ink palette, hardcoded on the root | Precise proportions, exact labels, one fixed measure down the page; it carries its own palette so it looks identical everywhere, even committed as an image. |
| **A flow, loop, relationship, or architecture** — steps, cycles, "A → B → C" | the **flow scaffold** below | inherits the page's `--color-*` theme tokens | It sizes to its own content and themes with the site (it inverts in dark), so a diagram reads as part of the page it lives on, not a pasted-in light rectangle. |

**On mermaid.** It used to be the tool for flows, but the published site ships zero framework JS and
MILL never gained server-side `mermaid`→SVG rendering, so a `mermaid` block renders in your editor
preview and on GitHub but is **blank on the live site**. Practice converged on hand-built flow SVGs
instead (see the references below), and that is now the standard. Mermaid is fine as an **optional
source draft** you keep for your own readability, but it is never the published form: hand-convert it
to the flow scaffold before it ships. Don't reach for it to chart a proportional bar either, that has
always been an SVG.

## The data-viz scaffold (copy this, don't freehand)

Every data-viz SVG starts from this exact skeleton. The palette lives **once**, as CSS custom
properties on the `<svg>` root; every shape and label references a token via `style="…:var(--x)"`.
Change a color in one place and the whole figure re-skins. No hardcoded hex below the root.

```html
<svg viewBox="0 0 620 H" width="100%" role="img"
     aria-label="State the actual data here, in words (a screen reader reads this, not the bars)."
     style="max-width:560px;height:auto;font-family:Georgia,'Times New Roman',serif;
            --paper:#faf7f1;--edge:#e6ddd0;--ink:#2b2b2b;--muted:#6b6259;--bar:#cbc1b3;--accent:#d97757"
     xmlns="http://www.w3.org/2000/svg">
  <rect x="0.5" y="0.5" width="619" height="H-1" style="fill:var(--paper);stroke:var(--edge)"/>
  <text x="28" y="30" style="fill:var(--muted);font-size:15px">Figure title</text>
  <!-- bars, ticks, labels — all reference tokens, never literal hex -->
  <text x="28" y="H-12" style="fill:var(--accent);font-size:13px">The single payoff line.</text>
</svg>
```

### The tokens (the palette, single source)

| Token | Value | Role |
|---|---|---|
| `--paper` | `#faf7f1` | warm background |
| `--edge` | `#e6ddd0` | hairline frame |
| `--ink` | `#2b2b2b` | primary bars + emphatic labels |
| `--muted` | `#6b6259` | titles, secondary labels, values |
| `--bar` | `#cbc1b3` | the *lesser* bar (the thing being out-measured) |
| `--accent` | `#d97757` | coral, **used exactly once**, on the payoff line |

### The type scale

Serif always (Georgia / Times, set once on the root and inherited). Sizes: **title 15**, **label 14**,
**value 12.5**, **payoff note 13**. Nothing else.

### Non-negotiables

- **Canvas is `0 0 620 H`**, `width="100%"`, `max-width:560px`. Vary only the height `H`. This keeps
  every figure the same measure down the page and responsive by default.
- **`role="img"` + an `aria-label` that states the data in words.** The figure is decorative to a
  screen reader without it; the label *is* the accessible figure. (AI-legible ≈ agent-affordance ≈
  a11y, same coin.)
- **One accent, one payoff line.** The coral appears once. If two things are "the point," neither is.
- **Self-contained.** No external assets, no `<image>`, no web fonts. It must survive the static export.
- **No `<style>` block, no client JS.** Tokens go on the root's `style` attribute (widely honored);
  a `<style>` element risks being stripped by markdown sanitizers, and script would break the
  zero-framework-JS promise.
- **Follow it with a one-line italic caption** in the prose (`*The inversion: …*`), like the reference figure.

## The flow scaffold (steps, loops, relationships)

A flow is structural, not quantitative, so it does the opposite of the data-viz figure on one point:
it **inherits the page's theme tokens** instead of carrying its own palette, so it themes with the
site and inverts in dark. It reads `--color-fg` (nodes + node labels), `--color-bg` (the page behind
it, used for label halos and for text on a filled node), `--color-line` (node borders), and
`--color-muted` (arrows, the arrowhead marker, secondary sub-labels). Never hardcode hex.

```html
<svg viewBox="-1 0 263 502" width="100%" role="img"
     aria-label="State the flow in words, node by node, including the loop and the exit."
     style="display:block;width:100%;max-width:470px;height:auto;margin:0 auto 1.5rem;
            font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <!-- one arrowhead marker per figure; give it a page-unique id (fl-<slug><n>) -->
    <marker id="fl-slug0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="68" y="16" width="125" height="36" rx="6"/>       <!-- ordinary nodes -->
  </g>
  <rect x="16" y="450" width="230" height="36" rx="6"
        style="fill:var(--color-fg);stroke:var(--color-fg)"/>  <!-- the ONE emphasis node: ink-filled, inverts in dark -->
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="131" y1="52" x2="131" y2="78" marker-end="url(#fl-slug0)"/>   <!-- edges carry the marker -->
  </g>
  <g text-anchor="middle">
    <text x="131" y="38.3" style="fill:var(--color-fg)">Ordinary node</text>
    <text x="131" y="472.3" style="fill:var(--color-bg)">The payoff (on the ink node)</text>
  </g>
  <!-- edge labels ride a bg-colored halo so the line doesn't cut through them -->
  <g text-anchor="middle" style="fill:var(--color-muted);font-size:12px;
       stroke:var(--color-bg);stroke-width:3;paint-order:stroke">
    <text x="131" y="319">what I did instead</text>
  </g>
</svg>
```

### Non-negotiables (flow)

- **Theme tokens, never hex.** `--color-fg / --color-bg / --color-line / --color-muted` only. This is
  what makes it invert in dark; a hardcoded palette (the data-viz trick) would strand it light.
- **`role="img"` + an `aria-label` that narrates the whole flow** in words, node by node, including the
  loop and the exit. The label *is* the accessible figure, and it doubles as the AI-legible version.
- **One emphasis node.** Exactly one node is ink-filled (`fill:var(--color-fg)`, label in
  `--color-bg`), the flow's payoff. If two nodes are "the point," neither is. This is the flow's
  equivalent of the data-viz single accent.
- **One arrowhead marker per figure, id `fl-<slug><n>`.** Marker ids are document-global, so a page
  with several flows needs distinct ids or they cross-reference. Slug from the note.
- **Edge labels get a `--color-bg` halo** (`stroke:var(--color-bg);paint-order:stroke`) so an arrow
  never strikes through the text.
- **Size to the content.** Unlike data-viz (a fixed 620 measure), a flow's `viewBox` and `max-width`
  fit the diagram; keep `width="100%"`, `height:auto`, and center it (`margin:… auto`).
- **Self-contained, no `<style>`, no client JS**, same as data-viz.

## The reference figures (built to this standard)

All live in [`../notes/ten-times-zero.md`](../notes/ten-times-zero.md). Data-viz: the **docs-vs-code
ratio** bar, the **multiplier** (two rows, same AI, different baseline), and the **sprint timeline**
(31 ticks). Flows: the **playbook loop** and the **mistakes-as-measurement loop** in the same file, plus
the one-door flow in [`../notes/whitepaper-one-vocabulary.md`](../notes/whitepaper-one-vocabulary.md) and
the loop diagrams across the other notes. Copy the nearest one for the shape you need, then re-label.

## Rendering reality (know this before you build)

Inline SVG renders everywhere the site serves, today, with zero dependencies. That is the whole reason
both scaffolds are SVG.

| Context | inline SVG |
|---|---|
| VSCode markdown preview | yes |
| GitHub.com markdown viewer | **stripped** (commit a `.svg` as an image if a figure must show there) |
| **MILL / the published site** | yes |

**Mermaid (source-draft only).** A `mermaid` fenced block renders in the VSCode preview (with the
Mermaid extension) and on GitHub, but the published site ships zero framework JS and MILL does **not**
render mermaid server-side, so it is blank on the live site. That server-side capability was considered
and is **not planned** (there is no content mermaid left to justify it, tracked in
`CONTENT-BACKLOG.md`). So mermaid is fine only as a private, editable draft of a flow's structure;
convert it to the flow scaffold before it ships. Nothing under Tjakoen's byline publishes as mermaid.

---

*A projection of how the stack already thinks (tokens, DRY, design-tells-the-truth) applied to
pictures. Update it when the figure language evolves, not the other way around.*
