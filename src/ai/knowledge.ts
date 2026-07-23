// portfolio/ai/knowledge.ts — the BUILD-TIME corpus builder. Pure over its input (the IO +
// frontmatter stripping live in content.ts's listKnowledgeSources), so it unit-tests without a
// filesystem. Turns each source's markdown into heading-sized, ≤~1000-char chunks and precomputes
// the per-token document-frequency table the browser-side retriever (retrieval.ts) scores against.
// Served frozen as /knowledge.json — the model never touches the repo, only this compiled shape.

import { tokenize, type Chunk, type Knowledge } from "./retrieval.ts";

/** A content source to fold into the corpus: where it lives, its title, and its markdown BODY
 *  (frontmatter already stripped by the caller). */
export interface KnowledgeSource {
  route: string;
  title: string;
  markdown: string;
}

const MAX_CHUNK_CHARS = 1000;

/** Reduce markdown to plain prose for retrieval: drop code fences, images, and list/emphasis
 *  syntax; keep link TEXT (not URLs); collapse whitespace. Lexical scoring wants words, not syntax. */
function toPlainText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")            // fenced code blocks
    .replace(/`([^`]*)`/g, "$1")                // inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")      // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")    // links → their text
    .replace(/^[>\-*+]\s+/gm, "")               // blockquote / list markers
    .replace(/[*_#]+/g, "")                     // emphasis + stray heading marks
    .replace(/\s+/g, " ")
    .trim();
}

/** Split a markdown body into sections at `##`/`###` headings. The prose before the first heading
 *  is the lead (heading ""). Returns [{ heading, body }] with markdown still inside body. */
function splitSections(md: string): Array<{ heading: string; body: string }> {
  const lines = md.split("\n");
  const sections: Array<{ heading: string; body: string[] }> = [{ heading: "", body: [] }];
  for (const line of lines) {
    const m = /^#{2,3}\s+(.*)$/.exec(line);
    if (m) sections.push({ heading: m[1]!.trim(), body: [] });
    else sections[sections.length - 1]!.body.push(line);
  }
  return sections.map((s) => ({ heading: s.heading, body: s.body.join("\n") }));
}

/** Pack a section's plain text into ≤ MAX_CHUNK_CHARS pieces on paragraph boundaries; a single
 *  over-long paragraph is hard-split on sentence ends so no chunk exceeds the bound by much. */
function packChunks(text: string): string[] {
  if (!text) return [];
  const paras = text.split(/\n\s*\n/).map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean);
  const out: string[] = [];
  let buf = "";
  const flush = () => { if (buf.trim()) out.push(buf.trim()); buf = ""; };
  for (const para of paras) {
    if (para.length > MAX_CHUNK_CHARS) {
      flush();
      // break on sentence ends; a single run-on "sentence" with no punctuation still has to fit, so
      // fall through to word-greedy packing (never emit a piece longer than the bound).
      let piece = "";
      const push = () => { if (piece.trim()) out.push(piece.trim()); piece = ""; };
      for (const sentence of para.split(/(?<=[.!?])\s+/)) {
        if (sentence.length > MAX_CHUNK_CHARS) {
          if (piece) push();
          for (const word of sentence.split(/\s+/)) {
            if (piece.length + word.length + 1 > MAX_CHUNK_CHARS && piece) push();
            piece += (piece ? " " : "") + word;
          }
          continue;
        }
        if (piece.length + sentence.length > MAX_CHUNK_CHARS && piece) push();
        piece += (piece ? " " : "") + sentence;
      }
      push();
      continue;
    }
    if (buf.length + para.length > MAX_CHUNK_CHARS && buf) flush();
    buf += (buf ? " " : "") + para;
  }
  flush();
  return out;
}

/** Build the corpus: every source → sections → packed chunks, with a precomputed df table. */
export function buildKnowledge(sources: KnowledgeSource[]): Knowledge {
  const chunks: Chunk[] = [];
  for (const src of sources) {
    let seq = 0;
    for (const section of splitSections(src.markdown)) {
      const plainHeading = toPlainText(section.heading);
      for (const text of packChunks(toPlainText(section.body))) {
        chunks.push({
          id: `${src.route.replace(/^\//, "")}#${seq++}`,
          route: src.route,
          title: src.title,
          heading: plainHeading,
          text,
        });
      }
    }
  }
  const df: Record<string, number> = {};
  for (const c of chunks) {
    for (const t of new Set(tokenize(c.text + " " + c.heading + " " + c.title))) df[t] = (df[t] ?? 0) + 1;
  }
  return { builtAt: new Date().toISOString(), chunks, df, n: chunks.length };
}
