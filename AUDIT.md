# AUDIT.md — the alignment runbook

This is the mechanical half of an audit: the checks that answer "does this repo still obey the rules
it wrote for itself". It is not the audit itself. The quality half, the nine dimensions, the
severity vocabulary, the fan-out and the report a pass owes are in
[`standards/AUDIT-STANDARD.md`](standards/AUDIT-STANDARD.md), and a pass that runs only one half is
the most common way an audit lies.

The canon defines what "aligned" means. When a check here and a canon file disagree, the canon wins
and this file gets fixed, not the canon. The files it points at, and nothing else:

- [`CLAUDE.md`](CLAUDE.md) — the non-negotiables and the working rules.
- [`standards/NOTE-STANDARD.md`](standards/NOTE-STANDARD.md) — the note artifact: frontmatter, share
  block, figure, footer, guardrails.
- [`standards/VOICE.md`](standards/VOICE.md) — how the prose reads.
- [`standards/AI-REPO-STANDARD.md`](standards/AI-REPO-STANDARD.md) — the kit this file belongs to.
- [`docs/HACKING.md`](docs/HACKING.md) — the route to source map, for judging a claim by reading.

Run this from the repository root. Every command below is copy-pasteable and every pass bar is an
observable result, not a judgement. A dated report lands in [`docs/`](docs/) as
`AUDIT-YYYY-MM-DD.md`; keep the old ones, because the diff between two audits is the only honest
measure of whether the repo is getting better.

## 1. The gate comes first

An audit run against a red gate measures nothing. Run these in order and paste the last lines of the
output into the report verbatim.

| ID | Command | Pass bar |
|---|---|---|
| G1 | `bun install --frozen-lockfile` | exit 0 |
| G2 | `bun run check` | exit 0, no output |
| G3 | `bun test` | `0 fail` in the summary |
| G4 | `bun run lint` | exit 0 |
| G5 | `bun tools/lint-gate.ts` | no line beginning `oxlint:` or `voice:` with `regressed`, or a regression deliberately accepted with `bun run lint:baseline --accept` |
| G6 | `bun run lint:links` | `no dead relative links` |
| G7 | `bun run lint:runs` | `0 problems` |
| G8 | `bun run standards:index --check` | `standards/INDEX.json is current` |
| G9 | `bun tools/note-diagrams.ts --check` | exit 0, no stale block |
| G10 | `bun run diagrams:check` | `every diagram fence in served content is named and has a committed SVG` |
| G11 | `bunx playwright test --ignore-snapshots` | `0 failed`. On macOS, a presentation change also runs the suite without `--ignore-snapshots`, because the committed visual baselines are darwin-only |
| G12 | `PUBLIC_ORIGIN=https://portfolio.tjakoen.com bun run export && bun run verify:export` | the export writes `dist/` and the verifier reports `OK` (no dead links, no stale diagram). Without `PUBLIC_ORIGIN` the sitemap bakes `http://localhost:3330` into every `<loc>` and the verifier refuses all 507, which is the verifier doing its job. |
| G13 | `bun tools/skills-library.ts --page --check` | `skills page is current`: the `/skills` index was regenerated after the last standard changed |

The lint gate is advisory by the owner's decision of 2026-08-13: it exits 0 on a regression so no
push is refused over a style flag. Advisory does not mean ignorable. A `regressed` line is a finding
in the report, and the fix is to remove the regression rather than to accept it unless the
acceptance is written down in the same commit.

## 2. Code alignment

A1 checks the commit record, A2 to A5 check rules the code is expected to keep, and A6 is the
capability check that keeps the docs from drifting away from what ships.

| ID | Command | Pass bar |
|---|---|---|
| A1 | `git log -n 200 --format='%B' \| grep -iE 'co-authored-by\|generated with'` | no output. AI use is disclosed by the README badge and footer, never by commit metadata. |
| A2 | `grep -rn 'portfolio\.tjakoen\.com' src --include=*.ts \| grep -v '\.test\.ts'` | every hit is `src/seo.ts` (the origin constant) or a prose title, never a second URL a link is built from. Links take `SITE.origin`. |
| A3 | `grep -rnE '#[0-9a-fA-F]{3,8}\b' view src --include=*.css --include=*.ts \| grep -v '\.test\.ts' \| grep -vE '&#[0-9]+;\|var\(--[a-z-]+, #[0-9a-fA-F]+\)'` | hits only in two named blocks: the ATS print sheet in `view/components/pages/resume/resume.css`, and the two ant colours in `view/components/molecules/live-figure/live-figure.css`. A new file or block here is a finding, because a token exists or should; a `var()` fallback and an HTML entity are not colours. Per-course hues are data (`content/data/course-hues.json`), not CSS. |
| A4 | `grep -rn 'from "\.\./\.\./' src --include=*.ts \| grep -v '\.test\.ts'` | no output. The app imports the stack by package name and its own modules by relative path inside `src/`. |
| A5 | `grep -rnE '\b(TODO\|FIXME\|XXX)\b' src tools --include=*.ts \| grep -v '\.test\.ts'` | no unexplained hit. A comment that names a defect is not a fix; promote it or file it. |
| A6 | Read [`docs/grain/GRAIN.md`](docs/grain/GRAIN.md) and [`docs/batch/ARCHITECTURE.md`](docs/batch/ARCHITECTURE.md) capabilities lists against `src/` and [`docs/HACKING.md`](docs/HACKING.md) | every route in HACKING resolves to a file, every claimed capability exists, and nothing shipped is missing from the list. A one-way check is half a check. |

## 3. Content alignment (the notes are the product)

The notes are the most-read surface here, and NOTE-STANDARD is explicit, so each rule gets a command.

| ID | Command | Pass bar |
|---|---|---|
| N1 | `for f in content/notes/*.md; do for k in title subtitle author status type date readingTime tags summary; do grep -q "^$k:" "$f" \|\| echo "$f missing $k"; done; done` | no output |
| N2 | `grep -rn '^status:' content/notes \| grep -vE 'DRAFT\|PUBLISHED'` | no output. A missing status publishes, so the field is required. |
| N3 | `for f in $(grep -l '^status: PUBLISHED' content/notes/*.md); do tail -6 "$f" \| grep -q 'judgment is human' \|\| echo "NO FOOTER: $f"; done` | no output. `ten-times-zero.md` is the one exception and still carries the line. |
| N4 | `for f in $(grep -l '^status: PUBLISHED' content/notes/*.md); do grep -q '^social:' "$f" \|\| echo "NO SOCIAL: $f"; done` | no output, except a note dated before 2026-09-01 (a snapshot, per NOTE-STANDARD), a technical companion whose main note's post already points to it, and `ten-times-zero.md`, the flagship, which is required either way. Name every exception in the report. |
| N5 | `for f in content/notes/*.md; do grep -qE '<svg\|<img\|mermaid\|<!-- (diagram\|stack\|compare):\|data-live-figure' "$f" \|\| echo "NO FIGURE: $f"; done` | no output for a published note. A prose placeholder is a to-do, not a figure. |
| N6 | `for f in content/notes/*.md; do for img in $(sed -n '/^socialImage:/,/^[a-zA-Z]/p' "$f" \| grep -oE '/media/[^" ]+'); do p="content$img"; [ -f "$p" ] \|\| { echo "MISSING $p <- $f"; continue; }; d=$(sips -g pixelWidth -g pixelHeight "$p" \| awk '/pixelWidth/{w=$2}/pixelHeight/{h=$2}END{print w"x"h}'); case "$p" in *.gif) [ "${d%%x*}" = "1200" ] \|\| echo "GIF WIDTH NOT 1200 ($d): $p <- $f";; *) [ "$d" = "1200x1200" ] \|\| echo "NOT 1200x1200 ($d): $p <- $f";; esac; done; done` | no output. A PNG card is 1200×1200; an animated GIF must be 1200 wide; the alt text is required beside every card. |
| N7 | `grep -rnE '\]\(https://portfolio\.tjakoen\.com/(notes\|drafts)/' content/notes` | no output. Sibling notes link as `slug.md`, never by absolute URL. |
| N8 | `bun tools/voice-lint.ts content/notes/*.md` | `0 tell`. Warns are read in the report, not silently accepted. |
| N9 | Read the lines N8 flags, plus `grep -rnE '$[0-9]' content/notes` | no salary figure, no exact ratio, no student name or email, company named "Career Team" exactly |
| N10 | `grep -rnE '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' content/notes` | no output. A student's email in a public repo is a blocker, not a nit. |

N4 and N5 are the two that fail silently: a note with no share block still renders, and so does a
note with no figure, so nothing catches either except this pass.

## 4. Docs, standards and plans

| ID | Command | Pass bar |
|---|---|---|
| D1 | `bun ../pantry/cli.ts skills list .` (PANTRY is unpublished, so the checkout, not `bunx`) | `N skills in canon, 0 stale or unmounted, 0 shadowed`, and N matches the standards carrying a `when:`. A stale mount is a session reading an older canon, and an unmounted standard is one that cannot fire at all. Fix with `bun ../pantry/cli.ts skills sync .` |
| D2 | `bun run standards:index --check` | current (same as G8) |
| D3 | Pick every command a doc tells a reader to run | it exists in `package.json`, `tools/`, or the shell, and it still works. A path that moved is a finding against the doc, not against the reader. |
| D4 | Read `plans/README.md`, then every plan with `owner: ai` or a `blocked:` line | the status matches the evidence, a ticked task has a `done:` reference, and a blocked plan names what would unblock it. |
| D5 | `git status --porcelain` after the pass | empty. The report and its fixes are committed together. |
| D6 | `bun tools/skills-library.ts --publish ../skills && git -C ../skills status --porcelain` | empty output: the published library at `tjakoen/skills` matches canon. A non-empty list is drift; commit it in the same change as the standard that caused it. Skip with a note when the sibling checkout is absent. |

## 5. The report

Write `docs/AUDIT-YYYY-MM-DD.md` with:

1. A findings table, most severe first: `file:line`, severity (`blocker`, `major`, `minor`),
   dimension, problem, fix, status. One row per finding; no prose standing in for rows.
2. A per-dimension status for all nine, including the clean ones and how each was checked.
3. The gate output verbatim.
4. What was not covered, named. A skipped suite or repo is a gap in the report, not a secret.
5. Every finding fixed, or deferred with a reason. An open finding with no decision is an unfinished
   audit.

Close the class, not the instance. Every finding worth fixing gets one question after it: could this
have been made impossible? Promote the answer as far up the hardening ladder as it goes, and add the
check here if the answer is a command.

## 6. When this runbook is due

- Before a release, or before pointing anyone public at the repo.
- When a subsystem was substantially rewritten: that subsystem, full rubric.
- When the same bug class appears twice: that dimension, everywhere.
- When the session-start doctor says the audit is stale.

The doctor reads the newest dated report in `docs/` and `audit/`, not this file. A runbook with no
report behind it is the failure mode this file exists to prevent.
