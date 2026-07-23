# Apps-v2 — grain + MILL proposals

Building the apps-v2 surfaces (Mail v2, the Calendar social feed, and the About/CV structure) surfaced
a set of gaps in the layers below the portfolio. Per the hard constraint that apps-v2 is
portfolio-owned only (no grain edits, no repin), each gap was solved locally in the portfolio and the
reusable pattern is written up here instead of pushed down. These are proposals for GRAIN and MILL to
absorb later, not committed work.

Each item lists where the portfolio-side workaround lives now, so a future grain/mill change has a
concrete reference implementation to promote.

## 1. Master-detail (mailbox) organism

A folder rail + a message list + a reader, with the list collapsing to one open item at a time (with
JS) and standing as a stacked page (with no JS). Right now this is hand-wired in `view/pages/mail.html` plus
the `mail-folder` / `mail-row` / `mail-reader` / `mail-related` molecules and the mailbox island.

**Proposal:** a grain `master-detail` organism (rail + list + detail, show-one behavior, no-JS
fallback baked in), so a mailbox, a docs browser, or a settings panel don't each re-invent it.

## 2. Feed-item / media-card molecule with a photo-strip contract

The `/calendar` feed card and the `/notes` card are the same idea (a dated card in a list) with
different fields; the feed card adds an images-first photo strip. Today: portfolio molecules
`feed-card` + `feed-photo` (and `note-card` separately), with a `.feed-photos` grid contract shared
between the card and the event page.

**Proposal:** a grain `media-card` molecule with a documented photo-strip slot contract (auto-fill
grid, fixed aspect box, `:empty` hides), so any consumer gets images-first cards for free.

## 3. `[data-relativize]` relative-time behavior

Server renders an absolute date (export-safe, never rots, absolute stays in `title`); a small island
rewrites `[data-relativize]` spans to "Today / Yesterday / N days ago" client-side. This logic is now
**duplicated in two islands** (the mailbox island in `view/pages/mail.html` and the calendar island in
`view/pages/calendar.html`) — a clear signal it should be shared.

**Proposal:** a grain client behavior (one small module or a `data-*` hook) that owns the relativize
pass, so the two copies collapse to one and any dated list can opt in.

## 4. Tabs-with-panels island, extended: nested groups + hash/query deep links

The About page shows one panel at a time and honors an incoming `#hash`; Pass D extended it with a
**nested** role group inside the Lessons panel and a `#lessons-<role>` deep link that opens the outer
panel and the inner role together. The `/notes` feed similarly reads `?tag=` on boot. These are all
the same "reveal a section from the URL" pattern.

**Proposal:** a grain tabs-with-panels behavior that supports nested groups and both `#hash` and
`?query` deep links out of the box, rather than each page's island growing its own copy.

## 5. localStorage client-read-state pattern

Mail's unread dots live only in `localStorage` (`tj.mail.read`): the server renders zero dots, a fresh
visitor sees everything unread, opening an item clears it, and the state persists — with no JS there is
no read-tracking claim at all. This "the server makes no claim, the browser remembers privately"
pattern is reusable (read/seen/dismissed state anywhere).

**Proposal:** a grain helper for client-only, privacy-respecting read/seen state (a tiny get/set over a
namespaced key, plus the "server renders the null state" convention), documented as a pattern.

## 6. `<dialog>` lightbox degrading to link-to-full

Feed photos link straight to the full image (`<a href="src"><img></a>`) — a real navigation, the
no-JS-safe lightbox. A nicer in-page lightbox is deferred so nothing depends on script.

**Proposal:** a grain lightbox that progressively enhances an existing link-to-full into a `<dialog>`
overlay, degrading to the plain navigation when there's no JS or no `<dialog>` support. Reference: the
`feed-photo` molecule.

## 7. Experience-entry molecule

The résumé's experience entries (`.xp__entry`: role heading, meta, description, a "notes from this
role" link) are hand-authored in `view/pages/resume.html`. The grain `timeline` organism was deliberately
**not** reused — it is the AI-interaction timeline, a different contract.

**Proposal:** a small grain `experience-entry` molecule (role, meta, body, an optional tagged-notes
link), so a résumé or a CV section binds a list instead of repeating markup.

## 8. Empty-state molecule

The `/notes` feed's `?tag=` deep link reveals a hidden, server-rendered empty state naming a requested
tag that no note carries ("No notes tagged … yet."). This muted, self-describing empty state is a
recurring need (an empty folder, a filtered-to-nothing list).

**Proposal:** a grain `empty-state` molecule (muted line, optional icon, optional action), so empty
states read consistently across surfaces. Reference: `.feed-empty` in `note-card.css`.

## 9. MILL: nested-object frontmatter + a first-class photo-grid post template

MILL's frontmatter parser is **flat** (scalars + string lists only, no nested objects, verified in
`@tjakoen/mill/core/frontmatter.ts`). An event's photos therefore encode as a flat dash-list of
`"src | 1200x675 | alt"` strings, split portfolio-side by `parsePhotos` (`content.ts`). This works but
is an encoding workaround.

**Proposal (MILL):** two changes. (a) Support nested-object frontmatter so `photos:` can be a real list
of `{ src, width, height, alt }` objects and the string-splitting workaround retires. (b) Offer a
first-class **photo-grid post template** (photos on top, body below) as a collection option, so the
portfolio's `shellChrome` `renderPhotoGrid` composition for `/calendar` entries becomes a MILL feature
rather than a consumer-side chrome hook.

---

*Each proposal is portfolio-proven first: the reference implementation is live in this repo, so
promoting it to GRAIN or MILL is a lift-and-generalize, not a design-from-scratch.*
