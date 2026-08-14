// portfolio/ai/block-command.test.ts — the chooser, and what it refuses to guess.
//
// The behaviour worth pinning is in two halves. One is that the flagship sentence resolves: "drop
// the second card" has to become block.remove on the second CARD's id, not on the second block. The
// other is that everything ambiguous comes back as a refusal, because a builder that edits the
// wrong block is worse than one that says it did not understand.
import { test, expect, describe } from "bun:test";
import { readBlockCommand, MOVE_DIRECTIONS, type BlockRef } from "./block-command.ts";

/** A page: a lede, two cards, a stat and a form, in that order. Ids are what the rail prints. */
const PAGE: BlockRef[] = [
  { id: "b1", component: "block-lede" },
  { id: "b2", component: "block-card" },
  { id: "b3", component: "block-card" },
  { id: "b4", component: "block-stat" },
  { id: "b5", component: "block-form" },
];

const cmd = (prompt: string, blocks: BlockRef[] = PAGE) => {
  const read = readBlockCommand(prompt, blocks);
  if (read.kind !== "command") throw new Error(`expected a command, got ${read.kind}: ${"said" in read ? read.said : ""}`);
  return read.command;
};

const refusal = (prompt: string, blocks: BlockRef[] = PAGE) => {
  const read = readBlockCommand(prompt, blocks);
  if (read.kind !== "refusal") throw new Error(`expected a refusal, got ${read.kind}`);
  return read.said;
};

describe("removing", () => {
  test("the sentence this phase is named after", () => {
    expect(cmd("drop the second card")).toMatchObject({ action: "block.remove", surface: "block:b3", payload: {} });
  });

  test("a kind with only one of it needs no ordinal", () => {
    expect(cmd("remove the form").surface).toBe("block:b5");
  });

  test("an ordinal with no kind counts blocks, not cards", () => {
    expect(cmd("delete the second one").surface).toBe("block:b2");
  });

  test("the id printed in the rail names it exactly", () => {
    expect(cmd("get rid of b4").surface).toBe("block:b4");
  });

  test("the last one", () => {
    expect(cmd("scrap the last block").surface).toBe("block:b5");
  });

  test("on a page holding one block, it is unambiguous", () => {
    expect(cmd("delete it", [{ id: "b1", component: "block-card" }]).surface).toBe("block:b1");
  });
});

describe("width", () => {
  test("a width word after the target", () => {
    expect(cmd("make the second card half")).toMatchObject({ action: "block.span", surface: "block:b3", payload: { span: "half" } });
  });

  test("third reads as the width when it comes last and as the position when it comes first", () => {
    expect(cmd("make the second one a third")).toMatchObject({ surface: "block:b2", payload: { span: "third" } });
    expect(cmd("set the third block to half")).toMatchObject({ surface: "block:b3", payload: { span: "half" } });
  });

  test("full width", () => {
    expect(cmd("make the stat full width").payload).toEqual({ span: "full" });
  });
});

describe("moving", () => {
  test("up", () => {
    expect(cmd("move the form up")).toMatchObject({ action: "block.move", surface: "block:b5", payload: { direction: "up" } });
  });

  test("down, said as later", () => {
    expect(cmd("move the lede later").payload).toEqual({ direction: "down" });
  });

  test("a direction with no move verb still moves", () => {
    expect(cmd("the stat one place up").payload).toEqual({ direction: "up" });
  });
});

describe("what is not an edit at all", () => {
  test("a description of a page composes rather than edits", () => {
    expect(readBlockCommand("an intro, two cards side by side and a contact form", PAGE).kind).toBe("none");
  });

  test("an empty page never yields a command, so drop in a card still means add", () => {
    expect(readBlockCommand("drop in a card", []).kind).toBe("none");
  });

  test("an empty prompt", () => {
    expect(readBlockCommand("   ", PAGE).kind).toBe("none");
  });
});

describe("refusals: it will not guess", () => {
  test("two cards and no ordinal says how many it counted", () => {
    expect(refusal("remove the card")).toContain("2 cards");
  });

  test("a kind that is not on the page", () => {
    expect(refusal("delete the callout")).toContain("no callout");
  });

  test("an id that is not on the page", () => {
    expect(refusal("remove b9")).toContain("no b9");
  });

  test("a position past the end", () => {
    expect(refusal("delete the sixth one")).toContain("5 blocks");
  });

  test("a nudge is refused with the three words, because span is a set", () => {
    const said = refusal("make the form wider");
    expect(said).toContain("full, half or third");
  });

  test("a resize with no width named", () => {
    expect(refusal("change the width of the form")).toContain("full, half or third");
  });

  test("a move with no direction", () => {
    expect(refusal("move the form")).toContain("up or down");
  });

  test("a move further than one place", () => {
    expect(refusal("move the form to the top")).toContain("one place at a time");
  });

  test("two changes in one sentence", () => {
    expect(refusal("remove the lede and move the form up")).toContain("more than one change");
  });

  test("no target at all on a page holding several", () => {
    expect(refusal("delete it")).toContain("Which block");
  });
});

describe("the closed sets", () => {
  // The same drift guard grain puts on ai-dispatch.js's copies: this module re-states the contract's
  // direction words rather than importing them, so a third one appearing in grain has to fail here.
  test("a move is up or down and there is no third direction", () => {
    expect([...MOVE_DIRECTIONS]).toEqual(["up", "down"]);
  });

  test("every command names a real block address", () => {
    for (const prompt of ["drop the second card", "make the stat full", "move the form up"]) {
      expect(cmd(prompt).surface).toMatch(/^block:b\d+$/);
    }
  });
});
