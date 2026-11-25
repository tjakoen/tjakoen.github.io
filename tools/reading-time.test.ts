// tools/reading-time.test.ts — every note's declared reading time against the stated pace.
//
// The declared number feeds src/content.ts's score and the feed's "Longest" sort, so an estimate that
// drifted made a longer note rank below a shorter one. The corpus ran 102 to 421 words per minute
// before 2026-11-25; this is the check that keeps it measured rather than remembered.
import { test, expect } from "bun:test";
import { Glob } from "bun";
import { auditNote, proseWords, readingMinutes, WORDS_PER_MINUTE } from "./reading-time.ts";

test("prose words ignore frontmatter, code, markup and link URLs", () => {
  const body = [
    "---",
    "title: a title that should not count",
    "---",
    "Four honest words here.",
    "```",
    "const notProse = true;",
    "```",
    'A <a href="/x">link</a> and `inline code` and ![alt](/img.png).',
    "[Anchor text](/some/url) counts as words.",
  ].join("\n");
  // "Four honest words here." = 4; "A link and and" = 4; "Anchor text counts as words" = 5.
  expect(proseWords(body)).toBe(13);
});

test("the pace rounds up, and a one-line note is never 0 min", () => {
  expect(readingMinutes("word ".repeat(WORDS_PER_MINUTE))).toBe(1);
  expect(readingMinutes("word ".repeat(WORDS_PER_MINUTE + 1))).toBe(2);
  expect(readingMinutes("")).toBe(1);
});

test("every note in content/notes declares a time within the band", () => {
  const notes = Array.from(new Glob("content/notes/*.md").scanSync(".")).toSorted();
  const off = notes
    .map(auditNote)
    .filter((r) => r !== null && r.off)
    .map((r) => `${r!.file}: declares ~${r!.declared} min for ${r!.words} words (~${r!.measured} min at ${WORDS_PER_MINUTE} wpm)`);
  expect(off).toEqual([]);
});
