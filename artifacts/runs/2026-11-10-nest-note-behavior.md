---
title: The ants in the note walk forward and fight by the colony's rules
date: 2026-11-10
status: complete
lane: gated
branch: codex/nest-note-behavior
scope: [scripts/figure-nest.js, view/components/molecules/live-figure, content/notes, content/media/notes, content/tours, e2e/terminal.e2e.ts, artifacts/runs]
touched:
  - scripts/figure-nest.js
  - view/components/molecules/live-figure/live-figure.css
  - content/notes/the-site-has-ants.md
  - content/media/notes/nest-social.svg
  - content/media/notes/nest-social.png
  - content/media/notes/nest-og.png
  - content/tours/review-nest-note-figures.md
  - e2e/terminal.e2e.ts
  - artifacts/runs/2026-11-10-nest-note-behavior.md
skills: [loop-standard, session-loop, graph, figures, note-standard, voice, tour-standard, ai-development]
unpushed: 87 | All 87 commits relative to origin/main were already on the source branch. This session made no commits.
diffstat: 9 paths covering the figures, note, two card exports and their SVG source, browser checks, tour, and this report
doctor: This report supplies the missing ledger fields. The worktree skill mounts, missing graph, and PANTRY registration remain due. The close-gate and Nest lazy-load evidence remain due.
verifiedBy: independent read-only review, followed by a second look at the changes made in response
---

The note's sprites now face their direction of travel. The left-facing artwork is drawn with the
same half-turn the game applies to its heading. The fight figure cycles through guard and flyer
duels and two group encounters, using the game's odds and power thresholds. The rival figure shows
founding, foraging, and banking letters. It ends before the later siege. Each figure is a small
example of the simulation, with chosen starting conditions.

The social artwork uses the homepage title's Redaction outlines and the game's
ant and mound dot patterns. The square social card and the wide link preview share that artwork.
Both crops put the note headline and site address beneath the scene. The trail leads the
ants over the remaining letters toward the mound. The scene and caption share a left edge. The
square card gives the headline two lines, while the wide crop fits it on one. Both were checked
at thumbnail size.

## Gate output

```text
$ tsc --noEmit
```

```text
lint gate: level. 4486 flag(s) total (oxlint + voice-lint), matching or under the 4486 in tools/lint-baseline.json (generated 2026-11-09).
```

```text
 899 pass
 6 fail
 3955 expect() calls
Ran 905 tests across 51 files. [304.58s]
```

All six failures were timeouts in the full Bun run. They covered the unserved Mermaid fixture,
three content-routing cases, the Nest engine lifecycle, and the close gate's Git fixture. The
focused Nest rule and engine run completed with a thirty-second timeout per test.

```text
 9 pass
 0 fail
 50 expect() calls
Ran 9 tests across 2 files. [20.65s]
```

```text
  ✓  1 e2e/terminal.e2e.ts:723:1 › note ants face their travel direction and illustrate the game's combat cases (35.9s)
  ✓  2 e2e/terminal.e2e.ts:765:1 › the note mounts its six live colony boxes (1.2m)

  2 passed (2.5m)
```

The first Playwright run reproduced the old fight with six ants where the guard duel needs two.
The passing run checked the travel direction against the visible sprite, observed all four fight
results, and checked the six scene loops. The note's share block loaded the square image at
1200 by 1200, and the Open Graph metadata pointed to the 1200 by 630 wide image. Both descriptions
matched the new art. Chromium screenshots covered the fight on desktop and phone and the rival
foragers on desktop. The screenshots and tests cover the staged examples. The outcome of any
particular encounter in the full game remains up to the colony and the player's interference.

The full Playwright run with four workers recorded 521 passes and 43 failures. This included
site-wide routing and WCAG checks, full-game checks, and three figure checks. The two figure
timing tests exceeded their deadlines while waiting for real animation frames. The caste test
looked for an obsolete wing selector. The follow-up drives simulation time with a test-only
frame driver and checks the wing animation through its computed CSS.

```text
  43 failed
  521 passed (2.8h)
```

The four focused figure checks passed after those changes. The full browser suite has not been rerun.

```text
  ✓  1 e2e/terminal.e2e.ts:107:1 › the interactive terminal (third client of the one door) › the caste figure animates the flyer's wings (9.1s)
  ✓  3 e2e/terminal.e2e.ts:755:1 › note ants face their travel direction and illustrate the game's combat cases (6.8s)
  ✓  2 e2e/terminal.e2e.ts:96:1 › the interactive terminal (third client of the one door) › note figures keep their event loops with reduced motion enabled (21.4s)
  ✓  4 e2e/terminal.e2e.ts:794:1 › the note mounts its six live colony boxes (23.4s)
  4 passed (1.0m)
```

## Diffstat and scope

The patch touches nine paths, listed above. The game branch already had newer gameplay work in
progress when this note work began, so the changes live on a separate branch based on
2d9e4154. The working tree holds the nine paths for review.

## What was not done

The changes have not been published. The worktree is outside the registered PANTRY root. Its
doctor had zero failures and two due checks, covering missing skill mounts and missing evidence
in the close-gate and Nest lazy-load reports. The source checkout also reported four incomplete
run records, including the analytics fallback and budget scope runs. Those records remain due.

## What needs human eyes

Watch the three builders give way to the rival's workers, then watch the four fights in order.
Open the social card at feed size and check how quickly the gap in the homepage heading and the
ants carrying its D read together.

[Review tour](http://localhost:3156/notes/the-site-has-ants?crumb=review-nest-note-figures&crumb-mode=dev&crumb-frame)
