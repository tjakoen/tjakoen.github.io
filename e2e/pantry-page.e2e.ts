import { test, expect } from "@playwright/test";

test.describe("PANTRY installation story", () => {
  test("shows the documented path from installation through first serve", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/pantry");

    const steps = page.getByLabel("PANTRY first-run steps");
    await expect(steps).toContainText("bun add -d @tjakoen/pantry@github:tjakoen/pantry#main");
    await expect(steps).toContainText("bunx pantry init");
    await expect(steps).toContainText("bunx proof check");
    await expect(steps).toContainText("bunx pantry serve");
    await expect(steps).toContainText("reads the host project's plans folder");
    expect(await page.locator("body").evaluate((el) => el.scrollWidth)).toBeLessThanOrEqual(
      await page.locator("body").evaluate((el) => el.clientWidth),
    );
  });
});
