# Task List

A simple grid of task rows. Renders `task-card`s from a collection (`each="items"`); the
panel shows the expanded result.

## Example
```html
<div class="task-list">
  <article class="task-card">
    <h3 class="card-title">Read the architecture</h3>
    <span class="badge" data-status="active">Active</span>
    <button class="btn" data-size="sm" data-variant="outline">Archive</button>
  </article>
  <article class="task-card">
    <h3 class="card-title">Ship the POC</h3>
    <span class="badge" data-status="archived">Archived</span>
    <button class="btn" data-size="sm" data-variant="outline">Archived</button>
  </article>
</div>
```
