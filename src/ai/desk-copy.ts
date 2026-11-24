// portfolio/src/ai/desk-copy.ts — the desk's fixed copy and the helpers that build it.
//
// The clarifying-question parser, the follow-up pool, the thinking indicator, the declined-download
// line, and the load bar. They are read by the deterministic turn, the model turn and the arrival
// generator, so they live here rather than in the factory. Re-exported from desk-reasoner.ts for
// existing callers.
import type { ChatMessage } from "./prompt.ts";
import type { ModelProfile } from "./webllm-loader.ts";

// The model's own clarifying-question choice, per the CHOICES:<question> | <opt> | <opt> protocol
// prompt.ts offers it. The 0.5B is loose, so parse defensively: pipe-split, trim, drop blanks, cap.
// Returns null unless there's a question AND 2–5 usable options (a lone or over-long list is a miss).
const MODEL_CHOICES_RE = /^choices:\s*(.+)$/is;
export function parseModelChoices(raw: string): { prompt: string; choices: { label: string; value: string }[] } | null {
  const m = MODEL_CHOICES_RE.exec(raw.trim());
  const body = m?.[1];
  if (!body) return null;
  const parts = body.split("|").map((s) => s.replace(/\s+/g, " ").trim()).filter(Boolean);
  const prompt = parts.shift() ?? "";
  const opts = parts.slice(0, 5).filter((s) => s.length <= 48);
  if (!prompt || opts.length < 2) return null;
  return { prompt, choices: opts.map((label) => ({ label, value: label })) };
}

// Follow-up chips. A 0.5B writes poor questions and raw chunk headings read like fragments, so the
// suggestions come from a HAND-CURATED pool of good, answerable prompts — filtered against what was
// already asked this session so they stay fresh. Reliable + always readable.
const FOLLOWUP_POOL = [
  "What is GRAIN?", "What is BREAD?", "Who is TJ?", "How is this site built?",
  "Why teach with AI?", "What does MILL do?", "Show me the latest note",
];
// C1 visitor-intent onboarding — code-chosen questions PREPENDED to the generic pool once a visitor
// has answered the onboarding ask, so their follow-up chips lean toward what they said they came for.
// A couple of these overlap FOLLOWUP_POOL's own entries word-for-word (by design — they're the right
// questions for that intent either way); pickFollowups' own de-dupe (against what's already been
// picked, not just what's been asked) keeps a shared entry from appearing twice.
const INTENT_FOLLOWUPS: Record<"recruiter" | "developer" | "student", string[]> = {
  recruiter: ["Summarize TJ's experience", "What did TJ build?"],
  developer: ["What is GRAIN?", "What does MILL do?"],
  student: ["Why teach with AI?"],
};
export function pickFollowups(
  asked: string, history: ChatMessage[], intent?: "recruiter" | "developer" | "student", k = 3,
): string[] {
  const seen = new Set([asked.trim().toLowerCase(), ...history.map((m) => m.content.trim().toLowerCase())]);
  const pool = [...(intent ? INTENT_FOLLOWUPS[intent] : []), ...FOLLOWUP_POOL];
  const out: string[] = [];
  for (const q of pool) {
    if (seen.has(q.toLowerCase()) || out.includes(q)) continue;
    out.push(q);
    if (out.length >= k) break;
  }
  return out;
}

// An always-on "thinking" indicator so the desk bubble is NEVER blank while it works (the pause
// before the model answers, or while a deterministic action runs). Trusted markup, styled by CSS.
export const THINKING = '<span class="desk-typing" aria-label="Thinking">Thinking<i></i><i></i><i></i></span>';

/** The Desk's reply when a visitor answers "Not now" to the download question. */
export const DOWNLOAD_DECLINED_LINE =
  "No problem, I won't download anything. Use Browse to look around, or ask again whenever you want me to answer.";

export const loadBar =(pct: number, profile: ModelProfile, warm: boolean): string => {
  const title = warm
    ? `Loading ${profile.label} from the copy saved on this device.`
    : `Downloading ${profile.label}: ${Math.round((pct / 100) * profile.downloadMB)} of about ${profile.downloadMB} MB. One time only.`;
  return loadBarHtml(pct, title);
};
const loadBarHtml = (pct: number, title: string): string =>
  `<span class="desk-load"><span class="desk-load__title">${title}</span>` +
  `<span class="desk-load__bar" aria-hidden="true"><span class="desk-load__fill" style="width:${pct}%"></span></span>` +
  `<span class="desk-load__pct">${pct}%</span></span>`;
