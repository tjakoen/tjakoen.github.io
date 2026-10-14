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
import { isCopyEditRequest, looksLikeAnEdit, MOVE_DIRECTIONS } from "./block-command.ts";

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
    "remove card caption",
    "shorten second card description",
    "remove its headline",
    "edit caption",
    "shorten the title",
    "change the page headline",
    "make title more concise",
    "remove card",
    "move callout up",
    "drop the ninth card",
  ])("%s", (prompt) => {
    expect(onAPage(prompt)).toBe(true);
  });
});

describe("a description asks for something that is not here yet", () => {
  test.each([
    "an intro, two cards side by side and a contact form",
    "Build a product page with the title, a short description, and two cards.",
    "Create a home page with the heading, one intro, and three cards.",
    "A bakery page with the menu and a callout.",
    "make a page with the title and callout",
    "write a title and a paragraph",
    "build a card with a caption",
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

describe("copy edits wait for a real content operation", () => {
  test.each([
    "the card should mention pricing",
    "rewrite the intro paragraph",
    "change the callout text",
    "make the heading more direct",
    "remove the price from the card",
    "move the price down in the card",
    "remove the title from b3",
    "remove the subtitle from the card",
    "delete the CTA from the callout",
    "take the pricing line out of the card",
    "remove the image from the card",
    "shorten the body on the card",
    "make the card shorter",
    "make the intro friendlier",
    "trim the callout down to one line",
    "remove the card's price",
    "delete the card title",
    "take the subtitle off the callout",
    "get rid of the card logo",
    "delete the title on the second card",
    "remove the opening hours from the bakery card",
    "remove the card image",
    "take the callout text out",
    "remove its headline",
    "make its title shorter",
    "change the first card background color",
    "remove the logo from the second card",
    "delete the icon next to the title in the first card",
    "remove card caption",
    "shorten second card description",
    "edit caption",
    "shorten the title",
    "change the page headline",
    "make title more concise",
  ])("%s", (prompt) => {
    expect(isCopyEditRequest(prompt)).toBe(true);
  });

  test.each([
    "make the callout full width",
    "move the second card up",
    "change the card to half width",
    "move the card down in the price section",
    "remove the first card from the page",
    "remove a card",
    "make the card wider",
    "move the callout after the card",
    "move the card to the other column",
    "remove the card's section from the page",
    "change the card to half width",
    "move the card down in the price section",
    "add another card and remove the first one",
  ])("%s remains an available block operation", (prompt) => {
    expect(isCopyEditRequest(prompt)).toBe(false);
  });
});
