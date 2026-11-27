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
    await expect(cards.first()).toHaveAttribute("data-surface", "note:ten-times-zero");   // the flagship, pinned
    await expect(cards.first()).toHaveAttribute("data-pinned", "");

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

  test("the flagship note leads into the stack, teaching, and talks", async ({ page }) => {
    await page.goto("/notes");
    const cards = page.locator(".note-card");
    const paths = page.getByRole("navigation", { name: "Explore the work behind the notes" });

    await expect(cards.first()).toHaveAttribute("data-pinned", "");
    await expect(paths).toBeVisible();
    await expect(paths.getByRole("link", { name: "The stack" })).toHaveAttribute("href", "/bread");
    await expect(paths.getByRole("link", { name: "Teaching" })).toHaveAttribute("href", "/teaching");
    await expect(paths.getByRole("link", { name: "Talks" })).toHaveAttribute("href", "/talks");

    const [flagshipPosition, pathsPosition, nextNotePosition] = await page.evaluate(() => {
      const list = document.querySelector(".note-feed")!;
      const flagship = list.querySelector(".note-card--pinned")!;
      const pathItem = list.querySelector(".notes-paths")!;
      const nextNote = flagship.nextElementSibling?.nextElementSibling ?? null;
      return [
        Array.prototype.indexOf.call(list.children, flagship),
        Array.prototype.indexOf.call(list.children, pathItem),
        Array.prototype.indexOf.call(list.children, nextNote),
      ];
    });
    expect(flagshipPosition).toBeLessThan(pathsPosition);
    expect(pathsPosition).toBeLessThan(nextNotePosition);

    await page.locator('input[name="sort"][value="top"]').check();
    const [sortedFlagshipPosition, sortedPathsPosition] = await page.evaluate(() => {
      const list = document.querySelector(".note-feed")!;
      return [
        Array.prototype.indexOf.call(list.children, list.querySelector(".note-card--pinned")),
        Array.prototype.indexOf.call(list.children, list.querySelector(".notes-paths")),
      ];
    });
    expect(sortedFlagshipPosition).toBeLessThan(sortedPathsPosition);
  });

  test("story notes link directly to the project evidence they describe", async ({ page }) => {
    const paths = [
      ["/notes/feels-like-an-app", "/bread"],
      ["/notes/how-i-turned-github-into-a-classroom", "/native-github-classroom"],
      ["/notes/origin-story", "/batch"],
      ["/notes/origin-story", "/grain"],
      ["/notes/origin-story", "/mill"],
      ["/notes/one-loop-every-repo", "/proof"],
      ["/notes/one-loop-every-repo", "/plans"],
      ["/notes/the-browser-grew-up", "https://portfolio.tjakoen.com/framework-bench/"],
      ["/notes/the-browser-grew-up", "https://github.com/tjakoen/framework-bench"],
      ["/notes/the-check-that-never-ran", "https://github.com/tjakoen/pantry/blob/main/cli.ts"],
      ["/notes/the-console-i-built-to-stop-drowning", "/native-github-classroom"],
      ["/notes/the-console-i-built-to-stop-drowning", "/teaching"],
      ["/notes/watch-its-hands", "/grain#surface-demo"],
      ["/notes/whitepaper-one-vocabulary", "/notes/watch-its-hands"],
      ["/notes/why-i-teach", "/teaching"],
      ["/notes/why-i-teach", "/badges"],
    ] as const;

    await page.setViewportSize({ width: 390, height: 844 });
    for (const [route, destination] of paths) {
      await page.goto(route);
      const link = page.locator(`main a[href="${destination}"]`).first();
      await expect(link).toBeVisible();
      const board = page.locator("main .board");
      expect(await board.evaluate((el) => el.scrollWidth)).toBeLessThanOrEqual(await board.evaluate((el) => el.clientWidth));
    }
  });

  test("phone readers can open topic filters without losing the reading path", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/notes");
    const filters = page.locator("[data-tag-filters]");
    await expect(filters).toBeVisible();
    await expect(filters).not.toHaveAttribute("open", "");
    await expect(filters.locator("summary")).toHaveText("Filter by tag");
    await filters.locator("summary").click();
    await expect(filters).toHaveAttribute("open", "");
    await expect(page.locator('.chips[aria-label="Filter by tag"] input[type="checkbox"]:not([name="level"])').first()).toBeVisible();
  });

  test("the feed controls reveal once the island is live", async ({ page }) => {
    await page.goto("/notes");
    await expect(page.locator("[data-feed-controls]")).toBeVisible();
  });

  test("the feed scrolls inside the main pane, not the document", async ({ page }) => {
    await page.goto("/notes");
    await expect(page.locator(".app-shell__main")).toBeVisible();
    await page.mouse.move(400, 400);          // inside the main pane, over the feed
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    expect(await page.evaluate(() => document.querySelector(".app-shell__main")!.scrollTop)).toBeGreaterThan(0);
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
    await page.locator("[data-tag-filters]").evaluate((el) => { (el as HTMLDetailsElement).open = true; });

    const firstTagCheckbox = page.locator('.chips[aria-label="Filter by tag"] input[type="checkbox"]:not([name="level"])').first();
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
    const tag = await page.locator('.chips[aria-label="Filter by tag"] input[type="checkbox"]:not([name="level"])').first().getAttribute("value");
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
    await page.locator("[data-tag-filters]").evaluate((el) => { (el as HTMLDetailsElement).open = true; });
    const box = page.locator('.chips[aria-label="Filter by tag"] input[type="checkbox"]:not([name="level"])').first();
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

test.describe("the AI roadmap tab on /notes", () => {
  test("it groups the published notes by stage in the learning path's order, and leaves the feed controls out of the way", async ({ page }) => {
    await page.goto("/notes");
    const tab = page.locator('.notes-audience__tab:has(input[value="path"])');
    await expect(tab).toContainText("AI roadmap");
    const path = page.locator("[data-learn-path]");
    await expect(path).toBeHidden();
    await tab.click();
    await expect(path).toBeVisible();
    // the feed steps aside, and so do the sort and tag controls that would contradict the order
    await expect(page.locator(".note-card").first()).toBeHidden();
    await expect(page.locator(".notes-sort")).toBeHidden();
    // stages in ascending order, quest numbers ascending across the whole page, every note a real link
    const stages = await page.locator(".learn-stage__h").evaluateAll((els) => els.map((e) => Number(/Stage (\d+)/.exec(e.textContent ?? "")![1])));
    expect(stages.length).toBeGreaterThan(1);
    expect(stages).toEqual([...stages].sort((a, b) => a - b));
    const nos = await page.locator("[data-learn-card] .note-card__byline").evaluateAll((els) => els.map((e) => Number(/Quest (\d+) of/.exec(e.textContent ?? "")![1])));
    expect(nos).toEqual([...nos].sort((a, b) => a - b));
    for (const href of await page.locator("[data-learn-card] .note-card__title a").evaluateAll((els) => els.map((e) => e.getAttribute("href")))) expect(href).toMatch(/^\/notes\/[a-z0-9-]+$/);
    // the tab's count is the number of notes it lists
    await expect(tab.locator(".notes-audience__n")).toHaveText(String(nos.length));
    // search narrows it, and an emptied stage disappears
    await page.locator("[data-notes-search]").fill("zzzz-no-such-note");
    await expect(page.locator("[data-learn-card]:visible")).toHaveCount(0);
    await expect(page.locator("[data-learn-stage]:visible")).toHaveCount(0);
    // back on All, the feed and its controls return and the path is gone
    await page.locator("[data-notes-search]").fill("");
    await page.locator('.notes-audience__tab:has(input[value=""])').click();
    await expect(path).toBeHidden();
    await expect(page.locator(".notes-sort")).toBeVisible();
  });

  test("?for=path opens on the AI roadmap tab", async ({ page }) => {
    await page.goto("/notes?for=path");
    await expect(page.locator("[data-learn-path]")).toBeVisible();
    await expect(page.locator('.notes-audience__tab:has(input[value="path"]) input')).toBeChecked();
  });

  test("it has a jump bar that scrolls to each stage, and a button into the quest map", async ({ page }) => {
    await page.goto("/notes?for=path");
    const links = page.locator("[data-learn-jump]");
    const n = await links.count();
    expect(n).toBe(await page.locator("[data-learn-stage]").count());
    expect(n).toBeGreaterThan(1);
    // every link names its stage and its level, and points at a real stage
    for (let i = 0; i < n; i++) {
      await expect(links.nth(i)).toContainText(/Stage \d+/);
      await expect(links.nth(i)).toContainText(/Intro|Deep dive|Mixed/);
      const target = (await links.nth(i).getAttribute("href"))!;
      await expect(page.locator(target)).toHaveCount(1);
    }
    // choosing the last stage brings it into view without changing the address
    const last = links.nth(n - 1);
    const target = (await last.getAttribute("href"))!;
    const urlBefore = page.url();
    await last.click();
    await expect(page.locator(target)).toBeInViewport();
    expect(page.url()).toBe(urlBefore);
    // the quest map button is a plain link to /learn, with the words asked for
    const quest = page.locator(".learn-quest");
    await expect(quest).toContainText("Learn AI with me");
    await expect(quest).toHaveAttribute("href", "/learn");
  });
});
