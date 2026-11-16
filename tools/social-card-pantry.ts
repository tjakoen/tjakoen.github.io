// portfolio/tools/social-card-pantry.ts — render the social image for the PANTRY note.
//
// Same card family as tools/social-card-dashboards.ts (1200×1200, paper and ink, Georgia, the host
// in the footer). The picture is the note's arc: a browser tab I forgot to open, an app window that
// opens itself, and a pane beside the chat that I never close.
//
//   bun run social:card:pantry   # → content/media/notes/pantry-beside-the-work-social.png
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE } from "../src/seo.ts";

const OUT = join(import.meta.dir, "..", "content", "media", "notes");
const FILE = "pantry-beside-the-work-social.png";
const W = 1200;
const H = 1200;
const HOST = new URL(SITE.origin).host;

const PAPER = "#E2E0D8";
const INK = "#1C1B17";
const MUTED = "#6E6C64";
const LINE = "rgba(28,27,23,.18)";

// A window with three dots in its title bar; faint windows are the ones nobody looked at.
const win = (x: number, y: number, w: number, h: number, faint: boolean, dark: boolean, body: string) => {
  const stroke = faint ? LINE : INK;
  const fill = dark ? INK : PAPER;
  const dot = dark ? PAPER : faint ? LINE : MUTED;
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" style="fill:${fill};stroke:${stroke};stroke-width:2;${faint ? "stroke-dasharray:8 7" : ""}"/>
    <line x1="${x}" y1="${y + 34}" x2="${x + w}" y2="${y + 34}" style="stroke:${dark ? "rgba(226,224,216,.25)" : LINE};stroke-width:1.5"/>
    <circle cx="${x + 20}" cy="${y + 17}" r="5" style="fill:${dot}"/>
    <circle cx="${x + 38}" cy="${y + 17}" r="5" style="fill:${dot}"/>
    <circle cx="${x + 56}" cy="${y + 17}" r="5" style="fill:${dot}"/>
    ${body}`;
};

const rows = (x: number, y: number, n: number, color: string, w = 200) =>
  Array.from({ length: n }, (_, i) => `<rect x="${x}" y="${y + i * 30}" width="${w - (i % 2) * 50}" height="14" rx="7" style="fill:${color}"/>`).join("");

// The tab: an address bar and a board nobody opened.
const tabBody = (x: number, y: number) =>
  `<rect x="${x + 76}" y="${y + 9}" width="150" height="16" rx="8" style="fill:none;stroke:${LINE};stroke-width:1.5"/>` +
  rows(x + 22, y + 56, 5, LINE, 220);

// The app: tiles across the top, then the work.
const appBody = (x: number, y: number) => {
  let out = "";
  for (let i = 0; i < 3; i++)
    out += `<rect x="${x + 20 + i * 86}" y="${y + 52}" width="74" height="50" rx="6" style="fill:none;stroke:${INK};stroke-width:${i === 0 ? 3 : 1.5}"/>`;
  return out + rows(x + 20, y + 124, 3, LINE, 230);
};

// The chat with the pane beside it: lines of conversation, a split, the board on the right.
const paneBody = (x: number, y: number, w: number, h: number) => {
  const ink = "rgba(226,224,216,.85)";
  const faint = "rgba(226,224,216,.3)";
  const split = x + w * 0.58;
  let out = `<line x1="${split}" y1="${y + 34}" x2="${split}" y2="${y + h}" style="stroke:${faint};stroke-width:1.5"/>`;
  out += rows(x + 22, y + 58, 5, faint, 130);
  out += `<rect x="${split + 16}" y="${y + 52}" width="${x + w - split - 32}" height="44" rx="6" style="fill:none;stroke:${ink};stroke-width:3"/>`;
  for (let i = 0; i < 2; i++)
    out += `<rect x="${split + 16}" y="${y + 108 + i * 52}" width="${x + w - split - 32}" height="40" rx="6" style="fill:none;stroke:${faint};stroke-width:1.5"/>`;
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

    <text x="96" y="122" style="fill:${MUTED};font-size:21px;letter-spacing:6px">PANTRY · FOUR MONTHS</text>
    <text x="96" y="224" style="fill:${INK};font-size:80px;letter-spacing:-1.5px">I built a command</text>
    <text x="96" y="312" style="fill:${INK};font-size:80px;letter-spacing:-1.5px">center and forgot</text>
    <text x="96" y="400" style="fill:${INK};font-size:80px;letter-spacing:-1.5px;font-style:italic">to turn it on.</text>

    ${win(96, 500, 290, 230, true, false, tabBody(96, 500))}
    <text x="241" y="776" text-anchor="middle" style="fill:${INK};font-size:30px">A browser tab</text>
    <text x="241" y="812" text-anchor="middle" style="fill:${MUTED};font-size:23px">I had to open</text>

    <path d="M392,615 L438,615" style="stroke:${MUTED};stroke-width:2" marker-end="url(#arr)"/>

    ${win(450, 500, 290, 230, false, false, appBody(450, 500))}
    <text x="595" y="776" text-anchor="middle" style="fill:${INK};font-size:30px">An app</text>
    <text x="595" y="812" text-anchor="middle" style="fill:${MUTED};font-size:23px">that opens itself</text>

    <path d="M746,615 L792,615" style="stroke:${MUTED};stroke-width:2" marker-end="url(#arr)"/>

    ${win(804, 500, 300, 230, false, true, paneBody(804, 500, 300, 230))}
    <text x="954" y="776" text-anchor="middle" style="fill:${INK};font-size:30px">A pane</text>
    <text x="954" y="812" text-anchor="middle" style="fill:${MUTED};font-size:23px">beside the chat</text>

    <text x="96" y="960" style="fill:${INK};font-size:34px">It only works if it is already open</text>
    <text x="96" y="1006" style="fill:${INK};font-size:34px">when the work starts.</text>

    <line x1="96" y1="1122" x2="${W - 96}" y2="1122" style="stroke:${LINE};stroke-width:1"/>
    <text x="96" y="1158" style="fill:${INK};font-size:22px">I Built a Command Center and Then Forgot to Turn It On</text>
    <text x="${W - 96}" y="1158" text-anchor="end" style="fill:${MUTED};font-size:21px">${HOST}</text>
  </svg>
</body></html>`;

console.log("[social:card:pantry] rendering…");
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.setContent(card, { waitUntil: "networkidle" });
  const buf = await page.screenshot({ clip: { x: 0, y: 0, width: W, height: H }, type: "png" });
  await mkdir(OUT, { recursive: true });
  await writeFile(join(OUT, FILE), buf);
  console.log(`[social:card:pantry] wrote content/media/notes/${FILE} (${W}×${H}, ${(buf.length / 1024).toFixed(1)}kb)`);
} finally {
  await browser.close();
}
