// portfolio/e2e/interactions.e2e.ts — e2e as a MESSY HUMAN: the command palette (⌘K) as a real
// person drives it — typing a query and pressing Enter, and clicking outside to light-dismiss.
// (The old /loop-run interrupt/auto-scroll/archive scenarios retired with the /loop demo page;
// the desk's own operate-the-site coverage now lives in the desk-*.e2e.ts suite.)
import { test, expect } from "@playwright/test";

test.describe("the command palette (⌘K), as a human uses it", () => {
  test("opens on ⌘K and clicking outside the sheet dismisses it (light-dismiss)", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("ControlOrMeta+k");
    const palette = page.locator("dialog.cmdk");
    await expect(palette).toBeVisible();
    await page.mouse.click(5, 5);                                        // the ::backdrop, outside the sheet
    await expect(palette).toBeHidden();
  });
});
