// portfolio/ai/builder-page.test.ts — buildBuilderView's own contract: the empty state, the result
// state, the matched-nothing state, and the JSON the page prints is exactly the composition
// document an export writes, never a second, drifting shape.
import { test, expect, describe } from "bun:test";
import { matchSpec } from "./field-matcher.ts";
import { FORM_COMPONENT } from "./block-set.ts";
import { addFromDescription, emptyComposition, toDocument } from "./composition.ts";
import { buildBuilderView } from "./builder-page.ts";

describe("buildBuilderView: no ask", () => {
  // The composer is the one thing the empty state DOES carry, because a page that asks you to
  // describe a page and gives you nowhere to type it is the whole reason the composer exists. Its
  // value is null rather than "" so it follows the same spec convention every other item here does.
  test("empty string -> the empty state, plus an empty composer and nothing else", () => {
    const v = buildBuilderView("");
    expect(v).toEqual({
      ask: "", builderState: "empty", blocks: [], unsupported: [],
      hasBlocks: null, hasForm: null, hasUnsupported: null, matchedNothing: null, specJson: "",
      composer: [{ surface: "field:builder-ask", label: "Describe a page", name: "ask",
        placeholder: "An intro, two cards side by side, and a contact form with a name and an email",
        value: null, required: null, hint: null, error: null }],
    });
  });

  test("whitespace-only -> the empty state too (trimmed before deciding)", () => {
    expect(buildBuilderView("   \n\t  ").builderState).toBe("empty");
  });
});

describe("buildBuilderView: a page-shaped ask", () => {
  test("three blocks -> the result state, hasBlocks set, and the composition is the document", () => {
    const ask = "an intro, two cards side by side, and a callout";
    const v = buildBuilderView(ask);

    expect(v.builderState).toBe("result");
    expect(v.blocks.map((b) => b.component)).toEqual(["block-lede", "block-card", "block-callout"]);
    expect(v.hasBlocks).toBe("hasblocks");
    expect(v.hasForm).toBeNull();
    expect(v.matchedNothing).toBeNull();
    // The pane prints the artifact, not a second description of it.
    expect(JSON.parse(v.specJson)).toEqual(toDocument(addFromDescription(emptyComposition(), ask)));
  });

  // Layout is the thing the plan warned a matcher gets wrong, so the one layout phrase this page
  // supports is asserted rather than trusted: "side by side" reaches every block the description
  // produced, because a description says how the PAGE reads rather than how one block does.
  test("a layout phrase sets the span of everything that ask produced", () => {
    const v = buildBuilderView("an intro, two cards side by side, and a callout");
    expect(v.blocks.map((b) => b.span)).toEqual(["half", "half", "half"]);
  });

  test("with no layout phrase each block takes its own default span", () => {
    const v = buildBuilderView("an intro, a card and a stat");
    expect(v.blocks.map((b) => b.span)).toEqual(["full", "half", "third"]);
  });
});

describe("buildBuilderView: a form is one block among blocks", () => {
  test("a form-shaped ask still produces a form, and hasForm is what shows its prose", () => {
    const ask = "a contact form with a name, an email and what they want to talk about";
    const v = buildBuilderView(ask);
    const spec = matchSpec(ask);

    expect(v.ask).toBe(ask);
    expect(v.blocks.map((b) => b.component)).toEqual([FORM_COMPONENT]);
    expect(v.hasForm).toBe("hasform");
    expect(v.hasUnsupported).toBeNull();
    // The form block's data IS matchSpec's result, untouched — the reframing costs the field
    // matcher nothing, and this is where that claim is checked rather than stated.
    expect(v.blocks[0]!.data).toEqual(spec as unknown as Record<string, unknown>);
  });

  test("a page ask that also asks for a form gets both, in the table's order", () => {
    const v = buildBuilderView("an intro, a card, and a form with a name and an email");
    expect(v.blocks.map((b) => b.component)).toEqual(["block-lede", "block-card", FORM_COMPONENT]);
    expect(v.hasBlocks).toBe("hasblocks");
    expect(v.hasForm).toBe("hasform");
  });

  test("leading/trailing whitespace in the ask is trimmed before matching", () => {
    const v = buildBuilderView("  a form with a name and an email  ");
    expect(v.ask).toBe("a form with a name and an email");
    expect((v.blocks[0]!.data as { fields: Array<{ name: string }> }).fields.map((f) => f.name))
      .toEqual(["name", "email"]);
  });

  // The round trip, asserted where it can be: the composer comes back holding the TRIMMED ask, so
  // the box a visitor sees after a build holds what produced the page and they edit rather than
  // retype. Its name is `ask` because submitting the form has to rebuild the same query string the
  // example links carry, which is what keeps every state on this page a shareable address.
  test("the composer comes back seeded with the ask, under the name the query string uses", () => {
    const v = buildBuilderView("  a card  ");
    expect(v.composer).toHaveLength(1);
    expect(v.composer[0]!.value).toBe("a card");
    expect(v.composer[0]!.name).toBe("ask");
    expect(v.composer[0]!.surface).toBe("field:builder-ask");
  });

  // The generated message boxes and the composer are the same atom over different data, so a
  // collision here would put two controls on one address and make "did the desk write into the
  // composer" unanswerable. Nothing enforces that but this.
  test("the composer's address never collides with a generated message box's", () => {
    const v = buildBuilderView("a form with a name, an email and a big message box");
    const spec = v.blocks[0]!.data as { messages: Array<{ surface: string }> };
    expect(spec.messages.length).toBeGreaterThan(0);
    expect(spec.messages.map((m) => m.surface)).not.toContain(v.composer[0]!.surface);
  });
});

describe("buildBuilderView: refusals, from both tables, in one list", () => {
  test("a block refusal and a field refusal land together, deduped by token", () => {
    const v = buildBuilderView("a card, a gallery of screenshots, and a side rail");
    expect(v.blocks.map((b) => b.component)).toEqual(["block-card"]);
    expect(v.hasUnsupported).toBe("hasunsupported");
    expect(v.unsupported.map((u) => u.token)).toEqual(["app shell", "image"]);
    expect(new Set(v.unsupported.map((u) => u.token)).size).toBe(v.unsupported.length);
  });

  // The refusal that only field-matcher.ts knows about, on an ask with no form in it. It would be
  // dropped in silence if the page only merged field refusals when a form block existed, and a
  // silently dropped request is the failure this whole demo argues against.
  test("a field-level refusal survives an ask that produced no form at all", () => {
    const v = buildBuilderView("a card and a file upload for their portfolio");
    expect(v.hasForm).toBeNull();
    expect(v.unsupported.map((u) => u.token)).toContain("file upload");
  });

  test("an unsupported-only ask: no blocks, hasUnsupported set, not matchedNothing", () => {
    // A file upload, since the message box stopped being a refusal on 2026-08-13 and became a
    // control. Picking an ask that still refuses is the whole point of this case.
    const v = buildBuilderView("let them attach a file");
    expect(v.hasBlocks).toBeNull();
    expect(v.hasUnsupported).toBe("hasunsupported");
    expect(v.matchedNothing).toBeNull();
    expect(v.unsupported.length).toBeGreaterThan(0);
  });

  test("a real ask that matches nothing at all: matchedNothing set, everything else empty", () => {
    const v = buildBuilderView("quantum physics and a haiku about the weather");
    expect(v.hasBlocks).toBeNull();
    expect(v.hasForm).toBeNull();
    expect(v.hasUnsupported).toBeNull();
    expect(v.matchedNothing).toBe("matchednothing");
    expect(v.blocks).toEqual([]);
  });
});
