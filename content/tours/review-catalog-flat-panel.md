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

**Walked 2026-08-08, on grain 0.1.18.** The publish landed, the pin here moved to `^0.1.18`, and the
catalog visual baseline was re-blessed against the fixed page. Both steps below were walked in a real
browser at 1280 wide, and the full e2e suite is 220 green with the baseline in place.

One trap is worth recording, because it nearly bought a wrong verdict. `bun add @tjakoen/grain@^0.1.18`
reported a successful install while leaving 0.1.17 on disk, and a suite run against that tree makes
the fix look like a regression in two unrelated /grain tests. Check
`node_modules/@tjakoen/grain/package.json` and the fence tag on line 15 of the presentation doc before
trusting any result: it reads ```` ```html flat ```` on 0.1.18 and ```` ```html ```` on 0.1.17.

## catalog:presentation
- at: /catalog
- status: verified
- review: The riskiest step and the reason for the change. This entry used to render its deck live, and a deck sized to the window is exactly the thing a panel cannot hold. It should now show the copyable source and a one-line note in place of the live box.
- verify: Load /catalog cold and look at the very top of the page before scrolling. You should see the sidebar, the search field and the first component card. Then use the sidebar search for "presentation" and open it: its Markup panel should show source and a note, with no rendered deck. If the page opens as a flat grey rectangle with slide controls in the bottom right, the bump has not landed.
The component that broke its own page. It is honest about it now. Walked: the cold load shows the
sidebar, the search field and the Action badge card, the entry's two Markup panels are source plus the
one-line note, and there is no rendered deck anywhere on the page.

## catalog:action-badge
- at: /catalog
- status: known-issue
- review: The control case. Every other example still renders live, and the flat path must not have leaked into them. This is the first card on the page, so it is also what a cold load should show.
- verify: Look at the first card. Both state panels should show a real rendered badge above their code, not a note. Click Copy on one and paste it somewhere: the snippet should be the markup, unchanged.
Half of this holds and half of it does not, so it is stamped as a known issue rather than verified.
The flat path did not leak: both state panels are live panels, not notes, and the code beside them is
the markup unchanged. But the live panels render nothing you can see. The component ships as a
template, `<span class="action-badge" prop-text="verb">`, while its own doc example is written as
`<action-badge verb="clicks">`, and nothing on /catalog expands that form. So the panel is a correctly
sized empty box. That gap predates this change and belongs to grain's doc, not to the flat tag.
