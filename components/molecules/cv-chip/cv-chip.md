# cv-chip (portfolio)

One headline "primary" skill pill, data-bound `each="cvPrimary"` (server.ts maps `data/cv.json`
`primarySkills` to `{ text, href }`). Shown as a `.cv-core` row above the full Skills grid on `/resume`
and About's CV tab, so the eye lands on the headline skills before the full keyword list. The label is a
nested `<a>`: a skill with an `href` links to its evidence (a note, `/bread`, `/grain`, a Lessons role)
and reads as a solid pill; a skill with an empty `href` has the attribute omitted by the renderer, so
`:not([href])` keeps it a plain, dashed, unclickable pill. Unlike grain's `chips` form control it carries
no input. In `@media print` it flattens to a plain comma list, decoration stripped, keeping the printed
résumé ATS-plain.

```html
<ul class="cv-core">
  <li class="cv-chip"><a class="cv-chip__link" href="/notes/ten-times-zero">AI-first development</a></li>
  <li class="cv-chip"><a class="cv-chip__link">Next</a></li>
</ul>
```
