// portfolio/content.test.ts — piece 4 integration: the REAL content through the real wiring.
// Run from the repo root (dirSource("tjakoen.github.io/notes") is root-relative, like config.ts).
import { test, expect } from "bun:test";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { createPortfolioContentRoutes, listNoteRoutesByDate, listRecentNotes, listLatestEvents, listEventCalendarEvents, renderNotesFeedPage, FLAGSHIP_NOTE_SLUG } from "./content.ts";

const serve = createPortfolioContentRoutes();

// The /notes INDEX is a portfolio route override (content.ts renderNotesFeedPage), not served by
// MILL's own listing (the /notes collection's `index: false`) — `serve("/notes")` is null by
// design (server.ts's Bun.serve routes map wins for that path in the real app); these tests
// exercise renderNotesFeedPage() directly instead. Individual entries (`serve("/notes/:slug")`,
// below) are still MILL, untouched.

test("/notes lists every note in portfolio/notes", async () => {
  const body = await renderNotesFeedPage();
  const files = (await readdir(join(import.meta.dir, "..", "content", "notes"))).filter(f => f.endsWith(".md"));
  for (const f of files) expect(body).toContain(`href="/notes/${f.replace(/\.md$/, "")}"`);
});

test("every real note renders clean (human grade, no unrenderable construct)", async () => {
  const files = (await readdir(join(import.meta.dir, "..", "content", "notes"))).filter(f => f.endsWith(".md"));
  for (const f of files) {
    const res = await serve(`/notes/${f.replace(/\.md$/, "")}`);
    expect(res?.status).toBe(200);
    const body = await res!.text();
    expect(body).toContain(`<article class="note" data-grade="smooth">`);
    expect(body).not.toContain(`data-grade="grain"`);
  }
});

test("note cross-links resolve to /notes/:slug, not .md files", async () => {
  const body = await (await serve("/notes/ten-times-zero"))!.text();
  expect(body).toContain(`href="/notes/why-i-teach"`);
  expect(body).not.toContain(`href="why-i-teach.md"`);
});

test("layer docs render from the installed packages (both collections, with tables)", async () => {
  for (const [prefix, slug] of [["/grain/docs", "grain"], ["/batch/docs", "architecture"]] as const) {
    const index = await serve(prefix);
    expect(index?.status).toBe(200);
    expect(await index!.text()).toContain(`href="${prefix}/${slug}"`);
    const page = await serve(`${prefix}/${slug}`);
    expect(page?.status).toBe(200);
    const body = await page!.text();
    expect(body).toContain(`<table class="table">`);
    expect(body).toContain(`data-grade="smooth"`);
  }
});

test("docs cross-layer links rewrite to rendered routes", async () => {
  const body = await (await serve("/grain/docs/grain"))!.text();
  expect(body).toContain(`href="/grain/docs/ai-interface`);
  expect(body).toContain(`href="/batch/docs/architecture`);
});

test("content pages wear the BREAD shell chrome", async () => {
  const body = await renderNotesFeedPage();
  expect(body).toContain("<portfolio-frame />");
  expect(body).toContain(`data-screen="notes"`);
});

test("the /notes feed = the flagship pinned to the front of the date order — the tail stays newest-first (not alphabetical), and the explorer tree (listNoteRoutesByDate → /search.json) stays PURE date order", async () => {
  const body = await renderNotesFeedPage();
  const inPageOrder = [...body.matchAll(/note-card__title"><a href="(\/notes\/[a-z0-9._-]+)"/g)].map((m) => m[1]);
  const dateOrder = await listNoteRoutesByDate();
  // the tree/search order is unchanged (pure date) — the pin lives only in the feed page
  const flagship = `/notes/${FLAGSHIP_NOTE_SLUG}`;
  expect(dateOrder).toContain(flagship);
  // the feed floats the flagship first; everything after it keeps the date order
  const expectedFeed = [flagship, ...dateOrder.filter((r) => r !== flagship)];
  expect(inPageOrder).toEqual(expectedFeed);
});

test("the welcome page's Recent = notes AND calendar posts merged newest-first, and the notes in it keep the date order", async () => {
  const recent = await listRecentNotes(4);
  const hrefs = recent.map((n) => n.href);
  // every row is a real route, one kind or the other
  expect(hrefs.every((h) => h.startsWith("/notes/") || h.startsWith("/calendar/"))).toBe(true);
  // the notes among them appear in the same relative order the pure date list has
  const dateOrder = await listNoteRoutesByDate();
  const notesInRecent = hrefs.filter((h) => h.startsWith("/notes/"));
  expect(notesInRecent).toEqual(dateOrder.filter((r) => notesInRecent.includes(r)));
});

test("the feed walkthrough card gets ONE event, the newest, pointing at the feed anchored on it", async () => {
  const latest = await listLatestEvents();
  const events = await listEventCalendarEvents();
  expect(latest).toHaveLength(events.length ? 1 : 0);
  if (!latest[0]) return;
  const newest = [...events].sort((a, b) => b.date.localeCompare(a.date))[0]!;
  expect(latest[0].title).toBe(newest.title);
  expect(latest[0].href).toBe(`/calendar#${newest.domId}`);
});
