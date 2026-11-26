// tools/quests.ts: the quest layer of the learning map (plans/quest-map.md, "Adding a note adds a quest").
//   bun tools/quests.ts check [slug]   place one note, or every published note, and print the outcome
//   bun tools/quests.ts propose        propose a region where five or more unplaced notes share a tag
//   bun tools/quests.ts write          regenerate content/quests/index.json
//   bun tools/quests.ts verify         fail when the index is stale, or a region lists a draft or a missing note
// The regions are hand approved in content/quests/regions.json. The index is generated from them and from each note's own
// frontmatter, so nothing is typed per note. A draft never becomes a quest, and a region that lists one is an error.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export type Region = { n: number; id: string; name: string; landmark: string; notes: string[]; external?: { id: string; title: string; url: string }[] };
export type Note = { slug: string; title: string; status: string; level?: string; audience?: string[]; tags?: string[]; sources?: string[]; readingTime?: string };
export type Quest = { id: string; region: number; title: string; level: string; audience: string[]; minutes: number; tags: string[]; sources: string[] };
export type Placement =
  | { outcome: "fits"; region: Region; position: number }
  | { outcome: "fits-nothing"; tags: string[] }
  | { outcome: "cannot-place"; missing: string[] }
  | { outcome: "draft" };

const ROOT = join(import.meta.dir, "..");
export const NOTES_DIR = join(ROOT, "content", "notes");
export const REGIONS_FILE = join(ROOT, "content", "quests", "regions.json");
export const INDEX_FILE = join(ROOT, "content", "quests", "index.json");
const LEVELS = ["intro", "intermediate", "deep"];
// Every published note carries this tag, so it says nothing about where a note belongs.
export const GENERIC_TAG = "ai";
// Five unplaced notes that share a tag are enough to propose a region for a person to approve.
export const REGION_THRESHOLD = 5;

/** Reads the frontmatter block of a note. The values are YAML, which Bun parses. */
export function readNote(slug: string, text: string): Note {
  const m = /^---\n([\s\S]*?)\n---/.exec(text);
  if (!m) return { slug, title: slug, status: "" };
  const fm = Bun.YAML.parse(m[1]!) as Record<string, unknown>;
  const list = (v: unknown) => (Array.isArray(v) ? v.map(String) : undefined);
  return {
    slug, title: String(fm.title ?? slug), status: String(fm.status ?? ""), level: fm.level ? String(fm.level) : undefined,
    audience: list(fm.audience), tags: list(fm.tags), sources: list(fm.sources), readingTime: fm.readingTime ? String(fm.readingTime) : undefined,
  };
}

/** Where a note goes: an existing region, nowhere yet, or nowhere because it is unfinished. Drafts are never placed. */
export function placeNote(note: Note, regions: Region[]): Placement {
  if (note.status !== "PUBLISHED") return { outcome: "draft" };
  const missing: string[] = [];
  if (!note.level || !LEVELS.includes(note.level)) missing.push("level");
  if (!note.audience?.length) missing.push("audience");
  if (!note.tags?.some((t) => t !== GENERIC_TAG)) missing.push(`a tag besides ${GENERIC_TAG}`);
  if (!note.readingTime) missing.push("readingTime");
  if (missing.length) return { outcome: "cannot-place", missing };
  for (const region of regions) {
    const position = region.notes.indexOf(note.slug);
    if (position >= 0) return { outcome: "fits", region, position };
  }
  return { outcome: "fits-nothing", tags: note.tags! };
}

export type Proposal = { tag: string; name: string; notes: string[] };

/** Groups the published notes no region lists by their first tag after the generic one. A group of five or more is proposed as a
 *  region. The name is the tag in capitals and the landmark is left for the person approving it, so the tool never invents art. */
export function proposeRegions(notes: Note[], regions: Region[]): Proposal[] {
  const groups = new Map<string, string[]>();
  for (const note of notes) {
    const placed = placeNote(note, regions);
    if (placed.outcome !== "fits-nothing") continue;
    const tag = placed.tags.find((t) => t !== GENERIC_TAG)!;
    groups.set(tag, [...(groups.get(tag) ?? []), note.slug]);
  }
  return [...groups]
    .filter(([, slugs]) => slugs.length >= REGION_THRESHOLD)
    .map(([tag, slugs]) => ({ tag, name: tag.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase()), notes: slugs.toSorted() }))
    .toSorted((a, b) => b.notes.length - a.notes.length || a.tag.localeCompare(b.tag));
}

/** "~12 min" is 12. */
export const minutesOf = (readingTime: string) => Number(/\d+/.exec(readingTime)?.[0] ?? 0);

export function loadRegions(): Region[] {
  return (JSON.parse(readFileSync(REGIONS_FILE, "utf8")) as { regions: Region[] }).regions;
}
export function loadNote(slug: string): Note | null {
  try { return readNote(slug, readFileSync(join(NOTES_DIR, `${slug}.md`), "utf8")); } catch { return null; }
}

/** The quests in region order, then the order the region lists them. Anything that cannot be a quest is an error, not a skip. */
export function buildIndex(regions: Region[], load: (slug: string) => Note | null): { quests: Quest[]; errors: string[] } {
  const quests: Quest[] = [];
  const errors: string[] = [];
  for (const region of regions) {
    for (const slug of region.notes) {
      const note = load(slug);
      if (!note) { errors.push(`${region.id} lists ${slug}, which is not a note`); continue; }
      const placed = placeNote(note, regions);
      if (placed.outcome === "draft") { errors.push(`${region.id} lists ${slug}, which is not published (${note.status || "no status"}): a draft never becomes a quest`); continue; }
      if (placed.outcome === "cannot-place") { errors.push(`${slug} cannot be placed, it is missing ${placed.missing.join(", ")}`); continue; }
      quests.push({ id: slug, region: region.n, title: note.title, level: note.level!, audience: note.audience!, minutes: minutesOf(note.readingTime!), tags: note.tags!, sources: note.sources ?? [] });
    }
  }
  return { quests, errors };
}

const serialize = (quests: Quest[]) => JSON.stringify({ generated: "bun tools/quests.ts write", quests }, null, 2) + "\n";

if (import.meta.main) {
  const [cmd = "check", arg] = process.argv.slice(2);
  const regions = loadRegions();
  if (cmd === "check") {
    const slugs = arg ? [arg] : readdirSync(NOTES_DIR).filter((f) => f.endsWith(".md")).map((f) => f.slice(0, -3));
    for (const slug of slugs) {
      const note = loadNote(slug);
      if (!note) { console.error(`${slug}: not a note`); process.exitCode = 1; continue; }
      const p = placeNote(note, regions);
      if (p.outcome === "draft" && !arg) continue;
      console.log(p.outcome === "fits" ? `${slug}: fits ${p.region.name}, quest ${p.position + 1} of its route`
        : p.outcome === "fits-nothing" ? `${slug}: fits no region yet (tags: ${p.tags.join(", ")})`
        : p.outcome === "cannot-place" ? `${slug}: cannot be placed, missing ${p.missing.join(", ")}` : `${slug}: a draft, never a quest`);
    }
  } else if (cmd === "propose") {
    const notes = readdirSync(NOTES_DIR).filter((f) => f.endsWith(".md")).map((f) => loadNote(f.slice(0, -3))!).filter(Boolean);
    const found = proposeRegions(notes, regions);
    if (!found.length) console.log(`no region to propose: no tag is shared by ${REGION_THRESHOLD} or more unplaced notes`);
    for (const p of found) console.log(`propose a region for the tag ${p.tag} (${p.notes.length} notes): ${p.notes.join(", ")}\n  name: ${p.name}, landmark: to be chosen by a person`);
  } else if (cmd === "write" || cmd === "verify") {
    const { quests, errors } = buildIndex(regions, loadNote);
    if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
    const next = serialize(quests);
    if (cmd === "write") { writeFileSync(INDEX_FILE, next); console.log(`wrote ${quests.length} quests to content/quests/index.json`); }
    else {
      let have = ""; try { have = readFileSync(INDEX_FILE, "utf8"); } catch { /* missing */ }
      if (have !== next) { console.error("content/quests/index.json is stale: run bun tools/quests.ts write"); process.exit(1); }
      console.log(`index is current, ${quests.length} quests`);
    }
  } else { console.error("usage: bun tools/quests.ts check [slug] | propose | write | verify"); process.exit(2); }
}
