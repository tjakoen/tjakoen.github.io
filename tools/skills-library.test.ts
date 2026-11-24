// portfolio/tools/skills-library.test.ts — the generated skill index and the published manifest.
//
// The page and the public repo are projections of standards/. These tests prove the projection is
// complete (one card per mounted skill, none for the index files) and that the card links go to the
// site ROUTE, not the mounted name: LOOP mounts as `loop-standard` but lives at /standards/loop, and
// a link built from the skill name 404s.
import { test, expect } from "bun:test";
import { readSkills, renderPage } from "./skills-library.ts";

test("every standard with a when: is a skill, and the index files are not", () => {
  const skills = readSkills();
  const names = skills.map((s) => s.slug);
  for (const expected of ["voice", "loop-standard", "main-flow", "which-skill", "glossary", "audit-standard"]) {
    expect(names).toContain(expected);
  }
  expect(names).not.toContain("readme");        // no when:, so it is not a skill
  expect(names).not.toContain("claude");
  expect(new Set(names).size).toBe(names.length);
  for (const s of skills) {
    expect(s.when.length).toBeGreaterThan(0);
    expect(s.summary.length).toBeGreaterThan(0);
    expect(s.route.length).toBeGreaterThan(0);
  }
});

test("the page carries one card per skill and links each to its site route", () => {
  const skills = readSkills();
  const html = renderPage(skills);
  expect(html).toContain("npx skills@latest add tjakoen/skills");
  expect((html.match(/class="card"/g) ?? []).length).toBe(skills.length);
  expect(html).toContain('href="/standards/loop"');      // route, not `loop-standard`
  expect(html).toContain('href="/standards/voice"');
  expect(html).toContain('href="/standards/main-flow"');
  expect(html).not.toContain('href="/standards/loop-standard"');
});

test("a card title is the name, not the whole sentence", () => {
  const html = renderPage([{ slug: "voice", route: "voice", title: "VOICE.md: voice and tone", summary: "x", when: "y", group: "all" }]);
  expect(html).toContain(">VOICE →</h3>");
  expect(html).not.toContain("voice and tone →");
});
