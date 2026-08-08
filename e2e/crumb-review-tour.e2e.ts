// tjakoen.github.io/e2e/crumb-review-tour.e2e.ts — the REVIEW tour: CRUMB's `mode: dev` pointed at
// a real change (content/tours/review-live-figures.md, the six live figures in the flagship post).
// This is the first dev tour in the estate, so it proves the whole path end to end: the six figures
// carry a `data-surface` at all (MILL passes the raw HTML in the markdown straight through), the
// lamp finds one, and dev mode renders the review note, the verify hint, and the status chip that a
// demo tour leaves out. If this goes red, the review loop has no surface to stand on.
import { test, expect } from "@playwright/test";

type CrumbWin = Window & { crumb: { start(id: string, opts?: { frame?: boolean; mode?: string }): void; end(): void } };

const NOTE = "/notes/ten-times-zero";
const FIGURES = ["multiplier", "matrix", "ratio", "sprint", "loop", "trap"];

test.describe("crumb — the review tour over the live figures", () => {
  test("every live figure is an addressable surface", async ({ page }) => {
    await page.goto(NOTE);
    for (const name of FIGURES) {
      // the surface sits on the same element as the widget hook, so a tour and the figure script
      // can never disagree about which figure they mean
      await expect(page.locator(`[data-surface="figure:${name}"][data-live-figure="${name}"]`)).toHaveCount(1);
    }
  });

  test("the tour is served as dev and lights a figure", async ({ page }) => {
    await page.goto(NOTE);

    const summary = await page.evaluate(async () => {
      const res = await fetch("/crumb/tours/review-live-figures.json", { headers: { accept: "application/json" } });
      return res.json();
    });
    expect(summary.mode).toBe("dev");
    expect(summary.route).toBe("/notes/ten-times-zero");
    expect(summary.steps).toHaveLength(6);
    expect(summary.steps.map((s: { surface: string }) => s.surface))
      .toEqual(FIGURES.map((n) => `figure:${n}`));

    // start past the intro card, on step 1 (figure:multiplier)
    await page.evaluate(() => (window as unknown as CrumbWin).crumb.start("review-live-figures", { frame: true, mode: "dev" }));
    await page.locator('[data-crumb-goto="0"]').click();

    await expect(page.locator(".crumb-frame")).toHaveAttribute("data-mode", "dev");
    await expect(page.locator(".crumb-frame__count")).toHaveText("1 / 6");
    // the lamp actually found the figure — this is the assertion the whole plan rests on
    await expect(page.locator('[data-surface="figure:multiplier"].ai-spotlit')).toHaveCount(1);

    await page.evaluate(() => (window as unknown as CrumbWin).crumb.end());
  });

  test("dev mode carries the review note, the verify hint, and the status chip", async ({ page }) => {
    await page.goto(NOTE);
    await page.evaluate(() => (window as unknown as CrumbWin).crumb.start("review-live-figures", { frame: true, mode: "dev" }));

    // step 3 = figure:ratio, the one carrying `needs-verification` (it took the spacing fix)
    await page.locator('[data-crumb-goto="2"]').click();
    await expect(page.locator(".crumb-frame__count")).toHaveText("3 / 6");
    await expect(page.locator(".crumb-sidebar__review")).toContainText("collided with the paragraph above it");
    await expect(page.locator(".crumb-sidebar__verify")).toContainText("Scroll slowly into this figure");
    await expect(page.locator(".crumb-sidebar__step[data-current] .crumb-sidebar__chip"))
      .toHaveAttribute("data-status", "needs-verification");

    // and the demo flip strips exactly the review half back off, same step, no navigation
    await page.locator('[data-crumb-mode-set="demo"]').click();
    await expect(page.locator(".crumb-frame__count")).toHaveText("3 / 6");
    await expect(page.locator(".crumb-sidebar__review")).toHaveCount(0);

    await page.evaluate(() => (window as unknown as CrumbWin).crumb.end());
  });

  // The handoff: a review tour is written for one change and handed to one person, so it has to be
  // a LINK. Anything else asks the reviewer to find a launcher that was never built for them.
  test("a ?crumb= link starts the tour and consumes itself", async ({ page }) => {
    await page.goto(`${NOTE}?crumb=review-live-figures&crumb-mode=dev&crumb-frame`);

    await expect(page.locator(".crumb-frame")).toHaveAttribute("data-mode", "dev");
    await expect(page.locator(".crumb-frame__bar")).toBeVisible();
    // the link opens on the intro card, the same entry the launcher gives
    await expect(page.locator(".crumb-sidebar__step")).toHaveCount(6);

    // consumed: the params are gone, so a step that navigates cannot re-fire the link and reset
    // the tour to its intro at every hop
    await expect(page).toHaveURL(new RegExp(`${NOTE}$`));

    await page.evaluate(() => (window as unknown as CrumbWin).crumb.end());
  });

  test("a link preserves the host's own query params", async ({ page }) => {
    await page.goto(`${NOTE}?keep=me&crumb=review-live-figures&crumb-mode=dev`);
    await expect(page.locator(".crumb-pop")).toBeVisible();
    await expect(page).toHaveURL(/\?keep=me$/);
    await page.evaluate(() => (window as unknown as CrumbWin).crumb.end());
  });
});
