# share-block (portfolio)

The ready-to-post version of a `/calendar` event: the short copy you paste into LinkedIn, plus the
canonical link back to the post. It renders from the entry's own `social:` frontmatter block, so the
page and the social post are one source of truth and cannot drift.

Authoring is one frontmatter key in `content/events/<slug>.md`. Use a literal block (`|`, not `>`) so
the paragraph breaks survive into the clipboard:

```yaml
social: |
  I spoke at the general assembly of Google Developer Groups on Campus, Holy Angel University.

  Thanks to the team for having me. Slides and the writeup:
  https://tjakoen.github.io/calendar/gdgoc-hau-general-assembly
```

An event with no `social:` key renders no block at all, so this is opt-in per post.

Rendered by `shellChrome` (`src/content.ts`, `renderShareBlock`) rather than bound as a component,
for the same reason the event photo grid is: page chrome has no per-request binding context. The
markup here is the contract the two share, so a change to one belongs in both.

It renders as a folded `<details>`, because the copy is a tool for whoever is posting, not part of
what a reader came to read. Open it and the text is selectable and the link is a real anchor, with or
without JavaScript; with JavaScript the button puts the whole block on the clipboard and says
"Copied" for a moment.

```html
<details class="share-block" data-share>
  <summary class="share-block__head">Social post copy</summary>
  <pre class="share-block__text" data-share-text>…</pre>
  <p class="share-block__row">
    <button class="share-block__copy" type="button" data-share-copy>Copy</button>
    <a class="share-block__link" href="https://tjakoen.github.io/calendar/…">https://tjakoen.github.io/calendar/…</a>
  </p>
</details>
```
