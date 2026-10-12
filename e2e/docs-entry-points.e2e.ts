import { test, expect } from "@playwright/test";

test.describe("developer docs entry points", () => {
  test("every package docs route has one heading, a project return link, and a phone-safe pane", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/docs");
    const routes = await page.locator('.docs-list a[href^="/"]').evaluateAll((links) =>
      [...new Set(links.map((link) => (link as HTMLAnchorElement).pathname)
        .filter((path) => /^\/(batch|grain|mill|proof|crumb|pantry)\/docs(?:\/|$)/.test(path)))],
    );
    expect(routes.length).toBeGreaterThan(20);

    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status(), route).toBe(200);
      await expect(page.getByRole("heading", { level: 1 }), route).toHaveCount(1);
      const project = route.match(/^\/(batch|grain|mill|proof|crumb|pantry)\//)?.[1];
      expect(project, route).toBeTruthy();
      await expect(page.locator(`.docs-context-link a[href="/${project}"]`), route).toBeVisible();

      const main = page.locator(".app-shell__main");
      const width = await main.evaluate((element) => ({ client: element.clientWidth, scroll: element.scrollWidth }));
      expect(width.scroll, route).toBeLessThanOrEqual(width.client + 1);
    }
  });

  test("the docs index keeps long descriptions inside the phone content pane", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/docs");

    const main = page.locator(".app-shell__main");
    const width = await main.evaluate((element) => ({
      client: element.clientWidth,
      scroll: element.scrollWidth,
    }));
    expect(width.scroll).toBeLessThanOrEqual(width.client + 1);
    await expect(page.locator('.docs-list a[href="/pantry/docs/what-it-composes"]')).toBeVisible();
    await expect(page.locator('.docs-list a[href="/batch/docs/consume-as-git-deps"] + .docs-list__what'))
      .toContainText("PROOF's pinned GitHub dependency");
    await expect(page.locator('.docs-list a[href="/batch/docs/static-export-and-deploy"] + .docs-list__what'))
      .toContainText("portfolio app's running server");
  });

  test("the GRAIN action guide demonstrates registered surface addresses", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/grain/docs/ai-interface");
    const addresses = page.locator(".board pre").first();
    await expect(addresses).toContainText("block:b2");
    await expect(addresses).toContainText("field:builder-ask");
    await expect(addresses).toContainText("chat-log");
    await expect(addresses).toContainText("push-only");
    const width = await addresses.evaluate((element) => ({ client: element.clientWidth, scroll: element.scrollWidth }));
    expect(width.scroll).toBeLessThanOrEqual(width.client + 1);
  });

  test("the GRAIN action guide distinguishes server rendering from the static client door", async ({ page }) => {
    await page.goto("/grain/docs/ai-interface");
    await expect(page.locator(".board")).toContainText("Some ops carry rendered HTML fragments");
    await expect(page.locator(".board")).toContainText("the client door uses the same contract and dispatcher");
    await expect(page.locator(".board")).toContainText("limit it to service-free scenarios");
  });

  test("the GRAIN tutorial identifies the default client transport and the server SSE option", async ({ page }) => {
    await page.goto("/grain/docs/tutorial");
    await expect(page.locator(".board")).toContainText("bun run dev command and the deployed static export use the browser client door");
    await expect(page.locator(".board")).toContainText("bun run dev:stub");
    await expect(page.locator(".board")).toContainText("receives operations over SSE");
  });

  test("package setup docs match the published packages and current host boundary", async ({ page }) => {
    await page.goto("/batch/docs/getting-started");
    await expect(page.locator(".board")).toContainText("BATCH is a library, not a server of its own");
    await expect(page.locator(".board")).toContainText("bun add @tjakoen/batch");
    await expect(page.locator(".board")).toContainText("BATCH does not generate robots.txt");

    await page.goto("/grain/docs/getting-started");
    await expect(page.locator(".board")).toContainText("bun add @tjakoen/grain");
    await expect(page.locator(".board")).toContainText("public npm registry");

    await page.goto("/grain/docs/grain");
    await expect(page.locator(".board")).toContainText("An opted-in static page uses the browser's");
    await expect(page.locator(".board")).toContainText("These are feature modules, not a client-framework runtime.");
    await expect(page.locator(".board")).toContainText("spotlight, log, navigate, choices, fill, tick, span, and move");

    await page.goto("/grain/docs/getting-started");
    await expect(page.locator(".board")).toContainText("through the configured server or client door");
    await expect(page.locator(".board")).not.toContainText("clicking it becomes POST /intent");

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/grain/docs/tutorial");
    await expect(page.locator(".board")).toContainText('  | "field"');
    await expect(page.locator(".board")).toContainText('  | "check"');
    await expect(page.locator(".board")).toContainText('  | "block"');
    await expect(page.locator(".board")).toContainText('"check.set"');
    await expect(page.locator(".board")).toContainText('  | "block.remove"');
    await expect(page.locator(".board")).toContainText('  | "block.span"');
    await expect(page.locator(".board")).toContainText('  | "block.move"');
    const contractSample = page.locator(".board pre").first();
    const contractSampleWidth = await contractSample.evaluate((element) => ({
      client: element.clientWidth,
      scroll: element.scrollWidth,
    }));
    expect(contractSampleWidth.scroll).toBeLessThanOrEqual(contractSampleWidth.client + 1);

    await page.goto("/grain/docs/add-a-component");
    await expect(page.locator(".board")).toContainText("packages/grain/components/<layer>/<name>/");
    await expect(page.locator(".board")).toContainText("bun run --filter @tjakoen/grain check");
    await expect(page.locator(".board")).toContainText("the GRAIN package version the portfolio resolves");
    await expect(page.locator(".board")).not.toContainText("the new component appears automatically");

    await page.goto("/mill/docs/getting-started");
    await expect(page.locator(".board")).toContainText("is a content rendering engine");
    await expect(page.locator(".board")).not.toContainText("CMS");

    await page.goto("/batch/docs/consume-as-git-deps");
    await expect(page.locator(".board")).toContainText("pinned public GitHub commit");
    await expect(page.locator(".board")).toContainText("no GitHub token");
    await expect(page.locator(".board")).toContainText("portfolio's layer guides live in this repository's");
    await expect(page.locator(".board")).toContainText("bun add @tjakoen/crumb");

    await page.goto("/batch/docs/conventions");
    await expect(page.locator(".board")).toContainText("BATCH is a standalone library");
    await expect(page.locator(".board")).toContainText("The package split is complete");

    await page.goto("/batch/docs/add-a-route");
    await expect(page.locator(".board")).toContainText("From the repository root");
    await expect(page.locator(".board")).toContainText("mkdir -p pages/widgets");
    await expect(page.locator(".board")).not.toContainText("tjakoen.github.io/pages/widgets");

    await page.goto("/proof/docs/getting-started");
    await expect(page.locator(".board")).toContainText("plansDir, the directory PROOF reads");
    await expect(page.locator(".board")).not.toContainText("the one thing PROOF asks the host for");
  });

  test("the static export guide points to the portfolio deploy workflow", async ({ page }) => {
    await page.goto("/batch/docs/static-export-and-deploy");
    await expect(page.locator(".board")).toContainText("BATCH itself is a library");
    await expect(page.locator(".board")).toContainText("bun run verify:export");
    await expect(page.locator(".board")).toContainText("content, deck, plan, and generated routes");
    await expect(page.locator(".board")).toContainText("rewrites CSS and JavaScript references");
    await expect(page.locator('.board a[href="https://github.com/tjakoen/tjakoen.github.io/blob/main/.github/workflows/pages.yml"]'))
      .toBeVisible();
    await page.goto("/batch/docs/architecture");
    await expect(page.locator(".board")).toContainText("BATCH exports exportSite() as a library");
    await expect(page.locator(".board")).toContainText("the portfolio's host-owned bun run export");
    await expect(page.locator(".board")).toContainText("binary assets are copied byte-for-byte");
    await expect(page.locator(".board")).not.toContainText("exposed as bun run export");
  });

  test("the route guide explains page discovery and exporter exceptions", async ({ page }) => {
    await page.goto("/batch/docs/add-a-route");
    await expect(page.locator(".board")).toContainText("ordinary page reaches search and static export");
    await expect(page.locator(".board")).toContainText("review-only and operable routes");
    await expect(page.locator(".board")).toContainText("adds generated pages such as /cv explicitly");
    await expect(page.locator(".board")).not.toContainText("nothing else to wire");
  });

  test("the generated reference links back to the project stories and contains wide tables", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/reference");

    await expect(page.locator('.reference-context a[href="/bread"]')).toBeVisible();
    await expect(page.locator('.reference-context a[href="/grain"]')).toBeVisible();
    await expect(page.locator(".reference-scroll-hint")).toBeVisible();
    await expect(page.locator(".reference-scroll-hint")).toContainText("Swipe to see the remaining columns");
    const main = page.locator(".app-shell__main");
    const width = await main.evaluate((element) => ({
      client: element.clientWidth,
      scroll: element.scrollWidth,
    }));
    expect(width.scroll).toBeLessThanOrEqual(width.client + 1);
    const table = page.locator(".reference-table-scroll").first();
    expect(await table.evaluate((element) => element.scrollWidth)).toBeGreaterThan(
      await table.evaluate((element) => element.clientWidth),
    );
  });

  test("long BATCH and GRAIN docs keep tables and code inside the phone content pane", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const [route, projectPath] of [
      ["/batch/docs/architecture", "/batch"],
      ["/batch/docs/conventions", "/batch"],
      ["/grain/docs/add-a-component", "/grain"],
    ]) {
      await page.goto(route);
      const main = page.locator(".app-shell__main");
      const width = await main.evaluate((element) => ({
        client: element.clientWidth,
        scroll: element.scrollWidth,
      }));
      expect(width.scroll, route).toBeLessThanOrEqual(width.client + 1);
      await expect(page.locator(`.board a[href="${projectPath}"]`).last()).toBeVisible();

      if (route === "/batch/docs/architecture") {
        const hasScrollableTable = await page.locator("table.table").evaluateAll((tables) =>
          tables.some((table) => table.scrollWidth > table.clientWidth + 1),
        );
        expect(hasScrollableTable).toBe(true);
      }
    }
  });

  test("the component catalog returns to the GRAIN project introduction", async ({ page }) => {
    await page.goto("/catalog");
    await expect(page.locator('.cat-back[href="/grain"]')).toContainText("GRAIN");
  });
});
