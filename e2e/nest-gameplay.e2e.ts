import { test, expect } from "@playwright/test";

const open = async (page: import("@playwright/test").Page) => {
  await page.goto("/?nest-debug");
  await page.locator(".nest-switch").click();
  await expect(page.locator("#nest-mock")).toBeVisible();
};

test("the home mound fits the page after opening a hidden sidebar", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("grain.shell.aside-hidden", "1");
    const observer = new MutationObserver(() => {
      const main = document.querySelector(".app-shell__main");
      if (!main?.querySelector(".nest-hill-live")) return;
      main.setAttribute("data-test-nest-spawn-width", String(main.clientWidth));
      observer.disconnect();
    });
    observer.observe(document, { childList: true, subtree: true });
  });
  await page.goto("/");
  const main = page.locator(".app-shell__main");
  const aside = page.locator(".app-shell__aside");
  await expect(page.locator(".app-shell")).toHaveAttribute("data-aside-hidden", "true");
  await expect.poll(() => aside.evaluate((el) => el.clientWidth)).toBe(0);
  await page.getByRole("button", { name: "Open the Nest" }).click();
  await expect(page.locator("#nest-mock")).toBeVisible();
  await expect.poll(() => aside.evaluate((el) => el.clientWidth)).toBeGreaterThan(250);
  const spawnWidth = Number(await main.getAttribute("data-test-nest-spawn-width"));
  expect(spawnWidth).toBe(await main.evaluate((el) => el.clientWidth));
  const bounds = await main.evaluate((el) => {
    const pane = el.getBoundingClientRect();
    const mound = el.querySelector(".nest-hill-live")!.getBoundingClientRect();
    return { pageLeft: pane.left, pageRight: pane.right, moundLeft: mound.left, moundRight: mound.right };
  });
  expect(bounds.moundLeft).toBeGreaterThanOrEqual(bounds.pageLeft);
  expect(bounds.moundRight).toBeLessThanOrEqual(bounds.pageRight);
});

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

test("the queen's first egg waits for the simulation to resume", async ({ page }) => {
  await page.clock.install();
  await open(page);
  const pause = page.getByRole("button", { name: "Pause", exact: true });
  await pause.click();
  const eggs = () => page.evaluate(() => (window.__nest as any).state.eggs.length);

  await page.clock.fastForward(7_000);
  expect(await eggs()).toBe(0);

  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await page.clock.runFor(6_200);
  expect(await eggs()).toBeGreaterThan(0);
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

test("the rival falls without dropping letters and celebrates", async ({ page }) => {
  await open(page);
  await page.evaluate(() => (window.__nest as any).startRival());
  await expect.poll(() => page.evaluate(() => (window.__nest as any).rival.active), { timeout: 20_000 }).toBe(true);
  await page.evaluate(() => (window.__nest as any).forceRivalSteal());
  const before = await page.evaluate(() => ({ hidden: (window.__nest as any).state.hiddenLetters.size }));
  await page.evaluate(() => (window.__nest as any).retreatRival());
  const result = await page.evaluate(() => {
    const n = window.__nest as any;
    return { active: n.rival.active, cache: n.state.cache, letters: n.state.cacheLetters.length, stolen: n.rival.stolen.size, hidden: n.state.hiddenLetters.size, celebration: document.querySelectorAll(".nest-celebration").length };
  });
  expect(result.active).toBe(false);
  expect(result.cache).toBeNull();
  expect(result.letters).toBe(0);
  expect(result.stolen).toBe(0);
  expect(result.hidden).toBe(before.hidden);
  expect(result.celebration).toBeGreaterThan(0);
});

test("the rival mound dies when every rival ant dies", async ({ page }) => {
  await open(page);
  await page.evaluate(() => (window.__nest as any).startRival());
  await expect.poll(() => page.evaluate(() => (window.__nest as any).rival.trails.length), { timeout: 20_000 }).toBeGreaterThan(0);
  await page.evaluate(() => {
    const n = window.__nest as any;
    for (const a of n.rival.ants.slice()) n.removeRivalAnt(a);
  });
  await expect.poll(() => page.evaluate(() => (window.__nest as any).rival.active), { timeout: 8_000 }).toBe(false);
});


test("sealing a hill stops its traffic until it reopens", async ({ page }) => {
  await open(page);
  const seal = page.locator("button[data-k='seal']");
  await expect(seal).toBeEnabled();
  await seal.click();
  await expect(page.locator(".nest-hill.sealed").first()).toBeVisible();
  await expect(seal).toBeDisabled();
});

test("a main worker beats a single rival worker", async ({ page }) => {
  await open(page);
  const result = await page.evaluate(() => {
    const n = window.__nest as any;
    const at = [480, 480];
    const soldier = n.spawnPageAnt("soldier", at, null);
    const worker = n.spawnRivalUnit("rival-worker", at, [[480, 480]]);
    n.rivalCombat(performance.now() + 1000); n.finishFights();
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
  await page.evaluate(() => {
    const n = window.__nest as any;
    // Leave room under the colony cap for this mound's guards and flyer to spawn.
    n.state.ants.filter((ant: any) => ant.role === "worker" && !ant.letter).slice(0, 8).forEach(n.squash);
  });
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


test("a main guard can break the rival mound without a player wipe", async ({ page }) => {
  await open(page);
  await page.evaluate(() => (window.__nest as any).startRival());
  await expect.poll(() => page.evaluate(() => (window.__nest as any).rival.active), { timeout: 20_000 }).toBe(true);
  const hole = await page.evaluate(() => (window.__nest as any).rival.mound.hole.slice());
  await page.evaluate(([x, y]) => {
    const n = window.__nest as any;
    n.rival.hp = 1;
    for (let i = 0; i < 3; i++) {
      const guard = n.spawnPageAnt("guard", [x, y], null);
      guard.hp = 99;
      guard.job = "rival-siege";
      guard.path = [[x, y]];
      guard.k = 0;
      guard.nextBite = 0;
    }
  }, hole);
  await expect.poll(() => page.evaluate(() => (window.__nest as any).rival.active), { timeout: 15_000 }).toBe(false);
});


test("main trails share a trunk and fork instead of running parallel", async ({ page }) => {
  await open(page);
  await expect.poll(() => page.evaluate(() => (window.__nest as any).state.trails.filter((t: any) => !t.side).length), { timeout: 35_000 }).toBeGreaterThanOrEqual(2);
  const shared = await page.evaluate(() => {
    const n = window.__nest as any;
    const trails = n.state.trails.filter((t: any) => !t.side);
    let best = 0;
    for (let a = 0; a < trails.length; a++) for (let b = a + 1; b < trails.length; b++) {
      let count = 0;
      for (const p of trails[a].pts) if (trails[b].pts.some((q: number[]) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 7)) count++;
      best = Math.max(best, count);
    }
    return best;
  });
  expect(shared).toBeGreaterThan(3);
});

test("a contesting guard does not stand at an empty crossing forever", async ({ page }) => {
  await open(page);
  const result = await page.evaluate(() => {
    const n = window.__nest as any;
    const at = [400, 400];
    const guard = n.spawnPageAnt("guard", at, null);
    guard.job = "rival-contest";
    guard.path = [[400, 400]];
    guard.k = 0;
    return { id: guard.id };
  });
  await page.waitForTimeout(3_200);
  const job = await page.evaluate((id) => (window.__nest as any).state.ants.find((a: any) => a.id === id)?.job, result.id);
  expect(job).not.toBe("rival-contest");
});

test("soldiers and guards use the same ant art", async ({ page }) => {
  await open(page);
  const same = await page.evaluate(() => {
    const n = window.__nest as any;
    const a = n.spawnPageAnt("soldier", [300, 300], null);
    const b = n.spawnPageAnt("guard", [320, 300], null);
    return a.el.innerHTML === b.el.innerHTML;
  });
  expect(same).toBe(true);
});


test("a soldier breaks a rival mini mound before the main mound", async ({ page }) => {
  await open(page);
  await page.evaluate(() => (window.__nest as any).startRival());
  await expect.poll(() => page.evaluate(() => (window.__nest as any).rival.minis.length), { timeout: 40_000 }).toBeGreaterThan(0);
  const before = await page.evaluate(() => {
    const n = window.__nest as any;
    const mini = n.rival.minis[0];
    mini.hp = 1;
    for (let i = 0; i < 3; i++) {
      const guard = n.spawnPageAnt("soldier", [mini.base[0], mini.base[1]], null);
      guard.hp = 99; guard.job = "rival-siege"; guard.path = [[mini.base[0], mini.base[1]]]; guard.k = 0; guard.nextBite = 0;
    }
    return { minis: n.rival.minis.length, hp: n.rival.hp };
  });
  await expect.poll(() => page.evaluate(() => (window.__nest as any).rival.minis.length), { timeout: 12_000 }).toBeLessThan(before.minis);
  expect(await page.evaluate(() => (window.__nest as any).rival.hp)).toBe(before.hp);
});


test("the worker stat matches the main worker castes", async ({ page }) => {
  await open(page);
  await page.waitForTimeout(8000);
  const result = await page.evaluate(() => {
    const n = window.__nest as any;
    const workers = n.state.ants.filter((a: any) => a.side !== "rival" && (a.role === "worker" || a.role === "builder")).length;
    return { workers, ui: Number(document.querySelector("[data-k='workers']")?.textContent) };
  });
  expect(result.ui).toBe(result.workers);
});


test("reset restores letters taken by the rival", async ({ page }) => {
  await open(page);
  await page.evaluate(() => (window.__nest as any).startRival());
  await expect.poll(() => page.evaluate(() => (window.__nest as any).rival.active), { timeout: 20_000 }).toBe(true);
  await expect.poll(() => page.evaluate(() => (window.__nest as any).forceRivalSteal() || (window.__nest as any).rival.stolen.size > 0), { timeout: 10_000 }).toBe(true);
  await page.evaluate(() => (window.__nest as any).retreatRival());
  expect(await page.evaluate(() => (window.__nest as any).state.hiddenLetters.size)).toBeGreaterThan(0);
  await page.locator("button[data-k='restore']").click();
  await page.waitForTimeout(300);
  await page.locator("button[data-k='reset-go']").click();
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => (window.__nest as any).state.hiddenLetters.size)).toBe(0);
});


test("you can click a rival mini mound down", async ({ page }) => {
  test.setTimeout(90_000);
  await open(page);
  await page.evaluate(() => (window.__nest as any).startRival());
  await expect.poll(() => page.evaluate(() => (window.__nest as any).rival.minis.length), { timeout: 45_000 }).toBeGreaterThan(0);
  const before = await page.evaluate(() => (window.__nest as any).rival.minis.length);
  const mini = page.locator(".nest-hill.rival.rival-mini").first();
  await mini.dispatchEvent("click"); await mini.dispatchEvent("click"); await mini.dispatchEvent("click");
  await expect.poll(() => page.evaluate(() => (window.__nest as any).rival.minis.length), { timeout: 5_000 }).toBeLessThan(before);
});


test("the main colony respects its ant cap", async ({ page }) => {
  await open(page);
  const result = await page.evaluate(() => {
    const n = window.__nest as any;
    for (let i = 0; i < 40; i++) n.spawnPageAnt("worker", [500, 500], null);
    return n.state.ants.filter((a: any) => a.side !== "rival").length;
  });
  expect(result).toBeLessThanOrEqual(20);
});


test("a lone main ant cannot break a rival mound", async ({ page }) => {
  await open(page);
  await page.evaluate(() => (window.__nest as any).startRival());
  await expect.poll(() => page.evaluate(() => (window.__nest as any).rival.active), { timeout: 20_000 }).toBe(true);
  const result = await page.evaluate(async () => {
    const n = window.__nest as any;
    const hole = n.rival.mound.hole.slice();
    n.rival.hp = 8;
    const guard = n.spawnPageAnt("guard", [hole[0], hole[1]], null);
    guard.hp = 99; guard.job = "rival-siege"; guard.path = [[hole[0], hole[1]]]; guard.k = 0; guard.nextBite = 0;
    await new Promise((r) => setTimeout(r, 1800));
    return n.rival.hp;
  });
  expect(result).toBe(8);
});


test("a full colony can staff a second mini mound and count its builder", async ({ page }) => {
  await open(page);
  const population = await page.evaluate(() => {
    const nest = window.__nest as any;
    nest.makeMini(nest.findMiniSpot());
    nest.state.built = 1;
    nest.state.speed = 4;
    while (nest.state.ants.length < 20) {
      const [x, y] = nest.home.hole;
      const worker = nest.spawnPageAnt("worker", [x + 65, y + 35], null);
      worker.job = "home";
      worker.path = [nest.home.hole.slice()];
      worker.k = 0;
    }
    nest.state.stores = 100;
    return nest.state.ants.map((ant: any) => ant.id);
  });
  await expect.poll(() => page.evaluate(() => (window.__nest as any).state.builder?.id), { timeout: 8000 }).toBeDefined();
  const staffing = await page.evaluate(() => {
    const nest = window.__nest as any;
    return {
      builder: nest.state.builder.id,
      workers: nest.state.ants.filter((ant: any) => ant.role === "worker" || ant.role === "builder").length,
      displayed: Number(document.querySelector("[data-k='workers']")?.textContent),
    };
  });
  expect(population).toContain(staffing.builder);
  expect(staffing.displayed).toBe(staffing.workers);
  await expect(page.locator("[data-k='minis']")).toHaveText("2", { timeout: 18000 });
});
