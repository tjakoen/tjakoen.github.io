// tjakoen.github.io/e2e/crumb-frame.e2e.ts — CRUMB B3: the guided-tour FRAME (the routed app-shell
// variant: fixed top-bar + combined nav/content sidebar + bordered viewport) and its `data-mode`
// demo|dev flip. The conformance the PLAN names: ONE sidebar component, `data-mode` flipped live on
// the SAME step — demo shows the narration, Review (dev) adds the review note, the status chip, and
// the verify hint. Real browser only. The Tour dock button carries `data-crumb-frame`, so this also
// proves the wiring. crumb-live.js resolves from the symlinked @tjakoen/crumb package.
import { test, expect } from "@playwright/test";

// crumb-live.js exposes a tiny programmatic API on window (console / tests / a palette entry).
type CrumbWin = Window & { crumb: { start(id: string, opts?: { frame?: boolean; mode?: string }): void; end(): void } };

test.describe("crumb — the guided-tour frame + demo|dev flip", () => {
  test("the Tour button opens the frame; the mode toggle flips the SAME step", async ({ page }) => {
    await page.goto("/");

    // launch the framed tour from the real dock button (data-crumb-frame → frame presentation)
    await page.locator('[data-crumb-start="portfolio"]').click();
    const frame = page.locator(".crumb-frame");                          // the root is a 0-size chrome host
    await expect(frame).toHaveCount(1);
    await expect(page.locator(".crumb-frame__bar")).toBeVisible();      // the top bar
    await expect(page.locator(".crumb-sidebar")).toBeVisible();          // the combined nav/content sidebar
    await expect(page.locator("body")).toHaveAttribute("data-crumb-frame", "");

    // jump straight to step 2 (index 1 = nav:/notes), the step with review + status + verify
    await page.locator('[data-crumb-goto="1"]').click();
    await expect(page.locator(".crumb-frame__count")).toHaveText("2 / 5");
    await expect(page.locator(".crumb-sidebar__step[data-current] .crumb-sidebar__label")).toHaveText("notes");

    // DEMO mode (the default): narration only — no review note, no status chips in the rail
    await expect(frame).toHaveAttribute("data-mode", "demo");
    await expect(page.locator(".crumb-sidebar__say")).toContainText("This is the app dock");
    await expect(page.locator(".crumb-sidebar__review")).toHaveCount(0);
    await expect(page.locator(".crumb-sidebar__chip")).toHaveCount(0);

    // FLIP to Review (dev) — SAME step index, re-rendered in place (no navigation)
    await page.locator('[data-crumb-mode-set="dev"]').click();
    await expect(frame).toHaveAttribute("data-mode", "dev");
    await expect(page.locator(".crumb-frame__count")).toHaveText("2 / 5");              // still the same step
    await expect(page.locator(".crumb-sidebar__review")).toContainText("The dock gained a Plans row");
    await expect(page.locator(".crumb-sidebar__verify")).toContainText("Hover each row");
    // the rail now carries status chips (nav:/notes is `changed`)
    await expect(page.locator('.crumb-sidebar__step[data-current] .crumb-sidebar__chip')).toHaveAttribute("data-status", "changed");
    await expect(page.locator('[data-crumb-mode-set="dev"]')).toHaveAttribute("aria-selected", "true");

    // FLIP back to Demo — the review content disappears again (same component, attribute swap)
    await page.locator('[data-crumb-mode-set="demo"]').click();
    await expect(frame).toHaveAttribute("data-mode", "demo");
    await expect(page.locator(".crumb-sidebar__review")).toHaveCount(0);

    // exit releases the frame cleanly
    await page.locator('.crumb-frame [data-crumb="end"]').click();
    await expect(page.locator(".crumb-frame")).toHaveCount(0);
    await expect(page.locator("body")).not.toHaveAttribute("data-crumb-frame", "");
  });

  test("the frame navigates for real and survives the page load", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => (window as unknown as CrumbWin).crumb.start("portfolio", { frame: true, mode: "demo" }));

    // step to note:ten-times-zero (index 3, at:/notes) — a real cross-page navigation
    await page.locator('[data-crumb-goto="3"]').click();
    await expect(page).toHaveURL(/\/notes$/);                            // real navigation, not an SPA fake
    await expect(page.locator(".crumb-frame__bar")).toBeVisible();       // frame resumed after the load
    await expect(page.locator(".crumb-frame__count")).toHaveText("4 / 5");
    await expect(page.locator(".crumb-sidebar__step[data-current] .crumb-sidebar__label")).toHaveText("ten-times-zero");

    // NOTE: we release the tour via the API rather than clicking a control here. After a
    // cross-DOCUMENT navigation, headless Chromium's View-Transitions pipeline can stop producing
    // frames on the long /notes feed, so Playwright's actionability ("wait for a stable frame")
    // hangs — a headless artifact, not a page freeze (synchronous JS still runs). A real browser
    // keeps painting; interactive click-through on /notes is the manual gate.
    await page.evaluate(() => (window as unknown as CrumbWin).crumb.end());
    await expect(page.locator(".crumb-frame")).toHaveCount(0);
  });

  test("popover mode is unaffected (no frame, no data-crumb-frame)", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => (window as unknown as CrumbWin).crumb.start("portfolio", { mode: "demo" }));   // no frame flag
    await expect(page.locator(".crumb-pop")).toBeVisible();
    await expect(page.locator(".crumb-frame")).toHaveCount(0);
    await expect(page.locator("body")).not.toHaveAttribute("data-crumb-frame", "");
    await page.locator('.crumb-pop [data-crumb="end"]').click();
  });
});
