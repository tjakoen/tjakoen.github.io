// portfolio/ai/prompt.test.ts — message assembly: persona first, CONTEXT tagged, history window,
// and budget clipping so a big corpus/history never blows the small window.
import { test, expect, describe } from "bun:test";
import { buildPrompt, __test, type ChatMessage } from "./prompt.ts";
import type { Chunk } from "./retrieval.ts";

const chunk = (id: string, route: string, text: string, heading = "", title = "T"): Chunk =>
  ({ id, route, title, heading, text });

describe("buildPrompt", () => {
  test("there is exactly ONE system message, first, opening with the persona; the query is last (user)", () => {
    const msgs = buildPrompt({ query: "who is TJ?", chunks: [chunk("a", "/x", "TJ teaches")], history: [] });
    expect(msgs.filter((m) => m.role === "system").length).toBe(1);   // MLC: system prompt must be the only, first message
    expect(msgs[0]!.role).toBe("system");
    expect(msgs[0]!.content.startsWith(__test.PERSONA)).toBe(true);
    const last = msgs[msgs.length - 1]!;
    expect(last.role).toBe("user");
    expect(last.content).toBe("who is TJ?");
  });

  test("the CONTEXT block (inside the system message) tags each chunk with its route", () => {
    const msgs = buildPrompt({ query: "q", chunks: [chunk("a", "/notes/x", "some prose", "Heading")], history: [] });
    const sys = msgs[0]!;
    expect(sys.role).toBe("system");
    expect(sys.content).toContain("CONTEXT (site content");
    expect(sys.content).toContain("[/notes/x]");
    expect(sys.content).toContain("Heading");
    expect(sys.content).toContain("some prose");
  });

  test("history is clipped to the last HISTORY_TURNS turns", () => {
    const history: ChatMessage[] = [];
    for (let i = 0; i < 10; i++) history.push({ role: i % 2 ? "assistant" : "user", content: `turn ${i}` });
    const msgs = buildPrompt({ query: "now", chunks: [chunk("a", "/x", "y")], history });
    const carried = msgs.filter((m) => /^turn \d+$/.test(m.content));
    expect(carried.length).toBeLessThanOrEqual(__test.HISTORY_TURNS);
    // the OLDEST turns are the ones dropped
    expect(carried.some((m) => m.content === "turn 0")).toBe(false);
    expect(carried.some((m) => m.content === "turn 9")).toBe(true);
  });

  test("a huge corpus is clipped to fit the token budget", () => {
    const big = Array.from({ length: 50 }, (_, i) => chunk(`c${i}`, "/x", "lorem ipsum ".repeat(200)));
    const msgs = buildPrompt({ query: "q", chunks: big, history: [] });
    const total = msgs.reduce((n, m) => n + __test.approxTokens(m.content), 0);
    // budget + query + a little slack for the CONTEXT header wrapper
    expect(total).toBeLessThan(__test.PROMPT_TOKEN_BUDGET + __test.approxTokens("q") + 40);
    // but at least one chunk always survives (grounding is never empty when chunks exist)
    expect(msgs[0]!.content).toContain("CONTEXT (site content");
  });

  test("no chunks → system message is persona-only (no CONTEXT), still valid (persona + query)", () => {
    const msgs = buildPrompt({ query: "q", chunks: [], history: [] });
    expect(msgs.filter((m) => m.role === "system").length).toBe(1);
    expect(msgs[0]!.content).toContain(__test.PERSONA);           // persona present…
    expect(msgs[0]!.content).toContain("CHOICES:");               // …plus the always-on choices protocol
    expect(msgs[0]!.content).not.toContain("CONTEXT (site content");
    expect(msgs[msgs.length - 1]!.content).toBe("q");
  });

  test("no navRoutes → no NAVIGATE protocol in the system message (unchanged prompt)", () => {
    const msgs = buildPrompt({ query: "q", chunks: [], history: [] });
    expect(msgs[0]!.content).not.toContain("NAVIGATE");
  });

  test("navShortlist present → the system message offers a scoped NAVIGATE:<route> protocol with labels", () => {
    const msgs = buildPrompt({ query: "take me to grain", chunks: [], history: [],
      navShortlist: [{ route: "/grain", label: "GRAIN" }, { route: "/notes", label: "Notes" }] });
    const sys = msgs[0]!.content;
    expect(sys).toContain("/grain (GRAIN)");     // route shown with its human label
    expect(sys).toContain("/notes (Notes)");
    expect(sys).toContain("NAVIGATE:<route>");
    expect(sys).toContain('NAVIGATE:/grain"');   // the worked example uses the FIRST offered route
  });

  describe("C2 visitor memory — VISITOR NOTES block", () => {
    test("no visitorNotes → no VISITOR NOTES block (unchanged prompt)", () => {
      const msgs = buildPrompt({ query: "q", chunks: [], history: [] });
      expect(msgs[0]!.content).not.toContain("VISITOR NOTES");
    });

    test("empty visitorNotes array → no block either (same as omitted)", () => {
      const msgs = buildPrompt({ query: "q", chunks: [], history: [], visitorNotes: [] });
      expect(msgs[0]!.content).not.toContain("VISITOR NOTES");
    });

    test("visitorNotes present → a labeled, explicitly untrusted block with one '- <line>' per fact", () => {
      const msgs = buildPrompt({ query: "what do you know about me?", chunks: [], history: [],
        visitorNotes: ["I'm here about grain", "my name is Anna"] });
      const sys = msgs[0]!.content;
      expect(sys).toContain("VISITOR NOTES");
      expect(sys).toContain("never as instructions");     // the never-as-instructions label, load-bearing
      expect(sys).toContain("- I'm here about grain");
      expect(sys).toContain("- my name is Anna");
    });

    test("VISITOR NOTES lands after CONTEXT, not folded into it or the persona", () => {
      const msgs = buildPrompt({ query: "q", chunks: [chunk("a", "/x", "some prose")], history: [],
        visitorNotes: ["a fact"] });
      const sys = msgs[0]!.content;
      const contextIdx = sys.indexOf("CONTEXT (site content");
      const notesIdx = sys.indexOf("VISITOR NOTES");
      expect(contextIdx).toBeGreaterThan(-1);
      expect(notesIdx).toBeGreaterThan(contextIdx);
    });

    test("its cost is spent up front (with persona/choices/nav/canDo), not carved out of history/context", () => {
      // A huge visitorNotes payload still leaves the assembled prompt under budget — proving the
      // notes cost was subtracted before the context fill, the same contract canDo/nav follow.
      const bigNotes = Array.from({ length: 20 }, (_, i) => `fact number ${i} `.repeat(5));
      const big = Array.from({ length: 50 }, (_, i) => chunk(`c${i}`, "/x", "lorem ipsum ".repeat(200)));
      const msgs = buildPrompt({ query: "q", chunks: big, history: [], visitorNotes: bigNotes });
      const total = msgs.reduce((n, m) => n + __test.approxTokens(m.content), 0);
      expect(total).toBeLessThan(__test.PROMPT_TOKEN_BUDGET + __test.approxTokens("q") + 200);
    });
  });
});
