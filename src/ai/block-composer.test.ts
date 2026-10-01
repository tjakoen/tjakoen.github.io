// portfolio/ai/block-composer.test.ts — what the fence around the build model actually stops.
//
// The prompt is not tested here beyond the one property that is load-bearing, because a prompt is
// judged by what a live model does with it and that measurement lives in tools/desk-audit.ts. What
// IS tested is the reading, and the cases are the answers the real Qwen2.5-0.5B has actually given
// on this page rather than answers imagined for a test: prose wrapped around JSON, a fenced block,
// an invented verb, and the repetition loop that never closes its own object.
import { test, expect, describe } from "bun:test";
import {
  completeWithin, composeMessage, readModelPlan, MAX_PLANNED_BLOCKS,
} from "./block-composer.ts";
import { BLOCK_NAMES, composeFromNames } from "./block-set.ts";

const plan = (raw: string) => readModelPlan(raw);
const names = (raw: string) => {
  const read = plan(raw);
  return read.kind === "plan" ? read.names : null;
};

describe("the prompt hands over the closed set", () => {
  test("every buildable name appears in it, so the model is never asked to guess one", () => {
    const message = composeMessage("a page about bread");
    for (const name of BLOCK_NAMES) expect(message).toContain(name);
  });

  test("the sentence itself leads, because a small model reads the top of a prompt best", () => {
    expect(composeMessage("  a page about bread  ").startsWith("a page about bread")).toBe(true);
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

  test("refusals are read off the SENTENCE, so a plan that omits a gallery still declines it", () => {
    const { refusals } = composeFromNames(["card"], "a card and a gallery of screenshots");
    expect(refusals.map((r) => r.token)).toContain("image");
  });
});

describe("completeWithin bounds one answer", () => {
  test("an answer that arrives is passed straight through", async () => {
    const desk = { complete: async () => '{"blocks": ["card"]}' };
    expect(await completeWithin(desk, "x", 50)).toBe('{"blocks": ["card"]}');
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
