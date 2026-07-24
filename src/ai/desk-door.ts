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
import { makeDeskReasoner, suggestChipsHtml, NAV_GLIDE_MS, MAIL_ARCHIVE_BEAT_MS, type DeskNote } from "./desk-reasoner.ts";
import { buildCatalog, type NavDest } from "./catalog.ts";
import type { Knowledge } from "./retrieval.ts";
import type { EngineProgress } from "@tjakoen/grain/ai/webllm.ts";
// A2 guided tour — the fixed stop list + the cursor codec (tour.ts). The door owns every leg of the
// tour AFTER the first (no chat.send happens between stops, so the reasoner isn't in the loop then).
import { TOUR_STOPS, TOUR_KEY, TOUR_DWELL_MS, tourCursor, stashTour } from "./tour.ts";
// B3 mail batch archive — matching the stashed RAW sender phrase against the REAL sender set once the
// cross-page task lands on /mail (never a model guess, law #2). Same matcher the reasoner's own
// on-page branch uses (desk-reasoner.ts), so the two runs can't disagree on what counts as a hit.
import { matchSender } from "./mail-sender.ts";

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

// A4 theme switching — read GRAIN's OWN theming vocabulary straight off <html> (theme.js's
// data-themes/data-theme/data-color-scheme), never a portfolio-side guess: the reasoner re-validates
// against this LIVE list before acting on anything (CLAUDE.md's design law — code enumerates route/
// flavor NAMES, but the live DOM is the truth a click gets checked against). matchMedia is the scheme
// fallback: no forced data-color-scheme means the page is following the OS.
interface ThemeHtmlEl { getAttribute(name: string): string | null }
const themeState = (): { themes: string[]; flavor: string; scheme: "dark" | "light" } => {
  const html = (globalThis as unknown as { document?: { documentElement?: ThemeHtmlEl } }).document?.documentElement;
  const themes = (html?.getAttribute("data-themes") ?? "").split(/\s+/).filter(Boolean);
  const flavor = html?.getAttribute("data-theme") || themes[0] || "";
  const forced = html?.getAttribute("data-color-scheme");
  const scheme: "dark" | "light" = forced === "dark" || forced === "light" ? forced
    : (globalThis as unknown as { matchMedia?: (q: string) => { matches: boolean } }).matchMedia?.("(prefers-color-scheme: dark)")?.matches
      ? "dark" : "light";
  return { themes, flavor, scheme };
};
// Click the visible status-bar theme controls (theme.js's own [data-cycle-theme]/[data-toggle-scheme])
// — the desk drives the SAME button a human would, no private channel (the revealNotepad pattern).
// False when the control isn't on this page, so the reasoner can decline honestly instead of a no-op.
interface ClickableEl { click(): void }
const clickCycleTheme = (): boolean => {
  const btn = (globalThis as unknown as { document?: { querySelector(s: string): ClickableEl | null } })
    .document?.querySelector("[data-cycle-theme]");
  btn?.click();
  return !!btn;
};
const clickToggleScheme = (): boolean => {
  const btn = (globalThis as unknown as { document?: { querySelector(s: string): ClickableEl | null } })
    .document?.querySelector("[data-toggle-scheme]");
  btn?.click();
  return !!btn;
};

// B2 notes filtering ("show me notes about teaching") — drive the SAME tag-chip checkboxes a human
// would tap (content.ts renderNotesFeedPage's [data-feed-controls] island), the revealNotepad pattern
// (the real control, no private channel), validated live both before and after — same honesty contract
// as the A4 theme deps just above. `[data-feed-controls]` only exists on /notes, so every read here is
// naturally empty/false off that page; the reasoner checks pageInfo().route first regardless.
interface CheckboxEl extends ClickableEl { value: string; checked: boolean; closest(sel: string): { hidden?: boolean } | null }
// The chip boxes are found by ITERATING the checkbox list and comparing `.value` in JS — never by
// interpolating the tag into an attribute selector. A selector build would need CSS.escape (absent
// on file:// / old browsers), and its raw-value fallback makes querySelector THROW on any quote in a
// tag; a plain === compare has no such failure mode, and the list is a dozen chips at most.
const notesTagBoxes = (): CheckboxEl[] =>
  Array.from((globalThis as unknown as { document?: { querySelectorAll(s: string): CheckboxEl[] } })
    .document?.querySelectorAll('[data-feed-controls] input[type="checkbox"]') ?? []);
const notesTagChips = (): string[] => notesTagBoxes().map((b) => b.value);
const clickNotesTag = (tag: string): boolean => {
  const box = notesTagBoxes().find((b) => b.value === tag);
  if (!box) return false;
  // the chip may be tucked behind the "+N more" overflow toggle — open it FIRST so the visitor SEES
  // the chip the desk is about to check (the same "drive what's visible" law the A4 clicks follow).
  const rest = box.closest("[data-tags-rest]");
  if (rest?.hidden) {
    (globalThis as unknown as { document?: { querySelector(s: string): ClickableEl | null } })
      .document?.querySelector("[data-tags-more]")?.click();
  }
  box.click();
  return box.checked === true;   // confirm the click actually landed (validate twice)
};
const visibleNoteCount = (): number =>
  (globalThis as unknown as { document?: { querySelectorAll(s: string): { length: number } } })
    .document?.querySelectorAll(".note-card:not([hidden])").length ?? 0;

// B3 mail batch archive ("archive everything from BREAD CI") — drive the SAME row link + reader
// Archive button a human would click on /mail (the mailbox island's contract: `a.mailbox__item` rows
// carry data-folder/data-surface/href="#msg-<id>", each reader is `#msg-<id>` and carries a
// `[data-mail-archive]` button enabled only on an inbox message), the revealNotepad/A4/B2 pattern (the
// real controls, no private channel), validated live both before choosing what to click and after.
// `a.mailbox__item` only exists on /mail, so every read here is naturally empty off that page; the
// reasoner checks pageInfo().route first regardless.
interface MailRowEl {
  getAttribute(name: string): string | null;
  click(): void;
  querySelector(sel: string): { textContent?: string | null } | null;
}
interface MailReaderEl { querySelector(sel: string): ClickableEl | null }
// The rows are found by ITERATING `a.mailbox__item` and comparing attributes/text in JS — never by
// interpolating a sender or id into an attribute selector (notesTagBoxes's own reasoning above: no
// CSS.escape on file:// / old browsers, and a plain === compare has no quote-injection failure mode).
const mailRows = (): MailRowEl[] =>
  Array.from((globalThis as unknown as { document?: { querySelectorAll(s: string): MailRowEl[] } })
    .document?.querySelectorAll("a.mailbox__item") ?? []);
// EVERY row's sender, not just the inbox's: a sender whose mail was all just archived must still
// MATCH on a re-ask, so the reasoner can answer the honest "Nothing from X left in the inbox" instead
// of pretending the sender never existed (mailItemsFrom below keeps the inbox-only filter — matching
// and having-work-to-do are different questions).
const mailSenders = (): string[] => {
  const out: string[] = [];
  for (const row of mailRows()) {
    const from = row.querySelector(".mailbox__item-from")?.textContent?.trim();
    if (from && !out.includes(from)) out.push(from);
  }
  return out;
};
const mailItemsFrom = (sender: string): { id: string; subject: string; surface: string }[] => {
  const out: { id: string; subject: string; surface: string }[] = [];
  for (const row of mailRows()) {
    if (row.getAttribute("data-folder") !== "inbox") continue;
    const from = row.querySelector(".mailbox__item-from")?.textContent?.trim();
    if (from !== sender) continue;
    const id = (row.getAttribute("href") ?? "").replace(/^#msg-/, "");
    if (!id) continue;
    const subject = row.querySelector(".mailbox__item-subject")?.textContent?.trim() ?? "";
    const surface = row.getAttribute("data-surface") ?? `item:mail-${id}`;
    out.push({ id, subject, surface });
  }
  return out;
};
// Click the row (finds it by its href, never a formatted selector), then its reader's Archive button —
// then re-read the ROW'S OWN data-folder to confirm the click actually landed (validate twice, the
// A4/B2 honesty contract). `id`'s only external source is mailItemsFrom above, itself parsed straight
// off a live href, so there's no interpolation risk here either.
const archiveMailItem = (id: string): boolean => {
  const d = (globalThis as unknown as {
    document?: { querySelectorAll(s: string): MailRowEl[]; getElementById(elId: string): MailReaderEl | null };
  }).document;
  // Array.from FIRST: querySelectorAll hands back a NodeList, which iterates but has no .find —
  // calling it directly throws mid-batch (mailRows above wraps for the same reason).
  const row = Array.from(d?.querySelectorAll("a.mailbox__item") ?? []).find((r) => r.getAttribute("href") === `#msg-${id}`);
  row?.click();                                                       // opens the reader
  d?.getElementById(`msg-${id}`)?.querySelector("[data-mail-archive]")?.click();
  return row?.getAttribute("data-folder") === "archive";
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

// ---- A2 guided tour: the cursor rides sessionStorage the same way ARRIVE_KEY does above, but it
// SURVIVES past one arrival (a multi-hop walk, not a single resume) — the reasoner (desk-reasoner.ts)
// stashes it before driving the FIRST leg; this door drives every leg after, because no chat.send
// happens between stops — the door itself is what's still "awake" when the dwell timer ends. ----
const tourSet = (at: number): void => { try { ss()?.setItem(TOUR_KEY, stashTour(at)); } catch { /* no session storage */ } };
const tourClear = (): void => { try { ss()?.removeItem(TOUR_KEY); } catch { /* no session storage */ } };
const tourActive = (): boolean => { try { return !!ss()?.getItem(TOUR_KEY); } catch { return false; } };

// Trailing-slash-insensitive route compare (also in desk-reasoner.ts — a local copy here rather than
// a cross-module import, since it's a one-liner and this file already keeps its own small DOM shims).
const stripSlash = (r: string): string => r.replace(/\/+$/, "") || "/";

// ---- B3 mail batch archive: a cross-page batch, same ARRIVE_KEY/TOUR_KEY shape — the MPA loses this
// reasoner instance on navigate, so the RAW sender phrase rides sessionStorage across the page load and
// runMailTask (below) picks it up once /mail settles. ----
const MAIL_TASK_KEY = "desk-mail-task";
const mailTaskSet = (sender: string): void => { try { ss()?.setItem(MAIL_TASK_KEY, JSON.stringify({ sender })); } catch { /* no session storage */ } };
// Same joinPhrases shape as desk-reasoner.ts's own (not exported there — a one-liner, kept local here
// exactly like this file's own stripSlash copy just above).
const joinPhrases = (xs: string[]): string =>
  xs.length <= 1 ? (xs[0] ?? "") : `${xs.slice(0, -1).join(", ")} or ${xs[xs.length - 1]}`;

// ---- C1 visitor-intent onboarding: sessionStorage-backed, same try/catch-around-ss() shape as the
// tour deps above. INTENT_KEY holds the answer (one key, per the roadmap); INTENT_ASKED_KEY is the
// nag-guard — has the ask already fired this session, regardless of whether it was ever answered. ----
const INTENT_KEY = "visitor-intent";
const INTENT_ASKED_KEY = "desk-intent-asked";
type VisitorIntent = "recruiter" | "developer" | "student";
const intentGet = (): VisitorIntent | null => {
  try {
    const v = ss()?.getItem(INTENT_KEY);
    return v === "recruiter" || v === "developer" || v === "student" ? v : null;
  } catch { return null; }
};
const intentSet = (intent: VisitorIntent): void => { try { ss()?.setItem(INTENT_KEY, intent); } catch { /* no session storage */ } };
const intentAsked = (): boolean => { try { return ss()?.getItem(INTENT_ASKED_KEY) === "1"; } catch { return false; } };
const intentMarkAsked = (): void => { try { ss()?.setItem(INTENT_ASKED_KEY, "1"); } catch { /* no session storage */ } };

/** Continue an in-flight tour after a navigation lands. Runs AFTER runArrival (which already replayed
 *  this stop's announce + spotlight via the ARRIVE_KEY stash) — this only decides whether the tour
 *  keeps going. Mirrors the reasoner's OWN travelAndNavigate choreography (narrate → reveal → spotlight
 *  + click → stash the next arrival → glide → navigate) on purpose: an intermediate hop needs to read
 *  as the same continuous act as the first one, just triggered from here instead of a chat.send.
 *  `doNavigate` is createClientDoor's own `navigate` (grain's validated navigateOp path) — passed in
 *  rather than duplicated, since this function lives at module scope, outside that closure. */
async function runTourLeg(applyOp: (op: RenderOp) => void, doNavigate: (url: string) => void): Promise<void> {
  let cursor: { at: number } | null;
  try { cursor = tourCursor(ss()?.getItem(TOUR_KEY) ?? null); } catch { return; }
  if (!cursor) return;                              // no tour running — nothing to continue
  const stop = TOUR_STOPS[cursor.at];
  if (!stop) { tourClear(); return; }                // a stale/out-of-range cursor — shouldn't parse this far, but bail clean
  // The visitor wandered off on their own (clicked a link mid-tour, or this is a stale cursor from an
  // earlier session) — only continue a tour that's actually still standing where it left off.
  if (stripSlash(loc()?.pathname ?? "/") !== stripSlash(stop.route)) { tourClear(); return; }

  const isLast = cursor.at === TOUR_STOPS.length - 1;
  if (isLast) {
    tourClear();   // the tour is over — the closing line already arrived via this stop's own announce
    applyOp({ target: "suggest-chips", op: "replace", provenance: "ai", commit: "committed",
      html: suggestChipsHtml(["Show me the latest note", "What is GRAIN?"]) });
    return;
  }

  // An intermediate stop: show the one visible "get out" affordance (pin: false — just this one chip,
  // not the always-present "What can I do here?" alongside it), then let the visitor actually read the
  // announce for TOUR_DWELL_MS before the lamp moves on.
  applyOp({ target: "suggest-chips", op: "replace", provenance: "ai", commit: "committed",
    html: suggestChipsHtml(["Stop the tour"], false) });
  await new Promise<void>((r) => setTimeout(r, TOUR_DWELL_MS));

  // Re-read the cursor: a chat.send during the dwell (the reasoner's tourClear, "type anything to
  // stop") cancels the pending advance. Gone, or moved on by some other path — abort silently either
  // way; whoever changed it already owns whatever happens next.
  let recheck: { at: number } | null;
  try { recheck = tourCursor(ss()?.getItem(TOUR_KEY) ?? null); } catch { return; }
  if (!recheck || recheck.at !== cursor.at) return;

  const next = cursor.at + 1;
  const dest = TOUR_STOPS[next]!;
  applyOp(grainKit.narrateOp("clicks", dest.label));
  revealNav(dest.navLink);
  applyOp(grainKit.spotlightOp(`nav:${dest.navLink}`, { active: true, click: true }));
  tourSet(next);                                    // stash BEFORE navigating (the navigate tears the page down)
  arrive("screen", dest.announce);                  // replayed by runArrival on the destination page
  await new Promise<void>((r) => setTimeout(r, NAV_GLIDE_MS));   // the same glide the reasoner's own travelAndNavigate uses
  doNavigate(dest.route);
}

/** Run a stashed B3 mail-archive task once it lands on /mail. Consume-once (read + REMOVE the key,
 *  like runArrival's ARRIVE_KEY) so a stale task can never re-fire on a later, unrelated /mail visit.
 *  This is the door's OWN honesty contract, not the reasoner's: the reasoner instance that stashed the
 *  task doesn't survive the navigate (the MPA tears the page down), so this function re-runs the exact
 *  same matchSender → mailItemsFrom → archiveMailItem sequence the on-page branch would, using the SAME
 *  MAIL_ARCHIVE_BEAT_MS pace (imported from desk-reasoner.ts) so the two choreographies can't drift. */
async function runMailTask(applyOp: (op: RenderOp) => void): Promise<void> {
  let stashed: { sender?: string } | null = null;
  try {
    const raw = ss()?.getItem(MAIL_TASK_KEY);
    if (!raw) return;
    ss()?.removeItem(MAIL_TASK_KEY);
    stashed = JSON.parse(raw);
  } catch { return; }
  if (!stashed?.sender) return;
  if (stripSlash(loc()?.pathname ?? "/") !== "/mail") return;   // wandered elsewhere — bail, don't chase

  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
  await wait(450);                                   // let the mailbox island settle in, arrival's own beat

  // Same grain-op-builder announce idiom as runArrival's own chat bubble above — not hand-rolled markup.
  const announce = (text: string): void => {
    applyOp({ target: "chat-log", op: "append", provenance: "ai", commit: "committed",
      html: grainKit.chatBubble("ai", "grain", grainKit.chatBody(grainKit.esc(text)), "Desk") });
  };

  const senders = mailSenders();
  const matched = matchSender(stashed.sender, senders);
  if (!matched) {
    announce(senders.length
      ? `I don't see any mail from "${stashed.sender}" in the inbox — the senders here are ${joinPhrases(senders)}.`
      : `I don't see any mail from "${stashed.sender}" — there's nothing left in the inbox.`);
    return;
  }
  const items = mailItemsFrom(matched);
  if (!items.length) {
    announce(`Nothing from ${matched} left in the inbox.`);
    return;
  }

  applyOp(grainKit.narrateOp("archives", `the mail from ${matched}`));
  const landed: string[] = [];
  for (const item of items) {
    applyOp(grainKit.spotlightOp(item.surface, { active: true, click: true }));
    await wait(MAIL_ARCHIVE_BEAT_MS);   // let the visitor SEE each letter go, same knob the reasoner uses
    if (archiveMailItem(item.id)) landed.push(item.id);
  }
  applyOp(grainKit.spotlightOp("screen", { active: false }));

  if (!landed.length) {
    announce("Hmm, that didn't take. Try the Archive button in the reader.");
    return;
  }
  const n = landed.length;
  const countBit = n === items.length ? `${n}` : `${n} of ${items.length}`;
  announce(`Archived ${countBit} letter${n === 1 ? "" : "s"} from ${matched}. They're in the Archive folder now.`);
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
    tourSet, tourClear, tourActive,   // A2 guided tour: the reasoner's first leg + the "type anything to stop" cancel
    themeState, clickCycleTheme, clickToggleScheme,   // A4 theme switching: read + drive theme.js's visible controls
    notesTagChips, clickNotesTag, visibleNoteCount,   // B2 notes filtering: read + drive the /notes tag chips
    mailSenders, mailItemsFrom, archiveMailItem, mailTaskSet,   // B3 mail batch archive: read + drive the /mail rows + reader
    intentGet, intentSet, intentAsked, intentMarkAsked,   // C1 visitor-intent onboarding: session state
  });
  // "New chat" (site.js) forgets the conversation + re-arms a degraded desk, without a page reload.
  (globalThis as unknown as { deskReset?: () => void }).deskReset = () => reasoner.reset();
  // If we arrived here from a desk navigation, resume the lamp on this page (cross-page continuity).
  // Read the arrival key BEFORE runArrival consumes it, so page-arrival awareness can skip a page the
  // desk itself drove us to (runArrival already announces there — no double greeting).
  const droveHere = (() => { try { return !!ss()?.getItem(ARRIVE_KEY); } catch { return false; } })();
  // A2: once the arrival replay settles, let a tour that's mid-walk continue its next leg.
  // B3: once that settles too, run any stashed cross-page mail-archive task (a no-op off /mail or with
  // nothing stashed) — chained last since it's the newest hop in this same "resume what the desk was
  // doing" sequence.
  void runArrival(applyOp).then(() => runTourLeg(applyOp, navigate)).then(() => runMailTask(applyOp));
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
