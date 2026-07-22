// portfolio/ai/desk-door.ts — the DESK's client door (the page selects it via
// <body data-ai-door="/modules/portfolio/ai/desk-door.js">; dispatcher hook: grain ai-dispatch.js).
// It is grain's own createClientDoor, composed with a DIFFERENT reasoner: the local WebLLM desk for
// chat, grain's stub for every other verb. Grain ships UNCHANGED (pin 637630e) — this is the exact
// `{ reasoner }` swap client-door.ts documents.
//
// CLIENT-SAFE (§19.2): relative imports for our own code; grain's door + stub are pulled by COMPUTED
// URL (resolved against this module's URL, so it works on a base-path host) — the `typeof import(...)`
// annotations are type-only (erased). WebLLM itself is loaded lazily inside webllm-loader.loadEngine.
//
// OFFLINE (2026-07-13 requirement): markOffline sets body[data-desk="offline"], the portfolio's
// CHAT-SPECIFIC marker — the CSS then hides the composer + chips and shows "Desk Offline", while the
// door + stub demos stay ONLINE (global data-ai-online is untouched). We also probe WebGPU at load
// and mark offline UP FRONT, so a browser that can't run the model never shows a dead composer.

import type { RenderOp } from "@tjakoen/grain/ai/contract.ts";
import type { InteractionLayer } from "@tjakoen/grain/ai/interaction-layer.ts";
import type { Manifest } from "@tjakoen/grain/ai/manifest.ts";
import type { DomDoc } from "@tjakoen/grain/ai/manifest-dom.ts";
import { pickProfile } from "./webllm-loader.ts";
import { makeDeskReasoner, type DeskNote } from "./desk-reasoner.ts";
import { buildCatalog, type NavDest } from "./catalog.ts";
import type { Knowledge } from "./retrieval.ts";
import type { EngineProgress } from "@tjakoen/grain/ai/webllm.ts";

// Pull grain's door + stub by URL (build-time bare imports would be refused by the module server).
// Top-level await: by the time the dispatcher calls createClientDoor(), these are resolved, so our
// export stays synchronous — exactly the shape the dispatcher expects (`m.createClientDoor(applyOp)`).
const grainDoor = await import(new URL("../../grain/ai/client-door.js", import.meta.url).href) as
  typeof import("@tjakoen/grain/ai/client-door.ts");
const grainReasoner = await import(new URL("../../grain/ai/reasoner.js", import.meta.url).href) as
  typeof import("@tjakoen/grain/ai/reasoner.ts");
const grainKit = await import(new URL("../../grain/ai/reasoner-kit.js", import.meta.url).href) as
  typeof import("@tjakoen/grain/ai/reasoner-kit.ts");
const grainManifest = await import(new URL("../../grain/ai/manifest-dom.js", import.meta.url).href) as
  typeof import("@tjakoen/grain/ai/manifest-dom.ts");
// grain's WebLLM transport (the probe + CDN loader) and streaming chat helper — lifted UP from the
// portfolio's old webllm-loader so grain owns the reusable machinery; the desk keeps only its model
// CHOICE (the model profile, below) and its RAG/nav/chips. Same URL-import shape as the door + kit above.
const grainWebllm = await import(new URL("../../grain/ai/webllm.js", import.meta.url).href) as
  typeof import("@tjakoen/grain/ai/webllm.ts");
const grainChat = await import(new URL("../../grain/ai/model-chat.js", import.meta.url).href) as
  typeof import("@tjakoen/grain/ai/model-chat.ts");

// Reach the browser globals we need without a DOM lib (the project's tsc has bun-types only).
interface MinimalDoc {
  body?: { dataset: Record<string, string> };
  title?: string;
  querySelector?(sel: string): { textContent?: string | null } | null;
}
const doc = (): MinimalDoc | undefined => (globalThis as unknown as { document?: MinimalDoc }).document;
const loc = (): { assign(u: string): void; pathname?: string } | undefined =>
  (globalThis as unknown as { location?: { assign(u: string): void; pathname?: string } }).location;
interface WebStorage { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void }
const ss = (): WebStorage | undefined => (globalThis as unknown as { sessionStorage?: WebStorage }).sessionStorage;

/** Mark the DESK CHAT offline (portfolio-owned marker). Not the global presence flag — the door and
 *  stub demos stay online; only the chat composer + chips hide (portfolio-frame.css). */
function markOffline(): void {
  const b = doc()?.body;
  if (b) b.dataset.desk = "offline";
}

// ONE device probe at module load, read two ways (grain owns the probe; the portfolio owns the size
// CHOICE): the up-front gate drives the offline UX + the reasoner's probe dep, and `pickProfile` maps
// the SAME capability to a model profile — the strong 1.5B on a clearly capable device (deviceMemory
// ≥ 8), else the weak 0.5B that runs anywhere WebGPU does.
const deviceCap = await grainWebllm.probeDevice();
// The up-front gate deliberately does NOT trust probeDevice()'s adapter result (`deviceCap.webgpu`).
// On a COLD Safari load the GPU process isn't warm the instant this module evaluates, so
// `requestAdapter()` can transiently resolve null even though WebGPU works a beat later — and a single
// early false would strand the desk offline for the WHOLE session (sticky). So gate on the WebGPU API
// being PRESENT (definitive: no API means no model, e.g. Firefox) plus the memory floor, and let the
// REAL engine load on first chat.send be the true test — by then the GPU is warm, and ensureEngine
// still degrades to offline if that load genuinely fails, so a merely-slow-to-warm browser recovers
// while a truly incapable one still ends up offline (just on first use, not up front).
const gpuApiPresent = typeof (globalThis as unknown as
  { navigator?: { gpu?: { requestAdapter?: unknown } } }).navigator?.gpu?.requestAdapter === "function";
const tooLittleMemory = typeof deviceCap.deviceMemory === "number" && deviceCap.deviceMemory < 4;
const canRun = gpuApiPresent && !tooLittleMemory;
// Dev knob: `?tier=weak|strong` forces a model tier so both can be exercised on one machine (the
// auto-by-device pick only ever lands on one). Anything else → auto. The canRunModel gate still applies.
// PERSISTED for the session: this is an MPA, so a plain URL param would evaporate on the first
// navigation and the tier would snap back to auto (visible as the model "switching on its own"). We
// stash the override in sessionStorage on first sight and read it back on every page, so a forced tier
// sticks across the whole visit — until a new `?tier=` overrides it or the tab closes.
const TIER_KEY = "desk-tier";
const tierOverride = ((): "weak" | "strong" | undefined => {
  const valid = (v: string | null): "weak" | "strong" | undefined => (v === "weak" || v === "strong" ? v : undefined);
  try {
    const fromUrl = valid(new URLSearchParams((globalThis as unknown as { location?: { search?: string } }).location?.search ?? "").get("tier"));
    if (fromUrl) { try { ss()?.setItem(TIER_KEY, fromUrl); } catch { /* no session storage */ } return fromUrl; }
    return valid(ss()?.getItem(TIER_KEY) ?? null);
  } catch { return undefined; }
})();
const profile = pickProfile(deviceCap, tierOverride);
const probe = (): Promise<boolean> => Promise.resolve(canRun);

// Load the profile's model through grain's transport: grain owns the CDN import + warm-up, the desk
// supplies WHICH model (profile.id) + its context window and forwards download progress to the load bar.
const loadEngine = (onProgress: (p: EngineProgress) => void) =>
  grainWebllm.loadEngine({ modelId: profile.id, onProgress, contextWindow: profile.contextWindow });

// The grounding corpus, fetched once from the frozen /knowledge.json (base-path aware: resolved
// against this module's URL, which sits under <base>/modules/portfolio/ai/).
let knowledgeP: Promise<Knowledge> | null = null;
const loadKnowledge = (): Promise<Knowledge> =>
  (knowledgeP ??= fetch(new URL("../../../knowledge.json", import.meta.url).href).then((r) => r.json() as Promise<Knowledge>));

// Newest-first notes for "open the latest note" — the frozen /notes.json (base-path aware). Memoized.
let notesP: Promise<DeskNote[]> | null = null;
const listNotes = (): Promise<DeskNote[]> =>
  (notesP ??= fetch(new URL("../../../notes.json", import.meta.url).href)
    .then((r) => r.json() as Promise<DeskNote[]>).catch(() => []));

// The navigable-destination catalog (catalog.ts): the REAL sitemap enriched with titles from the
// knowledge corpus + notes, so the desk navigates only to routes that exist and the set scales with
// the site — no hardcoded alias table. Built once (memoized): parse /sitemap.xml for every route, then
// label each by its known title (a note/doc) or a humanized slug. Base-path aware (module-relative).
let catalogP: Promise<NavDest[]> | null = null;
const loadCatalog = (): Promise<NavDest[]> =>
  (catalogP ??= (async () => {
    const [xml, knowledge, notes] = await Promise.all([
      fetch(new URL("../../../sitemap.xml", import.meta.url).href).then((r) => r.text()).catch(() => ""),
      loadKnowledge().catch(() => null),
      listNotes().catch(() => [] as DeskNote[]),
    ]);
    const routes = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)]
      .map((m) => { try { return new URL(m[1]!).pathname; } catch { return m[1]!; } });
    const titleByRoute: Record<string, string> = {};
    const put = (route: string, title?: string): void => {
      const r = route.replace(/\/+$/, "") || "/";
      if (title && title.trim() && !titleByRoute[r]) titleByRoute[r] = title.trim();
    };
    for (const c of knowledge?.chunks ?? []) put(c.route, c.title);
    for (const n of notes) put(n.route, n.title);
    return buildCatalog(routes, titleByRoute);
  })());

// ---- the desk's UI-driving capabilities (the DOM/nav contact point) ----
const pageText = (): string => doc()?.querySelector?.(".app-shell__main")?.textContent?.trim() ?? "";
const pageInfo = (): { route: string; title: string } => ({ route: loc()?.pathname ?? "/", title: doc()?.title ?? "" });
// GRAIN's own live-DOM manifest of what's operable on this page (for "what can I do here?"). The
// real `document` satisfies grain's structural DomDoc (body + querySelectorAll).
const liveDoc = (): DomDoc => (globalThis as unknown as { document?: DomDoc }).document as DomDoc;
const pageManifest = (): Manifest => grainManifest.domManifest(liveDoc());
// Open any collapsed file-tree folder above a nav link, so the lamp can travel to a VISIBLE target
// before the desk "clicks" it (the bread-stack folder ships collapsed).
interface NavEl { tagName: string; open?: boolean; parentElement: NavEl | null }
const revealNav = (route: string): void => {
  const d = (globalThis as unknown as { document?: { querySelector(s: string): NavEl | null } }).document;
  let el: NavEl | null = d?.querySelector(`[data-surface="nav:${route}"]`) ?? null;
  while (el) { if (el.tagName === "DETAILS") el.open = true; el = el.parentElement; }
};
// Flip the assistant panel to its Notepad view by clicking the mode tab (shell.js owns the switch —
// the desk drives the same button a human would, no private back channel). Used after the desk writes
// a note so the fresh entry is on screen, not hidden behind the chat pane.
const revealNotepad = (): void => {
  const btn = (globalThis as unknown as { document?: { querySelector(s: string): { click(): void } | null } })
    .document?.querySelector('.assistant__modes [data-shell-mode="notepad"]');
  btn?.click();
};

// ---- cross-page lamp: the MPA loses JS state on navigation, so before navigating the desk STASHES
// what to do on arrival; the destination page's door replays it — a chat announce + a spotlight on
// the target surface, then release. The terminal narration already persists (localStorage), so the
// AI's "trip" reads as one continuous act across the page load. ----
const ARRIVE_KEY = "desk-arrival";
const arrive = (surface: string, announce: string): void => {
  try { ss()?.setItem(ARRIVE_KEY, JSON.stringify({ surface, announce })); } catch { /* no session storage */ }
};
async function runArrival(applyOp: (op: RenderOp) => void): Promise<void> {
  let plan: { surface?: string; announce?: string } | null = null;
  try {
    const raw = ss()?.getItem(ARRIVE_KEY);
    if (!raw) return;
    ss()?.removeItem(ARRIVE_KEY);
    plan = JSON.parse(raw);
  } catch { return; }
  if (!plan?.surface) return;
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
  await wait(450);                                   // let the destination page settle in
  // grain's own markup + op builders (reasoner-kit) — not hand-rolled HTML/op literals — so the
  // arrival announce can't drift from the exact chat-bubble shape the dispatcher renders elsewhere.
  if (plan.announce)
    applyOp({ target: "chat-log", op: "append", provenance: "ai", commit: "committed",
      html: grainKit.chatBubble("ai", "grain", grainKit.chatBody(grainKit.esc(plan.announce)), "Desk") });
  applyOp(grainKit.spotlightOp(plan.surface, { active: true }));   // the lamp lands on the destination
  await wait(1500);
  applyOp(grainKit.spotlightOp("screen", { active: false }));      // hand back to the visitor
}

/** The door the dispatcher composes (data-ai-door). grain marks presence ONLINE once this returns;
 *  the desk chat's own health rides the separate data-desk marker. */
export function createClientDoor(applyOp: (op: RenderOp) => void): InteractionLayer {
  // Up-front UX: if the model can't run here, hide the chat before the visitor ever types.
  probe().then((ok) => { if (!ok) markOffline(); }).catch(() => markOffline());

  // Navigate through GRAIN's own `navigate` RenderOp (kit.navigateOp → applyOp), not a bare
  // location.assign: it gets the SAME href validation (isSafeNavigateHref — navigateOp throws right
  // here on anything unsafe, before it can travel anywhere) and the SAME settle beat the dispatcher
  // gives every other AI-driven navigation (ai-dispatch.js's NAVIGATE_SETTLE_MS), instead of a
  // desk-only shortcut that bypasses both. A rejected href logs and does nothing (never navigates).
  const navigate = (url: string): void => {
    try { applyOp(grainKit.navigateOp("screen", url)); }
    catch (err) { console.error("[desk] refused an unsafe navigate href", url, err); }
  };

  const reasoner = makeDeskReasoner({
    profile,                                      // the device-chosen model + its tuning (weak 0.5B / strong 1.5B)
    probe,
    loadEngine,
    streamChat: grainChat.streamChat,             // grain's streaming transport (yields token deltas; break interrupts)
    loadKnowledge,
    fallback: grainReasoner.makeStubReasoner(),   // every non-chat verb (demo.run, say.*, item.archive)
    markOffline,
    kit: grainKit,                                // grain's chat markup builders (no fork)
    navigate, pageText, pageInfo, pageManifest, listNotes, loadCatalog, arrive, revealNav, revealNotepad,   // the desk drives the UI through these
  });
  // "New chat" (site.js) forgets the conversation + re-arms a degraded desk, without a page reload.
  (globalThis as unknown as { deskReset?: () => void }).deskReset = () => reasoner.reset();
  // If we arrived here from a desk navigation, resume the lamp on this page (cross-page continuity).
  // Read the arrival key BEFORE runArrival consumes it, so page-arrival awareness can skip a page the
  // desk itself drove us to (runArrival already announces there — no double greeting).
  const droveHere = (() => { try { return !!ss()?.getItem(ARRIVE_KEY); } catch { return false; } })();
  void runArrival(applyOp);
  // Page-arrival awareness (reasoner-driven): read the new page and offer a greeting + contextual
  // chips — but ONLY when the desk is already warm this session (site.js sets desk-warm on the first
  // chat.send) and the visitor navigated here themselves. Gated so a visitor who never opened the desk
  // is never forced to load the model just by navigating (this is an MPA: the engine reloads per page).
  const warm = (() => { try { return ss()?.getItem("desk-warm") === "1"; } catch { return false; } })();
  if (warm && !droveHere) void reasoner.arrive(applyOp);
  return grainDoor.createClientDoor(applyOp, { reasoner });
}
