// portfolio/ai/showcase.test.ts — the "Watch me work" AGENT protocol: parse a model turn into a tool
// call, validate it against live page context, build the per-turn prompt, and round-trip the cross-page
// agent state. Pure, no DOM/model — the driver loop (desk-reasoner.ts) is exercised with a mocked
// engine in desk-reasoner.test.ts.
import { test, expect, describe } from "bun:test";
import {
  parseToolCall, validateToolCall, buildAgentSystemPrompt, recordDone, resolveAnchor, nextStepHint,
  showcaseState, stashShowcaseState, SHOWCASE_KEY, SHOWCASE_GOAL,
  type AgentContext, type ShowcaseState,
} from "./showcase.ts";
import { buildCatalog } from "./catalog.ts";

const CTX: AgentContext = {
  route: "/notes/ten-times-zero",
  title: "Ten Times Zero",
  routes: buildCatalog(["/", "/grain/", "/notes/", "/mail/"]),
  anchors: ["the-one-number-that-matters", "the-receipts"],
  hasNotepad: true,
  hasContact: false,
};

describe("parseToolCall", () => {
  test("each tool form parses, keyword case-insensitive, content preserved", () => {
    expect(parseToolCall("GO /grain")).toEqual({ kind: "go", route: "/grain" });
    expect(parseToolCall("go /notes/ten-times-zero")).toEqual({ kind: "go", route: "/notes/ten-times-zero" });
    expect(parseToolCall("HIGHLIGHT the-one-number-that-matters")).toEqual({ kind: "highlight", anchor: "the-one-number-that-matters" });
    expect(parseToolCall("HIGHLIGHT 1")).toEqual({ kind: "highlight", anchor: "1" });   // the weak model reaches for indices
    expect(parseToolCall("NOTE The judgment is human; the typing is not.")).toEqual({ kind: "note", text: "The judgment is human; the typing is not." });
    expect(parseToolCall("DRAFT Hi TJ, loved the site.")).toEqual({ kind: "draft", text: "Hi TJ, loved the site." });
    expect(parseToolCall("DONE")).toEqual({ kind: "done" });
    expect(parseToolCall("SAY hi").kind).toBe("invalid");   // SAY removed — it was the 0.5B's chatter escape hatch
  });

  test("reads only the FIRST line, tolerates bullets / quotes / trailing prose", () => {
    expect(parseToolCall("- GO /grain\nthen I'll explain")).toEqual({ kind: "go", route: "/grain" });
    expect(parseToolCall('`HIGHLIGHT the-receipts`')).toEqual({ kind: "highlight", anchor: "the-receipts" });
    expect(parseToolCall("GO /grain.")).toEqual({ kind: "go", route: "/grain" });   // trailing punctuation dropped
  });

  test("garbage or a bare keyword with no argument → invalid (carries the raw)", () => {
    for (const raw of ["", "let me think about this", "NOTE", "GO", "highlight"])
      expect(parseToolCall(raw).kind).toBe("invalid");
  });
});

describe("validateToolCall", () => {
  test("GO only to a real catalog route", () => {
    expect(validateToolCall({ kind: "go", route: "/grain" }, CTX).ok).toBe(true);
    expect(validateToolCall({ kind: "go", route: "/secret" }, CTX).ok).toBe(false);
  });

  test("HIGHLIGHT only to a heading on THIS page — by id or 1-based index", () => {
    expect(validateToolCall({ kind: "highlight", anchor: "the-receipts" }, CTX).ok).toBe(true);
    expect(validateToolCall({ kind: "highlight", anchor: "1" }, CTX).ok).toBe(true);      // 1 → first anchor
    expect(validateToolCall({ kind: "highlight", anchor: "9" }, CTX).ok).toBe(false);     // out of range
    expect(validateToolCall({ kind: "highlight", anchor: "made-up" }, CTX).ok).toBe(false);
  });

  test("resolveAnchor maps an index or id to the real heading, else null", () => {
    expect(resolveAnchor("1", CTX.anchors)).toBe("the-one-number-that-matters");
    expect(resolveAnchor("the-receipts", CTX.anchors)).toBe("the-receipts");
    expect(resolveAnchor("9", CTX.anchors)).toBeNull();
    expect(resolveAnchor("nope", CTX.anchors)).toBeNull();
  });

  test("NOTE needs a notepad; DRAFT needs the contact box (targeting is guarded, content is not)", () => {
    expect(validateToolCall({ kind: "note", text: "x" }, CTX).ok).toBe(true);            // notepad present
    expect(validateToolCall({ kind: "draft", text: "x" }, CTX).ok).toBe(false);          // no contact box here
    const mailCtx = { ...CTX, hasContact: true };
    expect(validateToolCall({ kind: "draft", text: "hi" }, mailCtx).ok).toBe(true);
    expect(validateToolCall({ kind: "note", text: "" }, CTX).ok).toBe(false);            // empty content rejected
  });

  test("DONE always passes; invalid never does", () => {
    expect(validateToolCall({ kind: "done" }, CTX).ok).toBe(true);
    expect(validateToolCall({ kind: "invalid", raw: "??" }, CTX).ok).toBe(false);
  });
});

describe("buildAgentSystemPrompt", () => {
  const state: ShowcaseState = { goal: SHOWCASE_GOAL, done: ["GO /notes/ten-times-zero"], step: 1 };

  test("enumerates real routes + NUMBERED anchors, a one-shot example, and a suggested next step", () => {
    const p = buildAgentSystemPrompt(state, CTX);
    expect(p).toContain("/mail");                              // a real route offered
    expect(p).toContain("1=the-one-number-that-matters");      // anchors numbered (the model reaches for indices)
    expect(p).toContain("HIGHLIGHT 1");                        // the one-shot example = the suggested next command
    expect(p).toContain("SUGGESTED next action");              // the computed nudge that keeps a weak model moving
    expect(p).toContain("DONE");
  });

  test("flags an unavailable target so the model doesn't try it here", () => {
    const p = buildAgentSystemPrompt(state, CTX);              // CTX.hasContact = false
    expect(/DRAFT[^\n]*unavailable here/i.test(p)).toBe(true);
  });
});

describe("nextStepHint", () => {
  test("walks the demo: open note → highlight → note → go to mail → draft → done", () => {
    const base = { goal: SHOWCASE_GOAL, step: 0 };
    const homeCtx = { ...CTX, route: "/", anchors: [] as string[], hasNotepad: false };
    expect(nextStepHint({ ...base, done: [] }, homeCtx)).toContain("GO /notes/ten-times-zero");
    expect(nextStepHint({ ...base, done: ["GO /notes/ten-times-zero"] }, CTX)).toContain("HIGHLIGHT");
    expect(nextStepHint({ ...base, done: ["GO ...", "HIGHLIGHT x"] }, CTX)).toContain("NOTE");
    const mailCtx = { ...CTX, route: "/mail", anchors: [] as string[], hasNotepad: false, hasContact: true };
    expect(nextStepHint({ ...base, done: ["HIGHLIGHT x", "NOTE y"] }, mailCtx)).toContain("DRAFT");
    expect(nextStepHint({ ...base, done: ["DRAFT z"] }, mailCtx)).toContain("DONE");
  });
});

describe("recordDone", () => {
  test("appends and caps the trail", () => {
    let d: string[] = [];
    for (let i = 0; i < 20; i++) d = recordDone(d, `step ${i}`);
    expect(d.length).toBeLessThanOrEqual(9);
    expect(d[d.length - 1]).toBe("step 19");
  });
});

describe("showcaseState / stashShowcaseState", () => {
  test("round-trips a valid state", () => {
    const s: ShowcaseState = { goal: "g", done: ["GO /grain"], step: 2 };
    expect(showcaseState(stashShowcaseState(s))).toEqual(s);
  });

  test("null / garbage / wrong-shape → null", () => {
    for (const raw of [null, "", "not json", "{}", '{"goal":1}', '{"goal":"g","done":"x","step":0}', '{"goal":"g","done":[],"step":-1}'])
      expect(showcaseState(raw)).toBeNull();
  });

  test("the key is the named knob the door + reasoner share, never the tour's", () => {
    expect(SHOWCASE_KEY).toBe("desk-showcase");
    expect(SHOWCASE_KEY).not.toBe("desk-tour");
  });
});
