// portfolio/ai/block-set.test.ts — the closed block set's contract. The test that matters most here
// is the last one in the first block: every component the set can name has to be a REAL template the
// renderer can expand. A block table naming something unrenderable is the same shape of false
// promise as an address advertising a verb that does not exist, and it fails at the one moment
// nobody is watching, when a description happens to match that entry.
import { test, expect, describe } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  matchBlocks, matchFormBlock, isSpan, SPANS,
  BLOCK_COMPONENTS, KNOWN_BLOCK_LABELS, FORM_COMPONENT,
} from "./block-set.ts";

const COMPONENT_ROOTS = [
  join(import.meta.dir, "..", "..", "view", "components"),
  join(import.meta.dir, "..", "node_modules", "@tjakoen", "grain", "components"),
];

const hasTemplate = (name: string): boolean =>
  COMPONENT_ROOTS.some((root) =>
    ["atoms", "molecules", "organisms"].some((tier) => existsSync(join(root, tier, name, `${name}.html`))));

describe("the block set names only components that exist", () => {
  test("every block component resolves to a real .html template", () => {
    const missing = BLOCK_COMPONENTS.filter((c) => !hasTemplate(c));
    expect(missing).toEqual([]);
  });

  // The measured reason the block templates live in the portfolio at all: grain's molecules and
  // organisms are CSS-only class conventions, so render() has nothing to expand for them. If this
  // ever goes green the other way, grain grew molecule templates and the block set should be
  // pointing at those instead of at the portfolio's.
  test("the grain molecules these blocks emit still ship no template of their own", () => {
    for (const grainMolecule of ["card", "callout", "stat-tile", "lede"]) {
      expect(hasTemplate(grainMolecule)).toBe(false);
    }
  });

  test("the form is in the set like any other block, template and all", () => {
    expect(BLOCK_COMPONENTS).toContain(FORM_COMPONENT);
    expect(hasTemplate(FORM_COMPONENT)).toBe(true);
  });
});

describe("matchBlocks: the closed set decides, never the description", () => {
  test("a described block is emitted with its sample content and default span", () => {
    const c = matchBlocks("an intro paragraph and a card");
    expect(c.blocks.map((b) => b.component)).toEqual(["block-lede", "block-card"]);
    expect(c.blocks[0]!.span).toBe("full");
    expect(c.blocks[1]!.span).toBe("half");
    // sample content is deterministic and code's, never composed
    expect(String(c.blocks[1]!.data.title).length).toBeGreaterThan(0);
  });

  test("declaration order is the output order, not the order the words appeared", () => {
    const c = matchBlocks("a card, and before it an intro");
    expect(c.blocks.map((b) => b.component)).toEqual(["block-lede", "block-card"]);
  });

  test("a block is emitted at most once however many of its tokens hit", () => {
    const c = matchBlocks("a card, a tile, another card, an info card");
    expect(c.blocks.filter((b) => b.component === "block-card")).toHaveLength(1);
  });

  test("nothing in the set matched: no blocks, and never a guessed default page", () => {
    expect(matchBlocks("quantum physics and a haiku about the weather").blocks).toEqual([]);
  });
});

describe("matchBlocks: layout is three words and the description cannot invent a fourth", () => {
  test("side by side sets every block in the same ask to half", () => {
    const c = matchBlocks("two cards side by side with an intro");
    for (const b of c.blocks) expect(b.span).toBe("half");
  });

  test("three across sets them to third", () => {
    const c = matchBlocks("a card and a stat, three across");
    for (const b of c.blocks) expect(b.span).toBe("third");
  });

  test("every span a block can carry is inside the closed set", () => {
    const c = matchBlocks("an intro, a card, a stat and a callout");
    for (const b of c.blocks) expect(isSpan(b.span)).toBe(true);
    expect(SPANS).toEqual(["full", "half", "third"]);
  });

  test("isSpan refuses anything outside the three", () => {
    expect(isSpan("quarter")).toBe(false);
    expect(isSpan("50%")).toBe(false);
    expect(isSpan(undefined)).toBe(false);
  });
});

describe("matchBlocks: ids are unique and continue an existing composition", () => {
  test("a fresh match starts at b1", () => {
    expect(matchBlocks("an intro and a card").blocks.map((b) => b.id)).toEqual(["b1", "b2"]);
  });

  // The whole point of prompt-adds-to-what-is-there: a second ask must not reissue ids the first one
  // already used, or a later delete hits the wrong block.
  test("a seeded match continues rather than colliding", () => {
    expect(matchBlocks("an intro and a card", 4).blocks.map((b) => b.id)).toEqual(["b5", "b6"]);
  });
});

describe("the form is one block among blocks now", () => {
  test("a form-shaped ask produces one form block carrying the whole field spec", () => {
    const c = matchBlocks("a contact form with a name, an email and a message box");
    const form = c.blocks.find((b) => b.component === FORM_COMPONENT);
    expect(form).toBeDefined();
    expect((form!.data as { fields: unknown[] }).fields).toHaveLength(2);
    expect((form!.data as { messages: unknown[] }).messages).toHaveLength(1);
  });

  test("naming fields without the word form still asks for one", () => {
    expect(matchFormBlock("a name and an email")).not.toBeNull();
  });

  test("a page with no form in it produces no form block", () => {
    expect(matchFormBlock("an intro and a card")).toBeNull();
    expect(matchBlocks("an intro and a card").blocks.some((b) => b.component === FORM_COMPONENT)).toBe(false);
  });
});

describe("refusals are by name, with the reason, and never a silent drop", () => {
  test("page furniture is refused on principle, and the reason says so", () => {
    const c = matchBlocks("a page with a side rail and a top bar");
    expect(c.refusals.map((r) => r.token)).toEqual(["app shell"]);
    expect(c.refusals[0]!.reason).toContain("frame a page sits in");
  });

  test("a not-yet block is refused differently from page furniture", () => {
    const c = matchBlocks("a gallery of screenshots");
    expect(c.refusals[0]!.token).toBe("image");
    expect(c.refusals[0]!.reason).toContain("a real image to point at");
  });

  test("a refusal never quietly produces a block instead", () => {
    expect(matchBlocks("a data table of results").blocks).toEqual([]);
  });

  test("the set can name itself, for an honest decline", () => {
    expect(KNOWN_BLOCK_LABELS).toContain("Card");
    expect(KNOWN_BLOCK_LABELS.length).toBe(BLOCK_COMPONENTS.length - 1);   // every entry but the form
  });
});
