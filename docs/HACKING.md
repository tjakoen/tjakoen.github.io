# HACKING.md — change something yourself, fast

The map I reach for when I want to make a *small* edit without spinning up an AI: where every URL's
source lives, and which file to open for the usual tweaks. The site is deliberately no-build — Bun
renders it on every request — so the loop is just **edit → refresh**. There is no bundler, no
compile step, no framework to fight.

> Companion to [`README.md`](../README.md) (what the site is) and [`PLAN.md`](architecture/PLAN.md) (where it's
> going). This file is the *how do I touch it* doc. If a route or a source location moves, update the
> table here — it's the single source for the wiring map.

## The one rule that makes this navigable

**Every URL resolves to a file, through one of five mechanisms.** The composition root
([`src/server.ts`](../src/server.ts)) wires them; nothing is hidden. Once you know which of the five a URL is,
you know where to edit.

| Mechanism | What it serves | Source |
|---|---|---|
| **Hand-authored page** | the bespoke screens | `view/pages/**/*.html` |
| **MILL content** | notes + rendered layer docs (Markdown) | `content/notes/*.md`, and the installed `grain`/`batch` `docs/` |
| **Generated** | catalog, CSS bundle, sitemap/robots/llms | built at request time from components + the pages tree |
| **The AI door** | the interaction endpoints | [`src/routes/ai-routes.ts`](../src/routes/ai-routes.ts) |
| **Static asset** | styles, scripts, fonts, images, vendor libs | mapped dirs (mostly up in `grain/`) |

## Route → source map (every URL the server answers)

**Pages** — hand-authored HTML, URL mirrors the file under [`view/pages/`](../view/pages/):

| URL | File |
|---|---|
| `/` | `view/pages/index.html` |
| `/about` | `view/pages/about.html` (tabbed profile app; the Lessons tab's roles + résumé roles link to `/notes?tag=<tag>`) |
| `/resume` | `view/pages/resume.html` (the résumé board; each experience role links to its tagged notes) |
| `/mail` | `view/pages/mail.html` + `content/data/mailbox.json` (the messages) — bound through the `mail-folder`/`mail-row`/`mail-reader`/`mail-related` molecules |
| `/calendar` | `view/pages/calendar.html` (the feed page) + `content/data/desk-feed.json` (shipped posts) — the feed cards are the `feed-card` molecule; see the events collection below for `/calendar/<slug>` |
| `/loop` | `view/pages/loop.html` (the reference "watch the AI act" screen) |
| `/grain` | `view/pages/grain/index.html` (GRAIN showcase) |
| `/batch` | `view/pages/batch/index.html` (BATCH showcase) |
| `/bread` | `view/pages/bread/index.html` (the stack umbrella page) |
| `/mill` | `view/pages/mill/index.html` (MILL page) |
| `/docs` | `view/pages/docs/index.html` (developer-docs hub — plan in [`../DEV-DOCS.md`](../../DEV-DOCS.md)) |

**Content** — Markdown through MILL, wired in [`src/content.ts`](../src/content.ts) (not hand-authored HTML):

| URL | Source |
|---|---|
| `/notes`, `/notes/<slug>` | `content/notes/<slug>.md` (the `/notes` index is a portfolio-owned feed, `renderNotesFeedPage`; entries render through MILL) |
| `/notes/<slug>.md` | the same file, served raw (the "honest source" toggle) |
| `/calendar/<slug>` | `content/events/<slug>.md` — the social-feed events collection (`index: false`, so the `/calendar` feed page above still wins the bare path); each entry page gets the photo-grid post template from its frontmatter (`shellChrome` `renderPhotoGrid`) |
| `/grain/docs`, `/grain/docs/<slug>` | the installed `@tjakoen/grain` package's `docs/*.md` (in the monorepo: `../grain/docs/`) |
| `/batch/docs`, `/batch/docs/<slug>` | the installed `@tjakoen/batch` package's `docs/*.md` (in the monorepo: `../batch/docs/`) |

**Generated** — no file to edit directly; change the *inputs*:

| URL | Built from |
|---|---|
| `/catalog` | every component's `.md` (`grain/catalog` harvests the component tree) |
| `/components.css` | every component's `.css`, bundled (`batch/assets/style-bundle`) |
| `/sitemap.xml`, `/robots.txt` | the pages tree + content routes |
| `/llms.txt` | [`src/llms.ts`](../src/llms.ts) (the AI-facing index) |
| `/search.json` | the sitemap + catalog (feeds ⌘K and the explorer tree) |

**The AI door + client runtime** — [`src/routes/ai-routes.ts`](../src/routes/ai-routes.ts) and `batch/http/modules.ts`:

| URL | What |
|---|---|
| `/intent` | the single write door (a human click or an AI decision, same envelope) |
| `/stream` | the SSE channel render ops push back over |
| `/ai/manifest` | the machine-readable index of what's operable |
| `/ui/loop` | the `/loop` demo's task fragment |
| `/modules/*` | grain's TypeScript, transpiled to browser JS on request (no build) |

**Static assets** — served from mapped dirs (see `config.ts` `assetDirs`); **most live up in `grain/`**,
because the look is the design system's, not the site's:

| Prefix | Directory |
|---|---|
| `/styles/*` | `grain/styles` (tokens, base, grade mechanism, themes) |
| `/scripts/*` | `grain/scripts` (the client islands) |
| `/assets/*` | `grain/assets` (the icon sprite) |
| `/fonts/*` | `grain/fonts` (the Redaction grades — grain = AI) |
| `/site/*` | `tjakoen.github.io/scripts` (the site's own island: `site.js`, `desk-commands.js`) |
| `/vendor/*` | `tjakoen.github.io/vendor` (vendored libs) |

## "I want to change X" — the file to open

| I want to… | Open | Notes |
|---|---|---|
| **Fix wording on a page** | the `view/pages/**/*.html` for that URL (table above) | plain HTML; refresh to see it |
| **Edit / add a note or blog post** | `content/notes/<slug>.md` | Markdown + frontmatter; see [`standards/NOTE-STANDARD.md`](../standards/NOTE-STANDARD.md). A new file = a new `/notes/<slug>` route automatically |
| **Change a color / the theme** | `grain/styles/variables.css` (**only** here) | never hardcode a color in a component — override the token. Themes: `grain/styles/themes/*.css` |
| **Change how a component looks** | `grain/components/<layer>/<name>/<name>.css` | one component owns its styling; edit its `.css`, not the page |
| **Change a component's markup** | `grain/components/<layer>/<name>/<name>.html` | some layout components are CSS-only (no `.html`) — see [`../batch/docs/CONVENTIONS.md`](../../batch/docs/CONVENTIONS.md) §4 |
| **Add a whole new page** | a new `view/pages/<name>/index.html` (or `view/pages/<name>.html`) | it's live at `/<name>` on the next refresh; add it to the sitemap? — it's derived, so no |
| **Change the global page shell** (head, scripts) | the `PAGE_HEAD` / `PAGE_ASSETS` constants in [`src/server.ts`](../src/server.ts) | one place, injected into every page — don't hand-list assets in a page's `<head>` |
| **Change what the AI does in a demo** | `grain/ai/reasoner.ts` (the scripted stub) | it's choreography today; the live model lands at M★ (see [`../ROADMAP.md`](../../ROADMAP.md)) |
| **Add / change an AI verb or surface** | `grain/ai/contract.ts` first, then walk the alignment row in [`../CLAUDE.md`](../../CLAUDE.md) | this is *not* a minor edit — it ripples into tests + docs |

## The dev loop

```sh
# from the repo root (paths in src/config.ts assume it)
bun run dev        # http://localhost:3000 — hot reload, no build
bun run check      # tsc --noEmit — must stay green
bun run test       # unit + integration
bun run shots      # capture screenshots + a gallery (to *see* a change headless)
```

Edit a page, a component's CSS, or a note → **just refresh**. The server recomposes on the request;
component/style changes hot-reload. Only a change to `src/server.ts` or other server code needs a restart
(the `bun run dev` watcher handles most of it).

Changed how a page *looks* on purpose? The visual-regression suite (`e2e/visual.e2e.ts`) will fail
because the pixels moved — that's it working. Re-bless the baseline once you're happy:
`bun run test:e2e visual --update-snapshots`.

## The three things that will trip you

1. **Colors live in exactly one file.** `grain/styles/variables.css`. A hardcoded `#hex` in a
   component is a bug the audit catches — re-skin by overriding a token, never by editing a component.
2. **The look is up in `grain/`, not here.** If you're hunting for a style and it isn't in
   `tjakoen.github.io/view/components/`, it's a GRAIN component — look in `grain/components/`. The site only
   owns its *bespoke* surfaces (the frame, the `/loop` demo cards); everything reusable is the design
   system's.
3. **No build step is a feature, not a missing step.** There's nothing to compile. If a change isn't
   showing, it's a stale server process or a hard-refresh away — not a build that didn't run.
