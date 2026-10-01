# Performance & SEO/AEO audit — baseline

_Current build, measured headless. Regenerate with `bun run audit`. `batch/export` freezes the same bytes, so these are a fair proxy for the static site._

## What the numbers mean

- **JavaScript shipped: 30kb–266kb per page** — the headline, and the "native-first" proof: heavy — investigate.
- **Bytes, JS and request counts are network-independent** — the robust, honest numbers to publish.
- **TTFB / Load are LOCAL best-case** (no network hop; max load here 239ms) — use them for catching regressions, not as absolute proof. Real-world latency adds to every stack equally.
- **The persuasive frame is comparative** — the same metrics vs Astro / Next / htmx tell the story (memory `framework-comparison-methodology`).

## Pages

| Page | TTFB | Load | Wire | JS | Req | Blocking | Title | Desc | Canon | OG | 1×H1 | JSON-LD | Surfaces | Kinds | Accepts |
|------|------|------|------|----|-----|----------|:-----:|:----:|:-----:|:--:|:----:|:-------:|:--:|:--:|:--:|
| `/` | 26ms | 239ms | 885kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 29 | 0 | 0 |
| `/grain` | 17ms | 83ms | 775kb | **266kb** | 40 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 34 | 0 | 0 |
| `/catalog` | 11ms | 139ms | 1388kb | **30kb** | 21 | 4css/1js | ✓ | ✗ | ✓ | ✓ | ✗ | ✓ | 131 | 4 | 2 |
| `/about` | 25ms | 70ms | 819kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 33 | 0 | 0 |

## Endpoints

- `/sitemap.xml` ✓
- `/robots.txt` ✓
- `/llms.txt` ✓

## Notes

- Skipped pages: none
- **Surfaces** = count of `[data-surface]` — machine-operable affordances; doubles as an AEO signal.
- **Desc / Canon / OG / JSON-LD** should now be ✓ on every page: `seo.ts` enriches every full-document
  response with a canonical URL, Open Graph + Twitter Card, and schema.org JSON-LD (Person + WebSite on
  home, BlogPosting on notes, WebPage + BreadcrumbList elsewhere), derived from each page's own
  title/description + path. A ✗ here is a regression. See memory `seo-aeo-first-class`.
