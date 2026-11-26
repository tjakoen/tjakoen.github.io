// Bakes the quest map's art at build time: bun docs/mockups/quest-map/bake-art.ts
// For each flavor and scheme pair it loads fullscreen.html with ?procedural, lets the page draw its own art once, and saves the canvases
// as PNG files in art/<flavor>-<scheme>/ with a manifest of the scene boxes and the sparkle spots. The page then fetches those files
// instead of drawing the map on load. Needs a Chromium that Playwright can launch (bunx playwright install chromium).
// Set QM_CHROMIUM to a browser binary when the one Playwright expects is not installed.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, normalize } from "node:path";

// The page's own globals, read inside page.evaluate. They live in the page, so they are only declared here.
type Scene = { n: number; ox: number; oy: number; W: number; H: number; cv: HTMLCanvasElement };
declare const root: HTMLElement, base: HTMLCanvasElement, wavesCv: HTMLCanvasElement, baseP: HTMLCanvasElement, DET: Scene[], glints: number[][];
declare function reskin(): Promise<void>;

const here = dirname(new URL(import.meta.url).pathname);
const FLAVORS = ["sourdough", "baguette", "brioche"];
const SCHEMES = ["light", "dark"];

const server = Bun.serve({
  port: 0,
  async fetch(req) {
    const path = normalize(decodeURIComponent(new URL(req.url).pathname)).replace(/^\/+/, "") || "index.html";
    if (path.startsWith("..")) return new Response("no", { status: 400 });
    const file = Bun.file(join(here, path));
    return (await file.exists()) ? new Response(file) : new Response("not found", { status: 404 });
  },
});

const browser = await chromium.launch({ executablePath: process.env.QM_CHROMIUM || undefined });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(`http://localhost:${server.port}/fullscreen.html?procedural`);
await page.evaluate(() => (window as any).qmReady);

let files = 0;
for (const flavor of FLAVORS) {
  for (const scheme of SCHEMES) {
    const out: any = await page.evaluate(
      async ([f, s]) => {
        root.dataset.theme = f;
        root.dataset.colorScheme = s;
        await reskin();
        const png = (c: HTMLCanvasElement) => c.toDataURL("image/png").split(",")[1];
        return {
          base: png(base),
          waves: png(wavesCv),
          path: png(baseP),
          layer: png(document.getElementById("c-layer") as HTMLCanvasElement),
          scenes: DET.map((d: any) => ({ n: d.n, ox: d.ox, oy: d.oy, W: d.W, H: d.H, png: png(d.cv) })),
          glints,
        };
      },
      [flavor, scheme],
    );
    const dir = join(here, "art", `${flavor}-${scheme}`);
    mkdirSync(dir, { recursive: true });
    const put = (name: string, b64: string) => { writeFileSync(join(dir, name), Buffer.from(b64, "base64")); files++; };
    put("base.png", out.base);
    put("waves.png", out.waves);
    put("path.png", out.path);
    put("layer.png", out.layer);
    for (const sc of out.scenes) put(`scene-${sc.n}.png`, sc.png);
    writeFileSync(
      join(dir, "manifest.json"),
      JSON.stringify({ det: out.scenes.map(({ n, ox, oy, W, H }: any) => ({ n, ox, oy, W, H })), glints: out.glints }) + "\n",
    );
    files++;
  }
}
await browser.close();
server.stop();
console.log(`baked ${FLAVORS.length * SCHEMES.length} pairs, ${files} files, into ${join(here, "art")}`);
