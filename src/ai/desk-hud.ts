// portfolio/src/ai/desk-hud.ts — the chip row markup the desk replaces in its own surface.
//
// Shared by the reasoner, the agent loop and the door's tour leg so the button shape site.js's
// delegated handler expects exists once. Re-exported from desk-reasoner.ts for existing callers.
import { PINNED_CHIP } from "./actions.ts";
import { esc } from "./desk-text.ts";

// The chip row markup the desk replaces [data-surface="suggest-chips"] with. Same button shape
// site.js builds (class + data-suggest-ask), so site.js's delegated click handler fires them; the
// container keeps its data-surface so a later turn can replace it again. Exported: the door's OWN
// tour leg (desk-door.ts, runTourLeg) composes the SAME chip markup for its during/after-tour rows,
// rather than forking the shape.
export const suggestChipsHtml = (list: string[], pin = true): string => {
  // Always pin "What can I do here?" first (the showcase's always-present chip), then the given set
  // (de-duped against the pin) — UNLESS `pin` is false: the tour's intermediate-stop row (door-driven)
  // wants just its one "Stop the tour" affordance, not the full always-present chip alongside it.
  const chips = pin ? [PINNED_CHIP, ...list.filter((s) => s.toLowerCase() !== PINNED_CHIP.toLowerCase())] : list;
  return `<div class="assistant__suggest-chips" data-suggest-chips data-surface="suggest-chips">` +
    chips.map((s) => `<button type="button" class="suggest-chip" data-suggest-ask>${esc(s)}</button>`).join("") +
    `</div>`;
};
