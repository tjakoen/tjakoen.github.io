// portfolio/ai/block-reasoner.test.ts — what the model is allowed to have chosen.
//
// grain's own tests cover parseModelMove and validateMove. What is tested here is the narrowing this
// file adds on top: a legal move that is not a block verb is still refused, a reply-without-acting
// is a first-class answer rather than a failure, and every command names the id it is about to touch
// so a legal-but-wrong target is visible before the op lands. The real grain functions are used, not
// stubs, because the point of injecting them is that the contract does the deciding.
import { test, expect, describe } from "bun:test";
import { parseModelMove, validateMove } from "@tjakoen/grain/ai/model.ts";
import { buildManifest, type Manifest } from "@tjakoen/grain/ai/manifest.ts";
import { blockEditManifest, blockEditSchema, blockIntentCorrection, blockIntentRecovery, blockMessage, blockTargetMismatch, readModelMove, BLOCK_VERBS, type GrainModelPort } from "./block-reasoner.ts";

const GRAIN: GrainModelPort = { parseModelMove, validateMove } as unknown as GrainModelPort;

/** A page with four blocks and a prompt box, in the shape a live-DOM harvest produces. */
const MANIFEST: Manifest = buildManifest("builder", [
    { id: "block:b1", kind: "block", accepts: ["block.remove", "block.span", "block.move"] },
    { id: "block:b2", kind: "block", accepts: ["block.remove", "block.span", "block.move"] },
    { id: "block:b3", kind: "block", accepts: ["block.remove", "block.span", "block.move"] },
    { id: "block:b4", kind: "block", accepts: ["block.remove", "block.span", "block.move"] },
    { id: "field:builder-ask", kind: "field", accepts: ["field.set"] },
], { readable: [{ id: "builder-said", kind: "status", text: "Reading the page…" }] });

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

  test("the measured `move` shorthand resolves only with a live block and supported direction", () => {
    const r = read('{"action":"move","target":"b3","payload":{"direction":"up"}}');
    expect(r).toMatchObject({ kind: "command", command: { action: "block.move", surface: "block:b3", said: "Moving b3 up." } });

    const invalid = read('{"action":"move","target":"b3","payload":{"direction":"top"}}');
    if (invalid.kind !== "refusal") throw new Error("expected an invalid direction to be refused");
    expect(invalid.said).not.toMatch(/Moving b3/);
  });

  test("JSON wrapped in the prose a small model adds anyway", () => {
    const r = read('Sure! Here is the move:\n```json\n{"action":"block.remove","target":"block:b1"}\n```');
    expect(r.kind).toBe("command");
  });
});

describe("the edit prompt projection", () => {
  test("keeps live block targets and block verbs, and omits unrelated actions and status text", () => {
    const narrow = blockEditManifest(MANIFEST);
    expect(narrow.actions.map((action) => action.name)).toEqual([...BLOCK_VERBS]);
    expect(narrow.targets.map((target) => target.id)).toEqual(["block:b1", "block:b2", "block:b3", "block:b4"]);
    expect(narrow.inView).toEqual({});
  });

  test("names the block kinds and order so a reference can resolve to a visible id", () => {
    const prompt = blockMessage("make the callout full", [
      { id: "b1", component: "block-lede" },
      { id: "b2", component: "block-card" },
      { id: "b3", component: "block-callout" },
      { id: "b4", component: "block-card" },
    ]);
    expect(prompt).toContain("b1 (intro paragraph), b2 (first card), b3 (callout), b4 (second card)");
    expect(prompt).toContain("The only action names are block.remove, block.span and block.move");
  });

  test("constrains completion to the live block IDs and supported payload values", () => {
    const schema = blockEditSchema(blockEditManifest(MANIFEST)) as {
      properties: { action: { enum: unknown[] }; target: { enum: unknown[] }; payload: { properties: Record<string, { enum: unknown[] }> } };
    };
    expect(schema.properties.action.enum).toEqual([...BLOCK_VERBS, null]);
    expect(schema.properties.target.enum).toEqual([
      "block:b1", "b1", "block:b2", "b2", "block:b3", "b3", "block:b4", "b4", null,
    ]);
    expect(schema.properties.payload.properties.span.enum).toEqual(["full", "half", "third"]);
    expect(schema.properties.payload.properties.direction.enum).toEqual(["up", "down"]);
  });
});

describe("explicit target guard", () => {
  const blocks = [
    { id: "b1", component: "block-lede" },
    { id: "b2", component: "block-card" },
    { id: "b3", component: "block-callout" },
    { id: "b4", component: "block-card" },
  ];

  test("it refuses a legal command against the wrong ordinal block", () => {
    expect(blockTargetMismatch("drop the second card", blocks, "block:b2"))
      .toBe("The request points to second card (b4), but the model proposed first card (b2). Nothing changed. Try naming b4 directly.");
  });

  test("it can transparently correct a wrong model target when the request identifies one block", () => {
    expect(blockIntentCorrection("drop the second card", blocks, {
      action: "block.span", surface: "block:b2", payload: { span: "half" }, said: "Setting b2 to half width.",
    })).toEqual({
      command: { action: "block.remove", surface: "block:b4", payload: {}, said: "" },
      proposed: { action: "block.span", surface: "block:b2", payload: { span: "half" }, said: "Setting b2 to half width." },
      requestedId: "b4",
      requestedLabel: "second card",
      proposedId: "b2",
      proposedLabel: "first card",
    });
    expect(blockIntentCorrection("drop the second card", blocks, {
      action: "block.remove", surface: "block:b2", payload: {}, said: "",
    })?.command.surface).toBe("block:b4");
    expect(blockIntentCorrection("drop the second card", blocks, {
      action: "block.remove", surface: "block:b4", payload: {}, said: "",
    })).toBeNull();
  });

  test("it does not correct an absent, ambiguous, or unspecified target", () => {
    expect(blockIntentCorrection("drop the third card", blocks, {
      action: "block.remove", surface: "block:b2", payload: {}, said: "",
    })).toBeNull();
    expect(blockIntentCorrection("move a card up", blocks, {
      action: "block.move", surface: "block:b2", payload: { direction: "up" }, said: "",
    })).toBeNull();
    expect(blockIntentCorrection("remove that", blocks, {
      action: "block.remove", surface: "block:b2", payload: {}, said: "",
    })).toBeNull();
    expect(blockIntentCorrection("don't drop the second card", blocks, {
      action: "block.remove", surface: "block:b2", payload: {}, said: "",
    })).toBeNull();
  });

  test("it corrects a uniquely stated span and move as well as the target", () => {
    expect(blockIntentCorrection("make the second card half width", blocks, {
      action: "block.span", surface: "block:b2", payload: { span: "full" }, said: "",
    })?.command).toMatchObject({ action: "block.span", surface: "block:b4", payload: { span: "half" } });
    expect(blockIntentCorrection("move the callout down", blocks, {
      action: "block.move", surface: "block:b3", payload: { direction: "up" }, said: "",
    })?.command).toMatchObject({ action: "block.move", surface: "block:b3", payload: { direction: "down" } });
  });

  test("it can recover a declined but explicit request as a review-only command", () => {
    expect(blockIntentRecovery("drop b4", blocks, "I could not identify an action."))
      .toMatchObject({
        command: { action: "block.remove", surface: "block:b4", payload: {} },
        requestedId: "b4",
        requestedLabel: "second card",
        modelReply: "I could not identify an action.",
      });
    expect(blockIntentRecovery("don't drop b4", blocks, "I could not identify an action.")).toBeNull();
    expect(blockIntentRecovery("remove that", blocks, "I could not identify an action.")).toBeNull();
  });

  test("common removal paraphrases recover only with a clear live target", () => {
    expect(blockIntentRecovery("get rid of the final card", blocks, "No action.")?.command)
      .toMatchObject({ action: "block.remove", surface: "block:b4" });
    expect(blockIntentRecovery("take out the callout", blocks, "No action.")?.command)
      .toMatchObject({ action: "block.remove", surface: "block:b3" });
    expect(blockIntentRecovery("get rid of the third card", blocks, "No action."))
      .toBeNull();
    expect(blockIntentRecovery("do not get rid of the final card", blocks, "No action."))
      .toBeNull();
    expect(blockIntentRecovery("avoid getting rid of the final card", blocks, "No action."))
      .toBeNull();
    expect(blockIntentRecovery("without taking out the callout", blocks, "No action."))
      .toBeNull();
  });

  test("discard is a removal request only when the final card is uniquely identified", () => {
    expect(blockIntentRecovery("discard the final card", blocks, "No action.")?.command)
      .toMatchObject({ action: "block.remove", surface: "block:b4" });
    expect(blockIntentRecovery("do not discard the final card", blocks, "No action.")).toBeNull();
    expect(blockIntentRecovery("discard a card", blocks, "No action.")).toBeNull();
  });

  test("a full-row layout paraphrase recovers only for one live component", () => {
    expect(blockIntentRecovery("let the callout fill the whole row", blocks, "No action.")?.command)
      .toMatchObject({ action: "block.span", surface: "block:b3", payload: { span: "full" } });
    expect(blockIntentRecovery("let the callout use the entire row", blocks, "No action.")?.command)
      .toMatchObject({ action: "block.span", surface: "block:b3", payload: { span: "full" } });
    expect(blockIntentRecovery("avoid letting the callout fill the whole row", blocks, "No action."))
      .toBeNull();
    expect(blockIntentRecovery("let a block use the whole row", blocks, "No action."))
      .toBeNull();
  });

  test("a shift paraphrase recovers a one-step move when its target is explicit", () => {
    expect(blockIntentRecovery("shift the callout up", blocks, "No action.")?.command)
      .toMatchObject({ action: "block.move", surface: "block:b3", payload: { direction: "up" } });
    expect(blockIntentRecovery("shift a card up", blocks, "No action.")).toBeNull();
    expect(blockIntentRecovery("do not shift the callout up", blocks, "No action.")).toBeNull();
  });

  test("nudge recovers a one-step move only for a uniquely named live block", () => {
    expect(blockIntentRecovery("nudge the callout down one step", blocks, "No action.")?.command)
      .toMatchObject({ action: "block.move", surface: "block:b3", payload: { direction: "down" } });
    expect(blockIntentRecovery("do not nudge the callout down", blocks, "No action.")).toBeNull();
    expect(blockIntentRecovery("nudge one of the cards down one step", blocks, "No action.")).toBeNull();
  });

  test("a full-row span paraphrase becomes a review-only full-width proposal", () => {
    expect(blockIntentRecovery("let the callout span the whole row", blocks, "No action.")?.command)
      .toMatchObject({ action: "block.span", surface: "block:b3", payload: { span: "full" } });
    expect(blockIntentCorrection("let the callout span the whole row", blocks, {
      action: "block.remove", surface: "block:b3", payload: {}, said: "",
    })?.command).toMatchObject({ action: "block.span", surface: "block:b3", payload: { span: "full" } });
    expect(blockIntentRecovery("let a card span the whole row", blocks, "No action."))
      .toBeNull();
  });

  test("it accepts the requested block and a unique named component", () => {
    expect(blockTargetMismatch("drop the second card", blocks, "block:b4")).toBeNull();
    expect(blockTargetMismatch("move the callout up", blocks, "block:b3")).toBeNull();
  });

  test("it refuses a command when a clear requested target is absent", () => {
    expect(blockTargetMismatch("drop the callout", [blocks[0], blocks[1]], "block:b2"))
      .toBe("The request names callout, but no matching block is on the page. Nothing changed.");
    expect(blockTargetMismatch("remove b9", blocks, "block:b2"))
      .toBe("The request names b9, but no matching block is on the page. Nothing changed.");
    expect(blockTargetMismatch("remove the third card", blocks, "block:b2"))
      .toBe("The request names third card, but no matching block is on the page. Nothing changed.");
  });

  test("it leaves ambiguous multi-target language to the model and review step", () => {
    expect(blockTargetMismatch("move the second card above the callout", blocks, "block:b2")).toBeNull();
    expect(blockTargetMismatch("move a card up", blocks, "block:b2")).toBeNull();
  });

  test("a span value is not mistaken for an ordinal block target", () => {
    expect(blockTargetMismatch("shrink the callout to a third width", blocks, "block:b3")).toBeNull();
    expect(blockIntentRecovery("shrink the callout to a third width", blocks, "No action.")?.command)
      .toMatchObject({ action: "block.span", surface: "block:b3", payload: { span: "third" } });
    expect(blockIntentRecovery("reduce one of the cards to a third width", blocks, "No action.")).toBeNull();
    expect(blockTargetMismatch("remove the third card", blocks, "block:b2"))
      .toBe("The request names third card, but no matching block is on the page. Nothing changed.");
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

  test("a verb with no target says so instead of printing an empty address", () => {
    const r = read('{"action":"block.remove"}');
    if (r.kind !== "refusal") throw new Error("expected a refusal");
    expect(r.said).toContain("drop a block");
    expect(r.said).toContain("which one");
  });

  test("no refusal ever says a change happened", () => {
    const raws = [
      '{"action":"block.remove","target":"block:b9"}',
      '{"action":"block.remove","target":"b9"}',
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

// The measured majority case, and since 2026-08-19 it is an edit rather than a sentence about one.
// The live model names the right block and writes the address short, because b2 is the form it is
// handed and the only form it copies back reliably. The fence reads it up to block:b2 when the page
// holds exactly one block at that address, and refuses everywhere the short form is not decisive.
// The prompt is deliberately not part of this: printing the long form there was measured strictly
// worse and stays reverted (plans/builder-design.md, Open 3).
describe("a bare id the page can resolve", () => {
  test("a bare id the page holds exactly once becomes an edit on the long address", () => {
    const r = read('{"action":"block.remove","target":"b2"}');
    expect(r).toMatchObject({ kind: "command", command: { action: "block.remove", surface: "block:b2", said: "Dropping b2." } });
  });

  test("a resolved id still has to pass the word lists", () => {
    const r = read('{"action":"block.span","target":"b2","payload":{"span":"wide"}}');
    if (r.kind !== "refusal") throw new Error("expected a refusal");
    expect(r.said).toContain("full, half or third");
  });

  test("a bare id no block answers to is still refused, and the refusal names the real ones", () => {
    const r = read('{"action":"block.remove","target":"b9"}');
    if (r.kind !== "refusal") throw new Error("expected a refusal");
    expect(r.said).toContain("b1, b2, b3 and b4");
    expect(r.said).not.toMatch(/Dropping/);
  });

  // Resolving is not guessing. Two blocks at one address is a page where the short form means no one
  // thing, and a fence that picked one of them would be inventing an intent the model never had.
  test("a bare id two blocks answer to is refused rather than picked between", () => {
    const twice = {
      ...MANIFEST,
      targets: [...MANIFEST.targets, { id: "block:b2", kind: "block", label: "block b2 again", accepts: ["block.remove"] }],
    } as unknown as Manifest;
    const r = readModelMove('{"action":"block.remove","target":"b2"}', twice, GRAIN);
    if (r.kind !== "refusal") throw new Error("expected a refusal");
    expect(r.said).toContain("more than one block");
    expect(r.said).toContain("nothing moved");
  });

  // A field is addressed field:builder-ask and nothing on this page answers to block:builder-ask, so
  // there is no path where a short form quietly widens what this file lets through.
  test("resolving only ever reaches a block", () => {
    const r = read('{"action":"field.set","target":"builder-ask","payload":{"value":"a card"}}');
    expect(r.kind).toBe("refusal");
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
