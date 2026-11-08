import { test, expect } from "@playwright/test";

test("three workers can overwhelm a rival guard", async ({ page }) => {
  await page.goto("/?nest-debug");
  await page.locator(".nest-switch").click();
  await expect(page.locator("#nest-mock")).toBeVisible();
  const result = await page.evaluate(() => {
    const n = window.__nest as any;
    const at = [420, 420];
    n.spawnPageAnt("worker", at, null);
    n.spawnPageAnt("worker", at, null);
    n.spawnPageAnt("worker", at, null);
    const guard = n.spawnRivalUnit("rival-guard", at, [[420, 420]], null);
    n.rivalCombat(performance.now() + 1000);
    return { guardEl: !!guard.el, remaining: n.rival.ants.length };
  });
  expect(result.guardEl).toBe(false);
  expect(result.remaining).toBe(0);
});

test("two workers cannot remove a rival guard", async ({ page }) => {
  await page.goto("/?nest-debug");
  await page.locator(".nest-switch").click();
  await expect(page.locator("#nest-mock")).toBeVisible();
  const result = await page.evaluate(() => {
    const n = window.__nest as any;
    const at = [440, 440];
    n.spawnPageAnt("worker", at, null);
    n.spawnPageAnt("worker", at, null);
    n.spawnRivalUnit("rival-guard", at, [[440, 440]], null);
    n.rivalCombat(performance.now() + 1000);
    return { guardEl: !!n.rival.ants[0]?.el, remaining: n.rival.ants.length };
  });
  expect(result.guardEl).toBe(true);
  expect(result.remaining).toBe(1);
});


test("staged combat does not throw frame errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/?nest-debug");
  await page.locator(".nest-switch").click();
  await expect(page.locator("#nest-mock")).toBeVisible();
  await page.evaluate(() => {
    const n = window.__nest as any;
    n.spawnPageAnt("soldier", [420, 420], null);
    n.spawnRivalUnit("rival-guard", [420, 420], [[420, 420]]);
  });
  await page.waitForTimeout(600);
  expect(errors).toEqual([]);
});


test("a rival guard breaks patrol to defend against a main intruder", async ({ page }) => {
  await page.goto("/?nest-debug");
  await page.locator(".nest-switch").click();
  await expect(page.locator("#nest-mock")).toBeVisible();
  const job = await page.evaluate(async () => {
    const n = window.__nest as any;
    const guard = n.spawnRivalUnit("rival-guard", [500, 420], [[500, 420], [540, 420]], null);
    n.spawnPageAnt("soldier", [430, 420], null);
    await new Promise((r) => setTimeout(r, 400));
    return guard.job;
  });
  expect(job).toBe("rival-defend");
});
