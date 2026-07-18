# cv-chip (portfolio)

One headline "primary" skill as a non-interactive accent pill, data-bound `each="cvPrimary"`
(server.ts maps `data/cv.json` `primarySkills` to `{text}`). Shown as a `.cv-core` row above the full
Skills grid on `/resume` and About's CV tab, so the eye lands on the headline skills before the full
keyword list. This is display only: unlike grain's `chips` form control it carries no input. In
`@media print` it flattens to a plain comma list, keeping the printed résumé ATS-plain.

```html
<ul class="cv-core">
  <li class="cv-chip">AI-first development</li>
  <li class="cv-chip">No-build hypermedia</li>
</ul>
```
