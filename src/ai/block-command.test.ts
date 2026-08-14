// portfolio/ai/block-command.test.ts — the routing question, and only that.
//
// The choosing moved to block-reasoner.ts when the model took it over. What is left here is the one
// decision made without a model, so it has to hold on a machine that cannot run one: does this
// prompt point at a block that already exists, or is it asking for one that does not?
//
// The cases that matter most are the descriptions carrying verb words. Every one of them is a real
// shape of prompt, and one of them is the defect that bought this rule: "a form to sign up" was read
// as a move, went looking for a form to move, and refused to build the form it was asked for.
import { test, expect, describe } from "bun:test";
import { looksLikeAnEdit, MOVE_DIRECTIONS } from "./block-command.ts";

const onAPage = (prompt: string) => looksLikeAnEdit(prompt, 4);

describe("an edit points at something already here", () => {
  test.each([
    "drop the second card",
    "remove the form",
    "delete the second one",
    "get rid of b4",
    "scrap the last block",
    "make the callout half",
    "move the form up",
    "delete it",
    "make that one full width",
  ])("%s", (prompt) => {
    expect(onAPage(prompt)).toBe(true);
  });
});

describe("a description asks for something that is not here yet", () => {
  test.each([
    "an intro, two cards side by side and a contact form",
    "another card",
    "a stat",
    "a form to sign up",                    // " up " is a direction word
    "a card above the fold",                // so is " above "
    "a callout below an intro",             // and " below "
    "a full width hero and two stats",      // " full " is a width word
    "a card sized for a phone",             // " size " is a resize word
    "a registration form",
  ])("%s", (prompt) => {
    expect(onAPage(prompt)).toBe(false);
  });

  test("the pair that states the rule", () => {
    expect(onAPage("remove a card")).toBe(false);
    expect(onAPage("remove the card")).toBe(true);
  });
});

describe("the guards", () => {
  test("an empty page is never an edit, so drop in a card still means add", () => {
    expect(looksLikeAnEdit("drop the card", 0)).toBe(false);
  });

  test("an empty prompt", () => {
    expect(looksLikeAnEdit("   ", 4)).toBe(false);
  });

  test("an id off the rail counts on its own, with no article anywhere", () => {
    expect(onAPage("b3 full width")).toBe(true);
  });

  // The order is the whole rule. Both sentences carry "the" and both carry "card"; only one of them
  // is pointing the article at the card.
  test("a definite marker only counts when a block noun follows it", () => {
    expect(onAPage("a card above the fold")).toBe(false);
    expect(onAPage("drop the second card")).toBe(true);
  });

  // The same drift guard grain puts on ai-dispatch.js's copies: this module re-states the contract's
  // direction words rather than importing them, so a third one appearing in grain has to fail here.
  test("a move is up or down and there is no third direction", () => {
    expect([...MOVE_DIRECTIONS]).toEqual(["up", "down"]);
  });
});
