# Task Card

A row composing the type atom, a badge, and an action button. Bindings (`data-field`,
`data-bind-*`) are filled from a task's data at render; the panels below show the
expanded markup the component produces. This is the original direct-`hx-post` card;
the AI-loop variant is `loop-card`.

## States

### Active
```html
<article class="task-card">
  <h3 class="card-title">Read the architecture</h3>
  <span class="badge" data-status="active">Active</span>
  <button class="btn" data-size="sm" data-variant="outline">Archive</button>
</article>
```

### Archived
```html
<article class="task-card">
  <h3 class="card-title">Ship the POC</h3>
  <span class="badge" data-status="archived">Archived</span>
  <button class="btn" data-size="sm" data-variant="outline">Archived</button>
</article>
```
