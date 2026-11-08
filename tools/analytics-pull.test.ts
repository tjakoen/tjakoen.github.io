// portfolio/tools/analytics-pull.test.ts — the path folding the pull does before writing the cache,
// and the two places it looks for the previous numbers when the pull itself fails.
import { test, expect, describe } from "bun:test";
import { writeFileSync } from "node:fs";
import { foldPaths, localSnapshot, publishedSnapshot } from "./analytics-pull.ts";

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
});
