# Portfolio-wide performance & SEO/AEO audit

_Measured headless against the current build. Regenerate with `bun run audit`. This report covers every canonical URL in the sitemap and checks document metadata and delivery. It complements the visual and editorial review of each page._

## Coverage

- Canonical pages: 148
- Pages that returned successfully: 148
- HTTP failures: 0
- Pages with one or more document findings: 0

## Document checks

- **Exactly one page heading:** all pages pass
- **Meta description:** all pages pass
- **Canonical URL:** all pages pass
- **Open Graph metadata:** all pages pass
- **Structured data:** all pages pass

## What the numbers mean

- **JavaScript response bytes: 30kb–276kb per page** — measured against the local Bun server, which serves these files without compression. Treat them as uncompressed build-size checks, not as the bytes a visitor downloads from GitHub Pages.
- **Wire bytes and request counts describe this local audit run.** They are useful for finding regressions under the same setup, but they are not network-independent or a substitute for measuring the deployed site.
- **TTFB / Load are LOCAL best-case** (no network hop; max load here 804ms) — use them for catching regressions, not as absolute proof. Real-world latency adds to every stack equally.
- **Compare delivery only under the same conditions.** Production compression and caching change the bytes visitors receive; do not compare this local report with another framework's compressed production assets.

## Pages

| Page | TTFB | Load | Wire | JS | Req | Blocking | Title | Desc | Canon | OG | 1×H1 | JSON-LD | Surfaces | Kinds | Accepts |
|------|------|------|------|----|-----|----------|:-----:|:----:|:-----:|:--:|:----:|:-------:|:--:|:--:|:--:|
| `/` | 5ms | 110ms | 842kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 33 | 0 | 0 |
| `/about/` | 11ms | 39ms | 777kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 37 | 0 | 0 |
| `/badges/` | 3ms | 35ms | 710kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/badges/adet-2125-midterm/` | 8ms | 33ms | 713kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/adet-2125-prelim/` | 4ms | 32ms | 713kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/adet-2134-midterm/` | 4ms | 32ms | 713kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/adet-2134-prelim/` | 4ms | 30ms | 713kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2203-midterm/` | 4ms | 32ms | 713kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2203-prelim/` | 4ms | 30ms | 713kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2209-midterm/` | 4ms | 32ms | 713kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2209-prelim/` | 4ms | 30ms | 713kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2215-midterm/` | 4ms | 32ms | 713kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2215-prelim/` | 6ms | 32ms | 713kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2240-midterm/` | 4ms | 30ms | 713kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2240-prelim/` | 4ms | 30ms | 713kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/introweb-2106-midterm/` | 6ms | 34ms | 713kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/introweb-2106-prelim/` | 4ms | 30ms | 713kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/batch/` | 5ms | 44ms | 714kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/batch/docs/` | 5ms | 32ms | 707kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/batch/docs/add-a-route/` | 4ms | 34ms | 710kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 33 | 0 | 0 |
| `/batch/docs/architecture/` | 11ms | 71ms | 882kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 89 | 0 | 0 |
| `/batch/docs/consume-as-git-deps/` | 5ms | 67ms | 710kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 33 | 0 | 0 |
| `/batch/docs/conventions/` | 4ms | 38ms | 740kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 47 | 0 | 0 |
| `/batch/docs/getting-started/` | 6ms | 40ms | 710kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 33 | 0 | 0 |
| `/batch/docs/static-export-and-deploy/` | 3ms | 30ms | 710kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 34 | 0 | 0 |
| `/bread/` | 6ms | 37ms | 717kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/calendar/` | 9ms | 68ms | 6456kb | **202kb** | 53 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/calendar/codegeeks-hau-sleek-and-swift/` | 4ms | 40ms | 1564kb | **202kb** | 41 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 33 | 0 | 0 |
| `/calendar/gdg-hau-ai-hack/` | 3ms | 36ms | 1409kb | **202kb** | 40 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/calendar/gdgoc-hau-general-assembly/` | 3ms | 33ms | 733kb | **202kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/calendar/loop-hau-version-one/` | 5ms | 45ms | 1288kb | **202kb** | 38 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 34 | 0 | 0 |
| `/calendar/mafia-hau-reality-check/` | 3ms | 33ms | 734kb | **202kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 33 | 0 | 0 |
| `/calendar/yses-uplb-fair-and-talk/` | 3ms | 34ms | 1806kb | **202kb** | 41 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/calendar/yses-uplb-hackfest/` | 3ms | 38ms | 1171kb | **202kb** | 41 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/catalog/` | 9ms | 88ms | 1186kb | **30kb** | 22 | 4css/1js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 132 | 4 | 2 |
| `/crumb/` | 2ms | 30ms | 714kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/crumb/docs/` | 3ms | 28ms | 706kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/crumb/docs/getting-started/` | 3ms | 33ms | 717kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 38 | 0 | 0 |
| `/crumb/docs/write-a-tour/` | 3ms | 36ms | 727kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39 | 0 | 0 |
| `/decks/` | 3ms | 32ms | 706kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/decks/engineering-ai-for-social-impact/` | 2ms | 28ms | 706kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/decks/from-code-to-career/` | 2ms | 29ms | 706kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/decks/gdg-hau-ai-hack-ideation/` | 2ms | 32ms | 706kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/decks/reality-check-ai-ethics/` | 3ms | 39ms | 706kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/decks/version-one/` | 3ms | 31ms | 706kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/docs/` | 3ms | 31ms | 719kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/grain/` | 4ms | 35ms | 731kb | **199kb** | 34 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 38 | 0 | 0 |
| `/grain/builder/` | 5ms | 45ms | 820kb | **276kb** | 42 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 41 | 0 | 0 |
| `/grain/builder/preview/` | 3ms | 139ms | 1449kb | **222kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 32 | 0 | 0 |
| `/grain/docs/` | 4ms | 30ms | 708kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/grain/docs/add-a-component/` | 3ms | 27ms | 710kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 34 | 0 | 0 |
| `/grain/docs/add-a-render-op-kind/` | 3ms | 31ms | 710kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/grain/docs/ai-interface/` | 6ms | 46ms | 785kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 54 | 0 | 0 |
| `/grain/docs/design-system/` | 4ms | 47ms | 735kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 50 | 0 | 0 |
| `/grain/docs/getting-started/` | 3ms | 35ms | 711kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 34 | 0 | 0 |
| `/grain/docs/grain/` | 5ms | 39ms | 732kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/grain/docs/make-a-surface-operable/` | 3ms | 38ms | 711kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/grain/docs/re-skin-via-tokens/` | 3ms | 31ms | 709kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 34 | 0 | 0 |
| `/grain/docs/tutorial/` | 4ms | 38ms | 726kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 38 | 0 | 0 |
| `/greenroom/` | 4ms | 46ms | 1537kb | **194kb** | 36 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/mail/` | 6ms | 39ms | 767kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 41 | 10 | 10 |
| `/mill/` | 3ms | 33ms | 713kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/mill/docs/` | 9ms | 50ms | 706kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/mill/docs/add-a-collection/` | 3ms | 31ms | 713kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/mill/docs/architecture/` | 5ms | 37ms | 735kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 41 | 0 | 0 |
| `/mill/docs/getting-started/` | 3ms | 34ms | 711kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 34 | 0 | 0 |
| `/native-github-classroom/` | 3ms | 35ms | 909kb | **202kb** | 36 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/native-github-classroom/docs/` | 3ms | 31ms | 712kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/notes/` | 4ms | 36ms | 735kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 42 | 0 | 0 |
| `/notes/build-the-floor/` | 6ms | 43ms | 820kb | **239kb** | 35 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 68 | 24 | 0 |
| `/notes/feels-like-an-app/` | 4ms | 40ms | 741kb | **197kb** | 33 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/notes/how-i-turned-github-into-a-classroom/` | 5ms | 35ms | 724kb | **197kb** | 33 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/notes/one-loop-every-repo/` | 4ms | 36ms | 732kb | **197kb** | 33 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 38 | 0 | 0 |
| `/notes/origin-story/` | 4ms | 36ms | 737kb | **197kb** | 33 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39 | 0 | 0 |
| `/notes/ten-times-zero/` | 6ms | 42ms | 791kb | **217kb** | 36 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 53 | 0 | 0 |
| `/notes/the-browser-grew-up/` | 4ms | 40ms | 747kb | **197kb** | 33 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 38 | 0 | 0 |
| `/notes/the-check-that-never-ran/` | 4ms | 39ms | 727kb | **197kb** | 33 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/notes/the-console-i-built-to-stop-drowning/` | 4ms | 38ms | 866kb | **204kb** | 38 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 38 | 0 | 0 |
| `/notes/watch-its-hands/` | 4ms | 37ms | 723kb | **197kb** | 33 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 37 | 0 | 0 |
| `/notes/whitepaper-one-vocabulary/` | 6ms | 45ms | 773kb | **197kb** | 33 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 47 | 0 | 0 |
| `/notes/why-i-teach/` | 5ms | 39ms | 724kb | **197kb** | 33 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/pantry/` | 4ms | 36ms | 715kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/pantry/docs/` | 5ms | 31ms | 706kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/pantry/docs/getting-started/` | 4ms | 31ms | 717kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 37 | 0 | 0 |
| `/pantry/docs/what-it-composes/` | 5ms | 39ms | 719kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39 | 0 | 0 |
| `/plans/` | 630ms | 663ms | 737kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 31 | 0 | 0 |
| `/plans/plan/agent-autonomy-tiers/` | 625ms | 655ms | 721kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/ai-agency-navigation/` | 611ms | 643ms | 728kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/ai-workflow-loop/` | 643ms | 676ms | 734kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/builder-ai-depth/` | 760ms | 800ms | 749kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/builder-design/` | 765ms | 801ms | 743kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/builder-sandbox/` | 609ms | 640ms | 723kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/codebase-map-seeded/` | 633ms | 662ms | 719kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/course-badges/` | 609ms | 640ms | 715kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/crumb-prefilled-demo/` | 643ms | 676ms | 721kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/crumb-review-loop/` | 610ms | 641ms | 730kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/d2-content-backlog/` | 611ms | 641ms | 714kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/d6-archive-standards-repo/` | 635ms | 665ms | 715kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/form-from-data-demo/` | 629ms | 658ms | 719kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/grain-0-1-18-bump/` | 621ms | 649ms | 717kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/grain-token-debt/` | 606ms | 636ms | 725kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/loop-practice-gaps/` | 628ms | 658ms | 724kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/loop-story-and-talk/` | 609ms | 638ms | 719kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/loop-tutorial/` | 607ms | 637ms | 718kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/mill-list-continuation/` | 609ms | 642ms | 721kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/note-the-loop-nobody-ran/` | 624ms | 655ms | 720kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/pantry-control-center/` | 591ms | 622ms | 730kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/pantry-review-layer/` | 617ms | 651ms | 756kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/portfolio-finish-line/` | 609ms | 644ms | 765kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/reading-list/` | 600ms | 630ms | 717kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/repo-structure-reorg/` | 600ms | 633ms | 726kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/runs-surface-polish/` | 604ms | 635ms | 719kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/site-builder/` | 773ms | 804ms | 737kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/skills-runtime/` | 617ms | 657ms | 779kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/watch-me-work/` | 624ms | 659ms | 732kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/projects/` | 5ms | 45ms | 715kb | **194kb** | 34 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/proof/` | 6ms | 41ms | 714kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/proof/docs/` | 8ms | 40ms | 706kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/proof/docs/getting-started/` | 5ms | 37ms | 711kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/proof/docs/how-it-works/` | 4ms | 35ms | 714kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39 | 0 | 0 |
| `/reference/` | 7ms | 47ms | 722kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/resume/` | 13ms | 48ms | 752kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 31 | 0 | 0 |
| `/standards/` | 19ms | 54ms | 714kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/standards/ai-development/` | 9ms | 44ms | 723kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39 | 0 | 0 |
| `/standards/ai-repo-standard/` | 7ms | 49ms | 728kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 43 | 0 | 0 |
| `/standards/audit-standard/` | 6ms | 42ms | 723kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 41 | 0 | 0 |
| `/standards/claude/` | 6ms | 42ms | 712kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/standards/claude.starter/` | 4ms | 31ms | 713kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/standards/conformance/` | 6ms | 39ms | 721kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/standards/decisions/` | 7ms | 42ms | 718kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 37 | 0 | 0 |
| `/standards/figures/` | 6ms | 47ms | 728kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 40 | 0 | 0 |
| `/standards/graph/` | 6ms | 39ms | 719kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 38 | 0 | 0 |
| `/standards/hooks/` | 7ms | 42ms | 734kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39 | 0 | 0 |
| `/standards/intake/` | 7ms | 44ms | 722kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 40 | 0 | 0 |
| `/standards/kickstart/` | 5ms | 36ms | 715kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 32 | 0 | 0 |
| `/standards/loop/` | 8ms | 48ms | 759kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 43 | 0 | 0 |
| `/standards/note-standard/` | 7ms | 45ms | 724kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39 | 0 | 0 |
| `/standards/readme/` | 7ms | 42ms | 719kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 33 | 0 | 0 |
| `/standards/readme-standard/` | 6ms | 37ms | 714kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 34 | 0 | 0 |
| `/standards/session-loop/` | 8ms | 43ms | 739kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 37 | 0 | 0 |
| `/standards/tour-standard/` | 5ms | 39ms | 718kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 37 | 0 | 0 |
| `/standards/tree/` | 6ms | 40ms | 719kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 37 | 0 | 0 |
| `/standards/voice/` | 9ms | 50ms | 762kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 53 | 0 | 0 |
| `/talks/` | 5ms | 36ms | 709kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/talks/build-the-floor/` | 5ms | 71ms | 763kb | **256kb** | 37 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 9 | 24 | 0 |
| `/talks/every-time-it-was-wrong/` | 5ms | 33ms | 736kb | **210kb** | 34 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 |
| `/talks/ten-times-zero/` | 4ms | 84ms | 773kb | **235kb** | 36 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 |
| `/teaching/` | 6ms | 33ms | 711kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 31 | 0 | 0 |

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
