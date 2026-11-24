// portfolio/tools/skills-library.test.ts — the generated skill index and the published manifest.
//
// The page is a projection of standards/. These tests prove the projection is complete (every
// mounted skill appears exactly once), that the group cards link to the site ROUTE rather than the
// mounted name (LOOP mounts as `loop-standard` and lives at /standards/loop), and that a standard
// nobody has placed in a family still reaches the page instead of vanishing.
import { test, expect } from "bun:test";
import { readSkills, renderPage } from "./skills-library.ts";

const links = (html: string) => [...html.matchAll(/data-skill="([^"]+)"/g)].map((m) => m[1]!);

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

test("the page lists every skill exactly once, with the install line and no dead route", () => {
  const skills = readSkills();
  const html = renderPage(skills);
  const found = links(html);
  expect(found.length).toBe(skills.length);
  expect(new Set(found).size).toBe(skills.length);
  expect(html).toContain("npx skills@latest add tjakoen/skills");
  expect(html).toContain('href="/standards/loop"');      // route, not `loop-standard`
  expect(html).not.toContain('href="/standards/loop-standard"');
});

test("a skill with no family still reaches the page, in the ungrouped card", () => {
  const skills = [...readSkills(), { slug: "brand-new", route: "brand-new", title: "BRAND-NEW", summary: "x", when: "y" }];
  const html = renderPage(skills);
  expect(links(html)).toContain("brand-new");
  expect(html).toContain("New and ungrouped");
});

test("the page explains the mechanism, not just the list", () => {
  const html = renderPage(readSkills());
  expect(html).toContain("How a skill fires");
  expect(html).toContain("The line is the trigger");
  expect(html).toContain("The loop is where it fires");
  expect(html).toContain("which-skill");
  expect(html).toContain("Skills · the standards an AI loads on its own");
});
