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

  test("documents the current surface switches and the pages they mount", async ({ page }) => {
    await page.goto("/pantry/docs/getting-started");
    const setup = page.locator("main");
    await expect(setup).toContainText("decisions");
    await expect(setup).toContainText("artifacts");
    await expect(setup).toContainText("timeline");
    await expect(setup).toContainText("runs");
    await expect(setup).toContainText("are not individual surfaces toggles");

    await page.goto("/pantry/docs/what-it-composes");
    const routes = page.locator("main");
    await expect(routes).toContainText("/decisions");
    await expect(routes).toContainText("/answers.json");
    await expect(routes).toContainText("/runs/:id");
    await expect(routes).toContainText("/artifacts/raw/:path");
    await expect(routes).toContainText("/timeline.json");
  });
});
