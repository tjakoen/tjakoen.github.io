// portfolio/ai/showcase.ts — "Watch me work": the desk as a REAL agent. The 0.5B, loaded first, is
// handed a GOAL and drives the site one action at a time — it CHOOSES each move (open a note, highlight
// a section, save a takeaway, draft a message), the harness VALIDATES the choice against live data and
// only then applies it (law #2 — the AI proposes, code guards; it composes text, it never invents a
// route or targets a field). Nothing is a canned animation: no movement happens until the model is up,
// and every step is the model's own output.
//
// This module is the PURE core (client-safe, no DOM/storage): the tool protocol (parse + validate), the
// per-turn system prompt, and the cross-page agent-state codec. The DRIVER loop (stream → parse →
// validate → apply → record → advance) lives in desk-reasoner.ts, which owns the engine; the door
// re-hydrates the loop on arrival, since an MPA navigation tears the reasoner instance down.

import type { NavDest } from "./catalog.ts";

/** The demo's fixed GOAL — the "script" the owner is fine giving the AI (a task, not a choreography).
 *  The model decides HOW to reach it, step by step; this only says WHAT a good demo shows. */
export const SHOWCASE_GOAL =
  "Give the visitor a quick guided demo of what you can do: open TJ's flagship note, point out the part " +
  "that matters, save one takeaway to their notepad, then start (do NOT send) a short message to TJ. " +
  "Keep it moving — a few steps, then finish.";

/** Total actions across the whole demo before it force-finishes — a runaway guard, not a target. */
export const SHOWCASE_STEP_CAP = 9;
/** How many rejected/invalid tool calls in a row on one page before the driver gives up and finishes —
 *  a weak model that can't produce a valid call shouldn't spin forever. */
export const SHOWCASE_MAX_MISSES = 3;
/** Where the agent state rides across the page load (the MPA loses JS state on navigation). */
export const SHOWCASE_KEY = "desk-showcase";

/** The agent's memory across pages: the goal, the tool lines it has already executed (fed back each
 *  turn so it doesn't repeat itself or lose the thread), and a running step count for the cap. */
export interface ShowcaseState {
  goal: string;
  done: string[];
  step: number;
}

/** One parsed tool call. `invalid` carries the raw line so the driver can feed the model a specific
 *  "that wasn't a valid action" nudge. */
export type ToolCall =
  | { kind: "go"; route: string }
  | { kind: "highlight"; anchor: string }   // `anchor` may be a heading id OR a 1-based index (resolveAnchor maps it)
  | { kind: "note"; text: string }
  | { kind: "draft"; text: string }
  | { kind: "done" }
  | { kind: "invalid"; raw: string };

/** What the model is allowed to reach on THIS page — everything the driver enumerates into the prompt
 *  and validates the model's choice against, so a `GO`/`HIGHLIGHT` can only ever hit something real. */
export interface AgentContext {
  route: string;
  title: string;
  routes: NavDest[];        // real catalog destinations (GO targets)
  anchors: string[];        // this page's rendered heading ids (HIGHLIGHT targets)
  hasNotepad: boolean;      // a NOTE target exists here
  hasContact: boolean;      // a DRAFT target (the /mail compose) exists here
}

/** Parse the model's turn into ONE tool call. Reads the FIRST non-empty line only (a 0.5B often trails
 *  extra prose), tolerant of surrounding quotes/asterisks/backticks and a leading bullet. Keyword is
 *  case-insensitive; the argument keeps its original text (NOTE/DRAFT/SAY are authored content). */
export function parseToolCall(raw: string): ToolCall {
  const line = (raw.split("\n").map((l) => l.trim()).find((l) => l.length > 0) ?? "")
    .replace(/^[-*>\s]+/, "")                 // a leading bullet/quote marker
    .replace(/^[`"'*]+|[`"'*]+$/g, "")        // wrapping quotes/backticks/asterisks
    .trim();
  if (!line) return { kind: "invalid", raw };
  const done = /^done\b/i.exec(line);
  if (done) return { kind: "done" };
  const go = /^go\s+(\/\S+)/i.exec(line);
  if (go) return { kind: "go", route: go[1]!.replace(/[.,;]+$/, "") };
  const hi = /^(?:highlight|show)\s+([A-Za-z0-9][\w-]*)/i.exec(line);
  if (hi) return { kind: "highlight", anchor: hi[1]! };
  const note = /^note[:\s]+(.+)/i.exec(line);
  if (note) return { kind: "note", text: note[1]!.trim() };
  const draft = /^draft[:\s]+(.+)/i.exec(line);
  if (draft) return { kind: "draft", text: draft[1]!.trim() };
  return { kind: "invalid", raw };
}

/** Resolve a HIGHLIGHT token to a real heading id on this page — the token may be the id itself OR a
 *  1-based index into the offered list (the 0.5B reaches for numbers). Returns null if it maps to
 *  nothing real, so validate/apply can reject it. */
export function resolveAnchor(token: string, anchors: string[]): string | null {
  if (/^\d+$/.test(token)) { const i = Number(token) - 1; return anchors[i] ?? null; }
  return anchors.includes(token) ? token : null;
}

/** Validate a parsed call against the live page context — the guardrail between "the model chose" and
 *  "the harness acts". A GO must hit a real catalog route; a HIGHLIGHT a real heading on THIS page;
 *  NOTE/DRAFT need their target surface present. Text content itself is never second-guessed (the model
 *  is allowed to author it) — only the TARGETING is checked, the law-#2 split. */
export function validateToolCall(call: ToolCall, ctx: AgentContext): { ok: true } | { ok: false; why: string } {
  const strip = (r: string): string => r.replace(/\/+$/, "") || "/";
  const placeholder = (t: string): boolean => /[<>]/.test(t) || /^(your |a short |one )/i.test(t.trim());
  switch (call.kind) {
    case "go": {
      if (strip(call.route) === strip(ctx.route)) return { ok: false, why: "you are already on that page — pick a different action" };
      const hit = ctx.routes.some((d) => strip(d.route) === strip(call.route));
      return hit ? { ok: true } : { ok: false, why: `"${call.route}" is not one of the routes you were given` };
    }
    case "highlight":
      return resolveAnchor(call.anchor, ctx.anchors)
        ? { ok: true }
        : { ok: false, why: `"${call.anchor}" is not a section on this page` };
    case "note":
      if (!call.text.trim()) return { ok: false, why: "NOTE needs some text" };
      if (placeholder(call.text)) return { ok: false, why: "write the actual takeaway, not the placeholder" };
      return ctx.hasNotepad ? { ok: true } : { ok: false, why: "there's no notepad on this page to write to" };
    case "draft":
      if (!call.text.trim()) return { ok: false, why: "DRAFT needs some text" };
      if (placeholder(call.text)) return { ok: false, why: "write the actual message, not the placeholder" };
      return ctx.hasContact ? { ok: true } : { ok: false, why: "there's no message box on this page — GO to the contact page first" };
    case "done":
      return { ok: true };
    case "invalid":
      return { ok: false, why: "that wasn't a valid action — reply with exactly one action line" };
  }
}

/** The suggested next step, computed from the trail + where the agent is now. A WEAK model can't plan a
 *  multi-step sequence unaided (it loops or stalls), so we point at the next useful move — but the model
 *  still EMITS the action itself (it may deviate) and AUTHORS all text (the note/message are its words).
 *  This is the honest middle: the AI acts + writes, the harness advises + validates + never submits. */
export function nextStepHint(state: ShowcaseState, ctx: AgentContext): string {
  const strip = (r: string): string => r.replace(/\/+$/, "") || "/";
  const did = (verb: string): boolean => state.done.some((d) => d.startsWith(verb));
  const onNote = strip(ctx.route).includes("ten-times-zero");
  const onMail = strip(ctx.route) === "/mail";
  if (!onNote && !onMail && !did("HIGHLIGHT") && !did("NOTE")) return "Open TJ's flagship note: GO /notes/ten-times-zero";
  if (onNote && !did("HIGHLIGHT") && ctx.anchors.length) return "Spotlight the key section: HIGHLIGHT 1";
  if (onNote && !did("NOTE") && ctx.hasNotepad) return "Save one takeaway — type NOTE then a short sentence about the ratio, in your own words";
  if (!onMail && !did("DRAFT")) return "Go to the contact page: GO /mail";
  if (onMail && !did("DRAFT") && ctx.hasContact) return "Type DRAFT then a short friendly message to TJ, in your own words";
  return "You have shown the tour — finish with: DONE";
}

/** The single literal command the next step points at — used as the one-shot example, since the 0.5B
 *  copies the example closely. For the mechanical steps (GO/HIGHLIGHT/DONE) that's exactly right; for
 *  the AUTHORED steps (NOTE/DRAFT) it's a verb + a bracketed cue the model must replace with its own
 *  words (validateToolCall rejects the bracket placeholder if it copies it verbatim). */
export function nextStepCommand(state: ShowcaseState, ctx: AgentContext): string {
  const strip = (r: string): string => r.replace(/\/+$/, "") || "/";
  const did = (verb: string): boolean => state.done.some((d) => d.startsWith(verb));
  const onNote = strip(ctx.route).includes("ten-times-zero");
  const onMail = strip(ctx.route) === "/mail";
  if (!onNote && !onMail && !did("HIGHLIGHT") && !did("NOTE")) return "GO /notes/ten-times-zero";
  if (onNote && !did("HIGHLIGHT") && ctx.anchors.length) return "HIGHLIGHT 1";
  if (onNote && !did("NOTE") && ctx.hasNotepad) return "NOTE the judgment stays human, the typing does not";
  if (!onMail && !did("DRAFT")) return "GO /mail";
  if (onMail && !did("DRAFT") && ctx.hasContact) return "DRAFT Hi TJ, I loved seeing the desk drive your site";
  return "DONE";
}

/** The per-turn system prompt for the agent. Everything the model needs in ONE system message; the user
 *  turn is a bare non-question cue (never a question the model can echo — the 0.5B parroted a question
 *  turn back as chatter). Actions are enumerated with the valid targets inline (it picks from a list,
 *  never invents), anchors are NUMBERED (the weak model reaches for indices), a one-shot example fixes
 *  the format, and a computed next-step hint keeps it moving toward the goal. */
export function buildAgentSystemPrompt(state: ShowcaseState, ctx: AgentContext): string {
  const routes = ctx.routes.map((d) => d.route).join(" ");
  const anchors = ctx.anchors.length ? ctx.anchors.map((a, i) => `${i + 1}=${a}`).join(" ") : "none";
  const lines = [
    "You are the Desk, an AI that OPERATES TJ's website. A visitor is watching you demonstrate what you can do.",
    `Your GOAL: ${state.goal}`,
    `You are now on the page "${ctx.title}" (${ctx.route}).`,
    "",
    "Output ONE action line and nothing else. No explanation. No questions. Never repeat these rules.",
    "Actions:",
    `  GO <route>       open a page. Valid routes: ${routes}`,
    `  HIGHLIGHT <n>    spotlight a section here by its number: ${anchors}`,
    `  NOTE <text>      write a one-line takeaway to the notepad${ctx.hasNotepad ? "" : "  (unavailable here)"}`,
    `  DRAFT <text>     write a short message to TJ, never sent${ctx.hasContact ? "" : "  (unavailable here — GO /mail first)"}`,
    "  DONE             the demo is complete",
    "",
    state.done.length ? `You already did: ${state.done.map((d) => d.split(" ")[0]).join(", ")}. Do not repeat those.` : "You have not acted yet.",
    `SUGGESTED next action: ${nextStepHint(state, ctx)}`,
    // the one-shot example IS the suggested command (the 0.5B copies the example closely) — right for
    // the mechanical GO/HIGHLIGHT/DONE steps; for NOTE/DRAFT it seeds a coherent line the model may
    // keep or replace with its own words.
    `Reply with exactly this form:  ${nextStepCommand(state, ctx)}`,
    "Your action line:",
  ];
  return lines.join("\n");
}

/** Append an executed (or rejected) action to the trail, capped so the fed-back history can't blow the
 *  0.5B's tiny window. Pure — returns a new array. */
export function recordDone(done: string[], entry: string): string[] {
  return [...done, entry].slice(-SHOWCASE_STEP_CAP);
}

/** Defensive parse of the stashed agent state: valid JSON, the right shape, a sane step count — anything
 *  else is null so the caller treats it as "no showcase running". */
export function showcaseState(raw: string | null): ShowcaseState | null {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;
  const o = parsed as { goal?: unknown; done?: unknown; step?: unknown };
  if (typeof o.goal !== "string") return null;
  if (!Array.isArray(o.done) || !o.done.every((d) => typeof d === "string")) return null;
  if (typeof o.step !== "number" || !Number.isInteger(o.step) || o.step < 0) return null;
  return { goal: o.goal, done: o.done as string[], step: o.step };
}

/** Serialize the agent state for sessionStorage. */
export function stashShowcaseState(state: ShowcaseState): string {
  return JSON.stringify(state);
}
