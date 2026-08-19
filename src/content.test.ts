// portfolio/content.test.ts — piece 4 integration: the REAL content through the real wiring.
// Run from the repo root (dirSource("tjakoen.github.io/notes") is root-relative, like config.ts).
import { test, expect } from "bun:test";
import { readdir, unlink } from "node:fs/promises";
import { join } from "node:path";
import { parseFrontmatter } from "@tjakoen/mill/core/frontmatter.ts";
import { createPortfolioContentRoutes, listNoteRoutesByDate, listRecentNotes, listLatestEvents, listEventCalendarEvents, renderNotesFeedPage, listPortfolioNotes, listPortfolioContentRoutes, listPortfolioRawContentRoutes, listNoteCalendarEvents, buildPortfolioKnowledge, isPublishedStatus, FLAGSHIP_NOTE_SLUG } from "./content.ts";

const serve = createPortfolioContentRoutes();

// The notes on disk, split by what their frontmatter says about publishing. Tests that walk the
// folder use this rather than every *.md, so that starting a real draft tomorrow does not turn the
// suite red: a draft is EXPECTED to be missing from the feed and to 404, and that is asserted below.
async function notesOnDisk(): Promise<{ published: string[]; drafts: string[] }> {
  const dir = join(import.meta.dir, "..", "content", "notes");
  const published: string[] = [], drafts: string[] = [];
  for (const f of (await readdir(dir)).filter((n) => n.endsWith(".md"))) {
    const status = parseFrontmatter(await Bun.file(join(dir, f)).text()).data.status;
    (isPublishedStatus(status) ? published : drafts).push(f.replace(/\.md$/, ""));
  }
  return { published, drafts };
}


// The /notes INDEX is a portfolio route override (content.ts renderNotesFeedPage), not served by
// MILL's own listing (the /notes collection's `index: false`) — `serve("/notes")` is null by
// design (server.ts's Bun.serve routes map wins for that path in the real app); these tests
// exercise renderNotesFeedPage() directly instead. Individual entries (`serve("/notes/:slug")`,
// below) are still MILL, untouched.

test("/notes lists every PUBLISHED note in portfolio/notes, and no draft", async () => {
  const body = await renderNotesFeedPage();
  const { published, drafts } = await notesOnDisk();
  for (const slug of published) expect(body).toContain(`href="/notes/${slug}"`);
  for (const slug of drafts) expect(body).not.toContain(`href="/notes/${slug}"`);
});

test("every published note renders clean (human grade, no unrenderable construct)", async () => {
  const { published } = await notesOnDisk();
  for (const slug of published) {
    const res = await serve(`/notes/${slug}`);
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

// ---- the publish gate (content.ts publishedSource / isPublishedStatus) ------------------------
// `status: DRAFT` was documentation that lied until 2026-08-20: NOTE-STANDARD asked for it, every
// unfinished note carried it, and nothing in src/ ever compared it to anything. These tests are
// the comparison, held from both sides: a draft reaches none of the surfaces, and the loose
// readings (a missing status, an unrecognised one) still publish, because a gate that hides a page
// by accident is the worse failure.

test("isPublishedStatus hides an explicit DRAFT and publishes everything else", () => {
  expect(isPublishedStatus("DRAFT")).toBe(false);
  expect(isPublishedStatus("draft")).toBe(false);
  expect(isPublishedStatus("  Draft  ")).toBe(false);
  expect(isPublishedStatus("PUBLISHED")).toBe(true);
  expect(isPublishedStatus(undefined)).toBe(true);          // a missing status still publishes
  expect(isPublishedStatus("PARKED")).toBe(true);           // an unknown value is not a hide
});

test("a DRAFT note reaches no surface: not the feed, not its own route, not the raw twin, not the export list", async () => {
  const slug = "gate-fixture-draft-note";
  const file = join(import.meta.dir, "..", "content", "notes", `${slug}.md`);
  await Bun.write(file, [
    "---",
    'title: "A Fixture That Must Never Publish"',
    'author: "Tjakoen Stolk"',
    "status: DRAFT",
    "type: note",
    "date: 2026-08-20",
    'summary: "Written by the publish-gate test and deleted by it."',
    "---",
    "",
    "## A heading",
    "",
    "A paragraph, so the fixture renders like a real note if the gate ever lets it through.",
    "",
  ].join("\n"));
  try {
    expect(await renderNotesFeedPage()).not.toContain(`href="/notes/${slug}"`);
    expect(await listNoteRoutesByDate()).not.toContain(`/notes/${slug}`);
    expect((await listPortfolioNotes()).map((n) => n.slug)).not.toContain(slug);
    expect(await listPortfolioContentRoutes()).not.toContain(`/notes/${slug}`);
    expect((await listPortfolioRawContentRoutes())).not.toContain(`/notes/${slug}.md`);
    expect((await listNoteCalendarEvents()).map((e) => e.id)).not.toContain(`note-${slug}`);
    expect((await listRecentNotes(50)).map((n) => n.href)).not.toContain(`/notes/${slug}`);
    expect((await buildPortfolioKnowledge()).chunks.some((c) => c.route === `/notes/${slug}`)).toBe(false);
    expect((await serve(`/notes/${slug}`))?.status).toBe(404);
    expect((await serve(`/notes/${slug}.md`))?.status).toBe(404);
  } finally {
    await unlink(file);
  }
});

test("the gate takes nothing that is live off the site: every published note is still reachable, and any draft 404s", async () => {
  const { published, drafts } = await notesOnDisk();
  const routes = await listPortfolioContentRoutes();
  for (const slug of published) {
    expect(routes).toContain(`/notes/${slug}`);
    expect((await serve(`/notes/${slug}`))?.status).toBe(200);
  }
  for (const slug of drafts) {
    expect(routes).not.toContain(`/notes/${slug}`);
    expect((await serve(`/notes/${slug}`))?.status).toBe(404);
  }
  // The one the owner published on purpose, named rather than counted, because a gate that took it
  // down would have silently undone a decision made the same day the gate was written.
  expect((await serve("/notes/the-check-that-never-ran"))?.status).toBe(200);
});
