// portfolio/ai/builder-export.test.ts — take it away, and bring it back.
//
// The round trip is the claim, so it is the first thing here and it is asserted on the FILE rather
// than on the function: export writes bytes, so the test parses those bytes and imports them, which
// is the only version of this test that would have caught a serializer that quietly dropped a key.
// A test that checked the export serializes is not the claim.
//
// The markup tests run real renderer output through the exports rather than a hand-written string,
// for the same reason block-render.test.ts renders instead of asserting a file exists: the
// instrumentation these exports strip is put there by the renderer and by the canvas, and a
// hand-written fixture is a guess about what those two produce. The byline is grain's own
// madeWith(), for the same reason again.
import { test, expect, describe } from "bun:test";
import { madeWith } from "@tjakoen/grain/scripts/made-with.js";
import { render } from "../render.ts";
import { stripBlockComments } from "./canvas.ts";
import { addFromDescription, emptyComposition, fromDocument, type PageComposition } from "./composition.ts";
import { BLOCK_COMPONENTS, type Block } from "./block-set.ts";
import {
  bylineFrom, cleanBlockHtml, exportJson, exportPage, exportTags, EXPORT_STEM, type ExportBlock,
} from "./builder-export.ts";

const byline = bylineFrom(madeWith())!;

/** A page with one of every block on it, composed the way the page composes one. */
const aPage = (): PageComposition => addFromDescription(
  emptyComposition(),
  "an intro, a card, a callout, a stat, and a contact form with a name and an email",
);

/** What the browser hands the exports: each block's own markup, exactly as the one renderer
 *  produced it and the canvas trimmed it, with the cell wrapper left off. */
const asExportBlocks = async (blocks: readonly Block[]): Promise<ExportBlock[]> =>
  Promise.all(blocks.map(async (b) => ({
    span: b.span,
    html: stripBlockComments(await render(b.component, b.data, b.props)),
  })));

describe("the byline, read rather than retyped", () => {
  test("grain's markup gives both forms, and the words are grain's", () => {
    expect(byline.html).toBe(madeWith());
    expect(byline.text).toBe("made with GRAIN by tjakoen");
  });

  test("markup with no words in it is not a byline, so an export can refuse rather than go unsigned", () => {
    for (const junk of [null, undefined, "", "   ", "<footer></footer>"]) {
      expect(bylineFrom(junk)).toBeNull();
    }
  });
});

describe("the JSON, and it is the one that comes back", () => {
  // THE test. Not "the export serializes": the bytes are parsed and imported, and the composition
  // that comes out the far side is compared block for block with the one that went in.
  test("a composition survives the whole trip out and back, unchanged", () => {
    const before = aPage();
    const file = exportJson(before, byline);
    const after = fromDocument(JSON.parse(file.body), BLOCK_COMPONENTS);
    expect(after.blocks).toEqual(before.blocks);
  });

  test("the trip is stable, so a page exported and reopened twice is still the same page", () => {
    const first = aPage();
    const second = fromDocument(JSON.parse(exportJson(first, byline).body), BLOCK_COMPONENTS);
    const third = fromDocument(JSON.parse(exportJson(second, byline).body), BLOCK_COMPONENTS);
    expect(third.blocks).toEqual(first.blocks);
  });

  // The form block's data is matchSpec's own result, which is the deepest thing on the page and the
  // one most likely to be flattened by a careless serializer. It gets its own assertion because
  // "the blocks are equal" would still pass if every form on earth came back with no fields.
  test("a form block's field spec comes back whole, controls and all", () => {
    const before = addFromDescription(emptyComposition(), "a contact form with a name, an email and a message box");
    const after = fromDocument(JSON.parse(exportJson(before, byline).body), BLOCK_COMPONENTS);
    const spec = after.blocks.at(-1)!.data as { fields: unknown[]; messages: unknown[] };
    expect(spec.fields.length).toBeGreaterThan(0);
    expect(spec.messages.length).toBeGreaterThan(0);
    expect(after.blocks.at(-1)!.data).toEqual(before.blocks.at(-1)!.data);
  });

  test("the file carries the byline, and import ignores it rather than depending on it", () => {
    const doc = JSON.parse(exportJson(aPage(), byline).body);
    expect(doc.madeWith).toBe("made with GRAIN by tjakoen");
    const signed = fromDocument(doc, BLOCK_COMPONENTS);
    // The same file with the signature torn out is still a file this build opens: the byline
    // travels with the composition and the composition never leans on it. That matters because
    // someone WILL delete it, and a page that refused to open after they did would be a dark
    // pattern wearing a provenance argument.
    delete doc.madeWith;
    expect(fromDocument(doc, BLOCK_COMPONENTS).blocks).toEqual(signed.blocks);
  });

  test("a hand-edited file degrades to a named refusal rather than to a broken page", () => {
    const doc = JSON.parse(exportJson(aPage(), byline).body);
    doc.blocks[1].component = "block-hologram";
    const opened = fromDocument(doc, BLOCK_COMPONENTS);
    expect(opened.blocks.map((b) => b.component)).not.toContain("block-hologram");
    expect(opened.refusals[0]!.token).toBe("block-hologram");
  });

  test("it is named after the one line on screen that already named the thing", () => {
    expect(exportJson(aPage(), byline).name).toBe(`${EXPORT_STEM}.json`);
  });
});

describe("cleaning: the builder's fingerprints come off", () => {
  test("addresses, block ids and binding directives all go", () => {
    const dirty = '<div class="card" data-pad="sm" data-surface="block:b3" data-block-id="b3">'
      + '<h3 class="card__title" data-field="title">T</h3>'
      + '<p class="card__body" data-bind-data-status="status" data-field="body">B</p></div>';
    const clean = cleanBlockHtml(dirty);
    for (const gone of ["data-surface", "data-block-id", "data-field", "data-bind-"]) {
      expect(clean).not.toContain(gone);
    }
  });

  test("grain's own attributes and every class survive, because they are the markup", () => {
    const clean = cleanBlockHtml('<div class="card" data-pad="sm" data-surface="block:b1"><p class="card__body">B</p></div>');
    expect(clean).toContain('class="card"');
    expect(clean).toContain('data-pad="sm"');
    expect(clean).toContain('class="card__body"');
  });
});

describe("the rendered page: a whole document, carrying grain's stylesheet", () => {
  test("it links the four stylesheets at the origin it was exported from", async () => {
    const comp = aPage();
    const file = exportPage(await asExportBlocks(comp.blocks), byline, "https://tjakoen.github.io");
    for (const href of ["/styles/variables.css", "/styles/global.css", "/styles/grain.css", "/components.css"]) {
      expect(file.body).toContain(`<link rel="stylesheet" href="https://tjakoen.github.io${href}">`);
    }
  });

  test("a trailing slash on the origin does not become a double slash in a URL", async () => {
    const comp = aPage();
    const file = exportPage(await asExportBlocks(comp.blocks), byline, "http://localhost:3000/");
    expect(file.body).toContain("http://localhost:3000/styles/variables.css");
    expect(file.body).not.toContain("//styles/");
  });

  test("one cell per block, each carrying the width it was built at", async () => {
    const comp = aPage();
    const file = exportPage(await asExportBlocks(comp.blocks), byline, "https://tjakoen.github.io");
    expect([...file.body.matchAll(/class="canvas__cell"/g)]).toHaveLength(comp.blocks.length);
    for (const block of comp.blocks) {
      expect(file.body).toContain(`data-span="${block.span}"`);
    }
  });

  test("it carries the grid, because the grid is this page's and not grain's", async () => {
    const file = exportPage(await asExportBlocks(aPage().blocks), byline, "https://tjakoen.github.io");
    expect(file.body).toContain("grid-template-columns: repeat(6, 1fr)");
    expect(file.body).toContain('.canvas__cell[data-span="half"] { grid-column: span 3; }');
  });

  test("the builder's instrumentation does not travel", async () => {
    const file = exportPage(await asExportBlocks(aPage().blocks), byline, "https://tjakoen.github.io");
    for (const gone of ["data-surface", "data-block-id", "data-field=", "data-bind-", "data-template-surface"]) {
      expect(file.body).not.toContain(gone);
    }
  });

  test("what is inside a cell is grain's own markup rather than a picture of it", async () => {
    const file = exportPage(await asExportBlocks(aPage().blocks), byline, "https://tjakoen.github.io");
    expect(file.body).toContain('class="card__title"');
    expect(file.body).toContain('<blockquote class="callout"');
    expect(file.body).toContain('class="stat__value"');
  });
});

describe("the tag source: what a developer would have hand-written", () => {
  test("it is a fragment, so it has no document around it and no stylesheet in it", async () => {
    const file = exportTags(await asExportBlocks(aPage().blocks), byline);
    expect(file.body).not.toContain("<!DOCTYPE");
    expect(file.body).not.toContain("<html");
    expect(file.body).not.toContain("rel=\"stylesheet\"");
  });

  test("the grid it does not ship is named in a comment rather than left to be discovered", async () => {
    const file = exportTags(await asExportBlocks(aPage().blocks), byline);
    expect(file.body).not.toContain("grid-template-columns");
    expect(file.body).toContain("full spans six");
  });

  test("every cell and every block class is there, indented to be pasted", async () => {
    const comp = aPage();
    const file = exportTags(await asExportBlocks(comp.blocks), byline);
    expect([...file.body.matchAll(/class="canvas__cell"/g)]).toHaveLength(comp.blocks.length);
    expect(file.body).toContain('  <div class="canvas__cell" data-span=');
    expect(file.body).toContain('class="card"');
  });

  test("the builder's instrumentation does not travel here either", async () => {
    const file = exportTags(await asExportBlocks(aPage().blocks), byline);
    for (const gone of ["data-surface", "data-block-id", "data-field=", "data-bind-"]) {
      expect(file.body).not.toContain(gone);
    }
  });
});

describe("every export carries the byline, and two of them carry it twice", () => {
  test("all three name GRAIN", async () => {
    const blocks = await asExportBlocks(aPage().blocks);
    for (const file of [exportJson(aPage(), byline), exportPage(blocks, byline, "https://tjakoen.github.io"), exportTags(blocks, byline)]) {
      expect(file.body).toContain("made with GRAIN by tjakoen");
    }
  });

  // The footer is the half someone deletes. The comment and the attribute are the half that
  // survives that, and both are named in the page's own copy rather than hidden.
  test("both HTML forms carry the comment, the attribute and the visible footer", async () => {
    const blocks = await asExportBlocks(aPage().blocks);
    for (const file of [exportPage(blocks, byline, "https://tjakoen.github.io"), exportTags(blocks, byline)]) {
      expect(file.body).toContain("<!-- made with GRAIN by tjakoen -->");
      expect(file.body).toContain('data-made-with="GRAIN"');
      expect(file.body).toContain('<footer class="made-with">');
      expect(file.body).toContain('href="https://tjakoen.github.io/grain"');
    }
  });

  test("an empty page still exports, and still goes out signed", async () => {
    const empty = emptyComposition();
    expect(exportPage([], byline, "https://tjakoen.github.io").body).toContain("made with GRAIN");
    expect(exportTags([], byline).body).toContain("made with GRAIN");
    expect(JSON.parse(exportJson(empty, byline).body).blocks).toEqual([]);
  });
});
