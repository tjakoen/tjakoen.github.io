// Checks on the quest map mockup that need no browser: the data block, the plain route list and the baked art.
// bun test docs/mockups/quest-map
import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { currentBlock, readData, renderRoute } from "./route-list";

const dir = import.meta.dir;
const html = readFileSync(join(dir, "fullscreen.html"), "utf8");
const data = readData(html) as ReturnType<typeof readData> & {
  quests: { id: string; region: number; title: string; short: string; level: string; aud: string[]; min: number; pos: number[]; stops: string[]; learn: string[] }[];
  routes: Record<string, number[][][]>;
  spec: Record<string, { W: number; H: number; q: number[][]; slots: number[][] }>;
  walk: Record<string, { p: number[][] }[]>;
  done: string[];
  partial: Record<string, number[]>;
};

describe("the quest data check", () => {
  test("quest ids are unique and every quest names a real region", () => {
    const ids = data.quests.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    const regions = new Set(data.regions.map((r) => r.n));
    for (const q of data.quests) expect(regions.has(q.region), q.id).toBe(true);
  });

  test("every quest carries what the panel prints", () => {
    for (const q of data.quests) {
      expect(q.title.length, q.id).toBeGreaterThan(0);
      expect(["intro", "intermediate", "deep"], q.id).toContain(q.level);
      expect(q.min, q.id).toBeGreaterThan(0);
      expect(q.stops.length, q.id).toBeGreaterThanOrEqual(1);
      expect(q.learn.length, q.id).toBeGreaterThanOrEqual(1);
      expect(q.aud.length, q.id).toBeGreaterThanOrEqual(1);
    }
  });

  test("each region with quests has one route and one place slot per quest, and a scene to draw in", () => {
    for (const r of data.regions) {
      const qs = data.quests.filter((q) => q.region === r.n);
      if (!qs.length) continue;
      expect(data.routes[r.n]?.length, `routes of region ${r.n}`).toBe(qs.length);
      expect(data.spec[r.n]!.q.length, `place slots of region ${r.n}`).toBeGreaterThanOrEqual(qs.length);
      for (const rt of data.routes[r.n]!) for (const [x, y] of rt) {
        expect(x).toBeGreaterThanOrEqual(0); expect(x).toBeLessThanOrEqual(data.spec[r.n]!.W);
        expect(y).toBeGreaterThanOrEqual(0); expect(y).toBeLessThanOrEqual(data.spec[r.n]!.H);
      }
    }
  });

  test("the sample progress names real quests and real stops", () => {
    const byId = new Map(data.quests.map((q) => [q.id, q]));
    for (const id of data.done) expect(byId.has(id), id).toBe(true);
    for (const [id, stops] of Object.entries(data.partial)) for (const i of stops) expect(i).toBeLessThan(byId.get(id)!.stops.length);
  });

  test("every walking path stays inside its place", () => {
    for (const [n, walkers] of Object.entries(data.walk)) for (const w of walkers) for (const [x, y] of w.p) {
      expect(x).toBeLessThanOrEqual(data.spec[n]!.W); expect(y).toBeLessThanOrEqual(data.spec[n]!.H);
    }
  });
});

describe("the plain route list", () => {
  test("the block in the page is what the data renders", () => {
    expect(currentBlock(html)).toBe(renderRoute(data));
  });

  test("it names every region, quest and stop", () => {
    const list = currentBlock(html);
    for (const r of data.regions) expect(list).toContain(`<h2>${r.name}</h2>`);
    expect(list.match(/<h3>/g)?.length).toBe(data.quests.length);
    expect(list.match(/<li>[^<]/g)?.length).toBeGreaterThanOrEqual(data.quests.reduce((n, q) => n + q.stops.length, 0));
  });
});

describe("the baked art", () => {
  const pairs = ["sourdough", "baguette", "brioche"].flatMap((f) => ["light", "dark"].map((s) => `${f}-${s}`));
  for (const pair of pairs) {
    test(`${pair} has every file the page fetches`, () => {
      const manifest = JSON.parse(readFileSync(join(dir, "art", pair, "manifest.json"), "utf8")) as { det: { n: number }[]; glints: number[][] };
      expect(manifest.det.length).toBe(Object.keys(data.spec).length);
      expect(manifest.glints.length).toBeGreaterThan(0);
      for (const f of ["base.png", "waves.png", "path.png", "layer.png", ...manifest.det.map((d) => `scene-${d.n}.png`)]) expect(existsSync(join(dir, "art", pair, f)), f).toBe(true);
    });
  }
});
