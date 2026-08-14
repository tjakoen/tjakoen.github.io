// portfolio/ai/canvas.test.ts — the composition, through the REAL renderer, as the page will get
// it. block-render.test.ts already proves each block expands; this proves the CANVAS around them:
// that a cell carries its span and its block id, that the order is the composition's, and that a
// block template's design commentary stops at the edge of the page.
import { test, expect, describe, afterEach } from "bun:test";
import { addFromDescription, emptyComposition } from "./composition.ts";
import { BLOCK_COMPONENTS } from "./block-set.ts";
import { ATOM_LIBRARY, BLOCK_LIBRARY, REPEATS } from "./canvas-dom.ts";
import { renderCanvas, renderCell, renderLibrary, stripBlockComments } from "./canvas.ts";

// The renderer warns on an unknown binding path rather than throwing (missingBindings is "warn" in
// dev), so a placeholder that forgot a key is invisible unless something listens. This listens.
const warnings: string[] = [];
const realWarn = console.warn;
console.warn = (...args: unknown[]) => { warnings.push(args.map(String).join(" ")); };
afterEach(() => { warnings.length = 0; });
process.on("exit", () => { console.warn = realWarn; });

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

// ---------------------------------------------------------------------------------------------
// The template library — the thing that lets the browser compose without a second renderer
// ---------------------------------------------------------------------------------------------

describe("the library covers the whole closed set", () => {
  test("every block the set can name has a library entry", () => {
    expect(BLOCK_LIBRARY.map((e) => e.name).toSorted()).toEqual(BLOCK_COMPONENTS.toSorted());
  });

  test("every template a repeat rule names has one too", () => {
    const needed = Object.values(REPEATS).flat().map((r) => r.template);
    const have = new Set(ATOM_LIBRARY.map((e) => e.name));
    for (const name of needed) expect(have.has(name), `${name} repeats but is not in the library`).toBe(true);
  });

  test("each entry renders real markup, with no unknown-binding warning", async () => {
    const html = await renderLibrary();
    for (const e of [...BLOCK_LIBRARY, ...ATOM_LIBRARY]) {
      expect(html, `${e.name} is missing from the library`).toContain(`data-block-template="${e.name}"`);
      expect(html, `${e.name} rendered an unexpanded tag`).not.toContain(`<${e.name}`);
    }
    // a placeholder key left out would warn here rather than ship an empty block to the browser
    expect(warnings.filter((w) => w.includes("unknown binding"))).toEqual([]);
  });

  test("the library is hidden and carries no template commentary", async () => {
    const html = await renderLibrary();
    expect(html).toContain('class="builder-library"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain("<!--");
  });

  // The placeholder is null everywhere, not sample content. A fill that silently did nothing then
  // shows as an empty block rather than as last month's sample text under this month's prompt.
  test("a placeholder renders empty, and keeps the directives the browser fills through", async () => {
    const html = await renderLibrary();
    expect(html).toContain('<span class="stat__value" data-field="value"></span>');
    expect(html).toContain('data-bind-data-status="status"');
    expect(html).not.toContain("No build step");          // block-card's sample title
  });

  test("the form ships as an empty shell for the browser to append controls into", async () => {
    const html = await renderLibrary();
    const form = html.slice(html.indexOf('data-block-template="block-form"'));
    // parked rather than live, so the hidden shell never answers to the address the canvas does
    expect(form).toContain('data-template-surface="builder-form"');
    expect(form.slice(0, form.indexOf("</form>"))).not.toContain("<input");
  });
});

// The one real drift risk in the design: the library renders each atom standalone with props it
// declares, and block-form.html writes those same props as literal attributes on its own tags. A
// rows count changed in one place would make a cloned message box a different shape from a
// server-rendered one, and nothing would say so. This reads the template and compares.
describe("the atoms are used the same way in both places", () => {
  test("each atom's declared props match its tag in block-form.html", async () => {
    const tpl = await Bun.file(
      new URL("../../view/components/molecules/block-form/block-form.html", import.meta.url),
    ).text();
    for (const atom of ATOM_LIBRARY) {
      const tag = new RegExp(`<${atom.name}\\b([^>]*)>`).exec(tpl);
      if (!tag) continue;                                  // b-option is nested by b-choice, not by the form
      const literal = Object.fromEntries(
        [...tag[1]!.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1]!, m[2]!]).filter(([k]) => k !== "each"),
      );
      expect(atom.props, `${atom.name} is used with different props than the library renders`).toEqual(literal);
    }
  });
});

// A library entry is markup that is not on the page yet. An address on it would put a second,
// invisible element on a name meant to point at one thing: the manifest would list it, and a review
// tour's lamp could light a node nobody can see. Both failures are the quiet kind.
describe("the library advertises no address", () => {
  test("no live data-surface anywhere in it, and the parked one is there instead", async () => {
    const html = await renderLibrary();
    expect(html).not.toContain(' data-surface="');
    expect(html).toContain(' data-template-surface="builder-form"');
  });
});
