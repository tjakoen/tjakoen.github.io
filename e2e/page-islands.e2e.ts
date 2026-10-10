import { expect, test } from "@playwright/test";

async function loadedPageIslands(page: import("@playwright/test").Page, route: string) {
  const loaded = new Set<string>();
  page.on("request", (request) => {
    const path = new URL(request.url()).pathname;
    if (/lightbox\.(?:css|js)$|\/site\/(?:figures|note-progress)\.js$/.test(path)) loaded.add(path);
  });
  await page.goto(route);
  return loaded;
}

test("pages without image, figure, or reading markers skip those island assets", async ({ page }) => {
  const loaded = await loadedPageIslands(page, "/");
  expect([...loaded]).toEqual([]);
});

test("long notes load reading progress and the live-figure loader", async ({ page }) => {
  const loaded = await loadedPageIslands(page, "/notes/ten-times-zero");
  expect([...loaded]).toContain("/site/figures.js");
  expect([...loaded]).toContain("/site/note-progress.js");
  expect([...loaded]).not.toContain("/scripts/lightbox.js");
});

test("pages with image controls load the lightbox code and stylesheet", async ({ page }) => {
  const loaded = await loadedPageIslands(page, "/native-github-classroom");
  expect([...loaded]).toContain("/scripts/lightbox.js");
  expect([...loaded]).toContain("/styles/lightbox.css");
  expect([...loaded]).not.toContain("/site/note-progress.js");
});
