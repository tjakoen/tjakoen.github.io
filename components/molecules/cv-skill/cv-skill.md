# cv-skill (portfolio)

One skill group in the résumé Skills grid, data-bound `each="cvSkills"`. server.ts joins each group's
`items` into a single `itemsLabel` string, so the printed and exported résumé shows the keywords as
plain text an ATS can read. Parent-context requirement: a child of `<div class="cv-skills">` (an
auto-fill grid).

```html
<div class="cv-skills">
  <div class="cv-skill">
    <h4 class="cv-skill__group">Frontend and Mobile</h4>
    <p class="cv-skill__items">Next · React · Flutter · Dart</p>
  </div>
</div>
```
