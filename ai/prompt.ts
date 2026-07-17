// portfolio/ai/prompt.ts — CLIENT-SAFE (§19.2), pure. Assemble the chat messages for the local
// model from: a grounded-only persona, a CONTEXT block of retrieved chunks (route-tagged so the
// model can point the visitor at a real page), and the last few conversation turns — all clipped
// to fit the model's small window (context_window_size: 2048; we reserve room for generation).

import type { Chunk } from "./retrieval.ts";

/** One conversation turn, in the shape WebLLM's chat.completions expects. */
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface PromptInput {
  query: string;
  chunks: Chunk[];
  history: ChatMessage[];   // prior turns (user/assistant), oldest→newest
  /** Live navigation targets on the CURRENT page — the routes GRAIN's manifestForReasoner() reports
   *  as "nav:<route>" surfaces (the portfolio sidebar's file-tree/dock links), already extracted to
   *  bare routes by the caller. Optional: omitted (or empty) leaves the prompt exactly as before, so
   *  a consumer with no manifest still gets a valid, unchanged prompt. When present, the model gets a
   *  narrow NAVIGATE:<route> protocol scoped to ONLY these routes — never a hardcoded guess. */
  navRoutes?: string[];
}

// Budget in APPROX tokens (~4 chars/token — good enough for clipping a 0.5B's 2048 window).
// 2048 window − 256 generation − a safety margin ≈ 1500 usable; hold the assembled prompt under it.
const PROMPT_TOKEN_BUDGET = 1400;
const HISTORY_TURNS = 6;        // last 3 exchanges (user+assistant)
const approxTokens = (s: string): number => Math.ceil(s.length / 4);

// The persona: grounded-only, short, honest about the edges. It must never invent facts about TJ —
// when the context doesn't cover the question, it says so and points at a page path. Kept terse so
// a 0.5B follows it.
const PERSONA = [
  "You are the Desk — the assistant on TJ's personal site, running as a small model in the visitor's own browser.",
  "Answer ONLY from the CONTEXT below and the conversation. Do not invent facts about TJ, the BREAD stack, or this site.",
  "If the CONTEXT doesn't cover the question, say you don't have that on hand and point to a relevant page path (e.g. /notes or /grain/docs).",
  "Keep answers to 2–4 sentences, plain and direct. No hype, no bullet lists unless asked.",
].join(" ");

// The CHOICES protocol — offered ALWAYS (unlike nav, which needs live targets): when the visitor's
// request is genuinely ambiguous or a small set of options would serve them better than prose, the
// model may ASK instead of answer. Terse + literal so a 0.5B follows it; the reasoner parses it
// (parseModelChoices) into grain's choices op. Kept a rare move so it doesn't nag.
const CHOICES_BLOCK =
  "If (and only if) the request is ambiguous and a short menu would help, you MAY reply with EXACTLY " +
  "\"CHOICES: <your one-line question> | <option 1> | <option 2> | <option 3>\" — 2 to 4 short options " +
  "(each a few words), and nothing else. Otherwise just answer. Don't offer choices for a clear question.";

/** The NAVIGATE:<route> protocol block — told to the model ONLY when there are live nav targets to
 *  offer, and scoped to exactly that list (never a route the model invents). Kept terse: a 0.5B
 *  follows a short, literal instruction far more reliably than a long one. */
function navBlock(routes: string[]): string {
  const list = routes.join(", ");
  return `You can also take the visitor to one of these pages, live on this site right now: ${list}. ` +
    `If (and only if) they ask to go to one of them, reply with EXACTLY "NAVIGATE:<route>" (the route ` +
    `only, e.g. "NAVIGATE:${routes[0]}") and say nothing else. Never write NAVIGATE for a route that ` +
    `isn't in that list — answer normally instead.`;
}

/** Render the retrieved chunks as a single CONTEXT block, each tagged with its route so the model
 *  can cite where something lives. Chunks are added until the token budget for context is spent. */
function contextBlock(chunks: Chunk[], budget: number): string {
  const parts: string[] = [];
  let spent = 0;
  for (const c of chunks) {
    const head = c.heading ? `${c.title} — ${c.heading}` : c.title;
    const block = `[${c.route}] ${head}\n${c.text}`;
    const cost = approxTokens(block);
    if (spent + cost > budget && parts.length > 0) break;   // always include at least one chunk
    parts.push(block);
    spent += cost;
  }
  return parts.join("\n\n");
}

/** Trim history to the last few turns, then drop from the OLDEST end until it fits the budget. */
function clipHistory(history: ChatMessage[], budget: number): ChatMessage[] {
  let turns = history.slice(-HISTORY_TURNS);
  let cost = turns.reduce((n, m) => n + approxTokens(m.content), 0);
  while (turns.length > 0 && cost > budget) {
    cost -= approxTokens(turns[0]!.content);
    turns = turns.slice(1);
  }
  // After the system prompt, MLC's chat template wants the turns to start with a USER message and
  // alternate — so a clip that left a leading `assistant` turn would be rejected. Drop it.
  while (turns.length > 0 && turns[0]!.role === "assistant") turns = turns.slice(1);
  return turns;
}

/** Assemble the full message list, clipped to fit the window. Order: ONE system message (persona +
 *  CONTEXT — MLC requires the system prompt to be the single first message) → clipped history → the
 *  user's query. Budget is spent persona-first, then query, then history, then context fills the rest. */
export function buildPrompt(input: PromptInput): ChatMessage[] {
  const { query, chunks, history, navRoutes } = input;
  const nav = navRoutes && navRoutes.length > 0 ? navBlock(navRoutes) : "";
  const personaCost = approxTokens(PERSONA);
  const choicesCost = approxTokens(CHOICES_BLOCK);   // always in the system prompt
  const navCost = nav ? approxTokens(nav) : 0;
  const queryCost = approxTokens(query);
  let remaining = PROMPT_TOKEN_BUDGET - personaCost - choicesCost - navCost - queryCost;

  const historyBudget = Math.floor(remaining * 0.35);
  const clippedHistory = clipHistory(history, Math.max(0, historyBudget));
  remaining -= clippedHistory.reduce((n, m) => n + approxTokens(m.content), 0);

  const context = contextBlock(chunks, Math.max(0, remaining));

  // Persona + grounding (+ the nav protocol, when offered) go in ONE system message (a second
  // `system` message anywhere but first trips MLC's SystemMessageOrderError). CONTEXT is appended
  // below so it still reads as a distinct, route-tagged block the model can cite.
  let systemContent = PERSONA;
  systemContent += `\n\n${CHOICES_BLOCK}`;
  if (nav) systemContent += `\n\n${nav}`;
  if (context) systemContent += `\n\nCONTEXT (site content the visitor can open):\n\n${context}`;
  const messages: ChatMessage[] = [{ role: "system", content: systemContent }];
  messages.push(...clippedHistory);
  messages.push({ role: "user", content: query });
  return messages;
}

export const __test = { PROMPT_TOKEN_BUDGET, HISTORY_TURNS, approxTokens, PERSONA };
