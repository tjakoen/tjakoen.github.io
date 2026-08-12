// portfolio/component-refs.test.ts — the preflight's own tests, plus the live assertion that every
// component this site's templates reference actually exists. That last one is the gate: it is what
// turns "the atoms are not published yet" from a hollow page into a red test.
import { describe, expect, test } from "bun:test";
import { componentRefs, strippedForScan, findMissingComponents, missingReport } from "./component-refs.ts";
import { config } from "./config.ts";
import { join } from "node:path";

describe("componentRefs", () => {
  test("finds hyphenated tags and ignores plain HTML", () => {
    const html = `<div><b-field each="fields"></b-field><input><welcome-recent /></div>`;
    expect(componentRefs(html)).toEqual(["b-field", "welcome-recent"]);
  });

  test("deduplicates a tag used many times", () => {
    expect(componentRefs(`<b-icon sym="a"><b-icon sym="b">`)).toEqual(["b-icon"]);
  });

  test("a commented-out tag is not a dependency", () => {
    expect(componentRefs(`<!-- <b-gone></b-gone> --><b-here>`)).toEqual(["b-here"]);
  });

  test("a usage example inside pre or code is not a dependency", () => {
    // the builder page prints the very tag that renders its form; that is documentation, not a use
    expect(componentRefs(`<pre>&lt;b-field&gt;</pre><code><b-shown></code><b-real>`)).toEqual(["b-real"]);
  });

  test("a tag inside a script block is not a dependency", () => {
    expect(componentRefs(`<script>var t = "<b-scripted>";</script><b-real>`)).toEqual(["b-real"]);
  });

  test("stripping leaves the rest of the markup alone", () => {
    expect(strippedForScan(`<p>keep me</p>`)).toContain("keep me");
  });
});

describe("the report", () => {
  test("names the component, the template, and the cause that has actually happened", () => {
    const text = missingReport([{ component: "b-field", template: "view/pages/about.html" }]);
    expect(text).toContain("b-field");
    expect(text).toContain("view/pages/about.html");
    expect(text).toContain("@tjakoen/grain");
    expect(text).toContain("hollow");
  });
});

describe("the live preflight", () => {
  test("every component the pages and components reference resolves against the real roots", async () => {
    const missing = await findMissingComponents(
      [config.pagesDir, join(import.meta.dir, "..", "view", "components")],
      config.componentRoots,
    );
    // A failure here is almost always the grain bridge: the installed package predates a component
    // a template uses, and nothing else in the suite would say so.
    expect(missing.length === 0 ? "" : missingReport(missing)).toBe("");
  });
});
