// portfolio/tools/og-card.ts — generate the social-share card (og:image / twitter:image) as a PNG.
//
// A build-time asset, not shipped JS: it renders a self-contained HTML card headless (Playwright +
// chromium, already a devDependency for shots/e2e/audit — no new runtime dep) and writes a single
// 1200×630 PNG to media/og-card.png. The card is site-level (one image for every unfurl), styled in
// the same Department-of-Time e-ink palette the UI-snapshot gallery uses, so a link to any page on
// LinkedIn / Slack / X / iMessage shows an on-brand card.
//
//   bun run og:card        # → media/og-card.png  (commit the result; regenerate when the wording changes)
//
// Not run in CI/export: the PNG is committed like a font, and the static export copies media/ verbatim.
// Not a test (no assertions) and not matched by `bun test` or Playwright's *.e2e.ts glob.
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE } from "../src/seo.ts";

const OUT = join(import.meta.dir, "..", "media");
const W = SITE.ogImageW;   // 1200
const H = SITE.ogImageH;   // 630

// The card markup. Serif masthead + e-ink paper, matching the site's own look. Inline everything —
// this renders with setContent (no server, no external asset), so what you see here is the whole card.
const card = `<!doctype html><html><head><meta charset="utf-8"><style>
  html,body { margin:0; }
  :root { --paper:#E2E0D8; --ink:#1C1B17; --muted:#6E6C64; --line:rgba(28,27,23,.18); }
  .card {
    box-sizing:border-box; width:${W}px; height:${H}px; background:var(--paper); color:var(--ink);
    padding:72px 84px; display:flex; flex-direction:column; justify-content:space-between;
    font-family:Georgia,"Times New Roman",serif; position:relative;
  }
  .card::after { content:""; position:absolute; inset:26px; border:1.5px solid var(--line); border-radius:8px; pointer-events:none; }
  .eyebrow { font-size:24px; letter-spacing:.22em; text-transform:uppercase; color:var(--muted); margin:0; }
  .title { font-size:104px; line-height:1.02; letter-spacing:-.02em; margin:0; font-weight:400; }
  .tagline { font-size:38px; line-height:1.3; color:var(--ink); margin:0; max-width:22ch; }
  .stack { display:flex; gap:18px; align-items:center; font-size:26px; letter-spacing:.16em;
           text-transform:uppercase; color:var(--muted); margin:0; }
  .stack b { color:var(--ink); font-weight:600; }
  .dot { color:var(--line); }
  .foot { display:flex; justify-content:space-between; align-items:baseline; font-size:26px; color:var(--muted); }
  .foot .url { color:var(--ink); letter-spacing:.02em; }
</style></head><body>
  <div class="card">
    <div>
      <p class="eyebrow">Portfolio · Notebook · Live demo</p>
    </div>
    <div style="display:flex; flex-direction:column; gap:28px;">
      <h1 class="title">${SITE.name}</h1>
      <p class="tagline">${SITE.tagline}</p>
      <p class="stack"><b>BATCH</b><span class="dot">·</span><b>GRAIN</b><span class="dot">·</span><b>MILL</b></p>
    </div>
    <div class="foot">
      <span>${SITE.author.name}</span>
      <span class="url">tjakoen.github.io</span>
    </div>
  </div>
</body></html>`;

console.log("[og:card] rendering…");
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.setContent(card, { waitUntil: "networkidle" });
  const buf = await page.screenshot({ clip: { x: 0, y: 0, width: W, height: H }, type: "png" });
  await mkdir(OUT, { recursive: true });
  await writeFile(join(OUT, "og-card.png"), buf);
  console.log(`[og:card] wrote media/og-card.png (${W}×${H}, ${(buf.length / 1024).toFixed(1)}kb)`);
} finally {
  await browser.close();
}
