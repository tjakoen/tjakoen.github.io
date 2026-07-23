# mail-reader (portfolio)

One open message below the `/mail` list. Data-bound via `each="mailMessages"` (built in `server.ts`
from `data/mailbox.json`). Parent-context requirement: a direct child of `.mailbox__readers`.

The body is **plain text** by design: batch's bindings escape HTML, so a message body can't carry
inline anchors. It renders in a single block with `white-space: pre-line`, so the `\n\n` paragraph
breaks in the JSON become the visible spacing. Any link a message wants surfaces in a **Related row**
below the body (`mail-related`, nested `each="links"`), which hides itself when a message has no links
(`.mailbox__reader-links:empty { display: none }`).

`Reply` / `Forward` / `Archive` are honest set dressing: disabled, with a `title` that says so. The
one live control on the page is Compose, elsewhere on the screen.

With JS, the mailbox island shows one reader at a time (keyed to the selected row) and marks the row
read. With no JS, every reader is visible as a stacked letters page and nothing is gated.

```html
<article class="mailbox__reader" data-message id="msg-welcome" data-folder="inbox">
  <div class="mailbox__reader-head"><h2 class="mailbox__reader-subject">Welcome to the mail panel</h2></div>
  <p class="mailbox__reader-meta">The Desk → You · Jul 14, 2026</p>
  <div class="mailbox__reader-tools"><!-- Reply / Forward / Archive, all disabled --></div>
  <div class="mailbox__reader-body">This whole panel is dressed up like a real inbox…</div>
  <ul class="mailbox__reader-links"><!-- mail-related per link, or empty (hidden) --></ul>
</article>
```
