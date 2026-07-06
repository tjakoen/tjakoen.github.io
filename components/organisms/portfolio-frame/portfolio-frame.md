# Portfolio frame — THE EDITOR chrome

The portfolio's **workspace chrome**: the whole site presents as one editor window. It's a
domain organism (it lives in the app, not grain) that composes the grain shell primitives
(`app-window` / `side-rail` / `file-tree` / `tab-bar` / `sidebar-panel` / `console` / `status-bar`)
into the site's persistent frame — the same window wraps every page, `<main>` swaps beneath it.

It's **static markup** wired by the app's client islands, not a data-bound tag:

- `theme.js` drives theming (the ◆ cycle + ◐ light/dark),
- `site.js` wires the window nav (back/refresh/forward), the linked breadcrumb, and the explorer
  tree (fills `notes/`, opens the current file's ancestors, marks the open file),
- `tabs.js` projects navigation into the **open-pages** strip (a localStorage projection, pinned
  Welcome first),
- `ai-dispatch.js` stamps AI presence.

**Nav model (THE EDITOR v3):** the RAIL is the EXPLORER — a file tree of the real sources behind
each page (the site is its own source tree), with an `activity-bar` icon column and fixed APP links
(Calendar / Mail / Catalog / Profile) at the bottom. The TABS are the OPEN PAGES.

Compose it as a sibling of `<main>`, inside `.app-shell.app-window` (the `<body>` carries
`.app-window-backdrop`). It's the app's own chrome — it isn't meant to be re-instantiated in the
catalog; see it live on any page of the running site.
