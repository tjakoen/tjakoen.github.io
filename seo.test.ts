// portfolio/seo.test.ts — the machine-readable head (canonical + Open Graph + Twitter + JSON-LD).
import { test, expect, describe } from "bun:test";
import { enrichHead, canonicalPath, SITE } from "./seo.ts";

const ORIGIN = "https://example.test";
const doc = (head: string, body = "<p>hi</p>") =>
  `<!DOCTYPE html><html lang="en"><head>${head}</head><body>${body}</body></html>`;

// Pull the (single) parsed JSON-LD object out of an enriched document.
function jsonLd(html: string): any {
  const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!m) throw new Error("no json-ld");
  return JSON.parse(m[1].replace(/\\u003c/g, "<"));
}

describe("canonicalPath", () => {
  test("root stays root; others get one trailing slash (matches the sitemap)", () => {
    expect(canonicalPath("/")).toBe("/");
    expect(canonicalPath("")).toBe("/");
    expect(canonicalPath("/grain")).toBe("/grain/");
    expect(canonicalPath("/grain/")).toBe("/grain/");
    expect(canonicalPath("/notes/ten-times-zero")).toBe("/notes/ten-times-zero/");
    expect(canonicalPath("/notes/ten-times-zero//")).toBe("/notes/ten-times-zero/");
  });
});

describe("enrichHead — emitted tags", () => {
  const html = enrichHead(doc(`<title>Welcome · TJ's Desk</title><meta name="description" content="Hello world.">`), "/", ORIGIN);

  test("canonical uses the origin + canonical path", () => {
    expect(html).toContain(`<link rel="canonical" href="${ORIGIN}/">`);
  });
  test("Open Graph + Twitter derive from the page's own title/description", () => {
    expect(html).toContain(`<meta property="og:title" content="Welcome · TJ's Desk">`);
    expect(html).toContain(`<meta property="og:description" content="Hello world.">`);
    expect(html).toContain(`<meta property="og:url" content="${ORIGIN}/">`);
    expect(html).toContain(`<meta property="og:image" content="${ORIGIN}${SITE.ogImage}">`);
    expect(html).toContain(`<meta name="twitter:card" content="summary_large_image">`);
    expect(html).toContain(`<meta name="twitter:image" content="${ORIGIN}${SITE.ogImage}">`);
  });
});

describe("enrichHead — JSON-LD per page type", () => {
  test("home → a graph with Person + WebSite", () => {
    const j = jsonLd(enrichHead(doc(`<title>Home</title>`), "/", ORIGIN));
    const types = j["@graph"].map((n: any) => n["@type"]);
    expect(types).toEqual(["Person", "WebSite"]);
    expect(j["@graph"][0].name).toBe(SITE.author.name);
    expect(j["@graph"][0].sameAs).toContain("https://github.com/tjakoen");
  });

  test("note entry → BlogPosting + og:type article", () => {
    const html = enrichHead(doc(`<title>Ten times zero</title><meta name="description" content="A note.">`), "/notes/ten-times-zero", ORIGIN);
    expect(html).toContain(`<meta property="og:type" content="article">`);
    const j = jsonLd(html);
    expect(j["@type"]).toBe("BlogPosting");
    expect(j.headline).toBe("Ten times zero");
    expect(j.url).toBe(`${ORIGIN}/notes/ten-times-zero/`);
  });

  test("the /notes feed itself is NOT an article", () => {
    const html = enrichHead(doc(`<title>Notes</title>`), "/notes", ORIGIN);
    expect(html).toContain(`<meta property="og:type" content="website">`);
    expect(jsonLd(html)["@graph"][0]["@type"]).toBe("WebPage");
  });

  test("interior page → WebPage + a breadcrumb trail ending at the page title", () => {
    const j = jsonLd(enrichHead(doc(`<title>Tutorial</title>`), "/grain/docs/tutorial", ORIGIN));
    const [page, crumbs] = j["@graph"];
    expect(page["@type"]).toBe("WebPage");
    expect(crumbs["@type"]).toBe("BreadcrumbList");
    const trail = crumbs.itemListElement.map((it: any) => [it.name, it.item]);
    expect(trail).toEqual([
      ["Home", `${ORIGIN}/`],
      ["Grain", `${ORIGIN}/grain/`],
      ["Docs", `${ORIGIN}/grain/docs/`],
      ["Tutorial", `${ORIGIN}/grain/docs/tutorial/`],   // leaf carries the real title
    ]);
  });
});

describe("enrichHead — safety + idempotency", () => {
  test("no-op on a fragment (no </head>)", () => {
    const frag = `<div class="console__feed">acting…</div>`;
    expect(enrichHead(frag, "/ui/loop", ORIGIN)).toBe(frag);
  });

  test("idempotent — a document that already has a canonical is left untouched", () => {
    const once = enrichHead(doc(`<title>Home</title>`), "/", ORIGIN);
    expect(enrichHead(once, "/", ORIGIN)).toBe(once);
    expect((once.match(/rel="canonical"/g) ?? []).length).toBe(1);
  });

  test("JSON-LD escapes < so a value can't break out of </script>", () => {
    const html = enrichHead(doc(`<title>a &lt;script&gt; tag</title>`), "/x", ORIGIN);
    expect(html).not.toContain("</script> tag");          // the raw < never reaches the DOM as markup
    expect(jsonLd(html)["@graph"][0].name).toBe("a <script> tag");  // decoded back to plain text
  });

  test("escaped entities in the title round-trip into plain-text JSON-LD", () => {
    const j = jsonLd(enrichHead(doc(`<title>Batch &amp; Grain</title>`), "/x", ORIGIN));
    expect(j["@graph"][0].name).toBe("Batch & Grain");
  });
});
