// portfolio/e2e/calendar.e2e.ts — CONFORMANCE: the /calendar Month/Week/Agenda views (Pass 2 —
// Calendar, plans/drifting-pondering-brook.md). The Agenda is server-rendered (content.ts's
// listNoteCalendarEvents merged with data/desk-feed.json in server.ts, composed via batch's
// each="calendarEvents" through the agenda-item molecule); Month/Week are a client-side island
// that reads the SAME events straight off the Agenda DOM, no fetch. Time is frozen so this spec
// (unlike the plan's minimum bar) stays deterministic past July 2026, when the fixture dates
// (data/desk-feed.json, the real note frontmatter) stop overlapping the real calendar.
import { test, expect } from "@playwright/test";

const FIXED_NOW = new Date("2026-07-12T12:00:00");   // a date after every fixture event, same month as all of them

test.describe("the /calendar page (JS on)", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(FIXED_NOW);
    await page.goto("/calendar");
  });

  test("Month is the default view, with a today ring on the 12th", async ({ page }) => {
    await expect(page.locator('[data-cal-panel="month"]')).toBeVisible();
    await expect(page.locator('[data-cal-panel="agenda"]')).toBeHidden();
    await expect(page.locator('[data-cal-panel="week"]')).toBeHidden();

    const today = page.locator('[data-cal-panel="month"] .cal__cell--today .cal__num');
    await expect(today).toBeVisible();
    await expect(today).toHaveText("12");

    await expect(page.locator('.cal-views [data-view="month"]')).toHaveAttribute("aria-current", "page");
  });

  test("a month chip's text matches a real agenda title", async ({ page }) => {
    const chip = page.locator(".cal__event").first();
    await expect(chip).toBeVisible();
    const chipText = await chip.textContent();

    const matchingTitle = page.locator(".agenda__title", { hasText: chipText! });
    await expect(matchingTitle).toHaveCount(1);
  });

  test("clicking a chip switches to Agenda and reveals the entry", async ({ page }) => {
    const chip = page.locator(".cal__event").first();
    const targetId = await chip.getAttribute("data-target");
    expect(targetId).toMatch(/^evt-(note|post)-/);
    await chip.click();

    await expect(page.locator('[data-cal-panel="agenda"]')).toBeVisible();
    await expect(page.locator('[data-cal-panel="month"]')).toBeHidden();
    await expect(page.locator('.cal-views [data-view="agenda"]')).toHaveAttribute("aria-current", "page");

    const row = page.locator(`#${targetId}`);
    await expect(row).toBeVisible();
    await expect(row).toHaveClass(/agenda__item--highlight/, { timeout: 1000 });
  });

  test("Week view swaps in over Month", async ({ page }) => {
    await page.locator('.cal-views [data-view="week"]').click();
    await expect(page.locator('[data-cal-panel="week"]')).toBeVisible();
    await expect(page.locator('[data-cal-panel="month"]')).toBeHidden();
    await expect(page.locator('.cal-views [data-view="week"]')).toHaveAttribute("aria-current", "page");
  });
});

test.describe("the /calendar page (no JS)", () => {
  test.use({ javaScriptEnabled: false });

  test("the Agenda renders with real datetimes and the view tabs stay hidden", async ({ page }) => {
    await page.goto("/calendar");

    const items = page.locator(".agenda__item");
    const count = await items.count();
    expect(count).toBeGreaterThan(0);

    const datetimes = await page.locator(".agenda__date").evaluateAll((els) =>
      els.map((el) => el.getAttribute("datetime")));
    for (const dt of datetimes) expect(dt).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    await expect(page.locator("[data-cal-views]")).toBeHidden();
    await expect(page.locator('[data-cal-panel="month"]')).toBeHidden();
    await expect(page.locator('[data-cal-panel="week"]')).toBeHidden();
    await expect(page.locator('[data-cal-panel="agenda"]')).toBeVisible();
  });
});
