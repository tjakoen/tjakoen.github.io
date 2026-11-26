// The furniture around a note: the edited line, the changelog, and the unlisted drafts section.
import { test, expect } from "bun:test";
import {
  parseChangelog, renderNoteEdited, renderNoteChangelog,
  listPortfolioDraftRoutes, listPortfolioContentRoutes, createPortfolioDraftRoutes, createPortfolioContentRoutes,
} from "./content.ts";

test("a changelog keeps only dated lines and puts the newest first", () => {
  const entries = parseChangelog(["2026-08-20 | Fixed a number.", "no date here", "2026-11-12 | Added a section.", 7, "2026-11-13 |"]);
  expect(entries.map((e) => e.date)).toEqual(["2026-11-12", "2026-08-20"]);
  expect(renderNoteChangelog({ changelog: ["2026-11-12 | Added <b>a</b> section."] })).toContain("Added &lt;b&gt;a&lt;/b&gt; section.");
  expect(renderNoteChangelog({})).toBe("");
});

test("the edited line shows only for a real, later date", () => {
  expect(renderNoteEdited({ date: "2026-08-18", updated: "2026-11-12", changelog: ["2026-11-12 | x"] })).toContain('href="#changelog"');
  expect(renderNoteEdited({ date: "2026-08-18", updated: "2026-11-12" })).not.toContain("#changelog");
  expect(renderNoteEdited({ date: "2026-08-18", updated: "2026-08-18" })).toBe("");
  expect(renderNoteEdited({ date: "2026-08-18", updated: "soon" })).toBe("");
  expect(renderNoteEdited({ date: "2026-08-18" })).toBe("");
});

test("drafts are served unlisted: under /drafts, noindex, and in no content route", async () => {
  const drafts = await listPortfolioDraftRoutes();
  const content = await listPortfolioContentRoutes();
  expect(drafts).toContain("/drafts");
  for (const route of drafts) expect(content, `${route} leaked into the listed content routes`).not.toContain(route);

  const entry = drafts.find((r) => r !== "/drafts");
  if (!entry) return;                       // no draft on disk right now: nothing further to hold
  const slug = entry.slice("/drafts/".length);
  expect(content).not.toContain(`/notes/${slug}`);

  const serveDrafts = createPortfolioDraftRoutes();
  const page = await serveDrafts(entry);
  expect(page?.status).toBe(200);
  const html = await page!.text();
  expect(html).toContain('<meta name="robots" content="noindex, nofollow">');
  expect(html).toContain('class="draft-flag"');
  expect(html).not.toContain("data-note-share");

  const published = await createPortfolioContentRoutes()(`/notes/${slug}`);
  expect(published === null || published.status === 404).toBe(true);
});

import { renderAiPrompt } from "./content.ts";
import { test as aiTest, expect as aiExpect } from "bun:test";

aiTest("the AI prompt names the note, its address and its Markdown twin", () => {
  const p = renderAiPrompt("A note", "https://portfolio.tjakoen.com/notes/a-note");
  aiExpect(p).toContain("https://portfolio.tjakoen.com/notes/a-note.md");
  aiExpect(p).toContain("A note");
});

import { renderArticleMeta } from "./content.ts";
import { enrichHead } from "./seo.ts";

aiTest("a note's JSON-LD carries its dates, keywords and an ISO reading time", () => {
  const meta = renderArticleMeta({ date: "2026-08-07", updated: "2026-09-01", tags: ["ai", "stack"], readingTime: "~25 min" });
  const page = `<!DOCTYPE html><html><head><title>T</title><meta name="description" content="D">${meta}</head><body></body></html>`;
  const out = enrichHead(page, "/notes/t", "https://portfolio.tjakoen.com");
  const ld = JSON.parse(out.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1]);
  aiExpect(ld["@type"]).toBe("BlogPosting");
  aiExpect(ld.datePublished).toBe("2026-08-07");
  aiExpect(ld.dateModified).toBe("2026-09-01");
  aiExpect(ld.keywords).toBe("ai, stack");
  aiExpect(ld.timeRequired).toBe("PT25M");
});
