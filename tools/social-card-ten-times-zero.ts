// portfolio/tools/social-card-ten-times-zero.ts — the flagship note's LinkedIn card, 1200×1200.
//
//   bun run social:card:ten-times-zero     # → content/media/notes/ten-times-zero-social.png
//
// The image is the argument: a hundred dots, one row of them hollow. A multiplier scales whatever
// it is given, and ten times nothing is still nothing. Drawn here rather than generated, so it
// matches every other card in the family and carries the same e-ink palette.
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE } from "../src/seo.ts";

const OUT = join(import.meta.dir, "..", "content", "media", "notes");
const FILE = "ten-times-zero-social.png";
const W = 1200;
const H = 1200;
const HOST = new URL(SITE.origin).host;

const PAPER = "#E2E0D8";
const INK = "#1C1B17";
const MUTED = "#6E6C64";
const LINE = "rgba(28,27,23,.18)";

const COLS = 10;
const ROWS = 10;
const R = 14;
const GAP = 44;
const GRID_W = (COLS - 1) * GAP;
const X0 = (W - GRID_W) / 2;
const Y0 = 558;

const dot = (col: number, row: number) => {
  const x = X0 + col * GAP;
  const y = Y0 + row * GAP;
  // The last row is hollow: every unit the multiplier has to work with, and none of them there.
  return row === ROWS - 1
    ? `<circle cx="${x}" cy="${y}" r="${R}" style="fill:none;stroke:${MUTED};stroke-width:2"/>`
    : `<circle cx="${x}" cy="${y}" r="${R}" style="fill:${INK}"/>`;
};
const dots = Array.from({ length: ROWS }, (_row, row) =>
  Array.from({ length: COLS }, (_col, col) => dot(col, row)).join("")).join("\n    ");

const card = `<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;padding:0;background:${PAPER}}
</style></head><body>
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"
       font-family="Georgia, 'Times New Roman', serif" role="img"
       aria-label="Ten rows of ten dark dots, and a last row of ten hollow ones: a multiplier scales what it is given, and ten times zero is still zero.">
    <rect width="${W}" height="${H}" style="fill:${PAPER}"/>
    <rect x="28" y="28" width="${W - 56}" height="${H - 56}" rx="10" style="fill:none;stroke:${LINE};stroke-width:1.5"/>

    <text x="96" y="122" style="fill:${MUTED};font-size:21px;letter-spacing:6px">TEN TIMES ZERO</text>
    <text x="96" y="228" style="fill:${INK};font-size:84px;letter-spacing:-1.5px">AI multiplies</text>
    <text x="96" y="318" style="fill:${INK};font-size:84px;letter-spacing:-1.5px">what you</text>
    <text x="96" y="408" style="fill:${INK};font-size:84px;letter-spacing:-1.5px;font-style:italic">already are.</text>

    ${dots}

    <text x="96" y="1032" style="fill:${INK};font-size:30px">Ten times zero is still zero.</text>
    <text x="96" y="1070" style="fill:${MUTED};font-size:24px">The rails are the human's. The typing inside them is not.</text>

    <line x1="96" y1="1108" x2="${W - 96}" y2="1108" style="stroke:${LINE};stroke-width:1"/>
    <text x="96" y="1146" style="fill:${INK};font-size:22px">Ten Times Zero Is Still Zero</text>
    <text x="${W - 96}" y="1146" text-anchor="end" style="fill:${MUTED};font-size:21px">${HOST}</text>
  </svg>
</body></html>`;

console.log("[social:card:ten-times-zero] rendering…");
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.setContent(card, { waitUntil: "networkidle" });
  const buf = await page.screenshot({ clip: { x: 0, y: 0, width: W, height: H }, type: "png" });
  await mkdir(OUT, { recursive: true });
  await writeFile(join(OUT, FILE), buf);
  console.log(`[social:card:ten-times-zero] wrote content/media/notes/${FILE} (${W}×${H}, ${(buf.length / 1024).toFixed(1)}kb)`);
} finally {
  await browser.close();
}
