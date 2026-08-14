// portfolio/ai/canvas.test.ts — the composition, through the REAL renderer, as the page will get
// it. block-render.test.ts already proves each block expands; this proves the CANVAS around them:
// that a cell carries its span and its block id, that the order is the composition's, and that a
// block template's design commentary stops at the edge of the page.
import { test, expect, describe } from "bun:test";
import { addFromDescription, emptyComposition } from "./composition.ts";
import { renderCanvas, renderCell, stripBlockComments } from "./canvas.ts";

const canvasFor = (ask: string) => renderCanvas(addFromDescription(emptyComposition(), ask).blocks);

describe("the canvas is the composition, in order", () => {
  test("one cell per block, and the order is the composition's own", async () => {
    const html = await canvasFor("an intro, a card and a callout");
    const ids = [...html.matchAll(/data-block-id="(b\d+)"/g)].map((m) => m[1]);
    expect(ids).toEqual(["b1", "b2", "b3"]);
    // and each cell holds the markup grain's own doc for that molecule documents
    expect(html).toContain('class="lede"');
    expect(html).toContain('class="card"');
    expect(html).toContain("<blockquote");
  });

  test("the span rides on the cell, not on the block", async () => {
    const html = await canvasFor("two cards side by side");
    expect(html).toContain('data-span="half"');
    // the card itself declares no layout of its own, which is what lets one block sit at any span
    expect(html).not.toMatch(/<div class="card"[^>]*data-span=/);
  });

  test("an empty composition renders nothing at all, not a placeholder", async () => {
    expect(await renderCanvas([])).toBe("");
  });

  // The one place a description's own words reach an attribute is the block id and the span, and
  // both come from closed sets. This is what says so rather than assuming it.
  test("nothing from the description reaches a cell attribute", async () => {
    const html = await canvasFor(`a card called "><script>alert(1)</script>`);
    expect(html).toContain('data-span="half"');
    expect(html).not.toContain("<script>");
  });
});

describe("a block template's commentary stops at the page", () => {
  test("the rendered canvas carries no HTML comment", async () => {
    const html = await canvasFor("an intro, a card, a callout, a stat and a form with a name");
    expect(html).not.toContain("<!--");
    // the thing that would otherwise be in there, verbatim from block-card.html
    expect(html).not.toContain("grain's molecules are CSS-only");
  });

  // The directives are NOT commentary and must survive: the browser reads them to fill a cloned
  // block, which is the whole of P3's mechanism. A strip that took them would look like it worked
  // and would break composing on a static host.
  test("the data-field and data-bind directives survive the strip", async () => {
    const html = await canvasFor("a stat and a callout");
    expect(html).toContain('data-field="value"');
    expect(html).toContain('data-bind-data-status="status"');
  });

  test("stripBlockComments leaves ordinary markup alone", () => {
    expect(stripBlockComments(`<p>a<!-- b -->c</p>`)).toBe("<p>ac</p>");
    expect(stripBlockComments(`<p class="a--b">no comment here</p>`)).toBe(`<p class="a--b">no comment here</p>`);
  });
});

describe("the form is one cell like any other", () => {
  test("a form block renders inside a cell and keeps the builder-form address", async () => {
    const html = await canvasFor("a form with a name and an email");
    expect(html).toContain('data-surface="builder-form"');
    expect(html).toContain('data-surface="field:builder-name"');
    expect(html).toMatch(/<div class="canvas__cell"[^>]*>\s*<form/);
  });

  test("a single block still gets a cell, span and id", async () => {
    const [block] = addFromDescription(emptyComposition(), "a stat").blocks;
    const html = await renderCell(block!);
    expect(html).toContain('class="canvas__cell"');
    expect(html).toContain('data-span="third"');
    expect(html).toContain('data-block-id="b1"');
  });
});
