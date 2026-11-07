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
unpushed: 10 | the branch is local for review
verifiedBy: three light and dark browser runs, a forced party, a forced mini hill, a 12 second guard sample, a real trail wipe, a real squash, a stray ant and refresh check, a stray command check, a trail-bend and text-selection check, a sidebar overflow check, a help and query-shortcut check, a rendered note check, and the terminal e2e
doctor: 23 checks, 0 failing, 1 due | the Claude Code context budget remains due
---

The owner's list was about feel before features: ants that do not fidget, trails that do not
clump, a light mode where the scent is visible, a colony that starts sooner, a queen who leaves the
hill, and controls that feel equipped rather than selected. This pass covers those, plus the
sidebar, the no-text mini hill language, the note that teaches the game, and a hidden debug hook
for the checks.

## What changed

**Traffic.** The old wobble was a sideways kick every frame. It is now a small sway folded into a
smoothed heading, with a turn-rate cap. Scout routes are one guaranteed bow, then Chaikin,
not four random jumps. Trails are drawn as the same smooth path with a paper-coloured under-stroke
and a dotted scent line. Ants on a trail get an outbound and a return lane, so they no longer walk
the same three pixels, and a queued ant slows instead of stopping dead. The line is five ants, not
six, and the colony caps at twenty.

**Trails.** A trail now has a state. It is faint while the scout is still walking it, it firms up
when the first letter reaches the hill, and it fades when its patch empties or after ninety
seconds. A spent trail sends a worker out as the next scout. That removes the long pause where the
colony stood in the tunnel waiting for a trail to die.

**Light mode.** The scent uses `--ink-muted` at a stronger weight with a paper halo, and a
`[data-color-scheme="light"]` override. The old stroke was 1.2px of `--ink-faint` at 0.55 opacity,
which was about 1.9:1 on the paper. The new line is visible without reading as body text.

**Soldiers.** Soldiers and guards now use the flyer's quieter colour, with a wider head and two
mandibles. The permanent link line from a mini hill to a trail is gone, so a soldier leaves no
scent. Their patrol gets a six second progress check: a guard that moves less than thirty pixels
re-homes instead of standing in the dirt.

**The opening.** Three scouts and three workers start. The first scout keeps its first find within
240 pixels of the hill, the first egg is laid at six seconds, and the first hatch comes at 3.4
seconds of incubation. The first trail appeared at seven seconds in the measured run and three
trails were open by nine.

**The page is the environment.** The home hill is still sited in the visible viewport, so nothing
makes the player scroll to find it, but scouts can work the whole page afterwards. The automatic
scroll is gone. Mini hills may be built below the fold now, which the owner allowed; the home
hill still opens in view. The ants may work below the fold while the reader reads.

**Refresh and the stray.** A reload now closes the panel, clears the saved colony, and leaves the
launcher, so the sidebar is back to its default view and the player has to click. A normal link
navigation still carries the colony. When the game is closed, a single stray ant sometimes crosses
the reading pane on its own, off any trail, with pauses and a small sway. Click it and it runs for
the status bar launcher and makes it pulse. A `stray` terminal command sends one on demand. It is
scheduled thirty to ninety seconds after load, then two to four minutes after a walk or a click.
It only runs where the launcher is visible, so it is a desktop easter egg.

**The dance.** The colony stops at twenty stolen letters, then fifty, then a rising set of
thresholds. The queen comes out of the hill, the workers circle her, the stolen glyphs orbit, a
short synth melody plays, and then the colony goes back to work. The final overrun uses the same
scene for longer. The player's win stays quiet, which is the note's own argument.

**The controls.** The three tools are named, keyed 1, 2 and 3, and the selected tile presses in.
The cursor changes natively: crosshair for squash, cell for wipe, the page's own cursor for links,
and copy for bait. Squash and Wipe turn off text selection on the page so a drag does not select
copy; Links turns it back on. A squash flattens the ant under a quick ring and a dust mark. A wiped trail
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

**The note.** The public note now carries the bug joke ("My portfolio has bugs now"), the
always-visible launcher and the help line, the ninety second trail fade, the soldier and mini hill
dots, the twenty and fifty letter dances, the refresh reset, the stray ant and its `stray`
command, and the ground and sound details.

**The ground.** A quiet ground patch sits around each hill: filled stones, thicker grass blades,
and a leaf or a mushroom depending on the hill. Two more small pieces are scattered in empty space
in the reading pane, so the page feels inhabited beyond the mound. It is theme-token colour,
never catches a click, and stays still under reduced motion. A mini hill gets a smaller tuft.

**The mini hill language.** No words or count dots on the page. The mound thins as it takes hits,
and the guards are the ants visible on patrol. The element is a keyboard button with an aria label
for screen readers.

**Sound.** One small synth, no files: a master gain, a compressor, oscillators and a reusable
noise buffer. Cues cover the wake, a letter lift, a delivery, a trail laid, a trail fade, an egg,
a hatch, a soldier, a squash, a soldier hit, a seal, bait, a build tick, a hill break, a guard, a
flyer, the dance and the overrun. Silence is still the default.

## Gate output

The focused browser suite passed after the renames and the lint cleanup.

```text
$ bun run check
$ tsc --noEmit

$ bun test
 875 pass
 0 fail
 3804 expect() calls
Ran 875 tests across 48 files. [9.74s]

$ bunx playwright test e2e/terminal.e2e.ts --ignore-snapshots
  10 passed (7.7s)

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
trails. The session also showed a light run, a dark run, a forced dance, a close crop of the ground
decor, a close crop of a mini hill, a real trail wipe, and a real
squash.

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
patrol away from it. Look at the ground patch and decide whether 0.55 opacity is the right amount
of quiet. The dance is the one call that is still a taste question: nine seconds, queen on the
hill, glyphs in orbit.
