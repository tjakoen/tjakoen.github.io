// A transient grounding fetch must not poison the page's knowledge cache until reload.
import { test, expect } from "@playwright/test";

test("a failed knowledge fetch can recover on the same page without reloading", async ({ page }) => {
  let unavailable = true;
  let attempts = 0;
  await page.route("**/knowledge.json", async (route) => {
    attempts++;
    if (unavailable) return route.fulfill({ status: 503, body: "temporarily unavailable" });
    return route.continue();
  });
  await page.route("**/*", async (route, request) => {
    if (request.resourceType() !== "document") return route.fallback();
    const response = await route.fetch();
    return route.fulfill({ response, body: (await response.text()).replace(/<body\b/,
      '<body data-ai-transport="client" data-ai-door="/modules/portfolio/ai/desk-door.js"') });
  });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "gpu", { value: undefined, configurable: true });
  });
  await page.goto("/");
  await page.waitForFunction(() => Boolean((window as unknown as {
    grain?: { door?: unknown };
  }).grain?.door));
  const ask = () => page.evaluate(() => (window as unknown as {
    grain: { door: { submit(action: string, surface: string, payload: unknown): void } };
  }).grain.door.submit("chat.send", "chat-log", { text: "Who is TJ?" }));
  await ask();
  await expect(page.locator(".assistant__log")).toContainText("Something went wrong", { timeout: 20_000 });
  const failedAttempts = attempts;
  unavailable = false;
  await ask();
  await expect(page.locator(".assistant__log")).toContainText("Career Team", { timeout: 20_000 });
  expect(attempts).toBeGreaterThan(failedAttempts);
  expect(new URL(page.url()).pathname).toBe("/");
});
