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

  test("the rail rides the off-canvas drawer; its app links (in the app dock) are reachable", async ({ page }) => {
    await page.goto("/loop");
    const shell = page.locator(".app-shell");
    const activity = page.locator(".activity-bar");
    const dock = page.locator(".app-dock");
    // closed drawer: the rail (with the activity bar + side-rail + app dock) is translated off-canvas
    await expect(shell).not.toHaveAttribute("data-rail-open", "");
    // open the drawer via the topbar menu button (the activity-bar's own toggle is off-canvas)
    await page.locator('.app-shell__topbar [data-shell="rail-toggle"]').click();
    await expect(shell).toHaveAttribute("data-rail-open", "true");
    await expect(activity).toBeInViewport();                                   // the strip is part of the drawer
    await expect(dock).toBeInViewport();                                       // the app dock rides along too
    // a Calendar row (the app dock, pinned to the rail's bottom) is present + clickable (also dismisses the drawer)
    await page.locator('.app-dock a[href="/calendar"]').click();
    await expect(page).toHaveURL(/\/calendar$/);
  });

  test("with the drawer open, NO dock row is covered by the assistant sheet's peeking grab bar", async ({ page }) => {
    // the assistant bottom-sheet sits at a higher z-index than grain's off-canvas rail, so before the
    // modal-layering fix its peeking grab bar poked up through the open drawer and hid the dock's
    // lowest rows (About, half of Mail). Open the drawer; every dock row must be the topmost element
    // at its own centre (nothing painted over it).
    await page.goto("/loop");
    await page.locator('.app-shell__topbar [data-shell="rail-toggle"]').click();
    await expect(page.locator(".app-shell")).toHaveAttribute("data-rail-open", "true");
    await page.waitForTimeout(400);   // let the 0.3s slide-in settle before hit-testing positions
    const items = page.locator(".app-dock__item");
    const n = await items.count();
    expect(n).toBeGreaterThanOrEqual(4);   // Notes / Calendar / Mail / About — the last is the one that hid
    for (let i = 0; i < n; i++) {
      const covered = await items.nth(i).evaluate((el) => {
        const r = el.getBoundingClientRect();
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return !el.contains(hit);   // true = something else is painted over this row's centre
      });
      const label = (await items.nth(i).locator(".app-dock__label").textContent())?.trim();
      expect(covered, `dock row "${label}" is covered by an overlay`).toBe(false);
    }
    // the open drawer is the topmost layer: its scrim sits above the assistant sheet, the rail above the scrim.
    const z = async (sel: string) => Number(await page.locator(sel).evaluate((el) => getComputedStyle(el).zIndex));
    expect(await z(".app-shell__rail")).toBeGreaterThan(await z(".app-shell__scrim"));
    expect(await z(".app-shell__scrim")).toBeGreaterThan(await z(".app-shell__aside"));
  });
});
