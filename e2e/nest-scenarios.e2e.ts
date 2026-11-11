import { test, expect } from "@playwright/test";

const open = async (page: import("@playwright/test").Page) => {
  await page.goto("/?nest-debug");
  await page.locator(".nest-switch").click();
  await expect(page.locator("#nest-mock")).toBeVisible();
};

test("the rival waits for the first worship, builds with builders, then opens curved trails", async ({ page }) => {
  await open(page);
  expect(await page.evaluate(() => (window.__nest as any).rival.active)).toBe(false);
  const before = await page.evaluate(() => {
    const nest = window.__nest as any;
    nest.startRival();
    return nest.rival.ants.map((ant: any) => ({ id: ant.id, x: ant.x, y: ant.y }));
  });
  expect(before).toHaveLength(3);
  await expect.poll(() => page.evaluate((initial: { id: number; x: number; y: number }[]) =>
    (window.__nest as any).rival.ants.some((ant: any) => {
      const origin = initial.find((entry) => entry.id === ant.id);
      return origin && Math.hypot(ant.x - origin.x, ant.y - origin.y) > 5;
    }), before)).toBe(true);
  await expect(page.locator(".nest-hill.rival.constructing").first()).toBeVisible();
  await expect.poll(() => page.evaluate(() => {
    const nest = window.__nest as any;
    return nest.rival.trails.length === 1 && nest.rival.ants.filter((ant: any) => ant.job !== "rival-build").length === 1;
  }), { timeout: 10000, intervals: [50, 100, 150] }).toBe(true);
  await expect(page.locator(".rival-mini.constructing").first()).toBeVisible({ timeout: 20000 });
  await expect.poll(() => page.evaluate(() => (window.__nest as any).rival.trails.length), { timeout: 45_000 }).toBeGreaterThanOrEqual(3);
  await expect.poll(() => page.evaluate(() => (window.__nest as any).rival.minis.length), { timeout: 30_000 }).toBeGreaterThanOrEqual(1);
  const rival = await page.evaluate(() => {
    const n = window.__nest as any;
    return {
      minis: n.rival.minis.map((m: any) => m.base),
      trails: n.rival.trails.map((t: any) => ({ pts: t.pts.length, first: t.pts[0], last: t.pts[t.pts.length - 1] })),
      home: n.home.base,
    };
  });
  expect(rival.minis.length).toBeGreaterThanOrEqual(1);
  if (rival.minis.length > 1) {
    expect(Math.hypot(rival.minis[0][0] - rival.minis[1][0], rival.minis[0][1] - rival.minis[1][1])).toBeGreaterThan(80);
  }
  expect(rival.trails.every((t: any) => t.pts > 20)).toBe(true);
  expect(rival.trails.every((t: any) => t.first[0] !== t.last[0])).toBe(true);
  expect(new Set(rival.trails.map((t: any) => `${Math.round(t.last[0])},${Math.round(t.last[1])}`)).size).toBe(3);
  await expect.poll(() => page.evaluate(() => Number(document.querySelector("[data-k='rivals']")?.textContent) === (window.__nest as any).rival.ants.length)).toBe(true);
});


test("the rival runs without runtime errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await open(page);
  await page.evaluate(() => (window.__nest as any).startRival());
  await expect.poll(() => page.evaluate(() => (window.__nest as any).rival.trails.length), { timeout: 25_000 }).toBeGreaterThan(0);
  await page.waitForTimeout(8_000);
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => (window.__nest as any).state.ants.filter((a: any) => a.side !== "rival").length)).toBeGreaterThan(0);
});


test("the first worship does not spawn the rival; the second does", async ({ page }) => {
  await open(page);
  await page.evaluate(() => (window.__nest as any).startParty());
  await expect.poll(() => page.evaluate(() => !!(window.__nest as any).state.party), { timeout: 15_000 }).toBe(false);
  expect(await page.evaluate(() => (window.__nest as any).rival.active)).toBe(false);
  await page.evaluate(() => (window.__nest as any).startParty());
  await expect.poll(() => page.evaluate(() => (window.__nest as any).rival.active), { timeout: 25_000 }).toBe(true);
});


test("rival workers shelter during worship while guards and soldiers keep fighting", async ({ page }) => {
  await open(page);
  const combat = await page.evaluate(() => {
    const nest = window.__nest as any;
    nest.startRival();
    nest.state.speed = 4;
    const at = [420, 420];
    const mainGuard = nest.spawnPageAnt("guard", [600, 420], null);
    const soldier = nest.spawnPageAnt("soldier", at, null);
    const rivalGuard = nest.spawnRivalUnit("rival-guard", at, [at]);
    nest.startParty();
    nest.rivalCombat(performance.now() + 1000);
    const fighting = !!soldier.fightUntil && !!rivalGuard.fightUntil;
    nest.finishFights();
    return {
      fighting,
      resolved: !soldier.el || !rivalGuard.el,
      mainGuardDancing: nest.state.party.dancers.includes(mainGuard),
    };
  });
  expect(combat).toEqual({ fighting: true, resolved: true, mainGuardDancing: false });
  await page.evaluate(() => {
    const nest = window.__nest as any;
    const [x, y] = nest.rival.mound.hole;
    nest.spawnRivalUnit("rival-guard", [x + 70, y], [[x + 100, y]]);
  });
  await expect.poll(() => page.evaluate(() => {
    const nest = window.__nest as any;
    const [x, y] = nest.rival.mound.hole;
    return !!nest.state.party && nest.rival.ants.some((ant: any) => ant.role !== "guard") &&
      nest.rival.ants.every((ant: any) => ant.role === "guard"
        ? !ant.el.hidden : ant.el.hidden && Math.hypot(ant.x - x, ant.y - y) < 2);
  }), { timeout: 6000 }).toBe(true);
  await expect.poll(() => page.evaluate(() => {
    const nest = window.__nest as any;
    return !nest.state.party && nest.rival.ants.length > 0 && nest.rival.ants.every((ant: any) => !ant.el.hidden);
  }), { timeout: 20000 }).toBe(true);
});

test("Seal closes both colony entrances and holds rival departures until reopening", async ({ page }) => {
  await open(page);
  await page.evaluate(() => {
    const nest = window.__nest as any;
    nest.state.speed = 4;
    nest.startRival();
  });
  await expect.poll(() => page.evaluate(() => !(window.__nest as any).rival.founding)).toBe(true);
  await page.locator("button[data-k='seal']").click();
  await expect(page.locator(".nest-hill:not(.rival).sealed").first()).toBeAttached();
  await expect(page.locator(".nest-hill.rival.sealed")).toBeAttached();
  const nextExit = () => page.evaluate(() => (window.__nest as any).rival.nextExit);
  const due = await nextExit();
  expect(await page.evaluate(() => (window.__nest as any).rival.exits.length)).toBeGreaterThan(0);
  await page.waitForFunction((time) => performance.now() > time, due);
  expect(await nextExit()).toBe(due);
  await expect(page.locator(".nest-hill.rival.sealed")).toHaveCount(0, { timeout: 10_000 });
  await expect.poll(nextExit).toBeGreaterThan(due);
});
