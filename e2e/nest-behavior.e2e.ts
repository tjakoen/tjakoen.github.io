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
    n.rivalCombat(performance.now() + 1000); n.finishFights();
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
    n.rivalCombat(performance.now() + 1000); n.finishFights();
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


test("a main guard wins 60 percent of rival guard duels", async ({ page }) => {
  await page.goto("/?nest-debug");
  await page.locator(".nest-switch").click();
  await expect(page.locator("#nest-mock")).toBeVisible();
  const result = await page.evaluate(() => {
    const n = window.__nest as any;
    const run = (roll: number, at: [number, number], now: number) => {
      const old = Math.random; Math.random = () => roll;
      const m = n.spawnPageAnt("guard", at, null);
      const r = n.spawnRivalUnit("rival-guard", at, [[at[0], at[1]]], null);
      n.rivalCombat(now); n.finishFights();
      Math.random = old;
      return { main: !!m.el, rival: !!r.el };
    };
    return { win: run(0.3, [900, 500], performance.now() + 1000), lose: run(0.7, [920, 520], performance.now() + 5000) };
  });
  expect(result.win).toEqual({ main: true, rival: false });
  expect(result.lose).toEqual({ main: false, rival: true });
});


test("repeated combat scans only roll a guard duel once", async ({ page }) => {
  await page.goto("/?nest-debug");
  await page.locator(".nest-switch").click();
  await expect(page.locator("#nest-mock")).toBeVisible();
  const outcome = await page.evaluate(() => {
    const nest = window.__nest as any;
    const at: [number, number] = [900, 500];
    const main = nest.spawnPageAnt("guard", at, null);
    const rival = nest.spawnRivalUnit("rival-guard", at, [at], null);
    const random = Math.random;
    let rolls = 0;
    Math.random = () => rolls++ === 0 ? 0.8 : 0.2;
    try {
      const now = performance.now() + 1000;
      nest.rivalCombat(now);
      nest.rivalCombat(now + 350);
      nest.rivalCombat(now + 700);
      nest.finishFights();
      return { rolls, main: !!main.el, rival: !!rival.el };
    } finally {
      Math.random = random;
    }
  });
  expect(outcome).toEqual({ rolls: 1, main: false, rival: true });
});

test("a squashed rival cannot finish a pending duel", async ({ page }) => {
  await page.goto("/?nest-debug");
  await page.locator(".nest-switch").click();
  await expect(page.locator("#nest-mock")).toBeVisible();
  const mainSurvives = await page.evaluate(() => {
    const nest = window.__nest as any;
    const at: [number, number] = [900, 500];
    const main = nest.spawnPageAnt("guard", at, null);
    const rival = nest.spawnRivalUnit("rival-guard", at, [at], null);
    const random = Math.random;
    Math.random = () => 0.8;
    try {
      nest.rivalCombat(performance.now() + 1000);
      rival.el.click();
      nest.finishFights();
      return !!main.el;
    } finally {
      Math.random = random;
    }
  });
  expect(mainSurvives).toBe(true);
});

test("two rival guards overwhelm one main guard", async ({ page }) => {
  await page.goto("/?nest-debug");
  await page.locator(".nest-switch").click();
  await expect(page.locator("#nest-mock")).toBeVisible();
  const result = await page.evaluate(() => {
    const n = window.__nest as any;
    const at = [1000, 600];
    const m = n.spawnPageAnt("guard", at, null);
    n.spawnRivalUnit("rival-guard", at, [[at[0], at[1]]], null);
    n.spawnRivalUnit("rival-guard", at, [[at[0], at[1]]], null);
    n.rivalCombat(performance.now() + 1000); n.finishFights();
    return { main: !!m.el };
  });
  expect(result.main).toBe(false);
});


test("a main flyer wins 75 percent of rival flyer fights", async ({ page }) => {
  await page.goto("/?nest-debug");
  await page.locator(".nest-switch").click();
  await expect(page.locator("#nest-mock")).toBeVisible();
  const result = await page.evaluate(() => {
    const n = window.__nest as any;
    const run = (roll: number, at: [number, number], now: number) => {
      const old = Math.random; Math.random = () => roll;
      const m = n.spawnPageAnt("flyer", at, null);
      const r = n.spawnRivalUnit("rival-flyer", at, [[at[0], at[1]]], null);
      n.rivalCombat(now); n.finishFights();
      Math.random = old;
      return { main: !!m.el, rival: !!r.el };
    };
    return { win: run(0.7, [1100, 500], performance.now() + 1000), lose: run(0.9, [1120, 520], performance.now() + 5000) };
  });
  expect(result.win).toEqual({ main: true, rival: false });
  expect(result.lose).toEqual({ main: false, rival: true });
});


test("a fight animates open so another ant can join", async ({ page }) => {
  await page.goto("/?nest-debug");
  await page.locator(".nest-switch").click();
  await expect(page.locator("#nest-mock")).toBeVisible();
  await page.evaluate(() => {
    const n = window.__nest as any;
    const at = [500, 500];
    n.spawnPageAnt("worker", at, null);
    n.spawnPageAnt("worker", [510, 500], null);
    n.spawnRivalUnit("rival-guard", at, [[500, 500]], null);
    n.rivalCombat(performance.now() + 1000);
  });
  await expect(page.locator(".nest-ant.fighting")).toHaveCount(3);
  await page.waitForTimeout(1200);
  expect(await page.evaluate(() => (window.__nest as any).rival.ants.length)).toBe(0);
});


test("fighters walk apart, face each other and keep moving until the duel resolves", async ({ page }) => {
  await page.clock.install();
  await page.goto("/?nest-debug");
  await page.locator(".nest-switch").click();
  await expect(page.locator("#nest-mock")).toBeVisible();
  await page.clock.pauseAt(new Date((await page.evaluate(() => Date.now())) + 5000));
  await page.evaluate(() => {
    const nest = window.__nest as any;
    const at: [number, number] = [420, 340];
    nest.spawnPageAnt("guard", at, null);
    nest.spawnRivalUnit("rival-guard", at, [at], null);
    nest.rivalCombat(performance.now() + 1000);
  });
  const fighters = page.locator(".nest-ant.fighting");
  const positions = () => fighters.evaluateAll((ants) => ants.map((ant) => {
    const t = new DOMMatrixReadOnly(getComputedStyle(ant).transform);
    return { x: t.m41, y: t.m42, facingX: -t.a, facingY: -t.b };
  }));
  await page.clock.runFor(50);
  const early = await positions();
  await page.clock.runFor(400);
  const [main, rival] = await positions();
  expect(early).toHaveLength(2);
  expect(Math.hypot(early[0].x - early[1].x, early[0].y - early[1].y)).toBeLessThan(16);
  expect(Math.hypot(main.x - rival.x, main.y - rival.y)).toBeGreaterThan(22);
  expect(main.facingX * (rival.x - main.x) + main.facingY * (rival.y - main.y)).toBeGreaterThan(0);
  expect(rival.facingX * (main.x - rival.x) + rival.facingY * (main.y - rival.y)).toBeGreaterThan(0);
  await page.clock.runFor(130);
  expect(await positions()).not.toEqual([main, rival]);
});

test("workers leaving the same point form a moving trail queue", async ({ page }) => {
  await page.clock.install();
  await page.goto("/?nest-debug");
  await page.locator(".nest-switch").click();
  await expect(page.locator("#nest-mock")).toBeVisible();
  await page.clock.pauseAt(new Date((await page.evaluate(() => Date.now())) + 5000));
  const ids = await page.evaluate(() => {
    const nest = window.__nest as any;
    const trail = {};
    return Array.from({ length: 3 }, () => {
      const worker = nest.spawnPageAnt("worker", [240, 310], null);
      Object.assign(worker, { trail, job: "follow", heading: 0, path: [[440, 310]], k: 0 });
      return worker.id;
    });
  });
  await page.clock.runFor(1450);
  const row = await page.evaluate((workerIds) => workerIds.map((id) => {
    const worker = (window.__nest as any).state.ants.find((ant: any) => ant.id === id);
    return [worker.x, worker.y];
  }), ids);
  expect(row[2][0]).toBeGreaterThan(250);
  expect(row[0][0] - row[1][0]).toBeGreaterThanOrEqual(17.5);
  expect(row[1][0] - row[2][0]).toBeGreaterThanOrEqual(17.5);
  expect(row.every(([, y]) => Math.abs(y - 310) < 2)).toBe(true);
});


test("each attacker in a three-on-one fight faces the defender", async ({ page }) => {
  await page.clock.install();
  await page.goto("/?nest-debug");
  await page.locator(".nest-switch").click();
  await expect(page.locator("#nest-mock")).toBeVisible();
  await page.clock.pauseAt(new Date((await page.evaluate(() => Date.now())) + 5000));
  const ids = await page.evaluate(() => {
    const nest = window.__nest as any;
    const mains = [-10, 0, 10].map((offset) => nest.spawnPageAnt("guard", [395, 340 + offset], null));
    const rival = nest.spawnRivalUnit("rival-guard", [415, 340], [[415, 340]], null);
    nest.rivalCombat(performance.now() + 1000);
    return { mains: mains.map((ant) => ant.id), rival: rival.id };
  });
  await page.clock.runFor(620);
  const facing = await page.evaluate((fighters) => {
    const ants = (window.__nest as any).state.ants;
    const rival = ants.find((ant: any) => ant.id === fighters.rival);
    return fighters.mains.map((id) => {
      const main = ants.find((ant: any) => ant.id === id);
      const dx = rival.x - main.x, dy = rival.y - main.y;
      return (Math.cos(main.heading) * dx + Math.sin(main.heading) * dy) / Math.hypot(dx, dy);
    });
  }, ids);
  expect(Math.min(...facing)).toBeGreaterThan(0.94);
});
