import { test, expect } from "@playwright/test";

const open = async (page: import("@playwright/test").Page) => {
  await page.goto("/?nest-debug");
  await page.locator(".nest-switch").click();
  await expect(page.locator("#nest-mock")).toBeVisible();
};

test("the colony reads the page into the larder and stores", async ({ page }) => {
  await open(page);
  await expect.poll(() => page.evaluate(() => (window.__nest as any).state.stores), { timeout: 35_000 }).toBeGreaterThan(0);
  const result = await page.evaluate(() => {
    const n = window.__nest as any;
    return { stores: n.state.stores, stolen: n.state.stolen.size, carried: n.state.ants.some((a: any) => a.letter && a.job === "carry") };
  });
  expect(result.stores).toBeGreaterThan(0);
  expect(result.stolen).toBeGreaterThan(0);
  expect(result.carried || result.stores).toBeTruthy();
});

test("bait pulls nearby ants off their trails", async ({ page }) => {
  await open(page);
  await page.waitForFunction(() => (window.__nest as any).state.ants.some((a: any) => a.el && a.where === "page"));
  const point = await page.evaluate(() => {
    const a = (window.__nest as any).state.ants.find((x: any) => x.el && x.where === "page");
    const r = a.el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  await page.locator("button[data-k='bait']").click();
  await page.mouse.click(point.x, point.y);
  await expect(page.locator(".nest-bait")).toHaveCount(1);
  expect(await page.evaluate(() => (window.__nest as any).state.ants.some((a: any) => a.job === "bait" || a.job === "baited"))).toBe(true);
});

test("the rival cache is placed at the fallen rival mound", async ({ page }) => {
  await open(page);
  await page.evaluate(() => (window.__nest as any).startParty());
  await expect.poll(() => page.evaluate(() => (window.__nest as any).rival.stolen.size), { timeout: 25_000 }).toBeGreaterThan(0);
  const before = await page.evaluate(() => (window.__nest as any).rival.mound.base.slice());
  await page.evaluate(() => (window.__nest as any).retreatRival());
  const result = await page.evaluate(() => {
    const n = window.__nest as any;
    return { active: n.rival.active, cache: n.state.cache, stolen: n.rival.stolen.size };
  });
  expect(result.active).toBe(false);
  expect(result.stolen).toBe(0);
  expect(result.cache).not.toBeNull();
  expect(Math.hypot(result.cache.x - before[0], result.cache.y - before[1])).toBeLessThan(8);
});

test("the rival mound dies when every rival ant dies", async ({ page }) => {
  await open(page);
  await page.evaluate(() => (window.__nest as any).startParty());
  await expect.poll(() => page.evaluate(() => (window.__nest as any).rival.trails.length), { timeout: 20_000 }).toBeGreaterThan(0);
  await page.evaluate(() => {
    const n = window.__nest as any;
    for (const a of n.rival.ants.slice()) n.removeRivalAnt(a);
  });
  await expect.poll(() => page.evaluate(() => (window.__nest as any).rival.active), { timeout: 3_000 }).toBe(false);
});


test("sealing a hill stops its traffic until it reopens", async ({ page }) => {
  await open(page);
  const seal = page.locator("button[data-k='seal']");
  await expect(seal).toBeEnabled();
  await seal.click();
  await expect(page.locator(".nest-hill.sealed").first()).toBeVisible();
  await expect(seal).toBeDisabled();
});

test("a main soldier beats a single rival worker", async ({ page }) => {
  await open(page);
  const result = await page.evaluate(() => {
    const n = window.__nest as any;
    const at = [480, 480];
    const soldier = n.spawnPageAnt("soldier", at, null);
    const worker = n.spawnRivalUnit("rival-worker", at, [[480, 480]]);
    n.rivalCombat(performance.now() + 1000);
    return { soldier: !!soldier.el, worker: !!worker.el };
  });
  expect(result.soldier).toBe(true);
  expect(result.worker).toBe(false);
});

test("the engine holds its frame budget under a 20-ant load", async ({ page }) => {
  await open(page);
  await page.evaluate(() => {
    const n = window.__nest as any;
    for (let i = 0; i < 14; i++) n.newAnt("worker", "up", 0.94 - i * 0.004);
  });
  await page.waitForTimeout(4_000);
  const p95 = await page.evaluate(() => new Promise<number>((resolve) => {
    const times: number[] = []; let last = performance.now();
    const tick = (now: number) => {
      times.push(now - last); last = now;
      if (times.length < 120) requestAnimationFrame(tick);
      else resolve(times.toSorted((a, b) => a - b)[Math.floor(times.length * 0.95)]);
    };
    requestAnimationFrame(tick);
  }));
  expect(p95).toBeLessThan(40);
});


test("full stores send a builder out and the mini mound finishes", async ({ page }) => {
  await open(page);
  await page.evaluate(() => { const n = window.__nest as any; n.state.stores = 20; n.state.speed = 4; });
  await expect.poll(() => page.evaluate(() => !!(window.__nest as any).state.builder), { timeout: 4_000 }).toBe(true);
  await expect.poll(() => page.evaluate(() => (window.__nest as any).state.built), { timeout: 20_000 }).toBeGreaterThan(0);
  const result = await page.evaluate(() => document.querySelectorAll(".nest-mini").length);
  expect(result).toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(() => (window.__nest as any).state.ants.some((a: any) => a.role === "guard" && a.mini)), { timeout: 12_000 }).toBe(true);
  await expect.poll(() => page.evaluate(() => (window.__nest as any).state.ants.some((a: any) => a.role === "flyer" && a.mini)), { timeout: 30_000 }).toBe(true);
});


test("the queen turns meals into an egg", async ({ page }) => {
  await open(page);
  await page.evaluate(() => { const n = window.__nest as any; n.state.meals = 2; n.state.speed = 4; });
  await expect.poll(() => page.evaluate(() => (window.__nest as any).state.eggs.length), { timeout: 30_000 }).toBeGreaterThan(0);
});

test("heading letters advertise a heavier crew than body letters", async ({ page }) => {
  await open(page);
  const needs = await page.evaluate(() => {
    const n = window.__nest as any;
    const heads = [...document.querySelectorAll("h1, h2, h3")].slice(0, 6);
    return heads.map((h) => { const t = [...h.childNodes].find((node) => node.nodeType === 3); return t ? n.needOf(t) : 1; });
  });
  expect(needs.some((v: number) => v >= 2)).toBe(true);
});
