// tools/issue-badges.ts — issue course badges from the HAU gradebooks into content/badges/.
//
// A local ops tool, in the spirit of the HAU org-audit script: dry-run by default, reads only the
// section gradebooks, and writes portfolio content ONLY with --emit. It never touches HAU repos.
//
// Earner rule (owner decision, 2026-09-16): a student earns a term badge when they were ACTIVE in
// that term, judged by their repos rather than the roster. Active = has at least one submission-repo
// row in the term's module range whose grader actually found gradeable content (total > 0 or
// passed > 0); a bare/empty template that grades 0/0 does not count. Prelim and midterm are separate,
// so a student who left after prelim earns only the prelim badge.
//
// PII: the gradebook fullName is written into the PUBLIC badge pages, per the owner's explicit call.
// Student numbers and emails never leave this side: the number only salts the credential id, the
// email only its salted Open Badges hash. The DRY-RUN prints counts only, never a name, so the chat
// transcript stays PII-free.
//
// Usage:
//   bun tools/issue-badges.ts               # dry-run: per-section active + near-miss counts
//   bun tools/issue-badges.ts --emit        # write content/badges/*.md + *.ob.json
//   HAU_CLASSES=/path bun tools/issue-badges.ts   # override the gradebook root

import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync, readFileSync, existsSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const HERE = dirname(fileURLToPath(import.meta.url));
const CONTENT_BADGES = join(HERE, "..", "content", "badges");
const HAU_CLASSES = process.env.HAU_CLASSES
  || "/Users/tjakoenstolk/Local/HAU/github-native-course-platform/console/classes";
const EMIT = process.argv.includes("--emit");
const SALT = "hau-badges-v1"; // documented salt for the Open Badges recipient hash

type Term = "prelim" | "midterm";
interface Section {
  dir: string; org: string; course: string; monogram: string; section: string; title: string;
  ranges: Record<Term, string[]>;
}

// Badge names + what the award covers, grounded in the curriculum (the APSI/INTROWEB course outlines
// name the prelim/midterm milestones and their course outcomes) and, for ADET, its course material.
const META: Record<string, { subtitle: string; desc: string }> = {
  "apsi-prelim": { subtitle: "Frontend Design with Cloud", desc: "JavaScript fundamentals, then React components, state and effects, building and deploying a front end. Covers modules 1 to 3 of Application and System Integration, mapped to course outcomes CO1 to CO3." },
  "apsi-midterm": { subtitle: "Backend Development with Cloud", desc: "Node and Express REST APIs and PostgreSQL data modelling, building and deploying a backend service. Covers modules 4 to 5, mapped to course outcomes CO1 to CO3." },
  "adet-prelim": { subtitle: "Dart and Flutter Foundations", desc: "Dart and object-oriented programming, then Flutter widgets, layout and state, building an interactive mobile UI. Covers modules 1 to 3 of Application Development and Emerging Technologies." },
  "adet-midterm": { subtitle: "Flutter App Development", desc: "Stateful Flutter apps: navigation, forms, lists and detail screens, building a multi-screen application. Covers modules 4 to 5." },
  "introweb-prelim": { subtitle: "Web Foundations", desc: "HTML structure and semantic markup, CSS layout with grid and flexbox, responsive design and visual hierarchy following web standards. Covers modules 1 to 5 of Basic Programming in Web Development, mapped to course outcomes CO1 and CO2." },
  "introweb-midterm": { subtitle: "Interactive Web Pages", desc: "Client-side JavaScript: DOM manipulation, events and behaviour, building and deploying interactive pages. Covers modules 6 to 8." },
};

const APSI_RANGES: Record<Term, string[]> = { prelim: ["m1", "m2", "m3"], midterm: ["m4", "m5"] };
const SECTIONS: Section[] = [
  ...["2240", "2203", "2209", "2215"].map((s) => ({
    dir: `teacher-6apsi-${s}-tjakoen`, org: "HAU-6APSI", course: "apsi", monogram: "6APSI",
    section: s, title: "Application and System Integration", ranges: APSI_RANGES,
  })),
  ...["2125", "2134"].map((s) => ({
    dir: `teacher-6adet-${s}-tjakoen`, org: "HAU-6ADET", course: "adet", monogram: "6ADET",
    section: s, title: "Application Development and Emerging Technologies", ranges: APSI_RANGES,
  })),
  {
    dir: "teacher-6introweb-2106-tjakoen", org: "HAU-6INTROWEB", course: "introweb", monogram: "6INTROWEB",
    section: "2106", title: "Basic Programming in Web Development",
    ranges: { prelim: ["m1", "m2", "m3", "m4", "m5"], midterm: ["m6", "m7", "m8"] },
  },
];

// A real CSV parser (RFC-4180-ish): the gradebook quotes fullName, and any field with a comma inside
// shifts every later column if you split on ",". Handles quotes, escaped "" and embedded newlines.
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let field = "", row: string[] = [], inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false; }
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      if (field !== "" || row.length) { row.push(field); rows.push(row); row = []; field = ""; }
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  if (!rows.length) return [];
  const header = rows[0]!;
  return rows.slice(1).map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
}

const moduleOf = (assignment: string): string => (assignment.match(/^m\d+/) || [""])[0];
const num = (s: string): number => { const n = Number(s); return Number.isFinite(n) ? n : 0; };

// A submission repo name is like "m1a1-2125-<handle>". Strip the "m<n>a<n>-<section>-" head to recover
// the student's GitHub handle for the display + profile link.
function handleFromRepo(repo: string, section: string): string {
  const m = repo.match(new RegExp(`^m\\d+a\\d+-${section}-(.+)$`));
  return m ? m[1]! : repo;
}
const slugSafe = (s: string): string => s.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");

interface Recipient {
  name: string; handle: string; repo: string; repoUrl: string; portfolio: string;
  certSlug: string; certId: string; identityHash: string; shortId: string;
}

function collectTerm(section: Section, rows: Record<string, string>[], term: Term):
    { recipients: Recipient[]; nearMiss: number } {
  const modules = new Set(section.ranges[term]);
  // group rows by a stable student identity: student number, else the repo handle
  const byStudent = new Map<string, Record<string, string>[]>();
  for (const r of rows) {
    if (!modules.has(moduleOf(r.assignment || ""))) continue;
    const id = (r.studentNumber || "").trim() || handleFromRepo(r.repo || "", section.section);
    if (!id) continue;
    (byStudent.get(id) || byStudent.set(id, []).get(id)!).push(r);
  }
  const recipients: Recipient[] = [];
  let nearMiss = 0;
  const usedSlugs = new Set<string>();
  for (const [id, srows] of byStudent) {
    const active = srows.some((r) => num(r.total) > 0 || num(r.passed) > 0);
    if (!active) { nearMiss++; continue; }
    // representative repo: prefer the earliest active row (lowest module), for the handle + link
    const activeRows = srows.filter((r) => num(r.total) > 0 || num(r.passed) > 0)
      .sort((a, b) => (a.assignment || "").localeCompare(b.assignment || ""));
    const rep = activeRows[0]!;
    const name = (rep.fullName || "").trim() || id;
    const handle = handleFromRepo(rep.repo || "", section.section);
    let certSlug = `${section.course}-${section.section}-${term}--${slugSafe(handle)}`;
    if (usedSlugs.has(certSlug)) certSlug += `-${id.slice(-4)}`;
    usedSlugs.add(certSlug);
    const shortId = createHash("sha256").update(`${id}|${section.section}|${term}`).digest("hex").slice(0, 8);
    const certId = `hau-${section.course}-${section.section}-${term}-${shortId}`;
    const identityHash = "sha256$"
      + createHash("sha256").update(SALT + (rep.studentEmail || "").trim().toLowerCase()).digest("hex");
    recipients.push({
      name, handle, repo: rep.repo || "", repoUrl: `https://github.com/${section.org}/${rep.repo}`,
      portfolio: "", certSlug, certId, identityHash, shortId,
    });
  }
  recipients.sort((a, b) => a.name.localeCompare(b.name));
  return { recipients, nearMiss };
}

const TERM_LABEL: Record<Term, string> = { prelim: "Prelim Skills", midterm: "Midterm Skills" };

function badgeClassMd(s: Section, term: Term, recipients: Recipient[]): string {
  const meta = META[`${s.course}-${term}`]!;
  const badgeName = `${s.monogram} ${TERM_LABEL[term]}`;
  const roster = recipients.map((r) =>
    `  - "${r.name} | ${r.handle} | ${r.repoUrl} | ${r.portfolio} | ${r.certSlug}"`).join("\n");
  return `---
title: "${badgeName}, section ${s.section}"
type: badge-class
badgeName: "${badgeName}"
subtitle: "${meta.subtitle}"
course: ${s.course}
monogram: ${s.monogram}
term: ${term}
issuer: "Tjakoen Stolk"
issuerRole: "Instructor, ${s.title} · School of Computing, Holy Angel University, Angeles City"
recipients:
${roster}
---

## What this badge attests

${meta.desc}

The holder was an active student in the ${term} block of ${s.title} (${s.monogram}), section
${s.section}, and completed real coursework in it. The badge is awarded on completion, meaning
submitted work with content, not on a grade cutoff. Each recipient's own repositories are linked in
the roster above.
`;
}

function certMd(s: Section, term: Term, r: Recipient): string {
  const meta = META[`${s.course}-${term}`]!;
  const badgeName = `${s.monogram} ${TERM_LABEL[term]}, section ${s.section}`;
  const classSlug = `${s.course}-${s.section}-${term}`;
  const shortUrl = `/b/${r.shortId}`;
  const url = `https://tjakoen.github.io${shortUrl}`;
  const social = `  I earned the ${badgeName} badge (${meta.subtitle}) from the School of Computing at\n`
    + `  Holy Angel University, issued by my instructor Tjakoen Stolk.\n\n`
    + `  It attests that I completed the ${term} coursework of ${s.title}, graded from the work I\n`
    + `  actually submitted.\n\n  Verify it here: ${url}`;
  return `---
title: "${badgeName} — ${r.name}"
type: cert
badgeName: "${badgeName}"
subtitle: "${meta.subtitle}"
course: ${s.course}
monogram: ${s.monogram}
term: ${term}
badgeClass: ${classSlug}
shortUrl: ${shortUrl}
issuer: "Tjakoen Stolk"
issuerRole: "Instructor, ${s.title} · School of Computing, Holy Angel University, Angeles City"
recipientName: "${r.name}"
recipientHandle: "${r.handle}"
recipientRepo: "${r.repoUrl}"
recipientPortfolio: "${r.portfolio}"
issuedOn: ${new Date().toISOString().slice(0, 10)}
certId: "${r.certId}"
criteriaUrl: /badges/${classSlug}
social: |
${social}
---

This credential attests completion of the ${term} block of ${s.title} (${s.monogram}) at Holy Angel
University: ${meta.subtitle}. See [what this badge attests](/badges/${classSlug}) for the criteria
and the full recipient roster.
`;
}

function obJson(s: Section, term: Term, r: Recipient): string {
  const classSlug = `${s.course}-${s.section}-${term}`;
  const badgeName = `${s.monogram} ${TERM_LABEL[term]}, section ${s.section}`;
  return JSON.stringify({
    "@context": "https://www.imsglobal.org/spec/ob/v3p0/context-3.0.3.json",
    id: `https://tjakoen.github.io/badges/${r.certSlug}.json`,
    type: ["VerifiableCredential", "OpenBadgeCredential"],
    issuer: {
      id: "https://tjakoen.github.io/teaching", type: ["Profile"], name: "Tjakoen Stolk",
      url: "https://tjakoen.github.io/teaching",
      description: `Instructor, ${s.title}, School of Computing, Holy Angel University, Angeles City`,
    },
    validFrom: `${new Date().toISOString().slice(0, 10)}T00:00:00+08:00`,
    credentialSubject: {
      type: ["AchievementSubject"],
      identifier: [{ type: "IdentityObject", identityHash: r.identityHash, identityType: "emailAddress", hashed: true, salt: SALT }],
      achievement: {
        id: `https://tjakoen.github.io/badges/${classSlug}`, type: ["Achievement"], name: badgeName,
        description: `Completion of the ${term} block (${s.ranges[term].join(" to ")}) of ${s.title} (${s.monogram}).`,
        criteria: { id: `https://tjakoen.github.io/badges/${classSlug}` },
      },
    },
  }, null, 2) + "\n";
}

interface HubEntry { course: string; monogram: string; title: string; section: string; term: Term; subtitle: string; count: number; slug: string; }

// The /badges hub page, hand-page HTML generated so it lists every issued class grouped by course.
function hubHtml(entries: HubEntry[]): string {
  const courses = [...new Set(entries.map((e) => e.course))];
  const groups = courses.map((c) => {
    const es = entries.filter((e) => e.course === c).sort((a, b) => (a.section + a.term).localeCompare(b.section + b.term));
    const rows = es.map((e) =>
      `      <div class="docs-list__item"><a class="docs-list__name" href="/badges/${e.slug}">${TERM_LABEL[e.term]}, section ${e.section}</a><span class="docs-list__what">${e.subtitle} · ${e.count} recipient${e.count === 1 ? "" : "s"}</span></div>`).join("\n");
    return `    <h2 class="section-head"><span>${es[0]!.monogram} · ${es[0]!.title}</span></h2>\n    <div class="docs-list">\n${rows}\n    </div>`;
  }).join("\n");
  return `<!DOCTYPE html>
<html lang="en" data-themes="sourdough baguette brioche">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Badges · School of Computing course credentials</title>
  <meta name="description" content="Course badges issued by Tjakoen Stolk at the School of Computing, Holy Angel University. Two per course section, prelim and midterm, earned on completion of the coursework. Each badge page lists its recipients.">
</head>
<body data-screen="badges" class="app-window-backdrop">
  <div class="app-shell app-window" data-section="bread" data-rail-collapsed="false" data-surface="screen">
    <portfolio-frame />
    <main class="app-shell__main" id="main-content">
      <div class="board">
    <p class="eyebrow">🏅 <span class="name">Badges</span> · course credentials</p>
    <h1 class="masthead">Badges earned in my courses.</h1>
    <hr class="rule">
    <p class="lede">Two badges per course section, prelim and midterm, earned on completion of the term's
      activities. Each badge is issued by me through the <a href="/teaching">School of Computing</a>, and
      each badge page lists everyone who earned it with links to the work. Individual recipient
      certificates have their own shareable link, reachable from the roster.</p>
    <span class="flag">Issued by <a href="/teaching">Tjakoen Stolk</a>, School of Computing, Holy Angel University</span>

${groups}
      </div>
    </main>
  </div>
</body>
</html>
`;
}

// --- run ---
let grandActive = 0, grandNear = 0, grandClasses = 0;
const shortlinks: Record<string, string> = {};
const hubEntries: HubEntry[] = [];
console.log(`issue-badges: ${EMIT ? "EMIT" : "DRY-RUN"} · gradebooks under ${HAU_CLASSES}\n`);
console.log(`${"section".padEnd(28)}${"term".padEnd(9)}${"active".padStart(7)}${"near-miss".padStart(11)}`);
for (const s of SECTIONS) {
  const csvPath = join(HAU_CLASSES, s.dir, "gradebook", "grades.csv");
  if (!existsSync(csvPath)) { console.log(`${s.dir.padEnd(28)}  (no gradebook)`); continue; }
  const rows = parseCsv(readFileSync(csvPath, "utf8"));
  for (const term of ["prelim", "midterm"] as Term[]) {
    const { recipients, nearMiss } = collectTerm(s, rows, term);
    grandActive += recipients.length; grandNear += nearMiss;
    if (recipients.length) {
      grandClasses++;
      hubEntries.push({ course: s.course, monogram: s.monogram, title: s.title, section: s.section, term, subtitle: META[`${s.course}-${term}`]!.subtitle, count: recipients.length, slug: `${s.course}-${s.section}-${term}` });
    }
    console.log(`${(s.course + "-" + s.section).padEnd(28)}${term.padEnd(9)}${String(recipients.length).padStart(7)}${String(nearMiss).padStart(11)}`);
    if (EMIT && recipients.length) {
      mkdirSync(CONTENT_BADGES, { recursive: true });
      writeFileSync(join(CONTENT_BADGES, `${s.course}-${s.section}-${term}.md`), badgeClassMd(s, term, recipients));
      for (const r of recipients) {
        writeFileSync(join(CONTENT_BADGES, `${r.certSlug}.md`), certMd(s, term, r));
        writeFileSync(join(CONTENT_BADGES, `${r.certSlug}.ob.json`), obJson(s, term, r));
        shortlinks[r.shortId] = r.certSlug;
      }
    }
  }
}
if (EMIT) {
  mkdirSync(CONTENT_BADGES, { recursive: true });
  writeFileSync(join(CONTENT_BADGES, "shortlinks.json"), JSON.stringify(shortlinks, null, 2) + "\n");
  const hubPath = join(HERE, "..", "view", "pages", "badges", "index.html");
  writeFileSync(hubPath, hubHtml(hubEntries));
  console.log(`wrote shortlinks.json (${Object.keys(shortlinks).length} aliases) + the /badges hub (${hubEntries.length} classes)`);
}
console.log(`\ntotal: ${grandActive} badges across ${grandClasses} badge classes · ${grandNear} near-miss (in range, no graded content)`);
if (!EMIT) console.log("dry-run: nothing written. Re-run with --emit to write content/badges/.");
