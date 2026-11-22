import { expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { DIAGRAMS, block, fill } from "./note-diagrams.ts";
import { ISLAND_PATH, islandSource } from "./diagram-island.ts";

const notes = join(import.meta.dir, "..", "content", "notes");

test("every diagram block in a note is the current drawing", () => {
  for (const f of readdirSync(notes).filter((n) => n.endsWith(".md"))) {
    const text = readFileSync(join(notes, f), "utf8");
    expect(fill(text) === text, `${f} holds a stale diagram; run: bun tools/note-diagrams.ts`).toBe(true);
  }
});

test("every diagram carries a spoken name and a closed marker pair", () => {
  for (const id of Object.keys(DIAGRAMS)) {
    const html = block(id);
    expect(html).toContain('role="img"');
    expect(html).toContain("aria-label=");
    expect(html.startsWith(`<!-- diagram:${id} -->`)).toBe(true);
    expect(html.endsWith(`<!-- /diagram:${id} -->`)).toBe(true);
    expect(html).not.toMatch(/\n\s*\n/);
  }
});

test("the island script is GRAIN's own, unedited", () => {
  expect(readFileSync(ISLAND_PATH, "utf8")).toBe(islandSource());
});
