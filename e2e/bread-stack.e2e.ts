import { test, expect } from "@playwright/test";

test("BREAD follows a real note request through the layers that serve it", async ({ page }) => {
  await page.goto("/bread");

  const flow = page.locator(".bread-flow");
  await expect(flow.locator("li")).toHaveCount(4);
  await expect(flow).toContainText("hands the note route to MILL");
  await expect(flow).toContainText("complete HTML document");
  await expect(page.locator('#request a[href="/notes/ten-times-zero"]')).toBeVisible();
  await expect(page.locator('#request a[href="/mill"]')).toBeVisible();
  await expect(page.locator('#request a[href="/grain"]')).toBeVisible();
  await expect(page.locator('#request a[href="/batch"]')).toHaveCount(1);
  await expect(page.locator("#request")).toContainText("PROOF serves the plans board");
  await expect(page.locator("#request")).toContainText("CRUMB serves the tour data");

  await page.setViewportSize({ width: 390, height: 844 });
  expect(await flow.evaluate((el) => el.scrollWidth)).toBeLessThanOrEqual(
    await flow.evaluate((el) => el.clientWidth),
  );
});
