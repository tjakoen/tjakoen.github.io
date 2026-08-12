// portfolio/ai/builder-page.test.ts — buildBuilderView's own contract: the empty state, the result
// state, the matched-nothing state, and the JSON the page prints are exactly matchSpec's own result,
// never a second, drifting shape.
import { test, expect, describe } from "bun:test";
import { matchSpec } from "./field-matcher.ts";
import { buildBuilderView } from "./builder-page.ts";

describe("buildBuilderView: no ask", () => {
  test("empty string -> the empty state, nothing else", () => {
    const v = buildBuilderView("");
    expect(v).toEqual({
      ask: "", builderState: "empty", fields: [], choices: [], messages: [], unsupported: [],
      hasFields: null, hasUnsupported: null, matchedNothing: null, specJson: "",
    });
  });

  test("whitespace-only -> the empty state too (trimmed before deciding)", () => {
    expect(buildBuilderView("   \n\t  ").builderState).toBe("empty");
  });
});

describe("buildBuilderView: a real ask", () => {
  test("fields + a choice -> the result state, hasFields set, the exact matchSpec shape", () => {
    const ask = "a contact form with a name, an email and what they want to talk about";
    const v = buildBuilderView(ask);
    const spec = matchSpec(ask);

    expect(v.ask).toBe(ask);
    expect(v.builderState).toBe("result");
    expect(v.fields).toEqual(spec.fields);
    expect(v.choices).toEqual(spec.choices);
    expect(v.messages).toEqual(spec.messages);
    expect(v.unsupported).toEqual(spec.unsupported);
    expect(v.hasFields).toBe("hasfields");
    expect(v.hasUnsupported).toBeNull();
    expect(v.matchedNothing).toBeNull();
    expect(JSON.parse(v.specJson)).toEqual(spec);
  });

  test("leading/trailing whitespace in the ask is trimmed before matching", () => {
    const v = buildBuilderView("  name and email  ");
    expect(v.ask).toBe("name and email");
    expect(v.fields.map((f) => f.name)).toEqual(["name", "email"]);
  });

  test("an unsupported-only ask: no fields, hasUnsupported set, not matchedNothing", () => {
    // A file upload, since the message box stopped being a refusal on 2026-08-13 and became a
    // control. Picking an ask that still refuses is the whole point of this case.
    const v = buildBuilderView("let them attach a file");
    expect(v.hasFields).toBeNull();
    expect(v.hasUnsupported).toBe("hasunsupported");
    expect(v.matchedNothing).toBeNull();
    expect(v.unsupported.length).toBeGreaterThan(0);
  });

  test("a message-box-only ask counts as fields to render, so the form block shows", () => {
    const v = buildBuilderView("a big message box");
    expect(v.messages.map((m) => m.name)).toEqual(["message"]);
    expect(v.hasFields).toBe("hasfields");
    expect(v.hasUnsupported).toBeNull();
    expect(v.matchedNothing).toBeNull();
  });

  test("a real ask that matches nothing at all: matchedNothing set, everything else empty", () => {
    const v = buildBuilderView("quantum physics and a haiku about the weather");
    expect(v.hasFields).toBeNull();
    expect(v.hasUnsupported).toBeNull();
    expect(v.matchedNothing).toBe("matchednothing");
    expect(v.fields).toEqual([]);
    expect(v.choices).toEqual([]);
    expect(v.messages).toEqual([]);
  });
});
