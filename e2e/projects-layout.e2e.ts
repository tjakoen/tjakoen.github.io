import { test, expect } from "@playwright/test";
import { readdir } from "node:fs/promises";

test.describe("Projects presentation in the editor shell", () => {
  test("stacks project visuals when the desktop main pane is narrow", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/projects");

    const main = await page.locator(".app-shell__main").boundingBox();
    const visual = await page.locator("#tools .project-feature__visual").boundingBox();
    const copy = await page.locator("#tools .project-feature__copy").boundingBox();
    expect(main).not.toBeNull();
    expect(visual).not.toBeNull();
    expect(copy).not.toBeNull();
    expect(main!.width).toBeLessThan(832);
    expect(copy!.y).toBeGreaterThan(visual!.y);
    const projectLink = page.locator('.app-dock a[href="/projects"]');
    await expect(projectLink).toBeVisible();
    expect(await page.locator(".app-dock").evaluate((el) => getComputedStyle(el).paddingTop)).toBe("8px");
    const activeBox = await projectLink.boundingBox();
    expect(activeBox).not.toBeNull();
    await page.goto("/notes");
    const inactiveBox = await projectLink.boundingBox();
    expect(inactiveBox).not.toBeNull();
    for (const dimension of ["x", "y", "width", "height"] as const) {
      expect(Math.abs(inactiveBox![dimension] - activeBox![dimension])).toBeLessThan(0.5);
    }
    await projectLink.click();
    const selectedBox = await projectLink.boundingBox();
    expect(selectedBox).not.toBeNull();
    for (const dimension of ["x", "y", "width", "height"] as const) {
      expect(Math.abs(selectedBox![dimension] - activeBox![dimension])).toBeLessThan(0.5);
    }
    await expect(projectLink).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(projectLink).toHaveAttribute("aria-current", "page");

    const experience = page.locator('.file-tree summary', { hasText: "Experience/" });
    await experience.click();
    await expect(page.locator('.file-tree a[href="/teaching"]')).toBeVisible();
    await expect(page.locator('.file-tree a[href="/talks"]')).toBeVisible();
    await expect(page.locator('.file-tree a[href="/badges"]')).toBeVisible();
  });

  test("introduces GRAIN beside PANTRY in the project index, then stacks both on narrow screens", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/projects");

    const grain = page.locator('.project-related a.project-feature__link[href="/grain"]');
    const pantry = page.locator('.project-related a.project-feature__link[href="/pantry"]');
    await expect(grain).toHaveText("Explore the design system →");
    await expect(pantry).toHaveText("Explore PANTRY →");
    await expect(page.locator(".project-related-grid")).toContainText("Every action passes through one door");
    await expect(page.locator(".project-related-grid")).toContainText("I designed GRAIN");
    await expect(page.locator(".project-related-grid")).toContainText("I built PANTRY");
    await expect(page.locator("#tools .project-proof")).toContainText("I built it");
    await expect(page.locator("#platform .project-feature__copy")).toContainText("I built BATCH");
    await expect(page.locator("#teaching .project-feature__copy")).toContainText("I designed and built");
    const cards = page.locator(".project-related");
    const first = await cards.nth(0).boundingBox();
    const second = await cards.nth(1).boundingBox();
    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    expect(second!.x).toBeGreaterThan(first!.x);
    expect(Math.abs(second!.y - first!.y)).toBeLessThan(1);

    await page.setViewportSize({ width: 390, height: 844 });
    const narrowFirst = await cards.nth(0).boundingBox();
    const narrowSecond = await cards.nth(1).boundingBox();
    expect(narrowFirst).not.toBeNull();
    expect(narrowSecond).not.toBeNull();
    expect(narrowSecond!.y).toBeGreaterThan(narrowFirst!.y);
    expect(await page.locator(".project-related-grid").evaluate((el) => el.scrollWidth))
      .toBeLessThanOrEqual(await page.locator(".project-related-grid").evaluate((el) => el.clientWidth));
  });

  test("uses side-by-side features when the main pane has enough room", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/projects");

    const main = await page.locator(".app-shell__main").boundingBox();
    const visual = await page.locator("#tools .project-feature__visual").boundingBox();
    const copy = await page.locator("#tools .project-feature__copy").boundingBox();
    expect(main).not.toBeNull();
    expect(visual).not.toBeNull();
    expect(copy).not.toBeNull();
    expect(main!.width).toBeGreaterThan(832);
    expect(copy!.x).toBeGreaterThan(visual!.x + visual!.width - 4);
    expect(copy!.y).toBeLessThan(visual!.y + visual!.height);
    expect(copy!.y + copy!.height).toBeGreaterThan(visual!.y);
  });

  test("teaching page shows an illustrative, privacy-safe assessment example on desktop and phone", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/teaching");
    const example = page.getByRole("heading", { name: "What that looks like" });
    await expect(example).toBeVisible();
    await expect(page.locator("main")).toContainText("not a copy of a current assignment or a student submission");
    await expect(page.locator('a[href="/badges"]').filter({ hasText: "Basic Programming in Web Development badge criteria" })).toBeVisible();
    await expect(page.locator('[aria-label="Illustrative assessment evidence"]')).toContainText("Small screens");

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(example).toBeVisible();
    const content = page.locator('[aria-label="Illustrative assessment evidence"]');
    expect(await content.evaluate((el) => el.scrollWidth)).toBeLessThanOrEqual(await content.evaluate((el) => el.clientWidth));
  });

  test("badge hub groups awards clearly and explains the current threshold", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/badges");
    await expect(page.locator("main")).toContainText("grouped by course, section, and term");
    await expect(page.locator("main")).toContainText("published 75% threshold after instructor review");
    await expect(page.locator("main")).toContainText("historical participation awards are still being reconciled");
    await expect(page.getByRole("heading", { name: /6APSI/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /6ADET/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /6INTROWEB/ })).toBeVisible();
    await expect(page.locator('a[href^="/badges/"]')).toHaveCount(14);

    await page.setViewportSize({ width: 390, height: 844 });
    const list = page.locator(".docs-list").first();
    expect(await list.evaluate((el) => el.scrollWidth)).toBeLessThanOrEqual(await list.evaluate((el) => el.clientWidth));

    await page.goto("/badges/apsi-2215-prelim");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: "All badge criteria" })).toHaveAttribute("href", "/badges");
    const badge = page.locator(".badge-class");
    expect(await badge.evaluate((el) => el.scrollWidth)).toBeLessThanOrEqual(await badge.evaluate((el) => el.clientWidth));
  });

  test("a recipient certificate links to its criteria and fits a phone", async ({ page }) => {
    const files = await readdir(new URL("../content/badges", import.meta.url));
    const certificate = files.find((file) => file.endsWith(".md") && file.includes("--"));
    expect(certificate).toBeDefined();
    const certificateSlug = certificate!.slice(0, -3);
    const classSlug = certificateSlug.split("--")[0]!;

    await page.goto("/sitemap.xml");
    expect(await page.content()).not.toContain(certificateSlug);
    await page.goto(`/badges/${classSlug}`);
    await expect(page.locator(`.badge-class a[href*="--"]`)).toHaveCount(0);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/badges/${certificateSlug}`);
    await expect(page.locator(".badge-cert h1")).toBeVisible();
    await expect(page.locator('.badge-verify a[href^="/badges/"]:not([href$=".json"])')).toBeVisible();
    await expect(page.getByRole("link", { name: "All badge criteria" })).toHaveAttribute("href", "/badges");

    const badge = page.locator(".badge-cert");
    expect(await badge.evaluate((el) => el.scrollWidth)).toBeLessThanOrEqual(await badge.evaluate((el) => el.clientWidth));
  });

  test("project detail pages put useful next steps near the introduction", async ({ page }) => {
    const pages = [
      ["/greenroom", "#try-it"],
      ["/greenroom", "#sample-run"],
      ["/pantry", "https://github.com/tjakoen/pantry"],
      ["/bread", "https://github.com/tjakoen/bread"],
      ["/batch", "/batch/docs/architecture"],
      ["/mill", "/mill/docs"],
      ["/proof", "/plans"],
      ["/crumb", "/crumb/docs/getting-started"],
      ["/native-github-classroom", "https://tjakoen.github.io/github-native-course-platform/?demo=1"],
      ["/native-github-classroom", "#architecture"],
      ["/native-github-classroom", "/native-github-classroom/docs"],
    ] as const;

    await page.setViewportSize({ width: 390, height: 844 });
    for (const [path, destination] of pages) {
      await page.goto(path);
      const links = page.locator("nav.project-links");
      await expect(links).toBeVisible();
      await expect(links.locator(`a[href="${destination}"]`)).toBeVisible();
      expect(await links.evaluate((el) => getComputedStyle(el).display)).toBe("flex");
      expect(await links.evaluate((el) => el.scrollWidth)).toBeLessThanOrEqual(
        await links.evaluate((el) => el.clientWidth),
      );
      if (destination.startsWith("/")) {
        const response = await page.request.get(destination);
        expect(response.ok(), `${destination} should resolve`).toBeTruthy();
      }
    }

    await page.goto("/grain");
    await expect(page.locator('.hero__cta a[href="https://github.com/tjakoen/grain"]')).toBeVisible();
    await expect(page.locator('.hero__cta a[href="/projects"]')).toBeVisible();

    for (const [path, ids] of [
      ["/greenroom", ["capabilities", "sample-run", "bug-handover", "hosted-editor", "run-modes", "try-it", "limits", "source"]],
      ["/native-github-classroom", ["architecture", "design", "safety", "demo", "read-more"]],
      ["/bread", ["start-building", "layers", "pantry-app", "architecture"]],
    ] as const) {
      await page.goto(path);
      const toc = page.locator("nav.project-toc");
      await expect(toc).toBeVisible();
      for (const id of ids) {
        await expect(page.locator(`#${id}`)).toHaveCount(1);
        await expect(toc.locator(`a[href="#${id}"]`)).toHaveCount(1);
      }
    }

    await page.goto("/native-github-classroom");
    const classroomActions = page.locator('nav.project-links[aria-label="Course platform links"]');
    await expect(classroomActions.locator("a").nth(0)).toHaveAttribute("href", "#architecture");
    await expect(classroomActions.locator("a").nth(1)).toHaveAttribute("href", "https://tjakoen.github.io/github-native-course-platform/?demo=1");
    await expect(classroomActions.locator("a").nth(2)).toHaveAttribute("href", "/native-github-classroom/docs");
    await expect(page.getByRole("img", { name: /A teacher control repo/ })).toBeVisible();

    await page.goto("/greenroom");
    const sampleHeading = page.locator("#sample-run");
    const sampleCopy = page.locator("#sample-run + p");
    const sampleTable = page.locator("#sample-run + p + table");
    await expect(sampleHeading).toBeVisible();
    await expect(sampleCopy).toContainText("ten-check matrix");
    await expect(sampleCopy).toContainText("seeded data");
    await expect(sampleCopy).toContainText("not a result from a live application");
    await expect(sampleTable.getByRole("row")).toHaveCount(5);
    await expect(sampleTable.getByRole("cell", { name: "Intentional failure" })).toHaveCount(2);
    await expect(page.locator('a[href*="demo%2Bdemo2-failed/index.html"]')).toBeVisible();
    await expect(sampleTable.evaluate((el) => el.scrollWidth <= el.clientWidth)).resolves.toBe(true);
  });
});
