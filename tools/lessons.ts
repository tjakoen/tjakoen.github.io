// tools/lessons.ts: cuts a note into stops and the stops into lessons, by the rules in plans/quest-lessons.md ("Where a note is cut").
//   bun tools/lessons.ts cuts [slug]   print the stops and lessons the rules produce, with word counts
//   bun tools/lessons.ts draft         write a draft lesson file per lesson to content/lessons, never over a file that exists
//   bun tools/lessons.ts verify        fail when a lesson names a section id its note no longer has
// The unit is the H2 section, addressed by MILL's own slug. A stop never splits a section. The draft carries the structure and the word
// counts; the stop titles, runes, trials, digests and scripts are written by a person.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { slugifyHeading } from "@tjakoen/mill/core/slug.ts";
import { buildIndex, loadNote, loadRegions, NOTES_DIR } from "./quests.ts";

export type Section = { id: string; title: string; words: number };
export type Stop = { from: string; to: string; titleFrom: string; titleTo: string; words: number; reference: boolean };
type Cut = { note: string; stage: number; stops: Stop[] };
export type Lesson = { id: string; notes: Cut[]; stops: number; words: number };

export const LESSONS_DIR = join(import.meta.dir, "..", "content", "lessons");
const MAX = 1500, MIN = 600, TAIL = 500, ALWAYS_SPLIT = 1200;
const SOURCES = /^(the )?(sources|references|what i read to get here)$/i;
const countWords = (text: string) => text.replace(/```[\s\S]*?```/g, " ").replace(/<[^>]+>/g, " ").replace(/\]\([^)]*\)/g, "] ").split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;

/** The sections of a note body: the text before the first H2 is "intro", then one section per H2, sources left out. */
export function sectionsOf(text: string): Section[] {
  const body = text.replace(/^---\n[\s\S]*?\n---\n?/, "");
  const out: { id: string; title: string; lines: string[] }[] = [{ id: "intro", title: "intro", lines: [] }];
  let fence = false;
  for (const line of body.split("\n")) {
    if (line.startsWith("```")) fence = !fence;
    const h = !fence && /^## (.+)$/.exec(line);
    if (h) out.push({ id: slugifyHeading(h[1]!), title: h[1]!.trim(), lines: [] });
    else out.at(-1)!.lines.push(line);
  }
  return out.filter((s) => !SOURCES.test(s.title)).map((s) => ({ id: s.id, title: s.title, words: countWords(s.lines.join("\n")) })).filter((s) => s.words > 0);
}

/** Packs sections into stops. A stop closes once it reaches 600 words and never passes 1,500, and a section is never split. A section over
 *  1,500 words stands alone as a reference stop. A tail under 500 words folds into the stop before it unless that would pass 1,500. A note of
 *  1,200 words or more always gets at least two stops, and that wins over the tail rule. */
export function cutStops(sections: Section[]): Stop[] {
  const groups: Section[][] = [];
  let cur: Section[] = [];
  const sum = (g: Section[]) => g.reduce((t, s) => t + s.words, 0);
  const flush = () => { if (cur.length) groups.push(cur); cur = []; };
  for (const s of sections) {
    if (s.words > MAX) { flush(); groups.push([s]); continue; }
    if (cur.length && sum(cur) + s.words > MAX) flush();
    cur.push(s);
    if (sum(cur) >= MIN) flush();
  }
  flush();
  const total = groups.reduce((t, g) => t + sum(g), 0);
  const last = groups.at(-1), before = groups.at(-2);
  if (last && before && sum(last) < TAIL && sum(before) + sum(last) <= MAX && !(groups.length === 2 && total >= ALWAYS_SPLIT)) groups.splice(-2, 2, [...before, ...last]);
  if (groups.length === 1 && total >= ALWAYS_SPLIT && groups[0]!.length > 1) {
    const all = groups[0]!; const half = total / 2; let acc = 0, at = 1;
    for (let i = 0; i < all.length - 1; i++) { acc += all[i]!.words; at = i + 1; if (acc >= half) break; }
    groups.splice(0, 1, all.slice(0, at), all.slice(at));
  }
  return groups.map((g) => ({ from: g[0]!.id, to: g.at(-1)!.id, titleFrom: g[0]!.title, titleTo: g.at(-1)!.title, words: sum(g), reference: g.length === 1 && g[0]!.words > MAX }));
}

/** Lessons hold three to six stops. More than six is cut into lessons of near equal size at a stop boundary. Fewer than three joins the next note
 *  of its stage when the lesson stays at six or fewer, else the lesson before it in the stage, and otherwise stands alone as a short lesson. */
export function groupLessons(notes: Cut[]): Lesson[] {
  const lessons: Lesson[] = [];
  const make = (id: string, parts: Cut[]): Lesson => ({ id, notes: parts, stops: parts.reduce((t, p) => t + p.stops.length, 0), words: parts.reduce((t, p) => t + p.stops.reduce((a, s) => a + s.words, 0), 0) });
  for (let i = 0; i < notes.length; i++) {
    const n = notes[i]!;
    if (n.stops.length > 6) {
      const parts = Math.ceil(n.stops.length / 6), size = Math.ceil(n.stops.length / parts);
      for (let p = 0; p < parts; p++) lessons.push(make(`${n.note}-${p + 1}`, [{ ...n, stops: n.stops.slice(p * size, (p + 1) * size) }]));
    } else if (n.stops.length < 3 && notes[i + 1]?.stage === n.stage && n.stops.length + notes[i + 1]!.stops.length <= 6) {
      lessons.push(make(n.note, [n, notes[i + 1]!])); i++;
    } else if (n.stops.length < 3 && lessons.at(-1)?.notes.at(-1)?.stage === n.stage && lessons.at(-1)!.stops + n.stops.length <= 6) {
      const prev = lessons.pop()!; lessons.push(make(prev.id, [...prev.notes, n]));
    } else lessons.push(make(n.note, [n]));
  }
  return lessons;
}

/** Every lesson for the notes on the path, in path order. */
export function proposeAll(): Lesson[] {
  const { quests } = buildIndex(loadRegions(), loadNote);
  const cuts = quests.map((q) => ({ note: q.id, stage: q.region, stops: cutStops(sectionsOf(readFileSync(join(NOTES_DIR, `${q.id}.md`), "utf8"))) }));
  return groupLessons(cuts);
}

const yamlOf = (l: Lesson) => [
  `id: ${l.id}`, `note: ${l.notes[0]!.note}`, "title: ", "summary: ", `audio: /media/lessons/${l.id}.m4a`, "stops:",
  ...l.notes.flatMap((p) => p.stops.map((s) => [`  - title: ""`, `    note: ${p.note}`, `    from: ${s.from}`, `    to: ${s.to}`, `    words: ${s.words}`, ...(s.reference ? ["    reference: true"] : []), "    runes: []", `    trial: ""`, "    digest: []"].join("\n"))),
].join("\n") + "\n";

if (import.meta.main) {
  const [cmd = "cuts", arg] = process.argv.slice(2);
  const lessons = proposeAll();
  if (cmd === "cuts") {
    for (const l of lessons.filter((x) => !arg || x.notes.some((p) => p.note === arg))) {
      console.log(`${l.id}: ${l.stops} stops, ${l.words.toLocaleString()} words${l.notes.length > 1 ? ` (joins ${l.notes.map((p) => p.note).join(" + ")})` : ""}`);
      for (const p of l.notes) for (const s of p.stops) console.log(`  ${s.from === "intro" ? "intro" : s.titleFrom}${s.from === s.to ? "" : ` to ${s.titleTo}`} (${s.words} words${s.reference ? ", reference" : ""})`);
    }
    console.log(`${lessons.length} lessons, ${lessons.reduce((t, l) => t + l.stops, 0)} stops`);
  } else if (cmd === "draft") {
    mkdirSync(LESSONS_DIR, { recursive: true });
    for (const l of lessons) { const f = join(LESSONS_DIR, `${l.id}.yml`); if (existsSync(f)) { console.log(`kept ${l.id}`); continue; } writeFileSync(f, yamlOf(l)); console.log(`drafted ${l.id}`); }
  } else if (cmd === "verify") {
    const errors: string[] = [];
    for (const f of existsSync(LESSONS_DIR) ? readdirSync(LESSONS_DIR).filter((x) => x.endsWith(".yml")) : []) {
      const lesson = Bun.YAML.parse(readFileSync(join(LESSONS_DIR, f), "utf8")) as { stops: { note: string; from: string; to: string }[] };
      for (const s of lesson.stops.filter((x) => x.note)) {
        const ids = new Set(sectionsOf(readFileSync(join(NOTES_DIR, `${s.note}.md`), "utf8")).map((x) => x.id));
        for (const id of [s.from, s.to]) if (!ids.has(id)) errors.push(`${f}: ${s.note} has no section ${id}`);
      }
    }
    if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
    console.log("every lesson section resolves");
  } else { console.error("usage: bun tools/lessons.ts cuts [slug] | draft | verify"); process.exit(2); }
}
