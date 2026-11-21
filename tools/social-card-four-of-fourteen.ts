// Render the four-of-fourteen note's kept-skills grid as a square social card.
// Run with: bun tools/social-card-four-of-fourteen.ts
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE } from "../src/seo.ts";

const OUT = join(import.meta.dir, "..", "content", "media", "notes");
const FILE = "four-of-fourteen-social.png";
const W = 1200;
const H = 1200;
const HOST = new URL(SITE.origin).host;
const PAPER = "#E2E0D8";
const INK = "#1C1B17";
const MUTED = "#6E6C64";
const LINE = "rgba(28,27,23,.18)";

const card = `<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;background:${PAPER}}
  svg{display:block;font-family:Georgia,'Times New Roman',serif}
</style></head><body>
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"
       role="img" aria-label="Fourteen squares for Brad Frost's fourteen skills, grouped into design systems, product design, mental health and setup. Four are filled in: token architecture, AI rails, inspection and vibe-killer. The caption says four of fourteen, kept on purpose.">
    <rect width="${W}" height="${H}" style="fill:${PAPER}"/>
    <text x="96" y="98" style="fill:${MUTED};font-size:25px;letter-spacing:4px">BORROWED SKILLS</text>
    <text x="96" y="210" style="fill:${INK};font-size:96px">Four of fourteen.</text>
    <text x="96" y="280" style="fill:${INK};font-size:44px">Kept on purpose, credited, pinned.</text>
    <text x="96" y="410" style="fill:${MUTED};font-size:24px;letter-spacing:3px">DESIGN SYSTEMS</text>
    <rect x="96" y="430" width="56" height="56" style="fill:${INK}"/>
    <text x="96" y="520" style="fill:${INK};font-size:26px">tokens</text>
    <rect x="296" y="430" width="56" height="56" style="fill:${INK}"/>
    <text x="296" y="520" style="fill:${INK};font-size:26px">AI rails</text>
    <rect x="496" y="430" width="56" height="56" style="fill:${INK}"/>
    <text x="496" y="520" style="fill:${INK};font-size:26px">inspection</text>
    <rect x="696" y="430" width="56" height="56" style="fill:none;stroke:${MUTED};stroke-width:3"/>
    <text x="696" y="520" style="fill:${MUTED};font-size:26px">adoption</text>
    <rect x="896" y="430" width="56" height="56" style="fill:none;stroke:${MUTED};stroke-width:3"/>
    <text x="896" y="520" style="fill:${MUTED};font-size:26px">ASCII</text>
    <text x="96" y="580" style="fill:${MUTED};font-size:24px;letter-spacing:3px">PRODUCT DESIGN</text>
    <rect x="96" y="600" width="56" height="56" style="fill:${INK}"/>
    <text x="96" y="690" style="fill:${INK};font-size:26px">vibe-killer</text>
    <rect x="296" y="600" width="56" height="56" style="fill:none;stroke:${MUTED};stroke-width:3"/>
    <text x="296" y="690" style="fill:${MUTED};font-size:26px">product</text>
    <rect x="496" y="600" width="56" height="56" style="fill:none;stroke:${MUTED};stroke-width:3"/>
    <text x="496" y="690" style="fill:${MUTED};font-size:26px">to Storybook</text>
    <rect x="696" y="600" width="56" height="56" style="fill:none;stroke:${MUTED};stroke-width:3"/>
    <text x="696" y="690" style="fill:${MUTED};font-size:26px">from Storybook</text>
    <text x="96" y="750" style="fill:${MUTED};font-size:24px;letter-spacing:3px">MENTAL HEALTH</text>
    <rect x="96" y="770" width="56" height="56" style="fill:none;stroke:${MUTED};stroke-width:3"/>
    <text x="96" y="860" style="fill:${MUTED};font-size:26px">setup</text>
    <rect x="296" y="770" width="56" height="56" style="fill:none;stroke:${MUTED};stroke-width:3"/>
    <text x="296" y="860" style="fill:${MUTED};font-size:26px">endings</text>
    <rect x="496" y="770" width="56" height="56" style="fill:none;stroke:${MUTED};stroke-width:3"/>
    <text x="496" y="860" style="fill:${MUTED};font-size:26px">energy</text>
    <rect x="696" y="770" width="56" height="56" style="fill:none;stroke:${MUTED};stroke-width:3"/>
    <text x="696" y="860" style="fill:${MUTED};font-size:26px">quiet hours</text>
    <rect x="896" y="770" width="56" height="56" style="fill:none;stroke:${MUTED};stroke-width:3"/>
    <text x="896" y="860" style="fill:${MUTED};font-size:26px">sessions</text>
    <text x="96" y="920" style="fill:${MUTED};font-size:24px;letter-spacing:3px">SETUP</text>
    <rect x="96" y="940" width="56" height="56" style="fill:none;stroke:${MUTED};stroke-width:3"/>
    <text x="96" y="1030" style="fill:${MUTED};font-size:26px">start here</text>
    <line x1="96" y1="1094" x2="1104" y2="1094" style="stroke:${LINE};stroke-width:1"/>
    <text x="96" y="1149" style="fill:${INK};font-size:24px">Skills by Brad Frost, MIT</text>
    <text x="1104" y="1149" text-anchor="end" style="fill:${MUTED};font-size:22px">${HOST}</text>
  </svg>
</body></html>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.setContent(card, { waitUntil: "networkidle" });
  const clippedText = await page.locator("svg text").evaluateAll((nodes) => nodes
    .filter((node) => {
      const box = (node as SVGGraphicsElement).getBBox();
      return box.x < 0 || box.y < 0 || box.x + box.width > 1200 || box.y + box.height > 1200;
    }).map((node) => node.textContent));
  if (clippedText.length) throw new Error(`Card text exceeds the canvas: ${clippedText.join("; ")}`);
  const buf = await page.screenshot({ clip: { x: 0, y: 0, width: W, height: H }, type: "png" });
  await mkdir(OUT, { recursive: true });
  await writeFile(join(OUT, FILE), buf);
  console.log(`Wrote content/media/notes/${FILE} (${W}×${H}, ${(buf.length / 1024).toFixed(1)}kb)`);
} finally {
  await browser.close();
}
