// portfolio/tools/social-card-vectorless.ts — render the social image for the vectorless RAG note.
//
// Same card family as tools/social-card-pantry.ts (1200×1200, paper and ink, Georgia, the host in
// the footer). The picture is the note's proof: VOICE.md as a strip of 677 lines with the 36 one question needed
// lit in ink, under the number it makes.
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

// The strip: VOICE.md as one bar of 677 lines, with the 36 lines one question needed lit in ink.
const BAR_X = 96;
const BAR_W = W - 192;
const LINES = 677;
const FROM = 159;
const COUNT = 36;
const bandX = BAR_X + (BAR_W * (FROM - 1)) / LINES;
const bandW = (BAR_W * COUNT) / LINES;

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

    <text x="90" y="660" style="fill:${INK};font-size:230px;letter-spacing:-6px">36</text>
    <text x="400" y="600" style="fill:${INK};font-size:70px">of 677 lines</text>
    <text x="400" y="652" style="fill:${MUTED};font-size:30px">is all one question about my voice rules read.</text>

    <rect x="${BAR_X}" y="740" width="${BAR_W}" height="56" rx="6" style="fill:${LINE}"/>
    <rect x="${bandX.toFixed(1)}" y="728" width="${bandW.toFixed(1)}" height="80" rx="4" style="fill:${INK}"/>
    <text x="${bandX.toFixed(1)}" y="846" style="fill:${MUTED};font-size:24px">lines 159 to 194, the section it needed</text>
    <text x="${W - 96}" y="846" text-anchor="end" style="fill:${MUTED};font-size:24px">the whole file</text>

    <text x="96" y="940" style="fill:${INK};font-size:31px">A contents page the model reads, not a vector database.</text>
    <text x="96" y="984" style="fill:${INK};font-size:31px">One file, linked as AGENTS.md, for Claude, Codex and OpenCode.</text>
    <text x="96" y="1050" style="fill:${MUTED};font-size:31px;font-style:italic">So I steer and review. I do not brief.</text>

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
