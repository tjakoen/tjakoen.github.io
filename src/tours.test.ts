import { test, expect } from "bun:test";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { parseFrontmatter } from "@tjakoen/mill/core/frontmatter.ts";

test("visitor demos stay distinct from direct-link implementation reviews", async () => {
  const dir = join(import.meta.dir, "..", "content", "tours");
  const tours = await Promise.all((await readdir(dir)).filter((name) => name.endsWith(".md")).map(async (file) => {
    const { data } = parseFrontmatter(await Bun.file(join(dir, file)).text());
    return { file, id: String(data.id), mode: String(data.mode), title: String(data.title) };
  }));

  const demos = tours.filter((tour) => tour.mode === "demo").map((tour) => tour.id).sort();
  expect(demos).toEqual(["portfolio", "say-hello"]);

  for (const tour of tours.filter((entry) => entry.id !== "portfolio" && entry.id !== "say-hello")) {
    expect(tour.file).toMatch(/^review-[a-z0-9-]+\.md$/);
    expect(tour.mode).toBe("dev");
    expect(tour.title).toMatch(/^Review:/);
  }
});
