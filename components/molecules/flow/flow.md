# flow (portfolio)

A small left-to-right **diagram** of boxed nodes joined by arrows — a dependency chain or a
pipeline. CSS-only layout pattern (no `.html`): compose the markup inline. Wraps on narrow
widths; tokens only. Variants: `flow__node--door` (heavier border, for the emphasised step),
`flow__node--code` (grain face). A `<small>` inside a node is muted sub-text.

```html
<div class="flow" aria-hidden="true">
  <div class="flow__node">BATCH<br><small>substrate</small></div>
  <div class="flow__arrow">→</div>
  <div class="flow__node">GRAIN<br><small>design system</small></div>
  <div class="flow__arrow">→</div>
  <div class="flow__node">MILL<br><small>content engine</small></div>
</div>
```
