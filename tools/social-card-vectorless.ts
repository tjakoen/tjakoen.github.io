// portfolio/tools/social-card-vectorless.ts — render the three social cards for the vectorless RAG note.
//
// Same card family as tools/social-card-pantry.ts (1200×1200, paper and ink, Georgia, the host in
// the footer). The three cards are one argument, numbered 1 / 3 to 3 / 3 so a LinkedIn carousel reads in
// order: how my AI loop finds the right page (vectors against a contents page), how that is wired across
// three tools (one file, many readers), and what it does to the effort (36 of 677 lines, no briefing).
//
//   bun run social:card:vectorless
//   # → content/media/notes/vectorless-rag-by-accident-social-{1-finding,2-setup,3-effort}.png
//
// CARD_CHROME may point at an installed Chromium or headless shell when the Playwright revision that
// this repository pins is not downloaded yet.
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE } from "../src/seo.ts";

const OUT = join(import.meta.dir, "..", "content", "media", "notes");
const W = 1200;
const H = 1200;
const HOST = new URL(SITE.origin).host;
const TITLE = "My AI Loop Runs on Vectorless RAG and I Didn't Call It That";

const PAPER = "#E2E0D8";
const INK = "#1C1B17";
const MUTED = "#6E6C64";
const LINE = "rgba(28,27,23,.18)";

const t = (x: number, y: number, s: string, size: number, fill = INK, extra = "") =>
  `<text x="${x}" y="${y}" style="fill:${fill};font-size:${size}px;${extra}">${s}</text>`;

const frame = (n: number, body: string, next = "") => `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0}</style></head><body>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Georgia, 'Times New Roman', serif">
<rect width="${W}" height="${H}" style="fill:${PAPER}"/>
<rect x="28" y="28" width="${W - 56}" height="${H - 56}" rx="10" style="fill:none;stroke:${LINE};stroke-width:1.5"/>
${t(96, 122, "VECTORLESS RAG FOR MY AI LOOP", 21, MUTED, "letter-spacing:6px")}
${t(W - 96, 122, `${n} / 3`, 24, MUTED, "text-anchor:end;letter-spacing:3px")}
${body}
${next ? t(W - 96, 1092, next, 24, MUTED, "text-anchor:end;font-style:italic") : ""}
<line x1="96" y1="1122" x2="${W - 96}" y2="1122" style="stroke:${LINE};stroke-width:1"/>
${t(96, 1158, TITLE, 22)}
${t(W - 96, 1158, HOST, 21, MUTED, "text-anchor:end")}
</svg></body></html>`;

const headline = (a: string, b: string) =>
  t(96, 224, a, 76, INK, "letter-spacing:-1.5px") + t(96, 310, b, 76, INK, "letter-spacing:-1.5px;font-style:italic");

// ---- Card 1: how my AI loop finds the right page --------------------------------------------------
const DOTS: [number, number][] = [
  [160, 500], [215, 560], [270, 490], [320, 610], [190, 620], [400, 520], [470, 600], [250, 640],
  [330, 540], [430, 640], [175, 560], [510, 520], [380, 600], [150, 640],
];
const Q: [number, number] = [340, 565];
const scatter = () => {
  let o = "";
  for (const [x, y] of DOTS) {
    const near = Math.hypot(x - Q[0], y - Q[1]) < 62;
    o += `<circle cx="${x}" cy="${y}" r="7" style="fill:${near ? INK : LINE}"/>`;
  }
  o += `<circle cx="${Q[0]}" cy="${Q[1]}" r="66" style="fill:none;stroke:${MUTED};stroke-width:2;stroke-dasharray:7 6"/>`;
  o += t(Q[0], Q[1] + 8, "?", 24, INK, "text-anchor:middle");
  return o;
};
const treeNode = (x: number, y: number, on: boolean, leaf = false) =>
  `<rect x="${x - 38}" y="${y - 16}" width="76" height="32" rx="5" style="fill:${leaf ? INK : "none"};stroke:${on ? INK : LINE};stroke-width:${on ? 3 : 2}"/>`;
const treeEdge = (x1: number, y1: number, x2: number, y2: number, on: boolean) =>
  `<line x1="${x1}" y1="${y1 + 16}" x2="${x2}" y2="${y2 - 16}" style="stroke:${on ? INK : LINE};stroke-width:${on ? 3 : 2}"/>`;
const tree = () => {
  const root: [number, number] = [862, 490];
  const mid: [number, number][] = [[752, 565], [862, 565], [972, 565]];
  const leaves: [number, number][] = [[702, 640], [802, 640]];
  let o = "";
  mid.forEach(([x, y], i) => (o += treeEdge(root[0], root[1], x, y, i === 0)));
  leaves.forEach(([x, y], i) => (o += treeEdge(mid[0][0], mid[0][1], x, y, i === 1)));
  o += treeNode(...root, true);
  mid.forEach(([x, y], i) => (o += treeNode(x, y, i === 0)));
  leaves.forEach(([x, y], i) => (o += treeNode(x, y, i === 1, i === 1)));
  return o;
};
const column = (x: number, title: string, sub: string, steps: string[], on: boolean) => {
  let o = `<rect x="${x}" y="354" width="484" height="546" rx="12" style="fill:none;stroke:${on ? INK : LINE};stroke-width:${on ? 3 : 2}"/>`;
  o += t(x + 32, 392, title, 38) + t(x + 32, 428, sub, 23, MUTED);
  steps.forEach((s, i) => {
    const y = 735 + i * 52;
    o += `<circle cx="${x + 54}" cy="${y - 9}" r="17" style="fill:${on ? INK : "none"};stroke:${on ? INK : MUTED};stroke-width:2"/>`;
    o += t(x + 54, y, String(i + 1), 21, on ? PAPER : INK, "text-anchor:middle");
    o += t(x + 92, y, s, 27);
  });
  return o;
};
const card1 = frame(
  1,
  `${headline("How my AI loop", "finds the right page.")}
${column(96, "Vectors", "the usual way", ["Chop documents into chunks", "Turn chunks into numbers", "Fetch the nearest few"], false)}
${column(620, "Vectorless", "the way my loop runs", ["Write a contents page", "The model picks a branch", "It opens that one section"], true)}
${scatter()}
${tree()}
${t(96, 970, "In plain words: build your AI a map, then let it find things.", 30)}
${t(96, 1014, "My loop starts blank every session. I run the right-hand kind.", 27, MUTED, "font-style:italic")}`,
  "Next: how it is wired across three tools →",
);

// ---- Card 2: one contents page, three AI tools -----------------------------------------------------
const box = (cx: number, y: number, w: number, label: string, sub: string, on = false, fill = false) =>
  `<rect x="${cx - w / 2}" y="${y}" width="${w}" height="80" rx="8" style="fill:${fill ? INK : "none"};stroke:${on ? INK : LINE};stroke-width:${on ? 3 : 2}"/>` +
  t(cx, y + 36, label, 28, fill ? PAPER : INK, "text-anchor:middle") +
  t(cx, y + 64, sub, 20, fill ? PAPER : MUTED, "text-anchor:middle");
const ln = (x1: number, y1: number, x2: number, y2: number, on: boolean) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke:${on ? INK : LINE};stroke-width:${on ? 3 : 2}"/>`;
const xs = [208, 456, 744, 992];
const card2 = frame(
  2,
  `${headline("One contents page.", "Three AI tools.")}
${t(600, 396, "Claude · Codex · OpenCode read the same file", 26, MUTED, "text-anchor:middle")}
${xs.map((x, i) => ln(600, 550, x, 650, i === 0)).join("")}
${ln(xs[0], 730, xs[0], 830, true)}
${box(600, 470, 420, "CLAUDE.md", "linked as AGENTS.md", true)}
${box(xs[0], 650, 220, "skills", "29, one line each", true)}
${box(xs[1], 650, 220, "code graphs", "graphify, tokensave")}
${box(xs[2], 650, 220, "PANTRY", "the project index")}
${box(xs[3], 650, 220, "per folder", "a CLAUDE.md subtree")}
${box(240, 830, 300, "one section", "36 of 677 lines", true, true)}
${t(430, 880, "The loop walks down,", 30)}
${t(430, 922, "reads only what the question needs.", 30)}
${t(96, 1040, "That is the whole trick. No vector database.", 29, MUTED, "font-style:italic")}`,
  "Next: what it does to the effort →",
);

// ---- Card 3: what it does to the effort -----------------------------------------------------------
const row = (y: number, a: string, b: string) =>
  `<rect x="96" y="${y - 38}" width="16" height="16" style="fill:${INK}"/>` + t(136, y - 22, a, 38) + t(136, y + 22, b, 28, MUTED);
const BAR_W = W - 192;
const bandX = 96 + (BAR_W * 158) / 677;
const bandW = (BAR_W * 36) / 677;
const card3 = frame(
  3,
  `${headline("So I stopped", "briefing the loop.")}
${t(96, 380, "It reads a table of contents instead.", 34, MUTED)}
${row(500, "No briefing", "One line of what I want. The session finds the rest.")}
${row(630, "No carrying state", "A resume card in the plan. Any of the three tools picks it up.")}
${row(760, "No guessing", "When it is wrong I ask which file it read. The answer is a path.")}
<rect x="96" y="880" width="${BAR_W}" height="40" rx="5" style="fill:${LINE}"/>
<rect x="${bandX.toFixed(1)}" y="870" width="${bandW.toFixed(1)}" height="60" rx="3" style="fill:${INK}"/>
${t(96, 976, "One question about my voice rules read 36 lines of a 677-line file.", 28)}
${t(96, 1020, "Vectorless RAG for my AI loop. The name came from Shivani Virdi.", 28, MUTED, "font-style:italic")}`,
);

const cards: [string, string][] = [
  ["vectorless-rag-by-accident-social-1-finding.png", card1],
  ["vectorless-rag-by-accident-social-2-setup.png", card2],
  ["vectorless-rag-by-accident-social-3-effort.png", card3],
];

console.log("[social:card:vectorless] rendering…");
const browser = await chromium.launch(process.env.CARD_CHROME ? { executablePath: process.env.CARD_CHROME } : {});
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await mkdir(OUT, { recursive: true });
  for (const [file, html] of cards) {
    await page.setContent(html, { waitUntil: "networkidle" });
    const buf = await page.screenshot({ clip: { x: 0, y: 0, width: W, height: H }, type: "png" });
    await writeFile(join(OUT, file), buf);
    console.log(`[social:card:vectorless] wrote content/media/notes/${file} (${W}×${H}, ${(buf.length / 1024).toFixed(1)}kb)`);
  }
} finally {
  await browser.close();
}
