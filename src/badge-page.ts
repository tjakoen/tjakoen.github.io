// portfolio/src/badge-page.ts — the awarded-badge pages: medallion art, criteria, roster, share.
//
// Split out of content.ts, which had grown past two thousand lines holding collections, rendering,
// feeds, calendar entries and these badge templates at once. Nothing here reads a collection or a
// route: it takes a badge's frontmatter and returns markup, so it is a page renderer, not content
// plumbing. The public API is re-exported from content.ts so existing callers do not move.
import { escapeHtml } from "@tjakoen/mill/core/engine.ts";
import { join } from "node:path";
import { readFileSync } from "node:fs";
import { SITE } from "./seo.ts";
import { parsePhotos } from "./photos.ts";
import { renderShareBlock } from "./share.ts";

// ---- course badges -----------------------------------------------------------
// The badge medallion, drawn from GRAIN tokens (no hardcoded hex — the audit catches those). The
// course sets the monogram; the term sets the ring (prelim = soft, midterm = solid) and the label.
// Wrap a short title into <= maxLines lines of about `perLine` chars, on word boundaries. SVG has no
// auto-wrap, so the badge title is split here and emitted as stacked <tspan>s.
function wrapTitle(s: string, perLine = 16, maxLines = 3): string[] {
  const words = s.trim().split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if (cur && (cur + " " + w).length > perLine) { lines.push(cur); cur = w; }
    else cur = cur ? cur + " " + w : w;
  }
  if (cur) lines.push(cur);
  return lines.slice(0, maxLines);
}

// Full course name per course key, for the medallion's top line. The badge is issued for a named
// course, not a course code, so the card carries the name a reader recognises.
export const BADGE_COURSE_NAMES: Record<string, string> = {
  apsi: "Application and System Integration",
  adet: "Application Development and Emerging Technologies",
  introweb: "Basic Programming in Web Development",
};

// What each badge attests, and the technologies it exercises, keyed by course and term. One source
// for both surfaces: the criteria (class) page and every recipient's cert page render the same words,
// so a student's badge states its own criteria inline rather than only linking out to them.
export const BADGE_CRITERIA: Record<string, Record<string, {
  attests: string; skills: string[]; covers: string[]; technologies: string;
}>> = {
  apsi: {
    prelim: {
      attests: "Holders built and deployed a working front end, writing the JavaScript behind it and composing it as React components with their own state.",
      skills: [
        "Write modern JavaScript: values, functions, arrays and objects, and asynchronous code",
        "Compose a user interface from reusable React components",
        "Manage component state and side effects, and pass data through props",
        "Build a front end and deploy it to a cloud host",
      ],
      covers: ["Modules 1 to 3 of Application and System Integration", "Course outcomes CO1 to CO3"],
      technologies: "JavaScript, React, component state and effects, a frontend build and a cloud deploy.",
    },
    midterm: {
      attests: "Holders built and deployed a working backend service: an HTTP API over a relational database they designed themselves.",
      skills: [
        "Model relational data and write SQL against PostgreSQL",
        "Build a REST API with Node and Express, with routes, and handlers",
        "Connect an API to a database and return real query results",
        "Deploy a backend service to a cloud host",
      ],
      covers: ["Modules 4 to 5 of Application and System Integration", "Course outcomes CO1 to CO3"],
      technologies: "Node, Express, REST APIs, PostgreSQL data modelling and a cloud deploy.",
    },
  },
  adet: {
    prelim: {
      attests: "Holders built an interactive mobile interface in Flutter, writing the Dart behind it with object-oriented structure.",
      skills: [
        "Write Dart: types, collections, classes and object-oriented structure",
        "Compose a mobile interface from Flutter widgets",
        "Lay out screens with rows, columns and constraints that adapt to the device",
        "Hold and update state so the interface responds to input",
      ],
      covers: ["Modules 1 to 3 of Application Development and Emerging Technologies"],
      technologies: "Dart, object-oriented programming, Flutter widgets, layout and state.",
    },
    midterm: {
      attests: "Holders built a multi-screen Flutter application: navigation between screens, forms that take input, and lists that open into detail views.",
      skills: [
        "Navigate between screens and pass data along the route",
        "Build forms that capture and validate user input",
        "Render scrolling lists from data and open each item into a detail screen",
        "Structure an application across several screens and shared state",
      ],
      covers: ["Modules 4 to 5 of Application Development and Emerging Technologies"],
      technologies: "Flutter navigation, forms, lists and detail screens, and multi-screen app structure.",
    },
  },
  introweb: {
    prelim: {
      attests: "Holders built responsive web pages from scratch: semantic HTML structure styled with modern CSS layout that adapts to any screen.",
      skills: [
        "Structure a page with semantic HTML that follows web standards",
        "Style a page with CSS: the box model, typography and colour",
        "Lay out a page with CSS grid and flexbox",
        "Make a layout responsive, with a clear visual hierarchy on any screen size",
      ],
      covers: ["Modules 1 to 5 of Basic Programming in Web Development", "Course outcomes CO1 and CO2"],
      technologies: "HTML semantics, CSS grid and flexbox, and responsive layout.",
    },
    midterm: {
      attests: "Holders made their pages interactive with client-side JavaScript, and deployed them to the live web.",
      skills: [
        "Write client-side JavaScript to drive page behaviour",
        "Read and change the DOM in response to program logic",
        "Handle browser events from user interaction",
        "Deploy an interactive page to the live web",
      ],
      covers: ["Modules 6 to 8 of Basic Programming in Web Development"],
      technologies: "JavaScript, DOM manipulation, browser events and deploying interactive pages.",
    },
  },
};

// The subject mark at the badge's crest, drawn per course rather than a generic star, so the badge
// says something about the craft before a word is read. Centred on (150, 46), about 30px tall.
//   apsi     — a browser window joined to a database cylinder: an app wired front to back
//   adet     — a phone handset with a play-arrow: a mobile app
//   introweb — an angle bracket pair around a slash: markup and the web
function badgeCourseIcon(course: string | undefined, hue: string): string {
  const s = `style="stroke:${hue}" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"`;
  if (course === "adet") {
    return `<g ${s}>
      <rect x="138" y="30" width="24" height="34" rx="4"/>
      <line x1="145" y1="36" x2="155" y2="36"/>
      <path d="M146 50 l9 -5 -9 -5 z" style="fill:${hue};stroke:${hue}"/>
    </g>`;
  }
  if (course === "introweb") {
    return `<g ${s}>
      <path d="M140 36 l-9 10 9 10"/>
      <path d="M160 36 l9 10 -9 10"/>
      <line x1="154" y1="32" x2="146" y2="60"/>
    </g>`;
  }
  // apsi (and the fallback): a window over a database
  return `<g ${s}>
    <rect x="131" y="28" width="26" height="20" rx="3"/>
    <line x1="131" y1="34" x2="157" y2="34"/>
    <ellipse cx="160" cy="49" rx="9" ry="3.4"/>
    <path d="M151 49 v9 a9 3.4 0 0 0 18 0 v-9"/>
  </g>`;
}

// The badge, as a self-describing certification card (like Credly / Lumify): the course it belongs to
// on top, the curriculum skill it certifies in the centre, and the issuer at the foot — an instructor
// awarding it, with the school named as affiliation, NOT as the issuing body. Shared so the image tool
// rasters the EXACT same art headless. All colours come in as CSS values and are emitted via style= (a
// var() resolves in a style declaration but NOT in a bare SVG presentation attribute), so the page
// passes custom-property refs (--badge-hue etc.) and the image tool passes hex literals.
export function badgeMedallionSvg(opts: {
  courseName: string; subtitle: string; year: string; issuerName?: string; recipient?: string;
  course?: string;   // course key (apsi/adet/introweb) — picks the subject icon
  hue: string; ink?: string; muted?: string; paper?: string; font?: string; size?: number;
}): string {
  const ink = opts.ink ?? "var(--ink)", muted = opts.muted ?? "var(--ink-muted)";
  const paper = opts.paper ?? "var(--paper)", font = opts.font ?? "var(--font-accent)";
  const serif = "Georgia, 'Times New Roman', serif", size = opts.size ?? 300;
  const issuerName = escapeHtml(opts.issuerName ?? "Tjakoen Stolk");
  // Course name across the top, up to two lines, settled around y84.
  const courseLines = wrapTitle(opts.courseName, 26, 2).map(escapeHtml);
  const courseY = 84 - (courseLines.length - 1) * 7;
  const course = courseLines.map((l, i) =>
    `<tspan x="150" y="${courseY + i * 14}">${l}</tspan>`).join("");
  // The certified skill as the headline, up to three lines, settled around y165. A title that will
  // not fit three lines of 16 rewraps at 19, because the three-line cap drops the overflow silently:
  // "Builds Full-Stack JavaScript and AI" lost its last word that way. Titles that already fit keep
  // their old breaks.
  const titleLines = (wrapTitle(opts.subtitle, 16, 4).length > 3
    ? wrapTitle(opts.subtitle, 19, 3) : wrapTitle(opts.subtitle, 16, 3)).map(escapeHtml);
  const titleY = 165 - (titleLines.length - 1) * 14;
  const title = titleLines.map((l, i) =>
    `<tspan x="150" y="${titleY + i * 28}">${l}</tspan>`).join("");
  return `<svg viewBox="0 0 300 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeHtml(opts.courseName)} badge: ${escapeHtml(opts.subtitle)}, issued by ${issuerName}, ${escapeHtml(opts.year)}" width="${size}" height="${Math.round(size * 340 / 300)}">
    <rect x="8" y="8" width="284" height="324" rx="26" style="fill:${paper};stroke:${opts.hue}" stroke-width="6"/>
    <rect x="19" y="19" width="262" height="302" rx="17" fill="none" style="stroke:${opts.hue}" stroke-width="1" opacity="0.35"/>
    ${badgeCourseIcon(opts.course, opts.hue)}
    <text text-anchor="middle" font-family="${serif}" font-size="10.5" letter-spacing="1.5" style="fill:${muted}">${course}</text>
    <text text-anchor="middle" font-family="${serif}" font-size="22" style="fill:${ink}">${title}</text>
    ${opts.recipient ? `<text x="150" y="212" text-anchor="middle" font-family="${serif}" font-size="9" letter-spacing="3" style="fill:${muted}">AWARDED TO</text>
    <text x="150" y="234" text-anchor="middle" font-family="${serif}" font-size="17" style="fill:${ink}">${escapeHtml(opts.recipient)}</text>` : ""}
    <line x1="70" y1="248" x2="230" y2="248" style="stroke:${muted}" stroke-width="1" opacity="0.3"/>
    <text x="150" y="273" text-anchor="middle" font-family="${font}" font-size="15" font-weight="700" style="fill:${opts.hue}">${issuerName}</text>
    <text x="150" y="291" text-anchor="middle" font-family="${serif}" font-size="8.5" letter-spacing="1.2" style="fill:${muted}">INSTRUCTOR &#183; HOLY ANGEL UNIVERSITY</text>
    <text x="150" y="306" text-anchor="middle" font-family="${serif}" font-size="8" letter-spacing="1.2" style="fill:${muted}">SCHOOL OF COMPUTING &#183; ${escapeHtml(opts.year)}</text>
  </svg>`;
}

function renderBadgeArt(courseKey: unknown, term: unknown, subtitle: unknown, year: string, issuerName: string, recipient?: unknown): string {
  const key = String(courseKey || "course");
  const courseName = BADGE_COURSE_NAMES[key] || String(courseKey || "");
  // On the page the hue is --badge-hue (set per course by BADGE_STYLE via data-course); every colour is
  // already emitted through style=, so the custom property resolves without post-processing.
  const svg = badgeMedallionSvg({
    courseName, subtitle: String(subtitle || ""), year, issuerName, course: key,
    recipient: recipient ? String(recipient) : undefined,
    hue: "var(--badge-hue)", ink: "var(--ink)", muted: "var(--ink-muted)", paper: "var(--paper)", font: "var(--font-accent)", size: 220,
  });
  return `<figure class="badge-art" data-course="${escapeHtml(key)}" data-term="${escapeHtml(String(term || ""))}">
  ${svg}
</figure>`;
}

function renderIssuer(frontmatter: Record<string, unknown>): string {
  const issuer = escapeHtml(String(frontmatter.issuer || "Tjakoen Stolk"));
  const role = escapeHtml(String(frontmatter.issuerRole || ""));
  return `<p class="badge-issuer"><span class="badge-issuer__name">${issuer}</span>${role ? `<span class="badge-issuer__role">${role}</span>` : ""}<a class="badge-issuer__link" href="/teaching">About the issuer</a></p>`;
}

// What the badge attests plus its technologies, inline on the page. Drawn from BADGE_CRITERIA by
// course and term so every recipient's cert states its own criteria without a click-through. Renders
// nothing for a course/term the map does not cover.
// What the recipient built, as GRAIN's gallery molecule wired to the lightbox. Screenshots use the
// same flat "src | WxH | alt" encoding as event photos. showcaseOptOut: true hides them without
// deleting the files, so a student's removal request is one frontmatter line.
function renderBadgeShowcase(frontmatter: Record<string, unknown>): string {
  if (frontmatter.type !== "cert" || String(frontmatter.showcaseOptOut) === "true") return "";
  const shots = parsePhotos(frontmatter.showcase);
  if (!shots.length) return "";
  const items = shots.map((p) => {
    const src = escapeHtml(p.src);
    const dims = p.width && p.height ? ` width="${escapeHtml(p.width)}" height="${escapeHtml(p.height)}"` : "";
    const alt = escapeHtml(p.alt);
    return `<figure class="gallery__item">
      <a class="gallery__link" data-lightbox href="${src}"><img src="${src}"${dims} alt="${alt}" loading="lazy" decoding="async"></a>
      <figcaption class="gallery__caption">${alt}</figcaption>
    </figure>`;
  }).join("");
  // Phone captures are tall, desktop ones wide: crop the whole grid to the first shot's orientation.
  const first = shots[0];
  const tall = Number(first.height) > Number(first.width);
  const style = tall ? "--gallery-ratio: 9 / 16; --gallery-min: 11rem;" : "--gallery-ratio: 16 / 10;";
  return `<section class="badge-criteria badge-showcase" data-surface="badge:showcase"><h3 class="badge-criteria__heading">What they built</h3><div class="gallery" data-lightbox-group style="${style}">${items}</div></section>`;
}

function renderBadgeActivities(frontmatter: Record<string, unknown>): string {
  let activities: unknown;
  try { activities = JSON.parse(String(frontmatter.activitiesJson || "[]")); } catch { return ""; }
  if (!Array.isArray(activities) || !activities.length) return "";
  const rows = activities.flatMap(activity => {
    if (!activity || typeof activity.id !== "string" || typeof activity.title !== "string" || typeof activity.description !== "string") return [];
    const links = frontmatter.type === "cert" && Array.isArray(activity.publicEvidence) ? activity.publicEvidence.flatMap((e: {url?:unknown;commit?:unknown}) => {
      try {
        const url = new URL(String(e.url)), parts = decodeURIComponent(url.pathname).split("/").filter(Boolean);
        if (url.protocol !== "https:" || url.hostname !== "github.com" || url.username || url.password || url.search || url.hash || parts.length < 2 || /^hau-/i.test(parts[0]!) || /^student-/i.test(parts[1]!)) return [];
        return [`<a href="${escapeHtml(url.href)}" target="_blank" rel="noopener noreferrer">View public work${typeof e.commit === "string" && /^[a-f0-9]{40}$/i.test(e.commit) ? ` at ${escapeHtml(e.commit.slice(0,7))}` : ""}</a>`];
      } catch { return []; }
    }).join(" · ") : "";
    return [`<li><strong>${escapeHtml(activity.title)}</strong> <span>(${escapeHtml(activity.id)})</span><p>${escapeHtml(activity.description)}</p>${links ? `<p>${links}</p>` : ""}</li>`];
  }).join("");
  const threshold = Number(frontmatter.thresholdPercent);
  return `<section class="badge-criteria" data-surface="badge:activities"><h3 class="badge-criteria__heading">${frontmatter.type === "cert" ? "Activities completed" : "Activities recognized"}</h3>${threshold === 75 ? `<p class="badge-criteria__lede">Award threshold: 75%, after instructor review.</p>` : ""}<ul class="badge-criteria__list">${rows}</ul></section>`;
}

function renderBadgeCriteria(frontmatter: Record<string, unknown>): string {
  if (!frontmatter.awardKey && !frontmatter.criteriaText) return `<section class="badge-criteria" data-surface="badge:criteria"><h3 class="badge-criteria__heading">Historical award</h3><p>This historical award used the earlier participation rule and is awaiting eligibility reconciliation. It does not certify the new activity-based threshold.</p></section>`;
  if (typeof frontmatter.criteriaText === "string") return `<section class="badge-criteria" data-surface="badge:criteria"><h3 class="badge-criteria__heading">Award criteria</h3><p class="badge-criteria__lede">${escapeHtml(frontmatter.criteriaText)}</p></section>`;
  const c = BADGE_CRITERIA[String(frontmatter.course || "")]?.[String(frontmatter.term || "")];
  if (!c) return "";
  const skills = c.skills.map((s) => `<li>${escapeHtml(s)}</li>`).join("");
  const covers = c.covers.map((s) => `<li>${escapeHtml(s)}</li>`).join("");
  return `<section class="badge-criteria">
    <h3 class="badge-criteria__heading">What this badge attests</h3>
    <p class="badge-criteria__lede">${escapeHtml(c.attests)}</p>
    <h3 class="badge-criteria__heading">What the holder can do</h3>
    <ul class="badge-criteria__list">${skills}</ul>
    <h3 class="badge-criteria__heading">What it covers</h3>
    <ul class="badge-criteria__list">${covers}</ul>
    <h3 class="badge-criteria__heading">Technologies</h3>
    <p class="badge-criteria__tech">${escapeHtml(c.technologies)}</p>
  </section>`;
}

// Bespoke styling for the badge templates. Site surface, not a reusable GRAIN component, so it rides
// with the markup like renderShareBlock's script does. Tokens only, except the per-course hue, which
// is course DATA (content/data/course-hues.json) rather than a token: an unknown course falls back to
// the site accent, so the medallion stays monochrome unless a course has claimed a colour.
const COURSE_HUES: Record<string, string> = (() => {
  try {
    const raw = JSON.parse(readFileSync(join(import.meta.dir, "..", "content", "data", "course-hues.json"), "utf8")) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(raw).filter(([k, v]) => !k.startsWith("//") && typeof v === "string"),
    ) as Record<string, string>;
  } catch {
    return {};                                  // no data file: every course stays on the site accent
  }
})();
const COURSE_HUE_RULES = Object.entries(COURSE_HUES)
  .map(([course, hue]) => `.badge-art[data-course="${course}"] { --badge-hue: ${hue}; }`)
  .join("\n");
const BADGE_STYLE = `<style>
/* Per-course hue. Scoped to the medallion so it cannot leak into the rest of the page. */
.badge-art { --badge-hue: var(--color-accent); }
${COURSE_HUE_RULES}
.badge-cert, .badge-class { margin: var(--space-6) 0; }
.badge-criteria { margin: var(--space-6) 0; }
.badge-criteria__heading { margin: var(--space-4) 0 0.35em; }
.badge-cert__head, .badge-class__head { display: flex; gap: var(--space-6); align-items: center; flex-wrap: wrap; }
.badge-art svg { display: block; }
.badge-cert__awarded { color: var(--ink-muted); margin: 0; }
.badge-cert__name, .badge-class__name { margin: 0.15em 0; font-size: var(--text-xl); }
.badge-issuer { display: flex; flex-direction: column; margin: 0.5em 0; }
.badge-issuer__name { font-weight: 700; }
.badge-issuer__role { color: var(--ink-muted); font-size: var(--text-sm); }
.badge-verify { display: grid; grid-template-columns: max-content 1fr; gap: 0.35em 1em; margin: var(--space-6) 0; }
.badge-verify dt { color: var(--ink-muted); }
.badge-verify dd { margin: 0; }
.badge-roster { width: 100%; border-collapse: collapse; margin: var(--space-4) 0; }
.badge-roster th, .badge-roster td { text-align: left; padding: 0.5em 0.75em; border-bottom: var(--border); }
.badge-roster th { color: var(--ink-muted); font-size: var(--text-sm); }
.badge-subtitle { font-size: var(--text-lg); margin: 0.15em 0; }
.badge-actions { display: flex; gap: 0.6em; flex-wrap: wrap; margin: var(--space-4) 0; }
.badge-btn { display: inline-block; padding: 0.5em 1em; border: var(--border); border-radius: 6px; background: var(--color-surface); color: var(--ink); font: inherit; cursor: pointer; text-decoration: none; }
.badge-btn:hover { border-color: var(--badge-hue, var(--color-accent)); }
.badge-copy-fallback { display: grid; gap: 0.35em; max-width: 100%; margin: var(--space-2) 0; color: var(--ink-muted); font-size: var(--text-sm); }
.badge-copy-fallback[hidden] { display: none; }
.badge-copy-fallback input { box-sizing: border-box; width: min(100%, 32rem); min-width: 0; }
/* The criteria block: what the badge attests, as scannable bullets rather than a wall of prose. */
.badge-criteria { margin: var(--space-6) 0; padding-top: var(--space-4); border-top: var(--border); }
.badge-criteria__heading { font-size: var(--text-sm); letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-muted); margin: 1.4em 0 0.5em; }
.badge-criteria__heading:first-child { margin-top: 0; }
.badge-criteria__lede { font-size: var(--text-lg); margin: 0; }
.badge-criteria__list { margin: 0; padding-left: 1.2em; }
.badge-criteria__list li { margin: 0.3em 0; }
.badge-criteria__tech { color: var(--ink-muted); margin: 0; }
.badge-design-sections__list { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--color-line); }
.badge-design-sections__row { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 0.25em 1em; padding: 0.6em 0; border-bottom: 1px solid var(--color-line); }
.badge-design-sections__count { color: var(--color-muted); font-family: var(--font-mono); font-size: var(--text-sm); }
.badge-design-sections__criteria { flex-basis: 100%; margin: 0; color: var(--color-muted); font-size: var(--text-sm); }
</style>`;

// The /badges entry template: a CERT page (one recipient's verifiable award) or a badge-CLASS page
// (the roster). Both open with the medallion and the issuer; they diverge below.
export function renderBadgeEntry(frontmatter: Record<string, unknown>, slug: string): string {
  const type = String(frontmatter.type || "");
  const legacy = !frontmatter.awardKey && !frontmatter.criteriaText;
  const issuerName = String(frontmatter.issuer || "Tjakoen Stolk");
  const year = (String(frontmatter.year || frontmatter.issuedOn || "").slice(0, 4)) || String(new Date().getFullYear());
  const art = renderBadgeArt(frontmatter.course, frontmatter.term, frontmatter.subtitle, year, issuerName);
  const issuer = renderIssuer(frontmatter);
  const badgeName = escapeHtml(String(frontmatter.badgeName || frontmatter.title || ""));

  // The badge name now IS the skill, so a subtitle line identical to it would just repeat; show it
  // only when it says something the name does not.
  const subtitle = frontmatter.subtitle && String(frontmatter.subtitle) !== String(frontmatter.badgeName || "")
    ? `<p class="badge-subtitle">${escapeHtml(String(frontmatter.subtitle))}</p>` : "";

  if (type === "cert") {
    const name = escapeHtml(String(frontmatter.recipientName || ""));
    const handle = String(frontmatter.recipientHandle || "");
    // The cert badge bakes the recipient's name into the medallion itself (the criteria/class page's
    // art stays generic, no name); recomputed here so only the cert carries PII in the image.
    const certArt = renderBadgeArt(frontmatter.course, frontmatter.term, frontmatter.subtitle, year, issuerName, frontmatter.recipientName);
    const issuedOn = escapeHtml(String(frontmatter.issuedOn || ""));
    const certId = escapeHtml(String(frontmatter.certId || ""));
    const criteria = escapeHtml(String(frontmatter.criteriaUrl || "/badges"));
    const fullUrl = `${SITE.origin}/badges/${slug}`;
    // The share URL is the short alias when the generator minted one, else the full cert URL.
    const shareUrl = frontmatter.shortUrl ? `${SITE.origin}${String(frontmatter.shortUrl)}` : fullUrl;
    const pngHref = `/media/badges/${escapeHtml(slug)}.png`;
    const share = renderShareBlock(frontmatter.social, shareUrl);
    return `${BADGE_STYLE}<section class="badge-cert" data-surface="badge:certificate">
  <header class="badge-cert__head">${certArt}
    <div class="badge-cert__meta">
      <p class="badge-cert__awarded">This certifies that</p>
      <h1 class="badge-cert__name">${name}</h1>
      <p class="badge-cert__earned">earned the <strong>${badgeName}</strong> badge${handle ? ` · <a href="https://github.com/${escapeHtml(handle)}">@${escapeHtml(handle)}</a>` : ""}</p>
      ${subtitle}
      ${issuer}
    </div>
  </header>
  <p class="badge-actions">
    <a class="badge-btn" href="${pngHref}" download>${legacy ? "Download historical badge (PNG)" : "Download badge (PNG)"}</a>
    <button class="badge-btn" type="button" data-copy-url="${escapeHtml(shareUrl)}" aria-live="polite">Copy share link</button>
    <a class="badge-btn" href="/badges">All badge criteria</a>
  </p>
  <label class="badge-copy-fallback" data-copy-fallback hidden>
    <span>Clipboard access failed. Copy this link manually.</span>
    <input type="text" readonly value="${escapeHtml(shareUrl)}">
  </label>
  <dl class="badge-verify">
    <dt>Issued</dt><dd>${issuedOn}</dd>
    <dt>Credential id</dt><dd>${certId}</dd>
    <dt>Criteria</dt><dd><a href="${criteria}">Criteria page</a></dd>
    <dt>Verification</dt><dd><a href="/badges/${escapeHtml(slug)}.json">${legacy ? "Legacy award metadata" : "Open Badges assertion"}</a></dd>
  </dl>
  ${renderBadgeCriteria(frontmatter)}
  ${renderBadgeActivities(frontmatter)}
  ${renderBadgeShowcase(frontmatter)}
  ${share}
  ${BADGE_COPY_SCRIPT}
</section>`;
  }

  // badge-design: the badge itself, across every class section that awarded it. One design is shared
  // by all sections of a course, so this is the page the hub links to; each section row leads on to
  // that section's criteria page. Like badge-class it shows counts only, never a name.
  if (type === "badge-design") {
    let sections: { section: string; slug: string; count: number; criteria: string }[] = [];
    try { sections = JSON.parse(String(frontmatter.sectionsJson || "[]")); } catch { sections = []; }
    const total = Number(frontmatter.recipientCount) || sections.reduce((n, s) => n + Number(s.count || 0), 0);
    const shared = typeof frontmatter.criteriaText === "string";
    const rows = sections.map((s) => `<li class="badge-design-sections__row"><a href="/badges/${escapeHtml(s.slug)}">Section ${escapeHtml(s.section)}</a><span class="badge-design-sections__count">${Number(s.count)} recipient${Number(s.count) === 1 ? "" : "s"}</span>${shared ? "" : `<p class="badge-design-sections__criteria">${escapeHtml(s.criteria)}</p>`}</li>`).join("");
    return `${BADGE_STYLE}<section class="badge-class badge-design-page" data-surface="badge:design">
  <header class="badge-class__head">${art}
    <div class="badge-class__meta">
      <h1 class="badge-class__name">${badgeName}</h1>
      ${subtitle}
      ${issuer}
      <p class="badge-class__count">Awarded to ${total} recipient${total === 1 ? "" : "s"} across ${sections.length} class section${sections.length === 1 ? "" : "s"}.</p>
    </div>
  </header>
  <p class="badge-actions"><a class="badge-btn" href="/badges">All badges</a></p>
  ${shared ? renderBadgeCriteria(frontmatter) : `<section class="badge-criteria" data-surface="badge:criteria"><h3 class="badge-criteria__heading">Award criteria</h3><p class="badge-criteria__lede">Awarded after instructor review at 75% or better on each required activity. The required activity differed between sections, so each section below states its own.</p></section>`}
  <section class="badge-criteria badge-design-sections" data-surface="badge:sections">
    <h3 class="badge-criteria__heading">Sections</h3>
    <ul class="badge-design-sections__list">${rows}</ul>
  </section>
  ${shared && frontmatter.activitiesJson ? renderBadgeActivities(frontmatter) : ""}
</section>`;
  }

  // badge-class: the CRITERIA page. It is the issuer surface a cert links to for "what this badge
  // attests" — deliberately NOT a roster. Recipient names are PII and live only on each recipient's
  // own direct-link cert page, never aggregated into a listing a crawler could enumerate. The count is
  // the only recipient fact shown here, and it names no one.
  // The design page this section's badge belongs to, when the course and term name one.
  const designHref = frontmatter.course && ["prelim", "midterm", "finals"].includes(String(frontmatter.term))
    ? `/badges/${escapeHtml(String(frontmatter.course))}-${escapeHtml(String(frontmatter.term))}` : "";
  const count = frontmatter.recipientCount !== undefined && Number.isInteger(Number(frontmatter.recipientCount)) ? Number(frontmatter.recipientCount) : Array.isArray(frontmatter.recipients) ? frontmatter.recipients.length : 0;
  return `${BADGE_STYLE}<section class="badge-class" data-surface="badge:class">
  <header class="badge-class__head">${art}
    <div class="badge-class__meta">
      <h1 class="badge-class__name">${badgeName}</h1>
      ${subtitle}
      ${issuer}
      <p class="badge-class__count">Awarded to ${count} recipient${count === 1 ? "" : "s"}.</p>
    </div>
  </header>
  <p class="badge-actions">${designHref ? `<a class="badge-btn" href="${designHref}">See this badge across all sections</a>` : ""}<a class="badge-btn" href="/badges">All badge criteria</a></p>
  ${legacy ? renderBadgeCriteria(frontmatter) : ""}
  ${legacy ? "" : renderBadgeActivities(frontmatter)}
</section>`;
}

// Copy-link behaviour for the cert action button. One handler, delegated, so every cert page's button
// works without per-page script. Mirrors the share-block copy affordance.
const BADGE_COPY_SCRIPT = `<script>
  (function () {
    var btn = document.querySelector('[data-copy-url]');
    if (!btn) return;
    var fallback = document.querySelector('[data-copy-fallback]');
    var fallbackField = fallback && fallback.querySelector('input');
    var label = btn.textContent || 'Copy share link';
    var resetTimer;
    function legacyCopy(value) {
      var field = document.createElement('textarea');
      field.value = value;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      var copied = false;
      try { copied = document.execCommand('copy'); } catch (_) { copied = false; }
      field.remove();
      return copied;
    }
    function showResult(text, state) {
      btn.textContent = text;
      btn.dataset.copyState = state;
      if (fallback) fallback.hidden = state !== 'failed';
      clearTimeout(resetTimer);
      if (state === 'copied') resetTimer = setTimeout(function () {
        btn.textContent = label;
        delete btn.dataset.copyState;
      }, 1600);
    }
    btn.addEventListener('click', async function () {
      var value = btn.getAttribute('data-copy-url') || '';
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          try { await navigator.clipboard.writeText(value); }
          catch (_) { if (!legacyCopy(value)) throw new Error('Clipboard write failed'); }
        } else if (!legacyCopy(value)) {
          throw new Error('Clipboard is unavailable');
        }
        showResult('Copied', 'copied');
      } catch (_) {
        showResult('Copy failed', 'failed');
        if (fallbackField) {
          fallbackField.focus();
          fallbackField.select();
        }
      }
    });
  })();
</script>`;
