# Performance & SEO/AEO audit — baseline

_Current build, measured headless. Regenerate with `bun run audit`. `batch/export` freezes the same bytes, so these are a fair proxy for the static site._

## What the numbers mean

- **JavaScript shipped: 27kb–176kb per page** — the headline, and the "native-first" proof: heavy — investigate.
- **Bytes, JS and request counts are network-independent** — the robust, honest numbers to publish.
- **TTFB / Load are LOCAL best-case** (no network hop; max load here 125ms) — use them for catching regressions, not as absolute proof. Real-world latency adds to every stack equally.
- **The persuasive frame is comparative** — the same metrics vs Astro / Next / htmx tell the story (memory `framework-comparison-methodology`).

## Pages

| Page | TTFB | Load | Wire | JS | Req | Blocking | Title | Desc | Canon | OG | 1×H1 | JSON-LD | Surfaces | Kinds | Accepts |
|------|------|------|------|----|-----|----------|:-----:|:----:|:-----:|:--:|:----:|:-------:|:--:|:--:|:--:|
| `/` | 10ms | 125ms | 502kb | **126kb** | 26 | 4css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 19 | 0 | 0 |
| `/grain` | 7ms | 42ms | 393kb | **130kb** | 28 | 4css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 24 | 0 | 0 |
| `/loop` | 9ms | 37ms | 428kb | **176kb** | 28 | 4css/2js | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | 27 | 2 | 2 |
| `/catalog` | 8ms | 61ms | 576kb | **27kb** | 18 | 4css/1js | ✓ | ✗ | ✓ | ✓ | ✗ | ✓ | 19 | 2 | 0 |
| `/about` | 6ms | 31ms | 377kb | **126kb** | 26 | 4css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 17 | 0 | 0 |

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
