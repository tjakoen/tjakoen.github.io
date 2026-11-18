// portfolio/tools/social-card-comment-cost.ts — render the LinkedIn social image for the review fundamentals note.
//
// Same card family as tools/social-card-epic.ts (1200×1200, paper and ink, Georgia, the host in the
// footer). The picture is the note's one number: how often an author acts on a comment, by its weight.
// A blocker is acted on almost every time, and a nit about half as often.
//
//   bun run social:card:comment-cost   # → content/media/notes/a-comment-is-a-cost-social.png
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE } from "../src/seo.ts";

const OUT = join(import.meta.dir, "..", "content", "media", "notes");
const FILE = "a-comment-is-a-cost-social.png";
const W = 1200;
const H = 1200;
const HOST = new URL(SITE.origin).host;
const PAPER = "#E2E0D8";
const INK = "#1C1B17";
const MUTED = "#6E6C64";
const LINE = "rgba(28,27,23,.18)";
const CORAL = "#C4553A";

// Share of findings the author fixed or answered, from one reviewer's outcome log.
const bars = [
  { label: "Blocking issues", pct: 98, strong: true },
  { label: "Inline comments", pct: 92, strong: true },
  { label: "Nits", pct: 46, strong: false },
  { label: "Notes in the review body", pct: 46, strong: false },
];
const X0 = 96;
const MAXW = 860;
const Y0 = 520;
const GAP = 130;

const rows = bars
  .map((b, i) => {
    const y = Y0 + i * GAP;
    const w = Math.round((MAXW * b.pct) / 100);
    return `
    <text x="${X0}" y="${y}" style="fill:${INK};font-size:30px">${b.label}</text>
    <rect x="${X0}" y="${y + 18}" width="${w}" height="44" style="fill:${b.strong ? INK : CORAL}"/>
    <text x="${X0 + w + 20}" y="${y + 52}" style="fill:${INK};font-size:34px;font-weight:700">${b.pct}%</text>`;
  })
  .join("");

const card = `<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;background:${PAPER}}
  svg{display:block;font-family:Georgia,'Times New Roman',serif}
</style></head><body>
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" style="fill:${PAPER}"/>
    <text x="96" y="190" style="fill:${INK};font-size:68px">A review comment</text>
    <text x="96" y="270" style="fill:${INK};font-size:68px">is a cost you hand</text>
    <text x="96" y="350" style="fill:${INK};font-size:68px">someone else.</text>
    <text x="96" y="430" style="fill:${MUTED};font-size:28px">How often the author acts on it, by how the comment is labeled</text>
    ${rows}
    <line x1="96" y1="1122" x2="${W - 96}" y2="1122" style="stroke:${LINE};stroke-width:1"/>
    <text x="96" y="1158" style="fill:${INK};font-size:22px">Eight Things a Review Comment Owes the Person Reading It</text>
    <text x="${W - 96}" y="1158" text-anchor="end" style="fill:${MUTED};font-size:21px">${HOST}</text>
  </svg>
</body></html>`;

console.log("[social:card:comment-cost] rendering…");
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.setContent(card, { waitUntil: "networkidle" });
  const buf = await page.screenshot({ clip: { x: 0, y: 0, width: W, height: H }, type: "png" });
  await mkdir(OUT, { recursive: true });
  await writeFile(join(OUT, FILE), buf);
  console.log(`[social:card:comment-cost] wrote content/media/notes/${FILE} (${W}×${H}, ${(buf.length / 1024).toFixed(1)}kb)`);
} finally {
  await browser.close();
}
