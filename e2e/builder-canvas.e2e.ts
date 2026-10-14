// e2e/builder-canvas.e2e.ts — /grain/builder as a PAGE builder: the canvas, and the browser composing on
// a host with no server.
//
// The second half is the one that matters. The published /grain/builder has never done anything: the demo
// is a GET round trip the server interprets, this site exports to static hosting, and a static host
// serves one frozen file whatever the query string says. So every Examples link and every
// desk-driven build has landed on an empty page for the page's whole life. The static-host tests
// below reproduce that host exactly, by answering the request for /grain/builder?ask=… with the response
// for /grain/builder, and then assert the page composes anyway.
import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";   // P4: reading a download back off disk

const CANVAS = '[data-surface="builder-canvas"]';
const CELL = `${CANVAS} .canvas__cell`;
const COMPOSER = ".builder-composer textarea";
const RAIL_ROW = '[data-surface="builder-rail"] [data-block]';
const SUBMIT = ".builder-composer button[type=submit]";

const ask = (s: string) => `/grain/builder?ask=${encodeURIComponent(s)}`;

/** Serve /grain/builder?ask=… the bytes of /grain/builder, which is what GitHub Pages does with a frozen page:
 *  one file, served whatever the address carries. Nothing else about the page is touched. */
async function pretendStaticHost(page: Page): Promise<void> {
  // Both builder addresses, because a frozen host strips the query from every one of them and a
  // helper that covered only the workbench would let the preview quietly keep its server.
  for (const pattern of ["**/grain/builder?*", "**/grain/builder/preview?*"]) {
    await page.route(pattern, async (route) => {
      const url = new URL(route.request().url());
      url.search = "";
      route.fulfill({ response: await route.fetch({ url: url.toString() }) });
    });
  }
}

test.describe("the canvas: a composition, server-rendered", () => {
  test("the narrow-phone prompt and workbench fit above the detailed audit disclosure", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 812 });
    await page.goto("/grain/builder");
    const submit = page.locator(SUBMIT);
    await expect(submit).toBeVisible();
    const lines = await submit.evaluate((button) => {
      const range = document.createRange();
      range.selectNodeContents(button);
      return range.getClientRects().length;
    });
    expect(lines).toBe(1);
    await expect(page.locator(".wb-bar__evidence")).not.toHaveAttribute("open", "");
    const workbenchTop = await page.locator(".wb").evaluate((workbench) => workbench.getBoundingClientRect().top);
    expect(workbenchTop).toBeLessThan(430);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  });

  test("the first-screen example leads to measured edit and honest refusal prompts", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/grain/builder");
    const example = page.locator(".builder-empty__example a");
    await expect(example).toHaveText("Open the four-block example");
    await expect(example).toHaveAttribute("href", ask("An intro, two cards side by side, and a callout"));
    await expect(example).toBeInViewport();
    await page.locator(".builder-empty__example a").click();
    await expect(page.locator(CELL)).toHaveCount(4);

    const examples = page.locator("[data-builder-try-edits]");
    await expect(examples).toBeVisible();
    const move = page.locator("[data-builder-move-example]");
    await expect(move).toBeVisible();
    await expect(page.locator("[data-builder-move-note]")).toContainText("An explicit-ID move passed in both profile checks");
    await move.click();
    await expect(page.locator(COMPOSER)).toHaveValue("move b3 up");
    await expect(page.locator(CELL)).toHaveCount(4);

    await page.getByRole("button", { name: "Try an honest copy-edit refusal" }).click();
    await expect(page.locator(COMPOSER)).toHaveValue("rewrite the intro paragraph to mention pricing");
    await page.locator(SUBMIT).click();
    await expect(page.locator('[data-surface="builder-said"]')).toContainText("cannot revise block copy yet");
    await expect(page.locator(CELL)).toHaveCount(4);
  });

  test("a page-shaped ask repeats an explicitly counted block", async ({ page }) => {
    await page.goto(ask("An intro, two cards side by side, and a callout"));
    await expect(page.locator('[data-surface="builder-said"]')).toContainText("shared preview uses the code-owned block matcher");
    await expect(page.locator(".wb-bar__note")).toContainText("First use downloads about 875 MB");
    await expect(page.locator(".wb-bar__note")).toContainText("prompts stay on this device");
    await expect(page.locator(".wb-bar__note")).toContainText("Review every draft.");
    const reliability = page.locator(".wb-bar__evidence");
    await expect(reliability.locator("summary")).toHaveText("Model limits and reliability evidence");
    await expect(reliability).not.toHaveAttribute("open", "");
    await expect(reliability).toContainText("12 of 12 drafts that passed the checks on the text visitors see");
    await expect(reliability).toContainText("The raw model still proposed unsupported details and extra blocks");
    await expect(reliability.locator("a")).toHaveAttribute("href", "/plans/plan/builder-ai-depth/");
    const help = page.locator('[data-surface="builder-help"]');
    await expect(help).toContainText("After its timeout increased to 60 seconds, another October 12 run scored 5/8");
    await expect(help).toContainText("The first request took 50 seconds");
    await expect(help).toContainText("both deletion cases failed");
    await expect(help).toContainText("The draft omitted Utrecht");
    await expect(help).toContainText("This 2/3 result measures the reviewed page workflow");
    await expect(help).toContainText("shows both versions and uses your explicit request");
    await expect(help).toContainText("both deletion requests applied");
    await expect(help).toContainText("explicit-ID request passed as proposed by the model");
    await expect(help).toContainText("If the model declines or returns an unusable answer for a request whose supported edit and live target are explicit");
    await expect(help).toContainText("Two warm repeats of the same prompt scored 0/1 and 1/1");
    await expect(help).toContainText("only one retained the supplied city");
    await expect(help).toContainText("keeps the original brief beside editable draft text");
    await expect(help).toContainText("requests stop after 75 seconds");
    await expect(page.locator(CELL)).toHaveCount(4);
    await expect(page.locator(`${CELL}[data-span="half"]`)).toHaveCount(2);
    await expect(page.locator(`${CELL}[data-span="full"]`).first()).toHaveAttribute("data-block-id", "b1");
    await expect(page.locator(`${CELL}[data-span="full"]`).last()).toHaveAttribute("data-block-id", "b4");
    // and what is inside a cell is grain's own markup, not a picture of it
    await expect(page.locator(`${CANVAS} .card__title`)).toHaveCount(2);
    await expect(page.locator(`${CANVAS} .card__title`).nth(0)).toHaveText("No build step");
    await expect(page.locator(`${CANVAS} .card__title`).nth(1)).toHaveText("A closed set");
    await expect(page.locator(`${CANVAS} blockquote.callout`)).toHaveCount(1);
  });

  test("definite copy-field nouns inside a page brief do not route page creation to editing", async ({ page }) => {
    for (const prompt of [
      "Build a product page with the title, a short description, and two cards.",
      "Create a landing page for this bakery with a menu and a callout.",
    ]) {
      await page.goto(ask(prompt));
      await expect(page.locator(SAID)).not.toContainText("cannot revise block copy yet");
      await expect(page.locator(CELL).first()).toBeVisible();
    }
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
    await page.goto("/grain/builder");
    const library = page.locator(".builder-library");
    await expect(library).toHaveCount(1);
    await expect(library).toBeHidden();
    // Twelve since 2026-08-19: the Can't build line joined the chrome entries with the import, so
    // the browser can name a refusal instead of raising an empty head over one.
    await expect(page.locator("[data-block-template]")).toHaveCount(12);
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
    await page.goto("/grain/builder");
    await expect(page.locator(CELL)).toHaveCount(0);

    await page.locator(COMPOSER).fill("an intro and two cards side by side");
    await page.locator(SUBMIT).click();

    await expect(page.locator(CELL)).toHaveCount(3);
    // the page's own state flags moved with it, through the same bindings the server fills
    await expect(page.locator(".board")).toHaveAttribute("data-builder-state", "result");
    // and the rail knows what is on the canvas, which is what makes it a builder rather than a page
    await expect(page.locator(RAIL_ROW)).toHaveCount(3);
  });

  test("a second prompt appends rather than re-rolling the page", async ({ page }) => {
    await page.goto("/grain/builder");
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
    await page.goto("/grain/builder");
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

    await expect(page.locator(CELL)).toHaveCount(4);
    await expect(page.locator(".board")).toHaveAttribute("data-builder-state", "result");
    // the composer holds the prompt that produced the page: it is the echo now, and it is editable
    await expect(page.locator(COMPOSER)).toHaveValue("An intro, two cards side by side, and a callout");
    // the spec pane is the artifact, rebuilt in the browser from the same document shape
    expect(JSON.parse((await page.locator('[data-surface="builder-spec"]').textContent())!).blocks)
      .toHaveLength(4);
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
    await expect(page.locator(RAIL_ROW)).toHaveCount(4);
    await expect(page.locator(`${RAIL_ROW} .wb-row__name`).first()).toHaveText("lede");
    // the pressed chip is the block's own span, and only that one
    await expect(page.locator('[data-block="b1"] .wb-chip[data-on]')).toHaveCount(1);
    await expect(page.locator('[data-block="b1"] [data-op="span:full"]')).toHaveAttribute("data-on", "on");
  });

  test("a span chip resizes one block and moves none of the others", async ({ page }) => {
    await page.goto(ask("An intro, two cards side by side, and a callout"));
    await page.locator(rowOp("b2", "span:full")).click();
    await expect(page.locator('[data-block-id="b2"]')).toHaveAttribute("data-span", "full");
    await expect(page.locator('[data-block-id="b1"]')).toHaveAttribute("data-span", "full");
    expect(await cellIds(page)).toEqual(["b1", "b2", "b3", "b4"]);
  });

  test("remove drops one block and leaves every other id alone", async ({ page }) => {
    await page.goto(ask("An intro, two cards side by side, and a callout"));
    await page.locator(rowOp("b2", "remove")).click();
    expect(await cellIds(page)).toEqual(["b1", "b3", "b4"]);
    await expect(page.locator(RAIL_ROW)).toHaveCount(3);
    // ids are NOT renumbered: b3 and b4 keep their names, so a later op still finds the block it means
    await expect(page.locator('[data-block="b3"], [data-block="b4"]')).toHaveCount(2);
  });

  test("move reorders the canvas, and the ends are clamped rather than wrapped", async ({ page }) => {
    await page.goto(ask("An intro, two cards side by side, and a callout"));
    await page.locator(rowOp("b3", "move:up")).click();
    expect(await cellIds(page)).toEqual(["b1", "b3", "b2", "b4"]);
    // the first row's up arrow is a no-op, not a wrap to the bottom
    await page.locator(rowOp("b1", "move:up")).click();
    expect(await cellIds(page)).toEqual(["b1", "b3", "b2", "b4"]);
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
    expect(await cellIds(page)).toEqual(["b1", "b3", "b4", "b5"]);
  });

  test("with JavaScript off the rail is still a readable list of what is on the canvas", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto(ask("An intro, two cards side by side, and a callout"));
    await expect(page.locator(RAIL_ROW)).toHaveCount(4);
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
    await expect(page.locator(`${CANVAS} [data-surface^="block:"]`)).toHaveCount(4);
    await expect(page.locator('[data-surface="block:b2"]')).toHaveCount(1);
  });

  test("a remove op sticks: the rail follows, and the next prompt does not bring it back", async ({ page }) => {
    await page.goto(ask("An intro, two cards side by side, and a callout"));
    await applyOp(page, { target: "block:b2", op: "remove" });

    await expect(page.locator(RAIL_ROW)).toHaveCount(3);
    expect(await railIds(page)).toEqual(["b1", "b3", "b4"]);

    // the assertion that matters. Before the page derived its state back off the DOM, this next
    // prompt appended to a composition that still held b2 and painted it straight back.
    await page.locator(COMPOSER).fill("a stat");
    await page.locator(SUBMIT).click();
    expect(await cellIds(page)).toEqual(["b1", "b3", "b4", "b5"]);
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
    expect(await cellIds(page)).toEqual(["b1", "b3", "b2", "b4"]);
    expect(await railIds(page)).toEqual(["b1", "b3", "b2", "b4"]);
  });

  // The spec pane is the artifact an export writes and an import reads. If an AI edit did not reach
  // it, the page would hand you a document describing a page you are not looking at.
  test("the spec pane follows an AI edit", async ({ page }) => {
    await page.goto(ask("An intro, two cards side by side, and a callout"));
    await applyOp(page, { target: "block:b1", op: "remove" });
    const doc = JSON.parse((await page.locator('[data-surface="builder-spec"]').textContent())!);
    expect(doc.blocks.map((b: { id: string }) => b.id)).toEqual(["b2", "b3", "b4"]);
  });
});
// D3b: the MODEL chooses the verb, and code decides whether it was allowed to.
//
// Two describes, because there are two honest states. Without a desk there is no model, and the page
// says so rather than reaching for something that is not one: that is the owner's call of
// 2026-08-14 and it is what the first block pins. With a scripted model the whole chain runs, and
// nothing below applies an op by hand. The prompt bar is the only input, and a pass means the
// router asked, GRAIN built the prompt, the model answered, and GRAIN validated it against the live
// manifest. The page then showed the proposal; only approval sent the Intent through the door, and
// the test checked the resulting canvas.
const SAID = '[data-surface="builder-said"]';
const PROPOSAL = '[data-surface="builder-edit-proposal"]';
const PROPOSAL_COPY = '[data-surface="builder-edit-proposal-copy"]';
const APPLY_PROPOSAL = "[data-proposal-apply]";
const CANCEL_PROPOSAL = "[data-proposal-cancel]";
const DRAFT_REVIEW = "[data-builder-draft-review]";
const DRAFT_BLOCKS = "[data-builder-draft-blocks]";
const ACCEPT_DRAFT = "[data-draft-accept]";
const DISCARD_DRAFT = "[data-draft-discard]";

const submitPrompt = async (page: Page, prompt: string): Promise<void> => {
  await page.locator(COMPOSER).fill(prompt);
  await page.locator(SUBMIT).click();
};

const canvasIds = (page: Page) => page.locator(CELL).evaluateAll(
  (cells) => cells.map((c) => (c as HTMLElement).dataset.blockId));
const canvasState = (page: Page) => page.locator(CELL).evaluateAll(
  (cells) => cells.map((c) => ({
    id: (c as HTMLElement).dataset.blockId,
    span: c.getAttribute("data-span"),
  })));

/** A page holding two cards and a callout. The first prompt builds the introduction, first card and
 *  callout; the second adds another card after them so the edit checks use stable, familiar ids. */
async function twoCardPage(page: Page, withModel = false): Promise<void> {
  await page.goto(ask("An intro, a card and a callout"));
  if (withModel) await waitForDesk(page);
  await expect(page.locator(CELL)).toHaveCount(3);
  await submitPrompt(page, "another card");
  if (await page.locator(DRAFT_REVIEW).isVisible()) {
    await page.locator("[data-draft-confirm]").check();
    await page.locator(ACCEPT_DRAFT).click();
  }
  await expect(page.locator(CELL)).toHaveCount(4);
}

async function waitForDesk(page: Page): Promise<void> {
  await page.waitForFunction(
    () => typeof (window as unknown as { desk?: { complete?: unknown } }).desk?.complete === "function",
    null,
    { timeout: 20_000 },
  );
}

test.describe("with no desk, the page says so instead of guessing", () => {
  // The line this asserts is new, and it replaces a silence. Building used to say nothing at all
  // when it composed, which was fine while there was only one way a page could get built. Now there
  // are two, and a visitor who cannot tell which one ran cannot tell whether the model chose these
  // blocks or a word list matched them. So the page names the path every time, and the case with no
  // desk at all is the one where saying so matters most.
  test("a description still composes, and the page says the words did it", async ({ page }) => {
    await twoCardPage(page);
    await submitPrompt(page, "a stat");
    await expect(page.locator(CELL)).toHaveCount(5);
    await expect(page.locator(SAID)).toContainText("Composed from the words");
    await expect(page.locator(SAID)).toContainText("desk cannot run here");
  });

  // The honest-offline rule. The temptation is a word list that answers when the model cannot, and
  // it was deliberately refused: a page claiming an AI edit for something no AI touched is the same
  // silent-success shape every other bug in this estate has had.
  test("an edit says the desk cannot run, and changes nothing", async ({ page }) => {
    await twoCardPage(page);
    await submitPrompt(page, "drop the second card");
    await expect(page.locator(SAID)).toContainText("desk cannot run");
    expect(await canvasIds(page)).toEqual(["b1", "b2", "b3", "b4"]);
  });
});

// The scripted model. Headless CI has no WebGPU, so the two grain transport modules the desk door
// URL-imports are stubbed at the network layer — everything else runs real, including grain's
// parser, grain's validator and grain's dispatcher. The stub answers by what the human asked, which
// is the one thing a real 0.5B would also be doing.
const WEBLLM_STUB = `
export async function probeDevice() { return { webgpu: true, deviceMemory: 8, cores: 8, maxBufferSize: 4 * 1024 ** 3 }; }
export function canRunModel() { return true; }
export async function webgpuAvailable() { return true; }
function draftAnswer(prompt) {
  if (/get rid of the final card|take out the callout|let the callout span the whole row|let the callout fill the whole row|shift the callout up|avoid getting rid of the final card|delete the intro|shrink the callout to a third width|erase the final card|reposition the callout down one step/i.test(prompt) && sessionStorage.getItem("__builderNoAction") === "true")
    return JSON.stringify({ action: null, reply: "I could not identify an action." });
  if (/drop the second card|drop b4/i.test(prompt)) {
    if (sessionStorage.getItem("__builderMalformed") === "true") return '{"action":"block.span","target":"b4","payload":null}';
    if (sessionStorage.getItem("__builderNoAction") === "true")
      return JSON.stringify({ action: null, reply: "I could not identify an action." });
    const target = sessionStorage.getItem("__builderWrongTarget") === "true" ? "block:b2" : "block:b4";
    if (sessionStorage.getItem("__builderWrongAction") === "true")
      return JSON.stringify({ action: "block.span", target, payload: { span: "half" } });
    return JSON.stringify({ action: "block.remove", target, payload: {} });
  }
  if (/drop the callout/i.test(prompt)) return JSON.stringify({ action: "block.remove", target: "block:b2", payload: {} });
  if (/make the callout full/i.test(prompt)) return JSON.stringify({ action: "block.span", target: "block:b3", payload: { span: "full" } });
  if (/move the callout up/i.test(prompt)) return JSON.stringify({ action: "block.move", target: "block:b3", payload: { direction: "up" } });
  if (/widen/i.test(prompt)) return JSON.stringify({ action: "block.span", target: "block:b2", payload: { span: "wide" } });
  if (/duplicate/i.test(prompt)) return JSON.stringify({ action: "block.duplicate", target: "block:b2" });
  if (/ninth/i.test(prompt)) return JSON.stringify({ action: "block.remove", target: "block:b9" });
  if (/the card should mention pricing/i.test(prompt)) return JSON.stringify({ action: null, reply: "There is no verb that rewrites what a block says." });
  if (/Hearth Bakery page/i.test(prompt)) return JSON.stringify({ blocks: [
    { name: "lede", copy: { body: "Hearth Bakery is a neighborhood bakery that welcomes every visitor." } },
    { name: "card", copy: sessionStorage.getItem("__builderOmitCardBody") === "true"
      ? { title: "Coffee" }
      : { title: "Coffee", body: "Baked fresh each morning, our coffee is perfect." } },
    { name: "callout", copy: { body: "Learn more about our daily bread." } },
  ] });
  if (/Northstar Bike Repair page/i.test(prompt)) return JSON.stringify({ blocks: [
    { name: "lede", copy: { body: "Northstar Bike Repair is a family-run bike repair shop in Malmö." } },
    { name: "card", copy: { title: "Tune-up", body: "Get your bike ready for the next adventure." } },
  ] });
  if (/literal text/i.test(prompt)) return JSON.stringify({ blocks: [
    { name: "lede", copy: { body: "<img src=x onerror=window.__builderXss=true>" } },
  ] });
  if (/another card/i.test(prompt)) return JSON.stringify({ blocks: [{ name: "card" }] });
  return JSON.stringify({ blocks: [{ name: "lede" }] });
}
export async function loadEngine({ onProgress }) {
  onProgress?.({ progress: 1, text: "fake engine ready" });
  return { chat: { completions: { create: async (request) => {
    const prompt = request.messages.map((message) => message.content).join("\\n");
    sessionStorage.setItem("__builderPrompt", prompt);
    if (sessionStorage.getItem("__builderNoReply") === "true") throw new Error("no model response");
    const raw = draftAnswer(prompt);
    sessionStorage.setItem("__builderRaw", raw);
    return { choices: [{ message: { content: raw } }] };
  } } } };
}
`;

// makeChatModel is the seam /grain/builder uses (desk-reasoner's `complete`). The scripted answers below
// include the ones a small model really gets wrong: a verb that does not exist, a block that is not
// on the page, and a width outside the closed three.
const MODEL_CHAT_STUB = `
export async function* streamChat() { yield "unused"; }
export function makeChatModel() {
  return {
    async complete(prompt) {
      sessionStorage.setItem("__builderPrompt", prompt);
      if (/Build a Northstar Bike Repair page/i.test(prompt)) return JSON.stringify({ blocks: [
        { name: "lede" }, { name: "card" },
      ] });
      if (/Hearth Bakery page/i.test(prompt)) return JSON.stringify({ blocks: [
        { name: "lede", copy: { body: "Hearth Bakery is a neighborhood bakery that welcomes every visitor." } },
        { name: "card", copy: { title: "Coffee", body: "Baked fresh each morning, our coffee is perfect." } },
        { name: "callout", copy: { body: "Learn more about our daily bread." } },
      ] });
      if (/literal text/i.test(prompt)) return JSON.stringify({ blocks: [
        { name: "lede", copy: { body: "<img src=x onerror=window.__builderXss=true>" } },
      ] });
      if (/get rid of the final card|take out the callout|let the callout span the whole row|let the callout fill the whole row|shift the callout up|avoid getting rid of the final card|erase the final card|reposition the callout down one step/i.test(prompt) && sessionStorage.getItem("__builderNoAction") === "true")
        return JSON.stringify({ action: null, reply: "I could not identify an action." });
      if (/drop the second card|drop b4/i.test(prompt)) {
        if (sessionStorage.getItem("__builderMalformed") === "true") return '{"action":"block.span","target":"b4","payload":null}';
        if (sessionStorage.getItem("__builderNoAction") === "true")
          return JSON.stringify({ action: null, reply: "I could not identify an action." });
        const target = sessionStorage.getItem("__builderWrongTarget") === "true" ? "block:b2" : "block:b4";
        if (sessionStorage.getItem("__builderWrongAction") === "true")
          return JSON.stringify({ action: "block.span", target, payload: { span: "half" } });
        return JSON.stringify({ action: "block.remove", target });
      }
      if (/drop the callout/i.test(prompt)) return JSON.stringify({ action: "block.remove", target: "block:b2" });
      if (/make the callout full/i.test(prompt)) return 'Sure!\\n{"action":"block.span","target":"block:b3","payload":{"span":"full"}}';
      if (/move the callout up/i.test(prompt)) return '{"action":"block.move","target":"block:b3","payload":{"direction":"up"}}';
      if (/widen/i.test(prompt)) return '{"action":"block.span","target":"block:b2","payload":{"span":"wide"}}';
      if (/duplicate/i.test(prompt)) return '{"action":"block.duplicate","target":"block:b2"}';
      if (/ninth/i.test(prompt)) return '{"action":"block.remove","target":"block:b9"}';
      return '{"action":null,"reply":"There is no verb that rewrites what a block says."}';
    },
  };
}
`;

async function scriptedDesk(page: Page): Promise<void> {
  await page.route("**/*", async (route, req) => {
    const url = new URL(req.url());
    if (url.pathname === "/modules/grain/ai/webllm.js")
      return route.fulfill({ contentType: "text/javascript", body: WEBLLM_STUB });
    if (url.pathname === "/modules/grain/ai/model-chat.js")
      return route.fulfill({ contentType: "text/javascript", body: MODEL_CHAT_STUB });
    if (req.resourceType() !== "document") return route.continue();
    const res = await route.fetch();
    if (!(res.headers()["content-type"] || "").includes("text/html")) return route.fulfill({ response: res });
    const html = (await res.text()).replace(/<body\b/,
      '<body data-ai-transport="client" data-ai-door="/modules/portfolio/ai/desk-door.js"');
    return route.fulfill({ response: res, body: html });
  });
  await page.addInitScript(() => {
    try { Object.defineProperty(navigator, "gpu", { value: { requestAdapter: async () => ({}) }, configurable: true }); }
    catch { /* already present */ }
  });
}

test.describe("the model chooses the verb", () => {
  test.beforeEach(async ({ page }) => { await scriptedDesk(page); });

  test("a page brief shows a reviewable draft and adds it only after approval", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/grain/builder");
    await waitForDesk(page);
    await submitPrompt(page, "Build a Hearth Bakery page in Utrecht with an intro that says it is a neighborhood bakery, then a card titled Coffee with the words baked fresh each morning.");

    await expect(page.locator(DRAFT_REVIEW)).toBeVisible();
    await expect(page.locator("[data-builder-draft-brief]")).toHaveText("Build a Hearth Bakery page in Utrecht with an intro that says it is a neighborhood bakery, then a card titled Coffee with the words baked fresh each morning.");
    await expect(page.locator(DRAFT_REVIEW)).toContainText("Compare names, locations, and claims with the draft before adding it.");
    await expect(page.locator(DRAFT_REVIEW)).toContainText("joins supplied details into sentences for recognized intro requests");
    await expect(page.locator("[data-builder-draft-evidence]"))
      .toContainText("Detected names, quoted phrases, and numbers appear in the draft.");
    await expect(page.locator(ACCEPT_DRAFT)).toBeDisabled();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await expect(page.locator(CELL)).toHaveCount(0);
    await expect(page.locator(DRAFT_BLOCKS).getByRole("listitem")).toHaveCount(2);
    await expect(page.locator('[data-draft-copy-block="b1"][data-draft-copy-field="body"]'))
      .toHaveValue("Hearth Bakery is a neighborhood bakery in Utrecht.");
    await expect(page.locator('[data-draft-copy-block="b1"][data-draft-copy-field="body"]')
      .locator("xpath=../..")
      .locator('[data-draft-copy-evidence="b1-body"]'))
      .toContainText("The Builder composed this field from details in your brief");
    await expect(page.locator('[data-draft-copy-block="b1"][data-draft-copy-field="body"]'))
      .toHaveAttribute("maxlength", "280");
    await expect(page.locator('[data-draft-copy-block="b2"][data-draft-copy-field="title"]'))
      .toHaveAttribute("maxlength", "60");
    await expect(page.locator('[data-draft-copy-block="b2"][data-draft-copy-field="body"]'))
      .toHaveValue("baked fresh each morning");
    await expect(page.locator("[data-builder-draft-evidence]"))
      .toContainText("The model's 1 unrequested block was removed.");
    await expect(page.locator("[data-builder-draft-evidence]"))
      .toContainText("The Builder composed 3 fields from phrases in your brief.");
    await expect(page.locator('[data-surface="builder-spec"]')).not.toContainText("Hearth Bakery");
    await page.locator('[data-draft-copy-block="b1"][data-draft-copy-field="body"]')
      .fill("Hearth Bakery page about coffee in Utrecht, a neighborhood bakery.");
    await expect(page.locator("[data-builder-draft-evidence]")).toContainText("Detected names, quoted phrases, and numbers appear in the draft.");
    await expect(page.locator('[data-draft-copy-block="b1"][data-draft-copy-field="body"]')
      .locator("xpath=../..")
      .locator('[data-draft-copy-evidence="b1-body"]'))
      .toContainText("No new content words found");
    await page.locator("[data-draft-confirm]").check();
    await expect(page.locator(ACCEPT_DRAFT)).toBeEnabled();
    await page.locator('[data-draft-copy-block="b2"][data-draft-copy-field="title"]').fill("Coffee and bread");
    await expect(page.locator("[data-draft-confirm]")).not.toBeChecked();
    await expect(page.locator(ACCEPT_DRAFT)).toBeDisabled();
    await page.locator("[data-draft-confirm]").check();
    await page.locator(ACCEPT_DRAFT).click();

    await expect(page.locator(CELL)).toHaveCount(2);
    await expect(page.locator(`${CELL} .lede`)).toHaveText("Hearth Bakery page about coffee in Utrecht, a neighborhood bakery.");
    await expect(page.locator(`${CELL} .card__title`)).toHaveText("Coffee and bread");
    await expect(page.locator(`${CELL} .card__body`)).toHaveText("baked fresh each morning");
    await expect(page.locator(SAID)).toContainText("Added lede and card after your review");
    await expect(page.locator(DRAFT_REVIEW)).toBeHidden();

    const modelPrompt = await page.evaluate(() => sessionStorage.getItem("__builderPrompt") || "");
    expect(modelPrompt).toContain("Do not write copy or add text fields.");

    const spec = JSON.parse((await page.locator('[data-surface="builder-spec"]').textContent())!);
    expect(spec.blocks.map((block: { data: Record<string, string> }) => block.data)).toEqual([
      { body: "Hearth Bakery page about coffee in Utrecht, a neighborhood bakery." },
      { title: "Coffee and bread", body: "baked fresh each morning" },
    ]);
  });

  test("a shortened requested phrase is restored in the reviewable draft", async ({ page }) => {
    await page.goto("/grain/builder");
    await waitForDesk(page);
    const brief = "Build a Northstar Bike Repair page in Malmö. Add an intro for a family-run bike repair shop, then a card titled Tune-up with the words ready for the next ride.";
    await submitPrompt(page, brief);

    await expect(page.locator(DRAFT_REVIEW)).toBeVisible();
    await expect(page.locator('[data-draft-copy-block="b2"][data-draft-copy-field="body"]'))
      .toHaveValue("ready for the next ride");
    await expect(page.locator("[data-builder-draft-evidence]"))
      .toContainText("Detected names, quoted phrases, and numbers appear in the draft.");
    await expect(page.locator(ACCEPT_DRAFT)).toBeDisabled();
  });

  test("a missing draft names the word-list result without claiming the model read it", async ({ page }) => {
    await page.goto("/grain/builder");
    await waitForDesk(page);
    await page.evaluate(() => sessionStorage.setItem("__builderNoReply", "true"));
    await submitPrompt(page, "Add a card about coffee.");

    await expect(page.locator(SAID))
      .toHaveText("Composed from the words in that sentence. The desk answered with nothing this set can build.");
    await expect(page.locator(CELL)).toHaveCount(1);
  });

  test("unsupported sample copy stays blank until the visitor adds wording", async ({ page }) => {
    await page.goto("/grain/builder");
    await page.evaluate(() => sessionStorage.setItem("__builderOmitCardBody", "true"));
    await waitForDesk(page);
    await submitPrompt(page, "Build a Hearth Bakery page with an intro and a card about coffee.");

    await expect(page.locator(DRAFT_REVIEW)).toBeVisible();
    const blankBody = page.locator('[data-draft-copy-block="b2"][data-draft-copy-field="body"]');
    const evidence = blankBody.locator("xpath=../..").locator('[data-draft-copy-evidence="b2-body"]');
    await expect(blankBody).toHaveValue("");
    await expect(evidence).toHaveText("No copy was supplied for this field. Add wording here or leave it blank.");

    await blankBody.fill("Coffee in Utrecht.");
    await expect(evidence).toContainText("Your edits add words absent from your brief: Utrecht.");
  });

  test("model-written markup is omitted and visitor markup remains literal text", async ({ page }) => {
    await page.goto("/grain/builder");
    await waitForDesk(page);
    await submitPrompt(page, "Build a page with this literal text: <img src=x onerror=window.__builderXss=true>");

    await expect(page.locator('[data-draft-copy-block="b1"][data-draft-copy-field="body"]'))
      .toHaveValue("");
    await expect(page.locator(`${DRAFT_REVIEW} img`)).toHaveCount(0);
    await expect(page.locator(CELL)).toHaveCount(0);
    await page.locator('[data-draft-copy-block="b1"][data-draft-copy-field="body"]')
      .fill("<img src=x onerror=window.__builderXss=true>");
    await page.locator("[data-draft-confirm]").check();
    await page.locator(ACCEPT_DRAFT).click();
    const lede = page.locator(`${CELL} .lede`);
    await expect(lede).toHaveText("<img src=x onerror=window.__builderXss=true>");
    await expect(page.locator(`${CELL} img`)).toHaveCount(0);
    expect(await page.evaluate(() => (window as unknown as { __builderXss?: boolean }).__builderXss)).toBeUndefined();
  });

  test("discarding a draft leaves the current canvas and share address unchanged", async ({ page }) => {
    await page.goto(ask("An intro"));
    await waitForDesk(page);
    const urlBefore = page.url();
    await submitPrompt(page, "Build a Hearth Bakery page with an intro and a card about coffee.");
    await expect(page.locator(DRAFT_REVIEW)).toBeVisible();
    await expect(page.locator(CELL)).toHaveCount(1);
    const specBefore = JSON.parse((await page.locator('[data-surface="builder-spec"]').textContent())!);
    expect(specBefore.blocks.map((block: { id: string }) => block.id)).toEqual(["b1"]);

    await page.locator(DISCARD_DRAFT).click();
    await expect(page.locator(DRAFT_REVIEW)).toBeHidden();
    await expect(page.locator(CELL)).toHaveCount(1);
    await expect(page.locator(SAID)).toHaveText("Draft discarded. The page did not change.");
    expect(page.url()).toBe(urlBefore);
    const specAfter = JSON.parse((await page.locator('[data-surface="builder-spec"]').textContent())!);
    expect(specAfter.blocks.map((block: { id: string }) => block.id)).toEqual(["b1"]);
  });

  test("a sentence becomes a real op on a real block, through the one door", async ({ page }) => {
    await twoCardPage(page, true);
    await waitForDesk(page);
    await submitPrompt(page, "drop the second card");

    await expect(page.locator(SAID)).toHaveText("Review this edit: Drop b4.");
    await expect(page.locator(PROPOSAL)).toBeVisible();
    await expect(page.locator(PROPOSAL_COPY)).toContainText("Drop b4.");
    expect(await canvasIds(page)).toEqual(["b1", "b2", "b3", "b4"]);

    await page.locator(APPLY_PROPOSAL).click();
    await expect(page.locator(SAID)).toContainText("Applied: Drop b4.");
    await expect(page.locator(CELL)).toHaveCount(3);
    expect(await canvasIds(page)).toEqual(["b1", "b2", "b3"]);
    // the rail follows, which is the page deriving its state back off the DOM the dispatcher wrote
    await expect(page.locator(RAIL_ROW)).toHaveCount(3);
  });

  test("a wrong model target is corrected transparently and still waits for approval", async ({ page }) => {
    await twoCardPage(page, true);
    await page.evaluate(() => sessionStorage.setItem("__builderWrongTarget", "true"));
    await waitForDesk(page);
    await submitPrompt(page, "drop the second card");

    await expect(page.locator(PROPOSAL)).toBeVisible();
    await expect(page.locator(PROPOSAL_COPY)).toContainText("The model proposed Drop b2 for first card (b2)");
    await expect(page.locator(PROPOSAL_COPY)).toContainText("Your request clearly identifies Drop b4 on second card (b4)");
    await expect(page.locator(PROPOSAL_COPY)).toContainText("Review the corrected proposal");
    expect(await canvasIds(page)).toEqual(["b1", "b2", "b3", "b4"]);
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await expect(page.locator(APPLY_PROPOSAL)).toBeVisible();

    await page.locator(APPLY_PROPOSAL).click();
    await expect(page.locator(SAID)).toContainText("Applied: Drop b4.");
    expect(await canvasIds(page)).toEqual(["b1", "b2", "b3"]);
  });

  test("a clearly stated edit verb and target correct a wrong operation only after review", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await twoCardPage(page, true);
    await page.evaluate(() => {
      sessionStorage.setItem("__builderWrongTarget", "true");
      sessionStorage.setItem("__builderWrongAction", "true");
    });
    await waitForDesk(page);
    await submitPrompt(page, "drop the second card");

    await expect(page.locator(PROPOSAL)).toBeVisible();
    await expect(page.locator(PROPOSAL_COPY)).toContainText("The model proposed Set b2 to half width for first card (b2)");
    await expect(page.locator(PROPOSAL_COPY)).toContainText("Your request clearly identifies Drop b4 on second card (b4)");
    expect(await canvasIds(page)).toEqual(["b1", "b2", "b3", "b4"]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await expect(page.locator(APPLY_PROPOSAL)).toBeVisible();
    await page.locator(APPLY_PROPOSAL).click();
    await expect(page.locator(SAID)).toContainText("Applied: Drop b4.");
    expect(await canvasIds(page)).toEqual(["b1", "b2", "b3"]);
  });

  test("a declined exact-ID request becomes a disclosed recovery proposal on a phone", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await twoCardPage(page, true);
    await page.evaluate(() => sessionStorage.setItem("__builderNoAction", "true"));
    await waitForDesk(page);
    await submitPrompt(page, "drop b4");

    await expect(page.locator(PROPOSAL)).toBeVisible();
    await expect(page.locator(PROPOSAL_COPY)).toContainText("The local model did not return a usable edit: I could not identify an action.");
    await expect(page.locator(PROPOSAL_COPY)).toContainText("Your request clearly states Drop b4 on second card (b4)");
    expect(await canvasIds(page)).toEqual(["b1", "b2", "b3", "b4"]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await expect(page.locator(APPLY_PROPOSAL)).toBeVisible();

    await page.locator(APPLY_PROPOSAL).click();
    await expect(page.locator(SAID)).toContainText("Applied: Drop b4.");
    expect(await canvasIds(page)).toEqual(["b1", "b2", "b3"]);
  });

  test("common edit paraphrases become disclosed recovery proposals on a phone", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await twoCardPage(page, true);
    await page.evaluate(() => sessionStorage.setItem("__builderNoAction", "true"));
    await waitForDesk(page);

    await submitPrompt(page, "avoid getting rid of the final card");
    await expect(page.locator(SAID)).toContainText("I could not identify an action.");
    await expect(page.locator(PROPOSAL)).toBeHidden();
    expect(await canvasIds(page)).toEqual(["b1", "b2", "b3", "b4"]);

    await submitPrompt(page, "get rid of the final card");
    await expect(page.locator(PROPOSAL)).toBeVisible();
    await expect(page.locator(PROPOSAL_COPY)).toContainText("Your request clearly states Drop b4 on second card (b4)");
    expect(await canvasIds(page)).toEqual(["b1", "b2", "b3", "b4"]);
    await page.locator(APPLY_PROPOSAL).click();
    await expect(page.locator(SAID)).toContainText("Applied: Drop b4.");
    expect(await canvasIds(page)).toEqual(["b1", "b2", "b3"]);

    await page.locator('[data-block="b3"] [data-op="span:half"]').click();
    await expect(page.locator('[data-block-id="b3"]')).toHaveAttribute("data-span", "half");
    await submitPrompt(page, "let the callout span the whole row");
    await expect(page.locator(PROPOSAL)).toBeVisible();
    await expect(page.locator(PROPOSAL_COPY)).toContainText("Your request clearly states Set b3 to full width on callout (b3)");
    expect(await canvasState(page)).toEqual([
      { id: "b1", span: "full" },
      { id: "b2", span: "half" },
      { id: "b3", span: "half" },
    ]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await page.locator(APPLY_PROPOSAL).click();
    await expect(page.locator(SAID)).toContainText("Applied: Set b3 to full width.");
    expect(await canvasState(page)).toEqual([
      { id: "b1", span: "full" },
      { id: "b2", span: "half" },
      { id: "b3", span: "full" },
    ]);

    await submitPrompt(page, "shift the callout up");
    await expect(page.locator(PROPOSAL)).toBeVisible();
    await expect(page.locator(PROPOSAL_COPY)).toContainText("Your request clearly states Move b3 up on callout (b3)");
    expect(await canvasIds(page)).toEqual(["b1", "b2", "b3"]);
    await page.locator(APPLY_PROPOSAL).click();
    await expect(page.locator(SAID)).toContainText("Applied: Move b3 up.");
    expect(await canvasIds(page)).toEqual(["b1", "b3", "b2"]);

    await submitPrompt(page, "take out the callout");
    await expect(page.locator(PROPOSAL)).toBeVisible();
    await expect(page.locator(PROPOSAL_COPY)).toContainText("Your request clearly states Drop b3 on callout (b3)");
    expect(await canvasIds(page)).toEqual(["b1", "b3", "b2"]);
    await page.locator(APPLY_PROPOSAL).click();
    await expect(page.locator(SAID)).toContainText("Applied: Drop b3.");
    expect(await canvasIds(page)).toEqual(["b1", "b2"]);
  });

  test("discard and nudge paraphrases stay review-gated and reject ambiguous or negative asks", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await twoCardPage(page, true);
    await page.evaluate(() => sessionStorage.setItem("__builderNoAction", "true"));
    await waitForDesk(page);

    await submitPrompt(page, "nudge one of the cards down one step");
    await expect(page.locator(SAID)).toContainText("without a change");
    await expect(page.locator(PROPOSAL)).toBeHidden();
    expect(await canvasIds(page)).toEqual(["b1", "b2", "b3", "b4"]);

    await submitPrompt(page, "do not discard the final card");
    await expect(page.locator(SAID)).toContainText("without a change");
    await expect(page.locator(PROPOSAL)).toBeHidden();
    expect(await canvasIds(page)).toEqual(["b1", "b2", "b3", "b4"]);

    await submitPrompt(page, "nudge the callout down one step");
    await expect(page.locator(PROPOSAL)).toBeVisible();
    await expect(page.locator(PROPOSAL_COPY)).toContainText("Your request clearly states Move b3 down on callout (b3)");
    expect(await canvasIds(page)).toEqual(["b1", "b2", "b3", "b4"]);
    await page.locator(APPLY_PROPOSAL).click();
    await expect(page.locator(SAID)).toContainText("Applied: Move b3 down.");
    expect(await canvasIds(page)).toEqual(["b1", "b2", "b4", "b3"]);

    await submitPrompt(page, "discard the final card");
    await expect(page.locator(PROPOSAL)).toBeVisible();
    await expect(page.locator(PROPOSAL_COPY)).toContainText("Your request clearly states Drop b4 on second card (b4)");
    expect(await canvasIds(page)).toEqual(["b1", "b2", "b4", "b3"]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await page.locator(APPLY_PROPOSAL).click();
    await expect(page.locator(SAID)).toContainText("Applied: Drop b4.");
    expect(await canvasIds(page)).toEqual(["b1", "b2", "b3"]);
  });

  test("delete and shrink paraphrases preserve targets and spans through review", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await twoCardPage(page, true);
    await page.evaluate(() => sessionStorage.setItem("__builderNoAction", "true"));
    await waitForDesk(page);

    await submitPrompt(page, "delete the intro");
    await expect(page.locator(PROPOSAL)).toBeVisible();
    await expect(page.locator(PROPOSAL_COPY)).toContainText("Your request clearly states Drop b1 on intro paragraph (b1)");
    expect(await canvasIds(page)).toEqual(["b1", "b2", "b3", "b4"]);
    await page.locator(APPLY_PROPOSAL).click();
    await expect(page.locator(SAID)).toContainText("Applied: Drop b1.");
    expect(await canvasIds(page)).toEqual(["b2", "b3", "b4"]);

    await submitPrompt(page, "shrink the callout to a third width");
    await expect(page.locator(PROPOSAL)).toBeVisible();
    await expect(page.locator(PROPOSAL_COPY)).toContainText("Your request clearly states Set b3 to third width on callout (b3)");
    await expect(page.locator('[data-block-id="b3"]')).toHaveAttribute("data-span", "full");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await page.locator(APPLY_PROPOSAL).click();
    await expect(page.locator(SAID)).toContainText("Applied: Set b3 to third width.");
    await expect(page.locator('[data-block-id="b3"]')).toHaveAttribute("data-span", "third");
  });

  test("erase and reposition paraphrases stay review-gated and reach the named blocks", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await twoCardPage(page, true);
    await page.evaluate(() => sessionStorage.setItem("__builderNoAction", "true"));
    await waitForDesk(page);

    await submitPrompt(page, "reposition the callout down one step");
    await expect(page.locator(PROPOSAL)).toBeVisible();
    await expect(page.locator(PROPOSAL_COPY)).toContainText("Your request clearly states Move b3 down on callout (b3)");
    expect(await canvasIds(page)).toEqual(["b1", "b2", "b3", "b4"]);
    await page.locator(APPLY_PROPOSAL).click();
    await expect(page.locator(SAID)).toContainText("Applied: Move b3 down.");
    expect(await canvasIds(page)).toEqual(["b1", "b2", "b4", "b3"]);

    await submitPrompt(page, "erase the final card");
    await expect(page.locator(PROPOSAL)).toBeVisible();
    await expect(page.locator(PROPOSAL_COPY)).toContainText("Your request clearly states Drop b4 on second card (b4)");
    expect(await canvasIds(page)).toEqual(["b1", "b2", "b4", "b3"]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await page.locator(APPLY_PROPOSAL).click();
    await expect(page.locator(SAID)).toContainText("Applied: Drop b4.");
    expect(await canvasIds(page)).toEqual(["b1", "b2", "b3"]);
  });

  test("a malformed model move becomes a disclosed proposal only for a clear live request", async ({ page }) => {
    await twoCardPage(page, true);
    await page.evaluate(() => sessionStorage.setItem("__builderMalformed", "true"));
    await waitForDesk(page);
    await submitPrompt(page, "drop the second card");

    await expect(page.locator(PROPOSAL)).toBeVisible();
    await expect(page.locator(PROPOSAL_COPY)).toContainText("The local model did not return a usable edit:");
    await expect(page.locator(PROPOSAL_COPY)).toContainText("Your request clearly states Drop b4 on second card (b4)");
    expect(await canvasIds(page)).toEqual(["b1", "b2", "b3", "b4"]);
    await page.locator(APPLY_PROPOSAL).click();
    await expect(page.locator(SAID)).toContainText("Applied: Drop b4.");
    expect(await canvasIds(page)).toEqual(["b1", "b2", "b3"]);
  });

  test("a model cannot turn a missing named block into a different block removal", async ({ page }) => {
    await page.goto(ask("An intro and two cards"));
    await expect(page.locator(CELL)).toHaveCount(3);
    await waitForDesk(page);
    await submitPrompt(page, "drop the callout");

    await expect(page.locator(SAID)).toHaveText("The request names callout, but no matching block is on the page. Nothing changed.");
    await expect(page.locator(PROPOSAL)).toBeHidden();
    expect(await canvasIds(page)).toEqual(["b1", "b2", "b3"]);
  });

  test("the model is handed the ids that are actually on the page", async ({ page }) => {
    await twoCardPage(page, true);
    await page.locator('[data-block="b3"] [data-op="span:half"]').click();
    await waitForDesk(page);
    // Seeding the page now uses the same local model seam as build prompts, so clear its captured
    // request before checking that the following edit includes the live block IDs.
    await page.evaluate(() => sessionStorage.removeItem("__builderPrompt"));
    await submitPrompt(page, "make the callout full");
    await expect(page.locator('[data-block="b3"] [data-op="span:half"]')).toHaveAttribute("data-on", "on");

    // The callout starts half width so the approved span edit has a visible result. The test still
    // waits for the recorded prompt before reading it, because the prompt is what this scenario
    // measures and the model answer may arrive later on a loaded machine.
    await page.waitForFunction(() => sessionStorage.getItem("__builderPrompt") !== null);
    // A 0.5B copies far better than it counts, so the prompt names the blocks rather than leaving
    // "the second card" to be filtered and counted.
    const prompt = await page.evaluate(() => sessionStorage.getItem("__builderPrompt") ?? "");
    expect(prompt).toContain("b1 (intro paragraph), b2 (first card), b3 (callout), b4 (second card)");
    expect(prompt).toContain("block.remove");
    await expect(page.locator(SAID)).toHaveText("Review this edit: Set b3 to full width.");
    await page.locator(APPLY_PROPOSAL).click();
    await expect(page.locator(SAID)).toContainText("Applied: Set b3 to full width.");
    await expect(page.locator('[data-block="b3"] [data-op="span:full"]')).toHaveAttribute("data-on", "on");
  });

  test("canceling a proposal leaves the canvas unchanged", async ({ page }) => {
    await twoCardPage(page, true);
    await waitForDesk(page);
    await submitPrompt(page, "drop the second card");
    await expect(page.locator(PROPOSAL)).toBeVisible();

    await page.locator(CANCEL_PROPOSAL).click();
    await expect(page.locator(PROPOSAL)).toBeHidden();
    await expect(page.locator(SAID)).toHaveText("Canceled. The page did not change.");
    expect(await canvasIds(page)).toEqual(["b1", "b2", "b3", "b4"]);
  });

  test("an approved move is reported after the observed order changes", async ({ page }) => {
    await twoCardPage(page, true);
    await waitForDesk(page);
    await submitPrompt(page, "move the callout up");
    await expect(page.locator(PROPOSAL_COPY)).toContainText("Move b3 up.");
    expect(await canvasIds(page)).toEqual(["b1", "b2", "b3", "b4"]);

    await page.locator(APPLY_PROPOSAL).click();
    await expect(page.locator(SAID)).toContainText("Applied: Move b3 up.");
    expect(await canvasIds(page)).toEqual(["b1", "b3", "b2", "b4"]);
  });

  test("a proposal is canceled when the canvas changes before approval", async ({ page }) => {
    await twoCardPage(page, true);
    await waitForDesk(page);
    await submitPrompt(page, "drop the second card");
    await expect(page.locator(PROPOSAL)).toBeVisible();

    await page.locator('[data-block="b2"] [data-op="remove"]').click();
    await expect(page.locator(PROPOSAL)).toBeHidden();
    await expect(page.locator(SAID)).toHaveText("The page changed. The pending suggestion was canceled.");
    expect(await canvasIds(page)).toEqual(["b1", "b3", "b4"]);
  });

  // Three things grain's validation catches, and one it does not. The last is the important one:
  // "wide" is a string where a string was required, so validateMove passes it and only the closed
  // word list stops it before the page announces a change it is not going to make.
  //
  // The expected strings changed on 2026-08-15 and the reason is the point of the assertion. The
  // first two used to read "will not work here", the prefix on grain's own console reason, so the
  // line a visitor got was `no surface "b9" on this screen`. Each refusal now says which refusal it
  // is in words, and grain's sentence still goes to the console through `because`. What is asserted
  // is the visitor's half; block-reasoner.test.ts asserts that the developer's half stayed out of it.
  for (const [what, prompt, expected] of [
    ["a verb that does not exist", "duplicate the card", "not a change anything on this page can make"],
    ["a block that is not here", "drop the ninth card", "not on this page. The blocks here are b1, b2, b3 and b4"],
    ["a width outside the three", "widen the card", "full, half or third"],
  ] as const) {
    test(`${what} is refused and nothing moves`, async ({ page }) => {
      await twoCardPage(page, true);
      await submitPrompt(page, prompt);
      await expect(page.locator(SAID)).toContainText(expected);
      expect(await canvasIds(page)).toEqual(["b1", "b2", "b3", "b4"]);
    });
  }

  test("copy-field edits cannot reach a destructive model choice", async ({ page }) => {
    await twoCardPage(page, true);
    await page.evaluate(() => sessionStorage.removeItem("__builderPrompt"));
    for (const prompt of [
      "the card should mention pricing",
      "remove the price from the card",
      "move the price down in the card",
      "remove the title from b3",
      "remove the subtitle from the card",
      "delete the CTA from the callout",
      "take the pricing line out of the card",
      "remove the image from the card",
      "shorten the body on the card",
      "make the card shorter",
      "make the intro friendlier",
      "trim the callout down to one line",
      "remove the card's price",
      "delete the title on the second card",
      "take the subtitle off the callout",
      "get rid of the card logo",
      "remove the opening hours from the bakery card",
      "remove card caption",
      "shorten second card description",
      "take the callout text out",
      "remove its headline",
      "delete the icon next to the title in the first card",
      "edit caption",
      "shorten the title",
      "change the page headline",
      "make title more concise",
      "add a price to the card",
      "put a caption on the card",
      "set card title to Cafe",
      "give the card a clearer headline",
      "add text to card",
      "move the image to the top card",
      "turn the card title into a button",
      "delete the title",
      "remove the CTA",
      "move the image to the top",
      "make the title bigger",
      "write the title",
    ]) {
      await submitPrompt(page, prompt);
      await expect(page.locator(SAID)).toContainText("cannot revise block copy yet");
      expect(await canvasIds(page)).toEqual(["b1", "b2", "b3", "b4"]);
    }
    expect(await page.evaluate(() => sessionStorage.getItem("__builderPrompt"))).toBeNull();
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
    await expect(page.locator('.wb__rail [data-field="blockCount"]')).toHaveText("5 blocks");
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
    await expect(page.locator(RAIL_ROW)).toHaveCount(3);
  });
});

// ---------------------------------------------------------------------------------------------
// P4: take it away, and bring it back
// ---------------------------------------------------------------------------------------------
// The round trip is the claim, so the round trip is what these drive: a page is built, the JSON is
// downloaded, a FRESH page opens it, and the two canvases are compared as markup. A test that only
// checked the download happened would not be testing the claim.
//
// Both sides are composed by the BROWSER on purpose. A server-rendered canvas and a browser-cloned
// one carry the same contract and not the same whitespace, so comparing one of each would be a test
// about line breaks. Building both the same way makes the comparison mean what it says.
const TAKE = ".wb__take";
const PICKER = ".wb__take-file";

/** Press one of the three export buttons and hand back what came down. */
async function exportFile(page: Page, which: string): Promise<{ name: string; body: string }> {
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.locator(`${TAKE} [data-export="${which}"]`).click(),
  ]);
  const path = await download.path();
  return { name: download.suggestedFilename(), body: await readFile(path, "utf8") };
}

/** Build a page the way a visitor builds one: type it, press the button, let the browser compose. */
async function build(page: Page, prompt: string): Promise<void> {
  await page.goto("/grain/builder");
  await page.locator(COMPOSER).fill(prompt);
  await page.locator(SUBMIT).click();
  await expect(page.locator(CELL).first()).toBeVisible();
}

test.describe("taking the page away", () => {
  test("there is nothing to export until there is something on the page", async ({ page }) => {
    await page.goto("/grain/builder");
    await expect(page.locator(`${TAKE} [data-export="json"]`)).toBeHidden();
    // Open is not in that group, because reading a composition in is exactly what you do to a page
    // with nothing on it yet.
    await expect(page.locator(`${TAKE} [data-import]`)).toBeVisible();

    await page.locator(COMPOSER).fill("an intro and a card");
    await page.locator(SUBMIT).click();
    await expect(page.locator(`${TAKE} [data-export="json"]`)).toBeVisible();
  });

  test("the JSON is the composition, and it says it was made with GRAIN", async ({ page }) => {
    await build(page, "an intro, two cards side by side, and a callout");
    const file = await exportFile(page, "json");
    expect(file.name).toBe("untitled.json");
    const doc = JSON.parse(file.body);
    expect(doc.madeWith).toBe("made with GRAIN by tjakoen");
    expect(doc.blocks.map((b: { component: string }) => b.component))
      .toEqual(["block-lede", "block-card", "block-card", "block-callout"]);
  });

  // THE round trip. Export, open it on a page that has never seen the prompt, and compare the two
  // canvases as markup. Byte-identical or it is not the same page.
  test("a page exported and opened again is the same page, markup for markup", async ({ page }) => {
    await build(page, "an intro, a card, a callout and a stat");
    const before = await page.locator(CANVAS).innerHTML();
    const file = await exportFile(page, "json");

    await page.goto("/grain/builder");
    await expect(page.locator(CELL)).toHaveCount(0);
    await page.locator(PICKER).setInputFiles({ name: file.name, mimeType: "application/json", buffer: Buffer.from(file.body) });

    await expect(page.locator(CELL)).toHaveCount(4);
    expect(await page.locator(CANVAS).innerHTML()).toBe(before);
    // and the rail followed it, which is what makes the opened page operable rather than a picture
    await expect(page.locator(RAIL_ROW)).toHaveCount(4);
  });

  test("a form survives the trip with every control it had", async ({ page }) => {
    await build(page, "a contact form with a name, an email and what they want to talk about");
    const file = await exportFile(page, "json");

    await page.goto("/grain/builder");
    await page.locator(PICKER).setInputFiles({ name: file.name, mimeType: "application/json", buffer: Buffer.from(file.body) });
    await expect(page.locator(`${CELL} form[data-surface="builder-form"]`)).toHaveCount(1);
    await expect(page.locator('[data-surface="field:builder-name"]')).toHaveCount(1);
    await expect(page.locator('[data-surface="field:builder-topic"]')).toHaveCount(1);
  });

  test("the rendered page is a whole document, carrying grain's stylesheet and the byline", async ({ page }) => {
    await build(page, "an intro, a card and a stat");
    const file = await exportFile(page, "page");
    expect(file.name).toBe("untitled.html");
    expect(file.body).toContain("<!DOCTYPE html>");
    expect(file.body).toContain("/styles/variables.css");
    expect(file.body).toContain("/components.css");
    expect(file.body).toContain('data-made-with="GRAIN"');
    expect(file.body).toContain('<footer class="made-with">');
    expect(file.body).toContain("<!-- made with GRAIN by tjakoen -->");
    // grain's own markup, and three cells that know how wide they are
    expect(file.body).toContain('class="card__title"');
    expect([...file.body.matchAll(/class="canvas__cell"/g)]).toHaveLength(3);
  });

  test("the tag source is the markup on its own, with the builder's fingerprints off it", async ({ page }) => {
    await build(page, "an intro, a card and a callout");
    const file = await exportFile(page, "tags");
    expect(file.name).toBe("untitled.tags.html");
    expect(file.body).not.toContain("<!DOCTYPE");
    expect(file.body).toContain('<div class="canvas" data-made-with="GRAIN">');
    expect(file.body).toContain('<blockquote class="callout">');
    // An exported page ships no dispatcher, so an address on it would advertise an operation
    // nothing can perform. Off they come, along with the directives that fill a cloned block.
    for (const gone of ["data-surface", "data-block-id", "data-field=", "data-bind-"]) {
      expect(file.body).not.toContain(gone);
    }
  });
});

test.describe("opening one back in, honestly", () => {
  test("opening replaces the canvas rather than adding to it, and drops the prompt from the address", async ({ page }) => {
    await build(page, "an intro, a card, a callout and a stat");
    const file = await exportFile(page, "json");

    await build(page, "a stat");
    await expect(page.locator(CELL)).toHaveCount(1);
    await page.locator(PICKER).setInputFiles({ name: file.name, mimeType: "application/json", buffer: Buffer.from(file.body) });

    await expect(page.locator(CELL)).toHaveCount(4);
    expect(new URL(page.url()).search).toBe("");
    await expect(page.locator(COMPOSER)).toHaveValue("");
  });

  // The honest import: a hand-edited file degrades to the blocks that survive, each casualty named,
  // rather than to a thrown error or a page with silent holes in it.
  test("a hand-edited file loses the block this build cannot render, by name, and keeps the rest", async ({ page }) => {
    const doc = {
      version: 1,
      blocks: [
        { id: "b1", component: "block-lede", span: "full", data: { body: "An opening line." }, props: {} },
        { id: "b2", component: "block-hologram", span: "full", data: {}, props: {} },
        { id: "b3", component: "block-stat", span: "third", data: { value: "3", label: "blocks", sub: "two of them real" }, props: {} },
      ],
    };
    await page.goto("/grain/builder");
    await page.locator(PICKER).setInputFiles({ name: "hand-edited.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(doc)) });

    await expect(page.locator(CELL)).toHaveCount(2);
    const refusal = page.locator('[data-surface="builder-refusals"] li');
    await expect(refusal).toHaveCount(1);
    await expect(refusal).toContainText("block-hologram");
    await expect(page.locator(SAID)).toContainText("1 refused");
  });

  test("a file that is not JSON says so and changes nothing", async ({ page }) => {
    await build(page, "an intro and a card");
    const before = await page.locator(CANVAS).innerHTML();
    await page.locator(PICKER).setInputFiles({ name: "notes.json", mimeType: "application/json", buffer: Buffer.from("this is not JSON at all") });

    await expect(page.locator(SAID)).toContainText("is not JSON");
    await expect(page.locator(SAID)).toHaveAttribute("data-read", "refusal");
    expect(await page.locator(CANVAS).innerHTML()).toBe(before);
  });

  // Opening the wrong file is a mistake anyone makes. A builder that answers it by emptying the page
  // you spent ten minutes on has turned a misclick into lost work.
  test("a file with nothing renderable in it leaves the page exactly as it was", async ({ page }) => {
    await build(page, "an intro and a card");
    const before = await page.locator(CANVAS).innerHTML();
    const doc = { version: 1, blocks: [{ id: "b1", component: "block-hologram", span: "full", data: {}, props: {} }] };
    await page.locator(PICKER).setInputFiles({ name: "wrong.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(doc)) });

    await expect(page.locator(SAID)).toContainText("The page is as you left it");
    expect(await page.locator(CANVAS).innerHTML()).toBe(before);
  });

  test("an opened page is still a page you can operate", async ({ page }) => {
    await build(page, "an intro, a card, a callout and a stat");
    const file = await exportFile(page, "json");

    await page.goto("/grain/builder");
    await page.locator(PICKER).setInputFiles({ name: file.name, mimeType: "application/json", buffer: Buffer.from(file.body) });
    await expect(page.locator(CELL)).toHaveCount(4);

    await page.locator('[data-block="b2"] [data-op="remove"]').click();
    await expect(page.locator(CELL)).toHaveCount(3);
    // and a prompt after an open adds to what was opened, with an id that cannot collide with it
    await page.locator(COMPOSER).fill("a callout");
    await page.locator(SUBMIT).click();
    await expect(page.locator(CELL)).toHaveCount(4);
    await expect(page.locator(`${RAIL_ROW}`).last()).toContainText("b5");
  });
});

// ---------------------------------------------------------------------------------------------
// Undo
// ---------------------------------------------------------------------------------------------
// This is the one control on the page that exists because of a MEASUREMENT rather than a design.
// On 2026-08-19 the live model, asked for a change no verb can serve, reached for a verb anyway and
// removed a block nobody had mentioned, once in four tries. The guard that would have forbidden it
// was written and measured too, and it took the one edit the model does land with it. So a wrong
// drop is made reversible instead of impossible, and these tests are what says it stays that way.
//
// Driven through the RAIL rather than the model, deliberately. The e2e suite is model-offline by
// design, and undo does not care what produced the change: the handshake records before it adopts
// the DOM's new shape, so a desk drop and a press take the same path through the stack.
test.describe("undo", () => {
  test("the button is absent until there is something behind it", async ({ page }) => {
    await page.goto(ask("An intro, a card and a callout"));
    await expect(page.locator(CELL)).toHaveCount(3);
    await expect(page.locator("[data-undo]")).toBeHidden();
  });

  test("a dropped block comes back with its content, not as a placeholder", async ({ page }) => {
    await page.goto(ask("An intro, a card and a callout"));
    const before = await page.locator(CELL).allInnerTexts();

    await page.locator(`${RAIL_ROW}[data-block="b2"] [data-op="remove"]`).click();
    await expect(page.locator(CELL)).toHaveCount(2);
    await expect(page.locator("[data-undo]")).toBeVisible();

    await page.locator("[data-undo]").click();
    await expect(page.locator(CELL)).toHaveCount(3);
    // The whole claim. A stack of compositions restores the block's DATA; an inverse-op log would
    // have had to guess it back, and guessing is what readComposition refuses to do.
    expect(await page.locator(CELL).allInnerTexts()).toEqual(before);
  });

  test("it covers a width as well as a drop", async ({ page }) => {
    await page.goto(ask("An intro, a card and a callout"));
    const spans = () => page.locator(CELL).evaluateAll((els) => els.map((e) => e.getAttribute("data-span")));
    const before = await spans();

    await page.locator(`${RAIL_ROW}[data-block="b3"] [data-op="span:half"]`).click();
    expect(await spans()).not.toEqual(before);

    await page.locator("[data-undo]").click();
    expect(await spans()).toEqual(before);
  });

  test("the button goes away again once the stack is empty", async ({ page }) => {
    await page.goto(ask("An intro, a card and a callout"));
    await page.locator(`${RAIL_ROW}[data-block="b2"] [data-op="remove"]`).click();
    await page.locator("[data-undo]").click();
    await expect(page.locator("[data-undo]")).toBeHidden();
  });

  // A press that changes nothing must not fill the stack, or undo would have to be pressed twice to
  // get past a no-op and the second press would land somewhere the visitor did not expect.
  test("a press that changes nothing records nothing", async ({ page }) => {
    await page.goto(ask("An intro, a card and a callout"));
    // b1 is already full width, and it is the first row, so neither of these moves anything.
    await page.locator(`${RAIL_ROW}[data-block="b1"] [data-op="span:full"]`).click();
    await page.locator(`${RAIL_ROW}[data-block="b1"] [data-op="move:up"]`).click();
    await expect(page.locator("[data-undo]")).toBeHidden();
  });
});

// ---------------------------------------------------------------------------------------------
// P5: the preview route
// ---------------------------------------------------------------------------------------------
// A REAL ROUTE rather than a framed sandbox, which was the owner's call on 2026-08-19 out of the two
// the sandbox plan left open. So these tests check the three things a route buys that a frame does
// not: it is an address you can open cold, it carries the prompt, and the export freezes it.
test.describe("the preview route", () => {
  const PREVIEW_STAGE = '[data-surface="builder-preview-canvas"]';
  const PREVIEW_MARKUP = '[data-surface="builder-preview-markup"]';

  test("opening the address cold composes from the prompt it carries", async ({ page }) => {
    await page.goto(`/grain/builder/preview?ask=${encodeURIComponent("An intro, a card and a callout")}`);
    await expect(page.locator(`${PREVIEW_STAGE} > *`)).toHaveCount(3);
    await expect(page.locator(".preview-empty")).toBeHidden();
  });

  test("the workbench hands over the canvas, so an edit the address cannot carry survives", async ({ page, context }) => {
    await page.goto(ask("An intro, a card and a callout"));
    await page.locator(`${RAIL_ROW}[data-block="b2"] [data-op="remove"]`).click();
    await expect(page.locator(CELL)).toHaveCount(2);

    const [preview] = await Promise.all([context.waitForEvent("page"), page.locator("[data-preview]").click()]);
    await preview.waitForLoadState("networkidle");

    // Two, not three. Three would mean the handover was lost and the preview fell back to the
    // prompt in the address, which is the bug that sent this from session storage to local: a tab
    // opened with noopener does not inherit its opener's session storage.
    await expect(preview.locator(`${PREVIEW_STAGE} > *`)).toHaveCount(2);

    // Read once. A handover left behind would show up as somebody's stale page later.
    expect(await preview.evaluate(() => localStorage.getItem("portfolio.builder.preview"))).toBeNull();
  });

  test("the switch shows the markup without fetching anything", async ({ page }) => {
    await page.goto(`/grain/builder/preview?ask=${encodeURIComponent("An intro and a card")}`);
    await expect(page.locator(PREVIEW_MARKUP)).toBeHidden();

    // Both views ship in the document, so this must not put a request on the wire.
    let requests = 0;
    page.on("request", () => { requests += 1; });
    await page.locator('[data-view="markup"]').click();

    await expect(page.locator(PREVIEW_MARKUP)).toBeVisible();
    await expect(page.locator(PREVIEW_STAGE)).toBeHidden();
    expect(requests).toBe(0);
    expect(await page.locator(PREVIEW_MARKUP).innerText()).toContain("canvas__cell");
  });

  test("the markup pane is there with the script off", async ({ browser }) => {
    // The toggle needs a script. Having something to toggle TO does not, so the source ships filled.
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto(`/grain/builder/preview?ask=${encodeURIComponent("An intro and a card")}`);
    expect(await page.locator(PREVIEW_MARKUP).innerHTML()).toContain("canvas__cell");
    await ctx.close();
  });

  // The sandbox plan's fifth piece, and it is a default rather than a mechanism: the pane is already
  // sitewide. Asserted on the SSR state rather than after a click, because the point of doing it on
  // the server was that the chat pane never flashes first.
  test("the catalog pane is the one that is open", async ({ page }) => {
    await page.goto(`/grain/builder/preview?ask=${encodeURIComponent("a card")}`);
    await expect(page.locator(".assistant")).toHaveAttribute("data-mode", "catalog");
    await expect(page.locator('[data-shell-mode="catalog"]')).toHaveAttribute("aria-selected", "true");
    await expect(page.locator('.assistant__pane[data-pane="catalog"]')).toBeVisible();
  });

  test("an empty preview says so rather than showing a blank stage", async ({ page }) => {
    await page.goto("/grain/builder/preview");
    await expect(page.locator(".preview-empty")).toBeVisible();
    await expect(page.locator("[data-preview-example]")).toHaveAttribute(
      "href",
      "/grain/builder?ask=An%20intro%2C%20two%20cards%20side%20by%20side%2C%20and%20a%20callout",
    );
    await expect(page.locator(`${PREVIEW_STAGE} > *`)).toHaveCount(0);
  });

  // THE KNOWN LIMIT, pinned so it stays known. On a static host this page is a frozen file with no
  // block templates on it, so a prompt in a shared address composes nothing here even though the
  // same prompt still composes on the workbench, which P3 gave a hidden library for. Measured
  // against the real export before it was written down, and said on the page in those words.
  //
  // Asserted rather than left implicit because the failure is invisible from the live server, where
  // every one of these tests passes and the link works. If somebody later carries the library onto
  // this page, this test goes red, and that is the correct alarm rather than a surprise.
  test("on a static host a shared link arrives empty, and the page says so", async ({ page }) => {
    await pretendStaticHost(page);
    await page.goto(`/grain/builder/preview?ask=${encodeURIComponent("An intro and a card")}`);
    await expect(page.locator(`${PREVIEW_STAGE} > *`)).toHaveCount(0);
    await expect(page.locator(".preview-empty")).toBeVisible();
    await expect(page.locator(".preview-note")).toContainText("frozen file");
  });
});
