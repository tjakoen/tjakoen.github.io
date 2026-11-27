import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { buildIndex, INDEX_FILE, MAP_FILE, pathOf, proposeRegions, readMapQuests, renderMap, loadNote, loadRegions, minutesOf, placeNote, readNote, type Note, type Region } from "./quests.ts";

const regions: Region[] = [{ n: 1, id: "forest", name: "Forest", landmark: "pines", notes: ["a", "b"] }];
const note = (over: Partial<Note> = {}): Note => ({ slug: "a", title: "A", status: "PUBLISHED", level: "intro", audience: ["learn"], tags: ["ai", "workflow"], readingTime: "~10 min", ...over });

describe("placeNote", () => {
  test("a published note a region lists fits it, at its place on the route", () => {
    expect(placeNote(note({ slug: "b" }), regions)).toMatchObject({ outcome: "fits", position: 1 });
  });
  test("a published, complete note no region lists fits nothing yet", () => {
    expect(placeNote(note({ slug: "z" }), regions)).toEqual({ outcome: "fits-nothing", tags: ["ai", "workflow"] });
  });
  test("a note missing what a quest needs cannot be placed, and says what", () => {
    expect(placeNote(note({ level: undefined, tags: [] }), regions)).toEqual({ outcome: "cannot-place", missing: ["level", "a tag besides ai"] });
    expect(placeNote(note({ level: "expert" }), regions)).toMatchObject({ outcome: "cannot-place" });
  });
  test("a draft is never placed, even when a region lists it", () => {
    expect(placeNote(note({ status: "DRAFT" }), regions)).toEqual({ outcome: "draft" });
  });
});

describe("proposeRegions", () => {
  const unplaced = (n: number, tags: string[]) => Array.from({ length: n }, (_, i) => note({ slug: `n${tags.join("")}${i}`, tags }));
  test("five unplaced notes sharing a tag after ai propose a region, and four do not", () => {
    expect(proposeRegions(unplaced(5, ["ai", "teaching"]), regions)).toEqual([{ tag: "teaching", name: "Teaching", notes: unplaced(5, ["ai", "teaching"]).map((n) => n.slug).toSorted() }]);
    expect(proposeRegions(unplaced(4, ["ai", "teaching"]), regions)).toEqual([]);
  });
  test("notes a region already lists, drafts and notes tagged only ai never count", () => {
    expect(proposeRegions([...unplaced(5, ["ai", "workflow"]).map((n, i) => (i === 0 ? Object.assign({}, n, { slug: "a" }) : n)), ...unplaced(5, ["ai"])], regions)).toEqual([]);
    expect(proposeRegions(unplaced(5, ["ai", "x"]).map((n) => Object.assign({}, n, { status: "DRAFT" })), regions)).toEqual([]);
  });
  test("a note tagged only ai cannot be placed, because the tag says too little", () => {
    expect(placeNote(note({ slug: "z", tags: ["ai"] }), regions)).toEqual({ outcome: "cannot-place", missing: ["a tag besides ai"] });
  });
});

describe("buildIndex", () => {
  const load = (map: Record<string, Note>) => (slug: string) => map[slug] ?? null;
  test("builds quests in region order from each note's own frontmatter", () => {
    const { quests, errors } = buildIndex(regions, load({ a: note(), b: note({ slug: "b", title: "B", level: "deep", readingTime: "~7 min" }) }));
    expect(errors).toEqual([]);
    expect(quests.map((q) => [q.id, q.region, q.level, q.minutes])).toEqual([["a", 1, "intro", 10], ["b", 1, "deep", 7]]);
  });
  test("a pin on a draft is a quest flagged draft, and any other status is an error", () => {
    const drafted = buildIndex(regions, load({ a: note(), b: note({ slug: "b", status: "DRAFT" }) }));
    expect(drafted.errors).toEqual([]);
    expect(drafted.quests.map((q) => [q.id, q.draft])).toEqual([["a", undefined], ["b", true]]);
    const odd = buildIndex(regions, load({ a: note(), b: note({ slug: "b", status: "IDEA" }) }));
    expect(odd.quests.map((q) => q.id)).toEqual(["a"]);
    expect(odd.errors.join()).toContain("must be PUBLISHED or DRAFT");
  });
  test("a region that lists a note that does not exist is an error", () => {
    expect(buildIndex(regions, load({ a: note() })).errors.join()).toContain("b, which is not a note");
  });
});

describe("the real data", () => {
  test("every note the regions list is published or a draft, and places cleanly", () => {
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
  test("the map's path and plain route list are the ones the tool generates", () => {
    const { quests } = buildIndex(loadRegions(), loadNote);
    const html = readFileSync(MAP_FILE, "utf8");
    expect(renderMap(html, quests, loadRegions())).toBe(html);
  });
  test("every quest the map draws is on the path, and every quest on the path is drawn", () => {
    const { quests } = buildIndex(loadRegions(), loadNote);
    const onPath = pathOf(quests, loadRegions()).stages.flatMap((st) => st.quests).toSorted();
    expect(readMapQuests(readFileSync(MAP_FILE, "utf8")).map((q) => q.id).toSorted()).toEqual(onPath);
  });
  test("reading time and frontmatter parse", () => {
    expect(minutesOf("~12 min")).toBe(12);
    expect(readNote("x", '---\ntitle: "X"\nstatus: DRAFT\ntags: [a, b]\n---\nbody').tags).toEqual(["a", "b"]);
  });
});
