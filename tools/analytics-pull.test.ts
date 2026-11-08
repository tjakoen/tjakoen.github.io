// portfolio/tools/analytics-pull.test.ts — the path folding the pull does before writing the cache,
// and the two places it looks for the previous numbers when the pull itself fails.
import { test, expect, describe } from "bun:test";
import { writeFileSync } from "node:fs";
import { chunkWindow, foldCounts, foldPaths, localSnapshot, publishedSnapshot } from "./analytics-pull.ts";

const row = (requestPath: string, count: number) => ({ count, dimensions: { requestPath } });

describe("foldPaths", () => {
  test("canonicalizes to the trailing-slash form seo.ts uses", () => {
    expect(foldPaths([row("/notes/ten-times-zero", 5)])).toEqual({ "/notes/ten-times-zero/": 5 });
  });

  test("the slashed and unslashed forms of one page are SUMMED, not one silently winning", () => {
    expect(foldPaths([row("/grain", 3), row("/grain/", 4)])).toEqual({ "/grain/": 7 });
  });

  test("root stays root", () => {
    expect(foldPaths([row("/", 12)])).toEqual({ "/": 12 });
  });

  test("a query string is dropped, so ?feed=notes folds into the page", () => {
    expect(foldPaths([row("/calendar?feed=notes", 2), row("/calendar", 1)])).toEqual({ "/calendar/": 3 });
  });

  test("junk rows are skipped rather than crashing the build", () => {
    const rows = [
      row("/ok", 1),
      { count: 9, dimensions: { requestPath: "not-a-path" } },
      { count: 9, dimensions: {} as any },
      { count: 9 } as any,
    ];
    expect(foldPaths(rows)).toEqual({ "/ok/": 1 });
  });

  test("no rows → an empty map, not a throw", () => {
    expect(foldPaths([])).toEqual({});
  });
});

describe("chunkWindow", () => {
  test("the whole life of the site becomes contiguous 30 day spans", () => {
    const spans = chunkWindow("2026-08-11T00:00:00Z", new Date("2026-11-09T00:00:00Z"));
    expect(spans).toHaveLength(3);
    expect(spans[0].from).toBe("2026-08-11T00:00:00.000Z");
    expect(spans[0].to).toBe("2026-09-10T00:00:00.000Z");
    expect(spans[1].from).toBe(spans[0].to);
    expect(spans[2].to).toBe("2026-11-09T00:00:00.000Z");
  });

  test("a window shorter than one span is one span, and an empty window is none", () => {
    expect(chunkWindow("2026-11-01T00:00:00Z", new Date("2026-11-09T00:00:00Z"))).toHaveLength(1);
    expect(chunkWindow("2026-11-09T00:00:00Z", new Date("2026-11-09T00:00:00Z"))).toEqual([]);
    expect(chunkWindow("2026-11-10T00:00:00Z", new Date("2026-11-09T00:00:00Z"))).toEqual([]);
  });
});

describe("foldCounts", () => {
  test("sums visits across every row, not just the first bucket", () => {
    const rows = [
      { count: 40, sum: { visits: 30 } },
      { count: 20, sum: { visits: 10 } },
    ];
    expect(foldCounts(rows)).toEqual({ visits: 40, paths: {} });
  });

  test("falls back to page loads when the visit sum is absent everywhere", () => {
    expect(foldCounts([{ count: 7 }, { count: 5 }]).visits).toBe(12);
  });

  test("folds the page rows the same way the single-window pull did", () => {
    const rows = [
      { count: 3, sum: { visits: 3 }, dimensions: { requestPath: "/grain" } },
      { count: 4, sum: { visits: 2 }, dimensions: { requestPath: "/grain/" } },
    ];
    expect(foldCounts(rows).paths).toEqual({ "/grain/": 7 });
  });

  test("no rows is no counts, not a throw", () => {
    expect(foldCounts([])).toEqual({ visits: 0, paths: {} });
  });
});

const SNAPSHOT = { visits: 2650, paths: { "/": 900 }, pulledAt: "2026-11-08" };

describe("localSnapshot", () => {
  test("reads a well-formed cache file", () => {
    const p = "/tmp/analytics-snapshot-good.json";
    writeFileSync(p, JSON.stringify(SNAPSHOT));
    expect(localSnapshot(p)).toEqual(SNAPSHOT);
  });

  test("a missing or junk file is absent, not a crash", () => {
    expect(localSnapshot("/tmp/definitely-not-here-snapshot.json")).toBeNull();
    const p = "/tmp/analytics-snapshot-junk.json";
    writeFileSync(p, "{ not json");
    expect(localSnapshot(p)).toBeNull();
    writeFileSync(p, JSON.stringify({ visits: 5 }));
    expect(localSnapshot(p)).toBeNull();
  });
});

describe("publishedSnapshot", () => {
  test("reads the previous deploy's file over HTTP", async () => {
    const server = Bun.serve({ port: 0, fetch: () => Response.json(SNAPSHOT) });
    try {
      const url = new URL("/analytics.json", server.url);
      expect(await publishedSnapshot(url)).toEqual(SNAPSHOT);
    } finally {
      server.stop(true);
    }
  });

  test("a 404 is absent, so the caller falls through to no numbers", async () => {
    const server = Bun.serve({ port: 0, fetch: () => new Response("Not found", { status: 404 }) });
    try {
      expect(await publishedSnapshot(new URL("/analytics.json", server.url))).toBeNull();
    } finally {
      server.stop(true);
    }
  });

  test("an empty or partial body is rejected rather than half-rendered", async () => {
    const server = Bun.serve({ port: 0, fetch: () => Response.json({ visits: 2650 }) });
    try {
      expect(await publishedSnapshot(new URL("/analytics.json", server.url))).toBeNull();
    } finally {
      server.stop(true);
    }
  });

  test("a zero snapshot is not a snapshot, so it can never be shown as the site's numbers", async () => {
    const server = Bun.serve({ port: 0, fetch: () => Response.json({ visits: 0, paths: {}, pulledAt: "2026-11-08" }) });
    try {
      expect(await publishedSnapshot(new URL("/analytics.json", server.url))).toBeNull();
    } finally {
      server.stop(true);
    }
  });
});
