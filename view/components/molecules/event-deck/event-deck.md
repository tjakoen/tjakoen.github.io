# event-deck (portfolio)

Placement, not design. The components are GRAIN's: `attachment` for the deck row, `media-card` for
the video, `doc-frame` for the viewer page. A GRAIN molecule owns no outer spacing, so where each
one sits on a content page is decided here, which is the consumer's job.

## The deck goes up, the video goes down

Opposite placements, on purpose.

The **deck** renders directly under the hero photos and above the prose, from the entry's `deck:`
frontmatter (`content.ts` `renderDeckAttachment`). For a talk, the deck is frequently the thing the
reader came for; it used to be a link in the closing paragraph, which is the one place nobody
scrolling a photo post will find it.

The **video** renders below the prose, beside the gallery. It used to sit under the hero, where a
full-width 16:9 poster reads as the *subject* of the page and shouts over the writing the page is
actually made of. It is capped at `32rem` down here so a wide screen does not hand it the column.

## The deck's frontmatter

Flat, one string, the same encoding idiom as a photo:

```yaml
deck: "Beyond Limits, the ideation workshop | PDF | /decks/gdg-hau-ai-hack-ideation | 32 slides · 2.5 MB · opens here"
```

Fields in order: `title | kind | href | meta`. **The href is an in-site route by design.** A PDF
points at `/decks/<file>`, never at the `.pdf` itself: that route renders the document inside the
shell, so it becomes an ordinary page and therefore an ordinary open tab. A talk that already lives
on the site (`/talks/ten-times-zero`) points straight at its own route and needs nothing new.

## The viewer route

`/decks/<file>` is served by `content.ts` `createPortfolioDeckRoutes`, listed by
`listPortfolioDeckRoutes` so the sitemap and the static export both carry it. A viewer page that
only exists on the dev server is a 404 on Pages, and that is exactly the bug this shape invites.
