// portfolio/tools/social-card-pantry.ts — render the social image for the parked course platform note.
//
// Same card family as tools/social-card-pantry.ts. The picture is the note: a tall stack I built
// and crossed out, beside the three small pieces that run the course now.
//
//   bun run social:card:old-fashioned   # → content/media/notes/the-old-fashioned-way-social.png
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE } from "../src/seo.ts";

const OUT = join(import.meta.dir, "..", "content", "media", "notes");
const FILE = "the-old-fashioned-way-social.png";
const W = 1200;
const H = 1200;
const HOST = new URL(SITE.origin).host;

const PAPER = "#E2E0D8";
const INK = "#1C1B17";
const MUTED = "#6E6C64";
const LINE = "rgba(28,27,23,.18)";

const card = `<!doctype html><html><head><meta charset="utf-8"><style>html, body { margin: 0; }</style></head><body>
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Georgia, 'Times New Roman', serif">
    <defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto"><path d="M0,0 L10,5 L0,10 z" style="fill:${MUTED}"/></marker></defs>
    <rect width="${W}" height="${H}" style="fill:${PAPER}"/>
    <rect x="28" y="28" width="${W - 56}" height="${H - 56}" rx="10" style="fill:none;stroke:${LINE};stroke-width:1.5"/>
    <text x="96" y="122" style="fill:${MUTED};font-size:21px;letter-spacing:6px">A COURSE PLATFORM · PARKED</text>
    <text x="96" y="224" style="fill:${INK};font-size:80px;letter-spacing:-1.5px">I built a real course</text>
    <text x="96" y="312" style="fill:${INK};font-size:80px;letter-spacing:-1.5px">platform and then</text>
    <text x="96" y="400" style="fill:${INK};font-size:80px;letter-spacing:-1.5px;font-style:italic">parked it.</text>
    <rect x="96" y="470" width="420" height="50" rx="8" style="fill:none;stroke:${LINE};stroke-width:2"/><text x="306" y="503" text-anchor="middle" style="fill:${MUTED};font-size:26px">two sites</text><rect x="96" y="532" width="420" height="50" rx="8" style="fill:none;stroke:${LINE};stroke-width:2"/><text x="306" y="565" text-anchor="middle" style="fill:${MUTED};font-size:26px">Edge Functions</text><rect x="96" y="594" width="420" height="50" rx="8" style="fill:none;stroke:${LINE};stroke-width:2"/><text x="306" y="627" text-anchor="middle" style="fill:${MUTED};font-size:26px">row-level security</text><rect x="96" y="656" width="420" height="50" rx="8" style="fill:none;stroke:${LINE};stroke-width:2"/><text x="306" y="689" text-anchor="middle" style="fill:${MUTED};font-size:26px">auth</text><rect x="96" y="718" width="420" height="50" rx="8" style="fill:none;stroke:${LINE};stroke-width:2"/><text x="306" y="751" text-anchor="middle" style="fill:${MUTED};font-size:26px">~71 tables</text><rect x="96" y="780" width="420" height="50" rx="8" style="fill:none;stroke:${LINE};stroke-width:2"/><text x="306" y="813" text-anchor="middle" style="fill:${MUTED};font-size:26px">105 migrations</text><line x1="86" y1="460" x2="526" y2="842" style="stroke:${INK};stroke-width:3"/><rect x="680" y="500" width="424" height="80" rx="10" style="fill:none;stroke:${INK};stroke-width:3"/><text x="892" y="551" text-anchor="middle" style="fill:${INK};font-size:32px">Canvas</text><rect x="680" y="610" width="424" height="80" rx="10" style="fill:none;stroke:${INK};stroke-width:3"/><text x="892" y="661" text-anchor="middle" style="fill:${INK};font-size:32px">Student repos</text><rect x="680" y="720" width="424" height="80" rx="10" style="fill:none;stroke:${INK};stroke-width:3"/><text x="892" y="771" text-anchor="middle" style="fill:${INK};font-size:32px">Claude dashboard</text><path d="M560,655 L640,655" style="stroke:${MUTED};stroke-width:2" marker-end="url(#arr)"/>
    <text x="96" y="960" style="fill:${INK};font-size:34px">When the code is cheap, build the smallest</text>
    <text x="96" y="1006" style="fill:${INK};font-size:34px">layer the work actually needs.</text>
    <line x1="96" y1="1122" x2="${W - 96}" y2="1122" style="stroke:${LINE};stroke-width:1"/>
    <text x="96" y="1158" style="fill:${INK};font-size:22px">I Built a Real Course Platform and Then Parked It</text>
    <text x="${W - 96}" y="1158" text-anchor="end" style="fill:${MUTED};font-size:21px">${HOST}</text>
  </svg>
</body></html>`;

console.log("[social:card:old-fashioned] rendering…");
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.setContent(card, { waitUntil: "networkidle" });
  const buf = await page.screenshot({ clip: { x: 0, y: 0, width: W, height: H }, type: "png" });
  await mkdir(OUT, { recursive: true });
  await writeFile(join(OUT, FILE), buf);
  console.log(`[social:card:old-fashioned] wrote content/media/notes/${FILE} (${W}×${H}, ${(buf.length / 1024).toFixed(1)}kb)`);
} finally {
  await browser.close();
}
