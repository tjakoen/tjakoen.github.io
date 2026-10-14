import { expect, test } from "bun:test";
import { builderBlockKeyFromHeading, gradeBuilderDraft } from "./desk-audit-grade.ts";

test("the audit maps the visible intro label back to the Builder's lede component", () => {
  expect(builderBlockKeyFromHeading("b1 · Intro")).toBe("lede");
  expect(builderBlockKeyFromHeading("b2 · Card")).toBe("card");
});

test("a requested phrase in the wrong block does not satisfy a field-specific requirement", () => {
  const failures = gradeBuilderDraft({
    minimumBlocks: 2,
    mustMention: [["Northstar Bike Repair"], ["ready for the next ride"]],
    mustMentionInField: { "card.body": [["ready for the next ride"]] },
  }, [
    "Northstar Bike Repair · ready for the next ride",
    "Tune-up",
    "Nothing between source and server: no bundler, no transpiler, no watcher.",
  ], 2, [
    { block: "lede", field: "body", value: "Northstar Bike Repair · ready for the next ride" },
    { block: "card", field: "body", value: "Nothing between source and server: no bundler, no transpiler, no watcher." },
  ]);

  expect(failures).toEqual(["card.body is missing any of [ready for the next ride]"]);
});

test("the exact phrase in the requested field satisfies the draft requirements", () => {
  const failures = gradeBuilderDraft({
    minimumBlocks: 2,
    mustMention: [["Northstar Bike Repair"], ["ready for the next ride"]],
    mustMentionInField: { "card.body": [["ready for the next ride"]] },
  }, ["Northstar Bike Repair", "Tune-up", "ready for the next ride"], 2, [
    { block: "lede", field: "body", value: "Northstar Bike Repair" },
    { block: "card", field: "title", value: "Tune-up" },
    { block: "card", field: "body", value: "ready for the next ride" },
  ]);

  expect(failures).toEqual([]);
});

test("the audit fails if the reviewed draft includes a phrase the brief forbids", () => {
  const failures = gradeBuilderDraft({
    minimumBlocks: 1,
    mustMention: [["Hearth Bakery"]],
    mustNotMention: ["award-winning bakery", "2019"],
  }, ["Hearth Bakery · award-winning bakery · 2019"], 1);

  expect(failures).toEqual([
    "draft copy includes forbidden wording [award-winning bakery]",
    "draft copy includes forbidden wording [2019]",
  ]);
});

test("the live draft audit fails if an explicitly prohibited block reaches review", () => {
  const requirements = {
    minimumBlocks: 1,
    mustMention: [["Hearth Bakery"]],
    mustNotHaveBlocks: ["card"],
  };
  expect(gradeBuilderDraft(requirements, ["Hearth Bakery"], 2, [
    { block: "lede", field: "body", value: "Hearth Bakery" },
    { block: "card", field: "title", value: "" },
  ], ["lede", "card"])).toEqual(["draft includes prohibited card block"]);
  expect(gradeBuilderDraft(requirements, ["Hearth Bakery"], 2, [], ["lede", "card"]))
    .toEqual(["draft includes prohibited card block"]);
  expect(gradeBuilderDraft(requirements, ["Hearth Bakery"], 1, [
    { block: "lede", field: "body", value: "Hearth Bakery" },
  ])).toEqual([]);
});

test("the live draft audit requires complete intro wording when the scenario depends on it", () => {
  const requirements = {
    minimumBlocks: 1,
    mustMention: [["Hearth Bakery"], ["Utrecht"], ["neighborhood bakery"]],
    mustEqualInField: { "lede.body": ["Hearth Bakery is a neighborhood bakery in Utrecht."] },
  };
  const listLike = gradeBuilderDraft(requirements,
    ["Hearth Bakery · Utrecht · neighborhood bakery"], 1,
    [{ block: "lede", field: "body", value: "Hearth Bakery · Utrecht · neighborhood bakery" }]);
  expect(listLike).toEqual(["lede.body did not match an expected complete value"]);

  const sentence = gradeBuilderDraft(requirements,
    ["Hearth Bakery is a neighborhood bakery in Utrecht."], 1,
    [{ block: "lede", field: "body", value: "Hearth Bakery is a neighborhood bakery in Utrecht." }]);
  expect(sentence).toEqual([]);
});

test("repeated block fields are graded against their own requested phrases", () => {
  const requirements = {
    minimumBlocks: 2,
    mustMention: [["Espresso"], ["Filter"]],
    mustContainInFieldOccurrences: {
      "card.body": [[["chocolate and orange"]], [["floral and bright"]]],
    },
  };
  const correct = gradeBuilderDraft(requirements,
    ["Espresso · chocolate and orange", "Filter · floral and bright"], 2, [
      { block: "card", field: "body", value: "chocolate and orange" },
      { block: "card", field: "body", value: "floral and bright" },
    ]);
  expect(correct).toEqual([]);

  const swapped = gradeBuilderDraft(requirements,
    ["Espresso · floral and bright", "Filter · chocolate and orange"], 2, [
      { block: "card", field: "body", value: "floral and bright" },
      { block: "card", field: "body", value: "chocolate and orange" },
    ]);
  expect(swapped).toEqual([
    "card.body[0] is missing any of [chocolate and orange]",
    "card.body[1] is missing any of [floral and bright]",
  ]);
});
