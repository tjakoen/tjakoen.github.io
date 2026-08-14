// portfolio/e2e/about.e2e.ts — CONFORMANCE: the /about profile app. A profile-card header + four
// grain `.tab` anchor panels (Profile/CV/Contact/Now). The old separate "Lessons" tab was folded
// INTO Profile as three stacked role sections (Manager / Tech lead / Educator) — no nested tabs,
// because the page already has its main tabs. Contact links out to /mail rather than embedding a
// second compose form — Mail owns the one send path.
import { test, expect } from "@playwright/test";
import cv from "../content/data/cv.json" with { type: "json" };

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

  test("the Contact tab carries the data-driven form, and it still hands off rather than posting", async ({ page }) => {
    await page.locator('.about-tabs [href="#contact"]').click();

    const contact = page.locator("#contact");
    await expect(contact).toBeVisible();
    await expect(contact.locator('a[href="/mail"]').first()).toBeVisible();

    // This page used to assert there was NO form here, because Mail owned the one send path. That
    // changed on 2026-08-13: the Contact tab now renders a real form from content/data/contact-form.json
    // through grain's b-field/b-choice atoms. The invariant that actually mattered survives, and it is
    // the one asserted now: exactly one form, rendered from the spec, with nowhere to post to. Send
    // builds a mail draft in the visitor's own client, exactly as Mail's compose does.
    const form = page.locator("form.contact-form");
    await expect(form).toHaveCount(1);
    await expect(page.locator("form")).toHaveCount(1);
    await expect(form).not.toHaveAttribute("action", /./);
    await expect(form).not.toHaveAttribute("method", /./);
    // the four controls came from the spec, not from hand-typed markup
    await expect(form.locator('[data-surface="field:contact-name"]')).toHaveCount(1);
    await expect(form.locator('[data-surface="field:contact-email"]')).toHaveCount(1);
    await expect(form.locator('[data-surface="field:contact-topic"]')).toHaveCount(1);
    await expect(form.locator('select[name="topic"] option')).toHaveCount(5);
    // The message box, added 2026-08-13 with grain's b-memo. Three things are asserted rather than
    // its mere presence: it is a real TEXTAREA (a single-line input pretending to be one was the
    // failure this atom exists to prevent), its address sits on the control the desk would write
    // into, and it is NOT /mail's registered field:contact-message, which the desk's own draft flow
    // resolves by name. The form-wide rows config reaching the item is what makes it a box at all.
    const message = form.locator('[data-surface="field:about-message"]');
    await expect(message).toHaveCount(1);
    await expect(message).toHaveJSProperty("tagName", "TEXTAREA");
    await expect(message).toHaveAttribute("rows", "6");
    await expect(form.locator('[data-surface="field:contact-message"]')).toHaveCount(0);
    // and no address anywhere on this page sits on a label: the rule the atoms got wrong once.
    await expect(page.locator("label[data-surface]")).toHaveCount(0);
  });

  test("the message box takes real typing, and Send still leaves the page where it is", async ({ page }) => {
    await page.locator('.about-tabs [href="#contact"]').click();
    const form = page.locator("form.contact-form");
    const message = form.locator('[data-surface="field:about-message"]');

    await form.locator('[data-surface="field:contact-name"]').fill("Ada Rivers");
    await form.locator('[data-surface="field:contact-email"]').fill("ada@example.com");
    await message.fill("Two lines about GRAIN,\nthe second one proving a textarea holds them.");
    await expect(message).toHaveValue(/second one proving/);

    // Send builds a mailto: and hands off to the visitor's own mail client. Chromium has no handler
    // registered, so the handoff itself cannot be observed here and the tour's verify line is what
    // checks it with a human watching. What IS asserted is the half that would be a real defect:
    // nothing is posted, and the page the visitor typed into is still in front of them afterwards.
    await form.locator('button[type="submit"]').click();
    await expect(message).toHaveValue(/second one proving/);
    expect(new URL(page.url()).pathname).toBe("/about");
  });

  // The tick box, added with grain's check.set verb. Its address is the assertion that carries the
  // design: a tick box addressed field: would advertise field.set, and field.set writes el.value —
  // which on a tick box is what the form SUBMITS rather than whether it is ticked, so the write
  // would land, report success and move nothing. The check: prefix names a kind that accepts
  // check.set and no other verb, which is why the two are separate kinds at all.
  test("the tick box is a real checkbox, addressed check: and never field:", async ({ page }) => {
    await page.locator('.about-tabs [href="#contact"]').click();
    const box = page.locator('form.contact-form [data-surface="check:contact-copy"]');
    await expect(box).toHaveCount(1);
    await expect(box).toHaveJSProperty("tagName", "INPUT");
    await expect(box).toHaveJSProperty("type", "checkbox");
    await expect(box).not.toBeChecked();
    // the address is on the CONTROL, not the label wrapping it — the rule the atoms got wrong once
    await expect(page.locator('label[data-surface="check:contact-copy"]')).toHaveCount(0);
    // and no tick box anywhere on this page wears a field: address
    await expect(page.locator('input[type="checkbox"][data-surface^="field:"]')).toHaveCount(0);
  });

  test("check.set ticks the box through the one door; field.set aimed at it does nothing", async ({ page }) => {
    await page.locator('.about-tabs [href="#contact"]').click();
    const box = page.locator('form.contact-form [data-surface="check:contact-copy"]');
    await page.waitForFunction(() => Boolean((window as unknown as { grain?: { door?: unknown } }).grain?.door));

    await page.evaluate(() => (window as unknown as { grain: { door: { submit(a: string, s: string, p: unknown): void } } })
      .grain.door.submit("check.set", "check:contact-copy", { checked: true }));
    await expect(box).toBeChecked();
    await expect(box).toHaveAttribute("data-grade", "grain");   // AI ink until the human touches it

    // The write that would have lied, refused by the closed vocabulary rather than by a guard the
    // page had to remember: field.set is not legal on a check surface, so the submit value stays
    // exactly what the spec set it to.
    await page.evaluate(() => (window as unknown as { grain: { door: { submit(a: string, s: string, p: unknown): void } } })
      .grain.door.submit("field.set", "check:contact-copy", { value: "OVERWRITTEN" }));
    await expect(box).toHaveJSProperty("value", "yes");
    await expect(box).toBeChecked();

    // a human click settles the AI's ink, the same rule a prefilled text field follows
    await box.click();
    await expect(box).not.toBeChecked();
    await expect(box).not.toHaveAttribute("data-grade", /./);
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

  test("Download PDF points at /cv and Open-the-full-page at /resume; the CV tab itself carries no form", async ({ page }) => {
    await expect(page.locator('#resume a[href="/cv"]')).toBeVisible();
    await expect(page.locator('#resume a[href="/resume"]')).toBeVisible();
    // The page gained a form on 2026-08-13, but it belongs to the Contact tab. Scoping the assertion
    // to this panel keeps what this test was really guarding: the CV is a document, not a form.
    await expect(page.locator("#resume form")).toHaveCount(0);
  });
});
