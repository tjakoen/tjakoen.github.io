---
id: review-prompt-card
mode: dev
title: "Review: the tour hands back a prompt"
route: /
---
Two changes to the tour layer, and both of them are only checkable by walking a tour, which is what
this is. First, a step may now declare query state in its `at` and the tour will go there once instead
of reloading forever. Second, a tour can end with a question card that composes a prompt you paste
back into a session, so the review loop closes without you writing the prompt yourself.

## screen
- at: /
- status: changed
- review: Nothing changed on this page. It is here as the first stop so the walk starts somewhere real, and so the next step has somewhere to travel from.
- verify: The lamp should sit on the app shell, and the card should say 1 of 2.
The page you launched the tour from.

## field:contact-message
- at: /mail?subject=grain
- status: new
- review: This step's `at` carries a query string. Before the fix the client compared the whole target against a bare pathname, so the two could never match: it navigated, the page loaded, it navigated again. An infinite reload for any step that tried to preset a page through the URL.
- verify: The address bar should read /mail?subject=grain and settle. One navigation, no flicker, no reload loop. Press Back and it should return to the previous step without bouncing.
The compose field, reached through a route that declares its own state.

## prompt
Two things the walk above cannot check for me, because they are about whether it reads right rather
than whether it works.
- ask: reads-wrong | Anything in the two cards that reads wrong, or says more than it should?
- ask: next-tier | Should the next piece be prefilling this field, or presetting page state through the URL?
- template: Continue the {title} work in the portfolio (tour {tour}).\nWhat reads wrong: {reads-wrong}\nWhat to build next: {next-tier}\nThe plan is plans/crumb-prefilled-demo.md; P0 and P1 are on disk and unpublished.
- handoff: https://claude.ai/new?q={payload}
