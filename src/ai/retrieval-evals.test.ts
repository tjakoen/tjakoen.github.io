// portfolio/ai/retrieval-evals.test.ts — retrieval SCENARIO evals over the REAL corpus (the same
// sources /knowledge.json freezes), not synthetic fixtures. Each case is a visitor question and the
// route(s) that must ground it — so a retrieval or content change that silently redirects "who is
// TJ?" grounding away from the bio fails here, in `bun test`, before anyone drives a browser. The
// live-model counterpart is tools/desk-audit.ts; this layer pins WHICH CHUNKS reach CONTEXT.
import { test, expect, describe } from "bun:test";
import { buildKnowledge } from "./knowledge.ts";
import { retrieve, FACTS_ROUTE, type Knowledge } from "./retrieval.ts";
import { listKnowledgeSources } from "../content.ts";

const knowledge: Knowledge = buildKnowledge(await listKnowledgeSources());

/** The routes retrieve() grounds `query` on (top-3, the reasoner's own k). */
const groundedOn = (query: string): string[] => retrieve(query, knowledge, 3).map((c) => c.route);

// Each case: the grounding must include a route matching `wants` (a prefix, or the facts route).
const CASES: Array<{ ask: string; wants: string[] }> = [
  // the pinned chips + facts.md's own headings — the corpus's hand-authored backbone
  { ask: "What is the BREAD stack?", wants: [FACTS_ROUTE] },
  { ask: "Who is TJ?", wants: [FACTS_ROUTE] },
  { ask: "Is there a resume or CV?", wants: [FACTS_ROUTE] },
  { ask: "How is this site built?", wants: [FACTS_ROUTE] },
  { ask: "What can the desk assistant do?", wants: [FACTS_ROUTE] },
  // layer questions ground on the layer's own docs (or the facts BREAD overview)
  { ask: "What is GRAIN?", wants: ["/grain", FACTS_ROUTE] },
  { ask: "What does MILL do?", wants: ["/mill", FACTS_ROUTE] },
  { ask: "What is BATCH?", wants: ["/batch", FACTS_ROUTE] },
  // the flagship note is findable by name and by topic
  { ask: "Tell me about Ten Times Zero", wants: ["/notes/ten-times-zero"] },
  { ask: "How does TJ build with an AI in the open?", wants: ["/notes", FACTS_ROUTE] },
];

describe("retrieval scenario evals (real corpus)", () => {
  test("the corpus built (sources present, facts folded in)", () => {
    expect(knowledge.n).toBeGreaterThan(10);
    expect(knowledge.chunks.some((c) => c.route === FACTS_ROUTE)).toBe(true);
  });

  for (const c of CASES) {
    test(`"${c.ask}" grounds on ${c.wants.join(" | ")}`, () => {
      const routes = groundedOn(c.ask);
      const hit = routes.some((r) => c.wants.some((w) => r === w || r.startsWith(w)));
      expect(hit ? "grounded" : `got [${routes.join(", ")}]`).toBe("grounded");
    });
  }
});
