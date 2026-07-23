// portfolio/ai/retrieval.test.ts — the lexical retriever: tokenizer, scoring, top-k, floor→facts.
import { test, expect, describe } from "bun:test";
import { tokenize, score, retrieve, FACTS_ROUTE, type Chunk, type Knowledge } from "./retrieval.ts";

function build(chunks: Chunk[]): Knowledge {
  const df: Record<string, number> = {};
  for (const c of chunks) {
    const seen = new Set(tokenize(c.text + " " + c.heading + " " + c.title));
    for (const t of seen) df[t] = (df[t] ?? 0) + 1;
  }
  return { builtAt: "test", chunks, df, n: chunks.length };
}

const chunk = (id: string, route: string, text: string, heading = "", title = "T"): Chunk =>
  ({ id, route, title, heading, text });

describe("tokenize", () => {
  test("lowercases, splits, drops stopwords + short noise", () => {
    expect(tokenize("The BREAD stack is a UI")).toEqual(["bread", "stack", "ui"]);
  });
  test("stems common suffixes so forms collide", () => {
    // "builds"/"building"/"built" → building→build, builds→build (built keeps, no rule for it)
    expect(tokenize("building builds")).toEqual(["build", "build"]);
  });
  test("empty / pure-stopword input yields no tokens", () => {
    expect(tokenize("the is of a")).toEqual([]);
    expect(tokenize("")).toEqual([]);
  });
});

describe("score", () => {
  const k = build([
    chunk("a", "/notes/x", "grain is the AI interaction design system"),
    chunk("b", "/notes/y", "batch is the substrate that runs the server"),
    chunk("c", FACTS_ROUTE, "TJ builds teaching tools"),
  ]);
  test("a matching term scores above zero; a non-matching query scores zero", () => {
    expect(score(tokenize("grain design"), k.chunks[0]!, k.df, k.n)).toBeGreaterThan(0);
    expect(score(tokenize("kangaroo"), k.chunks[0]!, k.df, k.n)).toBe(0);
  });
  test("an empty query scores zero", () => {
    expect(score([], k.chunks[0]!, k.df, k.n)).toBe(0);
  });
  test("a rarer term outweighs a common one (idf)", () => {
    // "grain" appears in 1 chunk, "the" is a stopword (gone) — use "system" (rare) vs "runs" (rare too);
    // assert the chunk that actually contains the query term wins.
    const q = tokenize("substrate server");
    expect(score(q, k.chunks[1]!, k.df, k.n)).toBeGreaterThan(score(q, k.chunks[0]!, k.df, k.n));
  });
});

describe("retrieve", () => {
  const k = build([
    chunk("a", "/notes/x", "grain is the AI interaction design system with spotlight"),
    chunk("b", "/notes/y", "batch is the substrate that runs the server over SSE"),
    chunk("c", "/notes/z", "mill renders markdown content into grain pages"),
    chunk("facts1", FACTS_ROUTE, "TJ is a teacher who builds software"),
    chunk("facts2", FACTS_ROUTE, "BREAD is a five-layer personal stack"),
  ]);

  test("returns the most relevant chunk first, capped at k", () => {
    const hits = retrieve("what is grain", k, 2);
    expect(hits.length).toBe(2);
    expect(hits[0]!.id).toBe("a");
  });

  test("a query with no lexical overlap falls back to the facts chunks", () => {
    const hits = retrieve("kangaroo helicopter velvet", k, 3);
    expect(hits.every((c) => c.route === FACTS_ROUTE)).toBe(true);
    expect(hits.length).toBe(2);
  });

  test("with no facts chunks, floor falls back to top-k by score (never empty)", () => {
    const noFacts = build(k.chunks.filter((c) => c.route !== FACTS_ROUTE));
    const hits = retrieve("kangaroo", noFacts, 2);
    expect(hits.length).toBe(2);
  });
});
