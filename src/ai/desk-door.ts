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
import { WEAK_PROFILE, type ModelProfile } from "./webllm-loader.ts";
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
// A1 deep-link answers add one more shape here: an element that can scrollIntoView (getElementById
// only needs to find + scroll it — no other DOM surface is touched).
interface ScrollableEl { scrollIntoView(opts?: { behavior?: string; block?: string }): void }
interface MinimalDoc {
  body?: { dataset: Record<string, string> };
  title?: string;
  querySelector?(sel: string): { textContent?: string | null } | null;
  getElementById?(id: string): ScrollableEl | null;
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

// ONE device probe at module load, used only for the up-front WebGPU/memory gate below (grain owns the
// probe). The model choice is no longer device-derived: the demo runs a single model (the weak 0.5B),
// so there's nothing to tier — the probe just decides whether ANY model can load here.
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
// The one model the desk runs. The 1.5B tier, the device-tiering, and the `?tier=` dev knob were all
// removed 2026-07 — the demo is a single weak 0.5B, so there's nothing to pick and nothing to fall
// back to (a failed load just degrades to offline, in ensureEngine).
const profile = WEAK_PROFILE;
const probe = (): Promise<boolean> => Promise.resolve(canRun);

// Load a GIVEN profile's model through grain's transport: grain owns the CDN import + warm-up, the desk
// supplies WHICH model (profile.id) + its context window and forwards download progress to the load bar.
// Takes the profile so the reasoner can retry with the fallback profile after a failed load.
const loadEngine = (p: ModelProfile, onProgress: (progress: EngineProgress) => void) =>
  grainWebllm.loadEngine({ modelId: p.id, onProgress, contextWindow: p.contextWindow });

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

// A1 "show me the part about X" (deep-link answers): scroll the CURRENT page to a rendered heading id.
// MILL renders every h2/h3 with `id="{anchor}"` (the Chunk.anchor contract) — a plain getElementById +
// scrollIntoView, no framework hook needed. True when the element existed, so the reasoner can
// tell a real jump from a stale/mismatched anchor (and settle on the typed line alone either way).
// `behavior` matters: an ANIMATED scroll in flight is cancelled by any other programmatic scroll,
// and a fresh page load has several (the chat-log restore, site.js's tab-bar scrollIntoView). "auto"
// is no escape — .app-shell__main sets `scroll-behavior: smooth` in CSS, so "auto" animates too
// (measured: the arrival scroll died at scrollTop 0). Only "instant" bypasses the CSS and lands
// uncancellably — exactly what a native #fragment landing does — so the cross-page arrival path uses
// it, and the same-page path (no load in progress) keeps the visible smooth glide.
const scrollToAnchor = (anchor: string, behavior: "smooth" | "instant" = "smooth"): boolean => {
  const el = doc()?.getElementById?.(anchor);
  if (!el) return false;
  el.scrollIntoView({ behavior, block: "start" });
  return true;
};

// ---- cross-page lamp: the MPA loses JS state on navigation, so before navigating the desk STASHES
// what to do on arrival; the destination page's door replays it — a chat announce + a spotlight on
// the target surface, then release. The terminal narration already persists (localStorage), so the
// AI's "trip" reads as one continuous act across the page load. ----
const ARRIVE_KEY = "desk-arrival";
// `anchor` is set only by the A1 deep-link path (desk-reasoner.ts) — a section elsewhere on the site,
// not just a page — so runArrival below can scroll to it before the spotlight lands.
const arrive = (surface: string, announce: string, anchor?: string): void => {
  try { ss()?.setItem(ARRIVE_KEY, JSON.stringify({ surface, announce, anchor })); } catch { /* no session storage */ }
};
async function runArrival(applyOp: (op: RenderOp) => void): Promise<void> {
  let plan: { surface?: string; announce?: string; anchor?: string } | null = null;
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
  // A1: scroll AFTER the spotlight — activating the lamp raises the shell's acting chrome, and a
  // scroll measured before that layout settles lands short (~158px, measured). "instant" because a
  // load-time animated scroll gets cancelled (see scrollToAnchor); the lamp follows its surface
  // through the scroll (ai-spotlight.js), so it ends up on the now-visible section.
  if (plan.anchor) { await wait(120); scrollToAnchor(plan.anchor, "instant"); await wait(280); }
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
    profile,                                      // the one model + its tuning (weak 0.5B)
    probe,
    loadEngine,
    streamChat: grainChat.streamChat,             // grain's streaming transport (yields token deltas; break interrupts)
    loadKnowledge,
    fallback: grainReasoner.makeStubReasoner(),   // every non-chat verb (demo.run, say.*, item.archive)
    markOffline,
    kit: grainKit,                                // grain's chat markup builders (no fork)
    navigate, pageText, pageInfo, pageManifest, listNotes, loadCatalog, arrive, revealNav, revealNotepad,   // the desk drives the UI through these
    scrollToAnchor,   // A1 deep-link answers: scroll THIS page to a rendered heading id (see desk-reasoner.ts)
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
  // No model picker: the demo runs a single 0.5B (see the model choice up top), so the desk just loads
  // it on the first message — nothing to choose, no download size to weigh.
  return grainDoor.createClientDoor(applyOp, { reasoner });
}
