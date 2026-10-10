import { test, expect } from "@playwright/test";

test("the Builder help shows the latest measured edit limits", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/grain/builder");
  const help = page.locator('details[data-surface="builder-help"]');
  await help.locator("summary").click();

  await expect(help).toContainText("October 10, 2026, scored 2/8 across eight draft, edit, and refusal cases.");
  await expect(help).toContainText("removed b4 when asked by that exact id");
  await expect(help).toContainText("removed the intro instead of widening the callout");
  await expect(help).toContainText("Its draft missed every supplied fact");
});
