// portfolio/ai/knowledge.test.ts — the build-time corpus: chunk bounds, heading/route tagging,
// and df sanity. Pure over its input, so no filesystem needed.
import { test, expect, describe } from "bun:test";
import { buildKnowledge, type KnowledgeSource } from "./knowledge.ts";
import { tokenize } from "./retrieval.ts";

const src = (route: string, title: string, markdown: string): KnowledgeSource => ({ route, title, markdown });

describe("buildKnowledge", () => {
  test("splits on ## headings and tags each chunk with route + heading + title", () => {
    const k = buildKnowledge([
      src("/notes/x", "X", "lead paragraph here\n\n## First\nunder first\n\n## Second\nunder second"),
    ]);
    expect(k.n).toBe(k.chunks.length);
    const headings = k.chunks.map((c) => c.heading);
    expect(headings).toContain("");          // the lead
    expect(headings).toContain("First");
    expect(headings).toContain("Second");
    expect(k.chunks.every((c) => c.route === "/notes/x" && c.title === "X")).toBe(true);
  });

  test("chunks stay within the size bound", () => {
    const long = "word ".repeat(600);        // ~3000 chars, one paragraph → hard-split
    const k = buildKnowledge([src("/notes/big", "Big", `## H\n${long}`)]);
    expect(k.chunks.length).toBeGreaterThan(1);
    expect(k.chunks.every((c) => c.text.length <= 1100)).toBe(true);  // ≤1000 + small sentence slack
  });

  test("markdown syntax is reduced to prose (links keep text, code/images dropped)", () => {
    const k = buildKnowledge([src("/notes/m", "M", "see [the notes](/notes) and `code` and ![img](/a.png) here")]);
    const text = k.chunks.map((c) => c.text).join(" ");
    expect(text).toContain("the notes");
    expect(text).not.toContain("/a.png");
    expect(text).not.toContain("![");
  });

  test("df counts each token once per chunk and never exceeds chunk count", () => {
    const k = buildKnowledge([
      src("/a", "A", "grain grain grain design"),   // "grain" repeated in ONE chunk → df 1
      src("/b", "B", "grain substrate"),
    ]);
    expect(k.df["grain"]).toBe(2);
    expect(Math.max(...Object.values(k.df))).toBeLessThanOrEqual(k.n);
    expect(k.df["design"]).toBe(1);
    // the token table matches what tokenize produces
    expect(Object.keys(k.df)).toContain(tokenize("design")[0]);
  });

  test("empty source yields an empty corpus (no crash)", () => {
    const k = buildKnowledge([src("/e", "E", "")]);
    expect(k.chunks.length).toBe(0);
    expect(k.n).toBe(0);
  });
});
