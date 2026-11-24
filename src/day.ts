// portfolio/src/day.ts — one way to write a calendar day, for every reader of a date here.
//
// The mail list, the analytics bar and the sitemap-facing copy all humanise an ISO date, and two
// copies of the month table drifted once already. Parse the digits by hand rather than through
// Date(): `new Date("2026-08-11")` is UTC midnight, which is the 10th anywhere west of Greenwich,
// so a build machine would silently print the wrong day.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-08-11" → "11 Aug", or "11 Aug, 2026" when the year earns its place. "" when unparseable. */
export function dayLabel(iso: string | undefined, withYear = false): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? "");
  if (!m) return "";
  const month = MONTHS[Number(m[2]) - 1];
  return month ? `${Number(m[3])} ${month}${withYear ? `, ${m[1]}` : ""}` : "";
}
