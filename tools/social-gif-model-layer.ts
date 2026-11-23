// portfolio/tools/social-gif-model-layer.ts — render the animated LinkedIn infographic for the Model
// Intelligence Layer notes.
//
// Six rules of the layer as a three by two grid of cards, in the paper and ink family of the other social
// cards: each card has a numbered title, a small diagram that plays as the card arrives, one line on what the
// rule does, and a "Best for" pill. A rule of thumb closes it, then the host in the footer. It is a companion
// to the square card (social-card-model-layer.ts), made for posting by hand, so no note points at it yet.
//
// Each frame is an SVG built here. Chromium draws it on a canvas, and gifenc encodes the frames in the page,
// so no frame image crosses back to this process. The palette is paper and ink, so 32 colours per frame keep
// the type clean and the file small enough for the feed.
//
//   bun run social:gif:model-layer   # → content/media/notes/model-layer-infographic.gif
import { chromium } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");
const W = 1200, H = 1110;
const PAPER = "#E2E0D8", CARD = "#ECEAE3", INK = "#1C1B17", MUTED = "#6E6C64", LINE = "rgba(28,27,23,.28)";
const HOST = "portfolio.tjakoen.com";
const FPS = 10;

const X0 = 60, GAP = 24, CW = (W - 2 * X0 - 2 * GAP) / 3, CH = 340, ROW = [172, 172 + CH + GAP];
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const text = (x: number, y: number, s: string, size: number, fill = INK, extra = "") =>
  `<text x="${x}" y="${y}" style="fill:${fill};font-size:${size}px${extra}">${esc(s)}</text>`;
const mid = (x: number, y: number, s: string, size: number, fill = INK, extra = "") =>
  `<text x="${x}" y="${y}" text-anchor="middle" style="fill:${fill};font-size:${size}px${extra}">${esc(s)}</text>`;
const box = (x: number, y: number, w: number, h: number, filled = false, rx = 7) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" style="fill:${filled ? INK : "none"};stroke:${filled ? INK : LINE};stroke-width:2"/>`;
const arrow = (x1: number, x2: number, y: number) =>
  `<g style="stroke:${MUTED};stroke-width:2;fill:none"><line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"/><path d="M${x2 - 7},${y - 5} L${x2},${y} L${x2 - 7},${y + 5}"/></g>`;

interface Card { title: string; line: [string, string]; best: string; draw: (x: number, y: number, p: number) => string }

// Each diagram sits in a 300 by 120 box at (x, y) and plays as p runs from 0 to 1.
const cards: Card[] = [
  {
    title: "Tiers, not models",
    line: ["Work asks for a tier; the registry", "says which model that is today."],
    best: "swapping models, not code",
    draw: (x, y, p) => ["strong", "execution", "light"].map((t, i) => {
      const w = [250, 200, 150][i] * clamp(p * 3 - i);
      return `<rect x="${x + 20}" y="${y + 12 + i * 36}" width="${w}" height="24" rx="5" style="fill:${i === 0 ? INK : MUTED};opacity:${i === 0 ? 1 : 0.55}"/>` +
        (w > 60 ? text(x + 30, y + 30 + i * 36, t, 15, i === 0 ? PAPER : INK) : "");
    }).join(""),
  },
  {
    title: "One free model, then Go",
    line: ["Free models share one daily cap,", "so one free model, then Go."],
    best: "small, bounded subagents",
    // Free is picked first, runs out, and the pick settles on Go: the chain's usual day.
    draw: (x, y, p) => {
      const names = ["free", "Go", "Luna", "Sol"], at = p < 0.5 ? 0 : 1, out = p >= 0.5;
      return names.map((n, i) => {
        const bx = x + 4 + i * 76, struck = i === 0 && out;
        return box(bx, y + 40, 60, 40, i === at) +
          mid(bx + 30, y + 66, n, 16, i === at ? PAPER : struck ? MUTED : INK, struck ? ";text-decoration:line-through" : "") +
          (i < 3 ? arrow(bx + 62, bx + 74, y + 60) : "");
      }).join("") + mid(x + 150, y + 110, "the first one not out wins", 14, MUTED, ";font-style:italic");
    },
  },
  {
    title: "Paid only on a typed yes",
    line: ["Agents hold no key. I approve each", "paid call; a prepaid balance caps it."],
    best: "the rare hard problem",
    draw: (x, y, p) => {
      const cmd = "approve 3f9a1c07e2b4d816";
      const shown = cmd.slice(0, Math.round(cmd.length * clamp(p * 1.3)));
      return `<rect x="${x + 10}" y="${y + 24}" width="280" height="72" rx="8" style="fill:${INK}"/>` +
        text(x + 26, y + 54, "owner $", 16, MUTED) + text(x + 26, y + 80, shown + (p < 0.8 ? "_" : ""), 17, PAPER, ";font-family:Consolas,monospace");
    },
  },
  {
    title: "Four at a time",
    line: ["The supervisor caps live agents", "per session, depth and retries."],
    best: "keeping a swarm affordable",
    draw: (x, y, p) => {
      const root = `<circle cx="${x + 150}" cy="${y + 18}" r="11" style="fill:${INK}"/>`;
      return root + [0, 1, 2, 3].map((i) => {
        const on = clamp(p * 5 - i), cx = x + 45 + i * 70;
        return `<g style="opacity:${on}"><line x1="${x + 150}" y1="${y + 29}" x2="${cx}" y2="${y + 62}" style="stroke:${LINE};stroke-width:2"/>` +
          `<circle cx="${cx}" cy="${y + 72}" r="10" style="fill:none;stroke:${INK};stroke-width:2.5"/></g>`;
      }).join("") + `<g style="opacity:${clamp(p * 5 - 4)}">${mid(x + 150, y + 112, "4 live · 2 deep · 2 retries", 15, MUTED, ";font-style:italic")}</g>`;
    },
  },
  {
    title: "Recover, don't stall",
    line: ["When a model runs out, the session", "moves down the chain, with a checkpoint."],
    best: "long sessions",
    draw: (x, y, p) => {
      // The session, a dot, leaves the spent model along the arrow and is absorbed into the next one.
      const travel = clamp((p - 0.25) * 2), dot = x + 118 + 64 * travel;
      return box(x + 10, y + 34, 100, 46) + mid(x + 60, y + 63, p > 0.2 ? "out" : "free", 17, p > 0.2 ? MUTED : INK, p > 0.2 ? ";text-decoration:line-through" : "") +
        arrow(x + 114, x + 186, y + 57) +
        box(x + 190, y + 34, 100, 46, p > 0.75) + mid(x + 240, y + 63, "Go", 17, p > 0.75 ? PAPER : INK) +
        (travel > 0 && travel < 1 ? `<circle cx="${dot}" cy="${y + 57}" r="7" style="fill:${INK}"/>` : "") +
        `<g style="opacity:${clamp(p * 3 - 2)}">${text(x + 10, y + 124, "checkpoint written", 14, MUTED, ";font-style:italic")}</g>`;
    },
  },
  {
    title: "Checked every session",
    line: ["Each session proves the layer and", "PANTRY's usage before work starts."],
    best: "trusting it unattended",
    draw: (x, y, p) => {
      const rows = ["ok   Hooks", "ok   Model Intelligence Layer", "ok   PANTRY contract"];
      return `<rect x="${x + 6}" y="${y + 2}" width="288" height="118" rx="8" style="fill:none;stroke:${LINE};stroke-width:2"/>` +
        rows.map((r, i) => `<g style="opacity:${clamp(p * 4 - i)}">${text(x + 20, y + 28 + i * 24, r, 14, INK, ";font-family:Consolas,monospace")}</g>`).join("") +
        `<g style="opacity:${clamp(p * 4 - 3)}">${text(x + 20, y + 106, "Agentic Loop Loaded", 15, INK, ";font-family:Consolas,monospace;font-weight:bold")}</g>`;
    },
  },
];

// Everything that reads is on every frame, so the card is readable the moment it appears and at any point
// in the loop. Only the diagrams move: each plays over the first PLAY of a PERIOD-second loop, holds its end
// state for the rest, and starts a little after the card before it, so the grid ripples rather than blinks.
const PERIOD = 4, PLAY = 0.65, STAGGER = 0.06;

function frame(t: number): string {
  const out: string[] = [];
  cards.forEach((c, i) => {
    const phase = (((t / PERIOD) - i * STAGGER) % 1 + 1) % 1, p = clamp(phase / PLAY);
    const x = X0 + (i % 3) * (CW + GAP), y = ROW[Math.floor(i / 3)];
    out.push(`<g>`,
      `<rect x="${x}" y="${y}" width="${CW}" height="${CH}" rx="12" style="fill:${CARD};stroke:${LINE};stroke-width:1.5"/>`,
      `<circle cx="${x + 32}" cy="${y + 36}" r="15" style="fill:${INK}"/>`, mid(x + 32, y + 42, String(i + 1), 17, PAPER),
      text(x + 58, y + 44, c.title, 25),
      c.draw(x + (CW - 300) / 2, y + 70, p),
      mid(x + CW / 2, y + 236, c.line[0], 16.5), mid(x + CW / 2, y + 260, c.line[1], 16.5),
      `<rect x="${x + 22}" y="${y + 284}" width="${CW - 44}" height="36" rx="18" style="fill:${PAPER};stroke:${INK};stroke-width:1.5"/>`,
      mid(x + CW / 2, y + 308, `Best for: ${c.best}`, 15.5),
      `</g>`);
  });
  const by = ROW[1] + CH + 30;
  out.push(`<g>`,
    `<rect x="${X0}" y="${by}" width="${W - 2 * X0}" height="84" rx="12" style="fill:${INK}"/>`,
    text(X0 + 28, by + 36, "Rule of thumb: spend free and flat-rate first; real money only on a typed yes.", 22, PAPER),
    text(X0 + 28, by + 64, "Free stays ahead of Go until a week of usage says otherwise. The review is on 30 November.", 15.5, "#B9B6AC", ";font-style:italic"),
    `</g>`);
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Georgia, 'Times New Roman', serif">
<rect width="${W}" height="${H}" style="fill:${PAPER}"/>
<rect x="20" y="20" width="${W - 40}" height="${H - 40}" rx="10" style="fill:none;stroke:${LINE};stroke-width:1.5"/>
<g>
${text(X0, 76, "THE MODEL INTELLIGENCE LAYER", 17, MUTED, ";letter-spacing:5px")}
${text(X0, 128, "6 rules behind how my agents pick a model", 42, INK, ";letter-spacing:-0.5px")}
${text(W - X0, 128, "and who pays", 26, MUTED, ";font-style:italic").replace("<text ", '<text text-anchor="end" ')}
</g>
${out.join("\n")}
<line x1="${X0}" y1="${H - 62}" x2="${W - X0}" y2="${H - 62}" style="stroke:${LINE};stroke-width:1"/>
${text(X0, H - 34, "How the Model Layer Works", 19)}
${text(W - X0, H - 34, HOST, 18, MUTED).replace("<text ", '<text text-anchor="end" ')}
</svg>`;
}

const frames: { svg: string; delay: number }[] = [];
// One loop exactly, so the last frame leads straight back into the first.
for (let k = 0, n = PERIOD * FPS; k < n; k++) frames.push({ svg: frame(k / FPS), delay: 1000 / FPS });

const gifenc = await readFile(join(ROOT, "node_modules", "gifenc", "dist", "gifenc.esm.js"), "utf8");
const b = await chromium.launch();
try {
  const pg = await b.newPage({ viewport: { width: W, height: H } });
  await pg.setContent(`<!doctype html><html><body style="margin:0"><canvas id="c" width="${W}" height="${H}"></canvas></body></html>`);
  const bytes: number[] = await pg.evaluate(async ({ src, frames, W, H }) => {
    const { GIFEncoder, quantize, applyPalette } = await import(URL.createObjectURL(new Blob([src], { type: "text/javascript" })));
    const ctx = (document.getElementById("c") as HTMLCanvasElement).getContext("2d", { willReadFrequently: true })!;
    const gif = GIFEncoder();
    for (const f of frames) {
      const img = new Image();
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(f.svg);
      await img.decode();
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(img, 0, 0);
      const { data } = ctx.getImageData(0, 0, W, H);
      const palette = quantize(data, 32);
      gif.writeFrame(applyPalette(data, palette), W, H, { palette, delay: f.delay });
    }
    gif.finish();
    return Array.from(gif.bytes() as Uint8Array);
  }, { src: gifenc, frames, W, H });
  const OUT = join(ROOT, "content", "media", "notes");
  await mkdir(OUT, { recursive: true });
  await writeFile(join(OUT, "model-layer-infographic.gif"), new Uint8Array(bytes));
  // The still is the moment every diagram has finished: just before the loop restarts the first card.
  const still = frame(PERIOD * (PLAY + (cards.length - 1) * STAGGER + 0.02));
  await pg.setContent(`<!doctype html><html><body style="margin:0">${still}</body></html>`);
  await writeFile(join(OUT, "model-layer-infographic-final.png"), await pg.screenshot({ clip: { x: 0, y: 0, width: W, height: H } }));
  console.log(`[social:gif:model-layer] wrote content/media/notes/model-layer-infographic.gif (${W}x${H}, ${frames.length} frames, ${(bytes.length / 1024).toFixed(0)} KB) and the finished state as a PNG`);
} finally {
  await b.close();
}
