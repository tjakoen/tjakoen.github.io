import { test, expect } from "@playwright/test";

test.describe("developer docs entry points", () => {
  test("every package docs route has one heading, a project return link, and a phone-safe pane", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/docs");
    const routes = await page.locator('.docs-list a[href^="/"]').evaluateAll((links) =>
      [...new Set(links.map((link) => (link as HTMLAnchorElement).pathname)
        .filter((path) => /^\/(batch|grain|mill|proof|crumb|pantry)\/docs(?:\/|$)/.test(path)))],
    );
    expect(routes.length).toBeGreaterThan(20);

    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status(), route).toBe(200);
      await expect(page.getByRole("heading", { level: 1 }), route).toHaveCount(1);
      const project = route.match(/^\/(batch|grain|mill|proof|crumb|pantry)\//)?.[1];
      expect(project, route).toBeTruthy();
      await expect(page.locator(`.docs-context-link a[href="/${project}"]`), route).toBeVisible();

      const main = page.locator(".app-shell__main");
      const width = await main.evaluate((element) => ({ client: element.clientWidth, scroll: element.scrollWidth }));
      expect(width.scroll, route).toBeLessThanOrEqual(width.client + 1);
    }
  });

  test("the docs index keeps long descriptions inside the phone content pane", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/docs");

    const main = page.locator(".app-shell__main");
    const width = await main.evaluate((element) => ({
      client: element.clientWidth,
      scroll: element.scrollWidth,
    }));
    expect(width.scroll).toBeLessThanOrEqual(width.client + 1);
    await expect(page.locator('.docs-list a[href="/pantry/docs/what-it-composes"]')).toBeVisible();
  });

  test("the generated reference links back to the project stories and contains wide tables", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/reference");

    await expect(page.locator('.reference-context a[href="/bread"]')).toBeVisible();
    await expect(page.locator('.reference-context a[href="/grain"]')).toBeVisible();
    const main = page.locator(".app-shell__main");
    const width = await main.evaluate((element) => ({
      client: element.clientWidth,
      scroll: element.scrollWidth,
    }));
    expect(width.scroll).toBeLessThanOrEqual(width.client + 1);
    const table = page.locator(".reference-table-scroll").first();
    expect(await table.evaluate((element) => element.scrollWidth)).toBeGreaterThan(
      await table.evaluate((element) => element.clientWidth),
    );
  });

  test("long BATCH and GRAIN docs keep tables and code inside the phone content pane", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const [route, projectPath] of [
      ["/batch/docs/architecture", "/batch"],
      ["/grain/docs/add-a-component", "/grain"],
    ]) {
      await page.goto(route);
      const main = page.locator(".app-shell__main");
      const width = await main.evaluate((element) => ({
        client: element.clientWidth,
        scroll: element.scrollWidth,
      }));
      expect(width.scroll, route).toBeLessThanOrEqual(width.client + 1);
      await expect(page.locator(`.board a[href="${projectPath}"]`).last()).toBeVisible();

      if (route === "/batch/docs/architecture") {
        const hasScrollableTable = await page.locator("table.table").evaluateAll((tables) =>
          tables.some((table) => table.scrollWidth > table.clientWidth + 1),
        );
        expect(hasScrollableTable).toBe(true);
      }
    }
  });

  test("the component catalog returns to the GRAIN project introduction", async ({ page }) => {
    await page.goto("/catalog");
    await expect(page.locator('.cat-back[href="/grain"]')).toContainText("GRAIN");
  });
});
