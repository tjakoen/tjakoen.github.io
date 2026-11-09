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

// One abstract dashboard window: a title bar with three dots, then a body drawn by the caller.
const win = (x: number, y: number, w: number, h: number, dark: boolean, body: string) => {
  const fill = dark ? INK : PAPER;
  const stroke = INK;
  const dot = dark ? PAPER : MUTED;
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" style="fill:${fill};stroke:${stroke};stroke-width:2"/>
    <line x1="${x}" y1="${y + 34}" x2="${x + w}" y2="${y + 34}" style="stroke:${dark ? "rgba(226,224,216,.25)" : LINE};stroke-width:1.5"/>
    <circle cx="${x + 20}" cy="${y + 17}" r="5" style="fill:${dot}"/>
    <circle cx="${x + 38}" cy="${y + 17}" r="5" style="fill:${dot}"/>
    <circle cx="${x + 56}" cy="${y + 17}" r="5" style="fill:${dot}"/>
    ${body}`;
};

// Mine: a board of columns with cards, in light ink on the dark window.
const boardBody = (x: number, y: number) => {
  const ink = "rgba(226,224,216,.85)";
  const faint = "rgba(226,224,216,.3)";
  let out = "";
  const counts = [3, 2, 3, 1];
  counts.forEach((n, c) => {
    const cx = x + 18 + c * 70;
    out += `<rect x="${cx}" y="${y + 52}" width="60" height="8" rx="4" style="fill:${ink}"/>`;
    for (let i = 0; i < n; i++)
      out += `<rect x="${cx}" y="${y + 72 + i * 42}" width="60" height="34" rx="6" style="fill:none;stroke:${faint};stroke-width:1.5"/>`;
  });
  return out;
};

// Kercwin's: a list on the left, one row open on the right with accept and reject.
const epicBody = (x: number, y: number) => {
  let out = "";
  for (let i = 0; i < 5; i++)
    out += `<rect x="${x + 18}" y="${y + 54 + i * 34}" width="${i === 1 ? 112 : 96}" height="20" rx="4" style="fill:${i === 1 ? INK : LINE}"/>`;
  out += `<rect x="${x + 150}" y="${y + 54}" width="128" height="156" rx="8" style="fill:none;stroke:${INK};stroke-width:1.5"/>`;
  out += `<rect x="${x + 164}" y="${y + 70}" width="96" height="10" rx="5" style="fill:${INK}"/>`;
  out += `<rect x="${x + 164}" y="${y + 92}" width="80" height="8" rx="4" style="fill:${LINE}"/>`;
  out += `<rect x="${x + 164}" y="${y + 110}" width="90" height="8" rx="4" style="fill:${LINE}"/>`;
  out += `<rect x="${x + 164}" y="${y + 172}" width="44" height="24" rx="6" style="fill:none;stroke:${INK};stroke-width:1.5"/>`;
  out += `<rect x="${x + 216}" y="${y + 172}" width="48" height="24" rx="6" style="fill:none;stroke:${MUTED};stroke-width:1.5"/>`;
  return out;
};

// Kyle's: a note with checkboxes, some ticked.
const notesBody = (x: number, y: number) => {
  let out = `<rect x="${x + 22}" y="${y + 54}" width="150" height="12" rx="6" style="fill:${INK}"/>`;
  const widths = [190, 150, 210, 130, 170];
  widths.forEach((w, i) => {
    const ry = y + 86 + i * 26;
    const done = i < 2;
    out += `<rect x="${x + 22}" y="${ry}" width="14" height="14" rx="3" style="fill:${done ? INK : "none"};stroke:${INK};stroke-width:1.5"/>`;
    out += `<rect x="${x + 46}" y="${ry + 3}" width="${w}" height="8" rx="4" style="fill:${done ? MUTED : LINE}"/>`;
  });
  return out;
};

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

    ${win(96, 500, 330, 240, true, boardBody(96, 500))}
    <text x="261" y="786" text-anchor="middle" style="fill:${INK};font-size:30px">Mine</text>
    <text x="261" y="822" text-anchor="middle" style="fill:${MUTED};font-size:23px">the demo</text>

    <path d="M440,600 C500,560 560,575 590,628" style="fill:none;stroke:${MUTED};stroke-width:2;stroke-dasharray:6 7" marker-end="url(#arr)"/>
    <text x="600" y="560" text-anchor="middle" style="fill:${MUTED};font-size:24px;font-style:italic">two weeks later</text>

    ${win(470, 640, 300, 240, false, epicBody(470, 640))}
    <text x="620" y="926" text-anchor="middle" style="fill:${INK};font-size:30px">Kercwin's</text>
    <text x="620" y="962" text-anchor="middle" style="fill:${MUTED};font-size:23px">an epic checker</text>

    ${win(806, 640, 298, 240, false, notesBody(806, 640))}
    <text x="955" y="926" text-anchor="middle" style="fill:${INK};font-size:30px">Kyle's</text>
    <text x="955" y="962" text-anchor="middle" style="fill:${MUTED};font-size:23px">a board in Obsidian</text>

    <text x="96" y="1050" style="fill:${MUTED};font-size:24px">Nobody was assigned either one.</text>

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
