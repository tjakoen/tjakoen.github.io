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
- [ ] Review the repeated page-footer copy and GRAIN attribution as one system. Keep the authorship
      claim honest and consistent across the portfolio and the pages visitors can export.
- [ ] Review Notes, Talks, Teaching, Calendar, and Badges as evidence of engineering, communication,
      teaching, and the path between them. Give each page a clear next link into the relevant proof.
- [ ] Complete the builder's AI reliability work in [`builder-ai-depth.md`](builder-ai-depth.md),
      then make the builder a convincing demonstration of the same system the portfolio introduces.
- [ ] Do a final route-by-route browser pass at desktop and narrow widths. Check navigation, page
      spacing, headings, accessible names, dead ends, and the important interaction paths. The
      current `/plans` desktop board clips its fourth column at the shell width; include that layout
      in the pass and make every status column readable.
- [ ] Run the portfolio's release checks, resolve the findings in scope, commit the finished work on
      `main`, and verify the deployed pages.

## Done means

The home page gives a clear first read. The project stories and stack pages explain the work in plain
language and lead to inspectable evidence. Notes, talks, and teaching work feel like part of the same
portfolio rather than separate shelves. The builder's AI path has measured evidence and honest limits.
Every public route in scope has been reviewed at desktop and narrow widths, the navigation has no
dead ends, and the final deployment matches the reviewed result.
