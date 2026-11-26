import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { buildIndex, INDEX_FILE, loadNote, loadRegions, minutesOf, placeNote, readNote, type Note, type Region } from "./quests.ts";

const regions: Region[] = [{ n: 1, id: "forest", name: "Forest", landmark: "pines", notes: ["a", "b"] }];
const note = (over: Partial<Note> = {}): Note => ({ slug: "a", title: "A", status: "PUBLISHED", level: "intro", audience: ["learn"], tags: ["ai"], readingTime: "~10 min", ...over });

describe("placeNote", () => {
  test("a published note a region lists fits it, at its place on the route", () => {
    expect(placeNote(note({ slug: "b" }), regions)).toMatchObject({ outcome: "fits", position: 1 });
  });
  test("a published, complete note no region lists fits nothing yet", () => {
    expect(placeNote(note({ slug: "z" }), regions)).toEqual({ outcome: "fits-nothing", tags: ["ai"] });
  });
  test("a note missing what a quest needs cannot be placed, and says what", () => {
    expect(placeNote(note({ level: undefined, tags: [] }), regions)).toEqual({ outcome: "cannot-place", missing: ["level", "tags"] });
    expect(placeNote(note({ level: "expert" }), regions)).toMatchObject({ outcome: "cannot-place" });
  });
  test("a draft is never placed, even when a region lists it", () => {
    expect(placeNote(note({ status: "DRAFT" }), regions)).toEqual({ outcome: "draft" });
  });
});

describe("buildIndex", () => {
  const load = (map: Record<string, Note>) => (slug: string) => map[slug] ?? null;
  test("builds quests in region order from each note's own frontmatter", () => {
    const { quests, errors } = buildIndex(regions, load({ a: note(), b: note({ slug: "b", title: "B", level: "deep", readingTime: "~7 min" }) }));
    expect(errors).toEqual([]);
    expect(quests.map((q) => [q.id, q.region, q.level, q.minutes])).toEqual([["a", 1, "intro", 10], ["b", 1, "deep", 7]]);
  });
  test("a pin on a draft is an error, not a quest", () => {
    const { quests, errors } = buildIndex(regions, load({ a: note(), b: note({ slug: "b", status: "DRAFT" }) }));
    expect(quests.map((q) => q.id)).toEqual(["a"]);
    expect(errors.join()).toContain("a draft never becomes a quest");
  });
  test("a region that lists a note that does not exist is an error", () => {
    expect(buildIndex(regions, load({ a: note() })).errors.join()).toContain("b, which is not a note");
  });
});

describe("the real data", () => {
  test("every note the regions list is published and places cleanly", () => {
    const { quests, errors } = buildIndex(loadRegions(), loadNote);
    expect(errors).toEqual([]);
    expect(quests.length).toBeGreaterThan(10);
  });
  test("the committed index is the one the tool generates", () => {
    const { quests } = buildIndex(loadRegions(), loadNote);
    const have = JSON.parse(readFileSync(INDEX_FILE, "utf8")) as { quests: unknown[] };
    expect(have.quests).toEqual(JSON.parse(JSON.stringify(quests)));
  });
  test("the path is in difficulty order: the first three stages are intro only, the last two deep only", () => {
    const { quests } = buildIndex(loadRegions(), loadNote);
    for (const q of quests) expect(q.level, `${q.id} in stage ${q.region}`).toBe(q.region <= 4 ? "intro" : "deep");
  });
  test("reading time and frontmatter parse", () => {
    expect(minutesOf("~12 min")).toBe(12);
    expect(readNote("x", '---\ntitle: "X"\nstatus: DRAFT\ntags: [a, b]\n---\nbody').tags).toEqual(["a", "b"]);
  });
});
