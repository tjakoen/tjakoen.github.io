// portfolio/tools/social-gif-model-layer-architecture.ts — render the animated architecture infographic for
// the Model Intelligence Layer notes.
//
// The whole stack on one card, in the paper and ink family of the other social cards: me, the loop, the layer
// with the heavy outline, the harnesses, the models, and PANTRY underneath. Every label is on every frame, so
// the card reads wherever the feed starts it. What moves is one request: a dot leaves me, passes the loop, is
// given a tier by the registry, tries the free model, finds it out, lands on Go, and comes back up while
// PANTRY records one more usage row. Halfway, the two locks flash: private repositories stay on Claude and
// Codex, and the paid API waits for my yes. The tagline names the three things the layer is for.
//
// Frames are built here and encoded in Chromium with gifenc, as in social-gif-model-layer.ts.
//
//   bun run social:gif:model-layer-architecture   # → content/media/notes/model-layer-architecture.gif
import { chromium } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");
const W = 1200, H = 1300;
const PAPER = "#E2E0D8", CARD = "#ECEAE3", INK = "#1C1B17", MUTED = "#6E6C64", LINE = "rgba(28,27,23,.28)";
const HOST = "portfolio.tjakoen.com";
// One step at a time. Each caption holds long enough to read, then the dot travels in half a second, so the
// card moves at a pace a feed can follow without crawling. A short hold at the end lets the loop restart
// without snapping.
const HOLD_MS = 1500, MOVE_MS = 500, MOVE_STEPS = 5, END_HOLD_MS = 1800;
const X0 = 60, BW = W - 2 * X0;

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const mid = (x: number, y: number, s: string, size: number, fill = INK, extra = "") =>
  `<text x="${x}" y="${y}" text-anchor="middle" style="fill:${fill};font-size:${size}px${extra}">${esc(s)}</text>`;
const left = (x: number, y: number, s: string, size: number, fill = INK, extra = "") =>
  `<text x="${x}" y="${y}" style="fill:${fill};font-size:${size}px${extra}">${esc(s)}</text>`;
const right = (x: number, y: number, s: string, size: number, fill = INK, extra = "") =>
  `<text x="${x}" y="${y}" text-anchor="end" style="fill:${fill};font-size:${size}px${extra}">${esc(s)}</text>`;

interface Tile { key: string; t: string; s?: string; strong?: boolean }
interface Band { key: string; y: number; h: number; title: string; sub?: string; heavy?: boolean; tileH?: number; tiles?: Tile[] }

const bands: Band[] = [
  { key: "you", y: 230, h: 84, title: "Me", sub: "requests · decisions · approvals" },
  { key: "loop", y: 344, h: 120, title: "The loop", tileH: 50, tiles: [
    { key: "standards", t: "Standards" }, { key: "plans", t: "Plans" }, { key: "review", t: "Independent review" }, { key: "gates", t: "Human gates" }] },
  { key: "mil", y: 494, h: 150, title: "The Model Intelligence Layer", heavy: true, tileH: 78, tiles: [
    { key: "registry", t: "Registry", s: "work → a tier" }, { key: "router", t: "Router", s: "free → Go → Codex" },
    { key: "supervisor", t: "Supervisor", s: "4 agents at a time" }, { key: "recovery", t: "Recovery", s: "checkpoint, hand-off" }] },
  { key: "harness", y: 674, h: 120, title: "Harnesses", tileH: 50, tiles: [
    { key: "claude", t: "Claude Code" }, { key: "opencode", t: "OpenCode" }, { key: "codex", t: "Codex app" }] },
  // Models by role, strongest first: the strong models do the planning and review, the light ones take
  // bounded work, and the paid API waits for my yes. Whether a model keeps prompts is a note on the tile,
  // not its outline, so the row reads as what each model is for.
  { key: "models", y: 824, h: 180, title: "Models: judgment up, typing down", tileH: 78, tiles: [
    { key: "private", t: "Opus · Sol", s: "planning, review", strong: true },
    { key: "free", t: "Free model", s: "light · keeps prompts" },
    { key: "go", t: "OpenCode Go", s: "light · keeps prompts" },
    { key: "luna", t: "Luna", s: "light · private" },
    { key: "paid", t: "DeepSeek API", s: "on my yes · keeps prompts" }] },
];

// Tile geometry, fixed for every frame.
const geo: Record<string, { x: number; y: number; w: number; h: number }> = {};
for (const b of bands) {
  geo[b.key] = { x: X0, y: b.y, w: BW, h: b.h };
  const n = b.tiles?.length ?? 0, g = 16, tw = n ? (BW - 40 - g * (n - 1)) / n : 0;
  b.tiles?.forEach((t, i) => { geo[t.key] = { x: X0 + 20 + i * (tw + g), y: b.y + 50, w: tw, h: b.tileH! }; });
}
// The dot rides on the top edge of whatever it is visiting, so it never covers a label.
const centre = (k: string) => ({ x: geo[k].x + geo[k].w / 2, y: geo[k].y });

// The request's day, as stations on a loop from 0 to 1. The dot moves between stations; the station it last
// reached is lit. A flag on a station turns its state on for that step: the free model is out, the two locks
// show, or the usage row is written.
const STATIONS: { s: number; at: string; lit: string[]; say: string; freeOut?: boolean; locks?: boolean; logged?: boolean }[] = [
  { s: 0.00, at: "you", lit: ["you"], say: "I ask for a light task: read a few files and sum them up." },
  { s: 0.10, at: "plans", lit: ["plans"], say: "It becomes a plan, so the work and its cost are tracked." },
  { s: 0.20, at: "gates", lit: ["gates"], say: "It passes the human gates. Nothing here needs my approval." },
  { s: 0.30, at: "registry", lit: ["registry"], say: "The registry turns light work into a tier, not a fixed model." },
  { s: 0.40, at: "router", lit: ["router"], say: "The router walks that tier and takes the first model that is not out." },
  { s: 0.50, at: "opencode", lit: ["opencode"], say: "It runs as a child session in OpenCode." },
  { s: 0.58, at: "free", lit: ["free"], say: "The free model is first. It costs nothing." },
  { s: 0.66, at: "free", lit: [], freeOut: true, say: "But the free models share one daily cap, and it is out for today." },
  { s: 0.76, at: "go", lit: ["go"], freeOut: true, say: "Go takes it on the flat monthly plan. Nothing stalls." },
  { s: 0.86, at: "go", lit: ["go"], freeOut: true, locks: true, say: "Private repos stay on Claude and Codex. Paid calls wait for my yes." },
  { s: 0.94, at: "you", lit: ["you"], freeOut: true, logged: true, say: "The answer comes back to me, and PANTRY logs one row." },
];
// The tiles a request has passed keep a dark outline for the rest of the loop: the trail.
const visitedBy = (ph: number) => new Set(STATIONS.filter((st) => st.s <= ph).map((st) => st.at));
const ease = (v: number) => v * v * (3 - 2 * v);

function frame(ph: number): string {
  let i = 0;
  while (i < STATIONS.length - 1 && STATIONS[i + 1].s <= ph) i++;
  const a = STATIONS[i], b = STATIONS[i + 1] ?? a, k = a === b ? 1 : ease(clamp((ph - a.s) / Math.max(1e-6, b.s - a.s)));
  const pa = centre(a.at), pb = centre(b.at), dot = { x: pa.x + (pb.x - pa.x) * k, y: pa.y + (pb.y - pa.y) * k };
  const lit = new Set(a.lit), seen = visitedBy(ph), freeOut = a.freeOut === true, locks = a.locks ? 1 : 0, logged = a.logged === true;
  const step = STATIONS.slice(0, i + 1).filter((st, j, all) => j === 0 || st.say !== all[j - 1].say).length;

  const out: string[] = [];
  for (const band of bands) {
    const g = geo[band.key], on = lit.has(band.key);
    out.push(`<rect x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}" rx="12" style="fill:${on ? INK : CARD};stroke:${band.heavy ? INK : LINE};stroke-width:${band.heavy ? 3.5 : 1.5}"/>`);
    if (band.tiles) out.push(mid(W / 2, g.y + 34, band.title, 22, INK, band.heavy ? ";font-weight:bold" : ""));
    else out.push(mid(W / 2, g.y + 38, band.title, 26, on ? PAPER : INK), mid(W / 2, g.y + 66, band.sub!, 17, on ? "#B9B6AC" : MUTED));
    for (const tile of band.tiles ?? []) {
      const tg = geo[tile.key], hot = lit.has(tile.key), struck = tile.key === "free" && freeOut;
      out.push(`<rect x="${tg.x}" y="${tg.y}" width="${tg.w}" height="${tg.h}" rx="9" style="fill:${hot ? INK : "none"};stroke:${hot || seen.has(tile.key) || tile.strong ? INK : LINE};stroke-width:${tile.strong ? 3.5 : !hot && seen.has(tile.key) ? 3 : 2}"/>`);
      const ty = tile.s ? tg.y + 32 : tg.y + tg.h / 2 + 7;
      out.push(mid(tg.x + tg.w / 2, ty, tile.t, 19, hot ? PAPER : struck ? MUTED : INK, struck ? ";text-decoration:line-through" : ""));
      if (tile.s) out.push(mid(tg.x + tg.w / 2, tg.y + 58, struck ? "out for today" : tile.s, 14, hot ? "#B9B6AC" : MUTED, ";font-style:italic"));
    }
  }
  // Arrows between the bands.
  for (let j = 0; j < bands.length - 1; j++) {
    const y1 = bands[j].y + bands[j].h, y2 = bands[j + 1].y;
    out.push(`<g style="stroke:${MUTED};stroke-width:2.5;fill:none"><line x1="${W / 2}" y1="${y1 + 6}" x2="${W / 2}" y2="${y2 - 6}"/><path d="M${W / 2 - 7},${y1 + 13} L${W / 2},${y1 + 6} L${W / 2 + 7},${y1 + 13}"/><path d="M${W / 2 - 7},${y2 - 13} L${W / 2},${y2 - 6} L${W / 2 + 7},${y2 - 13}"/></g>`);
  }
  // The two locks, shown for the whole lock step.
  if (locks > 0) {
    for (const [key, label] of [["private", "private repos stay private"], ["paid", "waits for my typed yes"]] as const) {
      const tg = geo[key], wpx = 200;
      out.push(`<g style="opacity:${locks}"><rect x="${tg.x + tg.w / 2 - wpx / 2}" y="${tg.y + tg.h + 6}" width="${wpx}" height="26" rx="14" style="fill:${INK}"/>${mid(tg.x + tg.w / 2, tg.y + tg.h + 24, label, 14.5, PAPER)}</g>`);
    }
  }
  // PANTRY, underneath everything.
  const py = 1034;
  out.push(`<rect x="${X0}" y="${py}" width="${BW}" height="76" rx="12" style="fill:none;stroke:${LINE};stroke-width:1.5;stroke-dasharray:4 5"/>`,
    left(X0 + 24, py + 33, "PANTRY", 21, INK, ";letter-spacing:3px"),
    left(X0 + 24, py + 58, "plans, claims, and every call's usage by model", 16, MUTED, ";font-style:italic"),
    right(X0 + BW - 24, py + 33, "one row per call", 18, INK, ";font-style:italic"),
    right(X0 + BW - 24, py + 58, logged ? "opencode-go · plan · not private" : "waiting for the answer", 15, logged ? INK : MUTED, ";font-family:Consolas,monospace"));
  // The request itself.
  out.push(`<circle cx="${dot.x}" cy="${dot.y}" r="11" style="fill:${PAPER};stroke:${INK};stroke-width:4"/>`);

  const by = 1140;
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Georgia, 'Times New Roman', serif">
<rect width="${W}" height="${H}" style="fill:${PAPER}"/>
<rect x="20" y="20" width="${W - 40}" height="${H - 40}" rx="10" style="fill:none;stroke:${LINE};stroke-width:1.5"/>
${left(X0, 76, "THE MODEL INTELLIGENCE LAYER", 17, MUTED, ";letter-spacing:5px")}
${left(X0, 128, "One request, through the whole stack", 42, INK, ";letter-spacing:-0.5px")}
${right(W - X0, 128, "follow the request", 26, MUTED, ";font-style:italic")}
<rect x="${X0}" y="164" width="${BW}" height="52" rx="26" style="fill:${INK}"/>
<circle cx="${X0 + 27}" cy="190" r="15" style="fill:${PAPER}"/>
${mid(X0 + 27, 196, String(step), 17, INK, ";font-weight:bold")}
${left(X0 + 56, 198, a.say, 22, PAPER)}
${out.join("\n")}
<rect x="${X0}" y="${by}" width="${BW}" height="80" rx="12" style="fill:${INK}"/>
${mid(W / 2, by + 36, "Never stalls. Never overspends. Never leaks private code.", 25, PAPER)}
${mid(W / 2, by + 63, "When a model runs out it moves on; real money needs my yes; private repositories stay on private models.", 15, "#B9B6AC", ";font-style:italic")}
<line x1="${X0}" y1="${H - 62}" x2="${W - X0}" y2="${H - 62}" style="stroke:${LINE};stroke-width:1"/>
${left(X0, H - 34, "I Ran Out With Hours Left", 19)}
${right(W - X0, H - 34, HOST, 18, MUTED)}
</svg>`;
}

// One step at a time. Each station holds for HOLD_MS, then the dot travels over MOVE_MS. The last frame holds
// a little longer, then the loop restarts on the same spot.
const frames: { svg: string; delay: number }[] = [];
for (let i = 0; i < STATIONS.length; i++) {
  frames.push({ svg: frame(STATIONS[i].s), delay: HOLD_MS });
  const next = STATIONS[i + 1];
  if (!next) continue;
  for (let j = 1; j < MOVE_STEPS; j++) {
    const ph = STATIONS[i].s + (next.s - STATIONS[i].s) * (j / MOVE_STEPS);
    frames.push({ svg: frame(ph), delay: MOVE_MS / (MOVE_STEPS - 1) });
  }
}
frames[frames.length - 1].delay = END_HOLD_MS;

const gifenc = await readFile(join(ROOT, "node_modules", "gifenc", "dist", "gifenc.esm.js"), "utf8");
const browser = await chromium.launch();
try {
  const pg = await browser.newPage({ viewport: { width: W, height: H } });
  await pg.setContent(`<!doctype html><html><body style="margin:0"><canvas id="c" width="${W}" height="${H}"></canvas></body></html>`);
  const bytes: number[] = await pg.evaluate(async ({ src, frames: framesIn, W: width, H: height }) => {
    const { GIFEncoder, quantize, applyPalette } = await import(URL.createObjectURL(new Blob([src], { type: "text/javascript" })));
    const ctx = (document.getElementById("c") as HTMLCanvasElement).getContext("2d", { willReadFrequently: true })!;
    const gif = GIFEncoder();
    for (const f of framesIn) {
      const img = new Image();
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(f.svg);
      await img.decode();
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0);
      const { data } = ctx.getImageData(0, 0, width, height);
      const palette = quantize(data, 32);
      gif.writeFrame(applyPalette(data, palette), width, height, { palette, delay: f.delay });
    }
    gif.finish();
    return Array.from(gif.bytes() as Uint8Array);
  }, { src: gifenc, frames, W, H });
  const OUT = join(ROOT, "content", "media", "notes");
  await mkdir(OUT, { recursive: true });
  await writeFile(join(OUT, "model-layer-architecture.gif"), new Uint8Array(bytes));
  // Two stills for review: the free model out, and Go with both locks showing.
  for (const [name, ph] of [["free", 0.66], ["go", 0.86]] as const) {
    await pg.setContent(`<!doctype html><html><body style="margin:0">${frame(ph)}</body></html>`);
    await writeFile(join(OUT, `model-layer-architecture-${name}.png`), await pg.screenshot({ clip: { x: 0, y: 0, width: W, height: H } }));
  }
  console.log(`[social:gif:model-layer-architecture] wrote content/media/notes/model-layer-architecture.gif (${W}x${H}, ${frames.length} frames, ${(bytes.length / 1024).toFixed(0)} KB) and two stills`);
} finally {
  await browser.close();
}
