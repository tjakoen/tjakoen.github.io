// e2e/learn.e2e.ts: the hidden /learn page. Reached only from the terminal, noindex, absent from the sitemap and search,
// with the shell panes tucked away, and the map inside it reads the #quest= and #stop= deep links.
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

type Quest = { id: string; stops: string[]; order: number; stage: number; done: boolean };
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
        const dump = () => JSON.stringify([SPR, PEOPLE], (_k, v) => (v instanceof Map ? [...v].toSorted((a, b) => (a[0] < b[0] ? -1 : 1)) : v));
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

declare function selectRegion(n: number): void;
declare function selectStop(id: string, i: number): void;

// axe cannot judge text laid over the map, so this reads the labels the page actually painted: each one's resolved
// text colour against the halo colours in its text-shadow, or against the panel colour for a boxed label, in every pair
// and at the world, region and stop views, which show different sets of labels.
for (const flavor of FLAVORS) {
  for (const scheme of SCHEMES) {
    test(`the painted map labels reach 4.5:1 against their halo (${flavor}, ${scheme})`, async ({ page }) => {
      await page.goto("/learn");
      const frame = await setShellTheme(page, flavor, scheme);
      const views = [() => selectRegion(2), () => selectStop("one-loop-every-repo", 1), () => selectRegion(5)];
      let checked = 0;
      for (const view of views) {
        await frame.evaluate(view as () => void);
        await page.waitForTimeout(900);
        const rows = await frame.evaluate(() => {
          const lum = (c: number[]) => { const f = (x: number) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]!) + 0.7152 * f(c[1]!) + 0.0722 * f(c[2]!); };
          const nums = (v: string) => (v.match(/rgba?\([^)]*\)/g) ?? []).map((m) => m.match(/[\d.]+/g)!.map(Number));
          const ratio = (a: number[], b: number[]) => { const [x, y] = [lum(a), lum(b)]; return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
          const out: { label: string; ratio: number }[] = [];
          for (const el of document.querySelectorAll<HTMLElement>("#over .lbl")) {
            if (el.classList.contains("off") || !el.textContent?.trim()) continue;
            const cs = getComputedStyle(el), text = nums(cs.color)[0]!;
            const backs = el.classList.contains("box") ? nums(cs.backgroundColor) : nums(cs.textShadow).filter((c) => (c[3] ?? 1) > 0.5);
            if (!backs.length) { out.push({ label: el.textContent!.trim().slice(0, 30) + " (no halo)", ratio: 0 }); continue; }
            for (const b of backs) out.push({ label: el.textContent!.trim().slice(0, 30), ratio: ratio(text, b) });
          }
          return out;
        });
        for (const r of rows) expect(r.ratio, r.label).toBeGreaterThanOrEqual(4.5);
        checked += rows.length;
      }
      expect(checked, "no labels were painted, so nothing was checked").toBeGreaterThan(5);
    });
  }
}

declare const PATH: { stages: { n: number; quests: string[] }[] };
declare function where(): void;
declare const YOUQ: { id: string; i: number };

test("the map walks the guided path: numbered in order, Continue follows it, and the plain list is grouped by stage", async ({ page }) => {
  await page.goto("/learn");
  const frame = await frameOf(page);
  const path = await frame.evaluate(() => PATH.stages.flatMap((st) => st.quests));
  expect(path.length).toBe(14);
  const order = await frame.evaluate(() => QUESTS.map((q) => [q.id, q.order]));
  expect(order.map(([id]) => id)).toEqual(path);
  expect(order.map(([, n]) => n)).toEqual(path.map((_, i) => i + 1));

  // Continue and You are here go to the first quest not finished, in path order
  const first = await frame.evaluate(() => { where(); return sel.id!; });
  expect(first).toBe(await frame.evaluate(() => QUESTS.find((q) => !q.done)!.id));

  // the path starts near the Harbor and ends on the Summit: the regions only ever go up along it, and You are here begins in the first one
  const regions = await frame.evaluate(() => QUESTS.map((q) => (q as unknown as { region: number }).region));
  expect(regions).toEqual(regions.toSorted((a, b) => a - b));
  expect(regions[0]).toBe(2);
  expect(regions.at(-1)).toBe(6);
  expect(await frame.evaluate(() => { const q = QUESTS.find((x) => x.id === YOUQ.id)! as unknown as { region: number }; return q.region; })).toBe(2);

  // the panel says where a quest comes in the path
  await frame.evaluate((id) => (window as unknown as { selectQuest(i: string): void }).selectQuest(id), path[2]!);
  await expect(frame.locator(".ribbon")).toHaveText("Stage 2 · Quest 3 of 14");

  // the plain list reads without the map, one section per stage, quests in path order
  const list = await frame.evaluate(() => [...document.querySelectorAll("#route > ol > li")].map((li) => [li.querySelector("h2")!.textContent, [...li.querySelectorAll(":scope > ol > li > h3")].map((h) => h.textContent)]));
  expect(list.map(([h]) => h)).toEqual(["Stage 1: Harbor", "Stage 2", "Stage 3", "Stage 4", "Stage 5", "Stage 6"]);
  expect(list.flatMap(([, titles]) => titles as string[]).length).toBe(14);
});
