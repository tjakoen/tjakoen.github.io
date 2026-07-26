// portfolio/tools/voice-lint.ts — lint prose against the *mechanical subset* of VOICE.md.
//
// The voice standard (standards/VOICE.md) is mostly judgment: cadence, the wink, honest limits, the
// texture-not-vocabulary tell. A machine can't grade those. But a real slice of it IS mechanical —
// backticks in prose, em-dashes, the "it's not just X, it's Y" shape, the word-tell family, eager
// sign-offs, nominalizations. This tool catches that slice so the human eye is spent on the half a
// linter can't reach. It flags; it never rewrites. Judgment stays human (see notes/ten-times-zero.md).
//
// The design is borrowed straight from ste-lint.py in woosal1337/blog (the ASD-STE100 "cure for AI
// slop" experiment): lint only the mechanical rules, and say plainly that you're only covering the
// mechanical rules. Everything else is the smell test in VOICE.md, run by a person.
//
//   bun run lint:voice                 # default: content/notes/*.md
//   bun run lint:voice path/to/file.md # explicit files
//
// Exit code is nonzero when anything is flagged, so it can gate a publish/CI step like `bun run audit`.
// It targets PROSE only — reference docs and standards/ legitimately use backticks for literal tokens
// (VOICE.md says so), so they are not the default target. Point it at a file to check that file anyway.
import { readFileSync } from "node:fs";
import { Glob } from "bun";

type Rule = { id: string; sev: "tell" | "warn"; re: RegExp; msg: string };

// Ordered loudest-first. `sev: "tell"` = a top machine fingerprint (backtick, em-dash, the not-just-X
// shape); `sev: "warn"` = worth a look but sometimes legitimate in context (a lone "showcase", a three).
const RULES: Rule[] = [
  { id: "em-dash", sev: "tell", re: /—/, msg: "em-dash — now a top AI tell. Use a comma, period, colon, or parentheses." },
  { id: "backtick", sev: "tell", re: /`[^`]+`/, msg: "backtick in prose — the loudest tell. Write the term as plain words, *italics*, or a link." },
  { id: "not-just-x", sev: "tell", re: /\b(it'?s|is|isn'?t|not just|wasn'?t)\b[^.?!]*\bnot just\b|\bnot only\b[^.?!]*\bbut also\b/i, msg: "the \"it's not just X, it's Y\" / \"not only… but also\" cadence — the signature generated shape." },
  { id: "throat-clearing", sev: "tell", re: /\bin today'?s\b|\bin the world of\b|\bin the realm of\b|\bit'?s worth noting\b|\bit is worth noting\b|\bneedless to say\b/i, msg: "throat-clearing opener/filler — start with the stake, not the scenery." },
  { id: "eager-signoff", sev: "tell", re: /\bi hope this helps\b|\bfeel free to\b|\blet me know if\b|\bgreat question\b|\bcertainly[!,]/i, msg: "eager sign-off — cut it." },
  { id: "connective", sev: "warn", re: /^\s*(moreover|furthermore|additionally|in conclusion|overall|ultimately)\b/im, msg: "machine connective/wrap-up — end on a callback or a punch, not a book report." },
  { id: "word-tell", sev: "warn", re: /\b(delve|tapestry|realm|underscore|testament|showcase|boasts?|robust|seamless(ly)?|elevate|unlock|empower|foster|myriad|plethora|ever-evolving|cutting-edge|game-changing)\b/i, msg: "word came free with the model — cut or replace." },
  { id: "corporate-verb", sev: "warn", re: /\b(leverage|utilize|streamline)\b/i, msg: "corporate verb — use a plain strong one (build, prove, ship, use)." },
  { id: "nominalization", sev: "warn", re: /\b(perform|provide|conduct|carry out|make use of|offer support)\b\s+(an?\s+)?\w*(analysis|solution|review|assessment|evaluation|support|utili)/i, msg: "nominalization — collapse to the verb (analyze, solve, review, use)." },
  { id: "emoji", sev: "warn", re: /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2728}]/u, msg: "emoji in published prose — keep it clean." },
];

type Finding = { file: string; line: number; sev: Rule["sev"]; id: string; msg: string };

// Walk a file line by line, skipping the frontmatter block and any fenced code block (both legitimately
// contain backticks and tokens). Everything else is prose and gets linted.
function lintFile(file: string): Finding[] {
  const lines = readFileSync(file, "utf8").split("\n");
  const out: Finding[] = [];
  let inFence = false;
  let inFrontmatter = false;
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trimEnd();
    // Frontmatter: a leading `---` on line 0 opens it, the next `---` closes it.
    if (i === 0 && line === "---") { inFrontmatter = true; continue; }
    if (inFrontmatter) { if (line === "---") inFrontmatter = false; continue; }
    // Fenced code blocks toggle on ``` (or ~~~) at line start.
    if (/^\s*(```|~~~)/.test(line)) { inFence = !inFence; continue; }
    if (inFence) continue;
    for (const rule of RULES) {
      if (rule.re.test(raw)) out.push({ file, line: i + 1, sev: rule.sev, id: rule.id, msg: rule.msg });
    }
  }
  return out;
}

const args = Bun.argv.slice(2);
const targets = args.length ? args : [...new Glob("content/notes/*.md").scanSync(".")];

if (!targets.length) { console.log("voice-lint: no files to check."); process.exit(0); }

const findings = targets.flatMap(lintFile);
const tells = findings.filter((f) => f.sev === "tell").length;

for (const f of findings) {
  const tag = f.sev === "tell" ? "TELL" : "warn";
  console.log(`${f.file}:${f.line}: ${tag} [${f.id}] ${f.msg}`);
}

console.log(
  `\nvoice-lint: ${findings.length} flag(s) across ${targets.length} file(s) ` +
    `(${tells} tell, ${findings.length - tells} warn).\n` +
    `This is the MECHANICAL subset of VOICE.md only. The judgment half — texture, the wink, honest ` +
    `limits, the formula tell — is the smell test in standards/VOICE.md, run by a human.`,
);

// A "tell" is a hard machine fingerprint; fail the run so it can gate publish. Warns don't fail.
process.exit(tells > 0 ? 1 : 0);
