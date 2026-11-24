// portfolio/src/day.ts — one parser for a calendar day, and the two formats this site actually uses.
//
// The mail list prints "Jul 14, 2026"; the analytics bar prints "11 Aug". Those are different rules,
// so they keep different formatters, but they share the parse: the month table existed in two files
// and could drift, and both must avoid Date(). `new Date("2026-08-11")` is UTC midnight, which is
// the 10th anywhere west of Greenwich, so a build machine would silently print the wrong day.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export interface DayParts { year: string; month: string; day: number }

/** The digits of an ISO date, or null. No Date object, so no timezone can move the day. */
export function parseDay(iso: string | undefined): DayParts | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? "");
  if (!m) return null;
  const month = MONTHS[Number(m[2]) - 1];
  return month ? { year: m[1]!, month, day: Number(m[3]) } : null;
}

/** "2026-08-11" → "11 Aug", or "11 Aug, 2026" when the year earns its place. "" when unparseable. */
export function dayLabel(iso: string | undefined, withYear = false): string {
  const d = parseDay(iso);
  return d ? `${d.day} ${d.month}${withYear ? `, ${d.year}` : ""}` : "";
}

/** "2026-07-14" → "Jul 14", or "Jul 14, 2026". The mail list's format, kept as its own rule. */
export function monthDayLabel(iso: string | undefined, withYear = false): string {
  const d = parseDay(iso);
  return d ? `${d.month} ${d.day}${withYear ? `, ${d.year}` : ""}` : "";
}
