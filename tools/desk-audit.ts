// tools/desk-audit.ts — REAL-MODEL scenario audit for the desk (the retune's measuring stick).
// Drives the live site in a real Chromium WITH WebGPU (unlike the e2e suite, which is headless and
// model-offline by design), asks the actual Qwen2.5-0.5B a fixed scenario list, and grades the
// replies (must-mention keywords, expected navigation, protocol leaks, loops). Run it BEFORE a
// prompt/retrieval change and AFTER, then diff the two reports.
//
//   bun tools/desk-audit.ts baseline          # label the report; writes .cache/desk-audit/report-<label>.json
//   bun tools/desk-audit.ts after --headed    # force a visible window (default tries headless first)
//   bun tools/desk-audit.ts quick --only=bread-stack,who-is-tj
//
// Local-only, never CI: needs WebGPU (headless works on a Mac via the full-Chromium channel; if no
// adapter shows up we relaunch headed) and the first run downloads ~350MB of weights — a PERSISTENT
// browser profile (.cache/desk-audit/profile) keeps them cached across runs.
import { chromium, type BrowserContext, type Page } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3131);
const BASE = `http://localhost:${PORT}`;
const DESK_DOOR = "/modules/portfolio/ai/desk-door.js";
const OUT_DIR = ".cache/desk-audit";
const PROFILE_DIR = `${OUT_DIR}/profile`;

// ---- the scenario list. Each is a REAL visitor question, phrased to reach the layer under test:
// the model tail (grounded chat / fuzzy nav / capability awareness) unless marked deterministic —
// those run as controls, proving the harness itself drives the full chain. Graders are honest
// minimums, not prose taste: a pass means "not broken", the captured text is what the retune reads.
interface Scenario {
  id: string;
  page: string;                    // where the question is asked from
  ask: string;
  /** every group must have ≥1 case-insensitive hit in the reply (AND of ORs) */
  mustMention?: string[][];
  /** the browser must END on this pathname (a navigation scenario) */
  mustNavigate?: string;
  /** case-insensitive substrings that must NOT appear (protocol leaks, stub phrasing) */
  mustNotMention?: string[];
  /** cap on reply length — a 0.5B past this is usually rambling (ignored for nav scenarios) */
  maxChars?: number;
  deterministic?: boolean;         // control: answered without the model
}

const SCENARIOS: Scenario[] = [
  // -- grounded Q&A (the model tail; retrieval + persona under test) --
  { id: "bread-stack", page: "/", ask: "What is the BREAD stack?",
    mustMention: [["batch"], ["grain"], ["mill"]], mustNotMention: ["NAVIGATE:", "CHOICES:"], maxChars: 700 },
  { id: "who-is-tj", page: "/", ask: "Who is TJ?",
    mustMention: [["teach"], ["Career Team", "dev manager", "tech lead"]], mustNotMention: ["NAVIGATE:", "CHOICES:"], maxChars: 700 },
  { id: "grain-built", page: "/grain", ask: "What did TJ build with grain?",
    mustMention: [["grain"]], mustNotMention: ["NAVIGATE:", "CHOICES:"], maxChars: 700 },
  { id: "how-desk-works", page: "/", ask: "How do you work under the hood?",
    mustMention: [["browser", "device", "WebGPU", "model"]], mustNotMention: ["NAVIGATE:", "CHOICES:"], maxChars: 700 },
  // -- capability awareness (the grain-awareness gap: freeform phrasings that MISS the deterministic
  //    capabilities route and land on the model, which today knows nothing about what the desk can do) --
  { id: "cap-freeform", page: "/grain", ask: "What are you able to do for me on this site?",
    mustMention: [["navigate", "take you", "jump", "open"], ["summar"]], mustNotMention: ["NAVIGATE:", "CHOICES:"], maxChars: 700 },
  { id: "cap-interactive", page: "/grain", ask: "Show me something interactive here",
    mustMention: [["demo", "desk", "chip", "ask"]], mustNotMention: ["NAVIGATE:", "CHOICES:"], maxChars: 700 },
  { id: "cap-pages", page: "/", ask: "Which pages can you take me to?",
    mustMention: [["grain", "notes", "batch", "resume"]], mustNotMention: ["NAVIGATE:", "CHOICES:"], maxChars: 700,
    deterministic: true },   // routed to the capabilities action since 2026-07-24 (the 0.5B mangled route lists)
  // -- the desk ACTS: model-composed writes + summaries (the action paths through the real model) --
  { id: "note-write", page: "/grain", ask: "Jot down that the grain demo looks really promising",
    mustMention: [["notepad"]], mustNotMention: ["NAVIGATE:", "CHOICES:"] },
  { id: "summarize", page: "/notes", ask: "Summarize this page",
    mustMention: [["note", "notes", "writing", "post"]], mustNotMention: ["NAVIGATE:", "CHOICES:"], maxChars: 900 },
  // -- fuzzy navigation (the model's NAVIGATE tail — no deterministic full-cover match) --
  { id: "nav-fuzzy-mill", page: "/", ask: "I want to read the mill documentation",
    mustNavigate: "/mill/docs" },
  // -- deterministic controls (prove the harness end-to-end; these must never regress) --
  { id: "nav-det", page: "/", ask: "take me to the notes", mustNavigate: "/notes", deterministic: true },
  { id: "cap-det", page: "/", ask: "What can I do here?",
    mustMention: [["latest note"], ["summarize"], ["GRAIN"]], deterministic: true },
  // A1 deep-link answers — "where does TJ talk about X" retrieves deterministically (actions.ts
  // DEEP_LINK_PATTERNS) and jumps straight to the anchored section, never the model. Verified against
  // the real corpus (bun -e, buildPortfolioKnowledge + retrieve): this phrasing's top-scoring anchored
  // hit is the how-i-use-ai-in-teaching note's "The stories worth telling" section, so the arrival
  // announce reads "Here's the part about ... from ...".
  { id: "deep-link-det", page: "/", ask: "where does TJ talk about using AI with students",
    mustNavigate: "/notes/how-i-use-ai-in-teaching", mustMention: [["part", "section", "under"]], deterministic: true },
];

// ---- plumbing ----

/** Serve every document the way the frozen export does (client transport + the desk door), so the
 *  real model path runs — the dev server's default is the server-door transport. Same rewrite the
 *  e2e suite uses (e2e/desk-actions.e2e.ts), minus its WebGPU kill switch. */
async function clientDeskEverywhere(page: Page): Promise<void> {
  await page.route("**/*", async (route, req) => {
    if (req.resourceType() !== "document") return route.continue();
    const res = await route.fetch();
    if (!(res.headers()["content-type"] || "").includes("text/html")) return route.fulfill({ response: res });
    const html = (await res.text()).replace(/<body\b/, `<body data-ai-transport="client" data-ai-door="${DESK_DOOR}"`);
    return route.fulfill({ response: res, body: html });
  });
}

const ask = (page: Page, text: string) =>
  page.evaluate((t) => (window as unknown as { grain: { door: { submit(a: string, s: string, p: unknown): void } } })
    .grain.door.submit("chat.send", "chat-log", { text: t }), text);

async function deskReady(page: Page): Promise<void> {
  await page.waitForFunction(() => Boolean((window as unknown as { grain?: { door?: unknown } }).grain?.door), null, { timeout: 20_000 });
  await page.waitForFunction(() => document.body.dataset.aiOnline === "true", null, { timeout: 20_000 });
  const offline = await page.evaluate(() => document.body.dataset.desk === "offline");
  if (offline) throw new Error("desk marked itself offline (no usable WebGPU in this browser)");
}

/** The text of the LAST desk (ai) bubble in the chat log, "" when there is none yet. */
const lastReply = (page: Page): Promise<string> =>
  page.evaluate(() => {
    const bubbles = document.querySelectorAll(".assistant__log .chat-message--ai, .assistant__log .chat-message");
    const last = bubbles[bubbles.length - 1];
    return (last?.textContent ?? "").trim();
  }).catch(() => "");   // navigation mid-poll tears the context — caller handles it

const BUSY = /Thinking|Loading Qwen|\d+%$/;

/** Wait until the desk's reply settles: non-empty, not a load/thinking state, and UNCHANGED for
 *  `stableMs`. A cross-page navigation also ends the wait (nav scenarios). Returns the final text
 *  and the pathname we ended on. */
async function settle(page: Page, startPath: string, timeoutMs: number): Promise<{ text: string; path: string }> {
  const stableMs = 2_500;
  const t0 = Date.now();
  let prev = "";
  let stableSince = Date.now();
  let lastLog = 0;
  for (;;) {
    if (Date.now() - t0 > timeoutMs) return { text: prev, path: await path(page) };
    const p = await path(page);
    if (p !== startPath) {                       // the desk navigated: let the arrival settle, then read
      await page.waitForLoadState("domcontentloaded").catch(() => {});
      await page.waitForTimeout(2_000);
      return { text: await lastReply(page), path: await path(page) };
    }
    const text = await lastReply(page);
    if (text !== prev) { prev = text; stableSince = Date.now(); }
    else if (text && !BUSY.test(text) && Date.now() - stableSince > stableMs) return { text, path: p };
    if (Date.now() - lastLog > 10_000) {         // heartbeat: show download %, long generations
      lastLog = Date.now();
      console.log(`    … ${Math.round((Date.now() - t0) / 1000)}s: ${text.slice(0, 80).replace(/\s+/g, " ")}`);
    }
    await page.waitForTimeout(400);
  }
}

const path = (page: Page): Promise<string> =>
  page.evaluate(() => location.pathname).catch(() => page.url().replace(BASE, "") || "/");

interface Result {
  id: string; ask: string; page: string; deterministic: boolean;
  reply: string; endPath: string; ms: number;
  pass: boolean; failures: string[];
}

function grade(s: Scenario, reply: string, endPath: string, realRoutes: Set<string>): string[] {
  const failures: string[] = [];
  const low = reply.toLowerCase();
  if (s.mustNavigate) {
    if (endPath.replace(/\/+$/, "") !== s.mustNavigate) failures.push(`ended on ${endPath}, wanted ${s.mustNavigate}`);
  }
  for (const group of s.mustMention ?? []) {
    if (!group.some((k) => low.includes(k.toLowerCase()))) failures.push(`missing any of [${group.join(", ")}]`);
  }
  for (const bad of s.mustNotMention ?? []) {
    if (low.includes(bad.toLowerCase())) failures.push(`leaked "${bad}"`);
  }
  // EVERY page path the model utters must exist on the real site — the baseline showed it inventing
  // routes like /batch/tutorial. Checked on all scenarios (an invented path is a fail anywhere).
  if (realRoutes.size > 0) {
    const mentioned = reply.match(/(?<![a-z0-9])\/[a-z0-9][a-z0-9/-]+/gi) ?? [];   // lookbehind skips "and/or"
    for (const p of new Set(mentioned.map((m) => m.replace(/[/.,;:]+$/, "")))) {
      if (!realRoutes.has(p.toLowerCase())) failures.push(`invented path ${p}`);
    }
  }
  if (!s.mustNavigate) {
    if (!reply.trim()) failures.push("empty reply");
    if (s.maxChars && reply.length > s.maxChars) failures.push(`rambled: ${reply.length} chars > ${s.maxChars}`);
    // the reasoner's own loop-guard signature: a recurring ~28-char tail
    const tail = reply.slice(-28);
    if (tail.trim().length > 10 && reply.split(tail).length - 1 >= 3) failures.push("looped");
  }
  return failures;
}

// ---- server: reuse one already on the port, else boot our own ----
async function ensureServer(): Promise<(() => void) | null> {
  try { const r = await fetch(BASE, { signal: AbortSignal.timeout(1500) }); if (r.ok) { console.log(`reusing server on :${PORT}`); return null; } } catch { /* boot */ }
  console.log(`booting server on :${PORT}`);
  const proc = Bun.spawn(["bun", "src/server.ts"], { env: { ...process.env, PORT: String(PORT) }, stdout: "ignore", stderr: "inherit" });
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(BASE, { signal: AbortSignal.timeout(1000) }); if (r.ok) return () => proc.kill(); } catch { /* not yet */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  proc.kill();
  throw new Error("server did not come up");
}

/** Launch a persistent-profile browser that actually has a WebGPU adapter. Playwright's bundled
 *  Chromium ships without GPU raster on macOS more often than not, so the ladder also tries the
 *  system Chrome (channel "chrome"), headless-new first, then headed. First launch that yields a
 *  real adapter wins. */
async function launchWithWebgpu(forceHeaded: boolean): Promise<BrowserContext> {
  const GPU_ARGS = [
    "--enable-unsafe-webgpu", "--enable-dawn-features=allow_unsafe_apis",
    "--ignore-gpu-blocklist", "--enable-gpu", "--use-angle=metal",
  ];
  const ladder: Array<{ name: string; channel: "chromium" | "chrome"; headless: boolean }> = [
    { name: "bundled chromium, headless", channel: "chromium", headless: true },
    { name: "bundled chromium, headed", channel: "chromium", headless: false },
    { name: "system Chrome, headless", channel: "chrome", headless: true },
    { name: "system Chrome, headed", channel: "chrome", headless: false },
  ];
  const attempts = forceHeaded ? ladder.filter((a) => !a.headless) : ladder;
  for (const a of attempts) {
    let ctx: BrowserContext;
    try {
      ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
        channel: a.channel, headless: a.headless, viewport: { width: 1280, height: 900 },
        args: GPU_ARGS,
      });
    } catch (err) { console.log(`launch failed (${a.name}): ${String(err).split("\n")[0]}`); continue; }
    const probe = await ctx.newPage();
    // navigator.gpu only exists in a SECURE context — about:blank doesn't count, so probe on the site
    await probe.goto(BASE, { waitUntil: "domcontentloaded" }).catch(() => {});
    const hasAdapter = await probe.evaluate(async () => {
      const gpu = (navigator as unknown as { gpu?: { requestAdapter(): Promise<unknown> } }).gpu;
      if (!gpu) return false;
      try { return (await gpu.requestAdapter()) != null; } catch { return false; }
    }).catch(() => false);
    await probe.close();
    if (hasAdapter) { console.log(`WebGPU adapter OK — ${a.name}`); return ctx; }
    console.log(`no WebGPU adapter (${a.name})`);
    await ctx.close();
  }
  throw new Error("no WebGPU adapter available in any launch mode");
}

// ---- main ----
const argv = process.argv.slice(2);
const label = argv.find((a) => !a.startsWith("--")) ?? "run";
const forceHeaded = argv.includes("--headed");
const only = argv.find((a) => a.startsWith("--only="))?.slice(7).split(",");
const scenarios = only ? SCENARIOS.filter((s) => only.includes(s.id)) : SCENARIOS;

const stopServer = await ensureServer();
// The site's real routes (for the invented-path grader) — same source the catalog uses.
const realRoutes = new Set<string>(
  [...(await fetch(`${BASE}/sitemap.xml`).then((r) => r.text()).catch(() => ""))
    .matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)]
    .map((m) => { try { return new URL(m[1]!).pathname; } catch { return m[1]!; } })
    .map((p) => (p.replace(/\/+$/, "") || "/").toLowerCase()),
);
// A browser-launch failure must not orphan the server we just booted (a stale server then serves
// pre-edit modules to every later run — confusing far beyond this tool).
let ctx: BrowserContext;
try { ctx = await launchWithWebgpu(forceHeaded); }
catch (err) { stopServer?.(); throw err; }
const results: Result[] = [];
let firstModelRun = true;

// One scenario, on a given browser context. Throws on a harness/browser failure.
async function runScenario(c: BrowserContext, s: Scenario): Promise<Result> {
  const page = await c.newPage();
  try {
    await clientDeskEverywhere(page);
    await page.goto(BASE + s.page, { waitUntil: "domcontentloaded" });
    await deskReady(page);
    const startPath = await path(page);
    const t0 = Date.now();
    await ask(page, s.ask);
    // first model scenario may include the one-time ~350MB download; be patient once
    const timeout = s.deterministic ? 30_000 : firstModelRun ? 420_000 : 150_000;
    const { text, path: endPath } = await settle(page, startPath, timeout);
    if (!s.deterministic) firstModelRun = false;
    const ms = Date.now() - t0;
    const failures = grade(s, text, endPath, realRoutes);
    return { id: s.id, ask: s.ask, page: s.page, deterministic: !!s.deterministic, reply: text, endPath, ms, pass: failures.length === 0, failures };
  } finally {
    await page.close().catch(() => {});
  }
}

try {
  for (const s of scenarios) {
    console.log(`\n[${s.id}] on ${s.page}: "${s.ask}"`);
    let res: Result;
    try {
      res = await runScenario(ctx, s);
    } catch (err) {
      // Chromium's GPU process can die under repeated engine loads (one full WebLLM load per page —
      // it's an MPA). A dead browser fails every remaining scenario, so relaunch and retry ONCE.
      if (/closed|crashed|Target/i.test(String(err))) {
        console.log(`  browser died (${String(err).split("\n")[0]}) — relaunching once`);
        await ctx.close().catch(() => {});
        ctx = await launchWithWebgpu(forceHeaded);
        try {
          res = await runScenario(ctx, s);
        } catch (err2) {
          res = { id: s.id, ask: s.ask, page: s.page, deterministic: !!s.deterministic, reply: "", endPath: "", ms: 0, pass: false, failures: [`harness error after relaunch: ${String(err2)}`] };
        }
      } else {
        res = { id: s.id, ask: s.ask, page: s.page, deterministic: !!s.deterministic, reply: "", endPath: "", ms: 0, pass: false, failures: [`harness error: ${String(err)}`] };
      }
    }
    results.push(res);
    console.log(`  ${res.pass ? "PASS" : "FAIL"} (${Math.round(res.ms / 1000)}s)${res.failures.length ? " — " + res.failures.join("; ") : ""}`);
    if (res.reply) console.log(`  reply: ${res.reply.slice(0, 220).replace(/\s+/g, " ")}${res.reply.length > 220 ? "…" : ""}`);
  }
} finally {
  await ctx.close();
  stopServer?.();
}

const passed = results.filter((r) => r.pass).length;
const report = { label, base: BASE, model: "Qwen2.5-0.5B (WEAK_PROFILE)", passed, total: results.length, results };
await Bun.write(`${OUT_DIR}/report-${label}.json`, JSON.stringify(report, null, 2));
console.log(`\n== ${passed}/${results.length} passed — ${OUT_DIR}/report-${label}.json ==`);
for (const r of results) console.log(`  ${r.pass ? "✓" : "✗"} ${r.id}${r.failures.length ? " — " + r.failures.join("; ") : ""}`);
if (passed < results.length) process.exit(1);
