// portfolio/tools/screenshots.ts — visual review for headless/remote work.
import { join } from "node:path";
//
// Boots the app, drives a real browser (Playwright + chromium), and captures the key
// screens AND the interesting *states* you can't see from a page load — the desk mid-act
// (spotlight + dim), the ⌘K palette. Writes PNGs to screenshots/ plus a self-contained
// screenshots/gallery.html (images inlined) you (or an Artifact) can open anywhere.
//
//   bun run shots                 # all shots → screenshots/
//   (then publish screenshots/gallery.html as an Artifact to view remotely)
//
// Not a test (no assertions) and not matched by `bun test` or Playwright's *.e2e.ts glob.
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const PORT = Number(Bun.env.SHOTS_PORT ?? 3310);
const BASE = `http://localhost:${PORT}`;
const OUT = "screenshots";
const VIEWPORT = { width: 1200, height: 850 };

type Shot = {
  name: string;
  desc: string;
  fullPage?: boolean;
  prepare: (page: import("@playwright/test").Page) => Promise<void>;
};

const goto = (path: string) => async (page: import("@playwright/test").Page) => {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(250);
};

const SHOTS: Shot[] = [
  { name: "welcome", desc: "/ — THE EDITOR's Welcome page (the whole site as one editor window)", fullPage: true, prepare: goto("/") },
  { name: "notes", desc: "/notes — the notes index (MILL), inside the editor window", fullPage: true, prepare: goto("/notes") },
  { name: "calendar", desc: "/calendar — Month/Week/Agenda over the real note dates + desk-feed posts (Pass 2 — Calendar)", fullPage: true, prepare: goto("/calendar") },
  { name: "mail", desc: "/mail — folders + a message list over a letters page of desk dispatches, Compose is the one live control (Pass 3 — Mail)", fullPage: true, prepare: goto("/mail") },
  { name: "bread", desc: "/bread — the BREAD Stack directory: all five members, one card shape", fullPage: true, prepare: goto("/bread") },
  { name: "grain", desc: "/grain — the GRAIN showcase, built with GRAIN", fullPage: true, prepare: goto("/grain") },
  { name: "batch", desc: "/batch — the lean substrate landing page", fullPage: true, prepare: goto("/batch") },
  { name: "mill", desc: "/mill — the lean content-engine landing page", fullPage: true, prepare: goto("/mill") },
  { name: "proof", desc: "/proof — the AI plan board trailhead (building)", fullPage: true, prepare: goto("/proof") },
  { name: "pantry", desc: "/pantry — the installable dev-docs cockpit trailhead (building)", fullPage: true, prepare: goto("/pantry") },
  {
    name: "grain-peek", desc: "/grain — Inspect: the Catalog peek bridges usage → specimen",
    prepare: async (page) => {
      await page.goto(`${BASE}/grain`, { waitUntil: "networkidle" });
      await page.locator('[data-peek="open"]').first().click();   // the Catalog tab (now in the topbar)
      await page.locator('.assistant__pane[data-pane="catalog"]:not([hidden])').waitFor({ timeout: 5000 });
      await page.locator(".site .btn").first().dispatchEvent("mouseover");   // point at a component
      await page.waitForTimeout(600);   // let the embedded catalog reveal + highlight
    },
  },
  {
    name: "grain-peek-chat",
    desc: "/grain — hover the chat in the composed surface → the sidebar reveals the Chat message entry",
    prepare: async (page) => {
      await page.goto(`${BASE}/grain`, { waitUntil: "networkidle" });
      await page.locator('[data-peek="open"]').first().click();   // the Catalog tab (now in the topbar)
      await page.locator('.assistant__pane[data-pane="catalog"]:not([hidden])').waitFor({ timeout: 5000 });
      // hover a real chat-message in the composed surface → the pane reveals that one entry
      await page.locator(".surface .chat-message").first().dispatchEvent("mouseover");
      await page.frameLocator(".catalog-pane__frame").locator('.cat-doc.is-peek-active#chat-message').waitFor({ timeout: 5000 });
      await page.waitForTimeout(400);
    },
  },
  {
    name: "grain-ai-acting",
    desc: "/grain — \"Watch the AI act\": the AI drives the composed surface under the spotlight",
    prepare: async (page) => {
      await page.goto(`${BASE}/grain`, { waitUntil: "networkidle" });
      await page.locator("[data-surface-demo]").scrollIntoViewIfNeeded();
      await page.locator("[data-ai-run]").click();
      await page.locator(".ai-backdrop.is-on").waitFor({ timeout: 5000 });
      // catch the AI mid-run under the spotlight: a lit surface it's writing into (the demo runs
      // through the real door now, so this is a server-pushed RenderOp being applied)
      await page.locator("[data-surface-demo] .ai-spotlit").first().waitFor({ timeout: 8000 });
      await page.waitForTimeout(300);
    },
  },
  { name: "loop", desc: "/loop — the desk (idle)", fullPage: true, prepare: goto("/loop") },
  {
    name: "loop-acting", desc: "/loop — “Watch the desk work”: spotlight + dim, writing the plan",
    prepare: async (page) => {
      await page.goto(`${BASE}/loop`, { waitUntil: "networkidle" });
      await page.getByRole("button", { name: "Watch the desk work" }).click();
      await page.locator(".ai-backdrop.is-on").waitFor({ timeout: 8000 });
      await page.locator('[data-surface="plan-item:1"]').waitFor({ timeout: 20000 }).catch(() => {});
      await page.waitForTimeout(400);   // let a bullet land mid-write
    },
  },
  {
    name: "cmdk", desc: "/loop — the ⌘K command palette",
    prepare: async (page) => {
      await page.goto(`${BASE}/loop`, { waitUntil: "networkidle" });
      await page.keyboard.press("ControlOrMeta+k");
      await page.locator("dialog.cmdk").waitFor({ timeout: 5000 });
      await page.locator("dialog.cmdk input").fill("loop");
      await page.waitForTimeout(250);
    },
  },
  { name: "inspector", desc: "/grain — the sidebar in GRAIN Inspector (Catalog) mode", prepare: async (page) => {
    await page.goto(`${BASE}/grain`, { waitUntil: "networkidle" });
    await page.locator('.assistant__modes [data-shell-mode="catalog"]').click();
    await page.waitForTimeout(600);
  } },
  { name: "catalog", desc: "/catalog — the component catalog", prepare: goto("/catalog") },
  { name: "about", desc: "/about — the tabbed profile app: Profile/Résumé/Contact/Now over the same real bio, no invented facts (Pass 4 — About)", fullPage: true, prepare: goto("/about") },
  {
    name: "about-tabs", desc: "/about — the Contact tab: the compose CTA and docs-list, Reply/Forward-free (Pass 4 — About)",
    prepare: async (page) => {
      await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
      await page.locator('.about-tabs [href="#contact"]').click();
      await page.locator('#contact:not([hidden])').waitFor({ timeout: 5000 });
      await page.waitForTimeout(200);
    },
  },
];

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

async function waitForServer(timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try { if ((await fetch(`${BASE}/loop`)).ok) return; } catch { /* not up yet */ }
    await Bun.sleep(200);
  }
  throw new Error(`server didn't come up on ${BASE}`);
}

console.log(`[shots] starting server on ${PORT}…`);
const server = Bun.spawn(["bun", join(import.meta.dir, "..", "server.ts")], {
  env: { ...process.env, PORT: String(PORT), NODE_ENV: "production" },
  stdout: "ignore", stderr: "ignore",
});
try {
  await waitForServer();
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  // motion ON so live simulations (e.g. /grain's grade-as-signal) render as users see them —
  // headless chromium otherwise defaults to prefers-reduced-motion: reduce and freezes them.
  const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: 2, reducedMotion: "no-preference" });

  const cards: string[] = [];
  for (const shot of SHOTS) {
    process.stdout.write(`[shots] ${shot.name} … `);
    try {
      await shot.prepare(page);
      const buf = await page.screenshot({ fullPage: shot.fullPage ?? false, type: "jpeg", quality: 72 });
      await writeFile(`${OUT}/${shot.name}.jpg`, buf);
      const b64 = Buffer.from(buf).toString("base64");
      const [route, ...rest] = shot.desc.split(" — ");
      const caption = rest.length
        ? `<b>${escapeHtml(route)}</b> ${escapeHtml(rest.join(" — "))}`
        : `<b>${escapeHtml(route)}</b>`;
      cards.push(
        `<figure>\n  <figcaption>${caption}</figcaption>\n` +
        `  <img alt="${escapeHtml(shot.desc)}" src="data:image/jpeg;base64,${b64}">\n</figure>`,
      );
      console.log("ok");
    } catch (e) {
      console.log(`FAILED (${(e as Error).message})`);
    }
  }
  await browser.close();

  // a self-contained gallery (body content only — openable locally + publishable as an
  // Artifact). Styled to match the product it shows: Department of Time paper/ink, a serif
  // masthead, hairline-framed plates. Lives here so `bun run shots` always regenerates it.
  const gallery =
    `<style>\n` +
    `  :root { color-scheme: light; --paper:#E2E0D8; --ink:#1C1B17; --muted:#6E6C64; --line:rgba(28,27,23,.16); }\n` +
    `  body { background: var(--paper); color: var(--ink); margin: 0;\n` +
    `         font: 16px/1.6 Georgia, "Times New Roman", serif;\n` +
    `         padding: clamp(1.5rem, 5vw, 3rem); }\n` +
    `  .wrap { max-width: 980px; margin: 0 auto; }\n` +
    `  .eyebrow { font-size: .8rem; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); margin: 0 0 .4rem; }\n` +
    `  h1 { font-weight: 400; font-size: clamp(1.8rem, 4vw, 2.6rem); letter-spacing: -.01em;\n` +
    `       text-wrap: balance; margin: 0; }\n` +
    `  .lede { color: var(--muted); margin: .5rem 0 0; max-width: 60ch; }\n` +
    `  .lede code { font-family: ui-monospace, monospace; font-size: .85em; }\n` +
    `  hr { border: 0; border-top: 1.5px solid var(--ink); margin: 1.5rem 0 2.5rem; }\n` +
    `  figure { margin: 0 0 3rem; }\n` +
    `  figcaption { display: flex; align-items: baseline; gap: .6rem; font-size: .78rem;\n` +
    `               text-transform: uppercase; letter-spacing: .1em; color: var(--muted); margin: 0 0 .6rem; }\n` +
    `  figcaption b { color: var(--ink); font-weight: 600; letter-spacing: .04em; }\n` +
    `  img { width: 100%; height: auto; display: block; border: 1px solid var(--line);\n` +
    `        border-radius: 4px; background: #fff; }\n` +
    `</style>\n` +
    `<div class="wrap">\n` +
    `  <p class="eyebrow">The Department of Time</p>\n` +
    `  <h1>UI snapshots</h1>\n` +
    `  <p class="lede">Captured headless from the running app for visual review. Regenerate any time with <code>bun run shots</code>.</p>\n` +
    `  <hr>\n` +
    cards.join("\n") +
    `\n</div>`;
  await writeFile(`${OUT}/gallery.html`, gallery);

  console.log(`[shots] wrote ${SHOTS.length} images + ${OUT}/gallery.html`);
} finally {
  server.kill();
}
