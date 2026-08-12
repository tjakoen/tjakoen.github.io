# event-gallery (portfolio)

The second photo grid on a `/calendar` event page, below the body. Rendered by `content.ts`
`renderGallery` from the entry's `gallery:` frontmatter, composed in `shellChrome` — not data-bound,
because the chrome has no per-request binding context (same reason `renderPhotoGrid` is hand-written).
Nothing renders when the key is absent.

Why it exists: `photos:` is a **hero** — the `.feed-photos` strip runs the first photo big and tiles
the rest beside it, and CSS hides anything past the fifth tile. So a day with nine photos either
picked four and dropped five, or dumped all nine into a layout that shows five and hides four behind
a lightbox nobody knows to open. `gallery:` is the other five: equal tiles, each captioned by its own
alt text, under the prose where a reader can skip them.

Photos use the same flat `"src | 1400x788 | alt"` frontmatter encoding and the same `parsePhotos`
parser as `photos:` (MILL's frontmatter is flat; a grain proposal tracks nested frontmatter).

**The grid is GRAIN's, not this repo's.** The tiles carry grain's `gallery` molecule class names;
this component owns only the frame around them (the rule, the spacing, the small uppercase heading).
The grain stylesheet bundles the grid itself, so nothing here restates it.

**Its own `data-lightbox-group`.** GRAIN's viewer (`scripts/lightbox.js`) walks a group, so a separate
one keeps the gallery and the hero strip from spilling into each other. Each tile's `href` is the full
image, so with no JS it degrades to a plain navigation.

```html
<section class="event-gallery" aria-labelledby="event-gallery-heading">
  <h2 class="event-gallery__heading" id="event-gallery-heading">The rest of the roll</h2>
  <div class="event-gallery__grid" data-lightbox-group>
    <figure class="event-gallery__item">
      <a class="event-gallery__link" data-lightbox href="/media/feed/gdg-hau-ai-hack-rubric.jpg">
        <img src="/media/feed/gdg-hau-ai-hack-rubric.jpg" width="1050" height="1400" alt="…"
             loading="lazy" decoding="async">
      </a>
      <figcaption class="event-gallery__caption">…</figcaption>
    </figure>
  </div>
</section>
```

**Alt-text discipline:** the alt IS the caption here, so it has to work read aloud and read on the
page. One sentence, what is actually in the frame.
