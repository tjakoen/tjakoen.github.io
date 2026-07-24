// portfolio/ai/slug.test.ts — the ONE slug algorithm shared by content.ts's heading override and
// knowledge.ts's corpus builder: lock its edge cases so the two can never quietly drift apart.
import { test, expect, describe } from "bun:test";
import { slugifyHeading } from "./slug.ts";

describe("slugifyHeading", () => {
  test("plain words → lowercase, dash-joined", () => {
    expect(slugifyHeading("hello world")).toBe("hello-world");
  });

  test("caps are lowercased", () => {
    expect(slugifyHeading("What Is BREAD?")).toBe("what-is-bread");
  });

  test("punctuation is stripped, not replaced with a dash", () => {
    expect(slugifyHeading("What is BREAD?")).toBe("what-is-bread");
  });

  test("an ampersand is stripped (no leftover double dash)", () => {
    expect(slugifyHeading("grain & batch")).toBe("grain-batch");
  });

  test("backticks and underscores already stripped by callers pass through cleanly", () => {
    // callers feed inlineText() output (plain text, no markdown), but if a stray backtick or
    // underscore slips through, it should still be stripped rather than surviving into the slug.
    expect(slugifyHeading("`code` and _emphasis_")).toBe("code-and-emphasis");
  });

  test("multiple spaces collapse to one dash", () => {
    expect(slugifyHeading("too   many    spaces")).toBe("too-many-spaces");
  });

  test("empty input yields empty string", () => {
    expect(slugifyHeading("")).toBe("");
  });

  test("symbol-only input yields empty string", () => {
    expect(slugifyHeading("!!! ??? ***")).toBe("");
  });

  test("existing dashes are preserved (and dash runs collapsed)", () => {
    expect(slugifyHeading("already-dashed heading")).toBe("already-dashed-heading");
    expect(slugifyHeading("double--dash")).toBe("double-dash");
  });

  test("leading/trailing whitespace and punctuation are trimmed away", () => {
    expect(slugifyHeading("  - Section One! - ")).toBe("section-one");
  });
});
