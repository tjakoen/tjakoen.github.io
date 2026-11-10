// portfolio/tools/social-card-epic.ts — render the LinkedIn social image for the epic checker note.
//
// Same card family as tools/social-card-dashboards.ts (1200×1200, paper and ink, Georgia, the host
// in the footer). The picture is Matt's rule: four places a wrong assumption can be caught, each one
// more expensive than the last, with the epic checker boxed at the cheap end.
//
//   bun run social:card:epic   # → content/media/notes/move-bugs-left-social.png
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE } from "../src/seo.ts";

const OUT = join(import.meta.dir, "..", "content", "media", "notes");
const FILE = "move-bugs-left-social.png";
const W = 1200;
const H = 1200;
const HOST = new URL(SITE.origin).host;

const PAPER = "#E2E0D8";
const INK = "#1C1B17";
const MUTED = "#6E6C64";
const LINE = "rgba(28,27,23,.18)";

// The four stops, left to right. The dot grows with what a catch there costs.
const stops = [
  { x: 190, r: 14, label: "Ticket" },
  { x: 450, r: 24, label: "Review" },
  { x: 710, r: 36, label: "Testing" },
  { x: 990, r: 52, label: "Production" },
];
const Y = 760;

const card = `<!doctype html><html><head><meta charset="utf-8"><style>
  html, body { margin: 0; }
</style></head><body>
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"
       font-family="Georgia, 'Times New Roman', serif">
    <defs>
      <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" style="fill:${MUTED}"/>
      </marker>
    </defs>
    <rect width="${W}" height="${H}" style="fill:${PAPER}"/>
    <rect x="28" y="28" width="${W - 56}" height="${H - 56}" rx="10" style="fill:none;stroke:${LINE};stroke-width:1.5"/>

    <text x="96" y="122" style="fill:${MUTED};font-size:21px;letter-spacing:6px">ONE RULE · ONE TOOL</text>
    <text x="96" y="224" style="fill:${INK};font-size:80px;letter-spacing:-1.5px">Move bugs left.</text>
    <text x="96" y="312" style="fill:${INK};font-size:80px;letter-spacing:-1.5px">Catch it on the ticket,</text>
    <text x="96" y="400" style="fill:${INK};font-size:80px;letter-spacing:-1.5px;font-style:italic">not in production.</text>

    <line x1="110" y1="${Y}" x2="1110" y2="${Y}" style="stroke:${MUTED};stroke-width:2.5" marker-end="url(#arr)"/>
    <rect x="110" y="${Y - 90}" width="440" height="180" rx="14" style="fill:none;stroke:${INK};stroke-width:3"/>
    <text x="330" y="${Y - 112}" text-anchor="middle" style="fill:${INK};font-size:28px;font-style:italic">the epic checker works here</text>
    ${stops
      .map(
        (s) => `<circle cx="${s.x}" cy="${Y}" r="${s.r}" style="fill:${INK}"/>
    <text x="${s.x}" y="${Y + 130}" text-anchor="middle" style="fill:${INK};font-size:30px">${s.label}</text>`,
      )
      .join("\n    ")}
    <text x="110" y="${Y + 200}" style="fill:${MUTED};font-size:24px">cheaper to fix</text>
    <text x="1110" y="${Y + 200}" text-anchor="end" style="fill:${MUTED};font-size:24px">more expensive to fix</text>

    <line x1="96" y1="1122" x2="${W - 96}" y2="1122" style="stroke:${LINE};stroke-width:1"/>
    <text x="96" y="1158" style="fill:${INK};font-size:22px">Our CTO Said Move Bugs Left</text>
    <text x="${W - 96}" y="1158" text-anchor="end" style="fill:${MUTED};font-size:21px">${HOST}</text>
  </svg>
</body></html>`;

console.log("[social:card:epic] rendering…");
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.setContent(card, { waitUntil: "networkidle" });
  const buf = await page.screenshot({ clip: { x: 0, y: 0, width: W, height: H }, type: "png" });
  await mkdir(OUT, { recursive: true });
  await writeFile(join(OUT, FILE), buf);
  console.log(`[social:card:epic] wrote content/media/notes/${FILE} (${W}×${H}, ${(buf.length / 1024).toFixed(1)}kb)`);
} finally {
  await browser.close();
}
