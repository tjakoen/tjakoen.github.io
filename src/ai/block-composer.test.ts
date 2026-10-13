// portfolio/ai/block-composer.test.ts — what the fence around the build model actually stops.
//
// The prompt is not tested here beyond the one property that is load-bearing, because a prompt is
// judged by what a live model does with it and that measurement lives in tools/desk-audit.ts. What
// IS tested is the reading, and the cases are the answers the real Qwen2.5-0.5B has actually given
// on this page rather than answers imagined for a test: prose wrapped around JSON, a fenced block,
// an invented verb, and the repetition loop that never closes its own object.
import { test, expect, describe } from "bun:test";
import {
  BUILD_PLAN_SCHEMA, completeWithin, composeMessage, readModelPlan, MAX_PLANNED_BLOCKS,
  COMPLETION_TIMEOUT_MS, briefAnchors, briefAnchorsMissingFromDraft, groundBlockCopy,
  reconcileBuildPlan, termsOutsideBrief,
} from "./block-composer.ts";
import { BLOCK_NAMES, composeFromNames, sanitizeBlockCopy } from "./block-set.ts";

const plan = (raw: string) => readModelPlan(raw);
const names = (raw: string) => {
  const read = plan(raw);
  return read.kind === "plan" ? read.names : null;
};

describe("the prompt hands over the closed set", () => {
  test("every buildable name appears in it, so the model is never asked to guess one", () => {
    const message = composeMessage("a page about bread");
    for (const name of BLOCK_NAMES) expect(message).toContain(name);
    expect(message).toContain("Do not invent claims, testimonials, guarantees or statistics.");
    expect(message).toContain("card.title and card.body");
  });

  test("the sentence itself leads, because a small model reads the top of a prompt best", () => {
    expect(composeMessage("  a page about bread  ").startsWith("a page about bread")).toBe(true);
  });

  test("the structured output schema bounds block names, count, spans, and visible copy fields", () => {
    const blocks = BUILD_PLAN_SCHEMA.properties.blocks;
    expect(blocks.maxItems).toBe(MAX_PLANNED_BLOCKS);
    expect(blocks.items.properties.name.enum).toEqual(BLOCK_NAMES);
    expect(blocks.items.properties.copy.additionalProperties).toBe(false);
    expect(BUILD_PLAN_SCHEMA.properties.span.enum).toEqual(["full", "half", "third", null]);
    expect(BUILD_PLAN_SCHEMA.additionalProperties).toBe(false);
  });
});

describe("a plan is read out of whatever the model wrapped it in", () => {
  test("bare JSON", () => {
    expect(names('{"blocks": ["lede", "card"]}')).toEqual(["lede", "card"]);
  });

  test("prose before and after, which is the model's most common shape", () => {
    expect(names('Sure! Here is the page:\n{"blocks": ["lede", "stat"]}\nHope that helps.'))
      .toEqual(["lede", "stat"]);
  });

  test("a fenced code block", () => {
    expect(names('```json\n{"blocks": ["callout"]}\n```')).toEqual(["callout"]);
  });

  test("a second object after the first is ignored rather than merged", () => {
    expect(names('{"blocks": ["lede"]}\n{"blocks": ["card", "card", "card"]}')).toEqual(["lede"]);
  });

  test("one bare name where a list was asked for", () => {
    expect(names('{"blocks": "card"}')).toEqual(["card"]);
  });
});

describe("counting, which is the whole reason the model is on this path", () => {
  test("a repeated name is kept repeated", () => {
    expect(names('{"blocks": ["lede", "card", "card", "callout"]}'))
      .toEqual(["lede", "card", "card", "callout"]);
  });

  test("the model's order is kept, not the table's", () => {
    expect(names('{"blocks": ["stat", "lede"]}')).toEqual(["stat", "lede"]);
  });
});

describe("nothing the model says is trusted", () => {
  test("a name outside the set is dropped rather than corrected to the nearest one", () => {
    const read = plan('{"blocks": ["lede", "hero", "card"]}');
    expect(read.kind).toBe("plan");
    if (read.kind !== "plan") return;
    expect(read.names).toEqual(["lede", "card"]);
    expect(read.dropped).toEqual(["hero"]);
  });

  test("an answer with no legal name left is unusable, not an empty page", () => {
    expect(plan('{"blocks": ["hero", "navbar"]}').kind).toBe("unusable");
  });

  test("a plan longer than the cap is cut at it", () => {
    const many = JSON.stringify({ blocks: Array(40).fill("card") });
    expect(names(many)?.length).toBe(MAX_PLANNED_BLOCKS);
  });

  test("a span outside the closed set is dropped, not passed through", () => {
    const read = plan('{"blocks": ["card"], "span": "wide"}');
    expect(read.kind === "plan" && read.span).toBe(null);
  });

  test("a span inside it survives", () => {
    const read = plan('{"blocks": ["card"], "span": "half"}');
    expect(read.kind === "plan" && read.span).toBe("half");
  });

  test("block objects keep only recognized names and bounded copy for their own text fields", () => {
    const read = plan(JSON.stringify({ blocks: [
      { name: "lede", copy: { body: "A page about Hearth Bakery.", html: "<img>" } },
      { name: "invented", copy: { body: "Drop this with the block." } },
      { name: "card", copy: { title: "Sourdough", body: "Baked fresh each morning." } },
    ] }));
    expect(read.kind).toBe("plan");
    if (read.kind !== "plan") return;
    expect(read.names).toEqual(["lede", "card"]);
    expect(read.copies).toEqual([
      { body: "A page about Hearth Bakery." },
      { title: "Sourdough", body: "Baked fresh each morning." },
    ]);
    expect(read.dropped).toEqual([JSON.stringify({ name: "invented", copy: { body: "Drop this with the block." } })]);
  });
});

describe("generated block copy is bounded by each component's visible text contract", () => {
  test("model copy is reduced to the longest exact phrase supplied in the brief", () => {
    const brief = "Build a landing page for Hearth Bakery in Utrecht. Add an intro that says it is a neighborhood bakery, then a card titled Sourdough with the words baked fresh each morning.";
    const lede = groundBlockCopy(brief, "lede", {
      body: "Hearth Bakery is a neighborhood bakery, where fresh bread is baked every morning.",
    });
    const card = groundBlockCopy(brief, "card", {
      title: "Sourdough",
      body: "Our Sourdough is a staple in the Utrecht neighborhood, baked fresh each morning.",
    });
    const callout = groundBlockCopy(brief, "callout", { body: "Learn more about our daily bread." });

    expect(lede.copy).toEqual({ body: "neighborhood bakery" });
    expect(card.copy).toEqual({ title: "Sourdough", body: "baked fresh each morning" });
    expect(callout.copy).toEqual({});
    expect(lede.changedFields).toEqual(["body"]);
    expect(card.changedFields).toEqual(["body"]);
    expect(callout.changedFields).toEqual(["body"]);
    expect(card.copy.body).not.toContain("staple");
    for (const phrase of [...Object.values(lede.copy), ...Object.values(card.copy)]) {
      expect(brief.toLocaleLowerCase()).toContain(phrase.toLocaleLowerCase());
    }
  });

  test("a source phrase inside a negated claim cannot be extracted as a positive claim", () => {
    expect(groundBlockCopy("This is not a bakery.", "lede", { body: "A bakery welcomes every visitor." }).copy)
      .toEqual({});
    expect(groundBlockCopy("The loaf is not fresh bread.", "card", { body: "Fresh bread today." }).copy)
      .toEqual({});
  });

  test("explicit block requests bound the model plan and keep missing anchors visible", () => {
    const brief = "Build a landing page for Hearth Bakery in Utrecht. Add an intro that says it is a neighborhood bakery, then a card titled Sourdough with the words baked fresh each morning.";
    const reconciled = reconcileBuildPlan(brief, ["lede", "card", "callout"], [
      { body: "Hearth Bakery is a neighborhood bakery, a place where you can enjoy fresh, hand-crafted bread every morning." },
      { title: "Sourdough", body: "Baked fresh each morning, our Sourdough is a staple in the Utrecht neighborhood." },
      { body: "Learn more about our daily bread." },
    ]);

    expect(reconciled.names).toEqual(["lede", "card"]);
    expect(reconciled.droppedBlocks).toBe(1);
    expect(reconciled.copies[0]?.copy.body).toBe("Hearth Bakery · Utrecht · a neighborhood bakery");
    expect(reconciled.copies[1]?.copy).toEqual({
      title: "Sourdough",
      body: "baked fresh each morning",
    });
  });

  test("the review aid finds named details, quoted phrases, and numeric values missing from a draft", () => {
    const brief = "Build a Hearth Bakery page in Utrecht for the ‘Morning Loaf’, founded in 2019.";
    expect(briefAnchors(brief)).toEqual(["Hearth Bakery", "Utrecht", "Morning Loaf", "2019"]);
    expect(briefAnchorsMissingFromDraft(brief, "Hearth Bakery offers the Morning Loaf in Utrecht."))
      .toEqual(["2019"]);
    expect(briefAnchorsMissingFromDraft("Build a page for Ann in Utrecht.", "An announcement is posted in Utrecht."))
      .toEqual(["Ann"]);
    expect(briefAnchors("Build a page for Hearth Bakery in Utrecht. Add an intro and a card."))
      .toEqual(["Hearth Bakery", "Utrecht"]);
    expect(briefAnchors("Keep __builderXss=true as literal text."))
      .not.toContain("Xss");
  });

  test("the review aid flags explicitly requested wording when the draft keeps only a fragment", () => {
    const brief = "Build a page for Northstar Bike Repair in Malmö with the words ready for the next ride.";
    expect(briefAnchors(brief)).toContain("ready for the next ride");
    expect(briefAnchorsMissingFromDraft(brief, "Northstar Bike Repair · Malmö · ready for the next"))
      .toContain("ready for the next ride");
    expect(briefAnchorsMissingFromDraft(brief, "Northstar Bike Repair · Malmö · ready for the next ride"))
      .not.toContain("ready for the next ride");
  });

  test("explicit wording is restored to the block that the brief names", () => {
    const brief = "Build a Northstar Bike Repair page in Malmö. Add an intro for a family-run bike repair shop, then a card titled Tune-up with the words ready for the next ride.";
    const reconciled = reconcileBuildPlan(brief, ["lede", "card"], [
      { body: "Northstar Bike Repair is based in Malmö." },
      { title: "Tune-up", body: "A family-run bike repair shop can get your bike ready for the next adventure." },
    ]);

    expect(reconciled.copies[0]?.copy.body).toContain("a family-run bike repair shop");
    expect(reconciled.copies[1]?.copy.body).not.toContain("family-run bike repair shop");
    expect(reconciled.copies[1]?.copy.body).toBe("ready for the next ride");
  });

  test("intro description stays in the intro when the model repeats card copy there", () => {
    const brief = "Create a page for Juniper Studio in Toronto. Add an intro describing it as an independent pottery studio, then a card titled Weekend workshop with the phrase hand-built pieces for everyday use.";
    const reconciled = reconcileBuildPlan(brief, ["lede", "card"], [
      { body: "Juniper Studio is an independent pottery studio in Toronto and makes hand-built pieces for everyday use." },
      { title: "Weekend Workshop", body: "Join us to make hand-built pieces for everyday use." },
    ]);

    expect(briefAnchors(brief)).toContain("an independent pottery studio");
    expect(reconciled.copies[0]?.copy.body).toContain("an independent pottery studio");
    expect(reconciled.copies[0]?.copy.body).not.toContain("hand-built pieces for everyday use");
    expect(reconciled.copies[1]?.copy.body).toBe("hand-built pieces for everyday use");
  });

  test("the review aid lists meaningful words that are absent from the visitor's brief", () => {
    expect(termsOutsideBrief(
      "Hearth Bakery in Utrecht. Sourdough baked fresh each morning.",
      "Hearth Bakery makes hand-crafted sourdough every morning.",
    )).toEqual(["makes", "hand-crafted", "every"]);
  });

  test("the review aid ignores case, repeated words, and common sentence glue", () => {
    expect(termsOutsideBrief("A page for a bakery in Utrecht", "A BAKERY page in Utrecht.")).toEqual([]);
  });

  test("unknown fields and components are ignored, and controls are stripped", () => {
    expect(sanitizeBlockCopy("card", {
      title: "Fresh\n bread\t today",
      body: "Made with <grain> flour.",
      href: "javascript:alert(1)",
    })).toEqual({ title: "Fresh bread today", body: "Made with <grain> flour." });
    expect(sanitizeBlockCopy("form", { body: "Not a form field." })).toEqual({});
  });

  test("field values are capped and empty values fall back to the component sample", () => {
    const long = "x".repeat(400);
    const copy = sanitizeBlockCopy("card", { title: long, body: "  \n\t  " });
    expect(copy.title).toHaveLength(60);
    expect(copy.body).toBeUndefined();
    const { blocks } = composeFromNames(["card"], "a card", 0, null, [copy]);
    expect(blocks[0]?.data.title).toBe("x".repeat(60));
    expect(blocks[0]?.data.body).toBe("Nothing between source and server: no bundler, no transpiler, no watcher.");
  });
});

describe("the answers that used to hang or mislead the page", () => {
  test("the measured repetition loop never closes its object, so it reads as unusable", () => {
    const loop = '{"action": "move", "payload": ' + '{ "move": '.repeat(60);
    expect(plan(loop).kind).toBe("unusable");
  });

  test("the move answer the edit path keeps getting carries no blocks list", () => {
    expect(plan('{"action": "move", "target": "b2", "payload": {}}').kind).toBe("unusable");
  });

  test("an answer with no JSON in it at all", () => {
    expect(plan("I have built the page for you.").kind).toBe("unusable");
  });
});

describe("composeFromNames enumerates what the model only named", () => {
  test("a repeated name builds that many blocks, with ids that do not collide", () => {
    const { blocks } = composeFromNames(["card", "card"], "two cards");
    expect(blocks.map((b) => b.id)).toEqual(["b1", "b2"]);
    expect(blocks.every((b) => b.component === "block-card")).toBe(true);
    expect(blocks.map((b) => b.data.title)).toEqual(["No build step", "A closed set"]);
  });

  test("startIndex continues an existing composition rather than restarting it", () => {
    const { blocks } = composeFromNames(["card"], "a card", 3);
    expect(blocks[0]?.id).toBe("b4");
  });

  test("a form the sentence cannot fill builds nothing, however confidently it was named", () => {
    expect(composeFromNames(["form"], "a page about bread").blocks).toHaveLength(0);
  });

  test("a form the sentence can fill does build", () => {
    const { blocks } = composeFromNames(["form"], "a form with a name and an email");
    expect(blocks).toHaveLength(1);
  });

  test("the description's own layout word outranks the model's span", () => {
    const { blocks } = composeFromNames(["card", "card"], "two cards side by side", 0, "full");
    expect(blocks.every((b) => b.span === "half")).toBe(true);
  });

  test("the model's span is used when the sentence names no layout", () => {
    const { blocks } = composeFromNames(["card"], "a card", 0, "third");
    expect(blocks[0]?.span).toBe("third");
  });

  test("generated copy replaces examples only on its matching block", () => {
    const { blocks } = composeFromNames(
      ["lede", "card"],
      "a bakery page with an intro and a card",
      0,
      null,
      [{ body: "Fresh bread from Hearth Bakery." }, { title: "Sourdough", body: "Baked daily." }],
    );
    expect(blocks.map((block) => block.data)).toEqual([
      { body: "Fresh bread from Hearth Bakery." },
      { title: "Sourdough", body: "Baked daily." },
    ]);
  });

  test("refusals are read off the SENTENCE, so a plan that omits a gallery still declines it", () => {
    const { refusals } = composeFromNames(["card"], "a card and a gallery of screenshots");
    expect(refusals.map((r) => r.token)).toContain("image");
  });
});

describe("completeWithin bounds one answer", () => {
  test("uses a 75-second completion limit for the local model", () => {
    expect(COMPLETION_TIMEOUT_MS).toBe(75_000);
  });

  test("an answer that arrives is passed straight through", async () => {
    const desk = { complete: async () => '{"blocks": ["card"]}' };
    expect(await completeWithin(desk, "x", 50)).toBe('{"blocks": ["card"]}');
  });

  test("the Builder passes its schema through the bounded completion", async () => {
    let received: Record<string, unknown> | undefined;
    const desk = { complete: async (_prompt: string, schema?: Record<string, unknown>) => {
      received = schema;
      return '{"blocks": [{"name": "card"}]}';
    } };
    expect(await completeWithin(desk, "two cards", 50, BUILD_PLAN_SCHEMA)).toBe('{"blocks": [{"name": "card"}]}');
    expect(received).toBe(BUILD_PLAN_SCHEMA);
  });

  test("an answer that never arrives resolves null instead of hanging the page", async () => {
    const desk = { complete: () => new Promise<string | null>(() => {}) };
    expect(await completeWithin(desk, "x", 20)).toBe(null);
  });

  test("a desk that throws is a null rather than an unhandled rejection", async () => {
    const desk = { complete: async () => { throw new Error("no adapter"); } };
    expect(await completeWithin(desk, "x", 50)).toBe(null);
  });
});
