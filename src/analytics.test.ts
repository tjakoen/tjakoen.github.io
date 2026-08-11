// portfolio/analytics.test.ts — the status-bar view counts baked in at build time.
import { test, expect, describe } from "bun:test";
import { writeFileSync } from "node:fs";
import { injectViews, viewsLabel, formatCount, load, type AnalyticsData } from "./analytics.ts";

const DATA: AnalyticsData = {
  visits: 1204,
  paths: { "/": 900, "/notes/ten-times-zero/": 412, "/about/": 3 },
  pulledAt: "2026-08-11",
};

// the frame's span, exactly as portfolio-frame.html ships it
const SPAN = `<span class="status-bar__views" data-views></span>`;
const bar = (extra = "") =>
  `<footer class="status-bar"><span class="status-bar__spacer"></span>${SPAN}${extra}</footer>`;

describe("formatCount", () => {
  test("thousands separators, no k-rounding", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(42)).toBe("42");
    expect(formatCount(1204)).toBe("1,204");
    expect(formatCount(1234567)).toBe("1,234,567");
  });
});

describe("viewsLabel", () => {
  test("a page with its own count → the site total and the page's views", () => {
    expect(viewsLabel("/notes/ten-times-zero", DATA)).toBe("1,204 visits · 412 views here");
  });

  test("the path is canonicalized, so /x, /x/ and /x// are the same page", () => {
    const want = "1,204 visits · 412 views here";
    expect(viewsLabel("/notes/ten-times-zero/", DATA)).toBe(want);
    expect(viewsLabel("/notes/ten-times-zero//", DATA)).toBe(want);
  });

  test("root canonicalizes to / and keeps its own count", () => {
    expect(viewsLabel("/", DATA)).toBe("1,204 visits · 900 views here");
  });

  test("a page with no entry yet → the site total ALONE, never '0 views here'", () => {
    const label = viewsLabel("/notes/brand-new", DATA);
    expect(label).toBe("1,204 visits");
    expect(label).not.toContain("0 views");
  });

  test("no data at all → empty, so the span collapses", () => {
    expect(viewsLabel("/", null)).toBe("");
  });
});

describe("injectViews", () => {
  test("fills the frame's empty span", () => {
    expect(injectViews(bar(), "/about", DATA))
      .toContain(`data-views>1,204 visits · 3 views here</span>`);
  });

  test("no data → the document is returned byte-identical", () => {
    const html = bar();
    expect(injectViews(html, "/about", null)).toBe(html);
  });

  test("no-op on a document without the span (a fragment, a raw .md response)", () => {
    const frag = `<div class="console__feed">acting…</div>`;
    expect(injectViews(frag, "/ui/stream", DATA)).toBe(frag);
  });

  test("idempotent — a filled span is not filled again", () => {
    const once = injectViews(bar(), "/about", DATA);
    expect(injectViews(once, "/about", DATA)).toBe(once);
    expect((once.match(/data-views/g) ?? []).length).toBe(1);
  });

  test("only the views span is touched — the rest of the bar is untouched", () => {
    const extra = `<a class="status-bar__contact" href="/about#contact">Contact</a>`;
    expect(injectViews(bar(extra), "/about", DATA)).toContain(extra);
  });
});

describe("load", () => {
  test("a missing file is absent data, not a crash (the local case)", () => {
    expect(load("/tmp/definitely-not-here-analytics.json")).toBeNull();
  });

  test("a malformed file is absent data, not a crash — numbers never cost a deploy", () => {
    const p = "/tmp/analytics-malformed.json";
    writeFileSync(p, "{ not json");
    expect(load(p)).toBeNull();
  });

  test("a partial file (no paths) is rejected rather than half-rendered", () => {
    const p = "/tmp/analytics-partial.json";
    writeFileSync(p, JSON.stringify({ visits: 5 }));
    expect(load(p)).toBeNull();
  });

  test("a well-formed file round-trips", () => {
    const p = "/tmp/analytics-good.json";
    writeFileSync(p, JSON.stringify(DATA));
    expect(load(p)).toEqual(DATA);
  });
});
