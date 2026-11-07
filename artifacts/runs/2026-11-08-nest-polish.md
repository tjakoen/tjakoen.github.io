---
title: The Nest gets calmer traffic, a visible light mode, and a dance between letters
date: 2026-11-08
status: complete
lane: gated
branch: feat/nest-polish
scope: [scripts, content/notes/the-site-has-ants.md, content/tours/review-nest-controls.md, content/media/notes, plans/ant-nest-game.md, e2e/terminal.e2e.ts, artifacts/runs]
touched:
  - scripts/nest-mockup.js
  - content/notes/the-site-has-ants.md
  - content/tours/review-nest-controls.md
  - content/media/notes/nest-trails.jpg
  - content/media/notes/nest-mini-hill.jpg
  - content/media/notes/nest-og.png
  - plans/ant-nest-game.md
  - e2e/terminal.e2e.ts
  - artifacts/runs/2026-11-08-nest-polish.md
diffstat: one game file of 760 changed lines, the note copy, its two screenshots and social card, the review tour and the terminal e2e
unpushed: 31 | the branch is local for review
verifiedBy: three light and dark browser runs, a forced party, a forced mini hill, a 12 second guard sample, a real trail wipe, a real squash, an animated stray check, a stray-exit check, a natural stray-run check, a trail-shape check, a scout-direction check, a guard-defence check, a party check, a guard-range check, a restore-mounds check, a keyboard-layout check, a lock-toast check, a sound-hint check, a home-spot check, a page-leave confirm check, a stray command check, a session stray check, a trail-bend and text-selection check, a page-switch close check, a bread-overlap check, a sidebar overflow check, a help and query-shortcut check, a rendered note check, and the terminal e2e
doctor: 23 checks, 0 failing, 1 due | the Claude Code context budget remains due
---

The owner's list was about feel before features: ants that do not fidget, trails that do not
clump, a light mode where the scent is visible, a colony that starts sooner, a queen who leaves the
hill, and controls that feel equipped rather than selected. This pass covers those, plus the
sidebar, the no-text mini hill language, the note that teaches the game, and a hidden debug hook
for the checks.

## What changed

**Traffic.** The old wobble was a sideways kick every frame. It is now a small sway folded into a
smoothed heading, with a turn-rate cap. Scout routes are one cubic C or S through two random
control points, with a jagged little walk in the line, then Chaikin, not four random jumps. Trails are drawn as the same smooth path with a paper-coloured under-stroke
and a dotted scent line. Ants on a trail get an outbound and a return lane, so they no longer walk
the same three pixels, and a queued ant slows instead of stopping dead. The line is five ants, not
six, and the colony caps at twenty.

**Trails.** A trail now has a state. It is faint while the scout is still walking it, it firms up
when the first letter reaches the hill, and it fades when its patch empties or after ninety
seconds. Each spent trail sends its own worker out as the next scout; the old one-scout rule
dropped the replacements when two patches emptied together, which is why three trails could fall to
one. That also removes the long pause where the colony stood in the tunnel waiting for a trail to die.

**Light mode.** The scent uses `--ink-muted` at a stronger weight with a paper halo, and a
`[data-color-scheme="light"]` override. The old stroke was 1.2px of `--ink-faint` at 0.55 opacity,
which was about 1.9:1 on the paper. The new line is visible without reading as body text.

**Soldiers.** Soldiers and guards now use the flyer's quieter colour, with a wider head and two
mandibles. The permanent link line from a mini hill to a trail is gone, so a soldier leaves no
scent. Their patrol gets a six second progress check: a guard that moves less than thirty pixels
re-homes instead of standing in the dirt.

**The opening.** Three scouts and three workers start. A block with a trail or a scout is taken,
so the first three scouts and later ones stay off each other's source. The first three stay in
view: the first takes the closest letter, the second the farthest on the opposite side of the
mound, and the third the most spread-out remaining spot. The first egg is laid at six seconds, and
the first hatch comes at 3.4 seconds of incubation. The first trail appeared at seven seconds in
the measured run and three trails were open by nine.

**The page is the environment.** The home hill is sited in a random empty cell of the visible
viewport, top or bottom, rather than the same roomy top-right gap; the old roomiest-spot rule was
replaced. Scouts can work the whole page afterwards. The automatic
scroll is gone. Mini hills may be built below the fold now, which the owner allowed; the home
hill still opens in view. The ants may work below the fold while the reader reads.

**Refresh, navigation and the stray.** A reload or a move to another page closes the panel, clears
the colony, and leaves the launcher, so the sidebar is back to its default view and the player has
to click. The colony lives on the page where it was opened. A page link with Links on asks first
with a leave confirmation; other redirects get the browser's own beforeunload prompt. When the game
is closed, a single stray ant sometimes crosses the reading pane on its own, off any trail, with
pauses and a small sway. It uses the colony's animated ant art, so its legs move. If nobody
clicks it, it slides off the nearest edge after fourteen to nineteen seconds. Click it and it runs
down the reading pane, along the status bar, and up into the launcher; the launcher pulses. A click writes `nest-stray-clicked` to sessionStorage,
so the random ant does not return in that tab, across page loads, until the tab is closed. A `stray`
terminal command sends one on demand. It is scheduled thirty to ninety seconds after load, then two
to four minutes after a walk or a click. It only runs where the launcher is visible, so it is a
desktop easter egg.

**The dance.** The colony stops at twenty stolen letters, then fifty, then a rising set of
thresholds. The queen leaves the sidepanel nest for a stage outside the hill, the workers ring her
and dance, the sidepanel pulses with a border glow and a sway, the stolen glyphs orbit, a short
synth melody plays, and then the colony goes back to work. The queen is hidden in the sidepanel
while she is outside. The final overrun uses the same scene for longer. The player's win stays
quiet, which is the note's own argument.

**The controls.** Four colony tools are named: Squash, Wipe, Bait and Seal, with Bait and Seal on
text tiles beside the two page tools. Links, mute, pause and restore are the utility row below;
Links keeps key 3. The cursor changes natively: crosshair for squash, cell for wipe, the page's own
cursor for links, and copy for bait. The link lock covers the whole page, not just the reading pane,
so a sidebar link is blocked while Squash or Wipe is on. A blocked link is not silent: the cursor
is not-allowed and a toast says the links are locked and offers Use Links (3), which switches the
tool. Links then asks before a page link leaves, because leaving ends the colony. Squash and Wipe turn off text selection on the page so a drag does
not select copy; Links turns it back on. A squash flattens the ant under a quick ring and a dust mark. A wiped trail
snaps into two pieces, sprays scent dots, and then the ants scatter.

**The sidebar.** The panel is now one instrument: a status line, the Braille nest, a two-line
activity log, three filled meters for page holds, stores and the next egg, a compact stat grid, the
tool tiles, a persistent links locked or links open chip, the colony controls, and a footer link to
the note. The meter classes are namespaced to the panel, because GRAIN's global `.meter` atom was
clipping the labels to eight pixels. The panel also clips horizontally, so a long larder or status
cannot create a sideways scroll. The inline "How to play" block is
gone. The link opens `/notes/the-site-has-ants` in a new tab so the colony keeps running.

**The launcher.** The ant now sits in the status bar on every page. The game loads with the page
and stays closed until the ant is clicked or `nest` is typed in the terminal. `?nest` is just a
page now, not a shortcut into the panel. The terminal command opens the panel, and `help` lists it
next to `reveal the ant colony`. `?nest-debug` only exposes the local test hooks.

**The reset.** Restore page now also moves the home mound to a new empty spot, removes and re-sites
the mini mounds, retires the old trails, and sends the page ants home to the new mound.

**The note.** The public note now carries the bug joke ("My portfolio has bugs now"), the
always-visible launcher and the help line, the ninety second trail fade, the soldier and mini hill
dots, the twenty and fifty letter dances, the refresh reset, the stray ant and its `stray`
command, and the sound details.

**The page.** The scattered ground decor is gone; the hill and the trails sit on the page alone.
The first two mini hills are sited near the main hill; later ones spread out. The bread is a PRE,
and the first obstacle scan skipped PRE; it is now solid for the hill and the mini hills.

**The mini hill language.** No words or count dots on the page. The mound thins as it takes hits,
and the guards are the ants visible within a short range of their mound. Clicking a guarded mound calls its guards home;
clearing them splits the mound open with a space through the Braille, and no new guards spawn. The element is a keyboard button with an aria label for screen readers.

**Sound.** One small synth, no files: the unmute button pulses for eight seconds when the colony
opens, then settles on hover, focus, click or time. A master gain, a compressor, oscillators and a reusable
noise buffer. Cues cover the wake, a letter lift, a delivery, a trail laid, a trail fade, an egg,
a hatch, a soldier, a squash, a soldier hit, a seal, bait, a build tick, a hill break, a guard, a
flyer, the dance and the overrun. Silence is still the default.

## Gate output

The focused browser suite passed after the renames and the lint cleanup.

```text
$ bun run check
$ tsc --noEmit

$ bun test
 894 pass
 0 fail
 3885 expect() calls
Ran 894 tests across 49 files. [10.52s]

$ bunx playwright test e2e/terminal.e2e.ts --ignore-snapshots
  17 passed (1.2m)

$ bunx oxlint scripts/nest-mockup.js
Found 0 warnings and 0 errors.

A Chromium check spawned the stray, measured 171 pixels of travel in 2.2 seconds, clicked it and
saw the launcher pulse, then reloaded and found the panel closed and the launcher still visible.
A second check opened `/?nest` and confirmed the launcher was there but the panel stayed closed. A
third typed `help` in the terminal and read back `nest` next to `reveal the ant colony`.

$ bun tools/dsh-loop/cli.mjs end
graphify update: ok
bun run check: ok
bun tools/lint-gate.ts: ok
```

The lint gate still reports one unrelated `no-unused-expressions` in `scripts/site.js`, which the
run does not touch. The game file itself is clean.

## What was shown

The note's two screenshots and its social card were regenerated against the new panel and the new
trails. The session also showed a light run, a dark run, a forced dance, a close crop of a mini hill,
a real trail wipe, and a real squash.

## What was not done

The full browser suite was not run; the focused terminal spec and the unit suite were. The phone
layout still needs its own pass, because the launcher sits in the status bar and the test harness
is desktop. That also means the stray ant is desktop only for now; a phone needs a different
destination than the status bar launcher. The two untracked loop notes in the tree belong to another session and were left
alone. The old screenshot inside the first note image is recursive by nature and was accepted.

## What needs human eyes

Play the first minute on the home page and on a note, in both colour schemes. Watch whether the
new trail weight reads as scent rather than as a dotted rule. Wipe a trail and squash a soldier to
see whether the two animations land at the right speed. Let a mini hill stand and watch a guard
patrol away from it. Click a guarded mound, clear the guards, and decide whether the split art reads as exposed. Watch the trail shape and decide whether the cubic reads as walked
rather than plotted. The dance is the one call that is still a taste question: nine seconds, queen on a
stage outside the hill, dancers in a ring, the sidepanel pulsing.
