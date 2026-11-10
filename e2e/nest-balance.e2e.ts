import { test, expect } from "@playwright/test";

const open = async (page: import("@playwright/test").Page) => {
  await page.goto("/?nest-debug");
  await page.locator(".nest-switch").click();
  await expect(page.locator("#nest-mock")).toBeVisible();
  await page.waitForFunction(() => !!(window as any).__nest);
};

const startRival = async (page: import("@playwright/test").Page) => {
  await page.evaluate(() => (window.__nest as any).startRival());
  await expect.poll(() => page.evaluate(() => (window.__nest as any).rival.active), { timeout: 20_000 }).toBe(true);
};

test("page left never climbs back when a rival spends what it stole", async ({ page }) => {
  await open(page);
  await startRival(page);
  const before = await page.evaluate(() => {
    const n = (window.__nest as any);
    for (let i = 0; i < 8; i++) n.forceRivalSteal();
    const held = document.querySelector("[data-k='holds-val']")!.textContent!;
    return { held: Number(held.replace("%", "")), hidden: n.state.hiddenLetters.size, pageLetters: n.pageLetters };
  });
  expect(before.pageLetters).toBeGreaterThan(0);
  expect(before.hidden).toBeGreaterThan(0);
  await page.waitForTimeout(300);

  const after = await page.evaluate(() => {
    const n = (window.__nest as any);
    // Eating a stolen letter removes it from the rival's set. The page must not treat that as a
    // letter coming back to the copy.
    for (let i = 0; i < 4; i++) n.consumeRivalLetter();
    n.retreatRival();
    return { hidden: n.state.hiddenLetters.size };
  });
  await page.waitForTimeout(400);
  const held = await page.evaluate(() => Number(document.querySelector("[data-k='holds-val']")!.textContent!.replace("%", "")));
  expect(after.hidden).toBe(before.hidden);
  expect(held).toBeLessThanOrEqual(before.held);
});

test("a rival trail with no ants on it fades instead of staying forever", async ({ page }) => {
  await open(page);
  await startRival(page);
  await expect.poll(() => page.evaluate(() => (window.__nest as any).rival.trails.length), { timeout: 20_000 }).toBeGreaterThan(0);
  const gone = await page.evaluate(() => {
    const n = (window.__nest as any);
    const trail = n.rival.trails.find((t: any) => t.ants.size > 0) || n.rival.trails[0];
    for (const ant of Array.from(trail.ants)) n.removeRivalAnt(ant);
    trail.lastUse = performance.now() / 1000 - 999;
    return trail.born;
  });
  await expect.poll(() => page.evaluate((born) => (window.__nest as any).rival.trails.some((t: any) => t.born === born), gone), { timeout: 8_000 }).toBe(false);
});

test("rivals return at worships 2, 3, 4, 5, then every fifth worship", async ({ page }) => {
  await open(page);
  const seen: number[] = [];
  for (const milestone of [2, 3, 4, 5]) {
    const result = await page.evaluate((worship) => {
      const n = (window.__nest as any);
      n.state.partyIndex = worship;
      n.foundRival();
      return { active: n.rival.active, tier: n.rival.tier };
    }, milestone);
    expect(result.active).toBe(true);
    seen.push(milestone);
    await page.evaluate(() => (window.__nest as any).retreatRival());
  }
  expect(seen).toEqual([2, 3, 4, 5]);
  const afterFive = await page.evaluate(() => {
    const n = (window.__nest as any);
    n.state.partyIndex = 6;
    n.foundRival();
    return n.rival.active;
  });
  expect(afterFive).toBe(false);
  for (const milestone of [10, 15]) {
    const active = await page.evaluate((worship) => {
      const n = (window.__nest as any);
      n.state.partyIndex = worship;
      n.foundRival();
      return n.rival.active;
    }, milestone);
    expect(active).toBe(true);
    await page.evaluate(() => (window.__nest as any).retreatRival());
  }
});

test("rival guards can break a main mini hill", async ({ page }) => {
  await open(page);
  await startRival(page);
  const before = await page.evaluate(() => {
    const n = (window.__nest as any);
    const spot = n.findMiniSpot();
    if (!spot) return null;
    const mini = n.makeMini(spot);
    mini.hp = 1;
    n.state.built = 1;
    const guard = n.spawnRivalUnit("rival-guard", [mini.base[0], mini.base[1]], [[mini.base[0], mini.base[1]]]);
    guard.job = "rival-raid"; guard.raidMini = mini; guard.path = [[mini.spot.x, mini.spot.y - 4]]; guard.k = 0; guard.nextBite = 0;
    return { minis: n.minis.length, built: n.state.built };
  });
  expect(before).not.toBeNull();
  await expect.poll(() => page.evaluate(() => (window.__nest as any).minis.length), { timeout: 6_000 }).toBeLessThan(before!.minis);
  expect(await page.evaluate(() => (window.__nest as any).state.built)).toBe(0);
});

test("mini-hill staff cannot crowd out the workers", async ({ page }) => {
  await open(page);
  const result = await page.evaluate(() => {
    const n = (window.__nest as any);
    for (let i = 0; i < 40; i++) n.spawnPageAnt("guard", [300, 300], null);
    for (let i = 0; i < 40; i++) n.spawnPageAnt("worker", [320, 320], null);
    const main = n.state.ants.filter((a: any) => a.side !== "rival");
    return {
      staff: main.filter((a: any) => a.role === "guard" || a.role === "flyer").length,
      colony: main.filter((a: any) => a.role !== "guard" && a.role !== "flyer").length,
      workers: main.filter((a: any) => a.role === "worker").length,
    };
  });
  expect(result.staff).toBeLessThanOrEqual(12);
  expect(result.colony).toBeLessThanOrEqual(20);
  expect(result.workers).toBeGreaterThan(10);
});

test("mini hills raise more than one flyer", async ({ page }) => {
  await open(page);
  await page.evaluate(() => {
    const n = (window.__nest as any);
    const spot = n.findMiniSpot();
    if (spot) n.makeMini(spot);
    n.state.built = 1;
    n.state.speed = 4;
  });
  await expect.poll(() => page.evaluate(() => (window.__nest as any).state.ants.filter((a: any) => a.side !== "rival" && a.role === "flyer").length), { timeout: 35_000 }).toBeGreaterThan(1);
});

test("a broken rival mini does not grow straight back", async ({ page }) => {
  await open(page);
  await startRival(page);
  await expect.poll(() => page.evaluate(() => (window.__nest as any).rival.minis.length), { timeout: 40_000 }).toBeGreaterThan(0);
  const cooldown = await page.evaluate(() => {
    const n = (window.__nest as any);
    const mini = n.rival.minis[0];
    mini.guards.clear();
    mini.hp = 1;
    mini.el.click();
    return n.rival.nextMiniAt - performance.now();
  });
  expect(cooldown).toBeGreaterThan(15_000);
});

test("a lost colony restarts even while a mini hill is still standing", async ({ page }) => {
  await open(page);
  const colony = await page.evaluate(() => {
    const n = (window.__nest as any);
    if (!n.minis.length) {
      const spot = n.findMiniSpot();
      if (spot) n.makeMini(spot);
    }
    n.state.ants = n.state.ants.filter((a: any) => a.side === "rival");
    n.checkWipe();
    return n.state.ants.filter((a: any) => a.side !== "rival").length;
  });
  expect(colony).toBe(4);
});

test("the squashed counter belongs to the player, not to combat", async ({ page }) => {
  await open(page);
  const result = await page.evaluate(async () => {
    const n = (window.__nest as any);
    n.state.squashed = 0;
    const worker = n.spawnPageAnt("worker", [400, 400], null);
    n.squash(worker);
    const afterPlayer = n.state.squashed;
    const rival = n.spawnRivalUnit("rival-worker", [420, 420], [[420, 420]]);
    rival.el.click();
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { afterPlayer, afterRival: n.state.squashed };
  });
  expect(result.afterPlayer).toBe(1);
  expect(result.afterRival).toBe(1);
});

test("a three-digit squash count stays readable in the stat grid", async ({ page }) => {
  await open(page);
  await page.evaluate(() => { (window.__nest as any).state.squashed = 127; });
  await page.waitForTimeout(500);
  const box = await page.evaluate(() => {
    const dd = document.querySelector("[data-k='squashed']") as HTMLElement;
    const row = dd.parentElement as HTMLElement;
    return { text: dd.textContent, ddScroll: dd.scrollWidth, ddClient: dd.clientWidth, rowScroll: row.scrollWidth, rowClient: row.clientWidth };
  });
  expect(box.text).toBe("127");
  expect(box.ddScroll).toBeLessThanOrEqual(box.ddClient + 1);
  expect(box.rowScroll).toBeLessThanOrEqual(box.rowClient + 1);
});

test("clear and close reloads the page clean", async ({ page }) => {
  await open(page);
  await page.locator("[data-k='x']").click();
  const loaded = page.waitForEvent("load");
  await page.locator("[data-k='leave']").click();
  await loaded;
  await expect(page.locator(".nest-layer")).toHaveCount(0);
  expect(await page.evaluate(() => document.querySelectorAll(".nest-gap").length)).toBe(0);
});

test("the page-emptied celebration is permanent and every hill dances", async ({ page }) => {
  test.setTimeout(120_000);
  await page.clock.install();
  await page.goto("/?nest-debug");
  await page.locator(".nest-switch").click();
  await expect(page.locator("#nest-mock")).toBeVisible();
  await page.waitForFunction(() => !!(window as any).__nest);
  await page.evaluate(() => { (window.__nest as any).state.speed = 4; });
  await page.clock.runFor(1_000);
  await page.evaluate(() => (window.__nest as any).finishPage());
  for (let i = 0; i < 20; i++) {
    await page.clock.runFor(1_000);
    if (await page.evaluate(() => (window.__nest as any).state.over)) break;
  }
  const party = await page.evaluate(() => {
    const n = (window.__nest as any);
    return {
      over: n.state.over,
      final: n.state.party?.final,
      queen: !!document.querySelector(".nest-queen"),
      hills: document.querySelectorAll(".nest-mound-dancer").length,
      dancers: document.querySelectorAll(".nest-page-dancer").length + (n.state.party?.wanderers?.length || 0),
      status: document.querySelector("[data-k='status']")?.textContent,
      holds: document.querySelector("[data-k='holds-val']")?.textContent,
    };
  });
  expect(party.over).toBe(true);
  expect(party.final).toBe(true);
  expect(party.queen).toBe(true);
  expect(party.hills).toBeGreaterThan(0);
  expect(party.dancers).toBeGreaterThan(0);
  expect(party.status).toBe("dancing");
  expect(party.holds).toBe("0%");
  await page.clock.runFor(30_000);
  const later = await page.evaluate(() => {
    const n = (window.__nest as any);
    return { final: n.state.party?.final, queen: !!document.querySelector(".nest-queen"), hills: document.querySelectorAll(".nest-mound-dancer").length };
  });
  expect(later.final).toBe(true);
  expect(later.queen).toBe(true);
  expect(later.hills).toBe(party.hills);
});

test("an uncontested colony eventually breaks its rival and still has workers", async ({ page }) => {
  test.setTimeout(420_000);
  await page.clock.install();
  await page.goto("/?nest-debug");
  await page.locator(".nest-switch").click();
  await expect(page.locator("#nest-mock")).toBeVisible();
  await page.waitForFunction(() => !!(window as any).__nest);
  await page.evaluate(() => {
    (window.__nest as any).state.speed = 4;
    // This test only reads state. Hiding the page layer keeps a four-minute simulation from
    // competing with the frame-budget test for paint time in the parallel suite.
    const layer = document.querySelector<HTMLElement>(".nest-layer");
    if (layer) layer.style.display = "none";
  });
  let ended = false;
  for (let i = 0; i < 12 && !ended; i++) {
    await page.clock.runFor(30_000);
    ended = await page.evaluate(() => {
      const n = (window.__nest as any);
      return n.rival.lastMilestone >= 2 && !n.rival.active;
    });
  }
  const result = await page.evaluate(() => {
    const n = (window.__nest as any);
    return {
      ended: n.rival.lastMilestone >= 2 && !n.rival.active,
      workers: n.state.ants.filter((a: any) => a.side !== "rival" && a.role === "worker").length,
      colony: n.state.ants.filter((a: any) => a.side !== "rival" && a.role !== "guard" && a.role !== "flyer").length,
      rivals: n.rival.tier,
      partyIndex: n.state.partyIndex,
      war: n.rival.war,
      active: n.rival.active,
      hp: n.rival.hp,
      lastMilestone: n.rival.lastMilestone,
      soldiers: n.state.ants.filter((a: any) => a.side !== "rival" && a.role === "soldier").map((a: any) => ({ job: a.job, hp: a.hp, fight: !!a.fightUntil })),
      rivalAnts: n.rival.ants.length,
      rivalHole: n.rival.mound?.hole,
    };
  });
  expect(result.ended).toBe(true);
  expect(result.colony).toBeGreaterThanOrEqual(8);
  expect(result.workers).toBeGreaterThanOrEqual(6);
});
