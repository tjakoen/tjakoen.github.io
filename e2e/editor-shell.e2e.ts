// portfolio/e2e/editor-shell.e2e.ts — THE EDITOR: the whole site presents as one editor window
// (portfolio/PLAN.md §THE EDITOR). Covers what only a browser shows: the window frame + status
// bar are real and consistent, the startup checkbox actually changes where "/" lands, the
// title-bar controls work, and the presence indicator reports the door's real state.
import { test, expect } from "@playwright/test";

test.describe("THE EDITOR — one window around the whole site", () => {
  test("the frame is consistent across pages (title bar, tabs, status bar)", async ({ page }) => {
    for (const path of ["/", "/grain", "/notes"]) {
      await page.goto(path);
      await expect(page.locator(".app-shell.app-window")).toBeVisible();
      await expect(page.locator(".window-bar")).toBeVisible();
      await expect(page.locator(".window-bar__nav button")).toHaveCount(3);   // back / refresh / forward
      await expect(page.locator(".status-bar")).toBeVisible();
      await expect(page.locator(".status-bar [data-breadcrumb]")).toBeVisible();
    }
    // THE EDITOR v2: the tabs are the OPEN PAGES — visiting /grain put it in the strip, current
    await page.goto("/grain");
    await expect(page.locator('[data-open-tabs] .tab[href="/grain"]')).toHaveAttribute("aria-current", "page");
    // …and the explorer marks the page's real source file
    await expect(page.locator('.file-tree a[href="/grain"]')).toHaveAttribute("aria-current", "page");
  });

  test("the breadcrumb sits in the status bar; the title-bar search opens the palette", async ({ page }) => {
    await page.goto("/notes");
    await expect(page.locator(".status-bar [data-breadcrumb]")).toContainText("notes");
    await expect(page.locator(".window-bar__search")).toContainText("portfolio.tjakoen.com");   // static label, no breadcrumb
    await page.locator(".window-bar__search").click();
    await expect(page.locator(".cmdk[open]")).toBeVisible();   // the palette dropped from the search
  });

  test("the viewport label follows resizing and the mobile preview keeps the Desk drawer usable", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/grain");
    const viewportToggle = page.locator('[data-shell="viewport-toggle"]');
    const shell = page.locator(".app-shell");
    const asideToggle = page.getByRole("button", { name: "Toggle the assistant panel" });
    await expect(viewportToggle).toHaveText(/desktop/);

    await viewportToggle.click();
    await expect(viewportToggle).toHaveText(/tablet/);
    await expect(asideToggle).toBeVisible();
    expect(await page.locator("html").evaluate((html) => getComputedStyle(html).backgroundColor))
      .toBe(await page.locator("body").evaluate((body) => getComputedStyle(body).backgroundColor));

    await viewportToggle.click();
    await expect(viewportToggle).toHaveText(/mobile/);
    await expect(asideToggle).toBeHidden();
    await page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Browse" }).click();
    await expect(shell).toHaveAttribute("data-aside-open", "");
    await page.keyboard.press("Escape");

    await page.setViewportSize({ width: 780, height: 720 });
    await expect(viewportToggle).toHaveText(/tablet/);
    await expect(asideToggle).toBeVisible();
    await viewportToggle.click();
    await expect(viewportToggle).toHaveText(/mobile/);
    await page.setViewportSize({ width: 768, height: 720 });
    await expect(viewportToggle).toHaveText(/mobile/);
    await page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Browse" }).click();
    await expect(shell).toHaveAttribute("data-aside-open", "");
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(viewportToggle).toHaveText(/desktop/);
    await expect(shell).not.toHaveAttribute("data-aside-open");
  });

  test("presence is HONEST: the status bar reports online once the door's ready lands", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toHaveAttribute("data-ai-online", "true", { timeout: 5000 });
    await expect(page.locator(".presence .presence__on")).toBeVisible();
    await expect(page.locator(".presence .presence__off")).toBeHidden();
  });

  test("the welcome-on-refresh checkbox is FUNCTIONAL: unchecked (default), a REFRESH of '/' reopens where you left off — a plain navigate to '/' does not", async ({ page }) => {
    await page.goto("/");
    const box = page.locator("[data-startup-checkbox]");
    await expect(box).not.toBeChecked();              // default: unchecked
    await expect(page.locator(".welcome__title")).toBeVisible();   // first-ever "/" load has no last page yet
    await page.goto("/grain");                        // leave the desk on a page…
    // a plain NAVIGATE to "/" (pinned tab, tab-close fallback, logo) must NOT bounce away —
    // only an actual refresh honors the checkbox
    await page.goto("/");
    await expect(page.locator(".welcome__title")).toBeVisible();
    await page.reload();                              // …but reloading "/" DOES reopen last-page
    await expect(page).toHaveURL(/\/grain$/);
    // unchecked leaves refreshes of OTHER pages untouched — you're already where you meant to be
    await page.reload();
    await expect(page).toHaveURL(/\/grain$/);
    // check it → refreshing ANYWHERE opens Welcome, not just "/" (the actual "on refresh" ask)
    await page.evaluate(() => localStorage.setItem("tj.welcome-startup", "on"));
    await page.reload();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator(".welcome__title")).toBeVisible();
  });

  test("the 'Dark mode defaults to system' checkbox reflects the LIVE scheme (not stale after the scheme button)", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    const box = page.locator("[data-scheme-auto-checkbox]");
    const button = page.locator("[data-scheme-cycle]").first();
    const scheme = () => page.evaluate(() => document.documentElement.getAttribute("data-color-scheme"));
    // a first visit is pinned to light (scripts/theme-default.js), so the box starts unticked
    expect(await scheme()).toBe("light");
    await expect(box).not.toBeChecked();
    // the scheme button moves light → dark → match your device; the box follows the live state
    await button.click();
    expect(await scheme()).toBe("dark");
    await expect(box).not.toBeChecked();
    await button.click();
    expect(await scheme()).toBeNull();
    await expect(box).toBeChecked();
    await expect(button).toHaveText("◐");
    await button.click();
    expect(await scheme()).toBe("light");
    await expect(box).not.toBeChecked();
    // ticking the box returns to following the system, and un-ticking pins a scheme again
    await box.check();
    expect(await scheme()).toBeNull();
    await box.uncheck();
    expect(await scheme()).not.toBeNull();
  });

  test("a first visit opens in brioche light and keeps a later choice of the default flavor", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "brioche");
    await expect(html).toHaveAttribute("data-color-scheme", "light");
    // picking sourdough (the bare default, which clears GRAIN's key) must survive a reload
    await page.locator("[data-cycle-theme]").first().click();
    await expect(page.locator("[data-theme-name]").first()).toHaveText("sourdough");
    await page.reload();
    await expect(page.locator("[data-theme-name]").first()).toHaveText("sourdough");
    await expect(html).not.toHaveAttribute("data-theme", "brioche");
  });

  test("the Desk closes from its header and reopens from the editor tabs; the terminal expands from the title bar", async ({ page }) => {
    await page.goto("/grain");
    const shell = page.locator(".app-shell");
    const asideToggle = page.locator(".app-shell__topbar").getByRole("button", { name: "Toggle the assistant panel" });
    await expect(page.locator(".app-shell__aside")).toBeVisible();
    await page.getByRole("button", { name: "Close the assistant panel" }).press("Enter");
    await expect(shell).toHaveAttribute("data-aside-hidden", "true");
    await expect(asideToggle).toBeFocused();
    await expect(page.locator(".app-shell__aside")).toBeHidden();
    await expect(page.getByRole("tab", { name: "Chat", exact: true })).toHaveCount(0);
    await page.reload();
    await expect(page.locator(".app-shell__aside")).toBeHidden();
    await asideToggle.click();
    await expect(page.locator(".app-shell__aside")).toBeVisible();
    // the title-bar terminal button EXPANDS/COLLAPSES the feed (it does not hide the strip)
    await expect(page.locator(".console__feed")).toBeHidden();
    await page.locator('.window-bar__ctl [data-shell="console-toggle"]').click();
    await expect(shell).toHaveAttribute("data-console-open", "");
    await expect(page.locator(".console__feed")).toBeVisible();
    await page.locator('.window-bar__ctl [data-shell="console-toggle"]').click();
    await expect(shell).not.toHaveAttribute("data-console-open", "");
  });

  test("'Ask the desk' hands focus to the assistant composer (href stays the no-JS fallback)", async ({ page }) => {
    await page.goto("/");
    await page.locator('.start [data-shell="focus-chat"]').click();
    await expect(page).toHaveURL(/\/$/);              // stayed on the page
    await expect(page.locator(".assistant__composer input")).toBeFocused();
  });

  test("the theme cycle shows the current flavor name", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-theme-name]").first()).toHaveText("brioche");
    await page.locator("[data-cycle-theme]").first().click();
    await expect(page.locator("[data-theme-name]").first()).toHaveText("sourdough");
    await page.evaluate(() => localStorage.removeItem("grain-theme"));
  });

  test("window controls separate their symbols from labels and the status bar uses one typeface", async ({ page }) => {
    await page.goto("/projects");
    for (const control of ['[data-cycle-theme]', '[data-shell="viewport-toggle"]']) {
      await expect(page.locator(control).first()).toHaveCSS("gap", "4px");
    }

    const font = await page.locator(".status-bar").evaluate((el) => getComputedStyle(el).fontFamily);
    for (const selector of [".status-bar__crumb", ".status-bar__byline", ".status-bar__contact"]) {
      await expect(page.locator(selector)).toHaveCSS("font-family", font);
    }
    await expect(page.locator(".status-bar__byline")).not.toContainText("🤖");
    await expect(page.locator(".status-bar__byline")).toContainText("I direct, Claude types.");
  });

  test("fresh cache: the desk greets in the chat, and the conversation persists across navigation", async ({ page }) => {
    // each test gets an isolated context → a genuinely fresh cache
    await page.goto("/");
    const hello = page.locator('[data-surface="chat-log"] .chat-message[data-role="ai"] .chat-message__body').first();
    await expect(hello).toContainText("I'm the desk", { timeout: 6000 });   // typed greeting
    await expect(hello).toHaveClass(/chat-message__body/);
    await expect(page.locator('[data-surface="chat-log"] .chat-message[data-role="ai"]').first()).toHaveAttribute("data-grade", "grain");
    // navigate away and back — the chat (and terminal) are persistent throughout the app
    await page.goto("/notes");
    await expect(page.locator('[data-surface="chat-log"] .chat-message[data-role="ai"]')).toHaveCount(1);
    await expect(page.locator('[data-surface="chat-log"] .chat-message__body').first()).toContainText("I'm the desk");
  });

  test("during a run: the chat shows a thinking box with 'open in terminal', and the docked terminal stays above the veil", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/grain");
    await page.getByRole("button", { name: /Watch the AI act/ }).click();   // demo.run — the surviving scripted run
    await expect(page.locator(".app-shell")).toHaveAttribute("data-acting", "true");
    // the chat's compact thinking indicator (the full narration is the terminal)
    await expect(page.locator(".chat-thinking")).toBeVisible();
    // the docked terminal is not dimmed by the spotlight veil (it sits above it)
    await expect(page.locator(".app-shell__console")).toHaveCSS("z-index", "9002");
    // "open in terminal" expands the docked terminal
    await page.locator('.chat-thinking [data-shell="open-terminal"]').click();
    await expect(page.locator(".app-shell")).toHaveAttribute("data-console-open", "");
    await expect(page.locator('.console__box [data-surface="console"]')).toBeVisible();
  });
});
