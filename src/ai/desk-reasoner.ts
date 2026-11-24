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
import { type ChatMessage } from "./prompt.ts";
import { type Knowledge } from "./retrieval.ts";
import type { DeskEngine, EngineProgress, ModelProfile } from "./webllm-loader.ts";
import type { ChatStreamOptions } from "@tjakoen/grain/ai/model-chat.ts";
import { routeAction, type Action } from "./actions.ts";
import { type NavDest } from "./catalog.ts";
// B2 notes filtering — matching a visitor's free-text topic against the REAL tag set (never a model
// guess, law #2). Pure + framework-free (notes-tags.ts), same family as catalog.ts's resolver.

// B3 mail batch archive — matching a visitor's free-text sender phrase against the REAL sender set on
// /mail (never a model guess, law #2). Pure + framework-free (mail-sender.ts), notes-tags.ts's sibling.

import type { JsonSchema } from "./local-schema-completion.ts";
// B1 contact prefill — the deterministic draft (the visitor's words + a salutation) and the ONE
// registered field surface the desk may fill (never a model-picked selector, law #2). Pure
// (contact-draft.ts), same family as the matchers above.

// D1 form builder demo — the closed-set matcher (field-matcher.ts, "Read first" — the ONE thing that
// decides which fields/choices ever exist) plus the demo values drafted for its TEXT fields only
// (form-draft.ts — never a `choices` item, see that file's own banner on why). KNOWN_FIELD_LABELS/
// KNOWN_CHOICE_LABELS name the closed set honestly when a description matches nothing at all.

// C2 visitor memory — the notepad IS the memory. Write-time sanitize + the one line marker
// (sanitizeMemoryFact, memoryLine) and read-time parseMemories (re-sanitize + cap, for the VISITOR
// NOTES prompt block). Pure (memory.ts), same family as contact-draft.ts.

// A2 guided tour — the fixed, code-enumerated stop list (tour.ts). Zero model: tour-start/tour-stop
// are matched deterministically (actions.ts) and driven from this data, never from the model's own
// judgment of "what's on the site" (CLAUDE.md design law — code enumerates routes, never the model).

import { type ShowcaseState } from "./showcase.ts";
// GRAIN's reasoner-kit — the chat bubble markup the desk USED to fork now comes from here (injected
// as deps.kit at runtime; the door URL-imports it). Type-only import (erased) so this stays a
// client-safe module. See grain/ai/reasoner-kit.ts.
import type * as Kit from "@tjakoen/grain/ai/reasoner-kit.ts";
import type { Manifest } from "@tjakoen/grain/ai/manifest.ts";
// The desk's ONE capability catalog (capabilities.ts) — what it can see / navigate / operate, built
// from GRAIN's live-DOM manifest + actions.ts's own closed vocabulary. Both the deterministic
// "capabilities" reply below and the model's canDo prompt feed read from this SAME catalog, so they
// can't drift apart into two different-shaped answers to "what can I do here?".

import { esc } from "./desk-text.ts";
import { downloadAllowed as engineDownloadAllowed, ensureEngine as ensureEngineLoad } from "./desk-engine.ts";
import { runAgentTurns as runAgentTurnsImpl } from "./desk-agent.ts";
import { deterministicTurn } from "./desk-deterministic.ts";
import { modelTurn } from "./desk-model.ts";
import type { DeskRuntime } from "./desk-runtime.ts";
import type { EngineState } from "./desk-runtime.ts";
import { NAV_GLIDE_MS } from "./desk-timing.ts";
import { suggestChipsHtml } from "./desk-hud.ts";
import { THINKING } from "./desk-copy.ts";
export { parseModelChoices, DOWNLOAD_DECLINED_LINE, loadBar } from "./desk-copy.ts";
export { NAV_GLIDE_MS, CONTACT_FILL_BEAT_MS, FORM_FILL_BEAT_MS, MAIL_ARCHIVE_BEAT_MS } from "./desk-timing.ts";
export { suggestChipsHtml } from "./desk-hud.ts";

/** A note the desk can open ("show the latest blog") — newest-first from /notes.json. `tags` rides
 *  along for B2 notes filtering (notes-tags.ts): optional so older callers/fixtures without it still
 *  type-check (an untagged note just never matches a topic). */
export interface DeskNote { slug: string; title: string; route: string; tags?: string[] }

/** Per-turn context threaded to the hoisted turn handlers. It carries the shared per-call helpers and
 *  state a branch needs, so each handler is a plain function rather than a closure inside decide(). */
export interface Turn {
  tools: ReasonTools;
  log: string;
  id: string;
  text: string;
  action: Action | null;
  /** Memoized catalog load: at most one loadCatalog per turn, and only when a handler asks for it, so
   *  the deterministic paths that need no catalog (clarify, theme, memory) stay a fetch cheaper. */
  getCatalog: () => Promise<NavDest[]>;
  tourWasActive: boolean;
  showcaseWasActive: boolean;
  setBody: (inner: string, commit: "pending" | "committed") => void;
  setBodyRaw: (inner: string, commit: "pending" | "committed") => void;
  setChips: (list: string[]) => void;
  offline: () => Decision;
  /** True while Browse mode keeps the model off (deps.modelAllowed). */
  modelBlocked: () => boolean;
  /** Settle the turn with the Browse pointer instead of loading the model; the desk stays online. */
  declineModel: (line?: string) => Promise<Decision>;
  narrate: (verb: string, desc: string) => void;
  minThink: () => Promise<void>;
  streamInto: (engine: DeskEngine, messages: ChatMessage[], maxTokens?: number) => Promise<string>;
  typeOut: (answer: string) => Promise<void>;
  travelAndNavigate: (navLink: string, goto: string, label: string, announce: string, readDesc: string, arriveSurface?: string, anchor?: string) => Promise<void>;
}

// 1c follow-up target — a whole-message deictic reference ("go there", "open it", "take me there")
// with no destination of its own: it means "the place you just offered/cited". Matched against norm()'d
// text so trailing punctuation and casing don't matter. Requires a deictic word (there/it/that/…) so a
// bare verb ("go", "open") never fires — only a genuine "that place I just mentioned" reference does.
const FOLLOWUP_DEICTIC_RE =
  /^(?:(?:go|take me|bring me|open|read|see|show me|show|jump|head)\s+(?:to\s+)?)?(?:there|it|that|that one|this one|the note|the post)$/;

/** The Reasoner plus a client-only reset — the door hangs this on window.deskReset ("New chat"). */
export interface DeskReasoner extends Reasoner {
  /** Forget the conversation (and re-arm a degraded desk to retry loading). Keeps a healthy engine. */
  reset(): void;
  /** Page-arrival awareness: on landing, read the page and offer a one-line greeting + contextual
   *  chips. The DOOR calls this (with its applyOp) on load, gated on the desk being warm. No-op when
   *  offline or the page has no readable text. */
  arrive(applyOp: (op: RenderOp) => void): Promise<void>;
  /** "Watch me work" agent: re-hydrate the demo loop on this page after a GO navigated here. The DOOR
   *  calls this (with its applyOp) on arrival, only when agent state is stashed. Loads the engine
   *  silently, then takes the next agent turn(s) on this page. No-op offline or with no state. */
  showcaseResume(applyOp: (op: RenderOp) => void): Promise<void>;
  /** ONE structured completion, for a caller that wants a MOVE rather than a conversation.
   *
   *  /grain/builder is the first user: the model reads the live manifest and answers with one JSON move,
   *  which grain then parses and validates before anything touches the page. It is here rather than
   *  in the builder's own island for one reason that matters on a laptop — the desk owns the engine,
   *  and a second island calling loadEngine would put another model on the GPU.
   *
   *  Returns null when the model cannot run at all, which the caller is expected to say out loud
   *  rather than paper over. Silent: no progress bar and no chat bubble, because the caller has its
   *  own surface and this is not a conversation turn. */
  complete(prompt: string, schema?: JsonSchema): Promise<string | null>;
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

// A1 "show me the part about X" (deep-link answers) — deriving the VISIBLE nav link above a hit's
// route, and a slug label for narrating a click on it, without needing the full catalog loaded at this
// point in the flow (that fetch happens further down, for the fuzzy-tail nav). The sidebar has no nav
// item per section, so the lamp travels to the nearest real link: "/a/b" → "/a", "/a/b/c" → "/a/b"; a
// single-segment route (a top-level section) has no shallower link to climb to, so it stays itself —
// same rule open-latest-note follows using "/notes" as a specific note's own nav link.
const OFFLINE_LINE =
  "The desk runs a small AI model in your browser, and this browser can't run it, so the desk is offline. Everything else on the site works as usual.";

// How long the lamp lingers on a clicked nav link before the page actually tears down — the desk's

export interface DeskDeps {
  /** The model profile (webllm-loader.ts) — the model id's tuning: generation caps, penalties, the
   *  prompt budget, and the load-bar copy. desk-door injects it, so every size-dependent knob below
   *  flows from the profile selected for this page and device. */
  profile: ModelProfile;
  /** WebGPU (+ memory) available? */
  probe: () => Promise<boolean>;
  /** May this turn load the model? False while the desk is in Browse mode. Every model-free path
   *  (navigation, choices, theme, the routed page actions) still runs; only the step that would load
   *  the model declines, with `modelDeclinedLine`, and without marking the desk offline. Absent means
   *  always allowed. */
  modelAllowed?: () => boolean;
  /** Does this browser already hold a saved copy of the model? Read when a load starts, so the load bar
   *  says "from the saved copy" rather than counting a download that will not happen. Absent means no. */
  isWarm?: () => boolean;
  /** Ask the visitor whether to download the model, showing the choice in the chat. Resolves true on yes
   *  and false on "Not now". Called only when a load would start a download: never with a saved copy and
   *  never once the engine exists. Absent means no question is asked (tests, and pages with no consent UI). */
  askDownload?: (profile: ModelProfile) => Promise<boolean>;
  /** The reply when `modelAllowed` turns a model turn away. */
  modelDeclinedLine?: string;
  /** Load + warm the engine for the profile, reporting download progress. */
  loadEngine: (profile: ModelProfile, onProgress: (p: EngineProgress) => void) => Promise<DeskEngine>;
  /** GRAIN's streaming chat transport (`@tjakoen/grain/ai/model-chat.ts` streamChat) — yields content
   *  token deltas; BREAKING the `for await` (a stop, the loop-guard) interrupts generation for us, so
   *  the desk never touches `interruptGenerate` directly. Injected because the browser refuses a bare
   *  grain import (the door URL-imports it); tests pass grain's real one. */
  streamChat: (engine: DeskEngine, messages: ChatMessage[], opts?: ChatStreamOptions) => AsyncIterable<string>;
  /** GRAIN's chat-model adapter (makeChatModel), for a ONE-SHOT structured completion rather than a
   *  streamed conversation. Injected on the same grounds as streamChat: the browser refuses a bare
   *  grain import, and a test passes grain's real one. Optional, and the consequence of leaving it
   *  out is stated rather than hidden — `complete` returns null, which its caller reports as the
   *  desk being unable to run. JSON mode lives in here, and on a 0.5B it is most of the difference
   *  between a parseable move and a paragraph about the move. */
  makeChatModel?: (engine: DeskEngine, opts?: { temperature?: number; jsonMode?: boolean; schema?: JsonSchema })
    => { complete(prompt: string): Promise<string> };
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
  /** Authored summary for a focused content item, when the page already provides one. */
  pageSummary?: () => { title: string; summary: string } | null;
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
   *  navigation (the MPA loses JS state; the door replays this on load). `anchor` is set only by the
   *  A1 deep-link path (a section elsewhere on the site): the door's runArrival then scrolls to it
   *  BEFORE the spotlight lands, so the lamp lights a section that's actually on screen. */
  arrive?: (surface: string, announce: string, anchor?: string) => void;
  /** Open the collapsed file-tree folder above a nav link, so the lamp can travel to a visible target. */
  revealNav?: (route: string) => void;
  /** Scroll the CURRENT page to a rendered heading id (MILL's anchor ids — the `data-surface="anchor:*"`
   *  contract Chunk.anchor points at). True when the element existed. Used by "show me the part about X"
   *  (A1, deep-link answers) when the hit is already on this page; the elsewhere case instead stashes the
   *  anchor through `arrive` below and desk-door's runArrival does the scrolling on the destination page. */
  scrollToAnchor?: (anchor: string) => boolean;
  /** Flip the assistant panel to its Notepad view (clicks the [data-shell-mode="notepad"] tab), so a
   *  note the desk just wrote is visible immediately instead of only after the visitor opens the pad. */
  revealNotepad?: () => void;
  /** C2 visitor memory — the notepad's WHOLE markdown right now (the door's join of every
   *  `.notepad__entry[data-md]` in DOM order, falling back to the raw localStorage blob after a
   *  reload folds every entry into one — see notepad.js RESTORE). Fed through memory.ts's
   *  parseMemories to build the VISITOR NOTES prompt block. Optional/empty-string-safe: an absent dep
   *  or a read failure just means no memories reach the prompt, never a crash. */
  padMarkdown?: () => string;
  // ---- A2 guided tour (tour.ts) — the reasoner drives the FIRST leg only; every leg after rides the
  // door's own runTourLeg (no chat.send happens between stops, so the reasoner isn't in the loop for
  // those). All three ride sessionStorage under TOUR_KEY, same ARRIVE_KEY pattern as `arrive` above. ----
  /** Stash which stop index is now pending the door's next advance. Call BEFORE navigating — the
   *  navigate tears the page down, so the cursor must already be written. */
  tourSet?: (at: number) => void;
  /** Clear the pending tour cursor — any chat message during a tour cancels it (the "type anything to
   *  stop" affordance), and tour-stop clears it explicitly. */
  tourClear?: () => void;
  /** Is a tour cursor currently stashed? Read BEFORE clearing, so a cancel/stop can report honestly
   *  on whether a tour was actually running. */
  tourActive?: () => boolean;
  // ---- "Watch me work" AGENT (showcase.ts) — the 0.5B drives the site itself; these carry its state
  // across navigations and read the live targets it's allowed to reach. State (goal + trail + step)
  // rides sessionStorage under SHOWCASE_KEY, the same seam the tour cursor uses. ----
  /** The agent's stashed state (null when no demo is running). Read on arrival to re-hydrate the loop. */
  showcaseStateGet?: () => ShowcaseState | null;
  /** Persist the agent state. Call BEFORE a GO navigates — the navigate tears the page down. */
  showcaseStateSet?: (s: ShowcaseState) => void;
  /** End the demo — clear the stashed state. Any message during a demo cancels it ("type anything to stop"). */
  showcaseClear?: () => void;
  /** Is a demo currently running? Read BEFORE clearing, for an honest cancel/stop line. */
  showcaseActive?: () => boolean;
  /** The live HIGHLIGHT targets on THIS page — rendered heading ids the agent may spotlight (validated
   *  against exactly this list, so it can never invent a section). */
  pageAnchors?: () => string[];
  /** Is the registered contact-message compose field present on this page (a DRAFT target)? */
  hasContactField?: () => boolean;
  // ---- A4 theme switching (theme.js's two axes) — the desk drives the VISIBLE status-bar controls
  // (revealNotepad's pattern: click the same button a human would, no private channel), validating
  // against the LIVE DOM both before choosing what to click and after, to confirm a click actually
  // landed (CLAUDE.md's "validate twice" design law). ----
  /** The live theme state, read fresh off <html> each call: `themes` is the ordered data-themes list
   *  (the truth, not the actions.ts FLAVORS mirror), `flavor` is the current data-theme or the list's
   *  own default (list[0]), and `scheme` is the EFFECTIVE light/dark (data-color-scheme, falling back
   *  to the OS via matchMedia when nothing is forced). */
  themeState?: () => { themes: string[]; flavor: string; scheme: "dark" | "light" };
  /** Click the visible "cycle theme" status-bar button (theme.js's [data-cycle-theme]). Returns false
   *  when the control isn't on this page — an honest "can't reach it" beats a silent no-op. */
  clickCycleTheme?: () => boolean;
  /** Click the visible "light / dark" status-bar button (theme.js's [data-toggle-scheme]). Same
   *  honesty contract as clickCycleTheme. */
  clickToggleScheme?: () => boolean;
  // ---- B2 notes filtering ("show me notes about teaching") — the desk drives the SAME tag-chip
  // checkboxes a human would (content.ts renderNotesFeedPage's [data-feed-controls] island), validating
  // against the LIVE DOM both before choosing what to click and after (CLAUDE.md's "validate twice" law),
  // mirroring the A4 theme deps' honesty contract exactly. ----
  /** The live chip checkbox VALUES on this page's /notes feed (`[data-feed-controls] input[type=
   *  checkbox]`), empty when the controls aren't on this page. Read BEFORE clicking, so the reasoner
   *  only ever clicks a tag that's actually a chip here — never a matched tag with nothing to click. */
  notesTagChips?: () => string[];
  /** Click the chip checkbox for `tag` (revealing the collapsed `[data-tags-rest]` overflow first via
   *  `[data-tags-more]` if the chip lives there, so the visitor SEES what the desk just checked — the
   *  revealNotepad pattern). Returns the checkbox's OWN checked state after the click, so the reasoner
   *  can tell a real check from a stubborn control that didn't take. False when no such chip exists. */
  clickNotesTag?: (tag: string) => boolean;
  /** Count of `.note-card` currently visible (not `[hidden]`) — read AFTER clicking, for an honest
   *  "N match" in the confirmation line. Optional: its absence just drops that clause, never fabricates
   *  a count. */
  visibleNoteCount?: () => number;
  // ---- B3 mail batch archive ("archive everything from BREAD CI") — the desk drives the SAME row
  // link + reader Archive button a human would click on /mail, validating against the LIVE DOM both
  // before choosing what to click and after (CLAUDE.md's "validate twice" design law), the exact
  // honesty contract the A4 theme + B2 notes-tag deps above already follow. ----
  /** The distinct sender names across ALL mail rows (any folder), read fresh off the live DOM — `[]`
   *  off /mail. Deliberately NOT inbox-only: a sender whose mail was all just archived must still
   *  match on a re-ask, so the reasoner answers the honest "nothing left in the inbox" instead of
   *  pretending the sender never existed (mailItemsFrom below is the inbox-only half). */
  mailSenders?: () => string[];
  /** The inbox rows whose sender text equals `sender` EXACTLY (the reasoner passes the already-matched
   *  real sender name, never the visitor's raw phrase) — each with the row's message id, subject, and
   *  the surface id the spotlight lands on while archiving it. */
  mailItemsFrom?: (sender: string) => { id: string; subject: string; surface: string }[];
  /** Click the row (opens its reader), then click the now-enabled `[data-mail-archive]` button in that
   *  reader — the SAME two clicks a human would make, no private channel. Returns true only once the
   *  row's OWN `data-folder` reads back "archive" afterward (validated, not assumed). */
  archiveMailItem?: (id: string) => boolean;
  /** Stash the RAW sender phrase (not yet matched) for the door to run on arrival after navigating to
   *  /mail — same "stash BEFORE navigate" discipline tourSet follows, since the navigate tears the page
   *  (and this reasoner instance) down before the mailbox can be reached. */
  mailTaskSet?: (sender: string) => void;
  // ---- B1 contact prefill ("tell TJ I want to talk about grain") — the desk opens the SAME compose
  // panel a human would (the visible ✎ Compose button, revealNotepad's pattern) and prefills the ONE
  // registered field (field:contact-message) through grain's `fill` op, validating live both before
  // (the panel opened) and after (the field's own value reads the draft back) — the A4/B2/B3 honesty
  // contract. The AI never submits: no submit verb exists, and Send stays the visitor's. ----
  /** Click the visible ✎ Compose button so the panel the desk is about to fill is ON SCREEN. Returns
   *  true only when the compose panel is actually visible afterward (validated, not assumed); false
   *  when the control isn't on this page — an honest "can't reach it" beats a silent no-op. */
  openCompose?: () => boolean;
  /** The compose body field's CURRENT value, read fresh off the live DOM — null when the field isn't
   *  on this page. Read AFTER the fill, to confirm the draft actually landed (validate twice). */
  contactFieldValue?: () => string | null;
  /** Stash the already-drafted message for the door to fill on arrival after navigating to /mail —
   *  Returns false when persistence failed; navigation must leave the recoverable draft here. */
  contactTaskSet?: (message: string) => boolean;
  // ---- D1 form builder demo ("build me a form that asks for a name and an email") — the desk
  // navigates to /grain/builder?ask=<the description>, a plain GET the server answers with matchSpec's own
  // rendered form (this reasoner never renders anything itself). It then prefills the TEXT fields
  // matchSpec matched with form-draft.ts's demo values through the SAME cross-page-stash idiom
  // mailTaskSet/contactTaskSet use — the navigate tears this reasoner instance down before /grain/builder
  // ever loads. Never stashes a value for a `choices` item — see form-draft.ts's own banner on why a
  // <select> is never a fill target here. ----
  /** Stash the ALREADY-DRAFTED demo values (surface → text, form-draft.ts) for the door to fill on
   *  arrival after navigating to /grain/builder — same "stash BEFORE navigate" discipline every other
   *  cross-page task here follows (the navigate tears this down). */
  formTaskSet?: (task: { values: Record<string, string>; checks: Record<string, boolean> }) => void;
  // ---- C1 visitor-intent onboarding (recruiter/developer/student) — sessionStorage-backed, same
  // try/catch-around-ss() shape the door gives every dep above. ONE key holds the answer, a second
  // holds the nag-guard flag. State is read ONLY to bias a code-chosen chip pool (pickFollowups below)
  // — it NEVER enters buildPrompt or any model message, so the injection surface stays at zero even
  // after this lands (the roadmap's C1 design law). ----
  /** The visitor's stated intent this session, or null when never asked or never answered. */
  intentGet?: () => "recruiter" | "developer" | "student" | null;
  /** Record the visitor's answer (one sessionStorage key: "visitor-intent" per the roadmap). */
  intentSet?: (intent: "recruiter" | "developer" | "student") => void;
  /** Has the ask already fired this session? The nag-guard: ask at most once, never again once
   *  answered (intentGet covers the "already answered" half; this covers "already asked and ignored"). */
  intentAsked?: () => boolean;
  /** Mark the ask as fired. Call BEFORE presenting the choices — same "stash before the risky bit"
   *  discipline tourSet follows before a navigate, so a mid-render failure can't leave the ask
   *  unmarked and re-firing forever. */
  intentMarkAsked?: () => void;
}

// Chat bubble markup now comes from GRAIN's reasoner-kit (deps.kit) — not forked here. This local

// The model-load progress, as a real progress bar in the desk bubble (raw markup — no user input —
// styled by portfolio-frame.css .desk-load). Honest about the one-time download cost; the label + size
// note come from the active profile (webllm-loader.ts) so a bigger model reports its bigger download.
// A visitor with a saved copy sees a short load from disk; a first-time visitor sees how many
// megabytes have arrived, so a 350 MB wait reads as progress rather than a stall. The percentage from
// WebLLM covers the download and the move into GPU memory together, which is why the megabytes are
// worded "of about".

export function makeDeskReasoner(deps: DeskDeps): DeskReasoner {
  let seq = 0;                                   // per-turn counter…
  // …but the bubble surface id must be unique ACROSS page loads: the chat is persisted (site.js) and
  // restored after a navigation, so a plain "chat-msg:1" would collide with a restored one and stream
  // into the WRONG bubble. A per-load random prefix keeps every id globally unique.
  const RUN = Math.random().toString(36).slice(2, 8);
  // Sticky offline flag + the memoised load; the engine stage owns both (desk-engine.ts).
  const engineState: EngineState = { promise: null, degraded: false };
  // The model profile — read for EVERY size-dependent knob below (generation caps, prompt budget, penalties).
  const profile = deps.profile;
  const history: ChatMessage[] = [];             // last turns (buildPrompt clips the window)
  // 1c: the last place the desk navigated to OR cited ("Read more: X") this session, so a bare
  // follow-up ("go there") reuses THAT target instead of re-retrieving (which drifted to a different
  // note between "take me to the flagship note" and "go there"). Cleared on reset.
  // GRAIN's chat markup, via the injected kit (arg order adapted to the desk's call sites).
  const bubble = deps.kit.chatBubble;
  const bodySpan = (surface: string, inner = ""): string => deps.kit.chatBody(inner, surface);

  // May this turn start the model download? A saved copy or an engine already on the page needs no
  // question. Otherwise the desk says what it is asking in its own bubble, then waits for the visitor's
  // choice. A "Not now" is a choice and not a failure, so it never marks the desk offline. A 350 MB
  // download is too large to start for someone who was not told, which is why a first message no longer
  // starts it on its own.
  const downloadAllowed = (say: (html: string, commit: "committed") => void): Promise<boolean> =>
    engineDownloadAllowed(deps, profile, engineState, say);
  const ensureEngine = (onProgress: (p: EngineProgress) => void): Promise<DeskEngine | null> =>
    ensureEngineLoad(deps, profile, engineState, onProgress);

  const rt: DeskRuntime = {
    deps, profile, history, engineState, lastTarget: null,
    downloadAllowed, ensureEngine,
    runAgentTurns: (engine, emit) => runAgentTurnsImpl(rt, engine, emit),
  };

  return {
    async decide(intent: Intent, tools: ReasonTools): Promise<Decision> {
      // Non-chat verbs are the stub's job, unchanged (the /grain demo, notes "see what's new", …).
      if (intent.action !== "chat.send") return deps.fallback.decide(intent, tools);

      const text = String(intent.payload.text ?? "").trim();
      const log = intent.surface;

      // Browse mode hides the chat and keeps the model off. A turn still runs, so a model-free verb
      // ("take me to GRAIN", the choices, a theme switch) works, but the opening two bubbles are held
      // until the turn shows it is one of those: the first op past them releases both. A turn that
      // would need the model drops them unseen and declines, so a message slipped past the hidden
      // composer leaves no trace in a chat nobody can see.
      let held: unknown[] | null = deps.modelAllowed && !deps.modelAllowed() ? [] : null;
      if (held) {
        const direct = tools;
        tools = { ...direct, emit: (op: Parameters<ReasonTools["emit"]>[0]) => {
          if (held && held.length < 2) { held.push(op); return; }
          if (held) { for (const h of held) direct.emit(h as Parameters<ReasonTools["emit"]>[0]); held = null; }
          direct.emit(op);
        } };
      }

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
      // Browse mode: the model is off by the visitor's choice, not broken, so this settles the bubble
      // with a pointer to Browse and leaves the desk online for every model-free verb.
      const modelBlocked = (): boolean => !!deps.modelAllowed && !deps.modelAllowed();
      const declineModel = async (reason?: string): Promise<Decision> => {
        const line = reason ?? deps.modelDeclinedLine ?? "Use Browse to search the portfolio without local AI.";
        if (held) { held = null; return { ok: false, ops: [], reason: line }; }   // nothing shown yet: leave no trace
        await minThink();
        setBody(esc(line), "committed");
        return { ok: false, ops: [], reply: line, reason: line };
      };
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
      // every navigation-driving path (deterministic latest-note, deterministic section nav, the
      // model's own NAVIGATE:<route> choice, and A1's deep-link elsewhere-page hit), so the
      // choreography can't drift between them.
      // The spotlight op is grain's own kit builder, not a hand-rolled literal (CLAUDE.md lesson #1:
      // use the mechanism, don't reinvent it) — and the actual navigate RenderOp is emitted by
      // deps.navigate itself (desk-door.ts, via kit.navigateOp), not here. `navLink` is the VISIBLE
      // sidebar link the lamp travels to and "clicks" (e.g. "/notes"); `goto` is where the browser
      // actually ends up (e.g. "/notes/newest" — a specific note has no nav link of its own).
      // `arriveSurface`/`anchor` are extra, OPTIONAL trailing params (every existing call site is
      // unchanged): the deep-link path is the one caller that stashes a section anchor instead of the
      // whole screen, so the lamp lands ON the part of the destination page it was asked about.
      const travelAndNavigate = async (
        navLink: string, goto: string, label: string, announce: string, readDesc: string,
        arriveSurface = "screen", anchor?: string,
      ) => {
        narrate("reads", readDesc);
        deps.revealNav?.(navLink);
        narrate("clicks", label);
        tools.emit(deps.kit.spotlightOp(`nav:${navLink}`, { active: true, click: true }));
        deps.arrive?.(arriveSurface, announce, anchor);   // resume the lamp on arrival
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

        // A2 guided tour: "type anything to stop" — ANY message while a tour is pending cancels the
        // door's next advance, except a fresh tour-start itself (which just restashes its own cursor).
        // Captured BEFORE clearing so the tour-stop branch below can still report an honest "there WAS
        // a tour running" even though this same line just cleared it for a non-tour-start message.
        const tourWasActive = deps.tourActive?.() ?? false;
        if (tourWasActive && action?.kind !== "tour-start") deps.tourClear?.();
        // "Watch me work" shares the tour's "type anything to stop": ANY message while the showcase is
        // pending cancels the door's next advance, except a fresh showcase-start (which restashes its
        // own cursor). Same shape as the tour clear just above.
        const showcaseWasActive = deps.showcaseActive?.() ?? false;
        if (showcaseWasActive && action?.kind !== "showcase-start") deps.showcaseClear?.();

        // 1c follow-up: a bare deictic ("go there", "open it") after the desk offered or CITED a place
        // navigates to THAT target — no re-retrieval, so the follow-up can't drift to a different note
        // than the "Read more" link it's answering. Guarded on !action (a real action word still wins)
        // and a stored target (nothing to follow up on before the first navigate/citation).
        const nt = text.trim().toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
        if (!action && rt.lastTarget && deps.navigate && FOLLOWUP_DEICTIC_RE.test(nt)) {
          const dest = rt.lastTarget;
          await minThink();
          await typeOut(`Taking you to ${dest.label}.`);
          await travelAndNavigate(dest.route, dest.route, dest.label, `Here's ${dest.label}.`, "the navigation");
          return { ok: true, ops: [], reply: `Navigating to ${dest.label}` };
        }

        // Route the request. The deterministic actions run first, need no model, and work offline; a
        // null result falls through to the model path. The catalog is loaded lazily and memoized, so a
        // turn that never needs it (clarify, theme, memory) pays no fetch, and one that does pays once.
        let catalogPromise: Promise<NavDest[]> | null = null;
        const getCatalog = (): Promise<NavDest[]> =>
          (catalogPromise ??= deps.loadCatalog ? deps.loadCatalog().catch(() => [] as NavDest[]) : Promise.resolve([]));
        const turn: Turn = {
          tools, log, id, text, action, getCatalog, tourWasActive, showcaseWasActive,
          setBody, setBodyRaw, setChips, offline, modelBlocked, declineModel, narrate, minThink, streamInto, typeOut, travelAndNavigate,
        };
        const det = await deterministicTurn(rt, turn);
        if (det) return det;
        return await modelTurn(rt, turn);
      } catch (err) {
        console.error("[desk] decide failed", err);          // bulletproof: never leave an empty bubble
        setBody(esc("Something went wrong on my end. Try again, or ask something else."), "committed");
        return { ok: false, ops: [], reply: "error", reason: String(err) };
      }
    },
    reset() {
      history.length = 0;
      seq = 0;
      rt.lastTarget = null;
      if (engineState.degraded) { engineState.degraded = false; engineState.promise = null; }   // re-arm a degraded desk to retry loading
    },

    // ONE structured completion — the seam /grain/builder uses to have the model pick a block verb. It
    // shares the desk's engine rather than loading its own, and it shares nothing else: no history,
    // no bubble, no progress bar, because this is a move being chosen rather than a turn being
    // taken. Null on every failure path, and the caller says so out loud: a builder that quietly did
    // nothing when the model could not run would be indistinguishable from a broken one.
    async complete(prompt: string, schema?: JsonSchema): Promise<string | null> {
      if (!deps.makeChatModel) return null;
      const engine = await ensureEngine(() => {});   // SILENT: the caller owns the surface, not the chat
      if (!engine) return null;
      try {
        // Low temperature and JSON mode: picking a move from a fixed vocabulary wants determinism,
        // and on a 0.5B the format flag is most of the difference between a move and a paragraph
        // about a move. Both are grain's own defaults for this adapter, named here so they are tunable.
        return await deps.makeChatModel(engine, { temperature: 0.2, jsonMode: true, schema }).complete(prompt);
      } catch (err) {
        console.error("[desk] structured completion failed", err);
        return null;
      }
    },

    // "Watch me work" agent — re-hydrate the demo on this page after a GO navigated here. The door calls
    // this on arrival ONLY when agent state is stashed (showcaseActive), so a normal navigation never
    // triggers it. Loads the engine SILENTLY (like arrive — no bar on a nav; the visitor already opted
    // in when they started the demo), then takes the next agent turn(s). Any failure clears the state so
    // a dead demo can't wedge future navigations.
    async showcaseResume(applyOp: (op: RenderOp) => void): Promise<void> {
      if (engineState.degraded) { deps.showcaseClear?.(); return; }
      if (!deps.showcaseStateGet?.()) return;               // no demo running — nothing to continue
      // Each hop is a full page load (this is an MPA), so the model RE-INITS here — seconds of silence
      // unless we say so. Drop an immediate "still driving" bubble the moment we land, before the engine
      // comes back, so the arrival never reads as dead.
      applyOp({ target: "chat-log", op: "append", provenance: "ai", commit: "committed",
        html: deps.kit.chatBubble("ai", "grain", deps.kit.chatBody(deps.kit.esc("Still driving — reading this page…")), "Desk") });
      const engine = await ensureEngine(() => {});          // the load bar showed on kickoff; re-init is quiet
      if (!engine) { deps.showcaseClear?.(); return; }
      try { await rt.runAgentTurns(engine, applyOp); }
      catch (err) { console.error("[desk] showcaseResume failed", err); deps.showcaseClear?.(); }
    },

    // Page-arrival awareness (reasoner-driven). Called by the door on load, only when the desk is
    // already warm this session. The door records a successful load of this profile before it
    // allows an arrival greeting, so ordinary navigation never starts a first download. Best-effort and unobtrusive: SILENT engine load (no progress bar on a nav), and if
    // the model can't run, the page is empty, or the parse fails, it's a no-op and the static starter
    // chips stand. When it works: a short "you're on X, here's what's here" greeting + chips the model
    // drew from THIS page's content.
    async arrive(applyOp: (op: RenderOp) => void): Promise<void> {
      if (engineState.degraded) return;
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
