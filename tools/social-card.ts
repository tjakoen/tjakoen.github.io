// portfolio/tools/social-card.ts — render the LinkedIn social image for a note as a PNG.
//
// One square card per note, sized for the feed (1200×1200), rendered headless through Playwright
// and the chromium already installed for shots/e2e. The card is a build-time asset: the PNG is
// committed under content/media and the export copies media/ verbatim, so nothing here runs in CI.
//
//   bun run social:card     # → content/media/notes/one-loop-three-harnesses-social.png
//
// The card is not a screenshot of the page. It is a small infographic drawn from scratch so the
// loop stays legible at feed size: one person at the centre, the three harnesses riding the ring,
// and the five steps named outside it.
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const OUT = join(import.meta.dir, "..", "content", "media", "notes");
const FILE = "one-loop-three-harnesses-social.png";
const W = 1200;
const H = 1200;

const PAPER = "#E2E0D8";
const INK = "#1C1B17";
const MUTED = "#6E6C64";
const LINE = "rgba(28,27,23,.18)";

const CX = 600;
const CY = 805;
const R = 240;

type Stage = { name: string; angle: number };
const STAGES: Stage[] = [
  { name: "Plan", angle: -90 },
  { name: "Session", angle: -18 },
  { name: "Report", angle: 54 },
  { name: "Second reader", angle: 126 },
  { name: "Human gate", angle: 198 },
];

type Harness = { name: string; angle: number };
const HARNESSES: Harness[] = [
  { name: "Claude Code", angle: -54 },
  { name: "Codex", angle: 18 },
  { name: "DeepSeek", angle: 138 },
];

const rad = (deg: number) => (deg * Math.PI) / 180;
const at = (radius: number, angle: number) => ({
  x: CX + radius * Math.cos(rad(angle)),
  y: CY + radius * Math.sin(rad(angle)),
});

const stageLayer = STAGES.map((stage) => {
  const dot = at(R, stage.angle);
  const tickStart = at(R + 10, stage.angle);
  const tickEnd = at(R + 26, stage.angle);
  const label = at(300, stage.angle);
  const anchor =
    stage.name === "Plan" ? "middle" : Math.cos(rad(stage.angle)) > 0 ? "start" : "end";
  return `
    <circle cx="${dot.x.toFixed(1)}" cy="${dot.y.toFixed(1)}" r="5" style="fill:${INK}"/>
    <line x1="${tickStart.x.toFixed(1)}" y1="${tickStart.y.toFixed(1)}" x2="${tickEnd.x.toFixed(1)}" y2="${tickEnd.y.toFixed(1)}" style="stroke:${LINE};stroke-width:1"/>
    <text x="${label.x.toFixed(1)}" y="${label.y.toFixed(1)}" text-anchor="${anchor}" style="fill:${INK};font-size:33px">${stage.name}</text>`;
}).join("");

const harnessLayer = HARNESSES.map((harness) => {
  const p = at(R, harness.angle);
  const width = harness.name.length * 12.4 + 44;
  return `
    <g>
      <rect x="${(p.x - width / 2).toFixed(1)}" y="${(p.y - 21).toFixed(1)}" width="${width.toFixed(1)}" height="42" rx="21" style="fill:${PAPER};stroke:${LINE};stroke-width:1.2"/>
      <text x="${p.x.toFixed(1)}" y="${(p.y + 8).toFixed(1)}" text-anchor="middle" style="fill:${INK};font-size:24px">${harness.name}</text>
    </g>`;
}).join("");

const card = `<!doctype html><html><head><meta charset="utf-8"><style>
  html, body { margin: 0; }
</style></head><body>
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"
       font-family="Georgia, 'Times New Roman', serif">
    <rect width="${W}" height="${H}" style="fill:${PAPER}"/>
    <rect x="28" y="28" width="${W - 56}" height="${H - 56}" rx="10" style="fill:none;stroke:${LINE};stroke-width:1.5"/>

    <text x="96" y="122" style="fill:${MUTED};font-size:21px;letter-spacing:6px">ONE LOOP · THREE HARNESSES</text>
    <text x="96" y="224" style="fill:${INK};font-size:86px;letter-spacing:-1.5px">One person.</text>
    <text x="96" y="316" style="fill:${INK};font-size:86px;letter-spacing:-1.5px">Three harnesses.</text>
    <text x="96" y="408" style="fill:${INK};font-size:86px;letter-spacing:-1.5px;font-style:italic">One loop.</text>

    <circle cx="${CX}" cy="${CY}" r="${R}" style="fill:none;stroke:${INK};stroke-width:2"/>
    <circle cx="${CX}" cy="${CY}" r="${R - 9}" style="fill:none;stroke:${LINE};stroke-width:1"/>
    ${stageLayer}
    ${harnessLayer}

    <g>
      <circle cx="${CX}" cy="764" r="26" style="fill:${INK}"/>
      <path d="M 552 862 C 552 826, 570 812, 600 812 C 630 812, 648 826, 648 862 Z" style="fill:${INK}"/>
    </g>
    <text x="${CX}" y="900" text-anchor="middle" style="fill:${MUTED};font-size:25px;letter-spacing:1px">one person</text>

    <line x1="96" y1="1122" x2="${W - 96}" y2="1122" style="stroke:${LINE};stroke-width:1"/>
    <text x="96" y="1158" style="fill:${INK};font-size:22px">The Loop Outlives the Model</text>
    <text x="${W - 96}" y="1158" text-anchor="end" style="fill:${MUTED};font-size:21px">tjakoen.github.io</text>
  </svg>
</body></html>`;

console.log("[social:card] rendering…");
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.setContent(card, { waitUntil: "networkidle" });
  const buf = await page.screenshot({ clip: { x: 0, y: 0, width: W, height: H }, type: "png" });
  await mkdir(OUT, { recursive: true });
  await writeFile(join(OUT, FILE), buf);
  console.log(`[social:card] wrote content/media/notes/${FILE} (${W}×${H}, ${(buf.length / 1024).toFixed(1)}kb)`);
} finally {
  await browser.close();
}
