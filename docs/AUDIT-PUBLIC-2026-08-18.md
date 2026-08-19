# Public-facing audit, 2026-08-18

A pass over everything a stranger can reach: the site's pages, the published notes, the standards as
they render at `/standards`, every link and every piece of page metadata, the rendered experience in
a real browser, the README of every public repo, and the guardrails that keep private material off
all of it. Run under [AUDIT-STANDARD](https://tjakoen.github.io/standards/audit-standard) with seven
read-only auditors, one per bounded scope, each handed the whole rubric and each required to name a
file and a line.

This is the visitor-facing sibling of yesterday's [estate audit](AUDIT-2026-08-17.md), which graded
code quality across seven repos. Where that pass found machinery grading nothing while printing OK,
this one finds the reader-facing version of the same disease: **published instructions that name
machinery a reader cannot run, and published numbers that a reader who checks will find wrong.**
Both are worse than saying nothing, because a confident instruction and a dated receipt are exactly
the two things this estate asks to be trusted on.

## Scope and method

| scope | what it covered |
| --- | --- |
| site pages | every file under `view/pages/`, plus page copy in `src/` route handlers, claims verified against source |
| published notes | all eleven files in `content/notes/`, read in full against NOTE-STANDARD and VOICE |
| published standards | all eighteen files in `standards/`, graded on whether the machinery they name exists and runs |
| links and metadata | 145 internal targets curled, 108 external, plus titles, descriptions, canonicals, sitemap, robots, 404 handling |
| rendered pass | twelve pages in Chromium at 375, 768 and 1440 pixels, contrast computed from real styles, keyboard walked by real Tab presses |
| estate READMEs | seven repos plus the published package READMEs under `grain/packages/` |
| guardrails | named people, employer references, student data, secrets, private material, tone, across this repo and five siblings |

## The gate, before anything was touched

```
$ tsc --noEmit
(no output)

$ bun test
 548 pass
 0 fail
 1912 expect() calls
Ran 548 tests across 33 files. [2.62s]

$ bun tools/lint-gate.ts
lint gate: 1 lint(s) regressed against tools/lint-baseline.json:
  voice:backtick: baseline 2976 -> now 2980 (+4)
```

The lint-gate regression is not this session's. It comes from another session's uncommitted work in
the shared tree (`content/notes/build-the-floor.md` and its figure scripts), and it is carried by
name here rather than accepted into the baseline, because accepting a number that belongs to someone
else's in-flight file is how a baseline stops meaning anything. `oxlint` reports warnings only, all
of them pre-existing, none introduced here.

## Findings

Most severe first. Every row names a file and a line. The status column says what happened in this
session.

| file:line | severity | dimension | problem | status |
| --- | --- | --- | --- | --- |
| `standards/LOOP.md:402,404,417` | blocker | unwired | Day one tells a public reader to run `pantry init --kit` and `pantry doctor`, with no fallback and no hedge. That package is not on npm, and the unscoped `pantry` name there belongs to an unrelated caching library with no binary. A stranger following the published standard installs someone else's package. This repo's own CI comment already records that the package is unpublished. | **fixed**, fallback added |
| `view/pages/about.html:159` | blocker | claims | The Now log says PROOF's board went live streaming over server-sent events. `/proof` says the opposite in its own words, and the rendered `/plans` HTML carries no such wiring, so `/proof` is the honest one. The site contradicts itself about a capability it ships. | **fixed**, About corrected |
| `standards/VOICE.md:207-210,231` | blocker | employer | The published specifics bank names two internal Career Team artifacts, each tagged internal by the author and then published anyway. The same file forbids exactly this at line 350. | **fixed**, both genericized, held uncommitted |
| `content/notes/ten-times-zero.md:200-206,282` | major | claims | The flagship receipt publishes 242 commits and 48 percent prose, dated eleven days ago. Recounted today with the note's own documented commands: 437 commits, roughly 51 percent prose. The whole argument of the piece is that a reader can check, and a reader who checks now gets a different answer. | **fixed**, recounted 19 Aug |
| `content/media/feed/gdgoc-hau-call-the-point.jpg` | major | student-data | The Safari tab strip above the shared slide is legible at zoom and shows classroom repository tabs. Downgraded from the auditor's blocker after inspection: no student name or identifier is readable, every title is truncated, and the institution is named openly in the post by design. What leaks is the course repo naming pattern. | **fixed**, both cropped |
| `view/components/organisms/portfolio-frame/portfolio-frame.html:14-33` | major | a11y-keyboard | No skip link anywhere on the site, and the always-expanded explorer rail sits before `main` in tab order. Measured by real Tab presses: the page's own content is the 119th stop on `/about` and the 65th on `/`. Every page, every load. | **fixed**, and it found a second bug |
| `node_modules/@tjakoen/grain/styles/variables.css:44-46,215,223` | major | a11y-contrast | `--ink-faint` measures 1.8:1 in light mode against the real composited background, where AA wants 4.5:1. It carries résumé dates, locations, the tagline and note captions. `--ink-muted` measures 3.98:1 in light mode. The token lives upstream in grain, so this repo cannot patch it. | **fixed**, retiered, needs a grain publish |
| `view/components/organisms/portfolio-frame/portfolio-frame.html:26-31` | major | responsive | The window-bar controls measure 8 by 20 pixels against a 44 pixel minimum, at every width rather than only on mobile. The cause is an `all: unset` upstream with no box size. | **fixed** at AA, not AAA |
| 16 templates under `view/pages/` | major | a11y-semantics | Every section label on the site was a `div`, not a heading, so `/about`, `/resume`, `/grain` and `/batch` jumped straight from h1 to h3 and a screen reader's heading list showed nothing for any section. | **fixed**, 68 labels |
| `docs/grain/TUTORIAL.md:26,93,111,135`, `ADD-A-RENDER-OP-KIND.md:10,27`, `MAKE-A-SURFACE-OPERABLE.md:11,37`, `AI-INTERFACE.md:116` | major | dead-link-external | Nine links to grain source files 404 since the repo folded into `packages/`. All live on the public `/grain/docs/*` pages. | **fixed**, paths verified on disk |
| `standards/FIGURES.md:171,174` | major | dead-link-internal | Relative `../content/notes/*.md` links resolve against the page's own URL once rendered, so they 404 on the live site. `src/content.ts:60` already documents this exact gap. | **fixed** |
| `standards/VOICE.md:17,18,173,179`, `standards/NOTE-STANDARD.md:33,35,172` | major | dead-link-internal | The same broken pattern, in two files another session is holding uncommitted. **Recurs from 2026-08-17 unfixed.** | **fixed**, held uncommitted |
| `standards/KICKSTART.md:73` | major | cross-ref | Phase 2 pointed a reader at `github.com/tjakoen/tjakoen`, which 404s. The correct repo is used one file over in `CLAUDE.starter.md`. | **fixed** |
| `docs/batch/CONSUME-AS-GIT-DEPS.md:49` | major | dead-link-external | A link to a `SPLIT-PLAN.md` that no longer exists. **Recurs from 2026-07-29**, where it was already filed as a phantom reference and shipped unfixed. | **fixed**, it had moved, not gone |
| `docs/grain/AI-INTERFACE.md:9,10` | major | dead-link-external | Two links into `tjakoen/project`, a repo that no longer exists. No successor path is confirmed. | open, needs a decision |
| `src/server.ts:352-357` | major | seo | All 26 live `/plans` routes ship with no meta description at all, which also drops the OpenGraph and Twitter descriptions for that whole section. | open, wants a source for the text |
| `src/server.ts:687-696` | major | seo | `/cv` served the same content as `/resume` under its own self-referencing canonical, indexable twice. The `/kickstart` twin route already solved this correctly. | **fixed**, mirrors the existing pattern |
| `src/server.ts:397` | major | sitemap | `/catalog` is a real, nav-linked page and was absent from the sitemap, where `/reference` had been added by hand. | **fixed** |
| the global 404 fallback | major | routing | An unknown URL returns a correct 404 status with a bare `text/plain` body reading "Not found". No chrome, no nav, no way home. | **fixed**, real page plus the Pages root file |
| `README.md:3,37` (portfolio) | major | footer | README-STANDARD carves this one repo out and says the AI note is linked locally here. This was the one repo not following its own carve-out. | **fixed** |
| `pantry/README.md`, `greenroom/README.md`, `tjakoen.github.io/README.md` | major | badges | Three repos ship a real, wired CI workflow and claimed no CI badge. | **fixed**, all three |
| `grain/packages/crumb/README.md:5` | major | badges | The status badge advertises 0.1.7 published with 0.1.8 pending. npm serves 0.1.9. | **fixed** |
| `standards/*.md`, 144 occurrences | major | voice | VOICE calls the em-dash the loudest tell and its own title carries one. The standards are the one body of prose that has to pass itself, and they do not. Tracked honestly in `tools/lint-baseline.json` as a ratcheting count, which is not the same as conformant. | open, wants a real pass |
| `content/events/yses-uplb-hackfest.md:96`, `yses-uplb-fair-and-talk.md:60`, `codegeeks-hau-sleek-and-swift.md:32,78` | major | named-person | Three people named in full with no public profile link, against the repo's own rule that a name-drop carries public professional info and a link. One is a hackathon participant who may be a student. | open, needs consent judgment |
| `view/pages/bread/index.html:15,17` | major | consistency | The flagship stack page says four layers in its h1 and five in the next paragraph, and its title and description say five, while five other pages say four plus PANTRY. | open, needs one convention |
| `README.md` (portfolio) | major | first-impression | The CV-facing flagship repo never says how to install or run the site. | open, wants prose |
| `standards/CONFORMANCE.md:190` | major | counts | The verification checklist called C6's six rows five. | **fixed** |
| `content/notes/whitepaper-one-vocabulary.md:153,154,223` | minor | voice | Two contractions and one British spelling in a piece whose register expands both. | **fixed** |
| `content/notes/watch-its-hands.md:113` | minor | voice | The caption used the whitepaper's academic Figure prefix where every personal note uses a plain caption. | **fixed** |
| `content/notes/one-loop-every-repo.md:10` and 34 more | minor | seo | 35 live pages carry a meta description past the roughly 155 character display budget, worst at 708. Nothing truncates. | open, or accept deliberately |
| `src/server.ts:357` | minor | seo | The plans index title renders "Plans · Plans". | **fixed** |
| `src/seo.ts:39` | minor | seo | Routing is case-insensitive and the canonical does not normalize case, so `/GRAIN` gets its own canonical. Nothing links that way today. | **fixed**, with a test |
| `standards/NOTE-STANDARD.md:64` | minor | note-standard | The frontmatter table still says `status` gates publication. An owner call on 2026-08-14 made it decorative, and the live site treats DRAFT and PUBLISHED identically. | deferred, file is held |
| `standards/NOTE-STANDARD.md:100` | minor | claims | The guide row's worked example names two slugs that do not exist. | deferred, file is held |
| `content/notes/whitepaper-one-vocabulary.md:664` | minor | note-standard | The paper ends on its reference list with no sign-off footer. The backlog records this as a deliberate choice for the formal register, but NOTE-STANDARD never wrote the carve-out down, so the ruled practice and the written standard disagree. | open, wants the exception written |
| `standards/LOOP.md:35-49` | minor | counts | The intro says five primitives, the table has five rows, and the prose then calls a sixth item the fifth. | open |
| `view/pages/resume.html:50`, `view/pages/index.html:54-59` | minor | consistency | The résumé lists PANTRY inside the one-direction chain that PANTRY's own page says it is not part of, and omits CRUMB. The homepage card names four of five without saying so. | open |
| `view/pages/talks/ten-times-zero.html` | minor | claims | The audit-receipts slide states 40 end-to-end specs as a flat fact with no date. The count is 44 today. The ratio slide two slides earlier carries the date hedge this one wants. | **fixed**, dated and recounted |
| `grain/README.md:10,63-71` | minor | stale | The root README says four packages and the tree lists four. `packages/` holds five. | open, repo is dirty |
| `content/data/cv.json:47` | minor | employer | The résumé names a former employer that the content backlog's plan for the same story promises to keep anonymous. The résumé has already foreclosed that. | open, worth knowing before writing |
| `bread/README.md`, `project/README.md`, `grain/README.md` | minor | voice | Fifteen em-dashes across three public READMEs, including one in a title. | **fixed**, 15 of 15 |

## Per-dimension status

Silence is not a pass, so every dimension gets a line, including the ones that came back clean.

- **Claims.** Three live contradictions, named above. Everything else on the layer pages was checked
  against source and holds.
- **Voice.** Clean in the site's page copy: every em-dash and backtick found under `view/pages/`
  sits in a developer comment or a code block, none in rendered prose. Not clean in the standards
  themselves, which is the finding above.
- **Dead ends.** No broken internal link in the pages tree. 139 of 139 internal paths returned 200.
  The 404s are all in Markdown relative links and in external repo paths that moved.
- **Unfinished copy.** Clean. No placeholder, lorem, TODO or orphaned heading anywhere under
  `view/pages/`.
- **Accessibility.** Alt text clean, 0 images missing it. Form labels clean. Focus rings present and
  visible at every one of the tab stops walked. `lang` present on all twelve pages. The failures are
  the four named above: skip link, heading semantics, contrast, tap targets.
- **Responsive.** No horizontal overflow on any page at any of the three widths. Tap targets are the
  only responsive failure.
- **Console and network.** Clean. Zero console errors, zero page errors, zero failed or 4xx requests
  across twelve pages.
- **Secrets.** Clean, and checked properly: every tracked file in this repo and five siblings swept
  for key prefixes, private-key headers, connection strings and bearer tokens. `.nimbalyst/` and
  `nimbalyst-local/` confirmed ignored with zero tracked files under either.
- **Tone.** Clean, and actively so. The event posts name their own conflict of interest and explain
  why student faces are blurred, which is care doing work rather than care being absent.
- **The employer name.** Clean everywhere except the two VOICE entries above. "Career Team" is used
  consistently across the whole tracked tree.

## What was fixed, and how it was checked

Twenty findings landed in one wave after all seven auditors reported, per the standard's barrier.
The gate was green before and after: `tsc` clean, 548 tests passing.

The heading change is the one worth describing, because it was nearly a silent design change. Moving
68 section labels from `div` to `h2` gives a screen reader the heading list a sighted reader already
sees. But `.section-head` sets size and margin without setting weight, so an `h2` could have arrived
bold and changed the look of every page under cover of an accessibility fix. Weight carries meaning
in this design system, so it was checked rather than assumed: grain's `global.css:45` already pins
h1, h2 and h3 to the house regular weight. Measured after the change on three pages, the labels
render at weight 400 and 20.8 pixels, exactly as before. A local override was written and then
deleted once the upstream rule was found, because a duplicate rule is its own small debt.

The two `src/server.ts` fixes were verified on an isolated port, since port 3000 belongs to another
session: `/cv` now points its canonical at `/resume/`, and `/catalog` appears in the sitemap.

## Deferred, with reasons

- **Two standards files, `VOICE.md` and `NOTE-STANDARD.md`.** Both carry another session's
  uncommitted edits. Their broken relative links, the stale `status` row and the dangling worked
  example are all real and all left alone, because fixing a file someone else is holding means
  either committing their work or entangling it with mine. The sibling fix in `FIGURES.md` landed,
  so the pattern is half closed.
- **`content/notes/build-the-floor.md`.** In flight in another session. The notes auditor filed five
  findings against it, including three figures that ship with no static SVG. They are recorded here
  and belong to that session.
- **`grain/packages/crumb/README.md`.** The grain repo has fourteen other uncommitted paths. The
  badge fix is one line and it can wait for a clean tree.

## The recurrence, and the gate that is missing

Two findings in this report were in the previous audit, unflagged, with no gate added. One,
`SPLIT-PLAN.md`, has now survived two audits since 2026-07-29. The standard is blunt about what that
means: a finding that recurs is a missing gate, not a careless session.

The class here is narrow and worth closing properly. Relative Markdown links of the form
`../content/notes/*.md` render into hrefs that 404, and `src/content.ts:60` already carries a comment
naming this exact gap. A comment that describes a known defect is the weakest rung on the hardening
ladder. The honest fix is a check that fails when a Markdown file under `standards/` or `content/`
links with a `../` path, which would have caught all ten occurrences and will catch the eleventh.
Nothing checks NOTE-STANDARD conformance mechanically either, which is why a missing footer and a
stale frontmatter row both reached a second audit.

That check is now written. `tools/link-lint.ts` fails on any relative Markdown link under a rendered
directory that the renderer does not resolve, wired as `bun run lint:links` with nine tests of its
own. It earned its place immediately: run against a tree the seven auditors had already read, it
found three more instances they had all missed, in `docs/batch/ADD-A-ROUTE.md` and
`docs/batch/CONVENTIONS.md`. Fifty-three rendered files now pass it.

One piece is deliberately not done. The CI step that runs the check on every push was refused by the
human lane, which guards `.github/` because a workflow change is the owner's to make. The tool runs
green locally and the step is written out for a hand that is allowed to write it. A check that only
runs when someone remembers is a weaker rung than a check on push, and that is the honest state of
it today.

## After the owner's calls

Four decisions came back the same day and landed:

- **The pantry day-one steps** kept their shape and gained the fallback CONFORMANCE already uses,
  naming the missing package and telling the reader to mark the doctor rows not run.
- **The About log** was corrected to match `/proof`, since `/proof` and the rendered HTML agreed
  with each other and About did not.
- **The two internal artifacts in VOICE** were genericized rather than deleted, so the specifics
  bank keeps the teaching value and loses the identifying detail. A third reference, an internal
  team name two sections down, was found and genericized in the same pass.
- **The gate** was written, tested and wired to a script, and is described above.

Two files carry those edits and stay uncommitted: `standards/VOICE.md` and
`standards/NOTE-STANDARD.md` both hold substantial work from another session in the same tree, a new
register row and a 92 line addition. Committing either would sweep in work this session did not
review. They are applied on disk and the commit is the owner's.

## The second wave, and the bug the fix uncovered

Eleven more findings closed the day after the report was written, and one of them is worth reading
even if the rest are not.

The skip link was added, styled, and confirmed present in the HTML. Then a real Tab press showed it
was never reached. Two separate causes, both invisible to a reader of the source. The first was
mine: parking it off-screen inside `.app-shell`, which is `overflow: hidden`, meant it was clipped
with no way to scroll to it, and Chromium drops a permanently-clipped element out of sequential
focus navigation. It stayed focusable by script and unreachable by keyboard. The second was older
and worse: `scrollIntoView` in `scripts/site.js`, added to keep the active tab visible on mobile,
also sets the document's sequential focus navigation starting point. That single line moved the
start of the tab order into the tab strip on every page load, so the skip link and the entire
window-bar nav were unreachable by keyboard on every page of the site, and had been.

Neither would have been caught by reading the markup, by an axe pass, or by asserting that the
element exists. Only pressing Tab found them. That is the same lesson the previous audit recorded
about reading a file versus running it, arriving from the other direction.

Two of the fixes are deliberately not the number the audit asked for. The window-bar controls went
to 24 by 24 pixels, WCAG 2.5.8 at AA, not the 44 of 2.5.5 at AAA, because the bar is 34 pixels tall
and a 44 pixel target would burst it or overlap the tab strip. And the contrast fix did not darken
`--ink-faint` to clear AA, because that would have landed it within one shade of `--ink-muted` and
collapsed two design tiers into one. grain's own comment already called that token decoration, so
the fix was to stop painting content with it: 25 usages moved, and the decorative ones were judged
one at a time and left alone.

## What this pass did not cover

- **Git history.** The guardrails sweep read the working tree only. A secret, a name or an
  unredacted screenshot committed and later removed is still recoverable, and would have been missed
  entirely. `docs/AUDIT-2026-07-29.md` already records one open case of exactly this shape.
- **Images below the two that were opened.** Roughly fifty files in `content/media/feed/` were
  sampled, not zoomed. The tab strip was found only because that screenshot happened to contain a
  browser window. The PDFs under `content/media/decks/` were not opened at all.
- **A real axe-core pass.** No CDN was reachable from the auditor's sandbox, so the accessibility
  checks were hand-written against the named criteria. Rules outside that list, ARIA validity and
  duplicate IDs among them, were not run.
- **Screenshots from the rendered auditor.** Its capture tool failed twice with a display-surface
  error. Every number it reported was still measured from computed styles and real key presses, and
  the screenshots in this session were taken separately through Playwright.
- **The exported `dist/` build.** Everything rendered was checked against the dev server. The
  repo has its own export gate, and it was not re-run here.
- **The keyboard walk on ten of twelve pages.** Run in full on `/` and `/about` only. The chrome that
  dominates tab order is identical across all of them, which makes the finding general and the
  measurement partial.
- **Seventeen LinkedIn links and one Cloudflare-challenged link.** All returned bot-block responses
  rather than a real status. They are unresolved, not passed.
- **The full section-reference sweep across the standards.** Roughly 20 of about 106 were walked.

---

*The judgment is human. The typing, by design, is not. On this one, nearly all of it.*
