# cv-photo (portfolio)

One optional experience photo under a résumé entry, nested `each="photos"` inside
[cv-entry](../cv-entry/cv-entry.md), bound to `{ src, alt }`. server.ts turns a role's optional `photo`
path in `data/cv.json` into a 0..1 `photos` array: a role with a path renders one image, a role without
renders nothing (the same gate as [cv-link](../cv-link/cv-link.md)'s `links[]`). Every role ships
photoless today; add a `photo` (and optional `photoAlt`) to a role in `cv.json` later to fill the slot
with no code change. It is a screen-only enhancement: `@media print` strips the whole media row so the
printed/ATS résumé stays flat text. Styling lives in `cv-entry.css` (`.cv-entry__media`, `.cv-photo`).

```html
<div class="cv-entry__media">
  <img class="cv-photo" src="/media/feed/talk.svg" alt="Technical Team Lead, Career Team">
</div>
```
