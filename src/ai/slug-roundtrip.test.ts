// The deep-link contract has TWO heading-text extraction paths that must agree: the corpus builder
// slugs toPlainText(raw markdown heading) (knowledge.ts), while the rendered page slugs
// inlineText(parsed heading children) (content.ts's MILL block override). They are different
// implementations, so a heading they disagree on would emit a chunk anchor that matches NO rendered
// id — and the deep-link would silently 404 its scroll. This round-trip test walks the REAL corpus
// sources and asserts every anchor buildKnowledge emits exists among the ids the renderer would
// stamp on that source's page. New content that breaks the contract fails here, at build time,
// not in a visitor's browser.
import { describe, expect, test } from "bun:test";
import { parseMarkdown, inlineText } from "@tjakoen/mill/core/markdown.ts";
import { buildKnowledge } from "./knowledge.ts";
import { slugifyHeading } from "./slug.ts";
import { listKnowledgeSources } from "../content.ts";

describe("chunk anchors match rendered heading ids (real corpus)", () => {
  test("every emitted anchor has a rendered id on its page", async () => {
    const sources = (await listKnowledgeSources()).filter((s) => s.anchored);
    expect(sources.length).toBeGreaterThan(0);
    for (const src of sources) {
      // the ids content.ts's heading override would stamp (h2/h3 only, same as the corpus split)
      const rendered = new Set<string>();
      for (const node of parseMarkdown(src.markdown)) {
        if (node.type === "heading" && node.level >= 2 && node.level <= 3) {
          const slug = slugifyHeading(inlineText(node.children));
          if (slug) rendered.add(slug);
        }
      }
      const anchors = new Set(
        buildKnowledge([src]).chunks.map((c) => c.anchor).filter((a): a is string => !!a),
      );
      for (const anchor of anchors) {
        expect(rendered.has(anchor), `${src.route}: anchor "${anchor}" has no rendered heading id`).toBe(true);
      }
    }
  });
});
