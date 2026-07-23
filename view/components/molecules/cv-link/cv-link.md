# cv-link (portfolio)

One related post under a résumé entry, linking out to its `/calendar` social-feed page. Nested
`each="links"` inside [cv-entry](../cv-entry/cv-entry.md), bound to `{ href, label }`. An experience
may carry several posts; the row hides when it has none, and it is stripped from the printed résumé.
Styling lives in `cv-entry.css` (`.cv-link`).

```html
<li class="cv-link-item"><a class="cv-link" href="/calendar/hackathon-coaching">Coached a hackathon team</a></li>
```
