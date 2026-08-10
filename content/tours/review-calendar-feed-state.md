---
id: review-calendar-feed-state
mode: dev
title: "Review: the feed arrives already filtered"
route: /
---
The calendar's feed has always had three filter tabs, and the tab you picked lived nowhere but the
page. Reload and it was gone, share the link and the other person got a different view, and a tour
could land you on the feed but never on the filtered feed. The tab now lives in the URL, which makes
it a thing a link can carry. This walk arrives on one.

## screen
- at: /
- status: verified
- review: Nothing changed here. It is the launch point, so the next step has somewhere to travel from and the navigation is a real one.
- verify: The lamp should sit on the app shell and the card should say 1 of 2.
The page you started from.

## screen
- at: /calendar?feed=notes
- status: new
- review: The step declares its own query state and the page reads it back. On arrival the Notes tab is already selected and the feed is already filtered to note publish dates, with no click and no second navigation. The same code path runs for a person, which is the point: clicking a tab now writes the tab into the URL, so this address is one anyone can produce by hand and nothing a tour can reach that a visitor cannot. The default tab drops the parameter, so a plain calendar link stays plain, and any other parameter on the URL is carried through rather than dropped.
- verify: The address bar should read /calendar?feed=notes and settle, one navigation, no flicker. The Notes tab should be the selected one and every card in the feed should be a note. The rest wants the tabs themselves, and this card can sit on top of them, so exit the tour first. Then click All: the feed opens up and the address bar should follow to ?feed=all. Click Events: the parameter should disappear entirely. Reload on any of the three and the feed should come back the way you left it. Last, open /calendar?feed=banana in a fresh tab: it should land on Events rather than on an empty page.
Here is the feed, already narrowed to notes. Nothing was clicked to get here. The tour asked for the
page in a particular condition and the page knew how to be in it.

## prompt
Two things the walk cannot check for me, because they are about the shape of the idea rather than
whether the code runs.
- ask: right-page | Was the calendar feed the right page to prove this on, or is there one where preset state would earn more?
- ask: back-button | The tab replaces the URL rather than pushing it, so Back leaves the page instead of undoing the filter. Same as the notes feed. Keep it, or make a filter a history entry?
- template: Continue the {title} work in the portfolio (tour {tour}).\nRight page to prove it on: {right-page}\nBack button: {back-button}\nThe plan is plans/crumb-prefilled-demo.md, phase P3.
- handoff: https://claude.ai/new?q={payload}
