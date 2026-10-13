import { expect, test } from "bun:test";
import { gradeBuilderDraft } from "./desk-audit-grade.ts";

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
