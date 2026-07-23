# feed-photo (portfolio)

One image in a feed card's photo strip, nested `each="photos"` inside `feed-card` (bound to an event's
`photos: { src, width, height, alt }`). Parent-context requirement: a direct child of
`div.feed-photos`.

`data-lightbox` wires it to GRAIN's image viewer (`scripts/lightbox.js`): a click opens the full image
in a `<dialog>` and walks every photo in the strip's `data-lightbox-group` (`feed-card.html`), the
tiles hidden past the five-tile cap included. The `href` stays the full image, so with no JS (or a
modified click) it degrades to a plain navigation — the **no-JS-safe** fallback. The bound
`width`/`height` plus the CSS `aspect-ratio` reserve the box so a lazily-loaded photo can't shift the
layout while you scroll.

The `.feed-photos` strip is shared: the event **page** renders the same markup from its frontmatter
(`content.ts` `renderPhotoGrid`, composed in `shellChrome` for `/calendar` entries), so a card and its
own page read identically. Photos come from a flat `"src | 1200x675 | alt"` frontmatter string
(`parsePhotos`), because MILL's frontmatter parser is flat; a grain proposal tracks first-class nested
frontmatter to retire that encoding.

```html
<div class="feed-photos">
  <a class="feed-photo" href="/media/feed/hackathon-1.svg">
    <img loading="lazy" decoding="async" src="/media/feed/hackathon-1.svg" width="1200" height="675"
         alt="Placeholder photo standing in for a hackathon team photo">
  </a>
</div>
```

**Alt-text discipline:** real photos get a real one-sentence alt. The placeholder SVGs under
`media/feed/` say they are placeholders in their own alt text.
