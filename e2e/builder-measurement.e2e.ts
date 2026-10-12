import { test, expect } from "@playwright/test";

test("the Builder help shows the latest measured edit limits", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/grain/builder");
  const help = page.locator('details[data-surface="builder-help"]');
  await help.locator("summary").click();

  await expect(help).toContainText("Two WebGPU checks on October 11, 2026, each scored 2/8 with the 0.5B model.");
  await expect(help).toContainText("The 1.5B model scored 6/8 on October 11 and in one October 12 run.");
  await expect(help).toContainText("both deletion cases failed");
  await expect(help).toContainText("The model chose the first card instead of the second");
  await expect(help).toContainText("omitted Utrecht and added unrequested marketing phrases");
  await expect(help).toContainText("40.5 seconds from a fresh browser cache");
});
