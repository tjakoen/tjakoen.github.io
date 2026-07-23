# feed-card (portfolio)

One post in the `/calendar` social feed. Data-bound via `each="calendarEvents"` (built in `server.ts`
`buildCalendarEvents`, which merges three real sources: note publish dates, the hand-authored
`data/desk-feed.json` "shipped" posts, and the MILL-authored events collection `events/*.md`). Every
row is a real dated thing, never an invented event.

Parent-context requirement: a direct child of `<ol class="feed__list">`. **Images first, then text**,
the same shape as an event's own page (`/calendar/<slug>`), so a card and its page read identically.

The root carries the fields the Month + Week islands read straight off this DOM (one source of truth,
no fetch): `data-date`, `data-event-kind`, `data-tags`, and the `#evt-…` `id` a chip scrolls to. The
date relativizes client-side to "N days ago" (absolute stays in `title`); with no JS it shows the
absolute date, and the feed is the whole no-JS page. The photo strip, links row, location and tags
each hide when their data is empty.

```html
<ol class="feed__list">
  <li class="feed-card" id="evt-event-hackathon-coaching" data-date="2026-07-08"
      data-event-kind="hackathon" data-tags="hackathon coaching placeholder">
    <div class="feed-photos"><!-- feed-photo per photo, or empty (hidden) --></div>
    <div class="feed-card__body">
      <p class="feed-card__meta">🗓️ Hackathon <time datetime="2026-07-08">2026-07-08</time> Placeholder venue</p>
      <h3 class="feed-card__title"><a href="/calendar/hackathon-coaching">Coached a hackathon team (placeholder)</a></h3>
      <p class="feed-card__summary">…</p>
      <ul class="feed-card__links"><!-- feed-link per link, or empty (hidden) --></ul>
      <p class="feed-card__tags">hackathon, coaching, placeholder</p>
    </div>
  </li>
</ol>
```

Editing `data/desk-feed.json` or an `events/*.md` needs a server restart (read once at boot, same as
the notes).
