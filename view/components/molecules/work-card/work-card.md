# Work card (portfolio)

A navigable tile on the home "Work" grid: name + kind up top, a description, a "go" line
pinned to the bottom. **Composes GRAIN's card** — the root must carry both classes
(`class="card work-card"`); the border, hover lift, disabled state, and AI-mode dashed
edge all come from `card`, this component owns only the anatomy.

## Work card
```html
<a class="card work-card" href="/grain">
  <div class="work-card__head">
    <span class="work-card__name name">GRAIN</span>
    <span class="work-card__kind">Design system</span>
  </div>
  <p class="card__body">An AI-interaction design system: one shared vocabulary for humans
    and AI. Built on BATCH.</p>
  <span class="work-card__go">See the system →</span>
</a>
```
