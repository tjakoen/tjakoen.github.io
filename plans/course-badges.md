# Plan: course credentials and badges

A self-hosted badging system on this portfolio, replacing something like Credly. Two badges per
course section (prelim and midterm), earned from the activities students actually completed in the
HAU course platform. Each issued badge gets its own verifiable page here, so a student can add the
certification to LinkedIn pointing at this site as the issuing authority. Badge-class pages list
every recipient with links to their course repo and their personal portfolio.

This plan spans two repositories: this portfolio (the public issuer and verification surface) and the
HAU course platform (the private source of grades and the writer into teacher and student repos).

## Decisions taken (2026-09-16)

- Recipients shown by full name and GitHub handle. This publishes student names on a public repo,
  against the HAU no-PII rule, so the release step carries an opt-out notice and a human-review flag.
  Names come only from the gradebook fullName column; student numbers and emails never leave the
  private side.
- Earn criteria is completion: a non-zero score on every core activity of the term. The generator
  reports near-misses so the bar can be tuned before release.
- Verification is a public page plus an Open Badges v3 assertion. Recipient identity in the JSON is a
  salted hash of the email, so the machine file carries no raw PII even though the page shows a name.
- Term boundaries. APSI and ADET: prelim m1 to m3, midterm m4 to m5. INTROWEB: prelim m1 to m5,
  midterm m6 to m8.

## Terms

- Badge class: one badge and criteria for one (course, section, term). One page listing recipients.
- Issued credential: one recipient's award of a badge class. Own page and Open Badges assertion. This
  is the URL a student shares.
- Issuer: Tjakoen Stolk, the instructor, described on a dedicated authority page.

## Portfolio side (public, this repo)

### 1. A new MILL collection at /credentials

Mirror the /calendar events wiring in src/content.ts:

- Add content/credentials/ to COLLECTION_DIRS and a collection entry with prefix /credentials,
  index false (the portfolio owns the hub, like the notes and calendar feeds).
- Extend the shellChrome render branch (content.ts around line 150 to 200, where photo grid, gallery
  and share block are chosen) with two frontmatter templates keyed on collection.prefix /credentials:
  - type badge-class renders badge art, criteria, activity list, and the recipient roster (name,
    handle, links to course repo and portfolio).
  - type cert renders badge art, recipient line, issue date, unique id, a verification statement, a
    link up to the issuer page, and the existing share block for a LinkedIn post pointing back here.

### 2. Two page shapes as Markdown content

- Badge-class page: content/credentials/<course>-<section>-<term>.md, e.g. adet-2125-prelim.md. URL
  /credentials/adet-2125-prelim.
- Issued cert page: content/credentials/<course>-<section>-<term>--<handle>.md. One file per
  recipient, generated. A new file is a new route with no other wiring.

### 3. Open Badges v3 assertion per cert

Emit content/credentials/<slug>.ob.json and serve it via a route in src/server.ts mapping
/credentials/<slug>.json to the file, matching the raw .md honest-source pattern. Recipient identity
is a salted sha256 of email, with a documented salt.

### 4. Issuer authority page (legitimacy)

Add view/pages/teaching/index.html at /teaching (hand-authored, like /about): who I am as an
instructor, Holy Angel University, the courses, how grading works, what each badge attests, links to
the events already on the site. Every cert links up here as the issuing authority. Cross-link from
/about and the why-i-teach note.

### 5. Credentials hub

A hand page at /credentials (view/pages) listing every badge class grouped by course.

### 6. Badge art

One tokenized inline SVG per (course, term) under content/media/badges/. Grain tokens, no hardcoded
hex, per the figures standard.

## HAU side (private, course platform repo)

### 7. A local generator script

A local ops script like tools/org-audit.mjs (local, dry-run by default, not a byte-identical engine
tool):

1. Reads each section gradebook/grades.csv from console/classes/.
2. Computes prelim and midterm completion per student using the term-to-module map and the section
   grader/assignments.json core list. Reports earners and near-misses.
3. Resolves each earner course repo URL and portfolio URL where known (INTROWEB m6a3 portfolio;
   APSI/ADET finals link a public project repo). Portfolio stays optional.
4. Dry-run prints what it would issue. On --emit writes cert Markdown, class-page rosters, and Open
   Badges JSON into this portfolio content/credentials/.

### 8. Badge copy into teacher repos

Copy the badge SVG plus a short BADGE.md describing criteria into each teacher repo. Owner or gated
step, not the sweep.

### 9. Student-repo receipts (human lane)

Insert a BADGE.md receipt into each earner course repo linking to their public cert page. Follows the
publish-grades model: dry-run, execute=true to push, committed as course-bot, gated on an explicit
go. Human-lane.

### 10. Announcement

Per-section announcement that badges are released, how to view and share, and the opt-out notice.
Canvas posting is human-lane.

## Sequencing

- Phase A, safe, after go: portfolio scaffolding only. Collection wiring, the two templates, the
  issuer page, the hub, badge SVGs, and the generator in dry-run emitting a couple of sample pages.
  Render locally and screenshot a sample cert page, a class page, and the issuer page.
- Phase B, gated: run the generator for real, review rosters, commit portfolio content, copy badges
  into teacher repos.
- Phase C, human lane: insert receipts into student repos (dry-run then execute on go), post
  announcements.

## Open risks

- PII: names on a public repo. Carried per owner decision; opt-out notice and a human flag. Reversible
  only by rewriting history, so the notice should precede the public commit where practical.
- Portfolio links are sparse: most students have a course repo, not a site. The roster handles a
  missing link rather than inventing one.
- Completion bar: strict all-core completion may award few badges. The near-miss report retunes it.
- Not decided: exact badge visual design, and whether the hub shows a public recipient count.

## Human-lane note

The word credential is guarded (human-lane.sh, extended-regex [^/]*credential[^/]*). Every write under
content/credentials/ and this feature's cert files will be blocked until the owner adds an approval
line to ~/.claude/human-lane-approved. A session cannot write that file. Approve before Phase A.
