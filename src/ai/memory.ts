// portfolio/ai/memory.ts — C2 visitor memory: the notepad IS the memory. CLIENT-SAFE (§19.2),
// dependency-free, pure. A "Desk memory" line is a plain markdown bullet the desk appends to the
// visitor's own notepad (via grain's noteAppendOp) and later reads back out of it (padMarkdown →
// parseMemories) to feed a labeled, untrusted VISITOR NOTES block into the prompt (prompt.ts). The
// notepad round-trips through localStorage as ONE blob of markdown after a reload (grain's
// notepad.js RESTORE re-renders the whole pad as a single entry — entry boundaries don't survive,
// only the text does), so a LINE MARKER is the only thing that can identify a memory after that:
// hence the exact "- Desk memory: " prefix, matched with a leading-dash regex, never an entry id.
//
// Two sanitize passes, at two different times (law #4 — validate twice):
//   WRITE time (sanitizeMemoryFact): the visitor's raw words, about to become a fact ON THE PAGE —
//   an over-cap fact is a DECLINE (the handler answers honestly and writes nothing; fillOp's own
//   "too long to draft" precedent), never a silent truncation that changes what the visitor said.
//   READ time (parseMemories): this is the FIRST visitor-authored free text ever entering the model
//   system prompt (C1 kept intent state out of it entirely) — so a memory line is re-sanitized on
//   the way back out (a visitor could hand-edit the pad to smuggle a protocol token in), and capped
//   defensively (manifest-dom's READABLE_CAP precedent: truncate-with-ellipsis, not decline, since
//   the desk didn't write this pass — it's just protecting its own prompt budget).

/** The exact line marker a memory is written and matched with. Load-bearing verbatim: written by
 *  memoryLine, matched by MEMORY_LINE_RE below, and it must survive the notepad's markdown round-trip
 *  (a plain "- " bullet does — see notepad.js's RESTORE). */
export const MEMORY_PREFIX = "- Desk memory: ";

// The two model-facing protocol tokens (prompt.ts's NAVIGATE:<route> / CHOICES:<q>|<opt>|<opt>) must
// never ride INTO a stored fact or back OUT of one on read — a visitor's own words (or a hand-edited
// pad) could otherwise plant a live instruction inside what's supposed to be inert background text.
// NAVIGATE: takes one route token (no spaces); CHOICES: takes the rest of the line (pipe-delimited
// options can contain spaces) — same span each protocol's own parser (desk-reasoner.ts) would read.
const NAVIGATE_TOKEN_RE = /\bnavigate\s*:\s*\S*/gi;
const CHOICES_TOKEN_RE = /\bchoices\s*:.*/gi;
const stripProtocolTokens = (s: string): string => s.replace(NAVIGATE_TOKEN_RE, "").replace(CHOICES_TOKEN_RE, "");

/** Write cap (chars) on a single fact — over this, sanitizeMemoryFact declines (returns null) rather
 *  than truncating the visitor's own words into something they didn't say. */
export const MEMORY_FACT_CAP = 200;
/** Read-time per-line cap (chars) — same number as the write cap, but a DIFFERENT contract: a
 *  hand-edited pad line over this is truncated (with an ellipsis), never dropped outright, since the
 *  desk isn't the author of this pass and the fact is still real, just long. */
const MEMORY_PER_LINE_CAP = 200;
/** Read-time total cap (chars) across every kept memory, combined — the VISITOR NOTES block must stay
 *  small in the prompt budget (prompt.ts subtracts it up front, before history/context). */
const MEMORY_TOTAL_CAP = 400;
/** How many of the most recent memory lines parseMemories keeps before the total cap even applies. */
const MEMORY_KEEP = 3;

// One shared clean pass for both times: collapse to one line, strip protocol tokens, trim. The two
// callers differ only in what they do with an over-cap result (decline vs. truncate) — kept as ONE
// function so the actual cleaning logic (what counts as "clean") can't drift between write and read.
function cleanFact(raw: string, cap: number, overCap: "decline" | "truncate"): string | null {
  let s = raw.replace(/\s+/g, " ").trim();
  s = stripProtocolTokens(s);
  s = s.replace(/\s+/g, " ").trim();
  if (!s) return null;
  if (s.length > cap) return overCap === "decline" ? null : s.slice(0, cap - 1).trimEnd() + "…";
  return s;
}

/** Sanitize a visitor-stated fact before it's ever written to the pad: collapse whitespace to one
 *  line, strip protocol tokens, trim. Returns null (never "") when nothing usable survives, or when
 *  the cleaned fact is still over MEMORY_FACT_CAP — both are a DECLINE signal for the caller (the
 *  memory-set handler answers honestly instead of writing an empty or truncated line). */
export function sanitizeMemoryFact(raw: string): string | null {
  return cleanFact(raw, MEMORY_FACT_CAP, "decline");
}

/** Build the exact markdown line the desk appends to the notepad. Takes an ALREADY-sanitized fact
 *  (the caller — the memory-set handler — declines before ever reaching this); this just applies the
 *  one true prefix, so there's exactly one place that string is assembled. */
export function memoryLine(fact: string): string {
  return `${MEMORY_PREFIX}${fact}`;
}

// The one place a "Desk memory" line is recognized. Anchored to the start of the (already-trimmed)
// line, capital "Desk memory" — the exact case memoryLine writes — so this can't accidentally match
// an unrelated visitor bullet that happens to start with a dash.
const MEMORY_LINE_RE = /^-\s*Desk memory:\s*(.+)/;

/** Read every "Desk memory" line back out of the pad's WHOLE markdown (padMarkdown() — the door's
 *  join of every `.notepad__entry[data-md]` in DOM order, or the raw localStorage blob after a
 *  reload folds every entry into one). Keeps the last `max` (default 3, oldest→newest), re-sanitizes
 *  each (defense in depth — a hand-edited pad line could carry a protocol token or run long), then
 *  trims from the OLDEST of those kept until the combined length fits MEMORY_TOTAL_CAP — a visitor
 *  who accumulates many memories still gets a small, budget-safe VISITOR NOTES block, biased toward
 *  what they said most recently. */
export function parseMemories(padMarkdown: string, max: number = MEMORY_KEEP): string[] {
  const facts: string[] = [];
  for (const raw of padMarkdown.split("\n")) {
    const m = MEMORY_LINE_RE.exec(raw.trim());
    if (!m) continue;
    const fact = cleanFact(m[1]!, MEMORY_PER_LINE_CAP, "truncate");
    if (fact) facts.push(fact);
  }
  let kept = facts.slice(-max);
  let total = kept.reduce((n, f) => n + f.length, 0);
  while (kept.length > 0 && total > MEMORY_TOTAL_CAP) {
    total -= kept[0]!.length;
    kept = kept.slice(1);
  }
  return kept;
}
