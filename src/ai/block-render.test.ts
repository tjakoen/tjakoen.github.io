// portfolio/ai/block-render.test.ts — the block set, through the REAL renderer. block-set.test.ts
// asserts each block names a file that exists, which is the cheap half; this asserts the file
// expands, produces the classes grain's own doc for that molecule documents, and does it without a
// single unknown-binding warning. The distinction is not academic: a template whose binding path
// disagrees with the sample data renders an empty element, passes a file-exists check, and looks
// like a blank block on the page.
import { test, expect, describe, afterEach } from "bun:test";
import { render } from "../render.ts";
import { matchBlocks, BLOCK_COMPONENTS, FORM_COMPONENT } from "./block-set.ts";

// The renderer warns on an unknown binding path rather than throwing (config.missingBindings is
// "warn" in dev), so a mismatch is invisible unless something listens. This is what listens.
const warnings: string[] = [];
const realWarn = console.warn;
console.warn = (...args: unknown[]) => { warnings.push(args.map(String).join(" ")); };
afterEach(() => { warnings.length = 0; });
process.on("exit", () => { console.warn = realWarn; });

/** Every block the set can produce, each with the sample data it would carry on the page. Driven
 *  through matchBlocks rather than hand-listed, so a block added to the table is covered here the
 *  moment it exists and cannot be forgotten. */
const everyBlock = () => matchBlocks(
  "an intro, a card, a callout, a stat, and a contact form with a name, an email and a message box",
).blocks;

describe("every block in the set renders", () => {
  test("the sample ask produces one of every block the set has", () => {
    expect(everyBlock().map((b) => b.component).toSorted()).toEqual(BLOCK_COMPONENTS.toSorted());
  });

  test("each one expands to real markup, with no unknown-binding warning", async () => {
    for (const block of everyBlock()) {
      const html = await render(block.component, block.data, block.props);
      expect(html.trim().length, `${block.component} rendered nothing`).toBeGreaterThan(0);
      expect(html, `${block.component} rendered an unexpanded tag`).not.toContain(`<${block.component}`);
    }
    expect(warnings.filter((w) => w.includes("unknown binding"))).toEqual([]);
  });
});

describe("each block emits the classes grain's own doc documents", () => {
  const renderOne = async (component: string) => {
    const block = everyBlock().find((b) => b.component === component)!;
    return render(block.component, block.data, block.props);
  };

  test("block-lede is grain's lede paragraph", async () => {
    const html = await renderOne("block-lede");
    expect(html).toContain('class="lede"');
    expect(html).toContain("closed set of components");
  });

  test("block-card is grain's card, with its title and body and the pad attribute", async () => {
    const html = await renderOne("block-card");
    expect(html).toContain('class="card"');
    expect(html).toContain('data-pad="sm"');
    expect(html).toContain('class="card__title"');
    expect(html).toContain('class="card__body"');
    expect(html).toContain("No build step");
  });

  test("block-callout is a blockquote, and a null status renders no attribute at all", async () => {
    const html = await renderOne("block-callout");
    expect(html).toContain("<blockquote");
    expect(html).toContain('class="callout"');
    // The null contract: a null value omits the attribute rather than emitting data-status="".
    // Asserted with the quote, because the renderer leaves the `data-bind-data-status` DIRECTIVE in
    // the output — that is engine behaviour across every component on this site, not this block's,
    // and a bare substring check would match the directive and pass for the wrong reason.
    // The null contract: a null value omits the attribute rather than emitting data-status="".
    // Asserted with a leading space so it cannot match the `data-bind-data-status` DIRECTIVE, which
    // the renderer leaves in the output on every component across this site rather than consuming.
    expect(html).not.toContain(' data-status="');
    expect(html).toContain('data-bind-data-status="status"');
  });

  test("block-callout carries a status when the data supplies one", async () => {
    const html = await render("block-callout", { body: "Strong.", status: "strong" }, {});
    expect(html).toContain('data-status="strong"');
  });

  test("block-stat is grain's stat tile, value label and sub-line", async () => {
    const html = await renderOne("block-stat");
    expect(html).toContain('class="stat"');
    expect(html).toContain('class="stat__value"');
    expect(html).toContain('class="stat__label"');
    expect(html).toContain("18");
  });

  // The reframing, proved rather than asserted in prose: the form is one block now, and the four
  // control atoms still render inside it exactly as they did when the page was about forms.
  test("block-form nests the four control atoms over the field spec", async () => {
    const html = await renderOne(FORM_COMPONENT);
    expect(html).toContain('class="builder-form"');
    expect(html).toContain('data-surface="field:builder-name"');
    expect(html).toContain('data-surface="field:builder-email"');
    expect(html).toContain('data-surface="field:builder-message"');
    expect(html).toContain("<textarea");
    // and it has nothing to submit with, structurally rather than by omission
    expect(html).not.toContain('type="submit"');
  });

  test("block-form renders a generated tick box at a check: address, not a field: one", async () => {
    const block = matchBlocks("a form with a name and a box to agree to the terms")
      .blocks.find((b) => b.component === FORM_COMPONENT)!;
    const html = await render(block.component, block.data, block.props);
    expect(html).toContain('data-surface="check:builder-consent"');
    expect(html).not.toContain('data-surface="field:builder-consent"');
  });
});

describe("text that arrives as data is escaped, never rendered as markup", () => {
  // A block's body is content, and content from a description is the one place a generated page
  // could grow a hole. The renderer escapes it; this is what says so out loud.
  test("a body carrying tags lands as text", async () => {
    const html = await render("block-lede", { body: `<script>alert(1)</script>` }, {});
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
