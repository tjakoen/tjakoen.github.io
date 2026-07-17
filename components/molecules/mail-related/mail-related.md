# mail-related (portfolio)

One link in a reader's Related row, nested `each="links"` inside `mail-reader` (bound to a message's
`links: [{ href, label }]`). Parent-context requirement: a direct child of `ul.mailbox__reader-links`.

It exists because batch bindings escape HTML: a message body is plain text and can't hold inline
anchors, so the links a dispatch refers to (the notes feed, PROOF, PANTRY, and so on) surface here as
real, navigable rows instead. The whole row hides when a message has no links, so nothing shows an
empty affordance.

```html
<ul class="mailbox__reader-links">
  <li class="mailbox__reader-link-item"><a class="mailbox__reader-link" href="/notes">The notes feed</a></li>
  <li class="mailbox__reader-link-item"><a class="mailbox__reader-link" href="/proof">PROOF</a></li>
</ul>
```
