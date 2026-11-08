# Nest: the page owner's ecology

Status: PHASE 0 IMPLEMENTED. Phases 1-6 remain the next phase. The worktree is
`fix/ant-edge-cases`; the audit session's main tree stays untouched.

## The decision this plan is built on

The player is the page owner, not the colony. The nest is the antagonist: the queen is theirs, the
worship is their ritual, and the player never gives the colony orders. The player's verbs are
pest control and ecology: squash, wipe, bait, seal, lock links, lure, summon, introduce.

Two consequences shape everything below:

1. **There is no player-built mound and no player queen.** A second player colony would need a
   second queen and a colony switch, which weakens the one animal the game is about. The only other
   queen belongs to a rival colony.
2. **A second mound is the colony's decision.** The existing mini hill is already that: the stores
   fill, a builder leaves, a satellite rises. The player can allow it, squash the builder, seal it,
   or use the split attention. That is the right agency: influence, not command.

## Goals

- Make the colony's autonomy legible and fun, without turning Nest into a colony sim.
- Give the player decisions through the page-owner verbs, not through colony management.
- Add pressure and variety that reuse the trail, letter, crew and lift systems.
- Keep the current single queen and the one-page ecology frame.
- Keep 60fps with 20 ants, three mounds and a rival on the page.
- Stay honest in the note: the colony is the enemy, the player is the page owner.

## Non-goals

- A player-controlled queen or multiple queens.
- A player-built mound or a second player colony.
- A win screen, a reserve army, or a game over.
- A full canvas rewrite of the game.
- Multiplayer.
- Rewriting the simulation; this is a render and content pass.

## Success criteria

- A new player can say, after 30 seconds, that the ants are not theirs and the nest is the enemy.
- A rare environmental sweet card can be clicked, unwrapped, placed, eaten piece by piece, and
  resolved without a softlock. Ignoring it lets it fade; it cannot be banked.
- The vacuum switch and the anteater figure can be clicked, resolved, or ignored. They are
  environmental triggers, not inventory.
- The rival founds at the start, stays a nuisance, never exceeds the main colony's strength,
  retreats when its last trail is destroyed, and returns after a randomized wait.
- Rival theft is a second color on the page-left bar; it merges back to the main color on retreat
  and returns with the rival.
- The satellite mound is the colony's, and the player can prevent or exploit it.
- The full e2e, unit and typecheck pass; the lint gate is understood.
- A perf harness shows 60fps and no long tasks at the target entity count.

## Phase 0: Make the loop cheap first

This is the foundation. Add content only after the render path has headroom. Measured on the
current build: 60.1 rAF/s, p50 16.7ms, p95 17.6ms, no long tasks; 843 layout reads/s, 1,040
style/class mutations/s, 10 full Braille nest rebuilds/s, 1,223 DOM nodes at 6 ants.

- [ ] Cache the main rect once per scan in `onScreen`; it currently reads it per candidate letter.
- [ ] Split the nest into a static terrain layer built once and a dynamic layer for ants, eggs and
      the queen. Prefer a canvas overlay or a cached static HTML string plus a small moving layer.
- [ ] Draw the dynamic nest at 5-10Hz, not 60; skip the draw when paused.
- [ ] Move page ants with `transform: translate3d` instead of `left`/`top`; write only when the
      position changed; skip the `walk` class toggle when it is already correct.
- [ ] Cache the meter cell count with a `ResizeObserver`; stop reading `clientWidth` six times per
      draw; skip unchanged text writes.
- [ ] Count roles in one pass instead of four `filter` calls.
- [ ] Stop scheduling rAF while paused or hidden; reset `last` on resume.
- [ ] Avoid `state.ants.slice()` per frame where a length snapshot is enough.
- [ ] Add a perf harness that runs 6 and 20 ants and reports rAF, frame p50/p95, long tasks, layout
      reads, mutations and nest rebuilds.
- [ ] Verify 20 ants, three mounds and a trail network at 60fps.

Exit: the perf harness is green at 20 ants; no long tasks; the existing e2e still passes.

Phase 0 result (2026-11-08): the persistent grid, page-rect cache, translate3d ant moves, meter
cache and paused loop are in. At 6 ants the loop held 60fps with p95 16.8ms, 60 layout reads per
second, no full pre rebuilds and no long tasks. At 20 total ants, 6 of them on the page because the
trail cap keeps the rest in the nest, it held 60fps with p95 17.0ms, 60 layout reads per second, no
full pre rebuilds and no long tasks. The 20 page-ant target waits for the rival and more trails.
The unit suite, the 29 terminal e2e tests, the typecheck and oxlint pass. The lint gate still
reports the two advisory regressions from main.

## Phase 1: Say whose nest it is

The game already behaves like a page defense, but the panel reads like a colony sim.

- [ ] Keep the panel as the enemy's nest, but make the framing explicit. The heading can stay
      "Nest · Colony 01"; the copy around it should not imply ownership.
- [ ] Review the panel copy: "the colony wakes", "the colony dances", "the queen" are the enemy's
      actions, not the player's. Keep them as observations.
- [ ] Make the player's role visible in the tool help: the page, the copy, the links.
- [ ] Update the note's framing and the game's public description to match.
- [ ] Add one short line in the panel or note: the player is the page owner; the colony is not
      theirs.
- [ ] Screenshot the panel and note for the run report.

Exit: a reader can explain the role after one screen.

## Phase 2: The sweet as the player's lure

The sweet is the first environmental event. It is a rare card that appears in the page, not a
button in the panel. It fades if the player ignores it, and it cannot be banked.

Mechanic:

- A rare card appears on a free patch of the page and slowly fades. It is the only sweet in play.
- Clicking the card unwraps it and starts a short placement step. The player clicks a free patch;
  the sweet is placed there.
- The sweet is a clump of real letters, not a new mound. The main mound sends a scout; the scout
  calls a crew; the crew eats the sweet piece by piece. Each piece adds food to the larder and
  shrinks the clump.
- The sweet is a decoy: the ants eat it instead of the copy, which buys the page time.
- The rival can contest the sweet. The anteater can interrupt it.
- If the card fades before it is clicked, it is gone. If the sweet expires or is eaten, it is gone.
- The player can see the trade: spend a click and a short placement now, buy time, risk a crowd.

Tasks:

- [ ] Add the rare sweet card as an environmental trigger with a fade timer and a click-to-unwrap
      step.
- [ ] Add the placement step: click a free patch; cancel or timeout returns nothing and banks
      nothing.
- [ ] Add a `sweet` state object with position, letters, remaining, ttl and eaters.
- [ ] Draw the sweet as its own glyph cluster, not by stealing text nodes from the page copy;
      page-left never counts the sweet.
- [ ] Route the main mound's scout to the sweet before normal patches.
- [ ] Reuse the crew, `lift`, carry and larder path for each eaten letter.
- [ ] Shrink the clump visually as letters are eaten.
- [ ] Add expiry and the resolve log.
- [ ] Prevent a softlock: if the sweet is unreachable or the ants die, the sweet frees its claim.
- [ ] e2e: click, place, scout, eat one piece, eat the rest, expiry; ignore and fade; no page-left
      loss from the sweet.
- [ ] Screenshot the card, the unwrap, the placement and the scout call.

Exit: the sweet works end to end and does not block the core loop.

## Phase 3: Environmental pest-control events

Rare, skippable, and never banked. One environmental trigger at a time, roughly every 90-180
seconds. The trigger lives in the page for a short window; if the player ignores it, it leaves and
the chance is gone. Clicking it starts the effect immediately.

- [ ] Add the event scheduler and a shared environmental trigger object: type, anchor, lifetime,
      clicked, resolved. There is no event inventory and no stored charge.
- [ ] **Sweet card** (Phase 2) is one trigger type; it fades, then unwraps and places.
- [ ] **Vacuum switch:** a switch appears in a free patch with room. Clicking it starts a quick
      straight sweep from one edge of the page to the other. The sweep sucks up every ant on its
      path, from either colony, and leaves letters and trails. The switch fades if ignored.
- [ ] **Anteater:** a figure peeks from a page edge. Clicking it unrolls a tongue along a wavy,
      non-linear path across the page, sticks ants it crosses, from either colony, then retracts.
      It is rare. The figure fades if ignored.
- [ ] Add the resolve state, log, sound and one clear outcome for each trigger.
- [ ] No trigger can overlap the party or another trigger; no trigger can softlock the page.
- [ ] e2e: click and resolve the vacuum; click and resolve the anteater; ignore both and let them
      fade; no page-left crash.
- [ ] Screenshot each trigger in place and its effect.

Exit: each trigger is optional, legible and safe to ignore.

## Phase 4: The rival colony

The only other queen. The player never controls her. The rival is a second colony with its own
mound, trails, ants, queen and inverse color. It is a nuisance, never a second player base, and it
is never stronger than the main colony. It retreats, waits, and comes back.

- [ ] Found the rival at game start in a distant patch, with its own queen, 1 scout, 2 workers and
      a short trail to one nearby letter. It opens smaller than the main colony and does not wait
      for a milestone.
- [ ] Add a second colony object with a `side` property. Reuse the ant, trail, letter and crew
      code; do not fork it.
- [ ] Cap the rival at `min(8, max(1, ceil(mainAnts * 0.6)))` and never let its combat power
      exceed the main colony's. It does not replace losses above the cap; if the main colony
      shrinks, excess rival ants return to the mound. It does not field soldiers unless the main
      colony fields guards.
- [ ] The rival harvests the same page letters and contests the sweet.
- [ ] Combat at contested letters and trail intersections, not between every pair. Workers 1,
      soldiers and guards 2; more power at the node wins; losers scatter or die.
- [ ] The main queen's ants fight the ants in a rival trail at a contested letter or where the
      two trails cross. The fight uses the same power check; if the main side wins, the trail is
      destroyed. The player can tip the fight with squash, wipe or bait, but cannot order the ants.
- [ ] The player's tools target both colonies: squash rival ants, wipe rival trails, bait one side.
- [ ] A rival trail can also be destroyed by the player's wipe. When the last rival trail is gone,
      the rival mound is destroyed, the queen retreats, and the rival ants scatter. No raid on the
      queen is required.
- [ ] After the retreat, schedule a return after a randomized wait. No return during the party. On
      return, a new rival mound rises in a distant patch with the same small founding group and the
      same cap. It is the same rival queen, not a new player colony.
- [ ] Add `rivalLost` to the page-left state and a second color token. The meter absorbs the
      rival's theft in the same total; the rival color is the rival's share of the lost portion. On
      retreat, the rival color merges back into the main color and the page-left total does not
      change. On return, new rival theft uses the rival color again.
- [ ] No game over. The rival takes letters and forces defense, then leaves and returns later.
- [ ] Resolve the rival cleanly: remove the mound, trails, ants and art, then schedule the return;
      no stuck state.
- [ ] e2e: founding, stealing, contest, trail fight, last-trail destruction, retreat, meter
      recolor, cooldown, return, no stuck; the player's queen remains.
- [ ] Screenshot the inverse-color rival, the two-color bar and the return.

Exit: the rival is a recurring nuisance and a real choice, not a second player base.

## Phase 5: The colony's satellite mound

The existing mini hill is the seed. The player never builds it.

- [ ] Keep the colony's builder; the player can squash it to prevent the satellite.
- [ ] Let a standing mini hill take a role the colony chooses: nursery, store, or guard post. The
      player does not command the role; the colony's state decides it.
- [ ] The queen stays in the main mound. Eggs are carried to a nursery; the satellite has no queen.
- [ ] The player's influence is indirect: allow it, seal it, wipe its trail, squash its guards.
- [ ] No queen switching, no second player colony.
- [ ] e2e: the builder, the satellite, the player's prevention, no stuck.

Exit: the second location exists without a second queen or a second player colony.

## Phase 6: Docs, tests and the audit

- [ ] Update the note and the plan with the final mechanics and the page-owner frame.
- [ ] Regenerate the note screenshots.
- [ ] Add the run report with the actual totals and findings.
- [ ] Run the gates: `bun run check`, `bun test`, `bun tools/lint-gate.ts`, the full Playwright,
      and `bunx oxlint` on the changed files.
- [ ] Audit the concurrent main again: the custom domain, the loop pair, the social cards and the
      desk commands; confirm they still fit with the new game.
- [ ] Note any lint baseline drift rather than silently accepting it.

Exit: the suite, the note, the screenshots and the audit are current.

## Order and rough size

| Phase | Why now | Rough size |
| --- | --- | --- |
| 0 Loop budget | Unblocks every added entity | 1-2 days |
| 1 Role framing | Cheap, prevents the wrong mental model | 0.5 day |
| 2 Sweet | Reuses the most code; proves the environmental trigger | 2-3 days |
| 3 Anteater and vacuum | Reuses the trigger object; spectacle | 2-3 days |
| 4 Rival colony | The big content; needs Phase 0 | 4-6 days |
| 5 Satellite mound | Finishes the second-location question | 2 days |
| 6 Docs and audit | Keeps the public record honest | 1 day |

## Test plan

- Perf harness at 6 and 20 ants: rAF, frame p50/p95, long tasks, layout reads, style mutations,
  nest rebuilds.
- Unit tests for the sweet card, the placement window, trigger lifetimes, the rival cap, the trail
  fight, retreat and return, the page-left recolor and the satellite roles.
- e2e for the sweet card, the vacuum, the anteater, the rival trail fight, the rival return, plus
  the existing 28.
- A manual pass at 1440x900 and a narrow viewport; the game must still read on a phone.
- The lint gate and the note's prose.

## Open questions

- The sweet card's fade window and the placement window. Proposal: 10 seconds to click, then 15
  seconds to place.
- The vacuum line: horizontal only, or oriented by the switch? Proposal: horizontal, from the
  switch's row, with a short telegraph.
- The anteater tongue's exact path and capture radius; whether stuck ants are removed with it or
  dropped when it retracts. Proposal: removed.
- The rival cap: is about 60% of the main colony, rounded up, with a hard cap of 8, the right
  nuisance level? The first pass uses that and starts the rival at 3 ants.
- Whether the rival's second color should recolor instantly or fade on retreat. Proposal: fade over
  about 400ms.
- How the main queen's ants meet a rival trail: at a crossing, at a contested letter, or on a
  patrol. The plan uses a crossing or a contested letter. Should the player be able to bait a fight?
- The rival's return wait. Proposal: 45-90 seconds, randomized, and no return during the party.
- The return location and warning. Proposal: a distant patch, with a short sign at the page edge,
  never on the same patch as the old mound.

## The one-line version

The player is the page owner. The nest is the enemy. You do not build a mound; you lure, block,
seal, summon and introduce. The sweet is a fading card you click and place, the vacuum switch and
the anteater figure are rare environmental triggers, the rival is a nuisance colony whose trails
you can cut or whose ants the queen's ants can beat, and who retreats and later returns, and the
satellite is the colony's own move. Fix the loop first, then the sweet, then the triggers, then
the rival.
