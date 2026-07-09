---
id: d3-accent-theme-wiring
status: todo
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

## Tasks

- [ ] Audit current state: is `--color-accent` consumed by links/focus/selection/primary button?
- [ ] One-time component wiring in grain (if not landed) — goes UP into grain, not here
- [ ] Accented theme(s) as pure token overrides; Sourdough unchanged
- [ ] Sync PLAN.md and grain's DESIGN-SYSTEM.md when it lands
