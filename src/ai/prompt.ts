// portfolio/ai/prompt.ts — CLIENT-SAFE (§19.2), pure. Assemble the chat messages for the local
// model from: a grounded-only persona, a CONTEXT block of retrieved chunks (route-tagged so the
// model can point the visitor at a real page), and the last few conversation turns — all clipped
// to fit the model's small window (context_window_size: 2048; we reserve room for generation).

import type { Chunk } from "./retrieval.ts";
import type { NavDest } from "./catalog.ts";

/** One conversation turn, in the shape WebLLM's chat.completions expects. */
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface PromptInput {
  query: string;
  chunks: Chunk[];
  history: ChatMessage[];   // prior turns (user/assistant), oldest→newest
  /** The model's real-route candidates for THIS request — a small, relevance-ranked slice of the live
   *  sitemap catalog (catalog.ts navShortlist), each a real {route, label}. Optional: omitted or empty
   *  leaves the prompt unchanged. When present, the model gets a NAVIGATE:<route> protocol scoped to
   *  ONLY these real routes — it chooses from what exists, never inventing a slug. */
  navShortlist?: NavDest[];
  /** The approx-token ceiling to hold the assembled prompt under — the active model profile's
   *  `promptTokenBudget` (webllm-loader.ts). Omitted ⇒ the default below (the weak 0.5B's 2048 window);
   *  a stronger model passes a bigger budget so more grounding + history survive the clip. */
  tokenBudget?: number;
  /** What the desk can DO for the visitor right now — short phrases (the built-in actions plus
   *  whatever GRAIN's live manifest says this page offers, composed by the reasoner). Rendered as a
   *  CAN-DO line in the system prompt so a freeform "what are you able to do?" — a phrasing the
   *  deterministic capabilities route misses — still gets a capability-aware answer instead of a
   *  grounded-text guess. Optional: omitted or empty leaves the prompt unchanged. */
  canDo?: string[];
}

// DEFAULT budget in APPROX tokens (~4 chars/token — good enough for clipping a 0.5B's 2048 window).
// 2048 window − 256 generation − a safety margin ≈ 1500 usable; hold the assembled prompt under it.
// A caller running a bigger model overrides this via PromptInput.tokenBudget (its profile's budget).
const PROMPT_TOKEN_BUDGET = 1400;
const HISTORY_TURNS = 6;        // last 3 exchanges (user+assistant)
const approxTokens = (s: string): number => Math.ceil(s.length / 4);

// The persona: grounded-only, short, honest about the edges. It must never invent facts about TJ —
// when the context doesn't cover the question, it says so and points at a page path. Kept terse so
// a 0.5B follows it. The "concrete facts" + "complete sentences" lines are baseline-audit findings
// (tools/desk-audit.ts): without them the 0.5B paraphrases the employer/role away and sometimes
// answers with a bare fragment; the "never invent a path" line pins the route-hallucination case.
const PERSONA = [
  "You are the Desk — the assistant on TJ's personal site, running as a small model in the visitor's own browser.",
  "Answer ONLY from the CONTEXT below and the conversation. Do not invent facts about TJ, the BREAD stack, or this site.",
  "Use the concrete facts as written in the CONTEXT (names, roles, titles, page paths); answer in 2–4 complete sentences, plain and direct.",
  "When asked about a person, state their role and where they work, if the CONTEXT has it.",
  "Only mention a page path that appears in the CONTEXT or in the pages list you were given — never make one up.",
  "If the CONTEXT doesn't cover the question, say you don't have that on hand and point to a relevant page path (e.g. /notes or /grain/docs).",
  "No hype, no bullet lists unless asked.",
].join(" ");

// The CHOICES protocol — offered ALWAYS (unlike nav, which needs live targets): when the visitor's
// request is genuinely ambiguous or a small set of options would serve them better than prose, the
// model may ASK instead of answer. Terse + literal so a 0.5B follows it; the reasoner parses it
// (parseModelChoices) into grain's choices op. Kept a rare move so it doesn't nag.
const CHOICES_BLOCK =
  "If (and only if) the request is ambiguous and a short menu would help, you MAY reply with EXACTLY " +
  "\"CHOICES: <your one-line question> | <option 1> | <option 2> | <option 3>\" — 2 to 4 short options " +
  "(each a few words), and nothing else. Otherwise just answer. Don't offer choices for a clear question.";

/** The CAN-DO line: what the desk itself can do for the visitor right now (built-in actions + this
 *  page's grain-manifest operables, composed by the reasoner). Grounds "what can you do?" phrasings
 *  that miss the deterministic capabilities route — the baseline audit's biggest gap. Shaped as a
 *  CANNED SENTENCE, not a list to paraphrase: the audit showed the 0.5B garbling a list ("take me to
 *  a page", pronouns flipped) but echoing a ready-made line intact. */
function canDoBlock(canDo: string[]): string {
  const line = `I can ${canDo.length > 1 ? canDo.slice(0, -1).join(", ") + ", or " + canDo[canDo.length - 1] : canDo[0]}.`;
  return `Things YOU (the Desk) can do for the visitor here: ${canDo.join("; ")}. ` +
    `If they ask what you can do or for help, reply with exactly: "${line}"`;
}

/** The NAVIGATE:<route> protocol block — told to the model ONLY when there are real destinations to
 *  offer, and scoped to exactly that list (never a route the model invents). Each is shown as
 *  "route (label)" so the model can match a title, not just a slug. Kept terse: a 0.5B follows a
 *  short, literal instruction far more reliably than a long one. ("go to, open, or read" — the
 *  baseline audit showed "I want to read the mill documentation" EXPLAINED instead of navigating
 *  under the narrower "ask to go to" wording.) */
function navBlock(dests: NavDest[]): string {
  const list = dests.map((d) => `${d.route} (${d.label})`).join("; ");
  return `You can also take the visitor to one of these real pages on this site: ${list}. ` +
    `If they ask WHICH pages you can take them to, list exactly these routes and no others. ` +
    `If (and only if) they ask to go to, open, read, or see one of them, reply with EXACTLY ` +
    `"NAVIGATE:<route>" (the route only, e.g. "NAVIGATE:${dests[0]!.route}") and say nothing else. ` +
    `Never write NAVIGATE for a route that isn't in that list — answer normally instead.`;
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
  const { query, chunks, history, navShortlist, tokenBudget, canDo } = input;
  const budget = tokenBudget ?? PROMPT_TOKEN_BUDGET;
  const nav = navShortlist && navShortlist.length > 0 ? navBlock(navShortlist) : "";
  const cando = canDo && canDo.length > 0 ? canDoBlock(canDo) : "";
  const personaCost = approxTokens(PERSONA);
  const choicesCost = approxTokens(CHOICES_BLOCK);   // always in the system prompt
  const navCost = nav ? approxTokens(nav) : 0;
  const canDoCost = cando ? approxTokens(cando) : 0;
  const queryCost = approxTokens(query);
  let remaining = budget - personaCost - choicesCost - navCost - canDoCost - queryCost;

  const historyBudget = Math.floor(remaining * 0.35);
  const clippedHistory = clipHistory(history, Math.max(0, historyBudget));
  remaining -= clippedHistory.reduce((n, m) => n + approxTokens(m.content), 0);

  const context = contextBlock(chunks, Math.max(0, remaining));

  // Persona + grounding (+ the nav protocol, when offered) go in ONE system message (a second
  // `system` message anywhere but first trips MLC's SystemMessageOrderError). CONTEXT is appended
  // below so it still reads as a distinct, route-tagged block the model can cite.
  // canDo sits right after the persona — a 0.5B weights early instructions hardest, and the audit
  // showed it latching onto the (later) pages list when asked what it can do.
  let systemContent = PERSONA;
  if (cando) systemContent += `\n\n${cando}`;
  systemContent += `\n\n${CHOICES_BLOCK}`;
  if (nav) systemContent += `\n\n${nav}`;
  if (context) systemContent += `\n\nCONTEXT (site content the visitor can open):\n\n${context}`;
  const messages: ChatMessage[] = [{ role: "system", content: systemContent }];
  messages.push(...clippedHistory);
  messages.push({ role: "user", content: query });
  return messages;
}

export const __test = { PROMPT_TOKEN_BUDGET, HISTORY_TURNS, approxTokens, PERSONA };
