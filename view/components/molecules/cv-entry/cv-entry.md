# cv-entry (portfolio)

One entry in the résumé timeline: a job or an education line. Data-bound via `each="cvRoles"` and
reused for `each="cvEducation"` (server.ts builds both from `data/cv.json` into the same shape). Used
on `/resume`, `/cv`, and `/about`'s CV tab, so the CV content lives in exactly one place.

Parent-context requirement: a direct child of `<ol class="cv-list">`.

**Accordion is a screen-only enhancement.** The bullets and related links are always in the DOM.
- No JS / static export: the detail renders open (flat, linear, ATS-readable); the toggle stays `hidden`.
- Screen with JS: the `cv-accordion` island adds `.is-collapsed` and reveals the toggle, so each entry
  collapses to its summary line and expands on click.
- Print (`@media print` in `components/pages/resume/resume.css`): detail forced open, toggle + links
  stripped, single column on white — a standard résumé an ATS parses cleanly.

The related-posts row (`each="links"` -> `cv-link`) hides when the entry has no links; a role may gain
several `/calendar` feed posts over time with no code change. The summary and location hide when empty.

```html
<ol class="cv-list">
  <li class="cv-entry" id="xp-0" data-role-tag="ai">
    <div class="cv-entry__head">
      <h3 class="cv-entry__title">Technical Team Lead</h3>
      <p class="cv-entry__meta"><span class="cv-entry__company">Career Team</span> <span class="cv-entry__dates">Sep 2025 to Present</span></p>
      <p class="cv-entry__where">United States, remote</p>
      <p class="cv-entry__summary">Both people-manager and technical lead for the team.</p>
      <button class="cv-entry__toggle" type="button" hidden>Hide details</button>
    </div>
    <div class="cv-entry__detail">
      <ul class="cv-entry__bullets"><!-- cv-bullet per bullet --></ul>
      <ul class="cv-entry__links"><!-- cv-link per related post, or empty (hidden) --></ul>
    </div>
  </li>
</ol>
```

Editing `data/cv.json` needs a server restart (read once at boot, same as the notes and desk-feed).
