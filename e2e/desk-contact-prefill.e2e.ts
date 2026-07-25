// tjakoen.github.io/e2e/desk-contact-prefill.e2e.ts — B1 CONTACT PREFILL. Same headless-Chromium-
// has-no-WebGPU setup as desk-mail-archive.e2e.ts: every path here is DETERMINISTIC (actions.ts's
// contact-message routing, contact-draft.ts's draft, desk-reasoner.ts's on-page handler opening the
// island's real ✎ Compose button + grain's `fill` op, and desk-door.ts's desk-contact-task stash +
// runContactTask for the cross-page case) — zero model, no download, no generation. The AI never
// submits: no submit verb exists in grain's vocabulary, and the assertions below hold the page on
// /mail (Send is the visitor's alone).
import { test, expect, type Page } from "@playwright/test";

const DESK_DOOR = "/modules/portfolio/ai/desk-door.js";
const DRAFT = "Hi TJ, I want to talk about grain.";
const FIELD = '[data-surface="field:contact-message"]';

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

test.describe("B1 contact prefill (deterministic, no model needed)", () => {
  test("on /mail: opens compose and prefills the registered field — grain ink, the human's edit settles it", async ({ page }) => {
    await clientDeskEverywhere(page);
    await page.goto("/mail");
    await deskReady(page);

    await ask(page, "tell TJ I want to talk about grain");

    // the island's real compose panel opened, and the ONE registered field carries the exact draft
    await expect(page.locator("#compose")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator(FIELD)).toHaveValue(DRAFT, { timeout: 15_000 });
    // AI ink: the fill marked the field grain — provenance visible until the human touches it
    await expect(page.locator(FIELD)).toHaveAttribute("data-grade", "grain");
    await expect(page.locator(".assistant__log")).toContainText("Sending stays yours");
    // the AI never submits: still on /mail, no mailto handoff was raised by the desk
    expect(new URL(page.url()).pathname).toBe("/mail");

    // the human edits (a TRUSTED input event) — the grain ink settles clean; the words are theirs now
    await page.locator(FIELD).click();
    await page.keyboard.press("End");
    await page.keyboard.type(" Talk soon.");
    await expect(page.locator(FIELD)).not.toHaveAttribute("data-grade", "grain");
    await expect(page.locator(FIELD)).toHaveValue(`${DRAFT} Talk soon.`);
  });

  test("from '/': stashes the drafted message, navigates to /mail, and the door fills it on arrival", async ({ page }) => {
    await clientDeskEverywhere(page);
    await page.goto("/");
    await deskReady(page);

    await ask(page, "go to contact and tell TJ I want to talk about grain");

    await page.waitForURL(/\/mail\b/);
    await expect(page.locator("#compose")).toBeVisible({ timeout: 20_000 });
    await expect(page.locator(FIELD)).toHaveValue(DRAFT, { timeout: 20_000 });
    await expect(page.locator(FIELD)).toHaveAttribute("data-grade", "grain");
    await expect(page.locator(".assistant__log")).toContainText("Sending stays yours");
    expect(new URL(page.url()).pathname).toBe("/mail");   // prefilled and PARKED — the send stays the visitor's
  });

  test("a bare 'tell TJ' (no message) never fires the prefill — nothing fills, no navigation", async ({ page }) => {
    await clientDeskEverywhere(page);
    await page.goto("/mail");
    await deskReady(page);

    await ask(page, "tell TJ");

    // the router's empty-remainder guard fell through (offline model → the desk declines in chat);
    // the compose field stays untouched either way — that's the invariant this test pins
    await page.waitForTimeout(1_500);
    await expect(page.locator(FIELD)).toHaveValue("");
    expect(new URL(page.url()).pathname).toBe("/mail");
  });
});
