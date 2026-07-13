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
import { webgpuAvailable, loadEngine } from "./webllm-loader.ts";
import { makeDeskReasoner, type DeskNote } from "./desk-reasoner.ts";
import type { Knowledge } from "./retrieval.ts";

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

// One WebGPU probe, shared by the up-front UX check and the reasoner's engine load.
let probeP: Promise<boolean> | null = null;
const probe = (): Promise<boolean> => (probeP ??= webgpuAvailable());

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

// ---- the desk's UI-driving capabilities (the DOM/nav contact point) ----
const pageText = (): string => doc()?.querySelector?.(".app-shell__main")?.textContent?.trim() ?? "";
const pageInfo = (): { route: string; title: string } => ({ route: loc()?.pathname ?? "/", title: doc()?.title ?? "" });
// GRAIN's own live-DOM manifest of what's operable on this page (for "what can I do here?"). The
// real `document` satisfies grain's structural DomDoc (body + querySelectorAll).
const liveDoc = (): DomDoc => (globalThis as unknown as { document?: DomDoc }).document as DomDoc;
const pageManifest = (): Manifest => grainManifest.domManifest(liveDoc());
// The SAME manifest, as prompt-ready prose (grain's manifestForReasoner) — the desk-reasoner pulls
// the "nav:<route>" lines out of this to tell a real model what it can navigate to (Tier-2 nav).
const pageManifestText = (): string => grainManifest.manifestForReasoner(liveDoc());
// Open any collapsed file-tree folder above a nav link, so the lamp can travel to a VISIBLE target
// before the desk "clicks" it (the bread-stack folder ships collapsed).
interface NavEl { tagName: string; open?: boolean; parentElement: NavEl | null }
const revealNav = (route: string): void => {
  const d = (globalThis as unknown as { document?: { querySelector(s: string): NavEl | null } }).document;
  let el: NavEl | null = d?.querySelector(`[data-surface="nav:${route}"]`) ?? null;
  while (el) { if (el.tagName === "DETAILS") el.open = true; el = el.parentElement; }
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
    probe,
    loadEngine,
    loadKnowledge,
    fallback: grainReasoner.makeStubReasoner(),   // every non-chat verb (demo.run, say.*, item.archive)
    markOffline,
    kit: grainKit,                                // grain's chat markup builders (no fork)
    navigate, pageText, pageInfo, pageManifest, pageManifestText, listNotes, arrive, revealNav,   // the desk drives the UI through these
  });
  // "New chat" (site.js) forgets the conversation + re-arms a degraded desk, without a page reload.
  (globalThis as unknown as { deskReset?: () => void }).deskReset = () => reasoner.reset();
  // If we arrived here from a desk navigation, resume the lamp on this page (cross-page continuity).
  void runArrival(applyOp);
  return grainDoor.createClientDoor(applyOp, { reasoner });
}
