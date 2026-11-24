// portfolio/tools/skills-library.ts — the published skill library, generated from standards/.
//
// One source, two projections:
//   --page            rewrite view/pages/skills/index.html from the standards' frontmatter
//   --page --check    exit 1 when that page is stale (the gate; run it in CI and in AUDIT.md)
//   --publish <dir>   materialise <dir>/skills/<slug>/SKILL.md + <dir>/skills.json, for the public
//                     repo tjakoen/skills. The tree is generated; nobody edits it by hand.
//
// The published repo is DISPOSABLE. standards/ is canon, this tool and PANTRY's sync are the only
// writers, and --check proves the site's copy still matches. A hand edit in either place is drift,
// which is the exact failure the library exists to show a better way of avoiding.
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseFrontmatter } from "@tjakoen/mill/core/frontmatter.ts";

const ROOT = join(import.meta.dir, "..");
const STANDARDS = join(ROOT, "standards");
const PAGE = join(ROOT, "view", "pages", "skills", "index.html");
const HOST = "portfolio.tjakoen.com";
const REPO = "tjakoen/skills";

export interface Skill {
  /** the mounted skill name: the file slug, or its `skill:` override */
  slug: string;
  /** the site route slug, which is always the filename */
  route: string;
  title: string;
  summary: string;
  when: string;
}

const oneLine = (s: string) => s.replace(/\s+/g, " ").trim();
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** PANTRY's rule: lowercase, and every run of non-alphanumerics becomes one dash. */
const normalizeSlug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** Every standard carrying a `when:` key, which is exactly what PANTRY mounts as a skill. */
export function readSkills(): Skill[] {
  const out: Skill[] = [];
  for (const file of readdirSync(STANDARDS)) {
    if (!file.endsWith(".md")) continue;
    const raw = readFileSync(join(STANDARDS, file), "utf8");
    const { data } = parseFrontmatter(raw);
    const when = typeof data.when === "string" ? oneLine(data.when) : "";
    if (!when) continue;                       // an index, not a skill
    const route = file.replace(/\.md$/, "").toLowerCase();
    const slug = normalizeSlug(typeof data.skill === "string" ? data.skill : route);
    out.push({
      slug,
      route,
      title: typeof data.title === "string" ? oneLine(data.title) : file,
      summary: typeof data.summary === "string" ? oneLine(data.summary) : "",
      when,
    });
  }
  return out.toSorted((a, b) => a.slug.localeCompare(b.slug));
}

// --- the six families -------------------------------------------------------------------------
// A group is a way into the shelf, not a taxonomy. Every skill appears in exactly one card, and a
// new standard that nobody has placed lands in a seventh card rather than disappearing.

type Group = { name: string; caption: string; best: string; skills: string[]; figure: string };

const figWayIn = `<svg viewBox="0 0 220 96" width="220" height="96" aria-hidden="true">
  <rect x="18" y="14" width="150" height="16" rx="5" fill="var(--ink)"/>
  <rect x="18" y="40" width="118" height="16" rx="5" fill="var(--ink-faint)"/>
  <rect x="18" y="66" width="86" height="16" rx="5" fill="var(--ink-faint)" opacity=".65"/>
</svg>`;

const figLoop = `<svg viewBox="0 0 220 96" width="220" height="96" aria-hidden="true">
  <circle cx="110" cy="48" r="30" fill="none" stroke="var(--color-line)" stroke-width="1.5"/>
  <circle cx="110" cy="18" r="5" fill="var(--ink)"/>
  <circle cx="140" cy="48" r="4" fill="var(--ink-faint)"/>
  <circle cx="110" cy="78" r="4" fill="var(--ink-faint)"/>
  <circle cx="80" cy="48" r="4" fill="var(--ink-faint)"/>
  <circle cx="110" cy="48" r="4" fill="var(--ink)"/>
  <path d="M132 27 L138 31" stroke="var(--ink)" stroke-width="1.5"/>
</svg>`;

const figChecks = `<svg viewBox="0 0 220 96" width="220" height="96" aria-hidden="true">
  <rect x="20" y="8" width="180" height="80" rx="8" fill="none" stroke="var(--color-line)"/>
  <text x="34" y="30" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11" fill="var(--ink-muted)">ok  hooks</text>
  <text x="34" y="46" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11" fill="var(--ink-muted)">ok  models</text>
  <text x="34" y="62" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11" fill="var(--ink-muted)">ok  freshness</text>
  <text x="34" y="80" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11" font-weight="700" fill="var(--ink)">Loaded</text>
</svg>`;

const figWriting = `<svg viewBox="0 0 220 96" width="220" height="96" aria-hidden="true">
  <text x="20" y="60" font-family="Georgia, 'Times New Roman', serif" font-size="54" fill="var(--ink)">Aa</text>
  <rect x="102" y="22" width="100" height="8" rx="3" fill="var(--ink)"/>
  <rect x="102" y="38" width="82" height="8" rx="3" fill="var(--ink-faint)"/>
  <rect x="102" y="54" width="94" height="8" rx="3" fill="var(--ink-faint)"/>
  <rect x="102" y="70" width="58" height="8" rx="3" fill="var(--ink-faint)"/>
</svg>`;

const figBuild = `<svg viewBox="0 0 220 96" width="220" height="96" aria-hidden="true">
  <rect x="26" y="12" width="78" height="32" rx="6" fill="var(--ink)"/>
  <rect x="116" y="12" width="78" height="32" rx="6" fill="none" stroke="var(--color-line)"/>
  <rect x="26" y="52" width="78" height="32" rx="6" fill="none" stroke="var(--color-line)"/>
  <rect x="116" y="52" width="78" height="32" rx="6" fill="var(--ink-faint)" opacity=".55"/>
</svg>`;

const figPrompt = `<svg viewBox="0 0 220 96" width="220" height="96" aria-hidden="true">
  <rect x="18" y="22" width="184" height="52" rx="8" fill="var(--ink)"/>
  <text x="34" y="54" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="13" fill="var(--paper)">&gt; brief</text>
  <rect x="106" y="41" width="2" height="15" fill="var(--paper)"/>
</svg>`;

const GROUPS: Group[] = [
  {
    name: "The way in",
    caption: "Start here when the library is new, or when two standards both look close.",
    best: "a cold session",
    skills: ["main-flow", "which-skill", "glossary"],
    figure: figWayIn,
  },
  {
    name: "Sessions and the loop",
    caption: "Orient, decide, work under a plan, close with evidence. The rules that run every time.",
    best: "every session",
    skills: ["session-loop", "loop-standard", "ai-development", "ai-repo-standard", "intake", "brief", "decisions"],
    figure: figLoop,
  },
  {
    name: "Quality and proof",
    caption: "The checks that make unattended work safe: the audit, conformance, hooks, the model policy.",
    best: "trusting it unattended",
    skills: ["audit-standard", "conformance", "hooks", "models", "models-verify", "graph"],
    figure: figChecks,
  },
  {
    name: "Writing",
    caption: "How anything under my byline reads, from a note to a commit message.",
    best: "anything published",
    skills: ["voice", "note-standard", "figures", "readme-standard", "commit-standard", "tour-standard"],
    figure: figWriting,
  },
  {
    name: "Design and build",
    caption: "Where files live, what a screen owes, and how a change is designed before it is typed.",
    best: "a new screen or table",
    skills: ["design-standard", "dashboard", "tree", "local-ai-standard"],
    figure: figBuild,
  },
  {
    name: "Starting and prompting",
    caption: "The first hour of a repo, and the prompt that starts it.",
    best: "a fresh repo",
    skills: ["kickstart", "claude-starter", "prompt"],
    figure: figPrompt,
  },
];

const chip = (s: Skill) => `<a class="skills-chip" data-skill="${esc(s.slug)}" href="/standards/${esc(s.route)}">${esc(s.slug)}</a>`;

/** Skills installed from someone else's repo. They run beside the library and are credited upstream.
 *
 * A committed list on purpose. `skills-lock.json` is gitignored, so CI never sees it, and a page that
 * read the lock would render one set on this machine and another on the runner. Update this list in
 * the same change that installs another third-party skill; the lock is still the local record. */
export interface ExternalSkill { source: string; names: string[] }

export const EXTERNAL_SKILLS: ExternalSkill[] = [
  { source: "addyosmani/agent-skills", names: ["doubt-driven-development", "incremental-implementation"] },
];

const groupCard = (g: Group, bySlug: Map<string, Skill>, n: number): string => {
  const members = g.skills.map((slug) => bySlug.get(slug)).filter((s): s is Skill => !!s);
  return `<article class="skills-card">
        <div class="skills-card__head"><span class="skills-num">${n}</span><h3 class="skills-card__title">${esc(g.name)}</h3></div>
        <div class="skills-figure">${g.figure}</div>
        <p class="skills-caption">${esc(g.caption)}</p>
        <p class="skills-chips">${members.map(chip).join("")}</p>
        <p class="skills-pill">Best for: ${esc(g.best)}</p>
      </article>`;
};

const STYLE = `
body[data-screen="skills"] .skills-hero { margin-bottom: 6px; }
body[data-screen="skills"] .skills-kicker { margin: 0 0 14px; font-size: 12px; letter-spacing: .3em; color: var(--color-muted); text-transform: uppercase; }
body[data-screen="skills"] .skills-head { display: grid; grid-template-columns: minmax(0,1fr) auto; align-items: end; gap: 10px 40px; }
body[data-screen="skills"] .skills-title { margin: 0; font-family: Georgia, 'Times New Roman', serif; font-weight: 400; font-size: clamp(34px, 4.6vw, 56px); line-height: 1.03; letter-spacing: -.02em; color: var(--ink); max-width: 24ch; }
body[data-screen="skills"] .skills-aside { margin: 0; font-family: Georgia, 'Times New Roman', serif; font-style: italic; font-size: clamp(20px, 2.4vw, 30px); color: var(--color-muted); }
body[data-screen="skills"] .skills-lede { max-width: 68ch; margin: 18px 0 0; font-size: 17px; line-height: 1.55; color: var(--ink-muted); }

body[data-screen="skills"] .skills-install { margin: 26px 0 8px; border: 1px solid var(--color-line); border-radius: 10px; padding: 16px 20px; background: var(--paper-2); }
body[data-screen="skills"] .skills-install__label { display: block; font-size: 11px; letter-spacing: .26em; color: var(--color-muted); margin-bottom: 8px; }
body[data-screen="skills"] .skills-install code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 15px; color: var(--ink); }
body[data-screen="skills"] .skills-install p { margin: 10px 0 0; font-size: 13px; color: var(--color-muted); }

body[data-screen="skills"] .skills-h2 { margin: 34px 0 14px; font-family: Georgia, 'Times New Roman', serif; font-weight: 400; font-size: 22px; color: var(--ink); }
body[data-screen="skills"] .skills-steps { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 16px; }
body[data-screen="skills"] .skills-step { border-top: 1px solid var(--ink); padding-top: 12px; }
body[data-screen="skills"] .skills-step h3 { margin: 6px 0 6px; font-family: Georgia, 'Times New Roman', serif; font-weight: 400; font-size: 18px; color: var(--ink); }
body[data-screen="skills"] .skills-step p { margin: 0; font-size: 14px; line-height: 1.5; color: var(--ink-muted); }
body[data-screen="skills"] .skills-num { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 50%; background: var(--ink); color: var(--paper); font-size: 13px; font-weight: 600; flex: none; }

body[data-screen="skills"] .skills-loop { margin-top: 20px; border: 1px solid var(--color-line); border-radius: 10px; padding: 14px; display: flex; align-items: stretch; gap: 8px; overflow-x: auto; background: var(--paper-2); }
body[data-screen="skills"] .skills-loop__node { flex: 1 1 0; min-width: 0; border: 1px solid var(--color-line); border-radius: 8px; padding: 9px 11px; font-size: 13px; font-weight: 600; color: var(--ink); background: var(--paper); }
body[data-screen="skills"] .skills-loop__node span { display: block; margin-top: 3px; font-size: 11px; font-weight: 400; color: var(--color-muted); }
body[data-screen="skills"] .skills-loop__node[data-hot] { background: var(--ink); color: var(--paper); border-color: var(--ink); }
body[data-screen="skills"] .skills-loop__node[data-hot] span { color: var(--paper); opacity: .75; }
body[data-screen="skills"] .skills-loop__arrow { align-self: center; color: var(--color-muted); font-size: 15px; flex: none; }
body[data-screen="skills"] .skills-note { margin: 10px 0 0; font-size: 13px; color: var(--color-muted); }

body[data-screen="skills"] .skills-grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 18px; }
body[data-screen="skills"] .skills-card { display: flex; flex-direction: column; border: 1px solid var(--color-line); border-radius: 10px; padding: 20px 20px 16px; background: var(--paper-2); min-height: 380px; }
body[data-screen="skills"] .skills-card__head { display: flex; align-items: center; gap: 12px; }
body[data-screen="skills"] .skills-card__title { margin: 0; font-family: Georgia, 'Times New Roman', serif; font-weight: 400; font-size: 23px; line-height: 1.15; color: var(--ink); }
body[data-screen="skills"] .skills-figure { height: 96px; display: flex; align-items: center; justify-content: center; margin: 14px 0 12px; }
body[data-screen="skills"] .skills-caption { margin: 0; font-size: 14px; line-height: 1.5; color: var(--ink-muted); }
body[data-screen="skills"] .skills-chips { margin: 14px 0 16px; display: flex; flex-wrap: wrap; gap: 6px; }
body[data-screen="skills"] .skills-chip { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; border: 1px solid var(--color-line); border-radius: 4px; padding: 3px 7px; color: var(--ink); text-decoration: none; }
body[data-screen="skills"] .skills-chip:hover { background: var(--ink); color: var(--paper); border-color: var(--ink); }
body[data-screen="skills"] .skills-pill { margin: auto 0 0; border: 1px solid var(--ink); border-radius: 999px; padding: 9px 12px; text-align: center; font-size: 13px; color: var(--ink); }

body[data-screen="skills"] .skills-also { border-top: 1px solid var(--ink); padding-top: 14px; margin-top: 6px; }
body[data-screen="skills"] .skills-also > p { margin: 0 0 10px; font-size: 14px; line-height: 1.5; color: var(--ink-muted); max-width: 72ch; }
body[data-screen="skills"] .skills-also__row { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 14px; }
body[data-screen="skills"] .skills-also__row a { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; color: var(--ink); }
body[data-screen="skills"] .skills-also__row code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; border: 1px solid var(--color-line); border-radius: 4px; padding: 3px 7px; color: var(--ink); }
body[data-screen="skills"] .skills-also__note { margin-top: 10px; font-style: italic; }

body[data-screen="skills"] .skills-banner { margin: 26px 0 10px; border-radius: 10px; padding: 22px 26px; background: var(--ink); color: var(--paper); }body[data-screen="skills"] .skills-banner p { margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: clamp(18px, 2.1vw, 24px); line-height: 1.25; }
body[data-screen="skills"] .skills-banner p + p { margin-top: 8px; font-family: inherit; font-size: 14px; font-style: italic; opacity: .8; }

@media (max-width: 1000px) {
  body[data-screen="skills"] .skills-grid, body[data-screen="skills"] .skills-steps { grid-template-columns: repeat(2, minmax(0,1fr)); }
  body[data-screen="skills"] .skills-head { grid-template-columns: 1fr; }
}
@media (max-width: 680px) {
  body[data-screen="skills"] .skills-grid, body[data-screen="skills"] .skills-steps { grid-template-columns: 1fr; }
  body[data-screen="skills"] .skills-card { min-height: 0; }
}
`;

/** The page, as bytes. Written by --page and compared by --check; never edited by hand. */
export function renderPage(skills = readSkills()): string {
  const bySlug = new Map(skills.map((s) => [s.slug, s]));
  const placed = new Set(GROUPS.flatMap((g) => g.skills));
  const extra = skills.filter((s) => !placed.has(s.slug));
  const cards = GROUPS.map((g, i) => groupCard(g, bySlug, i + 1));
  if (extra.length) {
    cards.push(groupCard({ name: "New and ungrouped", caption: "A standard that has not been placed in a family yet. It is mounted like the rest.", best: "the newest rule", skills: extra.map((s) => s.slug), figure: figWayIn }, bySlug, cards.length + 1));
  }

  const external = EXTERNAL_SKILLS;
  const externalSection = external.length ? `
    <h2 class="skills-h2">Installed from elsewhere</h2>
    <div class="skills-also">
      <p>These run beside the library and are not mine to publish. Each is installed from its own
        source and credited there, so the page never presents someone else's work as this canon.</p>
      ${external.map((e) => `<p class="skills-also__row"><a href="https://github.com/${esc(e.source)}" rel="noopener noreferrer">${esc(e.source)}</a><span>${e.names.map((n) => `<code>${esc(n)}</code>`).join(" ")}</span></p>`).join("")}
      <p class="skills-also__note">A small set of personal skills for work repositories stays private by design: it is neither published in the library nor listed here.</p>
    </div>` : "";

  return `<!DOCTYPE html>
<!-- GENERATED by tools/skills-library.ts from standards/ — edit the standard, not this file. -->
<html lang="en" data-themes="sourdough baguette brioche">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Skills · the standards an AI loads on its own · Tjakoen Stolk</title>
  <meta name="description" content="The skill library behind this portfolio: every standard, mounted as a skill an AI agent loads when the task matches, how a skill fires, and where it sits in the loop.">
  <style>${STYLE}</style>
</head>
<body data-screen="skills" class="app-window-backdrop">
  <div class="app-shell app-window" data-section="bread" data-rail-collapsed="false" data-surface="screen">
    <portfolio-frame />
    <main class="app-shell__main" id="main-content">
      <div class="board">

    <header class="skills-hero">
      <p class="skills-kicker">The skill library</p>
      <div class="skills-head">
        <h1 class="skills-title">Every rule I work by, in a file the agent opens on its own</h1>
        <p class="skills-aside">and where it fires</p>
      </div>
    </header>
    <p class="skills-lede">A skill is one standard plus a line saying when to read it. The line is the
      trigger; the file is the rule. ${skills.length} of them, mounted from the same canon this site
      publishes, so the library and the standards cannot disagree.</p>

    <div class="skills-install">
      <span class="skills-install__label">Install the set</span>
      <code>npx skills@latest add ${esc(REPO)}</code>
      <p>${skills.length} skills · generated from <a href="/standards">the standards</a> · one source, two projections</p>
    </div>

    <h2 class="skills-h2">How a skill fires</h2>
    <div class="skills-steps">
      <div class="skills-step"><span class="skills-num">1</span><h3>The line is the trigger</h3><p>Every skill carries a one-line <em>when</em>: read this before drafting a note, before a commit, before an audit. The agent matches the task against that line, and only then opens the file.</p></div>
      <div class="skills-step"><span class="skills-num">2</span><h3>The file is the rule</h3><p>The body holds the bar: the checks, the examples, the failure it prevents. One file, read in full, so the rule arrives with its reasons instead of a summary of them.</p></div>
      <div class="skills-step"><span class="skills-num">3</span><h3>The loop is where it fires</h3><p>A session orients, decides, plans, builds, verifies and closes. The router says which standard owns the stage; the stage says when to open it.</p></div>
    </div>

    <div class="skills-loop" role="img" aria-label="The loop: start with the checklist and freshness, orient with the main flow, work the task through the router to a standard, verify with the audit or a tour, close with a brief and a handoff. A surprise in verify returns to decide.">
      <div class="skills-loop__node">Start<span>checklist · freshness</span></div>
      <span class="skills-loop__arrow" aria-hidden="true">→</span>
      <div class="skills-loop__node">Orient<span>main-flow</span></div>
      <span class="skills-loop__arrow" aria-hidden="true">→</span>
      <div class="skills-loop__node" data-hot>Work<span>which-skill → the standard</span></div>
      <span class="skills-loop__arrow" aria-hidden="true">→</span>
      <div class="skills-loop__node">Verify<span>audit · tour</span></div>
      <span class="skills-loop__arrow" aria-hidden="true">→</span>
      <div class="skills-loop__node">Close<span>brief · handoff</span></div>
    </div>
    <p class="skills-note">A surprise in verify goes back to decide. The steps are not a waterfall; the stages are the order, and the loop is inside them.</p>

    <h2 class="skills-h2">Six families</h2>
    <div class="skills-grid">
      ${cards.join("\n      ")}
    </div>
${externalSection}

    <div class="skills-banner">
      <p>The line under the name decides whether the file is opened.</p>
      <p>Every <em>when</em> is written as a command, because that line is the only thing an agent reads before choosing. A vague one is a skill nobody opens, which is why the router exists for the tasks that fit two.</p>
    </div>

    <div class="page-foot">
      Part of <a href="/">${HOST}</a>. The rules and the reasons are in
      <a href="/standards">the standards</a>.
    </div>
      </div>
    </main>
  </div>
</body>
</html>
`;
}

/** `--publish <dir>`: the public repo's tree. Pantry does the rendering; this adds the manifest. */
function publish(target: string): void {
  const dir = resolve(target);
  mkdirSync(dir, { recursive: true });
  const sync = Bun.spawnSync(["bun", join(ROOT, "..", "pantry", "cli.ts"), "skills", "sync", ROOT, "--out", join(dir, "skills")], {
    cwd: ROOT, stdout: "inherit", stderr: "inherit",
  });
  if (sync.exitCode !== 0) throw new Error(`pantry skills sync failed (${sync.exitCode})`);
  const skills = readSkills();
  const manifest = {
    name: "tjakoen-skills",
    version: "1.0.0",
    description: "The standards Tjakoen works by, mounted as skills an agent loads when the task fits.",
    generatedFrom: "https://github.com/tjakoen/tjakoen.github.io/tree/main/standards",
    generatedBy: "tools/skills-library.ts --publish",
    skills: skills.map((s) => ({ name: s.slug, title: s.title, description: s.summary, path: `skills/${s.slug}/SKILL.md` })),
  };
  writeFileSync(join(dir, "skills.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`[skills] published ${skills.length} skills to ${join(dir, "skills")} and wrote skills.json`);
}

const args = Bun.argv.slice(2);
if (import.meta.main) {
  if (args.includes("--publish")) {
    const at = args.indexOf("--publish");
    const target = args[at + 1];
    if (!target) { console.error("usage: skills-library.ts --publish <dir>"); process.exit(2); }
    publish(target);
  } else if (args.includes("--page")) {
    const next = renderPage();
    if (args.includes("--check")) {
      const current = existsSync(PAGE) ? readFileSync(PAGE, "utf8") : "";
      if (current !== next) {
        console.error("view/pages/skills/index.html is stale: run bun tools/skills-library.ts --page");
        process.exit(1);
      }
      console.log("skills page is current");
    } else {
      mkdirSync(join(ROOT, "view", "pages", "skills"), { recursive: true });
      writeFileSync(PAGE, next, "utf8");
      console.log(`wrote view/pages/skills/index.html (${readSkills().length} skills)`);
    }
  } else {
    console.error("usage: skills-library.ts --page [--check] | --publish <dir>");
    process.exit(2);
  }
}
