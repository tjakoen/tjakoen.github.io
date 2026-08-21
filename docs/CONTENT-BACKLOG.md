# Portfolio — content backlog

> Status: **captured, not written.** The list of *content pieces* to author for the portfolio
> (companion to [PLAN.md](architecture/PLAN.md) = the *how* and [FEATURES.md](architecture/FEATURES.md) = the *what*).
> These are writing/asset tasks, not code. All content is authored as **Markdown + images** and
> rendered by the CMS (see memory `portfolio-cms-separate-project`); pages are trailheads.
>
> **Guardrails (read before writing any of this — memory `portfolio-content-backlog-guardrails`):**
> the repo is **public**. The events-platform exit is told **neutrally, no names, lessons-forward**.
> Company name is **Career Team**. People name-drops = public professional info + LinkedIn only.

## The AI implementation roadmap note (drafted 2026-08-18)

**Everybody Wants the Agent. Somebody Has to Build the Floor.**
(content/notes/build-the-floor.md, **PUBLISHED** 2026-08-19, ~28 min after the 2026-08-20 pass). The
deck shipped alongside it: [/talks/build-the-floor](../view/pages/talks/build-the-floor.html), 29 slides.

**2026-08-20 pass, uncommitted at time of writing.** A section was added between the roadmap and
stage zero, *I had a parts list, not an architecture*, giving the cross-section the five stages build
but never name: the three layers, the wiring across the delivery chain, the loop that is circulating
and where this note disagrees with it, and the root-cause edge that makes the layer compound. Three
figures came with it. Two are static SVG on the flow scaffold, the layer cross-section and the
delivery chain. One is live, `twopath`, in scripts/figure-floor.js and registered in
scripts/figures.js: one epic walked twice, five stops, showing work moving from repair to
specification. The deck caught up in the same pass: two
slides went in after *One artifact*, the layer cross-section and a live *Two paths* driven off the
slide step through the `__setPath` seam, taking it from 27 slides to 29. Sources gained Cole Medin's starter pack and workshop, which is where
the anatomy and the root-cause edge came from.

**The split was asked for on 2026-08-20 and declined on 2026-08-21, with the note trimmed instead.**
The reason is the *Know what this note is for* paragraph above: the technical depth is the
credential, not the pitch. Split it out and the roadmap half becomes a plan anyone could have
written while the implementation half has no reason to be trusted, which is rejected draft (4)
arriving by a different route. What was actually wrong was proportion, not length: the added section
was 14% of the note, larger than any stage and larger than the roadmap, and a third of it explained
what a rules file and a subagent are. That teaching was cut, since the cross-section figure carries
the parts list, and the opener was reframed because *"I could not draw it"* is a competence
admission about the exact thing this note sells, which is a different order of confession from the
no-ML-background line in the close. The section is now 825 words against stage one's 832, so it sits
in the pack rather than on top of it. **Do not re-inflate it into a tutorial on the three layers.**

**Reading time is measured at the note's own established rate, 261 words a minute**, which is what
its original ~24 min claim over 6,258 words implies. The note is 7,103 words, so ~27 min. Two
earlier bumps this week (~28, then ~30) used a slower rate and were wrong.

**The split, if it is ever revisited.** The test to apply first: **do the two
halves have different readers, or the same reader with less patience?** Same reader means it is
draft (4) again, and on 2026-08-21 the answer was the same reader.

**Know what this note is for.** It sells an AI implementation roadmap, and it positions Tjakoen as
the person who can lead one. **The roadmap is the product.** The technical depth behind each stage is
the credential, not the pitch. The close states what he would want to build and what he is not (no
ML background, no model shipped), because under VOICE that honesty is the credibility.

**The roadmap, which is the thing to protect.** Five overlapping stages over eighteen months, taking
an organization from developers holding subscriptions to real automation:

0. Instrument, including the disclosure marker, and make one repository legible. Months 0 to 2.
1. Extract skills from the people who do the work. Run by hand only. Months 1 to 5.
2. Daily use, outcomes logged and scored. Months 3 to 9.
3. The same skills fired by triggers, headless. Months 6 to 12.
4. Chained, unattended loops. Months 10 to 18.

**The tooling plan inside stage one is the owner's own, and it is the second thing to protect.**
Build the four skills that supervise work before the one that produces work: plan, code review, docs,
QA, and the coder last, only once those four are polished enough to defend human-supervised output.
It carries a figure and a table, and the right-hand column of the table is the argument: each of the
first four builds a piece of the supervision the fifth one needs. Do not reorder it to put the coder
first because it demos better. That is the mistake the section exists to name.

**The spine is that one artifact travels all five stages.** A skill is written once and then
promoted: run by hand, scored, triggered, unattended, chained. No second system, no migration
project where the manual thing gets rewritten as the automated one. That is why the order is skills
first and automation last, and it is the owner's own framing rather than something imported.

The roadmap section carries a gantt figure and three explicit horizons the owner asked for by name:
what we can do now, what we are doing in six months, where we are in a year. Everything after it is
one section per stage, in build order.

**Six live HTML figures, zero SVG.** All in scripts/figure-floor.js and mounted by BOTH the note and
the deck so the surfaces cannot drift: the whiplash dial (drag adoption, watch the review queue
form), the roadmap with a draggable month cursor, the build-order flip, the four gates as a tickable
self-assessment, instruction-versus-hook, and the agent loop that runs a change end to end. Five of
the six wrap a prose fallback rather than a second drawing. **The whiplash keeps its static bar
chart as its fallback on purpose**, because that figure is quantitative and a bar chart is the
honest still image of it; the other five are structural and a sentence says more than a frozen
diagram would.

**FIGURES was updated to match on 2026-08-19**, on the owner's 2026-08-18 call to stop using SVG for
these. The rule is now: a figure with state is HTML, a figure without is one of the two SVG
scaffolds. The fallback rule survives in spirit, so what the server sends must still argue the point
by itself. Do not convert this note back to SVG.

**Inbound link closed 2026-08-19:** one-loop-every-repo now links here from its closing section, so
the cross-link graph in *Production status* covers this note.

**Five earlier drafts were wrong, and the reasons are worth keeping.** (1) Personal essay with a plan
attached, opening on his own worktree failure. (2) A guide addressed to a peer engineer. (3) A guide
addressed to a CEO, which drifted into board, Monday, invoices and procurement language. (4) Split
into a short argument plus a long companion, which fixed length and not audience. (5) Technical and
first person, but with no roadmap in it, which is the thing being sold. **Do not reframe toward an
executive audience, do not remove the roadmap or its figure, and do not replace the stages with a
week-by-week calendar.**

- **Skill results stay vague.** No posted-finding counts, no precision claims, nothing naming what is
  implemented where he works. The six failure modes carry the credibility instead.
- **Time claims are deliberately modest.** "The last few months", not years. Corrected by the owner
  on 2026-08-18 and it is a factual limit, not modesty to be edited out.
- **Each stage carries an Objective line and a Done when gate**, which is what makes the steps read
  as a plan rather than as essay sections. Keep that shape if stages are added or reordered.
- **The worktree confession stays** as one paragraph inside the hooks-beat-instructions argument,
  where it is evidence rather than the frame.
- **Evidence is trimmed to what changes an implementation decision:** DORA's amplifier finding,
  Faros on the review tax, Veracode's 56% security pass rate, METR on why not to instrument with a
  survey, GitClear on duplication.
- **Watch the Faros unreviewed-merge figure.** They report merges without review *rose* 31.3%.
  Several write-ups render that as "31.3% of pull requests merge unreviewed", which is wrong. The
  note states it correctly and flags the misreading.
- **Inbound links: one out, none in.** It links one-loop-every-repo and ten-times-zero. Nothing links
  back, so the closed cross-link graph in *Production status* does not cover it.
- **The talk exists.** The roadmap gantt and the four gates were built to lift into slides, and they
  did: 27 of them, at [/talks/build-the-floor](../view/pages/talks/build-the-floor.html), built the
  way the ten-times-zero deck was. It is a separate artifact from
  [plans/loop-story-and-talk.md](../plans/loop-story-and-talk.md), whose gate is still the loop
  demonstrably running rather than a date.

## Consolidated (2026-08-14, notes audit)

The set had grown to twelve notes across four clusters, two of which carried a note that was a
slice of a longer one rather than an argument of its own. Two folds, 12 down to 10. Both old URLs
stay live as stub pages (`FOLDED_NOTES` in `src/content.ts`, exported and `noindex`), so no shared
link dead-ends.

- [x] **`where-were-we.md` DELETED, folded into `one-loop-every-repo.md`.** This backlog already
      described it as "the PROOF/plans-as-files slice" of the estate-wide note, its subject had
      folded into grain as a package, and it closed by handing the reader to its sibling. The
      plans-as-files argument, the "output has provenance, the intent has none" pull-quote and the
      parser/board flow SVG now live in a new section, *The first thing I fixed was where the plan
      lives*. The old note's opening beat, which one-loop-every-repo used to link out to, was
      rewritten in place. `desk-feed.json`'s closed-loop post repointed. Reading time ~8 to ~10 min.
- [x] **`native-partial-updates.md` DELETED, folded into `the-browser-grew-up.md`.** The parent
      note's own summary already promised "the benchmark I finally ran" and then linked away to it.
      The setup, the four-way bar chart, the honest asterisks, the DPU variant and the bench-repo
      link are now a section of the note that owes them, *The benchmark I kept promising*. Reading
      time ~12 to ~16 min. **Bug fixed in the move:** the bar-chart SVG referenced `--paper`,
      `--ink`, `--muted` and `--accent` without ever defining them, unlike its sibling
      replacement-map figure, so it had been rendering with unresolved custom properties. It now
      carries the same inline palette, per FIGURES' one-family rule.
- [x] **`feels-like-an-app.md` trimmed.** Audited for the same overlap and found mostly innocent:
      the note already defers to the-browser-grew-up in four places by name. The one genuine
      restatement, the "the stack is not anti-server, static is a choice" paragraph that the parent
      note makes with two figures, was cut down to a single deferring clause. The freezability rule
      that follows it is unique to this note and stays.
- [x] **Publish status settled (2026-08-14, owner call).** Four drafts flipped to PUBLISHED:
      whitepaper-one-vocabulary, the-browser-grew-up, feels-like-an-app, one-loop-every-repo. Eight
      of ten notes are now PUBLISHED; the two still DRAFT are the-console-i-built-to-stop-drowning
      (in flight) and watch-its-hands (waiting on the owner's own read). This closes the flip owed
      since the 2026-07-07 fable audit. **Every inline "DRAFT at content/notes/..." claim further
      down this file predates that call and several were already stale before it. A note's own
      frontmatter is the only status worth trusting; read it there, not here.** The field itself
      stays decorative on purpose, also an owner call: no code reads it, and a note goes live when
      its file lands. Gating /notes on it was considered and declined, because it would have hidden
      work that is already published and linked.
- **Still open, deliberately:** the teaching cluster is three notes (why-i-teach,
  how-i-turned-github-into-a-classroom, the-console-i-built-to-stop-drowning) where two of the
  three tell the platform build story. It was left alone because the cluster was merged 5 to 3 on
  2026-07-31 and a second pass over that fresh work is churn, not consolidation. Revisit once the
  console note settles. The whitepaper/watch-its-hands pair is correct as two: same argument, two
  registers, two readers.

## New notes drafted (2026-07-30, gap pass)

Two notes added to close gaps between the published set and work that shipped since:

- [x] **CONSOLIDATED (2026-07-31): teaching-with-AI notes merged 5→3.** `how-i-use-ai-in-teaching.md`
      (was PUBLISHED) and `grain-until-i-sign-it.md` (was DRAFT) were **deleted** and merged into one
      new note, **The Console I Built to Stop Drowning** (`content/notes/the-console-i-built-to-stop-drowning.md`,
      **DRAFT**). It tells the journey: four classes to seven, the QR attendance scanner built first, the
      data-free "read live, one write door" shape it taught, then that shape swallowing grading review (AI
      grades in *grain* type until signed, intent-prompt applied by Claude Code). Canonical repo is now the
      [github-native-course-platform console](https://github.com/tjakoen/github-native-course-platform)
      (grader-ui absorbed into `console/`, its Scan tab is the old QR scanner). Student-rules ladder
      (lab/activity/exam + vibe-coded fail) folded into why-i-teach. Inbound links repointed: ten-times-zero,
      why-i-teach, how-i-turned-github-into-a-classroom, index.html walk card. Retrieval-coupled tests
      (desk-audit deep-link-det, desk-deep-link.e2e) repointed + re-verified against the rebuilt corpus.
- [~] **I Was Shipping Faster Than I Could Understand It** — the estate-wide AI-workflow consolidation note
      (the LOOP.md/SESSION-LOOP.md/pantry-doctor story). Comprehension-debt confession, the work-triggered
      heartbeat (doctor at session start, CI on push, no 3am cron), the accountability contract (run ledger,
      declared rails, verify-by-second-pass), sourced from Addy Osmani's loop-engineering writing + an
      aerospace documentation standard (the STE precedent cited in VOICE). The estate-wide sibling of
      where-were-we (which is the PROOF/plans-as-files slice). **DRAFT** at `content/notes/one-loop-every-repo.md`;
      inbound-linked from where-were-we.md; cross-links ten-times-zero. Honest limits: one person not a team,
      books still being read. **Sources ledger: [LOOP-SOURCES](LOOP-SOURCES.md)** — every outside source
      the loop was built from, what each contributed, and where it already appears. Written 2026-08-13 because
      the credits were scattered across a standard, two file headers, a lockfile and this note. The note owes
      three or four of them in prose and a single link at the end for the rest; a bibliography inside a personal
      note reads as a citation performance. Newest addition is Osmani's *Agentic Code Quality*, which produced
      [the 2026-08-13 loop audit](AUDIT-AI-LOOP-2026-08-13.md) rather than a feature, and whose finding is
      the sharpest line available to the note: ahead of the article on process, behind it on measurement.
- **Stale fixes this pass:** ten-times-zero "not published yet" claim killed (site is live; numbers reframed
      as a dated early-build snapshot, ratio held as "nearly as much prose as code" since the monorepo split
      dropped this repo alone to ~47% prose); why-i-teach:152 "third semester / 100-150" refreshed to the
      growth story (classes 4→7, students ~150 to nearly 300, flagged as a growing snapshot). standards/LOOP.md
      confirmed committed + `/standards/loop` wired. Teaching-platform stats already reanchored in the
      2026-07-29 audit (course-platform repo not local, can't re-pull further).

## The harness half of the AI-setup story (added 2026-08-10)

- [ ] **Whatever note next describes the AI setup covers the harness, not just the loop.** The
      obvious home is `one-loop-every-repo.md` (still DRAFT above), which today tells the standards
      half and treats the thing running them as a given. The gap is deliberate to name: every rule in
      LOOP and SESSION-LOOP assumes a harness, and for a long time this estate never said which.
      It is **Nimbalyst**, and the beats worth writing, in the owner's own framing:
      - **Seeing the subagents work.** The point is not the visual, it is that watching a fan-out is
        what makes the next fan-out bigger. Trust sets the size of the delegation.
      - **Sessions organised into workstreams, with tabs**, instead of a flat list of transcripts.
      - **Control from a phone, over the whole setup rather than one session at a time.** The honest
        comparison is not "nicer mobile app": the unit of control is the workstream, not the
        conversation, which is the thing that has no equivalent elsewhere. Worth being specific here
        rather than superlative, per VOICE.
      - **Permission judged per action by a model**, rather than one blanket approval at the start.
        Include the failure mode or it reads as an advert: a gate that never fires and a gate that is
        off look identical from inside the run.
      - **Per-session tracking of committed and uncommitted files.** The concrete story is already in
        the estate: the machine-level durable-state guard reads the tree, a tree cannot say who
        dirtied it, and with two sessions open it reported one session's mess as the other's.
      - **The automations, the previews, the inline viewing.** A rendered change gets shown rather
        than described, which is exactly what TOUR-STANDARD asks for and what a chat summary cannot
        do.
      - **The honest limit**, which the note must carry to be worth reading: this is one person's
        setup on one machine, tool preference is not evidence, and the standards deliberately name
        the capability rather than the product so the loop survives a change of harness. See
        [`plans/nimbalyst-in-the-loop.md`](../plans/nimbalyst-in-the-loop.md) for that decision.
      - Figure per FIGURES if one earns its place: the flow scaffold, brief to spawned session to
        workstream, is the shape most likely to.

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
- **Locked decisions:** teaching count is "150 to 300 students a semester" (a range, everywhere;
  updated 2026-07-29, matches cv.json + homepage);
  money stays vague with no ratio-in-words; em-dashes are banned in prose (VOICE); the repo footer
  tagline is em-dash-free and canonical in `standards/README-STANDARD.md`.
- **Visuals:** the figure standard now lives in **`standards/FIGURES.md`** (tokenized SVG scaffold,
  palette as CSS custom properties, mermaid-vs-SVG rule, render matrix); VOICE points to it.
  `ten-times-zero.md` is fully figured (2026-07-03): docs-vs-code ratio SVG, multiplier SVG, sprint
  timeline SVG (all on the scaffold), plus the playbook-loop and mistakes-loop mermaids. Rollout to
  the OTHER notes is still PENDING.
- **Owed from the 2026-07-07 fable audit (owner-deferred, no urgency):**
  1. ~~**about.html:33** — LinkedIn link is a `REPLACE-ME` stub~~ **DONE (2026-07-08)** — real handle wired.
  2. **DRAFT flip** — 8 of 12 notes still carry `status: DRAFT`; owner to name which are ready to
     publish (or flip individually as each is finished).
- **Pending work (approved, not yet done):**
  1. **Visualization rollout — mostly DONE (2026-07-04):** ten-times-zero was already done;
     origin-story now has 5 of 6 rendered (the "desk at work" figure stays a placeholder on purpose —
     it should be a real screenshot of the live hero desk on `/`, not a drawing); the teaching pair each
     carry a lead mermaid (why-i-teach: the quit-loop + exit; how-i-use-ai: the feedback wall);
     the-browser-grew-up's replacement-map SVG is rendered. Remaining: capture the desk screenshot.
  2. **ten-times-zero editorial trim — first pass done (2026-07-04):** de-bolded the sprint bullets
     and the "Fast and documented" line, cut the second definition-of-professional from the
     "I've done this job before" closer, broke one vibe/professional antithesis repeat. A deeper
     pass (one driving metaphor, thinning the formula further) still deserves the user's own eye.
  3. **"Watch Its Hands"** whitepaper companion — **DRAFTED 2026-08-06** at
     `content/notes/watch-its-hands.md`. Plain-language, in-voice retelling of the whitepaper for readers
     who will not read a whitepaper: opens on the lab-session "watching the hands" stake, earns the piano
     pull-quote, then the three mechanisms in plain words (same buttons / one door / it leaves its
     handwriting), the one-door flow SVG on the flow scaffold, and an honest-limits section that carries
     the three hypotheses as hypotheses, the small-model scope, the two legacy direct-write routes, and
     the prior-art near-miss. Inbound-linked from the whitepaper status block; cross-links ten-times-zero.
     **DRAFT** — needs the owner's own eye before any publish flip.
  4. **where-were-we.md — SUPERSEDED (2026-08-14): folded into one-loop-every-repo.md, see the
     consolidation entry at the top of this file. The history below is kept for the record; the open
     question it ends on (whether to name PANTRY) travels with the fold and is still the owner's.**
     Originally: **DRAFTED (2026-07-08), STALE-FLAG RESOLVED (2026-07-12):** the PROOF companion
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

- [ ] **Career Team** — the day job, at the altitude that is safe to write about: what a dev manager
      and tech lead actually does with AI in a review loop, kept to method rather than to any
      internal initiative, plus the talks given representing the company. Specifics of internal
      tooling stay out of this repo, which is public. *(Company name: "Career Team".)*
- [ ] **The events platform** — made myself CTO, built the team + platform; the hard exit (**neutral,
      no names, lessons-forward**); show the platform (was publicly available, so fine to show).
- [ ] **Educator** — the classes taught (HTML/CSS/JS, React, Vue, Dart/Flutter, Node/Express, PHP,
      MySQL; Software Eng Implementation & Management); the **GitHub-native course platform** built to
      make teaching sustainable (link it — github.com/tjakoen/github-native-course-platform); talks;
      thesis paneling + advising; **3rd semester, ~120–150 students/term** (this term 4 classes ≈150);
      *why* (not for the money, and the comparison to the day job stays out of this repo as well as
      out of the post; does it for mentoring + public-speaking practice + professional/portfolio
      value); the master's story
      (wanted an MBA, too expensive → chose **cybersecurity**: initially
      not the draw, but it's the elusive-to-me piece, has lots of depth, and aligns with the goal of
      being a **systems architect**).
- [ ] **The business I tried and failed to start** — lessons learned.
- [ ] **The BPO** — marketing-manager era (with photos), employer unnamed.
- [ ] **Family resort** — why I shifted careers.
- [ ] **The first dev job** — recruited in 3rd year, before graduation; employer unnamed.
- [ ] **Best thesis** award.
- [ ] **Org president**.
- [ ] **Technical projects** — GRAIN, BATCH, the CMS, **the GitHub-native course platform**
      (coursework/quiz/grading entirely on GitHub Actions; ownership-boundary design, grade-off-repo,
      human-reviewed AI feedback + vibe-code authenticity flag, LMS-adapter-swappable w/ Canvas as
      reference; runs in production across live courses) — etc. Also gets its **own picture-led
      landing page** at `/course-platform` (see PLAN.md) — screenshots + gifs, links out to the repo,
      **no docs** (the write-up lives in the repo). Asset task: capture the screenshots/gifs.
      **PARTLY DONE (2026-08-14):** the page exists as `/native-github-classroom` and now carries an
      "Open the console yourself" section: a demo-mode screenshot plus links out to the live console
      (`?demo=1`), the public repo and the two repo templates. `/notes/the-console-i-built-to-stop-drowning`
      carries four demo captures. Still open: gifs, and whether the page moves to `/course-platform`.
- [ ] **People I worked with** — what they contributed, LinkedIn links (public professional info only; names go in only with each person's consent, per the no-names guardrail above).

### Captured narrative — the raw career arc (in the user's words, 2026-07-03)

> **Why this block exists:** the user wrote this arc out at length and asked that the *core and the
> messaging* not be lost between sessions. This is the faithful, guardrail-clean source for the
> experience notes above and the résumé spine. Told publishably here (money vague, no litigation
> drama, no names beyond public/LinkedIn). The private specifics that inform tone but must **not**
> publish (private specifics, private specifics) live in agent memory, not in this public repo.
> The **distilled** version already lives in `content/notes/ten-times-zero.md` (the "I was the zero, for
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
   [employer unnamed]; ~2 years' experience by graduation. But realized he didn't *enjoy* pure dev
   work, and
   he has a real trait: he struggles to be productive on things he doesn't enjoy.
3. **Shift to business via the family resort** [Family resort]. Family opened a little beachside
   campsite; he joined and helped grow it into a full resort — online marketing, ops systems, ran it
   with his siblings; his CS background was a big lever. Then the **pandemic crashed it**; he moved
   back to the city. (This is "why I shifted careers.")
4. **Corporate marketing manager at a BPO** [employer unnamed, as with the events platform below].
   Took it because he'd lost dev confidence/edge
   and had done successful marketing for the resort. Stayed ~6 months; learned he dislikes doing
   marketing *for other people* and disliked the office politics.
5. **Serial entrepreneur with friends** [The business I tried and failed to start]. A **cafe** (broke
   even, then folded under new competition), a **salon** (did well, sold at break-even), a **marketing
   firm** (hired someone; his inexperience + theirs → went nowhere). Recurring lesson: *working with
   friends is hard, you can't really direct them.* Net: lost significant personal money (figure kept
   private) but "learned a lot, no regrets." **This is where the maxim crystallized: you have to be
   the right person before you try the thing** — and the long-term **MBA goal** started here (later
   re-routed to a **cybersecurity master's** when the MBA priced out; see Educator note).
6. **The events platform** [**neutral, no names, lessons-forward**]. A friend connected him
   to investors; he planned it, built the team, got it to MVP/launch-ready, execs hired, money moving.
   It **ended badly** and he wasn't treated well. Public telling stays lessons-forward. "Learned a lot."
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
      export → MILL. **DRAFT** in the user's voice at `content/notes/origin-story.md`; needs the user's
      voice/edits + photos. (Personal blog-style companion to the technical-projects note.)
- [~] **Ten Times Zero Is Still Zero** — the flagship AI post and **the footer target on every repo**
      (merged 2026-07-03: the old "Professional vibe coder" post was folded in). Arc = **belief →
      proof → method**: the multiplier principle (**AI multiplies, doesn't add; 10× zero = zero;
      become worth multiplying first**) → the batch-stack receipts (33 commits all AI co-authored, a
      ~10h overnight sprint, headline stat **56% of the repo is prose, not code**) → the **playbook**
      (rails-first / memory / sync matrix / audit / tests / docs-for-the-AI). Dev/practitioner-facing;
      classroom material moved out to the teaching post. **DRAFT** at `content/notes/ten-times-zero.md`.
      *(Numbers are a snapshot — re-pull before publishing.)*
- [x] **How I Teach With AI, and Where I Lock It Out** — **RETIRED 2026-07-31, merged into
      The Console I Built to Stop Drowning** (see the consolidation entry at the top of this file). Its
      machinery half (the human-signs-off wall, "name the concept never the fix," where I refuse) lives in
      the console note; its student-rules ladder folded into why-i-teach. File deleted.
- [~] **I Nearly Quit Teaching. So I Automated the Part That Was Killing Me.** — the *why & how I
      teach* story: adults-like-adults, self-study lean, no-fluff/hard-parts-only, why (not money —
      **kept vague**), the near-burnout arc → built the GitHub-native platform → teaching is
      sustainable now. **DRAFT** at `content/notes/why-i-teach.md`. NOTE: softened the "never told faculty I
      was leaving" detail for professionalism — restore if you want it.
- [~] **How I Turned a GitHub Org Into My Whole Classroom** — the *maker's/build* story of the
      GitHub-native platform (distinct from why-i-teach = teacher's story, how-i-use = AI-ethics
      story; cross-links both instead of re-explaining). Cheapness-as-origin → "repo is the platform"
      reframe → one-engine-many-courses design (org/teacher-repo/student-repos/Actions/gradebook/
      Canvas, carries a mermaid pipeline figure) → the unglamorous real work (access control, scoped
      tokens, names-as-data, safe-by-default) → empty-org→graded-hello-world validation loop. **DRAFT**
      at `content/notes/how-i-turned-github-into-a-classroom.md`. Deep technical detail belongs in the external
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
      script). **DRAFT** at `content/notes/the-browser-grew-up.md`. Cross-links origin-story + ten-times-zero, and
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
      Cross-links native-partial-updates + ten-times-zero. **DRAFT** at `content/notes/feels-like-an-app.md`.
- [x] **Native Partial Updates (I Finally Ran It) — SUPERSEDED (2026-08-14): folded into
      the-browser-grew-up.md as its own section, see the consolidation entry at the top of this
      file. History kept below.** Originally: the *measured* companion that closes the
      "well-founded bet, not measured" seam the other two native notes used to carry: the same reference
      app built four ways and audited by one harness (`framework-bench`), the Declarative Partial Updates
      variant (streamHTMLUnsafe/setHTMLUnsafe), and the honest frame (categorical JS/bytes as the headline,
      local timings as corroboration only). **DRAFT** at `content/notes/native-partial-updates.md`. **Footer repo
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
  "If you can't explain it, you didn't build it." (why-i-teach, the classroom rule). **Main footer link on all repos = ten-times-zero** (the merged flagship,
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

- [x] **GRAIN + BATCH whitepaper — DRAFT written** at `content/notes/whitepaper-one-vocabulary.md`
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
  is a real Playwright-rendered social card (`content/media/og-card.png`, `bun run og:card`). The export
  origin-rewrites HTML pages too. The audit's Canon/OG/JSON-LD columns are now green across pages.
  See memory `seo-aeo-first-class-2026-07-16`.
- Reconcile `PLAN.md` "rendering in the live app" with the CMS-as-separate-project decision.
- **Flow diagrams: mermaid → themed inline SVG — DONE 2026-07-16.** All 22 remaining flow diagrams
  across `content/notes/*.md` + `docs/batch/ARCHITECTURE.md` are now hand-converted to themed inline SVG on the
  whitepaper Figure-1 pattern (`--color-*` tokens, one arrowhead marker per figure, ink-filled emphasis
  box that inverts in dark, `role="img"` + a spoken `aria-label`); verified in light + dark. No `mermaid`
  fences remain in notes/docs, so the diagrams render live everywhere with zero framework JS, and the
  2026-07-15 "shown as source until MILL renders it live" stopgap label (`portfolio-frame.css`) no longer
  triggers on these pages (the CSS is now dead for content — safe to leave or prune).
  - This supersedes the earlier "MILL must render mermaid server-side" requirement *for content*: there
    is no content mermaid left to render. If mermaid authoring is ever wanted again, that MILL capability
    is still unbuilt.
  - **CORRECTION 2026-08-19.** The last sentence stopped being true on 2026-08-16. MILL built the
    renderer, and mill 0.4.0 requires the fence to carry a label that becomes the SVG's accessible
    name. Nothing on this site renders through it yet, so the decision below still stands on its own
    terms; what is wrong is only the claim that the capability does not exist.
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
     The `content/notes/ten-times-zero.md` `>` block-scalar workaround is kept (still correct).
  2. ✅ **Duplicate title on frontmatter-less docs.** `core/engine.ts` `deriveTitle` derived the title
     from the first `# H1` but the body kept rendering it. Fixed: when the title is lifted from a heading,
     that node is dropped from the rendered body (returned `ast` stays whole for TOC/RAG). The 15
     `docs/{grain,batch}/*.md` explicit-title workarounds are kept (still correct). No live page changed —
     every served collection already had frontmatter titles; the fix only benefits future title-less content.
  3. **(Was fix #3, closed as moot 2026-07-16, then BUILT 2026-08-16)** server-side mermaid→SVG
     renderer. It was closed as not-planned for content because no content mermaid remained, and that
     reasoning was sound. It was built anyway, for a future consumer that generates diagrams rather
     than drawing them, and published as mill 0.3.0 with the accessible-name requirement following in
     0.4.0. The portfolio wired it on 2026-08-19, gate first: an uncached or unnamed mermaid fence in
     served content fails the build rather than publishing as raw source, and the renderer the site
     serves with reads only the committed cache, so no deploy ever needs a browser. The first
     rendered diagram is the layer chain on the MILL architecture page.
- **Framework comparison / Evaluation** (public proof of native-first + no-build) — **SCOPED + approach
  confirmed 2026-07-16. BUILT + MEASURED 2026-07-17.** Own public repo `framework-bench`; reference app = a small blog
  (index + article detail + one client-side filter); targets = **native/BATCH vs Astro vs Next.js** (htmx
  dropped). De-risk: `batch/audit/audit.ts` `audit()` is already framework-generic, so this is "build 3
  apps + point it at each," not "build a benchmark tool." Lead with client-JS-shipped + no-build + deps
  (categorical, network-independent), corroborate with local perf (median, not proof), state where Astro
  ties/wins. Becomes the whitepaper's Evaluation section. Full plan: `~/.claude/plans/framework-bench-plan.md`;
  memory `framework-comparison-methodology`. **Realized as FOUR builds (added a native+DPU variant): index
  JS for one identical filter = Astro ~744b / native ~2kb / native+DPU ~3kb / Next ~118kb (~162x), parity
  ties across all. Measured note landed: `content/notes/native-partial-updates.md` (DRAFT); the-browser-grew-up +
  feels-like-an-app ledgers flipped bet→measured. **P6 + P7 DONE (verified 2026-07-21):** P6 —
  `github.com/tjakoen/framework-bench` pushed + public (README + Apache-2.0 LICENSE + badge, consumes
  `@tjakoen/batch` from GitHub Packages), linked from native-partial-updates.md. P7 — whitepaper §5
  Evaluation written: the 2kb-vs-118kb (~163×) number is integrated as *substrate* context (out-of-scope
  for the modality thesis, framed honestly). **Framework-bench track fully closed.**
