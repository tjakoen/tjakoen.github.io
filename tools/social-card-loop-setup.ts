// portfolio/tools/social-card-loop-setup.ts — render the social image for "Set Up the Loop With One Prompt".
//
// Same card family as the other social cards (1200×1200, paper and ink, Georgia, the host in the
// footer). The picture is the five pieces the note installs, in the order it installs them, because
// the note's whole claim is that five things and no platform project.
//
//   bun run social:card:loop-setup   # → content/media/notes/loop-setup-social.png
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE } from "../src/seo.ts";

const OUT = join(import.meta.dir, "..", "content", "media", "notes");
const FILE = "loop-setup-social.png";
const W = 1200;
const H = 1200;
const HOST = new URL(SITE.origin).host;

const PAPER = "#E2E0D8";
const INK = "#1C1B17";
const MUTED = "#6E6C64";
const LINE = "rgba(28,27,23,.28)";

const X = 96;
const ROW = 78;
const TOP = 470;

// The five pieces, in the order the note installs them. The human gate is the heavy row because
// the note's one non-negotiable is that the loop stops there.
const pieces = [
  { n: "1", t: "Front door", s: "one instruction file, the rules you actually hold" },
  { n: "2", t: "Plan", s: "the work, written down before it starts" },
  { n: "3", t: "Checklist", s: "proof the loop loaded, printed at session start" },
  { n: "4", t: "Report", s: "the evidence, including what failed" },
  { n: "5", t: "Human gate", s: "the loop stops here, on purpose", heavy: true },
];

const rows: string[] = [];
pieces.forEach((p, i) => {
  const y = TOP + i * ROW;
  if (p.heavy) {
    rows.push(
      `<rect x="${X - 20}" y="${y - 40}" width="${W - 2 * X + 40}" height="${ROW - 8}" rx="10" style="fill:${INK};stroke:${INK}"/>`,
    );
  }
  rows.push(
    `<text x="${X}" y="${y}" style="fill:${p.heavy ? PAPER : MUTED};font-size:24px">${p.n}</text>`,
  );
  rows.push(
    `<text x="${X + 46}" y="${y}" style="fill:${p.heavy ? PAPER : INK};font-size:30px">${p.t}</text>`,
  );
  rows.push(
    `<text x="${X + 330}" y="${y}" style="fill:${p.heavy ? "rgba(226,224,216,.78)" : MUTED};font-size:21px">${p.s}</text>`,
  );
});

const card = `<!doctype html><html><head><meta charset="utf-8"><style>
  html, body { margin: 0; }
</style></head><body>
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"
       font-family="Georgia, 'Times New Roman', serif">
    <rect width="${W}" height="${H}" style="fill:${PAPER}"/>
    <rect x="28" y="28" width="${W - 56}" height="${H - 56}" rx="10" style="fill:none;stroke:${LINE};stroke-width:1.5"/>

    <text x="${X}" y="112" style="fill:${MUTED};font-size:21px;letter-spacing:6px">THE LOOP, IN ONE PROMPT</text>
    <text x="${X}" y="238" style="fill:${INK};font-size:80px;letter-spacing:-1.5px">Set up the loop</text>
    <text x="${X}" y="322" style="fill:${INK};font-size:80px;letter-spacing:-1.5px;font-style:italic">with one prompt.</text>
    <text x="${X}" y="392" style="fill:${MUTED};font-size:25px">Five pieces. No platform project.</text>

    ${rows.join("\n    ")}

    <text x="${X}" y="920" style="fill:${INK};font-size:32px">Start thin. Add the guards when they earn it.</text>
    <text x="${X}" y="966" style="fill:${MUTED};font-size:22px">The model is the rented part. It is not in the contract.</text>

    <line x1="${X}" y1="1122" x2="${W - X}" y2="1122" style="stroke:${LINE};stroke-width:1"/>
    <text x="${X}" y="1158" style="fill:${INK};font-size:22px">Set Up the Loop With One Prompt</text>
    <text x="${W - X}" y="1158" text-anchor="end" style="fill:${MUTED};font-size:21px">${HOST}</text>
  </svg>
</body></html>`;

console.log("[social:card:loop-setup] rendering…");
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.setContent(card, { waitUntil: "networkidle" });
  const buf = await page.screenshot({ clip: { x: 0, y: 0, width: W, height: H }, type: "png" });
  await mkdir(OUT, { recursive: true });
  await writeFile(join(OUT, FILE), buf);
  console.log(`[social:card:loop-setup] wrote content/media/notes/${FILE} (${W}×${H}, ${(buf.length / 1024).toFixed(1)}kb)`);
} finally {
  await browser.close();
}
