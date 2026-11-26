// e2e/learn.e2e.ts: the hidden /learn page. Reached only from the terminal, noindex, absent from the sitemap and search,
// with the shell panes tucked away, and the map inside it reads the #quest= and #stop= deep links.
import { test, expect, type Page } from "@playwright/test";

type Quest = { id: string; stops: string[] };
declare const QUESTS: Quest[];
declare const sel: { t: string; id?: string; i?: number };

const frameOf = async (page: Page) => {
  const handle = await page.locator("#learn-frame").elementHandle();
  const frame = await handle!.contentFrame();
  await frame!.evaluate(() => (window as unknown as { qmReady: Promise<void> }).qmReady);
  return frame!;
};

test("learn opens the map from the terminal and is not advertised", async ({ page, request }) => {
  const res = await page.request.get("/learn");
  expect(res.status()).toBe(200);
  expect(await res.text()).toContain('content="noindex, nofollow"');
  expect(await (await request.get("/sitemap.xml")).text()).not.toMatch(/\/learn\/?<\/loc>/);
  expect(await (await request.get("/search.json")).text()).not.toContain('"/learn');
  expect(await (await request.get("/learn-map/map.html")).headers()["x-robots-tag"]).toContain("noindex");
  expect((await request.get("/learn-map/..%2Fsrc%2Fserver.ts")).status()).toBe(404);

  await page.goto("/");
  await expect(page.locator(".console__cmd")).toBeAttached();
  await page.keyboard.press("Control+`");
  await expect(page.getByRole("link", { name: /learn/i })).toHaveCount(0);
  await page.locator('.console__cmd').fill("help");
  await page.locator('.console__cmd').press("Enter");
  await expect(page.locator('[data-surface="console"]')).not.toContainText("open the learning map");
  await page.locator('.console__cmd').fill("learn");
  await page.locator('.console__cmd').press("Enter");
  await expect(page).toHaveURL(/\/learn$/);
  await expect(page.locator('.tab-bar a[href="/learn"]')).toBeVisible();
});

test("the shell steps aside on arrival, and the sidebar can come back", async ({ page }) => {
  await page.goto("/learn");
  const shell = page.locator(".app-shell");
  await expect(shell).toHaveAttribute("data-rail-collapsed", "true");
  await expect(shell).toHaveAttribute("data-aside-hidden", "true");
  await expect(shell).toHaveAttribute("data-console-hidden", "true");
  await expect(page.locator(".app-shell__aside")).toBeHidden();
  await page.locator('[data-shell="rail-toggle"]').first().click();
  await expect(shell).toHaveAttribute("data-rail-collapsed", "false");
  await expect(page.getByRole("link", { name: "Back to the site" })).toHaveAttribute("href", "/");
});

test("#quest=<id> and #stop=<id>.<n> fly to the place on load", async ({ page }) => {
  await page.goto("/learn");
  const quest = await (await frameOf(page)).evaluate(() => QUESTS.find((q) => q.stops.length >= 2)!);
  await page.goto(`/learn#quest=${quest.id}`);
  let frame = await frameOf(page);
  await expect.poll(() => frame.evaluate(() => sel.t + ":" + sel.id)).toBe(`quest:${quest.id}`);

  await page.goto(`/learn#stop=${quest.id}.2`);
  frame = await frameOf(page);
  await expect.poll(() => frame.evaluate(() => sel.t + ":" + sel.id + ":" + sel.i)).toBe(`stop:${quest.id}:1`);

  await page.goto("/learn#quest=no-such-quest");
  frame = await frameOf(page);
  expect(await frame.evaluate(() => sel.t)).not.toBe("quest");
});
