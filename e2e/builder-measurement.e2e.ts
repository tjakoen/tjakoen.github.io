import { test, expect } from "@playwright/test";

test("the Builder help shows the latest measured edit limits", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/grain/builder");
  const help = page.locator('details[data-surface="builder-help"]');
  await help.locator("summary").click();

  await expect(help).toContainText("On 2026-10-02, I reran the same five scenarios against this build.");
  await expect(help).toContainText("Two passed");
  await expect(help).toContainText("removed the first card instead of the second");
  await expect(help).toContainText("declined to move the callout");
});
