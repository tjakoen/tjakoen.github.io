// portfolio/seo.ts — per-page SEO/AEO head enrichment: canonical + Open Graph + Twitter Card +
// schema.org JSON-LD, derived (never hand-maintained) from each page's OWN <title> + meta description.
//
// ONE idempotent transform — enrichHead(html, pathname, origin) — injected before </head> on every
// full-document HTML response (server.ts). It reads the title/description the page already carries and
// DERIVES the machine-readable head from them + the request path, so a new page/note/doc is enriched
// automatically with nothing extra to author. Fragments (htmx partials, no </head>) pass through
// untouched, and a page that already carries a canonical is left alone (idempotent).
//
// Absolute URLs use the request origin; the static export rewrites the crawl origin to PUBLIC_ORIGIN
// (the deploy URL) via tools/export.ts transformPage — the same swap sitemap.xml/robots.txt/llms.txt
// take. The canonical form matches the sitemap EXACTLY (trailing slash on every non-root route) so a
// crawler and the audit see one canonical URL per page with no redirect hop.
import { escapeHtml } from "@tjakoen/mill/core/engine.ts";

// The site's stable public identity — the single place the owner's entity is described (schema.org
// Person) and the social card is named. `sameAs` are PUBLIC profile links: an entity-linking signal
// AI answer engines use to resolve "who is this". Add the LinkedIn URL alongside GitHub when known.
export const SITE = {
  name: "TJ's Desk",
  tagline: "AI-first interfaces on a no-build hypermedia stack.",
  origin: "https://tjakoen.github.io",
  author: {
    name: "Tjakoen Stolk",
    jobTitle: "Software engineering manager, tech lead, and part-time software-engineering teacher",
    sameAs: [
      "https://github.com/tjakoen",
      "https://www.linkedin.com/in/tjakoen-stolk-53b449126/",
    ],
  },
  ogImage: "/media/og-card.png",
  ogImageAlt: "TJ's Desk — AI-first interfaces on a no-build hypermedia stack: BATCH, GRAIN, MILL.",
  ogImageW: 1200,
  ogImageH: 630,
};

// Canonical path: root stays "/", every other route gets a single trailing slash — identical to the
// sitemap (server.ts /sitemap.xml) so there is exactly one canonical URL per page.
export function canonicalPath(pathname: string): string {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") + "/";
}

// A note ENTRY (/notes/<slug>/) is an article; the /notes/ feed and everything else is not.
const isArticle = (path: string) => /^\/notes\/[^/]+\/$/.test(path);

// Reverse escapeHtml (& < > ") back to plain text for JSON string values. &amp; decoded LAST.
const decode = (s: string) =>
  s.replace(/&quot;/g, '"').replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&");

// The page's own (already HTML-escaped, attribute-safe) title / description, or null.
function firstTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].trim() : null;
}
function metaDescription(html: string): string | null {
  const m = html.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']\s*\/?>/i);
  return m ? m[1].trim() : null;
}

// Serialize a JSON-LD object into a script tag, neutralizing `<` so no value can break out of </script>.
const ld = (obj: unknown) =>
  `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`;

// A Person node describing the site's author (reused by every graph; @id lets others reference it).
function personNode(origin: string) {
  return {
    "@type": "Person",
    "@id": `${origin}/#person`,
    name: SITE.author.name,
    jobTitle: SITE.author.jobTitle,
    url: `${origin}/`,
    sameAs: SITE.author.sameAs,
  };
}

// Breadcrumb trail from the canonical path: Home > seg > seg > (leaf = the page title).
function breadcrumb(origin: string, path: string, title: string) {
  const segs = path.split("/").filter(Boolean);
  const items = [{ name: "Home", url: `${origin}/` }];
  let acc = "";
  segs.forEach((seg, i) => {
    acc += `/${seg}`;
    const leaf = i === segs.length - 1;
    const name = leaf ? title : seg.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    items.push({ name, url: `${origin}${acc}/` });
  });
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem", position: i + 1, name: it.name, item: it.url,
    })),
  };
}

// The JSON-LD graph for a page: WebSite+Person on home, BlogPosting on a note, else WebPage+breadcrumb.
function jsonLd(origin: string, path: string, url: string, title: string, desc: string | null): string {
  const person = personNode(origin);
  const website = {
    "@type": "WebSite",
    "@id": `${origin}/#website`,
    name: SITE.name,
    url: `${origin}/`,
    description: SITE.tagline,
    inLanguage: "en",
    publisher: { "@id": person["@id"] },
  };

  if (path === "/") {
    return ld({ "@context": "https://schema.org", "@graph": [person, website] });
  }
  if (isArticle(path)) {
    return ld({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: title,
      ...(desc ? { description: desc } : {}),
      url,
      mainEntityOfPage: url,
      inLanguage: "en",
      image: `${origin}${SITE.ogImage}`,
      author: { "@type": "Person", name: SITE.author.name, url: `${origin}/`, sameAs: SITE.author.sameAs },
      publisher: { "@type": "Person", name: SITE.author.name, url: `${origin}/` },
    });
  }
  return ld({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        url,
        name: title,
        ...(desc ? { description: desc } : {}),
        inLanguage: "en",
        isPartOf: { "@id": website["@id"], "@type": "WebSite", name: SITE.name, url: `${origin}/` },
      },
      breadcrumb(origin, path, title),
    ],
  });
}

// Inject canonical + Open Graph + Twitter Card + JSON-LD before </head>. Idempotent; no-op on
// fragments (no </head>) and on any document that already carries a canonical link.
export function enrichHead(html: string, pathname: string, origin: string): string {
  const at = html.indexOf("</head>");
  if (at === -1) return html;
  if (/<link[^>]+rel=["']canonical["']/i.test(html)) return html;

  const path = canonicalPath(pathname);
  const url = origin + path;
  const image = origin + SITE.ogImage;
  const titleEsc = firstTitle(html);                       // already attribute-safe
  const descEsc = metaDescription(html);
  const titleAttr = titleEsc ?? escapeHtml(SITE.name);
  const titleText = titleEsc ? decode(titleEsc) : SITE.name;
  const descText = descEsc ? decode(descEsc) : null;
  const ogType = isArticle(path) ? "article" : "website";

  const tags = [
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:type" content="${ogType}">`,
    `<meta property="og:site_name" content="${escapeHtml(SITE.name)}">`,
    `<meta property="og:title" content="${titleAttr}">`,
    descEsc ? `<meta property="og:description" content="${descEsc}">` : "",
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${image}">`,
    `<meta property="og:image:width" content="${SITE.ogImageW}">`,
    `<meta property="og:image:height" content="${SITE.ogImageH}">`,
    `<meta property="og:image:alt" content="${escapeHtml(SITE.ogImageAlt)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${titleAttr}">`,
    descEsc ? `<meta name="twitter:description" content="${descEsc}">` : "",
    `<meta name="twitter:image" content="${image}">`,
    jsonLd(origin, path, url, titleText, descText),
  ].filter(Boolean);

  return `${html.slice(0, at)}${tags.join("\n  ")}\n${html.slice(at)}`;
}
