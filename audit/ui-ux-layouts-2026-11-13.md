# UI and UX audit of the three layouts, 2026-11-13

The site has three layouts, chosen by the width of the shell frame: the desktop shell (the IDE
frame with file tree, tabs, chat column and status bar, above 768 pixels), the tablet layout (a
plain top bar with search and theme, a bottom bar with Menu, Browse and Tour, at 768), and the
phone layout (the same bars at 375 to 390). This pass measured fifteen routes at 1440, 820 and 390
pixels in a live render, read the screens for notes and reading at all three, and surveyed the CSS
under view/ for token use.

## What holds

- No route overflows sideways at any of the three widths. Wide rows (suggest chips, tab strips,
  slide dots) scroll inside their own container, as intended.
- Every route has exactly one h1, and no image is missing its alt attribute.
- Light mode passes WCAG AA contrast on every text node measured on the phone notes page. The
  muted ink is #6E6249 on paper, which clears 4.5 to 1.
- Token use is strong. The top values in page CSS are the spacing scale, the colour roles and the
  type scale, read hundreds of times each. The talk decks draw their SVG figures with
  var(--color-fg), var(--color-muted) and var(--color-line), which is what FIGURES asks for.
- Raw hex in CSS is limited to the résumé print sheet, where fixed print colours are the point, and
  one rival colour in the nest scene of live-figure.

## Findings, worst first

1. **Text under 12 pixels in the phone and tablet chrome.** The bottom bar and the Menu drawer
   labels (mobile-nav__item, mobile-menu__item) render at 10.4 pixels. These are the primary
   navigation on two of the three layouts, so they should be the most legible text on the screen,
   not the least. Raise them to the text-xs token or above.
2. **The reading shelf drops to 8.8 pixels.** book__cat renders at 8.8 pixels and book__author at
   11.2 on desktop, 55 to 74 nodes per width. Rotated spine text this small is decoration rather
   than content; either raise it or mark the spine as aria-hidden and carry the title and author
   in the accessible list beside it.
3. **Small tap targets on the phone.** Count of controls under 24 by 24 pixels at 390: notes 41,
   people 25, résumé 20, projects 13, grain and batch 9 each, the talk deck 8. On notes they are
   the tag filters and audience tabs. WCAG 2.2 sets 24 pixels as the floor; padding the tag chips
   and the tabs closes most of the count.
4. **Tablet is the phone layout stretched.** At 768 the site shows the phone bars and a single
   column with wide margins, while the desktop shell is hidden. The space between 768 and about
   1100 pixels would carry a two-pane version (tree or contents beside the page) without the chat
   column. This is a design call, not a defect, but it is the layout that earns the least from the
   width it has.
5. **The notes tab strip clips without a cue.** On the phone, "How I lead" is cut at the edge with
   no fade or arrow, so the strip reads as three tabs rather than four. A trailing fade mask or a
   wrap to two rows fixes it.
6. **Retracted: the button type is GRAIN's.** "SEE WHAT'S NEW" on notes is uppercase serif, and so is every one of the eighteen .btn buttons across five sampled routes. That is GRAIN's button style working as designed, not a stray on this page.
7. **Long card summaries on the phone.** The pinned note's summary runs to about fourteen lines at
   390 pixels, pushing the second note below two screens. A three-line clamp on phone, with the
   full text on the note page, keeps the list scannable.
8. **The desktop shell is dense.** The tree, tab labels, status bar and chat column all sit at the
   small end of the scale, and the content column gets roughly half of a 1440 pixel window. It
   reads as an IDE on purpose; the question is whether the chat column should start collapsed on
   pages that are long reads (notes, reading, standards).
9. **Hardcoded spacing on the leading page.** view/pages/leading/index.html carries seventeen
   inline margin-top values of 0.5rem. That is var(--space-2) or a class, not an inline style.
10. **The shell lives here rather than in GRAIN.** portfolio-frame.css is 738 lines, the largest
    stylesheet in the repo, and it holds the three-layout switch. CLAUDE.md says new design work
    belongs in grain. If other projects will ever want the desk shell, it is the first candidate to
    move up.
11. **Breakpoints are not one scale.** The CSS uses 768px, 56rem, 42rem, 40rem and 38rem across
    container and media queries. Two of the media queries (max-width 768px and 40rem) read the
    viewport while the rest read the shell frame container, so a component can disagree with the
    shell about which layout it is in. One named set of container breakpoints in GRAIN would
    settle it.

## Not verified

- Dark-mode contrast: the scripted check flagged chips and close buttons, but a zoom on the chips
  showed dark text on a light pill, so the script was reading the wrong background. A manual pass
  in dark mode is still owed.
- /builder returns the not-found page in this checkout, so the builder was not audited.
- Keyboard order and focus visibility were not tested.

## Status after the fix pass

- Fixed in this repo: findings 1, 2, 3, 5, 7 and 9. The nav labels and shelf text render at 12
  pixels, block-level controls in the page body have a 24 pixel floor on phone and tablet, the
  notes tab strip fades at its trailing edge, phone note summaries stop at three lines, and the
  leading page's paragraph spacing moved from seventeen inline styles to one rule on the spacing
  scale.
- Retracted: finding 6.
- Fixed across GRAIN and this repo: findings 4 and 11, and the deck controls. The shell's phone
  breakpoint moved from 768 to 640 pixels in both repos, GRAIN names its two shell breakpoints as
  --bp-phone and --bp-narrow with a test that fails on any other width, and the presentation
  controls never shrink under 24 pixels. The GRAIN half lives on its ui-tablet-tier-and-targets
  branch, and this repo's half must not merge until that ships in a GRAIN release and the
  dependency is bumped, or the band from 641 to 768 pixels would mix the two layouts.
- Finding 8, settled by the owner: the chat column stays as it is on a wide desktop and starts
  hidden on a desktop window narrower than 1280 pixels when no choice has been saved yet.
- Finding 10 is left open on purpose. The shell CSS here is mostly the portfolio's own desk (the
  phone menu, Browse tiles, the desk door), so moving it wholesale would push one site's product
  into the design system. The generic part moved instead: the breakpoints and the targets.
