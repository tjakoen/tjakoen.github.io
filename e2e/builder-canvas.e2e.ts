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
    await expect(page.locator("[data-block-template]")).toHaveCount(10);
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
    await expect(page.locator(".builder-canvas-block")).toHaveAttribute("data-has-blocks", "hasblocks");
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
    await expect(page.locator(".builder-prompt")).toContainText("An intro, two cards side by side");
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
