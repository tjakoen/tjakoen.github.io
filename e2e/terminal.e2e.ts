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
    __nest?: {
      state: { ants: Array<{ role: string; block: Element | null; job?: string }> };
      home: { base: [number, number] };
      makeMini: (spot: unknown) => unknown;
      findMiniSpot: () => unknown;
      squash: (ant: unknown) => void;
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

  test("the old ?nest link is just a page, not a shortcut into the game", async ({ page }) => {
    await page.goto("/?nest");
    await expect(page.getByRole("button", { name: "Open the Nest" })).toBeVisible();
    await expect(page.locator('[data-surface="nest-controls"]')).toHaveCount(0);
  });

  test("the launcher is always there, and nest opens the colony", async ({ page }) => {
    await page.goto("/notes/the-site-has-ants");
    await expect(page.getByText("Open the terminal at the bottom of the page", { exact: false })).toBeVisible();
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
      await expect(page.locator(".nest-hill")).toBeVisible();
      cells.add(await page.evaluate(() => {
        const h = document.querySelector(".nest-hill")!.getBoundingClientRect();
        const m = document.querySelector("main")!.getBoundingClientRect();
        const col = Math.min(2, Math.floor(((h.left + h.width / 2 - m.left) / m.width) * 3));
        const row = Math.min(2, Math.floor(((h.top + h.height / 2 - m.top) / m.height) * 3));
        return `${col},${row}`;
      }));
    }
    expect(cells.size).toBeGreaterThan(1);
  });

  test("the first three scouts take different source blocks", async ({ page }) => {
    await page.goto("/?nest-debug");
    await page.locator(".nest-switch").click();
    await expect(page.locator("#nest-mock")).toBeVisible();
    await page.waitForFunction(() => (window.__nest?.state.ants.filter((a) => a.role === "scout" && a.block).length ?? 0) >= 3);
    const blocks = await page.evaluate(() => window.__nest!.state.ants
      .filter((a) => a.role === "scout" && a.block)
      .map((a) => (a.block!.textContent || "").trim().slice(0, 40)));
    expect(blocks).toHaveLength(3);
    expect(new Set(blocks).size).toBe(3);
    const shape = await page.evaluate(() => {
      const points = window.__nest!.state.ants
        .filter((a) => a.role === "scout" && a.block)
        .map((a) => {
          const r = a.block!.getBoundingClientRect();
          return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        });
      const main = document.querySelector("main")!.getBoundingClientRect();
      const home = window.__nest!.home.base;
      const inView = points.every((p) => p.x > main.left && p.x < main.right && p.y > main.top && p.y < main.bottom);
      const secondOpposite = (points[1].x - main.left - home[0]) * (home[0] - main.width / 2) < 0;
      const minThird = Math.min(...points.slice(0, 2).map((p) => Math.hypot(p.x - points[2].x, p.y - points[2].y)));
      return { inView, secondOpposite, minThird };
    });
    expect(shape.inView).toBe(true);
    expect(shape.secondOpposite).toBe(true);
    expect(shape.minThird).toBeGreaterThan(80);
  });

  test("a guarded mound calls its guards and opens when they are gone", async ({ page }) => {
    await page.goto("/?nest-debug");
    await page.locator(".nest-switch").click();
    await expect(page.locator("#nest-mock")).toBeVisible();
    await page.evaluate(() => { const spot = window.__nest!.findMiniSpot(); if (spot) window.__nest!.makeMini(spot); });
    await expect.poll(() => page.evaluate(() => window.__nest!.state.ants.filter((a) => a.role === "guard").length)).toBeGreaterThan(0);
    const mound = page.locator(".nest-mini").first();
    await mound.click();
    await page.waitForFunction(() => {
      const guards = window.__nest!.state.ants.filter((a) => a.role === "guard");
      return guards.length > 0 && guards.every((a) => a.job === "defend" || a.job === "guard");
    });
    await page.evaluate(() => {
      for (const g of window.__nest!.state.ants.filter((a) => a.role === "guard")) {
        window.__nest!.squash(g); window.__nest!.squash(g);
      }
    });
    await expect(mound).toHaveClass(/exposed/);
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
    const linkState = panel.locator('[data-k="link-text"]');
    await expect(linkState).toHaveText("links locked");
    await expect(main).toHaveCSS("cursor", "crosshair");
    await link.press("Enter");
    await expect(page).toHaveURL(/\/$/);
    await fileLink.click();
    await expect(page).toHaveURL(/\/$/);
    const toast = page.locator(".nest-lock-toast");
    await expect(toast).toBeVisible();
    await expect(toast).toContainText("Links are locked while the colony is playing.");
    await toast.getByRole("button", { name: "Use Links (3)" }).click();
    await expect(linkState).toHaveText("links open");
    await panel.getByRole("button", { name: "Squash", exact: true }).click();
    await expect(linkState).toHaveText("links locked");

    const bait = panel.getByRole("button", { name: "Drop bait" });
    await bait.click();
    await expect(main).toHaveCSS("cursor", "copy");
    await panel.getByRole("button", { name: "Cancel bait" }).click();
    await expect(main).toHaveCSS("cursor", "crosshair");
    await expect(main.locator(".nest-bait")).toHaveCount(0);

    await bait.click();
    await panel.getByRole("button", { name: "Wipe", exact: true }).click();
    await expect(main).toHaveCSS("cursor", "cell");
    await expect(linkState).toHaveText("links locked");
    await expect(bait).toBeEnabled();
    await panel.getByRole("button", { name: "Links", exact: true }).click();
    await expect(linkState).toHaveText("links open");
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
