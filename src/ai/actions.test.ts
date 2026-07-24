// portfolio/ai/actions.test.ts — the deterministic ACTION router (summarize / capabilities / clarify /
// latest-note / note-write). Navigation is NOT here anymore — it's resolved against the sitemap catalog
// (catalog.ts, covered by catalog.test.ts), so a nav phrase falls through this router as null.
import { test, expect, describe } from "bun:test";
import { routeAction, PINNED_CHIP, ACTION_CHIPS } from "./actions.ts";
import { navTarget } from "./catalog.ts";

describe("routeAction", () => {
  test("summarize phrasings", () => {
    for (const s of ["Summarize this page", "summarise it", "tl;dr", "give me a recap", "sum up this page"])
      expect(routeAction(s)?.kind).toBe("summarize");
  });

  test("note-write phrasings carry the instruction", () => {
    for (const s of ["Add summary bullets to my notepad", "save this to the notepad", "jot this down", "jot down that grain looks promising", "make a note", "put a to-do in my notepad", "note that down"]) {
      const a = routeAction(s);
      expect(a?.kind).toBe("note-write");
      if (a?.kind === "note-write") expect(a.instruction).toBe(s.trim());
    }
  });

  test("note-write beats summarize when the notepad is named (writes, not just summarizes to chat)", () => {
    expect(routeAction("summarize this page to my notepad")?.kind).toBe("note-write");
  });

  test("capabilities phrasings (incl. the pinned chip)", () => {
    for (const s of [PINNED_CHIP, "what can I do here?", "what should I do next", "suggest what to do next", "what's here"])
      expect(routeAction(s)?.kind).toBe("capabilities");
  });

  test("page-inventory asks are capabilities too (the 0.5B mangles route lists — audit finding)", () => {
    for (const s of ["Which pages can you take me to?", "what pages are there", "where can you take me"])
      expect(routeAction(s)?.kind).toBe("capabilities");
  });

  test("open the latest note (a dynamic action, not catalog nav)", () => {
    for (const s of ["Show me the latest note", "show the latest blog", "open the newest post", "read the most recent article"])
      expect(routeAction(s)?.kind).toBe("open-latest-note");
  });

  test("deep-link phrasings extract the topic as `query` (A1: show me the part about X)", () => {
    const cases: [string, string][] = [
      ["Show me the part about teaching with AI", "teaching with ai"],
      ["find the section on grain's spotlight", "grain s spotlight"],
      ["show me the bit covering BREAD", "bread"],
      ["open the passage about MILL", "mill"],
      ["where does TJ talk about teaching with AI", "teaching with ai"],
      ["where do you mention BATCH", "batch"],
      ["where did TJ write about grain", "grain"],
      ["take me to the part about teaching with AI", "teaching with ai"],
      ["jump me to the section on BREAD", "bread"],
    ];
    for (const [s, query] of cases) {
      const a = routeAction(s);
      expect(a?.kind).toBe("deep-link");
      if (a?.kind === "deep-link") expect(a.query).toBe(query);
    }
  });

  test("deep-link with an empty remainder falls through (null) rather than routing a doomed lookup", () => {
    for (const s of ["show me the section about", "show me the section on"])
      expect(routeAction(s)).toBeNull();
  });

  test("guard phrasings still route to their old kinds, not deep-link", () => {
    expect(routeAction("show me the latest note")?.kind).toBe("open-latest-note");
    expect(routeAction("show me around")?.kind).toBe("clarify");
    expect(routeAction("what can I do here")?.kind).toBe("capabilities");
  });

  test("navigation phrases fall through here (null) — the catalog resolves them, not this router", () => {
    for (const s of ["take me to grain", "go to the notes", "grain", "take me home", "take me to the flagship note"])
      expect(routeAction(s)).toBeNull();
  });

  test("a vague 'help me get somewhere' ask offers choices (deterministic disambiguation)", () => {
    for (const s of ["show me around", "give me a tour", "where should I go", "help me choose", "what are my options", "I'm not sure", "surprise me"]) {
      const a = routeAction(s);
      expect(a?.kind).toBe("clarify");
      if (a?.kind === "clarify") { expect(a.choices.length).toBeGreaterThanOrEqual(2); expect(a.prompt).toBeTruthy(); }
    }
  });

  test("every clarify choice is actionable — an action here, or a real nav command for the catalog", () => {
    const a = routeAction("show me around");
    if (a?.kind !== "clarify") throw new Error("expected clarify");
    for (const c of a.choices)
      expect(routeAction(c.value) !== null || navTarget(c.value) !== null).toBe(true);
  });

  test("plain questions fall through to chat (null)", () => {
    for (const s of ["What is BREAD?", "Who is TJ?", "how is this site built", ""])
      expect(routeAction(s)).toBeNull();
  });

  test("the action chips all route to an action (never null)", () => {
    for (const chip of [PINNED_CHIP, ...ACTION_CHIPS]) expect(routeAction(chip)).not.toBeNull();
  });
});
