import { test, expect } from "@playwright/test";

test("role philosophy is readable and contained at desktop and phone widths", async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });

    await page.goto("/about#profile");
    await expect(page.locator("#profile .quotes-hero .quote")).toHaveCount(3);
    await expect(page.locator("#profile .quotes-hero")).toBeVisible();
    await expect(page.locator("#role-educator")).toBeVisible();
    await expect(page.locator("#role-tech-lead")).toBeVisible();
    await expect(page.locator("#role-manager")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);

    await page.goto("/resume");
    await expect(page.locator(".lede").first()).toContainText("I am a teacher, engineer, and manager");
    await expect(page.locator(".resume-philosophy-link a")).toHaveAttribute("href", "/about#profile");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);

    await page.goto("/");
    await expect(page.getByRole("link", { name: "How I work across teaching, engineering, and management" }))
      .toHaveAttribute("href", "/about#profile");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
  }
});
