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
import type { Intent, Decision } from "@tjakoen/grain/ai/contract.ts";
import { buildPrompt, type ChatMessage } from "./prompt.ts";
import { retrieve, type Knowledge } from "./retrieval.ts";
import type { DeskEngine, EngineProgress } from "./webllm-loader.ts";
import { routeAction, PINNED_CHIP, ACTION_CHIPS } from "./actions.ts";
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

/** The Reasoner plus a client-only reset — the door hangs this on window.deskReset ("New chat"). */
export interface DeskReasoner extends Reasoner {
  /** Forget the conversation (and re-arm a degraded desk to retry loading). Keeps a healthy engine. */
  reset(): void;
}

const MODEL_LABEL = "Qwen2.5-0.5B";
const OFFLINE_LINE =
  "The desk runs a small AI model in your browser, and this browser can't run it, so the desk is offline. Everything else on the site works as usual.";

export interface DeskDeps {
  /** WebGPU (+ memory) available? */
  probe: () => Promise<boolean>;
  /** Load + warm the engine, reporting download progress. */
  loadEngine: (onProgress: (p: EngineProgress) => void) => Promise<DeskEngine>;
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
  /** Stash a "spotlight + announce on arrival" so the lamp RESUMES on the destination page after a
   *  navigation (the MPA loses JS state; the door replays this on load). */
  arrive?: (surface: string, announce: string) => void;
  /** Open the collapsed file-tree folder above a nav link, so the lamp can travel to a visible target. */
  revealNav?: (route: string) => void;
  maxTokens?: number;
  temperature?: number;
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
// styled by portfolio-frame.css .desk-load). Honest about the one-time ~350MB cost.
const loadBar = (pct: number): string =>
  `<span class="desk-load"><span class="desk-load__title">Loading ${MODEL_LABEL}. About 350MB the first time, then cached.</span>` +
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
  const history: ChatMessage[] = [];             // last turns (buildPrompt clips the window)
  // GRAIN's chat markup, via the injected kit (arg order adapted to the desk's call sites).
  const bubble = deps.kit.chatBubble;
  const bodySpan = (surface: string, inner = ""): string => deps.kit.chatBody(inner, surface);

  // Load the engine once (probe-gated). Returns null on unavailable/failed and flips the desk
  // offline. Memoized so only the first chat.send pays the download; later sends reuse the engine.
  async function ensureEngine(onProgress: (p: EngineProgress) => void): Promise<DeskEngine | null> {
    if (degraded) return null;
    if (!enginePromise) {
      enginePromise = (async () => {
        if (!(await deps.probe())) return null;
        return deps.loadEngine(onProgress);
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
      //    the long model load that follows can't trip it.
      tools.emit({ target: log, op: "append", provenance: "user", commit: "committed",
        html: bubble("you", "", `<span class="chat-message__body">${esc(text || "…")}</span>`) });

      // 2) an empty desk bubble to stream into — grain (AI), pending until it settles.
      const id = `chat-msg:${RUN}-${++seq}`;
      tools.emit({ target: log, op: "append", provenance: "ai", commit: "pending",
        html: bubble("ai", "grain", bodySpan(id, THINKING), "Desk") });   // never blank — shows "Thinking…" at once

      // replace the bubble body (status / progress / final) — keeps the data-surface so later ops land.
      const setBody = (inner: string, commit: "pending" | "committed") =>
        tools.emit({ target: id, op: "replace", provenance: "ai", commit, html: bodySpan(id, inner) });
      const setBodyRaw = (innerHtml: string, commit: "pending" | "committed") =>   // trusted markup (load bar)
        tools.emit({ target: id, op: "replace", provenance: "ai", commit, html: bodySpan(id, innerHtml) });
      const setChips = (list: string[]) =>
        tools.emit({ target: "suggest-chips", op: "replace", provenance: "ai", commit: "committed", html: suggestChipsHtml(list) });
      const offline = (): Decision => { deps.markOffline(); setBody(esc(OFFLINE_LINE), "committed"); return { ok: true, ops: [], reply: OFFLINE_LINE }; };
      const narrate = (verb: string, desc: string) =>   // console feed if the page shows one (else a no-op find)
        tools.emit({ target: "console", op: "append", provenance: "ai", commit: "committed",
          html: `<div class="console__line"><span class="action-badge">${verb}</span><span class="console__desc">${esc(desc)}</span></div>` });
      // stream a completion into the desk bubble (chat + summarize share this). Never leaves an empty
      // bubble; penalties + a loop-guard tame the 0.5B's tendency to spin into repetition.
      const streamInto = async (engine: DeskEngine, messages: ChatMessage[], maxTokens?: number): Promise<string> => {
        setBodyRaw(THINKING, "pending");               // keep "Thinking…" until the first token wipes it
        let acc = "";
        let looped = false;
        try {
          const stream = await engine.chat.completions.create({
            messages, stream: true,
            max_tokens: maxTokens ?? deps.maxTokens ?? 220,
            temperature: deps.temperature ?? 0.5, top_p: 0.9,
            frequency_penalty: 0.6, presence_penalty: 0.4,   // without these a 0.5B loops badly
          });
          for await (const part of stream) {
            if (tools.cancelled()) { engine.interruptGenerate(); break; }   // graceful stop → halt generation
            const delta = part.choices?.[0]?.delta?.content;
            if (!delta) continue;
            acc += delta;
            tools.emit({ target: id, op: "type", text: delta, provenance: "ai", commit: "pending" });
            // loop-guard: if a ~28-char tail has already recurred 3+ times ("a board, a screen, a
            // board…"), stop, trim the display back to one instance, and settle.
            if (acc.length > 140) {
              const tail = acc.slice(-28);
              if (tail.trim().length > 10 && acc.split(tail).length - 1 >= 3) {
                engine.interruptGenerate();
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
        else if (acc.trim()) tools.emit({ target: id, op: "type", done: true, provenance: "ai", commit: "committed" });
        else setBody(esc(tools.cancelled() ? "Stopped." : "The desk didn't have an answer for that. Try asking about TJ, the BREAD stack, or this site."), "committed");
        return acc;
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
          setBody(esc(line), "committed");
          setChips([...ACTION_CHIPS, "Take me to GRAIN", "Open the notes"]);
          return { ok: true, ops: [], reply: line };
        }

        if (action?.kind === "open-latest-note") {
          const notes = (await deps.listNotes?.()) ?? [];
          const target = notes[0];
          if (target && deps.navigate) {
            setBody(esc(`Opening the latest note, “${target.title}”.`), "committed");
            narrate("reads", "the notebook");
            // travel the lamp to the Notes nav item and "click" it, like a human would, then load.
            deps.revealNav?.("/notes");
            narrate("clicks", "Notes");
            tools.emit({ target: "nav:/notes", op: "spotlight", active: true, click: true, provenance: "ai", commit: "pending" });
            deps.arrive?.("screen", `Here's the latest note, “${target.title}”.`);   // resume the lamp on arrival
            await tools.delay(950);                                                  // lamp opens the folder, glides, pulses
            deps.navigate(target.route);
            return { ok: true, ops: [], reply: `Opening ${target.title}` };
          }
          setBody(esc("I couldn't reach the notebook just now."), "committed");
          return { ok: false, ops: [], reply: "notes unavailable", reason: "notes unavailable" };
        }

        if (action?.kind === "navigate") {
          if (deps.navigate) {
            setBody(esc(`Taking you to ${action.name}.`), "committed");
            narrate("reads", "the navigation");
            // travel the lamp to that section's nav link and "click" it, then load the page.
            deps.revealNav?.(action.route);
            narrate("clicks", action.name);
            tools.emit({ target: `nav:${action.route}`, op: "spotlight", active: true, click: true, provenance: "ai", commit: "pending" });
            deps.arrive?.("screen", `Here's ${action.name}.`);
            await tools.delay(950);                                                  // lamp opens the folder, glides, pulses
            deps.navigate(action.route);
            return { ok: true, ops: [], reply: `Navigating to ${action.name}` };
          }
          setBody(esc("I can't navigate from here."), "committed");
          return { ok: false, ops: [], reply: "navigate unavailable", reason: "navigate unavailable" };
        }

        // 4) needs the model. Load it (implicit opt-in on first send): a real progress bar, honest
        //    about the one-time cost. No stub fallback — unavailable/failed ⇒ Desk Offline.
        if (degraded) return offline();
        setBodyRaw(loadBar(0), "pending");
        narrate("loads", `${MODEL_LABEL}, one time, cached, runs on your device`);
        let lastPct = -1;
        const engine = await ensureEngine((p) => {
          const pct = Math.round((p.progress || 0) * 100);
          if (pct !== lastPct) { lastPct = pct; setBodyRaw(loadBar(pct), "pending"); }
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
          ], 160);
          return { ok: true, ops: [], reply: acc };
        }

        // 4b) grounded chat (default). Retrieve grounding, stream, then swap the chips to curated
        //     follow-ups (suggestChipsHtml pins "What can I do here?" first).
        const knowledge = await deps.loadKnowledge();
        const grounding = retrieve(text, knowledge, 3);
        narrate("reads", grounding.map((c) => c.route).join(", ") || "facts");
        const acc = await streamInto(engine, buildPrompt({ query: text || "Hello", chunks: grounding, history }));
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
  };
}
