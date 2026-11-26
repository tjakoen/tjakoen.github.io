// e2e/quest-map.e2e.ts — the quest map mockup (docs/mockups/quest-map/fullscreen.html): the WCAG 2.2 AA scan in all six flavor and
// scheme pairs, and the functional checks for routes, progress and the panel controls. The mockup is a static file, not a route of the
// site, so this spec serves the folder itself on a free port instead of using the app's webServer.
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { createServer, type Server } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

// The page's own globals, which these tests read inside page.evaluate. They exist in the page, not here, so they are only declared.
type Quest = { id: string; region: number; stops: string[]; done: boolean; pos: number[] };
declare const root: HTMLElement, base: HTMLCanvasElement, WW: number, WH: number, YOU: number[], sel: { t: string; id?: unknown; i?: number };
declare const QUESTS: Quest[], PROG: Record<string, Set<number>>, LAYERS: { waves: boolean };
declare const SPEC: Record<number, { cx: number; cy: number; W: number; H: number }>;
declare function selectRegion(n: number): void;
declare function selectStop(id: string, i: number): void;
declare function stopPos(q: Quest, i: number): number[];
declare function routeOf(q: Quest): number[][] | undefined;
declare function nearOnRoute(rt: number[][], x: number, y: number): { d: number } | null;
declare function syncSettings(): void;
declare function reskin(): Promise<void>;
declare function artKey(): string;

const ROOT = join(import.meta.dirname, "..", "docs", "mockups", "quest-map");
const TYPES: Record<string, string> = { ".html": "text/html", ".png": "image/png", ".json": "application/json" };
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const FLAVORS = ["sourdough", "baguette", "brioche"] as const;
const SCHEMES = ["light", "dark"] as const;

let server: Server;
let origin = "";

test.beforeAll(async () => {
  server = createServer(async (req, res) => {
    const path = normalize(decodeURIComponent((req.url ?? "/").split("?")[0]!)).replace(/^\/+/, "") || "fullscreen.html";
    if (path.startsWith("..")) return void res.writeHead(400).end();
    try {
      const body = await readFile(join(ROOT, path));
      res.writeHead(200, { "content-type": TYPES[extname(path)] ?? "application/octet-stream" }).end(body);
    } catch {
      res.writeHead(404).end("not found");
    }
  });
  await new Promise<void>((ok) => server.listen(0, "127.0.0.1", ok));
  origin = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
});
test.afterAll(() => void server.close());

async function open(page: Page, flavor = "sourdough", scheme: "light" | "dark" = "light", reducedMotion: "reduce" | "no-preference" = "reduce") {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ colorScheme: scheme, reducedMotion });
  await page.goto(`${origin}/fullscreen.html`, { waitUntil: "load" });
  await page.evaluate(async () => (window as any).qmReady);
  await page.evaluate(async ([f, s]) => { root.dataset.theme = f; root.dataset.colorScheme = s; syncSettings(); await reskin(); }, [flavor, scheme]);
}

for (const flavor of FLAVORS) for (const scheme of SCHEMES) {
  test(`the quest map passes axe WCAG 2.2 AA (${flavor}, ${scheme})`, async ({ page }) => {
    await open(page, flavor, scheme);
    const failures: string[] = [];
    const scan = async (state: string) => {
      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      for (const v of violations) failures.push(`${state} [${v.impact}] ${v.id}: ${v.nodes.length}x ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
    };
    await scan("home");
    await page.evaluate(() => selectRegion(2));
    await scan("region");
    await page.evaluate(() => selectStop("one-loop-every-repo", 1));
    await scan("stop");
    await page.locator("#layers").click();
    await scan("layers open");
    await page.locator("#layers").click();
    await page.locator("#settings").click();
    await scan("settings open");
    expect(failures, failures.join("\n")).toEqual([]);
  });

  // axe cannot judge text laid over the canvas, so the pairs the pins, tags and labels use are checked from their resolved colours.
  test(`the quest map's label and panel colours reach 4.5:1 (${flavor}, ${scheme})`, async ({ page }) => {
    await open(page, flavor, scheme);
    const pairs = await page.evaluate(() => {
      const cs = getComputedStyle(document.documentElement);
      const rgb = (v: string) => { const c = document.createElement("canvas").getContext("2d")!; c.fillStyle = cs.getPropertyValue(v).trim(); c.fillRect(0, 0, 1, 1); return [...c.getImageData(0, 0, 1, 1).data].slice(0, 3); };
      const lum = ([r, g, b]: number[]) => { const f = (x: number) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r!) + 0.7152 * f(g!) + 0.0722 * f(b!); };
      const ratio = (a: string, b: string) => { const [x, y] = [lum(rgb(a)), lum(rgb(b))]; return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
      return [["--q-label", "--q-halo"], ["--q-ink", "--q-panel"], ["--q-muted", "--q-panel"], ["--q-accent-ink", "--q-accent"], ["--q-ink", "--q-paper"]].map(([a, b]) => ({ pair: `${a} on ${b}`, ratio: ratio(a!, b!) }));
    });
    for (const p of pairs) expect(p.ratio, p.pair).toBeGreaterThanOrEqual(4.5);
  });
}

// Functional checks. They read the page's own state through its globals (QUESTS, PROG, sel, V) and drive it through its real controls.
test.describe("quest map behaviour", () => {
  test("every stop of every quest has a position on the island", async ({ page }) => {
    await open(page);
    const bad = await page.evaluate(() => QUESTS.flatMap((q) => q.stops.slice(0, 9).map((_, i) => ({ q: q.id, i, p: stopPos(q, i) }))).filter(({ p }) => !p.every(Number.isFinite) || p[0] < 0 || p[1] < 0 || p[0] > WW || p[1] > WH));
    expect(bad).toEqual([]);
  });

  test("every quest has a route, its stops run along it in order, and its pin sits beside it", async ({ page }) => {
    await open(page);
    const problems = await page.evaluate(() => {
      const out: string[] = [];
      for (const q of QUESTS) {
        const rt = routeOf(q);
        if (!rt || rt.length < 2) { out.push(`${q.id}: no route`); continue; }
        const sp = SPEC[q.region]!;
        const toScene = (p: number[]) => [(p[0]! - Math.round(sp.cx - sp.W / 4)) * 2, (p[1]! - Math.round(sp.cy - sp.H / 4)) * 2] as const;
        const stops = q.stops.slice(0, 9).map((_, i) => toScene(stopPos(q, i)));
        stops.forEach((p, i) => { const h = nearOnRoute(rt, p[0], p[1]); if (!h || h.d > 1.5) out.push(`${q.id}: stop ${i + 1} is ${h?.d.toFixed(1)} off the route`); });
        stops.forEach((p, i) => { if (i && Math.hypot(p[0] - stops[i - 1]![0], p[1] - stops[i - 1]![1]) < 1) out.push(`${q.id}: stops ${i} and ${i + 1} sit on one spot`); });
        const pin = nearOnRoute(rt, ...toScene(q.pos));
        // The layout pushes a pin out to 15 steps from the route but keeps it inside its place, so a pin near an edge can end up closer:
        // build-the-floor sits 9 steps out at the Summit. 8 is the floor this test holds, so a pin can never land on its own route.
        if (pin && pin.d < 8) out.push(`${q.id}: pin is only ${pin.d.toFixed(1)} from its route (minimum 8)`);
      }
      return out;
    });
    expect(problems).toEqual([]);
  });

  test("marking a stop moves the adventurer, and undo puts it back", async ({ page }) => {
    await open(page);
    const before = await page.evaluate(() => ({ you: [...YOU], done: QUESTS.filter((q) => q.done).length, mine: [...PROG["loop-setup"]] }));
    expect(before.mine).toEqual([0]);
    await page.evaluate(() => selectStop("loop-setup", 1));
    await page.locator("#panel [data-act=done]").click();
    const after = await page.evaluate(() => ({ you: [...YOU], mine: [...PROG["loop-setup"]].sort() }));
    expect(after.mine).toEqual([0, 1]);
    expect(after.you).not.toEqual(before.you);
    await expect(page.locator("#panel [data-act=done]")).toContainText("Undo");
    await page.locator("#panel [data-act=done]").click();
    expect(await page.evaluate(() => [...PROG["loop-setup"]])).toEqual([0]);
  });

  test("finishing the last stop of a quest finishes the quest", async ({ page }) => {
    await open(page);
    const n = await page.evaluate(() => QUESTS.filter((q) => q.done).length);
    for (const i of [1, 2]) {
      await page.evaluate((i) => selectStop("loop-setup", i), i);
      await page.locator("#panel [data-act=done]").click();
    }
    expect(await page.evaluate(() => QUESTS.find((q) => q.id === "loop-setup")!.done)).toBe(true);
    expect(await page.evaluate(() => QUESTS.filter((q) => q.done).length)).toBe(n + 1);
  });

  test("the panel folds, searches, filters and steps between places", async ({ page }) => {
    await open(page);
    await page.locator("#q").fill("loop");
    await expect(page.locator("#panel .results .rowbtn")).not.toHaveCount(0);
    await page.locator("#q").fill("zzzz-no-such-quest");
    await expect(page.locator("#panel")).toContainText("0 quests match");
    await page.locator("#q").fill("");
    await page.locator(".chipsbar .chip", { hasText: "Models" }).click();
    expect(await page.evaluate(() => sel)).toMatchObject({ t: "region", id: 3 });
    await page.locator("#panel [data-nav=next]").first().click();
    expect(await page.evaluate(() => sel)).toMatchObject({ t: "region", id: 4 });
    await page.locator("#fold").click();
    await expect(page.locator("#panel")).toBeHidden();
    await page.locator("#fold").click();
    await expect(page.locator("#panel")).toBeVisible();
  });

  test("the zoom, Layers and settings controls change what they say they change", async ({ page }) => {
    await open(page);
    await expect(page.locator("#zname")).toHaveText("World");
    await page.locator("#zin").click();
    await expect(page.locator("#zname")).toHaveText("Regions");
    await page.locator("#zout").click();
    await expect(page.locator("#zname")).toHaveText("World");
    await page.locator("#layers").click();
    await expect(page.locator("#layers")).toHaveAttribute("aria-expanded", "true");
    const same = await page.evaluate(() => {
      const keep = base, box = document.querySelector<HTMLInputElement>("[data-layer=waves]")!;
      box.click();
      const off = !LAYERS.waves && base === keep;
      box.click();
      return off && LAYERS.waves && base === keep;
    });
    expect(same, "toggling waves must redraw without rebaking").toBe(true);
    await page.locator("#settings").click();
    await expect(page.locator("#settings")).toHaveAttribute("aria-expanded", "true");
    await page.locator("#flavors [data-f=brioche]").click();
    expect(await page.evaluate(() => root.dataset.theme)).toBe("brioche");
    await page.locator("#scheme [data-s=dark]").click();
    expect(await page.evaluate(() => artKey())).toBe("brioche-dark");
  });

  test("Motion starts off under reduced motion and on otherwise", async ({ page }) => {
    await open(page, "sourdough", "light", "reduce");
    await expect(page.locator("#motion")).toHaveAttribute("aria-pressed", "false");
    await open(page, "sourdough", "light", "no-preference");
    await expect(page.locator("#motion")).toHaveAttribute("aria-pressed", "true");
  });

  test("a keyboard alone reaches a pin and opens its place", async ({ page }) => {
    await open(page);
    let opened = false;
    for (let i = 0; i < 60 && !opened; i++) {
      await page.keyboard.press("Tab");
      const label = await page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? "");
      if (/region \d/.test(label)) { await page.keyboard.press("Enter"); opened = true; }
    }
    expect(opened, "no region pin took focus within 60 tabs").toBe(true);
    expect(await page.evaluate(() => sel.t)).toBe("region");
    await page.keyboard.press("Escape");
    expect(await page.evaluate(() => sel.t)).toBe("none");
  });

  test("the plain list holds every quest and stop the map does", async ({ page }) => {
    await open(page);
    const r = await page.evaluate(() => ({ quests: document.querySelectorAll("#route h3").length, stops: document.querySelectorAll("#route h3 ~ ol > li").length, want: [QUESTS.length, QUESTS.reduce((n, q) => n + q.stops.length, 0)] }));
    expect([r.quests, r.stops]).toEqual(r.want);
  });
});
