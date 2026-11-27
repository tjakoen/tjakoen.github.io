import { describe, expect, test } from "bun:test";
import { cutStops, groupLessons, proposeAll, sectionsOf, type Section, type Stop } from "./lessons.ts";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildIndex, loadNote, loadRegions, NOTES_DIR } from "./quests.ts";

const words = (n: number) => Array.from({ length: n }, () => "word").join(" ");
const sec = (id: string, w: number): Section => ({ id, title: id, words: w });
const stop = (w: number): Stop => ({ from: "a", to: "a", titleFrom: "a", titleTo: "a", words: w, reference: false });

describe("sectionsOf", () => {
  const note = `---\ntitle: T\n---\nIntro ${words(10)}\n\n## First Part\n${words(20)}\n\`\`\`\n## not a heading\n\`\`\`\n## Sources\n${words(50)}\n## Second, Part!\n${words(30)}`;
  test("the text before the first H2 is intro, and ids are MILL's slugs", () => {
    expect(sectionsOf(note).map((s) => s.id)).toEqual(["intro", "first-part", "second-part"]);
  });
  test("a Sources section is left out, and a heading inside a code fence is not a boundary", () => {
    const out = sectionsOf(note);
    expect(out.find((s) => s.title === "Sources")).toBeUndefined();
    expect(out.find((s) => s.id === "not-a-heading")).toBeUndefined();
  });
});

describe("cutStops", () => {
  test("a stop closes at 600 words, and a section is never split", () => {
    expect(cutStops([sec("a", 400), sec("b", 300), sec("c", 700), sec("d", 650)]).map((s) => [s.from, s.to])).toEqual([["a", "b"], ["c", "c"], ["d", "d"]]);
  });
  test("a section over 1,500 words stands alone as a reference stop", () => {
    const out = cutStops([sec("a", 700), sec("big", 1800), sec("c", 700)]);
    expect(out.map((s) => s.reference)).toEqual([false, true, false]);
  });
  test("a tail under 500 words folds into the stop before it, unless that passes 1,500", () => {
    expect(cutStops([sec("a", 700), sec("b", 800), sec("t", 300)]).map((s) => s.to)).toEqual(["a", "t"]);
    expect(cutStops([sec("a", 700), sec("b", 1300), sec("t", 300)]).map((s) => s.to)).toEqual(["a", "b", "t"]);
  });
  test("a note of 1,200 words or more always gets at least two stops", () => {
    expect(cutStops([sec("a", 450), sec("b", 450), sec("c", 400)]).length).toBeGreaterThanOrEqual(2);
  });
});

describe("groupLessons", () => {
  const cut = (note: string, stage: number, n: number) => ({ note, stage, stops: Array.from({ length: n }, () => stop(800)) });
  test("a note with three to six stops is one lesson", () => {
    expect(groupLessons([cut("a", 2, 3), cut("b", 2, 6)]).map((l) => l.id)).toEqual(["a", "b"]);
  });
  test("more than six stops is cut into lessons of near equal size", () => {
    expect(groupLessons([cut("a", 2, 8)]).map((l) => [l.id, l.stops])).toEqual([["a-1", 4], ["a-2", 4]]);
  });
  test("fewer than three joins the next note of its stage, never one from another stage", () => {
    expect(groupLessons([cut("a", 2, 2), cut("b", 2, 3)]).map((l) => [l.id, l.stops])).toEqual([["a", 5]]);
    expect(groupLessons([cut("a", 2, 2), cut("b", 3, 3)]).map((l) => [l.id, l.stops])).toEqual([["a", 2], ["b", 3]]);
  });
  test("with no next note to join, it joins the lesson before it in the stage", () => {
    expect(groupLessons([cut("a", 2, 3), cut("b", 2, 2)]).map((l) => [l.id, l.stops])).toEqual([["a", 5]]);
  });
});

describe("the real notes", () => {
  const lessons = proposeAll();
  test("every note on the path is in a lesson, and no lesson passes six stops", () => {
    expect(new Set(lessons.flatMap((l) => l.notes.map((n) => n.note))).size).toBe(buildIndex(loadRegions(), loadNote).quests.length);
    for (const l of lessons) expect(l.stops, l.id).toBeLessThanOrEqual(6);
  });
  test("every stop's sections resolve in its note and no stop is empty", () => {
    for (const l of lessons) for (const n of l.notes) {
      const ids = new Set(sectionsOf(readFileSync(join(NOTES_DIR, `${n.note}.md`), "utf8")).map((s) => s.id));
      for (const s of n.stops) { expect(ids.has(s.from), `${n.note} ${s.from}`).toBe(true); expect(ids.has(s.to), `${n.note} ${s.to}`).toBe(true); expect(s.words).toBeGreaterThan(0); }
    }
  });
});
