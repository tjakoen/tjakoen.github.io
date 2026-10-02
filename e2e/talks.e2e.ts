import { test, expect } from "@playwright/test";

test("the talks index and note metadata match each deck's slide count", async ({ page }) => {
  await page.goto("/talks");
  const talks = page.locator(".content-index__item");
  const count = await talks.count();

  for (let i = 0; i < count; i++) {
    const item = talks.nth(i);
    const href = await item.locator(".content-index__title a").getAttribute("href");
    const indexCount = Number((await item.locator(".content-index__meta").innerText()).match(/(\d+)\s+slides/i)?.[1]);
    expect(href).toBeTruthy();
    expect(indexCount).toBeGreaterThan(0);

    await page.goto(href!);
    const deckCount = await page.locator(".presentation__slide").count();
    expect(deckCount, `${href} deck sections`).toBe(indexCount);

    if (href === "/talks/build-the-floor") {
      await page.goto("/notes/build-the-floor");
      await expect(page.locator(".attachment.event-deck")).toContainText(`${deckCount} slides`);
    }

    await page.goto("/talks");
  }
});
