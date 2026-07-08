// portfolio/llms.ts — the CONTENT of /llms.txt (the llmstxt.org convention). BATCH owns the format
// (batch/http/llms.ts); this composition-root file owns the curated links, so the substrate stays
// content-agnostic. It is a PROJECTION of DOCS.md + the README — a trailhead an AI crawler reads to
// learn what this stack is and where the canonical docs live — never a fork of them. When the doc map
// or the layer/route structure changes, re-sync this list (see CLAUDE.md's "change X → update Y").
import type { LlmsDoc } from "../batch/http/llms.ts";

// Links use relative "/route" paths — batch/http/llms absolutizes them against the request origin,
// and the export's origin-rewrite swaps in the deploy URL (same path robots.txt/sitemap.xml take).
export const portfolioLlmsDoc: LlmsDoc = {
  title: "BREAD — one vocabulary, two operators",
  summary:
    "A no-build, AI-native web stack where every surface is addressable and operable by both a " +
    "human and an AI through one shared vocabulary, and the AI's presence is a visible signal (grain = AI).",
  details: [
    "A human click and an AI decision become the same Intent, flow through one door (POST /intent), " +
      "and return as render operations pushed over SSE. There is no privileged AI-to-DOM back channel: " +
      "the AI operates the UI the same way a person does, and you can watch it happen.",
    "Server-rendered hypermedia on Bun. No build step, no bundler, zero third-party runtime dependencies. " +
      "Four layers build in one direction — batch → grain → mill → proof — and PANTRY is the app that " +
      "composes them into one server (this portfolio is the other consumer of the same layers).",
  ],
  sections: [
    { heading: "The stack", links: [
      { title: "BATCH", url: "/batch", note: "the no-build substrate — server-rendered hypermedia, no bundler, no template language. Live." },
      { title: "GRAIN", url: "/grain", note: "the AI-interaction design system + its default theme (Sourdough); grade-as-signal (grain = AI, clean = human). Live." },
      { title: "MILL", url: "/mill", note: "Markdown → GRAIN-pages CMS — feed it .md + images, it renders GRAIN pages. Live: it renders this site's notes and layer docs." },
      { title: "PROOF", url: "/proof", note: "the AI plan board — plans are markdown files, the board is a projection of them. Live: core parser, board, check/init tooling, and the board updates live over SSE." },
      { title: "PANTRY", url: "/pantry", note: "the installable dev-docs and AI cockpit app that composes BATCH, GRAIN, MILL, and PROOF into one server. v2 live: home, the board, framework docs, /reference, /catalog, and /standards, plus an install kit." },
    ]},
    { heading: "Documentation", links: [
      { title: "Developer docs", url: "/docs", note: "start here to build with it: getting started, a hands-on tutorial, how-to guides, and the live reference" },
      { title: "Tutorial: build your first operable surface", url: "/grain/docs/tutorial", note: "a real, running example — one surface, human-click and AI-decision, through the same door" },
      { title: "BATCH docs", url: "/batch/docs", note: "ARCHITECTURE (the substrate's reasoning, single source of truth) + CONVENTIONS (the build standard)" },
      { title: "GRAIN docs", url: "/grain/docs", note: "GRAIN (the design system + AI layer), AI-INTERFACE (the contract: one door, render ops, manifest), DESIGN-SYSTEM (the look)" },
      { title: "Component catalog", url: "/catalog", note: "every GRAIN component, self-documenting, with a Human/AI grade toggle" },
      { title: "Generated reference", url: "/reference", note: "actions, surface kinds, render ops, the door's endpoints, and every token slot — read from the real source, never hand-copied" },
    ]},
    { heading: "See the AI act", links: [
      { title: "/loop", url: "/loop", note: "the reference screen — watch the AI plan and act through the one door, its presence lit as it works" },
    ]},
    { heading: "Writing", links: [
      { title: "Notes", url: "/notes", note: "essays on the stack and on building with AI; the flagship is \"ten times zero\"" },
    ]},
    { heading: "Optional", links: [
      { title: "Sitemap", url: "/sitemap.xml", note: "the full list of crawlable routes" },
    ]},
  ],
};
