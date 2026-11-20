---
title: DASHBOARD.md — a dashboard tells you what to do next
summary: The dashboard standard - how Tjakoen wants a dashboard built, from the head that states its baseline to the queue that names one action per row. It composes GRAIN's dashboards layer rather than inventing a grid, keeps colour to the theme's one accent, and is checked on a screenshot at a phone and a desktop width before anyone calls it done.
when: >
  Read this BEFORE building or restyling a dashboard, a home page, a report page, a run summary, a
  board of work or any page whose job is to show state and point at the next move. It owns what goes
  on the page, in what order, and what each item owes its reader; GRAIN owns the components and
  FIGURES owns any chart drawn inside one. Don't skip because the page is internal or only for you -
  the owner is the reader these rules came from, and every rule here is a correction he already made.
---

# A dashboard tells you what to do next

A dashboard is not a report of everything a system knows. It is the page someone opens to find out
where they stand and what to do about it, and it is judged on whether they can act from it without
opening anything else. Every rule below came from a page that failed that test: a "What to decide"
list that named problems without a way to answer them, a plans page thirteen thousand pixels tall,
a row of tiles that said a number and nothing about what the number meant.

> Split of responsibility: **GRAIN's dashboards layer owns the parts** (the dashboard page, the dash
> panel, the delta, the bullet graph, the rank list, the stat tile, the drawer and the board). This
> file owns how they are put together and what each part owes its reader. **[FIGURES](FIGURES.md)**
> owns any chart inside a panel, and **[VOICE](VOICE.md)** owns every word on the page.

**The standard in one line:** lead with what needs the reader, give every item one verb and one
action, keep the page short enough to read in one scroll, and let the theme carry the colour.

---

## 1. Build on the layer, never beside it

A dashboard is composed from GRAIN's dashboards layer: the dash page with its head, its KPI strip and
its panel grid, and dash panels inside it. A project does not write its own grid, its own tile or its
own empty state, because every one written by hand drifts from the others and the next session copies
the drift. Where the layer lacks a part the page needs, the part is proposed to GRAIN and built there,
then used. A local stopgap is allowed only with a plan that names the GRAIN change it is waiting for.

The layout queries its own width, so the same page works inside a sidebar, a pane beside a chat or a
full window. Test it in the narrowest of those, not only the widest.

## 2. The head states the comparison

The page opens with a real heading, one line on what the page covers, and the period or baseline
every number on it compares against. A reader must never have to guess whether "3 done" means today,
this week or ever. When the page refreshes itself, the head says when it was last true.

Housekeeping links (the raw JSON, keyboard shortcuts, a copy for an agent) sit quietly at the end of
the head or in the footer. They never sit in the line the reader reads first.

## 3. Lead with what needs the reader

Order the page by who has to move. First what is waiting on the reader, then what is moving without
them, then what comes next, then history. Something that needs a decision never sits below a
paragraph of telemetry.

The KPI strip follows the same order and fills its row. Each tile is a link to the panel or page that
explains it, and a tile whose number is a problem says so through its tone (the stat tile's warn and
bad states), not through a new colour. Five tiles is plenty; a sixth number belongs in a panel.

## 4. Every item carries one verb and one action

A row that names a problem without a way to act on it is not finished. Each item in a queue opens
with a short verb chip (Answer, Do, Unblock, Review, Park) and ends with the one control that moves
it: a button that copies a prompt, opens the plan, or answers the question. If two actions are
honest, the second goes into the item's drawer, not beside the first.

A queue is ranked, and the rank is stated: by how many things the item holds up, then by how long it
has waited. The reader should be able to work it top to bottom without choosing.

Evidence is short and specific. "Marked blocked" says nothing; "blocked on the owner's call about the
archive layout, since 12 November" says what to do.

## 5. Work in flight is a board, detail is a drawer

Work with stages is a board: one column per stage, cards in the column, a count in each column head.
A card shows its title, its project and the one fact that sorts it (what it holds up, which harness
holds it). Everything else, the history, the touched paths, the full evidence, opens in a drawer from
the card, so the board stays readable at a glance and the detail is one click away rather than one
scroll.

Column heads are sentence case. Tracked capitals and eyebrow labels are out, as they are across GRAIN.

## 6. Keep it to one scroll

A dashboard that runs past three screens is a report. Trim every list to what a reader acts on:

- show at most three of anything inside a card (paths, sessions, touches), then "and N more";
- fold the done column after five, and history after a week;
- merge duplicates before rendering, so one plan read through two registry entries is one card;
- collapse a panel with nothing in it to its empty state, never to a blank box.

When a page grows, measure its height on a screenshot before and after the change, and say both
numbers in the run report.

## 7. Every panel has four states

Ready, loading, empty and stale. The empty state is a dashed box with the next step in it ("No shared
projects yet. Create or join one from your workspace."), not a lone "none". The stale state says when
the panel was last true. A panel the AI is still writing wears the pending state from GRAIN's
contract, so nobody reads a half-written number as final.

## 8. The theme carries the colour

Colour comes from the active theme's one accent and the stat tile's tones, and nowhere else. A page
never names a hue: no blue for links, no green for done. Chips are where colour earns its place, a
status chip in the accent for the item that needs the reader and a quiet outline for the rest, so the
eye lands on the right card without a legend. Switching the theme must change the whole page, and a
theme picked in one window holds in the others.

Ink level and border weight do the rest. A dashboard that only reads in colour is broken for the
reader who cannot see it, so every chip also carries its word.

## 9. Small numbers stay counts

Below about ten observations a percentage misleads, so show the count. A delta on a tiny base says
"was 1" in a quiet tone instead of a red minus one hundred percent. Where a number comes from a
script and a judgement comes from a model, they sit under separate headings and never mix.

## 10. One shell across the app

Every page of an app shares one shell: a sidebar with the app name, the theme switch at its top, the
cross-cutting views, then the project or section list, with the current page marked by more than
colour. A page that drops the shell feels like another app. On a phone the sidebar folds away and the
main column takes the full width.

## 11. Shown at two widths before it is done

A dashboard change is done when it has been screenshotted at a phone width and a desktop width, the
screenshots have been looked at, and the run report says what they show. A full-page screenshot
stretches a sticky sidebar, so a finding about the sidebar is checked on a scrolled viewport before it
is believed. [TOUR-STANDARD](TOUR-STANDARD.md) says when the change owes a tour as well.

## The checklist

Before calling a dashboard done:

1. Built from GRAIN's dashboards layer, with any missing part proposed upstream.
2. The head names the page, the period and when it was last true.
3. What needs the reader comes first, and the KPI strip follows the same order.
4. Every queue item has a verb chip, one action and specific evidence.
5. Work with stages is a board; detail opens in a drawer.
6. The page fits in about three screens, with long lists trimmed and duplicates merged.
7. Every panel has its empty, loading and stale states.
8. Colour comes only from the theme's accent and the tile tones; no hue is named.
9. Small samples show counts, and script findings stay apart from model judgements.
10. The shell matches the rest of the app.
11. Screenshotted at a phone and a desktop width, and both were read.
