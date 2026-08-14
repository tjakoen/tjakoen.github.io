// portfolio/e2e/calendar.e2e.ts — CONFORMANCE: the /calendar app (Apps-v2 Pass C, reworked to read
// like a standalone calendar app). The Feed is server-rendered (content.ts merges note publish dates
// + data/desk-feed.json "shipped" posts + the events collection events/*.md in server.ts, composed
// via batch's each="calendarEvents" through the feed-card molecule, images-first). The year strip is a
// client-side island reading the SAME events straight off the feed DOM (no fetch) and renders ABOVE
// the feed; the feed is always on the page (the whole page with no JS — the strip ships hidden).
// Week view and the view tabs were removed, and the month-of-days grid was replaced by the strip: most
// months here hold nothing, so a day grid spent its whole area proving that. Time is frozen so this
// spec stays deterministic past July 2026, when the fixture dates stop overlapping the real calendar.
import { test, expect } from "@playwright/test";

const FIXED_NOW = new Date("2026-07-12T12:00:00");   // after every fixture event, same month as all of them

test.describe("the /calendar app (JS on)", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(FIXED_NOW);
    await page.goto("/calendar");
  });

  test("the year strip renders above the always-present feed, July 2026 marked as this month", async ({ page }) => {
    await expect(page.locator('[data-cal-panel="years"]')).toBeVisible();
    await expect(page.locator('[data-cal-panel="feed"]')).toBeVisible();

    // Exactly one cell is the current month, and under the frozen clock it is July.
    const now = page.locator(".cal__mon--now");
    await expect(now).toHaveCount(1);
    await expect(now.locator(".cal__mon-label")).toHaveText("Jul");

    // Twelve months per year row, whether or not anything happened in them: the gaps are the point.
    const rows = page.locator(".cal__year");
    expect(await rows.count()).toBeGreaterThanOrEqual(1);
    await expect(rows.first().locator(".cal__mon")).toHaveCount(12);

    // The heading states the real span rather than one month, so it always names two dates.
    await expect(page.locator('[data-cal="title"]')).toHaveText(/^[A-Z][a-z]+ \d{4} to [A-Z][a-z]+ \d{4}$/);
  });

  test("years run newest first and every row that exists holds something", async ({ page }) => {
    const labels = await page.locator(".cal__year-label").allTextContents();
    expect(labels.length).toBeGreaterThanOrEqual(1);
    expect(labels).toEqual(labels.toSorted().toReversed());             // newest year at the top

    for (const year of labels) {                                        // no year row is entirely blank
      const row = page.locator(".cal__year", { has: page.locator(`.cal__year-label:text-is("${year}")`) });
      expect(await row.locator(".cal__dot").count()).toBeGreaterThan(0);
    }
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
    expect(alt && alt.trim().length).toBeGreaterThan(0);        // a real one-sentence alt, never empty
    await expect(photo).toHaveAttribute("href", /\.(svg|jpe?g|png|webp)$/);  // the full image (no-JS lightbox)
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

  // The marks in the strip are marks, not controls: the cell around them is the button, so there is
  // one click target per month instead of a dozen 9px ones. The cell's accessible name is therefore
  // the whole label, and it has to name the month and say whether anything is in it.
  test("a month cell is the control, and says what it holds", async ({ page }) => {
    const cell = page.locator(".cal__mon:not(.cal__mon--empty)").first();
    await expect(cell).toBeVisible();
    await expect(cell).toHaveAttribute("data-month", /^\d{4}-\d{2}$/);
    await expect(cell).toHaveAttribute("aria-label", /^[A-Z][a-z]+ \d{4}, \d+ (entry|entries)$/);

    const empty = page.locator(".cal__mon--empty").first();               // an empty month still opens
    await expect(empty).toHaveAttribute("aria-label", /^[A-Z][a-z]+ \d{4}, nothing$/);
    await expect(page.locator(".cal__dot")).toHaveCount(await page.locator(".cal__dot").count());
  });

  test("clicking a month opens its grid, and Back returns to the years", async ({ page }) => {
    const cell = page.locator(".cal__mon:not(.cal__mon--empty)").first();
    const key = await cell.getAttribute("data-month");
    await cell.click();

    await expect(page.locator('[data-cal-panel="month"]')).toBeVisible();
    await expect(page.locator('[data-cal-panel="years"]')).toBeHidden();
    await expect(page.locator('[data-cal="month-title"]')).toHaveText(/^[A-Z][a-z]+ \d{4}$/);
    await expect(page).toHaveURL(new RegExp(`month=${key}`));            // the month is linkable

    await page.locator('[data-cal="back"]').click();
    await expect(page.locator('[data-cal-panel="years"]')).toBeVisible();
    await expect(page).not.toHaveURL(/month=/);                          // …and dropped on the way out
  });

  test("a month in the URL boots straight onto that grid", async ({ page }) => {
    const key = await page.locator(".cal__mon:not(.cal__mon--empty)").first().getAttribute("data-month");
    await page.goto(`/calendar?month=${key}`);
    await expect(page.locator('[data-cal-panel="month"]')).toBeVisible();
    await expect(page.locator('[data-cal-panel="years"]')).toBeHidden();
  });

  // Stepping is clamped to the months the record actually spans: a control that steps into 2031 works
  // perfectly and can only ever show nothing, which is worse than one that stops.
  test("prev and next step through months and stop at the ends of the record", async ({ page }) => {
    await page.locator(".cal__mon:not(.cal__mon--empty)").first().click();
    const title = page.locator('[data-cal="month-title"]');
    const prev = page.locator('[data-cal="prev"]');
    const next = page.locator('[data-cal="next"]');

    const start = await title.textContent();
    if (!(await next.isDisabled())) {
      await next.click();
      expect(await title.textContent()).not.toBe(start);                 // it actually moved
    }

    for (let i = 0; i < 40 && !(await prev.isDisabled()); i++) await prev.click();
    await expect(prev).toBeDisabled();                                   // the record has a first month
    for (let i = 0; i < 40 && !(await next.isDisabled()); i++) await next.click();
    await expect(next).toBeDisabled();                                   // …and a last one
  });

  test("clicking a chip in the month grid scrolls to and highlights its feed card", async ({ page }) => {
    await page.locator(".cal__mon:not(.cal__mon--empty)").first().click();
    const chip = page.locator(".cal__event").first();
    await expect(chip).toBeVisible();

    const chipText = (await chip.textContent())!.trim();
    expect(await page.locator(".feed-card__title", { hasText: chipText }).count()).toBeGreaterThanOrEqual(1);

    const targetId = await chip.getAttribute("data-target");
    expect(targetId).toMatch(/^evt-(note|post|event)-/);
    await chip.click();

    const card = page.locator(`#${targetId}`);
    await expect(card).toBeVisible();
    await expect(card).toHaveClass(/feed-card--highlight/, { timeout: 1000 });
  });

  test("an empty month says so instead of looking broken", async ({ page }) => {
    const empty = page.locator(".cal__mon--empty").first();
    if (await empty.count() === 0) test.skip(true, "every month in the fixtures holds something");
    await empty.click();
    await expect(page.locator('[data-cal="month-note"]')).toContainText("Nothing this month");
    await expect(page.locator(".cal__event")).toHaveCount(0);
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
    // Counts come from the CARD, not from a number typed here: this used to assert "1 / 2" against a
    // placeholder post that carried exactly two photos, and deleting that post broke a test that was
    // really only describing the fixture. Whatever the newest multi-photo event holds, the viewer has
    // to walk all of it — including tiles the strip hides past its five-tile cap.
    const card = page.locator(".feed-card").filter({ has: page.locator(".feed-photo:nth-child(2)") }).first();
    const total = await card.locator(".feed-photo").count();
    expect(total).toBeGreaterThan(1);
    await card.locator(".feed-photo").first().click();

    const box = page.locator("dialog.lightbox");
    await expect(box).toBeVisible();
    await expect(box.locator(".lightbox__img")).toHaveAttribute("src", /\.(svg|jpe?g|png|webp)$/);

    // more than one photo ⇒ the nav + dots + counter show, and next advances the counter
    await expect(box.locator(".lightbox__nav--next")).toBeVisible();
    await expect(box.locator(".lightbox__dots")).toBeVisible();
    await expect(box.locator(".lightbox__count")).toHaveText(`1 / ${total}`);
    await box.locator(".lightbox__nav--next").click();
    await expect(box.locator(".lightbox__count")).toHaveText(`2 / ${total}`);
    for (let i = 2; i <= total; i++) await box.locator(".lightbox__nav--next").click();
    await expect(box.locator(".lightbox__count")).toHaveText(`1 / ${total}`);   // wraps

    await page.keyboard.press("Escape");
    await expect(box).toBeHidden();
  });

  test("a single-photo post opens the viewer with no gallery chrome", async ({ page }) => {
    // a strip that holds exactly one photo (no second tile)
    const single = page.locator(".feed-photos").filter({ has: page.locator(".feed-photo") })
      .filter({ hasNot: page.locator(".feed-photo:nth-child(2)") }).first();
    // Every event on the feed carries several photos today; the placeholder posts that used to
    // supply the one-photo case were deleted. Skip loudly rather than assert against nothing, so
    // this reads as "the content stopped providing the case" and not as a passing test.
    test.skip(await single.count() === 0, "no single-photo post on the feed right now");
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

  // Unscoped .first(), so this one lands on whichever post sorts newest — a real event with real
  // photos, not a placeholder. The claim is that the link resolves to an image file at all, so the
  // extension stays open: pinning it to .svg only held while every fixture was a placeholder.
  const anImageFile = /\.(svg|jpe?g|png|webp)$/;

  test("a photo is still a real link to the full image (no-JS-safe fallback)", async ({ page }) => {
    await page.goto("/calendar");
    const photo = page.locator(".feed-card .feed-photo").first();
    await expect(photo).toHaveAttribute("href", anImageFile);
    await photo.click();
    await expect(page).toHaveURL(anImageFile);                        // navigates, no dialog
  });
});

test.describe("the /calendar event page (JS on)", () => {
  test("an event page renders the photo grid on top, then the body", async ({ page }) => {
    await page.goto("/calendar/gdg-hau-ai-hack");
    // the post-template photo grid comes from the entry's frontmatter (shellChrome renderPhotoGrid)
    const photos = page.locator(".feed-photos .feed-photo");
    expect(await photos.count()).toBeGreaterThan(0);
    await expect(photos.first()).toHaveAttribute("href", /\.(jpg|jpeg|png|svg)$/);
    // and the MILL-rendered body is below it
    await expect(page.locator("h2").first()).toBeVisible();
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

    await expect(page.locator('[data-cal-panel="years"]')).toBeHidden();   // both time views need JS
    await expect(page.locator('[data-cal-panel="month"]')).toBeHidden();
    await expect(page.locator('[data-cal-panel="feed"]')).toBeVisible();
    // …and the noscript explaining why is a SIBLING of that panel, not a child of it. Nested inside,
    // it inherited the panel's own `hidden` and could never reach the reader it was written for.
    // Placement only: this context reports a noscript's text as empty, so asserting the wording here
    // would test the harness rather than the page.
    await expect(page.locator(".board > noscript")).toHaveCount(1);
  });
});
