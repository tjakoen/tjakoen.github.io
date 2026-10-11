# Portfolio-wide performance & SEO/AEO audit

_Measured headless against the current build. Regenerate with `bun run audit`. This report covers every canonical URL in the sitemap and checks document metadata and delivery. It complements the visual and editorial review of each page._

## Coverage

- Canonical pages: 146
- Pages that returned successfully: 146
- HTTP failures: 0
- Pages with one or more document findings: 0

## Document checks

- **Exactly one page heading:** all pages pass
- **Meta description:** all pages pass
- **Canonical URL:** all pages pass
- **Open Graph metadata:** all pages pass
- **Structured data:** all pages pass

## What the numbers mean

- **JavaScript shipped: 30kb–264kb per page** — the headline, and the "native-first" proof: heavy — investigate.
- **Bytes, JS and request counts are network-independent** — the robust, honest numbers to publish.
- **TTFB / Load are LOCAL best-case** (no network hop; max load here 1641ms) — use them for catching regressions, not as absolute proof. Real-world latency adds to every stack equally.
- **The persuasive frame is comparative** — the same metrics vs Astro / Next / htmx tell the story (memory `framework-comparison-methodology`).

## Pages

| Page | TTFB | Load | Wire | JS | Req | Blocking | Title | Desc | Canon | OG | 1×H1 | JSON-LD | Surfaces | Kinds | Accepts |
|------|------|------|------|----|-----|----------|:-----:|:----:|:-----:|:--:|:----:|:-------:|:--:|:--:|:--:|
| `/` | 11ms | 387ms | 839kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 33 | 0 | 0 |
| `/about/` | 16ms | 63ms | 775kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 37 | 0 | 0 |
| `/badges/` | 4ms | 39ms | 708kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/badges/adet-2125-midterm/` | 9ms | 44ms | 711kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/adet-2125-prelim/` | 9ms | 47ms | 711kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/adet-2134-midterm/` | 14ms | 49ms | 711kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/adet-2134-prelim/` | 16ms | 50ms | 711kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2203-midterm/` | 8ms | 44ms | 711kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2203-prelim/` | 8ms | 45ms | 711kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2209-midterm/` | 8ms | 45ms | 711kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2209-prelim/` | 8ms | 46ms | 711kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2215-midterm/` | 8ms | 44ms | 711kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2215-prelim/` | 7ms | 42ms | 711kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2240-midterm/` | 9ms | 47ms | 711kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2240-prelim/` | 7ms | 45ms | 711kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/introweb-2106-midterm/` | 8ms | 47ms | 711kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/introweb-2106-prelim/` | 6ms | 43ms | 711kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/batch/` | 5ms | 47ms | 712kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/batch/docs/` | 11ms | 47ms | 705kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/batch/docs/add-a-route/` | 6ms | 46ms | 707kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 33 | 0 | 0 |
| `/batch/docs/architecture/` | 16ms | 97ms | 879kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 89 | 0 | 0 |
| `/batch/docs/consume-as-git-deps/` | 5ms | 50ms | 707kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 33 | 0 | 0 |
| `/batch/docs/conventions/` | 8ms | 52ms | 737kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 47 | 0 | 0 |
| `/batch/docs/getting-started/` | 5ms | 46ms | 707kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 33 | 0 | 0 |
| `/batch/docs/static-export-and-deploy/` | 4ms | 40ms | 708kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 34 | 0 | 0 |
| `/bread/` | 4ms | 47ms | 715kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/calendar/` | 16ms | 89ms | 7183kb | **202kb** | 57 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/calendar/codegeeks-hau-sleek-and-swift/` | 5ms | 52ms | 1178kb | **202kb** | 41 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 33 | 0 | 0 |
| `/calendar/gdg-hau-ai-hack/` | 5ms | 45ms | 855kb | **202kb** | 40 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/calendar/gdgoc-hau-general-assembly/` | 5ms | 45ms | 731kb | **202kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/calendar/mafia-hau-reality-check/` | 5ms | 45ms | 731kb | **202kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 33 | 0 | 0 |
| `/calendar/yses-uplb-fair-and-talk/` | 6ms | 54ms | 1804kb | **202kb** | 41 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/calendar/yses-uplb-hackfest/` | 6ms | 52ms | 1169kb | **202kb** | 41 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/catalog/` | 15ms | 165ms | 1183kb | **30kb** | 22 | 4css/1js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 132 | 4 | 2 |
| `/crumb/` | 4ms | 44ms | 712kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/crumb/docs/` | 5ms | 38ms | 704kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/crumb/docs/getting-started/` | 6ms | 49ms | 714kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 38 | 0 | 0 |
| `/crumb/docs/write-a-tour/` | 11ms | 59ms | 725kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39 | 0 | 0 |
| `/decks/` | 7ms | 50ms | 704kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/decks/engineering-ai-for-social-impact/` | 5ms | 45ms | 704kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/decks/from-code-to-career/` | 6ms | 44ms | 704kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/decks/gdg-hau-ai-hack-ideation/` | 5ms | 45ms | 704kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/decks/reality-check-ai-ethics/` | 4ms | 42ms | 704kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/docs/` | 4ms | 45ms | 717kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/grain/` | 7ms | 68ms | 729kb | **199kb** | 34 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 38 | 0 | 0 |
| `/grain/builder/` | 8ms | 64ms | 804kb | **264kb** | 42 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 41 | 0 | 0 |
| `/grain/builder/preview/` | 6ms | 180ms | 1446kb | **222kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 32 | 0 | 0 |
| `/grain/docs/` | 7ms | 43ms | 705kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/grain/docs/add-a-component/` | 8ms | 43ms | 708kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 34 | 0 | 0 |
| `/grain/docs/add-a-render-op-kind/` | 4ms | 60ms | 707kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/grain/docs/ai-interface/` | 11ms | 78ms | 782kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 54 | 0 | 0 |
| `/grain/docs/design-system/` | 7ms | 67ms | 732kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 50 | 0 | 0 |
| `/grain/docs/getting-started/` | 5ms | 48ms | 709kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 34 | 0 | 0 |
| `/grain/docs/grain/` | 6ms | 55ms | 729kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/grain/docs/make-a-surface-operable/` | 5ms | 48ms | 707kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/grain/docs/re-skin-via-tokens/` | 6ms | 45ms | 707kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 34 | 0 | 0 |
| `/grain/docs/tutorial/` | 7ms | 57ms | 722kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 38 | 0 | 0 |
| `/greenroom/` | 6ms | 53ms | 1535kb | **194kb** | 36 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/mail/` | 10ms | 48ms | 764kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 41 | 10 | 10 |
| `/mill/` | 6ms | 45ms | 711kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/mill/docs/` | 7ms | 45ms | 704kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/mill/docs/add-a-collection/` | 5ms | 40ms | 710kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/mill/docs/architecture/` | 9ms | 54ms | 732kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 41 | 0 | 0 |
| `/mill/docs/getting-started/` | 4ms | 46ms | 708kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 34 | 0 | 0 |
| `/native-github-classroom/` | 6ms | 49ms | 906kb | **202kb** | 36 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/native-github-classroom/docs/` | 5ms | 39ms | 710kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/notes/` | 6ms | 50ms | 733kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 42 | 0 | 0 |
| `/notes/build-the-floor/` | 11ms | 64ms | 818kb | **239kb** | 35 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 68 | 24 | 0 |
| `/notes/feels-like-an-app/` | 7ms | 56ms | 738kb | **197kb** | 33 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/notes/how-i-turned-github-into-a-classroom/` | 7ms | 59ms | 722kb | **197kb** | 33 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/notes/one-loop-every-repo/` | 7ms | 50ms | 730kb | **197kb** | 33 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 38 | 0 | 0 |
| `/notes/origin-story/` | 8ms | 54ms | 734kb | **197kb** | 33 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39 | 0 | 0 |
| `/notes/ten-times-zero/` | 10ms | 64ms | 788kb | **217kb** | 36 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 53 | 0 | 0 |
| `/notes/the-browser-grew-up/` | 8ms | 60ms | 745kb | **197kb** | 33 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 38 | 0 | 0 |
| `/notes/the-check-that-never-ran/` | 7ms | 55ms | 724kb | **197kb** | 33 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/notes/the-console-i-built-to-stop-drowning/` | 7ms | 52ms | 864kb | **204kb** | 38 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 38 | 0 | 0 |
| `/notes/watch-its-hands/` | 7ms | 54ms | 720kb | **197kb** | 33 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 37 | 0 | 0 |
| `/notes/whitepaper-one-vocabulary/` | 11ms | 67ms | 770kb | **197kb** | 33 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 47 | 0 | 0 |
| `/notes/why-i-teach/` | 6ms | 52ms | 722kb | **197kb** | 33 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/pantry/` | 7ms | 50ms | 712kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/pantry/docs/` | 10ms | 46ms | 704kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/pantry/docs/getting-started/` | 6ms | 44ms | 715kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 37 | 0 | 0 |
| `/pantry/docs/what-it-composes/` | 5ms | 49ms | 717kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39 | 0 | 0 |
| `/plans/` | 829ms | 881ms | 735kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 31 | 0 | 0 |
| `/plans/plan/agent-autonomy-tiers/` | 787ms | 831ms | 718kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/ai-agency-navigation/` | 780ms | 825ms | 725kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/ai-workflow-loop/` | 743ms | 787ms | 732kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/builder-ai-depth/` | 762ms | 806ms | 736kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/builder-design/` | 740ms | 788ms | 741kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/builder-sandbox/` | 790ms | 834ms | 721kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/codebase-map-seeded/` | 753ms | 802ms | 717kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/course-badges/` | 833ms | 877ms | 712kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/crumb-prefilled-demo/` | 936ms | 992ms | 718kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/crumb-review-loop/` | 1575ms | 1641ms | 728kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/d2-content-backlog/` | 1431ms | 1489ms | 711kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/d6-archive-standards-repo/` | 1012ms | 1065ms | 713kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/form-from-data-demo/` | 1077ms | 1157ms | 716kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/grain-0-1-18-bump/` | 869ms | 911ms | 715kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/grain-token-debt/` | 754ms | 801ms | 723kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/loop-practice-gaps/` | 758ms | 808ms | 722kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/loop-story-and-talk/` | 747ms | 786ms | 717kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/loop-tutorial/` | 783ms | 825ms | 716kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/mill-list-continuation/` | 786ms | 827ms | 718kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/note-the-loop-nobody-ran/` | 749ms | 790ms | 717kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/pantry-control-center/` | 754ms | 798ms | 728kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/pantry-review-layer/` | 739ms | 788ms | 754kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/portfolio-finish-line/` | 817ms | 866ms | 749kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/reading-list/` | 806ms | 851ms | 714kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/repo-structure-reorg/` | 747ms | 792ms | 724kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/runs-surface-polish/` | 747ms | 790ms | 717kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/site-builder/` | 748ms | 792ms | 734kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/skills-runtime/` | 766ms | 818ms | 776kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/watch-me-work/` | 802ms | 854ms | 730kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/projects/` | 5ms | 51ms | 713kb | **194kb** | 34 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/proof/` | 5ms | 42ms | 712kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/proof/docs/` | 8ms | 42ms | 704kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/proof/docs/getting-started/` | 6ms | 42ms | 709kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/proof/docs/how-it-works/` | 6ms | 50ms | 711kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39 | 0 | 0 |
| `/reference/` | 9ms | 57ms | 719kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/resume/` | 14ms | 54ms | 750kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 31 | 0 | 0 |
| `/standards/` | 25ms | 67ms | 711kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/standards/ai-development/` | 6ms | 46ms | 721kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39 | 0 | 0 |
| `/standards/ai-repo-standard/` | 7ms | 55ms | 726kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 43 | 0 | 0 |
| `/standards/audit-standard/` | 6ms | 45ms | 721kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 41 | 0 | 0 |
| `/standards/claude/` | 7ms | 67ms | 710kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/standards/claude.starter/` | 6ms | 52ms | 711kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/standards/conformance/` | 6ms | 47ms | 719kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/standards/decisions/` | 5ms | 44ms | 716kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 37 | 0 | 0 |
| `/standards/figures/` | 7ms | 47ms | 726kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 40 | 0 | 0 |
| `/standards/graph/` | 6ms | 44ms | 716kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 38 | 0 | 0 |
| `/standards/hooks/` | 6ms | 51ms | 731kb | **194kb** | 31 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39 | 0 | 0 |
| `/standards/intake/` | 7ms | 46ms | 720kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 40 | 0 | 0 |
| `/standards/kickstart/` | 5ms | 42ms | 713kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 32 | 0 | 0 |
| `/standards/loop/` | 8ms | 55ms | 757kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 43 | 0 | 0 |
| `/standards/note-standard/` | 6ms | 47ms | 722kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39 | 0 | 0 |
| `/standards/readme/` | 6ms | 44ms | 716kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 33 | 0 | 0 |
| `/standards/readme-standard/` | 5ms | 48ms | 712kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 34 | 0 | 0 |
| `/standards/session-loop/` | 8ms | 52ms | 736kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 37 | 0 | 0 |
| `/standards/tour-standard/` | 7ms | 45ms | 715kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 37 | 0 | 0 |
| `/standards/tree/` | 6ms | 55ms | 716kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 37 | 0 | 0 |
| `/standards/voice/` | 8ms | 57ms | 760kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 53 | 0 | 0 |
| `/talks/` | 5ms | 41ms | 707kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/talks/build-the-floor/` | 6ms | 89ms | 761kb | **256kb** | 37 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 9 | 24 | 0 |
| `/talks/every-time-it-was-wrong/` | 4ms | 46ms | 733kb | **210kb** | 34 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 |
| `/talks/ten-times-zero/` | 7ms | 107ms | 771kb | **235kb** | 36 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 |
| `/teaching/` | 4ms | 41ms | 708kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 31 | 0 | 0 |

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
