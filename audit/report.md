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

- **JavaScript response bytes: 30kb–273kb per page** — measured against the local Bun server, which serves these files without compression. Treat them as uncompressed build-size checks, not as the bytes a visitor downloads from GitHub Pages.
- **Wire bytes and request counts describe this local audit run.** They are useful for finding regressions under the same setup, but they are not network-independent or a substitute for measuring the deployed site.
- **TTFB / Load are LOCAL best-case** (no network hop; max load here 879ms) — use them for catching regressions, not as absolute proof. Real-world latency adds to every stack equally.
- **Compare delivery only under the same conditions.** Production compression and caching change the bytes visitors receive; do not compare this local report with another framework's compressed production assets.

## Pages

| Page | TTFB | Load | Wire | JS | Req | Blocking | Title | Desc | Canon | OG | 1×H1 | JSON-LD | Surfaces | Kinds | Accepts |
|------|------|------|------|----|-----|----------|:-----:|:----:|:-----:|:--:|:----:|:-------:|:--:|:--:|:--:|
| `/` | 5ms | 115ms | 842kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 33 | 0 | 0 |
| `/about/` | 11ms | 40ms | 777kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 37 | 0 | 0 |
| `/badges/` | 3ms | 24ms | 710kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/badges/adet-2125-midterm/` | 6ms | 46ms | 713kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/adet-2125-prelim/` | 4ms | 29ms | 713kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/adet-2134-midterm/` | 4ms | 32ms | 713kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/adet-2134-prelim/` | 4ms | 29ms | 713kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2203-midterm/` | 4ms | 29ms | 713kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2203-prelim/` | 4ms | 30ms | 713kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2209-midterm/` | 13ms | 42ms | 713kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2209-prelim/` | 4ms | 30ms | 713kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2215-midterm/` | 4ms | 32ms | 713kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2215-prelim/` | 5ms | 33ms | 713kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2240-midterm/` | 4ms | 28ms | 713kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/apsi-2240-prelim/` | 4ms | 32ms | 713kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/introweb-2106-midterm/` | 3ms | 29ms | 713kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/badges/introweb-2106-prelim/` | 4ms | 33ms | 713kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/batch/` | 3ms | 31ms | 714kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/batch/docs/` | 4ms | 29ms | 707kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/batch/docs/add-a-route/` | 3ms | 27ms | 710kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 33 | 0 | 0 |
| `/batch/docs/architecture/` | 10ms | 64ms | 882kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 89 | 0 | 0 |
| `/batch/docs/consume-as-git-deps/` | 3ms | 37ms | 710kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 33 | 0 | 0 |
| `/batch/docs/conventions/` | 4ms | 37ms | 740kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 47 | 0 | 0 |
| `/batch/docs/getting-started/` | 3ms | 33ms | 710kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 33 | 0 | 0 |
| `/batch/docs/static-export-and-deploy/` | 3ms | 32ms | 710kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 34 | 0 | 0 |
| `/bread/` | 3ms | 34ms | 717kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/calendar/` | 9ms | 79ms | 6460kb | **202kb** | 54 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/calendar/codegeeks-hau-sleek-and-swift/` | 3ms | 34ms | 1564kb | **202kb** | 41 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 33 | 0 | 0 |
| `/calendar/gdg-hau-ai-hack/` | 4ms | 38ms | 1409kb | **202kb** | 40 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/calendar/gdgoc-hau-general-assembly/` | 3ms | 33ms | 733kb | **202kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/calendar/loop-hau-version-one/` | 3ms | 37ms | 1288kb | **202kb** | 38 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 34 | 0 | 0 |
| `/calendar/mafia-hau-reality-check/` | 3ms | 31ms | 734kb | **202kb** | 39 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 33 | 0 | 0 |
| `/calendar/yses-uplb-fair-and-talk/` | 3ms | 36ms | 1806kb | **202kb** | 41 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/calendar/yses-uplb-hackfest/` | 3ms | 32ms | 1171kb | **202kb** | 41 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/catalog/` | 10ms | 91ms | 1186kb | **30kb** | 22 | 4css/1js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 132 | 4 | 2 |
| `/crumb/` | 3ms | 28ms | 714kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/crumb/docs/` | 3ms | 27ms | 706kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/crumb/docs/getting-started/` | 3ms | 28ms | 717kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 38 | 0 | 0 |
| `/crumb/docs/write-a-tour/` | 4ms | 35ms | 727kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39 | 0 | 0 |
| `/decks/` | 3ms | 32ms | 706kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/decks/engineering-ai-for-social-impact/` | 3ms | 30ms | 706kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/decks/from-code-to-career/` | 3ms | 33ms | 706kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/decks/gdg-hau-ai-hack-ideation/` | 2ms | 30ms | 706kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/decks/reality-check-ai-ethics/` | 2ms | 29ms | 706kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/decks/version-one/` | 4ms | 31ms | 706kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/docs/` | 3ms | 31ms | 719kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/grain/` | 5ms | 41ms | 731kb | **199kb** | 34 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 38 | 0 | 0 |
| `/grain/builder/` | 6ms | 54ms | 816kb | **273kb** | 42 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 41 | 0 | 0 |
| `/grain/builder/preview/` | 4ms | 143ms | 1449kb | **222kb** | 38 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 32 | 0 | 0 |
| `/grain/docs/` | 5ms | 51ms | 708kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/grain/docs/add-a-component/` | 3ms | 33ms | 710kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 34 | 0 | 0 |
| `/grain/docs/add-a-render-op-kind/` | 4ms | 36ms | 710kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/grain/docs/ai-interface/` | 9ms | 50ms | 785kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 54 | 0 | 0 |
| `/grain/docs/design-system/` | 4ms | 47ms | 735kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 50 | 0 | 0 |
| `/grain/docs/getting-started/` | 3ms | 35ms | 711kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 34 | 0 | 0 |
| `/grain/docs/grain/` | 4ms | 37ms | 732kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/grain/docs/make-a-surface-operable/` | 3ms | 34ms | 711kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/grain/docs/re-skin-via-tokens/` | 3ms | 30ms | 709kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 34 | 0 | 0 |
| `/grain/docs/tutorial/` | 4ms | 50ms | 726kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 38 | 0 | 0 |
| `/greenroom/` | 3ms | 36ms | 1537kb | **194kb** | 36 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/mail/` | 6ms | 39ms | 767kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 41 | 10 | 10 |
| `/mill/` | 3ms | 33ms | 713kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/mill/docs/` | 4ms | 32ms | 706kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/mill/docs/add-a-collection/` | 4ms | 30ms | 713kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/mill/docs/architecture/` | 6ms | 36ms | 735kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 41 | 0 | 0 |
| `/mill/docs/getting-started/` | 3ms | 32ms | 711kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 34 | 0 | 0 |
| `/native-github-classroom/` | 3ms | 36ms | 909kb | **202kb** | 36 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/native-github-classroom/docs/` | 3ms | 28ms | 712kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/notes/` | 4ms | 34ms | 735kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 42 | 0 | 0 |
| `/notes/build-the-floor/` | 6ms | 44ms | 820kb | **239kb** | 35 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 68 | 24 | 0 |
| `/notes/feels-like-an-app/` | 6ms | 59ms | 741kb | **197kb** | 33 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/notes/how-i-turned-github-into-a-classroom/` | 6ms | 40ms | 724kb | **197kb** | 33 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/notes/one-loop-every-repo/` | 6ms | 39ms | 732kb | **197kb** | 33 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 38 | 0 | 0 |
| `/notes/origin-story/` | 4ms | 39ms | 737kb | **197kb** | 33 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39 | 0 | 0 |
| `/notes/ten-times-zero/` | 6ms | 44ms | 791kb | **217kb** | 36 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 53 | 0 | 0 |
| `/notes/the-browser-grew-up/` | 6ms | 42ms | 747kb | **197kb** | 33 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 38 | 0 | 0 |
| `/notes/the-check-that-never-ran/` | 4ms | 37ms | 727kb | **197kb** | 33 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/notes/the-console-i-built-to-stop-drowning/` | 4ms | 57ms | 866kb | **204kb** | 38 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 38 | 0 | 0 |
| `/notes/watch-its-hands/` | 4ms | 37ms | 723kb | **197kb** | 33 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 37 | 0 | 0 |
| `/notes/whitepaper-one-vocabulary/` | 5ms | 45ms | 773kb | **197kb** | 33 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 47 | 0 | 0 |
| `/notes/why-i-teach/` | 4ms | 39ms | 724kb | **197kb** | 33 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/pantry/` | 4ms | 34ms | 715kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/pantry/docs/` | 4ms | 29ms | 706kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/pantry/docs/getting-started/` | 3ms | 34ms | 717kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 37 | 0 | 0 |
| `/pantry/docs/what-it-composes/` | 4ms | 35ms | 719kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39 | 0 | 0 |
| `/plans/` | 635ms | 670ms | 737kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 31 | 0 | 0 |
| `/plans/plan/agent-autonomy-tiers/` | 699ms | 732ms | 721kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/ai-agency-navigation/` | 663ms | 695ms | 728kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/ai-workflow-loop/` | 642ms | 675ms | 734kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/builder-ai-depth/` | 626ms | 659ms | 746kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/builder-design/` | 685ms | 720ms | 743kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/builder-sandbox/` | 686ms | 720ms | 723kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/codebase-map-seeded/` | 625ms | 654ms | 719kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/course-badges/` | 587ms | 617ms | 715kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/crumb-prefilled-demo/` | 622ms | 651ms | 721kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/crumb-review-loop/` | 604ms | 635ms | 730kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/d2-content-backlog/` | 630ms | 658ms | 714kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/d6-archive-standards-repo/` | 609ms | 652ms | 715kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/form-from-data-demo/` | 848ms | 879ms | 719kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/grain-0-1-18-bump/` | 611ms | 638ms | 717kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/grain-token-debt/` | 666ms | 701ms | 725kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/loop-practice-gaps/` | 719ms | 752ms | 724kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/loop-story-and-talk/` | 592ms | 623ms | 719kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/loop-tutorial/` | 606ms | 635ms | 718kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/mill-list-continuation/` | 586ms | 616ms | 721kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/note-the-loop-nobody-ran/` | 605ms | 635ms | 720kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/pantry-control-center/` | 590ms | 621ms | 730kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/pantry-review-layer/` | 598ms | 635ms | 756kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/portfolio-finish-line/` | 605ms | 640ms | 765kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/reading-list/` | 613ms | 644ms | 717kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/repo-structure-reorg/` | 602ms | 633ms | 726kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/runs-surface-polish/` | 608ms | 638ms | 719kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/site-builder/` | 592ms | 623ms | 737kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/skills-runtime/` | 597ms | 641ms | 779kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/plans/plan/watch-me-work/` | 691ms | 726ms | 732kb | **194kb** | 33 | 6css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/projects/` | 3ms | 37ms | 715kb | **194kb** | 34 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/proof/` | 6ms | 41ms | 714kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/proof/docs/` | 5ms | 39ms | 706kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/proof/docs/getting-started/` | 5ms | 37ms | 711kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/proof/docs/how-it-works/` | 4ms | 36ms | 714kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39 | 0 | 0 |
| `/reference/` | 4ms | 40ms | 722kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/resume/` | 8ms | 40ms | 752kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 31 | 0 | 0 |
| `/standards/` | 16ms | 47ms | 714kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/standards/ai-development/` | 5ms | 39ms | 723kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39 | 0 | 0 |
| `/standards/ai-repo-standard/` | 6ms | 42ms | 728kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 43 | 0 | 0 |
| `/standards/audit-standard/` | 6ms | 43ms | 723kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 41 | 0 | 0 |
| `/standards/claude/` | 6ms | 40ms | 712kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 35 | 0 | 0 |
| `/standards/claude.starter/` | 7ms | 41ms | 713kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/standards/conformance/` | 6ms | 39ms | 721kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 36 | 0 | 0 |
| `/standards/decisions/` | 8ms | 39ms | 718kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 37 | 0 | 0 |
| `/standards/figures/` | 7ms | 46ms | 728kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 40 | 0 | 0 |
| `/standards/graph/` | 7ms | 36ms | 719kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 38 | 0 | 0 |
| `/standards/hooks/` | 6ms | 41ms | 734kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39 | 0 | 0 |
| `/standards/intake/` | 5ms | 39ms | 722kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 40 | 0 | 0 |
| `/standards/kickstart/` | 5ms | 37ms | 715kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 32 | 0 | 0 |
| `/standards/loop/` | 7ms | 46ms | 759kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 43 | 0 | 0 |
| `/standards/note-standard/` | 7ms | 50ms | 724kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39 | 0 | 0 |
| `/standards/readme/` | 7ms | 42ms | 719kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 33 | 0 | 0 |
| `/standards/readme-standard/` | 6ms | 39ms | 714kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 34 | 0 | 0 |
| `/standards/session-loop/` | 8ms | 44ms | 739kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 37 | 0 | 0 |
| `/standards/tour-standard/` | 5ms | 37ms | 718kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 37 | 0 | 0 |
| `/standards/tree/` | 5ms | 37ms | 719kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 37 | 0 | 0 |
| `/standards/voice/` | 9ms | 50ms | 762kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 53 | 0 | 0 |
| `/talks/` | 4ms | 45ms | 709kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 | 0 | 0 |
| `/talks/build-the-floor/` | 4ms | 60ms | 763kb | **256kb** | 37 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 9 | 24 | 0 |
| `/talks/every-time-it-was-wrong/` | 9ms | 41ms | 736kb | **210kb** | 34 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 |
| `/talks/ten-times-zero/` | 3ms | 75ms | 773kb | **235kb** | 36 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 |
| `/teaching/` | 7ms | 32ms | 711kb | **194kb** | 32 | 5css/2js | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 31 | 0 | 0 |

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
