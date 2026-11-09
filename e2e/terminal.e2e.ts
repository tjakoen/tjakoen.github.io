// portfolio/e2e/terminal.e2e.ts — the INTERACTIVE TERMINAL (grain/scripts/terminal.js worn by the
// portfolio's console). The unit tier drift-guards the verb literals; this is the only tier that
// covers the island's real behavior: mount (opt-in), local commands, the grade doctrine in the
// feed (human echo settles clean, machine output stays grain), the keybinding, and — since the
// desk-hero-demo P2b work — the DESK VERBS that make the terminal a real third client of the one door.
import { test, expect, type Page } from "@playwright/test";
import mailbox from "../content/data/mailbox.json" with { type: "json" };

declare global {
  interface Window {
    __nestStray?: { spawn: (force?: boolean) => void; cancel: () => void };
    __rafCount?: number;
    __nest?: {
      state: {
        ants: Array<{ id: number; role: string; block: Element | null; job?: string; where?: string; x: number; y: number; mini?: { base: [number, number] }; scoutRoute?: unknown; letter?: unknown; el?: Element }>;
        trails: Array<{ block: Element }>;
        built: number;
        squashed: number;
      };
      home: { base: [number, number] };
      startParty: (final?: boolean) => void;
      startRival: () => void;
      forceRivalSteal: () => boolean;
      makeMini: (spot: unknown) => unknown;
      findMiniSpot: () => unknown;
      squash: (ant: unknown) => void;
      newAnt: (role: string, route: string, d: number) => unknown;
      env?: unknown;
      spawnPageAnt: (role: string, at: [number, number], mini: unknown) => { el: Element };
      spawnRivalUnit: (job: string, at: [number, number], path: number[][], sweet: unknown) => { el: Element };
      rivalCombat: (now: number) => void;
      wipeTrail: (trail: unknown, at: [number, number]) => void;
      rival: { active: boolean; ants: Array<unknown>; trails: Array<{ end: [number, number] }>; stolen: Set<unknown>; returnAt: number; minis: Array<unknown>; mound?: { base: [number, number] } | null };
    };
  }
}

test.describe("the interactive terminal (third client of the one door)", () => {
  test("mounts only on the opt-in console, and Ctrl+` opens + focuses it", async ({ page }) => {
    await page.goto("/");
    const box = page.locator('.console__box[data-terminal="interactive"]');
    await expect(box.locator(".console__cmd")).toBeAttached();      // the injected input row
    await page.keyboard.press("Control+`");
    await expect(page.locator(".app-shell")).toHaveAttribute("data-console-open", "");
    await expect(box.locator(".console__cmd")).toBeFocused();
  });

  test("help lists the builtins + the portfolio's whoami; the echo settles clean", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Control+`");
    const input = page.locator(".console__cmd");
    await input.fill("help");
    await input.press("Enter");
    const feed = page.locator('[data-surface="console"]');
    // the echoed command is the HUMAN's line: grade=smooth (settles clean, grade doctrine)
    await expect(feed.locator('.console__line[data-variant="cmd"]')).toHaveAttribute("data-grade", "smooth");
    // machine output stays on the feed's default (grain) — no grade override on builtin output
    await expect(feed).toContainText("whoami");                     // desk-commands registered
    await expect(feed).toContainText("navigate to a page");         // the go builtin's help line
    await expect(feed).toContainText("reveal the ant colony");      // the nest command is listed
    await expect(feed).toContainText("send a stray ant");           // the stray command is listed
    // an unknown command reports honestly instead of failing silent
    await input.fill("frobnicate");
    await input.press("Enter");
    await expect(feed).toContainText("command not found: frobnicate");
  });

  test("go navigates by page slug (a local read against the ⌘K corpus)", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Control+`");
    const input = page.locator(".console__cmd");
    await input.fill("go bread");
    await input.press("Enter");
    await expect(page).toHaveURL(/\/bread$/);
  });

  test("the Nest is lazy: no game request before the launcher is used", async ({ page }) => {
    let gameRequests = 0;
    page.on("request", (request) => { if (request.url().includes("/site/nest-game.js")) gameRequests++; });
    await page.goto("/");
    await expect(page.locator(".nest-switch")).toBeVisible();
    await page.waitForTimeout(500);
    expect(gameRequests).toBe(0);
    await page.locator(".nest-switch").click();
    await expect(page.locator("#nest-mock")).toBeVisible();
    await expect.poll(() => gameRequests, { timeout: 15_000 }).toBeGreaterThan(0);
  });

  test("the note starts the colony from its own button", async ({ page }) => {
    await page.goto("/notes/the-site-has-ants");
    await page.getByRole("button", { name: "Play the colony" }).click();
    await expect(page.locator("#nest-mock")).toBeVisible();
  });

  test("the old ?nest link is just a page, not a shortcut into the game", async ({ page }) => {
    await page.goto("/?nest");
    await expect(page.getByRole("button", { name: "Open the Nest" })).toBeVisible();
    await expect(page.locator('[data-surface="nest-controls"]')).toHaveCount(0);
  });

  test("the launcher is always there, and nest opens the colony", async ({ page }) => {
    await page.goto("/notes/the-site-has-ants");
    const launcher = page.getByRole("button", { name: "Open the Nest" });
    await expect(launcher).toBeVisible();
    await expect(page.locator('[data-surface="nest-controls"]')).toHaveCount(0);

    await page.keyboard.type("nest");
    await page.locator(".console__expand").click();
    await run(page, "help");
    await expect(page.locator('[data-surface="console"]')).toContainText("reveal the ant colony");
    await run(page, "nest");
    await expect(page.locator('[data-surface="nest-controls"]')).toBeVisible();
    await expect(page.locator('[data-surface="console"]')).toContainText("colony is open");

    page.once("dialog", (dialog) => dialog.accept());
    await page.reload();
    await expect(launcher).toBeVisible();
    await expect(page.locator('[data-surface="nest-controls"]')).toHaveCount(0);
    await launcher.click();
    await expect(page.locator('[data-surface="nest-controls"]')).toBeVisible();
  });

  test("the anthill keeps clear of the bread", async ({ page }) => {
    await page.goto("/");
    await page.locator(".nest-switch").click();
    await expect(page.locator("#nest-mock")).toBeVisible();
    await page.waitForTimeout(1600);
    expect(await page.evaluate(() => {
      const bread = document.querySelector<HTMLElement>(".welcome__bread")?.getBoundingClientRect();
      const hill = document.querySelector<HTMLElement>(".nest-hill")?.getBoundingClientRect();
      if (!bread || !hill || !bread.width || !hill.width) return false;
      return hill.left < bread.right && hill.right > bread.left && hill.top < bread.bottom && hill.bottom > bread.top;
    })).toBe(false);
  });

  test("the anthill moves between empty cells", async ({ page }) => {
    const cells = new Set<string>();
    page.on("dialog", (dialog) => dialog.accept());
    for (let i = 0; i < 10; i++) {
      await page.goto("/?nest-debug");
      await page.locator(".nest-switch").click();
      await expect(page.locator(".nest-hill:not(.rival)")).toBeVisible();
      cells.add(await page.evaluate(() => {
        const h = document.querySelector(".nest-hill:not(.rival)")!.getBoundingClientRect();
        const m = document.querySelector("main")!.getBoundingClientRect();
        const col = Math.min(2, Math.floor(((h.left + h.width / 2 - m.left) / m.width) * 3));
        const row = Math.min(2, Math.floor(((h.top + h.height / 2 - m.top) / m.height) * 3));
        return `${col},${row}`;
      }));
    }
    expect(cells.size).toBeGreaterThan(1);
  });

  test("scouts and trails scale with the worker crew", async ({ page }) => {
    await page.goto("/?nest-debug");
    await page.locator(".nest-switch").click();
    await expect(page.locator("#nest-mock")).toBeVisible();
    await page.waitForTimeout(3000);
    const stats = await page.evaluate(() => {
      const n = window.__nest!;
      const crew = n.state.ants.filter((a) => a.role === "worker" || a.role === "scout").length;
      return {
        crew,
        scouts: n.state.ants.filter((a) => a.role === "scout").length,
        trails: (n.state.trails as any[]).filter((t) => !t.side).length,
      };
    });
    const wanted = Math.max(1, Math.floor(stats.crew / 4));
    expect(stats.scouts).toBeLessThanOrEqual(wanted);
    expect(stats.trails).toBeLessThanOrEqual(wanted);
  });

  test("a guarded mound calls its guards and opens when they are gone", async ({ page }) => {
    await page.goto("/?nest-debug");
    await page.locator(".nest-switch").click();
    await expect(page.locator("#nest-mock")).toBeVisible();
    await page.evaluate(() => { const spot = window.__nest!.findMiniSpot(); if (spot) window.__nest!.makeMini(spot); });
    await expect.poll(() => page.evaluate(() => window.__nest!.state.ants.filter((a) => a.role === "guard").length)).toBeGreaterThan(0);
    const guardNear = await page.evaluate(() => {
      const guard = window.__nest!.state.ants.find((a) => a.role === "guard");
      return guard?.mini ? Math.hypot(guard.x - guard.mini.base[0], guard.y - guard.mini.base[1]) : null;
    });
    expect(guardNear).not.toBeNull();
    expect(guardNear!).toBeLessThan(300);
    const mound = page.locator(".nest-mini").first();
    await mound.click();
    await page.waitForFunction(() => {
      const guards = window.__nest!.state.ants.filter((a) => a.role === "guard");
      return guards.length > 0 && guards.every((a) => a.job === "defend" || a.job === "guard");
    });
    await page.waitForTimeout(4500);
    const freed = await page.evaluate(() => window.__nest!.state.ants.filter((a) => a.role === "guard").map((a) => a.job));
    expect(freed.every((job) => job !== "defend" && job !== "guard")).toBe(true);
    await page.evaluate(() => {
      for (const g of window.__nest!.state.ants.filter((a) => a.role === "guard")) {
        window.__nest!.squash(g); window.__nest!.squash(g);
      }
    });
    await expect(mound).toHaveClass(/exposed/);
  });

  test("the colony stops its frame loop when the tab is hidden", async ({ page }) => {
    await page.addInitScript(() => {
      window.__rafCount = 0;
      const raf = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = (cb) => raf((t) => {
        window.__rafCount = (window.__rafCount ?? 0) + 1;
        cb(t);
      });
    });
    await page.goto("/?nest-debug");
    await page.locator(".nest-switch").click();
    await expect(page.locator("#nest-mock")).toBeVisible();
    await page.waitForTimeout(400);
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await page.waitForTimeout(200);
    const hidden = await page.evaluate(() => window.__rafCount ?? 0);
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => window.__rafCount ?? 0)).toBe(hidden);
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", { configurable: true, get: () => false });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await page.waitForTimeout(350);
    expect(await page.evaluate(() => window.__rafCount ?? 0)).toBeGreaterThan(hidden);
  });

  test("keyboard tool switches do not resize the colony", async ({ page }) => {
    await page.goto("/?nest-debug");
    await page.locator(".nest-switch").click();
    await expect(page.locator("#nest-mock")).toBeVisible();
    await page.waitForTimeout(500);
    await page.getByRole("button", { name: "Pause" }).click();
    const well = page.locator("#nest-mock .well");
    const before = await well.boundingBox();
    await page.keyboard.press("2");
    await page.waitForTimeout(250);
    const after = await well.boundingBox();
    expect(Math.abs((after?.height ?? 0) - (before?.height ?? 0))).toBeLessThan(1);
    expect(Math.abs((after?.width ?? 0) - (before?.width ?? 0))).toBeLessThan(1);
  });

  test("pause stops the frame loop and resume starts it again", async ({ page }) => {
    await page.addInitScript(() => {
      window.__rafCount = 0;
      const raf = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = (cb) => raf((t) => {
        window.__rafCount = (window.__rafCount ?? 0) + 1;
        cb(t);
      });
    });
    await page.goto("/?nest-debug");
    await page.locator(".nest-switch").click();
    await expect(page.locator("#nest-mock")).toBeVisible();
    await page.waitForTimeout(400);
    const running = await page.evaluate(() => window.__rafCount ?? 0);
    expect(running).toBeGreaterThan(0);

    await page.locator('[data-k="pause"]').click();
    await page.waitForTimeout(250);
    const paused = await page.evaluate(() => window.__rafCount ?? 0);
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => window.__rafCount ?? 0)).toBe(paused);

    await page.locator('[data-k="pause"]').click();
    await page.waitForTimeout(350);
    expect(await page.evaluate(() => window.__rafCount ?? 0)).toBeGreaterThan(paused);
  });

  test("a killed scout leaves no trail behind", async ({ page }) => {
    await page.goto("/?nest-debug");
    await page.locator(".nest-switch").click();
    await expect(page.locator("#nest-mock")).toBeVisible();
    await page.waitForFunction(() => {
      const scout = window.__nest?.state.ants.find((a) => a.role === "scout" && a.job === "carry" && a.scoutRoute && a.block);
      return !!scout;
    }, null, { timeout: 20_000 });
    const route = await page.evaluate(() => {
      const scout = window.__nest!.state.ants.find((a) => a.role === "scout" && a.job === "carry" && a.scoutRoute && a.block);
      return scout ? { id: scout.id, block: (scout.block!.textContent || "").trim().slice(0, 40) } : null;
    });
    expect(route).not.toBeNull();
    await page.evaluate((id) => {
      const scout = window.__nest!.state.ants.find((a) => a.id === id);
      if (scout) window.__nest!.squash(scout);
    }, route!.id);
    await page.waitForTimeout(350);
    const trailBlocks = await page.evaluate(() => window.__nest!.state.trails.map((t) => (t.block.textContent || "").trim().slice(0, 40)));
    expect(trailBlocks).not.toContain(route!.block);
  });

  test("the queen sends a scout when none is left", async ({ page }) => {
    await page.goto("/?nest-debug");
    await page.locator(".nest-switch").click();
    await expect(page.locator("#nest-mock")).toBeVisible();
    await page.waitForTimeout(600);
    await page.evaluate(() => {
      window.__nest!.state.ants.filter((a) => a.role === "scout").forEach((a) => window.__nest!.squash(a));
    });
    await expect.poll(() => page.evaluate(() => window.__nest!.state.ants.filter((a) => a.role === "scout").length)).toBeGreaterThan(0);
  });

  test("a broken mound lowers the stores cap", async ({ page }) => {
    await page.goto("/?nest-debug");
    await page.locator(".nest-switch").click();
    await expect(page.locator("#nest-mock")).toBeVisible();
    await page.evaluate(() => {
      window.__nest!.state.built = 2;
      const spot = window.__nest!.findMiniSpot();
      const mound = spot ? (window.__nest!.makeMini(spot) as { next: number } | null) : null;
      if (mound) mound.next = performance.now() / 1000 + 999;
    });
    await expect(page.locator("#nest-mock [data-k='stores-val']")).toContainText("/24");
    const mound = page.locator(".nest-mini").first();
    for (let i = 0; i < 5; i++) await mound.click();
    await expect(page.locator("#nest-mock [data-k='stores-val']")).toContainText("/18");
  });

  test("a damaged mini hill heals slowly", async ({ page }) => {
    await page.goto("/?nest-debug");
    await page.locator(".nest-switch").click();
    await expect(page.locator("#nest-mock")).toBeVisible();
    await page.evaluate(() => {
      const spot = window.__nest!.findMiniSpot();
      const mound = spot ? (window.__nest!.makeMini(spot) as { next: number } | null) : null;
      if (mound) mound.next = performance.now() / 1000 + 999;
    });
    const mound = page.locator(".nest-mini").first();
    await mound.click();
    await expect(mound).toHaveAttribute("aria-label", /4 hits left/);
    await page.waitForTimeout(12000);
    await expect(mound).toHaveAttribute("aria-label", /5 hits left/);
  });

  test("the next worship stays put while the colony grows", async ({ page }) => {
    await page.goto("/?nest-debug");
    await page.locator(".nest-switch").click();
    await expect(page.locator("#nest-mock")).toBeVisible();
    const before = await page.locator("#nest-mock [data-k='worship-val']").textContent();
    await page.evaluate(() => { for (let i = 0; i < 8; i++) window.__nest!.newAnt("worker", "hatch", 0); });
    await page.waitForTimeout(250);
    const after = await page.locator("#nest-mock [data-k='worship-val']").textContent();
    expect(after).toBe(before);
  });

  test("the meters explain themselves", async ({ page }) => {
    await page.goto("/?nest-debug");
    await page.locator(".nest-switch").click();
    await expect(page.locator("#nest-mock")).toBeVisible();
    await expect(page.locator("#nest-mock .nest-meter .hint")).toHaveCount(4);
    await expect(page.locator("#nest-mock .nest-meter .hint").nth(1)).toContainText("mound builders");
    await expect(page.locator("#nest-mock .nest-meter .hint").nth(2)).toContainText("three meals lay an egg");
    await expect(page.locator("#nest-mock .nest-meter .hint").nth(3)).toContainText("queen dances");
  });

  test("a long larder does not push the stats around", async ({ page }) => {
    await page.goto("/?nest-debug");
    await page.locator(".nest-switch").click();
    await expect(page.locator("#nest-mock")).toBeVisible();
    const scouts = page.locator("#nest-mock [data-k='scouts']");
    const before = await scouts.boundingBox();
    await page.evaluate(() => {
      const larder = document.querySelector("#nest-mock [data-k='larder']");
      if (larder) larder.textContent = "lrsovehperdeadlrsovehperdeadlrsovehperdead";
    });
    const after = await scouts.boundingBox();
    expect(Math.abs((after?.x ?? 0) - (before?.x ?? 0))).toBeLessThan(1);
  });

  test("an empty colony gets a scout from the queen", async ({ page }) => {
    await page.goto("/?nest-debug");
    await page.locator(".nest-switch").click();
    await expect(page.locator("#nest-mock")).toBeVisible();
    await page.waitForTimeout(600);
    await page.evaluate(() => {
      [...window.__nest!.state.ants].forEach((a) => window.__nest!.squash(a));
    });
    await expect.poll(() => page.evaluate(() => window.__nest!.state.ants.filter((a) => a.role === "scout").length)).toBeGreaterThan(0);
  });

  test("the rival colony founds, steals and retreats when its trail is wiped", async ({ page }) => {
    await page.goto("/?nest-debug");
    await page.locator(".nest-switch").click();
    await expect(page.locator("#nest-mock")).toBeVisible();
    expect(await page.evaluate(() => window.__nest!.rival.active)).toBe(false);
    await page.evaluate(() => window.__nest!.startRival());
    await expect.poll(() => page.evaluate(() => window.__nest!.rival.active), { timeout: 20_000 }).toBe(true);
    await expect.poll(() => page.evaluate(() => window.__nest!.rival.ants.length), { timeout: 15_000 }).toBeGreaterThan(0);
    await expect.poll(() => page.evaluate(() => window.__nest!.rival.trails.length), { timeout: 15_000 }).toBeGreaterThan(0);
    await expect.poll(() => page.evaluate(() => window.__nest!.rival.minis.length), { timeout: 20_000 }).toBeGreaterThanOrEqual(2);
    await page.evaluate(() => window.__nest!.forceRivalSteal());
    await expect.poll(() => page.evaluate(() => window.__nest!.rival.stolen.size), { timeout: 5_000 }).toBeGreaterThan(0);
    const placement = await page.evaluate(() => {
      const home = window.__nest!.home.base;
      const rival = window.__nest!.rival.mound!.base;
      return { dx: rival[0] - home[0], width: document.querySelector("main")!.clientWidth, homeX: home[0], dist: Math.hypot(rival[0] - home[0], rival[1] - home[1]) };
    });
    expect(placement.dx * (placement.homeX - placement.width / 2)).toBeLessThan(0);
    expect(placement.dist).toBeGreaterThan(340);
    await expect(page.locator("[data-k='rival-hint']")).toContainText("rival");
    await page.evaluate(() => {
      for (const trail of window.__nest!.rival.trails.slice()) window.__nest!.wipeTrail(trail, trail.end);
    });
    await expect.poll(() => page.evaluate(() => window.__nest!.rival.active)).toBe(false);
    await expect(page.locator("[data-k='rival-hint']")).toHaveText("");
  });

  test("a pile of ants goes under one click", async ({ page }) => {
    await page.goto("/?nest-debug");
    await page.locator(".nest-switch").click();
    await expect(page.locator("#nest-mock")).toBeVisible();
    const before = await page.evaluate(() => {
      const n = window.__nest!;
      const at: [number, number] = [420, 420];
      n.spawnPageAnt("worker", at, null);
      const second = n.spawnPageAnt("worker", at, null);
      const count = n.state.ants.length;
      (second.el as HTMLElement).click();
      return count;
    });
    await page.waitForTimeout(250);
    const after = await page.evaluate(() => window.__nest!.state.ants.length);
    expect(after).toBeLessThanOrEqual(before - 2);
  });

  test("the reserve stat is gone", async ({ page }) => {
    await page.goto("/?nest-debug");
    await page.locator(".nest-switch").click();
    await expect(page.locator("#nest-mock")).toBeVisible();
    await expect(page.locator("#nest-mock [data-k='reserve']")).toHaveCount(0);
  });

  test("restore puts the mounds somewhere else", async ({ page }) => {
    await page.goto("/?nest-debug");
    await page.locator(".nest-switch").click();
    await expect(page.locator("#nest-mock")).toBeVisible();
    await page.waitForTimeout(700);
    const before = await page.evaluate(() => window.__nest!.home.base.slice());
    const antsBefore = await page.evaluate(() => window.__nest!.state.ants.length);
    await page.getByRole("button", { name: "Restore page" }).click();
    await expect(page.getByRole("alertdialog")).toContainText("main mound");
    const blocked = await page.evaluate(() => window.__nest!.home.base.slice());
    expect(blocked).toEqual(before);
    await page.getByRole("button", { name: "reset the page" }).click();
    await page.waitForTimeout(700);
    const after = await page.evaluate(() => window.__nest!.home.base.slice());
    expect(after).not.toEqual(before);
    await expect(page.locator(".nest-hill:not(.rival)").first()).toBeInViewport();
    const antsAfter = await page.evaluate(() => window.__nest!.state.ants.length);
    expect(antsAfter).toBeGreaterThanOrEqual(antsBefore);
  });

  test("the queen leaves the nest for the page dance", async ({ page }) => {
    await page.goto("/?nest-debug");
    await page.locator(".nest-switch").click();
    await expect(page.locator("#nest-mock")).toBeVisible();
    await page.waitForTimeout(600);
    await page.waitForFunction(() => window.__nest?.state.ants.some((a) =>
      a.el && a.where === "page" && !a.letter && a.job !== "carry" && a.job !== "crew" && a.job !== "wait" && a.role !== "builder") ?? false);
    await page.evaluate(() => window.__nest!.startParty());
    await expect(page.locator("#nest-mock")).toHaveClass(/celebrating/);
    await expect(page.locator(".nest-queen:not(.panel-queen)")).toBeVisible();
    await expect(page.locator("[data-k='worship-bar']")).toBeVisible();
    await expect(page.locator(".nest-ant.dancing").first()).toBeVisible();
    await page.waitForTimeout(1800);
    await expect(page.locator(".nest-queen:not(.panel-queen)")).toHaveClass(/dancing/);
    const queen = await page.locator(".nest-queen:not(.panel-queen)").boundingBox();
    const hill = await page.locator(".nest-hill:not(.rival)").first().boundingBox();
    expect(queen && hill && (queen.y > hill.y + hill.height || queen.x > hill.x + hill.width || queen.x + queen.width < hill.x)).toBe(true);
  });

  test("the stray command sends an ant that runs for the launcher", async ({ page }) => {
    await page.goto("/");
    await page.locator(".console__expand").click();
    await run(page, "stray");
    const stray = page.locator(".nest-stray");
    await expect(stray).toHaveCount(1);
    expect(await stray.evaluate((el) => {
      const legs = el.querySelector(".legs-a");
      return { walk: el.classList.contains("walk"), animation: legs ? getComputedStyle(legs).animationName : null };
    })).toEqual({ walk: true, animation: "nest-step" });
    await stray.evaluate((el) => (el as HTMLButtonElement).click());
    await expect(page.locator(".nest-switch")).toHaveClass(/nest-pulse/);
    await expect(stray).toHaveCount(0);
    expect(await page.evaluate(() => sessionStorage.getItem("nest-stray-clicked"))).toBe("1");
    await page.evaluate(() => window.__nestStray?.spawn());
    await expect(stray).toHaveCount(0);
    await page.reload();
    await expect(page.locator(".nest-switch")).toBeVisible();
    await page.evaluate(() => window.__nestStray?.spawn());
    await expect(page.locator(".nest-stray")).toHaveCount(0);
    await page.evaluate(() => window.__nestStray?.spawn(true));
    await expect(page.locator(".nest-stray")).toHaveCount(1);
    await expect(page.locator(".nest-stray")).toHaveCount(0, { timeout: 25000 });
  });

  test("the speed control cycles the colony through 1x, 2x and 4x", async ({ page }) => {
    await page.goto("/?nest-debug");
    await page.locator(".nest-switch").click();
    await expect(page.locator("#nest-mock")).toBeVisible();
    const speed = page.locator('[data-k="speed"]');
    await expect(speed).toContainText("1×");
    await speed.click();
    await expect(speed).toContainText("2×");
    await speed.click();
    await expect(speed).toContainText("4×");
    await speed.click();
    await expect(speed).toContainText("1×");
  });

  test("Nest tools lock links during play, and a page switch closes the colony", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open the Nest" }).click();
    const panel = page.locator('[data-surface="nest-controls"]');
    const main = page.locator(".app-shell__main");
    const sound = panel.getByRole("button", { name: "Unmute" });
    await expect(sound).toHaveClass(/nest-sound-hint/);
    await sound.hover();
    await expect(sound).not.toHaveClass(/nest-sound-hint/);
    const link = main.getByRole("link", { name: "Explore selected work" });
    const fileLink = page.locator('.file-tree__file[href="/resume"]');
    const links = panel.getByRole("button", { name: /Links/ });
    await expect(links).toContainText("Links locked");
    await expect(main).toHaveCSS("cursor", "crosshair");
    await link.press("Enter");
    await expect(page).toHaveURL(/\/$/);
    await fileLink.click();
    await expect(page).toHaveURL(/\/$/);
    const toast = page.locator(".nest-lock-toast");
    await expect(toast).toBeVisible();
    await expect(toast).toContainText("Links are locked while the colony is playing.");
    await toast.getByRole("button", { name: "Use Links (3)" }).click();
    await expect(links).toContainText("Links unlocked");
    await panel.getByRole("button", { name: "Squash", exact: true }).click();
    await expect(links).toContainText("Links locked");

    const bait = panel.getByRole("button", { name: "Drop bait" });
    await bait.click();
    await expect(main).toHaveCSS("cursor", "copy");
    await panel.getByRole("button", { name: "Cancel bait" }).click();
    await expect(main).toHaveCSS("cursor", "crosshair");
    await expect(main.locator(".nest-bait")).toHaveCount(0);

    await bait.click();
    await panel.getByRole("button", { name: "Wipe", exact: true }).click();
    await expect(main).toHaveCSS("cursor", "cell");
    await expect(links).toContainText("Links locked");
    await expect(bait).toBeEnabled();
    await links.click();
    await expect(links).toContainText("Links unlocked");
    await expect(main.locator(".nest-layer")).toHaveAttribute("inert", "");
    await expect(bait).toBeDisabled();
    await link.press("Enter");
    await expect(page.getByRole("alertdialog")).toBeVisible();
    await expect(page.getByRole("alertdialog")).toContainText("Leave this page?");
    await page.getByRole("button", { name: "leave and close" }).click();
    await expect(page).toHaveURL(/\/projects$/);
    await page.waitForLoadState("load");
    await expect(page.locator('[data-surface="nest-controls"]')).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Open the Nest" })).toBeVisible();
  });
});

// ---- the DESK VERBS (P2b): the terminal restates each command as the SAME natural-language intent
// the chat + suggest chips send, then raises it through window.grain.door.submit — so the
// deterministic router (ai/actions.ts) does the recognizing and the desk drives the real surface.
// Same headless-no-WebGPU client-door setup as desk-notes-filter.e2e.ts / desk-mail-archive.e2e.ts:
// every path here is DETERMINISTIC (filter/archive), zero model, no download, no generation. ----
const DESK_DOOR = "/modules/portfolio/ai/desk-door.js";
const CI_IDS = mailbox.messages.filter((m) => m.from === "BREAD CI" && m.folder === "inbox").map((m) => m.id);
const INBOX_TOTAL = mailbox.messages.filter((m) => m.folder === "inbox").length;

async function clientDeskEverywhere(page: Page) {
  await page.route("**/*", async (route, req) => {
    if (req.resourceType() !== "document") return route.continue();
    const res = await route.fetch();
    if (!(res.headers()["content-type"] || "").includes("text/html")) return route.fulfill({ response: res });
    const html = (await res.text()).replace(/<body\b/, `<body data-ai-transport="client" data-ai-door="${DESK_DOOR}"`);
    return route.fulfill({ response: res, body: html });
  });
  await page.addInitScript(() => {   // force the no-WebGPU (offline model) path deterministically
    try { Object.defineProperty(navigator, "gpu", { value: undefined, configurable: true }); } catch { /* absent */ }
  });
}

async function terminalReady(page: Page) {
  await page.waitForFunction(() => Boolean((window as unknown as { grain?: { door?: unknown } }).grain?.door));
  await expect(page.locator("body")).toHaveAttribute("data-ai-online", "true");   // the client door came up
  await page.keyboard.press("Control+`");                                         // open the console
  await expect(page.locator(".console__cmd")).toBeFocused();
}

const run = async (page: Page, cmd: string) => {
  const input = page.locator(".console__cmd");
  await input.fill(cmd);
  await input.press("Enter");
};

test.describe("terminal desk verbs (deterministic, no model needed)", () => {
  test("`notes teaching` filters through the door: teaching chip checked, ?tag= mirrored", async ({ page }) => {
    await clientDeskEverywhere(page);
    await page.goto("/notes");
    await terminalReady(page);
    const totalCards = await page.locator(".note-card").count();

    await run(page, "notes teaching");

    const teachingChip = page.locator('[data-feed-controls] input[type="checkbox"][value="teaching"]');
    await expect(teachingChip).toBeChecked({ timeout: 10_000 });
    await expect(page).toHaveURL(/[?&]tag=teaching\b/);
    await expect(page.locator(".note-card:not([hidden])").first()).toBeVisible();
    expect(await page.locator(".note-card[hidden]").count()).toBeGreaterThan(0);
    expect(await page.locator(".note-card[hidden]").count()).toBeLessThan(totalCards);
  });

  test("`archive BREAD CI` drives the island's real Archive buttons for every CI letter", async ({ page }) => {
    await clientDeskEverywhere(page);
    await page.goto("/mail");
    await terminalReady(page);
    expect(CI_IDS.length).toBeGreaterThan(1);   // the fixture must keep this a real BATCH

    await run(page, "archive BREAD CI");

    for (const id of CI_IDS) {
      await expect(page.locator(`a.mailbox__item[href="#msg-${id}"]`))
        .toHaveAttribute("data-folder", "archive", { timeout: 15_000 });
    }
    await expect(page.locator('[data-mailbox-folders] [data-folder="inbox"] .mailbox__folder-count'))
      .toHaveText(String(INBOX_TOTAL - CI_IDS.length));
    await expect(page.locator(".assistant__log")).toContainText(`Archived ${CI_IDS.length}`);
    await expect(page.locator(".assistant__log")).toContainText("BREAD CI");
  });

  test("`notes` with no topic is a local usage error — nothing is routed", async ({ page }) => {
    await clientDeskEverywhere(page);
    await page.goto("/notes");
    await terminalReady(page);

    await run(page, "notes");

    await expect(page.locator('[data-surface="console"]')).toContainText("notes about what?");
    await expect(page).not.toHaveURL(/[?&]tag=/);   // nothing was routed
  });
});


test("the queen is gone before the panel queen returns", async ({ page }) => {
  await page.goto("/?nest-debug");
  await page.locator(".nest-switch").click();
  await expect(page.locator("#nest-mock")).toBeVisible();
  await page.waitForTimeout(600);
  await page.evaluate(() => window.__nest!.startParty());
  await expect(page.locator(".nest-queen:not(.panel-queen)")).toBeVisible();
  await expect(page.locator(".nest-queen:not(.panel-queen)")).toHaveCount(0, { timeout: 18_000 });
  await expect(page.locator(".nest-queen.panel-queen")).toBeVisible();
});


test("the note mounts its six live colony boxes", async ({ page }) => {
  await page.goto("/notes/the-site-has-ants");
  await expect(page.locator(".nest-scene")).toHaveCount(6);
});
