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

  test("every experience entry links its role to that role's tagged notes (Apps-v2 Pass D)", async ({ page }) => {
    await page.goto("/resume");
    const entries = page.locator(".xp__entry");
    const count = await entries.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      // the role heading is a link, and there's an explicit "Notes from this role" link, both to a tag
      await expect(entries.nth(i).locator(".xp__role a")).toHaveAttribute("href", /^\/notes\?tag=[a-z-]+$/);
      await expect(entries.nth(i).locator(".xp__notes-link a")).toHaveAttribute("href", /^\/notes\?tag=[a-z-]+$/);
    }
  });

  test("clicking a role's notes link lands on the filtered /notes feed (end-to-ends Pass A)", async ({ page }) => {
    await page.goto("/resume");
    const link = page.locator(".xp__entry .xp__notes-link a").first();
    const href = await link.getAttribute("href");
    const tag = new URL(href!, "http://x").searchParams.get("tag")!;
    await link.click();

    await expect(page).toHaveURL(new RegExp(`/notes\\?tag=${tag}$`));
    // the mapped tags are real topic tags with notes, so the chip is checked and the feed filters
    await expect(page.locator(`.chips[aria-label="Filter by tag"] input[value="${tag}"]`)).toBeChecked();
    await expect(page.locator("[data-feed-empty]")).toBeHidden();
    expect(await page.locator(".note-card:not([hidden])").count()).toBeGreaterThan(0);
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
