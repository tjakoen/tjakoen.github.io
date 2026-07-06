// portfolio/e2e/grain-page.e2e.ts — the portfolio umbrella (/) + the GRAIN showcase (/grain,
// formerly /demo), built WITH grain. Covers what only a browser shows: the page composes from
// grain's components, grade-as-signal is visible, and the Catalog-peek island
// (grain/scripts/catalog-peek.js) opens and bridges a hovered component to its catalog entry.
// Lives here because the e2e runner drives the running app from the repo root; on extraction
// the portfolio + this spec travel with the portfolio's own repo.
import { test, expect } from "@playwright/test";

test.describe("portfolio umbrella", () => {
  test("/ — the editor's Welcome page: start list, LIVE recent notes, walkthroughs", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".welcome__title")).toContainText("TJ's Desk");
    await expect(page.locator(".start .start__item").first()).toBeVisible();
    // Recent is fed LIVE from MILL frontmatter — real note links, not hand-typed rows
    await expect(page.locator('.recent .recent__item[href^="/notes/"]').first()).toBeVisible();
    await expect(page.locator(".recent .recent__path").first()).toContainText(".md");
    await expect(page.locator(".walks .walk").first()).toBeVisible();
    // the whole site sits in ONE editor window: title bar (nav + ⌘K search) + status bar
    await expect(page.locator(".window-bar__nav button")).toHaveCount(3);   // back / refresh / forward
    await expect(page.locator(".window-bar__search")).toBeVisible();
    await expect(page.locator(".status-bar .presence")).toBeVisible();
    // a walkthrough is a real link into the showcase — the visit opens as a tab (THE EDITOR v2)
    await page.locator('.walk[href="/grain"]').click();
    await expect(page).toHaveURL(/\/grain$/);
    await expect(page.locator('[data-open-tabs] .tab[href="/grain"]')).toHaveAttribute("aria-current", "page");
  });

  test("the lean /batch and /mill landing pages render", async ({ page }) => {
    await page.goto("/batch");
    await expect(page.locator(".masthead")).toContainText("No build");
    await page.goto("/mill");
    await expect(page.locator(".masthead")).toContainText("Markdown");
  });
});

test.describe("/grain — the GRAIN showcase", () => {
  test("renders in the BREAD shell, hero and the component composition", async ({ page }) => {
    await page.goto("/grain");
    await expect(page.locator(".side-rail__brand")).toContainText("TJ's Desk");   // the unified shell, not its own bar
    await expect(page.locator('[data-open-tabs] .tab[data-pinned]')).toContainText("Welcome");  // the open-pages strip
    await expect(page.locator(".hero__head")).toContainText("same controls");
    await expect(page.locator("#how .flow__node--door")).toContainText("/intent");
    // no components showcase by design (the sidebar catalog is the reference) — but the page is
    // still built FROM grain atoms, whose expanded custom elements leave their classes behind:
    // the hero CTA is a real b-button, and How-it-works uses a real b-list.
    await expect(page.locator(".hero__cta .btn").first()).toBeVisible();
    await expect(page.locator("#how .list").first()).toBeVisible();
  });

  test("the RAIL is the explorer; the TABS are the open pages (THE EDITOR v2)", async ({ page }) => {
    await page.goto("/grain");
    // the explorer marks /grain's real source file, ancestors unfolded
    await expect(page.locator('.file-tree a[href="/grain"]')).toHaveAttribute("aria-current", "page");
    await expect(page.locator('[data-open-tabs] .tab[href="/grain"]')).toHaveAttribute("aria-current", "page");
    // a tree file is a REAL nav link — following a sibling opens ITS tab, current moves. /batch sits
    // under the bread/ group's batch/ folder (a sibling of grain/, collapsed on /grain); open it.
    await page.locator('.file-tree summary:text-is("batch/")').click();
    await page.locator('.file-tree a[href="/batch"]').click();
    await expect(page).toHaveURL(/\/batch$/);
    await expect(page.locator('[data-open-tabs] .tab[href="/batch"]')).toHaveAttribute("aria-current", "page");
    await expect(page.locator('[data-open-tabs] .tab[href="/grain"]')).not.toHaveAttribute("aria-current", "page");
    // a note page: its .md fills into the tree (from the corpus) and gets the current mark
    await page.goto("/notes/ten-times-zero");
    await expect(page.locator('.file-tree a[href="/notes/ten-times-zero"]')).toContainText("ten-times-zero.md");
    await expect(page.locator('.file-tree a[href="/notes/ten-times-zero"]')).toHaveAttribute("aria-current", "page");
  });

  test("grade-as-signal is visible — grain beside clean, and AI text STAYS grain", async ({ page }) => {
    await page.goto("/grain");
    await expect(page.locator('[data-grade="grain"]').first()).toBeVisible();   // the AI's line, in grain
    await expect(page.locator(".grade__legend")).toContainText("committed");
    // doctrine (AI-INTERFACE §5): AI-authored text stays grain — the hero line and the AI reply
    // are grain and never resolve to clean (provenance persists). Replaying keeps it grain.
    await expect(page.locator("#sig-line")).toHaveAttribute("data-grade", "grain");
    await expect(page.locator('.chat-message[data-role="ai"]').first()).toHaveAttribute("data-grade", "grain");
    await page.getByRole("button", { name: "replay" }).click();
    await expect(page.locator("#sig-line")).toHaveAttribute("data-grade", "grain");
  });

  test("the Catalog panel mode switches the sidebar to its Catalog pane and a hovered component bridges to its entry", async ({ page }) => {
    await page.goto("/grain");
    const assistant = page.locator(".assistant");
    const pane = page.locator('.assistant__pane[data-pane="catalog"]');
    await expect(assistant).toHaveAttribute("data-mode", "chat");   // SSR default: Chat
    await expect(pane).toBeHidden();

    // the sidebar-panel's Catalog mode (sitewide) — the aside GRID COLUMN widens, so the
    // content SHIFTS aside (never an overlay)
    const asideWidth = async () => (await page.locator(".app-shell__aside").boundingBox())?.width ?? 0;
    const chatWidth = await asideWidth();
    await page.locator('.assistant__modes [data-shell-mode="catalog"]').click();
    await expect(assistant).toHaveAttribute("data-mode", "catalog");
    await expect(pane).toBeVisible();
    await expect(pane.locator(".catalog-pane__frame")).toHaveAttribute("src", /\/catalog$/);
    await expect.poll(asideWidth).toBeGreaterThan(chatWidth);

    // the embedded catalog is in "single" mode: exactly ONE entry shows (reveal-one, no scrolling)
    const cat = page.frameLocator(".catalog-pane__frame");
    await expect(cat.locator(".cat")).toHaveAttribute("data-peek-single", "");

    // hover a button → the island records which catalog entry it points at (observable state)…
    // Dispatch the bubbling mouseover the island listens for (robust regardless of layout).
    await page.locator(".hero__cta .btn").first().dispatchEvent("mouseover");
    await expect(pane).toHaveAttribute("data-peek-slug", "button");
    // …and the pane reveals exactly that one entry (no far-scroll across the list)
    await expect(cat.locator(".cat-doc.is-peek-active")).toHaveAttribute("id", "button");
    await expect(cat.locator(".cat-doc:visible")).toHaveCount(1);

    // hover the How-it-works list → a different entry; proves the class → slug bridge, not a stuck value
    await page.locator("#how .list").first().dispatchEvent("mouseover");
    await expect(pane).toHaveAttribute("data-peek-slug", "list");
    await expect(cat.locator(".cat-doc.is-peek-active")).toHaveAttribute("id", "list");
    expect(await page.evaluate(() => window.scrollY)).toBe(0);   // the page itself never scrolled

    // the Chat mode tab is the way back — the panel returns to the assistant
    await page.locator('.assistant__modes [data-shell-mode="chat"]').click();
    await expect(assistant).toHaveAttribute("data-mode", "chat");
    await expect(pane).toBeHidden();
  });

  test("the hero CTA opens the Catalog pane and offers a full-page catalog", async ({ page }) => {
    await page.goto("/grain");
    const pane = page.locator('.assistant__pane[data-pane="catalog"]');

    // "Browse the components" is a data-peek hook, not a link — it OPENS the pane
    await page.getByRole("button", { name: "Browse the components" }).click();
    await expect(pane).toBeVisible();

    // from the pane's footer, one click expands into the full-page catalog
    await expect(pane.locator(".catalog-pane__expand")).toHaveAttribute("href", "/catalog");
  });

  test("the full-page catalog has a Back control that returns to the prior page", async ({ page }) => {
    // Arrive from the showcase via real navigations (not a chained in-page link click: the site's
    // global `scroll-behavior: smooth` makes Playwright's click auto-scroll never settle mid-nav).
    await page.goto("/grain");
    await page.goto("/catalog");
    const back = page.locator(".cat-back");
    await expect(back).toBeVisible();   // shown on the full page (hidden when embedded in the peek)
    await back.click();
    await expect(page).toHaveURL(/\/grain$/);   // history-back returns to the showcase
  });
});

test.describe("/grain — the surface is operable by both a person and the AI, through ONE DOOR", () => {
  // The showcase surface is driven by the REAL dispatcher (ai-dispatch.js) against the real
  // POST /intent + SSE — the same path /loop uses. No showcase-only AI→DOM back channel remains.
  test("human: Ask/Send posts through /intent and the AI replies over SSE", async ({ page }) => {
    await page.goto("/grain");
    const s = page.locator("[data-surface-demo]");
    const before = await s.locator("[data-chat-log] .chat-message").count();
    await s.locator(".surface__compose .field__input").fill("Book focus time");
    await s.locator(".surface__compose .btn").click();
    // chat.send: your message settles clean; the AI's reply streams into a grain bubble — both via the door
    await expect(s.locator("[data-chat-log] .chat-message")).toHaveCount(before + 2);
    await expect(s.locator('[data-chat-log] .chat-message[data-role="you"]').last()).toContainText("Book focus time");
    await expect(s.locator('[data-chat-log] .chat-message[data-role="ai"]').last()).toHaveAttribute("data-grade", "grain");
  });

  test("AI: 'Watch the AI act' drives the surface through the door (grain reply, completes + drafts a task)", async ({ page }) => {
    await page.goto("/grain");
    const s = page.locator("[data-surface-demo]");
    const before = await s.locator("[data-chat-log] .chat-message").count();
    await page.locator("[data-ai-run]").click();
    // the server's reasoner pushes the RenderOps back over SSE:
    await expect(s.locator("[data-chat-log] .chat-message")).toHaveCount(before + 1);              // an AI reply bubble…
    await expect(s.locator('[data-chat-log] .chat-message[data-role="ai"]').last()).toHaveAttribute("data-grade", "grain"); // …that STAYS grain
    await expect(s.locator('[data-tasks] [data-surface="grain-task-badge"]')).toHaveText("done");  // completed a task
    await expect(s.locator('[data-tasks] .list__item[data-grade="grain"]')).toHaveCount(1);        // …and drafted one (stays grain)
  });

  // Symmetry is now real, not simulated: BOTH tests above exercise the SAME POST /intent door and
  // apply the server's RenderOps — a human Ask and the AI's run travel the identical path.
});

test.describe("/grain — the AI spotlight (with motion)", () => {
  // Regression guard for the SSE op-drop bug: if the reply channel isn't live before the intent
  // fires, the first ops (incl. spotlight-on) are dropped → the demo reads as stuck AND can't be
  // interrupted. The `ready` handshake fixes it: the backdrop must appear promptly, the terminal
  // must narrate, and the run must RELEASE on its own (the natural-completion path nothing asserted).
  test("the run appears promptly, takes over the shell console, and RELEASES on natural completion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/grain");
    await page.locator("[data-ai-run]").click();
    await expect(page.locator(".ai-backdrop.is-on")).toBeVisible({ timeout: 3000 });     // ops NOT dropped
    await expect(page.locator(".app-shell")).toHaveAttribute("data-acting", "true");     // the shell takes over
    await expect(page.locator(".app-shell__console .console__line").first())
      .toBeAttached({ timeout: 8000 });                                                  // …narrating to the console
    await expect(page.locator(".ai-backdrop.is-on")).toHaveCount(0, { timeout: 15000 }); // hands back by itself
    await expect(page.locator(".app-shell")).not.toHaveAttribute("data-acting", "true");
    await expect(page.locator("[data-ai-run]")).not.toHaveAttribute("data-commit", "pending");
  });

  // Design-system conformance: the traveling lamp carries the spotlight visual — the surface under
  // it is only MARKED (.ai-spotlit), never restyled, so a spotlit form control can't double its
  // native focus ring with a lit outline. (Regression for the "just the input lit up" report; the
  // lamp's own glide/dim behavior is covered by lamp-travel.e2e.ts.)
  test("a spotlit form field is marked, not restyled — the lamp frame carries the visual", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/grain");
    await page.locator("[data-ai-run]").click();
    const input = page.locator('[data-surface="grain-ask"]');
    await expect(input).toHaveClass(/ai-spotlit/, { timeout: 8000 });     // the AI takes the input
    const field = page.locator('.field:has([data-surface="grain-ask"])');
    await expect(field).toHaveCSS("outline-style", "none");               // no lit box painted on the field…
    await expect(input).toHaveCSS("outline-style", "none");               // …or on the input (no double box)
    await expect(page.locator(".ai-lamp")).toBeVisible();                 // the lamp frame is the visual
  });

  test("shows the 'AI is acting' spotlight while it drives the surface, and stopping is mediated", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });   // the spotlight only runs with motion
    await page.goto("/grain");
    const btn = page.locator("[data-ai-run]");
    await expect(btn).toHaveText(/Watch the AI act/);
    await btn.click();
    await expect(page.locator(".ai-backdrop.is-on")).toBeVisible();
    await expect(page.locator(".ai-acting-label")).toContainText("acting");
    await expect(page.locator("[data-surface-demo] .ai-spotlit")).toHaveCount(1);   // one surface lit at a time
    // the trigger itself enters GRAIN's standard AI-mode state and HOLDS it for the whole run
    // (data-commit="pending" → dashed edge + blinking caret; not a bespoke indicator)
    await expect(btn).toHaveAttribute("data-commit", "pending");
    // clicking the working page does NOT force-kill — it ASKS (mediated interrupt, AI-INTERFACE §5c)
    await page.locator(".ai-backdrop").click();
    await expect(page.locator(".ai-confirm")).toBeVisible();
    await page.getByRole("button", { name: "Ask it to stop" }).click();
    // the single writer hands back cleanly → the veil drops and the trigger returns to human state
    await expect(page.locator(".ai-backdrop.is-on")).toHaveCount(0);
    await expect(btn).not.toHaveAttribute("data-commit", "pending");
  });
});

test.describe("GRAIN theming — token-only re-skin (color-scheme axis; flavor axis supported)", () => {
  // Proves the re-skin mechanism: flipping data-color-scheme re-colours the whole page through
  // tokens alone, and grade-as-signal (the load-bearing AI grain face) survives the flip.
  test("forcing dark re-skins via tokens and grade-as-signal survives", async ({ page }) => {
    await page.goto("/grain");
    const paper = () => page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--paper").trim());
    const light = await paper();
    await page.evaluate(() => document.documentElement.setAttribute("data-color-scheme", "dark"));
    const dark = await paper();
    expect(dark).not.toBe(light);                                 // whole page re-skinned, zero component edits
    const grainFont = await page.locator('[data-grade="grain"]').first()
      .evaluate((el) => getComputedStyle(el).fontFamily);
    expect(grainFont).toContain("Redaction 50");                  // the AI grain face persists in dark
  });

  // Accent doctrine: "full reach, one hue" — the default stays hueless (accent = ink), and an
  // accented flavor's one hue reaches the links (proof of full reach via a token override alone).
  test("accent: Sourdough is hueless (accent = ink); a flavor's hue reaches links + primary", async ({ page }) => {
    await page.goto("/grain");
    const cssVar = (v: string) => page.evaluate((n) =>
      getComputedStyle(document.documentElement).getPropertyValue(n).trim(), v);
    // a fresh <a> with no page-specific override, so it reflects the global `a { color: accent }`
    const linkColor = () => page.evaluate(() => {
      const a = document.createElement("a"); a.href = "#"; document.body.appendChild(a);
      const c = getComputedStyle(a).color; a.remove(); return c;
    });
    // hueless default: accent resolves to ink, and primary chains to accent
    expect(await cssVar("--color-accent")).toBe(await cssVar("--ink"));
    expect(await cssVar("--color-primary")).toBe(await cssVar("--color-accent"));
    const sourdoughLink = await linkColor();
    // switch to Baguette → a real hue that reaches links (full reach via a token override alone)
    await page.evaluate(() => document.documentElement.setAttribute("data-theme", "baguette"));
    expect(await cssVar("--color-accent")).not.toBe(await cssVar("--ink"));
    expect(await linkColor()).not.toBe(sourdoughLink);
  });
});

test.describe("/grain on a touch device — the reveal mechanic is pointer-only", () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 800 } });

  test("the pane shows the full, scrollable catalog (no single-mode reveal) on touch", async ({ page }) => {
    await page.goto("/grain");
    await page.getByRole("button", { name: "Browse the components" }).click();
    // on mobile the sidebar-panel is a bottom sheet — opening the catalog also raises it
    await expect(page.locator(".assistant")).toHaveAttribute("data-mode", "catalog");
    await expect(page.locator(".app-shell")).toHaveAttribute("data-aside-open", "");
    const cat = page.frameLocator(".catalog-pane__frame");
    await expect(cat.locator(".cat")).toBeVisible();                       // wait for the embedded catalog to load
    await expect(cat.locator(".cat[data-peek-single]")).toHaveCount(0);    // single mode off — hover makes no sense on touch
    await expect(cat.locator(".cat-doc").nth(1)).toBeAttached();           // >1 entry present (the full list to scroll)
  });
});
