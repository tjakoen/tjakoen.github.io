# WCAG 2.2 AA audit: the portfolio and GRAIN

Run on 6 November 2026 against the portfolio at this commit and GRAIN 0.1.27 plus the fixes on
GRAIN's `a11y/wcag-2-2` branch. This is a reference doc, so filenames and selectors stay literal.

## What the claim is, and what it is not

GRAIN can promise what it owns: its tokens, its components' markup and focus behavior, its motion
and its target sizes. It cannot promise what an app adds on top: alt text, heading order, link
wording, captions, any colour or component the app brings itself. So the honest claim is
**"GRAIN's components and themes meet WCAG 2.2 AA, and this site, built on them, passes an automated
WCAG 2.2 AA scan on every canonical route plus a manual pass on the criteria a scanner cannot
test."** It is not a third-party certification, and no screen-reader user has tested it yet.

## How it was tested

- **Automated.** `e2e/wcag.e2e.ts` runs axe-core with the `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`
  and `wcag22aa` tags on every route in `/sitemap.xml`, once in light and once in dark, with reduced
  motion on. It is part of the Playwright suite, so a regression fails CI. Axe covers roughly a third
  of the success criteria.
- **Manual.** The source was read for the criteria axe cannot judge, listed below.
- **Contrast arithmetic.** Every theme's text and accent tokens were computed against both its page
  and panel backgrounds, in both modes.

## Result

All 421 sitemap routes, in light and in dark, 842 scans: zero violations (16 of 16 spec parts
passing, 5.5 minutes at four workers). The first scan found a handful of faults that repeated on
nearly every page, because they lived in the shared frame and in GRAIN. A few more surfaced only
on the catalog, the calendar, the builder and the talk decks.

## Found and fixed

| Criterion | Where | Problem | Fix |
|---|---|---|---|
| 4.1.2 | portfolio frame, GRAIN sidebar-panel doc | The Chat/Catalog/Notepad switch put `aria-selected` on plain buttons, which has no meaning there. | The group is now `role="tablist"` and each button `role="tab"`. GRAIN's `shell.js` already drove `aria-selected`, so no script change. |
| 2.5.3 | portfolio frame | "New chat" was named "New conversation"; the Terminal toggle's name did not contain "Terminal". A voice user saying what they see would miss both. | The name now starts with the visible words. |
| 1.4.3 | GRAIN, 24 rules | `--ink-faint` (1.79:1 in light) coloured real text: chat speaker labels, hints, placeholders, badges, the muted stat tile, the notepad and console labels. The token's own comment said decorative only. | Every text or control use moved to `--ink-muted` (4.55:1 at worst, across all four themes and both modes). `--ink-faint` remains only on list bullets, chevrons and the tab icon, and its comment now names the rule. |
| 1.4.3, 1.4.11 | GRAIN themes | Brioche's light accent was 2.99:1 on its page, too faint even for a focus ring. Baguette's and the template's blue was 4.49:1 as text. | Brioche `#B77F1E` to `#8A5E12` (4.92:1), its hover darkened to match. Baguette and template `#2F6FE0` to `#2C68D6` (4.95:1). |
| 2.5.8 | GRAIN tab and file-tree close | The close controls were 18.4px square. | 24px. |
| 2.4.7 | GRAIN tab and file-tree close | Hidden until hover, so a keyboard user tabbed onto an invisible control. | Shown on `:focus-visible`. |
| 2.4.7 | GRAIN notepad, console | The notepad's source had `outline: none` and nothing in its place; the console input only recoloured its prompt (also a 1.4.1 problem). | Both draw the accent ring on keyboard focus. |
| 2.4.11 | portfolio frame, GRAIN sidebar-panel | On a phone the assistant sheet peeks over the bottom of the page and could cover a focused element. | The page's scrollers keep `scroll-padding-bottom` clear of the strip. |
| 2.1.1 | GRAIN `theme.js`, MILL, catalog | Code blocks, wide tables, the chart table, the notepad and the tab strip scrolled but held nothing focusable, so a keyboard could not scroll them. | MILL and the catalog emit `tabindex="0"` on every code block. `theme.js`, which every GRAIN page loads, gives any other scrolling region with nothing focusable inside `tabindex="0"`, so the guarantee lives in the system rather than in each component. |
| 4.1.2 | GRAIN meter doc | The three-segment health bar was `role="meter"` with no value, which a meter requires. | It is `role="img"` with the split in its label; the indeterminate form is `role="progressbar"`. |
| 1.3.1 | GRAIN content-index and timeline docs, portfolio cv-bullet and cv-link docs | Live examples rendered list items with no list round them, or a list holding loose text. | Each example now renders a whole list. |
| 2.5.3 | calendar | Month buttons were named "February 2026" while showing "Feb", and a busy month showed a "+7" its name lacked. | The name opens with the short month, and the overflow count is drawn by CSS since the total is already in the name. |
| 1.4.3 | calendar, builder | Empty months used `--ink-faint`; builder controls rested at 55% opacity; the preview's view switch had no styles in dark mode and fell back to a light browser button. | Muted ink at full opacity everywhere, with the preview switch styled. |
| 2.1.1 | portfolio frame | The chat log scrolled with only text inside. | A named, focusable region. |
| 2.5.8, 1.4.11 | GRAIN presentation | The slide dots were about 8px buttons in a faint grey. | Each dot is a 24px button with the dot drawn inside it, so the row looks unchanged. An unseen slide shows as a muted ring and a seen one as a filled dot. |
| 1.4.3 | PROOF board | The column count used `--ink-faint`. | Muted ink. |
| 2.5.8 | mail-folder | The folder chip had no size outside the mail screen. | A 24px floor everywhere. |
| 2.1.1 | `scripts/figure-widgets.js` | The ratio figure's guess could only be set with a pointer. | The bar is a `role="slider"` with arrow, Page, Home and End keys. |

## One reviewed exception

A tab in the open-tabs strip that has scrolled partly underneath the pinned Welcome tab reads to axe
as a target clipped below 24px. It is 24px when in view, scrolling the strip reveals it, and the same
page can be closed from "Close all" and from its explorer row. The scan excuses exactly that case
(`partiallyObscured` on a `.tab` or `.tab__close`) and nothing else. A genuinely small tab still
fails.

## Checked by hand, already passing

- 2.4.1: every page has a skip link to `#main-content`.
- 2.5.7: the one drag interaction (the ratio figure) also works with a single click.
- 2.3.3 and motion generally: view transitions, smooth scroll and the panel animations stop under
  `prefers-reduced-motion`. The remaining unguarded transitions are 150ms colour fades and a chevron
  turn, which WCAG does not ask to remove.
- 3.3.8: the site has no sign-in, so accessible authentication does not apply.
- 3.2.6: the contact route and the desk sit in the same place on every page.

## Not yet covered

- The result above was measured with the GRAIN, MILL and PROOF fixes copied into this checkout's
  `node_modules`. The published site gets them only after a GRAIN release and the portfolio's
  dependency bump, so until then the claim is true of the code and not yet of the live site.

- No screen-reader walk (VoiceOver, NVDA) has been done. That is the next pass and the one most
  likely to find something.
- The desk's model output is generated text; its live-region announcements were not reviewed.
- PDF decks under `/media/decks/` are not tagged PDFs and are out of this scan.
- Apps built on GRAIN inherit the component guarantees only. Each one owes its own scan, and the
  spec in this repo is the template for it.
