// e2e/learn.e2e.ts: the hidden /learn page. Reached only from the terminal, noindex, absent from the sitemap and search,
// with the shell panes tucked away, and the map inside it reads the #quest= and #stop= deep links.
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

type Quest = { id: string; stops: string[]; order: number; stage: number; done: boolean };
declare const QUESTS: Quest[];
declare const sel: { t: string; id?: string; i?: number };
declare const PROG: Record<string, Set<number>>;
declare const V: { z: number };
declare function selectRegion(n: number): void;
declare function selectQuest(id: string): void;
declare function selectStop(id: string, i: number): void;
declare function persist(): void;
declare const Guild: { xp(): number; codeOf(b: unknown): string; bundle(): unknown };

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

test("the shell steps aside on arrival, the top bar has no sidebar toggles, and the rail can still bring navigation back", async ({ page }) => {
  await page.goto("/learn");
  const shell = page.locator(".app-shell");
  await expect(shell).toHaveAttribute("data-rail-collapsed", "true");
  await expect(shell).toHaveAttribute("data-aside-hidden", "true");
  await expect(shell).toHaveAttribute("data-console-hidden", "true");
  await expect(page.locator(".app-shell__aside")).toBeHidden();
  await expect(page.locator('.app-shell__topbar [data-shell="rail-toggle"]')).toBeHidden();
  await expect(page.locator('.app-shell__topbar [data-shell="aside-toggle"]')).toBeHidden();
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
  expect(path.length).toBe(await frame.evaluate(() => QUESTS.length));
  expect(path.length).toBe(21);
  const order = await frame.evaluate(() => QUESTS.map((q) => [q.id, q.order]));
  expect(order.map(([id]) => id)).toEqual(path);
  expect(order.map(([, n]) => n)).toEqual(path.map((_, i) => i + 1));

  // Continue and You are here go to the first quest not finished, in path order
  const first = await frame.evaluate(() => { where(); return sel.id!; });
  expect(first).toBe(await frame.evaluate(() => QUESTS.find((q) => !q.done)!.id));

  // the path starts near the Harbor and ends on the Summit: the regions only ever go up along it, and You are here begins in the first one
  const regions = await frame.evaluate(() => QUESTS.map((q) => (q as unknown as { region: number }).region));
  expect(regions).toEqual(regions.toSorted((a, b) => a - b));
  expect(regions[0]).toBe(1);
  expect(regions.at(-1)).toBe(6);
  expect(await frame.evaluate(() => { const q = QUESTS.find((x) => x.id === YOUQ.id)! as unknown as { region: number }; return q.region; })).toBe(1);

  // the panel says where a quest comes in the path
  await frame.evaluate((id) => (window as unknown as { selectQuest(i: string): void }).selectQuest(id), path[2]!);
  await expect(frame.locator(".ribbon")).toHaveText("Stage 1 · Quest 3 of 21 · Draft");

  // the plain list reads without the map, one section per stage, quests in path order
  const list = await frame.evaluate(() => [...document.querySelectorAll("#route > ol > li")].map((li) => [li.querySelector("h2")!.textContent, [...li.querySelectorAll(":scope > ol > li > h3")].map((h) => h.textContent)]));
  expect(list.map(([h]) => h)).toEqual(["Stage 1", "Stage 2", "Stage 3", "Stage 4", "Stage 5", "Stage 6"]);
  expect(list.flatMap(([, titles]) => titles as string[]).length).toBe(21);
});

test("Begin quest opens the book over the map: the note on the left, the Guide on the right, a line lights its quote, and the trial is saved", async ({ page }) => {
  await page.goto("/learn");
  const frame = await frameOf(page);
  await frame.evaluate(() => localStorage.removeItem("learn.progress.v1"));
  await frame.evaluate(() => { (window as unknown as { selectQuest(i: string): void }).selectQuest("start-here"); });
  await frame.locator('[data-act="begin"]').click();
  const book = frame.locator(".bk");
  await expect(book).toBeVisible();
  await expect(book.locator(".bk__note h3")).toContainText("Six Months In");
  await expect(book.locator(".bk__guide .plate")).toContainText("the Guide");
  await expect(book.locator("mark.hl")).toHaveText("I'm not an AI expert.");
  // the line is the transcript, so it reads without sound
  await expect(book.locator(".bk__guide .say")).toContainText("I'm not an expert");
  await book.locator('[data-do="next"]').click();
  await expect(book.locator("mark.hl")).toHaveText("This isn't a tutorial or a step-by-step guide.");
  // the trial is self-reported and kept in this browser only
  await book.locator(".trial input").check();
  expect(await frame.evaluate(() => localStorage.getItem("learn.progress.v1"))).toContain('"start-here":[0]');
  await page.keyboard.press("Escape");
  await expect(book).toBeHidden();
  await expect(frame.locator(".stopline[data-done]")).toHaveCount(1);
});

const resetGuild = (frame: Awaited<ReturnType<typeof frameOf>>) =>
  frame.evaluate(() => { for (const k of ["learn.progress.v1", "learn.runes.v1", "learn.guild.v1"]) localStorage.removeItem(k); });

test("the guild HUD counts XP from the trials ticked and shows the level", async ({ page }) => {
  await page.goto("/learn");
  let frame = await frameOf(page);
  await resetGuild(frame);
  await page.reload();
  frame = await frameOf(page);
  await expect(frame.locator(".gh__lv")).toHaveText("Lv 1 · Newcomer");
  await frame.evaluate(() => { for (let i = 0; i < 2; i++) PROG["start-here"].add(i); persist(); });
  await expect.poll(() => frame.evaluate(() => Guild.xp())).toBe(200);
  await expect(frame.locator(".gh__lv")).toHaveText("Lv 2 · Apprentice");
  await expect(frame.locator(".lvl")).toContainText("Newcomer");
  await expect(frame.locator(".lvl")).toHaveAttribute("role", "status");
});

test("the guild card saves a code, loads it back, and refuses a bad one", async ({ page }) => {
  await page.goto("/learn");
  const frame = await frameOf(page);
  await resetGuild(frame);
  await frame.evaluate(() => { PROG["start-here"].add(0); persist(); });
  const code = await frame.evaluate(() => Guild.codeOf(Guild.bundle()));
  await frame.evaluate(() => { PROG["start-here"].clear(); persist(); });
  await frame.locator(".gh").click();
  await frame.locator('[data-f="code"]').fill("not a code");
  await frame.locator('[data-do="loadcode"]').click();
  await expect(frame.locator("[data-msg]")).toContainText("did not load");
  await frame.locator('[data-f="code"]').fill(code);
  await frame.locator('[data-do="loadcode"]').click();
  expect(await frame.evaluate(() => localStorage.getItem("learn.progress.v1"))).toContain('"start-here":[0]');
});

test("a badge link rebuilds the badge page from the code alone, with the evidence link and no claim of a credential", async ({ page }) => {
  await page.goto("/learn");
  let frame = await frameOf(page);
  await resetGuild(frame);
  const code = await frame.evaluate(() => {
    const progress: Record<string, number[]> = {};
    QUESTS.filter((q) => (q as Quest & { region: number }).region === 1).forEach((q) => { progress[q.id] = q.stops.map((_, i) => i); });
    return Guild.codeOf({ v: 1, name: "Test Holder", seed: "ABC234", since: "2026-11", evidence: "https://example.com/roadmap", progress, runes: {} });
  });
  await page.goto("/learn#badge=1." + code);
  frame = await frameOf(page);
  const badge = frame.locator(".gc");
  await expect(badge.locator("h3")).toHaveText("Walks the Harbor");
  await expect(badge).toContainText("Earned · Test Holder");
  await expect(badge.locator('a[href="https://example.com/roadmap"]')).toHaveAttribute("rel", /noopener/);
  await expect(badge).toContainText("not a signed credential");
  // looking at someone else's badge never writes to this browser's own progress
  expect(await frame.evaluate(() => localStorage.getItem("learn.progress.v1"))).toBeNull();
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true });

  test("the map takes the screen above the shell's bottom bar, with one more zoom level out and the panel as a modal", async ({ page }) => {
    await page.goto("/learn");
    const frame = await frameOf(page);
    // nothing of the map sits behind the shell's bottom bar
    const gap = await page.evaluate(() => {
      const f = document.getElementById("learn-frame")!.getBoundingClientRect(), nav = document.querySelector(".mobile-nav")!.getBoundingClientRect();
      return nav.top - f.bottom;
    });
    expect(gap).toBeGreaterThanOrEqual(-1);
    // the whole island fits at the first view, one level out from World
    expect(await frame.evaluate(() => V.z)).toBe(1);
    await expect(frame.locator("#zname")).toHaveText("Overview");
    // the guide is closed until asked for, and the map carries its own previous and next
    await expect(frame.locator("#panel")).toBeHidden();
    await expect(frame.locator("#mnav")).toBeVisible();
    await frame.locator("#mopen").click();
    await expect(frame.locator("#panel")).toBeVisible();
    await frame.locator("#pclose").click();
    await expect(frame.locator("#panel")).toBeHidden();
    await frame.evaluate(() => { selectRegion(2); });
    await frame.locator("#pclose").click();
    await expect(frame.locator("#mlbl")).toHaveText(/Region 2 of 6/);
    await frame.locator("#mnext").click();
    await expect(frame.locator("#mlbl")).toHaveText(/Region 3 of 6/);
    await expect(frame.locator("#panel")).toBeHidden();
  });

  test("two fingers pinch the map onto the nearest zoom level, and pinching in goes back out", async ({ page }) => {
    await page.goto("/learn");
    const frame = await frameOf(page);
    const z = () => frame.evaluate(() => V.z);
    await frame.evaluate(async () => {
      const st = document.getElementById("stage")!;
      const fire = (t: string, id: number, x: number, y: number) => st.dispatchEvent(new PointerEvent(t, { pointerId: id, pointerType: "touch", clientX: x, clientY: y, bubbles: true }));
      fire("pointerdown", 1, 150, 300); fire("pointerdown", 2, 230, 300);
      for (let i = 1; i <= 10; i++) { fire("pointermove", 1, 150 - i * 6, 300); fire("pointermove", 2, 230 + i * 6, 300); await new Promise((r) => setTimeout(r, 16)); }
      fire("pointerup", 2, 290, 300); fire("pointerup", 1, 90, 300);
    });
    await expect.poll(z).toBe(3);
    await frame.evaluate(async () => {
      const st = document.getElementById("stage")!;
      const fire = (t: string, id: number, x: number, y: number) => st.dispatchEvent(new PointerEvent(t, { pointerId: id, pointerType: "touch", clientX: x, clientY: y, bubbles: true }));
      fire("pointerdown", 1, 90, 300); fire("pointerdown", 2, 290, 300);
      for (let i = 1; i <= 10; i++) { fire("pointermove", 1, 90 + i * 7, 300); fire("pointermove", 2, 290 - i * 7, 300); await new Promise((r) => setTimeout(r, 16)); }
      fire("pointerup", 2, 220, 300); fire("pointerup", 1, 160, 300);
    });
    await expect.poll(z).toBe(1);
  });
});

test.describe("the ant game never runs on /learn", () => {
  test("the control: the home page still has the status-bar ant and it opens the Nest", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".nest-switch")).toBeVisible();
    await page.locator(".nest-switch").click();
    await expect(page.locator("#nest-mock")).toBeVisible();
  });

  test("no status-bar ant, no Nest by launcher or by address, and no stray ant even when forced", async ({ page }) => {
    await page.goto("/learn?nest=play");
    await frameOf(page);
    await expect(page.locator(".nest-switch")).toBeHidden();
    await expect(page.locator("#nest-mock")).toHaveCount(0);
    await expect(page.locator("html")).not.toHaveAttribute("data-nest-open", /.*/);
    // the launcher and the stray hook exist as placeholders, and both refuse
    await page.evaluate(() => { (window as unknown as { __nestLauncher?: { open(): void } }).__nestLauncher?.open(); });
    await page.evaluate(async () => { await (window as unknown as { __nestStray?: { spawn(force?: boolean): Promise<void> } }).__nestStray?.spawn(true); });
    await page.waitForTimeout(800);
    await expect(page.locator("#nest-mock")).toHaveCount(0);
    await expect(page.locator(".nest-stray, .nest-ant, .nest-hill-live")).toHaveCount(0);
    await expect(page.locator("html")).not.toHaveAttribute("data-nest-open", /.*/);
  });
});

test("searching opens the panel on Enter or on the search icon, and typing alone does not", async ({ page }) => {
  await page.goto("/learn");
  const frame = await frameOf(page);
  await frame.locator("#fold").click();
  await expect(frame.locator("#panel")).toBeHidden();
  await frame.locator("#q").fill("loop");
  await expect(frame.locator("#panel")).toBeHidden();
  await frame.locator("#q").press("Enter");
  await expect(frame.locator("#panel")).toBeVisible();
  await expect(frame.locator("#panel h3")).toHaveText("Search");
  await frame.locator("#fold").click();
  await expect(frame.locator("#panel")).toBeHidden();
  await frame.locator("#qgo").click();
  await expect(frame.locator("#panel")).toBeVisible();
});

test.describe("search on a phone", () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true });
  test("typing shows nothing over the map, and Enter or the icon opens the modal", async ({ page }) => {
    await page.goto("/learn");
    const frame = await frameOf(page);
    await frame.locator("#q").fill("loop");
    await expect(frame.locator("#panel")).toBeHidden();
    await frame.locator("#q").press("Enter");
    await expect(frame.locator("#panel")).toBeVisible();
    await expect(frame.locator("#panel .results .rowbtn")).not.toHaveCount(0);
    await frame.locator("#pclose").click();
    await expect(frame.locator("#panel")).toBeHidden();
    await frame.locator("#qgo").click();
    await expect(frame.locator("#panel")).toBeVisible();
  });
});

test("when a chapter ends the main button becomes Next chapter, and the last chapter offers to finish", async ({ page }) => {
  await page.goto("/learn");
  const frame = await frameOf(page);
  await frame.evaluate(() => localStorage.removeItem("learn.progress.v1"));
  await frame.evaluate(() => { selectQuest("ai-teammate-never-asks-questions"); });
  await frame.locator('[data-act="begin"]').click();
  const book = frame.locator(".bk");
  const play = book.locator('[data-do="play"]');
  await expect(book.locator(".bk__crumb")).toContainText("Stop 3 of 4");
  for (let i = 0; i < 12; i++) { if ((await play.textContent())?.includes("Next chapter")) break; await book.locator('[data-do="next"]').click(); }
  await expect(play).toHaveText(/Next chapter/);
  await expect(book.locator('[data-do="replay"]')).toBeVisible();
  await play.click();
  await expect(book.locator(".bk__crumb")).toContainText("Stop 4 of 4");
  await expect(book.locator('[data-do="replay"]')).toBeHidden();
  for (let i = 0; i < 12; i++) { if ((await play.textContent())?.includes("Finish")) break; await book.locator('[data-do="next"]').click(); }
  await expect(play).toHaveText(/Finish and rest/);
});

test("a beat can light a figure: it is outlined, named for a screen reader, and let go on the next line", async ({ page }) => {
  await page.goto("/learn");
  const frame = await frameOf(page);
  await frame.evaluate(() => localStorage.removeItem("learn.progress.v1"));
  await frame.evaluate(() => { selectQuest("draw-it-before-the-ai-builds-it"); });
  await frame.locator('[data-act="begin"]').click();
  const book = frame.locator(".bk");
  const lit = book.locator(".bk__text .hl-fig");
  await expect(book.locator("mark.hl").first()).toBeVisible();
  await expect(lit).toHaveCount(0);
  for (let i = 0; i < 6 && (await lit.count()) === 0; i++) await book.locator('[data-do="next"]').click();
  await expect(lit).toHaveCount(1);
  await expect(lit).toBeVisible();
  await expect(lit).toHaveAttribute("aria-current", "true");
  await expect(lit).toHaveAttribute("aria-label", /six drawings/i);
  expect(await lit.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe("solid");
  await expect(book.locator("mark.hl")).toHaveCount(0);
  await book.locator('[data-do="next"]').click();
  await expect(lit).toHaveCount(0);
  await expect(book.locator("mark.hl").first()).toBeVisible();
});

test("a figure beat still lights its figure when the reader asks for reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/learn");
  const frame = await frameOf(page);
  await frame.evaluate(() => localStorage.removeItem("learn.progress.v1"));
  await frame.evaluate(() => { selectQuest("make-it-check-its-own-work"); });
  await frame.locator('[data-act="begin"]').click();
  const book = frame.locator(".bk");
  await book.locator('[data-do="nextstop"]').click();
  const lit = book.locator(".bk__text .hl-fig");
  for (let i = 0; i < 8 && (await lit.count()) === 0; i++) await book.locator('[data-do="next"]').click();
  await expect(lit).toBeVisible();
  await expect(lit).toHaveAttribute("aria-label", /From done to proven/);
});

test("a converted lesson plays chapter by chapter: each line lights its quote, and Next chapter advances to the finish", async ({ page }) => {
  await page.goto("/learn");
  const frame = await frameOf(page);
  await frame.evaluate(() => localStorage.removeItem("learn.progress.v1"));
  await frame.evaluate(() => { selectQuest("plan-big-type-small"); });
  await frame.locator('[data-act="begin"]').click();
  const book = frame.locator(".bk");
  const play = book.locator('[data-do="play"]');
  await expect(book.locator(".bk__crumb")).toContainText("Stop 1 of 3");
  for (const stop of [1, 2, 3]) {
    await expect(book.locator(".bk__crumb")).toContainText(`Stop ${stop} of 3`);
    await expect(book.locator("mark.hl").first()).toBeVisible();
    for (let i = 0; i < 8; i++) { if (/Next chapter|Finish/.test((await play.textContent()) ?? "")) break; await book.locator('[data-do="next"]').click(); }
    if (stop < 3) { await expect(play).toHaveText(/Next chapter/); await play.click(); }
  }
  await expect(play).toHaveText(/Finish and rest/);
});

test("a note whose lesson is cut in two parts opens at the first part and counts its stops on from there", async ({ page }) => {
  await page.goto("/learn");
  const frame = await frameOf(page);
  await frame.evaluate(() => localStorage.removeItem("learn.progress.v1"));
  const stops = await frame.evaluate(() => { selectQuest("build-the-floor"); return QUESTS.find((q) => q.id === "build-the-floor")!.stops.length; });
  expect(stops).toBe(9);
  await frame.locator('[data-act="begin"]').click();
  const book = frame.locator(".bk");
  await expect(book.locator(".bk__crumb")).toContainText("Stop 1 of 5");
  await book.locator('[data-do="nextstop"]').click();
  await book.locator(".trial input").check();
  expect(await frame.evaluate(() => localStorage.getItem("learn.progress.v1"))).toContain('"build-the-floor":[1]');
});

test("the panel's Begin quest and Where I am sit in a centered bar pinned above the footer, and a stop says Begin this stop", async ({ page }) => {
  await page.goto("/learn");
  const frame = await frameOf(page);
  await frame.evaluate(() => { selectQuest("ten-times-zero"); });
  const bar = frame.locator("#panel .pcta");
  await expect(bar).toBeVisible();
  await expect(bar.locator("button.primary")).toHaveText("Begin quest");
  await expect(bar.locator('[data-act="where"]')).toBeVisible();
  // it stays in view while the panel scrolls, directly above the previous and next footer
  await frame.locator("#panel").evaluate((el) => { el.scrollTop = el.scrollHeight; });
  const box = await bar.boundingBox(), foot = await frame.locator("#panel .pfoot").boundingBox();
  expect(Math.abs(box!.y + box!.height - foot!.y)).toBeLessThanOrEqual(2);
  await frame.evaluate(() => { selectStop("start-here", 0); });
  await expect(frame.locator("#panel .pcta button.primary")).toHaveText("Begin this stop");
});

test("the home panel offers Start at zero progress and Continue after, and Start opens lesson one", async ({ page }) => {
  await page.goto("/learn");
  const frame = await frameOf(page);
  await resetGuild(frame);
  await frame.evaluate(() => { for (const q of QUESTS) PROG[q.id]!.clear(); (window as unknown as { home(): void }).home(); });
  const row = frame.locator("#panel .pc-body > .row").first();
  await expect(row.locator("button")).toHaveCount(1);
  await expect(row.locator('[data-act="start"]')).toHaveText(/Start with quest 1/);
  await expect(frame.locator("#panel .pc-body .sub").first()).toContainText("0 of 21 quests done");
  // Start goes to the first lesson, not to a region page
  await row.locator('[data-act="start"]').click();
  const book = frame.locator(".bk");
  await expect(book).toBeVisible();
  await expect(book.locator(".bk__note h3")).toContainText("Six Months In");
  await page.keyboard.press("Escape");
  // one finished stop later, the one button becomes Continue and opens the next unfinished stop
  await frame.evaluate(() => { PROG["start-here"]!.add(0); (window as unknown as { placeYou(): void }).placeYou(); (window as unknown as { home(): void }).home(); });
  await expect(row.locator("button")).toHaveCount(1);
  await expect(row.locator('[data-act="cont"]')).toHaveText(/Continue where I left off/);
  await row.locator('[data-act="cont"]').click();
  await expect(book).toBeVisible();
  await expect(book.locator(".bk__crumb")).toContainText("Stop 2");
});

test("the quest sheet's main button says what it opens, and the Harbor page leads with its first quest", async ({ page }) => {
  await page.goto("/learn");
  const frame = await frameOf(page);
  await resetGuild(frame);
  await frame.evaluate(() => { for (const q of QUESTS) PROG[q.id]!.clear(); selectQuest("start-here"); });
  await expect(frame.locator("#panel .pcta button.primary")).toHaveText("Begin quest");
  await frame.evaluate(() => { PROG["start-here"]!.add(0); selectQuest("start-here"); });
  await expect(frame.locator("#panel .pcta button.primary")).toHaveText("Next: stop 2");
  await frame.evaluate(() => { PROG["start-here"]!.add(1); selectQuest("start-here"); });
  await expect(frame.locator("#panel .pcta button.primary")).toHaveText("Read it again");
  // the Harbor page: no primary button that leaves the site, the ferry says what it skips, Claude Academy is a plain link
  await frame.evaluate(() => selectRegion(1));
  await expect(frame.locator('#panel [data-act="ferry"]')).toHaveText("Skip ahead to the Guild Hall");
  await expect(frame.locator('#panel .pc-body > .row button.primary')).toHaveCount(0);
  const link = frame.locator('#panel a[data-act="academy"]');
  await expect(link).toHaveAttribute("href", "https://academy.claude.com");
  await expect(link).toHaveAttribute("target", "_blank");
});

test("the book's tabs are Book, Log, Runes and Pack, each with a line saying what it holds, and none says Codex", async ({ page }) => {
  await page.goto("/learn");
  const frame = await frameOf(page);
  await frame.evaluate(() => { (window as unknown as { selectQuest(i: string): void }).selectQuest("start-here"); });
  await frame.locator('[data-act="begin"]').click();
  const book = frame.locator(".bk");
  await expect(book.locator(".bk__tabs [data-tab]")).toHaveText(["Book", "Log", "Runes", "Pack"]);
  for (const [tab, heading] of [["log", /your place in this quest/], ["runes", /ideas you have learned/], ["pack", /where to read more/]] as const) {
    await book.locator(`.bk__tabs [data-tab="${tab}"]`).click();
    await expect(book.locator(".bk__alt h3, .mini h3").first()).toContainText(heading);
  }
  await expect(book.locator(".bk__tabs")).not.toContainText("Codex");
  await expect(book).toContainText("Save and close");
});

test("a badge shows the runes collected under it, drawn as pixels, and the region's other runes faint with an n of m count", async ({ page }) => {
  await page.goto("/learn");
  let frame = await frameOf(page);
  await resetGuild(frame);
  const code = await frame.evaluate(() => {
    const progress: Record<string, number[]> = {};
    QUESTS.filter((q) => (q as Quest & { region: number }).region === 1).forEach((q) => { progress[q.id] = q.stops.map((_, i) => i); });
    return Guild.codeOf({ v: 1, name: "Test Holder", seed: "ABC234", since: "2026-11", evidence: "", progress, runes: { "harbor:builders-not-coders": 1, "harbor:it-says-yes": 1 } });
  });
  await page.goto("/learn#badge=1." + code);
  frame = await frameOf(page);
  const grid = frame.locator(".gc .gc__runegrid");
  await expect(grid).toBeVisible();
  await expect(frame.locator(".gc [data-runecount]")).toHaveText(/^2 of \d+$/);
  // the collected runes are named with their line, each at icon size and drawn as pixels
  await expect(grid.locator("> div")).toHaveCount(2);
  await expect(grid.locator("> div").first()).toContainText("builders not coders");
  const size = await grid.locator("canvas").first().evaluate((cv: HTMLCanvasElement) => cv.getBoundingClientRect().width);
  expect(size).toBeLessThanOrEqual(40);
  const inked = await grid.locator("canvas").first().evaluate((cv: HTMLCanvasElement) => cv.getContext("2d")!.getImageData(0, 0, 7, 7).data.some((v, i) => i % 4 === 3 && v > 0));
  expect(inked).toBe(true);
  // the rest of the region's runes follow as small faint tiles, named for a screen reader
  const rest = frame.locator(".gc .gc__runerest canvas");
  expect(await rest.count()).toBeGreaterThan(0);
  await expect(rest.first()).toHaveAttribute("aria-label", /not collected yet/);
  await expect(frame.locator(".gc .gc__rest")).toContainText("Still to find");
});

test("folding and unfolding the side panel leaves the map where it is, because the panel lies over it", async ({ page }) => {
  await page.goto("/learn");
  const frame = await frameOf(page);
  const view = () => frame.evaluate(() => { const o = (window as unknown as { origin(): { vx: number; vy: number; z: number } }).origin(); return [o.vx, o.vy, o.z]; });
  const before = await view();
  await frame.locator("#fold").click();
  await expect(frame.locator("#panel")).toBeHidden();
  expect(await view()).toEqual(before);
  await frame.locator("#fold").click();
  await expect(frame.locator("#panel")).toBeVisible();
  expect(await view()).toEqual(before);
});

test.describe("on a phone, fingers and the lesson header", () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true });

  const tooSmall = (frame: Awaited<ReturnType<typeof frameOf>>, selector: string) =>
    frame.evaluate((sel) => [...document.querySelectorAll<HTMLElement>(sel)]
      .filter((e) => e.offsetParent && getComputedStyle(e).visibility !== "hidden")
      .map((e) => { const r = e.getBoundingClientRect(); return { name: (e.getAttribute("aria-label") || e.textContent || "").trim().slice(0, 30), w: Math.round(r.width), h: Math.round(r.height) }; })
      .filter((x) => x.w < 44 || x.h < 44), selector);

  test("every control on the map and in the guide is at least 44 px each way (the numbered pins on the map itself are left out)", async ({ page }) => {
    await page.goto("/learn");
    const frame = await frameOf(page);
    const map = ".ctl button, #settings, .chipsbar .chip, .searchbar button, #mprev, #mnext, #mopen";
    expect(await tooSmall(frame, map)).toEqual([]);
    await frame.locator("#mopen").click();
    await frame.evaluate(() => { selectQuest("ten-times-zero"); });
    await expect(frame.locator("#panel .pcta")).toBeVisible();
    const guide = "#panel button, #panel .stopline, #panel .pfoot .step, .pclose";
    expect(await tooSmall(frame, guide)).toEqual([]);
  });

  test("the lesson book has 44 px controls, a two-row header that starts the text high, and a Note and Guide switch that shows its side", async ({ page }) => {
    await page.goto("/learn#quest=ten-times-zero");
    const frame = await frameOf(page);
    await frame.locator('[data-act="begin"], #mopen').first().waitFor();
    await frame.evaluate(() => { (window as unknown as { openQuest(i: string, l: boolean, s: number): void }).openQuest("ten-times-zero", true, 0); });
    const book = frame.locator(".bk");
    await expect(book).toBeVisible();
    expect(await tooSmall(frame, ".bk button, .bk .tb span, .bk__note a")).toEqual([]);
    // the stop and its count on one line, with the region and quest left off
    const crumb = book.locator(".bk__crumb");
    await expect(crumb).toContainText("Stop 1 of 6");
    await expect(crumb.locator(".bk__where")).toBeHidden();
    const rows = await frame.evaluate(() => {
      const q = (s: string) => document.querySelector(s)!.getBoundingClientRect();
      return { sheetTop: q(".bk__sheet").top, noteTop: q(".bk__leafnote").top, crumb: q(".bk__crumb"), tabs: q(".bk__tabs"), pg: q(".bk__pg") };
    });
    expect(rows.noteTop - rows.sheetTop).toBeLessThan(125);
    expect(rows.crumb.height).toBeLessThan(44 + 12);                 // one line, not two
    expect(Math.abs(rows.crumb.top - rows.pg.top)).toBeLessThan(20);  // the switch sits beside it
    expect(rows.tabs.top).toBeGreaterThan(rows.crumb.top);
    // the switch says which side is showing
    const note = book.locator('.bk__pg [data-page="note"]'), guide = book.locator('.bk__pg [data-page="guide"]');
    await expect(note).toHaveAttribute("aria-pressed", "true");
    await guide.click();
    await expect(guide).toHaveAttribute("aria-pressed", "true");
    await expect(note).toHaveAttribute("aria-pressed", "false");
  });
});

const settle = (page: Page) => page.waitForTimeout(900);

test("zooming by hand stops at Landmark, a chosen stop goes to Stops, and zooming out from there works", async ({ page }) => {
  await page.goto("/learn");
  const frame = await frameOf(page);
  const zoom = () => frame.evaluate(() => V.z);
  for (let i = 0; i < 6; i++) { await frame.locator("#zin").click({ force: true }); await settle(page); }
  expect(await zoom()).toBe(4);
  await expect(frame.locator("#zname")).toHaveText("Landmark");
  await expect(frame.locator("#zin")).toBeDisabled();
  // the plus key and a double tap go through the same step, so they stop there too
  await page.keyboard.press("+"); await settle(page);
  expect(await zoom()).toBe(4);
  // choosing a stop is the way into Stops, and the plus button is still off there
  await frame.evaluate(() => { selectStop("ten-times-zero", 0); });
  await page.waitForTimeout(1200);
  expect(await zoom()).toBe(6);
  await expect(frame.locator("#zname")).toHaveText("Stops");
  await expect(frame.locator("#zin")).toBeDisabled();
  await frame.locator("#zout").click(); await settle(page);
  expect(await zoom()).toBe(4);
  await expect(frame.locator("#zin")).toBeDisabled();
  await frame.locator("#zout").click(); await settle(page);
  expect(await zoom()).toBe(3);
  await expect(frame.locator("#zin")).toBeEnabled();
});

test("close in, a card names the region under the view, and it is gone when zoomed out", async ({ page }) => {
  await page.goto("/learn");
  const frame = await frameOf(page);
  await expect(frame.locator("#wherelbl")).toBeHidden();
  await frame.evaluate(() => { selectQuest("ten-times-zero"); });
  await page.waitForTimeout(1200);
  await expect(frame.locator("#wherelbl")).toBeVisible();
  await expect(frame.locator("#wherelbl")).toHaveText("Loop Forest");
  await frame.locator("#zout").click(); await settle(page); await frame.locator("#zout").click(); await settle(page);
  await expect(frame.locator("#wherelbl")).toBeHidden();
});

test.describe("on a phone, close in", () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true });

  test("no pin is drawn under a control, the chips fold away, and the search is its icon until it is tapped", async ({ page }) => {
    await page.goto("/learn");
    const frame = await frameOf(page);
    await expect(frame.locator(".chipsbar")).toBeVisible();
    await frame.evaluate(() => { selectQuest("ten-times-zero"); document.body.removeAttribute("data-pm"); });
    await page.waitForTimeout(1300);
    expect(await frame.evaluate(() => V.z)).toBe(4);
    // the chips and the search field step aside to give the map room
    await expect(frame.locator(".chipsbar")).toBeHidden();
    await expect(frame.locator("#q")).toBeHidden();
    await expect(frame.locator(".searchbar .qgo")).toBeVisible();
    // no visible pin or card has its centre under a control
    const covered = await frame.evaluate(() => {
      const ctl = [".ctl", ".mnav", ".topright", ".zbar", ".searchbar", ".chipsbar"].map((q) => document.querySelector(q)).filter((e): e is Element => !!e && getComputedStyle(e).display !== "none" && getComputedStyle(e).visibility !== "hidden").map((e) => e.getBoundingClientRect());
      return [...document.querySelectorAll<HTMLElement>("#over .hit, #over .lbl")].filter((e) => getComputedStyle(e).visibility !== "hidden").filter((e) => {
        const r = e.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        return ctl.some((c) => cx > c.left && cx < c.right && cy > c.top && cy < c.bottom);
      }).map((e) => (e.getAttribute("aria-label") || e.textContent || "").slice(0, 30));
    });
    expect(covered).toEqual([]);
    // a tap opens the field, ready to type; leaving it empty folds it away again
    await frame.locator(".searchbar .qgo").click();
    await expect(frame.locator("#q")).toBeVisible();
    await expect(frame.locator("#q")).toBeFocused();
    await frame.locator("#q").blur();
    await expect(frame.locator("#q")).toBeHidden();
  });
});
