import { expect, test } from "@playwright/test";

async function loadFigureAssets(page: import("@playwright/test").Page, route: string) {
  const loaded = new Set<string>();
  page.on("request", (request) => {
    const path = new URL(request.url()).pathname;
    if (path.startsWith("/site/figure-")) loaded.add(path);
  });
  await page.goto(route);
  return loaded;
}

test.describe("live figures load only on pages that use them", () => {
  test("the home page keeps the live-figure modules off its request path", async ({ page }) => {
    const loaded = await loadFigureAssets(page, "/");
    expect([...loaded]).toEqual([]);
  });

  test("a note loads the figure families its live figures use", async ({ page }) => {
    const loaded = await loadFigureAssets(page, "/notes/ten-times-zero");
    expect([...loaded]).toContain("/site/figure-multiplier.js");
    expect([...loaded]).toContain("/site/figure-widgets.js");
    expect([...loaded]).not.toContain("/site/figure-floor.js");
  });

  test("a talk deck loads its live floor figures", async ({ page }) => {
    const loaded = await loadFigureAssets(page, "/talks/build-the-floor");
    expect([...loaded]).toEqual(["/site/figure-floor.js"]);
  });
});
