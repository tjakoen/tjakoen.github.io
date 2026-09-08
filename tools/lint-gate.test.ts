// portfolio/tools/lint-gate.test.ts — the ratchet's arithmetic, seen deciding both ways.
//
// risingCounts is the one question both the write path (refuse to raise the baseline) and the read
// path (report a regression) turn on: which keys climbed, and by how much. A gate that always
// returned an empty array would pass every real run silently, which is exactly the failure the
// 2026-09-08 audit found one level up (oxlintCounts swallowing a crashed linter as zero). So the
// tests here show the function catching a real rise, ignoring a fall, and ranking worst-first —
// each with the opposite case alongside, so a stub that always says "nothing rose" fails.
import { test, expect } from "bun:test";
import { risingCounts } from "./lint-gate.ts";

test("a key that climbed is caught, with its exact delta", () => {
  const rise = risingCounts({ "oxlint:no-array-sort": 3 }, { "oxlint:no-array-sort": 5 });
  expect(rise).toEqual([{ key: "oxlint:no-array-sort", base: 3, now: 5 }]);
});

test("a key that fell is not a rise", () => {
  const rise = risingCounts({ "voice:backtick": 3100 }, { "voice:backtick": 3050 });
  expect(rise).toEqual([]);
});

test("a key unchanged is not a rise", () => {
  expect(risingCounts({ a: 7 }, { a: 7 })).toEqual([]);
});

test("a brand-new key counts as a rise from zero", () => {
  const rise = risingCounts({}, { "voice:puffery": 2 });
  expect(rise).toEqual([{ key: "voice:puffery", base: 0, now: 2 }]);
});

test("a key that vanished is a fall, not a rise", () => {
  expect(risingCounts({ gone: 4 }, {})).toEqual([]);
});

test("rises are ranked worst-first by delta, not by name or by absolute count", () => {
  const rise = risingCounts(
    { small: 100, big: 0 },
    { small: 101, big: 5 }, // small rose by 1 off a high base, big rose by 5 off zero
  );
  expect(rise.map((r) => r.key)).toEqual(["big", "small"]);
});

test("mixed movement: only the climbers survive, still ranked", () => {
  const rise = risingCounts(
    { up1: 1, down: 10, level: 2, up2: 0 },
    { up1: 4, down: 3, level: 2, up2: 1 },
  );
  expect(rise.map((r) => r.key)).toEqual(["up1", "up2"]);
  expect(rise).toEqual([
    { key: "up1", base: 1, now: 4 },
    { key: "up2", base: 0, now: 1 },
  ]);
});
