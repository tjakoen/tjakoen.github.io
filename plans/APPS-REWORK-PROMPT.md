# Fable prompt: rework the four sidebar apps (Notes / Calendar / Mail / About) into real "apps"

> Paste this into Fable, working in `tjakoen.github.io/`. It is a PLANNING brief: have Fable plan
> first (propose the DOM, routes, and content model per app), get sign-off, then build. Do the four
> apps as separate passes, not one mega-change.

## The frame you are working inside (read before planning)

The whole site is one editor window. The chrome is the `<portfolio-frame />` organism
(`components/organisms/portfolio-frame/portfolio-frame.html` + `.css`); every page mounts it inside
`<div class="app-shell app-window">` with a `<main class="app-shell__main"><div class="board">…`.
The left rail now has an **upper file tree** and a **lower app dock**. The four apps below are the
dock entries. Today they are thin pages; this brief turns each into a real "app" surface with its
own content and interaction, WITHOUT breaking the illusion that the site is one coherent editor.

Routes already exist and are wired: `/notes` (MILL-rendered blog notes), `/calendar`, `/mail`,
`/about`. `/mail` already has a working **compose-to-TJ** flow. Notes are authored as `.md` under
`notes/` and rendered through MILL; there is a `⌘K` search corpus (`/search.json`) and a
`recentNotes` list injected into pages.

## Non-negotiable constraints (state these back before building)

- **Portfolio-owned, no grain repin.** Grain (`@tjakoen/grain`) is a pinned git-dep. Build with
  portfolio components + portfolio CSS (the portfolio bundle sorts after grain, so its overrides
  win). Do NOT edit anything under `node_modules/@tjakoen/*` or bump `package.json`. If a genuinely
  reusable primitive is missing, note it as a grain proposal, do not inline-fork grain.
- **Reuse the existing chrome + one door.** Keep `<portfolio-frame />`, the `.board` main, and the
  site's single AI interaction door (the assistant/console). New interactive bits should be small
  progressive-enhancement islands (like `scripts/site.js`), zero-JS-degrading where possible.
- **Voice + figures standards.** No em-dashes and no backticks in prose. Honest over hype. Money
  stays vague. Company is "Career Team", no names, no student data. Diagrams follow the FIGURES
  standard (tokenized SVG, not mermaid). Owner: Tjakoen Stolk, "I direct, Claude types."
- **Static-export safe.** The site exports to static files per deploy. Anything dynamic must degrade
  to a sensible static snapshot (the export freezes the graph).
- **Match the tests.** Add/adjust e2e specs under `e2e/`; keep `bun run check`, `bun test`,
  `bunx playwright test`, and `bun run shots` green.

## App 1 — Notes: a Reddit-style feed

A single scrollable feed of the blog notes rendered as "posts": each card has a vote-ish affordance
(cosmetic score is fine), title linking to the full note, author/desk byline, timestamp, tag chips,
and a comment-count that links into the note. Sort/filter controls (New / Top / by tag) that operate
on the existing notes corpus (`/search.json` + note frontmatter). The individual note page
(`/notes/<slug>`) stays MILL-rendered as today; the feed is the new `/notes` index. Keep it feeling
like a reader, not a social network you have to log into.

## App 2 — Calendar: a full-page calendar with views

A real calendar surface at `/calendar` (today it is a "Feed" placeholder) that plots the site's
social/feed posts and note publish dates onto actual dates. Multiple views the user can switch
between: Month grid, Week, and an Agenda/List view. Clicking a day or an entry reveals the post/note
it maps to. The data source is the same notes/posts corpus (publish dates from frontmatter); if
there is a separate social-post feed, define its shape as small JSON the page reads. Views are
client islands that degrade to the Agenda list with no JS.

## App 3 — Mail: a minimalist email client (compose-only, the rest is set dressing)

At `/mail`, present a convincing minimalist email client whose ONLY live action is **compose a
message to TJ** (the compose flow already exists — reuse it, do not rebuild the send path). Give it
the *shell* of a real client: a folder list (Inbox / Sent / Drafts / Archive), a message-list pane,
and a reading pane, all populated with tasteful cosmetic/placeholder content so it reads as an app.
Every non-compose control is visibly present but inert or disabled (with honest affordance: e.g. a
tooltip "demo", or they just do nothing gracefully). The compose button is the one bright, working
path, opening the real message-to-TJ composer. The goal is the *illusion* of an app around a single
real capability. Be careful this never looks like it is faking receiving real mail.

## App 4 — About: a profile "app" surface

Reframe `/about` as a profile app (think an "account/profile" surface rather than a prose page):
a header card (name, role, the "I direct, Claude types" line), tabbed or sectioned panels
(Profile / Résumé / Contact / Now), the contact panel reusing the `/mail` compose entry, and the
Résumé panel wiring to `/resume`. Keep it honest and lightweight; it should feel like the "settings/
account" corner of the editor, consistent with the dock's About icon.

## Deliverable from Fable

For EACH app: (1) a short plan (DOM structure with portfolio class names, route/data model, which
bits are JS islands vs static, which existing utilities/components it reuses); (2) the
implementation; (3) e2e coverage; (4) a note on anything that would have been cleaner as a grain
primitive (proposal only). Build them one app at a time with a check-in between.
