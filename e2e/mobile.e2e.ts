// tjakoen.github.io/e2e/mobile.e2e.ts — the mobile (<768px) assistant. On a phone the assistant column
// is dropped; it re-appears as a bottom SHEET, collapsed to its header as a grab bar. Tapping
// the header raises the full chat (composer reachable). Covers what only a browser shows.
import { test, expect } from "@playwright/test";

test.describe("mobile — the assistant bottom sheet", () => {
  test.use({ viewport: { width: 375, height: 720 } });

  test("collapsed to a grab bar; tapping the header raises the chat", async ({ page }) => {
    await page.goto("/loop");
    const shell = page.locator(".app-shell");
    const aside = page.locator(".app-shell__aside");

    // collapsed: the sheet is translated down (only its header peeks), so its top sits low
    await expect(shell).not.toHaveAttribute("data-aside-open", "");
    const closed = await aside.boundingBox();
    expect(closed && closed.y).toBeGreaterThan(400);           // near the bottom of a 720-tall viewport

    // tap the header (the grab bar) to raise the full sheet
    await page.locator(".assistant__head").click();
    await expect(shell).toHaveAttribute("data-aside-open", "");
    await expect.poll(async () => (await aside.boundingBox())?.y ?? 9999).toBeLessThan(closed?.y ?? 0);  // slid up
    await expect(page.locator('[data-surface="chat-input"]')).toBeInViewport();   // the composer is reachable
  });

  test("the rail rides the off-canvas drawer; its app links (in the activity-bar) are reachable", async ({ page }) => {
    await page.goto("/loop");
    const shell = page.locator(".app-shell");
    const activity = page.locator(".activity-bar");
    // closed drawer: the rail (with the activity bar + side-rail) is translated off-canvas
    await expect(shell).not.toHaveAttribute("data-rail-open", "");
    // open the drawer via the topbar menu button (the activity-bar's own toggle is off-canvas)
    await page.locator('.app-shell__topbar [data-shell="rail-toggle"]').click();
    await expect(shell).toHaveAttribute("data-rail-open", "true");
    await expect(activity).toBeInViewport();                                   // the strip is part of the drawer
    // a Calendar icon (the activity-bar's bottom app-link group) is present + clickable (also dismisses the drawer)
    await page.locator('.activity-bar a[href="/calendar"]').click();
    await expect(page).toHaveURL(/\/calendar$/);
  });
});
