# welcome-start (portfolio)

The Welcome page's **Start** list — icon + link rows (the VS Code Start list). Every row is a
real `<a>` (zero-JS navigable); a row that should hand focus to the assistant instead carries
`data-shell="focus-chat"` (shell.js) with its href as the no-JS fallback.

```html
<nav class="start" aria-label="Start">
  <a class="start__item" href="/grain" data-shell="focus-chat"><b-icon sym="/assets/sprite.svg#spark" size="sm"></b-icon>Ask the desk…</a>
  <a class="start__item" href="/notes"><b-icon sym="/assets/sprite.svg#knowledge" size="sm"></b-icon>Read the notes…</a>
</nav>
```
