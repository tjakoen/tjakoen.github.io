// portfolio/tools/social-card-students-2026-s1.ts — render the social image for
// "Two Hundred Final Projects, and the Ones I Didn't See Coming".
//
// Same card family as the other social cards (1200×1200, paper and ink, Georgia, the host in the
// footer). The picture is the semester in three numbers and the one rule that shaped it: build for
// yourself, not a made-up client.
//
//   bun run social:card:students-2026-s1   # → content/media/notes/proud-of-my-students-2026-s1-social.png
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE } from "../src/seo.ts";

const OUT = join(import.meta.dir, "..", "content", "media", "notes");
const FILE = "proud-of-my-students-2026-s1-social.png";
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
const TH = 150;

// The three numbers the note opens with. Each is a fact from the semester, not a brag: sections,
// subjects and badges are how the work was organised; the projects are what came back.
const stats = [
  { n: "7", t: "sections", s: "three subjects, one rule" },
  { n: "3", t: "subjects", s: "web, apps and AI builds" },
  { n: "594", t: "badges", s: "issued for shipped work" },
  { n: "200+", t: "projects", s: "shipped in the open", heavy: true },
];

const grid: string[] = [];
stats.forEach((s, i) => {
  const x = X + (i % 2) * (TW + GAP);
  const y = 470 + Math.floor(i / 2) * (TH + GAP);
  grid.push(
    `<rect x="${x}" y="${y}" width="${TW}" height="${TH}" rx="12" style="fill:${s.heavy ? INK : "none"};stroke:${s.heavy ? INK : LINE};stroke-width:${s.heavy ? 4 : 2}"/>`,
  );
  grid.push(
    `<text x="${x + 32}" y="${y + 78}" style="fill:${s.heavy ? PAPER : INK};font-size:64px;letter-spacing:-1px">${s.n}</text>`,
  );
  grid.push(
    `<text x="${x + 32}" y="${y + 112}" style="fill:${s.heavy ? PAPER : INK};font-size:26px">${s.t}</text>`,
  );
  grid.push(
    `<text x="${x + 32}" y="${y + 136}" style="fill:${s.heavy ? "rgba(226,224,216,.72)" : MUTED};font-size:19px">${s.s}</text>`,
  );
});

const card = `<!doctype html><html><head><meta charset="utf-8"><style>
  html, body { margin: 0; }
</style></head><body>
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"
       font-family="Georgia, 'Times New Roman', serif">
    <rect width="${W}" height="${H}" style="fill:${PAPER}"/>
    <rect x="28" y="28" width="${W - 56}" height="${H - 56}" rx="10" style="fill:none;stroke:${LINE};stroke-width:1.5"/>

    <text x="${X}" y="112" style="fill:${MUTED};font-size:21px;letter-spacing:6px">SEMESTER ONE, 2026</text>
    <text x="${X}" y="238" style="fill:${INK};font-size:80px;letter-spacing:-1.5px">Two hundred</text>
    <text x="${X}" y="322" style="fill:${INK};font-size:80px;letter-spacing:-1.5px">final projects,</text>
    <text x="${X}" y="406" style="fill:${INK};font-size:80px;letter-spacing:-1.5px;font-style:italic">all of them public.</text>

    ${grid.join("\n    ")}

    <text x="${X}" y="880" style="fill:${INK};font-size:34px">Build for yourself, not a made-up client.</text>
    <text x="${X}" y="926" style="fill:${MUTED};font-size:23px">If you need it, you will be its biggest advocate.</text>

    <line x1="${X}" y1="1122" x2="${W - X}" y2="1122" style="stroke:${LINE};stroke-width:1"/>
    <text x="${X}" y="1158" style="fill:${INK};font-size:22px">Two Hundred Final Projects</text>
    <text x="${W - X}" y="1158" text-anchor="end" style="fill:${MUTED};font-size:21px">${HOST}</text>
  </svg>
</body></html>`;

console.log("[social:card:students-2026-s1] rendering…");
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.setContent(card, { waitUntil: "networkidle" });
  const buf = await page.screenshot({ clip: { x: 0, y: 0, width: W, height: H }, type: "png" });
  await mkdir(OUT, { recursive: true });
  await writeFile(join(OUT, FILE), buf);
  console.log(`[social:card:students-2026-s1] wrote content/media/notes/${FILE} (${W}×${H}, ${(buf.length / 1024).toFixed(1)}kb)`);
} finally {
  await browser.close();
}
