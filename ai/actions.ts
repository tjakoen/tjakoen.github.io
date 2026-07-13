// portfolio/ai/actions.ts — the desk's DETERMINISTIC action router (CLIENT-SAFE §19.2, pure). Maps a
// typed request (or an action chip's text) to a UI action the reasoner then drives through GRAIN —
// navigate + the traveling spotlight + terminal narration — or, for a summary, through the model.
// Deterministic on purpose: reliable on a 0.5B, and the showcase value is the REAL grain machinery
// doing the driving, not the interpretation. Free-text that matches nothing falls through to chat.

/** A site section the desk can navigate to, addressed by friendly name + spoken aliases. */
export interface Section { name: string; route: string; aliases: string[] }

export const SECTIONS: Section[] = [
  { name: "GRAIN", route: "/grain", aliases: ["grain"] },
  { name: "BATCH", route: "/batch", aliases: ["batch"] },
  { name: "MILL", route: "/mill", aliases: ["mill"] },
  { name: "PROOF", route: "/proof", aliases: ["proof"] },
  { name: "PANTRY", route: "/pantry", aliases: ["pantry"] },
  { name: "the BREAD stack", route: "/bread", aliases: ["bread", "the stack", "stack"] },
  { name: "Notes", route: "/notes", aliases: ["notes", "the notes", "blog", "the blog", "notebook", "the notebook"] },
  { name: "About", route: "/about", aliases: ["about", "contact", "resume", "cv"] },
  { name: "Home", route: "/", aliases: ["home", "welcome", "the welcome page"] },
];

export type Action =
  | { kind: "open-latest-note" }
  | { kind: "summarize" }
  | { kind: "capabilities" }
  | { kind: "navigate"; route: string; name: string };

const norm = (s: string): string => s.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
const reEscape = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Match a request to a deterministic action, or null → grounded chat. Order matters: the specific
 *  intents (summarize, capabilities, latest-note) resolve before the broad navigate verb, so
 *  "open the latest note" doesn't get read as "navigate to notes". */
export function routeAction(text: string): Action | null {
  const t = norm(text);
  if (!t) return null;

  // summarize this page
  if (/\b(summari[sz]e|sum up|recap)\b/.test(t) || /tl;?dr/i.test(text)) return { kind: "summarize" };

  // capabilities — "what can I do here", "what should I do next", "suggest what to do"
  if (/\bwhat can i do\b/.test(t) || /\bwhat (should|can) i (do|try)\b/.test(t) ||
      /\bwhat to do\b/.test(t) || /\b(suggest|recommend)\b.*\b(do|next|try)\b/.test(t) ||
      /\bwhat.?s (here|next)\b/.test(t))
    return { kind: "capabilities" };

  // open the latest note — a "latest/newest/recent" qualifier + a note word + an intent verb
  const noteWord = /\b(note|notes|blog|post|posts|article|writing|entry)\b/;
  const latest = /\b(latest|newest|recent|last|most recent)\b/;
  const intent = /\b(show|open|read|see|go|take|latest|newest|recent)\b/;
  if (latest.test(t) && noteWord.test(t) && intent.test(t)) return { kind: "open-latest-note" };

  // navigate to a section — a nav verb + a known section alias (longest alias wins, so "the stack"
  // beats "stack" and can't be shadowed by a shorter partial).
  if (/\b(take me to|go to|open|show me|navigate to|jump to|visit|show)\b/.test(t)) {
    let hit: { route: string; name: string; len: number } | null = null;
    for (const s of SECTIONS)
      for (const a of s.aliases)
        if (new RegExp(`\\b${reEscape(a)}\\b`).test(t) && (!hit || a.length > hit.len))
          hit = { route: s.route, name: s.name, len: a.length };
    if (hit) return { kind: "navigate", route: hit.route, name: hit.name };
  }
  return null;
}

/** The pinned first chip — always offered on every page (the showcase's "what can I do here?"). */
export const PINNED_CHIP = "What can I do here?";

/** The desk's headline actions, offered as chips on a cold page + in the capabilities reply. */
export const ACTION_CHIPS = ["Summarize this page", "Show me the latest note"];
