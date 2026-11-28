// A series is a run of short notes that the feed shows as one card in the All tab and that each note
// links through, front to back. This holds the frontmatter contract, the two renderers, and the one
// place the series and the quest map have to agree: the order the Harbor notes are read in.
import { test, expect, describe } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parseFrontmatter } from "@tjakoen/mill/core/frontmatter.ts";
import { NOTE_SERIES, readSeries, renderSeriesCard, renderSeriesNav, seriesMembersOf, type SeriesMember } from "./content.ts";

const ROOT = join(import.meta.dir, "..");
const NOTES = join(ROOT, "content", "notes");

const member = (slug: string, order: number, published = true, extra: Partial<SeriesMember> = {}): SeriesMember & { series: string } => ({
  slug, order, published, series: "harbor", title: `Title ${slug}`, minutes: 5, date: "2026-11-28", audience: ["learn"], tags: ["ai"], ...extra,
});

describe("readSeries", () => {
  test("accepts a known series and a positive whole order", () => {
    expect(readSeries({ series: "harbor", seriesOrder: 3 })).toEqual({ id: "harbor", order: 3 });
    expect(readSeries({ series: "harbor", seriesOrder: "4" })).toEqual({ id: "harbor", order: 4 });
  });
  test("rejects a missing key, an unknown series and a bad order", () => {
    expect(readSeries({})).toBeNull();
    expect(readSeries({ series: "harbor" })).toBeNull();
    expect(readSeries({ series: "nowhere", seriesOrder: 1 })).toBeNull();
    expect(readSeries({ series: "harbor", seriesOrder: 0 })).toBeNull();
    expect(readSeries({ series: "harbor", seriesOrder: 1.5 })).toBeNull();
    expect(readSeries({ series: "toString", seriesOrder: 1 })).toBeNull();
  });
});

describe("seriesMembersOf", () => {
  const all = [member("c", 3, false), member("a", 1), member("b", 2)];
  test("reads in series order and keeps drafts only when asked", () => {
    expect(seriesMembersOf("harbor", all, true).map((m) => m.slug)).toEqual(["a", "b", "c"]);
    expect(seriesMembersOf("harbor", all, false).map((m) => m.slug)).toEqual(["a", "b"]);
  });
  test("leaves other series out", () => {
    expect(seriesMembersOf("other", all, true)).toEqual([]);
  });
});

describe("renderSeriesNav", () => {
  const members = [member("a", 1), member("b", 2), member("c", 3, false)];
  test("names the place in the series and links both ways, drafts to the drafts address", () => {
    const html = renderSeriesNav("harbor", "b", members);
    expect(html).toContain("The Harbor, note 2 of 3");
    expect(html).toContain('href="/notes/a"');
    expect(html).toContain('href="/drafts/c"');
  });
  test("the first note has no previous link and the last has no next link", () => {
    expect(renderSeriesNav("harbor", "a", members)).not.toContain('rel="prev"');
    expect(renderSeriesNav("harbor", "c", members)).not.toContain('rel="next"');
  });
  test("a series of one, an unknown note or an unknown series renders nothing", () => {
    expect(renderSeriesNav("harbor", "a", [member("a", 1)])).toBe("");
    expect(renderSeriesNav("harbor", "zzz", members)).toBe("");
    expect(renderSeriesNav("nowhere", "a", members)).toBe("");
  });
});

describe("renderSeriesCard", () => {
  test("is hidden until the island decides to show it, and counts the notes and the minutes", () => {
    const html = renderSeriesCard("harbor", [member("a", 1), member("b", 2, true, { minutes: 7 })]);
    expect(html).toContain(" hidden ");
    expect(html).toContain('data-series-card="harbor"');
    expect(html).toContain('data-surface="series:harbor"');
    expect(html).toContain("A series of 2 short notes");
    expect(html).toContain('data-score="12"');
    expect(html).toContain('href="/notes/a"');
  });
  test("a series with fewer than two notes is not worth a card", () => {
    expect(renderSeriesCard("harbor", [member("a", 1)])).toBe("");
  });
});

describe("the real notes", () => {
  const fmOf = (file: string) => parseFrontmatter(readFileSync(join(NOTES, file), "utf8")).data as Record<string, unknown>;
  const inSeries = readdirSync(NOTES).filter((f) => f.endsWith(".md")).map((f) => ({ slug: f.slice(0, -3), fm: fmOf(f) }))
    .filter((n) => n.fm.series !== undefined);

  test("every note that names a series names a known one, with a whole order", () => {
    expect(inSeries.length).toBeGreaterThan(0);
    for (const n of inSeries) expect(readSeries(n.fm), n.slug).not.toBeNull();
  });
  test("each series counts 1 to n with no gaps and no repeats", () => {
    for (const id of Object.keys(NOTE_SERIES)) {
      const orders = inSeries.filter((n) => n.fm.series === id).map((n) => Number(n.fm.seriesOrder)).toSorted((a, b) => a - b);
      expect(orders, id).toEqual(orders.map((_, i) => i + 1));
    }
  });
  test("the Harbor is read in the order the quest map walks it", () => {
    const regions = JSON.parse(readFileSync(join(ROOT, "content", "quests", "regions.json"), "utf8")) as { regions: { id: string; notes: string[] }[] };
    const harbor = regions.regions.find((r) => r.id === "harbor")!.notes;
    const bySeries = inSeries.filter((n) => n.fm.series === "harbor").toSorted((a, b) => Number(a.fm.seriesOrder) - Number(b.fm.seriesOrder)).map((n) => n.slug);
    expect(bySeries).toEqual(harbor);
  });
});
