---
id: review-pantry-preview-proxy
mode: dev
title: "Review: this site is being served by PANTRY"
route: /
---
Every page in this walk is coming from PANTRY, not from the port this site normally runs on. PANTRY
has given up its own root to the project it is pointed at, moved its cockpit under a reserved prefix,
and added exactly one script tag to each HTML response. Nothing else about this site was rewritten,
which is the claim the walk is here to check.

That makes this tour slightly odd, and worth saying out loud: the tour is running inside the thing it
is reviewing. CRUMB's client, the tour data and every asset below reached you through the proxy. If
the proxy were wrong, this card would not be on your screen.

## screen
- at: /
- status: changed
- review: The riskiest thing here is how ordinary it looks. A direct fetch of this page and a fetch through PANTRY differ by one line and 63 bytes, which is the injected script tag. That is the intended result and it is also what makes a broken proxy hard to spot, so the checks below are deliberately about things you can read rather than things you can feel.
- verify: Look at the address bar. The port should be PANTRY's, not the site's own. Open the browser console and type `window.__pantryReview`; it should answer with a `base` of `/__pantry`. Then view source and search for `pantry-review-client.js`: exactly one hit, immediately before the closing body tag. Last, open PANTRY's own cockpit in a NEW tab at `/__pantry/` on this same port. It should render with its nav, its styling and its plan board, and every link in it should start with `/__pantry`.
The whole app shell, served through the proxy under PANTRY's origin.

## nav:/notes
- at: /notes
- status: changed
- review: This is the step that decides whether the design generalises. The site's links and assets are root-absolute, and none of them were rewritten; they resolve because the root really is the site. If any URL rewriting had been needed, this is where it would show as a 404 rather than as anything visible.
- verify: Open devtools, Network tab, and reload this page. Every request should be a 200 or a 304, with no 404 anywhere, and pay particular attention to the fonts and the stylesheets. Then click back to the home page and forward again using the site's own navigation, not the tour's. The port must never change.
The notes rail, reached by the site's own root-relative navigation.

## console
- at: /
- status: needs-verification
- review: Static HTML surviving a proxy proves less than it looks. What matters is whether client-side code still runs, because a review layer that can only show dead pages is not a review layer. This is marked needs-verification rather than verified on purpose: it was checked with a scripted click on a different project, not by a person on this one.
- verify: Open the desk terminal below and type `help`, then press Enter. It should respond as it normally does. While you are there, check the console for any failed fetch, and especially for any request that went to a port other than PANTRY's. A request escaping to the site's own port would mean the proxy leaked, which is the failure mode worth catching here.
The desk terminal, a piece of client-side JavaScript that has to survive the origin change.

## prompt
Two things this walk cannot answer, because they are judgement rather than behaviour.
- ask: prefix-name | PANTRY's cockpit now lives under `/__pantry`. Is that the right name and shape, or should it be something else before anything is built on top of it?
- ask: next-piece | The next phase draws review chrome around this embed. Should that come next, or should the non-GRAIN capture path come first so this is proven somewhere that is not the portfolio?
- template: Continue the PANTRY review layer in the portfolio (tour {tour}).\nOn the reserved prefix: {prefix-name}\nWhat to build next: {next-piece}\nThe plan is plans/pantry-review-layer.md; P0 is on disk and unpushed, P1 through P4 are untouched.
- handoff: https://claude.ai/new?q={payload}
