// portfolio/e2e/resume.e2e.ts — the résumé page (pages/resume.html) is now the real, full CV rendered
// from data/cv.json (the single source, shared with About's CV tab). Two faces: an interactive screen
// (each entry collapses to a summary + a Show/Hide toggle) and a flat export/print (no accordion, no
// hidden text) that an ATS reads cleanly. /cv is the straight-to-download twin that auto-prints.
// Expectations are derived from cv.json so they can't rot when the CV changes.
import { test, expect } from "@playwright/test";
import cv from "../data/cv.json" with { type: "json" };

const entryCount = cv.roles.length + cv.education.length;

test.describe("résumé — the real CV (data/cv.json)", () => {
  test("renders the full timeline, skills, languages, certs, and the Download PDF control", async ({ page }) => {
    await page.goto("/resume");
    await expect(page.locator(".profile-card__name")).toHaveText("Tjakoen Stolk");
    // every role + education line renders as one cv-entry
    await expect(page.locator(".cv-entry")).toHaveCount(entryCount);
    for (const role of cv.roles) {
      await expect(page.locator(".cv-entry__title", { hasText: role.title }).first()).toBeVisible();
    }
    await expect(page.locator(".cv-core .cv-chip")).toHaveCount(cv.primarySkills.length);   // headline chips
    await expect(page.locator(".cv-skill")).toHaveCount(cv.skills.length);
    await expect(page.locator(".cv-languages")).toContainText("English");
    await expect(page.locator(".cv-certs .cv-bullet")).toHaveCount(cv.certs.length);
    await expect(page.locator(".board")).toContainText("Selected work");
    await expect(page.locator("[data-resume-print]")).toBeVisible();
  });

  test("with JS, each entry collapses to a summary and the toggle expands the detail", async ({ page }) => {
    await page.goto("/resume");
    const first = page.locator(".cv-entry").first();
    const toggle = first.locator(".cv-entry__toggle");
    await expect(toggle).toBeVisible();               // the island reveals the control
    await expect(first).toHaveClass(/is-collapsed/);  // collapsed by default under JS
    await expect(first.locator(".cv-entry__detail")).toBeHidden();
    await toggle.click();
    await expect(first).not.toHaveClass(/is-collapsed/);
    await expect(first.locator(".cv-entry__detail")).toBeVisible();
  });

  test("a role with no feed posts hides its related-posts row", async ({ page }) => {
    await page.goto("/resume");
    const first = page.locator(".cv-entry").first();
    await first.locator(".cv-entry__toggle").click();          // reveal the detail
    await expect(first.locator(".cv-entry__links")).toBeHidden();  // :empty hides the links row
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

test.describe("résumé — flat + ATS-safe without JS", () => {
  test.use({ javaScriptEnabled: false });

  test("no accordion, no hidden text: every bullet is present and visible", async ({ page }) => {
    await page.goto("/resume");
    await expect(page.locator(".cv-entry.is-collapsed")).toHaveCount(0);   // nothing collapsed
    await expect(page.locator(".cv-entry__toggle").first()).toBeHidden();  // the toggle stays hidden
    // a real bullet from the first role actually shows on the page
    const firstBullet = cv.roles[0].bullets[0];
    await expect(
      page.locator(".cv-entry__bullets .cv-bullet", { hasText: firstBullet.slice(0, 24) }).first(),
    ).toBeVisible();
  });
});

test.describe("/cv — the straight-to-download twin", () => {
  test("serves the same résumé sheet plus an auto-print script", async ({ page }) => {
    const resp = await page.goto("/cv");
    expect(resp?.status()).toBe(200);
    expect(await resp!.text()).toContain("window.print");
    await expect(page.locator("body[data-screen='resume'] .profile-card__name")).toHaveText("Tjakoen Stolk");
  });
});
