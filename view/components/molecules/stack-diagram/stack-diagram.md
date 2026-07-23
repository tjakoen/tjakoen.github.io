# Stack Diagram

The shared **"four layers, one direction"** figure that opens every BREAD layer page. One
authored SVG, used once per page with a `current` prop; the matching layer is highlighted so a
reader lands already knowing where they are in the stack. Built to the FIGURES geometry (the
`0 0 620 H` canvas, `width="100%"`, `role="img"` + a spoken `aria-label`, serif, the 15/14/12.5
type scale) but **deliberately re-colored from the live theme tokens** instead of the fixed
FIGURES palette, so it flips with the site theme (sourdough / baguette / brioche, light ↔ dark).
No chromatic accent; the only emphasis is ink-fill vs outline. No client JS.

## The model it draws

Bottom → top: **BATCH** (the base) · **GRAIN** · **MILL** · then **PROOF** and **CRUMB** sharing
the top row, side by side — CRUMB builds on GRAIN and MILL exactly as PROOF does, so it shares
PROOF's altitude rather than stacking a fifth, taller row. "One direction" means each rests on the
ones below (the upward cue on the left). **PANTRY is not a layer**: it is the enclosing frame, the
app that composes the four (BATCH, GRAIN, MILL, PROOF).

## The `current` prop (the highlight)

Pass the member whose page this is. It is stamped onto the root as `data-current` (via
`prop-attr-data-current`, the same interpolation `b-icon` uses for `data-size`); the CSS keys the
ink-fill off `[data-current]` × the per-layer `data-layer`. Values: `batch` · `grain` · `mill` ·
`proof` · `crumb` · `pantry`. **Omit it** for the `/bread` overview — nothing is singled out (the
whole stack reads evenly, PANTRY frame present).

> Do **not** try to drive the highlight from `data-section`: that attribute is not unique across
> the layer pages (bread/batch/mill/proof/pantry all resolve to `"bread"`; only grain differs).
> The current member must be passed explicitly here.

```html
<stack-diagram current="grain"></stack-diagram>   <!-- GRAIN ink-filled, the rest outlined -->
<stack-diagram current="pantry"></stack-diagram>  <!-- the PANTRY frame emphasized -->
<stack-diagram></stack-diagram>                   <!-- /bread overview: nothing singled out -->
```

## Placement

The first visual in the page header: the small eyebrow ("you are here") stays above it, then the
diagram, then the h1 masthead, then the rule + lede. The canvas is kept compact (`H 240`) so it
leads without pushing the headline below the fold.

## Notes

- `data-layer` values on the five `<g>` layer groups (`batch`/`grain`/`mill`/`proof`/`crumb`) and
  on the PANTRY frame group are what the CSS targets — keep them in sync with the `current` values.
- The `aria-label` states the whole stack in words (a screen reader reads that, not the shapes);
  the current member is announced textually by the page's adjacent eyebrow.
