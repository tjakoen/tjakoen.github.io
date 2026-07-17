// portfolio/e2e/notes-feed.e2e.ts — CONFORMANCE: the /notes Reddit-style feed (Pass 1 — Notes,
// plans/drifting-pondering-brook.md). The route is a portfolio override (content.ts
// renderNotesFeedPage; the /notes collection opts OUT of MILL's own index serving), so this
// spec is the regression gate for that override: newest-first server order, the reasoner's
// travel targets (data-surface="note:<slug>"), the "See what's new" trigger notes-demo.e2e.ts
// depends on, and the New/Top/tag island — all as a pure DOM reorder/hide, no fetch.
import { test, expect } from "@playwright/test";

test.describe("the /notes feed (JS on)", () => {
  test("the pinned flagship leads; the rest render newest-first, each a note surface, and the AI trigger is present", async ({ page }) => {
    await page.goto("/notes");

    const cards = page.locator(".note-card");
    await expect(cards.first()).toBeVisible();

    // the flagship is pinned to the front; the REST stays newest-first (first tail date >= the next)
    const rows = await cards.evaluateAll((els) => els.map((el) => ({ date: el.getAttribute("data-date"), pinned: el.hasAttribute("data-pinned") })));
    expect(rows[0]!.pinned).toBe(true);
    const tailDates = rows.filter((r) => !r.pinned).map((r) => r.date);
    const sorted = [...tailDates].sort((a, b) => (a! < b! ? 1 : a! > b! ? -1 : 0));
    expect(tailDates).toEqual(sorted);

    // every card is a real note surface (the reasoner's travel target, notes-demo.e2e.ts)
    const surfaces = await cards.evaluateAll((els) => els.map((el) => el.getAttribute("data-surface")));
    for (const s of surfaces) expect(s).toMatch(/^note:[a-z0-9-]+$/);

    await expect(page.locator("[data-ai-run]")).toBeVisible();
  });

  test("the feed controls reveal once the island is live", async ({ page }) => {
    await page.goto("/notes");
    await expect(page.locator("[data-feed-controls]")).toBeVisible();
  });

  test("Top sorts cards by their reading-minutes score, descending (pinned flagship still leads)", async ({ page }) => {
    await page.goto("/notes");
    const cards = page.locator(".note-card");

    const scoresBefore = (await cards.evaluateAll((els) => els.map((el) => Number(el.getAttribute("data-score")))));
    expect(new Set(scoresBefore).size).toBeGreaterThan(1);   // the notes really do carry distinct scores

    await page.locator('input[name="sort"][value="top"]').check();

    // the pin floats the flagship to the front in Top too; the REST is score-descending
    const rows = await cards.evaluateAll((els) => els.map((el) => ({ score: Number(el.getAttribute("data-score")), pinned: el.hasAttribute("data-pinned") })));
    expect(rows[0]!.pinned).toBe(true);
    const tailScores = rows.filter((r) => !r.pinned).map((r) => r.score);
    expect(tailScores).toEqual([...tailScores].sort((a, b) => b - a));
    expect(tailScores[0]).toBe(Math.max(...tailScores));   // the highest-scoring non-pinned note leads the tail
  });

  test("a tag chip filters the feed to matching cards", async ({ page }) => {
    await page.goto("/notes");

    const firstTagCheckbox = page.locator('.chips[aria-label="Filter by tag"] input[type="checkbox"]').first();
    const tag = await firstTagCheckbox.getAttribute("value");
    await firstTagCheckbox.check();

    const visibleCards = page.locator(".note-card:not([hidden])");
    const count = await visibleCards.count();
    expect(count).toBeGreaterThan(0);
    const tagsOfVisible = await visibleCards.evaluateAll((els) => els.map((el) => el.getAttribute("data-tags") ?? ""));
    for (const t of tagsOfVisible) expect(t.split(" ")).toContain(tag);

    const hiddenCount = await page.locator(".note-card[hidden]").count();
    expect(hiddenCount).toBeGreaterThan(0);   // the filter actually hides something (mixed tag set)
  });

  test("a ?tag= deep link pre-checks the matching chip and filters the feed (résumé → tagged notes)", async ({ page }) => {
    // discover a real tag from the rendered chips, then arrive at the shareable filtered URL
    await page.goto("/notes");
    const tag = await page.locator('.chips[aria-label="Filter by tag"] input[type="checkbox"]').first().getAttribute("value");
    expect(tag).toBeTruthy();

    await page.goto(`/notes?tag=${tag}`);
    await expect(page.locator("[data-feed-controls]")).toBeVisible();   // island is live
    // the chip is checked on arrival
    await expect(page.locator(`.chips[aria-label="Filter by tag"] input[value="${tag}"]`)).toBeChecked();
    // and the feed is filtered to matching cards, no empty state
    const visible = page.locator(".note-card:not([hidden])");
    expect(await visible.count()).toBeGreaterThan(0);
    const tagsOfVisible = await visible.evaluateAll((els) => els.map((el) => el.getAttribute("data-tags") ?? ""));
    for (const t of tagsOfVisible) expect(t.split(" ")).toContain(tag);
    await expect(page.locator("[data-feed-empty]")).toBeHidden();
  });

  test("a ?tag= for a tag with no notes yet shows the empty state and keeps the full list", async ({ page }) => {
    const totalBefore = await (async () => { await page.goto("/notes"); return page.locator(".note-card").count(); })();

    await page.goto("/notes?tag=no-such-tag-yet");
    const empty = page.locator("[data-feed-empty]");
    await expect(empty).toBeVisible();
    await expect(empty).toContainText("no-such-tag-yet");
    // an unknown tag filters nothing — the full list stays visible
    expect(await page.locator(".note-card:not([hidden])").count()).toBe(totalBefore);
  });

  test("changing the tag filter mirrors the selection into the URL (shareable ?tag=)", async ({ page }) => {
    await page.goto("/notes");
    const box = page.locator('.chips[aria-label="Filter by tag"] input[type="checkbox"]').first();
    const tag = await box.getAttribute("value");
    await box.check();
    await expect(page).toHaveURL(new RegExp(`\\?tag=${tag}$`));
    await box.uncheck();
    await expect(page).toHaveURL(/\/notes$/);   // clearing the filter drops the query
  });

  test("a card's title links into its MILL entry, and the entry renders", async ({ page }) => {
    await page.goto("/notes");
    const firstLink = page.locator(".note-card__title a").first();
    const href = await firstLink.getAttribute("href");
    expect(href).toMatch(/^\/notes\/[a-z0-9-]+$/);

    await firstLink.click();
    await expect(page).toHaveURL(new RegExp(href!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$"));
    // the entry is a real MILL page (not the feed) — it carries the Rendered/Source toggle
    await expect(page.locator(".content-source")).toBeVisible();
  });
});

test.describe("the /notes feed (no JS)", () => {
  test.use({ javaScriptEnabled: false });

  test("renders the pinned flagship first then newest-first, controls hidden, no island required", async ({ page }) => {
    await page.goto("/notes");

    const cards = page.locator(".note-card");
    await expect(cards.first()).toBeVisible();
    // the server already renders the pin (no JS): flagship first, the rest newest-first
    const rows = await cards.evaluateAll((els) => els.map((el) => ({ date: el.getAttribute("data-date"), pinned: el.hasAttribute("data-pinned") })));
    expect(rows[0]!.pinned).toBe(true);
    const tailDates = rows.filter((r) => !r.pinned).map((r) => r.date);
    const sorted = [...tailDates].sort((a, b) => (a! < b! ? 1 : a! > b! ? -1 : 0));
    expect(tailDates).toEqual(sorted);

    await expect(page.locator("[data-feed-controls]")).toBeHidden();
  });

  test("a ?tag= query is ignored without JS: full list, controls and empty state hidden", async ({ page }) => {
    await page.goto("/notes?tag=no-such-tag-yet");
    const cards = page.locator(".note-card");
    await expect(cards.first()).toBeVisible();
    expect(await page.locator(".note-card:not([hidden])").count()).toBe(await cards.count());
    await expect(page.locator("[data-feed-controls]")).toBeHidden();
    await expect(page.locator("[data-feed-empty]")).toBeHidden();
  });
});
