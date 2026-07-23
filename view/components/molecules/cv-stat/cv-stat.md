# cv-stat (portfolio)

One KPI tile in the About highlights strip, data-bound `each="cvStats"` (server.ts maps `data/cv.json`
`stats`). Reuses GRAIN's [stat-tile](../../../node_modules/@tjakoen/grain/components/molecules/stat-tile/stat-tile.md)
class contract (`.stat` / `.stat__value` / `.stat__label` / `.stat__sub`) so the tiles read as the
stack's own dashboard primitive. The parent `.cv-stats` owns the row layout (per stat-tile's
composition note); the sub-line hides when empty.

```html
<div class="cv-stats">
  <div class="stat">
    <span class="stat__value">150+</span>
    <span class="stat__label">students a term</span>
    <span class="stat__sub">software engineering</span>
  </div>
</div>
```
