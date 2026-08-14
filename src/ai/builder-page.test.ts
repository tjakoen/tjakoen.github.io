// portfolio/ai/builder-page.test.ts — buildBuilderView's own contract: the empty state, the result
// state, the matched-nothing state, and the JSON the page prints are exactly matchSpec's own result,
// never a second, drifting shape.
import { test, expect, describe } from "bun:test";
import { matchSpec } from "./field-matcher.ts";
import { buildBuilderView } from "./builder-page.ts";

describe("buildBuilderView: no ask", () => {
  // The composer is the one thing the empty state DOES carry, because a page that asks you to
  // describe a form and gives you nowhere to type it is the whole reason piece 1 exists. Its value
  // is null rather than "" so it follows the same spec convention every other item here does.
  test("empty string -> the empty state, plus an empty composer and nothing else", () => {
    const v = buildBuilderView("");
    expect(v).toEqual({
      ask: "", builderState: "empty", fields: [], choices: [], messages: [], checks: [],
      unsupported: [],
      hasFields: null, hasUnsupported: null, matchedNothing: null, specJson: "",
      composer: [{ surface: "field:builder-ask", label: "Describe a form", name: "ask",
        placeholder: "A contact form with a name, an email, and what they want to talk about",
        value: null, required: null, hint: null, error: null }],
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

  // The round trip, asserted where it can be: the composer comes back holding the TRIMMED ask, so
  // the box a visitor sees after a build holds what produced the page and they edit rather than
  // retype. Its name is `ask` because submitting the form has to rebuild the same query string the
  // example links carry, which is what keeps every state on this page a shareable address.
  test("the composer comes back seeded with the ask, under the name the query string uses", () => {
    const v = buildBuilderView("  name and email  ");
    expect(v.composer).toHaveLength(1);
    expect(v.composer[0]!.value).toBe("name and email");
    expect(v.composer[0]!.name).toBe("ask");
    expect(v.composer[0]!.surface).toBe("field:builder-ask");
  });

  // The generated message boxes and the composer are the same atom over different data, so a
  // collision here would put two controls on one address and make "did the desk write into the
  // composer" unanswerable. Nothing enforces that but this.
  test("the composer's address never collides with a generated message box's", () => {
    const v = buildBuilderView("a name, an email and a big message box");
    const generated = v.messages.map((m) => m.surface);
    expect(generated.length).toBeGreaterThan(0);
    expect(generated).not.toContain(v.composer[0]!.surface);
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
