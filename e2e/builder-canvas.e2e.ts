// e2e/builder-canvas.e2e.ts — /builder as a PAGE builder: the canvas, and the browser composing on
// a host with no server.
//
// The second half is the one that matters. The published /builder has never done anything: the demo
// is a GET round trip the server interprets, this site exports to static hosting, and a static host
// serves one frozen file whatever the query string says. So every Examples link and every
// desk-driven build has landed on an empty page for the page's whole life. The static-host tests
// below reproduce that host exactly, by answering the request for /builder?ask=… with the response
// for /builder, and then assert the page composes anyway.
import { test, expect, type Page } from "@playwright/test";

const CANVAS = '[data-surface="builder-canvas"]';
const CELL = `${CANVAS} .canvas__cell`;
const COMPOSER = ".builder-composer textarea";
const RAIL_ROW = '[data-surface="builder-rail"] [data-block]';
const SUBMIT = ".builder-composer button[type=submit]";

const ask = (s: string) => `/builder?ask=${encodeURIComponent(s)}`;

/** Serve /builder?ask=… the bytes of /builder, which is what GitHub Pages does with a frozen page:
 *  one file, served whatever the address carries. Nothing else about the page is touched. */
async function pretendStaticHost(page: Page): Promise<void> {
  await page.route("**/builder?*", async (route) => {
    const url = new URL(route.request().url());
    url.search = "";
    route.fulfill({ response: await route.fetch({ url: url.toString() }) });
  });
}

test.describe("the canvas: a composition, server-rendered", () => {
  test("a page-shaped ask renders one cell per block, each carrying its span", async ({ page }) => {
    await page.goto(ask("An intro, two cards side by side, and a callout"));
    await expect(page.locator(CELL)).toHaveCount(3);
    // the layout phrase reaches every block the description produced, which is the whole of what
    // the three-word vocabulary buys
    await expect(page.locator(`${CELL}[data-span="half"]`)).toHaveCount(3);
    // and what is inside a cell is grain's own markup, not a picture of it
    await expect(page.locator(`${CANVAS} .card__title`)).toHaveCount(1);
    await expect(page.locator(`${CANVAS} blockquote.callout`)).toHaveCount(1);
  });

  test("a form-shaped ask still produces a form, at the same address, with the same surfaces", async ({ page }) => {
    await page.goto(ask("a contact form with a name, an email and what they want to talk about"));
    await expect(page.locator(`${CELL} form[data-surface="builder-form"]`)).toHaveCount(1);
    await expect(page.locator('[data-surface="field:builder-name"]')).toHaveCount(1);
    await expect(page.locator('[data-surface="field:builder-topic"]')).toHaveCount(1);
  });

  test("a block refusal and a field refusal land in one list", async ({ page }) => {
    await page.goto(ask("a card, a gallery of screenshots, and a side rail"));
    await expect(page.locator(CELL)).toHaveCount(1);
    await expect(page.locator('[data-surface="builder-refusals"] li')).toHaveCount(2);
  });

  // The library ships on every load of this page, composed or not, because the browser needs it
  // before it has anything to compose. It must never be visible or reachable.
  test("the template library ships hidden, with one entry per block and control", async ({ page }) => {
    await page.goto("/builder");
    const library = page.locator(".builder-library");
    await expect(library).toHaveCount(1);
    await expect(library).toBeHidden();
    await expect(page.locator("[data-block-template]")).toHaveCount(11);
    // the form entry is an empty SHELL: its controls are separate entries the browser appends into
    // it, one clone per item the matcher returned
    await expect(page.locator('[data-block-template="block-form"] input, [data-block-template="block-form"] textarea'))
      .toHaveCount(0);
    await expect(page.locator('[data-block-template="b-field"] input')).toHaveCount(1);
    // and an unfilled placeholder is empty rather than holding sample text, so a fill that did
    // nothing shows as a blank block instead of as last month's sample under this month's prompt
    await expect(page.locator('[data-block-template="block-card"] .card__title')).toBeEmpty();
  });
});

test.describe("the browser composes: each prompt adds to what is already there", () => {
  test("a typed prompt builds without leaving the page", async ({ page }) => {
    await page.goto("/builder");
    await expect(page.locator(CELL)).toHaveCount(0);

    await page.locator(COMPOSER).fill("an intro and two cards side by side");
    await page.locator(SUBMIT).click();

    await expect(page.locator(CELL)).toHaveCount(2);
    // the page's own state flags moved with it, through the same bindings the server fills
    await expect(page.locator(".board")).toHaveAttribute("data-builder-state", "result");
    // and the rail knows what is on the canvas, which is what makes it a builder rather than a page
    await expect(page.locator(RAIL_ROW)).toHaveCount(2);
  });

  test("a second prompt appends rather than re-rolling the page", async ({ page }) => {
    await page.goto("/builder");
    await page.locator(COMPOSER).fill("an intro");
    await page.locator(SUBMIT).click();
    await expect(page.locator(CELL)).toHaveCount(1);

    await page.locator(COMPOSER).fill("a stat and a callout");
    await page.locator(SUBMIT).click();
    await expect(page.locator(CELL)).toHaveCount(3);
    // the ids keep counting up rather than restarting, so a later reorder or delete hits the block
    // it names
    await expect(page.locator(`${CELL}`).nth(2)).toHaveAttribute("data-block-id", "b3");
    // and the address carries the latest prompt, so the page is still something you can send
    expect(new URL(page.url()).searchParams.get("ask")).toBe("a stat and a callout");
  });

  test("a generated form is filled by cloning, controls, options and all", async ({ page }) => {
    await page.goto("/builder");
    await page.locator(COMPOSER).fill("a form with a name, an email, a topic and a box to agree to the terms");
    await page.locator(SUBMIT).click();

    await expect(page.locator(`${CANVAS} form[data-surface="builder-form"]`)).toHaveCount(1);
    await expect(page.locator(`${CANVAS} [data-surface="field:builder-name"]`)).toHaveCount(1);
    // the nested repeat: a choice's options are cloned one level further in
    await expect(page.locator(`${CANVAS} select option`).first()).toBeAttached();
    expect(await page.locator(`${CANVAS} select option`).count()).toBeGreaterThan(1);
    // the tick box keeps the address that decides which verb can operate it
    await expect(page.locator(`${CANVAS} [data-surface="check:builder-consent"]`)).toHaveAttribute("type", "checkbox");
    // required arrives as an attribute through the binding, not as the string "required" in text
    await expect(page.locator(`${CANVAS} [data-surface="field:builder-name"]`)).toHaveAttribute("required", "required");
  });
});

test.describe("the static host: one frozen file, and it composes anyway", () => {
  test("an example link lands on a built page, not an empty one", async ({ page }) => {
    await pretendStaticHost(page);
    await page.goto(ask("An intro, two cards side by side, and a callout"));

    await expect(page.locator(CELL)).toHaveCount(3);
    await expect(page.locator(".board")).toHaveAttribute("data-builder-state", "result");
    // the composer holds the prompt that produced the page: it is the echo now, and it is editable
    await expect(page.locator(COMPOSER)).toHaveValue("An intro, two cards side by side, and a callout");
    // the spec pane is the artifact, rebuilt in the browser from the same document shape
    expect(JSON.parse((await page.locator('[data-surface="builder-spec"]').textContent())!).blocks)
      .toHaveLength(3);
  });

  test("a form-shaped example link works there too, with every control addressable", async ({ page }) => {
    await pretendStaticHost(page);
    await page.goto(ask("a form with a name, an email and a box to agree to the terms"));

    await expect(page.locator(`${CANVAS} form[data-surface="builder-form"]`)).toHaveCount(1);
    await expect(page.locator('[data-surface="field:builder-name"]')).toHaveCount(1);
    await expect(page.locator('[data-surface="check:builder-consent"]')).toHaveCount(1);
  });

  test("and a typed prompt still adds to it", async ({ page }) => {
    await pretendStaticHost(page);
    await page.goto(ask("an intro"));
    await expect(page.locator(CELL)).toHaveCount(1);

    await page.locator(COMPOSER).fill("a stat");
    await page.locator(SUBMIT).click();
    await expect(page.locator(CELL)).toHaveCount(2);
  });

  // The honest half: with no JavaScript there is no server either, so the frozen page stays empty.
  // That is what it always was, and saying so here stops a later run from reading the static tests
  // above as a claim the page works without scripting.
  test("with JavaScript off a frozen page stays empty, and says so", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await pretendStaticHost(page);
    await page.goto(ask("an intro and a card"));
    await expect(page.locator(CELL)).toHaveCount(0);
    await expect(page.locator(".builder-empty")).toBeVisible();
    await ctx.close();
  });
});

// The rail, and it is what makes this a builder rather than a page that renders a result.
// composition.ts has had removeBlock, moveBlock and setSpan since the day it was written, and until
// 2026-08-14 nothing but a unit test had ever called one: the canvas was append-only, so every
// mistake was permanent until you started the page over.
test.describe("the rail: the blocks, as things you can operate", () => {
  const rowOp = (id: string, op: string) => `[data-block="${id}"] [data-op="${op}"]`;
  const cellIds = (page: Page) => page.locator(CELL).evaluateAll(
    (cells) => cells.map((c) => (c as HTMLElement).dataset.blockId));

  test("one row per block, in composition order, with the current span pressed", async ({ page }) => {
    await page.goto(ask("An intro, two cards side by side, and a callout"));
    await expect(page.locator(RAIL_ROW)).toHaveCount(3);
    await expect(page.locator(`${RAIL_ROW} .wb-row__name`).first()).toHaveText("lede");
    // the pressed chip is the block's own span, and only that one
    await expect(page.locator('[data-block="b1"] .wb-chip[data-on]')).toHaveCount(1);
    await expect(page.locator('[data-block="b1"] [data-op="span:half"]')).toHaveAttribute("data-on", "on");
  });

  test("a span chip resizes one block and moves none of the others", async ({ page }) => {
    await page.goto(ask("An intro, two cards side by side, and a callout"));
    await page.locator(rowOp("b2", "span:full")).click();
    await expect(page.locator('[data-block-id="b2"]')).toHaveAttribute("data-span", "full");
    await expect(page.locator('[data-block-id="b1"]')).toHaveAttribute("data-span", "half");
    expect(await cellIds(page)).toEqual(["b1", "b2", "b3"]);
  });

  test("remove drops one block and leaves every other id alone", async ({ page }) => {
    await page.goto(ask("An intro, two cards side by side, and a callout"));
    await page.locator(rowOp("b2", "remove")).click();
    expect(await cellIds(page)).toEqual(["b1", "b3"]);
    await expect(page.locator(RAIL_ROW)).toHaveCount(2);
    // ids are NOT renumbered: b3 stays b3, so a later op still names the block it means
    await expect(page.locator('[data-block="b3"]')).toHaveCount(1);
  });

  test("move reorders the canvas, and the ends are clamped rather than wrapped", async ({ page }) => {
    await page.goto(ask("An intro, two cards side by side, and a callout"));
    await page.locator(rowOp("b3", "move:up")).click();
    expect(await cellIds(page)).toEqual(["b1", "b3", "b2"]);
    // the first row's up arrow is a no-op, not a wrap to the bottom
    await page.locator(rowOp("b1", "move:up")).click();
    expect(await cellIds(page)).toEqual(["b1", "b3", "b2"]);
  });

  test("removing the last block returns the empty state, not a matched-nothing notice", async ({ page }) => {
    await page.goto(ask("An opening paragraph"));
    await page.locator(rowOp("b1", "remove")).click();
    await expect(page.locator(CELL)).toHaveCount(0);
    await expect(page.locator(".board")).toHaveAttribute("data-builder-state", "empty");
    // you emptied the page; your prompt did not fail, and the page must not say it did
    await expect(page.locator(".builder-none")).toBeHidden();
  });

  test("a prompt after an op adds to what survived", async ({ page }) => {
    await page.goto(ask("An intro, two cards side by side, and a callout"));
    await page.locator(rowOp("b2", "remove")).click();
    await page.locator(COMPOSER).fill("a stat");
    await page.locator(SUBMIT).click();
    // b4, not b3: ids come from the ids already issued, never from the array length, so an add
    // after a delete cannot reuse a name a later op would resolve to the wrong block
    expect(await cellIds(page)).toEqual(["b1", "b3", "b4"]);
  });

  test("with JavaScript off the rail is still a readable list of what is on the canvas", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto(ask("An intro, two cards side by side, and a callout"));
    await expect(page.locator(RAIL_ROW)).toHaveCount(3);
    await ctx.close();
  });
});

// D3: the AI operates a block. These drive grain's DISPATCHER directly with the ops grain's reasoner
// emits, which is the honest test of the handshake: the AI never calls the page's module, so what
// has to work is that an op applied to the DOM is noticed by the page that owns the composition.
// A block edit that the page does not notice is a delete that lands, reports success, and comes
// back on the next prompt.
test.describe("the AI operates a block, and the page notices", () => {
  const cellIds = (page: Page) => page.locator(CELL).evaluateAll(
    (cells) => cells.map((c) => (c as HTMLElement).dataset.blockId));
  const railIds = (page: Page) => page.locator(RAIL_ROW).evaluateAll(
    (rows) => rows.map((r) => r.getAttribute("data-block")));

  /** Apply one render op the way grain's dispatcher does. Kept to the exact three effects the
   *  contract defines so this cannot drift into testing a private helper. */
  const applyOp = (page: Page, op: { target: string; op: string; span?: string; direction?: string }) =>
    page.evaluate((o) => {
      const el = document.querySelector(`[data-surface="${o.target}"]`);
      if (!el) throw new Error(`no surface ${o.target}`);
      if (o.op === "remove") { el.remove(); return; }
      if (o.op === "span") { el.setAttribute("data-span", o.span!); el.dispatchEvent(new Event("change", { bubbles: true })); return; }
      if (o.op === "move") {
        const sib = o.direction === "up" ? el.previousElementSibling : el.nextElementSibling;
        if (sib) { if (o.direction === "up") el.parentNode!.insertBefore(el, sib); else el.parentNode!.insertBefore(sib, el); }
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }, op);

  test("every block on the canvas carries an address a verb can reach", async ({ page }) => {
    await page.goto(ask("An intro, two cards side by side, and a callout"));
    await expect(page.locator(`${CANVAS} [data-surface^="block:"]`)).toHaveCount(3);
    await expect(page.locator('[data-surface="block:b2"]')).toHaveCount(1);
  });

  test("a remove op sticks: the rail follows, and the next prompt does not bring it back", async ({ page }) => {
    await page.goto(ask("An intro, two cards side by side, and a callout"));
    await applyOp(page, { target: "block:b2", op: "remove" });

    await expect(page.locator(RAIL_ROW)).toHaveCount(2);
    expect(await railIds(page)).toEqual(["b1", "b3"]);

    // the assertion that matters. Before the page derived its state back off the DOM, this next
    // prompt appended to a composition that still held b2 and painted it straight back.
    await page.locator(COMPOSER).fill("a stat");
    await page.locator(SUBMIT).click();
    expect(await cellIds(page)).toEqual(["b1", "b3", "b4"]);
  });

  test("a span op sticks, and the rail's pressed chip follows it", async ({ page }) => {
    await page.goto(ask("An intro, two cards side by side, and a callout"));
    await applyOp(page, { target: "block:b3", op: "span", span: "full" });
    await expect(page.locator('[data-block="b3"] [data-op="span:full"]')).toHaveAttribute("data-on", "on");
    await expect(page.locator('[data-block="b3"] [data-op="span:half"]')).not.toHaveAttribute("data-on", "on");
  });

  test("a move op sticks, and the rail reorders with the canvas", async ({ page }) => {
    await page.goto(ask("An intro, two cards side by side, and a callout"));
    await applyOp(page, { target: "block:b3", op: "move", direction: "up" });
    expect(await cellIds(page)).toEqual(["b1", "b3", "b2"]);
    expect(await railIds(page)).toEqual(["b1", "b3", "b2"]);
  });

  // The spec pane is the artifact an export writes and an import reads. If an AI edit did not reach
  // it, the page would hand you a document describing a page you are not looking at.
  test("the spec pane follows an AI edit", async ({ page }) => {
    await page.goto(ask("An intro, two cards side by side, and a callout"));
    await applyOp(page, { target: "block:b1", op: "remove" });
    const doc = JSON.parse((await page.locator('[data-surface="builder-spec"]').textContent())!);
    expect(doc.blocks.map((b: { id: string }) => b.id)).toEqual(["b2", "b3"]);
  });
});

// The rail collapses, because a tool panel that cannot get out of the way charges a permanent tax
// on the thing you are actually looking at.
test.describe("the rail collapses, and the canvas takes the width back", () => {
  const TOGGLE = "[data-rail-toggle]";
  const stageWidth = (page: Page) =>
    page.locator(".wb__stage").evaluate((el) => Math.round(el.getBoundingClientRect().width));

  test("collapsing widens the canvas and hides the rows, keeping the count readable", async ({ page }) => {
    await page.goto(ask("An intro, two cards side by side, a callout and a stat"));
    const open = await stageWidth(page);

    await page.locator(TOGGLE).click();
    await expect(page.locator(".wb")).toHaveAttribute("data-rail-collapsed", "true");
    await expect(page.locator(".wb__rows")).toBeHidden();
    // the count survives collapse: you never lose track of what is on the page
    await expect(page.locator('.wb__rail [data-field="blockCount"]')).toHaveText("4 blocks");
    expect(await stageWidth(page)).toBeGreaterThan(open);
  });

  test("the toggle says which way it goes, for a screen reader as well as an eye", async ({ page }) => {
    await page.goto(ask("An intro and a card"));
    await expect(page.locator(TOGGLE)).toHaveAttribute("aria-expanded", "true");
    await page.locator(TOGGLE).click();
    await expect(page.locator(TOGGLE)).toHaveAttribute("aria-expanded", "false");
    await page.locator(TOGGLE).click();
    await expect(page.locator(TOGGLE)).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator(".wb__rows")).toBeVisible();
  });

  // A preference someone expressed by pressing a button should survive a rebuild of the page and
  // not outlive the visit, which is exactly what sessionStorage is.
  test("a collapse is remembered for the session", async ({ page }) => {
    await page.goto(ask("An intro and a card"));
    await page.locator(TOGGLE).click();
    await page.goto(ask("An intro, a card and a stat"));
    await expect(page.locator(".wb")).toHaveAttribute("data-rail-collapsed", "true");
  });

  // Every control stays present and clickable at rest: the row went quiet, not hidden. A remove
  // button that only exists on hover is one a touch user does not have.
  test("the row's controls are all still there and all still work without hovering", async ({ page }) => {
    await page.goto(ask("An intro, two cards side by side, and a callout"));
    for (const op of ["span:full", "span:half", "span:third", "move:up", "move:down", "remove"])
      await expect(page.locator(`[data-block="b2"] [data-op="${op}"]`)).toBeVisible();
    await page.locator('[data-block="b2"] [data-op="remove"]').click();
    await expect(page.locator(RAIL_ROW)).toHaveCount(2);
  });
});
