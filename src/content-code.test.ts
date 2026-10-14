import { expect, test } from "bun:test";
import { highlightedCodeBlock } from "./content-code.ts";

const context = { escape: (value: string) => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;") };

test("highlighted Markdown code blocks keep token classes and escaped values", () => {
  const html = highlightedCodeBlock({ lang: "ts", value: 'const label = "safe < text";' } as never, context as never);
  expect(html).toContain('data-lang="ts"');
  expect(html).toContain('class="hljs-keyword">const</span>');
  expect(html).toContain('class="hljs-string">&quot;safe &lt; text&quot;</span>');
});

test("unsupported and Mermaid fences remain escaped source", () => {
  for (const lang of ["unknown-language", "mermaid"]) {
    const html = highlightedCodeBlock({ lang, value: "<script>alert(1)</script>" } as never, context as never);
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("hljs-");
  }
});
