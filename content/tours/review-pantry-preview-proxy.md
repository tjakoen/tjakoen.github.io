---
id: review-pantry-preview-proxy
mode: dev
title: "Review: served by PANTRY"
route: /
---
This whole site is coming from PANTRY, not from the port it normally runs on. The tour is running
inside the thing it reviews: if the proxy were wrong, this card would not be on screen.

## screen
- at: /
- status: changed
- review: Looks ordinary. That is the result, and also why a broken proxy would be hard to spot.
- verify: Check the port in the address bar. It should be PANTRY's, not the site's.
The app shell, served through the proxy.

## nav:/notes
- at: /notes
- status: changed
- review: Nothing was rewritten. The links resolve because the root really is the site.
- verify: Open devtools, Network, reload. No 404 anywhere, fonts included.
The notes rail, reached by the site's own navigation.

## console
- at: /
- status: needs-verification
- review: Checked by a scripted click on a different project, never by a person here.
- verify: Type help in the terminal below and press Enter. It should answer.
The desk terminal, client-side code that has to survive the origin change.

## prompt
Two things the walk cannot answer.
- ask: prefix-name | PANTRY's cockpit sits under `/__pantry`. Right name to build on?
- ask: next-piece | Next: the decision card, or proving this on a non-GRAIN project?
- template: Continue the PANTRY review layer (tour {tour}).\nOn the reserved prefix: {prefix-name}\nWhat to build next: {next-piece}\nPlan: plans/pantry-review-layer.md. P0 and P1 on disk, unpushed.
- handoff: https://claude.ai/new?q={payload}
