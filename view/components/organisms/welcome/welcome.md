# welcome (portfolio)

The editor's **Welcome page** layout — the VS Code start screen, re-spoken in GRAIN: a display
title, a one-liner, a two-column Start/Recent + Walkthroughs grid, and a footed pill CTA with
the (functional) "Show welcome page on startup" checkbox. CSS-only scaffold; the lists inside
are `welcome-start`, `welcome-recent`, and `walkthrough-card`.

**Parent contract:** lives in the app-shell's `main` pane (the editor window frame around it
comes from `portfolio-frame`). The checkbox is wired by `site.js` (`[data-startup-checkbox]`,
`localStorage`): unchecked, `/` reopens on the page you last had open (workspace fallback).

```html
<div class="welcome">
  <h1 class="welcome__title">TJ's Desk</h1>
  <p class="welcome__sub">Software engineering, taught and shipped.</p>
  <div class="welcome__cols">
    <div><h2>Start</h2> … <h2>Recent</h2> …</div>
    <div><h2>Walkthroughs</h2> …</div>
  </div>
  <div class="welcome__foot">
    <a class="welcome__cta" href="/grain">✶ Try the desk</a>
    <label class="welcome__startup"><input type="checkbox" data-startup-checkbox checked> Show welcome page on startup</label>
  </div>
</div>
```
