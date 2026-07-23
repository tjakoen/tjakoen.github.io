// portfolio/ai/desk-reasoner.ts — the DESK's reasoner: a real local model behind GRAIN's Reasoner
// contract (the seam grain/ai/client-door.ts documents). It replaces the stub for chat ONLY; every
// other verb (demo.run, say.*, item.archive) delegates to the injected stub untouched.
//
// It is a PURE, injectable unit — probe / loadEngine / loadKnowledge / markOffline / fallback all
// arrive as deps, so it unit-tests with a fake engine and no browser. The one CDN/DOM contact lives
// in webllm-loader.ts (loadEngine) and the door (markOffline); nothing here imports either at runtime.
//
// REQUIREMENT (2026-07-13): when the local model can't run — no WebGPU, or a load/generation failure
// — the desk does NOT fall back to the stub for chat. It marks the chat OFFLINE (deps.markOffline,
// which sets the portfolio's data-desk marker → CSS hides the composer + chips and shows a "Desk
// Offline" note) and settles an honest line. The stub answers non-chat verbs only.

import type { Reasoner, ReasonTools } from "@tjakoen/grain/ai/reasoner.ts";
import type { Intent, Decision, RenderOp } from "@tjakoen/grain/ai/contract.ts";
import { buildPrompt, type ChatMessage } from "./prompt.ts";
import { retrieve, type Knowledge } from "./retrieval.ts";
import type { DeskEngine, EngineProgress, ModelProfile } from "./webllm-loader.ts";
import type { ChatStreamOptions } from "@tjakoen/grain/ai/model-chat.ts";
import { routeAction, PINNED_CHIP, ACTION_CHIPS } from "./actions.ts";
import { resolveNav, navShortlist, type NavDest } from "./catalog.ts";
// GRAIN's reasoner-kit — the chat bubble markup the desk USED to fork now comes from here (injected
// as deps.kit at runtime; the door URL-imports it). Type-only import (erased) so this stays a
// client-safe module. See grain/ai/reasoner-kit.ts.
import type * as Kit from "@tjakoen/grain/ai/reasoner-kit.ts";
import type { Manifest } from "@tjakoen/grain/ai/manifest.ts";

/** A note the desk can open ("show the latest blog") — newest-first from /notes.json. */
export interface DeskNote { slug: string; title: string; route: string }

// Friendly phrasing for what GRAIN reports as operable on THIS page (read from domManifest, never
// hardcoded). The generic `screen`/`chat-log` targets exist on every page (vocabulary-level), so the
// caller skips them; these are the genuinely page-specific affordances.
const VERB_PHRASE: Record<string, string> = {
  "item.archive": "archive a task",
  "say.set": "note something to the reflection",
  "say.stream": "ask for a quick reflection",
  "demo.run": "watch the desk act out a live demo",
};
function pageOperables(manifest: Manifest): string[] {
  const verbs = new Set<string>();
  for (const t of manifest.targets) {
    if (t.kind === "screen" || t.kind === "chat-log") continue;   // generic / the desk itself
    for (const v of t.accepts) verbs.add(v);
  }
  const out: string[] = [];
  for (const v of verbs) { const p = VERB_PHRASE[v]; if (p) out.push(p); }
  return out;
}
const joinPhrases = (xs: string[]): string =>
  xs.length <= 1 ? (xs[0] ?? "") : `${xs.slice(0, -1).join(", ")} or ${xs[xs.length - 1]}`;

// The model's own navigation choice, per the NAVIGATE:<route> protocol prompt.ts offers it (scoped to
// the real sitemap-catalog shortlist — see navBlock in prompt.ts). Matched loosely (case-insensitive,
// trims stray whitespace) since a 0.5B doesn't always hit a format byte-exact; the chosen route is then
// validated against the real catalog before we act on it.
const MODEL_NAVIGATE_RE = /^navigate:\s*(\/\S*)\s*$/i;

// The model's own clarifying-question choice, per the CHOICES:<question> | <opt> | <opt> protocol
// prompt.ts offers it. The 0.5B is loose, so parse defensively: pipe-split, trim, drop blanks, cap.
// Returns null unless there's a question AND 2–5 usable options (a lone or over-long list is a miss).
const MODEL_CHOICES_RE = /^choices:\s*(.+)$/is;
export function parseModelChoices(raw: string): { prompt: string; choices: { label: string; value: string }[] } | null {
  const m = MODEL_CHOICES_RE.exec(raw.trim());
  if (!m) return null;
  const parts = m[1]!.split("|").map((s) => s.replace(/\s+/g, " ").trim()).filter(Boolean);
  const prompt = parts.shift() ?? "";
  const opts = parts.slice(0, 5).filter((s) => s.length <= 48);
  if (!prompt || opts.length < 2) return null;
  return { prompt, choices: opts.map((label) => ({ label, value: label })) };
}

/** The Reasoner plus a client-only reset — the door hangs this on window.deskReset ("New chat"). */
export interface DeskReasoner extends Reasoner {
  /** Forget the conversation (and re-arm a degraded desk to retry loading). Keeps a healthy engine. */
  reset(): void;
  /** Page-arrival awareness: on landing, read the page and offer a one-line greeting + contextual
   *  chips. The DOOR calls this (with its applyOp) on load, gated on the desk being warm. No-op when
   *  offline or the page has no readable text. */
  arrive(applyOp: (op: RenderOp) => void): Promise<void>;
}

// Parse the 0.5B's arrival reply: one greeting line, then a `CHIPS: a | b | c` line. Defensive — a
// small model doesn't always hit the format, so a bad parse yields an empty greeting/chips (the
// caller then no-ops or leaves the static starter chips in place).
export function parseArrival(raw: string): { greeting: string; chips: string[] } {
  const text = raw.trim();
  const idx = text.search(/chips\s*:/i);
  const greetPart = (idx >= 0 ? text.slice(0, idx) : text).trim();
  const firstLine = greetPart.split("\n").map((s) => s.trim()).filter(Boolean)[0] ?? "";
  const greeting = (firstLine.split(/(?<=[.!?])\s/)[0] ?? "").slice(0, 160).trim();
  let chips: string[] = [];
  if (idx >= 0) {
    chips = text.slice(idx).replace(/chips\s*:/i, "")
      .split(/[|\n]/).map((s) => s.replace(/^[-*\d.\s]+/, "").trim())
      .filter((s) => s.length > 0 && s.length <= 40).slice(0, 3);
  }
  return { greeting, chips };
}

const OFFLINE_LINE =
  "The desk runs a small AI model in your browser, and this browser can't run it, so the desk is offline. Everything else on the site works as usual.";

// How long the lamp lingers on a clicked nav link before the page actually tears down — the desk's
// OWN "let the click read before we leave" beat, tuned down from 950ms (too slow — 2026-07-13 owner
// call). SEPARATE from grain's own NAVIGATE_SETTLE_MS (ai-dispatch.js, 220ms): that one guards the
// navigate RenderOp itself (any settle in flight gets a beat to finish); this one is the desk's own
// choreography BEFORE it ever emits that op. Named per grain CLAUDE.md lesson #9 — a knob with no
// name can't be found, let alone tuned twice.
const NAV_GLIDE_MS = 550;

export interface DeskDeps {
  /** The active model profile (webllm-loader.ts) — the model id's tuning: generation caps, penalties,
   *  the prompt budget, and the load-bar copy. desk-door picks it from grain's device probe and injects
   *  it, so every size-dependent knob below flows from ONE choice (weak 0.5B vs. strong 1.5B). This is
   *  the STARTING profile; the reasoner may drop to `fallbackProfile` if it fails to load. */
  profile: ModelProfile;
  /** The lighter profile to retry with if `profile` fails to load (commonly an OOM on a device tiered
   *  up too far). Undefined when `profile` is already the weakest — nothing lighter to fall back to. */
  fallbackProfile?: ModelProfile;
  /** WebGPU (+ memory) available? */
  probe: () => Promise<boolean>;
  /** Load + warm the engine for a GIVEN profile, reporting download progress. Takes the profile (not a
   *  baked-in id) so the reasoner can retry with the fallback profile after a failed load. */
  loadEngine: (profile: ModelProfile, onProgress: (p: EngineProgress) => void) => Promise<DeskEngine>;
  /** GRAIN's streaming chat transport (`@tjakoen/grain/ai/model-chat.ts` streamChat) — yields content
   *  token deltas; BREAKING the `for await` (a stop, the loop-guard) interrupts generation for us, so
   *  the desk never touches `interruptGenerate` directly. Injected because the browser refuses a bare
   *  grain import (the door URL-imports it); tests pass grain's real one. */
  streamChat: (engine: DeskEngine, messages: ChatMessage[], opts?: ChatStreamOptions) => AsyncIterable<string>;
  /** Fetch (and ideally memoize) the build-time corpus. */
  loadKnowledge: () => Promise<Knowledge>;
  /** GRAIN's stub — handles every NON-chat verb. */
  fallback: Reasoner;
  /** Mark the chat offline (portfolio-owned: sets data-desk="offline" → hides composer + chips). */
  markOffline: () => void;
  /** GRAIN's reasoner-kit (chat markup builders) — injected so the desk composes grain's exact
   *  bubbles instead of forking them. The door URL-imports it; tests pass the real module. */
  kit: typeof Kit;
  // ---- action capabilities (client-only; the desk drives the UI through these). Optional so the
  // reasoner still unit-tests headless and a bare chat setup works without them. ----
  /** Navigate the browser to a route (full page load — the MPA's one nav). */
  navigate?: (url: string) => void;
  /** The current page's readable content, for "summarize this page". */
  pageText?: () => string;
  /** The current page's route + title, for capabilities phrasing. */
  pageInfo?: () => { route: string; title: string };
  /** GRAIN's live-DOM manifest (domManifest) — what's operable on THIS page, honestly derived from
   *  the registry, so "what can I do here?" reads grain's own description instead of a hardcoded list. */
  pageManifest?: () => Manifest;
  /** Newest-first notes (from /notes.json), for "open the latest note". */
  listNotes?: () => Promise<DeskNote[]>;
  /** The site's navigable-destination catalog (catalog.ts), built from the live sitemap + titles.
   *  Drives BOTH deterministic navigation (resolveNav, no model needed) and the model's real-route
   *  shortlist for the fuzzy tail. Memoized by the door; omitted → navigation falls straight to chat. */
  loadCatalog?: () => Promise<NavDest[]>;
  /** Stash a "spotlight + announce on arrival" so the lamp RESUMES on the destination page after a
   *  navigation (the MPA loses JS state; the door replays this on load). */
  arrive?: (surface: string, announce: string) => void;
  /** Open the collapsed file-tree folder above a nav link, so the lamp can travel to a visible target. */
  revealNav?: (route: string) => void;
  /** Flip the assistant panel to its Notepad view (clicks the [data-shell-mode="notepad"] tab), so a
   *  note the desk just wrote is visible immediately instead of only after the visitor opens the pad. */
  revealNotepad?: () => void;
}

// Chat bubble markup now comes from GRAIN's reasoner-kit (deps.kit) — not forked here. This local
// `esc` is only for the portfolio's OWN chip labels (suggestChipsHtml below), which are portfolio
// UI, not grain chat markup.
const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Follow-up chips. A 0.5B writes poor questions and raw chunk headings read like fragments, so the
// suggestions come from a HAND-CURATED pool of good, answerable prompts — filtered against what was
// already asked this session so they stay fresh. Reliable + always readable.
const FOLLOWUP_POOL = [
  "What is GRAIN?", "What is BREAD?", "Who is TJ?", "How is this site built?",
  "Why teach with AI?", "What does MILL do?", "Show me the latest note",
];
function pickFollowups(asked: string, history: ChatMessage[], k = 3): string[] {
  const seen = new Set([asked.trim().toLowerCase(), ...history.map((m) => m.content.trim().toLowerCase())]);
  const out: string[] = [];
  for (const q of FOLLOWUP_POOL) {
    if (seen.has(q.toLowerCase())) continue;
    out.push(q);
    if (out.length >= k) break;
  }
  return out;
}

// An always-on "thinking" indicator so the desk bubble is NEVER blank while it works (the pause
// before the model answers, or while a deterministic action runs). Trusted markup, styled by CSS.
const THINKING = '<span class="desk-typing" aria-label="Thinking">Thinking<i></i><i></i><i></i></span>';

// The model-load progress, as a real progress bar in the desk bubble (raw markup — no user input —
// styled by portfolio-frame.css .desk-load). Honest about the one-time download cost; the label + size
// note come from the active profile (webllm-loader.ts) so a bigger model reports its bigger download.
const loadBar = (pct: number, label: string, note: string): string =>
  `<span class="desk-load"><span class="desk-load__title">Loading ${label}. ${note}</span>` +
  `<span class="desk-load__bar" aria-hidden="true"><span class="desk-load__fill" style="width:${pct}%"></span></span>` +
  `<span class="desk-load__pct">${pct}%</span></span>`;

// The chip row markup the desk replaces [data-surface="suggest-chips"] with. Same button shape
// site.js builds (class + data-suggest-ask), so site.js's delegated click handler fires them; the
// container keeps its data-surface so a later turn can replace it again.
const suggestChipsHtml = (list: string[]): string => {
  // Always pin "What can I do here?" first (the showcase's always-present chip), then the given set
  // (de-duped against the pin).
  const chips = [PINNED_CHIP, ...list.filter((s) => s.toLowerCase() !== PINNED_CHIP.toLowerCase())];
  return `<div class="assistant__suggest-chips" data-suggest-chips data-surface="suggest-chips">` +
    chips.map((s) => `<button type="button" class="suggest-chip" data-suggest-ask>${esc(s)}</button>`).join("") +
    `</div>`;
};

export function makeDeskReasoner(deps: DeskDeps): DeskReasoner {
  let seq = 0;                                   // per-turn counter…
  // …but the bubble surface id must be unique ACROSS page loads: the chat is persisted (site.js) and
  // restored after a navigation, so a plain "chat-msg:1" would collide with a restored one and stream
  // into the WRONG bubble. A per-load random prefix keeps every id globally unique.
  const RUN = Math.random().toString(36).slice(2, 8);
  let degraded = false;                          // sticky: once offline, chat stays offline this session
  let enginePromise: Promise<DeskEngine | null> | null = null;
  // The CURRENT profile — starts at the device-picked one, but drops to deps.fallbackProfile if that
  // fails to load (see ensureEngine). Mutable + read for EVERY size-dependent knob below, so a fallback
  // swaps the model AND its tuning together (a 0.5B must not run with the 1.5B's prompt budget).
  let profile = deps.profile;
  const history: ChatMessage[] = [];             // last turns (buildPrompt clips the window)
  // GRAIN's chat markup, via the injected kit (arg order adapted to the desk's call sites).
  const bubble = deps.kit.chatBubble;
  const bodySpan = (surface: string, inner = ""): string => deps.kit.chatBody(inner, surface);

  // Load the engine once (probe-gated). Returns null on unavailable/failed and flips the desk
  // offline. Memoized so only the first chat.send pays the download; later sends reuse the engine.
  // On a failed load of the STRONG tier, retry ONCE with the lighter fallback profile before giving up:
  // a device we tiered up too far (a visible OOM) drops to the weak model instead of going offline.
  async function ensureEngine(onProgress: (p: EngineProgress) => void): Promise<DeskEngine | null> {
    if (degraded) return null;
    if (!enginePromise) {
      enginePromise = (async () => {
        if (!(await deps.probe())) return null;
        try {
          return await deps.loadEngine(profile, onProgress);
        } catch (err) {
          if (deps.fallbackProfile && profile !== deps.fallbackProfile) {
            console.warn(`[desk] ${profile.label} failed to load — falling back to ${deps.fallbackProfile.label}`, err);
            profile = deps.fallbackProfile;                     // swap model + tuning together
            return await deps.loadEngine(profile, onProgress);  // retry once; a throw here degrades below
          }
          throw err;
        }
      })();
    }
    try {
      const engine = await enginePromise;
      if (!engine) { degraded = true; deps.markOffline(); }
      return engine;
    } catch (err) {
      console.error("[desk] model load failed", err);
      degraded = true;
      deps.markOffline();
      return null;
    }
  }

  return {
    async decide(intent: Intent, tools: ReasonTools): Promise<Decision> {
      // Non-chat verbs are the stub's job, unchanged (the /grain demo, notes "see what's new", …).
      if (intent.action !== "chat.send") return deps.fallback.decide(intent, tools);

      const text = String(intent.payload.text ?? "").trim();
      const log = intent.surface;

      // 1) your message — clean, committed. Committed on the chat-log target RELEASES the composer
      //    trigger immediately (dispatcher clearTrigger) and stands the op-silence watchdog down, so
      //    the long model load that follows can't trip it. GRAIN's own op-builder (reasoner-kit) —
      //    not hand-rolled markup — so the desk can't drift from the exact shape the dispatcher expects.
      tools.emit(deps.kit.userMessageOp(log, text));

      // 2) an empty desk bubble to stream into — grain (AI), pending until it settles.
      const id = `chat-msg:${RUN}-${++seq}`;
      tools.emit({ target: log, op: "append", provenance: "ai", commit: "pending",
        html: bubble("ai", "grain", bodySpan(id, THINKING), "Desk") });   // never blank — shows "Thinking…" at once

      // replace the bubble body (status / progress / final) — same op-builder either way; the two
      // names just document intent at the call site (escaped text vs. already-trusted markup).
      const setBody = (inner: string, commit: "pending" | "committed") => tools.emit(deps.kit.replaceBodyOp(id, inner, commit));
      const setBodyRaw = setBody;   // trusted markup (load bar) — same op, kept as a distinct name for readability
      const setChips = (list: string[]) =>
        tools.emit({ target: "suggest-chips", op: "replace", provenance: "ai", commit: "committed", html: suggestChipsHtml(list) });
      const offline = (): Decision => { deps.markOffline(); setBody(esc(OFFLINE_LINE), "committed"); return { ok: true, ops: [], reply: OFFLINE_LINE }; };
      const narrate = (verb: string, desc: string) => tools.emit(deps.kit.narrateOp(verb, desc));   // console feed if the page shows one (else a no-op find)
      // Even a deterministic, instant answer holds the "Thinking…" bubble for a human beat before it
      // settles — so the desk is never jarringly instant; it always visibly reasons (the owner's ask).
      // Measured from when the bubble appeared (above), so an answer that already took a beat waits less.
      // The model paths (load + stream) always take longer, so they never call this.
      const thinkStart = Date.now();
      const minThink = (): Promise<void> => {
        const rem = 520 - (Date.now() - thinkStart);
        return rem > 0 ? tools.delay(rem) : Promise.resolve();
      };
      // stream a completion into the desk bubble (chat + summarize share this). Never leaves an empty
      // bubble; penalties + a loop-guard tame the 0.5B's tendency to spin into repetition.
      const streamInto = async (engine: DeskEngine, messages: ChatMessage[], maxTokens?: number): Promise<string> => {
        setBodyRaw(THINKING, "pending");               // keep "Thinking…" until the first token wipes it
        let acc = "";
        let looped = false;
        try {
          // GRAIN owns the stream + interrupt: breaking this loop (cancel / loop-guard) unwinds
          // streamChat's finally, which calls interruptGenerate — so we just stop iterating. Penalties
          // matter a LOT on a 0.5B (without them it loops); grain maps these grain-cased knobs to the
          // engine's wire shape.
          for await (const delta of deps.streamChat(engine, messages, {
            maxTokens: maxTokens ?? profile.maxTokens,
            temperature: profile.temperature, topP: profile.topP,
            frequencyPenalty: profile.frequencyPenalty, presencePenalty: profile.presencePenalty,
          })) {
            if (tools.cancelled()) break;                // graceful stop → break interrupts generation
            acc += delta;
            tools.emit(deps.kit.typeToken(id, delta));
            // loop-guard: if a ~28-char tail has already recurred 3+ times ("a board, a screen, a
            // board…"), stop, trim the display back to one instance, and settle. The break interrupts.
            if (acc.length > 140) {
              const tail = acc.slice(-28);
              if (tail.trim().length > 10 && acc.split(tail).length - 1 >= 3) {
                acc = acc.slice(0, acc.indexOf(tail) + tail.length).trimEnd();
                looped = true;
                break;
              }
            }
          }
        } catch (err) {
          console.error("[desk] generation failed", err);   // a per-message failure — desk stays online (retry-able)
          setBody(esc(acc.trim() ? acc : "The desk hit an error answering that. Try again, or ask something else."), "committed");
          return acc;
        }
        if (looped) setBody(esc(acc || "…"), "committed");                  // clean up the repeated junk
        else if (acc.trim()) tools.emit(deps.kit.settleOp(id));
        else setBody(esc(tools.cancelled() ? "Stopped." : "The desk didn't have an answer for that. Try asking about TJ, the BREAD stack, or this site."), "committed");
        return acc;
      };

      // Type a DETERMINISTIC (non-model) answer into the bubble the same way a model reply streams —
      // word by word — so an instant answer (capabilities, a nav announce) reads as the desk chatting,
      // not a hard drop of the whole line. Same typeToken/settleOp path as streamInto (the first token
      // wipes "Thinking…"). Cancellable, so a "stop" mid-type settles cleanly like a real stream.
      const typeOut = async (answer: string): Promise<void> => {
        setBodyRaw(THINKING, "pending");
        const parts = answer.match(/\S+\s*/g) ?? [answer];   // word-groups (trailing space kept)
        for (const part of parts) {
          if (tools.cancelled()) { setBody(esc("Stopped."), "committed"); return; }
          tools.emit(deps.kit.typeToken(id, part));
          await tools.delay(22);
        }
        tools.emit(deps.kit.settleOp(id));
      };

      // Travel the lamp to a nav link, "click" it, then leave the page — the ONE sequence shared by
      // every navigation-driving path (deterministic latest-note, deterministic section nav, and the
      // model's own NAVIGATE:<route> choice below), so the choreography can't drift between them.
      // The spotlight op is grain's own kit builder, not a hand-rolled literal (CLAUDE.md lesson #1:
      // use the mechanism, don't reinvent it) — and the actual navigate RenderOp is emitted by
      // deps.navigate itself (desk-door.ts, via kit.navigateOp), not here. `navLink` is the VISIBLE
      // sidebar link the lamp travels to and "clicks" (e.g. "/notes"); `goto` is where the browser
      // actually ends up (e.g. "/notes/newest" — a specific note has no nav link of its own).
      const travelAndNavigate = async (navLink: string, goto: string, label: string, announce: string, readDesc: string) => {
        narrate("reads", readDesc);
        deps.revealNav?.(navLink);
        narrate("clicks", label);
        tools.emit(deps.kit.spotlightOp(`nav:${navLink}`, { active: true, click: true }));
        deps.arrive?.("screen", announce);   // resume the lamp on arrival
        await tools.delay(NAV_GLIDE_MS);     // lamp opens the folder, glides, pulses
        deps.navigate?.(goto);
      };

      // Everything past the bubble is guarded: any unexpected throw settles an honest line rather
      // than leaving the empty pending bubble the visitor saw before.
      try {
        // 3) ROUTE the request. Deterministic actions (navigate / open a note / capabilities) drive
        //    the UI through GRAIN and need NO model — they run before the load and work even when the
        //    desk model is offline. The terminal narration persists across the page load (localStorage).
        const action = routeAction(text);

        if (action?.kind === "capabilities") {
          const where = deps.pageInfo?.().title;
          // read what GRAIN itself says is operable here (its manifest) — not a hardcoded guess
          const manifest = deps.pageManifest?.();
          const operables = manifest ? pageOperables(manifest) : [];
          const pageBit = operables.length ? ` GRAIN tells me this page also lets you ${joinPhrases(operables)}.` : "";
          const line = `Here's what I can do${where ? ` from ${where}` : ""}: open the latest note, summarize this page, or jump to a part of the stack (GRAIN, BATCH, MILL, PROOF, or the notes).${pageBit} Ask me, or tap a chip below. I answer here and narrate my steps in the terminal.`;
          await minThink();
          await typeOut(line);
          setChips([...ACTION_CHIPS, "Take me to GRAIN", "Open the notes"]);
          return { ok: true, ops: [], reply: line };
        }

        if (action?.kind === "clarify") {
          // Deterministic + offline: one clean bubble — the prompt with the choice buttons under it.
          // choiceGroup (trusted, self-escaping) goes INSIDE the body so it's a single message; the
          // dispatcher still resolves the group pick-once (keyed on [data-choices], not the op kind).
          await minThink();
          setBodyRaw(esc(action.prompt) + deps.kit.choiceGroup(log, action.choices), "committed");
          return { ok: true, ops: [], reply: action.prompt };
        }

        if (action?.kind === "open-latest-note") {
          const notes = (await deps.listNotes?.()) ?? [];
          const target = notes[0];
          if (target && deps.navigate) {
            await minThink();
            await typeOut(`Opening the latest note, “${target.title}”.`);
            await travelAndNavigate("/notes", target.route, "Notes", `Here's the latest note, “${target.title}”.`, "the notebook");
            return { ok: true, ops: [], reply: `Opening ${target.title}` };
          }
          setBody(esc("I couldn't reach the notebook just now."), "committed");
          return { ok: false, ops: [], reply: "notes unavailable", reason: "notes unavailable" };
        }

        // Deterministic navigation over the REAL sitemap catalog (catalog.ts resolveNav) — runs before
        // the model even loads, so "take me to X" navigates instantly, offline of the model, and only
        // ever to a route that exists. Not a hardcoded alias table: the catalog is the live sitemap, so
        // it scales with the site. A confident match navigates; anything fuzzier falls to the model tail
        // below (which gets a real-route shortlist), and an unrecognized place to an honest chat reply.
        const catalog = deps.loadCatalog ? await deps.loadCatalog().catch(() => [] as NavDest[]) : [];
        if (!action && deps.navigate) {
          const dest = resolveNav(text, catalog);
          if (dest) {
            await minThink();
            await typeOut(`Taking you to ${dest.label}.`);
            await travelAndNavigate(dest.route, dest.route, dest.label, `Here's ${dest.label}.`, "the navigation");
            return { ok: true, ops: [], reply: `Navigating to ${dest.label}` };
          }
        }

        // 4) needs the model. Load it (implicit opt-in on first send): a real progress bar, honest
        //    about the one-time cost. No stub fallback — unavailable/failed ⇒ Desk Offline.
        if (degraded) return offline();
        const { label, downloadNote } = profile;
        setBodyRaw(loadBar(0, label, downloadNote), "pending");
        narrate("loads", `${label}, one time, cached, runs on your device`);
        let lastPct = -1;
        const engine = await ensureEngine((p) => {
          const pct = Math.round((p.progress || 0) * 100);
          if (pct !== lastPct) { lastPct = pct; setBodyRaw(loadBar(pct, label, downloadNote), "pending"); }
        });
        if (!engine) return offline();
        if (tools.cancelled()) { setBody(esc("Stopped."), "committed"); return { ok: true, ops: [], reply: "Stopped." }; }

        // 4a) summarize this page — read the DOM content, stream a SHORT summary (capped tokens +
        //     penalties + the loop-guard keep the 0.5B from spinning).
        if (action?.kind === "summarize") {
          const page = (deps.pageText?.() ?? "").replace(/\s+/g, " ").trim();
          if (!page) { setBody(esc("There's nothing on this page for me to summarize."), "committed"); return { ok: false, ops: [], reply: "empty page", reason: "no page text" }; }
          narrate("reads", "this page");
          const acc = await streamInto(engine, [
            { role: "system", content: "You summarize a web page for a visitor in 2 to 3 plain sentences, from the CONTENT only. No hype, no lists, no repetition." },
            { role: "user", content: `Summarize this page:\n\n${page.slice(0, 4000)}` },
          ], profile.summarizeMaxTokens);
          return { ok: true, ops: [], reply: acc };
        }

        // 4a') write to the notepad — the desk COMPOSES a short markdown entry and appends it through
        //      GRAIN's own note.append op-builder (kit.noteAppendOp → the notepad-body surface, graded
        //      grain as an AI author). Only when this page actually HAS a notepad (the manifest reports a
        //      target that accepts note.append — harvested even while the pane is hidden); otherwise an
        //      honest decline instead of writing into the void.
        if (action?.kind === "note-write") {
          const hasNotepad = !!deps.pageManifest?.().targets.some((tt) => tt.accepts.includes("note.append"));
          if (!hasNotepad) {
            setBody(esc("I don't see a notepad on this page to write to. I can summarize the page or take you somewhere instead."), "committed");
            return { ok: false, ops: [], reply: "no notepad here", reason: "no notepad surface" };
          }
          const page = (deps.pageText?.() ?? "").replace(/\s+/g, " ").trim();
          narrate("writes", "a note to the notepad");
          const note = (await streamInto(engine, [
            { role: "system", content:
              "You write a SHORT markdown note to save to the visitor's notepad. Output ONLY the note's " +
              "markdown — prefer 2 to 5 concise '- ' bullet points (an optional one-line heading is fine) — " +
              "with no preamble, no sign-off, and no repetition. Base it on the visitor's request; when they " +
              "refer to 'this page' or ask for a summary, draw from the PAGE CONTENT." },
            { role: "user", content: page
              ? `Request: ${action.instruction}\n\nPAGE CONTENT:\n${page.slice(0, 3500)}`
              : `Request: ${action.instruction}` },
          ], profile.summarizeMaxTokens)).trim();
          if (!note) {
            setBody(esc("I couldn't compose a note for that. Tell me what to jot down and I'll add it."), "committed");
            return { ok: false, ops: [], reply: "empty note", reason: "empty note" };
          }
          // land the entry on the notepad, spotlight + reveal the pad so the write is visible, then
          // settle the chat bubble to a confirmation (the streamed preview has served its purpose).
          tools.emit(deps.kit.noteAppendOp(note, "ai"));
          tools.emit(deps.kit.spotlightOp("notepad", { active: true }));
          deps.revealNotepad?.();
          setBody(esc("Added that to your notepad."), "committed");
          await tools.delay(1400);
          tools.emit(deps.kit.spotlightOp("screen", { active: false }));
          return { ok: true, ops: [], reply: "Added to the notepad." };
        }

        // 4b) grounded chat (default). Retrieve grounding, stream, then swap the chips to curated
        //     follow-ups (suggestChipsHtml pins "What can I do here?" first).
        const knowledge = await deps.loadKnowledge();
        const grounding = retrieve(text, knowledge, 3);
        narrate("reads", grounding.map((c) => c.route).join(", ") || "facts");
        // The fuzzy tail: hand the model a small, relevance-ranked shortlist of REAL destinations from
        // the sitemap catalog (navShortlist), so when the deterministic resolver above wasn't confident
        // the model still chooses from routes that exist — never an invented slug.
        const shortlist = navShortlist(text, catalog);
        const acc = await streamInto(engine, buildPrompt({ query: text || "Hello", chunks: grounding, history, navShortlist: shortlist, tokenBudget: profile.promptTokenBudget }));

        // The model chose to navigate. Validate TWICE before acting on generated text: the route must be
        // REAL (present in the sitemap catalog — never trust the model to have stayed in scope), AND
        // kit.navigateOp's own isSafeNavigateHref check (it throws on anything unsafe).
        const navMatch = MODEL_NAVIGATE_RE.exec(acc.trim());
        if (navMatch && deps.navigate) {
          const route = navMatch[1]!;
          const dest = catalog.find((d) => d.route === route);
          if (dest) {
            try {
              deps.kit.navigateOp("screen", route);   // throws on an unsafe href — validate before acting
              setBody(esc(`Taking you to ${dest.label}.`), "committed");
              await travelAndNavigate(route, route, dest.label, `Here's ${dest.label}.`, "the navigation");
              return { ok: true, ops: [], reply: `Navigating to ${dest.label}` };
            } catch (err) {
              console.error("[desk] model chose an unsafe navigate href", route, err);   // fall through to the honest line
            }
          }
          // The model emitted a NAVIGATE we WON'T honor — a route it invented (not in the catalog) or an
          // unsafe href. Never leak the raw "NAVIGATE:<route>" protocol token to the visitor. Settle an
          // honest line pointing at what's actually reachable (the shortlist we offered).
          const offer = shortlist.length ? shortlist.slice(0, 4).map((d) => d.label).join(", ") : "GRAIN, the notes, or the BREAD stack";
          const line = `I'm not sure where that is on the site. I can take you to ${offer}, or answer a question about it.`;
          setBody(esc(line), "committed");
          history.push({ role: "user", content: text || "Hello" }, { role: "assistant", content: line });
          setChips([...pickFollowups(text, history), "Summarize this page"]);
          return { ok: true, ops: [], reply: line };
        }

        // The model chose to ASK instead of answer (CHOICES: protocol, prompt.ts). Turn the raw
        // "CHOICES: q | a | b" into a real ask: the streamed bubble becomes the question, and grain's
        // first-class choicesOp appends the pick-one buttons (each a chat.send carrying its value).
        const asked = parseModelChoices(acc);
        if (asked) {
          setBody(esc(asked.prompt), "committed");
          tools.emit(deps.kit.choicesOp(log, "", asked.choices));
          history.push({ role: "user", content: text || "Hello" }, { role: "assistant", content: asked.prompt });
          return { ok: true, ops: [], reply: asked.prompt };
        }

        history.push({ role: "user", content: text || "Hello" }, { role: "assistant", content: acc });
        setChips([...pickFollowups(text, history), "Summarize this page"]);
        return { ok: true, ops: [], reply: acc };
      } catch (err) {
        console.error("[desk] decide failed", err);          // bulletproof: never leave an empty bubble
        setBody(esc("Something went wrong on my end. Try again, or ask something else."), "committed");
        return { ok: false, ops: [], reply: "error", reason: String(err) };
      }
    },
    reset() {
      history.length = 0;
      seq = 0;
      if (degraded) { degraded = false; enginePromise = null; }   // re-arm a degraded desk to retry loading
    },

    // Page-arrival awareness (reasoner-driven). Called by the door on load, only when the desk is
    // already warm this session (desk-door.ts checks the desk-warm flag site.js sets on the first
    // chat.send) — so a visitor who never opened the desk is never made to load the model just by
    // navigating. Best-effort and unobtrusive: SILENT engine load (no progress bar on a nav), and if
    // the model can't run, the page is empty, or the parse fails, it's a no-op and the static starter
    // chips stand. When it works: a short "you're on X, here's what's here" greeting + chips the model
    // drew from THIS page's content.
    async arrive(applyOp: (op: RenderOp) => void): Promise<void> {
      if (degraded) return;
      const info = deps.pageInfo?.() ?? { route: "/", title: "" };
      const page = (deps.pageText?.() ?? "").replace(/\s+/g, " ").trim();
      if (!page) return;
      const engine = await ensureEngine(() => {});   // SILENT: never render the load bar on a navigation
      if (!engine) return;                           // offline/unavailable → static chips stand
      // Now the engine is ready, generation itself takes a beat — show the thinking indicator so the
      // pane isn't dead-silent before the greeting lands (the load phase above stays silent by design).
      // The bubble's body is addressable so we settle it to the greeting, or remove the whole bubble
      // if the model gives nothing usable (keeping arrival's "quiet on a miss" character).
      const arriveMsg = `chat-msg:arrive-${RUN}`;
      const arriveBody = `chat-msg:arrive-body-${RUN}`;
      applyOp({ target: "chat-log", op: "append", provenance: "ai", commit: "pending",
        html: deps.kit.chatBubble("ai", "grain", deps.kit.chatBody(THINKING, arriveBody), "Desk")
          .replace('<div class="chat-message"', `<div class="chat-message" data-surface="${arriveMsg}"`) });
      let raw = "";
      try {
        const messages: ChatMessage[] = [
          { role: "system", content:
            "You are the desk, a brief assistant on TJ's personal site. The visitor just opened a page. " +
            "From the page CONTENT only, write ONE short friendly sentence (max 20 words) naming where they are and what is here. " +
            "Then a new line that starts exactly with 'CHIPS:' and 2 or 3 short things a visitor might tap, each under 6 words, separated by ' | '. " +
            "No hype, no markdown, no extra lines." },
          { role: "user", content: `Page: ${info.title || info.route} (${info.route})\n\nCONTENT:\n${page.slice(0, 1800)}` },
        ];
        for await (const delta of deps.streamChat(engine, messages, {
          maxTokens: profile.arriveMaxTokens, temperature: 0.4, topP: profile.topP,
          frequencyPenalty: profile.frequencyPenalty, presencePenalty: profile.presencePenalty,
        })) raw += delta;
      } catch (err) {
        console.error("[desk] arrival generation failed", err);   // a nav is not worth a visible error
        applyOp({ target: arriveMsg, op: "remove", provenance: "ai", commit: "committed" });   // drop the thinking bubble
        return;
      }
      const { greeting, chips } = parseArrival(raw);
      if (!greeting) {
        applyOp({ target: arriveMsg, op: "remove", provenance: "ai", commit: "committed" });   // nothing usable → stay quiet
        return;
      }
      // settle the thinking bubble into the greeting (grain's kit — same shape as every desk bubble).
      applyOp(deps.kit.replaceBodyOp(arriveBody, deps.kit.esc(greeting), "committed"));
      // reasoner-driven chips: only REPLACE the static starters when the model actually offered some.
      if (chips.length) applyOp({ target: "suggest-chips", op: "replace", provenance: "ai",
        commit: "committed", html: suggestChipsHtml(chips) });
    },
  };
}
