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

## Current progress (2026-10-02)

The first project-index pass now gives GRAIN a direct introduction beside PANTRY instead of leaving
the design system visible only as one layer inside the BREAD story. The index names TJ's role across
the featured products, stack, design system, app and teaching platform. The related entries share a
responsive layout and link directly to their project pages. Browser checks cover their ownership
copy, links, wide-screen alignment and narrow-screen stacking. This closes those index gaps, while
the wider audit of each project's outcomes, evidence and next steps remains open. The repeated page
footer now uses one plain, human-accountable AI statement without the robot emoji or an unsupported
claim about every commit. Builder exports retain GRAIN's own generated attribution, covered by the
export checks; the two credits describe different kinds of authorship. The `/plans` board now keeps
all four status columns readable: narrow desktop users can scroll the final column into view, and
long path chips wrap so phone layouts do not gain sideways page overflow.

The first full route sweep covered 145 public routes at desktop and phone widths (290 checks). It
found no route-level navigation failures, missing or duplicate page headings, or horizontal page
overflow outside `/catalog`. The catalog's mobile grid had been allowed to size itself from wide
component examples, its fixed-position live specimens could float over other entries, and its empty
console-expand control had no accessible name. The portfolio now clamps that generated page to the
phone viewport, confines each live specimen to its card, and names the control at the host
integration boundary and supplies the catalog's missing search description, leaving GRAIN and
BATCH internals untouched. Browser checks cover the phone width, full-page catalog navigation, and
description. A refreshed headless audit returned all 145 routes successfully, with canonical, Open
Graph, structured-data, and description metadata present. It still flags the catalog's generated
H1 specimens, and the page-family review remains open.

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

The CRUMB introduction now leads with a direct link into the live portfolio tour. A browser check
starts that tour from the project page and confirms the first guided step appears.

### Page recommendations in progress

These recommendations come from the routes reviewed so far. The shared content families still need
individual checks before the audit can be called complete.

| Page or family | Recommendation | State |
| --- | --- | --- |
| `/` | Make selected work the primary next step and keep the résumé, notes, and other destinations as secondary paths. The six equal “Start” links competed for attention. | Implemented: the projects link is now the first-screen button, and the secondary list no longer repeats it. |
| `/about` | Put one inspectable proof link beside each leadership claim, especially team delivery, teaching scale, and shipped systems. | Implemented: manager, technical lead, and educator sections now link directly to a talk, the BREAD architecture, and the public classroom project. |
| `/resume` | Keep the page aligned with the supplied résumé PDF and recheck the generated PDF at print size after any content change. | Implemented: the print sheet now uses the source's letter size, navy hierarchy, inline role headings, and first-page role grouping. The rendered export matches the two-page structure, and a browser check guards the print styles. |
| `/projects` | Keep the current product, platform, and teaching groups. Add one concrete outcome and one evidence link to each project card. | Implemented: the Greenroom, BREAD, GRAIN, PANTRY, and classroom entries pair a specific capability or outcome with a project page or live demo. Responsive group layout and direct links are covered by `e2e/projects-layout.e2e.ts`. |
| `/bread` | Add one end-to-end example that shows a visitor how the layers work together in a real request, alongside the layer diagram. | Implemented: the page follows a public note from its request through MILL and GRAIN composition to the returned HTML, and explains that PROOF and CRUMB serve other paths. |
| `/batch` | Put the measured performance and audit result, plus how to reproduce it, near the no-build claim. | Implemented: the page reports the dated portfolio-wide `/batch` measurement (267,606 bytes of JavaScript, 795,638 total bytes, 38 requests), links to the complete 145-route report, and gives the rerun command. The copy distinguishes shared-shell JavaScript from a BATCH-only benchmark. |
| `/grain` | Keep the shared-control and visible-provenance demonstration prominent, then give the visitor a single guided action to try it. | Implemented: the first hero action now jumps directly to the two-operator demo; a browser check confirms the destination and working AI action. |
| `/mill` | Tie the content-engine explanation to one note or documentation page rendered by the live site. | Implemented: the project links include a direct rendered-note example, covered by the landing-page browser check. |
| `/proof` and `/plans` | Explain the relationship between markdown plans and the board with one current, completed portfolio example; keep the manual-refresh limitation explicit until live updates ship. | Implemented: the PROOF page links the completed site-builder markdown to its board detail, states the manual-refresh limit, and has a browser check for both links and the rendered status. |
| `/crumb` | Lead with the live portfolio tour so visitors can experience the layer before reading its file format. | Implemented: the first project link starts the guided tour on the live portfolio, covered by a browser check. |
| `/pantry` | Show a short install-to-first-use example beside the “installation verified” claim; the current explanation is accurate but text-heavy. | Next |
| `/greenroom` | Offer a playable sample run or report beside the screenshot so a visitor can inspect the handover, not only read about it. | Next |
| `/native-github-classroom` and its docs | Link the project story, architecture, and public demo as one path, while continuing to protect private student and grading data. | Next |
| `/grain/builder` | Keep the limits explicit and improve the live model's ability to build and revise a page before calling the builder a finished AI demonstration. The present measured edit score is only 2/5. | Open in `builder-ai-depth.md`. |
| `/grain/builder/preview` | Give an empty direct visit a one-click route into the workbench and an example composition; keep the static-host limitations clear. | Implemented: the empty state now opens the workbench with a representative page composed; the static-host limitation remains explicit. |
| `/teaching` | Add an anonymized sample activity or rubric so the course and assessment claims have inspectable teaching evidence. | Next |
| `/badges` and badge routes | Keep the issuer and criteria prominent, and group the long list by course, term, and award type so a visitor can find one credential quickly. Individual certificates share one route template and need template-level review. | Next |
| `/talks` and talk decks | Keep the live-deck format, verify each index fact against its deck, and link each talk to its related note or a recording where one exists. The slide-count mismatch is fixed. | Count consistency fixed; remaining links need review. |
| `/talks/every-time-it-was-wrong` | Link the measured reviewer result to the note or public method that explains how comments were graded. | Next |
| `/talks/build-the-floor` | Keep the corrected 33-slide count and link the roadmap to the corresponding note. | Count fixed; link review remains. |
| `/talks/ten-times-zero` | Keep the live figures and connect the talk to its written playbook so visitors can take the method away. | Next |
| `/notes` | Build a few guided reading paths into projects, teaching, and talks; reduce the amount of filter UI competing with the first article on a phone. | Next |
| `/notes/build-the-floor` | Keep its deck attachment in sync with the actual 33-slide talk and link the roadmap's stages to inspectable examples. | Slide count fixed; link review remains. |
| `/notes/feels-like-an-app` | Add a direct route to the stack diagram or project page that demonstrates the full-page-load architecture described in the note. | Next |
| `/notes/how-i-turned-github-into-a-classroom` | Link the account to the public classroom project and architecture page as the inspectable version of the story. | Next |
| `/notes/one-loop-every-repo` | Link the workflow claims to the public plans or documentation that shows how the loop is enforced. | Next |
| `/notes/origin-story` | Use this as a guided starting point into the stack and project pages, rather than leaving the origin story as a self-contained essay. | Next |
| `/notes/ten-times-zero` | Bring the snapshot date from the essay's measured 503-commit claim into the pinned excerpt, so a dated historical result does not read as a current guarantee. | Implemented in the pinned excerpt. |
| `/notes/the-browser-grew-up` | Put the benchmark method and the compared page implementations one click from the result in the summary. | Next |
| `/notes/the-check-that-never-ran` | Link the diagnosis to the corrected workflow or a public follow-up so the failure story ends with evidence of the fix. | Next |
| `/notes/the-console-i-built-to-stop-drowning` | Keep the teaching-console story connected to the classroom and teaching pages, while avoiding details that could expose student data. | Next |
| `/notes/watch-its-hands` | Connect the plain-language interaction argument to the GRAIN demonstration and clearly label the parts still unproven. | Next |
| `/notes/whitepaper-one-vocabulary` | Keep the working-draft status visible and offer the short GRAIN explanation before the research-length paper. | Next |
| `/notes/why-i-teach` | Connect the teaching motivation to the course platform and badge criteria so readers can verify what changed in practice. | Next |
| `/calendar` | Keep the year strip and feed as complementary ways through the history; review the event and note empty states against the live data on both phone and desktop. | Next |
| `/calendar/{event}` (six event pages) | Keep the event pages connected to the feed, and make the next link point to a related talk, course, or note where one exists. | Next |
| `/tour` and tour routes | Review the entry tour as the visitor's guided route through the portfolio; label the remaining tours as implementation reviews so they do not read like public showcases. | Next |
| `/404` | Keep the recovery links, and check that each suggested destination still exists and matches its description. | Next |
| `/docs`, `/reference`, and `/catalog` | Preserve these as working references, and provide a direct route back to the project story for visitors who land in documentation first. The catalog's mobile overflow, escaping specimen, unnamed console control, and missing search description are fixed. | Catalog now has metadata and its prior mobile/accessibility fixes; the audit still flags multiple H1s in generated live examples. Other entry paths need review. |
| `/batch/docs/*`, `/grain/docs/*`, `/mill/docs/*`, `/crumb/docs/*`, `/proof/docs/*`, and `/pantry/docs/*` | Review each documentation set's landing path, project context, and links back to its owning introduction. These routes share documentation templates, but their instructions need their own content check. | Next |
| `/standards` and its 20 standard pages | Keep standards discoverable as evidence of engineering practice, and give each page clear ownership, current status, and a route back to the portfolio. | Next |
| `/plans/plan/*` (29 plan pages) | Separate public evidence of shipped work from internal or stale backlog detail; link the completed portfolio plan to its finished pages and evidence. | Next |
| `/decks/*` (four PDF attachments) | Verify each PDF opens, has useful document metadata, and has a matching description on the event or talk page that links to it. | Next |
| `/kickstart` | Clarify what the coding agent will create and what the visitor must have ready before they hand it a project link. | Next |
| `/mail` and contact paths | Make the real contact route and any local-only demo state clear before asking visitors to enter a message. | Next |

## Work

- [x] Reconcile the portfolio's purpose and the visitor journey with the owner on 2026-10-02.
- [x] Reconcile the shipped builder and credential work with the board, keeping ongoing AI and
      human-lane work visible under its actual status.
- [x] Archive the empty welcome-plan template so it no longer reads as unfinished portfolio work.
- [x] Close the completed builder v1 plan and move its remaining model-quality work into
      [`builder-ai-depth.md`](builder-ai-depth.md).
- [ ] Audit the entry pages and the project stories together. Each should explain its purpose, my
      role, the hard part, the outcome, and where a visitor can inspect the work.
- [ ] Review the BREAD, BATCH, GRAIN, MILL, PROOF, and Pantry introductions as one explanation of
      the stack. Make their relationships legible without turning each page into a package manual.
- [x] Review the repeated page-footer copy and GRAIN attribution as one system. Keep the authorship
      claim honest and consistent across the portfolio and the pages visitors can export. The
      portfolio footer now uses one tested statement; exported pages retain GRAIN's generated
      framework attribution and are covered by the builder export checks.
- [ ] Review Notes, Talks, Teaching, Calendar, and Badges as evidence of engineering, communication,
      teaching, and the path between them. Give each page a clear next link into the relevant proof.
- [ ] Complete the builder's AI reliability work in [`builder-ai-depth.md`](builder-ai-depth.md),
      then make the builder a convincing demonstration of the same system the portfolio introduces.
- [x] Keep every `/plans` status column readable at desktop and phone widths. The narrow desktop
      keeps horizontal scrolling inside the board and brings the blocked column fully into view;
      phone layouts stack the columns and wrap long path chips. `e2e/plans-layout.e2e.ts` covers both.
- [ ] Do a final route-by-route browser pass at desktop and narrow widths. Check navigation, page
      spacing, headings, accessible names, dead ends, and the important interaction paths.
- [ ] Run the portfolio's release checks, resolve the findings in scope, commit the finished work on
      `main`, and verify the deployed pages.

## Done means

The home page gives a clear first read. The project stories and stack pages explain the work in plain
language and lead to inspectable evidence. Notes, talks, and teaching work feel like part of the same
portfolio rather than separate shelves. The builder's AI path has measured evidence and honest limits.
Every public route in scope has been reviewed at desktop and narrow widths, the navigation has no
dead ends, and the final deployment matches the reviewed result.
