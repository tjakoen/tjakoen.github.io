// portfolio/ai/actions.ts — the desk's DETERMINISTIC action router (CLIENT-SAFE §19.2, pure). Maps a
// typed request (or an action chip's text) to a non-navigation ACTION the reasoner then drives —
// summarize / capabilities / clarify / open-latest-note / note-write. NAVIGATION is NOT here anymore:
// it's resolved against the live sitemap catalog (catalog.ts, resolveNav) so the desk sends a visitor
// only to routes that actually exist and the set scales with the site — no hardcoded alias table to
// grow. Free text that matches no action here falls through to catalog navigation, then to chat.

export type Choice = { label: string; value: string };
export type Action =
  | { kind: "open-latest-note" }
  | { kind: "summarize" }
  | { kind: "note-write"; instruction: string }
  | { kind: "capabilities" }
  | { kind: "clarify"; prompt: string; choices: Choice[] }
  | { kind: "deep-link"; query: string }
  // B2 notes filtering — "show me notes about X". `topic` is the RAW captured phrase; the reasoner
  // (never this router) matches it against the real tag set (notes-tags.ts matchTags) — law #2, the
  // model/router never picks a tag itself, only extracts what the visitor said.
  | { kind: "notes-filter"; topic: string }
  // A2 guided tour — a fixed, code-enumerated walk through 4 top-level stops (tour.ts). Zero model:
  // both kinds are matched here, before the model ever loads (see desk-reasoner.ts).
  | { kind: "tour-start" }
  | { kind: "tour-stop" }
  // A4 theme switching — `target` is "dark", "light", "next" (cycle to whatever's next), or one of the
  // FLAVORS names below. Zero model: matched here, then RE-VALIDATED against the live <html data-themes>
  // list by the reasoner before it drives anything (a page could ship a different set than this file's
  // comment promises to track).
  | { kind: "theme"; target: string };

/** The disambiguation the desk offers for a vague "where should I go?" — each choice's `value` is a
 *  phrase the desk itself resolves (catalog navigation or a capabilities ask), so a click just
 *  re-enters the router. Deterministic + offline-safe: no model needed to ASK, and none to ANSWER.
 *  "Take the tour" leads (A2) — the vague ask this offers most often ("show me around") IS the tour. */
export const CLARIFY_PROMPT = "Sure — where would you like to go?";
export const CLARIFY_CHOICES: Choice[] = [
  { label: "Take the tour", value: "take the tour" },
  { label: "GRAIN", value: "take me to grain" },
  { label: "The notes", value: "take me to the notes" },
  { label: "The BREAD stack", value: "take me to the bread stack" },
  { label: "About TJ", value: "take me to about" },
  { label: "What can I do here?", value: "what can I do here?" },
];

const norm = (s: string): string => s.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();

// A4 theme switching — the flavor axis's CODE-SIDE mirror of <html data-themes> (view/pages/*.html).
// GRAIN itself hardcodes no theme names (theme.js reads the live attribute) — this const exists only
// so the router can recognize a flavor word in FREE TEXT; the reasoner re-validates against the LIVE
// list before acting, so a renamed/reordered/added flavor here never drives a click the DOM doesn't
// back. Keep in sync with view/pages/*.html's data-themes value.
const FLAVORS = ["sourdough", "baguette", "brioche"];

// "Show me the part about X" (A1, deep-link answers) — a request for WHERE on the site something is
// covered, distinct from navigation (a page) or summarize (this page). The captured remainder becomes
// `query`, which the reasoner retrieves against the corpus; a hit with a rendered heading anchor scrolls
// + spotlights straight to that section instead of answering in prose. Three phrasings the audit's
// "where does TJ talk about teaching with AI?" family exercises; order doesn't matter (mutually exclusive
// triggers), so first match wins.
const DEEP_LINK_PATTERNS: RegExp[] = [
  // "show/find/see/read/open the part/section/bit/passage/paragraph about/on/where/covering X"
  /\b(?:show|find|see|read|open)\b.*?\b(?:part|section|bit|passage|paragraph)\b.*?\b(?:about|on|where|covering)\b\s+(.+)$/,
  // "where does/do/did TJ talk/write/say/speak/mention(s) (about) X" — "about" is optional ("mention X")
  /\bwhere\s+(?:does|do|did)\b.*?\b(?:talks?|writes?|says?|speaks?|mentions?)\b\s*(?:about\s+)?(.+)$/,
  // "take/jump me to the part/section about/on X"
  /\b(?:take|jump)\s+me\s+to\s+the\s+(?:part|section)\b.*?\b(?:about|on)\b\s+(.+)$/,
];

// B2 notes filtering — "show me notes about X" / "notes tagged X" / "filter the notes by X". The
// captured remainder becomes `topic`, a RAW phrase the reasoner matches against the real tag set
// (notes-tags.ts) — this router only extracts what was asked, never a tag guess (law #2). Two shapes:
// a notes-word followed by an about/on/tagged/covering/related-to connector, or an explicit filter/
// narrow verb aimed at the notes/feed. Checked AFTER clarify (so "show me around" still clarifies) and
// BEFORE open-latest-note (so "show me the latest note" — no about/tagged connector here — still opens
// the newest note instead of a doomed empty-topic filter).
const NOTES_FILTER_PATTERNS: RegExp[] = [
  /\b(?:notes?|posts?|articles?|entries|writings?)\b.*?\b(?:about|on|tagged(?:\s+with)?|covering|related\s+to)\b\s+(.+)$/,
  /\b(?:filter|narrow)\b.*?\b(?:notes?|posts?|feed)\b.*?\b(?:by|to|about|on)\b\s+(.+)$/,
];

/** Match a request to a deterministic ACTION, or null → (catalog navigation, then) grounded chat.
 *  Order matters: the specific intents resolve before the broad ones. Navigation is handled by the
 *  caller against the sitemap catalog, not here. */
export function routeAction(text: string): Action | null {
  const t = norm(text);
  if (!t) return null;

  // write to the notepad — the desk COMPOSES an entry and appends it (note.append). Checked FIRST so
  // "summarize this to my notepad" writes to the pad rather than only summarizing into the chat. Two
  // triggers: an explicit notepad mention with a write-ish verb, or a bare "jot this down"/"make a note".
  if (/\bnotepad\b/.test(t) && /\b(add|save|writ\w*|put|jot|note|append|record|capture|stick|drop|summari[sz]e)\b/.test(t))
    return { kind: "note-write", instruction: text.trim() };
  if (/\b(jot (this|that|it|down)|note (this|that|it) down|make a note|take a note|remember (this|that))\b/.test(t))
    return { kind: "note-write", instruction: text.trim() };

  // deep-link — "show me the part about X" (see DEEP_LINK_PATTERNS above). An empty remainder (nothing
  // left to look up, e.g. a stray "show me the section about") is NOT a deep-link — fall through to
  // whatever the rest of the router decides instead of routing a doomed empty-query lookup.
  for (const re of DEEP_LINK_PATTERNS) {
    const m = re.exec(t);
    const query = m?.[1]?.trim();
    if (query) return { kind: "deep-link", query };
  }

  // summarize this page
  if (/\b(summari[sz]e|sum up|recap)\b/.test(t) || /tl;?dr/i.test(text)) return { kind: "summarize" };

  // capabilities — "what can I do here", "what should I do next", "suggest what to do". Also the
  // page-inventory asks ("which pages can you take me to", "where can you take me"): the desk-audit
  // showed the 0.5B mangling a route list into invented slugs, and the capabilities reply already
  // names every section — so the model never gets this one.
  if (/\bwhat can i do\b/.test(t) || /\bwhat (should|can) i (do|try)\b/.test(t) ||
      /\bwhat to do\b/.test(t) || /\b(suggest|recommend)\b.*\b(do|next|try)\b/.test(t) ||
      /\bwhat.?s (here|next)\b/.test(t) ||
      /\b(which|what) pages?\b/.test(t) || /\bwhere can you take (me|us)\b/.test(t))
    return { kind: "capabilities" };

  // A2 guided tour — "stop the tour" BEFORE "take the tour": both share the word "tour", and a stop
  // phrase ("stop/end/cancel/quit the tour") must never be mistaken for a start. Checked here (after
  // deep-link/summarize/capabilities, before clarify) so a tour ask never falls into the vaguer
  // "show me around" clarify bucket below — it's specific enough to act on directly.
  if (/\b(?:stop|end|cancel|quit)\s+the\s+tour\b/.test(t)) return { kind: "tour-stop" };
  if (/\b(?:take|start|begin)\s+(?:the|a)\s+tour\b/.test(t) || /\bgive me\s+(?:the|a)\s+tour\b/.test(t))
    return { kind: "tour-start" };

  // A4 theme switching — zero model, both axes GRAIN's theme.js already exposes. Checked here (after
  // the specific intents above, before the vaguer clarify bucket below) so a theme ask never gets
  // mistaken for "help me get somewhere".
  //
  // scheme (dark/light): the bare word alone isn't enough — a stray "dark" shouldn't hijack an
  // unrelated sentence — so it needs a mode-ish companion (mode/theme/make it/switch/go). A
  // chat-shaped question like "is dark mode supported" still fires: unambiguous enough, and the
  // reasoner answers it honestly either way (already-dark vs. a real toggle). "dark(er)"/"light(er)"
  // both count ("make it darker").
  const SCHEME_WORD = /\b(dark|light)(?:er)?\b/;
  if (SCHEME_WORD.test(t) && /\b(?:mode|theme|make it|switch|go)\b/.test(t)) {
    const m = SCHEME_WORD.exec(t)!;
    return { kind: "theme", target: m[1]! };
  }
  // cycle/next flavor — "cycle the theme", "next theme".
  if (/\b(?:cycle|next)\b.*\btheme\b|\btheme\b.*\b(?:cycle|next)\b/.test(t)) return { kind: "theme", target: "next" };
  // a named flavor, ANYWHERE in the message ("switch to brioche", "use the baguette theme", "change
  // the theme to sourdough", a bare "brioche"). No switch-ish context required for the bare case — these
  // words are unambiguous site-wide (no nav destination shares them, so this can never shadow a
  // catalog match like "switch to grain", which isn't a flavor name and falls through below).
  for (const f of FLAVORS) if (new RegExp(`\\b${f}\\b`).test(t)) return { kind: "theme", target: f };

  // clarify — a vague "help me get somewhere" ask with no concrete destination. Offer choices rather
  // than a wall of text or a guess. Kept BEFORE latest-note so "show me around" resolves here.
  // ("give me/take a tour" used to land here — A2 now starts the tour directly, above.)
  if (/\bshow me around\b/.test(t) || /\bsurprise me\b/.test(t) ||
      /\bwhere (should|can|do) i (go|start|look|begin)\b/.test(t) || /\bhelp me (choose|decide|navigate|find|get around)\b/.test(t) ||
      /\b(what are my |my )?options\b/.test(t) || /\bnot sure\b/.test(t))
    return { kind: "clarify", prompt: CLARIFY_PROMPT, choices: CLARIFY_CHOICES };

  // B2 notes filtering — checked here (after clarify, before latest-note) so "show me the latest
  // note" (no about/tagged connector) still falls through to the dedicated latest-note action below,
  // while "show me notes about teaching" resolves here first. An empty remainder (nothing left to
  // match, e.g. a stray "filter the notes by") is NOT a filter — fall through, same as deep-link's
  // empty-remainder guard, rather than routing a doomed empty-topic lookup.
  for (const re of NOTES_FILTER_PATTERNS) {
    const m = re.exec(t);
    const topic = m?.[1]?.trim();
    if (topic) return { kind: "notes-filter", topic };
  }

  // open the latest note — a "latest/newest/recent" qualifier + a note word + an intent verb. Stays a
  // dedicated action (not catalog nav) because "latest" is dynamic — it resolves to whichever note is
  // newest, not a fixed route.
  const noteWord = /\b(note|notes|blog|post|posts|article|writing|entry)\b/;
  const latest = /\b(latest|newest|recent|last|most recent)\b/;
  const intent = /\b(show|open|read|see|go|take|latest|newest|recent)\b/;
  if (latest.test(t) && noteWord.test(t) && intent.test(t)) return { kind: "open-latest-note" };

  return null;
}

/** The pinned first chip — always offered on every page (the showcase's "what can I do here?"). */
export const PINNED_CHIP = "What can I do here?";

/** The desk's headline actions, offered as chips on a cold page + in the capabilities reply. */
export const ACTION_CHIPS = ["Summarize this page", "Show me the latest note"];
