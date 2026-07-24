// tjakoen.github.io/e2e/desk-theme.e2e.ts — A4 THEME SWITCHING. Same headless-Chromium-has-no-WebGPU
// setup as desk-actions.e2e.ts / desk-tour.e2e.ts (the desk model is offline, so this only exercises
// the ZERO-MODEL theme path — actions.ts's theme matching, desk-reasoner.ts's deterministic handler,
// and desk-door.ts's real click on GRAIN's own [data-cycle-theme]/[data-toggle-scheme] controls and
// its themeState read of <html data-themes>/[data-theme]/[data-color-scheme]). Deterministic
// throughout: no download, no generation.
import { test, expect, type Page } from "@playwright/test";

const DESK_DOOR = "/modules/portfolio/ai/desk-door.js";

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

test.describe("A4 theme switching (deterministic, no model needed)", () => {
  test("'switch to brioche' drives the visible cycle-theme control to data-theme=\"brioche\"", async ({ page }) => {
    await clientDeskEverywhere(page);
    await page.goto("/");
    await deskReady(page);

    await ask(page, "switch to brioche");

    await expect(page.locator("html")).toHaveAttribute("data-theme", "brioche", { timeout: 10_000 });
  });

  test("'make it dark' drives the visible scheme control to data-color-scheme=\"dark\"", async ({ page }) => {
    await clientDeskEverywhere(page);
    await page.goto("/");
    await deskReady(page);

    await ask(page, "make it dark");

    await expect(page.locator("html")).toHaveAttribute("data-color-scheme", "dark", { timeout: 10_000 });
  });

  test("'use the sourdough theme' from brioche drops data-theme entirely (sourdough is the default)", async ({ page }) => {
    await clientDeskEverywhere(page);
    // pre-seed the saved pref the way a real returning visitor would carry one (theme.js's own key)
    await page.addInitScript(() => { try { localStorage.setItem("grain-theme", "brioche"); } catch { /* no storage */ } });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "brioche");   // the saved pref applied on load
    await deskReady(page);

    await ask(page, "use the sourdough theme");

    await expect(page.locator("html")).not.toHaveAttribute("data-theme", { timeout: 10_000 });
  });

  test("'switch to grain' still navigates to /grain (grain is not a theme flavor — the nav guard, full-stack)", async ({ page }) => {
    await clientDeskEverywhere(page);
    await page.goto("/");
    await deskReady(page);

    await ask(page, "switch to grain");

    await page.waitForURL("**/grain");
  });
});
