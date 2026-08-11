# walk-latest (portfolio)

The Welcome page's feed walkthrough: a door to `/calendar` whose subject is whatever was posted most
recently. Data-bound via `each="latestEvents"` (server-provided, `content.ts` `listLatestEvents`),
which is a **one-item array** so the card binds with the same `each=` every other data-bound card
uses, rather than needing a "first item" mechanism it would be the only user of.

Why it is shaped this way: the other walkthroughs are evergreen trailheads, and a card that rewrites
itself every time a post lands would stop being one. So the card's identity is fixed (it always says
"The feed", it always goes to `/calendar`) and only its body changes. The `href` is the feed anchored
at that post (`/calendar#evt-event-<slug>`), not the post's own page, because the point is to land
someone in the feed with the post in front of them.

Empty state is free: no dated events means the binding renders nothing, so the card is absent rather
than empty.

```html
<a class="walk walk--latest" href="/calendar#evt-event-gdgoc-hau-general-assembly">
  <span class="walk__head">📌 The feed <span class="walk__badge">Talk</span></span>
  <p class="walk__body">
    <span class="walk-latest__title">Don't vibe anything you can't code yourself</span>
    <span class="walk-latest__date">2026-08-08</span>
  </p>
</a>
```

Styling is `walkthrough-card.css` (it is a `.walk`); this component's CSS only lays out the bound
title and date inside the body.
