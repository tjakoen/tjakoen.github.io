// portfolio/tools/reading-time.ts — one stated pace for every note's declared reading time.
//
// The declared `readingTime` is not decoration: src/content.ts reads the number into a score, and the
// feed's "Longest" sort orders by it, so an estimate that drifted by 2x made a longer note rank below
// a shorter one. Before this tool the corpus ran 102 to 421 words per minute, because each estimate
// was a habit rather than a measure.
//
// The pace is stated once, here and in NOTE-STANDARD, and the test beside this file holds every note
// to it. Words are counted the way a reader meets them: frontmatter, fenced code, inline code, link
// URLs and SVG/HTML markup are not prose, so they do not count.
//
//   bun tools/reading-time.ts            # report every note against the pace
//   bun tools/reading-time.ts --write    # rewrite each note's readingTime
//   bun tools/reading-time.ts --check    # exit 1 when any note is outside the band (CI)
import { readFileSync, writeFileSync } from "node:fs";
import { Glob } from "bun";

/** Words a reader meets in a minute of this kind of writing. Technical prose with code and figures
 *  reads slower than a novel; 220 is the corpus's own median, stated once instead of per author. */
export const WORDS_PER_MINUTE = 220;
/** How far a declared time may sit from the measured one before the check fails. Wide enough for a
 *  writer rounding up on a short note, narrow enough to catch the 2x drift this replaced. */
export const TOLERANCE = 0.2;

export function proseWords(body: string): number {
  let text = body;
  text = text.replace(/^---\n[\s\S]*?\n---\n/, " ");
  text = text.replace(/```[\s\S]*?```/g, " ");
  text = text.replace(/<svg[\s\S]*?<\/svg>/gi, " ");
  text = text.replace(/<[^>]+>/g, " ");
  text = text.replace(/`[^`]*`/g, " ");
  text = text.replace(/!\[[^\]]*\]\([^)]*\)/g, " ");
  text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
  return (text.match(/[A-Za-z0-9'’-]+/g) ?? []).length;
}

export function readingMinutes(body: string): number {
  return Math.max(1, Math.ceil(proseWords(body) / WORDS_PER_MINUTE));
}

export function declaredMinutes(frontmatter: string): number | null {
  const m = frontmatter.match(/^readingTime:\s*"?~?(\d+)\s*min"?\s*$/m);
  return m ? Number(m[1]) : null;
}

export type NoteReading = { file: string; words: number; declared: number; measured: number; off: boolean };

export function auditNote(file: string): NoteReading | null {
  const text = readFileSync(file, "utf8");
  const fm = text.match(/^---\n[\s\S]*?\n---\n/)?.[0] ?? "";
  const body = text.slice(fm.length);
  const declared = declaredMinutes(fm);
  if (declared === null) return null;
  const measured = readingMinutes(body);
  const off = Math.abs(declared - measured) / measured > TOLERANCE;
  return { file, words: proseWords(body), declared, measured, off };
}

if (import.meta.main) {
  const args = new Set(Bun.argv.slice(2));
  const notes = Array.from(new Glob("content/notes/*.md").scanSync(".")).toSorted();
  const rows = notes.map(auditNote).filter((r): r is NoteReading => r !== null);
  let changed = 0;
  for (const row of rows) {
    const flag = row.off ? "off " : "ok  ";
    console.log(`${flag}${String(row.declared).padStart(3)} -> ${String(row.measured).padStart(3)} min  ${String(row.words).padStart(5)} words  ${row.file}`);
  }
  if (args.has("--write")) {
    for (const row of rows.filter((r) => r.off)) {
      const text = readFileSync(row.file, "utf8");
      const next = text.replace(/^readingTime:.*$/m, `readingTime: "~${row.measured} min"`);
      if (next !== text) {
        writeFileSync(row.file, next);
        changed++;
      }
    }
    console.log(`\nrewrote ${changed} note(s) at ${WORDS_PER_MINUTE} words per minute`);
  }
  const off = rows.filter((r) => r.off).length;
  console.log(`${rows.length} notes, ${off} outside ${Math.round(TOLERANCE * 100)}% of ${WORDS_PER_MINUTE} wpm`);
  if (args.has("--check") && off > 0) process.exit(1);
}
