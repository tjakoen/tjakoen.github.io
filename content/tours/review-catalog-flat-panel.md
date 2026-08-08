---
id: review-catalog-flat-panel
mode: dev
title: "Review: the catalog stopped being covered by a deck"
route: /catalog
---
The catalog rendered every fenced example live, including the presentation deck's, and that example
carries `data-present`. That attribute puts a deck `position: fixed; inset: 0; z-index: 8000`, so it
left its panel and painted over the whole page. Two test failures were the same bug wearing different
hats: the catalog's visual baseline went blank, and a click meant for the Back control hit the deck
instead. The fix is in grain, not here: a fence tagged `html flat` renders as source only, and each
component entry now carries a `data-surface` address so a tour can point at one of them.

**This tour cannot be walked until grain 0.1.18 is published and this repo's pin is bumped.** The
publish is blocked on npm auth. Against the pinned 0.1.17 the deck still covers the page, which is
what the first step is for.

The catalog's visual baseline is deliberately left un-blessed for the same reason: re-blessing it now
would record a page the pinned grain still renders wrong. `bunx playwright test visual.e2e.ts -g
catalog` should fail today, and pass after the bump plus one `--update-snapshots` run. A pass before
the bump means someone blessed a broken page. It is the one thing this session knowingly left red.

## catalog:presentation
- at: /catalog
- status: needs-verification
- review: The riskiest step and the reason for the change. This entry used to render its deck live, and a deck sized to the window is exactly the thing a panel cannot hold. It should now show the copyable source and a one-line note in place of the live box.
- verify: Load /catalog cold and look at the very top of the page before scrolling. You should see the sidebar, the search field and the first component card. Then use the sidebar search for "presentation" and open it: its Markup panel should show source and a note, with no rendered deck. If the page opens as a flat grey rectangle with slide controls in the bottom right, the bump has not landed.
The component that broke its own page. It is honest about it now.

## catalog:action-badge
- at: /catalog
- status: needs-verification
- review: The control case. Every other example still renders live, and the flat path must not have leaked into them. This is the first card on the page, so it is also what a cold load should show.
- verify: Look at the first card. Both state panels should show a real rendered badge above their code, not a note. Click Copy on one and paste it somewhere: the snippet should be the markup, unchanged.
Nothing here changed. That is the point of walking it.
