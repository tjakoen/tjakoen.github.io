// portfolio/ai/catalog.ts — the desk's navigable-destination catalog, derived from the REAL sitemap
// (enriched with titles from the knowledge corpus + notes), NOT a hardcoded alias table. "What's
// available" is the site itself, so navigation scales as pages are added and the desk can never send a
// visitor to a route that doesn't exist. Two consumers:
//   • resolveNav  — a deterministic resolver: "take me to X" → a real route, no model + no model download.
//   • navShortlist — a small, relevance-ranked list of real destinations handed to the model for the
//     fuzzy tail (so a weak model chooses from real routes instead of inventing one).
// Pure + framework-free, so it unit-tests headless.

/** One real destination: its route and a human label (a page/note title, or a humanized slug). */
export interface NavDest { route: string; label: string }

// Words that carry no destination signal — dropped before matching so "take me to the notes page"
// scores on "notes", not on "the"/"page".
const STOP = new Set([
  "the", "a", "an", "to", "me", "my", "of", "and", "or", "on", "in", "at", "for", "please",
  "take", "bring", "send", "go", "get", "see", "show", "open", "this", "that", "page", "pages",
  "section", "view", "please", "us", "into", "over",
]);

const norm = (s: string): string => s.toLowerCase().replace(/[^\w\s/-]/g, " ").replace(/\s+/g, " ").trim();
// Fold a trailing plural/verb "s" so "docs" and "notes" match their singulars — combined with hit()'s
// prefix rule this is what lets "documentation" find "/mill/docs" ("docs"→"doc", a prefix of
// "documentation"; neither raw form is a prefix of the other). Baseline-audit finding.
const fold = (w: string): string => (w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w);
const tokens = (s: string): string[] => norm(s).split(/[\s/-]+/).filter((w) => w && !STOP.has(w)).map(fold);
const stripSlash = (r: string): string => r.replace(/\/+$/, "") || "/";
const routeSegs = (route: string): string[] => route.split("/").filter(Boolean);

function humanize(route: string): string {
  if (route === "/") return "Home";
  const seg = routeSegs(route).pop() ?? "";
  return seg.split("-").map((w) => (w ? w[0]!.toUpperCase() + w.slice(1) : w)).join(" ");
}

/** Build the catalog: every real route (from the sitemap), labeled by its known title when we have one
 *  (a note or doc), otherwise a humanized slug. Trailing slashes normalized; duplicates dropped. */
export function buildCatalog(routes: string[], titleByRoute: Record<string, string> = {}): NavDest[] {
  const seen = new Set<string>();
  const out: NavDest[] = [];
  for (const raw of routes) {
    const route = stripSlash(raw);
    if (seen.has(route)) continue;
    seen.add(route);
    const title = titleByRoute[route];
    out.push({ route, label: title && title.trim() ? title.trim() : humanize(route) });
  }
  return out;
}

// A destination's searchable tokens: its route segments + its label words (both split on hyphens).
const destTokens = (d: NavDest): string[] => [...tokens(d.route), ...tokens(d.label)];
// A query token matches a destination token on equality OR a shared prefix (≥3 chars) — so "note"
// finds "notes" and "doc" finds "docs" without a full stemmer.
const hit = (w: string, dt: string[]): boolean =>
  dt.some((t) => t === w || (w.length >= 3 && (t.startsWith(w) || w.startsWith(t))));
const covered = (q: string[], dt: string[]): number => q.reduce((n, w) => n + (hit(w, dt) ? 1 : 0), 0);

// A nav VERB at the start of a request ("take me to", "go to", "open", "navigate to"…). Returns the
// target phrase after the verb, or null when the text isn't a navigation command. The `home|back`
// lookahead handles "take me home" / "go back" where there's no "to". A polite-intent PREFIX
// ("I want to…", "can you…") is skipped first, so "I want to read the mill documentation" is the
// nav command "read the mill documentation" — the baseline audit showed that phrasing falling to
// the model, which explained the route instead of going there. "read" joined the bare verbs for the
// same case; full-coverage matching still keeps a mere mention ("I read a note once") from firing.
const NAV_VERB =
  /^\s*(?:please\s+)?(?:i\s+(?:want|need|would\s+like|wish)\s+to\s+|i(?:'|’)?d\s+(?:like|love)\s+to\s+|i\s+wanna\s+|can\s+you\s+|could\s+you\s+|let(?:'|’)?s\s+)?(?:please\s+)?(?:(?:take|bring|send|get|lead|point|show)\s+me\s+(?:back\s+)?(?:to|toward|towards|into|over\s+to)\s+|(?:go|head|jump|navigate|nav|return|come)\s+(?:back\s+)?(?:to|over\s+to)\s+|(?:take|bring|send|get|lead|go|head)\s+(?:me\s+)?(?=home\b|back\b)|(?:open|show|visit|see|view|read|load|launch|pull\s+up)\s+)/i;

/** The place phrase in a nav command, or null if `text` isn't one. */
export function navTarget(text: string): string | null {
  const m = NAV_VERB.exec(text);
  return m ? text.slice(m[0].length).trim() : null;
}

// Among destinations that cover EVERY query token, pick the shallowest route (a section landing like
// /grain over a deep child like /grain/docs/ai-interface), then the shortest — the most canonical.
function bestFullCover(q: string[], catalog: NavDest[]): NavDest | null {
  let best: NavDest | null = null;
  for (const d of catalog) {
    if (covered(q, destTokens(d)) < q.length) continue;   // require FULL coverage for a confident match
    if (!best) { best = d; continue; }
    const dDepth = routeSegs(d.route).length, bDepth = routeSegs(best.route).length;
    if (dDepth < bDepth || (dDepth === bDepth && d.route.length < best.route.length)) best = d;
  }
  return best;
}

/** Deterministic navigation: resolve a request to a REAL catalog destination, or null (→ chat/model).
 *  A verbed command ("take me to X") matches when one destination covers all of X's tokens. A BARE
 *  place-name (no verb) must match a route's last segment or its label exactly — so a question like
 *  "what is grain" never navigates, but a lone "grain" does. */
export function resolveNav(text: string, catalog: NavDest[]): NavDest | null {
  const target = navTarget(text);
  if (target !== null) {
    const q = tokens(target);
    return q.length ? bestFullCover(q, catalog) : null;
  }
  const whole = norm(text);
  let bare: NavDest | null = null;
  for (const d of catalog) {
    const last = routeSegs(d.route).pop() ?? "";
    if (whole === last || whole === last.replace(/-/g, " ") || norm(d.label) === whole) {
      if (!bare || d.route.length < bare.route.length) bare = d;
    }
  }
  return bare;
}

/** The site's top-level sections (shallowest routes), for a general "where can you take me?" ask
 *  where no specific destination scored — the model then lists REAL places instead of inventing
 *  paths (the audit caught it offering /notes/why-i-teach/index.html when handed nothing). */
export function sectionShortlist(catalog: NavDest[], k = 6): NavDest[] {
  return [...catalog]
    .sort((a, b) => routeSegs(a.route).length - routeSegs(b.route).length || a.route.length - b.route.length)
    .slice(0, k);
}

// A query that's ABOUT navigation ("which pages can you take me to?") even though no destination
// token survives the stopword filter — the cue to fall back to the section list above.
const NAV_ISH = /\b(page|pages|where|go|goes|take|visit|navigate|section|sections|site)\b/i;

/** The top-k real destinations most relevant to `query`, ranked by how many of its tokens they cover.
 *  Handed to the model for the fuzzy tail (a partial match the deterministic resolver won't commit to),
 *  so the model always chooses from real routes. Empty when nothing overlaps at all — unless the query
 *  is nav-flavored, which falls back to the top-level sections so a general "where can you take me?"
 *  still gets real destinations. */
export function navShortlist(query: string, catalog: NavDest[], k = 6): NavDest[] {
  const q = tokens(navTarget(query) ?? query);
  const ranked = q.length
    ? catalog
      .map((d) => ({ d, hits: covered(q, destTokens(d)), depth: routeSegs(d.route).length }))
      .filter((s) => s.hits > 0)
      .sort((a, b) => b.hits - a.hits || a.depth - b.depth || a.d.route.length - b.d.route.length)
      .slice(0, k)
      .map((s) => s.d)
    : [];
  if (ranked.length > 0) return ranked;
  return NAV_ISH.test(query) ? sectionShortlist(catalog, k) : [];
}
