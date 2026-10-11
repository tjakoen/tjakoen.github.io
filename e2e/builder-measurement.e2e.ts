import { test, expect } from "@playwright/test";

test("the Builder help shows the latest measured edit limits", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/grain/builder");
  const help = page.locator('details[data-surface="builder-help"]');
  await help.locator("summary").click();

  await expect(help).toContainText("Two WebGPU checks on October 11, 2026, each scored 2/8 with the 0.5B model.");
  await expect(help).toContainText("A separate 1.5B check scored 6/8.");
  await expect(help).toContainText("removed the wrong card in both removal scenarios");
  await expect(help).toContainText("added unsupported flourishes");
  await expect(help).toContainText("40.5 seconds from a fresh browser cache");
});
