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
import { retrieve, FACTS_ROUTE, type Knowledge } from "./retrieval.ts";
import type { DeskEngine, EngineProgress, ModelProfile } from "./webllm-loader.ts";
import type { ChatStreamOptions } from "@tjakoen/grain/ai/model-chat.ts";
import {
  routeAction, PINNED_CHIP, ACTION_CHIPS,
  // C1 visitor-intent onboarding — the ask's own copy/choices, and the CLARIFY pair it falls back to
  // once the nag-guard says "don't ask again" (same bubble shape either way).
  CLARIFY_PROMPT, CLARIFY_CHOICES, INTENT_PROMPT, INTENT_CHOICES,
} from "./actions.ts";
import { resolveNav, navShortlist, type NavDest } from "./catalog.ts";
// B2 notes filtering — matching a visitor's free-text topic against the REAL tag set (never a model
// guess, law #2). Pure + framework-free (notes-tags.ts), same family as catalog.ts's resolver.
import { matchTags, uniqueTags } from "./notes-tags.ts";
// B3 mail batch archive — matching a visitor's free-text sender phrase against the REAL sender set on
// /mail (never a model guess, law #2). Pure + framework-free (mail-sender.ts), notes-tags.ts's sibling.
import { matchSender } from "./mail-sender.ts";
// B1 contact prefill — the deterministic draft (the visitor's words + a salutation) and the ONE
// registered field surface the desk may fill (never a model-picked selector, law #2). Pure
// (contact-draft.ts), same family as the matchers above.
import { draftMessage, CONTACT_FIELD_SURFACE } from "./contact-draft.ts";
// D1 form builder demo — the closed-set matcher (field-matcher.ts, "Read first" — the ONE thing that
// decides which fields/choices ever exist) plus the demo values drafted for its TEXT fields only
// (form-draft.ts — never a `choices` item, see that file's own banner on why). KNOWN_FIELD_LABELS/
// KNOWN_CHOICE_LABELS name the closed set honestly when a description matches nothing at all.
import { matchSpec, KNOWN_FIELD_LABELS, KNOWN_CHOICE_LABELS } from "./field-matcher.ts";
import { draftFieldValues } from "./form-draft.ts";
// C2 visitor memory — the notepad IS the memory. Write-time sanitize + the one line marker
// (sanitizeMemoryFact, memoryLine) and read-time parseMemories (re-sanitize + cap, for the VISITOR
// NOTES prompt block). Pure (memory.ts), same family as contact-draft.ts.
import { sanitizeMemoryFact, memoryLine, parseMemories } from "./memory.ts";
// A2 guided tour — the fixed, code-enumerated stop list (tour.ts). Zero model: tour-start/tour-stop
// are matched deterministically (actions.ts) and driven from this data, never from the model's own
// judgment of "what's on the site" (CLAUDE.md design law — code enumerates routes, never the model).
import { TOUR_STOPS } from "./tour.ts";
import {
  SHOWCASE_GOAL, SHOWCASE_STEP_CAP, SHOWCASE_MAX_MISSES,
  parseToolCall, validateToolCall, buildAgentSystemPrompt, nextStepCommand, recordDone, resolveAnchor,
  type ShowcaseState, type AgentContext,
} from "./showcase.ts";
// GRAIN's reasoner-kit — the chat bubble markup the desk USED to fork now comes from here (injected
// as deps.kit at runtime; the door URL-imports it). Type-only import (erased) so this stays a
// client-safe module. See grain/ai/reasoner-kit.ts.
import type * as Kit from "@tjakoen/grain/ai/reasoner-kit.ts";
import type { Manifest } from "@tjakoen/grain/ai/manifest.ts";
// The desk's ONE capability catalog (capabilities.ts) — what it can see / navigate / operate, built
// from GRAIN's live-DOM manifest + actions.ts's own closed vocabulary. Both the deterministic
// "capabilities" reply below and the model's canDo prompt feed read from this SAME catalog, so they
// can't drift apart into two different-shaped answers to "what can I do here?".
import { buildCapabilityCatalog, catalogPhrases } from "./capabilities.ts";

/** A note the desk can open ("show the latest blog") — newest-first from /notes.json. `tags` rides
 *  along for B2 notes filtering (notes-tags.ts): optional so older callers/fixtures without it still
 *  type-check (an untagged note just never matches a topic). */
export interface DeskNote { slug: string; title: string; route: string; tags?: string[] }

const joinPhrases = (xs: string[]): string =>
  xs.length <= 1 ? (xs[0] ?? "") : `${xs.slice(0, -1).join(", ")} or ${xs[xs.length - 1]}`;

// The model's own navigation choice, per the NAVIGATE:<route> protocol prompt.ts offers it (scoped to
// the real sitemap-catalog shortlist — see navBlock in prompt.ts). Matched loosely (case-insensitive,
// trims stray whitespace) since a 0.5B doesn't always hit a format byte-exact; the chosen route is then
// validated against the real catalog before we act on it.
const MODEL_NAVIGATE_RE = /^navigate:\s*(\/\S*)\s*$/i;

// The flagship note's slug — the ONE hand-pinned note. Source of truth: content.ts FLAGSHIP_NOTE_SLUG
// (kept in sync by hand; this CLIENT-SAFE reasoner can't import the server content module without
// dragging its Bun.serve deps into the browser bundle). Drives the deterministic open-flagship-note.
const FLAGSHIP_NOTE_SLUG = "ten-times-zero";

// 1c follow-up target — a whole-message deictic reference ("go there", "open it", "take me there")
// with no destination of its own: it means "the place you just offered/cited". Matched against norm()'d
// text so trailing punctuation and casing don't matter. Requires a deictic word (there/it/that/…) so a
// bare verb ("go", "open") never fires — only a genuine "that place I just mentioned" reference does.
const FOLLOWUP_DEICTIC_RE =
  /^(?:(?:go|take me|bring me|open|read|see|show me|show|jump|head)\s+(?:to\s+)?)?(?:there|it|that|that one|this one|the note|the post)$/;

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
  /** "Watch me work" agent: re-hydrate the demo loop on this page after a GO navigated here. The DOOR
   *  calls this (with its applyOp) on arrival, only when agent state is stashed. Loads the engine
   *  silently, then takes the next agent turn(s) on this page. No-op offline or with no state. */
  showcaseResume(applyOp: (op: RenderOp) => void): Promise<void>;
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
function navLinkFor(route: string): string {
  const segs = route.split("/").filter(Boolean);
  return segs.length < 2 ? route : "/" + segs.slice(0, -1).join("/");
}
function humanizeSeg(route: string): string {
  const seg = route.split("/").filter(Boolean).pop();
  return seg ? seg.split("-").map((w) => w[0]!.toUpperCase() + w.slice(1)).join(" ") : "Home";
}
// Trailing-slash-insensitive route compare — "is the hit already on the page we're standing on?".
const stripSlash = (r: string): string => r.replace(/\/+$/, "") || "/";

const OFFLINE_LINE =
  "The desk runs a small AI model in your browser, and this browser can't run it, so the desk is offline. Everything else on the site works as usual.";

// How long the lamp lingers on a clicked nav link before the page actually tears down — the desk's
// OWN "let the click read before we leave" beat, tuned down from 950ms (too slow — 2026-07-13 owner
// call). SEPARATE from grain's own NAVIGATE_SETTLE_MS (ai-dispatch.js, 220ms): that one guards the
// navigate RenderOp itself (any settle in flight gets a beat to finish); this one is the desk's own
// choreography BEFORE it ever emits that op. Named per grain CLAUDE.md lesson #9 — a knob with no
// name can't be found, let alone tuned twice. Exported: the door's OWN tour leg (desk-door.ts,
// runTourLeg) reuses this exact knob for its intermediate-stop glide, so the two choreographies —
// the reasoner's first leg and the door's later ones — can't drift apart in pacing.
export const NAV_GLIDE_MS = 550;

export interface DeskDeps {
  /** The model profile (webllm-loader.ts) — the model id's tuning: generation caps, penalties, the
   *  prompt budget, and the load-bar copy. desk-door injects it, so every size-dependent knob below
   *  flows from ONE choice (the weak 0.5B — the only model the demo runs). */
  profile: ModelProfile;
  /** WebGPU (+ memory) available? */
  probe: () => Promise<boolean>;
  /** Load + warm the engine for the profile, reporting download progress. */
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
   *  same "stash BEFORE navigate" discipline mailTaskSet follows (the navigate tears this down). */
  contactTaskSet?: (message: string) => void;
  // ---- D1 form builder demo ("build me a form that asks for a name and an email") — the desk
  // navigates to /builder?ask=<the description>, a plain GET the server answers with matchSpec's own
  // rendered form (this reasoner never renders anything itself). It then prefills the TEXT fields
  // matchSpec matched with form-draft.ts's demo values through the SAME cross-page-stash idiom
  // mailTaskSet/contactTaskSet use — the navigate tears this reasoner instance down before /builder
  // ever loads. Never stashes a value for a `choices` item — see form-draft.ts's own banner on why a
  // <select> is never a fill target here. ----
  /** Stash the ALREADY-DRAFTED demo values (surface → text, form-draft.ts) for the door to fill on
   *  arrival after navigating to /builder — same "stash BEFORE navigate" discipline every other
   *  cross-page task here follows (the navigate tears this down). */
  formTaskSet?: (values: Record<string, string>) => void;
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

// A4 theme switching — the pause between successive cycle-theme clicks when hopping more than one
// flavor forward. Named per CLAUDE.md lesson #9 (a knob with no name can't be found, let alone tuned
// twice): the whole point of driving the VISIBLE control rather than a private channel is that a
// visitor watching the demo sees the flavors step past one at a time, so this can't be zero.
const THEME_CLICK_BEAT_MS = 180;

// B3 mail batch archive — the pause between successive letters as the desk archives them one at a
// time. Named per CLAUDE.md lesson #9 (a knob with no name can't be found, let alone tuned twice):
// driving the visible row + reader Archive button rather than a private channel only reads honestly if
// the visitor actually SEES each letter go, so this can't be zero. Exported: the door's OWN cross-page
// mail task (desk-door.ts, runMailTask) reuses this exact knob, so the reasoner's first-page run and
// the door's cross-page run can't drift apart in pacing (the NAV_GLIDE_MS precedent, above).
export const MAIL_ARCHIVE_BEAT_MS = 650;

// B1 contact prefill — the pause after the lamp lands on the compose field, before the draft fills in
// (and again before the lamp releases, so the visitor READS what just appeared). Named per CLAUDE.md
// lesson #9; exported so the door's OWN cross-page contact task (desk-door.ts, runContactTask) reuses
// the exact knob and the two choreographies can't drift in pacing (the MAIL_ARCHIVE_BEAT_MS precedent).
export const CONTACT_FILL_BEAT_MS = 650;

// D1 form builder demo — the pause between successive field fills as the desk drafts each demo value
// in on /builder, so a visitor watching sees each one land rather than the whole form snapping full
// at once. Named per CLAUDE.md lesson #9; exported so the door's OWN cross-page fill (desk-door.ts,
// runFormTask) reuses the exact knob, the CONTACT_FILL_BEAT_MS/MAIL_ARCHIVE_BEAT_MS precedent.
export const FORM_FILL_BEAT_MS = 650;

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
// C1 visitor-intent onboarding — code-chosen questions PREPENDED to the generic pool once a visitor
// has answered the onboarding ask, so their follow-up chips lean toward what they said they came for.
// A couple of these overlap FOLLOWUP_POOL's own entries word-for-word (by design — they're the right
// questions for that intent either way); pickFollowups' own de-dupe (against what's already been
// picked, not just what's been asked) keeps a shared entry from appearing twice.
const INTENT_FOLLOWUPS: Record<"recruiter" | "developer" | "student", string[]> = {
  recruiter: ["Summarize TJ's experience", "What did TJ build?"],
  developer: ["What is GRAIN?", "What does MILL do?"],
  student: ["Why teach with AI?"],
};
function pickFollowups(
  asked: string, history: ChatMessage[], intent?: "recruiter" | "developer" | "student", k = 3,
): string[] {
  const seen = new Set([asked.trim().toLowerCase(), ...history.map((m) => m.content.trim().toLowerCase())]);
  const pool = [...(intent ? INTENT_FOLLOWUPS[intent] : []), ...FOLLOWUP_POOL];
  const out: string[] = [];
  for (const q of pool) {
    if (seen.has(q.toLowerCase()) || out.includes(q)) continue;
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
// container keeps its data-surface so a later turn can replace it again. Exported: the door's OWN
// tour leg (desk-door.ts, runTourLeg) composes the SAME chip markup for its during/after-tour rows,
// rather than forking the shape.
export const suggestChipsHtml = (list: string[], pin = true): string => {
  // Always pin "What can I do here?" first (the showcase's always-present chip), then the given set
  // (de-duped against the pin) — UNLESS `pin` is false: the tour's intermediate-stop row (door-driven)
  // wants just its one "Stop the tour" affordance, not the full always-present chip alongside it.
  const chips = pin ? [PINNED_CHIP, ...list.filter((s) => s.toLowerCase() !== PINNED_CHIP.toLowerCase())] : list;
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
  // The model profile — read for EVERY size-dependent knob below (generation caps, prompt budget, penalties).
  const profile = deps.profile;
  const history: ChatMessage[] = [];             // last turns (buildPrompt clips the window)
  // 1c: the last place the desk navigated to OR cited ("Read more: X") this session, so a bare
  // follow-up ("go there") reuses THAT target instead of re-retrieving (which drifted to a different
  // note between "take me to the flagship note" and "go there"). Cleared on reset.
  let lastTarget: { route: string; label: string } | null = null;
  // GRAIN's chat markup, via the injected kit (arg order adapted to the desk's call sites).
  const bubble = deps.kit.chatBubble;
  const bodySpan = (surface: string, inner = ""): string => deps.kit.chatBody(inner, surface);

  // Load the engine once (probe-gated). Returns null on unavailable/failed and flips the desk
  // offline. Memoized so only the first chat.send pays the download; later sends reuse the engine.
  // A failed load just degrades to offline (the try/catch below) — there's one model, nothing lighter.
  async function ensureEngine(onProgress: (p: EngineProgress) => void): Promise<DeskEngine | null> {
    if (degraded) return null;
    if (!enginePromise) {
      enginePromise = (async () => {
        if (!(await deps.probe())) return null;
        return await deps.loadEngine(profile, onProgress);
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

  // ---- "Watch me work" AGENT loop. The 0.5B drives the site itself: each turn it emits ONE tool call,
  // the harness validates it against the live page (routes/anchors must be real; law #2), applies the
  // real op, records it, and advances. A GO ends the on-page loop (stash state + navigate; the door's
  // showcaseResume re-hydrates on arrival). Shared by showcase-start (via tools.emit) and showcaseResume
  // (via the door's applyOp), so `emit` is the only I/O it takes. Not a canned animation — nothing runs
  // until the model is loaded, and every action is the model's own choice. ----
  const agentDelay = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
  const AGENT_MAX_TOKENS = 64;   // one action line (a NOTE/DRAFT sentence at most)

  async function buildAgentContext(): Promise<AgentContext> {
    const catalog = deps.loadCatalog ? await deps.loadCatalog().catch(() => [] as NavDest[]) : [];
    const info = deps.pageInfo?.() ?? { route: "/", title: "" };
    const manifest = deps.pageManifest?.();
    const hasNotepad = !!manifest?.targets.some((tt) => tt.accepts.includes("note.append"));
    // CURATE the routes the agent may choose from: the whole sitemap would drown the 0.5B's tiny window,
    // so offer only the top-level sections (depth ≤ 1) plus the flagship note the goal calls for. The
    // list stays short + coherent, and validateToolCall pins GO to exactly this set.
    const seg = (r: string): number => (r.replace(/\/+$/, "") || "/").split("/").filter(Boolean).length;
    const flagshipRoute = `/notes/${FLAGSHIP_NOTE_SLUG}`;
    const routes = catalog.filter((d) => seg(d.route) <= 1 || (d.route.replace(/\/+$/, "") || "/") === flagshipRoute);
    // Keep the anchor list SHORT (a 0.5B drowns in a dozen slugs), and float the goal's key section to
    // the front so "HIGHLIGHT 1" (what the next-step hint suggests) lands on the part that matters.
    const KEY_ANCHOR = "the-one-number-that-matters";
    const rawAnchors = deps.pageAnchors?.() ?? [];
    const anchors = (rawAnchors.includes(KEY_ANCHOR) ? [KEY_ANCHOR, ...rawAnchors.filter((a) => a !== KEY_ANCHOR)] : rawAnchors).slice(0, 6);
    return {
      route: info.route,
      title: info.title || info.route,
      routes,
      anchors,
      hasNotepad,
      hasContact: deps.hasContactField?.() ?? false,
    };
  }

  async function runAgentTurns(engine: DeskEngine, emit: (op: RenderOp) => void): Promise<void> {
    const say = (text: string): void =>
      emit({ target: "chat-log", op: "append", provenance: "ai", commit: "committed",
        html: deps.kit.chatBubble("ai", "grain", deps.kit.chatBody(deps.kit.esc(text)), "Desk") });
    const finish = (text: string): void => {
      emit(deps.kit.spotlightOp("screen", { active: false }));
      say(text);
      deps.showcaseClear?.();
      emit({ target: "suggest-chips", op: "replace", provenance: "ai", commit: "committed",
        html: suggestChipsHtml(["Take me to the flagship note", "What is GRAIN?"]) });
    };
    const strip = (r: string): string => r.replace(/\/+$/, "") || "/";

    const ctx = await buildAgentContext();
    let misses = 0;
    for (;;) {
      const state = deps.showcaseStateGet?.() ?? null;
      if (!state) return;   // cancelled ("type anything to stop") or finished
      if (state.step >= SHOWCASE_STEP_CAP) { finish("That's the demo — I drove the site end to end. Ask me anything, or explore on your own."); return; }

      // One agent turn, in up to two passes. Pass 1: the model chooses FREELY (a bare imperative cue —
      // never a question, which the 0.5B parroted back as chatter). Pass 2, only if pass 1 was invalid:
      // a HARDENED retry that asks it to output exactly the suggested command. The mechanical steps
      // (GO/HIGHLIGHT/DONE) don't need the model's judgment, so a malformed one shouldn't wedge the demo;
      // the authored steps (NOTE/DRAFT) seed a coherent line the model keeps or replaces. The model still
      // drives when it produces valid output — the forced pass is a floor, not a script.
      const runPass = async (user: string, temp: number): Promise<string> => {
        let raw = "";
        for await (const delta of deps.streamChat(engine, [
          { role: "system", content: buildAgentSystemPrompt(state, ctx) },
          { role: "user", content: user },
        ], { maxTokens: AGENT_MAX_TOKENS, temperature: temp, topP: profile.topP,
          frequencyPenalty: profile.frequencyPenalty, presencePenalty: profile.presencePenalty })) raw += delta;
        return raw;
      };
      let call: ReturnType<typeof parseToolCall>;
      let check: ReturnType<typeof validateToolCall>;
      try {
        const raw1 = await runPass("Reply now with one action line.", 0.2);
        call = parseToolCall(raw1);
        check = validateToolCall(call, ctx);
        if (!check.ok) {
          const forced = nextStepCommand(state, ctx);
          const raw2 = await runPass(`Output exactly this line and nothing else:\n${forced}`, 0);
          call = parseToolCall(raw2);
          check = validateToolCall(call, ctx);
        }
      } catch (err) {
        console.error("[desk] agent turn failed", err);
        finish("Something interrupted the demo — ask me anything, or try again.");
        return;
      }

      if (!check.ok) {
        // even the forced pass failed — feed the reason back, bounded so a weak model can't spin forever.
        misses++;
        deps.showcaseStateSet?.({ ...state, done: recordDone(state.done, `rejected ${call.kind}: ${check.why}`) });
        if (misses >= SHOWCASE_MAX_MISSES) { finish("I'll wrap the demo up there. Ask me anything, or explore on your own."); return; }
        continue;
      }
      misses = 0;

      if (call.kind === "done") { finish("That's me — one AI driving the whole site through the same door you use. Ask me anything."); return; }

      if (call.kind === "highlight") {
        const id = resolveAnchor(call.anchor, ctx.anchors)!;   // validated above, so it resolves
        say("Here's the part that matters.");
        emit(deps.kit.narrateOp("finds", `the "${id}" section`));
        emit(deps.kit.spotlightOp(`anchor:${id}`, { active: true }));
        await agentDelay(120);
        deps.scrollToAnchor?.(id);
        await agentDelay(1500);
        emit(deps.kit.spotlightOp("screen", { active: false }));
        deps.showcaseStateSet?.({ ...state, done: recordDone(state.done, `HIGHLIGHT ${id}`), step: state.step + 1 });
        continue;
      }

      if (call.kind === "note") {
        say("Saving a takeaway to your notepad.");
        emit(deps.kit.narrateOp("writes", "a takeaway to the notepad"));
        emit(deps.kit.noteAppendOp(call.text, "ai"));
        deps.revealNotepad?.();
        emit(deps.kit.spotlightOp("notepad", { active: true }));
        await agentDelay(1400);
        emit(deps.kit.spotlightOp("screen", { active: false }));
        deps.showcaseStateSet?.({ ...state, done: recordDone(state.done, `NOTE ${call.text}`), step: state.step + 1 });
        continue;
      }

      if (call.kind === "draft") {
        // open the visible compose panel, spotlight the ONE registered field, fill it — never submit.
        if (deps.openCompose?.()) {
          say("Drafting a message to TJ — I'll fill it, but sending stays yours.");
          emit(deps.kit.narrateOp("drafts", "a message to TJ (never sent)"));
          emit(deps.kit.spotlightOp(CONTACT_FIELD_SURFACE, { active: true }));
          await agentDelay(CONTACT_FILL_BEAT_MS);
          try { emit(deps.kit.fillOp(CONTACT_FIELD_SURFACE, call.text)); }
          catch (err) { console.error("[desk] agent draft rejected", err); }
          await agentDelay(1200);
          emit(deps.kit.spotlightOp("screen", { active: false }));
        }
        deps.showcaseStateSet?.({ ...state, done: recordDone(state.done, `DRAFT ${call.text}`), step: state.step + 1 });
        continue;
      }

      // GO: the only tool that ends the page. Record + stash BEFORE navigating (the navigate tears the
      // page down), run the same lamp-to-nav choreography the reasoner's own navigation uses, then hand
      // off — the door's showcaseResume picks the loop back up on the destination page.
      if (call.kind === "go") {
        const dest = ctx.routes.find((d) => strip(d.route) === strip(call.route))!;
        deps.showcaseStateSet?.({ ...state, done: recordDone(state.done, `GO ${dest.route}`), step: state.step + 1 });
        emit(deps.kit.narrateOp("clicks", dest.label));
        deps.revealNav?.(dest.route);
        emit(deps.kit.spotlightOp(`nav:${dest.route}`, { active: true, click: true }));
        await agentDelay(NAV_GLIDE_MS);
        deps.navigate?.(dest.route);
        return;
      }
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
        if (!action && lastTarget && deps.navigate && FOLLOWUP_DEICTIC_RE.test(nt)) {
          const dest = lastTarget;
          await minThink();
          await typeOut(`Taking you to ${dest.label}.`);
          await travelAndNavigate(dest.route, dest.route, dest.label, `Here's ${dest.label}.`, "the navigation");
          return { ok: true, ops: [], reply: `Navigating to ${dest.label}` };
        }

        if (action?.kind === "capabilities") {
          const where = deps.pageInfo?.().title;
          // the ONE catalog: everything this page's live manifest reports as operable/readable, plus
          // the desk's own built-in verbs (actions.ts's ACTION_CAPABILITIES) — never a hand-written
          // sentence that can drift from what routeAction and the manifest actually offer.
          const manifest = deps.pageManifest?.();
          const catalog = deps.loadCatalog ? await deps.loadCatalog().catch(() => [] as NavDest[]) : [];
          const phrases = catalogPhrases(buildCapabilityCatalog({ manifest, hasDestinations: catalog.length > 0 }));
          const line = `Here's what I can do${where ? ` from ${where}` : ""}: ${joinPhrases(phrases)} — just ask. Ask me, or tap a chip below. I answer here and narrate my steps in the terminal.`;
          await minThink();
          await typeOut(line);
          setChips([...ACTION_CHIPS, "Take me to GRAIN", "Open the notes"]);
          return { ok: true, ops: [], reply: line };
        }

        // A2 guided tour — stop. Deterministic + offline: an honest line either way, distinguishing a
        // real cancel from "there was nothing to cancel" (tourWasActive was captured above, BEFORE the
        // generic clear a few lines up already cleared the cursor for this very message).
        if (action?.kind === "tour-stop") {
          await minThink();
          const line = (tourWasActive || showcaseWasActive)
            ? "Okay, stopping here. Ask me anything, or wander on your own."
            : "There's nothing running right now.";
          await typeOut(line);
          setChips([...ACTION_CHIPS, "Take me to GRAIN"]);
          return { ok: true, ops: [], reply: line };
        }

        // A2 guided tour — start. Deterministic + offline: the stop list, its copy, and the pacing all
        // come from tour.ts (code, never the model). This reasoner drives only the FIRST leg; every
        // leg after rides the door's own runTourLeg (desk-door.ts) since no chat.send happens between
        // stops — travelAndNavigate's `arrive` stash is what hands the announce across each page load.
        if (action?.kind === "tour-start") {
          if (!deps.navigate) {
            // Matches how open-latest-note degrades when it can't drive the page: an honest decline,
            // no crash, no pretending the tour started.
            await minThink();
            const line = "I can't drive the page from here, so I can't run the tour. Ask me something else instead.";
            await typeOut(line);
            return { ok: false, ops: [], reply: line, reason: "no navigate dep" };
          }
          const here = stripSlash(deps.pageInfo?.().route ?? "/");
          const first = TOUR_STOPS[0]!;
          const second = TOUR_STOPS[1]!;
          await minThink();
          if (here === stripSlash(first.route)) {
            // Already standing on stop 0 — fold the intro and stop 0's own announce into one typed
            // line (no navigation needed to "arrive" somewhere we already are), then head to stop 1.
            const intro =
              "Gladly. Four quick stops: this front page, GRAIN, BATCH, and the notes. Type anything to " +
              "stop early. You're on the first stop now: TJ's front page, home of the resume and the doors into everything else.";
            await typeOut(intro);
            // tourSet BEFORE travelAndNavigate: navigate tears the page down, so the cursor for the
            // NEXT stop must already be stashed before we leave.
            deps.tourSet?.(1);
            await travelAndNavigate(second.navLink, second.route, second.label, second.announce, "the navigation");
            return { ok: true, ops: [], reply: intro };
          }
          const intro = "Gladly. Four quick stops: the front page, GRAIN, BATCH, and the notes. Type anything to stop early.";
          await typeOut(intro);
          deps.tourSet?.(0);
          await travelAndNavigate(first.navLink, first.route, first.label, first.announce, "the navigation");
          return { ok: true, ops: [], reply: intro };
        }

        // "Watch me work" — the AGENT demo (showcase.ts). Unlike every deterministic action above, this
        // NEEDS the model: nothing moves until it's loaded (the honest fix — no canned animation before
        // the AI exists). Load it with the visible bar, then hand the 0.5B the goal and let IT drive:
        // runAgentTurns loops on this page (the model chooses each action, the harness validates + applies
        // it), and a GO carries the agent state across the load for the door's showcaseResume to continue.
        if (action?.kind === "showcase-start") {
          if (!deps.navigate) {
            await minThink();
            const line = "I can't drive the page from here, so I can't run the demo. Ask me something else instead.";
            await typeOut(line);
            return { ok: false, ops: [], reply: line, reason: "no navigate dep" };
          }
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
          // the model is up — settle the load bubble into the kickoff line, then let the agent take over.
          setBody(esc("On it — watch me work. I'll drive the site myself, one step at a time. Type anything to stop me."), "committed");
          deps.showcaseStateSet?.({ goal: SHOWCASE_GOAL, done: [], step: 0 });
          await runAgentTurns(engine, (op) => tools.emit(op));
          return { ok: true, ops: [], reply: "Running the demo." };
        }

        // A4 theme switching — deterministic + offline (zero model, runs before the load like every
        // other action here). The desk drives the SAME visible status-bar buttons a human would
        // (revealNotepad's pattern, no private channel), validating against the LIVE DOM both before
        // deciding what to click and after, to confirm the click actually landed — CLAUDE.md's
        // "validate twice" design law, and the honest thing to do across a demo that runs on every page.
        if (action?.kind === "theme") {
          await minThink();
          if (!deps.themeState || (!deps.clickCycleTheme && !deps.clickToggleScheme)) {
            const line = "I can't reach the theme controls here.";
            await typeOut(line);
            return { ok: false, ops: [], reply: line, reason: "no theme deps" };
          }
          const target = action.target;

          if (target === "dark" || target === "light") {
            if (!deps.clickToggleScheme) {
              const line = "I can't reach the theme controls here.";
              await typeOut(line);
              return { ok: false, ops: [], reply: line, reason: "no toggle-scheme dep" };
            }
            const before = deps.themeState();
            if (before.scheme === target) {
              const line = `It's already ${target} here.`;
              await typeOut(line);
              return { ok: true, ops: [], reply: line };
            }
            narrate("clicks", "the light and dark switch");
            deps.clickToggleScheme();
            const line = `There you go, ${target} mode.`;
            await typeOut(line);
            return { ok: true, ops: [], reply: line };
          }

          if (!deps.clickCycleTheme) {
            const line = "I can't reach the theme controls here.";
            await typeOut(line);
            return { ok: false, ops: [], reply: line, reason: "no cycle-theme dep" };
          }

          if (target === "next") {
            narrate("clicks", "the theme control");
            deps.clickCycleTheme();
            const after = deps.themeState();
            const line = `Switched the theme to ${after.flavor}.`;
            await typeOut(line);
            return { ok: true, ops: [], reply: line };
          }

          // a named flavor — validated against the LIVE themes list (not actions.ts's FLAVORS mirror):
          // this page's real data-themes is the truth.
          const state = deps.themeState();
          const targetIdx = state.themes.indexOf(target);
          if (targetIdx < 0) {
            const options = state.themes.length ? joinPhrases(state.themes) : "no themes";
            const line = `The themes here are ${options}. Which one would you like?`;
            await typeOut(line);
            return { ok: false, ops: [], reply: line, reason: "unknown flavor" };
          }
          if (state.flavor === target) {
            const line = `You're already on ${target}.`;
            await typeOut(line);
            return { ok: true, ops: [], reply: line };
          }
          const currentIdx = state.themes.indexOf(state.flavor);
          const clicks = (targetIdx - (currentIdx < 0 ? 0 : currentIdx) + state.themes.length) % state.themes.length;
          narrate("clicks", "the theme control");
          for (let i = 0; i < clicks; i++) {
            deps.clickCycleTheme();
            if (i < clicks - 1) await tools.delay(THEME_CLICK_BEAT_MS);   // let the visitor SEE each flavor step past
          }
          const after = deps.themeState();
          if (after.flavor !== target) {
            const line = "Hmm, that didn't take. Try the theme button up top.";
            await typeOut(line);
            return { ok: false, ops: [], reply: line, reason: "click didn't land" };
          }
          const line = `Switched the theme to ${target}.`;
          await typeOut(line);
          return { ok: true, ops: [], reply: line };
        }

        // B2 notes filtering — "show me notes about teaching". Deterministic + offline: match the
        // topic against the REAL tag set (notes-tags.ts, never a model guess — law #2) BEFORE deciding
        // anything about the UI. A miss falls through (no return) to the model path a few lines down —
        // same idiom as the A1 deep-link miss above: the deterministic path only claims the turn when
        // it can actually deliver, so an unmatched topic still gets an honest grounded chat answer
        // instead of a doomed "0 results" filter.
        if (action?.kind === "notes-filter") {
          const notes = (await deps.listNotes?.()) ?? [];
          const matched = matchTags(action.topic, uniqueTags(notes));
          if (matched.length) {
            const tagLabel = joinPhrases(matched);
            const onNotes = !!deps.pageInfo && stripSlash(deps.pageInfo().route) === "/notes";
            if (onNotes) {
              // Already standing on the feed — drive the VISIBLE tag chips a human would tap
              // (revealNotepad's pattern, no private channel), validating twice: only click a tag the
              // live DOM actually carries as a chip, then confirm each click actually checked the box
              // before claiming success (CLAUDE.md's "validate twice" design law).
              await minThink();
              if (!deps.notesTagChips || !deps.clickNotesTag) {
                const line = "I can't reach the tag filter here.";
                await typeOut(line);
                return { ok: false, ops: [], reply: line, reason: "no notes-tag deps" };
              }
              const live = deps.notesTagChips();
              const onPage = matched.filter((t) => live.includes(t));
              if (!onPage.length) {
                const line = `I don't see a "${tagLabel}" tag on this page yet.`;
                await typeOut(line);
                return { ok: false, ops: [], reply: line, reason: "tag not on page" };
              }
              narrate("clicks", "the tag filter");
              const landed = onPage.filter((t) => deps.clickNotesTag!(t));
              if (!landed.length) {
                const line = "Hmm, that didn't take. Try the tag chips above the feed.";
                await typeOut(line);
                return { ok: false, ops: [], reply: line, reason: "click didn't land" };
              }
              const count = deps.visibleNoteCount?.();
              const countBit = count === undefined ? "." : ` — ${count} match${count === 1 ? "" : "es"}.`;
              const line = `Filtering the notes by ${joinPhrases(landed)}${countBit} Tap the chip again to clear.`;
              await typeOut(line);
              return { ok: true, ops: [], reply: line };
            }
            // elsewhere on the site — travel to the filtered feed. The destination island's own
            // applyQueryTags (content.ts) checks the matching chips on load, so there's no extra
            // arrival work here beyond the announce.
            await minThink();
            await typeOut(`The notes have a ${tagLabel} tag — filtering the feed for you.`);
            await travelAndNavigate(
              "/notes", `/notes?tag=${matched.map(encodeURIComponent).join(",")}`, "Notes",
              `Here are the notes tagged ${tagLabel}.`, "the navigation",
            );
            return { ok: true, ops: [], reply: `Filtering notes by ${tagLabel}` };
          }
          // no real tag matched — fall through, no return.
        }

        // B3 mail batch archive — "archive everything from BREAD CI". Deterministic + offline, unlike
        // every OTHER deterministic action above: an archive VERB must never reach the 0.5B (a "no such
        // sender" miss is a hard, honest decline here, not a fall-through to a grounded chat guess —
        // the model has no business inventing whether a sender's mail exists).
        if (action?.kind === "mail-archive") {
          const onMail = !!deps.pageInfo && stripSlash(deps.pageInfo().route) === "/mail";

          if (onMail) {
            await minThink();
            if (!deps.mailSenders || !deps.mailItemsFrom || !deps.archiveMailItem) {
              const line = "I can't reach the mailbox from here.";
              await typeOut(line);
              return { ok: false, ops: [], reply: line, reason: "no mail deps" };
            }
            // Enumerate the REAL senders off the live inbox rows — never a model guess (law #2) — and
            // match the visitor's raw phrase against them (mail-sender.ts).
            const senders = deps.mailSenders();
            const matched = matchSender(action.sender, senders);
            if (!matched) {
              const known = senders.length ? joinPhrases(senders) : "no one";
              const line = `I don't see any mail from "${action.sender}" in the inbox — the senders here are ${known}.`;
              await typeOut(line);
              return { ok: false, ops: [], reply: line, reason: "no such sender" };
            }
            const items = deps.mailItemsFrom(matched);
            if (!items.length) {
              // Idempotent re-ask: a sender that's real but already fully archived is a normal, honest
              // "nothing to do" — not an error.
              const line = `Nothing from ${matched} left in the inbox.`;
              await typeOut(line);
              return { ok: true, ops: [], reply: line };
            }

            narrate("archives", `the mail from ${matched}`);
            const landed: string[] = [];
            for (const item of items) {
              // Click the row, letting the visitor SEE each letter light up before it moves —
              // MAIL_ARCHIVE_BEAT_MS is the named pace knob (same "validate twice" honesty contract as
              // the A4 theme + B2 notes-tag clicks: the row's OWN data-folder is re-read afterward).
              tools.emit(deps.kit.spotlightOp(item.surface, { active: true, click: true }));
              await tools.delay(MAIL_ARCHIVE_BEAT_MS);
              if (deps.archiveMailItem(item.id)) landed.push(item.id);
            }
            tools.emit(deps.kit.spotlightOp("screen", { active: false }));

            if (!landed.length) {
              const line = "Hmm, that didn't take. Try the Archive button in the reader.";
              await typeOut(line);
              return { ok: false, ops: [], reply: line, reason: "click didn't land" };
            }
            const n = landed.length;
            const countBit = n === items.length ? `${n}` : `${n} of ${items.length}`;
            const line = `Archived ${countBit} letter${n === 1 ? "" : "s"} from ${matched}. They're in the Archive folder now.`;
            await typeOut(line);
            return { ok: true, ops: [], reply: line };
          }

          // elsewhere on the site — stash the RAW sender phrase and travel to the mailbox; this
          // reasoner instance doesn't survive the navigate (the MPA tears the page down), so the door's
          // OWN cross-page task (desk-door.ts, runMailTask) does the matching + archiving once the
          // mailbox settles, using the SAME matchSender + MAIL_ARCHIVE_BEAT_MS this branch would.
          if (deps.mailTaskSet && deps.navigate) {
            await minThink();
            const line = `Heading to the mail panel to archive the mail from ${action.sender}.`;
            await typeOut(line);
            deps.mailTaskSet(action.sender);   // stash BEFORE navigating — the navigate tears this down
            await travelAndNavigate("/mail", "/mail", "Mail", "Here's the mailbox.", "the navigation");
            return { ok: true, ops: [], reply: line };
          }
          await minThink();
          const line = "I can't reach the mailbox from here.";
          await typeOut(line);
          return { ok: false, ops: [], reply: line, reason: "no mail deps" };
        }

        // B1 contact prefill — "tell TJ I want to talk about grain". Deterministic + offline: the
        // draft is the visitor's own words (contact-draft.ts, never the 0.5B), the target is the ONE
        // registered field named in code (law #2), and the fill goes through grain's field.set/`fill`
        // op — so Send stays the visitor's alone (no submit verb exists to call).
        if (action?.kind === "contact-message") {
          const draft = draftMessage(action.message);
          if (!draft) {
            await minThink();
            const line = "What would you like the message to say?";
            await typeOut(line);
            return { ok: false, ops: [], reply: line, reason: "empty draft" };
          }
          const onMail = !!deps.pageInfo && stripSlash(deps.pageInfo().route) === "/mail";

          if (onMail) {
            await minThink();
            if (!deps.openCompose || !deps.contactFieldValue) {
              const line = "I can't reach the compose panel from here.";
              await typeOut(line);
              return { ok: false, ops: [], reply: line, reason: "no contact deps" };
            }
            // Open the SAME compose panel a human would (the visible ✎ Compose button), and only
            // fill a panel that actually opened — validate before, not just after.
            if (!deps.openCompose()) {
              const line = "Hmm, the compose panel won't open here. Try the ✎ Compose button.";
              await typeOut(line);
              return { ok: false, ops: [], reply: line, reason: "compose didn't open" };
            }
            narrate("drafts", "a message in the compose panel");
            tools.emit(deps.kit.spotlightOp(CONTACT_FIELD_SURFACE, { active: true }));
            await tools.delay(CONTACT_FILL_BEAT_MS);
            try {
              tools.emit(deps.kit.fillOp(CONTACT_FIELD_SURFACE, draft));
            } catch {
              // fillOp throws at compose time on an unsafe value (over grain's cap / control chars) —
              // decline honestly rather than letting a too-long ask die silently at the dispatcher.
              tools.emit(deps.kit.spotlightOp("screen", { active: false }));
              const line = "That message is too long for me to draft — shorten it and I'll fill it in.";
              await typeOut(line);
              return { ok: false, ops: [], reply: line, reason: "unsafe draft value" };
            }
            await tools.delay(CONTACT_FILL_BEAT_MS);
            tools.emit(deps.kit.spotlightOp("screen", { active: false }));
            // Validate twice: the field's OWN value must read the draft back, or the fill didn't land.
            if (deps.contactFieldValue() !== draft) {
              const line = "Hmm, that didn't take — the message field stayed empty. Try typing it in.";
              await typeOut(line);
              return { ok: false, ops: [], reply: line, reason: "fill didn't land" };
            }
            const line = "Drafted your message in the compose panel — read it over, edit anything, and hit Send. Sending stays yours.";
            await typeOut(line);
            return { ok: true, ops: [], reply: line };
          }

          // elsewhere on the site — stash the ALREADY-DRAFTED message and travel to the mailbox; this
          // reasoner instance doesn't survive the navigate (the MPA tears the page down), so the
          // door's own cross-page task (desk-door.ts, runContactTask) opens the compose and fills the
          // same field once /mail settles, at the same CONTACT_FILL_BEAT_MS pace.
          if (deps.contactTaskSet && deps.navigate) {
            await minThink();
            const line = "Heading to the mail panel to draft that for you — you'll review and send it.";
            await typeOut(line);
            deps.contactTaskSet(draft);   // stash BEFORE navigating — the navigate tears this down
            await travelAndNavigate("/mail", "/mail", "Mail", "Here's the compose panel.", "the navigation");
            return { ok: true, ops: [], reply: line };
          }
          await minThink();
          const line = "I can't reach the compose panel from here.";
          await typeOut(line);
          return { ok: false, ops: [], reply: line, reason: "no contact deps" };
        }

        // D1 form builder demo — "build me a form that asks for a name and an email". Deterministic +
        // offline: matchSpec (field-matcher.ts) is the ONE thing that ever decides which fields/choices
        // exist — this handler never picks a field itself (law #2). Unlike B1/B3, there's no on-page
        // branch: /builder renders from its OWN query string on a plain GET, so every ask is a fresh
        // navigation, even when the visitor is already standing on /builder.
        if (action?.kind === "form-build") {
          const spec = matchSpec(action.description);
          await minThink();
          if (!spec.fields.length && !spec.choices.length) {
            // Nothing matched at all — an honest decline naming the REAL closed set, never a vague
            // "I don't understand". An action verb never falls through to the model.
            const known = joinPhrases([...KNOWN_FIELD_LABELS, ...KNOWN_CHOICE_LABELS]);
            const line = spec.unsupported.length
              ? `I can't build that yet. ${spec.unsupported.map((u) => u.reason).join(" ")} I can add ${known}.`
              : `I build forms from a fixed list of fields, and nothing in that asked for one of them. I can add ${known}.`;
            await typeOut(line);
            return { ok: false, ops: [], reply: line, reason: "no fields matched" };
          }
          if (!deps.navigate) {
            const line = "I can't navigate from here, so I can't build the form. Ask me something else instead.";
            await typeOut(line);
            return { ok: false, ops: [], reply: line, reason: "no navigate dep" };
          }
          const href = `/builder?ask=${encodeURIComponent(action.description)}`;
          const values = draftFieldValues(spec.fields);   // TEXT fields only — never a `choices` item
          const line = "Building that form now, and I'll fill in a few demo values so you can see it live.";
          await typeOut(line);
          if (Object.keys(values).length) deps.formTaskSet?.(values);   // stash BEFORE navigating
          await travelAndNavigate("/builder", href, "Builder", "Here's the form.", "the navigation");
          return { ok: true, ops: [], reply: line };
        }

        // C2 visitor memory — "remember I'm here about grain". Deterministic + offline, like every
        // action above: an action verb has no model tail (B3's archive, B1's draft — same idiom), so
        // this never touches the engine. The 0.5B never composes or edits the fact — memory.ts's
        // write-time sanitize is the only cleanup the visitor's own words get, and an over-cap or
        // now-empty (protocol-tokens-only) fact is an honest DECLINE, never a silent truncation
        // (fillOp's "too long to draft" precedent). Manifest-guarded on note.append, note-write's own
        // guard, since v1 assumes the notepad is in the frame everywhere but never trusts that blindly.
        if (action?.kind === "memory-set") {
          const hasNotepad = !!deps.pageManifest?.().targets.some((tt) => tt.accepts.includes("note.append"));
          await minThink();
          if (!hasNotepad) {
            const line = "I don't see a notepad here to remember that on.";
            await typeOut(line);
            return { ok: false, ops: [], reply: line, reason: "no notepad surface" };
          }
          const fact = sanitizeMemoryFact(action.fact);
          if (!fact) {
            const line = "That's too long (or nothing at all) for me to remember as one fact — try something shorter and plainer.";
            await typeOut(line);
            return { ok: false, ops: [], reply: line, reason: "empty or over-cap fact" };
          }
          narrate("writes", "a memory to the notepad");
          tools.emit(deps.kit.noteAppendOp(memoryLine(fact), "ai"));
          tools.emit(deps.kit.spotlightOp("notepad", { active: true }));
          deps.revealNotepad?.();
          const line = "Noted on your pad — it's yours to edit or remove.";
          await typeOut(line);
          await tools.delay(1400);
          tools.emit(deps.kit.spotlightOp("screen", { active: false }));
          return { ok: true, ops: [], reply: line };
        }

        // C2 visitor memory — "forget what you know about me". Deterministic + offline: the desk
        // NEVER deletes or edits pad content — that's the one irreversible AI action this whole
        // feature is built to avoid (noteReplaceOp could nuke the visitor's OWN notes right alongside
        // any memory line — rejected in the plan). So this is a fixed, code-authored explanation
        // pointing at the pad, never a model reply: forgetting is the visitor deleting the line.
        if (action?.kind === "memory-forget") {
          await minThink();
          tools.emit(deps.kit.spotlightOp("notepad", { active: true }));
          deps.revealNotepad?.();
          const line = "I don't delete anything on your pad. Everything I remember lives there as a " +
            "“Desk memory” line — delete that line and I forget it too.";
          await typeOut(line);
          await tools.delay(1400);
          tools.emit(deps.kit.spotlightOp("screen", { active: false }));
          return { ok: true, ops: [], reply: line };
        }

        // C1 visitor-intent onboarding — the ASK. Deterministic + offline, like every action above: the
        // router only recognized the TRIGGER (a greeting or an explicit "who's visiting" ask); whether
        // to actually present the choices is THIS stateful call — the nag-guard. Ask at most once a
        // session, and never again once an intent is already set: either way, a repeat trigger falls
        // through to the ordinary CLARIFY bubble (same prompt/choiceGroup shape as the "clarify" branch
        // just below) rather than a silent no-op, so a second "hi" still gets a useful deterministic
        // answer instead of nothing.
        if (action?.kind === "intent-ask") {
          const alreadyAsked = deps.intentAsked?.() ?? false;
          const alreadyAnswered = !!deps.intentGet?.();
          await minThink();
          if (alreadyAsked || alreadyAnswered) {
            setBodyRaw(esc(CLARIFY_PROMPT) + deps.kit.choiceGroup(log, CLARIFY_CHOICES), "committed");
            return { ok: true, ops: [], reply: CLARIFY_PROMPT };
          }
          deps.intentMarkAsked?.();   // mark BEFORE rendering — a mid-render throw still counts as "asked"
          setBodyRaw(esc(INTENT_PROMPT) + deps.kit.choiceGroup(log, INTENT_CHOICES), "committed");
          return { ok: true, ops: [], reply: INTENT_PROMPT };
        }

        // C1 visitor-intent onboarding — the ANSWER. Deterministic + offline: each branch is a fixed,
        // code-authored effect (never model prose) per the roadmap's shape. The intent itself NEVER
        // reaches buildPrompt or any model message — it only biases a CODE-CHOSEN chip pool
        // (pickFollowups' intent param, below), so the injection surface stays at zero.
        if (action?.kind === "intent-set") {
          deps.intentSet?.(action.intent);

          // C2 visitor memory tie-in (plan default: YES) — consent IS answering the ask, so the
          // stated intent becomes a visible memory line from the visitor's very first interaction.
          // SILENT: no extra chat line beyond what intent-set already says below, and manifest-guarded
          // the same honest way memory-set is above (no notepad here ⇒ no write, never a crash).
          if (deps.pageManifest?.().targets.some((tt) => tt.accepts.includes("note.append")))
            tools.emit(deps.kit.noteAppendOp(memoryLine(`visiting as a ${action.intent}`), "ai"));

          if (action.intent === "recruiter") {
            const onResume = !!deps.pageInfo && stripSlash(deps.pageInfo().route) === "/resume";
            await minThink();
            if (onResume) {
              // Already there — no navigation, just spotlight the role board in place (the A1 deep-link
              // same-page idiom: spotlight first, a beat to let it register, then release).
              const line = "Recruiter mode. You're already on the résumé — here's the role board.";
              await typeOut(line);
              setChips(["Summarize TJ's experience", "Open the flagship note", "What did TJ build?"]);
              tools.emit(deps.kit.spotlightOp("role-board", { active: true }));
              await tools.delay(1500);
              tools.emit(deps.kit.spotlightOp("screen", { active: false }));
              return { ok: true, ops: [], reply: line };
            }
            const line = "Recruiter mode. Taking you to TJ's résumé.";
            await typeOut(line);
            // setChips is deliberately SKIPPED here: this branch navigates (a real MPA page load), and
            // site.js's setDefaultChips() unconditionally rebuilds [data-suggest-chips] from the static
            // per-page starter set on every fresh load — verified the chip row does NOT survive a
            // navigate (unlike the chat log / terminal, which persist via localStorage). A pre-navigate
            // setChips call here would just be overwritten a moment later, so the recruiter pool instead
            // reaches the visitor through pickFollowups' intent bias, the first time they chat again
            // after arriving (see the grounded-chat and fuzzy-nav-miss call sites below).
            await travelAndNavigate(
              "/resume", "/resume", "Résumé", "Here's TJ's résumé — recruiter view.",
              "the navigation", "role-board",
            );
            return { ok: true, ops: [], reply: line };
          }

          if (action.intent === "developer") {
            // No navigation — just an offer + chips leaning /grain, /batch, docs (the A2 tour and the
            // catalog resolve every one of these deterministically, so tapping a chip never touches the
            // model either).
            await minThink();
            const line = "Developer mode. Want the guided tour of the stack, or straight to GRAIN or the BATCH docs?";
            await typeOut(line);
            setChips(["Take the tour", "Take me to GRAIN", "Open the BATCH docs"]);
            return { ok: true, ops: [], reply: line };
          }

          // student — the B2 path: match "teaching" against the REAL tag set (never hardcode the tag
          // itself, law #2), so this still degrades honestly if a future content pass ever drops it.
          const notes = (await deps.listNotes?.()) ?? [];
          const matched = matchTags("teaching", uniqueTags(notes));
          await minThink();
          if (matched.length) {
            const tagLabel = joinPhrases(matched);
            const line = "Student mode. Here are TJ's notes on teaching.";
            await typeOut(line);
            await travelAndNavigate(
              "/notes", `/notes?tag=${matched.map(encodeURIComponent).join(",")}`, "Notes",
              `Here are the notes tagged ${tagLabel}.`, "the navigation",
            );
            return { ok: true, ops: [], reply: line };
          }
          // No real "teaching" tag exists (yet) — degrade to the plain notes feed rather than a doomed
          // empty-tag filter, the same "claim only what the deterministic path can deliver" idiom B2's
          // own no-match branch follows above.
          const line = "Student mode. Here are TJ's notes.";
          await typeOut(line);
          await travelAndNavigate("/notes", "/notes", "Notes", "Here are the notes.", "the navigation");
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
            lastTarget = { route: target.route, label: target.title };
            await travelAndNavigate("/notes", target.route, "Notes", `Here's the latest note, “${target.title}”.`, "the notebook");
            return { ok: true, ops: [], reply: `Opening ${target.title}` };
          }
          setBody(esc("I couldn't reach the notebook just now."), "committed");
          return { ok: false, ops: [], reply: "notes unavailable", reason: "notes unavailable" };
        }

        // the flagship note — a FIXED, hand-pinned note (FLAGSHIP_NOTE_SLUG), the sibling of
        // open-latest-note: zero model, drive the page straight to it. The title comes off the live
        // notes list (never hardcoded here) so it can't drift from what /notes actually renders; a
        // missing entry falls back to the known title rather than an empty quote.
        if (action?.kind === "open-flagship-note") {
          const route = `/notes/${FLAGSHIP_NOTE_SLUG}`;
          if (deps.navigate) {
            const notes = (await deps.listNotes?.()) ?? [];
            const target = notes.find((n) => stripSlash(n.route) === stripSlash(route));
            const title = target?.title ?? "Ten Times Zero Is Still Zero";
            await minThink();
            await typeOut(`Opening the flagship note, “${title}”.`);
            lastTarget = { route, label: title };
            await travelAndNavigate("/notes", route, "Notes", `Here's the flagship note, “${title}”.`, "the notebook");
            return { ok: true, ops: [], reply: `Opening ${title}` };
          }
          setBody(esc("I couldn't reach the notebook just now."), "committed");
          return { ok: false, ops: [], reply: "notes unavailable", reason: "notes unavailable" };
        }

        // A1 "show me the part about X" (deep-link answers) — deterministic + offline-safe, like every
        // action above: retrieve action.query against the corpus and, ONLY when the top hit actually
        // carries a rendered heading anchor (the MILL contract — Chunk.anchor / data-surface="anchor:*"),
        // jump straight to that section instead of answering in prose. A facts-route hit doesn't count
        // (there's no real heading to land on) — filtered out below. A MISS is deliberately NOT settled
        // here: the deterministic path only claims the turn when it can actually deliver, so an
        // ungrounded ask falls straight through to the normal model path a few lines down (still a real,
        // grounded chat answer — just not a jump).
        if (action?.kind === "deep-link") {
          const knowledge = await deps.loadKnowledge().catch(() => null);
          const hit = knowledge
            ? retrieve(action.query, knowledge, 3).find((c) => c.route !== FACTS_ROUTE && c.anchor)
            : undefined;
          if (hit) {
            const heading = hit.heading || hit.title;
            const onThisPage = deps.pageInfo && stripSlash(deps.pageInfo().route) === stripSlash(hit.route);
            if (onThisPage) {
              // already here — no navigation, just find + spotlight the section in place.
              narrate("finds", heading);
              await minThink();
              const line = `That's under “${heading}”, right on this page.`;
              await typeOut(line);
              // Spotlight FIRST, scroll second: activating the lamp raises the shell's acting chrome,
              // and a smooth scroll started before that layout settles animates to a stale target
              // (measured ~158px short). The lamp follows its surface through the scroll by design
              // (ai-spotlight.js), so lighting an off-screen section then gliding to it is the
              // intended choreography. A missing anchor makes both ops no-op finds — harmless.
              tools.emit(deps.kit.spotlightOp(`anchor:${hit.anchor}`, { active: true }));
              await tools.delay(120);   // let the acting-chrome layout settle before measuring the scroll target
              if (deps.scrollToAnchor?.(hit.anchor!)) await tools.delay(1500);
              tools.emit(deps.kit.spotlightOp("screen", { active: false }));
              return { ok: true, ops: [], reply: line };
            }
            // elsewhere on the site — travel there, but land the lamp ON the section: the arrival stash
            // carries the anchor, and desk-door's runArrival scrolls to it before the spotlight fires.
            const navLink = navLinkFor(hit.route);
            await minThink();
            const line = `That's under “${heading}” in “${hit.title}”. Taking you there.`;
            await typeOut(line);
            lastTarget = { route: hit.route, label: hit.title };
            await travelAndNavigate(
              navLink, hit.route, humanizeSeg(navLink),
              `Here's the part about “${heading}”, from “${hit.title}”.`, "the navigation",
              `anchor:${hit.anchor}`, hit.anchor,
            );
            return { ok: true, ops: [], reply: line };
          }
          // no usable hit — fall through (no return): the model path below still gets a shot at it.
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
            lastTarget = { route: dest.route, label: dest.label };
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
            // The forced "This page" opening is what actually suppresses the 0.5B's markdown-summary
            // reflex (### headings + keyword bullets) — "no markdown" alone didn't (audit finding).
            { role: "system", content: "You summarize a web page for a visitor in 2 to 3 plain sentences, from the CONTENT only. Start your reply with exactly \"This page\". Sentences only — no headings, no markdown, no lists, no hype, no repetition." },
            { role: "user", content: `Page: ${deps.pageInfo?.().title ?? ""}\n\nSummarize this page:\n\n${page.slice(0, 4000)}` },
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
        // What the desk can DO here — the SAME ONE capability catalog the deterministic route
        // announces (capabilities.ts: this page's live manifest + actions.ts's built-in verbs),
        // handed to the MODEL too, so a freeform "what are you able to do?" answers capability-aware
        // instead of guessing from prose. catalogPhrases already orders self-contained (see/operate)
        // before navigate (audit finding: a 0.5B tends to echo whichever item comes first).
        const manifest = deps.pageManifest?.();
        const canDo = catalogPhrases(buildCapabilityCatalog({ manifest, hasDestinations: catalog.length > 0 }));
        // C2 visitor memory (plan default: ALWAYS feed) — the sanitized "Desk memory" lines off the
        // visitor's OWN notepad right now, re-sanitized + capped by parseMemories (defense in depth:
        // this is the first visitor-authored free text ever entering the system prompt). Omitted
        // entirely when empty, the same "absent/empty leaves the prompt unchanged" contract canDo/nav
        // already follow — never an empty VISITOR NOTES block for the model to puzzle over.
        const visitorNotes = parseMemories(deps.padMarkdown?.() ?? "");
        const acc = await streamInto(engine, buildPrompt({
          query: text || "Hello", chunks: grounding, history, navShortlist: shortlist, canDo,
          visitorNotes: visitorNotes.length ? visitorNotes : undefined, tokenBudget: profile.promptTokenBudget,
        }));

        // The model chose to navigate. Validate TWICE before acting on generated text: the route must be
        // REAL (present in the sitemap catalog — never trust the model to have stayed in scope), AND
        // kit.navigateOp's own isSafeNavigateHref check (it throws on anything unsafe).
        const navMatch = MODEL_NAVIGATE_RE.exec(acc.trim());
        // 1b: the weak 0.5B sometimes ECHOES a bare route ("/notes/ten-times-zero") as its whole reply
        // instead of the NAVIGATE:<route> protocol — treat a whole-message bare path as the same
        // navigate intent, so the visitor never sees a raw slug as an "answer". Only when the ENTIRE
        // trimmed reply is a single path (a path mentioned mid-sentence is left as prose).
        const bareRoute = !navMatch && /^\/[^\s]*$/.test(acc.trim()) ? acc.trim() : null;
        if ((navMatch || bareRoute) && deps.navigate) {
          const route = (navMatch ? navMatch[1]! : bareRoute!).split("#")[0]!;
          const dest = catalog.find((d) => d.route === route);
          if (dest) {
            try {
              deps.kit.navigateOp("screen", route);   // throws on an unsafe href — validate before acting
              setBody(esc(`Taking you to ${dest.label}.`), "committed");
              lastTarget = { route: dest.route, label: dest.label };
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
          setChips([...pickFollowups(text, history, deps.intentGet?.() ?? undefined), "Summarize this page"]);
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

        // A3: a deterministic "Read more" citation under the grounded answer — built by CODE from the
        // TOP retrieval chunk (the model never writes a path; law #2). Only when the grounding came
        // from a real page (not the hand-authored facts) the visitor isn't already on. The link rides
        // A1's rendered heading ids when the chunk has one, so "Read more" lands on the exact section
        // (a native #fragment jump — no desk choreography needed for a human click). Replacing the
        // settled body with the same escaped text + the cite span reuses the one replaceBodyOp path.
        const top = grounding[0];
        const here = deps.pageInfo ? stripSlash(deps.pageInfo().route) : "";
        if (acc.trim() && top && top.route !== FACTS_ROUTE && stripSlash(top.route) !== here) {
          const href = top.anchor ? `${top.route}#${top.anchor}` : top.route;
          setBodyRaw(
            esc(acc.trim()) +
            `<span class="desk-cite">Read more: <a href="${esc(href)}">${esc(top.title)}</a></span>`,
            "committed");
          // 1c: a following "go there" now reuses THIS cited note (not a fresh retrieval that drifted).
          lastTarget = { route: top.route, label: top.title };
        }
        history.push({ role: "user", content: text || "Hello" }, { role: "assistant", content: acc });
        setChips([...pickFollowups(text, history, deps.intentGet?.() ?? undefined), "Summarize this page"]);
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
      lastTarget = null;
      if (degraded) { degraded = false; enginePromise = null; }   // re-arm a degraded desk to retry loading
    },

    // "Watch me work" agent — re-hydrate the demo on this page after a GO navigated here. The door calls
    // this on arrival ONLY when agent state is stashed (showcaseActive), so a normal navigation never
    // triggers it. Loads the engine SILENTLY (like arrive — no bar on a nav; the visitor already opted
    // in when they started the demo), then takes the next agent turn(s). Any failure clears the state so
    // a dead demo can't wedge future navigations.
    async showcaseResume(applyOp: (op: RenderOp) => void): Promise<void> {
      if (degraded) { deps.showcaseClear?.(); return; }
      if (!deps.showcaseStateGet?.()) return;               // no demo running — nothing to continue
      // Each hop is a full page load (this is an MPA), so the model RE-INITS here — seconds of silence
      // unless we say so. Drop an immediate "still driving" bubble the moment we land, before the engine
      // comes back, so the arrival never reads as dead.
      applyOp({ target: "chat-log", op: "append", provenance: "ai", commit: "committed",
        html: deps.kit.chatBubble("ai", "grain", deps.kit.chatBody(deps.kit.esc("Still driving — reading this page…")), "Desk") });
      const engine = await ensureEngine(() => {});          // the load bar showed on kickoff; re-init is quiet
      if (!engine) { deps.showcaseClear?.(); return; }
      try { await runAgentTurns(engine, applyOp); }
      catch (err) { console.error("[desk] showcaseResume failed", err); deps.showcaseClear?.(); }
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
