# note-card (portfolio)

The `/notes` feed's card: a Reddit-ish read of the notes collection (vote glyph, title, summary,
tags, a "sections" link standing in for a comment count). **CSS-only** (grain lesson 3: a
CSS-only component must state its parent-context requirement here) — there is no `note-card.html`
because the markup is **server-composed directly in `content.ts`'s `renderNotesFeedPage`**, not a
batch template. `note-card.css` is auto-bundled through `config.styleRoots` (this repo's
`components/` root) with no manual registration; nothing data-binds it.

Parent-context requirement: every `.note-card` must be a direct child of a `<ul class="note-feed">`
(the vote-glyph gutter + separators are keyed to that flex-list layout, and the feed's inline
island reorders/hides `.note-feed > .note-card` nodes by that exact shape). The vote-glyph number
is **real reading minutes**, parsed server-side from the note's own `readingTime` frontmatter — it
is never a vote count, and the element's own `title=""` attribute says so for anyone hovering it.

```html
<ul class="note-feed">
  <li class="note-card" data-surface="note:origin-story" data-date="2026-07-02" data-score="9" data-tags="origin-story batch grain">
    <div class="note-card__vote" aria-hidden="true" title="Reading minutes, from the note's own frontmatter. Not votes.">
      &#9650;<span class="note-card__score">9</span>
    </div>
    <div class="note-card__main">
      <p class="note-card__byline">Tjakoen Stolk · the desk · <time datetime="2026-07-02">2026-07-02</time></p>
      <h2 class="note-card__title"><a href="/notes/origin-story">I Built a Whole Stack Because No To-Do App Would Have Me</a></h2>
      <p class="note-card__summary">How trying to organize my own life turned into a no-build stack…</p>
      <p class="note-card__foot">
        <span class="note__tags"><span class="badge" data-status="active">origin-story</span></span>
        <a class="note-card__sections" href="/notes/origin-story">4 sections</a>
      </p>
    </div>
  </li>
</ul>
```

`data-surface="note:<slug>"` addresses the card for the grain reasoner's "See what's new" run
(the `/notes` page keeps that trigger, same door as `/grain`'s demo). `data-date`/`data-score`/
`data-tags` are read by the feed's own inline island (New/Top sort, tag filter) — a plain DOM
reorder/hide over the cards already on the page, no fetch involved. With no JS the list stays in
its server-rendered newest-first order and the sort/filter controls (`.feed-controls`) stay
hidden.
