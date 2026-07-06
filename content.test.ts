// portfolio/content.test.ts — piece 4 integration: the REAL content through the real wiring.
// Run from the repo root (dirSource("tjakoen.github.io/notes") is root-relative, like config.ts).
import { test, expect } from "bun:test";
import { readdir } from "node:fs/promises";
import { createPortfolioContentRoutes, listNoteRoutesByDate, listRecentNotes } from "./content.ts";

const serve = createPortfolioContentRoutes();

test("/notes lists every note in portfolio/notes", async () => {
  const body = await (await serve("/notes"))!.text();
  const files = (await readdir("tjakoen.github.io/notes")).filter(f => f.endsWith(".md"));
  for (const f of files) expect(body).toContain(`href="/notes/${f.replace(/\.md$/, "")}"`);
});

test("every real note renders clean (human grade, no unrenderable construct)", async () => {
  const files = (await readdir("tjakoen.github.io/notes")).filter(f => f.endsWith(".md"));
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
  const body = await (await serve("/notes"))!.text();
  expect(body).toContain("<portfolio-frame />");
  expect(body).toContain(`data-screen="notes"`);
});

test("listNoteRoutesByDate matches the /notes index's own newest-first order — the explorer tree (fed from this via /search.json) must agree with the page, not fall back to alphabetical", async () => {
  const body = await (await serve("/notes"))!.text();
  const inPageOrder = [...body.matchAll(/href="(\/notes\/[a-z0-9._-]+)"/g)].map((m) => m[1]);
  expect(await listNoteRoutesByDate()).toEqual(inPageOrder);
});

test("listRecentNotes is a prefix of listNoteRoutesByDate (same order, just truncated)", async () => {
  const all = await listNoteRoutesByDate();
  const recent = await listRecentNotes(2);
  expect(recent.map((n) => n.href)).toEqual(all.slice(0, 2));
});
