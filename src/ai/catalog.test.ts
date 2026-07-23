// portfolio/ai/catalog.test.ts — the sitemap-driven nav catalog + deterministic resolver. These pin
// the behavior that replaces the old hardcoded alias table: real routes in, right destination out, and
// NO navigation on a question or an invented place.
import { test, expect, describe } from "bun:test";
import { buildCatalog, resolveNav, navShortlist, navTarget } from "./catalog.ts";

// A representative slice of the real sitemap + titles.
const ROUTES = [
  "/", "/about/", "/grain/", "/grain/docs/", "/grain/docs/ai-interface/", "/batch/", "/bread/",
  "/notes/", "/notes/ten-times-zero/", "/notes/why-i-teach/", "/calendar/", "/loop/",
];
const TITLES: Record<string, string> = {
  "/notes/ten-times-zero": "Ten Times Zero Is Still Zero",
  "/notes/why-i-teach": "I Nearly Quit Teaching",
  "/grain/docs/ai-interface": "AI ↔ UI Interface — the GRAIN action vocabulary contract",
};
const catalog = buildCatalog(ROUTES, TITLES);

describe("buildCatalog", () => {
  test("normalizes trailing slashes, dedupes, and labels by title or humanized slug", () => {
    const home = catalog.find((d) => d.route === "/");
    expect(home?.label).toBe("Home");
    expect(catalog.find((d) => d.route === "/grain")?.label).toBe("Grain");            // humanized slug
    expect(catalog.find((d) => d.route === "/notes/ten-times-zero")?.label).toBe("Ten Times Zero Is Still Zero"); // real title
    expect(catalog.some((d) => d.route !== "/" && d.route.endsWith("/"))).toBe(false);  // no trailing slashes (except home)
  });
});

describe("navTarget", () => {
  test("extracts the place phrase from a nav command, null otherwise", () => {
    expect(navTarget("take me to grain")).toBe("grain");
    expect(navTarget("go to the grain docs")).toBe("the grain docs");
    expect(navTarget("open the notes")).toBe("the notes");
    expect(navTarget("what is grain")).toBeNull();
    expect(navTarget("who is TJ")).toBeNull();
  });

  test("a polite-intent prefix is skipped ('I want to read X' is a nav command)", () => {
    expect(navTarget("I want to read the grain docs")).toBe("the grain docs");
    expect(navTarget("I'd like to see the notes")).toBe("the notes");
    expect(navTarget("can you open the notes")).toBe("the notes");
    expect(navTarget("I want a pony")).toBeNull();                 // intent without a nav verb: not one
  });
});

describe("resolveNav — deterministic, over real routes", () => {
  test("a verbed command lands on the canonical (shallowest) covering route", () => {
    expect(resolveNav("take me to grain", catalog)?.route).toBe("/grain");             // section, not a deep child
    expect(resolveNav("go to the grain docs", catalog)?.route).toBe("/grain/docs");
    expect(resolveNav("navigate to about", catalog)?.route).toBe("/about");
    expect(resolveNav("take me home", catalog)?.route).toBe("/");
  });

  test("'documentation' finds the docs route (plural fold + prefix match)", () => {
    expect(resolveNav("I want to read the grain documentation", catalog)?.route).toBe("/grain/docs");
    expect(resolveNav("take me to the grain documentation", catalog)?.route).toBe("/grain/docs");
  });

  test("a bare place-name navigates; a question never does", () => {
    expect(resolveNav("grain", catalog)?.route).toBe("/grain");
    expect(resolveNav("what is grain?", catalog)).toBeNull();                          // a question, not a command
    expect(resolveNav("who is TJ", catalog)).toBeNull();
  });

  test("an invented / uncovered destination does NOT resolve (falls to the model tail)", () => {
    expect(resolveNav("take me to the flagship note", catalog)).toBeNull();            // "flagship" is in no route/title
    expect(resolveNav("take me to the admin panel", catalog)).toBeNull();
  });
});

describe("navShortlist — the model's real-route candidates for the fuzzy tail", () => {
  test("ranks partial matches, all real routes", () => {
    const list = navShortlist("take me to the ai interface doc", catalog);
    expect(list[0]!.route).toBe("/grain/docs/ai-interface");                           // best token overlap first
    expect(list.every((d) => ROUTES.map((r) => r.replace(/\/$/, "") || "/").includes(d.route))).toBe(true);
  });

  test("notes-flavored ask surfaces note routes", () => {
    const list = navShortlist("open a note", catalog);
    expect(list.some((d) => d.route.startsWith("/notes"))).toBe(true);
  });

  test("no overlap → empty (nothing to offer)", () => {
    expect(navShortlist("xyzzy quux", catalog)).toEqual([]);
  });

  test("a nav-flavored ask with no destination tokens falls back to top-level sections", () => {
    const list = navShortlist("Which pages can you take me to?", catalog);
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((d) => d.route.split("/").filter(Boolean).length <= 1)).toBe(true);   // sections, not deep children
    expect(navShortlist("tell me a story", catalog)).toEqual([]);                           // not nav-flavored → still empty
  });
});
