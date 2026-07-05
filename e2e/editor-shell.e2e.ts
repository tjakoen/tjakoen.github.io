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
    await expect(page.locator(".window-bar__search")).toContainText("Tjakoen.github.io");   // static label, no breadcrumb
    await page.locator(".window-bar__search").click();
    await expect(page.locator(".cmdk[open]")).toBeVisible();   // the palette dropped from the search
  });

  test("presence is HONEST: the status bar reports online once the door's ready lands", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toHaveAttribute("data-ai-online", "true", { timeout: 5000 });
    await expect(page.locator(".presence .presence__on")).toBeVisible();
    await expect(page.locator(".presence .presence__off")).toBeHidden();
  });

  test("the startup checkbox is FUNCTIONAL: unchecked, a FRESH SESSION's '/' reopens where you left off", async ({ page }) => {
    await page.goto("/");
    const box = page.locator("[data-startup-checkbox]");
    await expect(box).toBeChecked();                 // default: welcome shows
    await box.uncheck();
    await page.goto("/grain");                       // leave the desk on a page…
    // WITHIN the session "/" opens normally (the pinned Welcome tab must not bounce)…
    await page.goto("/");
    await expect(page.locator(".welcome__title")).toBeVisible();
    // …the redirect is a STARTUP behavior: clear the session boot mark to simulate a fresh visit
    await page.evaluate(() => sessionStorage.removeItem("tj.booted"));
    await page.goto("/");
    await expect(page).toHaveURL(/\/grain$/);        // …and startup-"/" reopens where you left off
    // re-enable → even a fresh session lands on the welcome page again
    await page.evaluate(() => { localStorage.setItem("tj.welcome-startup", "on"); sessionStorage.removeItem("tj.booted"); });
    await page.goto("/");
    await expect(page.locator(".welcome__title")).toBeVisible();
  });

  test("title-bar view controls: aside hides (persisted); the terminal button expands/collapses the feed", async ({ page }) => {
    await page.goto("/grain");
    const shell = page.locator(".app-shell");
    // aside toggle → hides (animated to width 0), and the choice persists across a reload
    await expect(page.locator(".app-shell__aside")).toBeVisible();
    await page.locator('.window-bar__ctl [data-shell="aside-toggle"]').click();
    await expect(shell).toHaveAttribute("data-aside-hidden", "true");
    await expect(page.locator(".app-shell__aside")).toBeHidden();
    await page.reload();
    await expect(page.locator(".app-shell__aside")).toBeHidden();
    await page.locator('.window-bar__ctl [data-shell="aside-toggle"]').click();   // restore
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
    await expect(page.locator("[data-theme-name]").first()).toHaveText("sourdough");
    await page.locator("[data-cycle-theme]").first().click();
    await expect(page.locator("[data-theme-name]").first()).toHaveText("baguette");
    await page.evaluate(() => localStorage.removeItem("grain-theme"));
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
    await page.goto("/loop");
    await page.getByRole("button", { name: "Watch the desk work" }).click();
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
