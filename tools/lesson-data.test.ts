import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { OUT_DIR, beatsOf, figureNamesOf, unreadBeats, lessonIds, loadLesson, problemsOf, sectionsOf, slugOf } from "./lesson-data.ts";

describe("slugOf and sectionsOf", () => {
  test("a heading becomes the id MILL stamps on it", () => {
    expect(slugOf("I'm terrible at multitasking, and I'm lazy on purpose")).toBe("im-terrible-at-multitasking-and-im-lazy-on-purpose");
    expect(slugOf("A decade of rehearsal, billed as management")).toBe("a-decade-of-rehearsal-billed-as-management");
  });
  test("the text before the first heading is the intro, and the front matter is not part of any section", () => {
    const s = sectionsOf("---\ntitle: X\n---\n\nFirst   line\nhere.\n\n## One\n\nBody one.\n\n## Two, too\n\nBody two.\n");
    expect(s).toEqual({ intro: "First line here.", one: "Body one.", "two-too": "Body two." });
  });
});

describe("beatsOf", () => {
  test("reads each stop's beats, the section, the quote and the spoken words", () => {
    const script = "# T\n\n## Stop 1: A\n\n**Beat 1**\nhighlight: intro | a quote here\n\nSpoken one.\n\n**Beat 2**\nhighlight: why | other\n\nSpoken two.\n\n**Digest:** d\n\n## Stop 2: B\n\n**Beat 1**\nhighlight: x | q\n\nSpoken three.\n\n**Digest:** d\n";
    expect(beatsOf(script)).toEqual([[{ section: "intro", quote: "a quote here", text: "Spoken one." }, { section: "why", quote: "other", text: "Spoken two." }], [{ section: "x", quote: "q", text: "Spoken three." }]]);
  });
});

describe("figure beats", () => {
  const note = 'intro\n\n## One\n\nText.\n\n<svg viewBox="0 0 620 100" role="img"\n     aria-label="The brief has three parts: the goal, what done looks like, and what to leave alone.">\n</svg>\n\n## Two\n\n```mermaid label="A generated flow of plan, build, tick"\nflowchart LR\n```\n';
  test("a figure target is read from the highlight line, and a quote beat is unchanged", () => {
    const script = "## Stop 1: A\n\n**Beat 1**\nhighlight: one | figure: the brief has three parts\n\nSpoken.\n\n**Beat 2**\nhighlight: one | Text.\n\nMore.\n";
    expect(beatsOf(script)).toEqual([[{ section: "one", figure: "the brief has three parts", text: "Spoken." }, { section: "one", quote: "Text.", text: "More." }]]);
  });
  test("figureNamesOf reads svg labels across lines and mermaid fence labels", () => {
    expect(figureNamesOf(note)).toEqual(["The brief has three parts: the goal, what done looks like, and what to leave alone.", "A generated flow of plan, build, tick"]);
  });
  const lesson = (figure: string, section = "one") => ({ id: "t", title: "T", summary: "", audio: "", stops: [{ title: "S", note: "n", from: "intro", to: "two", beats: [{ section, figure, text: "x" }], runes: [], trial: "", digest: [] }] });
  test("a figure that is in its section passes, whatever the case", () => {
    expect(problemsOf(lesson("The Brief has THREE parts"), () => note)).toEqual([]);
    expect(problemsOf(lesson("generated flow", "two"), () => note)).toEqual([]);
  });
  test("a figure that is gone, one in the wrong section and an empty name each fail the build", () => {
    expect(problemsOf(lesson("the test pyramid"), () => note).join()).toContain('the figure "the test pyramid" is not in one');
    expect(problemsOf(lesson("generated flow"), () => note).join()).toContain("is not in one");
    expect(problemsOf(lesson(""), () => note).join()).toContain("is not in one");
  });
  test("a name that fits two figures in the section is refused as ambiguous", () => {
    const two = note.replace("## Two", '<svg role="img" aria-label="The brief again."></svg>\n\n## Two');
    expect(problemsOf(lesson("the brief"), () => two).join()).toContain("names 2 figures");
  });
});

describe("unreadBeats", () => {
  test("a beat heading that is not numbered is reported, not skipped", () => {
    const ok = "## Stop 1: A\n\n**Beat 1**\nhighlight: a | q\n\nSpoken.\n";
    expect(unreadBeats(ok)).toEqual([]);
    expect(unreadBeats(ok + "\n**Beat X**\nhighlight: a | figure: f\n\nMore.\n").join()).toContain("2 beat headings but 1 readable");
  });
});

describe("problemsOf", () => {
  const lesson = { id: "t", title: "T", summary: "", audio: "", stops: [{ title: "S", note: "n", from: "intro", to: "one", beats: [{ section: "one", quote: "the thing", text: "x" }], runes: [{ id: "r", section: "one", quote: "gone" }], trial: "", digest: [] }] };
  test("a quote that is in its section, with whitespace squashed, is fine", () => {
    expect(problemsOf({ ...lesson, stops: [{ ...lesson.stops[0]!, runes: [] }] }, () => "intro text\n\n## One\n\nwith the\nthing in it")).toEqual([]);
  });
  test("a quote that is gone, a missing section and a missing note are each named", () => {
    const out = problemsOf(lesson, () => "intro\n\n## One\n\nnothing here");
    expect(out.join("\n")).toContain('the quote "the thing" is not in one');
    expect(out.join("\n")).toContain("rune r quote is not in one");
    expect(problemsOf(lesson, () => "intro only").join()).toContain("section one is not in n");
    expect(problemsOf(lesson, () => null).join()).toContain("note n does not exist");
  });
});

describe("the real lessons", () => {
  test("every lesson that has a script plays: its notes, sections and quotes all exist", () => {
    const ids = lessonIds();
    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) expect(problemsOf(loadLesson(id)!), id).toEqual([]);
  });
  test("the lesson files the book fetches are the ones the tool generates", () => {
    for (const id of lessonIds()) expect(readFileSync(join(OUT_DIR, `${id}.json`), "utf8"), id).toBe(JSON.stringify(loadLesson(id)!, null, 1) + "\n");
  });
});

describe("the quests are wired to their lessons", () => {
  const quests = readFileSync(join(import.meta.dir, "..", "view", "learn-map", "map.html"), "utf8").split("\n")
    .filter((l) => /^\{"id":".*"region"/.test(l)).map((l) => JSON.parse(l.replace(/,$/, "")) as { id: string; stops: string[]; lesson?: string; li?: number[]; ls?: [string, number][] });
  const at = (q: (typeof quests)[number]): [string, number][] => q.ls ?? (q.li ?? []).map((i): [string, number] => [q.lesson!, i]);
  test("every quest has a lesson, so Begin quest opens the book for it", () => {
    expect(quests.length).toBeGreaterThan(0);
    for (const q of quests) expect(q.lesson, q.id).toBeTruthy();
  });
  test("each quest stop points at a stop of that lesson that belongs to the same note, under the same title", () => {
    for (const q of quests) {
      const places = at(q);
      expect(places.length, `${q.id} stops`).toBe(q.stops.length);
      places.forEach(([id, i], k) => {
        const stop = loadLesson(id)?.stops[i];
        expect(stop, `${q.id} stop ${k + 1} -> ${id}[${i}]`).toBeTruthy();
        expect(stop!.note, `${q.id} stop ${k + 1}`).toBe(q.id);
        expect(stop!.title, `${q.id} stop ${k + 1}`).toBe(q.stops[k]!);
      });
    }
  });
  test("every stop of every lesson is claimed by exactly one quest stop, so no chapter is unreachable", () => {
    const claimed = new Map<string, number>();
    for (const q of quests) for (const [id, i] of at(q)) claimed.set(`${id}:${i}`, (claimed.get(`${id}:${i}`) ?? 0) + 1);
    for (const id of lessonIds()) loadLesson(id)!.stops.forEach((_, i) => expect(claimed.get(`${id}:${i}`), `${id} stop ${i + 1}`).toBe(1));
  });
  test("a lesson with several stops lists each stop's beats, so Next chapter always has somewhere to go", () => {
    for (const id of lessonIds()) for (const [i, s] of loadLesson(id)!.stops.entries()) expect(s.beats.length, `${id} stop ${i + 1}`).toBeGreaterThanOrEqual(3);
  });
});
