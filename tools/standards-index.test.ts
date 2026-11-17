// portfolio/tools/standards-index.test.ts — the standards tree, seen on fixtures and on the real folder.
//
// Two kinds of test. The fixture tests pin the parser: what counts as a section, where it ends, what
// its summary is, and which links count as a pointer to another standard. Each one sits beside its
// opposite case, so a parser that returned everything, or nothing, fails. The last tests read the
// real standards/ folder: every anchor must be the id MILL will stamp on the page, every line range
// must start on its own heading, and the committed index must equal a fresh build. That last one is
// the folder's rule that a standard and its index change in the same commit, made into a gate.
import { test, expect, describe } from "bun:test";
import { readFileSync } from "node:fs";
import { slugifyHeading } from "@tjakoen/mill/core/slug.ts";
import {
  buildIndex, findRefs, summarize, plainInline, readStandards, render, INDEX_PATH,
  type Section,
} from "./standards-index.ts";

const ALPHA = `---
title: ALPHA.md — the first fixture
summary: A fixture standard.
when: >
  Read this BEFORE testing.
---

# Alpha

The lead paragraph says what alpha is. It has a second sentence.

## First \`section\` here

Opening sentence of the first section. More text that is not the summary.

See [beta](BETA.md#the-rule) and the [published beta](https://portfolio.tjakoen.com/standards/beta).

### A child

- The first item is the summary
  when it wraps.
- The second item is not.

\`\`\`md
## Not a heading, quoted code
\`\`\`

## Second

| Column one | Column two |
|---|---|
| a | b |

## Third

Mentions GAMMA.md by name, a repo's own CLAUDE.md, and [a stranger](../other/BETA.md).
`;

const BETA = `---
title: BETA.md
summary: The second fixture.
when: Read this too.
skill: beta-standard
---

# Beta

## The rule

> *Figure: a placeholder that is not a summary.*

The real opening sentence.
`;

const GAMMA = `---
title: GAMMA.md
summary: No when, so it does not mount.
---

# Gamma

Body only, no sections. Points at [alpha](ALPHA.md).
`;

const fixture = () =>
  buildIndex([
    { file: "GAMMA.md", text: GAMMA },
    { file: "ALPHA.md", text: ALPHA },
    { file: "BETA.md", text: BETA },
  ]);

const flat = (sections: Section[]): Section[] => sections.flatMap((s) => [s, ...(s.children ?? [])]);

describe("the tree", () => {
  const alpha = fixture().standards.find((s) => s.slug === "alpha")!;

  test("standards are sorted by file and carry their published URL", () => {
    expect(fixture().standards.map((s) => s.slug)).toEqual(["alpha", "beta", "gamma"]);
    expect(alpha.url).toBe("https://portfolio.tjakoen.com/standards/alpha");
    expect(alpha.file).toBe("standards/ALPHA.md");
  });

  test("H2s are sections, H3s nest under them, and a ## inside a fence is not a heading", () => {
    expect(alpha.sections.map((s) => s.heading)).toEqual(["First section here", "Second", "Third"]);
    expect(alpha.sections[0]!.children!.map((s) => s.heading)).toEqual(["A child"]);
    expect(flat(alpha.sections).some((s) => s.heading.includes("Not a heading"))).toBe(false);
  });

  test("anchors are MILL's slug of the visible heading text", () => {
    expect(alpha.sections[0]!.anchor).toBe("first-section-here");
    expect(alpha.sections[0]!.anchor).toBe(slugifyHeading("First section here"));
  });

  test("an H2's range runs over its H3s and stops before the next H2", () => {
    const lines = ALPHA.split("\n");
    const [first, second] = alpha.sections as [Section, Section];
    expect(lines[first.lines[0] - 1]).toBe("## First `section` here");
    expect(lines[first.lines[1] - 1]).toBe("```");
    expect(first.lines[1]).toBeLessThan(second.lines[0]);
    const child = first.children![0]!;
    expect(child.lines[0]).toBeGreaterThan(first.lines[0]);
    expect(child.lines[1]).toBe(first.lines[1]);
  });

  test("the lead is the prose between the title and the first section", () => {
    expect(alpha.lead!.summary).toBe("The lead paragraph says what alpha is.");
    expect(fixture().standards.find((s) => s.slug === "beta")!.lead).toBeNull();
  });

  test("skill follows when: the slug by default, the skill key when set, null with no when", () => {
    const [a, b, g] = fixture().standards;
    expect([a!.skill, b!.skill, g!.skill]).toEqual(["alpha", "beta-standard", null]);
    expect(g!.when).toBeNull();
    expect(a!.when).toBe("Read this BEFORE testing.");
  });
});

describe("summaries", () => {
  const alpha = fixture().standards.find((s) => s.slug === "alpha")!;

  test("a paragraph gives its first sentence, not the next one", () => {
    expect(alpha.sections[0]!.summary).toBe("Opening sentence of the first section.");
  });

  test("a list gives its first item, with its wrapped line, and not the second item", () => {
    expect(alpha.sections[0]!.children![0]!.summary).toBe("The first item is the summary when it wraps.");
  });

  test("a table with no prose names its columns rather than going blank", () => {
    expect(alpha.sections[1]!.summary).toBe("A table: Column one, Column two.");
  });

  test("a figure placeholder is skipped; the prose after it is the summary", () => {
    const beta = fixture().standards.find((s) => s.slug === "beta")!;
    expect(beta.sections[0]!.summary).toBe("The real opening sentence.");
  });

  test("a colon hands the sentence on to the list it introduces", () => {
    expect(summarize(["Two tiers:", "", "- Memory is private.", "- Docs are shared."]))
      .toBe("Two tiers: Memory is private.");
  });

  test("a too-short opening borrows the next sentence; a long one is cut at a word", () => {
    expect(summarize(["Small repo? One file is enough here."])).toBe("Small repo? One file is enough here.");
    const long = summarize([`${"word ".repeat(80)}end.`]);
    expect(long.endsWith("...")).toBe(true);
    expect(long.length).toBeLessThanOrEqual(203);
  });

  test("inline markup is reduced to what a reader sees", () => {
    expect(plainInline("**Bold** and *it* with `code`, a [link](x.md) and <https://a.b/c>"))
      .toBe("Bold and it with code, a link and https://a.b/c");
  });
});

describe("cross-references", () => {
  const known = new Map([["ALPHA.md", "alpha"], ["BETA.md", "beta"], ["GAMMA.md", "gamma"], ["CLAUDE.md", "claude"]]);

  test("a relative link and a published route both count, with the anchor kept", () => {
    expect(findRefs(["[b](BETA.md#the-rule) and [b](https://portfolio.tjakoen.com/standards/beta)"], "alpha", known))
      .toEqual([{ to: "beta", anchor: "the-rule" }, { to: "beta" }]);
  });

  test("a bare filename counts, but a generic one and a link out of the folder do not", () => {
    expect(findRefs(["GAMMA.md, a CLAUDE.md, and [x](../other/BETA.md)"], "alpha", known))
      .toEqual([{ to: "gamma" }]);
  });

  test("a self-reference and a link inside a fence are not refs", () => {
    expect(findRefs(["see ALPHA.md", "```", "BETA.md", "```"], "alpha", known)).toEqual([]);
  });

  test("refsIn is the mirror of refsOut", () => {
    const idx = fixture();
    const by = (s: string) => idx.standards.find((e) => e.slug === s)!;
    expect(by("alpha").refsOut).toEqual(["beta", "gamma"]);
    expect(by("beta").refsIn).toEqual(["alpha"]);
    expect(by("alpha").refsIn).toEqual(["gamma"]);
    expect(by("beta").refsOut).toEqual([]);
  });
});

describe("the real standards folder", () => {
  const files = readStandards();
  const index = buildIndex(files);

  test("the AGENTS.md alias is skipped, the same as the rendered collection skips it", () => {
    expect(files.some((f) => f.file === "AGENTS.md")).toBe(false);
    expect(index.standards.some((s) => s.slug === "claude")).toBe(true);
  });

  test("every section's range starts on its own heading and its anchor is that heading's id", () => {
    for (const s of index.standards) {
      const lines = readFileSync(s.file, "utf8").split("\n");
      for (const x of flat(s.sections)) {
        const head = lines[x.lines[0] - 1]!;
        expect(head.startsWith("#".repeat(x.level) + " ")).toBe(true);
        expect(x.anchor).toBe(slugifyHeading(plainInline(head.replace(/^#+\s+/, ""))));
        expect(x.lines[1]).toBeGreaterThanOrEqual(x.lines[0]);
      }
    }
  });

  test("every ref and anchor points at something that exists", () => {
    const anchors = new Map(index.standards.map((s) => [s.slug, new Set(flat(s.sections).map((x) => x.anchor))]));
    const missing: string[] = [];
    for (const s of index.standards) {
      for (const x of flat(s.sections)) {
        for (const r of x.refs) {
          if (!anchors.has(r.to)) missing.push(`${s.slug}#${x.anchor} -> ${r.to}`);
          else if (r.anchor && !anchors.get(r.to)!.has(r.anchor)) missing.push(`${s.slug}#${x.anchor} -> ${r.to}#${r.anchor}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  test("every mounted standard has a summary on every section", () => {
    const blank = index.standards.flatMap((s) => flat(s.sections).filter((x) => !x.summary).map((x) => `${s.slug}#${x.anchor}`));
    expect(blank).toEqual([]);
  });

  test("the committed standards/INDEX.json is current (run bun run standards:index if not)", () => {
    expect(readFileSync(INDEX_PATH, "utf8")).toBe(render(index));
  });
});
