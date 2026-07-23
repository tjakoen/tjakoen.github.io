# mail-row (portfolio)

One message row in the `/mail` list. Data-bound via `each="mailMessages"` (built in `server.ts` from
`data/mailbox.json`). Every message is set dressing (FROM "The Desk" TO the visitor, hand-authored
ahead of time), so a row is a link to its own reader below (`href="#msg-<id>"`), never a fetch.

Parent-context requirement: a direct child of `.mailbox__list` (the dense grid + separators are keyed
to that container). Columns: status dot, from, subject, when; the snippet spans the width below.

Two client-only touches, both degrading cleanly to nothing:

- **Unread dot.** `.mailbox__item-dot` is transparent until the island adds `.is-unread`. Read state
  lives only in `localStorage` (`tj.mail.read`), so the server renders **zero** dots and a no-JS page
  makes no read-tracking claim at all.
- **Relative date.** `.mailbox__item-when` is server-rendered absolute (`Jul 14`) with the full date
  in `title` and a machine date in `data-date`; the island rewrites `[data-relativize]` spans to
  "N days ago". Undated rows (Sent, Drafts) carry a literal label (`Not sent`, `While you type`) and
  no `data-date`, so they're left alone.

```html
<a class="mailbox__item" href="#msg-welcome" data-folder="inbox">
  <span class="mailbox__item-dot" aria-hidden="true"></span>
  <span class="mailbox__item-from">The Desk</span>
  <span class="mailbox__item-subject">Welcome to the mail panel</span>
  <span class="mailbox__item-when" data-relativize data-date="2026-07-14" title="Jul 14, 2026">Jul 14</span>
  <span class="mailbox__item-snippet">What's real here, what isn't…</span>
</a>
```
