# Portfolio-wide performance & SEO/AEO audit

_Measured headless against the current build. Regenerate with `bun run audit`. This report covers every canonical URL in the sitemap and checks document metadata and delivery. It complements the visual and editorial review of each page._

## Coverage

- Canonical pages: 145
- Pages that returned successfully: 145
- HTTP failures: 0
- Pages with one or more document findings: 1

## Document checks

- **Exactly one page heading:** 1 page(s): `/catalog/`
- **Meta description:** all pages pass
- **Canonical URL:** all pages pass
- **Open Graph metadata:** all pages pass
- **Structured data:** all pages pass

## What the numbers mean

- **JavaScript shipped: 30kb–318kb per page** — the headline, and the "native-first" proof: heavy — investigate.
- **Bytes, JS and request counts are network-independent** — the robust, honest numbers to publish.
- **TTFB / Load are LOCAL best-case** (no network hop; max load here 572ms) — use them for catching regressions, not as absolute proof. Real-world latency adds to every stack equally.
- **The persuasive frame is comparative** — the same metrics vs Astro / Next / htmx tell the story (memory `framework-comparison-methodology`).

## Pages

| Page | TTFB | Load | Wire | JS | Req | Blocking | Title | Desc | Canon | OG | 1×H1 | JSON-LD | Surfaces | Kinds | Accepts |
|------|------|------|------|----|-----|----------|:-----:|:----:|:-----:|:--:|:----:|:-------:|:--:|:--:|:--:|
| `/` | 5ms | 148ms | 904kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 33 | 0 | 0 |
| `/about/` | 13ms | 52ms | 840kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 37 | 0 | 0 |
| `/badges/` | 3ms | 32ms | 773kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/badges/adet-2125-midterm/` | 7ms | 39ms | 776kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/adet-2125-prelim/` | 6ms | 37ms | 776kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/adet-2134-midterm/` | 7ms | 45ms | 776kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/adet-2134-prelim/` | 8ms | 44ms | 776kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2203-midterm/` | 6ms | 43ms | 776kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2203-prelim/` | 10ms | 47ms | 776kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2209-midterm/` | 6ms | 40ms | 776kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2209-prelim/` | 10ms | 43ms | 776kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2215-midterm/` | 10ms | 43ms | 776kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2215-prelim/` | 13ms | 49ms | 776kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2240-midterm/` | 10ms | 46ms | 776kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2240-prelim/` | 7ms | 41ms | 776kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/introweb-2106-midterm/` | 11ms | 47ms | 776kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/introweb-2106-prelim/` | 8ms | 45ms | 775kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/batch/` | 5ms | 44ms | 777kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/batch/docs/` | 25ms | 54ms | 770kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/batch/docs/add-a-route/` | 5ms | 39ms | 772kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 33 | 0 | 0 |
| `/batch/docs/architecture/` | 16ms | 83ms | 946kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 89 | 0 | 0 |
| `/batch/docs/consume-as-git-deps/` | 5ms | 47ms | 773kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 33 | 0 | 0 |
| `/batch/docs/conventions/` | 8ms | 52ms | 804kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 47 | 0 | 0 |
| `/batch/docs/getting-started/` | 4ms | 45ms | 772kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 33 | 0 | 0 |
| `/batch/docs/static-export-and-deploy/` | 4ms | 39ms | 773kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 34 | 0 | 0 |
| `/bread/` | 5ms | 44ms | 780kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/calendar/` | 14ms | 70ms | 7232kb | **261kb** | 60 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/calendar/codegeeks-hau-sleek-and-swift/` | 5ms | 47ms | 1226kb | **261kb** | 44 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 33 | 0 | 0 |
| `/calendar/gdg-hau-ai-hack/` | 4ms | 43ms | 903kb | **261kb** | 43 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/calendar/gdgoc-hau-general-assembly/` | 5ms | 45ms | 779kb | **261kb** | 42 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/calendar/mafia-hau-reality-check/` | 4ms | 38ms | 779kb | **261kb** | 42 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 33 | 0 | 0 |
| `/calendar/yses-uplb-fair-and-talk/` | 5ms | 42ms | 1852kb | **261kb** | 44 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/calendar/yses-uplb-hackfest/` | 5ms | 44ms | 1217kb | **261kb** | 44 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/catalog/` | 10ms | 115ms | 1176kb | **30kb** | 22 | 4css/1js | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | 132 | 4 | 2 |
| `/crumb/` | 4ms | 40ms | 776kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/crumb/docs/` | 6ms | 42ms | 769kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/crumb/docs/getting-started/` | 5ms | 41ms | 779kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 38 | 0 | 0 |
| `/crumb/docs/write-a-tour/` | 7ms | 49ms | 790kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39 | 0 | 0 |
| `/decks/engineering-ai-for-social-impact/` | 4ms | 42ms | 769kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/decks/from-code-to-career/` | 9ms | 48ms | 769kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/decks/gdg-hau-ai-hack-ideation/` | 5ms | 43ms | 769kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/decks/reality-check-ai-ethics/` | 5ms | 41ms | 769kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/docs/` | 6ms | 45ms | 782kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/grain/` | 6ms | 45ms | 794kb | **266kb** | 40 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 38 | 0 | 0 |
| `/grain/builder/` | 10ms | 58ms | 858kb | **318kb** | 48 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39 | 0 | 0 |
| `/grain/builder/preview/` | 6ms | 122ms | 1507kb | **285kb** | 44 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 32 | 0 | 0 |
| `/grain/docs/` | 8ms | 38ms | 770kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/grain/docs/add-a-component/` | 4ms | 41ms | 773kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 34 | 0 | 0 |
| `/grain/docs/add-a-render-op-kind/` | 5ms | 44ms | 772kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/grain/docs/ai-interface/` | 9ms | 59ms | 845kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 54 | 0 | 0 |
| `/grain/docs/design-system/` | 7ms | 54ms | 796kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 50 | 0 | 0 |
| `/grain/docs/getting-started/` | 5ms | 44ms | 773kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 34 | 0 | 0 |
| `/grain/docs/grain/` | 8ms | 52ms | 795kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/grain/docs/make-a-surface-operable/` | 6ms | 48ms | 772kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/grain/docs/re-skin-via-tokens/` | 5ms | 43ms | 772kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 34 | 0 | 0 |
| `/grain/docs/tutorial/` | 8ms | 56ms | 787kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 38 | 0 | 0 |
| `/greenroom/` | 5ms | 48ms | 1599kb | **261kb** | 42 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/mail/` | 10ms | 51ms | 830kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 41 | 10 | 10 |
| `/mill/` | 5ms | 43ms | 776kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/mill/docs/` | 6ms | 41ms | 769kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/mill/docs/add-a-collection/` | 3ms | 36ms | 775kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/mill/docs/architecture/` | 5ms | 38ms | 797kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 41 | 0 | 0 |
| `/mill/docs/getting-started/` | 3ms | 37ms | 773kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 34 | 0 | 0 |
| `/native-github-classroom/` | 4ms | 41ms | 955kb | **261kb** | 39 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/native-github-classroom/docs/` | 5ms | 37ms | 775kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/notes/` | 5ms | 45ms | 797kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 42 | 0 | 0 |
| `/notes/build-the-floor/` | 13ms | 67ms | 838kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 68 | 24 | 0 |
| `/notes/feels-like-an-app/` | 5ms | 49ms | 800kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/notes/how-i-turned-github-into-a-classroom/` | 4ms | 44ms | 784kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/notes/one-loop-every-repo/` | 5ms | 43ms | 792kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 38 | 0 | 0 |
| `/notes/origin-story/` | 7ms | 51ms | 797kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39 | 0 | 0 |
| `/notes/ten-times-zero/` | 7ms | 58ms | 831kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 53 | 0 | 0 |
| `/notes/the-browser-grew-up/` | 8ms | 53ms | 807kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 38 | 0 | 0 |
| `/notes/the-check-that-never-ran/` | 6ms | 45ms | 786kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/notes/the-console-i-built-to-stop-drowning/` | 7ms | 53ms | 910kb | **261kb** | 40 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 38 | 0 | 0 |
| `/notes/watch-its-hands/` | 6ms | 48ms | 782kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 37 | 0 | 0 |
| `/notes/whitepaper-one-vocabulary/` | 8ms | 58ms | 832kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 47 | 0 | 0 |
| `/notes/why-i-teach/` | 6ms | 49ms | 784kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/pantry/` | 6ms | 48ms | 777kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/pantry/docs/` | 5ms | 38ms | 769kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/pantry/docs/getting-started/` | 5ms | 42ms | 779kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 37 | 0 | 0 |
| `/pantry/docs/what-it-composes/` | 5ms | 46ms | 782kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39 | 0 | 0 |
| `/plans/` | 535ms | 572ms | 799kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 31 | 0 | 0 |
| `/plans/plan/agent-autonomy-tiers/` | 497ms | 532ms | 783kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/ai-agency-navigation/` | 490ms | 524ms | 790kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/ai-workflow-loop/` | 496ms | 531ms | 797kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/builder-ai-depth/` | 488ms | 520ms | 782kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/builder-design/` | 497ms | 533ms | 806kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/builder-sandbox/` | 503ms | 537ms | 785kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/codebase-map-seeded/` | 492ms | 526ms | 782kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/course-badges/` | 494ms | 525ms | 777kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/crumb-prefilled-demo/` | 492ms | 523ms | 783kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/crumb-review-loop/` | 491ms | 525ms | 793kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/d2-content-backlog/` | 493ms | 525ms | 776kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/d6-archive-standards-repo/` | 494ms | 526ms | 778kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/form-from-data-demo/` | 499ms | 532ms | 781kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/grain-0-1-18-bump/` | 489ms | 520ms | 780kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/grain-token-debt/` | 492ms | 524ms | 787kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/loop-practice-gaps/` | 490ms | 525ms | 787kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/loop-story-and-talk/` | 501ms | 534ms | 782kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/loop-tutorial/` | 490ms | 525ms | 780kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/mill-list-continuation/` | 489ms | 520ms | 783kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/note-the-loop-nobody-ran/` | 490ms | 523ms | 782kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/pantry-control-center/` | 489ms | 522ms | 793kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/pantry-review-layer/` | 494ms | 534ms | 818kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/portfolio-finish-line/` | 492ms | 528ms | 795kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/reading-list/` | 485ms | 518ms | 779kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/repo-structure-reorg/` | 493ms | 526ms | 788kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/runs-surface-polish/` | 486ms | 519ms | 782kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/site-builder/` | 497ms | 531ms | 799kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/skills-runtime/` | 501ms | 542ms | 841kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/watch-me-work/` | 500ms | 538ms | 795kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/projects/` | 5ms | 50ms | 778kb | **261kb** | 40 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/proof/` | 6ms | 41ms | 776kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/proof/docs/` | 6ms | 41ms | 769kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/proof/docs/getting-started/` | 6ms | 42ms | 774kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/proof/docs/how-it-works/` | 5ms | 47ms | 776kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39 | 0 | 0 |
| `/reference/` | 8ms | 54ms | 783kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/resume/` | 12ms | 48ms | 815kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 31 | 0 | 0 |
| `/standards/` | 21ms | 59ms | 777kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/standards/ai-development/` | 6ms | 44ms | 786kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39 | 0 | 0 |
| `/standards/ai-repo-standard/` | 6ms | 44ms | 791kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 43 | 0 | 0 |
| `/standards/audit-standard/` | 8ms | 44ms | 786kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 41 | 0 | 0 |
| `/standards/claude/` | 6ms | 49ms | 775kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/standards/claude.starter/` | 8ms | 45ms | 776kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/standards/conformance/` | 5ms | 42ms | 784kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/standards/decisions/` | 5ms | 43ms | 780kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 37 | 0 | 0 |
| `/standards/figures/` | 7ms | 46ms | 791kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 40 | 0 | 0 |
| `/standards/graph/` | 5ms | 42ms | 781kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 38 | 0 | 0 |
| `/standards/hooks/` | 8ms | 51ms | 796kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39 | 0 | 0 |
| `/standards/intake/` | 6ms | 51ms | 785kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 40 | 0 | 0 |
| `/standards/kickstart/` | 5ms | 42ms | 778kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 32 | 0 | 0 |
| `/standards/loop/` | 8ms | 49ms | 822kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 43 | 0 | 0 |
| `/standards/note-standard/` | 6ms | 42ms | 787kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39 | 0 | 0 |
| `/standards/readme/` | 5ms | 38ms | 781kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 33 | 0 | 0 |
| `/standards/readme-standard/` | 6ms | 42ms | 777kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 34 | 0 | 0 |
| `/standards/session-loop/` | 6ms | 46ms | 801kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 37 | 0 | 0 |
| `/standards/tour-standard/` | 5ms | 44ms | 780kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 37 | 0 | 0 |
| `/standards/tree/` | 8ms | 45ms | 781kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 37 | 0 | 0 |
| `/standards/voice/` | 8ms | 49ms | 825kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 53 | 0 | 0 |
| `/talks/` | 5ms | 47ms | 772kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/talks/build-the-floor/` | 4ms | 66ms | 785kb | **281kb** | 41 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 9 | 24 | 0 |
| `/talks/every-time-it-was-wrong/` | 4ms | 35ms | 798kb | **277kb** | 40 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 |
| `/talks/ten-times-zero/` | 5ms | 72ms | 833kb | **298kb** | 41 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 |
| `/teaching/` | 4ms | 33ms | 772kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 31 | 0 | 0 |

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
