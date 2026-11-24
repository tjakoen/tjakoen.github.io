// portfolio/tools/social-card-decision-model.ts — render the social image for "The Decision Model I Did Not Install".
//
// Same card family as the other social cards (1200×1200, paper and ink, Georgia, the host in the
// footer). The picture is the four ideas taken from AnyJev, with the capped escalation as the one
// thing that changes how the loop spends its budget.
//
//   bun run social:card:decision-model   # → content/media/notes/the-decision-model-i-did-not-install-social.png
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE } from "../src/seo.ts";

const OUT = join(import.meta.dir, "..", "content", "media", "notes");
const FILE = "the-decision-model-i-did-not-install-social.png";
const W = 1200;
const H = 1200;
const HOST = new URL(SITE.origin).host;

const PAPER = "#E2E0D8";
const INK = "#1C1B17";
const MUTED = "#6E6C64";
const LINE = "rgba(28,27,23,.28)";

const X = 96;
const GAP = 24;
const TW = (W - 2 * X - GAP) / 2;
const TH = 154;
const tiles = [
  { t: "A typed question", s: "a choice, a yes or no, a score" },
  { t: "A probability", s: "not a phrase to parse later" },
  { t: "Both orders", s: "ask it again with the options reversed" },
  { t: "A capped escalation", s: "hard cases go up, with a budget", heavy: true },
];

const grid: string[] = [];
tiles.forEach((tile, i) => {
  const x = X + (i % 2) * (TW + GAP);
  const y = 430 + Math.floor(i / 2) * (TH + GAP);
  grid.push(
    `<rect x="${x}" y="${y}" width="${TW}" height="${TH}" rx="12" style="fill:${tile.heavy ? INK : "none"};stroke:${tile.heavy ? INK : LINE};stroke-width:${tile.heavy ? 4 : 2}"/>`,
  );
  grid.push(
    `<text x="${x + 32}" y="${y + 58}" style="fill:${tile.heavy ? PAPER : INK};font-size:34px">${tile.t}</text>`,
  );
  grid.push(
    `<text x="${x + 32}" y="${y + 102}" style="fill:${tile.heavy ? "rgba(226,224,216,.72)" : MUTED};font-size:22px">${tile.s}</text>`,
  );
});

const card = `<!doctype html><html><head><meta charset="utf-8"><style>
  html, body { margin: 0; }
</style></head><body>
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"
       font-family="Georgia, 'Times New Roman', serif">
    <rect width="${W}" height="${H}" style="fill:${PAPER}"/>
    <rect x="28" y="28" width="${W - 56}" height="${H - 56}" rx="10" style="fill:none;stroke:${LINE};stroke-width:1.5"/>

    <text x="${X}" y="112" style="fill:${MUTED};font-size:21px;letter-spacing:6px">A DECISION, NOT A PROMPT</text>
    <text x="${X}" y="238" style="fill:${INK};font-size:82px;letter-spacing:-1.5px">The decision model</text>
    <text x="${X}" y="330" style="fill:${INK};font-size:82px;letter-spacing:-1.5px;font-style:italic">I didn't install.</text>

    ${grid.join("\n    ")}

    <text x="${X}" y="892" style="fill:${INK};font-size:32px">I took the interface, not the model.</text>
    <text x="${X}" y="938" style="fill:${MUTED};font-size:23px">AnyJev, read for an agent loop on rented APIs.</text>

    <line x1="${X}" y1="1122" x2="${W - X}" y2="1122" style="stroke:${LINE};stroke-width:1"/>
    <text x="${X}" y="1158" style="fill:${INK};font-size:22px">The Decision Model I Did Not Install</text>
    <text x="${W - X}" y="1158" text-anchor="end" style="fill:${MUTED};font-size:21px">${HOST}</text>
  </svg>
</body></html>`;

console.log("[social:card:decision-model] rendering…");
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.setContent(card, { waitUntil: "networkidle" });
  const buf = await page.screenshot({ clip: { x: 0, y: 0, width: W, height: H }, type: "png" });
  await mkdir(OUT, { recursive: true });
  await writeFile(join(OUT, FILE), buf);
  console.log(`[social:card:decision-model] wrote content/media/notes/${FILE} (${W}×${H}, ${(buf.length / 1024).toFixed(1)}kb)`);
} finally {
  await browser.close();
}
