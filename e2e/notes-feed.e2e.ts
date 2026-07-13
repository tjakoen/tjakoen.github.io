// portfolio/e2e/notes-feed.e2e.ts — CONFORMANCE: the /notes Reddit-style feed (Pass 1 — Notes,
// plans/drifting-pondering-brook.md). The route is a portfolio override (content.ts
// renderNotesFeedPage; the /notes collection opts OUT of MILL's own index serving), so this
// spec is the regression gate for that override: newest-first server order, the reasoner's
// travel targets (data-surface="note:<slug>"), the "See what's new" trigger notes-demo.e2e.ts
// depends on, and the New/Top/tag island — all as a pure DOM reorder/hide, no fetch.
import { test, expect } from "@playwright/test";

test.describe("the /notes feed (JS on)", () => {
  test("cards render newest-first, each carries a note surface, and the AI trigger is present", async ({ page }) => {
    await page.goto("/notes");

    const cards = page.locator(".note-card");
    await expect(cards.first()).toBeVisible();

    // newest-first: the first card's own date is >= every other card's date
    const dates = await cards.evaluateAll((els) => els.map((el) => el.getAttribute("data-date")));
    const sorted = [...dates].sort((a, b) => (a! < b! ? 1 : a! > b! ? -1 : 0));
    expect(dates).toEqual(sorted);

    // every card is a real note surface (the reasoner's travel target, notes-demo.e2e.ts)
    const surfaces = await cards.evaluateAll((els) => els.map((el) => el.getAttribute("data-surface")));
    for (const s of surfaces) expect(s).toMatch(/^note:[a-z0-9-]+$/);

    await expect(page.locator("[data-ai-run]")).toBeVisible();
  });

  test("the feed controls reveal once the island is live", async ({ page }) => {
    await page.goto("/notes");
    await expect(page.locator("[data-feed-controls]")).toBeVisible();
  });

  test("Top sorts cards by their reading-minutes score, descending", async ({ page }) => {
    await page.goto("/notes");
    const cards = page.locator(".note-card");

    const scoresBefore = (await cards.evaluateAll((els) => els.map((el) => Number(el.getAttribute("data-score")))));
    expect(new Set(scoresBefore).size).toBeGreaterThan(1);   // the notes really do carry distinct scores

    await page.locator('input[name="sort"][value="top"]').check();

    const scoresAfter = await cards.evaluateAll((els) => els.map((el) => Number(el.getAttribute("data-score"))));
    const sortedDesc = [...scoresAfter].sort((a, b) => b - a);
    expect(scoresAfter).toEqual(sortedDesc);
    expect(scoresAfter[0]).toBe(Math.max(...scoresBefore));
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

  test("renders newest-first with the controls hidden, no island required", async ({ page }) => {
    await page.goto("/notes");

    const cards = page.locator(".note-card");
    await expect(cards.first()).toBeVisible();
    const dates = await cards.evaluateAll((els) => els.map((el) => el.getAttribute("data-date")));
    const sorted = [...dates].sort((a, b) => (a! < b! ? 1 : a! > b! ? -1 : 0));
    expect(dates).toEqual(sorted);

    await expect(page.locator("[data-feed-controls]")).toBeHidden();
  });
});
