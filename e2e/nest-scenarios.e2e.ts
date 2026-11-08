import { test, expect } from "@playwright/test";

const open = async (page: import("@playwright/test").Page) => {
  await page.goto("/?nest-debug");
  await page.locator(".nest-switch").click();
  await expect(page.locator("#nest-mock")).toBeVisible();
};

test("the rival waits for the first worship, builds with builders, then opens curved trails", async ({ page }) => {
  await open(page);
  expect(await page.evaluate(() => (window.__nest as any).rival.active)).toBe(false);
  await page.evaluate(() => (window.__nest as any).startParty());
  await expect.poll(() => page.evaluate(() => (window.__nest as any).rival.active), { timeout: 20_000 }).toBe(true);
  await expect.poll(() => page.evaluate(() => (window.__nest as any).rival.ants.some((a: any) => a.job === "rival-build")), { timeout: 4_000 }).toBe(true);
  await expect.poll(() => page.evaluate(() => (window.__nest as any).rival.trails.length), { timeout: 10_000 }).toBeGreaterThanOrEqual(3);
  const rival = await page.evaluate(() => {
    const n = window.__nest as any;
    return {
      minis: n.rival.minis.map((m: any) => m.base),
      trails: n.rival.trails.map((t: any) => ({ pts: t.pts.length, first: t.pts[0], last: t.pts[t.pts.length - 1] })),
      home: n.home.base,
    };
  });
  expect(rival.minis).toHaveLength(2);
  expect(Math.hypot(rival.minis[0][0] - rival.minis[1][0], rival.minis[0][1] - rival.minis[1][1])).toBeGreaterThan(80);
  expect(rival.trails.every((t: any) => t.pts > 20)).toBe(true);
  expect(rival.trails.every((t: any) => t.first[0] !== t.last[0])).toBe(true);
});

test("the event cards are icon cards, not visible text", async ({ page }) => {
  await open(page);
  await page.evaluate(() => (window.__nest as any).spawnEnv("vacuum"));
  const vacuum = page.locator(".nest-event-card");
  await expect(vacuum).toBeVisible();
  expect((await vacuum.textContent())?.trim()).toBe("");
  await expect(vacuum.locator("svg")).toBeVisible();
  await page.evaluate(() => (window.__nest as any).spawnEnv("anteater"));
  const anteater = page.locator(".nest-event-card");
  await expect(anteater).toBeVisible();
  expect((await anteater.textContent())?.trim()).toBe("");
  await expect(anteater.locator("svg")).toBeVisible();
});
