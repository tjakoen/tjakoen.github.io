// portfolio/e2e/about.e2e.ts — CONFORMANCE: the /about profile app. A profile-card header + four
// grain `.tab` anchor panels (Profile/CV/Contact/Now). The old separate "Lessons" tab was folded
// INTO Profile as three stacked role sections (Manager / Tech lead / Educator) — no nested tabs,
// because the page already has its main tabs. Contact links out to /mail rather than embedding a
// second compose form — Mail owns the one send path.
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

  test("there are four tabs and no separate Lessons tab", async ({ page }) => {
    await expect(page.locator(".about-tabs .tab")).toHaveCount(4);
    await expect(page.locator('.about-tabs [href="#lessons"]')).toHaveCount(0);
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

test.describe("the /about Profile role sections (Lessons folded in)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/about");
  });

  test("Profile holds three role sections with real prose and tagged-notes links", async ({ page }) => {
    for (const id of ["#role-manager", "#role-tech-lead", "#role-educator"]) {
      await expect(page.locator(`#profile ${id}`)).toBeVisible();
    }
    await expect(page.locator("#profile .role-list li").first()).not.toBeEmpty();
    await expect(page.locator("#profile")).not.toContainText("Placeholder");
    // each role links out to its tagged notes
    const links = page.locator("#profile .role__notes-link a");
    expect(await links.count()).toBe(3);
    for (const href of await links.evaluateAll((els) => els.map((el) => el.getAttribute("href")))) {
      expect(href).toMatch(/^\/notes\?tag=[a-z-]+$/);
    }
  });
});

test.describe("the /about profile app — incoming hash", () => {
  // deliberately NOT under a shared beforeEach: navigating from /about to /about#resume is a
  // same-document fragment change (no reload), so the island's location.hash read on load would
  // never re-run — this needs a single, genuine first navigation straight to the hashed URL.
  test("a direct #resume hash on load opens that panel", async ({ page }) => {
    await page.goto("/about#resume");
    await expect(page.locator(".about-panel:not([hidden])")).toHaveCount(1);
    await expect(page.locator("#resume")).toBeVisible();
    await expect(page.locator('.about-tabs [href="#resume"]')).toHaveAttribute("aria-current", "page");
  });

  test("a #role-* quote deep link resolves to Profile with that role section visible", async ({ page }) => {
    await page.goto("/about#role-educator");
    await expect(page.locator(".about-panel:not([hidden])")).toHaveCount(1);
    await expect(page.locator("#profile")).toBeVisible();
    await expect(page.locator("#role-educator")).toBeVisible();
  });
});

test.describe("the /about profile app (no JS)", () => {
  test.use({ javaScriptEnabled: false });

  test("all four panels are visible (Profile carries the role sections), tabs are jump links", async ({ page }) => {
    await page.goto("/about");

    const panels = page.locator(".about-panel");
    await expect(panels).toHaveCount(4);
    for (const panel of await panels.all()) {
      await expect(panel).toBeVisible();
    }

    // the tabs are plain anchors into the (fully visible) panels below — no script required
    for (const id of ["#profile", "#resume", "#contact", "#now"]) {
      await expect(page.locator(`.about-tabs [href="${id}"]`)).toBeVisible();
    }

    // the role sections (folded into Profile) are all visible, with their real notes links
    await expect(page.locator("#profile .role-list").first()).toBeVisible();
    await expect(page.locator("#profile .role__notes-link a").first()).toHaveAttribute("href", /^\/notes\?tag=/);

    // the real links still resolve without JS
    await expect(page.locator("#resume a[href='/resume']")).toBeVisible();
    await expect(page.locator("#resume a[href='/cv']")).toBeVisible();
    await expect(page.locator("#contact a[href='/mail']").first()).toBeVisible();
  });
});

test.describe("the /about Profile quotes-hero", () => {
  test("leads the Profile panel with five first-person quotes", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator("#profile .quotes-hero .quote")).toHaveCount(5);
    await expect(page.locator("#profile .quotes-hero")).toContainText("As a");
  });

  test("a role quote deep-links to its Profile role section (Profile stays the shown panel)", async ({ page }) => {
    await page.goto("/about");
    await page.locator('.quote a[href="#role-educator"]').click();
    await expect(page.locator(".about-panel:not([hidden])")).toHaveCount(1);
    await expect(page.locator("#profile")).toBeVisible();
    await expect(page.locator("#role-educator")).toBeVisible();
  });

  test("the Profile highlights strip renders one stat tile per cv.json stat", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator("#profile .cv-stats .stat")).toHaveCount(cv.stats.length);
    await expect(page.locator("#profile .cv-stats .stat__value").first()).not.toBeEmpty();
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
