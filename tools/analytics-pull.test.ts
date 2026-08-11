// portfolio/tools/analytics-pull.test.ts — the path folding the pull does before writing the cache.
import { test, expect, describe } from "bun:test";
import { foldPaths } from "./analytics-pull.ts";

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
