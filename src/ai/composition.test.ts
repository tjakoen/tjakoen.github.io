// portfolio/ai/composition.test.ts — a composed page as state. The behaviour worth pinning is that
// a prompt ADDS: the builder's whole difference from the form demo is that the page is something you
// build up rather than something you re-roll, and every test here is a variation on not losing what
// was already there.
import { test, expect, describe } from "bun:test";
import {
  emptyComposition, addFromDescription, removeBlock, moveBlock, setSpan, nextIndex,
  toDocument, fromDocument, COMPOSITION_VERSION,
} from "./composition.ts";
import { BLOCK_COMPONENTS } from "./block-set.ts";

const ids = (c: { blocks: Array<{ id: string }> }) => c.blocks.map((b) => b.id);
const comps = (c: { blocks: Array<{ component: string }> }) => c.blocks.map((b) => b.component);

describe("adding: a prompt adds to what is already there", () => {
  test("a second ask appends rather than replacing", () => {
    let c = addFromDescription(emptyComposition(), "an intro");
    c = addFromDescription(c, "a card");
    expect(comps(c)).toEqual(["block-lede", "block-card"]);
  });

  test("the ids never collide across adds, which is what a later delete depends on", () => {
    let c = addFromDescription(emptyComposition(), "an intro and a card");
    c = addFromDescription(c, "a callout and a stat");
    expect(new Set(ids(c)).size).toBe(c.blocks.length);
    expect(ids(c)).toEqual(["b1", "b2", "b3", "b4"]);
  });

  // The case that broke naive length-based ids: delete from the middle, then add. Length says the
  // next id is one that is already taken.
  test("adding after a delete still issues a fresh id", () => {
    let c = addFromDescription(emptyComposition(), "an intro and a card");
    c = removeBlock(c, "b1");
    c = addFromDescription(c, "a callout");
    expect(new Set(ids(c)).size).toBe(c.blocks.length);
    expect(ids(c)).toEqual(["b2", "b3"]);
  });

  test("an ask that matches nothing leaves the page exactly as it was", () => {
    const before = addFromDescription(emptyComposition(), "an intro");
    const after = addFromDescription(before, "quantum physics and a haiku");
    expect(after.blocks).toEqual(before.blocks);
  });

  // Refusals describe the LAST ask. A list that accumulated would still be telling a visitor about
  // something they were refused three prompts ago as though it had just happened.
  test("refusals describe the last ask rather than piling up", () => {
    let c = addFromDescription(emptyComposition(), "a gallery of screenshots");
    expect(c.refusals).toHaveLength(1);
    c = addFromDescription(c, "an intro");
    expect(c.refusals).toEqual([]);
  });

  test("nextIndex ignores an id that is not b<number>, rather than being confused by it", () => {
    const c = { blocks: [{ id: "imported", component: "block-card", span: "full" as const, data: {}, props: {} }], refusals: [] };
    expect(nextIndex(c)).toBe(0);
  });
});

describe("removing and moving", () => {
  const seed = () => addFromDescription(emptyComposition(), "an intro, a card, a callout and a stat");

  test("removing takes exactly one block and leaves the order", () => {
    const c = removeBlock(seed(), "b2");
    expect(ids(c)).toEqual(["b1", "b3", "b4"]);
  });

  test("removing something already gone changes nothing and does not throw", () => {
    const before = seed();
    expect(removeBlock(before, "b99").blocks).toEqual(before.blocks);
  });

  test("moving reorders, and a target past the end lands at the end", () => {
    expect(ids(moveBlock(seed(), "b1", 2))).toEqual(["b2", "b3", "b1", "b4"]);
    expect(ids(moveBlock(seed(), "b1", 99))).toEqual(["b2", "b3", "b4", "b1"]);
    expect(ids(moveBlock(seed(), "b4", -5))).toEqual(["b4", "b1", "b2", "b3"]);
  });

  test("every operation returns a new composition and mutates nothing", () => {
    const before = seed();
    const snapshot = ids(before);
    removeBlock(before, "b1");
    moveBlock(before, "b1", 3);
    setSpan(before, "b1", "third");
    expect(ids(before)).toEqual(snapshot);
  });
});

describe("spans", () => {
  test("setSpan changes one block and only that one", () => {
    const c = setSpan(addFromDescription(emptyComposition(), "an intro and a card"), "b1", "half");
    expect(c.blocks[0]!.span).toBe("half");
    expect(c.blocks[1]!.span).toBe("half");   // the card's own default, untouched
  });

  test("a span outside the closed set is refused rather than reaching a stylesheet with no rule", () => {
    const before = addFromDescription(emptyComposition(), "an intro");
    const after = setSpan(before, "b1", "quarter" as never);
    expect(after.blocks[0]!.span).toBe(before.blocks[0]!.span);
  });
});

describe("the document: what export writes and import reads", () => {
  test("a composition round-trips through the document unchanged", () => {
    const before = addFromDescription(emptyComposition(), "an intro, a card and a stat");
    const after = fromDocument(toDocument(before), BLOCK_COMPONENTS);
    expect(after.blocks).toEqual(before.blocks);
  });

  test("the document carries a version from the first release, not from the first breakage", () => {
    expect(toDocument(emptyComposition()).version).toBe(COMPOSITION_VERSION);
  });

  test("refusals are conversation, not page, so they never export", () => {
    const c = addFromDescription(emptyComposition(), "a gallery of screenshots and an intro");
    expect(c.refusals.length).toBeGreaterThan(0);
    expect(Object.keys(toDocument(c))).toEqual(["version", "blocks"]);
  });

  // The honest import: a file this build cannot fully render degrades to the blocks that survive,
  // each casualty named, rather than to a thrown error or a page with silent holes in it.
  test("an unknown component is dropped WITH a named refusal, and the rest still renders", () => {
    const doc = {
      version: 1,
      blocks: [
        { id: "b1", component: "block-card", span: "full", data: { title: "t", body: "b" }, props: {} },
        { id: "b2", component: "block-hologram", span: "full", data: {}, props: {} },
      ],
    };
    const c = fromDocument(doc, BLOCK_COMPONENTS);
    expect(comps(c)).toEqual(["block-card"]);
    expect(c.refusals[0]!.token).toBe("block-hologram");
    expect(c.refusals[0]!.reason).toContain("no component by that name");
  });

  test("an unrecognized span falls back to full rather than losing the block", () => {
    const doc = { version: 1, blocks: [{ id: "b1", component: "block-card", span: "quarter", data: {}, props: {} }] };
    expect(fromDocument(doc, BLOCK_COMPONENTS).blocks[0]!.span).toBe("full");
  });

  test("something that is not a composition at all is refused as a whole, by name", () => {
    for (const junk of [null, undefined, 42, "a string", {}, { version: 1 }]) {
      const c = fromDocument(junk, BLOCK_COMPONENTS);
      expect(c.blocks).toEqual([]);
      expect(c.refusals[0]!.reason).toContain("carries no blocks array");
    }
  });
});
