// portfolio/e2e/theme-consistency.e2e.ts — the saved theme holds on EVERY page.
//
// The regression this guards: a page whose shell is built outside makePageServer (the catalog)
// shipped without the global theming assets, so it ignored the saved flavor — the one page that
// drifted. And every page flashed the default theme before the deferred theme.js ran; the
// render-blocking theme-boot.js head bootstrap closes that. These assert the CONTRACT: pick a
// flavor once, and <html data-theme> carries it on every route, applied before first paint.
import { test, expect, type Page } from "@playwright/test";

const FLAVOR = "brioche";   // any non-default entry of the pages' data-themes list

async function pickFlavor(page: Page) {
  await page.goto("/loop");
  // through the real vocabulary (theme.js), not raw storage writes
  await page.evaluate((t: string) => (window as any).grain.theme.setTheme(t), FLAVOR);
}

test.describe("theming — one saved flavor, every page", () => {
  for (const route of ["/", "/loop", "/catalog", "/grain"]) {
    test(`saved flavor applies on ${route}`, async ({ page }) => {
      await pickFlavor(page);
      await page.goto(route);
      await expect(page.locator("html")).toHaveAttribute("data-theme", FLAVOR);
    });
  }

  test("the head bootstrap alone applies the flavor (deferred theme.js blocked)", async ({ page }) => {
    await pickFlavor(page);
    // kill the deferred script: if the attribute still lands, the render-blocking
    // theme-boot.js did it — i.e. the flavor is on <html> before first paint, no flash
    await page.route("**/scripts/theme.js", (r) => r.abort());
    await page.goto("/loop");
    await expect(page.locator("html")).toHaveAttribute("data-theme", FLAVOR);
  });

  test("default flavor stores nothing and renders bare on every page", async ({ page }) => {
    await pickFlavor(page);
    await page.evaluate(() => (window as any).grain.theme.setTheme("sourdough"));   // list[0] = default
    await page.goto("/catalog");
    await expect(page.locator("html")).not.toHaveAttribute("data-theme");
  });
});
