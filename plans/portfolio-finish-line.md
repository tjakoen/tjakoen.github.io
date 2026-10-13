---
id: portfolio-finish-line
status: doing
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

## Current progress (2026-10-13)

The first project-index pass now gives GRAIN a direct introduction beside PANTRY instead of leaving
the design system visible only as one layer inside the BREAD story. The index names TJ's role across
the featured products, stack, design system, app and teaching platform. The related entries share a
responsive layout and link directly to their project pages. Browser checks cover their ownership
copy, links, wide-screen alignment and narrow-screen stacking. This closes those index gaps, while
the wider audit of each project's outcomes, evidence and next steps remains open. The repeated page
footer now uses one plain, human-accountable AI statement without the robot emoji or an unsupported
claim about every commit. Builder exports retain GRAIN's own generated attribution, covered by the
export checks; the two credits describe different kinds of authorship. The /plans board now keeps
all four status columns readable: narrow desktop users can scroll the final column into view, and
long path chips wrap so phone layouts do not gain sideways page overflow.

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

These recommendations come from the routes reviewed so far. The shared content families still need
individual checks before the audit can be called complete.

| Page or family | Recommendation | State |
| --- | --- | --- |
| / | Make selected work the primary next step and keep the résumé, notes, and other destinations as secondary paths. The six equal “Start” links competed for attention. | Implemented: the projects link is now the first-screen button, and the secondary list no longer repeats it. The October 10 settled screenshot caught the flagship walkthrough title collapsing into one word per line beside its badge; title and badge now wrap as separate flex items, and a browser check keeps the title on one line at the desktop screenshot width. |
| /about | Put one inspectable proof link beside each leadership claim, especially team delivery, teaching scale, and shipped systems. | Implemented: manager, technical lead, and educator sections now link directly to a talk, the BREAD architecture, and the public classroom project. |
| /resume | Keep the page aligned with the supplied résumé PDF and recheck the generated PDF at print size after any content change. | Implemented: the print sheet now uses the source's letter size, navy hierarchy, inline role headings, and first-page role grouping. The rendered export matches the two-page structure, and a browser check guards the print styles. The phone screenshot pass also caught the fourth profile action clipped inside the card despite the page reporting no horizontal overflow; the four actions now form a two-column grid at phone widths, with an e2e check that confirms every action stays inside the viewport. |
| /projects | Keep the current product, platform, and teaching groups. Add one concrete outcome and one evidence link to each project card. | Implemented: the Greenroom, BREAD, GRAIN, PANTRY, and classroom entries pair a specific capability or outcome with a project page or live demo. Responsive group layout and direct links are covered by e2e/projects-layout.e2e.ts. |
| /bread | Add one end-to-end example that shows a visitor how the layers work together in a real request, alongside the layer diagram. | Implemented: the page follows a public note from its request through MILL and GRAIN composition to the returned HTML, and explains that PROOF and CRUMB serve other paths. |
| /batch | Put the measured performance and audit result, plus how to reproduce it, near the no-build claim. | Implemented: the page reports the October 9 portfolio-wide /batch measurement (211,553 bytes of JavaScript, 745,209 total bytes, 35 requests), links to the current 148-route report, and gives the rerun command. Deferring live-figure code from pages that do not use it cut 56,053 JavaScript bytes from the October 2 measurement. The copy distinguishes shared-shell JavaScript from a BATCH-only benchmark. |
| /grain | Keep the shared-control and visible-provenance demonstration prominent, then give the visitor a single guided action to try it. | Implemented: the first hero action now jumps directly to the two-operator demo; a browser check confirms the destination and working AI action. The static page links its manifest explanation to the published AI interface guide instead of the server-only /ai/manifest endpoint. The RenderOp introduction distinguishes HTML-bearing operations, typed dispatcher operations, and the service-free limits of the static client door. The tutorial distinguishes the client door used by default in development and on the static export from the server door available through *bun run dev:stub*. Source checks corrected the design-system guide's meaningful-text and link-color rules, and the re-skin guide now names the accent slots used by links, focus rings, and primary controls. Browser assertions guard these public contracts. The deeper component implementation remains deferred. |
| /mill | Tie the content-engine explanation to one note or documentation page rendered by the live site. | Implemented: the project links include a direct rendered-note example, covered by the landing-page browser check. |
| /proof and /plans | Explain the relationship between markdown plans and the board with one current, completed portfolio example; keep the manual-refresh limitation explicit until live updates ship. | Implemented: the PROOF page links the completed site-builder markdown to its board detail, states the manual-refresh limit, and has a browser check for both links and the rendered status. |
| /crumb | Lead with the live portfolio tour so visitors can experience the layer before reading its file format. | Implemented: the first project link starts the guided tour on the live portfolio, covered by a browser check. |
| /pantry | Show a short install-to-first-use example beside the “installation verified” claim; the current explanation is accurate but text-heavy. | Implemented: the page shows the documented install, scaffold, validation, and serve commands, then explains that the board reads the host project's plans in place. The PANTRY guides now include the current decisions, run, artifact, and timeline surfaces, identify which routes are not covered by surface toggles, and state the local answer-write path. |
| /greenroom | Offer a playable sample run or report beside the screenshot so a visitor can inspect the handover, not only read about it. | Implemented: the page summarizes and links to Greenroom's archived seeded report, distinguishing its four practice-environment results from the separate ten-check screenshot and calling out the intentional failures. The phone layout and route links are covered by e2e/projects-layout.e2e.ts. |
| /native-github-classroom and its docs | Link the project story, architecture, and public demo as one path, while continuing to protect private student and grading data. | Implemented: the first links now move from the architecture diagram to the working demo, safety docs, and public source. The copy keeps course internals and student records private; browser checks cover the phone navigation and confirm the docs route resolves. |
| /grain/builder | Keep the limits explicit and improve the live model's ability to build and revise a page before calling the builder a finished AI demonstration. | Still open in builder-ai-depth.md. The workbench shows a validated edit proposal and waits for approval, then checks the canvas before reporting success. New blocks can receive bounded generated copy through registered fields, covered by unit and browser tests; live writing still needs review. A refreshed desktop and phone review fixed the canvas header wrapping its block count and clipping the file actions when the desk panel is open. Builder selects the 1.5B local model only on capable devices; the shared desk remains on 0.5B. On October 11, the 0.5B scored 2/8 in each of two checks and the 1.5B scored 6/8. October 12 runs scored 6/8 and 5/8 with different passing cases. A focused October 13 check applied both deletion cases after the review panel disclosed and corrected the model's wrong target; the generated page still omitted Utrecht, for a 2/3 workflow score. A later full eight-case run scored 6/8 after the timeout increased to 75 seconds; the relative deletion's wrong operation and target were corrected in review, while the explicit-ID request returned no action. The Builder now offers a disclosed, approval-gated recovery when the model declines a command with one clear supported operation and live target. The latest eight-case run scored 7/8: both deletions, both width changes, both moves, and the copy-edit refusal passed. The relative deletion was corrected in review; the model proposed the explicit-ID deletion directly. The draft still omitted Utrecht and included unsupported claims. The recovery improves the reviewed workflow, but generated copy still needs human fact-checking. The first-screen example offers a prefilled `move b3 up` prompt and an honest copy-edit refusal; the visitor still chooses when to send each prompt. The 69-case Builder suite passes. Phone cold-start and repeated grounded-draft reliability remain open. Existing block copy cannot yet be edited. |
| /grain/builder/preview | Give an empty direct visit a one-click route into the workbench and an example composition; keep the static-host limitations clear. | Implemented: the empty state now opens the workbench with a representative page composed; the static-host limitation remains explicit. |
| /teaching | Add an anonymized sample activity or rubric so the course and assessment claims have inspectable teaching evidence. | Implemented: an explicitly illustrative responsive-web assessment slice maps observable repository evidence to the published badge criteria without exposing student work or private assignments. |
| /badges and badge routes | Keep the issuer and criteria prominent, and group the long list by course, term, and award type so a visitor can find one credential quickly. Individual certificates share one route template and need template-level review. | The hub explains the activity threshold and historical reconciliation accurately, and groups class links under each course. Class pages link back to all badge criteria. The shared certificate template has been reviewed at phone width: share-link copying reports success, falls back when clipboard access is unavailable, and exposes a manual link if copying still fails. Browser checks confirm recipient certificates stay out of the sitemap and class pages do not enumerate recipients. |
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
      evidence links and responsive group layout.
- [x] Review the BREAD, BATCH, GRAIN, MILL, PROOF, CRUMB, and PANTRY introductions as one explanation
      of the stack. Their dependency direction, the request path through the portfolio, PANTRY's
      role as an app, and cross-links to adjacent layers are consistent; existing route and
      phone-layout checks cover their presentation. Deeper GRAIN and BATCH implementation work stays
      deferred.
- [x] Review the repeated page-footer copy and GRAIN attribution as one system. Keep the authorship
      claim honest and consistent across the portfolio and the pages visitors can export. The
      portfolio footer now uses one tested statement; exported pages retain GRAIN's generated
      framework attribution and are covered by the builder export checks.
- [x] Keep Builder draft generation local while constraining its completion to the code-owned
      composition shape. The portfolio passes WebLLM a JSON schema for the registered block names,
      bounded output count, layout span, and allowed copy keys and lengths; the desk bridge carries
      the schema through to the local engine. Unit and scripted browser checks verify the request
      shape and live canvas path. Real-model quality remains open because this in-app browser has no
      WebGPU, and the existing measured model failures still apply.
- [x] Review Notes, Talks, Teaching, Calendar, and Badges as evidence of engineering, communication,
      teaching, and the path between them. Notes point into projects and teaching, talks link to their
      written methods, Teaching explains its issuing authority and links to the platform, calendar,
      and criteria, Calendar entries point to related proof where available, and badge pages link
      back to their issuer and criteria. The talk counts, teaching evidence, calendar links, badge
      privacy, and responsive routes have focused browser coverage.
- [ ] Complete the builder's AI reliability work in [builder-ai-depth.md](/plans/plan/builder-ai-depth),
      then make the builder a convincing demonstration of the same system the portfolio introduces.
      The October 13 local 1.5B run scored 5/8: width and move edits and the copy-edit refusal passed,
      while both deletion cases failed and the draft omitted a supplied location and added unsupported
      claims. A later focused check applied both deletion cases after the review panel transparently
      corrected one uniquely identified target; the draft still omitted Utrecht, for a 2/3 reviewed
      workflow result. Model-composed pages pause in a review panel where visitors can inspect or edit
      text before acceptance; edited values are sanitized before they enter the composition. Human
      review is still needed to catch unsupported claims. Phone cold-start and repeated grounded-draft
      reliability remain open. See the Builder plan for the scenario detail.
- [x] Keep every /plans status column readable at desktop and phone widths. The narrow desktop
      keeps horizontal scrolling inside the board and brings the blocked column fully into view;
      phone layouts stack the columns and wrap long path chips. e2e/plans-layout.e2e.ts covers both.
- [x] Finish the route-by-route visual and interaction review at desktop and narrow widths. Check
      navigation, page spacing, headings, accessible names, dead ends, and important interaction
      paths. On October 13, all 148 canonical routes were captured at desktop and phone widths in
      fresh browser contexts. The desktop pass also captured full-page views. Every route returned
      200, had a title and one page heading, and fit within the viewport; the screenshot review found
      no new layout issues. The PDF routes show the direct-open fallback in headless Chromium. The
      existing gallery retains its 35 selected captures, including phone first-screen views for six
      key routes. Focused phone checks cover the Builder, project stories, documentation, résumé,
      plans, catalog, and navigation. The serial full release run passed all 421 browser cases.
      Link lint found no dead relative links in 56 rendered files. The local performance report
      measures 30–268 KB of uncompressed
      JavaScript responses per route; production captures measured 136,617 JavaScript bytes on
      ordinary pages and 159,108 bytes on the Builder before model download. The shared shell stays
      available across routes, while page-specific features load only where needed. The local report
      labels its values as build-size checks rather than production transfer sizes.
- [ ] Commit the finished work on main, deploy it, and verify the published pages. Current local
      evidence on October 13: `bun test` passes 710 unit tests and the serial browser suite passes all
      421 cases; `bun run check` and `bun run lint` pass; the lint gate stays under its baseline; link
      lint finds no dead relative links in 56 rendered files; the fresh sitemap audit has 148
      successful routes and zero document findings; and
      static export verification passes for 1,177 pages, 1,133 data routes, 39 frozen modules, and
      627 assets. These local checks do not prove that the reviewed commit is deployed. Push only
      after the remaining page review is complete, then verify GitHub Pages and CI against that
      commit.

## Done means

The home page gives a clear first read. The project stories and stack pages explain the work in plain
language and lead to inspectable evidence. Notes, talks, and teaching work feel like part of the same
portfolio rather than separate shelves. The builder's AI path has measured evidence and honest limits.
Every public route in scope has been reviewed at desktop and narrow widths, the navigation has no
dead ends, and the final deployment matches the reviewed result.
