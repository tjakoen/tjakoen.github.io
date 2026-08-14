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
// D3b: the MODEL chooses the verb, and code decides whether it was allowed to.
//
// Two describes, because there are two honest states. Without a desk there is no model, and the page
// says so rather than reaching for something that is not one: that is the owner's call of
// 2026-08-14 and it is what the first block pins. With a scripted model the whole chain runs, and
// nothing below applies an op by hand — the prompt bar is the only thing touched, so a pass means
// the router asked, grain built the prompt, the model answered, grain validated it against the live
// manifest, the door took the Intent, the dispatcher moved the DOM, and the page read its
// composition back off it.
const SAID = '[data-surface="builder-said"]';

const submitPrompt = async (page: Page, prompt: string): Promise<void> => {
  await page.locator(COMPOSER).fill(prompt);
  await page.locator(SUBMIT).click();
};

const canvasIds = (page: Page) => page.locator(CELL).evaluateAll(
  (cells) => cells.map((c) => (c as HTMLElement).dataset.blockId));

/** A page holding TWO cards, which takes two prompts: one description emits each block at most once,
 *  so "two cards" is one card block at half span. That is the shape this phase is named after,
 *  because "drop the second card" only means anything where a second card exists.
 *  Ends as b1 lede, b2 card, b3 callout, b4 card. */
async function twoCardPage(page: Page): Promise<void> {
  await page.goto(ask("An intro, a card and a callout"));
  await expect(page.locator(CELL)).toHaveCount(3);
  await submitPrompt(page, "another card");
  await expect(page.locator(CELL)).toHaveCount(4);
}

test.describe("with no desk, the page says so instead of guessing", () => {
  test("a description still composes, because building never needed a model", async ({ page }) => {
    await twoCardPage(page);
    await submitPrompt(page, "a stat");
    await expect(page.locator(CELL)).toHaveCount(5);
    await expect(page.locator(SAID)).toBeHidden();
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
export async function loadEngine({ onProgress }) { onProgress?.({ progress: 1, text: "fake engine ready" }); return { fake: true }; }
`;

// makeChatModel is the seam /builder uses (desk-reasoner's `complete`). The scripted answers below
// include the ones a small model really gets wrong: a verb that does not exist, a block that is not
// on the page, and a width outside the closed three.
const MODEL_CHAT_STUB = `
export async function* streamChat() { yield "unused"; }
export function makeChatModel() {
  return {
    async complete(prompt) {
      sessionStorage.setItem("__builderPrompt", prompt);
      if (/drop the second card/i.test(prompt)) return '{"action":"block.remove","target":"block:b4"}';
      if (/make the callout full/i.test(prompt)) return 'Sure!\\n{"action":"block.span","target":"block:b3","payload":{"span":"full"}}';
      if (/move the form up/i.test(prompt)) return '{"action":"block.move","target":"block:b3","payload":{"direction":"up"}}';
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

  test("a sentence becomes a real op on a real block, through the one door", async ({ page }) => {
    await twoCardPage(page);
    await submitPrompt(page, "drop the second card");

    await expect(page.locator(SAID)).toHaveText("Dropping b4.");
    await expect(page.locator(CELL)).toHaveCount(3);
    expect(await canvasIds(page)).toEqual(["b1", "b2", "b3"]);
    // the rail follows, which is the page deriving its state back off the DOM the dispatcher wrote
    await expect(page.locator(RAIL_ROW)).toHaveCount(3);
  });

  test("the model is handed the ids that are actually on the page", async ({ page }) => {
    await twoCardPage(page);
    await submitPrompt(page, "make the callout full");
    await expect(page.locator('[data-block="b3"] [data-op="span:full"]')).toHaveAttribute("data-on", "on");

    // A 0.5B copies far better than it counts, so the prompt names the blocks rather than leaving
    // "the second card" to be filtered and counted.
    const prompt = await page.evaluate(() => sessionStorage.getItem("__builderPrompt") ?? "");
    expect(prompt).toContain("b1, b2, b3, b4");
    expect(prompt).toContain("block.remove");
  });

  // Three things grain's validation catches, and one it does not. The last is the important one:
  // "wide" is a string where a string was required, so validateMove passes it and only the closed
  // word list stops it before the page announces a change it is not going to make.
  for (const [what, prompt, expected] of [
    ["a verb that does not exist", "duplicate the card", "will not work here"],
    ["a block that is not here", "drop the ninth card", "will not work here"],
    ["a width outside the three", "widen the card", "full, half, third"],
  ] as const) {
    test(`${what} is refused and nothing moves`, async ({ page }) => {
      await twoCardPage(page);
      await submitPrompt(page, prompt);
      await expect(page.locator(SAID)).toContainText(expected);
      expect(await canvasIds(page)).toEqual(["b1", "b2", "b3", "b4"]);
    });
  }

  test("the model may answer without acting, and that is not a failure", async ({ page }) => {
    await twoCardPage(page);
    await submitPrompt(page, "the card should mention pricing");
    await expect(page.locator(SAID)).toContainText("no verb that rewrites");
    expect(await canvasIds(page)).toEqual(["b1", "b2", "b3", "b4"]);
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
