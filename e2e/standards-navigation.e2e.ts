import { test, expect } from "@playwright/test";

test("every standard has one heading, fits a phone, and returns to the standards index", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/standards");
  const routes = await page.locator('.board a[href^="/standards/"]').evaluateAll((links) =>
    [...new Set(links.map((link) => new URL((link as HTMLAnchorElement).href).pathname))]
      .filter((route) => route !== "/standards/"),
  );
  expect(routes).toHaveLength(20);

  for (const route of routes) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.locator(".board h1")).toHaveCount(1);
    await expect(page.locator('.board .docs-context-link a[href="/standards"]')).toBeVisible();
    await expect(page.locator(".board .docs-context-link")).toContainText("Maintainer: Tjakoen Stolk");
    await expect(page.locator(".board .docs-context-link")).toContainText("Current working standard");

    const width = await page.locator(".app-shell__main").evaluate((element) => ({
      client: element.clientWidth,
      scroll: element.scrollWidth,
    }));
    expect(width.scroll, route).toBeLessThanOrEqual(width.client + 1);
  }
});
