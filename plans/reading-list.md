---
id: reading-list
status: todo
track: apps
depends: []
touches: [books/, pages/library/, components/, server.ts, tours/]
owner: human
---

# Reading list — a library on the desk

A new app on the desk: a personal reading list that reads like a **library**. Each book is a cover
on a shelf; a small **pin/badge in the corner of the cover** says whether it has been read; and each
book has room for **my own review — my recommendation** in my words.

Same idea as the other desk apps (Notes, Calendar, Mail): content authored as markdown, rendered
through MILL into GRAIN pages, reachable from the app dock. It consumes the stack, it does not fork it.

## The shape

- **A `books/` MILL collection.** One `.md` per book, MILL-rendered the same way notes/events are.
  Frontmatter carries the structured bits, the body carries my review prose.

  ```yaml
  ---
  title: "The Book"
  author: "Author Name"
  cover: /media/books/the-book.jpg   # the shelf image
  status: read                       # read | reading | want-to-read  (drives the corner pin)
  rating: 4                          # optional, my call on the scale
  recommend: true                    # surfaces it as a recommendation
  finished: 2026-05                  # optional
  ---
  Why I'd recommend it, in my own words…
  ```

- **The library view (`/library`).** A cover grid that reads like a shelf — the images do the work.
  Each cover carries a **corner pin badge**: a filled/checked pin for *read*, a quieter one for
  *reading*, an outline for *want-to-read*. Reuse GRAIN's badge/lightbox primitives (the photo
  lightbox already ships) rather than building new chrome.

- **The book detail.** Click a cover → the book page: the cover, the metadata, and my review /
  recommendation rendered from the body. A "recommended" shelf or filter surfaces the `recommend: true`
  ones.

## Tasks

- [ ] Decide the surface: a `books/` MILL collection (markdown per book) vs a single `data/books.json`
      — lean collection, to match notes/events and keep reviews as real prose
- [ ] Settle the status vocab that drives the pin: read / reading / want-to-read (+ optional rating)
- [ ] Cover art pipeline: where images live (`/media/books/`) and the shelf-grid sizing
- [ ] Build the library grid page (`/library`) — covers + the corner pin badge, GRAIN tokens only
- [ ] Book detail page — cover + metadata + my review, MILL-rendered from the body
- [ ] "Recommended" filter/shelf for `recommend: true`
- [ ] Add **Library** to the app dock (a `nav:` surface, like Plans) so it isn't an orphan route
- [ ] Seed a few real books with my own reviews
- [ ] Add a CRUMB tour step for it once it ships (it's a natural stop on the portfolio tour)

## Open questions

- Grid-of-covers vs a literal shelf illustration — start with the clean cover grid
- Where the pin sits and how loud it is (top-right corner, quiet until read)
- Does `/library` need its own two-pane reader like Mail, or is grid → detail enough (probably enough)
