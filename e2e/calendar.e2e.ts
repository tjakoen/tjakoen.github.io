// portfolio/e2e/calendar.e2e.ts — CONFORMANCE: the /calendar app (Apps-v2 Pass C, reworked to read
// like a standalone calendar app). The Feed is server-rendered (content.ts merges note publish dates
// + data/desk-feed.json "shipped" posts + the events collection events/*.md in server.ts, composed
// via batch's each="calendarEvents" through the feed-card molecule, images-first). The Month grid is a
// client-side island reading the SAME events straight off the feed DOM (no fetch) and renders ABOVE
// the feed; the feed is always on the page (the whole page with no JS — the month grid ships hidden).
// Week view and the view tabs were removed. Time is frozen so this spec stays deterministic past July
// 2026, when the fixture dates stop overlapping the real calendar.
import { test, expect } from "@playwright/test";

const FIXED_NOW = new Date("2026-07-12T12:00:00");   // after every fixture event, same month as all of them

test.describe("the /calendar app (JS on)", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(FIXED_NOW);
    await page.goto("/calendar");
  });

  test("the month grid renders above the always-present feed, today ring on the 12th", async ({ page }) => {
    await expect(page.locator('[data-cal-panel="month"]')).toBeVisible();
    await expect(page.locator('[data-cal-panel="feed"]')).toBeVisible();

    const today = page.locator('[data-cal-panel="month"] .cal__cell--today .cal__num');
    await expect(today).toBeVisible();
    await expect(today).toHaveText("12");
    await expect(page.locator('[data-cal="title"]')).toHaveText("July 2026");
  });

  test("a jump-to-feed link points at the feed section", async ({ page }) => {
    const jump = page.locator(".cal__to-feed");
    await expect(jump).toBeVisible();
    await expect(jump).toHaveAttribute("href", "#feed");
    await expect(page.locator('section.feed#feed')).toBeVisible();
  });

  test("an events-collection card (hackathon) leads with a real, dimensioned, alt-texted photo", async ({ page }) => {
    const card = page.locator('.feed-card[data-event-kind="hackathon"]').first();
    await expect(card).toBeVisible();
    // the card links through to its own MILL event page
    await expect(card.locator(".feed-card__title a")).toHaveAttribute("href", /^\/calendar\/[a-z-]+$/);

    const photo = card.locator(".feed-photo").first();
    const img = photo.locator("img");
    await expect(img).toHaveAttribute("loading", "lazy");
    await expect(img).toHaveAttribute("decoding", "async");
    await expect(img).toHaveAttribute("width", /^\d+$/);       // bound dims → no layout shift
    await expect(img).toHaveAttribute("height", /^\d+$/);
    const alt = await img.getAttribute("alt");
    expect(alt && alt.trim().length).toBeGreaterThan(0);        // a real (placeholder) alt, never empty
    await expect(photo).toHaveAttribute("href", /\.svg$/);      // links to the full image (no-JS lightbox)
  });

  // Note cards live under the Notes tab, not the default Events one — this spec predates the filter
  // tabs and had been red since they landed. Now that the tab is addressable, the fixture is a URL.
  test("a note-publish-date card is in the feed too, with no photo strip", async ({ page }) => {
    await page.goto("/calendar?feed=notes");
    const noteCard = page.locator('.feed-card[data-event-kind="note"]').first();
    await expect(noteCard).toBeVisible();
    await expect(noteCard.locator(".feed-card__title a")).toHaveAttribute("href", /^\/notes\//);
    await expect(noteCard.locator(".feed-photos")).toBeHidden();   // :empty collapses an absent strip
  });

  test("a month chip's text matches a real feed card title", async ({ page }) => {
    const chip = page.locator(".cal__event").first();
    await expect(chip).toBeVisible();
    const chipText = await chip.textContent();

    const matchingTitle = page.locator(".feed-card__title", { hasText: chipText!.trim() });
    expect(await matchingTitle.count()).toBeGreaterThanOrEqual(1);
  });

  test("clicking a month chip scrolls to and highlights its feed card (feed is always on the page)", async ({ page }) => {
    const chip = page.locator(".cal__event").first();
    const targetId = await chip.getAttribute("data-target");
    expect(targetId).toMatch(/^evt-(note|post|event)-/);
    await chip.click();

    const card = page.locator(`#${targetId}`);
    await expect(card).toBeVisible();
    await expect(card).toHaveClass(/feed-card--highlight/, { timeout: 1000 });
  });

  // The feed's filter tabs are page state carried in the URL (?feed=notes|all), so a filtered feed is
  // linkable, survives a reload, and is a state a CRUMB step can land on with its own `at`. The default
  // tab (events) carries no parameter. These four cover both directions: the URL presets the page, and
  // the page writes what a person clicked back into the URL.
  test("clicking a tab writes it into the URL; the default tab drops the parameter", async ({ page }) => {
    await expect(page).toHaveURL(/\/calendar$/);                       // events is the default → no ?feed=

    await page.locator('[data-feed-tab="notes"]').click();
    await expect(page).toHaveURL(/\/calendar\?feed=notes$/);

    await page.locator('[data-feed-tab="all"]').click();
    await expect(page).toHaveURL(/\/calendar\?feed=all$/);

    await page.locator('[data-feed-tab="events"]').click();
    await expect(page).toHaveURL(/\/calendar$/);
  });

  test("?feed=notes presets the feed on arrival: tab selected, only notes shown, no click", async ({ page }) => {
    await page.goto("/calendar?feed=notes");

    await expect(page.locator('[data-feed-tab="notes"]')).toHaveAttribute("aria-selected", "true");
    await expect(page.locator('[data-feed-tab="events"]')).toHaveAttribute("aria-selected", "false");
    await expect(page).toHaveURL(/\/calendar\?feed=notes$/);           // the preset survives the boot sync

    const visible = page.locator(".feed-card:not([hidden])");
    expect(await visible.count()).toBeGreaterThan(0);
    const kinds = await visible.evaluateAll((els) => els.map((el) => el.getAttribute("data-event-kind")));
    expect(new Set(kinds)).toEqual(new Set(["note"]));
  });

  test("an unknown ?feed= value lands on the default rather than on an empty feed", async ({ page }) => {
    await page.goto("/calendar?feed=banana");

    await expect(page.locator('[data-feed-tab="events"]')).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("[data-feed-empty]")).toBeHidden();
    expect(await page.locator(".feed-card:not([hidden])").count()).toBeGreaterThan(0);
    await expect(page).toHaveURL(/\/calendar$/);                       // the bad value is dropped, not kept
  });

  test("a parameter the feed does not own survives a tab change (a tour arrives with its own)", async ({ page }) => {
    await page.goto("/calendar?ref=tour");
    await page.locator('[data-feed-tab="notes"]').click();

    const url = new URL(page.url());
    expect(url.searchParams.get("ref")).toBe("tour");
    expect(url.searchParams.get("feed")).toBe("notes");
  });

  test("feed card dates relativize against the frozen clock (absolute preserved in title)", async ({ page }) => {
    // proof-live is 2026-07-11; frozen now is 2026-07-12 → yesterday
    const proof = page.locator("#evt-post-proof-live .feed-card__date");
    await expect(proof).toHaveText("Yesterday");
    await expect(proof).toHaveAttribute("title", "2026-07-11");
    await expect(proof).toHaveAttribute("datetime", "2026-07-11");
  });
});

test.describe("the calendar photo lightbox (GRAIN image viewer)", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(FIXED_NOW);
    await page.goto("/calendar");
  });

  test("clicking a photo opens the viewer; a multi-photo post gets prev/next + a dot rail", async ({ page }) => {
    // the hackathon card carries two photos → a real gallery
    const card = page.locator('.feed-card[data-event-kind="hackathon"]').first();
    await card.locator(".feed-photo").first().click();

    const box = page.locator("dialog.lightbox");
    await expect(box).toBeVisible();
    await expect(box.locator(".lightbox__img")).toHaveAttribute("src", /\.svg$/);

    // two photos ⇒ the nav + dots + counter show, and next advances the counter
    await expect(box.locator(".lightbox__nav--next")).toBeVisible();
    await expect(box.locator(".lightbox__dots")).toBeVisible();
    await expect(box.locator(".lightbox__count")).toHaveText("1 / 2");
    await box.locator(".lightbox__nav--next").click();
    await expect(box.locator(".lightbox__count")).toHaveText("2 / 2");
    await box.locator(".lightbox__nav--next").click();               // wraps
    await expect(box.locator(".lightbox__count")).toHaveText("1 / 2");

    await page.keyboard.press("Escape");
    await expect(box).toBeHidden();
  });

  test("a single-photo post opens the viewer with no gallery chrome", async ({ page }) => {
    // a strip that holds exactly one photo (no second tile)
    const single = page.locator(".feed-photos").filter({ has: page.locator(".feed-photo") })
      .filter({ hasNot: page.locator(".feed-photo:nth-child(2)") }).first();
    await single.locator(".feed-photo").first().click();

    const box = page.locator("dialog.lightbox");
    await expect(box).toBeVisible();
    await expect(box.locator(".lightbox__nav--next")).toBeHidden();   // one image ⇒ no nav
    await expect(box.locator(".lightbox__dots")).toBeHidden();
    await expect(box.locator(".lightbox__count")).toBeHidden();
  });
});

test.describe("the calendar photo lightbox (no JS)", () => {
  test.use({ javaScriptEnabled: false });

  test("a photo is still a real link to the full image (no-JS-safe fallback)", async ({ page }) => {
    await page.goto("/calendar");
    const photo = page.locator(".feed-card .feed-photo").first();
    await expect(photo).toHaveAttribute("href", /\.svg$/);
    await photo.click();
    await expect(page).toHaveURL(/\.svg$/);                           // navigates, no dialog
  });
});

test.describe("the /calendar event page (JS on)", () => {
  test("an event page renders the photo grid on top, then the body", async ({ page }) => {
    await page.goto("/calendar/hackathon-coaching");
    // the post-template photo grid comes from the entry's frontmatter (shellChrome renderPhotoGrid)
    const photos = page.locator(".feed-photos .feed-photo");
    expect(await photos.count()).toBeGreaterThan(0);
    await expect(photos.first()).toHaveAttribute("href", /\.svg$/);
    // and the MILL-rendered body is below it
    await expect(page.locator("h2", { hasText: "This is a placeholder" }).first()).toBeVisible();
    // it is a real MILL entry (carries the Rendered/Source toggle)
    await expect(page.locator(".content-source")).toBeVisible();
  });
});

test.describe("the /calendar app (no JS)", () => {
  test.use({ javaScriptEnabled: false });

  test("the feed is the whole page with real datetimes; the month grid stays hidden", async ({ page }) => {
    await page.goto("/calendar");

    const cards = page.locator(".feed-card");
    expect(await cards.count()).toBeGreaterThan(0);

    // dated cards carry a machine-readable <time datetime> (absolute, never relativized without JS)
    const datetimes = await page.locator(".feed-card__date").evaluateAll((els) =>
      els.map((el) => el.getAttribute("datetime")).filter(Boolean));
    expect(datetimes.length).toBeGreaterThan(0);
    for (const dt of datetimes) expect(dt).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    await expect(page.locator('[data-cal-panel="month"]')).toBeHidden();   // the month grid needs JS
    await expect(page.locator('[data-cal-panel="feed"]')).toBeVisible();
  });
});
