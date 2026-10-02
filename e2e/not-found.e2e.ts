import { test, expect } from "@playwright/test";

test("unknown routes keep the real 404 status and offer working recovery links", async ({ page }) => {
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 844 });
    const response = await page.goto("/__portfolio_audit_missing_path__");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "That page is not here." })).toBeVisible();

    const links = await page.locator("main .role-list a").evaluateAll((els) =>
      [...new Set(els.map((el) => (el as HTMLAnchorElement).getAttribute("href")))].filter(Boolean) as string[]);
    expect(links).toEqual(["/", "/notes", "/notes/ten-times-zero", "/standards", "/bread", "/about", "/mail"]);
    for (const href of links) expect((await page.request.get(new URL(href, page.url()).toString())).status()).toBe(200);

    const board = page.locator("main .board");
    expect(await board.evaluate((el) => el.scrollWidth)).toBeLessThanOrEqual(await board.evaluate((el) => el.clientWidth));
  }
});
