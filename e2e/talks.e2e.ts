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

test("the reviewer measurement links directly to the slide that explains its scoring method", async ({ page }) => {
  await page.goto("/talks");
  const methodLink = page.getByRole("link", { name: "See how each comment was scored." });
  await expect(methodLink).toHaveAttribute("href", "/talks/every-time-it-was-wrong#13");
  await methodLink.click();
  await expect(page).toHaveURL(/\/talks\/every-time-it-was-wrong#13$/);
  await expect(page.locator(".presentation__slide[data-current]")).toHaveAttribute("data-title", "How it scores");
});

test("the two written talk companions are linked from the index and the closing slides", async ({ page }) => {
  await page.goto("/talks");
  await expect(page.locator('.lede[data-size="sm"] a[href="/notes/build-the-floor"]')).toBeVisible();
  await expect(page.locator('.lede[data-size="sm"] a[href="/notes/ten-times-zero"]')).toBeVisible();

  for (const [talk, note] of [
    ["/talks/build-the-floor", "/notes/build-the-floor"],
    ["/talks/ten-times-zero", "/notes/ten-times-zero"],
  ] as const) {
    await page.goto(talk);
    await expect(page.locator(".presentation__slide").last().locator(".end__url a")).toHaveAttribute("href", note);
    expect((await page.request.get(note)).ok(), `${note} should resolve`).toBe(true);
  }
});

test("the Build the Floor note links the roadmap to current portfolio evidence and names its limits", async ({ page }) => {
  await page.goto("/notes/build-the-floor");

  await expect(page.locator("main")).toContainText("not a claim that my own work is already at stage four");
  await expect(page.locator("main")).toContainText("latest run scored two of five");
  await expect(page.getByRole("link", { name: "Kickstart" })).toHaveAttribute("href", "/kickstart");
  await expect(page.getByRole("link", { name: "standards and skills" })).toHaveAttribute("href", "/standards");
  await expect(page.getByRole("link", { name: "Builder's five-case audit" })).toHaveAttribute("href", "/grain/builder");
});
