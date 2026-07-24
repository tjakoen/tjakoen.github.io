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
  | { kind: "deep-link"; query: string };

/** The disambiguation the desk offers for a vague "where should I go?" — each choice's `value` is a
 *  phrase the desk itself resolves (catalog navigation or a capabilities ask), so a click just
 *  re-enters the router. Deterministic + offline-safe: no model needed to ASK, and none to ANSWER. */
export const CLARIFY_PROMPT = "Sure — where would you like to go?";
export const CLARIFY_CHOICES: Choice[] = [
  { label: "GRAIN", value: "take me to grain" },
  { label: "The notes", value: "take me to the notes" },
  { label: "The BREAD stack", value: "take me to the bread stack" },
  { label: "About TJ", value: "take me to about" },
  { label: "What can I do here?", value: "what can I do here?" },
];

const norm = (s: string): string => s.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();

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

  // clarify — a vague "help me get somewhere" ask with no concrete destination. Offer choices rather
  // than a wall of text or a guess. Kept BEFORE latest-note so "show me around" resolves here.
  if (/\bshow me around\b/.test(t) || /\b(give me|take) a tour\b/.test(t) || /\bsurprise me\b/.test(t) ||
      /\bwhere (should|can|do) i (go|start|look|begin)\b/.test(t) || /\bhelp me (choose|decide|navigate|find|get around)\b/.test(t) ||
      /\b(what are my |my )?options\b/.test(t) || /\bnot sure\b/.test(t))
    return { kind: "clarify", prompt: CLARIFY_PROMPT, choices: CLARIFY_CHOICES };

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
