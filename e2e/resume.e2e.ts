// portfolio/e2e/resume.e2e.ts — the résumé page (pages/resume.html) + the `resume` terminal
// command (desk-commands.js). The page is a truthful working record (no invented dates/employers);
// this asserts the structure renders and the command points at it.
import { test, expect } from "@playwright/test";

test.describe("résumé — page + command", () => {
  test("the /resume page renders the profile, skills, and selected work with real links", async ({ page }) => {
    await page.goto("/resume");
    await expect(page.locator(".profile-card__name")).toHaveText("Tjakoen Stolk");
    await expect(page.locator(".board")).toContainText("What I do");
    await expect(page.locator(".board")).toContainText("Selected work");
    // selected work links into real routes on the site
    await expect(page.locator('.docs-list a[href="/bread"]')).toBeVisible();
    await expect(page.locator('.docs-list a[href="/native-github-classroom"]')).toBeVisible();
    // the print control is present (opens the print dialog; chrome is stripped via @media print)
    await expect(page.locator("[data-resume-print]")).toBeVisible();
  });

  test("`resume` in the terminal prints the summary and links to /resume", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Control+`");
    const input = page.locator(".console__cmd");
    await input.fill("resume");
    await input.press("Enter");
    const feed = page.locator('[data-surface="console"]');
    await expect(feed).toContainText("dev manager, tech lead");
    await expect(feed.locator('a[href="/resume"]')).toBeVisible();
  });
});
