import { test, expect } from "@playwright/test";

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

  test("project detail pages put useful next steps near the introduction", async ({ page }) => {
    const pages = [
      ["/greenroom", "#try-it"],
      ["/pantry", "https://github.com/tjakoen/pantry"],
      ["/bread", "https://github.com/tjakoen/bread"],
      ["/batch", "/batch/docs/architecture"],
      ["/mill", "/mill/docs"],
      ["/proof", "/plans"],
      ["/crumb", "/crumb/docs/getting-started"],
      ["/native-github-classroom", "https://tjakoen.github.io/github-native-course-platform/?demo=1"],
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
      ["/greenroom", ["capabilities", "bug-handover", "hosted-editor", "run-modes", "try-it", "limits", "source"]],
      ["/native-github-classroom", ["design", "safety", "demo", "read-more"]],
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
  });
});
