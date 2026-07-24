// portfolio/ai/notes-tags.ts — B2 notes filtering ("show me notes about teaching"): matching a
// visitor's FREE-TEXT topic against the REAL tag set the /notes feed already renders, never letting
// the model invent or pick a tag itself (CLAUDE.md design law #2 — code enumerates, the model composes
// prose inside it). Pure + framework-free, mirroring catalog.ts's norm/fold/hit idiom exactly (same
// prefix-match rule, same plural-fold rule) so it unit-tests headless and reads as one family with the
// nav resolver. desk-reasoner.ts is the only caller.

// Filler + note-ish words that carry no TAG signal — dropped before matching so "show me notes about
// teaching" scores on "teaching", not on "notes"/"about"/"show". A notes-flavored superset of
// catalog.ts's own STOP (the words a notes ask specifically drags in: note/post/article/entry/writing,
// tagged/topic/filter/show/find/list/all/any/some).
const STOP = new Set([
  "the", "a", "an", "to", "me", "my", "of", "and", "or", "on", "in", "at", "for", "please",
  "note", "notes", "post", "posts", "article", "articles", "entry", "entries", "writing", "writings",
  "tagged", "about", "topic", "by", "filter", "show", "find", "list", "all", "any", "some",
]);

// Same shape as catalog.ts's own norm/fold: lowercase, strip punctuation (hyphens kept — they're the
// tag-compound separator, e.g. "github-actions"), collapse whitespace, then fold a trailing plural "s"
// off words over 3 chars so "teachings"/"actions" find "teaching"/"action".
const norm = (s: string): string => s.toLowerCase().replace(/[^\w\s-]/g, " ").replace(/\s+/g, " ").trim();
const fold = (w: string): string => (w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w);
const tokens = (s: string): string[] => norm(s).split(/[\s-]+/).filter((w) => w && !STOP.has(w)).map(fold);

// A tag word matches when some query token equals it, OR shares a ≥3-char prefix either direction —
// catalog.ts's exact hit() rule (ported, not reinvented). The length floor is what keeps a short tag
// word like "ai" honest: it only matches an EXACT "ai" in the query, never a stray prefix hit.
const hit = (tagWord: string, queryTokens: string[]): boolean =>
  queryTokens.some((q) => q === tagWord || (tagWord.length >= 3 && (q.startsWith(tagWord) || tagWord.startsWith(q))));

/** Match a free-text topic against the REAL tag set (never a model guess). A tag matches when EVERY
 *  one of its hyphen-split words is hit by some query token — so "github actions" matches the compound
 *  tag "github-actions", a stopword-only topic ("show me notes") matches nothing (empty query), and an
 *  unrelated topic ("quantum physics") matches nothing real. Returned in `allTags` order (its own
 *  newest-first order — content.ts renderNotesFeedPage), not match strength; capped at 3 (a chip row,
 *  not a wall of tags). */
export function matchTags(topic: string, allTags: string[]): string[] {
  const q = tokens(topic);
  if (!q.length) return [];
  const out: string[] = [];
  for (const tag of allTags) {
    const tagWords = tag.toLowerCase().split("-").map(fold);
    if (tagWords.every((w) => hit(w, q))) out.push(tag);
    if (out.length >= 3) break;
  }
  return out;
}

/** The union of every note's tags, first-seen order — the "real tag set" matchTags matches against
 *  when the caller is working from a note LIST (e.g. the desk's /notes.json) rather than the rendered
 *  /notes feed's own precomputed allTags. */
export function uniqueTags(notes: { tags?: string[] }[]): string[] {
  const out: string[] = [];
  for (const n of notes) for (const t of n.tags ?? []) if (!out.includes(t)) out.push(t);
  return out;
}
