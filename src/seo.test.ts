// portfolio/seo.test.ts — the machine-readable head (canonical + Open Graph + Twitter + JSON-LD).
import { test, expect, describe } from "bun:test";
import { enrichHead, canonicalPath, analyticsBeacon, CF_BEACON_TOKEN, SITE } from "./seo.ts";

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

describe("analyticsBeacon", () => {
  // pull the token back out of data-cf-beacon the way a browser would: read the attribute value,
  // decode the entities, parse the JSON.
  const readToken = (tag: string) => {
    const m = tag.match(/data-cf-beacon="([^"]*)"/);
    if (!m) throw new Error("no beacon attribute");
    const json = m[1].replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
    return JSON.parse(json).token;
  };

  test("outside production nothing ships — a dev run never inflates the numbers", () => {
    expect(analyticsBeacon(CF_BEACON_TOKEN, false)).toBe("");
  });

  // CF_BEACON_TOKEN="" in the env is the off switch: ?? keeps the empty string (it is not nullish),
  // so it reaches the trim check and nothing ships. Passing undefined does NOT disable it — that is
  // the default parameter, which falls back to the shipped token.
  test("an empty token → nothing ships even in production", () => {
    expect(analyticsBeacon("", true)).toBe("");
    expect(analyticsBeacon("   ", true)).toBe("");
  });

  test("an empty CF_BEACON_TOKEN in the env turns the beacon off", () => {
    const beforeTok = Bun.env.CF_BEACON_TOKEN, beforeEnv = Bun.env.NODE_ENV;
    Bun.env.CF_BEACON_TOKEN = "";
    Bun.env.NODE_ENV = "production";
    try {
      expect(enrichHead(doc(`<title>Home</title>`), "/", ORIGIN)).not.toContain("cloudflareinsights");
    } finally {
      if (beforeTok === undefined) delete Bun.env.CF_BEACON_TOKEN; else Bun.env.CF_BEACON_TOKEN = beforeTok;
      if (beforeEnv === undefined) delete Bun.env.NODE_ENV; else Bun.env.NODE_ENV = beforeEnv;
    }
  });

  test("production + token → the cookieless Cloudflare beacon, token carried as JSON", () => {
    const tag = analyticsBeacon(CF_BEACON_TOKEN, true);
    expect(tag).toContain(`src="https://static.cloudflareinsights.com/beacon.min.js"`);
    expect(tag).toContain(`type="module"`);
    expect(readToken(tag)).toBe(CF_BEACON_TOKEN);
  });

  test("the shipped token is the real site token Cloudflare issued", () => {
    expect(CF_BEACON_TOKEN).toBe("7bdae9b661934ea3a86792c0206d89f6");
  });

  test("an overridden token stays inert data — it can't end the attribute or open a tag", () => {
    const hostile = `" onload="alert(1)" x="<script>`;
    const tag = analyticsBeacon(hostile, true);
    // every quote left in the tag is an attribute delimiter (src=, data-cf-beacon=); the token's
    // own quotes all came through as &quot;, so none of them can close an attribute and start a new one
    expect(tag.match(/"/g)!.length).toBe(6);   // type=, src=, data-cf-beacon=
    expect(tag.indexOf("<script")).toBe(tag.lastIndexOf("<script"));  // no second tag opened
    expect(readToken(tag)).toBe(hostile);                             // survives only as a value
  });

  test("enrichHead ships no beacon outside production", () => {
    const before = Bun.env.NODE_ENV;
    Bun.env.NODE_ENV = "development";
    try {
      expect(enrichHead(doc(`<title>Home</title>`), "/", ORIGIN)).not.toContain("cloudflareinsights");
    } finally {
      if (before === undefined) delete Bun.env.NODE_ENV;
      else Bun.env.NODE_ENV = before;
    }
  });

  test("enrichHead ships the beacon in production, inside the head", () => {
    const before = Bun.env.NODE_ENV;
    Bun.env.NODE_ENV = "production";
    try {
      const html = enrichHead(doc(`<title>Home</title>`), "/", ORIGIN);
      expect(html).toContain("static.cloudflareinsights.com/beacon.min.js");
      expect(html.indexOf("cloudflareinsights")).toBeLessThan(html.indexOf("</head>"));
    } finally {
      if (before === undefined) delete Bun.env.NODE_ENV;
      else Bun.env.NODE_ENV = before;
    }
  });
});

describe("enrichHead — safety + idempotency", () => {
  test("no-op on a fragment (no </head>)", () => {
    const frag = `<div class="console__feed">acting…</div>`;
    expect(enrichHead(frag, "/ui/stream", ORIGIN)).toBe(frag);
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
