# Loop Card

The AI-loop card (see `docs/AI-INTERFACE.md` §7). Unlike `task-card` (direct `hx-post`),
its button carries a `data-action` verb and the card a `data-surface` address; the
dispatcher turns a click into `POST /intent` and applies the confirmed render op that
arrives over SSE. `data-commit` encodes **grade = commit state** — toggle Human/AI above
to see the in-transit (grain) treatment.

## States

### Committed (clean)
```html
<article class="loop-card" data-surface="item:demo" data-commit="committed">
  <h3 class="loop-card__title">Read the architecture</h3>
  <span class="loop-card__status">Active</span>
  <button class="btn" data-size="sm" data-variant="outline" data-action="item.archive">Archive</button>
</article>
```

### Archived (inert)
```html
<article class="loop-card" data-surface="item:demo2" data-commit="committed">
  <h3 class="loop-card__title">Ship the POC</h3>
  <span class="loop-card__status">Archived</span>
  <button class="btn" data-size="sm" data-variant="outline">Archived</button>
</article>
```
