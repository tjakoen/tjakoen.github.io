// portfolio/ai/block-reasoner.test.ts — what the model is allowed to have chosen.
//
// grain's own tests cover parseModelMove and validateMove. What is tested here is the narrowing this
// file adds on top: a legal move that is not a block verb is still refused, a reply-without-acting
// is a first-class answer rather than a failure, and every command names the id it is about to touch
// so a legal-but-wrong target is visible before the op lands. The real grain functions are used, not
// stubs, because the point of injecting them is that the contract does the deciding.
import { test, expect, describe } from "bun:test";
import { parseModelMove, validateMove } from "@tjakoen/grain/ai/model.ts";
import type { Manifest } from "@tjakoen/grain/ai/manifest.ts";
import { blockMessage, readModelMove, BLOCK_VERBS, type GrainModelPort } from "./block-reasoner.ts";

const GRAIN: GrainModelPort = { parseModelMove, validateMove } as unknown as GrainModelPort;

/** A page with four blocks and a prompt box, in the shape a live-DOM harvest produces. */
const MANIFEST: Manifest = {
  screen: "builder",
  targets: [
    { id: "block:b1", kind: "block", label: "block b1", accepts: ["block.remove", "block.span", "block.move"] },
    { id: "block:b2", kind: "block", label: "block b2", accepts: ["block.remove", "block.span", "block.move"] },
    { id: "block:b3", kind: "block", label: "block b3", accepts: ["block.remove", "block.span", "block.move"] },
    { id: "block:b4", kind: "block", label: "block b4", accepts: ["block.remove", "block.span", "block.move"] },
    { id: "field:builder-ask", kind: "field", label: "Describe a page", accepts: ["field.set"] },
  ],
  readable: [],
} as unknown as Manifest;

const read = (raw: string) => readModelMove(raw, MANIFEST, GRAIN);

describe("a move the model got right", () => {
  test("a removal becomes an intent that names the block", () => {
    const r = read('{"action":"block.remove","target":"block:b4"}');
    expect(r).toMatchObject({ kind: "command", command: { action: "block.remove", surface: "block:b4", said: "Dropping b4." } });
  });

  test("a width carries its payload and says which one", () => {
    const r = read('{"action":"block.span","target":"block:b2","payload":{"span":"full"}}');
    expect(r).toMatchObject({ kind: "command", command: { payload: { span: "full" }, said: "Setting b2 to full width." } });
  });

  test("a move says which way", () => {
    const r = read('{"action":"block.move","target":"block:b3","payload":{"direction":"up"}}');
    if (r.kind !== "command") throw new Error("expected a command");
    expect(r.command.said).toBe("Moving b3 up.");
  });

  test("JSON wrapped in the prose a small model adds anyway", () => {
    const r = read('Sure! Here is the move:\n```json\n{"action":"block.remove","target":"block:b1"}\n```');
    expect(r.kind).toBe("command");
  });
});

describe("what the model is not allowed to have chosen", () => {
  test("a verb that does not exist", () => {
    const r = read('{"action":"block.duplicate","target":"block:b1"}');
    expect(r.kind).toBe("refusal");
  });

  test("a block that is not on the page, and the refusal names the ones that are", () => {
    const r = read('{"action":"block.remove","target":"block:b9"}');
    if (r.kind !== "refusal") throw new Error("expected a refusal");
    expect(r.because).toContain("block:b9");
    expect(r.said).toContain("b1, b2, b3 and b4");
  });

  // grain validates the payload's SCHEMA, not its word list, so "wide" is a string where a string
  // was required and sails through validateMove. Measured: this test asserted a refusal and got a
  // command. The dispatcher would refuse it a beat later, into the console, which the visitor reads
  // as nothing happening after the page announced a change.
  test("a width that is a string but not one of the three", () => {
    const r = read('{"action":"block.span","target":"block:b2","payload":{"span":"wide"}}');
    if (r.kind !== "refusal") throw new Error("expected a refusal");
    expect(r.said).toContain("full, half or third");
  });

  test("a direction that is neither up nor down", () => {
    const r = read('{"action":"block.move","target":"block:b2","payload":{"direction":"top"}}');
    if (r.kind !== "refusal") throw new Error("expected a refusal");
    expect(r.said).toContain("up or down");
  });

  // The narrowing this file exists for. field.set is a perfectly legal move on this page and it is
  // not an edit: letting it through would have the model type into the prompt box it was asked a
  // question in, which reads as the page ignoring you.
  test("a legal move that does not edit a block", () => {
    const r = read('{"action":"field.set","target":"field:builder-ask","payload":{"value":"a card"}}');
    if (r.kind !== "refusal") throw new Error("expected a refusal");
    expect(r.said).toContain("field.set");
    expect(r.because).toContain("block.remove");
  });

  test("nothing parseable at all", () => {
    const r = read("I would be happy to help you with that!");
    if (r.kind !== "refusal") throw new Error("expected a refusal");
    expect(r.said).toContain("drop b2");
  });
});

// A refusal has two readers and they are not the same person. grain's reason is written for a
// console; the said line is page copy, and it was reaching a visitor as `no surface "b2" on this
// screen` before this. What is asserted here is that the two stay separate and that neither one
// starts claiming something moved.
describe("a refusal a visitor can read", () => {
  test("the developer sentence stays in because and never in said", () => {
    const r = read('{"action":"block.remove","target":"block:b9"}');
    if (r.kind !== "refusal") throw new Error("expected a refusal");
    expect(r.because).toContain("no surface");
    expect(r.said).not.toContain("no surface");
    expect(r.said).not.toContain("screen");
  });

  // The measured majority case: the live model names the right block and writes the address short.
  // The refusal says so and still refuses, because normalizing b2 up to block:b2 is an open decision
  // rather than something this file gets to take (plans/builder-design.md, Open 3).
  test("a bare id is named as one word short, and is still refused", () => {
    const r = read('{"action":"block.remove","target":"b2"}');
    if (r.kind !== "refusal") throw new Error("expected a refusal");
    expect(r.said).toContain("block:b2");
    expect(r.said).toContain("nothing moved");
  });

  test("a verb with no target says so instead of printing an empty address", () => {
    const r = read('{"action":"block.remove"}');
    if (r.kind !== "refusal") throw new Error("expected a refusal");
    expect(r.said).toContain("drop a block");
    expect(r.said).toContain("which one");
  });

  test("no refusal ever says a change happened", () => {
    const raws = [
      '{"action":"block.remove","target":"block:b9"}',
      '{"action":"block.remove","target":"b2"}',
      '{"action":"block.remove"}',
      '{"action":"block.span","target":"block:b2","payload":{"span":"wide"}}',
      '{"action":"field.set","target":"field:builder-ask","payload":{"value":"a card"}}',
      "I would be happy to help you with that!",
    ];
    for (const raw of raws) {
      const r = read(raw);
      if (r.kind !== "refusal") throw new Error(`expected a refusal for ${raw}`);
      expect(r.said).not.toMatch(/\b(Dropping|Setting|Moving|done|changed it)\b/i);
    }
  });
});

describe("talking rather than acting", () => {
  test("a reply-only move is an answer, not a failure", () => {
    const r = read('{"action":null,"reply":"There is no verb that rewrites a block\'s words."}');
    expect(r).toMatchObject({ kind: "reply", said: "There is no verb that rewrites a block's words." });
  });

  test("a reply-only move with nothing in it is still refused", () => {
    expect(read('{"action":null,"reply":"  "}').kind).toBe("refusal");
  });
});

describe("the message the model is handed", () => {
  test("it names the blocks literally, because a small model copies better than it counts", () => {
    const m = blockMessage("drop the second card", ["b1", "b2", "b3", "b4"]);
    expect(m).toContain("drop the second card");
    expect(m).toContain("b1, b2, b3, b4");
  });

  test("it spells out the escape, or every message becomes a command", () => {
    expect(blockMessage("what is this page for", ["b1"])).toContain("reply without acting");
  });

  test("an empty page says so rather than naming an empty list", () => {
    expect(blockMessage("drop it", [])).toContain("none");
  });

  test("the three verbs are the three verbs", () => {
    expect([...BLOCK_VERBS]).toEqual(["block.remove", "block.span", "block.move"]);
  });
});
