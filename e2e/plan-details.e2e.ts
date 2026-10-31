import { test, expect } from "@playwright/test";
import { readdirSync } from "node:fs";
import { join } from "node:path";

// Give each plan its own timeout and browser context. Walking every card in one test made the
// suite's time budget shrink whenever a plan was added, and failed under otherwise normal load.
const planIds = readdirSync(join(import.meta.dirname, "..", "plans"))
  .filter((name) => name.endsWith(".md") && name.toLowerCase() !== "readme.md")
  .map((name) => name.slice(0, -3).toLowerCase());

test("the public plan board and index include every plan file", async ({ page }) => {
  await page.goto("/plans");
  const routes = await page.locator('a[href^="/plans/plan/"]').evaluateAll((links) =>
    [...new Set(links.map((link) => new URL((link as HTMLAnchorElement).href).pathname))],
  );
  const indexResponse = await page.request.get("/plans/plans.json");
  expect(indexResponse.status()).toBe(200);
  const index = await indexResponse.json() as { plans: Array<{ id: string }> };
  expect(planIds.length).toBeGreaterThan(0);
  expect(index.plans.map((plan) => plan.id).toSorted()).toEqual(planIds.toSorted());
  expect(routes.toSorted()).toEqual(planIds.map((id) => `/plans/plan/${id}`).toSorted());
});

for (const id of planIds) {
  test(`plan ${id} returns to the board, fits a phone, and has working local links`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const route = `/plans/plan/${id}`;
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.locator(".board h1")).toHaveCount(1);
    await expect(page.locator('.board a.proof-back[href="/plans"]')).toBeVisible();
    const linkedPaths = await page.locator('.board a[href^="/"]').evaluateAll((links) =>
      [...new Set(links.map((link) => new URL((link as HTMLAnchorElement).href).pathname))],
    );
    const width = await page.locator(".app-shell__main").evaluate((element) => ({
      client: element.clientWidth,
      scroll: element.scrollWidth,
    }));
    expect(width.scroll, route).toBeLessThanOrEqual(width.client + 1);
    if (id === "builder-sandbox") {
      const touches = page.locator(".proof-facts__row").filter({ has: page.locator("dt", { hasText: /^TOUCHES$/i }) });
      await expect(touches.locator("dd wbr").first()).toBeAttached();
    }
    for (const path of linkedPaths) {
      expect((await page.request.get(path)).status(), `local link ${path}`).toBe(200);
    }
  });
}
