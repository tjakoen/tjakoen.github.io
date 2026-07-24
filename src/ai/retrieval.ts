// portfolio/ai/retrieval.ts — CLIENT-SAFE (§19.2), dependency-free lexical retrieval over the
// build-time knowledge corpus. No npm, no DOM: pure functions so it runs identically in the
// browser (the desk reasoner) and in `bun test`. tf·idf top-k with a relevance floor that falls
// back to the hand-authored facts chunks — so a query the corpus can't answer still grounds on
// bio/"what is BREAD?" rather than on nothing.

/** One retrievable unit of the site: a heading-sized slice of a note or doc (or a facts block). */
export interface Chunk {
  id: string;            // stable id, e.g. "notes/the-browser-grew-up#2"
  route: string;         // where it lives on the site ("/notes/the-browser-grew-up"); "facts" for facts.md
  title: string;         // the page title
  heading: string;       // the "##" heading this slice sits under ("" for the lead)
  text: string;          // the prose (frontmatter stripped, ≤ ~1000 chars)
  anchor?: string;       // the rendered heading's DOM id on the chunk's page (A1: deep-link
                         // answers); absent for the lead section (no heading to anchor to) and
                         // for sources with no rendered page at all (e.g. facts.md)
}

/** The build-time corpus: chunks + a precomputed document-frequency table (per token). */
export interface Knowledge {
  builtAt: string;
  chunks: Chunk[];
  df: Record<string, number>;   // how many chunks each token appears in
  n: number;                    // chunk count (== chunks.length; carried so idf needs no recompute)
}

// The synthetic route the hand-authored grounding uses — retrieve()'s floor falls back to THESE
// chunks when nothing scores above the relevance floor (so the suggest-chips always have an answer).
export const FACTS_ROUTE = "facts";

// A small, deliberately crude English stopword set — enough to stop "the"/"is"/"of" from
// dominating tf·idf without pulling in a dependency. Domain words (grain, batch, bread) stay.
const STOPWORDS = new Set<string>([
  "a", "an", "and", "are", "as", "at", "be", "been", "but", "by", "can", "do", "does", "for",
  "from", "had", "has", "have", "how", "i", "if", "in", "into", "is", "it", "its", "of", "on",
  "or", "our", "so", "than", "that", "the", "their", "them", "then", "there", "these", "they",
  "this", "to", "up", "was", "we", "were", "what", "when", "where", "which", "who", "why", "will",
  "with", "you", "your",
]);

/** Crude, deterministic stemming: fold a few common English suffixes so "builds"/"building"/
 *  "built"-ish forms collide. Not linguistically correct — just enough to widen recall without
 *  a stemmer dependency. Order matters (longest suffix first). */
function stem(word: string): string {
  for (const suffix of ["ing", "ed", "es", "s"]) {
    if (word.length > suffix.length + 2 && word.endsWith(suffix)) return word.slice(0, -suffix.length);
  }
  return word;
}

/** Lowercase, split on non-alphanumerics, drop stopwords + 1-char noise, stem the rest. */
export function tokenize(text: string): string[] {
  const out: string[] = [];
  for (const raw of text.toLowerCase().split(/[^a-z0-9]+/)) {
    if (raw.length < 2 || STOPWORDS.has(raw)) continue;
    out.push(stem(raw));
  }
  return out;
}

/** Inverse document frequency for a token, smoothed so an unseen token doesn't divide by zero. */
function idf(token: string, df: Record<string, number>, n: number): number {
  return Math.log((n + 1) / ((df[token] ?? 0) + 1)) + 1;
}

/** Score one chunk against a tokenized query: Σ over query terms of tf(term, chunk) · idf(term).
 *  tf is the raw count in the chunk (short chunks, so no length normalization needed). */
export function score(queryTokens: string[], chunk: Chunk, df: Record<string, number>, n: number): number {
  if (queryTokens.length === 0) return 0;
  const counts = new Map<string, number>();
  for (const t of tokenize(chunk.text + " " + chunk.heading + " " + chunk.title))
    counts.set(t, (counts.get(t) ?? 0) + 1);
  let total = 0;
  for (const q of new Set(queryTokens)) {
    const tf = counts.get(q) ?? 0;
    if (tf > 0) total += tf * idf(q, df, n);
  }
  return total;
}

/** Top-k chunks for a query. Below the relevance floor (no meaningful lexical overlap) we return
 *  the facts chunks instead of low-signal noise — the grounded-only persona then leans on bio/BREAD
 *  facts rather than an unrelated note. k defaults to 3 (fits the 2048-token window, see prompt.ts). */
export function retrieve(query: string, knowledge: Knowledge, k = 3): Chunk[] {
  const q = tokenize(query);
  const { chunks, df, n } = knowledge;
  const scored = chunks
    .map((c) => ({ c, s: score(q, c, df, n) }))
    .sort((a, b) => b.s - a.s);
  const above = scored.filter((x) => x.s >= FLOOR).slice(0, k).map((x) => x.c);
  if (above.length > 0) return above;
  // floor → facts: the query didn't land, so ground on the hand-authored blocks (or, if there are
  // none, the top-k by score so we never return an empty context).
  const facts = chunks.filter((c) => c.route === FACTS_ROUTE).slice(0, k);
  return facts.length > 0 ? facts : scored.slice(0, k).map((x) => x.c);
}

// The relevance floor: a single query term matching once in an average-idf chunk clears ~1.7, so a
// floor of 1 keeps genuine single-word hits and rejects pure-stopword / no-overlap queries.
const FLOOR = 1;
