# welcome-recent (portfolio)

One row of the Welcome page's **Recent** feed — note title + muted mono file path, the notes
as the editor's "recent files". Data-bound (`href` / `title` / `path`); the page composes it
with `each=` over the **live** notes list (`recentNotes`, provided by the composition root from
MILL frontmatter — newest first). The static export freezes whatever was newest at freeze time.

```html
<div class="recent">
  <welcome-recent each="recentNotes"></welcome-recent>
  <a class="recent__item" href="/notes"><span class="recent__name">More…</span></a>
</div>
```
