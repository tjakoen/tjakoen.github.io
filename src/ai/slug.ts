// portfolio/ai/slug.ts — CLIENT-SAFE (§19.2), dependency-free, pure. THE one slug algorithm,
// shared by two callers that must never drift apart: content.ts's MILL heading block-override
// (stamps `id="{slug}"` on every rendered ## / ### heading) and knowledge.ts's corpus builder
// (tags a chunk with the SAME slug as its section's `anchor`). If either side grew its own
// slugifier, a rendered page's real heading id and the corpus's recorded anchor could disagree —
// a deep-link answer would then point at a `#fragment` that doesn't exist on the page. One
// function, imported by both, is what keeps that impossible.

/** Turn a heading's plain text into a URL-safe, lowercase, dash-separated slug. Empty or
 *  symbol-only input (e.g. "!!!", "") yields "". Deterministic and order-preserving: same
 *  input always produces the same slug, which is the whole point of sharing it. */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")   // strip everything but letters, digits, whitespace, dashes
    .trim()
    .replace(/\s+/g, "-")           // whitespace runs → single dash
    .replace(/-+/g, "-")            // collapse dash runs (adjacent to stripped punctuation)
    .replace(/^-+|-+$/g, "");       // trim leading/trailing dashes
}
