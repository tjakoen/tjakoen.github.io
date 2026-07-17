# feed-link (portfolio)

One related link under a feed card, nested `each="links"` inside `feed-card` (bound to an event's
`links: { href, label }`). Parent-context requirement: a direct child of `ul.feed-card__links`.

The row hides itself when an event has no links (`.feed-card__links:empty { display: none }`), so a
card without links shows no empty affordance. Desk-feed "shipped" posts carry a link to what shipped;
note events and placeholder events currently carry none.

```html
<ul class="feed-card__links">
  <li class="feed-card__link-item"><a class="feed-card__link" href="/proof">Open PROOF</a></li>
</ul>
```
