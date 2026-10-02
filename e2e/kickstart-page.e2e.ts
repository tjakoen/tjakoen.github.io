import { test, expect } from "@playwright/test";

test("KICKSTART tells a visitor what to prepare and waits for approval before writing", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const response = await page.goto("/kickstart");
  expect(response?.status()).toBe(200);
  await expect(page.locator(".board h1")).toHaveCount(1);
  await expect(page.locator('.board .docs-context-link a[href="/standards"]')).toBeVisible();

  const pageText = await page.locator(".board").innerText();
  expect(pageText).toContain("PHASE 1");
  expect(pageText).toContain("what is the app and who is it for?");
  expect(pageText).toContain("Do NOT scaffold");
  expect(pageText).toContain("stop for my approval before phase 3");

  const width = await page.locator(".app-shell__main").evaluate((element) => ({
    client: element.clientWidth,
    scroll: element.scrollWidth,
  }));
  expect(width.scroll).toBeLessThanOrEqual(width.client + 1);
});
