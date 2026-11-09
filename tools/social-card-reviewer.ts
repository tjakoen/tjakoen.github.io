// portfolio/tools/social-card-reviewer.ts — render the LinkedIn social image for the review kit note.
//
// Same card family as tools/social-card.ts (1200×1200, paper and ink, Georgia, the host in the
// footer). The picture is the note's turn: a question I could not answer, and the loop that answered
// it, with the one number that shows the team felt it.
//
//   bun run social:card:reviewer   # → content/media/notes/the-reviewer-that-learned-to-be-wrong-social.png
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE } from "../src/seo.ts";

const OUT = join(import.meta.dir, "..", "content", "media", "notes");
const FILE = "the-reviewer-that-learned-to-be-wrong-social.png";
const W = 1200;
const H = 1200;
const HOST = new URL(SITE.origin).host;

const PAPER = "#E2E0D8";
const INK = "#1C1B17";
const MUTED = "#6E6C64";
const LINE = "rgba(28,27,23,.18)";

// (kept for a variant) The learning loop as four stations on a rounded track, the last one filled.
const station = (x: number, y: number, label: string, sub: string, filled = false) => `
  <rect x="${x - 150}" y="${y - 46}" width="300" height="92" rx="12" style="fill:${filled ? INK : PAPER};stroke:${INK};stroke-width:2"/>
  <text x="${x}" y="${y - 4}" text-anchor="middle" style="fill:${filled ? PAPER : INK};font-size:30px">${label}</text>
  <text x="${x}" y="${y + 28}" text-anchor="middle" style="fill:${filled ? "rgba(226,224,216,.75)" : MUTED};font-size:21px">${sub}</text>`;

const SHOT = join(import.meta.dir, "..", "content", "media", "review-kit", "board-in-claude.jpg");
const shot = `data:image/jpeg;base64,${Buffer.from(await Bun.file(SHOT).arrayBuffer()).toString("base64")}`;

// The real board, on invented pull requests, cropped to the board columns and framed as a window.
const card = `<!doctype html><html><head><meta charset="utf-8"><style>
  html, body { margin: 0; }
</style></head><body>
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"
       xmlns:xlink="http://www.w3.org/1999/xlink" font-family="Georgia, 'Times New Roman', serif">
    <defs>
      <clipPath id="shot"><rect x="96" y="420" width="${W - 192}" height="440" rx="10"/></clipPath>
    </defs>
    <rect width="${W}" height="${H}" style="fill:${PAPER}"/>
    <rect x="28" y="28" width="${W - 56}" height="${H - 56}" rx="10" style="fill:none;stroke:${LINE};stroke-width:1.5"/>

    <text x="96" y="122" style="fill:${MUTED};font-size:21px;letter-spacing:6px">MY AI CODE REVIEWER · THREE MONTHS</text>
    <text x="96" y="220" style="fill:${INK};font-size:70px;letter-spacing:-1.5px">"I don't trust it."</text>
    <text x="96" y="310" style="fill:${INK};font-size:70px;letter-spacing:-1.5px;font-style:italic">"Why not?"</text>
    <text x="96" y="370" style="fill:${MUTED};font-size:26px">So I made it grade every comment, and replay every miss.</text>

    <g clip-path="url(#shot)">
      <image href="${shot}" x="-238" y="420" width="1810" height="628" preserveAspectRatio="xMinYMin slice"/>
    </g>
    <rect x="96" y="420" width="${W - 192}" height="440" rx="10" style="fill:none;stroke:${INK};stroke-width:2"/>
    <text x="${W - 110}" y="884" text-anchor="end" style="fill:${MUTED};font-size:19px;font-style:italic">the real board, on invented pull requests</text>

    <text x="96" y="950" style="fill:${MUTED};font-size:23px">Slowest quarter of my team's wait for a first review</text>
    <text x="96" y="1030" style="fill:${INK};font-size:68px">17.6 h <tspan style="fill:${MUTED}">→</tspan> 3.0 h</text>
    <text x="${W - 96}" y="1030" text-anchor="end" style="fill:${MUTED};font-size:23px">cost per review: down by half</text>

    <line x1="96" y1="1122" x2="${W - 96}" y2="1122" style="stroke:${LINE};stroke-width:1"/>
    <text x="96" y="1158" style="fill:${INK};font-size:22px">Seven Hundred Commits to Teach a Reviewer It Was Wrong</text>
    <text x="${W - 96}" y="1158" text-anchor="end" style="fill:${MUTED};font-size:21px">${HOST}</text>
  </svg>
</body></html>`;

console.log("[social:card:reviewer] rendering…");
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.setContent(card, { waitUntil: "networkidle" });
  const buf = await page.screenshot({ clip: { x: 0, y: 0, width: W, height: H }, type: "png" });
  await mkdir(OUT, { recursive: true });
  await writeFile(join(OUT, FILE), buf);
  console.log(`[social:card:reviewer] wrote content/media/notes/${FILE} (${W}×${H}, ${(buf.length / 1024).toFixed(1)}kb)`);
} finally {
  await browser.close();
}
