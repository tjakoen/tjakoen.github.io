// portfolio/src/day.test.ts — the two date formats share one parse, and neither can move the day.
import { test, expect } from "bun:test";
import { dayLabel, monthDayLabel, parseDay } from "./day.ts";

test("the two surfaces keep their own format on the same parse", () => {
  expect(dayLabel("2026-08-11")).toBe("11 Aug");
  expect(dayLabel("2026-07-14", true)).toBe("14 Jul, 2026");
  expect(monthDayLabel("2026-07-14")).toBe("Jul 14");
  expect(monthDayLabel("2026-07-14", true)).toBe("Jul 14, 2026");
});

test("the day is read from the digits, never from a Date the machine's timezone can shift", () => {
  expect(parseDay("2026-01-01")).toEqual({ year: "2026", month: "Jan", day: 1 });
  expect(dayLabel("2026-12-31")).toBe("31 Dec");
});

test("anything unparseable is empty, not a wrong date", () => {
  for (const bad of ["", undefined, "11 Aug", "2026-13-01", "2026-08", "2026-08-11T00:00:00Z"]) {
    expect(dayLabel(bad)).toBe("");
    expect(monthDayLabel(bad)).toBe("");
    expect(parseDay(bad)).toBeNull();
  }
});
