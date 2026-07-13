# agenda-item (portfolio)

One row of the `/calendar` Agenda (Pass 2 — Calendar). Data-bound: the page composes it with
`each=` over the **live** `calendarEvents` list — server.ts merges `data/desk-feed.json` (hand-
authored posts, read server-side only, never a client fetch) with real note publish dates
(`content.ts`'s `listNoteCalendarEvents`). Same `each=` idiom as `welcome-recent`'s Recent feed.

Every row is a REAL thing — a note's own publish date or a shipped desk-feed post — never an
invented event. `kind` ("note" | "post") tells them apart; the calendar's month/week grid plots
directly off these rows (`data-date`/`data-event-kind`), so the agenda is the one source of truth and
the export freezes whatever was real at freeze time.

Parent-context requirement: every `.agenda__item` must be a direct child of an
`<ol class="agenda__list">` — the date-gutter layout is keyed to that shape (mirrors note-card's
`.note-feed` requirement).

```html
<ol class="agenda__list">
  <li class="agenda__item" id="evt-post-proof-live" data-date="2026-07-11" data-event-kind="post">
    <time class="agenda__date" datetime="2026-07-11">2026-07-11</time>
    <div class="agenda__main">
      <a class="agenda__title" href="/proof">PROOF is live</a>
      <details class="agenda__more">
        <summary><span class="agenda__icon" aria-hidden="true">📋</span> More</summary>
        <p>The plan board stopped rendering a snapshot and started streaming: cards move as the
          work moves, pushed over server-sent events, on this very site.</p>
        <p class="agenda__tags">proof, bread, shipped</p>
      </details>
    </div>
  </li>
</ol>
```

The precomputed `id="evt-<id>"` anchor is what a `.cal__event` chip click on the month/week panel
scroll-highlights (pages/calendar.html's island reads it straight off this markup, no fetch).
