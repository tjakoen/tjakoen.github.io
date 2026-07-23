# Portfolio — content backlog

> Status: **captured, not written.** The list of *content pieces* to author for the portfolio
> (companion to [PLAN.md](docs/architecture/PLAN.md) = the *how* and [FEATURES.md](docs/architecture/FEATURES.md) = the *what*).
> These are writing/asset tasks, not code. All content is authored as **Markdown + images** and
> rendered by the CMS (see memory `portfolio-cms-separate-project`); pages are trailheads.
>
> **Guardrails (read before writing any of this — memory `portfolio-content-backlog-guardrails`):**
> the repo is **public**. The PH Live dispute is told **neutrally, no names, lessons-forward**.
> Company name is **Career Team**. People name-drops = public professional info + LinkedIn only.

## Production status (in-flight, 2026-07-03)

Where the notes actually stand, so a fresh session can pick up mid-stream:

- **All notes are DRAFT, voice-audited against `standards/VOICE.md`, and swept em-dash-free.**
  The origin story was swept carefully (it is the protected exemplar). The whitepaper keeps its
  em-dashes, literal-token backticks, and footer-less ending **by choice** (formal register; ruled
  2026-07-04) — but carries full frontmatter (readingTime + tags added) and now cross-links
  origin-story + ten-times-zero from its status block.
- **Cross-link graph is closed (2026-07-04):** the-browser-grew-up is linked from origin-story (two
  spots) and ten-times-zero; the whitepaper links into the note cluster. Every note has ≥1 inbound
  link from a sibling.
- **Locked decisions:** teaching count is "100 to 150 students a semester" (a range, everywhere);
  money stays vague with no ratio-in-words; em-dashes are banned in prose (VOICE); the repo footer
  tagline is em-dash-free and canonical in `standards/README-STANDARD.md`.
- **Visuals:** the figure standard now lives in **`standards/FIGURES.md`** (tokenized SVG scaffold,
  palette as CSS custom properties, mermaid-vs-SVG rule, render matrix); VOICE points to it.
  `ten-times-zero.md` is fully figured (2026-07-03): docs-vs-code ratio SVG, multiplier SVG, sprint
  timeline SVG (all on the scaffold), plus the playbook-loop and mistakes-loop mermaids. Rollout to
  the OTHER notes is still PENDING.
- **Owed from the 2026-07-07 fable audit (owner-deferred, no urgency):**
  1. ~~**about.html:33** — LinkedIn link is a `REPLACE-ME` stub~~ **DONE (2026-07-08)** — real handle wired.
  2. **DRAFT flip** — all 10 notes still carry `status: DRAFT`; owner to name which are ready to
     publish (or flip individually as each is finished).
- **Pending work (approved, not yet done):**
  1. **Visualization rollout — mostly DONE (2026-07-04):** ten-times-zero was already done;
     origin-story now has 5 of 6 rendered (the "desk at work" figure stays a placeholder on purpose —
     it should be a real screenshot of the live /loop demo, not a drawing); the teaching pair each
     carry a lead mermaid (why-i-teach: the quit-loop + exit; how-i-use-ai: the feedback wall);
     the-browser-grew-up's replacement-map SVG is rendered. Remaining: capture the desk screenshot.
  2. **ten-times-zero editorial trim — first pass done (2026-07-04):** de-bolded the sprint bullets
     and the "Fast and documented" line, cut the second definition-of-professional from the
     "I've done this job before" closer, broke one vibe/professional antithesis repeat. A deeper
     pass (one driving metaphor, thinning the formula further) still deserves the user's own eye.
  3. **"Watch Its Hands"** whitepaper companion: plain-language, in-voice, sells the paper to normal
     people. Blueprint (hooks + concept-translations) is in this session's plan; leads with the piano.
  4. **where-were-we.md — DRAFTED (2026-07-08), STALE-FLAG RESOLVED (2026-07-12):** the PROOF companion
     note (plans-as-files, board as projection; canonical `proof/PLAN.md`, ROADMAP Track E). Mermaid figure
     rendered. The note's original "none of this is built… I'm publishing the plan for the plan tool before
     the plan tool exists" confession has since gained a dated **"Update, 2026-07-12: it's on the wall"**
     section that closes the loop honestly (PROOF shipped: core + board + check/init + the mountable
     routes). **Only open question left from this entry:** whether to fold in a mention of PANTRY v1 (the
     note still doesn't name it). Owner owns the prose — flagged, not rewritten.

## Information architecture (decisions — memory `portfolio-content-architecture`)

- **Résumé main page**, each **experience clickable → its tagged notes** (`/notes?tag=…`).
- **Lessons-learned** tabbed by role (dev manager / tech lead / educator).
- **Goals**, **"get to me"**, **Calendar / the grind**, **biggest-challenge note**,
  **why I love educating**, **knowledge-sharing**.

## Experience notes (blog-style, the user's own voice + photos)

- [ ] **Career Team** — building AI "personalities" out of the top 2 tech leads for code reviews;
      talks given representing the company. *(Company name: "Career Team".)*
- [ ] **PH Live** — made myself CTO, built the team + platform; the hard exit (**neutral, no names,
      lessons-forward**); show the platform (was publicly available, so fine to show).
- [ ] **Educator** — the classes taught (HTML/CSS/JS, React, Vue, Dart/Flutter, Node/Express, PHP,
      MySQL; Software Eng Implementation & Management); the **GitHub-native course platform** built to
      make teaching sustainable (link it — github.com/tjakoen/github-native-course-platform); talks;
      thesis paneling + advising; **3rd semester, ~120–150 students/term** (this term 4 classes ≈150);
      *why* (not for money — paid a **fraction** of the day job, kept vague publicly; does it for
      mentoring + public-speaking practice + professional/portfolio value); the master's story
      (wanted an MBA, too expensive → chose **cybersecurity**: initially
      not the draw, but it's the elusive-to-me piece, has lots of depth, and aligns with the goal of
      being a **systems architect**).
- [ ] **The business I tried and failed to start** — lessons learned.
- [ ] **TaskForce** — marketing-manager era (with photos).
- [ ] **Family resort** — why I shifted careers.
- [ ] **Toroclous** — first job; recruited in 3rd year, before graduation.
- [ ] **Best thesis** award.
- [ ] **Org president**.
- [ ] **Technical projects** — GRAIN, BATCH, the CMS, **the GitHub-native course platform**
      (coursework/quiz/grading entirely on GitHub Actions; ownership-boundary design, grade-off-repo,
      human-reviewed AI feedback + vibe-code authenticity flag, LMS-adapter-swappable w/ Canvas as
      reference; runs in production across live courses) — etc. Also gets its **own picture-led
      landing page** at `/course-platform` (see PLAN.md) — screenshots + gifs, links out to the repo,
      **no docs** (the write-up lives in the repo). Asset task: capture the screenshots/gifs.
- [ ] **People I worked with** — what they contributed, LinkedIn links (public professional info only; names go in only with each person's consent, per the no-names guardrail above).

### Captured narrative — the raw career arc (in the user's words, 2026-07-03)

> **Why this block exists:** the user wrote this arc out at length and asked that the *core and the
> messaging* not be lost between sessions. This is the faithful, guardrail-clean source for the
> experience notes above and the résumé spine. Told publishably here (money vague, no litigation
> drama, no names beyond public/LinkedIn). The private specifics that inform tone but must **not**
> publish (exact money lost, the active dispute) live in agent memory, not in this public repo.
> The **distilled** version already lives in `notes/ten-times-zero.md` (the "I was the zero, for
> years" section); this is the **full** version the standalone notes will draw from.

The through-line (the messaging, keep this intact): **talent and nerve got him into rooms he hadn't
earned; it worked *just enough* to keep doing it but never got him what he aimed for; the expensive
lesson was "be the right person before you try the thing"; so he slowed down, learned the foundations
deeply, and pushed into the uncomfortable (public speaking / teaching). That maturity IS his
definition of "professional," and it's the same experience he now projects onto how he works with
AI.** This is the emotional origin of "become worth multiplying first."

The beats, in order (each feeds the note in brackets):

1. **Stumbled into CS.** Wasn't good at much and didn't care for school; the one high-school class he
   did well in was computer class. In college it clicked, came naturally: star student, **best thesis
   + awards** [Best thesis], aced the programming subjects, coasted/barely-passed the minors he didn't
   care for. Became **CS org president** [Org president] — ran workshops, hackathons, competed a lot.
2. **First dev job while still a student.** Recruited start of 3rd year as a part-time developer
   [Toroclous]; ~2 years' experience by graduation. But realized he didn't *enjoy* pure dev work, and
   he has a real trait: he struggles to be productive on things he doesn't enjoy.
3. **Shift to business via the family resort** [Family resort]. Family opened a little beachside
   campsite; he joined and helped grow it into a full resort — online marketing, ops systems, ran it
   with his siblings; his CS background was a big lever. Then the **pandemic crashed it**; he moved
   back to the city. (This is "why I shifted careers.")
4. **Corporate marketing manager at a BPO** [TaskForce]. Took it because he'd lost dev confidence/edge
   and had done successful marketing for the resort. Stayed ~6 months; learned he dislikes doing
   marketing *for other people* and disliked the office politics.
5. **Serial entrepreneur with friends** [The business I tried and failed to start]. A **cafe** (broke
   even, then folded under new competition), a **salon** (did well, sold at break-even), a **marketing
   firm** (hired someone; his inexperience + theirs → went nowhere). Recurring lesson: *working with
   friends is hard, you can't really direct them.* Net: lost significant personal money (figure kept
   private) but "learned a lot, no regrets." **This is where the maxim crystallized: you have to be
   the right person before you try the thing** — and the long-term **MBA goal** started here (later
   re-routed to a **cybersecurity master's** when the MBA priced out; see Educator note).
6. **The events platform** [PH Live — **neutral, no names, lessons-forward**]. A friend connected him
   to investors; he planned it, built the team, got it to MVP/launch-ready, execs hired, money moving.
   It **ended badly** and he wasn't treated well. *(Private, do not publish: an unresolved dispute over
   unpaid wages/promises. Public telling stays lessons-forward.)* "Learned a lot."
7. **Teaching, the long thread** [Educator]. At ~21, right before graduating, his dean asked him to
   teach; he'd loved the org-president workshops/competitions. Declined then — it was an 8-year
   commitment (they'd have funded his master's) and he was too young to commit. After the events
   platform collapsed, the faculty reached out needing hands; he took subjects part-time and **has
   been teaching since**.
8. **The current job, and the honest role of luck** [Career Team]. Applied for ~50 high positions at a
   time and kept getting **filtered out on the résumé** (aiming high with little corporate experience
   and no master's). Got **lucky** that his first interview was with the CTO, who saw what he was
   actually selling. That's how he landed the **dev manager + tech lead** role he holds now.

**Voice notes for whoever writes these up:** understate the drama (his own register: "everything
crashed," "went nowhere," "ended badly"), close each failure with the lesson and zero bitterness,
name luck as luck, keep money vague, keep the events-platform telling neutral. See
`standards/VOICE.md` principle 9 and the "raw vs. finished" note (both added from this same arc).

## Standalone sections

- [x] **Origin story** — how the project happened: never finding "the thing" → stable job leaves room
      to build for myself → INTROWEB teaching accident + Coding2GO rekindles native HTML/CSS → "AI that
      manages me" (Project) → BATCH (no-build) → GRAIN (design system) → portfolio + static
      export → MILL. **DRAFT** in the user's voice at `notes/origin-story.md`; needs the user's
      voice/edits + photos. (Personal blog-style companion to the technical-projects note.)
- [~] **Ten Times Zero Is Still Zero** — the flagship AI post and **the footer target on every repo**
      (merged 2026-07-03: the old "Professional vibe coder" post was folded in). Arc = **belief →
      proof → method**: the multiplier principle (**AI multiplies, doesn't add; 10× zero = zero;
      become worth multiplying first**) → the batch-stack receipts (33 commits all AI co-authored, a
      ~10h overnight sprint, headline stat **56% of the repo is prose, not code**) → the **playbook**
      (rails-first / memory / sync matrix / audit / tests / docs-for-the-AI). Dev/practitioner-facing;
      classroom material moved out to the teaching post. **DRAFT** at `notes/ten-times-zero.md`.
      *(Numbers are a snapshot — re-pull before publishing.)*
- [~] **How I Teach With AI, and Where I Lock It Out** — the teaching application of the multiplier
      principle (peer/educator-facing, also carries the student-facing classroom AI rules). Leads with
      the honest-limits hook (I built the exam that bans AI). Covers what I use AI for across teaching,
      the receipts (537 commits, docs≈code, ~2,200-line engine, course-bot's 103 commits), the war
      stories (quiz-that-bans-its-builder, "name the concept never the fix," the human-signs-off wall,
      hardening off-repo grading), the classroom rules ("explain it or fail"), and where I refuse
      (proctored exam, PII kept from the model, soft authenticity flag, single front-door disclosure).
      **DRAFT** at `notes/how-i-use-ai-in-teaching.md`. *(Numbers from the teaching repo — verify
      before publishing.)*
- [~] **I Nearly Quit Teaching. So I Automated the Part That Was Killing Me.** — the *why & how I
      teach* story: adults-like-adults, self-study lean, no-fluff/hard-parts-only, why (not money —
      **kept vague**), the near-burnout arc → built the GitHub-native platform → teaching is
      sustainable now. **DRAFT** at `notes/why-i-teach.md`. NOTE: softened the "never told faculty I
      was leaving" detail for professionalism — restore if you want it.
- [~] **How I Turned a GitHub Org Into My Whole Classroom** — the *maker's/build* story of the
      GitHub-native platform (distinct from why-i-teach = teacher's story, how-i-use = AI-ethics
      story; cross-links both instead of re-explaining). Cheapness-as-origin → "repo is the platform"
      reframe → one-engine-many-courses design (org/teacher-repo/student-repos/Actions/gradebook/
      Canvas, carries a mermaid pipeline figure) → the unglamorous real work (access control, scoped
      tokens, names-as-data, safe-by-default) → empty-org→graded-hello-world validation loop. **DRAFT**
      at `notes/how-i-turned-github-into-a-classroom.md`. Deep technical detail belongs in the external
      repo's docs (ARCHITECTURE/LESSONS), which the planned `/course-platform` landing page links to.
- [~] **The Browser Grew Up While I Was Busy With Frameworks** — the mildly-technical *native-first*
      companion to the origin story (which carries the narrative of *why* I left frameworks; this one
      goes a level deeper on the *how*). Feature-by-feature account of the native primitives that
      retired a library (View Transitions, dialog, details, has/color-mix, constraint validation,
      plain-links tabs), the no-build + static-export payoff, the categorical advantages (zero runtime
      deps, own-the-surface, native = accessible/future-proof, one JS file shipped), and the honest
      ledger: perf is now **measured** (the framework-comparison bench, `framework-bench`: ~163× less JS
      than Next on the one interaction; the note's ledger flipped bet→measured, and the in-browser model
      claim flipped to wired, 2026-07-17), plus native-as-direction-not-religion (still uses htmx/Bun/one
      script). **DRAFT** at `notes/the-browser-grew-up.md`. Cross-links origin-story + ten-times-zero, and
      is linked back from both (de-orphaned 2026-07-04); duplicated sentences shared with origin-story
      (Bun-for-a-reason, stale-dist, Coding2GO) were rewritten here so the joke lives in one place.
      All figures rendered (replacement-map SVG on the scaffold, 2026-07-04). Reading time corrected to
      ~12 min (2026-07-17). **Publish TODO — RESOLVED (2026-07-21):** the measured companion
      (native-partial-updates) is linked and that note now carries the live bench repo link
      (github.com/tjakoen/framework-bench, public since bench P6). No loose ends left on this note.
- [~] **Feels Like an App (and It's Lying to You)** — the native-first *how it works* companion to
      the-browser-grew-up (which carries the *why*): the single-page illusion in one line of CSS (View
      Transitions), no-build/pages-are-photographs, the one script that earns its keep, one write path with
      no server, three layers stacked one direction. Honest ledger now **closed on the benchmark** (the
      measured number is in hand; §seam retitled + opener rewritten 2026-07-17) and **the model seam is
      wired** (a small in-browser model drives the desk; scripted-scenario claim flipped 2026-07-17).
      Cross-links native-partial-updates + ten-times-zero. **DRAFT** at `notes/feels-like-an-app.md`.
- [~] **Native Partial Updates (I Finally Ran It)** — the *measured* companion that closes the
      "well-founded bet, not measured" seam the other two native notes used to carry: the same reference
      app built four ways and audited by one harness (`framework-bench`), the Declarative Partial Updates
      variant (streamHTMLUnsafe/setHTMLUnsafe), and the honest frame (categorical JS/bytes as the headline,
      local timings as corroboration only). **DRAFT** at `notes/native-partial-updates.md`. **Footer repo
      link DONE (2026-07-21):** `framework-bench` is pushed + public; the footer + inline link
      (github.com/tjakoen/framework-bench) are live in the note.
- [x] **~~Fifty Tiny Things Before One Big One~~ — CUT (2026-07-03).** A standalone design-philosophy
      note had no lane: the atomic/DRY/tokens core is just Brad Frost (credit + link him where design
      comes up — origin-story already does), and the genuinely-original bits (grade-as-signal,
      semantic-first ≈ AI-legible) are already carried by origin-story + the whitepaper. If an
      approachable standalone GRAIN post is wanted for normal readers, that's the "Watch Its Hands"
      whitepaper companion (pending work #3), not a design-systems 101 note.
- **Signature lines (agreed, threaded + cross-linked across the AI/teaching set):** "I don't prompt
  and pray. I prompt and prove." · "Ten times zero is still zero." (both now in ten-times-zero) ·
  "If you can't explain it, you didn't build it." (how-i-use-ai-in-teaching + why-i-teach, the
  classroom rule). **Main footer link on all repos = ten-times-zero** (the merged flagship,
  universal); others cross-link from it. Footer standard lives in `standards/README-STANDARD.md`.
- [ ] **Lessons learned** (tabs): *as a dev manager / tech lead / educator* — e.g. trust the people
      you hire · learn the fundamentals · never stop learning · do what you love.
- [ ] **Goals**: CTO of a proper (non-startup) company · CEO · start my own business.
- [ ] **Calendar / the grind**: ~16h/day (full-time job + educating + master's); tagline ≈ *grind now
      so I can relax by 30; pushing myself; titles to my name*.
- [ ] **Biggest challenge**: time & energy management — love the work; no margin for error (illness /
      low mood → dominoes); at the limit of stretch; grateful to enjoy it. *(Honest, first-person.)*
- [ ] **Why I love educating.**
- [ ] **Knowledge sharing**: books / YouTube channels / sites I rate — and *why* / how they shaped me.

## White paper

- [x] **GRAIN + BATCH whitepaper — DRAFT written** at `notes/whitepaper-one-vocabulary.md`
      ("One Vocabulary, Two Operators"), a research-doc *projection* of `tjakoen.github.io/PHILOSOPHY.md` with cited
      sources (AG-UI/MCP-UI/MCP Apps, GUI-agent surveys, Anthropic Computer Use, WebArena/OSWorld,
      Horvitz, Lieberman, Signifiers/HATEOAS, C2PA, Carbon for AI). To be linked from `/grain`.
      **TODO** (draft §8): (1) 2nd verified research pass on provenance / generative-UI / accessibility /
      intent-based clusters; (2) dedicated prior-art search for the exact novelty; (3) user-study design
      for the two benefit claims; (4) the user's voice/edits. See memory `whitepaper-draft-and-positioning`.

## Open follow-ups

- **SEO + AEO/AIEO — DONE 2026-07-16 (shipped + deployed).** `seo.ts` `enrichHead` enriches every
  full-document response (server.ts `finalizePage`, idempotent, skips fragments) with a canonical URL,
  Open Graph + Twitter Card, and schema.org JSON-LD (Person + WebSite on home, BlogPosting on notes,
  WebPage + BreadcrumbList elsewhere), derived from each page's own title/description + path. og:image
  is a real Playwright-rendered social card (`media/og-card.png`, `bun run og:card`). The export
  origin-rewrites HTML pages too. The audit's Canon/OG/JSON-LD columns are now green across pages.
  See memory `seo-aeo-first-class-2026-07-16`.
- Reconcile `PLAN.md` "rendering in the live app" with the CMS-as-separate-project decision.
- **Flow diagrams: mermaid → themed inline SVG — DONE 2026-07-16.** All 22 remaining flow diagrams
  across `notes/*.md` + `docs/batch/ARCHITECTURE.md` are now hand-converted to themed inline SVG on the
  whitepaper Figure-1 pattern (`--color-*` tokens, one arrowhead marker per figure, ink-filled emphasis
  box that inverts in dark, `role="img"` + a spoken `aria-label`); verified in light + dark. No `mermaid`
  fences remain in notes/docs, so the diagrams render live everywhere with zero framework JS, and the
  2026-07-15 "shown as source until MILL renders it live" stopgap label (`portfolio-frame.css`) no longer
  triggers on these pages (the CSS is now dead for content — safe to leave or prune).
  - This supersedes the earlier "MILL must render mermaid server-side" requirement *for content*: there
    is no content mermaid left to render. If mermaid authoring is ever wanted again, that MILL capability
    is still unbuilt.
  - **Owner decision RESOLVED 2026-07-16 (SVG-first for flows too):** FIGURES.md reconciled to the
    SVG-flow reality. The "one rule" is now *two figure shapes, one medium (inline SVG)* — a **data-viz
    scaffold** (self-contained e-ink palette, light-only) and a new **flow scaffold** (inherits the page's
    `--color-*` theme tokens, inverts in dark; arrowhead marker + single ink-filled emphasis node
    documented). Mermaid demoted to an optional private source-draft that must be hand-converted before
    publish; the "MILL renders mermaid server-side" dependency is closed as **not planned** for content.
    Render matrix + inbound refs (standards/README.md, CLAUDE.md) updated in the same pass.
- **MILL upstream fixes found 2026-07-15 — FIXED 2026-07-16** (both `@tjakoen/mill` core; fixed in
  mill `e56954e`, portfolio repinned `9d370af`, deployed):
  1. ✅ **Frontmatter `\"` not unescaped.** `core/frontmatter.ts` `unquote` returned the inner verbatim,
     so a double-quoted scalar with escaped quotes rendered the backslashes literally. Fixed: `unquote`
     now processes YAML escapes (`\"`, `\\`) for double-quoted scalars; single-quoted stay verbatim.
     The `notes/ten-times-zero.md` `>` block-scalar workaround is kept (still correct).
  2. ✅ **Duplicate title on frontmatter-less docs.** `core/engine.ts` `deriveTitle` derived the title
     from the first `# H1` but the body kept rendering it. Fixed: when the title is lifted from a heading,
     that node is dropped from the rendered body (returned `ast` stays whole for TOC/RAG). The 15
     `docs/{grain,batch}/*.md` explicit-title workarounds are kept (still correct). No live page changed —
     every served collection already had frontmatter titles; the fix only benefits future title-less content.
  3. **(Was fix #3, now moot)** server-side mermaid→SVG renderer: closed as NOT-planned for content per
     the FIGURES reconcile — no content mermaid remains. Capability stays unbuilt unless mermaid authoring returns.
- **Framework comparison / Evaluation** (public proof of native-first + no-build) — **SCOPED + approach
  confirmed 2026-07-16. BUILT + MEASURED 2026-07-17.** Own public repo `framework-bench`; reference app = a small blog
  (index + article detail + one client-side filter); targets = **native/BATCH vs Astro vs Next.js** (htmx
  dropped). De-risk: `batch/audit/audit.ts` `audit()` is already framework-generic, so this is "build 3
  apps + point it at each," not "build a benchmark tool." Lead with client-JS-shipped + no-build + deps
  (categorical, network-independent), corroborate with local perf (median, not proof), state where Astro
  ties/wins. Becomes the whitepaper's Evaluation section. Full plan: `~/.claude/plans/framework-bench-plan.md`;
  memory `framework-comparison-methodology`. **Realized as FOUR builds (added a native+DPU variant): index
  JS for one identical filter = Astro ~744b / native ~2kb / native+DPU ~3kb / Next ~118kb (~162x), parity
  ties across all. Measured note landed: `notes/native-partial-updates.md` (DRAFT); the-browser-grew-up +
  feels-like-an-app ledgers flipped bet→measured. **P6 + P7 DONE (verified 2026-07-21):** P6 —
  `github.com/tjakoen/framework-bench` pushed + public (README + Apache-2.0 LICENSE + badge, consumes
  `@tjakoen/batch` from GitHub Packages), linked from native-partial-updates.md. P7 — whitepaper §5
  Evaluation written: the 2kb-vs-118kb (~163×) number is integrated as *substrate* context (out-of-scope
  for the modality thesis, framed honestly). **Framework-bench track fully closed.**
