import { test, expect } from "@playwright/test";

test("every public plan detail returns to the board and fits a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/plans");
  const routes = await page.locator('a[href^="/plans/plan/"]').evaluateAll((links) =>
    [...new Set(links.map((link) => new URL((link as HTMLAnchorElement).href).pathname))],
  );
  expect(routes).toHaveLength(29);
  const internalPaths = new Set<string>();

  for (const route of routes) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.locator(".board h1")).toHaveCount(1);
    await expect(page.locator('.board a.proof-back[href="/plans"]')).toBeVisible();
    const linkedPaths = await page.locator('.board a[href^="/"]').evaluateAll((links) =>
      links.map((link) => new URL((link as HTMLAnchorElement).href).pathname),
    );
    linkedPaths.forEach((path) => internalPaths.add(path));

    const width = await page.locator(".app-shell__main").evaluate((element) => ({
      client: element.clientWidth,
      scroll: element.scrollWidth,
    }));
    expect(width.scroll, route).toBeLessThanOrEqual(width.client + 1);

    if (route.endsWith("builder-sandbox")) {
      const touches = page.locator(".proof-facts__row").filter({ has: page.locator("dt", { hasText: /^TOUCHES$/i }) });
      await expect(touches.locator("dd wbr").first()).toBeAttached();
    }
  }

  for (const path of internalPaths) {
    const response = await page.request.get(path);
    expect(response.status(), `local link ${path}`).toBe(200);
  }
});
