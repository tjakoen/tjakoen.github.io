// Every page a visitor reads to the end closes with a "Where to next" block, so nobody finishes a
// page with only the dock to leave by. This holds the block in place and its links alive. The
// welcome page, the 404, mail, the calendar and the talk decks are left out on purpose: they are a
// hub, an error, two tools and three slide viewers, and none of them is read to an end.
import { test, expect } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { renderNoteNext } from "./content.ts";

const ROOT = join(import.meta.dir, "..");
const PAGES = join(ROOT, "view", "pages");
const READ_TO_THE_END = [
  "about.html", "ai-disclosure.html", "people.html", "reading.html", "resume.html",
  "badges/index.html", "batch/index.html", "bread/index.html", "crumb/index.html", "docs/index.html",
  "grain/index.html", "greenroom/index.html", "leading/index.html", "mill/index.html",
  "native-github-classroom/index.html", "pantry/index.html", "projects/index.html", "proof/index.html",
  "talks/index.html", "teaching/index.html",
];
// Routes the server composes rather than reads from view/pages.
const COMPOSED = new Set(["/notes", "/standards", "/grain/builder"]);

const blockOf = (html: string) => html.match(/<nav class="where-next"[\s\S]*?<\/nav>/)?.[0] ?? "";
const hrefsOf = (block: string) => [...block.matchAll(/href="([^"]+)"/g)].map((m) => m[1]!.split("#")[0]!);
const resolves = (href: string): boolean => {
  if (COMPOSED.has(href)) return true;
  if (href.startsWith("/notes/")) return existsSync(join(ROOT, "content", "notes", `${href.slice(7)}.md`));
  return existsSync(join(PAGES, `${href.slice(1)}.html`)) || existsSync(join(PAGES, href.slice(1), "index.html"));
};

test("every page read to the end closes with a where-to-next block whose links resolve", () => {
  for (const page of READ_TO_THE_END) {
    const block = blockOf(readFileSync(join(PAGES, page), "utf8"));
    expect(block, `${page} has no where-to-next block`).not.toBe("");
    const hrefs = hrefsOf(block);
    expect(hrefs.length, `${page} offers fewer than two ways onward`).toBeGreaterThanOrEqual(2);
    const self = "/" + page.replace(/\/?index\.html$|\.html$/, "");
    for (const href of hrefs) {
      expect(resolves(href), `${page} links to ${href}, which is not a page`).toBe(true);
      expect(href, `${page} offers itself as the next page`).not.toBe(self);
    }
  }
});

test("a note closes with the next note, the list and contact, and never points at itself", () => {
  const block = renderNoteNext("ten-times-zero");
  const hrefs = hrefsOf(blockOf(block));
  expect(hrefs).toContain("/notes");
  expect(hrefs).toContain("/about");
  const next = hrefs.find((h) => h.startsWith("/notes/"));
  expect(next).toBeDefined();
  expect(next).not.toBe("/notes/ten-times-zero");
  expect(resolves(next!)).toBe(true);
});
