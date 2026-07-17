// portfolio/e2e/about.e2e.ts — CONFORMANCE: the /about profile app (Pass 4 — About,
// plans/drifting-pondering-brook.md, the final apps-rework pass). The old page was flat prose;
// this pass wraps the SAME real bio (no invented facts) in a profile-card header + four
// grain `.tab` anchor panels (Profile/Résumé/Contact/Now), deliberately NOT the sidebar's
// [data-shell-mode] modes pattern (that belongs to the chrome's assistant panel). Contact links
// out to /mail rather than embedding a second compose form — Mail owns the one send path.
import { test, expect } from "@playwright/test";

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
    await expect(page.locator("#contact a[href='/mail']").first()).toBeVisible();
    await expect(page.locator("#lessons .xp__notes-link a").first()).toHaveAttribute("href", /^\/notes\?tag=/);
  });
});
