// The /leading page maps each management category to the notes that show it. A renamed or
// deleted note would leave a dead link in that map without anyone noticing, so this checks that
// every /notes/<slug> the page links to still exists under content/notes.
import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const html = readFileSync(join(root, "view/pages/leading/index.html"), "utf8");

describe("/leading links", () => {
  const slugs = [...html.matchAll(/href="\/notes\/([a-z0-9-]+)"/g)].map((m) => m[1]!);

  test("links at least one note per category", () => {
    expect(slugs.length).toBeGreaterThanOrEqual(10);
  });

  test.each(slugs)("note %s exists", (slug) => {
    expect(existsSync(join(root, "content/notes", `${slug}.md`))).toBe(true);
  });

  test("every in-page anchor has a target", () => {
    const anchors = [...html.matchAll(/href="#([a-z-]+)"/g)].map((m) => m[1]!);
    for (const id of anchors) expect(html).toContain(`id="${id}"`);
  });
});
