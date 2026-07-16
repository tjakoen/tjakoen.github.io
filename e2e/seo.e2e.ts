// portfolio/e2e/seo.e2e.ts — the machine-readable head is wired into the LIVE server (seo.ts +
// server.ts withSeo). The unit test (seo.test.ts) covers enrichHead's logic; this proves it actually
// reaches every kind of served page — a static page, a MILL content entry, and a special route —
// and that the og-card image is served as a real binary.
import { test, expect } from "@playwright/test";

// Read the parsed JSON-LD @types present on the current page.
async function jsonLdTypes(page: import("@playwright/test").Page): Promise<string[]> {
  return page.$$eval('script[type="application/ld+json"]', (nodes) =>
    nodes.flatMap((n) => {
      const j = JSON.parse(n.textContent || "{}");
      const list = j["@graph"] ?? [j];
      return list.map((x: any) => x["@type"]).filter(Boolean);
    }),
  );
}

const canonical = (page: import("@playwright/test").Page) =>
  page.locator('link[rel="canonical"]').getAttribute("href");

test.describe("SEO/AEO head — served live", () => {
  test("home (static page) carries canonical + OG + Person/WebSite JSON-LD", async ({ page, baseURL }) => {
    await page.goto("/");
    expect(await canonical(page)).toBe(`${baseURL}/`);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "website");
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", `${baseURL}/media/og-card.png`);
    expect(await jsonLdTypes(page)).toEqual(["Person", "WebSite"]);
  });

  test("a MILL note entry is an article (BlogPosting, og:type=article), canonical trailing-slashed", async ({ page, baseURL }) => {
    await page.goto("/notes/ten-times-zero");
    expect(await canonical(page)).toBe(`${baseURL}/notes/ten-times-zero/`);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
    expect(await jsonLdTypes(page)).toContain("BlogPosting");
  });

  test("an interior page gets WebPage + BreadcrumbList", async ({ page }) => {
    await page.goto("/grain");
    const types = await jsonLdTypes(page);
    expect(types).toContain("WebPage");
    expect(types).toContain("BreadcrumbList");
  });

  test("the og-card image serves as a real PNG (not corrupted by the text static server)", async ({ request, baseURL }) => {
    const res = await request.get(`${baseURL}/media/og-card.png`);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
    const body = await res.body();
    expect(body.length).toBeGreaterThan(1000);
    expect(body.subarray(0, 8).toString("latin1")).toBe("\x89PNG\r\n\x1a\n");   // PNG magic bytes
  });
});
