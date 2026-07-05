# Loop Card

While the AI is acting on a card it sits in the **grain / in-transit** state
(`data-commit="pending"`): the card dims, its button wears the terminal grain, and the
whole subtree reads as not-yet-committed — settling to clean when the write lands over
SSE, or rolling back on failure.

## In-transit

### Pending (grain)
```html
<article class="loop-card" data-surface="item:demo" data-commit="pending">
  <h3 class="loop-card__title">Read the architecture</h3>
  <span class="loop-card__status">Active</span>
  <button class="btn" data-size="sm" data-variant="outline" data-action="item.archive">Archive</button>
</article>
```
