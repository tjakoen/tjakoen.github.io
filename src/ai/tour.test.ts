// portfolio/ai/tour.test.ts — the A2 guided tour's data + cursor codec. Pure, no DOM/storage: the
// stop list is plain data (see tour.ts's header on why — code enumerates routes, never the model),
// and tourCursor/stashTour just round-trip a small integer through sessionStorage's string format.
import { test, expect, describe } from "bun:test";
import { TOUR_STOPS, TOUR_KEY, TOUR_DWELL_MS, tourCursor, stashTour } from "./tour.ts";

describe("TOUR_STOPS", () => {
  test("exactly 4 stops, in the expected route order", () => {
    expect(TOUR_STOPS.map((s) => s.route)).toEqual(["/", "/grain", "/batch", "/notes"]);
  });

  test("every stop's navLink equals its route (all top-level nav links)", () => {
    for (const s of TOUR_STOPS) expect(s.navLink).toBe(s.route);
  });

  test("every announce is non-empty", () => {
    for (const s of TOUR_STOPS) expect(s.announce.trim().length).toBeGreaterThan(0);
  });

  test("the grain stop's announce mentions both 'stop' and 'grain' (the audit grader relies on this)", () => {
    const grain = TOUR_STOPS.find((s) => s.route === "/grain")!;
    expect(grain.announce.toLowerCase()).toContain("stop");
    expect(grain.announce.toLowerCase()).toContain("grain");
  });

  test("the last stop's announce ends the tour and invites a question", () => {
    const last = TOUR_STOPS[TOUR_STOPS.length - 1]!;
    expect(last.route).toBe("/notes");
    expect(last.announce).toContain("That's the tour");
    expect(/ask/i.test(last.announce)).toBe(true);
  });

  test("TOUR_KEY and TOUR_DWELL_MS are the named knobs the door + reasoner share", () => {
    expect(TOUR_KEY).toBe("desk-tour");
    expect(TOUR_DWELL_MS).toBeGreaterThan(2500);   // must clear the audit harness's settle window
  });
});

describe("tourCursor / stashTour", () => {
  test("round-trips a valid stop index", () => {
    for (let at = 0; at < TOUR_STOPS.length; at++) expect(tourCursor(stashTour(at))).toEqual({ at });
  });

  test("null input → null (no tour running)", () => {
    expect(tourCursor(null)).toBeNull();
  });

  test("garbage / non-JSON → null", () => {
    for (const raw of ["", "not json", "{broken", "undefined", "null"])
      expect(tourCursor(raw)).toBeNull();
  });

  test("well-formed JSON but the wrong shape → null", () => {
    for (const raw of ["{}", '{"at":"1"}', '[0]', '"1"', "1"])
      expect(tourCursor(raw)).toBeNull();
  });

  test("a non-integer 'at' → null", () => {
    expect(tourCursor(JSON.stringify({ at: 1.5 }))).toBeNull();
  });

  test("an out-of-range 'at' → null", () => {
    expect(tourCursor(JSON.stringify({ at: -1 }))).toBeNull();
    expect(tourCursor(JSON.stringify({ at: TOUR_STOPS.length }))).toBeNull();
  });
});
