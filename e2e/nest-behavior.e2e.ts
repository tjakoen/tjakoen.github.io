import { test, expect } from "@playwright/test";

test("two workers can overwhelm a rival guard", async ({ page }) => {
  await page.goto("/?nest-debug");
  await page.locator(".nest-switch").click();
  await expect(page.locator("#nest-mock")).toBeVisible();
  const result = await page.evaluate(() => {
    const n = window.__nest as any;
    const at = [420, 420];
    n.spawnPageAnt("worker", at, null);
    n.spawnPageAnt("worker", at, null);
    const guard = n.spawnRivalUnit("rival-guard", at, [[420, 420]], null);
    n.rivalCombat(performance.now() + 1000);
    return { guardEl: !!guard.el, remaining: n.rival.ants.length };
  });
  expect(result.guardEl).toBe(false);
  expect(result.remaining).toBe(0);
});

test("one worker cannot remove a rival guard", async ({ page }) => {
  await page.goto("/?nest-debug");
  await page.locator(".nest-switch").click();
  await expect(page.locator("#nest-mock")).toBeVisible();
  const result = await page.evaluate(() => {
    const n = window.__nest as any;
    const at = [440, 440];
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
    const guard = n.spawnRivalUnit("rival-guard", [980, 500], [[980, 500], [1020, 500]], null);
    n.spawnPageAnt("soldier", [900, 500], null);
    await new Promise((r) => setTimeout(r, 400));
    return guard.job;
  });
  expect(job).toBe("rival-defend");
});


test("a rival cannot camp the main nest and kill the restart scout", async ({ page }) => {
  await page.goto("/?nest-debug");
  await page.locator(".nest-switch").click();
  await expect(page.locator("#nest-mock")).toBeVisible();
  const alive = await page.evaluate(async () => {
    const n = window.__nest as any;
    const at = n.home.hole;
    const scout = n.spawnPageAnt("scout", [at[0], at[1]], null);
    n.spawnRivalUnit("rival-guard", [at[0] + 42, at[1]], [[at[0] + 42, at[1]]], null);
    await new Promise((r) => setTimeout(r, 500));
    return n.state.ants.includes(scout);
  });
  expect(alive).toBe(true);
});


test("a main soldier beats a rival guard one-on-one", async ({ page }) => {
  await page.goto("/?nest-debug");
  await page.locator(".nest-switch").click();
  await expect(page.locator("#nest-mock")).toBeVisible();
  const result = await page.evaluate(() => {
    const n = window.__nest as any;
    const at = [900, 500];
    const soldier = n.spawnPageAnt("soldier", at, null);
    const guard = n.spawnRivalUnit("rival-guard", at, [[900, 500]], null);
    n.rivalCombat(performance.now() + 1000);
    return { soldier: !!soldier.el, guard: !!guard.el };
  });
  expect(result.soldier).toBe(true);
  expect(result.guard).toBe(false);
});
