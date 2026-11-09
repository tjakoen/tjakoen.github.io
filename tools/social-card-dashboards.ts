// portfolio/tools/social-card-dashboards.ts — render the LinkedIn social image for the dashboards note.
//
// Same card family as tools/social-card.ts (1200×1200, paper and ink, Georgia, the host in the
// footer), drawn from scratch so it stays legible at feed size. The picture is the note's turn: my
// dashboards, one demo, and the two things the team built after it.
//
//   bun run social:card:dashboards   # → content/media/notes/show-them-the-board-social.png
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE } from "../src/seo.ts";

const OUT = join(import.meta.dir, "..", "content", "media", "notes");
const FILE = "show-them-the-board-social.png";
const W = 1200;
const H = 1200;
const HOST = new URL(SITE.origin).host;

const PAPER = "#E2E0D8";
const INK = "#1C1B17";
const MUTED = "#6E6C64";
const LINE = "rgba(28,27,23,.18)";

const box = (x: number, y: number, w: number, h: number, title: string, sub: string) => `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" style="fill:${PAPER};stroke:${INK};stroke-width:2"/>
    <text x="${x + w / 2}" y="${y + 52}" text-anchor="middle" style="fill:${INK};font-size:34px">${title}</text>
    <text x="${x + w / 2}" y="${y + 92}" text-anchor="middle" style="fill:${MUTED};font-size:25px">${sub}</text>`;

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

    <text x="96" y="122" style="fill:${MUTED};font-size:21px;letter-spacing:6px">CLAUDE DASHBOARDS · ONE DEMO</text>
    <text x="96" y="224" style="fill:${INK};font-size:80px;letter-spacing:-1.5px">I showed my team</text>
    <text x="96" y="312" style="fill:${INK};font-size:80px;letter-spacing:-1.5px">a dashboard.</text>
    <text x="96" y="400" style="fill:${INK};font-size:80px;letter-spacing:-1.5px;font-style:italic">They built their own.</text>

    ${box(330, 470, 540, 120, "My review board", "and Crew Watch")}

    <line x1="600" y1="590" x2="600" y2="652" style="stroke:${MUTED};stroke-width:2" marker-end="url(#arr)"/>
    <rect x="470" y="656" width="260" height="76" rx="38" style="fill:${INK}"/>
    <text x="600" y="704" text-anchor="middle" style="fill:${PAPER};font-size:32px">one demo</text>

    <path d="M540,732 C470,800 330,800 300,858" style="fill:none;stroke:${MUTED};stroke-width:2" marker-end="url(#arr)"/>
    <path d="M660,732 C730,800 870,800 900,858" style="fill:none;stroke:${MUTED};stroke-width:2" marker-end="url(#arr)"/>
    <text x="600" y="812" text-anchor="middle" style="fill:${MUTED};font-size:24px;font-style:italic">two weeks later</text>

    ${box(110, 864, 400, 120, "An epic checker", "Kercwin, tech lead")}
    ${box(690, 864, 400, 120, "An Obsidian board", "Kyle, developer")}

    <text x="600" y="1050" text-anchor="middle" style="fill:${MUTED};font-size:24px">Nobody was assigned either one.</text>

    <line x1="96" y1="1122" x2="${W - 96}" y2="1122" style="stroke:${LINE};stroke-width:1"/>
    <text x="96" y="1158" style="fill:${INK};font-size:22px">I Showed My Team a Dashboard</text>
    <text x="${W - 96}" y="1158" text-anchor="end" style="fill:${MUTED};font-size:21px">${HOST}</text>
  </svg>
</body></html>`;

console.log("[social:card:dashboards] rendering…");
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.setContent(card, { waitUntil: "networkidle" });
  const buf = await page.screenshot({ clip: { x: 0, y: 0, width: W, height: H }, type: "png" });
  await mkdir(OUT, { recursive: true });
  await writeFile(join(OUT, FILE), buf);
  console.log(`[social:card:dashboards] wrote content/media/notes/${FILE} (${W}×${H}, ${(buf.length / 1024).toFixed(1)}kb)`);
} finally {
  await browser.close();
}
