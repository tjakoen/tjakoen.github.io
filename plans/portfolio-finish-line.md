---
id: portfolio-finish-line
status: done
track: portfolio
depends: [site-builder, builder-ai-depth, runs-surface-polish]
touches:
  - view/pages/index.html
  - view/pages/projects/
  - view/pages/bread/
  - view/pages/grain/
  - view/pages/batch/
  - view/pages/pantry/
  - view/pages/teaching/
  - view/pages/talks/
  - view/pages/badges/
  - content/notes/
  - src/server.ts
  - e2e/
owner: human
---

# Bring the portfolio to a clear, reviewable finish

## The job the site has to do

This portfolio should make it easy to understand who I am, what I build, and why the work is worth
trusting. It should introduce the BREAD stack through real products, show GRAIN as the design system
behind the interface, and use Pantry as the app that brings the layers together. The notes, talks,
teaching work, and badges are evidence of how I think, what I can explain, and what I have helped
other people learn.

The finish line is a connected story across the pages. A visitor should be able to move from the
person, to the work, to the proof without having to know the repository first.

## Scope

This plan closes the portfolio experience and its presentation. It includes the introductions to
BATCH and GRAIN, but it does not change their internal implementations. That deeper design-system
work has its own later review. Existing page-level plans remain the source of implementation details;
this plan owns the final path across them.

The finish line now also includes a portfolio-wide audit of browser-local AI. Builder generation is
one workload, while DESK handles grounded questions, summaries, fuzzy navigation, and selected
site actions. The audit will distinguish tasks that should stay deterministic from those that need
the model, measure each model-backed task against visitor outcomes, and tune only where repeatable
evidence supports a change. It will also produce a reusable standard in `standards/LOCAL-AI-STANDARD.md`
so the same method can be applied to the owner's other projects. Browser responsiveness at desktop
and narrow phone widths is the device criterion; physical handset testing is not required.

## Open work: portfolio-wide local AI

- [x] Inventory every visitor-facing browser-local model path, its profile, prompt/context inputs,
  deterministic guards, model output, review step, offline behavior, and first-use download cost.
- [x] Build a task-specific evaluation matrix for DESK grounded answers, summaries, fuzzy navigation,
  any model-composed action, and Builder composition and editing. Keep deterministic controls in the
  matrix so the whole visitor flow is checked, not just raw model text.
- [x] Run repeatable live WebGPU baselines and inspect the captured raw answers and visible outcomes.
  Record model ID, runtime/profile, prompt or decoding changes, warm/cold state, latency, and failures.
- [x] Tune only the failing layer: retrieval and bounded context for grounding, task-specific prompts
  and decoding for model work, or deterministic code and review gates where generation is the wrong
  tool. Re-run the same cases and holdouts before keeping a change.
- [x] Verify first-use and warm-use behavior, WebGPU-unavailable handling, and desktop/390px browser
  presentation for the DESK and Builder surfaces. A fresh 0.5B profile displayed 66% download
  progress at 20 seconds and completed the first grounded answer in 29 seconds. The warm matrix then
  passed 51/51. The existing no-WebGPU E2E suite and 390px Builder/GRAIN browser checks passed. Do not
  require physical-phone testing.
- [x] Write the reusable method and evidence-backed lessons in `standards/LOCAL-AI-STANDARD.md`, then
  link it from the standards index and developer docs. Keep implementation-specific facts in this
  plan or the owning feature plan.

### Initial local-AI evidence, October 14

The live WebGPU baseline exercised eleven DESK tasks on Qwen2.5-0.5B. Seven passed the current
checks and four failed: “Who is TJ?” omitted teaching; a natural capability question missed the
capabilities response and did not mention page summarization; “Show me something interactive here”
fell into a long, irrelevant answer; and “what do you know about me?” failed to repeat the saved
visitor fact. The “summarize this page” check passed but accepted generic text that named no subject,
so the audit's own grader was too weak to count that result as useful. These are visible in the local
baseline report at `.cache/desk-audit/report-portfolio-local-ai-baseline-2026-10-14.json`; the report
is local because it includes visitor-visible content and is not part of the published evidence set.

The first code review found a source-of-truth mismatch: `src/ai/facts.md` did not carry the current
About profile's one year of college teaching or the 15-to-25 person leadership range. The shared desk
also had no deterministic path for reading back its own marked memory lines. Those are being fixed at
the data and routing boundaries. The natural capability wording now uses the existing live capability
catalog, and the interactive request maps to the existing model-driven showcase instead of asking the
small chat model to invent a description. Summary grading now requires an actual subject from the feed.
The first strict recheck exposed two further failures. The shared 0.5B answered a capability question
with a page-specific capability list, which is appropriate, but its old grader demanded the literal
word GRAIN. The model also invented industries in its Notes summary. The capability check now grades
the actual actions the page offers. The Notes feed summary now reads the featured card's authored
title and summary directly, a deterministic operation that avoids paraphrase drift. The exact "Who is
TJ?" and "How do you work under the hood?" questions now read the matching section of the facts file, so
the portfolio's current leadership and teaching facts and the live model/runtime description do not
depend on small-model recall. These actions still use the model for open-ended questions, synthesis
that needs it, and the Builder's generation/editing paths.

The complete live WebGPU matrix then passed 51/51 scenarios on October 14. It includes grounded DESK
questions, the live capability catalog, the cross-page demonstration, summaries, deterministic routing and
page actions, visitor memory, 30 Builder edit/composition cases, negative content constraints, and a
guided tour. The report records model profile, raw model output, timings, page outcome, and grading:
.cache/desk-audit/report-portfolio-local-ai-final2-2026-10-14.json. It is local-only because it
contains visitor-visible text. A prior seven-task A/B using Qwen2.5-1.5B passed five tasks, with
generation times from 14 to 27 seconds (18 seconds median); it still missed runtime and summary
quality. The 0.5B shared-profile baseline took 5 to 18 seconds across comparable tasks. The larger
model improved the bio but did not earn its additional download and latency for the whole DESK, so
the shared DESK remains on 0.5B. The Builder retains its existing conservative 1.5B device gate.

The standard index and developer docs now link to LOCAL-AI-STANDARD.md. Its rendered page was
inspected at desktop and 390px on October 14 with no horizontal overflow. The 390px GRAIN and Builder
screens also have no horizontal overflow, and the Builder's live edit and generation model results
were inspected at desktop. The affected browser suite passed 87/87, including the offline desk and
narrow-phone Builder workbench. The Builder's real-model matrix is desktop Chromium on this Mac, so
its phone behavior remains a responsive-browser check rather than a claim about mobile GPU
performance. Cold-start evidence is local at .cache/desk-audit/report-portfolio-local-ai-cold-start-2026-10-14.json.

## Current progress (2026-10-13)

The project index now gives GRAIN a direct introduction beside PANTRY instead of leaving
the design system visible only as one layer inside the BREAD story. The index names TJ's role across
the featured products, stack, design system, app and teaching platform. This audit found that its
feature cards linked to the portfolio stories but hid the public repositories one click deeper.
Source links now sit beside the story links for Greenroom, BREAD, GRAIN, PANTRY, and the course
platform; its interactive demo remains a separate action. The classroom card also points to the
teaching page, where visitors can inspect the courses, assessment approach, and badge criteria.
Browser checks cover ownership copy, source and demo links, teaching handoff, wide-screen alignment,
and narrow-screen stacking. The project index now provides both an explanation and a direct way to
inspect the code, while the wider audit of each project's outcomes, evidence and next steps remains
open. All five repository links and the interactive demo returned HTTP 200 on October 13. The
cross-page claim review also found that the GRAIN showcase described its server SSE path as the
deployed static transport. It now distinguishes the browser client door used on the static site
from the server door shown by `bun run dev:stub`, with a browser assertion for both. The PANTRY
install example now uses `pantry init --kit`, matching the public quickstart and the page's claim
that the kit installs project instructions; the page check guards the flag. Its long install command
also overflowed the desktop content pane, so the first-run steps now wrap in a responsive layout
that was reviewed at desktop and phone widths and checked for overflow. The repeated page
footer now uses one plain, human-accountable AI statement without the robot emoji or an unsupported
claim about every commit. Builder exports retain GRAIN's own generated attribution, covered by the
export checks; the two credits describe different kinds of authorship. The /plans board now keeps
all four status columns readable: narrow desktop users can scroll the final column into view, and
long path chips wrap so phone layouts do not gain sideways page overflow.

The October 13 follow-up connected the homepage's leadership and course-scale claims directly to the
course platform story, its synthetic-data demo, teaching page, and leadership profile. The scale
wording was checked against the public course-platform README, which says the platform runs in
production across several live university courses and covers hundreds of student repositories per
term. The course story now repeats that scope and links to the note explaining what the platform
makes possible. Greenroom now links directly to its public engineering case study, beside the run
demo and source. Desktop and 390px checks cover those evidence paths; the full case-story audit still
needs each product's stated result, proof, and next step reviewed together.

The October 13 outcome-and-proof review checked the five Projects entries against their public
stories and the available local repositories. Greenroom's case study and source explain the local
app and deployable team edition; its visitor-facing run is explicitly seeded practice data, not a
customer result. The BREAD request trace demonstrates the stack serving a real portfolio note, and
the source plus layer pages explain the reusable architecture; that is a concrete integration proof,
not an adoption or performance outcome. GRAIN's shared-control demo and action contract demonstrate
the interaction model, while PANTRY's public quickstart and install-to-first-use path describe an
installation tested in a separate project. The classroom story and public architecture document a
production workflow across several courses and hundreds of repositories per term, but its public
interactive demo is synthetic and cannot independently verify those operational counts. The four
local repositories checked for this pass were clean on `main` and tracking `origin/main`; the
course-platform repository is not present in the local repo collection. The current pages generally
pair a clear problem or design choice with an inspectable artifact and a next link. The remaining
proof gap is therefore narrower than missing project presentation: visitors cannot independently
inspect customer usage for Greenroom, adoption of BREAD/GRAIN/PANTRY, or private classroom operation.
Keep the existing privacy boundary. If stronger outcome proof becomes available, prefer a
privacy-safe aggregate, a reproducible install/run transcript, or a clearly attributed customer or
teaching case study; do not imply the seeded and synthetic demos prove production outcomes.

The About profile now places the course platform's production scale beside its own supporting link,
so the 150–300 students-per-term claim leads directly to the platform story, architecture, and
privacy-safe demo. The change passed the focused browser check and all 21 About browser cases. Its
first full hosted CI run caught an older assertion that counted exactly three links across all role
proof blocks; that selector had become too broad when a fourth, page-level evidence link was added.
The selector now names the three role-specific links. Commit `83ae03e` passed typecheck, unit tests,
lint baseline, and the complete hosted E2E suite (425 tests); the Pages build and deployment passed,
and the live `/about` route contains the new course-scale evidence. Its serial local full-suite run
also passed all 425 tests. The parallel local run had four time-sensitive failures in desk animations
and the long plan-detail crawl; all passed in serial mode. This increment is released, while the
project-by-project outcome and evidence audit and Builder reliability work remain open below.

The October 13 role-introduction pass reshapes the About profile around three connected principles:
as a teacher, treat students as adults and automate mechanical grading to return time to teaching; as
an engineer, hold the architecture and quality bar while keeping direction legible to the next person;
as a manager, grow people first and deliver goals through them. Each line links to its detailed role
section. The homepage now opens with the same three principles, while the résumé summary uses that
first-person framing and links to the full profile. The themes come from existing About role sections,
the teaching and origin-story notes; no new biographical claims were added. Focused desktop and phone checks cover
the three statements, role anchors, and résumé/homepage paths.

The first full route sweep covered 145 public routes at desktop and phone widths (290 checks). It
found no route-level navigation failures, missing or duplicate page headings, or horizontal page
overflow outside /catalog. The catalog's mobile grid had been allowed to size itself from wide
component examples, its fixed-position live specimens could float over other entries, and its empty
console-expand control had no accessible name. The portfolio now clamps that generated page to the
phone viewport, confines each live specimen to its card, and names the control at the host
integration boundary and supplies the catalog's missing search description, leaving GRAIN and
BATCH internals untouched. Browser checks cover the phone width, full-page catalog navigation, and
description. A refreshed headless audit then returned all 145 routes successfully, with canonical, Open
Graph, structured-data, and description metadata present. The first report still counted generated
catalog specimen titles as page headings. Those titles now keep their visual style without using
heading elements, and that report found exactly one page heading on all 145 routes. The
page-family review remains open.

The first desktop and phone review of the main visitor journey also found a stale fact in the talks
section: the “Build the Floor” deck contains 33 slides, while the talks index said 27 and its note
attachment said 32. Both public counts now match the deck, and a browser check compares every talk
index count with its slide sections and checks the linked note's count.

The MILL introduction now links directly to a rendered note as well as its documentation. A visitor
can inspect the content engine's output from the project page without first navigating the repository
or reading the implementation guide. The landing-page browser check covers that evidence link.

The PROOF introduction now pairs the source markdown for a completed site-builder plan with the
board's rendered plan detail. Its existing manual-refresh limitation remains visible, and a browser
check follows the source-to-board links and verifies the completed status.

The developer-docs pass found pre-split package instructions that no longer matched the published
repositories. The docs index and the BATCH, GRAIN, MILL, and PROOF setup guides now describe the npm
packages, the portfolio's Pages workflow, and the difference between each library and the running
app. Current PROOF package metadata still pins BATCH to a public GitHub commit, so the guide names
that extra network dependency rather than claiming every install comes from npm. Phone-width browser
checks cover the updated docs index and the BATCH and GRAIN package guides. The remaining docs sets
still need their own content and instruction review.

The CRUMB introduction now leads with a direct link into the live portfolio tour. A browser check
starts that tour from the project page and confirms the first guided step appears.

The PANTRY introduction now includes the documented install, scaffold, check, and serve commands next
to its verified-install claim. It also states that the board reads the host project's plans in place.

On October 13, a fresh sitemap audit covered 148 canonical routes: all returned HTTP 200, and every
route had one page heading, a description, canonical URL, Open Graph metadata, and structured data.
The new Version One deck route and workshop attachment were checked at desktop and phone widths,
and the full deck was reviewed for student repositories and records before its route was added to the
canonical-page checks. The `/batch` introduction now reports that the linked audit covers 148 routes.
The static export and dead-link verification pass with the workshop deck included.

The October 13 source-by-source documentation review found two capability overstatements:
the GRAIN quick start said every surface was operable, and the BATCH static-export guide implied the
client door exposed the same full vocabulary. They now describe registered surfaces and supported
service-free actions. Browser assertions cover both statements. The three MILL guides have now been
checked against the installed 0.4.0 package source and its current plan: the collection fields,
route enumeration, renderer port, addressable surfaces, and deferred AI outputs match. The BATCH,
GRAIN, and PROOF guides were then checked against the installed package sources. That pass found one
remaining mismatch: the PROOF quick start said `proof init` writes a contract section into the host's
`CLAUDE.md`. The package only creates files under `plans/` and prints the manual wiring step. The
guide now says that directly, and a browser assertion guards the boundary. The current setup,
operator, and interaction instructions match the checked-out BATCH 0.2.1, GRAIN 0.1.23, MILL 0.4.0,
and PROOF 0.1.4 packages. Deeper BATCH and GRAIN implementation review remains deferred as agreed.

The October 13 refresh of the 23-screen desktop gallery found two additional presentation issues:
the Talks introduction described every deck as an interactive web page, despite the new event PDF,
and the Standards index repeated the AI-REPO-STANDARD filename and summary in one awkwardly wrapped
title. The Talks copy now distinguishes interactive web decks from the event PDF, and the standard
has a shorter display title with its purpose in the summary. Focused browser checks cover both.
The gallery now contains 35 captures: the original project and interaction views, six newly included
desktop routes (Projects, Résumé, Teaching, Badges, Plans, and Version One), and first-screen phone
captures for those six routes. Phone review confirms the content and primary controls remain legible.
The PDF viewer's fallback is expected in headless Chromium; its direct link now has a browser check
for a successful `application/pdf` response with a valid PDF signature.

The cross-page read of BREAD, BATCH, GRAIN, MILL, PROOF, CRUMB, and PANTRY confirms they now tell one
consistent story: the BREAD page explains the dependency direction and the portfolio request path;
BATCH, GRAIN, and MILL each state their own layer and link to adjacent layers; PROOF and CRUMB are
shown at the same level above GRAIN and MILL; and PANTRY is clearly an installable app that mounts the
stack rather than another layer. Each introduction links back to BREAD, documentation, and source or
a live demonstration where applicable. Existing route and phone-layout checks cover the responsive
presentation; deeper GRAIN and BATCH implementation work remains deferred.

The October 13 source check found one precision gap in that story: PANTRY's core docs app composes
BATCH, GRAIN, MILL, and PROOF, while its optional `toursDir` mounts CRUMB's review-tour routes and
client for projects being reviewed. The BREAD and PANTRY introductions now say so explicitly. Focused
browser checks cover both explanations alongside their existing phone and install paths.

The project-story pass brought inspectable evidence onto the Projects cards: a real note request for
BREAD, the working shared-control demo and action contract for GRAIN, and PANTRY's composition and
first-use routes. The BREAD card also distinguishes the four packages I built from MILL, which the
site uses. Four GRAIN implementation guides were checked against the installed package source for
component locations, the closed RenderOp set and dispatcher lifecycle, token names, and the manifest
contract. PANTRY's composition and install guides were checked against its docs and source so the
optional preview-tour support stays separate from the four-layer core. The cross-page read across
BATCH, GRAIN, MILL, PROOF, CRUMB, PANTRY, Greenroom, and the course platform confirmed that each
project story leads to source, documentation, a working demo, a measured result, or a rendered
example. One PANTRY link returned readers to the page top instead of the first-use commands; it now
lands on that section directly, with the project browser check covering the target.

The badge certificate template pass found that “Copy share link” silently failed when clipboard
access was missing or denied. It now tries the browser clipboard, then a copy-command fallback, and
shows a selectable manual link if neither works. The phone-width browser check covers the normal
copy and the unavailable-clipboard state. I reviewed the rendered certificate with personal fields
masked; recipient records stay out of the audit notes. The same silent no-clipboard exit existed in
event share blocks. They now try the same copy-command fallback and tell the reader to select the
visible post text if copying still fails; the event-page browser check covers both paths.

The October 11 Builder audit scored 2/8 in each of two live 0.5B runs and 6/8 in one 1.5B run. The
larger model handled both width changes, both explicit-ID moves, and refusal to rewrite existing
copy, but failed both removal scenarios and added unsupported flourishes to its draft. Its first
scenario took 40.5 seconds from a fresh cache, including model loading and generation; a browser
profile occupied 1.6 GB after the run, which is not an exact download measurement. The Builder now
selects 1.5B only on capable devices; the shared desk remains on 0.5B. A focused October 13 check
applied both deletion requests after the review panel disclosed and corrected the model's wrong
target for the second card. The same run's draft omitted Utrecht, so the reviewed workflow scored
2/3. That result measures target reconciliation, not model accuracy or reliable writing. Phone
hardware and repeated grounded-copy measurements remain open. Copy on blocks already in the canvas
cannot yet be edited.

The Builder now follows the part of Puck's AI approach that fits this site: a model chooses from
GRAIN's code-owned blocks and can draft copy only for registered text fields on new blocks. The
portfolio now sends that local request a JSON schema that bounds the block count, names, span, and
copy lengths; the existing validator still filters each block's fields before rendering. Model
quality remains an open gap. A local WebGPU run on October 12 scored 6/8 with the 1.5B profile, but
the passing cases varied across runs. After the timeout increased to 60 seconds, a fresh-server run
scored 5/8: both deletion cases failed, and the draft omitted Utrecht and added unsupported phrases.
A warm repeat included the city but still added marketing language. A stricter prompt trial did not
resolve the problem and was reverted. One earlier relative deletion timed out at 45 seconds; in the
new run the first request took 50 seconds and the target guard refused the model's wrong card. The
current in-app browser still has no WebGPU, so the live model remains untested in that browser. The
local Playwright Chromium run supplies the live-model evidence. Existing copy cannot be revised
because GRAIN does not yet expose a bounded text-write operation. The Builder names these limits in
its visible guidance; reliable AI page writing remains unfinished.

On October 13, a fresh local 1.5B draft-only repeat again failed to retain Utrecht and added claims
that the brief did not support. The draft review now shows the visitor's source brief beside the
editable generated copy and asks the visitor to compare names, locations, and claims before adding
it. A phone-width browser check confirms the brief remains readable without page overflow. This
improves the review evidence but does not make generation grounded; repeated draft quality remains
open in builder-ai-depth.md.

The owner confirmed that Builder generation must stay local. The page now says capable devices
download about 875 MB of model files for the Builder, while other devices use about 350 MB; files
are cached and prompt generation stays on the device. Shared example links open the predictable code-owned preview until a visitor presses
Build it. Explicit counts now produce the requested number of blocks, card-specific layout language
only places the cards side by side, and repeated cards receive distinct fallback copy. Unit and
browser checks cover the four-block example, the two half-width cards, the distinct copy, and the
local-generation notice. The narrower preview was also reviewed at 390 pixels with no page overflow.

The latest October 11 CI run on `cf0af7a` passed typecheck, all 705 unit tests, and 410 browser
cases; it skipped one calendar case because its fixture has no single-photo event. Static export
and export verification pass. The export contains 1,175 pages and 1,132 data routes, and every
exported internal link resolves.
The figure-loader assertions now wait for dynamic imports, so a late request no longer looks like a
missing feature. A run with four workers produced seven failures under parallel load; the serial run
is the reliable gate for this suite. The export needs PUBLIC_ORIGIN set to the deployed URL to avoid
localhost in generated endpoints; the Pages workflow sets it. The lint gate now reports 4,491 flags,
79 below its previous high-water mark; the ratchet baseline has been lowered to that count. The link
linter finds no dead relative links across 56 rendered files, and
every served diagram has a committed SVG. The October 13 route audit returns all 148 canonical pages
without HTTP or document findings. The October 10 BATCH and MILL architecture edits were rendered at desktop and 390
pixels; both pages have one page heading and no horizontal overflow. A refreshed 23-screen desktop
gallery was available for review on October 11; it has since grown to 35 desktop and phone captures.
The screenshot helper isolates browser storage for each capture and
waits for the welcome greeting to finish. The GRAIN guide's package-boundary section now reflects the
separate BATCH repository and the GRAIN monorepo that publishes GRAIN, MILL, PROOF, and CRUMB;
package-doc navigation and phone checks pass. The Builder help now reports both October 11 local-model
profiles and their measured limits, with the full comparison recorded in builder-ai-depth.md. The
visual route review covers the 146-route desktop and phone captures and the refreshed 23-screen
gallery; the two newer routes also pass focused desktop and phone checks. The October 13 source
review of the BATCH, GRAIN, MILL, and PROOF instructions found and corrected the stale PROOF init
claim described above. The remaining product work is Builder reliability. A production transfer
check closed the shared-shell delivery decision: fresh Chromium contexts
on October 11 received 136,617 JavaScript bytes on / and /notes (123,417 encoded response bytes),
and 159,108 bytes on /grain/builder (143,208 encoded response bytes), before any model download.
GitHub Pages serves the scripts with gzip. Keep the shared shell: its site-wide desk, navigation,
catalog, and interaction controls are available on every page, while page-specific modules remain
deferred. The previous local audit values were uncompressed response sizes, so its report now labels
them as local build-size checks rather than visitor transfer estimates. The catalog's GRAIN sidebar
specimen chat fields now receive an accessible name and placeholder at the portfolio composition
boundary, with a browser check covering both rendered fields. The October 10 route-specific island
pass deferred the image viewer and stylesheet, interactive figure setup, and reading progress on
pages that do not use them. The local report measures 30–268 KB of uncompressed JavaScript responses
per route; the calendar, long notes, talks, and Builder load their additional features only where
needed. Production browser captures show the ordinary page's compressed transfer and the Builder's
additional route modules; the shell decision is closed unless field measurements show a meaningful
user-facing cost.

The October 12 documentation follow-up found that the MILL introduction still called it a CMS even
though its package plan had retired that label, and that the GRAIN quick-start described every click
as a server POST despite GRAIN's static client door. Both descriptions now match the package
contracts, with browser assertions. The BATCH route guide's shell command also pointed at a
portfolio-named directory instead of the default `pages/` root; its example now works from the
repository root and is checked in the docs browser suite. The full guide-by-guide review remains
open. The next architecture review found that BATCH's `bun run export` wording attributed the
portfolio-owned command to the package. The guide now distinguishes BATCH's `exportSite()` library
from the host's command, with a browser assertion for both sides of that boundary. The PROOF setup
guide also called `chrome` the only host input even though `plansDir` is required; it now separates
the presentation seam from the data directory, with browser coverage for the distinction. The
baseline ratchet also recorded 79 fewer flags than its previous high-water mark, without increasing
any category.

The follow-up BATCH route-guide review checked `makePageServer` and `createSitemap` in the package
against the portfolio's `pageRoutes()` exporter. The guide had implied every page was exported
without exceptions. It now names the review-only and operable exclusions, the generated routes that
need explicit entries, and the separate sitemap/export entries required for routes outside the page
tree. Its phone-safe docs browser test verifies those boundaries. The remaining BATCH guides and the
GRAIN, MILL, and PROOF guides still need their full source-by-source review. The same comparison
found that the BATCH introduction implied the package generated robots.txt; its API exposes the
route list and sitemap XML, while the host writes robots.txt. The introduction and architecture
guide now state that boundary, and the browser suite checks the visible setup copy. The export guide
also understated the route sources and described assets as verbatim despite base-path rewriting;
it now names the portfolio's content, deck, plan, and generated route sets and explains CSS and
JavaScript rewriting for subpath deploys. The older architecture summary now also distinguishes
rewritten CSS and JavaScript from byte-for-byte binary copies. The docs browser suite checks these
statements.

The GRAIN component guide still named the package's pre-workspace `grain/components` path and mixed
the GRAIN monorepo's package checks with the portfolio's local preview server. It now names
`packages/grain/components`, gives the package-scoped check and test commands, and explains that the
portfolio catalog displays the package version its own config resolves. The documented workspace
commands passed, and the docs browser test covers the path and preview boundary.

The GRAIN tutorial's copied contract excerpt had fallen behind the package registry: it omitted the
`check` and `block` surface kinds plus the `check.set` and three block-edit verbs. The excerpt now
matches the current closed unions, and the docs browser suite checks those entries against the
rendered guide.

The GRAIN action guide still opened with `task:42` and `task-list`, even though `task` is not a
registered surface kind. Its examples now use addresses present in the portfolio, and label the
console as push-only. The docs browser test checks the examples and confirms their code block fits at
390 pixels.

### Page recommendations in progress

The October 12 cold Builder run used a new Chromium profile and received all 30 weight shards without
cached responses. Chromium reported 875,219,838 encoded transfer bytes for the larger model's weights,
tokenizer, configuration, index, and WebGPU library, plus 1,661,197 bytes for WebLLM's JavaScript runtime.
The public download notice now rounds the model assets to 875 MB, replacing the earlier 1.1 GB
estimate. The draft was visible by the 60.1-second observation and retained the requested facts, but
added unsupported claims about artisanal bread and a staple product. This closes the desktop download
measurement, while phone hardware and grounded writing remain open. The capture method and result
are recorded in audit/builder-cold-2026-10-12.md.

The MILL source review also found inconsistent rendering and dependency descriptions. Its project
card, setup guide, and architecture guide now distinguish GRAIN's package dependency from BATCH's
optional host composition. The architecture explains semantic HTML output, includes the implemented
link-attribute and heading-surface options, and no longer calls addressable headings wholly planned.

The October 12 operable-surface checklist review found an incomplete action definition: its example
omitted the required description, payload schema, and behavior hints. The example now includes all
three and explains how the manifest uses them. Its verification checklist also distinguishes the
server POST/SSE path from the client door used by the default portfolio development command and
static export, including the limit on server-dependent capabilities.

This pass passed 83 focused browser cases across documentation, Builder, and project presentation,
four model-profile unit tests, typechecking, and link lint. The lint gate reports 4,477 flags against
its 4,491 baseline. Desktop and phone screenshots were reviewed for the updated MILL introduction
and operable-surface guide, alongside the Builder download disclosure.

The audit covers all 148 public routes and their shared page families at desktop and phone widths.
The table records each page's recommendation and its current state. Page presentation and evidence
paths have been reviewed, but some production and adoption claims remain owner-reported because the
underlying records are private or unavailable. Builder reliability and stronger privacy-safe outcome
proof remain open below.

### Page recommendations and current state

| Page or family | Recommendation | State |
| --- | --- | --- |
| / | Make selected work the primary next step and keep the résumé, notes, and other destinations as secondary paths. The six equal “Start” links competed for attention. | Implemented: the projects link is now the first-screen button, and the secondary list no longer repeats it. The October 10 settled screenshot caught the flagship walkthrough title collapsing into one word per line beside its badge; title and badge now wrap as separate flex items, and a browser check keeps the title on one line at the desktop screenshot width. |
| /about | Put one inspectable proof link beside each leadership claim, especially team delivery, teaching scale, and shipped systems. | Implemented: manager, technical lead, and educator sections now link directly to a talk, the BREAD architecture, and the public classroom project. |
| /resume | Keep the page aligned with the supplied résumé PDF and recheck the generated PDF at print size after any content change. | Implemented: the print sheet now uses the source's letter size, navy hierarchy, inline role headings, and first-page role grouping. The rendered export matches the two-page structure, and a browser check guards the print styles. The phone screenshot pass also caught the fourth profile action clipped inside the card despite the page reporting no horizontal overflow; the four actions now form a two-column grid at phone widths, with an e2e check that confirms every action stays inside the viewport. |
| /projects | Keep the current product, platform, and teaching groups. Pair each project with a clear result and evidence whose limits are labeled. | Presentation implemented and source paths checked. Greenroom's run report is seeded, the classroom demo is synthetic, the BREAD proof is a real portfolio request trace, GRAIN has a live shared-control demo/action contract, and PANTRY links its install path and composition guide. The stronger production/adoption outcomes for Greenroom, the stack, and the private classroom operation remain owner-reported or private; see the October 13 outcome-and-proof review above. Responsive group layout and links are covered by e2e/projects-layout.e2e.ts. |
| /bread | Add one end-to-end example that shows a visitor how the layers work together in a real request, alongside the layer diagram. | Implemented: the page follows a public note from its request through MILL and GRAIN composition to the returned HTML, and explains that PROOF and CRUMB serve other paths. |
| /batch | Put the measured performance and audit result, plus how to reproduce it, near the no-build claim. | Implemented: the page reports the October 9 portfolio-wide /batch measurement (211,553 bytes of JavaScript, 745,209 total bytes, 35 requests), links to the current 148-route report, and gives the rerun command. Deferring live-figure code from pages that do not use it cut 56,053 JavaScript bytes from the October 2 measurement. The copy distinguishes shared-shell JavaScript from a BATCH-only benchmark. |
| /grain | Keep the shared-control and visible-provenance demonstration prominent, then give the visitor a single guided action to try it. | Implemented: the first hero action now jumps directly to the two-operator demo; a browser check confirms the destination and working AI action. The static page links its manifest explanation to the published AI interface guide instead of the server-only /ai/manifest endpoint. The RenderOp introduction distinguishes HTML-bearing operations, typed dispatcher operations, and the service-free limits of the static client door. The tutorial and showcase now distinguish the client door used on the deployed static export from the server door available through *bun run dev:stub*. Source checks corrected the design-system guide's meaningful-text and link-color rules, and the re-skin guide now names the accent slots used by links, focus rings, and primary controls. Browser assertions guard these public contracts. The deeper component implementation remains deferred. |
| /mill | Tie the content-engine explanation to one note or documentation page rendered by the live site. | Implemented: the project links include a direct rendered-note example, covered by the landing-page browser check. |
| /proof and /plans | Explain the relationship between markdown plans and the board with one current, completed portfolio example; keep the manual-refresh limitation explicit until live updates ship. | Implemented: the PROOF page links the completed site-builder markdown to its board detail, states the manual-refresh limit, and has a browser check for both links and the rendered status. |
| /crumb | Lead with the live portfolio tour so visitors can experience the layer before reading its file format. | Implemented: the first project link starts the guided tour on the live portfolio, covered by a browser check. |
| /pantry | Show a short install-to-first-use example beside the “installation verified” claim; the current explanation is accurate but text-heavy. | Implemented: the page shows the documented install, kit scaffold, validation, and serve commands, then explains that the board reads the host project's plans in place. The content review caught that the page described the agent-instructions kit but showed plain `pantry init`, which does not install that kit; it now shows `pantry init --kit`, matching the public quickstart. The long install command now wraps inside a responsive two-column desktop layout that stacks on phones. Browser checks guard the kit flag and ensure the first-run steps fit both widths. The PANTRY guides also include the current decisions, run, artifact, and timeline surfaces, identify which routes are not covered by surface toggles, and state the local answer-write path. |
| /greenroom | Offer a playable sample run or report beside the screenshot so a visitor can inspect the handover, not only read about it. | Implemented: the page summarizes and links to Greenroom's archived seeded report, distinguishing its four practice-environment results from the separate ten-check screenshot and calling out the intentional failures. The phone layout and route links are covered by e2e/projects-layout.e2e.ts. |
| /native-github-classroom and its docs | Link the project story, architecture, and public demo as one path, while continuing to protect private student and grading data. | Implemented: the first links now move from the architecture diagram to the working demo, safety docs, and public source. The copy keeps course internals and student records private; browser checks cover the phone navigation and confirm the docs route resolves. |
| /grain/builder | Keep the limits explicit and improve the live model's ability to build and revise a page before calling the builder a finished AI demonstration. | The bounded visitor flow is guarded: the model chooses registered blocks and order; code grounds visible copy in the brief, filters unrequested structure, and holds every draft for review. The expanded WebGPU matrix passed 10 of 10 reviewed drafts across five brief shapes, and 12 of 12 raw responses matched the closed schema. Repeated edit audits cover supported changes, corrections, approval, and refusal. Follow-up tests found that a prohibited block mention could count as a positive request during reconciliation, and that a welcome sentence could absorb copy meant for a later callout. Code now filters prohibited block types, distinguishes quoted copy, preserves a later positive request, and bounds copy extraction at the next named block. A seven-case live regression matrix passed, including a prohibited-card brief with separate intro and callout requirements. The [composition capture](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-composition-visitor-flow-matrix-2026-10-14.json), [edit repeats](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-edit-repeats-2026-10-14.json), and [composition regression](../audit/builder-composition-regression-2026-10-14.json) preserve raw and reviewed outcomes. Raw model reliability and behavior outside measured prompts remain unproven; the review disclosure keeps those limits visible. Responsive checks meet device acceptance, with physical-phone performance outside this goal. |
| /grain/builder/preview | Give an empty direct visit a one-click route into the workbench and an example composition; keep the static-host limitations clear. | Implemented: the empty state now opens the workbench with a representative page composed; the static-host limitation remains explicit. |
| /teaching | Add an anonymized sample activity or rubric so the course and assessment claims have inspectable teaching evidence. | Implemented: an explicitly illustrative responsive-web assessment slice maps observable repository evidence to the published badge criteria without exposing student work or private assignments. |
| /badges and badge routes | Keep the issuer and criteria prominent, and group the long list by course, term, and award type so a visitor can find one credential quickly. Individual certificates share one route template and need template-level review. | The hub explains the activity threshold and historical reconciliation accurately. Subjects open as native accordions with a short course description, then show one card per class section with direct prelim and midterm criteria links and recipient counts. The October 14 visual pass gives the subject summaries more breathing room, aligns the expand control, and separates the section cards from their credential links; all 14 displayed recipient totals match the class source records. The existing browser check passes, and desktop plus 390px screenshots confirm the hierarchy and no horizontal overflow. Class pages link back to all badge criteria. The shared certificate template has been reviewed at phone width: share-link copying reports success, falls back when clipboard access is unavailable, and exposes a manual link if copying still fails. Browser checks confirm the subject accordions, all 14 class links, phone-width fit, recipient certificates staying out of the sitemap, and class pages not enumerating recipients. |
| /talks and talk decks | Keep the live-deck format, verify each index fact against its deck, and link each talk to its related note or a recording where one exists. The slide-count mismatch is fixed. | Implemented for the current three talks: the browser check matches every index count to its deck. The two finished talks link to their notes from both the index and closing slide; the reviewer talk links directly to its scoring method while the companion note is still in progress. |
| /talks/every-time-it-was-wrong | Link the measured reviewer result to the note or public method that explains how comments were graded. | Implemented: the talk index links to slide 13, “How it scores,” and a browser check confirms the direct link opens that slide. |
| /talks/build-the-floor | Keep the corrected 33-slide count and link the roadmap to the corresponding note. | Implemented: the index count matches the 33-slide deck, and the closing slide now links to the written roadmap. |
| /talks/ten-times-zero | Keep the live figures and connect the talk to its written playbook so visitors can take the method away. | Implemented: the index and closing slide link to the note and playbook; the deck count remains checked against the index. |
| /notes | Build a few guided reading paths into projects, teaching, and talks; reduce the amount of filter UI competing with the first article on a phone. | Implemented: the pinned essay stays first, followed by direct paths to the stack, teaching, and talks. Topic filters collapse on phones; tag links and the desk still open them when needed. |
| /notes/build-the-floor | Keep its deck attachment in sync with the actual 33-slide talk and link the roadmap's stages to inspectable examples. | The note now links its first building blocks to Kickstart and the standards, and its small measured Builder example to the current five-case audit. It states that the 2/5 score is not a team outcome log and that scored team-wide outcomes and unattended loops are not demonstrated here. A browser check verifies the links and limitation copy; the linked 33-slide deck count remains covered by the talk checks. |
| /notes/feels-like-an-app | Add a direct route to the stack diagram or project page that demonstrates the full-page-load architecture described in the note. | Implemented: the note links to the BREAD stack diagram beside its three-layer request explanation, and the browser note explains the measured architecture trade-offs. |
| /notes/how-i-turned-github-into-a-classroom | Link the account to the public classroom project and architecture page as the inspectable version of the story. | Implemented: the note links to the portfolio project page, which connects its story, architecture map, public demo, and safety docs. |
| /notes/one-loop-every-repo | Link the workflow claims to the public plans or documentation that shows how the loop is enforced. | Implemented: the note links to both PROOF and Plans where the workflow and its markdown state are inspectable. |
| /notes/origin-story | Use this as a guided starting point into the stack and project pages, rather than leaving the origin story as a self-contained essay. | Implemented: the BATCH, GRAIN, and MILL introductions now link directly to their project pages from their first explanations. |
| /notes/ten-times-zero | Bring the snapshot date from the essay's measured 503-commit claim into the pinned excerpt, so a dated historical result does not read as a current guarantee. | Implemented in the pinned excerpt. |
| /notes/the-browser-grew-up | Put the benchmark method and the compared page implementations one click from the result in the summary. | Implemented: the benchmark section links to the public measurements and the harness repository beside its result. |
| /notes/the-check-that-never-ran | Link the diagnosis to the corrected workflow or a public follow-up so the failure story ends with evidence of the fix. | Implemented: the fix section links to the Pantry CLI source that resolves the tool from any working directory. |
| /notes/the-console-i-built-to-stop-drowning | Keep the teaching-console story connected to the classroom and teaching pages, while avoiding details that could expose student data. | Implemented: the demo section links to the public classroom project and teaching authority page; it continues to describe only synthetic demo data. |
| /notes/watch-its-hands | Connect the plain-language interaction argument to the GRAIN demonstration and clearly label the parts still unproven. | Implemented: the note links to GRAIN's shared-control demo and retains its explicit distinction between demonstrated architecture and untested human-benefit hypotheses. |
| /notes/whitepaper-one-vocabulary | Keep the working-draft status visible and offer the short GRAIN explanation before the research-length paper. | Implemented: the opening labels the working draft and links to the plain-language companion before the paper's abstract. |
| /notes/why-i-teach | Connect the teaching motivation to the course platform and badge criteria so readers can verify what changed in practice. | Implemented: the note links to the teaching page for the current courses and the badge hub for criteria and verification. |
| /calendar | Keep the year strip and feed as complementary ways through the history; review the event and note empty states against the live data on both phone and desktop. | Implemented: the year strip, month navigation, feed filters, and no-JavaScript fallback have focused coverage; the phone range heading now stacks cleanly above its feed link. |
| /calendar/{event} (seven event pages) | Keep the event pages connected to the feed, and make the next link point to a related talk, course, or note where one exists. | Implemented: each event page links back to the Calendar feed; all seven now lead to related teaching, note, talk, or presentation evidence where it exists. The phone-width check covers every route. The social-copy control reports success when copied and tells readers the text remains selectable if clipboard access is unavailable; browser checks cover both states. The Version One workshop links to its 47-slide presentation and passes a focused desktop and phone layout check. |
| /tour and tour routes | Review the entry tour as the visitor's guided route through the portfolio; label the remaining tours as implementation reviews so they do not read like public showcases. | Implemented: the desk button starts the portfolio walkthrough; the separate Say Hello demo stages an unsent draft; every other tour is a dev-mode implementation review reached by a direct review link. The CRUMB page explains those paths, and tests guard the tour inventory and visitor launch. |
| /404 | Keep the recovery links, and check that each suggested destination still exists and matches its description. | Implemented: an unknown route retains status 404, the recovery links all return 200, and the page fits at phone width. |
| /docs, /reference, and /catalog | Preserve these as working references, and provide a direct route back to the project story for visitors who land in documentation first. The catalog's mobile overflow, escaping specimen, unnamed console control, and missing search description are fixed. | The docs index now stacks its long descriptions at phone widths. The generated reference contains wide tables inside their own scroll regions and links back to BREAD and GRAIN; a phone-only hint explains how to reach columns beyond the viewport. The catalog links to the GRAIN introduction and has one page heading; specimen titles remain visually styled but are no longer heading elements. Long source examples scroll inside their code panels while the page stays within the phone viewport. Browser checks cover the heading structure, phone width, named console control and chat fields, description, and the portfolio audit's one-heading criterion. Both accessible names stay at the portfolio composition boundary; GRAIN's internal specimen source remains deferred with the deeper design-system review. |
| /batch/docs/*, /grain/docs/*, /mill/docs/*, /crumb/docs/*, /proof/docs/*, and /pantry/docs/* | Review each documentation set's landing path, project context, and links back to its owning introduction. These routes share documentation templates, but their instructions need their own content check. | The route pass confirms each documentation set has one page heading and a return link to its owning introduction. Wide tables, code blocks, and long inline paths stay inside the phone content pane; focused checks cover BATCH architecture and GRAIN component docs. The BATCH and GRAIN setup pages use current package boundaries, and the package guide records PROOF's pinned GitHub dependency. The CRUMB setup and tour-writing pages match the pinned 0.1.10 package: a tour can stage text through a registered field without replacing text the visitor has started typing. The running documentation and the serialized say-hello tour were checked. The PANTRY guides match the published surface toggles and routes, with browser checks for the route inventory. The October 10 content pass compared package manifests and current GRAIN sources with the design-system and action-contract guides, correcting the muted-text token, font-loading instructions, and registered block actions and operation kinds. The October 12 pass checked BATCH and GRAIN JavaScript and interaction-boundary claims against current package code. It clarified GRAIN's browser client door on opted-in static pages, its small vanilla-JavaScript feature modules, and the configured server or client door used by `data-action`, and it listed the complete RenderOp set. It also removed a tutorial reference to a nonexistent TODO. MILL's three guides were checked against the current plan and package source; its getting-started page now describes a content rendering engine rather than a CMS. The October 13 pass checked the remaining setup, operator, and interaction instructions against BATCH 0.2.1, GRAIN 0.1.23, MILL 0.4.0, and PROOF 0.1.4. It corrected the PROOF init description to match the package's files-only scaffold and manual host wiring step. The docs browser suite guards these claims, and its phone-width checks and link lint pass. The package documentation renderer still has two distinct sources: the portfolio serves its layer guides from `docs/<layer>/`, while `packageDocsSource` reads Markdown the package exports, such as `PLAN.md`. |
| /standards and its 20 standard pages | Keep standards discoverable as evidence of engineering practice, and give each page clear ownership, current status, and a route back to the portfolio. | The index identifies these as the maintainer's current standards for adopting repositories, and every detail page states its maintainer and current status beside its index link. The 20-route phone-width pass checks the heading, ownership, status, return link, response, and content-pane fit. |
| /plans/plan/* (29 plan pages) | Separate public evidence of shipped work from internal or stale backlog detail; link the completed portfolio plan to its finished pages and evidence. | All 29 detail pages have a working board return link and one heading. Long paths and dependencies stay inside the phone pane. Plan cross-links now point to rendered plan pages or public GitHub source, and the malformed /plans/plan return target points to /plans. The export verifier and browser checks cover these routes and their local links. The board labels itself as a mix of ideas and active work, and links visitors to selected projects and the portfolio plan. |
| /decks/* (five PDF attachments) | Verify each PDF opens, has useful document metadata, and has a matching description on the event or talk page that links to it. | All five PDFs open through the in-shell viewer, carry descriptive viewer titles, and have page counts that match their event or talk descriptions. I rendered the first and last slide of the original four decks to check they are complete and legible. The new Version One workshop deck contains 47 slides; I reviewed all slides at thumbnail scale for student repositories and records and found none. The `/decks/version-one` viewer fits the phone viewport, the workshop page links to it, and the responsive index lists all five decks. Browser checks cover the new route, event attachment, index count, and phone layout; static export verification confirms the route and PDF are included. |
| /kickstart | Clarify what the coding agent will create and what the visitor must have ready before they hand it a project link. | The page already explains the interview, the project details and constraints to bring, the stack research, and the approval gate before writing. It links to the standards index and fits at phone width; e2e/kickstart-page.e2e.ts guards the main promise and layout. |
| /mail and contact paths | Make the real contact route and any local-only demo state clear before asking visitors to enter a message. | The opening letter says the inbox is written set dressing, and the compose action says it opens the visitor's mail app. Existing tests cover the no-JavaScript mailto route; a phone-width test now checks the explanation, compose path, and fit. The About page links to the same contact route. |

## Work

- [x] Reconcile the portfolio's purpose and the visitor journey with the owner on 2026-10-02.
- [x] Reconcile the shipped builder and credential work with the board, keeping ongoing AI and
      human-lane work visible under its actual status.
- [x] Archive the empty welcome-plan template so it no longer reads as unfinished portfolio work.
- [x] Close the completed builder v1 plan and move its remaining model-quality work into
      [builder-ai-depth.md](/plans/plan/builder-ai-depth).
- [x] Audit the entry pages and project stories together. The home page establishes my role and
      course-platform scale; Projects names my ownership of the stack and teaching platform, then
      links to the detail pages. BREAD, BATCH, GRAIN, MILL, PROOF, CRUMB, PANTRY, Greenroom, and the
      classroom page explain their purpose and design constraints, with a live use, measured result,
      public source, documentation, or interactive demo to inspect. The portfolio and projects
      pages were reviewed at desktop and phone widths; e2e/projects-layout.e2e.ts covers the key
      evidence links and responsive group layout. This pass closed the missing source paths from the
      Projects cards. The source audit also confirmed and corrected the BREAD/PANTRY distinction
      between PANTRY's four core layers and its optional CRUMB review-tour mount. Focused checks now
      guard this relationship on both introductions. Projects now links directly to the BREAD note
      request trace, GRAIN's shared-control demo and action contract, and PANTRY's composition guide
      and install story. The BREAD card distinguishes the four packages TJ built from MILL, which the
      site uses. Desktop and phone browser checks cover these links and card layout. The cross-page
      read confirms that every project's stated result leads to inspectable evidence and a clear next
      step, and the PANTRY install example jumps straight to its first-use commands.
- [x] Review the BREAD, BATCH, GRAIN, MILL, PROOF, CRUMB, and PANTRY introductions as one explanation
      of the stack. Their dependency direction, the request path through the portfolio, PANTRY's
      role as an app, and cross-links to adjacent layers are consistent; existing route and
      phone-layout checks cover their presentation. Deeper GRAIN and BATCH implementation work stays
      deferred.
- [x] Review the repeated page-footer copy and GRAIN attribution as one system. Keep the authorship
      claim honest and consistent across the portfolio and the pages visitors can export. The
      portfolio footer now uses one tested statement; exported pages retain GRAIN's generated
      framework attribution and are covered by the builder export checks.
- [x] Keep Builder generation local and the composition shape code-owned. The local model chooses
      registered block names and their order through JSON mode. Code ignores model-written copy,
      builds visible text from phrases in the visitor's brief, and leaves unsupported fields blank.
      The visitor can edit and review that copy before adding it. Repeated warm WebGPU audits cover
      six briefs, field placement, required phrases, and prohibited wording. The 1.5B and 3B trials
      still produced unsupported raw prose, so the Builder does not use it.
- [x] Review Notes, Talks, Teaching, Calendar, and Badges as evidence of engineering, communication,
      teaching, and the path between them. Notes point into projects and teaching, talks link to their
      written methods, Teaching explains its issuing authority and links to the platform, calendar,
      and criteria, Calendar entries point to related proof where available, and badge pages link
      back to their issuer and criteria. The talk counts, teaching evidence, calendar links, badge
      privacy, and responsive routes have focused browser coverage.
- [x] Complete the Builder's measured AI reliability work in [builder-ai-depth.md](/plans/plan/builder-ai-depth),
      then make it a convincing demonstration of the system the portfolio introduces. The current
      design keeps the model local and uses it to choose registered blocks and order. Code assembles
      visible copy from the brief, and review catches omissions before the visitor approves the page.
      Six briefs passed two warm 1.5B runs for required phrases, field placement, and prohibited
      wording. The held-out edit audit now covers twelve phrasings across removal, span, and move,
      with 34 reviewed outcomes across warm WebGPU runs. A new routing audit covers copy-field edits,
      insertions, field moves, possessives, terse commands, missing ordinals, and new-page briefs
      that mention definite titles and blocks. The 3B comparison did not improve the raw answers, so
      the Builder ignores model prose instead of displaying it. The bounded visitor workflow is
      measured; a 58-scenario live portfolio run passed all checks, including 35 Builder edit,
      refusal, and composition outcomes and 23 DESK and navigation outcomes. The complete raw and
      visible-result capture is [here](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/portfolio-ai-live-recheck-2026-10-14.json). This
      closes the defined workflow audit, not open-ended language understanding: raw model prose is
      unsupported and intentionally excluded from the visitor-facing page. Responsive browser checks
      satisfy device acceptance, and physical-phone performance is outside this goal. See the [two-run draft report](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-draft-six-repeat-validation-2026-10-14.json),
      [original edit paraphrases](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-edit-paraphrase-repeats-2026-10-14.json),
      [extended edit paraphrases](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-edit-extended-paraphrase-repeats-2026-10-14.json),
      [delete, nudge, and width holdouts](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-edit-holdout-recovery-2026-10-14.json),
      [the target-guard baseline](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-edit-secondary-holdout-baseline-2026-10-14.json),
      [the six-run guard recheck](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-edit-secondary-holdout-repeats-2026-10-14.json), and
      [erase and reposition baseline](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-edit-third-holdout-baseline-2026-10-14.json),
      [erase and reposition recheck](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-edit-fourth-holdout-repeats-2026-10-14.json), and
      [3B comparison](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-draft-qwen25-3b-parser-full-2026-10-14.json), and the [expanded composition matrix](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-composition-visitor-flow-matrix-2026-10-14.json).
- [x] Keep every /plans status column readable at desktop and phone widths. The narrow desktop
      keeps horizontal scrolling inside the board and brings the blocked column fully into view;
      phone layouts stack the columns and wrap long path chips. e2e/plans-layout.e2e.ts covers both.
- [x] Finish the route-by-route visual and interaction review at desktop and narrow widths. Check
      navigation, page spacing, headings, accessible names, dead ends, and important interaction
      paths. On October 13, all 148 canonical routes were captured at desktop and phone widths in
      fresh browser contexts. The desktop pass also captured full-page views. Every route returned
      200, had a title and one page heading, and fit within the viewport; the screenshot review found
      no new layout issues. The PDF routes show the direct-open fallback in headless Chromium. The
      existing gallery retains its 36 selected captures, including phone first-screen views for seven
      key routes. Focused phone checks cover the Builder, project stories, documentation, résumé,
      plans, catalog, and navigation. The serial full release run passed all 421 browser cases.
      The October 13 hosted CI run on commit d2df50a passed all 425 browser cases in 4.0 minutes,
      alongside typecheck, 712 unit tests, and the lint baseline. Link lint found no dead relative links in 56
      rendered files. The local performance report
      measures 30–268 KB of uncompressed
      JavaScript responses per route; production captures measured 136,617 JavaScript bytes on
      ordinary pages and 159,108 bytes on the Builder before model download. The shared shell stays
      available across routes, while page-specific features load only where needed. The local report
      labels its values as build-size checks rather than production transfer sizes.
- [x] Commit the finished portfolio on main, deploy it, and verify the published pages after the
      remaining Builder reliability work is complete. The October 13 project-story increment
      `d2df50a` is on main and deployed: hosted CI passed all 425 browser cases, typecheck, 712 unit
      tests, and the lint baseline; the Pages build and deploy passed; and the live Projects and
      PANTRY pages include the direct evidence paths. The October 13 Builder and Badges increment
      `8fcdbc5` is also on main and deployed. Hosted CI passed all 432 browser cases, typecheck, 724
      unit tests, and the lint baseline. The Pages build and deploy succeeded, and a browser check of
      the published Builder and Badges pages confirmed the updated review disclosure, subject
      descriptions, section cards, and phone-width fit. The full finish-line release remains open
      because the Builder still needs broader brief and device reliability evidence and a cold-start
      measurement on an actual phone. Stronger privacy-safe outcome proof for several project claims
      is still unavailable. The October 13 outcome-and-proof review records which project artifacts are
      reproducible and which production/adoption claims remain owner-reported or private. The
      October 14 negative-anchor fix passes 726 unit tests, all 73 Builder browser cases, link lint,
      and the lint baseline. Commit `1b8b5a1` is on main and deployed. Hosted CI passed all 432 browser
      cases, 726 unit tests, typecheck, and the lint baseline. The Pages build and deploy passed, and
      the published Builder route and its bundled code were checked after deployment. The guard's
      targeted phrase-and-year case passed one live WebGPU run. This closes that specific regression;
      broader writing reliability and a cold-start measurement on actual phone hardware remain open.
      A follow-up audit added the common instructions “avoid,” “exclude,” and “leave out,” plus a
      positive phrase after the prohibited wording. The unit and live WebGPU checks pass; this follow-
      up was released in commit `76e0c9d`. Hosted CI passed all 431 browser cases, 727 unit tests,
      typecheck, and the lint baseline. The Pages build and deployment passed, and the published
      Builder module contains the new instruction forms. Both live negative-instruction checks
      passed. These targeted checks do not establish broad writing reliability or general negation
      understanding; the actual-phone cold start remains open. Documentation commit `e780d66` records
      this release; its CI and Pages deployment passed, including 432 browser cases and 727 unit
      tests. A third live WebGPU brief combines three prohibited details with a required positive
      intro phrase; the guarded result passed. The actual-phone and broader raw-writing gaps remain
      open. Follow-up commit `ee8c36d` keeps sentence-initial “exclude,” “leave out,” and “without”
      out of the positive-anchor set. Its hosted CI passed all 432 browser cases, 728 unit tests,
      typecheck, and the lint baseline; Pages deployment passed. The live Builder module was checked
      after deployment, and its third negative-instruction brief passed. The wider Builder reliability
      and actual-phone gaps remain open. A further audit found that copy grounding could reuse a
      forbidden source phrase even after anchor filtering. The grounding step now applies the same
      negative-clause filter and stops a candidate span before a later prohibition. A regression
      confirms that “Hearth Bakery” survives when a raw copy span continues across the sentence
      boundary into “Do not use the phrase ‘award-winning bakery.’” A separate check preserves a
      positive phrase after “and include.” Two live WebGPU rechecks rejected raw “organic” suggestions
      and retained the requested intro; a third recheck after the span fix also passed. Commit `af142b7` is published on `main`; production serves the sentence composer and revised
      review disclosure. Local verification passed, as did hosted typecheck, unit tests, lint count,
      and the Pages build and deployment. Hosted end-to-end passed all 432 browser cases on commit
      `f170865`. Broad raw-writing reliability and the physical-phone cold start remain open.
      A follow-up then addressed a visible copy-quality defect: some safe drafts were rendered as
      phrase lists. In six warm WebGPU scenarios, source reconciliation retained the requested facts;
      a separate exact-phrase check confirmed a complete intro sentence and excluded the forbidden
      claims. Explicit intro descriptions, exact intro phrases, and welcome requests now form short
      sentences from the supplied details. Local verification passed 736 unit tests, 74 Builder
      browser cases, typecheck, link lint, and the lint baseline. The review now distinguishes
      verbatim wording from a sentence composed from details in the brief and retains its warning
      that the checks cannot verify claims. The work is documented in
      [the Builder sentence audit](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-grounded-sentence-followup-2026-10-14.md) and
      was released in commit `af142b7`. Production serves the new sentence composer and revised review
      disclosure. Pages build and deployment passed; hosted end-to-end passed all 432 browser cases on
      commit `f170865`. Raw model output still invents claims or misplaces wording,
      and the cold start on an actual phone remains unmeasured.
      A six-scenario source-quote prompt trial still produced unsupported raw details; all guarded
      drafts passed after reconciliation. The trial did not establish a raw-writing improvement, so
      the temporary prompt rule was removed. See the
      [prompt experiment record](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-source-quote-prompt-2026-10-14.md).
      A separate six-brief zero-temperature run still produced unsupported details and proposed a
      prohibited “organic” claim in the raw answer. Reconciliation removed it from the reviewed
      draft; temperature 0.2 was restored. See the
      [temperature experiment record](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-zero-temperature-experiment-2026-10-14.md).
      The evidence update is on `main` as `69f5bf3`. Hosted CI passed typecheck, 736 unit tests, the
      lint baseline, and all 432 browser cases. The Pages build and deployment succeeded, and the
      published Builder and plan routes both return HTTP 200. These release checks do not close the
      raw-writing or physical-phone gaps.
      The next hosted run on `0f5b7e4` reported one flaky first attempt: the scripted Builder test
      submitted an edit before its fake model had initialized and received the page's honest
      offline response. The test helper now waits for that model before sending model-backed edits.
      The refusal case passed three local repetitions, and all 73 Builder-canvas cases passed
      locally. Hosted CI on `8d39c1a` passed all 432 browser cases with no retry, 736 unit tests,
      typecheck, and the lint baseline. The Pages deployment succeeded. This stabilizes the test
      evidence; raw-writing reliability and the physical-phone cold start remain open. A fresh full
      36-scenario local WebGPU run then passed 32/36 overall, with all 13 Builder edits, refusals,
      and drafts passing. Four failures belonged to other desk scenarios. The raw Builder answers
      still added unsupported claims or blocks in five of six drafts; source reconciliation removed
      them before review. A stricter live grader now requires the complete mixed-prohibition intro
      sentence in its named field; three warm repeats passed 3/3 with the same visitor-facing result.
      The raw model still suggested unsupported phrases, which source reconciliation removed. These
      results strengthen evidence for this guarded Builder path without proving broad raw model
      quality. The physical-phone cold-start measurement remains open. See the
      [full Builder audit](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-full-webgpu-2026-10-14.json) and the
      [three sentence rechecks](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-mixed-complete-sentence-repeats-2026-10-14.json).
      The authorized local Qwen2.5-3B comparison also passed the six guarded drafts, but its raw
      answers still included unsupported copy or malformed block names and warm responses took 17 to
      76 seconds. The 1.5B profile remains shipped; this model-size comparison is closed without a
      promotion. Its reports are [here](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-draft-qwen25-3b-parser-full-2026-10-14.json)
      and [here](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-draft-qwen25-3b-2026-10-14.json). Raw model writing remains unreliable, but the Builder discards that prose and builds visible copy from the visitor's brief. The open Builder checks are broader natural-language coverage and a physical-phone cold start.
      A fresh two-run audit of the six 1.5B Builder briefs passed all 12 visitor-facing drafts,
      including field placement, required phrases, and prohibited wording. Raw answers continued to
      invent service history, staff experience, sourcing, opening claims, and unrequested blocks;
      source reconciliation removed or corrected them before review. This confirms repeatability
      of the guarded desktop experience, not reliability of the model's raw writing. See the
      [two-run report](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-draft-six-repeat-validation-2026-10-14.json).
      A 320px browser recheck found and fixed a wrapped `Build it` label and a long reliability note
      that pushed the workbench below the first screen. The short local-model and download note stays
      visible; detailed evidence is now collapsed with a link to the Builder plan. The focused
      browser regression passed, and the updated screenshot shows the workbench and example above
      the fold with no horizontal overflow. The cold-start evidence still needs an actual phone.

## Builder paraphrase check, October 14

I added guarded recovery for “get rid of the final card” and “let the callout span the whole row.”
Three independent warm WebGPU runs passed both outcomes in the reviewed flow. In all six cases,
Qwen2.5-1.5B returned no usable action; the Builder disclosed its request-based proposal and waited
for approval. The 38 focused reasoner tests, all 740 project unit tests, and all 75 Builder browser
cases passed, including the approval flow at a 390px viewport. Typecheck, link lint, and the lint
ratchet passed at the existing baseline. The [combined live capture](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-edit-paraphrase-repeats-2026-10-14.json)
records model output beside each resulting canvas. This closes only these two tested phrasings;
broader paraphrase reliability and the cold start on physical phone hardware remain open. The
model's generated prose is still not used for visible copy, so these results make no claim that it
can write reliable page copy. A fresh device check found no attached Android handset, no phone or
tablet in the USB inventory, and no available `simctl` for an iOS simulator.

I extended the recovery check with three more phrasings: “take out the callout,” “let the callout fill
the whole row,” and “shift the callout up.” Three separate warm WebGPU runs passed all nine reviewed
outcomes. The model supplied no usable action for all six removal and width requests; it handled the
move itself in two of three runs. The [new capture](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-edit-extended-paraphrase-repeats-2026-10-14.json)
records the raw answers. The 40 reasoner tests, 742 project unit tests, and 75 Builder browser cases
passed, as did typecheck, link lint, and the lint ratchet. Broader natural-language reliability and
the physical-phone cold start remain open.

The next held-out requests were “discard the final card,” “nudge the callout down one step,” and
“stretch the callout to full width.” Across three warm WebGPU repeats, Qwen2.5-1.5B declined the
first two each time; the guarded recovery proposed the explicit edit and waited for approval. The
model handled the width request directly. Negative and ambiguous requests stayed refused, and the
canvas remained unchanged before approval. The [raw answers and resulting canvases](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-edit-holdout-recovery-2026-10-14.json)
record the distinction between model output and the reviewed visitor flow. The reasoner tests passed
42 cases, the full unit suite passed 744, and all 76 Builder browser cases passed. Typecheck, link
lint, and the lint gate passed. The change is on `main` as `c69fc17`, and Pages deployed it; hosted
typecheck, unit tests, and lint checks passed. Hosted end-to-end passed all 435 browser cases.
Natural-language coverage beyond these measured phrasings and an actual-phone cold-start check
remain open.

The next holdout checked “delete the intro” and “shrink the callout to a third width.” Across three
warm WebGPU runs, the model declined deletion each time and handled the third-width request directly
each time. The first width trial uncovered a target-guard bug: “third” was treated as the ordinal of
the callout, so a valid model proposal was rejected. The resolver now treats ordinals as block
references only when they qualify a block name, and recognizes “shrink” and “reduce” for explicit
width values. The [six-run capture](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-edit-secondary-holdout-repeats-2026-10-14.json)
records raw answers and resulting canvases. The regression test checks that both proposed edits wait
for approval and then reach the intended block at a 390px viewport. Local verification passed 43
reasoner tests, 745 unit tests, and all 77 Builder browser cases; typecheck, link lint, and the lint
gate also passed. Commit `30656f1` then passed hosted typecheck, unit tests, lint checks, and all 435
browser cases. Its Pages deployment succeeded, and the published finish-line plan and Builder routes
return HTTP 200. A production browser smoke at 390 by 844 showed the Builder heading, composer, and
canvas, with a 390-pixel document width and no page errors. The [baseline failure](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-edit-secondary-holdout-baseline-2026-10-14.json)
and [six-run recheck](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-edit-secondary-holdout-repeats-2026-10-14.json)
preserve the failed target check and the corrected model outcomes.

## Current release and visual review, October 14

The latest functional Builder changes are on main at [47d1f55](https://github.com/tjakoen/tjakoen.github.io/commit/47d1f55).
Hosted CI passed typecheck, all 818 unit tests, the lint count, and all 438 browser cases. The [Pages
build and deployment](https://github.com/tjakoen/tjakoen.github.io/actions/runs/38512992168) succeeded.
The published Builder and Plans routes return HTTP 200. Locally, all 79 Builder browser cases passed,
and link lint found no dead relative links in 56 rendered files. A prompt audit closed copy-field
routing holes across possessive, block-first, insertion, movement, and terse phrasing, while
preserving new-page briefs that mention a title before their blocks. The paired browser test confirms
that copy edits do not call the model or change the canvas. A local Qwen3-1.7B comparison passed five
guarded Builder scenarios, but one relative deletion had the wrong raw target and succeeded only
after the Builder's correction path; action responses took about 19 to 54 seconds. This does not
justify replacing the shipped 1.5B profile. The screenshot gallery includes a 390 by 844 pixel Builder
capture; all 36 portfolio captures were refreshed and the phone-width view was inspected. A
320-pixel browser case checks that the composer and workbench do not overflow horizontally. The
production route was inspected at 390 by 844; the heading, composer, and canvas were visible, the
document fit the viewport, and the browser logged no page errors. These are browser checks, not a
physical phone or its model cold start. This Mac has no attached handset, and its iOS simulator is unavailable.

The October 14 routing follow-up in 86bc4d9 closes direct copy-field gaps found during the local
model comparison. Requests to remove or write titles, move images, or resize text route to the
current page's edit guard. New-page briefs that mention a title, menu, or callout remain compositions.
The full unit suite passed 824 tests, all 79 Builder browser cases passed, and hosted CI passed all
438 browser cases, typecheck, unit tests, and the lint baseline. Pages built and deployed
successfully, and the Builder and Plans routes returned HTTP 200. Qwen3 remains a local comparison;
the shipped model profile is unchanged. Physical-phone cold-start testing and broad language coverage
remain open, so the finish-line goal stays in progress.

## More bounded edit phrasings, October 14

The recovery grammar missed “eliminate,” “clear out,” and “take away” for removal, “expand” and
“narrow” for explicit widths, and “push” and “slide” for one-step moves. It now recognizes those
words only when the request names one live block and one supported operation. Negative requests,
ambiguous targets, and widths without an explicit supported value still do not recover into an edit.
The full unit suite passed 827 tests across 45 files, including the 48 reasoner tests. All 80 Builder
browser cases passed, and TypeScript checking passed. The browser cases verified that each recovered
edit stays unchanged until the visitor approves it. This measures guarded request recovery, not the
model's ability to understand those phrasings. A live preview attempt stayed at “Reading the
page…” and returned no model result, so it did not add live evidence. Broader language coverage
remains open. The [run report](https://github.com/tjakoen/tjakoen.github.io/blob/main/artifacts/runs/2026-10-14-builder-edit-phrasing.md)
records the test results and their limits. The cold-start measurement still requires a physical
phone.

## Negated Builder edit safety, October 14

A safety probe found that “I can't remove the callout” and “I shouldn't remove the callout” could
become deletion proposals after punctuation normalization split their contractions. A second probe
found that “Should I remove the callout?” also became a deletion proposal. Follow-up probes found the
same problem with “Would it be better to remove the callout?” and “Is it better to move the callout
up?” Later questions such as “What happens if I remove the callout?” and “How would it look if I make
the callout full width?” also became edit proposals. “Can I remove the callout?” and “Would it help
to move the callout up?” exposed permission and advice variants. Recovery now refuses common negative
modal forms and keeps advice, informational, permission, and hypothetical questions out of the edit
proposal path while
preserving polite commands. The focused reasoner suite passed 51 tests, the full unit suite passed
830 tests, and all 81 Builder browser cases passed. At 390 by 844, one browser check confirmed that
three negated requests and sixteen questions create no proposal. Another returned valid remove, width,
and move commands for six question-shaped prompts; the Builder refused every command and kept the
canvas unchanged. A follow-up probe found five uncovered forms: passive permission questions such as
“Can the callout be removed?” and recommendation questions such as “Would you recommend removing the
callout?” The proposal-boundary guard now rejects these alongside “Should the callout be removed?”
and “Would the callout look better at full width?” The reasoner suite passes all 51 cases, and the
390 by 844 browser test confirms these additional questions create no proposal even when the model
returns a valid command. This closes the identified question-form gaps, while broad natural-language
reliability remains open.
These scripted checks do not establish how the live model interprets these phrases, so broad
natural-language reliability remains open. The 390px browser review satisfies responsive layout
and visitor-flow acceptance. A physical-phone cold-start measurement is separate device-performance
evidence and can be added if that becomes a product requirement. The [run report](https://github.com/tjakoen/tjakoen.github.io/blob/main/artifacts/runs/2026-10-14-builder-negated-modal-recovery.md)
records the exact scope and evidence.

## Builder composition schema follow-up, October 14

The build path now sends a closed JSON schema to the local model. It allows only registered
block names and supported spans, and rejects generated copy fields. The repeated six-scenario
WebGPU matrix produced schema-conforming raw responses in all 12 runs, and all 12 visitor-facing
drafts passed review. In the two intro-only exclusion cases, the raw model still selected an extra
card; the reconciler removed it before review. Inspection found that the prompt example itself
included a lede and card, contradicting the intro-only briefs. Removing that example led to four
live repeats returning only a lede, with no block removed by reconciliation. The [recheck](../audit/builder-composition-example-recheck-2026-10-14.json)
records the raw outputs. The expanded visitor-flow matrix then repeated five brief shapes twice:
negative-only and mixed-prohibition intros, one card, one callout, and two titled cards with separate
phrases. All 10 reviewed drafts passed. The reconciler removed unrequested raw structures in the
single-card, callout-only, and two-card cases. A copy-targeting fix now keeps the callout phrase in
its body and routes each repeated card phrase to its own card; the captured drafts show both card
bodies correctly. The small model still adds default blocks to some raw plans, so this evidence
supports the guarded, reviewable visitor experience for these prompts, not independent model
reliability. The [expanded capture](../audit/builder-composition-visitor-flow-matrix-2026-10-14.json)
records the raw outputs and reviewed drafts. Broader language coverage remains open.
The [tracked matrix](../audit/builder-structured-composition-schema-live-2026-10-14.json),
[exclusion recheck](../audit/builder-structured-composition-exclusion-recheck-2026-10-14.json),
and [run report](../artifacts/runs/2026-10-14-builder-structured-composition-schema.md) preserve
the prompts, outputs, and gate limits. Responsive browser review remains the device criterion;
physical-phone cold-start performance is separate and is not required for this goal.

## Builder live composition follow-up, October 14

Five fresh runs on the deployed Qwen2.5-1.5B-Instruct-q4f16_1-MLC profile covered a pottery studio,
a mixed-prohibition bakery brief, two bike-shop phrasings, and a repeat bakery brief. All five
reviewed drafts passed: requested names and phrases appeared in the intended fields, explicit
prohibitions were absent, and no unrequested block remained. In the pottery case, the raw answer
added unsupported promotional language; the Builder's source-phrase review removed it before the
visitor could approve the draft. That distinction remains central: this run supports the reviewed
visitor flow for these scenarios, not reliable raw model writing or broad semantic understanding.
The five-case live report from this earlier pass is retained locally in `.cache/desk-audit` and is
not a published audit artifact. The newer tracked matrix and follow-up above preserve the current
schema-constrained evidence.

The production Builder was reviewed at 390 by 844 in a real browser. The page fit the viewport at
390 CSS pixels, showed its heading, composer, empty canvas, and block rail, and logged no browser
errors. The owner confirmed that responsive browser behavior is sufficient for device acceptance;
physical-device model cold-start performance is outside this goal. The [review tour](https://tjakoen.github.io/grain/builder?crumb=review-builder-live-evidence&crumb-mode=dev&crumb-frame)
points to the live-evidence review and the phone-width canvas. The expanded live composition matrix
passed all 10 reviewed drafts, while the smaller model still sometimes proposes extra blocks and
broader language reliability remains unproven. Stronger privacy-safe outcome proof also remains
unavailable for several project claims. The page audit records those evidence limits and keeps the
claims attributed; it does not turn private or unavailable records into a portfolio action item.

## Previous release acceptance, October 14

The previous release passed the criteria recorded at that point in this plan.
Responsive browser checks at desktop and 390-pixel widths satisfy the Builder's device acceptance.
No physical phone or cold-start measurement is required for this goal. The measured Builder workflow
meets its completion criteria: 12 raw composition responses matched the closed schema, 10 of 10
reviewed drafts passed across five shapes, supported edit and refusal scenarios were repeated against
the live model, and the review gates keep unsupported copy and structure out of the approved page.
Broad language coverage and raw-model accuracy outside these scenarios remain unproven and are not
claims the portfolio makes. Project-outcome evidence was reviewed page by page. Public artifacts are
linked, while customer use and private classroom operations remain attributed or labeled according to
their limits; no private data is exposed to strengthen those claims. Commit `9b70254` is on `main`.
Hosted CI passed typecheck, unit tests, lint-baseline validation, and the full browser suite. The
Pages build and deployment succeeded, and the Builder, Plans, and live-evidence tour routes returned
HTTP 200. The checkout was clean and tracked `origin/main` at the time of that release.

## Builder negative-block reconciliation follow-up, October 14

A code review found a gap between the composition prompt and reconciliation: the prompt told the
model that a block named in a prohibition was not a request, but reconciliation treated that same
mention as a positive block count. A model could therefore return a prohibited block and have it
survive the review draft. Reconciliation now removes prohibited block mentions from the positive
count, filters a type that remains prohibited from the model's plan, and ignores quoted copy while
classifying structural requests. If the brief later explicitly requests that same type, the positive
request takes effect. The first adversarial live brief also found that the welcome-intro parser could
absorb the next callout's requested wording and leave its body empty. Copy extraction now stops at a
new block mention, while the explicit welcome sentence and callout phrase are restored to their own
fields. The live grader now reads the actual review-panel headings, including blocks with no text
fields. Unit coverage checks direct prohibitions, a prohibition without other blocks, a later
positive override, quoted wording, Unicode before exclusions, and adjacent block copy.

The live seven-case WebGPU Builder matrix passed all seven reviewed outcomes. It covered the prior
intro, single-card, callout, two-card, mixed-prohibition, and pottery briefs plus a new brief asking
for an intro and callout while prohibiting a card. In five of the six existing briefs, the model
proposed one to three unrequested blocks; reconciliation removed them before review. The sixth model
answer matched the requested intro. On the new brief, the model returned only the intro; code restored
the requested callout with “Open daily” in its body and left the prohibited card out. The direct unit
case supplies the adversarial model answer containing a prohibited card and confirms that
reconciliation removes it. The
[tracked live capture](../audit/builder-composition-regression-2026-10-14.json) records the raw plans
and visitor-facing drafts. The full Builder browser suite passed 81 cases, the full unit suite passed,
and type checking, link lint, and diff checks passed. Responsive browser coverage remains the device
criterion; physical-phone performance is outside this goal.

This closes the identified negative-block reconciliation gap. It does not establish broad language
understanding or reliable raw model writing; those remain open and require more held-out tasks before
the Builder reliability item can be closed.

## Portfolio AI reliability closeout, October 14

The full live WebGPU scenario set passed 58/58 on the current code. It records the selected model
profile, raw answer, visible result, timing, and browser errors for 23 DESK and navigation scenarios
and 35 Builder scenarios. The latter include deletion, width, movement, explicit negative requests,
and reviewed composition with required phrases, field placement, and prohibited blocks. In several
composition cases, the model proposed extra blocks; reconciliation removed them before review. In
the relative-placement case, the model returned no usable edit, so the Builder proposed the single
adjacent move stated by the visitor. The proposal remained review-only until approval.

That held-out placement check found an uncovered explicit form: “Put the callout after the second
card.” The request guard now resolves both blocks and recovers a move only when the destination is
exactly one position away; ambiguous targets and longer moves remain with the model. A live edit also
confirmed that an incorrect model target for “Set the intro to half width” is corrected to the
explicitly named intro and shown for review. “Do not remove the callout” left the canvas unchanged.
Focused reasoner tests passed 52 cases, and TypeScript checking passed. The
[full raw capture](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/portfolio-ai-live-recheck-2026-10-14.json) preserves the run.

This completes the measured portfolio-local AI workflow described in this plan. The DESK remains on
the shared 0.5B profile because the 1.5B comparison did not improve the portfolio-wide task set enough
to justify its cost. The Builder uses the 1.5B profile only behind its existing capability gate, and
continues to build visitor-facing copy from supplied phrases because the tested models invent claims
and unrequested structure. The review step exposes omissions; it does not certify truth. The audit
does not claim open-ended language understanding, raw generated-copy quality, or physical-phone
performance.


## Done means

The home page gives a clear first read. The project stories and stack pages explain the work in plain
language and lead to inspectable evidence. Notes, talks, and teaching work feel like part of the same
portfolio rather than separate shelves. The builder's AI path has measured evidence and honest limits.
Every public route in scope has been reviewed at desktop and narrow widths, the navigation has no
dead ends, and the final deployment matches the reviewed result.

## Builder alias and docs presentation follow-up, October 14

The no-model Builder path previously used a separate word matcher and could lose explicit requests
or prohibitions when another block type was named. The bounded block vocabulary now supplies the
aliases used for matching, reconciliation, and copy placement. Announcement maps to a callout, and
contact-form aliases remain explicit alongside other requested blocks. The no-model path and the
model-error fallback now pass their word-matched plan through the same reconciliation and
source-copy checks as model plans. A live Qwen2.5-1.5B run passed both announcement and contact-form
scenarios. In the announcement case, code removed three unrequested raw model blocks; in the
contact-form case, the requested name and email controls remained. A three-requirement no-model
browser case also verifies intro copy, the exact announcement phrase, two contact inputs, no card,
and honest offline status. The initial announcement attempt hit a WebLLM constrained-decoder error
before returning a response; the fallback path handled the unavailable answer, and two warm repeats
plus the combined two-case run passed. The raw reports are tracked in
[`audit/`](../audit/builder-block-alias-live-2026-10-14.json), including the initial runtime error.
The full Builder browser suite and broader held-out language coverage still determine whether the
reliability item can close.

A presentation issue reported on the CRUMB docs exposed a shared MILL-rendering gap: fenced source
blocks had language labels but no syntax tokenization. The portfolio's shared Markdown adapter now
renders common TypeScript, JavaScript, JSON, shell, YAML, Markdown, HTML, CSS, Python, SQL, and diff
fences with server-side token spans. Unknown languages and Mermaid source remain escaped text. The
syntax colors use the site's theme tokens, with weight and muted tones preserving distinctions in
the monochrome theme. A browser assertion checks the actual CRUMB TypeScript example; unit coverage
checks escaping and unsupported-language fallback. The rendered CRUMB code example was reviewed in
the browser at desktop width.

The combined Builder and documentation browser run passed 94 of 94 cases. The full portfolio run
passed 439 of 442 cases with four workers. Three timing-sensitive checks failed under that load: a
DESK capability answer had not finished streaming, a same-page spotlight had not finished scrolling,
and the plan-detail route hit the server's ten-second request timeout. All three passed when rerun
serially on a fresh test server. The Builder and CRUMB cases passed in both runs. This local result
records the parallel-load limit. Hosted CI passed all 442 browser cases in 5.6 minutes, along with
type checking, unit tests, and the lint-baseline check. The Pages build, export verification, and
deployment also passed for commit `cbfba34`.
