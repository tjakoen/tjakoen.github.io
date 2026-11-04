// tjakoen.github.io/e2e/xray-panel.e2e.ts — x-ray v2 (plans/ai-agency-navigation.md, P5). The
// status-bar switch opens a panel that lists, grouped See / Navigate / Operate, what the desk can do
// on this page, read from the same capability catalog the desk reasons with.
import { test, expect } from "@playwright/test";

test.describe("x-ray v2 — the AI view panel", () => {
  test("the status-bar switch opens a grouped panel and closes it again", async ({ page }) => {
    await page.goto("/mail");
    const toggle = page.locator(".status-bar__xray");
    await expect(toggle).toHaveText("AI view");
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await toggle.click();
    const panel = page.locator("#xray-panel");
    await expect(panel).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    for (const group of ["see", "navigate", "operate"]) {
      await expect(panel.locator(`[data-group="${group}"] h2`)).toBeVisible();
    }
    // Mail carries the registered contact field, so the operate group names field.set.
    await expect(panel.locator('[data-group="operate"]')).toContainText("field.set");
    await panel.locator(".xray-panel__close").click();
    await expect(panel).toHaveCount(0);
    await expect(page.locator("html")).not.toHaveAttribute("data-xray", "");
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
  });

  test("a shared ?xray link opens straight onto the panel", async ({ page }) => {
    await page.goto("/mail?xray");
    await expect(page.locator("#xray-panel")).toBeVisible();
    await expect(page.locator('#xray-panel [data-group="navigate"]')).toContainText("navigate");
  });

  test("the panel leaves the desk's chat input uncovered", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/mail?xray");
    const panel = await page.locator("#xray-panel").boundingBox();
    const aside = await page.locator(".app-shell__aside").boundingBox();
    expect(panel && aside).toBeTruthy();
    expect(panel!.x + panel!.width).toBeLessThanOrEqual(aside!.x);
  });
});
