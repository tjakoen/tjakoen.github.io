---
id: d3-accent-theme-wiring
status: done
track: D
depends: []
touches: [PLAN.md]
owner: ai
---

# Accent color + theme varieties wiring

Decided (SPLIT-PLAN § "The name: BREAD"): one signature accent hue per theme — a single
`--color-accent` slot reaching links, focus, `::selection`, and the primary button fill; Sourdough
stays hueless. The detailed design lives in [PLAN.md](../PLAN.md) (this repo). SPLIT-PLAN notes it
was "being wired in a parallel thread", so the first task is establishing what actually shipped.

**DONE 2026-07-12 (audit follow-up).** The audit found the accent's full reach was 3/4 wired —
links, `::selection`, and primary button all consumed `--color-accent` (the parallel thread had
landed those + both accented themes + the visitor theme-cycle) — but **focus rings never landed**
(no `:focus-visible` rule anywhere; cmdk input had a bare `outline:none`). Completed the last quarter
in grain `637630e`: a global `:focus-visible { outline: 2px solid var(--color-accent) }` (hueless by
default, tints under Baguette/Brioche) + dropped cmdk's `outline:none`. Cascaded the grain bump to
mill/proof/pantry/portfolio (all repinned, tsc + tests green, pushed). Verification is code-level
(rule ships into each consumer's grain copy; standard pseudo-class + token, no no-op risk); a browser
spot-check of the ring under each theme is a nice-to-have follow-up (the e2e harness wasn't runnable
in that session).

## Tasks

- [x] Audit current state: is `--color-accent` consumed by links/focus/selection/primary button?
      → links ✓ (`global.css` `a{}`), `::selection` ✓, primary ✓ (`--color-primary` chains off accent);
      **focus was the gap** (nothing consumed it; cmdk killed its own outline)
- [x] One-time component wiring in grain (if not landed) — goes UP into grain, not here
      → grain `637630e`: global `:focus-visible` accent ring + cmdk `outline:none` removed
- [x] Accented theme(s) as pure token overrides; Sourdough unchanged
      → already shipped (`grain/styles/themes/{baguette,brioche}.css`, token-only; Sourdough hueless)
- [x] Sync PLAN.md and grain's DESIGN-SYSTEM.md when it lands
      → PLAN.md caveat updated to "landed"; DESIGN-SYSTEM.md already documented the accent slot
