// e2e/quest-map.e2e.ts — the quest map mockup (docs/mockups/quest-map/fullscreen.html): the WCAG 2.2 AA scan in all six flavor and
// scheme pairs, and the functional checks for routes, progress and the panel controls. The mockup is a static file, not a route of the
// site, so this spec serves the folder itself on a free port instead of using the app's webServer.
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { createServer, type Server } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

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

async function open(page: Page, flavor = "sourdough", scheme = "light", reducedMotion: "reduce" | "no-preference" = "reduce") {
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
