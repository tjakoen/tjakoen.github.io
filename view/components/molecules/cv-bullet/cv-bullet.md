# cv-bullet (portfolio)

One plain-text line: a résumé bullet, an education note, or a certification. Nested `each="bullets"`
inside [cv-entry](../cv-entry/cv-entry.md), and reused at page level for the certifications list
(`each="cvCerts"`). Kept as flat text on purpose so an ATS / résumé parser reads it without trouble.
Styling lives in `cv-entry.css` (`.cv-bullet`).

```html
<li class="cv-bullet">Manage and mentor a team of engineers, working AI-first to ship faster.</li>
```
