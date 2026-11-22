import { expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { COMPARES, DIAGRAMS, STACKS, block, compareBlock, fill, stackBlock } from "./note-diagrams.ts";
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

test("every stack carries a spoken name, theme tokens only and a closed marker pair", () => {
  for (const id of Object.keys(STACKS)) {
    const html = stackBlock(id);
    expect(html).toContain('role="img"');
    expect(html).toContain("aria-label=");
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,6}/);
    expect(html.startsWith(`<!-- stack:${id} -->`)).toBe(true);
    expect(html.endsWith(`<!-- /stack:${id} -->`)).toBe(true);
  }
});

test("every comparison carries a spoken name, theme tokens only and a closed marker pair", () => {
  for (const id of Object.keys(COMPARES)) {
    const html = compareBlock(id);
    expect(html).toContain('role="img"');
    expect(html).toContain("aria-label=");
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,6}/);
    expect(html.startsWith(`<!-- compare:${id} -->`)).toBe(true);
    expect(html.endsWith(`<!-- /compare:${id} -->`)).toBe(true);
  }
});

test("the island script is GRAIN's own, unedited", () => {
  expect(readFileSync(ISLAND_PATH, "utf8")).toBe(islandSource());
});
