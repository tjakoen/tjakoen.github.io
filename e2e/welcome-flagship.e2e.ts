// portfolio/e2e/welcome-flagship.e2e.ts — the flagship note is FEATURED (owner ask 2026-07-17):
// first in the Welcome page's Walkthroughs, and pinned to the top of the /notes feed in BOTH the
// New and Top sorts. Plus the Welcome page's two columns must collapse to one when the SHELL FRAME
// is narrow — including the viewport-toggle's mobile PREVIEW (a @container query, not viewport @media,
// so the preview clamp collapses it instead of overflowing the second column off the frame).
import { test, expect } from "@playwright/test";

test.describe("flagship featured", () => {
  test("Walkthroughs: the flagship is the first (featured) card", async ({ page }) => {
    await page.goto("/");
    const first = page.locator(".walks .walk").first();
    await expect(first).toHaveAttribute("href", "/notes/ten-times-zero");
    await expect(first).toHaveAttribute("data-featured", "");
  });

  test("/notes feed: the flagship is pinned first in New AND Top (score can't bury it)", async ({ page }) => {
    await page.goto("/notes");
    const firstNew = page.locator(".note-feed .note-card").first();
    await expect(firstNew).toHaveAttribute("data-surface", "note:ten-times-zero");
    await expect(firstNew).toHaveAttribute("data-pinned", "");
    await expect(firstNew.locator(".note-card__pin")).toContainText("Pinned");
    // switching to Top re-sorts by score, but the pin floats it back to the front
    await page.locator('input[name="sort"][value="top"]').check();
    await expect(page.locator(".note-feed .note-card").first()).toHaveAttribute("data-surface", "note:ten-times-zero");
  });

  test("the flagship is pinned in the FEED only — 'Recent' on Welcome stays date-ordered", async ({ page }) => {
    // This used to assert "the first Recent row is not the flagship", which only held while the
    // flagship happened to be an older note. It was re-dated 2026-08-07 and is now the newest, so
    // that assertion could no longer tell pinning apart from date order. Check the property itself:
    // read each note's date off the feed cards, then require Recent to be non-increasing by date.
    await page.goto("/notes");
    const dates = new Map(await page.locator(".note-feed .note-card").evaluateAll((cards) =>
      cards.map((c) => [
        `/notes/${(c.getAttribute("data-surface") ?? "").replace(/^note:/, "")}`,
        c.getAttribute("data-date") ?? "",
      ] as [string, string])));

    await page.goto("/");
    // the column also carries a plain "/notes" row (see all), which has no card and no date
    const hrefs = (await page.locator(".recent .recent__item, .recent [href^='/notes/']")
      .evaluateAll((rows) => rows.map((r) => r.getAttribute("href") ?? "")))
      .filter((h) => /^\/notes\/.+/.test(h));
    expect(hrefs.length).toBeGreaterThan(1);

    const seen = hrefs.map((h) => { const d = dates.get(h); expect(d, `no feed date for ${h}`).toBeTruthy(); return d!; });
    expect(seen).toEqual([...seen].sort().reverse());   // ISO dates sort lexically
  });
});

test.describe("welcome mobile layout", () => {
  test("two columns collapse to one in the mobile viewport PREVIEW (no overflow)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    const toggle = page.locator('[data-shell="viewport-toggle"]').first();
    await toggle.dispatchEvent("click");
    await toggle.dispatchEvent("click");
    await expect(page.locator("body")).toHaveAttribute("data-viewport", "mobile");
    const cols = await page.locator(".welcome__cols").evaluate((el) => getComputedStyle(el).gridTemplateColumns);
    expect(cols.trim().split(/\s+/).length).toBe(1);   // single track — collapsed, not squeezed 2-col
  });

  test("a real desktop window keeps the two columns", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    const cols = await page.locator(".welcome__cols").evaluate((el) => getComputedStyle(el).gridTemplateColumns);
    expect(cols.trim().split(/\s+/).length).toBe(2);
  });
});
