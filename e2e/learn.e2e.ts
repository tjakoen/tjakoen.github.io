// e2e/learn.e2e.ts: the hidden /learn page. Reached only from the terminal, noindex, absent from the sitemap and search,
// with the shell panes tucked away, and the map inside it reads the #quest= and #stop= deep links.
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

type Quest = { id: string; stops: string[] };
declare const QUESTS: Quest[];
declare const sel: { t: string; id?: string; i?: number };

const frameOf = async (page: Page) => {
  const handle = await page.locator("#learn-frame").elementHandle();
  const frame = await handle!.contentFrame();
  await frame!.evaluate(() => (window as unknown as { qmReady: Promise<void> }).qmReady);
  return frame!;
};

test("learn opens the map from the terminal and is not advertised", async ({ page, request }) => {
  const res = await page.request.get("/learn");
  expect(res.status()).toBe(200);
  expect(await res.text()).toContain('content="noindex, nofollow"');
  expect(await (await request.get("/sitemap.xml")).text()).not.toMatch(/\/learn\/?<\/loc>/);
  expect(await (await request.get("/search.json")).text()).not.toContain('"/learn');
  expect(await (await request.get("/learn-map/map.html")).headers()["x-robots-tag"]).toContain("noindex");
  expect((await request.get("/learn-map/..%2Fsrc%2Fserver.ts")).status()).toBe(404);

  await page.goto("/");
  await expect(page.locator(".console__cmd")).toBeAttached();
  await page.keyboard.press("Control+`");
  await expect(page.getByRole("link", { name: /learn/i })).toHaveCount(0);
  await page.locator('.console__cmd').fill("help");
  await page.locator('.console__cmd').press("Enter");
  await expect(page.locator('[data-surface="console"]')).not.toContainText("open the learning map");
  await page.locator('.console__cmd').fill("learn");
  await page.locator('.console__cmd').press("Enter");
  await expect(page).toHaveURL(/\/learn$/);
  await expect(page.locator('.tab-bar a[href="/learn"]')).toBeVisible();
});

test("the shell steps aside on arrival, and the sidebar can come back", async ({ page }) => {
  await page.goto("/learn");
  const shell = page.locator(".app-shell");
  await expect(shell).toHaveAttribute("data-rail-collapsed", "true");
  await expect(shell).toHaveAttribute("data-aside-hidden", "true");
  await expect(shell).toHaveAttribute("data-console-hidden", "true");
  await expect(page.locator(".app-shell__aside")).toBeHidden();
  await page.locator('[data-shell="rail-toggle"]').first().click();
  await expect(shell).toHaveAttribute("data-rail-collapsed", "false");
  await expect(page.locator('.tab-bar a.tab[href="/learn"]')).toContainText("Learn AI with me");
  const gap = await page.evaluate(() => {
    const frame = document.getElementById("learn-frame")!.getBoundingClientRect(), status = document.querySelector(".app-shell__status")!.getBoundingClientRect();
    return Math.round(status.top - frame.bottom);
  });
  expect(gap, "the map runs down to the status bar").toBeLessThanOrEqual(1);
});

test("#quest=<id> and #stop=<id>.<n> fly to the place on load", async ({ page }) => {
  await page.goto("/learn");
  const quest = await (await frameOf(page)).evaluate(() => QUESTS.find((q) => q.stops.length >= 2)!);
  await page.goto(`/learn#quest=${quest.id}`);
  let frame = await frameOf(page);
  await expect.poll(() => frame.evaluate(() => sel.t + ":" + sel.id)).toBe(`quest:${quest.id}`);

  await page.goto(`/learn#stop=${quest.id}.2`);
  frame = await frameOf(page);
  await expect.poll(() => frame.evaluate(() => sel.t + ":" + sel.id + ":" + sel.i)).toBe(`stop:${quest.id}:1`);

  await page.goto("/learn#quest=no-such-quest");
  frame = await frameOf(page);
  expect(await frame.evaluate(() => sel.t)).not.toBe("quest");
});

const FLAVORS = ["sourdough", "baguette", "brioche"] as const;
const SCHEMES = ["light", "dark"] as const;
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
declare function artKey(): string;

async function setShellTheme(page: Page, flavor: string, scheme: string) {
  await page.evaluate(([f, c]) => {
    document.documentElement.setAttribute("data-theme", f!);
    document.documentElement.setAttribute("data-color-scheme", c!);
  }, [flavor, scheme]);
  const frame = await frameOf(page);
  await expect.poll(() => frame.evaluate(() => artKey())).toBe(`${flavor}-${scheme}`);
  await page.waitForTimeout(300);
  return frame;
}

for (const flavor of FLAVORS) {
  for (const scheme of SCHEMES) {
    test(`the map follows the shell: ${flavor} ${scheme}, and passes WCAG 2.2 AA`, async ({ page }) => {
      await page.goto("/learn");
      const frame = await setShellTheme(page, flavor, scheme);
      const bg = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--color-bg").trim());
      expect(await frame.evaluate(() => document.documentElement.style.getPropertyValue("--color-bg").trim())).toBe(bg);
      expect(await frame.evaluate(() => [document.documentElement.dataset.theme, document.documentElement.dataset.colorScheme])).toEqual([flavor, scheme]);
      const scan = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      expect(scan.passes.length, "an empty scan proves nothing").toBeGreaterThan(0);
      expect(scan.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`)).toEqual([]);
    });
  }
}

declare const ART_SPRITES: unknown, SPR: Record<string, unknown>, PEOPLE: Record<string, unknown>;
declare function makeMoverSprites(): void;
declare function makePeople(): void;

test("the movers are built from the baked data, and match what the page draws", async ({ page }) => {
  await page.goto("/learn");
  for (const flavor of FLAVORS) {
    for (const scheme of SCHEMES) {
      const frame = await setShellTheme(page, flavor, scheme);
      const out = await frame.evaluate(() => {
        const dump = () => JSON.stringify([SPR, PEOPLE], (_k, v) => (v instanceof Map ? [...v].sort((a, b) => (a[0] < b[0] ? -1 : 1)) : v));
        const baked = ART_SPRITES !== null;
        const fromData = dump();
        makeMoverSprites();
        makePeople();
        return { baked, same: fromData === dump(), size: fromData.length };
      });
      expect(out.baked, `${flavor} ${scheme} has baked sprites`).toBe(true);
      expect(out.same, `${flavor} ${scheme}: baked sprites equal the drawn ones`).toBe(true);
      expect(out.size).toBeGreaterThan(1000);
    }
  }
});
