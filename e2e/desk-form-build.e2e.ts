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
// The topic select is located by its NAME, not by its surface, and that is the assertion: /builder
// relocates a field's address onto its own control for text inputs only, so a choice's address stays
// on the wrapping label where a fill resolves to an element with no .value and no-ops. Locating the
// select by surface here would pass today and stop meaning anything the moment that changes.
const TOPIC_SELECT = 'select[name="topic"]';
const TOPIC_LABEL_SURFACE = 'label[data-surface="field:builder-topic"]';

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
    // and the second guard is asserted directly: the choice's address is still on the label, which is
    // what makes a stray fill inert rather than destructive. The select itself carries no address.
    await expect(page.locator(TOPIC_LABEL_SURFACE)).toHaveCount(1);
    await expect(page.locator('select[data-surface]')).toHaveCount(0);

    // the desk never submits: no form action exists here, and no navigation happened beyond /builder.
    expect(new URL(page.url()).pathname).toBe("/builder");
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
