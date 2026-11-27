// tools/lesson-data.ts: turns each lesson file plus its spoken script into the JSON the lesson book plays.
//   bun tools/lesson-data.ts write    write view/learn-map/lessons/<id>.json for every lesson that has a script with beats
//   bun tools/lesson-data.ts verify   fail when a JSON file is stale, or a stop names a section, a note or a quote that is not there
// A lesson is content/lessons/<id>.yml (stops, runes, trial, digest) beside content/lessons/<id>.script.md (the spoken beats).
// A beat names a section id and a quote in that section of the note. The note stays open while the recording plays and the
// quote lights up, so a quote that is gone is an error here and not a surprise on the page (plans/quest-lessons.md rule 7).
// A beat can light a figure instead of a quote. Write the target as "figure: <name>", where the name is any distinctive run of
// the figure's accessible name: the aria-label of an inline SVG, the aria-label of a figure element, or the label of a mermaid fence.
//   highlight: the-six-drawings | figure: six drawings, each answering one question
// The name is matched without regard to case or spacing and must name exactly one figure in that section, or the build fails.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { slugifyHeading } from "@tjakoen/mill/core/slug.ts";

const ROOT = join(import.meta.dir, "..");
export const LESSONS_DIR = join(ROOT, "content", "lessons");
export const NOTES_DIR = join(ROOT, "content", "notes");
export const OUT_DIR = join(ROOT, "view", "learn-map", "lessons");

export type Rune = { id: string; section: string; quote: string };
export type Beat = { section: string; quote?: string; figure?: string; text: string };
export type Stop = { title: string; note: string; from: string; to: string; beats: Beat[]; runes: Rune[]; trial: string; digest: string[] };
export type Lesson = { id: string; title: string; summary: string; audio: string; external?: string; stops: Stop[] };

/** The id MILL stamps on a heading, from MILL's own slug function so a heading with a dot or a dash in it cannot drift. */
export const slugOf = (heading: string) => slugifyHeading(heading);
const squash = (s: string) => s.split(/\s+/).filter(Boolean).join(" ");

/** The sections of a note by id, as plain text with the whitespace squashed. The text before the first heading is "intro". */
export function sectionsOf(markdown: string): Record<string, string> {
  const body = markdown.replace(/^---\n[\s\S]*?\n---\n/, "");
  const parts = body.split(/^## (.*)$/m);
  const out: Record<string, string> = { intro: squash(parts[0] ?? "") };
  for (let i = 1; i < parts.length; i += 2) out[slugOf(parts[i]!)] = squash(parts[i + 1] ?? "");
  return out;
}

/** The raw markdown of each section by id (front matter dropped), so a figure's markup is still there to read. */
export function rawSectionsOf(markdown: string): Record<string, string> {
  const body = markdown.replace(/^---\n[\s\S]*?\n---\n/, "");
  const parts = body.split(/^## (.*)$/m);
  const out: Record<string, string> = { intro: parts[0] ?? "" };
  for (let i = 1; i < parts.length; i += 2) out[slugOf(parts[i]!)] = parts[i + 1] ?? "";
  return out;
}

/** The accessible names of the figures in a section of raw markdown: svg and figure aria-labels, and mermaid fence labels. */
export function figureNamesOf(raw: string): string[] {
  const names = [...raw.matchAll(/<(?:svg|figure)\b[^>]*?\baria-label="([^"]*)"/g)].map((m) => m[1]!);
  names.push(...[...raw.matchAll(/^```mermaid\s+label="([^"]*)"/gm)].map((m) => m[1]!));
  return names.map(squash);
}

/** The beats of each stop, in order, from the spoken script. */
export function beatsOf(script: string): Beat[][] {
  const stops = script.split(/^## Stop \d+.*$/m).slice(1);
  return stops.map((body) => [...body.matchAll(/\*\*Beat \d+\*\*\s*\nhighlight: (\S+) \| ([^\n]+)\n\n([\s\S]*?)(?=\n\n\*\*(?:Beat \d+|Digest:)|\n*$)/g)].map((m): Beat => {
    const target = m[2]!.trim(), fig = /^figure:\s*(.+)$/.exec(target);
    return fig ? { section: m[1]!, figure: fig[1]!.trim(), text: m[3]!.trim() } : { section: m[1]!, quote: target, text: m[3]!.trim() };
  }));
}

/** A beat heading the parser cannot read is a beat that silently never plays, so count them against what beatsOf found. */
export function unreadBeats(script: string): string[] {
  return script.split(/^## Stop \d+.*$/m).slice(1).flatMap((body, i) => {
    const headings = (body.match(/^\*\*Beat\b[^\n]*$/gm) ?? []).length, read = beatsOf(`## Stop 1\n${body}`)[0]!.length;
    return headings === read ? [] : [`stop ${i + 1}: ${headings} beat headings but ${read} readable beats`];
  });
}

export function loadLesson(id: string): Lesson | null {
  const ymlFile = join(LESSONS_DIR, `${id}.yml`), scriptFile = join(LESSONS_DIR, `${id}.script.md`);
  if (!existsSync(ymlFile) || !existsSync(scriptFile)) return null;
  const y = Bun.YAML.parse(readFileSync(ymlFile, "utf8")) as Record<string, any>;
  const beats = beatsOf(readFileSync(scriptFile, "utf8"));
  if (!beats.some((b) => b.length)) return null;
  const unread = unreadBeats(readFileSync(scriptFile, "utf8"));
  if (unread.length) throw new Error(`${id}.script.md: ${unread.join("; ")}`);
  const stops: Stop[] = (y.stops as any[]).map((s, i) => ({
    title: String(s.title ?? ""), note: String(s.note ?? y.note ?? ""), from: String(s.from ?? ""), to: String(s.to ?? ""),
    beats: beats[i] ?? [], runes: (s.runes ?? []).map((r: any) => ({ id: String(r.id), section: String(r.section), quote: String(r.quote) })),
    trial: String(s.trial ?? ""), digest: (s.digest ?? []).map(String),
  }));
  return { id, title: String(y.title ?? id), summary: String(y.summary ?? ""), audio: String(y.audio ?? ""), ...(y.external ? { external: String(y.external) } : {}), stops };
}

/** Every complaint about a lesson: missing note, missing section, quote gone. Empty means the lesson plays. */
export function problemsOf(lesson: Lesson, readNote: (slug: string) => string | null = (s) => { try { return readFileSync(join(NOTES_DIR, `${s}.md`), "utf8"); } catch { return null; } }): string[] {
  const out: string[] = [];
  lesson.stops.forEach((st, i) => {
    const md = readNote(st.note);
    if (md === null) { out.push(`${lesson.id} stop ${i + 1}: note ${st.note} does not exist`); return; }
    const sec = sectionsOf(md);
    if (!st.title) out.push(`${lesson.id} stop ${i + 1}: no title`);
    if (!st.beats.length) out.push(`${lesson.id} stop ${i + 1}: no beats in the script`);
    for (const id of [st.from, st.to]) if (!(id in sec)) out.push(`${lesson.id} stop ${i + 1}: section ${id} is not in ${st.note}`);
    const raw = rawSectionsOf(md);
    for (const b of st.beats) {
      if (!(b.section in sec)) { out.push(`${lesson.id} stop ${i + 1}: beat section ${b.section} is not in ${st.note}`); continue; }
      if (b.figure !== undefined) {
        const want = squash(b.figure).toLowerCase(), hits = figureNamesOf(raw[b.section]!).filter((n) => want && n.toLowerCase().includes(want));
        if (hits.length === 0) out.push(`${lesson.id} stop ${i + 1}: the figure "${b.figure.slice(0, 40)}" is not in ${b.section}`);
        else if (hits.length > 1) out.push(`${lesson.id} stop ${i + 1}: the figure "${b.figure.slice(0, 40)}" names ${hits.length} figures in ${b.section}; make the name longer`);
      } else if (!sec[b.section]!.includes(squash(b.quote ?? ""))) out.push(`${lesson.id} stop ${i + 1}: the quote "${(b.quote ?? "").slice(0, 40)}" is not in ${b.section}`);
    }
    for (const r of st.runes) if (!(r.section in sec) || !sec[r.section]!.includes(squash(r.quote))) out.push(`${lesson.id} stop ${i + 1}: rune ${r.id} quote is not in ${r.section}`);
  });
  return out;
}

export const lessonIds = () => readdirSync(LESSONS_DIR).filter((f) => f.endsWith(".yml")).map((f) => f.slice(0, -4)).filter((id) => loadLesson(id));
const serialize = (l: Lesson) => JSON.stringify(l, null, 1) + "\n";

if (import.meta.main) {
  const cmd = process.argv[2] ?? "verify";
  const ids = lessonIds();
  const errors = ids.flatMap((id) => problemsOf(loadLesson(id)!));
  if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
  if (cmd === "write") {
    mkdirSync(OUT_DIR, { recursive: true });
    for (const id of ids) writeFileSync(join(OUT_DIR, `${id}.json`), serialize(loadLesson(id)!));
    console.log(`wrote ${ids.length} lessons to view/learn-map/lessons`);
  } else if (cmd === "verify") {
    const stale = ids.filter((id) => { try { return readFileSync(join(OUT_DIR, `${id}.json`), "utf8") !== serialize(loadLesson(id)!); } catch { return true; } });
    if (stale.length) { console.error(`stale lesson files: ${stale.join(", ")}. Run bun tools/lesson-data.ts write`); process.exit(1); }
    console.log(`${ids.length} lessons are current and every beat finds its quote`);
  } else { console.error("usage: bun tools/lesson-data.ts write | verify"); process.exit(2); }
}
