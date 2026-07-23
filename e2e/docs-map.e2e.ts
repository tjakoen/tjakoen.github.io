// portfolio/e2e/docs-map.e2e.ts — the /docs diagram-led map. A clickable variant of the shared
// stack-diagram (the shared component stays a static figure); each layer + the PANTRY frame links
// into that member. Asserts the map renders and every layer routes to the right place.
import { test, expect } from "@playwright/test";

const TARGETS: Array<[string, string]> = [
  ["/batch/docs", "BATCH"],
  ["/grain/docs", "GRAIN"],
  ["/mill", "MILL"],
  ["/proof", "PROOF"],
  ["/crumb", "CRUMB"],
  ["/pantry", "PANTRY"],
];

test.describe("the /docs diagram-led map", () => {
  test("the map renders with a link per layer + the PANTRY frame", async ({ page }) => {
    await page.goto("/docs");
    const map = page.locator(".docs-map .stack-diagram");
    await expect(map).toBeVisible();
    for (const [href] of TARGETS) {
      await expect(page.locator(`.docs-map a[href="${href}"]`)).toHaveCount(1);
    }
  });

  test("clicking the GRAIN layer opens the GRAIN docs", async ({ page }) => {
    await page.goto("/docs");
    await page.locator('.docs-map a[href="/grain/docs"]').click();
    await expect(page).toHaveURL(/\/grain\/docs$/);
  });

  test("the curated doc lists still render below the map (text alternative)", async ({ page }) => {
    await page.goto("/docs");
    await expect(page.locator(".board")).toContainText("Getting started");
    await expect(page.locator(".board")).toContainText("Standards");
    // the fixed Contribute links point at real GitHub blobs, not the bare profile
    await expect(page.locator('a[href$="/blob/main/docs/HACKING.md"]')).toBeVisible();
  });
});
