# mail-folder (portfolio)

One folder in the `/mail` rail. Data-bound via `each="mailFolders"` (built in `server.ts` from
`data/mailbox.json`): `{ id, label, count }`, where `count` is computed server-side as the number of
messages in that folder, so the badge can never drift from the list it describes.

Parent-context requirement: a direct child of `nav.mailbox__folders`. The rail box owns the border
and background; this molecule is just the row. `href="#mailbox-list"` is a harmless in-page jump kept
for the no-JS path (the list is already on the page). With JS, the mailbox island owns
`aria-current="page"` (it moves to whichever folder you click and filters the list to it); the server
renders no current folder, so with no JS every folder's messages stay visible — nothing real is gated.

```html
<nav class="mailbox__folders" data-mailbox-folders aria-label="Folders">
  <a class="mailbox__folder" href="#mailbox-list" data-folder="inbox">
    <span class="mailbox__folder-label">Inbox</span>
    <span class="mailbox__folder-count">3</span>
  </a>
  <!-- … one per folder … -->
  <a class="btn mailbox__compose" href="#compose" data-open-compose>Compose</a>
</nav>
```

Editing `data/mailbox.json` needs a server restart (the file is read once at boot, same as
`desk-feed.json` and the notes).
