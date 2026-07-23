# profile-card

A person header: an avatar tile, an id block (`eyebrow` · `masthead` name · role · mono tagline), and
an actions group. Shared by `/about` and `/resume`. CSS-only (no `.html`) — author the markup per page:

```html
<header class="profile-card">
  <div class="profile-card__avatar" aria-hidden="true">🧑‍💻</div>
  <div class="profile-card__id">
    <p class="eyebrow">About</p>
    <h1 class="masthead profile-card__name">Name</h1>
    <p class="profile-card__role">Role line.</p>
    <p class="profile-card__tagline">Tagline.</p>
  </div>
  <div class="profile-card__actions"><a class="btn" href="…">Action</a></div>
</header>
```

No parent-context requirement: it lays out standalone inside `.board`. Tokens only, so it re-skins
with the theme. The name uses grain's `masthead` type; actions use grain's `btn`.
