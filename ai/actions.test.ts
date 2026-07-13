// portfolio/ai/actions.test.ts — the deterministic router: the chip texts and the common typed
// phrasings must resolve to the right action; everything else falls through to chat (null).
import { test, expect, describe } from "bun:test";
import { routeAction, PINNED_CHIP, ACTION_CHIPS } from "./actions.ts";

describe("routeAction", () => {
  test("summarize phrasings", () => {
    for (const s of ["Summarize this page", "summarise it", "tl;dr", "give me a recap", "sum up this page"])
      expect(routeAction(s)?.kind).toBe("summarize");
  });

  test("capabilities phrasings (incl. the pinned chip)", () => {
    for (const s of [PINNED_CHIP, "what can I do here?", "what should I do next", "suggest what to do next", "what's here"])
      expect(routeAction(s)?.kind).toBe("capabilities");
  });

  test("open the latest note", () => {
    for (const s of ["Show me the latest note", "show the latest blog", "open the newest post", "read the most recent article"])
      expect(routeAction(s)?.kind).toBe("open-latest-note");
  });

  test("navigate to a section resolves the route + name", () => {
    expect(routeAction("take me to GRAIN")).toEqual({ kind: "navigate", route: "/grain", name: "GRAIN" });
    expect(routeAction("open the notes")).toEqual({ kind: "navigate", route: "/notes", name: "Notes" });
    expect(routeAction("go to the stack")).toEqual({ kind: "navigate", route: "/bread", name: "the BREAD stack" });
    expect(routeAction("visit mill")?.kind).toBe("navigate");
  });

  test("'open the latest note' is a note action, NOT navigate-to-notes", () => {
    expect(routeAction("open the latest note")?.kind).toBe("open-latest-note");
  });

  test("plain questions fall through to chat (null)", () => {
    for (const s of ["What is BREAD?", "Who is TJ?", "how is this site built", ""])
      expect(routeAction(s)).toBeNull();
  });

  test("the action chips all route to an action (never null)", () => {
    for (const chip of [PINNED_CHIP, ...ACTION_CHIPS]) expect(routeAction(chip)).not.toBeNull();
  });
});
