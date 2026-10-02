import { test, expect } from "@playwright/test";

test.describe("the plans board keeps every status reachable", () => {
  test("PROOF connects a markdown plan to its board projection and names the refresh limit", async ({ page }) => {
    await page.goto("/proof");
    await expect(page.getByRole("link", { name: "plans/site-builder.md" })).toHaveAttribute(
      "href",
      "https://github.com/tjakoen/tjakoen.github.io/blob/main/plans/site-builder.md",
    );
    await expect(page.getByRole("link", { name: "View the same plan on the board" })).toHaveAttribute(
      "href",
      "/plans/plan/site-builder",
    );
    await expect(page.locator(".lede").nth(1)).toContainText("manual refresh");

    await page.goto("/plans/plan/site-builder");
    await expect(page.locator(".proof-facts")).toContainText("done");
  });

  test("a narrow desktop can scroll the final status fully into view", async ({ page }) => {
    await page.setViewportSize({ width: 1050, height: 850 });
    await page.goto("/plans");

    const board = page.locator(".proof-board");
    await expect(board.locator(".proof-col")).toHaveCount(4);
    expect(await board.evaluate((el) => getComputedStyle(el).overflowX)).toBe("auto");
    const scrollableWidth = await board.evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(scrollableWidth).toBeGreaterThan(0);

    await board.evaluate((el) => { el.scrollLeft = el.scrollWidth; });
    const boardBox = await board.boundingBox();
    const finalColumn = await board.locator('.proof-col[data-status="blocked"]').boundingBox();
    expect(boardBox).not.toBeNull();
    expect(finalColumn).not.toBeNull();
    expect(finalColumn!.x + finalColumn!.width).toBeLessThanOrEqual(boardBox!.x + boardBox!.width + 1);
    await expect(board.locator('.proof-col[data-status="blocked"] .proof-col__title')).toBeVisible();
  });

  test("a phone stacks all four statuses without sideways page overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/plans");

    const board = page.locator(".proof-board");
    await expect(board.locator(".proof-col")).toHaveCount(4);
    expect(await board.evaluate((el) => el.scrollWidth)).toBeLessThanOrEqual(
      await board.evaluate((el) => el.clientWidth),
    );
    const columns = await board.locator(".proof-col").evaluateAll((els) =>
      els.map((el) => Math.round(el.getBoundingClientRect().top)),
    );
    expect(columns[1]).toBeGreaterThan(columns[0]!);
    expect(columns[2]).toBeGreaterThan(columns[1]!);
    expect(columns[3]).toBeGreaterThan(columns[2]!);
  });
});
