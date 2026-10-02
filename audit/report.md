# Portfolio-wide performance & SEO/AEO audit

_Measured headless against the current build. Regenerate with `bun run audit`. This report covers every canonical URL in the sitemap and checks document metadata and delivery. It complements the visual and editorial review of each page._

## Coverage

- Canonical pages: 145
- Pages that returned successfully: 145
- HTTP failures: 0
- Pages with one or more document findings: 0

## Document checks

- **Exactly one page heading:** all pages pass
- **Meta description:** all pages pass
- **Canonical URL:** all pages pass
- **Open Graph metadata:** all pages pass
- **Structured data:** all pages pass

## What the numbers mean

- **JavaScript shipped: 30kb–318kb per page** — the headline, and the "native-first" proof: heavy — investigate.
- **Bytes, JS and request counts are network-independent** — the robust, honest numbers to publish.
- **TTFB / Load are LOCAL best-case** (no network hop; max load here 800ms) — use them for catching regressions, not as absolute proof. Real-world latency adds to every stack equally.
- **The persuasive frame is comparative** — the same metrics vs Astro / Next / htmx tell the story (memory `framework-comparison-methodology`).

## Pages

| Page | TTFB | Load | Wire | JS | Req | Blocking | Title | Desc | Canon | OG | 1×H1 | JSON-LD | Surfaces | Kinds | Accepts |
|------|------|------|------|----|-----|----------|:-----:|:----:|:-----:|:--:|:----:|:-------:|:--:|:--:|:--:|
| `/` | 5ms | 146ms | 907kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 33 | 0 | 0 |
| `/about/` | 14ms | 48ms | 842kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 37 | 0 | 0 |
| `/badges/` | 3ms | 34ms | 776kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/badges/adet-2125-midterm/` | 9ms | 43ms | 778kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/adet-2125-prelim/` | 8ms | 41ms | 778kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/adet-2134-midterm/` | 6ms | 41ms | 778kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/adet-2134-prelim/` | 7ms | 41ms | 778kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2203-midterm/` | 6ms | 42ms | 778kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2203-prelim/` | 12ms | 45ms | 778kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2209-midterm/` | 8ms | 44ms | 778kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2209-prelim/` | 7ms | 40ms | 778kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2215-midterm/` | 6ms | 42ms | 778kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2215-prelim/` | 6ms | 39ms | 778kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2240-midterm/` | 7ms | 43ms | 778kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2240-prelim/` | 7ms | 43ms | 778kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/introweb-2106-midterm/` | 8ms | 45ms | 778kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/introweb-2106-prelim/` | 6ms | 37ms | 778kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/batch/` | 7ms | 44ms | 780kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/batch/docs/` | 8ms | 40ms | 773kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/batch/docs/add-a-route/` | 5ms | 39ms | 775kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 33 | 0 | 0 |
| `/batch/docs/architecture/` | 16ms | 81ms | 949kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 89 | 0 | 0 |
| `/batch/docs/consume-as-git-deps/` | 4ms | 48ms | 776kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 33 | 0 | 0 |
| `/batch/docs/conventions/` | 7ms | 49ms | 807kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 47 | 0 | 0 |
| `/batch/docs/getting-started/` | 4ms | 44ms | 775kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 33 | 0 | 0 |
| `/batch/docs/static-export-and-deploy/` | 5ms | 40ms | 775kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 34 | 0 | 0 |
| `/bread/` | 6ms | 46ms | 783kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/calendar/` | 14ms | 65ms | 7234kb | **261kb** | 60 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/calendar/codegeeks-hau-sleek-and-swift/` | 5ms | 45ms | 1229kb | **261kb** | 44 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 33 | 0 | 0 |
| `/calendar/gdg-hau-ai-hack/` | 5ms | 42ms | 906kb | **261kb** | 43 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/calendar/gdgoc-hau-general-assembly/` | 4ms | 40ms | 781kb | **261kb** | 42 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/calendar/mafia-hau-reality-check/` | 4ms | 35ms | 782kb | **261kb** | 42 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 33 | 0 | 0 |
| `/calendar/yses-uplb-fair-and-talk/` | 4ms | 45ms | 1855kb | **261kb** | 44 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/calendar/yses-uplb-hackfest/` | 4ms | 40ms | 1219kb | **261kb** | 44 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/catalog/` | 15ms | 111ms | 1179kb | **30kb** | 22 | 4css/1js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 132 | 4 | 2 |
| `/crumb/` | 5ms | 43ms | 779kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/crumb/docs/` | 6ms | 36ms | 772kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/crumb/docs/getting-started/` | 6ms | 42ms | 782kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 38 | 0 | 0 |
| `/crumb/docs/write-a-tour/` | 7ms | 45ms | 792kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39 | 0 | 0 |
| `/decks/engineering-ai-for-social-impact/` | 4ms | 41ms | 772kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/decks/from-code-to-career/` | 5ms | 41ms | 772kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/decks/gdg-hau-ai-hack-ideation/` | 5ms | 40ms | 772kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/decks/reality-check-ai-ethics/` | 4ms | 42ms | 772kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/docs/` | 5ms | 45ms | 785kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/grain/` | 6ms | 46ms | 796kb | **266kb** | 40 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 38 | 0 | 0 |
| `/grain/builder/` | 8ms | 50ms | 861kb | **318kb** | 48 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39 | 0 | 0 |
| `/grain/builder/preview/` | 4ms | 135ms | 1510kb | **285kb** | 44 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 32 | 0 | 0 |
| `/grain/docs/` | 7ms | 36ms | 773kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/grain/docs/add-a-component/` | 5ms | 38ms | 776kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 34 | 0 | 0 |
| `/grain/docs/add-a-render-op-kind/` | 4ms | 43ms | 775kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/grain/docs/ai-interface/` | 9ms | 60ms | 848kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 54 | 0 | 0 |
| `/grain/docs/design-system/` | 6ms | 55ms | 799kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 50 | 0 | 0 |
| `/grain/docs/getting-started/` | 5ms | 43ms | 776kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 34 | 0 | 0 |
| `/grain/docs/grain/` | 6ms | 52ms | 798kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/grain/docs/make-a-surface-operable/` | 4ms | 44ms | 775kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/grain/docs/re-skin-via-tokens/` | 7ms | 46ms | 775kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 34 | 0 | 0 |
| `/grain/docs/tutorial/` | 6ms | 52ms | 790kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 38 | 0 | 0 |
| `/greenroom/` | 6ms | 47ms | 1603kb | **261kb** | 42 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/mail/` | 10ms | 48ms | 832kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 41 | 10 | 10 |
| `/mill/` | 6ms | 42ms | 778kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/mill/docs/` | 6ms | 39ms | 772kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/mill/docs/add-a-collection/` | 5ms | 44ms | 778kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/mill/docs/architecture/` | 8ms | 45ms | 799kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 41 | 0 | 0 |
| `/mill/docs/getting-started/` | 5ms | 45ms | 776kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 34 | 0 | 0 |
| `/native-github-classroom/` | 5ms | 46ms | 958kb | **261kb** | 39 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/native-github-classroom/docs/` | 5ms | 39ms | 778kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/notes/` | 6ms | 46ms | 801kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 42 | 0 | 0 |
| `/notes/build-the-floor/` | 9ms | 61ms | 841kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 68 | 24 | 0 |
| `/notes/feels-like-an-app/` | 8ms | 53ms | 803kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/notes/how-i-turned-github-into-a-classroom/` | 6ms | 45ms | 787kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/notes/one-loop-every-repo/` | 7ms | 48ms | 794kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 38 | 0 | 0 |
| `/notes/origin-story/` | 6ms | 48ms | 799kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39 | 0 | 0 |
| `/notes/ten-times-zero/` | 10ms | 61ms | 833kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 53 | 0 | 0 |
| `/notes/the-browser-grew-up/` | 7ms | 52ms | 810kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 38 | 0 | 0 |
| `/notes/the-check-that-never-ran/` | 6ms | 47ms | 789kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/notes/the-console-i-built-to-stop-drowning/` | 6ms | 48ms | 913kb | **261kb** | 40 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 38 | 0 | 0 |
| `/notes/watch-its-hands/` | 6ms | 48ms | 785kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 37 | 0 | 0 |
| `/notes/whitepaper-one-vocabulary/` | 10ms | 59ms | 835kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 47 | 0 | 0 |
| `/notes/why-i-teach/` | 5ms | 49ms | 787kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/pantry/` | 6ms | 47ms | 780kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/pantry/docs/` | 5ms | 39ms | 772kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/pantry/docs/getting-started/` | 5ms | 40ms | 782kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 37 | 0 | 0 |
| `/pantry/docs/what-it-composes/` | 5ms | 47ms | 784kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39 | 0 | 0 |
| `/plans/` | 528ms | 564ms | 802kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 31 | 0 | 0 |
| `/plans/plan/agent-autonomy-tiers/` | 494ms | 529ms | 786kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/ai-agency-navigation/` | 500ms | 533ms | 793kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/ai-workflow-loop/` | 496ms | 532ms | 800kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/builder-ai-depth/` | 504ms | 537ms | 786kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/builder-design/` | 493ms | 528ms | 809kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/builder-sandbox/` | 490ms | 524ms | 789kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/codebase-map-seeded/` | 487ms | 519ms | 785kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/course-badges/` | 525ms | 558ms | 780kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/crumb-prefilled-demo/` | 504ms | 534ms | 786kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/crumb-review-loop/` | 491ms | 524ms | 796kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/d2-content-backlog/` | 489ms | 520ms | 779kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/d6-archive-standards-repo/` | 512ms | 543ms | 780kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/form-from-data-demo/` | 492ms | 524ms | 784kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/grain-0-1-18-bump/` | 550ms | 589ms | 783kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/grain-token-debt/` | 549ms | 584ms | 790kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/loop-practice-gaps/` | 537ms | 576ms | 790kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/loop-story-and-talk/` | 490ms | 521ms | 785kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/loop-tutorial/` | 489ms | 521ms | 783kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/mill-list-continuation/` | 483ms | 516ms | 786kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/note-the-loop-nobody-ran/` | 563ms | 599ms | 785kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/pantry-control-center/` | 491ms | 525ms | 796kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/pantry-review-layer/` | 509ms | 546ms | 822kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/portfolio-finish-line/` | 534ms | 575ms | 806kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/reading-list/` | 502ms | 536ms | 782kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/repo-structure-reorg/` | 561ms | 600ms | 791kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/runs-surface-polish/` | 662ms | 699ms | 785kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/site-builder/` | 758ms | 800ms | 802kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/skills-runtime/` | 559ms | 601ms | 844kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/watch-me-work/` | 530ms | 569ms | 798kb | **261kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/projects/` | 3ms | 38ms | 781kb | **261kb** | 40 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/proof/` | 4ms | 33ms | 779kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/proof/docs/` | 5ms | 34ms | 772kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/proof/docs/getting-started/` | 4ms | 32ms | 777kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/proof/docs/how-it-works/` | 4ms | 39ms | 779kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39 | 0 | 0 |
| `/reference/` | 5ms | 43ms | 787kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/resume/` | 8ms | 48ms | 818kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 31 | 0 | 0 |
| `/standards/` | 24ms | 63ms | 779kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/standards/ai-development/` | 6ms | 48ms | 788kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39 | 0 | 0 |
| `/standards/ai-repo-standard/` | 7ms | 54ms | 794kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 43 | 0 | 0 |
| `/standards/audit-standard/` | 6ms | 50ms | 789kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 41 | 0 | 0 |
| `/standards/claude/` | 5ms | 42ms | 777kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/standards/claude.starter/` | 5ms | 44ms | 778kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/standards/conformance/` | 5ms | 42ms | 787kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/standards/decisions/` | 5ms | 39ms | 783kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 37 | 0 | 0 |
| `/standards/figures/` | 6ms | 40ms | 793kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 40 | 0 | 0 |
| `/standards/graph/` | 6ms | 41ms | 784kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 38 | 0 | 0 |
| `/standards/hooks/` | 6ms | 48ms | 799kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39 | 0 | 0 |
| `/standards/intake/` | 5ms | 42ms | 788kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 40 | 0 | 0 |
| `/standards/kickstart/` | 5ms | 40ms | 781kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 32 | 0 | 0 |
| `/standards/loop/` | 6ms | 44ms | 825kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 43 | 0 | 0 |
| `/standards/note-standard/` | 5ms | 43ms | 789kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39 | 0 | 0 |
| `/standards/readme/` | 5ms | 38ms | 784kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 33 | 0 | 0 |
| `/standards/readme-standard/` | 8ms | 41ms | 780kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 34 | 0 | 0 |
| `/standards/session-loop/` | 6ms | 44ms | 804kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 37 | 0 | 0 |
| `/standards/tour-standard/` | 8ms | 47ms | 783kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 37 | 0 | 0 |
| `/standards/tree/` | 6ms | 42ms | 784kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 37 | 0 | 0 |
| `/standards/voice/` | 9ms | 53ms | 827kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 53 | 0 | 0 |
| `/talks/` | 4ms | 40ms | 775kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/talks/build-the-floor/` | 4ms | 69ms | 787kb | **281kb** | 41 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 9 | 24 | 0 |
| `/talks/every-time-it-was-wrong/` | 4ms | 38ms | 801kb | **277kb** | 40 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 |
| `/talks/ten-times-zero/` | 7ms | 79ms | 836kb | **298kb** | 41 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 |
| `/teaching/` | 3ms | 35ms | 776kb | **261kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 31 | 0 | 0 |

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
