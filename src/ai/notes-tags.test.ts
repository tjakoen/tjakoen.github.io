// portfolio/ai/notes-tags.test.ts — B2 notes filtering's tag matcher. Pins the behavior that replaces
// any temptation to let the model pick a tag: real tags in, right subset out, nothing invented.
import { test, expect, describe } from "bun:test";
import { matchTags, uniqueTags } from "./notes-tags.ts";

const ALL_TAGS = ["teaching", "ai", "github-actions", "grain", "vibe-coding"];

describe("matchTags", () => {
  test("exact word match", () => {
    expect(matchTags("teaching", ALL_TAGS)).toEqual(["teaching"]);
  });

  test("plural fold: 'teachings' still finds 'teaching'", () => {
    expect(matchTags("show me the teachings notes", ALL_TAGS)).toEqual(["teaching"]);
  });

  test("a two-word query finds a hyphenated compound tag", () => {
    expect(matchTags("github actions", ALL_TAGS)).toEqual(["github-actions"]);
  });

  test("a 2-char tag only matches by EXACT equality (too short for the prefix rule)", () => {
    expect(matchTags("ai", ALL_TAGS)).toEqual(["ai"]);
    expect(matchTags("air", ALL_TAGS)).toEqual([]);   // "ai" is a PREFIX of "air", not the other way — no hit
  });

  test("a stopword-only topic matches nothing (empty query after filtering)", () => {
    expect(matchTags("show me notes", ALL_TAGS)).toEqual([]);
    expect(matchTags("notes about", ALL_TAGS)).toEqual([]);
  });

  test("an unrelated topic matches nothing real", () => {
    expect(matchTags("quantum physics", ALL_TAGS)).toEqual([]);
  });

  test("caps at 3, in allTags order (not match strength)", () => {
    const many = ["grainy", "grains", "graincart", "grain"];   // all 4 literally prefix-share "grain"
    expect(matchTags("grain", many)).toEqual(["grainy", "grains", "graincart"]);   // first 3, allTags order
  });

  test("empty allTags → empty result, no crash", () => {
    expect(matchTags("teaching", [])).toEqual([]);
  });
});

describe("uniqueTags", () => {
  test("first-seen order union across notes, de-duped", () => {
    const notes = [
      { tags: ["ai", "teaching"] },
      { tags: ["grain", "ai"] },
      { tags: [] },
      {},
    ];
    expect(uniqueTags(notes)).toEqual(["ai", "teaching", "grain"]);
  });

  test("notes with no tags at all → empty", () => {
    expect(uniqueTags([{}, { tags: [] }])).toEqual([]);
  });
});
