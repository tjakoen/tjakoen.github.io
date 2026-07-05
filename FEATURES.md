# Portfolio site — feature brainstorm

> Status: **thinking, not committed.** Companion to [PLAN.md](PLAN.md). PLAN is the *how*
> (export → Pages, in-browser AI demo). This is the *what*: the ideas for what the portfolio
> shows and lets a visitor do. Nothing here is scoped or scheduled — it's a menu to pick from.

## North star (the one thing this site must prove)

The portfolio is the **strongest possible proof the stack works**. So every feature should
earn its place by demonstrating the defining idea, not just decorating:

> **Every surface is addressable and operable by both a human and an AI through one shared
> vocabulary, and the AI's presence is a visible signal (grain = AI).**

If a feature doesn't show *hypermedia-first, AI-as-first-class, no-build, grade-as-signal* —
it's a nice-to-have, not a proof. Rank ideas by "how directly does this make a skeptic
believe the thesis?"

## The organizing concept — the portfolio as a populated productivity app

*(2026-07-01 — the current creative direction. Still brainstorm-tier per the header, but it's the
frame the ideas below now hang on.)*

Rather than editorial pages + a chat gadget, the whole site reads as a small, **populated
productivity suite** — **Notes · Calendar · Contacts** — with **the desk** as the AI assistant that
can *operate* any of them. This isn't decoration: a productivity suite is the most *surface-dense*
container we could pick, so "every surface is addressable and operable by a human *and* an AI"
(the north star) becomes visible and delightful — the desk reaches *into* the apps, it doesn't sit
in a box beside them. It's also the payload for the **workspace archetype** already in the tree
(rail/tabs/chat/console — memory: workspace-archetype-decision), and the anti-template flex:
clearly hand-built, not another hero-video template. (Note: this is *the portfolio's* concept — it
is **not** the "Project" product in `project/`; the portfolio only borrows the desk idiom.)

**The apps map onto the real portfolio content — no forcing:**

| App view | Portfolio content | Route | Static-safe? |
|---|---|---|---|
| **Notes** | the activity stream (teaching · talks · student work · roles) + long-form posts | `/notes` (+ `/notes/:slug`) | ✅ md files |
| **Calendar** | talks + roles as a real timeline (CV-as-calendar) + "now / currently" | `/calendar` | ✅ read-only render |
| **Contacts** | a contact card — `mailto:` + socials + a downloadable vCard | `/contact` | ✅ static file |
| **The desk** | the hero AI that answers "who is this person?"; ⌘K summons it anywhere | `/` (+ everywhere) | ✅ browser demo |

**Notes** replaces the earlier "feed/blog" framing — same md-in-repo content model, same
newest-first stream, same `/notes/:slug` long-form split, just named as the Notes *app*. Opening a
post *is* "open a note."

### The desk, visually — "a lamp on paper"

> **Site chrome superseded (2026-07-05): THE EDITOR** — the whole site now lives inside one editor
> window (title bar with functional dots + ⌘K search, tabs as site nav, honest status bar; canonical:
> `PLAN.md` §THE EDITOR). The lamp below survives as the AI's presence/attention primitive inside
> that window; the desk-scene reading of this section is historical.

Take "the desk" literally: not a chatbot avatar — an actual little workspace where you watch the AI
write by hand. GRAIN is already notepad-y and already has a `spotlight` op, so fuse them: **the desk
is a warm paper surface, and the AI's attention is a desk lamp.** Four states, and the whole design
system lives in the transitions:

1. **Rest** — a paper panel, a ruled prompt line, a soft caret, suggested-question chips. Lamp off.
2. **Waking** — you ask; the lamp clicks on (the spotlight): the page dims, a warm pool gathers on
   the surface it's about to work.
3. **Writing** — grain ink streams token-by-token in the serif grain face (the "wet ink" look,
   `data-commit="pending"`); non-text it touches gets the dashed terminal edge.
4. **Settle** — grain resolves to clean, edges close, the lamp dims back to rest. You literally
   *watch AI ink dry* — that honesty **is** the pitch.

Because every surface is addressable, the lamp **travels to the app it's operating**: "what talks
has he given?" → it swings over the **Calendar**; "how do I reach him?" → it pools on the
**Contacts** card. **⌘K** anywhere = summon the desk = the lamp appears over the current view (the
cmdk palette and the AI spotlight become the same light).

**Feasibility — verified against the tree (2026-07-01):** this is a *restyle of live machinery*, not
new invention. The desk's *behaviour* — travel between surfaces, stream, settle, revise/overwrite,
graceful interrupt with **no server** — already exists in `grain/scripts/ai-dispatch.js`; the lamp
*look* is pure CSS on existing hooks (`.ai-backdrop` / `.ai-spotlit` / grain tokens / serif grain
face). See the receipts + the two real gaps in "How this maps to what already exists" below.

**Guardrail (see anti-features):** keep the framing *structural* (each view a genuine addressable,
AI-operable surface) and *GRAIN-austere* (paper / grain / light done in tokens) — never a
skeuomorphic macOS-chrome render. If it starts to look like a wooden-desk PNG, we've lost.

### Navigate by AI — the desk as a site-wide companion

The desk shouldn't be only a hero moment; the companion is **present everywhere**. On `/` it's the
full desk (paper + lamp); as you leave the hero the **lamp docks into a corner as a small grain
companion** — the *same entity minimized, not a second widget*. A shared docking transition sells
"it followed me." ⌘K summons/expands it anywhere, so the hero desk, the corner companion, and the
cmdk palette are three faces of **one** thing.

The companion **carries the navigation/menu** and lets you **navigate by AI**: ask "show me his
talks" and the companion resolves it to the matching nav link, **spotlights that link, and pulses it
like a click** — then the page loads. That's the "a human click and an AI decision are the same"
claim applied to *navigation itself*. Behaviour rules: **user-initiated** (you ask — it never
silently yanks you elsewhere), **telegraphed** (it spotlights the destination link *before*
navigating, so you see where it's going), and **interruptible** (the existing interrupt pattern).

- **Progressive enhancement is a hard rule.** A real, always-visible `<nav>` of plain links is the
  source of truth; the companion is a layer *on top* of it. Model didn't load / no WebGPU / JS off →
  navigation is untouched. Best structure: the companion is a **disclosure that contains the real
  `<nav>`** — one source of nav, usable by a human (open + click) or the AI (ask), no duplicate menu
  to drift. This *is* the hypermedia-first ethos: the AI operates the same links you can.
- **Not new server vocabulary.** Navigation is a read/nav, so it stays plain hypermedia (per
  memory: interaction-door-pattern) — **not** a `/intent` write. On the static site the client
  companion just picks a link and drives the existing `spotlight{click}` op (see the reuse table),
  so nothing new is added to `contract.ts` for this. The only new bit is the client-side NL→link
  mapping, which the WebLLM/RAG island does anyway.
- **Guardrail (see anti-features):** the corner companion must **not** read as a support-widget — no
  glossy round chat bubble with a robot icon (the single most template-y pattern on the web). It's a
  docked lamp / paper-scrap / grain glyph, unmistakably GRAIN.

## Confirmed scope — what I want (2026-07-01)

These are decided (from the tiers below they're now committed). Each with the design note that
keeps it on-brand and static-safe.

- **Résumé page → exportable to PDF, in the GRAIN design language.** One `/resume` page composed
  from GRAIN components on the theme. PDF **without a build step**: a `@media print` stylesheet so
  the browser's "Save as PDF" produces a clean, typographically-GRAIN document — zero deps, fully
  static, works on Pages. (No headless-PDF service, no runtime.) The résumé is *also* the RAG
  corpus source, so the desk answers "what has he done?" from the same facts a human reads —
  one source, two audiences. Grade-as-signal doesn't apply here (it's static human content); the
  through-line is the **typography and tokens**, so the PDF reads as unmistakably part of the site.
- **A way to contact me.** A single obvious `/contact` surface. Static-safe options, in order of
  preference: (a) prominent `mailto:` + social links (zero deps, honest); (b) contact-as-Intent —
  "ask the desk to draft an intro email" that composes a `mailto:` (on-brand, reuses the
  vocabulary, still no backend); (c) a hosted form (Formspree/Web3Forms) only if real inbound
  submission matters — that's an external service, note the tradeoff. **Default: (a) + optionally
  (b).**
- **Project pages: `/batch` and `/grain`.** Two deep case-study pages, one per framework layer —
  decision-led (problem → constraint → decision → proof), not feature-listy. `/grain` can fold in
  the live `/catalog` as its "browse the system" exhibit; `/batch` leans on the no-build/export
  story (this very site is its proof). Room to add more project cards later (past work, student
  outputs — see the feed).
- **Notes — "the stuff I do," styled to the theme.** *(The Notes app in the productivity frame —
  see Organizing concept. Routes: `/notes` + `/notes/:slug`.)* A chronological stream of posts
  covering teaching life, talks given, experiences, and **showcases of cool student project
  outputs**. Social-feed *shape* (scannable, dated, mixed media) but rendered through GRAIN
  components on the theme — a professional log of activity, not a template blog.
  - **Content model:** posts are **markdown files in the repo** (frontmatter: `title`, `date`,
    `type`/category, `photos`) — data lives as mds so it's trivial to edit from the repo. Types
    double as **categories**: `role` · `talk` · `teaching` · `student-work` · `note`. The `/notes`
    index organizes **top-to-bottom, newest first (by `date`)**, filterable by category; each post
    gets a permalink page (deep-linkable = addressable surface). Photos are plain assets.
  - **Authoring = commit.** Add/edit a `.md`, commit, and the GitHub Action rebuilds the site (the
    live app renders the md → export freezes it → deploy). No CMS, no build step of my own — see
    the content-source decision in [PLAN.md](PLAN.md).
  - **The desk is aware of the feed.** The same mds that render the feed are chunked into the RAG
    corpus (`knowledge.json`), so the AI can answer "what talks has he given?" / "where does he
    work?" from my actual posts. One content source, two consumers (human feed + AI).
  - **Employment as feed content:** current + previous roles are `role` posts — where I work /
    worked, what I did there, experiences, with pictures. This means the feed *doubles as a
    living CV timeline* (and feeds the RAG corpus alongside the résumé — same facts, human voice).
  - **The "notepad" aesthetic:** GRAIN's vibe is very notepad-y, so lean into it — the feed as a
    running notebook/journal. Dated entries, handwritten-margin feel, photos clipped/pasted in,
    the grain texture as paper. This is the feed's signature look and a natural fit for
    grade-as-signal (paper for human notes; the desk's grain when the AI writes).
  - **Honest signal:** these posts are **human-authored — no grain**. That's the point: the feed
    is deliberately *not* AI, which sharpens the contrast with the desk. (The desk can still
    *answer from* the feed via RAG — "what talks has he given?" — reading the same content.)
  - **Student showcase:** treat `student-work` posts as GRAIN cards with the project output
    (screenshot/embed/link) front and center — this is where "look how active I am / look what my
    students build" lives.
  - **Posts can open into a full long-form post at `/notes/:slug`.** A note is short and scannable
    *by design*; when something earns depth (a talk written up, a longer teaching reflection), the
    entry **links into its own full post** — long-form writing on a distinct, addressable page. It's
    all still Notes — one name, two altitudes: the stream (`/notes`) and the full posts it links
    into (`/notes/:slug`). *No separate "blog" concept or namespace* — the long-form pages live
    under `/notes`. Skim the stream, click through when you want the whole thing.
    Content model: the card shows a quiet "Read the post →" affordance for entries that have a
    long-form body (or an external `link` in frontmatter); short self-contained notes just render
    inline with no link. Static-safe — it's just an anchor, no runtime. The full post is markdown
    too, so it renders through the same GRAIN components on the theme and is chunked into the RAG
    corpus alongside the stream (one source, two consumers). Keeps the stream fast to skim while the
    long-form lives on its own surface.
  - **Naming — resolved to `/notes`:** the productivity-app frame (Organizing concept) names it the
    Notes app, so `/notes` over `/feed`/`/log`/`/blog`. One namespace for both altitudes.

**Resulting site map (working):** `/` (hero + desk) · `/notes` + `/notes/:slug` (Notes — the stream
+ long-form posts) · `/calendar` · `/contact` (Contacts) · `/resume` · `/batch` · `/grain` (the
GRAIN showcase, formerly `/demo`) · `/catalog`.

## Tier 1 — features that ARE the pitch (build these first)

- **The desk answers "who is this person?"** — the hero interaction. A visitor asks a
  natural-language question ("What has he actually shipped?" / "Is he any good at CSS?") and
  the desk answers *through GRAIN*: spotlight → grain text streaming in → settling to clean.
  This is the AI demo from PLAN, framed as the front-page moment, not a buried gadget.
- **Suggested questions as real Intents.** Seed 4–6 clickable prompts ("Show me the
  architecture", "What's the hardest thing you built?", "Contact"). Each is the *same* `Intent`
  a human click or an AI decision produces — one door, one vocabulary. Clicking one visibly
  drives the same desk the free-text box does. This is the "human click == AI decision" claim
  made literal and on-screen.
- **"Watch the desk work" on a real task.** Reuse the `/loop` demo idiom against portfolio
  content: the desk drafts a short plan (b-list), then *revises* an item (backspace/overwrite)
  — grade-as-signal in motion. Shows the AI editing a live surface, not just printing text.
- **A visible "AI is here" grade everywhere it acts.** Anywhere the model touches the page,
  the grain signal shows (text grain, dashed terminal edge on non-text). The honesty of the
  signal *is* the design system. Don't hide the seams — feature them.

## Tier 2 — the "show, don't tell" case studies

The portfolio's subject *is* these three layers, so let the site be its own case study.

- **This site explains itself.** A section that says "this page is served as static files
  prerendered from a live no-build BATCH app" — with a link to the actual export tooling and
  workflow. Meta, but it's the truest possible artifact.
- **Live component catalog as a portfolio exhibit.** `/catalog` already exists — surface it as
  "the design system, browsable." Let visitors see every GRAIN atom/molecule/organism on the
  real theme. Optional: the `?annotate` overlay as a guided tour.
- **A "re-skin live" toy.** Expose a few semantic tokens (accent, surface, radius) as controls;
  overriding them re-themes the whole page with zero component edits — the token discipline made
  tangible in ~5 seconds. Powerful because it's the anti-framework flex: no rebuild, no recompile.
- **"Built on the platform" — shown, not claimed.** A short exhibit that names the native primitives
  doing the work — and demonstrates each *on the page itself*: the **View Transition** you saw
  navigating here, the **`<dialog>`** ⌘K palette, **`<details>`** disclosures, **`:has()`** /
  **`color-mix()`** theming. The receipt lands the flex: *this animated, accessible, AI-operable site
  ships ~one JS file* (`bun run audit`). The anti-framework case made concrete — pairs with re-skin
  (both are "no rebuild" proofs). SSOT: `grain/docs/GRAIN.md` "What GRAIN gives you"; spec in
  `GRAIN-PAGE.md` §5b.
- **The one-vocabulary explainer.** A small interactive diagram: a human click and an AI action
  both resolve to an `Intent` → one door → `RenderOp`s → DOM. Hover/click each node to see the
  real type from `contract.ts`. Turns the architecture into something you *operate*, not read.
- **Project cards that open into depth.** Each project (BATCH, GRAIN, this portfolio, past work)
  as a GRAIN card → expands to a short case study: the problem, the constraint, the decision, the
  proof. Keep it decision-led (like PLAN's own "Decisions" section), not feature-listy.

## Tier 3 — content & credibility (the actual "portfolio" job)

- **About / narrative** — short, opinionated, first-person. The voice PLAN already has.
- **Selected work** — a few deep, not many shallow. Each with a live link or a screenshot from
  the existing `bun run shots` pipeline (reuse it — no new tooling).
- **Now / currently building** — a dated, honest "what I'm working on" (fits the memory-driven,
  decision-log style this repo already uses).
- **Contact** — a single obvious surface. Consider making it an `Intent` too ("Ask the desk to
  draft an intro email to me") so even contact goes through the vocabulary. Static-safe: it can
  compose a `mailto:` rather than send.
- **Résumé / CV** — downloadable, and *also* the RAG corpus source, so the desk answers from the
  same facts a human reads. One source, two audiences.

## Tier 4 — polish & delight (only if they don't dilute the thesis)

- **⌘K palette** — already exists (`cmdk.js`); expose it site-wide as the power-user door. Every
  command is an addressable Intent — reinforces the vocabulary claim.
- **Keyboard-first navigation** — the `b-kbd` atom is already in the tree; show the site is fully
  operable without a mouse (nice parallel to "operable by an AI").
- **Prefers-reduced-motion honored** — the grain/spotlight animation must degrade gracefully; a
  portfolio that respects accessibility settings *is* a credibility signal.
- **Dark/light via token override** — falls out of the token system for near-free; reuses the
  re-skin machinery above.
- **First-load story for the AI demo** — the WebLLM download is big; make the wait a feature
  (progress shown *through the desk*, a "loading the mind" grain animation) rather than a spinner.
- **A "capabilities" list** — tie into the FUTURE workflow-registry idea (memory:
  actions-workflow-registry): a "here's what the desk can do" surface. Probably later.

## Anti-features (things to deliberately NOT do)

- **No generic template polish.** Parallax, hero video, endless scroll animations — they say
  "designer template," not "I built the framework this runs on." Restraint is the flex.
- **No skeuomorphic app chrome.** The productivity-app frame (Organizing concept) must stay
  *structural* — each view a genuine addressable, AI-operable surface — and *GRAIN-austere*
  (paper / grain / light done in tokens). A wooden-desk PNG, a glossy macOS title bar, or a lamp
  graphic would undercut "I built the framework this runs on." The metaphor is a hint, not a render.
- **No support-widget bubble.** The site-wide companion (Navigate by AI) must **not** read as a
  glossy round chat bubble with a robot icon — the single most template-y pattern on the web. It's a
  docked lamp / paper-scrap / grain glyph, unmistakably GRAIN. And it never *replaces* real
  navigation: a plain `<nav>` of links is always the source of truth (the companion is enhancement).
- **No feature that needs a live server.** Everything ships static (PLAN's hard constraint).
  Anything requiring `POST /intent`/SSE at runtime is out — the browser demo replaces it.
- **No hidden AI.** The grain signal must always show when the model acts. A portfolio about
  *honest AI presence* can't have a covert AI.
- **No fake data dressed as live.** Data-driven fragments freeze at export (PLAN §verified) —
  present them as snapshots, don't imply they're real-time.
- **No unbounded model trust.** The demo must stay grounded (RAG); a hallucinating "about me"
  is worse than no demo. Grounding is a feature, say so.

## Open questions for the feature set

- ~~**What to call the feed?**~~ **Resolved → `/notes`** (the Organizing concept names it the Notes
  app). One namespace for both altitudes (`/notes` + `/notes/:slug`); no separate "blog" concept.
- **Contact mechanism** — `mailto:` + socials (default, zero-dep) vs. add the desk-drafts-an-intro
  Intent vs. a hosted form (external service). Decide when building `/contact`.
- **How are feed posts authored?** Markdown files rendered through GRAIN, vs. hand-written HTML
  pages. Markdown is faster to keep active; needs a tiny render step (fits `batch` or export).
- **Single scroll page vs. multi-page?** A single addressable long-page suits the "every surface
  has an address" story (deep-linkable anchors as surfaces); multi-page suits the export/sitemap
  story. Could do both: one narrative page + `/catalog` and project sub-pages (`/grain`, `/batch`).
- **How prominent is the AI demo — hero, or one section among many?** Hero maximizes the proof
  but raises the WebGPU/first-load risk on the most-seen surface. The fallback ladder mitigates
  this; still a judgment call.
- **How much "meta" is too much?** The site-explains-itself angle is compelling but can tip into
  navel-gazing. Probably: one strong meta section, not meta *everywhere*.
- **Whose questions seed the demo?** Curated (safe, on-message) vs. open box (impressive, riskier).
  Likely both: prominent curated chips + an open box below.
- **What's the MVP cut?** If only one thing ships: the hero desk-answers-a-question moment +
  about + contact. Everything else is additive.

## How this maps to what already exists (reuse, don't rebuild)

| Feature idea | Already in the tree |
|---|---|
| Desk answers a question | `chat.send` + `chat-log` in `contract.ts`; `applyOp` in `ai-dispatch.js` |
| **Desk: lamp travels between surfaces** | `spotlightOn` re-targets + releases the previous surface (`ai-dispatch.js:69`); reads each surface KIND its own way (`:74-88`) |
| **Desk: grain streams in → settles → revises** | `applyType` (grain body + caret → `done` settles, stays grain) + `back` to overwrite (`ai-dispatch.js:194-225`) |
| **Desk works with no server (static)** | `applyOp` is a pure `(RenderOp)→DOM` fn; SSE is just one caller (`ai-dispatch.js:155-189, 228-231`) — a browser loop drives the same desk |
| **Desk: graceful interrupt offline** | interrupt asks the desk to stop; no server → releases locally via `.catch(spotlightOff)` (`ai-dispatch.js:143`) |
| **Desk: the "lamp on paper" look** | pure CSS on existing hooks (`.ai-backdrop` / `.ai-spotlit` / `.is-click` / grain tokens / serif grain face) — styling, no new machinery |
| **Navigate by AI (the companion clicks a nav link)** | reuses `spotlight{click}` — pulse the target like a real click (`ai-dispatch.js:73`; `click?` field `contract.ts:79`). Nav stays plain hypermedia (memory: interaction-door-pattern), so **no new `/intent` verb** — only a client-side NL→link mapping in the RAG island |
| Watch the desk work | the `/loop` demo (`reasoner.ts` ↔ `loop.html`) |
| Component catalog exhibit | `/catalog` + `?annotate` overlay |
| Re-skin live | the token system (`grain/styles/variables.css`) |
| ⌘K palette / keyboard | `cmdk.js`, `b-kbd` atom |
| Screenshots for project cards | `bun run shots` (`project/tools/screenshots.ts`) |
| Contact-as-Intent | the one-door `Intent` pattern (memory: interaction-door-pattern) |
| Résumé → PDF | `@media print` stylesheet + browser "Save as PDF" (no new tooling, no build) |
| `/grain` project page | fold in the live `/catalog` + `?annotate` overlay |
| Notes answered via the desk | RAG corpus reads the same post content (PLAN: knowledge.json) |

**The two real gaps (not in the tree yet — both already anticipated):**

1. **Extract `applyOp` into a shared module** so the in-browser demo drives the desk without the
   SSE/`EventSource` wiring it's currently bundled with (`ai-dispatch.js`). Already **PLAN piece 2**.
2. **Add `notes` / `calendar` / `contacts` to the surface vocabulary** so the desk can *operate*
   those views. Today `SurfaceKind` is a closed set (`item` · `reflection` · `say-stream` · `screen`
   · `chat-log` — `contract.ts:12`); the mechanism already targets any `[data-surface]`, but making
   them first-class is the CLAUDE.md alignment-table work: `contract.ts` (`SurfaceKind` + any new
   verbs in `ACTIONS`) → reasoner branch → unit + integration tests → `docs/AI-INTERFACE.md`.
