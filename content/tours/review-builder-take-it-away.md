---
id: review-builder-take-it-away
mode: dev
title: "Review: the builder lets you leave with what you built"
route: /builder?ask=An%20intro%2C%20two%20cards%20side%20by%20side%2C%20a%20callout%20and%20a%20stat
---
A composed page was worth nothing until now, because it only existed inside the tool that composed
it. Three files come off one composition: the JSON, which is the only one that comes back, a whole
rendered page carrying GRAIN's stylesheet, and the tag source a developer would have hand-written.
All three carry the byline, and the two HTML forms carry it three times over, as a footer you can
see, a comment at the top of the file and an attribute on the root element.

The round trip is the claim rather than the export, so the second step is the one worth your time:
open a hand-edited file and watch it lose a block by name instead of breaking the page. One thing
this work fixed that nobody had noticed: refusals were rendered by the server only, so any prompt
typed into the page raised the Can't build head over an empty list. The page that argues hardest
about saying out loud what it will not fake had been, in the browser, saying nothing.

## builder-export
- at: /builder?ask=An%20intro%2C%20two%20cards%20side%20by%20side%2C%20a%20callout%20and%20a%20stat
- status: new
- review: Four controls at the file-name edge, which is the line that already said what you are building. The three exports are hidden until there is something to export and Open deliberately is not, since reading a composition in is exactly what you do to an empty page. The risky part is the page export, because it links this site's stylesheets rather than copying them, so it needs the network to look like what you built.
- verify: Press JSON and open the downloaded file: it should carry a madeWith line naming GRAIN. Press Page and open that file in a new tab with this site still running; the blocks should keep the widths they have here. Now go to /builder with nothing on it and check the three export buttons are gone while Open is still there.

## builder-refusals
- at: /builder
- status: needs-verification
- review: Open replaces the canvas rather than adding to it, and a hand-edited file degrades to the blocks that survive with every casualty named here. This is the step to look at hardest, because the failure it guards is losing your work to a misclick: a file with nothing renderable in it must change nothing at all rather than emptying the page.
- verify: Export a JSON from a built page, edit one block's component to a name this build has never had, and press Open. The other blocks should come up, this list should name the one that did not, and the line under the prompt should say how many were refused. Then press Open on that same file with every component renamed: the page you already had should be exactly as you left it.

## builder-take
- at: /builder?ask=An%20intro%2C%20two%20cards%20side%20by%20side%2C%20a%20callout%20and%20a%20stat
- status: needs-verification
- review: The drawer that says what the three files are, what does not travel with them, and that the byline is in the source as well as on the page. Judgment rather than a bug: it is five paragraphs under a tool, and the whole design argument for this screen is that prose belongs out of the work area.
- verify: Read it standing up and try to answer three questions from it alone: which file comes back, why the tag source is not a translation, and where the grid went. Then check the two claims it makes about the exports by opening a downloaded page in a text editor.
