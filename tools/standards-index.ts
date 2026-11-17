// portfolio/tools/standards-index.ts — the table of contents an agent reads before it reads a standard.
//
// Retrieval by reasoning instead of by embedding: the agent reads a tree of the standards, picks the
// one section that answers its question, and loads that section's line range rather than the whole
// file. VOICE and LOOP each run past six hundred lines, and the question a session brings usually
// lives in one heading. The tree is the index; the choice is one the agent can explain.
//
//   bun run standards:index                 # regenerate standards/INDEX.json
//   bun run standards:index --check         # exit 1 if the committed index is stale
//   bun tools/standards-index.ts toc        # one line per standard
//   bun tools/standards-index.ts toc voice  # one standard's section tree, with line ranges
//   bun tools/standards-index.ts read voice#punctuation-formatting-conventions
//
// The output lives in standards/ beside the files it describes because the package already exports
// ./standards/*, which is how PANTRY resolves the standards, and because the /standards collection
// renders only .md, so a .json file there never becomes a page. The parser belongs in PANTRY in the
// long run; plans/standards-section-index.md says what moves and why it has not yet.
//
// Anchors come from MILL's slugifyHeading, the same function that stamps the id on a rendered H2 or
// H3, so a deep link built from this index cannot drift from the page. Summaries are extractive (a
// section's opening sentence), so they are only as good as the writing, and they say so in the file.

import { readFileSync, readdirSync, lstatSync, writeFileSync } from "node:fs";
import { join, basename } from "node:path";
import { parseFrontmatter } from "@tjakoen/mill/core/frontmatter.ts";
import { slugifyHeading } from "@tjakoen/mill/core/slug.ts";
import { SITE } from "../src/seo.ts";

const ROOT = join(import.meta.dir, "..");
export const STANDARDS_DIR = join(ROOT, "standards");
export const INDEX_PATH = join(STANDARDS_DIR, "INDEX.json");
const SUMMARY_MAX = 200;

// Filenames every repo has its own copy of. A bare mention of CLAUDE.md in a standard almost always
// means "the repo's CLAUDE.md", not standards/CLAUDE.md, so only an explicit link counts for these.
const GENERIC_NAMES = new Set(["CLAUDE.md", "README.md", "AGENTS.md"]);

export type Ref = { to: string; anchor?: string };

export type Section = {
  level: 2 | 3;
  heading: string;
  anchor: string;
  /** First and last line of the section in the file, 1-based and inclusive, frontmatter counted. */
  lines: [number, number];
  summary: string;
  refs: Ref[];
  children?: Section[];
};

export type StandardEntry = {
  slug: string;
  file: string;
  url: string;
  /** The skill name it mounts as, or null for the files that carry no `when` and do not mount. */
  skill: string | null;
  title: string;
  summary: string;
  when: string | null;
  lines: number;
  /** The prose before the first H2: the standard's own framing. */
  lead: { lines: [number, number]; summary: string } | null;
  sections: Section[];
  refsOut: string[];
  refsIn: string[];
};

export type StandardsIndex = {
  version: 1;
  generatedBy: string;
  howToUse: string[];
  standards: StandardEntry[];
};

export type SourceFile = { file: string; text: string };

/** Heading text as the reader sees it: link text kept, inline code and emphasis marks dropped. */
export function plainInline(md: string): string {
  return md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/<((?:https?|mailto):[^>\s]+)>/g, "$1")
    .replace(/<\/?[a-z][^>]*>/g, "")
    .replace(/(\*\*|\*)(\S(?:.*?\S)?)\1/g, "$2")
    .replace(/(?<!\w)__?(\S(?:.*?\S)?)__?(?!\w)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/** The opening sentence, extended by the next one while it is too short to tell a reader anything. */
function firstSentence(text: string): string {
  const sentence = /^(.+?[.!?])(?=\s+[A-Z*"([]|$)/;
  let s = "";
  let rest = text;
  while (rest && s.length < 30) {
    const m = sentence.exec(rest);
    const next = m ? m[1]! : rest;
    s = s ? `${s} ${next}` : next;
    rest = rest.slice(next.length).trim();
  }
  if (s.length > SUMMARY_MAX) {
    const cut = s.slice(0, SUMMARY_MAX);
    s = cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:\s]+$/, "") + "...";
  }
  return s;
}

/**
 * The opening sentence of a block of markdown. Prose wins: fences, tables, headings, comments and
 * figure placeholders are skipped, and a list item is only the fallback when no paragraph exists.
 */
export function summarize(lines: string[]): string {
  let fenced = false;
  const para: string[] = [];
  const item: string[] = [];
  let itemOpen = false;   // the previous line belonged to the first list item
  let inList = false;     // inside some list, so an indented line is item content
  let tableHead = "";
  let sawCode = false;
  const quoted: string[] = [];
  let leadIn = "";        // a paragraph ending in a colon hands its sentence to the list below it
  const leadsIntoList = () => plainInline(para[para.length - 1] ?? "").endsWith(":");
  for (const raw of lines) {
    const line = raw.trim();
    if (/^(```|~~~)/.test(line)) { fenced = !fenced; sawCode = true; if (para.length) break; itemOpen = false; continue; }
    if (fenced) continue;
    if (line === "") { if (para.length && !leadsIntoList()) break; itemOpen = false; continue; }
    if (line.startsWith("|")) {
      if (para.length) break;
      if (!tableHead) tableHead = line.split("|").map((c) => plainInline(c)).filter(Boolean).join(", ");
      continue;
    }
    if (/^(#|<!--|---$)/.test(line) || /^<\/?[a-z][a-z0-9-]*[\s>/]/.test(line)) { if (para.length) break; continue; }
    const bullet = /^(?:[-*+]|\d+[.)])\s+(?:\[[ xX]\]\s+)?(.*)$/.exec(line);
    if (bullet) {
      if (para.length && !leadsIntoList()) break;
      if (para.length) { leadIn = para.join(" "); para.length = 0; }
      inList = true;
      itemOpen = item.length === 0;
      if (itemOpen) item.push(bullet[1]!);
      continue;
    }
    // A wrapped or indented line under a list item is that item's text, not a new paragraph.
    if (itemOpen) { item.push(line); continue; }
    if (inList && /^\s/.test(raw)) continue;
    inList = false;
    const quote = /^>\s?(.*)$/.exec(line);
    if (quote) {
      if (para.length) break;
      if (!/^\*?Figure/i.test(quote[1]!) && !item.length) quoted.push(quote[1]!);
      else if (quoted.length) break;
      continue;
    }
    if (quoted.length && !para.length) break;
    // The section opened with a list: its first item is the opening, not a later paragraph.
    if (item.length && !para.length) break;
    para.push(line);
  }
  const opening = para.length ? para.join(" ") : item.length ? item.join(" ") : quoted.join(" ");
  const text = plainInline(leadIn ? `${leadIn} ${firstSentence(plainInline(opening))}` : opening);
  if (text) return firstSentence(text);
  if (tableHead) return `A table: ${tableHead}.`;
  return sawCode ? "A fenced block, quoted whole: read the section." : "";
}

/**
 * Every other standard a block of markdown points at: a Markdown link to the file or its published
 * route, with the target anchor when the link carries one, or an explicit filename such as VOICE.md.
 * Fenced code is ignored; inline code is not, because a backticked filename is still a pointer.
 */
export function findRefs(lines: string[], self: string, known: Map<string, string>): Ref[] {
  const out = new Map<string, Ref>();
  const add = (slug: string | undefined, anchor?: string) => {
    if (!slug || slug === self) return;
    const key = `${slug}#${anchor ?? ""}`;
    if (!out.has(key)) out.set(key, anchor ? { to: slug, anchor } : { to: slug });
  };
  let fenced = false;
  for (const raw of lines) {
    if (/^\s*(```|~~~)/.test(raw)) { fenced = !fenced; continue; }
    if (fenced) continue;
    const linked = new Set<string>();
    for (const m of raw.matchAll(/\]\(([^)\s]+)\)/g)) {
      const [path, anchor] = m[1]!.split("#") as [string, string | undefined];
      const slug = slugFromTarget(path, known);
      if (slug) { add(slug, anchor || undefined); linked.add(slug); }
    }
    for (const m of raw.matchAll(/(?<![\w/.-])([A-Z][A-Z0-9-]*(?:\.starter)?\.md)\b/g)) {
      const name = m[1]!;
      if (GENERIC_NAMES.has(name)) continue;
      const slug = known.get(name);
      if (slug && !linked.has(slug)) add(slug);
    }
  }
  return [...out.values()];
}

function slugFromTarget(path: string, known: Map<string, string>): string | undefined {
  if (!path) return undefined;
  const route = /(?:^|\/)standards\/([a-z0-9.-]+?)(?:\.md)?\/?$/i.exec(path);
  if (route && /^(https?:)?\/\/|^\//.test(path)) {
    const slug = route[1]!.toLowerCase();
    return [...known.values()].includes(slug) ? slug : undefined;
  }
  if (/^(https?:|mailto:)/.test(path)) return undefined;
  const name = basename(path);
  if (!/\.md$/i.test(name)) return undefined;
  // A relative link that climbs out of standards/ points at some other repo's file of that name.
  if (path.includes("../")) return undefined;
  return known.get(name);
}

/** The line where the body starts: 0 when there is no frontmatter, else the line after its fence. */
function bodyStart(lines: string[]): number {
  if (lines[0]?.trim() !== "---") return 0;
  for (let i = 1; i < lines.length; i++) if (lines[i]!.trim() === "---") return i + 1;
  return 0;
}

const trimEnd = (lines: string[], from: number, to: number): number => {
  let end = to;
  while (end > from && (lines[end]!.trim() === "" || lines[end]!.trim() === "---")) end--;
  return end;
};

const asText = (v: unknown): string =>
  Array.isArray(v) ? v.join(" ") : typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "";

/** One standard's entry, refsIn left empty for buildIndex to fill. */
export function indexStandard(src: SourceFile, known: Map<string, string>): StandardEntry {
  const slug = known.get(src.file)!;
  const lines = src.text.replace(/\r\n/g, "\n").split("\n");
  if (lines[lines.length - 1] === "") lines.pop();
  const fm = parseFrontmatter(src.text).data as Record<string, unknown>;
  const start = bodyStart(lines);

  // Heading positions, fence-aware: a ## inside a code block is quoted code, not a section, and
  // MILL renders it without an id.
  const heads: Array<{ i: number; level: 1 | 2 | 3; text: string }> = [];
  let fenced = false;
  for (let i = start; i < lines.length; i++) {
    const line = lines[i]!;
    if (/^\s*(```|~~~)/.test(line)) { fenced = !fenced; continue; }
    if (fenced) continue;
    const m = /^(#{1,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (m) heads.push({ i, level: m[1]!.length as 1 | 2 | 3, text: plainInline(m[2]!) });
  }

  const endOf = (k: number): number => {
    const level = heads[k]!.level;
    let next = lines.length;
    for (let j = k + 1; j < heads.length; j++) {
      if (heads[j]!.level <= level) { next = heads[j]!.i; break; }
    }
    return trimEnd(lines, heads[k]!.i, next - 1);
  };
  const ownBodyEnd = (k: number): number =>
    k + 1 < heads.length ? heads[k + 1]!.i - 1 : lines.length - 1;

  const sections: Section[] = [];
  const allRefs: Ref[] = [];
  for (let k = 0; k < heads.length; k++) {
    const h = heads[k]!;
    if (h.level === 1) continue;
    const end = endOf(k);
    const own = lines.slice(h.i + 1, ownBodyEnd(k) + 1);
    const section: Section = {
      level: h.level as 2 | 3,
      heading: h.text,
      anchor: slugifyHeading(h.text),
      lines: [h.i + 1, end + 1],
      summary: summarize(own),
      refs: findRefs(own, slug, known),
    };
    allRefs.push(...section.refs);
    const parent = sections[sections.length - 1];
    if (h.level === 3 && parent) (parent.children ??= []).push(section);
    else sections.push(section);
  }
  // An H2 that opens straight into its H3s has no sentence of its own; borrow its first child's.
  for (const s of sections) if (!s.summary && s.children?.[0]) s.summary = s.children[0].summary;

  const firstH2 = heads.find((h) => h.level >= 2);
  const h1 = heads.find((h) => h.level === 1);
  const leadFrom = h1 ? h1.i + 1 : start;
  const leadTo = (firstH2 ? firstH2.i : lines.length) - 1;
  const leadLines = lines.slice(leadFrom, leadTo + 1);
  const leadSummary = summarize(leadLines);
  allRefs.push(...findRefs(leadLines, slug, known));
  const leadEnd = trimEnd(lines, leadFrom, leadTo);
  const lead = leadSummary ? { lines: [leadFrom + 1, leadEnd + 1] as [number, number], summary: leadSummary } : null;

  const when = asText(fm.when) || null;
  const skill = when ? (asText(fm.skill) || slug) : null;
  return {
    slug,
    file: `standards/${src.file}`,
    url: `${SITE.origin}/standards/${slug}`,
    skill,
    title: asText(fm.title) || (h1?.text ?? src.file),
    summary: asText(fm.summary),
    when,
    lines: lines.length,
    lead,
    sections,
    refsOut: [...new Set(allRefs.map((r) => r.to))].toSorted(),
    refsIn: [],
  };
}

export const HOW_TO_USE = [
  "Pick the standard from its summary and when, without opening any file.",
  "Inside it, pick the section from the heading and summary of each entry in sections and children.",
  "Read only that section's line range from file. Load the whole file only when the task is the whole standard.",
  "Follow refs to another standard's section the same way, by anchor, instead of loading the neighbour whole.",
  "Summaries are each section's opening sentence, not a paraphrase: a thin one means read the section.",
];

/** The whole index, built from in-memory files so the test can feed fixtures. */
export function buildIndex(files: SourceFile[]): StandardsIndex {
  const sorted = files.toSorted((a, b) => a.file.localeCompare(b.file));
  const known = new Map(sorted.map((f) => [f.file, basename(f.file, ".md").toLowerCase()]));
  const standards = sorted.map((f) => indexStandard(f, known));
  const bySlug = new Map(standards.map((s) => [s.slug, s]));
  for (const s of standards) for (const to of s.refsOut) bySlug.get(to)?.refsIn.push(s.slug);
  for (const s of standards) s.refsIn = s.refsIn.toSorted();
  return {
    version: 1,
    generatedBy: "bun run standards:index (tools/standards-index.ts); edit the standards, never this file",
    howToUse: HOW_TO_USE,
    standards,
  };
}

/** The real standards: every .md in standards/ that is a file, not a symlinked alias. */
export function readStandards(dir = STANDARDS_DIR): SourceFile[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !lstatSync(join(dir, f)).isSymbolicLink())
    .map((file) => ({ file, text: readFileSync(join(dir, file), "utf8") }));
}

export const render = (index: StandardsIndex): string => JSON.stringify(index, null, 2) + "\n";

// ---- the drill-down CLI ---------------------------------------------------------------------------

function loadIndex(): StandardsIndex {
  return JSON.parse(readFileSync(INDEX_PATH, "utf8")) as StandardsIndex;
}

function find(index: StandardsIndex, slug: string): StandardEntry {
  const s = index.standards.find((e) => e.slug === slug.toLowerCase() || e.skill === slug.toLowerCase());
  if (!s) throw new Error(`no standard "${slug}"; run toc for the list`);
  return s;
}

function toc(index: StandardsIndex, slug?: string): string {
  if (!slug) {
    return index.standards
      .map((s) => `${s.slug.padEnd(18)} ${String(s.lines).padStart(4)} lines  ${s.summary}`)
      .join("\n");
  }
  const s = find(index, slug);
  const row = (x: Section, pad: string) =>
    `${pad}${x.lines[0]}-${x.lines[1]}  #${x.anchor}  ${x.heading}\n${pad}    ${x.summary}`;
  const out = [`${s.file} (${s.lines} lines)  ${s.url}`, `when: ${s.when ?? "(not a mounted skill)"}`];
  if (s.lead) out.push(`${s.lead.lines[0]}-${s.lead.lines[1]}  (lead)\n    ${s.lead.summary}`);
  for (const x of s.sections) {
    out.push(row(x, ""));
    for (const c of x.children ?? []) out.push(row(c, "  "));
  }
  if (s.refsOut.length) out.push(`points at: ${s.refsOut.join(", ")}`);
  if (s.refsIn.length) out.push(`pointed at by: ${s.refsIn.join(", ")}`);
  return out.join("\n");
}

function read(index: StandardsIndex, target: string): string {
  const [slug, anchor] = target.split("#") as [string, string | undefined];
  const s = find(index, slug);
  const text = readFileSync(join(ROOT, s.file), "utf8").split("\n");
  if (!anchor) return text.join("\n");
  const all = s.sections.flatMap((x) => [x, ...(x.children ?? [])]);
  const hit = all.find((x) => x.anchor === anchor);
  if (!hit) throw new Error(`no section #${anchor} in ${s.slug}; run toc ${s.slug}`);
  return `${s.file}:${hit.lines[0]}-${hit.lines[1]}\n` + text.slice(hit.lines[0] - 1, hit.lines[1]).join("\n");
}

if (import.meta.main) {
  const [cmd, arg] = process.argv.slice(2);
  try {
    if (cmd === "toc") console.log(toc(loadIndex(), arg));
    else if (cmd === "read" && arg) console.log(read(loadIndex(), arg));
    else {
      const fresh = render(buildIndex(readStandards()));
      if (cmd === "--check") {
        let current = "";
        try { current = readFileSync(INDEX_PATH, "utf8"); } catch {}
        if (current !== fresh) {
          console.error("standards/INDEX.json is stale: run bun run standards:index");
          process.exit(1);
        }
        console.log("standards/INDEX.json is current");
      } else {
        writeFileSync(INDEX_PATH, fresh);
        const n = JSON.parse(fresh) as StandardsIndex;
        const count = n.standards.reduce((a, s) => a + s.sections.reduce((b, x) => b + 1 + (x.children?.length ?? 0), 0), 0);
        console.log(`wrote standards/INDEX.json: ${n.standards.length} standards, ${count} sections`);
      }
    }
  } catch (e) {
    console.error((e as Error).message);
    process.exit(1);
  }
}
