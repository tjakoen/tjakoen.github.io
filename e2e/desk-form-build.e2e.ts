// tjakoen.github.io/e2e/desk-form-build.e2e.ts — D1 FORM BUILDER DEMO. Same headless-Chromium-has-
// no-WebGPU setup as desk-contact-prefill.e2e.ts: every path here is DETERMINISTIC (actions.ts's
// form-build routing, field-matcher.ts's matchSpec, form-draft.ts's demo values, desk-reasoner.ts's
// handler, and desk-door.ts's desk-form-task stash + runFormTask for the cross-page fill) — zero
// model, no download, no generation. The desk never picks a field: matchSpec's closed set does, and
// the assertions below pin the ONE hazard this feature is built around — a `<select>` (the topic
// choice) is never a fill target, only the TEXT fields are.
import { test, expect, type Page } from "@playwright/test";

const DESK_DOOR = "/modules/portfolio/ai/desk-door.js";
const ASK = "build me a form that asks for a name, an email and what they want to talk about";
const NAME_FIELD = '[data-surface="field:builder-name"]';
const EMAIL_FIELD = '[data-surface="field:builder-email"]';
// The topic select carries its own address since grain 0.1.22 moved every surface onto the control.
// It is still never a fill target: form-draft.ts refuses to draft a value for a choice, because a
// select accepts the write and empties itself on anything that is not an option value. So the select
// is located by its address AND asserted untouched, which is the pairing that keeps meaning something.
const TOPIC_SELECT = 'select[data-surface="field:builder-topic"]';
// The message box, added 2026-08-13: matchSpec used to REFUSE this ask because grain had no textarea
// rule. It renders through b-memo now, and unlike the select it IS a fill target — the dispatcher
// types into INPUT and TEXTAREA through one branch, and no string a caller sends can empty it.
const MESSAGE_ASK =
  "build me a form that asks for a name, an email, a big message box and what they want to talk about";
const MESSAGE_BOX = 'textarea[data-surface="field:builder-message"]';

async function clientDeskEverywhere(page: Page) {
  await page.route("**/*", async (route, req) => {
    if (req.resourceType() !== "document") return route.continue();
    const res = await route.fetch();
    if (!(res.headers()["content-type"] || "").includes("text/html")) return route.fulfill({ response: res });
    const html = (await res.text()).replace(/<body\b/, `<body data-ai-transport="client" data-ai-door="${DESK_DOOR}"`);
    return route.fulfill({ response: res, body: html });
  });
  await page.addInitScript(() => {   // force the no-WebGPU (offline model) path deterministically
    try { Object.defineProperty(navigator, "gpu", { value: undefined, configurable: true }); } catch { /* absent */ }
  });
}

const ask = (page: Page, text: string) =>
  page.evaluate((t) => (window as unknown as { grain: { door: { submit(a: string, s: string, p: unknown): void } } })
    .grain.door.submit("chat.send", "chat-log", { text: t }), text);

async function deskReady(page: Page) {
  await page.waitForFunction(() => Boolean((window as unknown as { grain?: { door?: unknown } }).grain?.door));
  await expect(page.locator("body")).toHaveAttribute("data-ai-online", "true");   // the client door came up
}

test.describe("D1 form builder demo (deterministic, no model needed)", () => {
  test("from '/': navigates to /builder?ask=..., the form renders, and the TEXT fields fill in — the select stays untouched", async ({ page }) => {
    await clientDeskEverywhere(page);
    await page.goto("/");
    await deskReady(page);

    await ask(page, ASK);

    await page.waitForURL(/\/builder\?ask=/);
    expect(new URL(page.url()).pathname).toBe("/builder");
    expect(new URL(page.url()).searchParams.get("ask")).toBe(ASK);

    // the closed set rendered exactly what matchSpec decided: name + email fields, a topic choice.
    await expect(page.locator(NAME_FIELD)).toBeVisible();
    await expect(page.locator(EMAIL_FIELD)).toBeVisible();
    await expect(page.locator(TOPIC_SELECT)).toBeVisible();

    // the TEXT fields fill in with the drafted demo values and carry grain ink (AI provenance).
    await expect(page.locator(NAME_FIELD)).toHaveValue("Ada Rivers", { timeout: 15_000 });
    await expect(page.locator(NAME_FIELD)).toHaveAttribute("data-grade", "grain");
    await expect(page.locator(EMAIL_FIELD)).toHaveValue("ada.rivers@example.com");
    await expect(page.locator(EMAIL_FIELD)).toHaveAttribute("data-grade", "grain");

    // the select was NEVER a fill target — hazard #1 (field.set on a <select> silently blanks it).
    // It still carries matchSpec's own default ("other" — "Something else") and no AI ink at all.
    await expect(page.locator(TOPIC_SELECT)).toHaveValue("other");
    await expect(page.locator(TOPIC_SELECT)).not.toHaveAttribute("data-grade", "grain");
    // and the addressing rule itself is asserted, because it is what the atoms got wrong once: every
    // field address sits on a control that can actually be written to, never on the label around it.
    await expect(page.locator('label[data-surface]')).toHaveCount(0);
    await expect(page.locator('input[data-surface^="field:builder-"]')).toHaveCount(2);

    // the desk never submits: no form action exists here, and no navigation happened beyond /builder.
    expect(new URL(page.url()).pathname).toBe("/builder");
  });

  test("a message box is generated AND filled: a textarea takes the same fill path as a text field", async ({ page }) => {
    await clientDeskEverywhere(page);
    await page.goto("/");
    await deskReady(page);

    await ask(page, MESSAGE_ASK);

    await page.waitForURL(/\/builder\?ask=/);
    await expect(page.locator(MESSAGE_BOX)).toBeVisible();
    // it is a real multi-line box, not a text input wearing the label — the whole point of the atom
    await expect(page.locator(MESSAGE_BOX)).toHaveAttribute("rows", "6");
    // and the desk writes into it, carrying the same grain ink every other filled control gets
    await expect(page.locator(MESSAGE_BOX)).toHaveValue(/GRAIN write-up/, { timeout: 15_000 });
    await expect(page.locator(MESSAGE_BOX)).toHaveAttribute("data-grade", "grain");
    // the select is still never a fill target, even with a message box in the same run
    await expect(page.locator(TOPIC_SELECT)).toHaveValue("other");
    await expect(page.locator(TOPIC_SELECT)).not.toHaveAttribute("data-grade", "grain");
    // the address rule holds for the new atom too: no label anywhere carries one
    await expect(page.locator("label[data-surface]")).toHaveCount(0);
  });

  test("on /builder already: an ask still round-trips through a fresh GET", async ({ page }) => {
    await clientDeskEverywhere(page);
    await page.goto("/builder");
    await deskReady(page);

    await ask(page, ASK);

    await page.waitForURL(/\/builder\?ask=/);
    await expect(page.locator(NAME_FIELD)).toHaveValue("Ada Rivers", { timeout: 15_000 });
    await expect(page.locator(TOPIC_SELECT)).toHaveValue("other");
    await expect(page.locator(TOPIC_SELECT)).not.toHaveAttribute("data-grade", "grain");
  });

  test("nothing in the closed set matched: an honest decline, no navigation, no fill", async ({ page }) => {
    await clientDeskEverywhere(page);
    await page.goto("/");
    await deskReady(page);

    await ask(page, "build me a form about quantum physics and a haiku about the weather");

    await page.waitForTimeout(1_500);
    expect(new URL(page.url()).pathname).toBe("/");   // never navigated — nothing matched
    await expect(page.locator(".assistant__log")).toContainText("Name");   // names the real closed set
  });
});

// The composer, sandbox piece 1. The desk is not involved in any of these: the whole point of the
// box is that a visitor types a prompt themselves, and the round trip behind it is a plain GET form
// back to the same route. So the page still produces a shareable address, and it still works with
// no JavaScript at all, which is why none of these tests boots a door.
test.describe("the composer: a typed prompt is still an address", () => {
  const COMPOSER = '[data-surface="field:builder-ask"]';

  test("the empty page offers the box, and a typed prompt builds the form through a GET", async ({ page }) => {
    await page.goto("/builder");
    const composer = page.locator(COMPOSER);
    await expect(composer).toHaveJSProperty("tagName", "TEXTAREA");
    await expect(composer).toHaveValue("");            // nothing asked yet
    await expect(composer).toHaveAttribute("name", "ask");

    await composer.fill("a name, an email and a big message box");
    await page.locator(".builder-composer button[type=submit]").click();

    // the address is the prompt, exactly as the example links are
    await page.waitForURL(/\/builder\?ask=/);
    expect(new URL(page.url()).searchParams.get("ask")).toBe("a name, an email and a big message box");
    await expect(page.locator(NAME_FIELD)).toHaveCount(1);
    await expect(page.locator(MESSAGE_BOX)).toHaveCount(1);
  });

  test("the box comes back holding the prompt that produced the page, so it is edited not retyped", async ({ page }) => {
    await page.goto("/builder?ask=a%20name%20and%20an%20email");
    await expect(page.locator(COMPOSER)).toHaveValue("a name and an email");

    await page.locator(COMPOSER).fill("a name and an email and a phone number");
    await page.locator(".builder-composer button[type=submit]").click();
    await page.waitForURL(/phone/);
    await expect(page.locator('[data-surface="field:builder-phone"]')).toHaveCount(1);
  });

  test("with JavaScript off the box is still there and still builds", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/builder?ask=a%20name%20and%20an%20email");
    await expect(page.locator(COMPOSER)).toHaveValue("a name and an email");
    await page.locator(".builder-composer button[type=submit]").click();
    await page.waitForURL(/\/builder\?ask=/);
    await expect(page.locator(NAME_FIELD)).toHaveCount(1);
    await ctx.close();
  });
});

// Piece 2, and the reason piece 1 of the verb had to come first. A generated tick box is the one
// control this demo could not operate until 2026-08-14: field.set writes el.value, and a tick box's
// value is what the form submits rather than whether it is ticked. The address is the assertion that
// carries it — check:, not field: — because that prefix is what decides which verb the manifest
// offers on the control.
test.describe("D1 form builder: a generated tick box, and the desk ticks it", () => {
  const CONSENT = '[data-surface="check:builder-consent"]';
  const CHECK_ASK = "build me a form with a name, an email and a box to agree to the terms";

  test("the matcher generates it, and the desk ticks what it just built", async ({ page }) => {
    await clientDeskEverywhere(page);
    await page.goto("/");
    await deskReady(page);

    await ask(page, CHECK_ASK);
    await page.waitForURL(/\/builder\?ask=/);

    const consent = page.locator(CONSENT);
    await expect(consent).toHaveCount(1);
    await expect(consent).toHaveJSProperty("type", "checkbox");
    // Generated unticked: a form nobody has filled in must not claim they agreed to anything.
    // Then the desk ticks it, visibly, through check.set — the demo's closing move reaching the last
    // control it could not reach.
    await expect(consent).toBeChecked({ timeout: 15_000 });
    await expect(consent).toHaveAttribute("data-grade", "grain");   // AI ink, not the visitor's
    await expect(page.locator(NAME_FIELD)).toHaveValue("Ada Rivers");
  });

  test("the tick box is the ONLY control on the page wearing a check: address", async ({ page }) => {
    await page.goto(`/builder?ask=${encodeURIComponent(CHECK_ASK)}`);
    const checkSurfaces = await page.locator('[data-surface^="check:"]').evaluateAll(
      (els) => els.map((el) => el.getAttribute("data-surface")));
    expect(checkSurfaces).toEqual(["check:builder-consent"]);
    // and no generated tick box wears a field: address, which would advertise the write that lies
    await expect(page.locator('input[type="checkbox"][data-surface^="field:"]')).toHaveCount(0);
  });
});
