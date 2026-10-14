import hljs from "highlight.js/lib/core";
import type { BlockHandlers } from "@tjakoen/mill/core/types.ts";
import { escapeHtml } from "@tjakoen/mill/core/engine.ts";

import bash from "highlight.js/lib/languages/bash";
import css from "highlight.js/lib/languages/css";
import diff from "highlight.js/lib/languages/diff";
import html from "highlight.js/lib/languages/xml";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import markdown from "highlight.js/lib/languages/markdown";
import python from "highlight.js/lib/languages/python";
import sql from "highlight.js/lib/languages/sql";
import typescript from "highlight.js/lib/languages/typescript";
import yaml from "highlight.js/lib/languages/yaml";

hljs.registerLanguage("bash", bash);
hljs.registerLanguage("css", css);
hljs.registerLanguage("diff", diff);
hljs.registerLanguage("html", html);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("json", json);
hljs.registerLanguage("markdown", markdown);
hljs.registerLanguage("python", python);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("yaml", yaml);
hljs.registerAliases(["sh", "shell", "zsh"], { languageName: "bash" });
hljs.registerAliases(["js", "jsx", "mjs", "cjs"], { languageName: "javascript" });
hljs.registerAliases(["ts", "tsx"], { languageName: "typescript" });
hljs.registerAliases(["yml"], { languageName: "yaml" });
hljs.registerAliases(["xml", "svg", "xhtml"], { languageName: "html" });

/** Render a fenced code block with a small, explicit language set and escaped fallback. */
export const highlightedCodeBlock: BlockHandlers["code"] = (node, context) => {
  const language = node.lang?.trim().toLowerCase() ?? "";
  const highlighted = language && language !== "mermaid" && hljs.getLanguage(language)
    ? hljs.highlight(node.value, { language, ignoreIllegals: true }).value
    : escapeHtml(node.value);
  const lang = language ? ` data-lang="${context.escape(language)}"` : "";
  return `<pre class="code-block"${lang}><code>${highlighted}</code></pre>`;
};

