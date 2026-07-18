// portfolio/e2e/about.e2e.ts — CONFORMANCE: the /about profile app (Pass 4 — About,
// plans/drifting-pondering-brook.md, the final apps-rework pass). The old page was flat prose;
// this pass wraps the SAME real bio (no invented facts) in a profile-card header + four
// grain `.tab` anchor panels (Profile/Résumé/Contact/Now), deliberately NOT the sidebar's
// [data-shell-mode] modes pattern (that belongs to the chrome's assistant panel). Contact links
// out to /mail rather than embedding a second compose form — Mail owns the one send path.
import { test, expect } from "@playwright/test";
import cv from "../data/cv.json" with { type: "json" };

test.describe("the /about profile app (JS on)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/about");
  });

  test("the profile card shows the real name, role, and the AI-proud tagline", async ({ page }) => {
    await expect(page.locator(".profile-card__name")).toHaveText("Tjakoen Stolk");
    await expect(page.locator(".profile-card__role")).toContainText("Dev manager");
    await expect(page.locator(".profile-card__tagline")).toHaveText("I direct, Claude types.");
  });

  test("the Résumé action in the profile card points at /resume", async ({ page }) => {
    await expect(page.locator(".profile-card__actions a", { hasText: "Résumé" })).toHaveAttribute("href", "/resume");
  });

  test("the Message action in the profile card points at /mail", async ({ page }) => {
    await expect(page.locator(".profile-card__actions a", { hasText: "Message" })).toHaveAttribute("href", "/mail");
  });

  test("exactly one panel is visible by default: Profile", async ({ page }) => {
    await expect(page.locator(".about-panel:not([hidden])")).toHaveCount(1);
    await expect(page.locator("#profile")).toBeVisible();
    await expect(page.locator('.about-tabs [href="#profile"]')).toHaveAttribute("aria-current", "page");
  });

  test("clicking a tab shows exactly that one panel and moves aria-current", async ({ page }) => {
    await page.locator('.about-tabs [href="#resume"]').click();

    await expect(page.locator(".about-panel:not([hidden])")).toHaveCount(1);
    await expect(page.locator("#resume")).toBeVisible();
    await expect(page.locator("#profile")).toBeHidden();
    await expect(page.locator('.about-tabs [href="#resume"]')).toHaveAttribute("aria-current", "page");
    await expect(page.locator('.about-tabs [href="#profile"]')).not.toHaveAttribute("aria-current", "page");
  });

  test("the Contact tab's CTA links to /mail, not an embedded compose form", async ({ page }) => {
    await page.locator('.about-tabs [href="#contact"]').click();

    const contact = page.locator("#contact");
    await expect(contact).toBeVisible();
    await expect(contact.locator('a[href="/mail"]').first()).toBeVisible();
    // no second compose path lives on this page — Mail owns the one send path
    await expect(page.locator("form")).toHaveCount(0);
  });

  test("the Now tab lists dated, real entries", async ({ page }) => {
    await page.locator('.about-tabs [href="#now"]').click();

    const now = page.locator("#now");
    await expect(now).toBeVisible();
    const times = now.locator(".now-list time");
    const count = await times.count();
    expect(count).toBeGreaterThan(0);
    for (const dt of await times.evaluateAll((els) => els.map((el) => el.getAttribute("datetime")))) {
      expect(dt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

});

test.describe("the /about Lessons tab (Apps-v2 Pass D — nested roles)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/about");
    await page.locator('.about-tabs [href="#lessons"]').click();
  });

  test("Lessons shows exactly one role panel by default (Dev manager)", async ({ page }) => {
    await expect(page.locator("#lessons")).toBeVisible();
    await expect(page.locator(".lessons-panel:not([hidden])")).toHaveCount(1);
    await expect(page.locator("#lessons-dev-manager")).toBeVisible();
    await expect(page.locator('.lessons-tabs [href="#lessons-dev-manager"]')).toHaveAttribute("aria-current", "page");
  });

  test("clicking a role swaps to exactly that one role panel and moves aria-current", async ({ page }) => {
    await page.locator('.lessons-tabs [href="#lessons-educator"]').click();

    await expect(page.locator(".lessons-panel:not([hidden])")).toHaveCount(1);
    await expect(page.locator("#lessons-educator")).toBeVisible();
    await expect(page.locator("#lessons-dev-manager")).toBeHidden();
    await expect(page.locator('.lessons-tabs [href="#lessons-educator"]')).toHaveAttribute("aria-current", "page");
  });

  test("each role links out to its tagged notes", async ({ page }) => {
    const link = page.locator('#lessons-dev-manager .xp__notes-link a');
    await expect(link).toHaveAttribute("href", /^\/notes\?tag=[a-z-]+$/);
  });
});

test.describe("the /about profile app — incoming hash", () => {
  // deliberately NOT under the beforeEach above: navigating from /about to /about#resume is a
  // same-document fragment change (no reload), so the island's location.hash read on load would
  // never re-run — this needs a single, genuine first navigation straight to the hashed URL.
  test("a direct #resume hash on load opens that panel", async ({ page }) => {
    await page.goto("/about#resume");
    await expect(page.locator(".about-panel:not([hidden])")).toHaveCount(1);
    await expect(page.locator("#resume")).toBeVisible();
    await expect(page.locator('.about-tabs [href="#resume"]')).toHaveAttribute("aria-current", "page");
  });

  test("a direct #lessons-educator hash opens Lessons on the Educator role", async ({ page }) => {
    await page.goto("/about#lessons-educator");
    await expect(page.locator(".about-panel:not([hidden])")).toHaveCount(1);
    await expect(page.locator("#lessons")).toBeVisible();
    await expect(page.locator(".lessons-panel:not([hidden])")).toHaveCount(1);
    await expect(page.locator("#lessons-educator")).toBeVisible();
    await expect(page.locator('.lessons-tabs [href="#lessons-educator"]')).toHaveAttribute("aria-current", "page");
  });
});

test.describe("the /about profile app (no JS)", () => {
  test.use({ javaScriptEnabled: false });

  test("all five panels are visible (incl. Lessons with every role stacked), tabs are jump links", async ({ page }) => {
    await page.goto("/about");

    const panels = page.locator(".about-panel");
    await expect(panels).toHaveCount(5);
    for (const panel of await panels.all()) {
      await expect(panel).toBeVisible();
    }

    // the tabs are plain anchors into the (fully visible) panels below — no script required
    for (const id of ["#profile", "#resume", "#lessons", "#contact", "#now"]) {
      await expect(page.locator(`.about-tabs [href="${id}"]`)).toBeVisible();
    }

    // inside Lessons, all three role panels are visible too (no nested show-one without JS)
    const lessons = page.locator(".lessons-panel");
    await expect(lessons).toHaveCount(3);
    for (const panel of await lessons.all()) {
      await expect(panel).toBeVisible();
    }

    // the real links still resolve without JS
    await expect(page.locator("#resume a[href='/resume']")).toBeVisible();
    await expect(page.locator("#resume a[href='/cv']")).toBeVisible();
    await expect(page.locator("#contact a[href='/mail']").first()).toBeVisible();
    await expect(page.locator("#lessons .xp__notes-link a").first()).toHaveAttribute("href", /^\/notes\?tag=/);
  });
});

test.describe("the /about Profile quotes-hero", () => {
  test("leads the Profile panel with five first-person quotes", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator("#profile .quotes-hero .quote")).toHaveCount(5);
    await expect(page.locator("#profile .quotes-hero")).toContainText("As a");
  });

  test("a role quote deep-links into its Lessons role", async ({ page }) => {
    await page.goto("/about");
    await page.locator('.quote a[href="#lessons-educator"]').click();
    await expect(page.locator(".about-panel:not([hidden])")).toHaveCount(1);
    await expect(page.locator("#lessons")).toBeVisible();
    await expect(page.locator("#lessons-educator")).toBeVisible();
  });

  test("the Profile highlights strip renders one stat tile per cv.json stat", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator("#profile .cv-stats .stat")).toHaveCount(cv.stats.length);
    await expect(page.locator("#profile .cv-stats .stat__value").first()).not.toBeEmpty();
  });
});

test.describe("the /about Lessons — real prose (no placeholders left)", () => {
  test("no lesson still reads as a placeholder", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator("#lessons")).not.toContainText("Placeholder");
    // every role panel has real, multi-line lessons
    await expect(page.locator("#lessons-dev-manager .lessons-list li").first()).not.toBeEmpty();
  });
});

test.describe("the /about CV tab (real timeline + download)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/about");
    await page.locator('.about-tabs [href="#resume"]').click();
  });

  test("renders the full CV timeline inline, with headline skill chips", async ({ page }) => {
    await expect(page.locator("#resume .cv-entry").first()).toBeVisible();
    await expect(page.locator("#resume")).toContainText("Career Team");
    await expect(page.locator("#resume")).toContainText("Experience");
    await expect(page.locator("#resume .cv-core .cv-chip")).toHaveCount(cv.primarySkills.length);
    // a primary skill with evidence links out from the CV tab too (same cv.json source as /resume)
    const linkedSkill = cv.primarySkills.find((s) => s.href);
    if (linkedSkill) await expect(page.locator(`#resume .cv-core .cv-chip__link[href="${linkedSkill.href}"]`)).toHaveText(linkedSkill.text);
  });

  test("Download PDF points at /cv and Open-the-full-page at /resume; still no form on the page", async ({ page }) => {
    await expect(page.locator('#resume a[href="/cv"]')).toBeVisible();
    await expect(page.locator('#resume a[href="/resume"]')).toBeVisible();
    await expect(page.locator("form")).toHaveCount(0);   // Mail still owns the one send path
  });
});
