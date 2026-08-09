// portfolio/tools/context-usage.ts — how much context this session is actually carrying.
//
// SESSION-LOOP section 5 says a handoff is worth emitting when a fresh context would be cheaper than
// continuing. That has always been a human noticing the thread got long. This is the number that
// judgement was missing, and it is not an estimate: the harness writes a `usage` block on every
// assistant turn to ~/.claude/projects/<slug>/<session-id>.jsonl, and the input side of the NEWEST
// one is the context the model is carrying right now.
//
//   context = input_tokens + cache_creation_input_tokens + cache_read_input_tokens
//
// Output tokens are excluded on purpose: they are what the turn produced, not what it carried in.
// The cached reads are the bulk of it and they are still occupying the window, so counting only
// `input_tokens` (usually single digits once the cache is warm) would report a full session as empty.
//
//   bun tools/context-usage.ts                    # newest transcript for this repo
//   bun tools/context-usage.ts --json             # machine twin, for a hook
//   bun tools/context-usage.ts path/to/x.jsonl    # an explicit transcript
//   bun tools/context-usage.ts --window 1000000 --warn 700000 --stop 900000
//
// Reads a hook payload on stdin too (hooks pass `{"transcript_path": ...}`), so the same file backs
// the CLI and the trigger without a second implementation.
//
// THE LIMITS, because a number like this invites more trust than it has earned:
//   - It reports the last COMPLETED turn. The turn in flight is not in the file yet, so the real
//     figure is always a little higher than this one. Treat it as a floor.
//   - Compaction resets it. A drop is the harness compacting, not the session shrinking, and there
//     is nothing in the file that distinguishes the two.
//   - Subagent turns are excluded (`isSidechain`). They carry their own small contexts and averaging
//     them in would report a nearly full main thread as comfortable.
//   - The window is a DEFAULT, not a reading. Nothing in the transcript states the real limit, so the
//     one below is measured rather than declared: across twelve recent sessions in this project the
//     largest carried 835k on claude-opus-5, with several past 250k. 200k is not this setup's ceiling,
//     it is the number a person remembers from an older model, and a trigger set there would fire
//     halfway through an ordinary session. Pass --warn to put the line wherever you actually want it.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

interface Usage {
  input_tokens?: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
  output_tokens?: number;
}

export interface ContextReading {
  /** the input side of the newest non-sidechain assistant turn — what the model is carrying */
  context: number;
  /** how many assistant turns carried a usage block, so a reading of 0 can be told from an empty file */
  turns: number;
  window: number;
  /** context/window, 0..1+ */
  fraction: number;
  verdict: "ok" | "warn" | "stop";
  transcript: string;
  model?: string;
}

/** Claude Code's per-project transcript dir: the cwd with every non-alphanumeric run turned into "-". */
export function projectSlug(cwd: string): string {
  return cwd.replace(/[^a-zA-Z0-9]/g, "-");
}

/** The newest .jsonl in a project's transcript dir, or null when the dir is absent or empty. */
export function newestTranscript(cwd: string, home = homedir()): string | null {
  const dir = join(home, ".claude", "projects", projectSlug(cwd));
  let entries: string[];
  try {
    entries = readdirSync(dir).filter((f) => f.endsWith(".jsonl"));
  } catch {
    return null;                        // no transcripts for this project — not an error, just nothing to read
  }
  let newest: { path: string; mtime: number } | null = null;
  for (const f of entries) {
    const path = join(dir, f);
    try {
      const m = statSync(path).mtimeMs;
      if (!newest || m > newest.mtime) newest = { path, mtime: m };
    } catch { /* a file that vanished between readdir and stat is not worth failing over */ }
  }
  return newest?.path ?? null;
}

/**
 * Read a transcript and report the context its newest completed assistant turn was carrying.
 * Pure over the file contents so a test can hand it a fixture rather than a real session.
 */
export function readContext(
  raw: string,
  opts: { window?: number; warn?: number; stop?: number; transcript?: string } = {},
): ContextReading {
  const window = opts.window ?? 1_000_000;
  const warn = opts.warn ?? 700_000;      // room to close cleanly: gate, commit, memory, handoff
  const stop = opts.stop ?? 900_000;

  let context = 0;
  let turns = 0;
  let model: string | undefined;

  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    let entry: Record<string, unknown>;
    try {
      entry = JSON.parse(line);
    } catch {
      continue;                          // a half-written last line is normal on a live session
    }
    if (entry.type !== "assistant") continue;
    if (entry.isSidechain === true) continue;          // a subagent's window, not this one
    const message = entry.message as { usage?: Usage; model?: string } | undefined;
    const usage = message?.usage;
    if (!usage) continue;
    turns++;
    // Last one wins rather than the max: after a compaction the newest reading is the true one, and
    // taking the max would keep reporting the pre-compaction peak forever.
    context =
      (usage.input_tokens ?? 0) +
      (usage.cache_creation_input_tokens ?? 0) +
      (usage.cache_read_input_tokens ?? 0);
    model = message?.model ?? model;
  }

  const fraction = window > 0 ? context / window : 0;
  const verdict: ContextReading["verdict"] = context >= stop ? "stop" : context >= warn ? "warn" : "ok";
  return { context, turns, window, fraction, verdict, transcript: opts.transcript ?? "", model };
}

function human(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

export function formatReading(r: ContextReading): string {
  if (!r.turns) return `context: no completed assistant turns in ${r.transcript || "the transcript"} yet.`;
  const pct = Math.round(r.fraction * 100);
  const head = `context: ${human(r.context)} of ${human(r.window)} (${pct}%)${r.model ? ` · ${r.model}` : ""}`;
  if (r.verdict === "stop") {
    return `${head}\n  STOP — past the hand-off line. Make the state durable (gate green, work committed,\n  decisions written), emit the handoff, and continue in a fresh session. SESSION-LOOP section 5.`;
  }
  if (r.verdict === "warn") {
    return `${head}\n  Close to full. Finish the piece in flight, then hand off rather than starting\n  something new here. A handoff written with room left is a handoff worth reading.`;
  }
  return head;
}

// --- CLI ---------------------------------------------------------------------
if (import.meta.main) {
  const argv = Bun.argv.slice(2);
  const num = (flag: string): number | undefined => {
    const i = argv.indexOf(flag);
    if (i === -1) return undefined;
    const v = Number(argv[i + 1]);
    return Number.isFinite(v) ? v : undefined;
  };
  const json = argv.includes("--json");
  const positional = argv.find((a, i) =>
    !a.startsWith("--") && !["--window", "--warn", "--stop"].includes(argv[i - 1] ?? ""));

  // A hook passes its payload on stdin; the CLI gets a path or nothing. Both end up as one path.
  let transcript: string | null = positional ?? null;
  if (!transcript && !process.stdin.isTTY) {
    try {
      const payload = JSON.parse(await Bun.stdin.text()) as { transcript_path?: string };
      transcript = payload.transcript_path ?? null;
    } catch { /* no payload, or not JSON — fall through to the newest transcript */ }
  }
  transcript ??= newestTranscript(process.cwd());

  if (!transcript) {
    console.log("context: no transcript found for this project.");
    process.exit(0);                     // advisory, like the review gate — never fail a turn over this
  }

  let raw: string;
  try {
    raw = readFileSync(transcript, "utf8");
  } catch (err) {
    console.log(`context: could not read ${transcript} (${err instanceof Error ? err.message : String(err)})`);
    process.exit(0);
  }

  const reading = readContext(raw, {
    window: num("--window"), warn: num("--warn"), stop: num("--stop"), transcript,
  });
  // --quiet is the hook mode: say nothing at all until there is something to act on. A turn-end
  // check that prints a reassuring line every turn is a check that gets muted (LOOP section 7).
  if (argv.includes("--quiet") && reading.verdict === "ok") process.exit(0);
  console.log(json ? JSON.stringify(reading) : formatReading(reading));
  process.exit(0);
}
