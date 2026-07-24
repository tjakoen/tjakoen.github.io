// portfolio/ai/tour.ts — the desk's A2 "guided tour": a fixed, CODE-enumerated walk through four
// top-level stops. Zero model: the stop list, the copy, and the pacing all live here as plain data,
// so the tour runs identically whether the local model is loaded, loading, or offline (CLAUDE.md
// design law — code enumerates routes, never the model). Pure + client-safe (no DOM/storage access),
// same style as actions.ts: the reasoner (desk-reasoner.ts) drives the FIRST leg from this data, and
// the door (desk-door.ts) drives every leg after, since no chat.send happens between stops.

/** One stop on the tour. `navLink` is the VISIBLE sidebar link the lamp travels to and "clicks" —
 *  every stop here is a top-level nav item, so it equals `route`. `announce` is the arrival chat
 *  bubble that lands on THIS stop (typed by the reasoner for the first leg, replayed via the
 *  arrival stash — ARRIVE_KEY — for every leg after). */
export interface TourStop {
  route: string;
  navLink: string;
  label: string;
  announce: string;
}

// The tour's route order. Four stops, front page first, notes last — the closing stop doubles as the
// hand-back ("that's the tour, ask me anything"). Labels match how the catalog/nav already name these
// top-level routes (catalog.ts's humanize(), the sidebar's own data-tab-label) — "Home" for "/", the
// section name for the rest — so the lamp's narration reads the same word a human would click.
export const TOUR_STOPS: TourStop[] = [
  {
    route: "/",
    navLink: "/",
    label: "Home",
    announce: "First stop: TJ's front page, home of the resume and the doors into everything else.",
  },
  {
    route: "/grain",
    navLink: "/grain",
    label: "Grain",
    announce:
      "Second stop: GRAIN, the AI-interaction design system this desk itself runs on. Every surface " +
      "here can be run by a person or by an AI through the same door.",
  },
  {
    route: "/batch",
    navLink: "/batch",
    label: "Batch",
    announce:
      "Third stop: BATCH, the no-build hypermedia substrate the whole site runs on. Every page is a " +
      "real document, working with no JavaScript underneath.",
  },
  {
    route: "/notes",
    navLink: "/notes",
    label: "Notes",
    announce:
      "Last stop: the notes, TJ's long-form writing on building this stack and teaching with AI. " +
      "That's the tour. Ask me anything, or keep reading on your own.",
  },
];

/** Where the tour's cursor rides across the page load (the MPA loses JS state on navigation) — the
 *  door reads/writes this in sessionStorage, the same ARRIVE_KEY pattern desk-door.ts already uses
 *  for the arrival announce. Kept as a NAMED constant (not a literal at each call site) so both the
 *  reasoner and the door can never drift on the key. */
export const TOUR_KEY = "desk-tour";

// How long the tour lingers on an intermediate stop before the lamp moves on — long enough for a
// visitor to actually read the one-sentence announce (not a hard cut), short enough the tour doesn't
// drag. 4000ms specifically because the audit harness (tools/desk-audit.ts, `settle()`) treats a
// reply as done and starts reading it after ~2s of no change (`stableMs`); the dwell must clear that
// with room to spare or the harness would read the reply mid-dwell and never see the next hop land.
export const TOUR_DWELL_MS = 4000;

/** Defensive parse of the stashed tour cursor: valid JSON, an object, an integer `at` inside the
 *  real stop range — anything else (missing, garbage, a stale index from a shorter tour) is null so
 *  the caller treats it as "no tour running" rather than acting on a bad index. */
export function tourCursor(raw: string | null): { at: number } | null {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;
  const at = (parsed as { at?: unknown }).at;
  if (typeof at !== "number" || !Number.isInteger(at)) return null;
  if (at < 0 || at > TOUR_STOPS.length - 1) return null;
  return { at };
}

/** Serialize the tour cursor for sessionStorage (the door's ss().setItem counterpart to tourCursor). */
export function stashTour(at: number): string {
  return JSON.stringify({ at });
}
