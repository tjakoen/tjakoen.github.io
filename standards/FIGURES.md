# Figures & visualizations: the standard

> The standard for every diagram and chart in Tjakoen's notes, docs, and pages. Companion to
> [`VOICE.md`](VOICE.md) (which owns the prose); this file owns the pictures. The point is that a
> figure should be built to a **contract**, not hand-drawn from zero each time. Mermaid is already
> standardized because it's a text DSL; this doc gives our inline SVGs the same discipline, one
> palette, one scaffold, one type scale, so every figure is a member of the same family and you
> re-skin them all by editing tokens, never by editing shapes. Same philosophy as the rest of the
> stack: tokens are the theme, DRY to a fault, design tells the truth.

## Pick the tool by job (the one rule)

| The figure is… | Use | Why |
|---|---|---|
| **Quantitative data-viz** — bars, ratios, timelines, the multiplier | **inline SVG** (to the scaffold below) | Precise proportions, exact labels, the e-ink palette; and it's just HTML, so it renders on the published no-build site today with zero dependencies. |
| **A flow, loop, relationship, or architecture** — steps, cycles, "A → B → C" | **mermaid** fenced block | It's a text DSL: readable in the source, trivial to edit, and the right shape for graphs. Charting quantitative bars is *not* its job (`xychart-beta` is beta and can't take our palette). |

If you're reaching for mermaid to draw a proportional bar, stop, that's an SVG. If you're hand-placing
`<rect>`s to fake a flowchart, stop, that's mermaid.

## The SVG scaffold (copy this, don't freehand)

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

## The reference figures (built to this standard)

Live in [`../notes/ten-times-zero.md`](../notes/ten-times-zero.md): the **docs-vs-code ratio** bar,
the **multiplier** (two rows, same AI, different baseline), and the **sprint timeline** (31 ticks).
Copy the nearest one when you need a new chart, then re-label. The **playbook loop** and the
**mistakes-as-measurement loop** in the same file are the mermaid references.

## Rendering reality (know this before you pick)

| Context | inline SVG | mermaid |
|---|---|---|
| VSCode markdown preview | yes | yes (with the Mermaid extension) |
| GitHub.com markdown viewer | **stripped** (commit a `.svg` as an image if it must show there) | yes |
| **MILL / the published site** | yes | **only once MILL renders mermaid→SVG server-side** |

**The MILL dependency (open, tracked in `CONTENT-BACKLOG.md`):** the served pages must ship zero
framework JS, so mermaid can't render client-side in production. MILL must convert `mermaid` fenced
blocks to inline SVG at render/export time (server-side). Until that lands, mermaid diagrams render in
the *preview* and on *GitHub* but not on the live site; inline SVG renders everywhere the site serves
it, today. When authoring for imminent publish, prefer SVG; a mermaid flow is fine but is on MILL's
critical path.

---

*A projection of how the stack already thinks (tokens, DRY, design-tells-the-truth) applied to
pictures. Update it when the figure language evolves, not the other way around.*
