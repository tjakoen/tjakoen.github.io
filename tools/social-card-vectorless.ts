// portfolio/tools/social-card-vectorless.ts — render the social image for the vectorless RAG note.
//
// Same card family as tools/social-card-pantry.ts (1200×1200, paper and ink, Georgia, the host in
// the footer). The picture is the note's contrast: a scatter where the nearest few dots get circled,
// beside a small tree where one path is drawn in ink down to the one leaf that gets opened.
//
//   bun run social:card:vectorless   # → content/media/notes/vectorless-rag-by-accident-social.png
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE } from "../src/seo.ts";

const OUT = join(import.meta.dir, "..", "content", "media", "notes");
const FILE = "vectorless-rag-by-accident-social.png";
const W = 1200;
const H = 1200;
const HOST = new URL(SITE.origin).host;

const PAPER = "#E2E0D8";
const INK = "#1C1B17";
const MUTED = "#6E6C64";
const LINE = "rgba(28,27,23,.18)";

// Left panel: a fixed scatter, with a ring around the few nearest the question mark.
const DOTS: [number, number][] = [
  [140, 560], [190, 610], [250, 540], [290, 700], [170, 700], [360, 570], [420, 690], [230, 760],
  [300, 590], [390, 780], [150, 820], [460, 600], [330, 730], [270, 820], [440, 820], [210, 660],
];
const Q: [number, number] = [320, 660];
const scatter = () => {
  let out = `<rect x="96" y="500" width="440" height="380" rx="12" style="fill:none;stroke:${LINE};stroke-width:2"/>`;
  for (const [x, y] of DOTS) {
    const near = Math.hypot(x - Q[0], y - Q[1]) < 80;
    out += `<circle cx="${x}" cy="${y}" r="9" style="fill:${near ? INK : LINE}"/>`;
  }
  out += `<circle cx="${Q[0]}" cy="${Q[1]}" r="86" style="fill:none;stroke:${MUTED};stroke-width:2;stroke-dasharray:8 7"/>`;
  out += `<text x="${Q[0]}" y="${Q[1] + 9}" text-anchor="middle" style="fill:${INK};font-size:30px">?</text>`;
  return out;
};

// Right panel: a three-level tree; the chosen path is ink, everything else faint.
const node = (x: number, y: number, on: boolean, leaf = false) =>
  `<rect x="${x - 45}" y="${y - 20}" width="90" height="40" rx="6" style="fill:${leaf ? INK : PAPER};stroke:${on ? INK : LINE};stroke-width:${on ? 3 : 2}"/>`;
const edge = (x1: number, y1: number, x2: number, y2: number, on: boolean) =>
  `<line x1="${x1}" y1="${y1 + 20}" x2="${x2}" y2="${y2 - 20}" style="stroke:${on ? INK : LINE};stroke-width:${on ? 3 : 2}"/>`;
const tree = () => {
  const root: [number, number] = [884, 560];
  const mid: [number, number][] = [[774, 690], [884, 690], [994, 690]];
  const leaves: [number, number][] = [[724, 820], [834, 820]];
  let out = `<rect x="664" y="500" width="440" height="380" rx="12" style="fill:none;stroke:${LINE};stroke-width:2"/>`;
  mid.forEach(([x, y], i) => (out += edge(root[0], root[1], x, y, i === 0)));
  leaves.forEach(([x, y], i) => (out += edge(mid[0][0], mid[0][1], x, y, i === 1)));
  out += node(...root, true);
  mid.forEach(([x, y], i) => (out += node(x, y, i === 0)));
  leaves.forEach(([x, y], i) => (out += node(x, y, i === 1, i === 1)));
  return out;
};

const card = `<!doctype html><html><head><meta charset="utf-8"><style>
  html, body { margin: 0; }
</style></head><body>
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"
       font-family="Georgia, 'Times New Roman', serif">
    <rect width="${W}" height="${H}" style="fill:${PAPER}"/>
    <rect x="28" y="28" width="${W - 56}" height="${H - 56}" rx="10" style="fill:none;stroke:${LINE};stroke-width:1.5"/>

    <text x="96" y="122" style="fill:${MUTED};font-size:21px;letter-spacing:6px">RETRIEVAL · BY REASONING</text>
    <text x="96" y="224" style="fill:${INK};font-size:76px;letter-spacing:-1.5px">My AI workflow is</text>
    <text x="96" y="310" style="fill:${INK};font-size:76px;letter-spacing:-1.5px">vectorless RAG and I</text>
    <text x="96" y="396" style="fill:${INK};font-size:76px;letter-spacing:-1.5px;font-style:italic">didn't call it that.</text>

    ${scatter()}
    <text x="316" y="930" text-anchor="middle" style="fill:${INK};font-size:30px">Find what looks similar</text>
    <text x="316" y="966" text-anchor="middle" style="fill:${MUTED};font-size:23px">chunks, vectors, nearest few</text>

    ${tree()}
    <text x="884" y="930" text-anchor="middle" style="fill:${INK};font-size:30px">Read the contents</text>
    <text x="884" y="966" text-anchor="middle" style="fill:${MUTED};font-size:23px">open the one file it needs</text>

    <text x="96" y="1052" style="fill:${INK};font-size:30px">I would have called it keeping good docs.</text>

    <line x1="96" y1="1122" x2="${W - 96}" y2="1122" style="stroke:${LINE};stroke-width:1"/>
    <text x="96" y="1158" style="fill:${INK};font-size:22px">My AI Workflow Is Vectorless RAG and I Didn't Call It That</text>
    <text x="${W - 96}" y="1158" text-anchor="end" style="fill:${MUTED};font-size:21px">${HOST}</text>
  </svg>
</body></html>`;

console.log("[social:card:vectorless] rendering…");
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.setContent(card, { waitUntil: "networkidle" });
  const buf = await page.screenshot({ clip: { x: 0, y: 0, width: W, height: H }, type: "png" });
  await mkdir(OUT, { recursive: true });
  await writeFile(join(OUT, FILE), buf);
  console.log(`[social:card:vectorless] wrote content/media/notes/${FILE} (${W}×${H}, ${(buf.length / 1024).toFixed(1)}kb)`);
} finally {
  await browser.close();
}
