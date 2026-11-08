// portfolio/tools/dream.ts — collect the corpus a memory dream reads, and prove it was all read.
//
//   bun run dream export                 # both lanes, private run dir, prints the manifest
//   bun run dream export --lane runs     # just this project's run reports
//   bun run dream export --lane sessions --since 2026-10-01
//   bun run dream verify <run-dir>       # every source in the manifest has an output
//
// WHAT A DREAM IS. A background pass over finished work that improves the memory a future session
// reads: dated facts instead of copies, one small file per fact, an index that still fits the
// context budget. The pattern, and the two-agent shape below, come from Brad Abrams, "Dreaming with
// a dynamic workflow", Claude Cookbook, 2 November 2026:
//   https://platform.claude.com/cookbook/managed-agents-cma-dreaming-with-a-dynamic-workflow
// It is his method applied to this project's inputs. Two lanes here, where his has one:
//
//   runs      artifacts/runs/*.md, this project's own run reports. Compact, dated, already written
//             with hindsight, and 100 times smaller than the transcripts. Read this lane first.
//   sessions  DeepSeek Harness transcripts under ~/.dsh/sessions, one text file per session. Rich
//             and enormous: at the 2026-11-09 export this project's 19 sessions decoded to about
//             130 MB against the cookbook's 12 MB for 50, so a transcript is trimmed head and tail.
//             The manifest records what was clipped and, separately, what the renderer never wrote
//             down at all (reasoning, system prompts, harness notices). Never claim a trimmed
//             transcript was read whole.
//
// THE OUTPUT IS NOT A MEMORY. This tool only produces the corpus and the manifest. The analyzer and
// organizer prompts that turn a corpus into memory live in plans/memory-dream.md, because they are
// the part to change when what the store keeps has to change.
//
// THE PROJECT BOUND IS A FILTER, NOT A GUARANTEE. The session directory is chosen by project, but a
// session run here can hold a tool result that quotes another repository, and the renderer cannot
// tell an employer path from this project's. The run is per project; the material inside one is not.
//
// PRIVACY IS THE REASON FOR THE DEFAULT OUTPUT DIR. A transcript holds every tool result a session
// saw, secrets included, and this is a public repository whose artifacts/ directory is served at
// /artifacts. So the run dir defaults to the system temporary directory, is created 0700, and an
// --out inside the project is refused rather than warned about. The dream's distilled output goes to
// the private memory store; only the run report, written by hand, is published.

import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { basename, isAbsolute, join, relative, resolve, sep } from "node:path";

export const CREDIT = {
  author: "Brad Abrams",
  title: "Dreaming with a dynamic workflow",
  publication: "Claude Cookbook",
  published: "2026-11-02",
  url: "https://platform.claude.com/cookbook/managed-agents-cma-dreaming-with-a-dynamic-workflow",
};

/** One line of a DeepSeek Harness session log. Only the types this renderer keeps are named. */
export type TranscriptEvent = {
  type: string;
  seq?: number;
  time?: number;
  data?: unknown;
  [key: string]: unknown;
};

export type RenderOptions = {
  /** Characters kept from any single tool result. One file read can otherwise own the transcript. */
  maxResultChars: number;
  /** Characters kept from the whole rendered transcript, head and tail. */
  maxChars: number;
};

export type Rendered = {
  text: string;
  events: number;
  elidedChars: number;
};

export const DEFAULTS: RenderOptions = { maxResultChars: 8_000, maxChars: 700_000 };

const SESSION_EVENTS = new Set(["user/message", "assistant/message", "tool/call", "tool/result"]);

function textParts(content: unknown): string {
  if (!Array.isArray(content)) return "";
  const parts: string[] = [];
  for (const part of content) {
    if (!part || typeof part !== "object") continue;
    const p = part as { type?: string; text?: unknown };
    if (p.type === "text" && typeof p.text === "string") parts.push(p.text);
  }
  return parts.join("\n").trim();
}

/**
 * Drop the harness's own furniture before anything is distilled. DeepSeek Harness repeats the
 * workspace instructions and the source-reminder block inside user messages, and a transcript that
 * keeps them spends its budget re-reading AGENTS.md instead of the session.
 */
export function stripHarnessNoise(text: string): string {
  return text
    .replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, "")
    .trim();
}

function clipped(text: string, max: number): { text: string; elided: number } {
  if (text.length <= max) return { text, elided: 0 };
  const elided = text.length - max;
  return { text: `${text.slice(0, max)}\n[... ${elided} characters elided ...]`, elided };
}

/**
 * Keep the head and the tail, drop the middle, and say so in the text. The head carries the ask and
 * the tail carries the conclusions, which is where a long session actually leaves anything durable.
 */
export function trimToBudget(text: string, maxChars: number): { text: string; elided: number } {
  if (text.length <= maxChars) return { text, elided: 0 };
  // The marker is part of the output, so it has to be paid for out of the budget rather than
  // appended to it. Without the reservation the delivered file ran past the cap it advertises.
  const reserve = 200;
  const budget = Math.max(1, maxChars - reserve);
  const headChars = Math.floor(budget * 0.4);
  const tailChars = budget - headChars;
  const head = text.slice(0, headChars);
  const tail = text.slice(text.length - tailChars);
  const elided = text.length - budget;
  return {
    text: `${head}\n\n[... ${elided} characters elided from the middle of this transcript by tools/dream.ts ...]\n\n${tail}`,
    elided,
  };
}

/** Render one session's events into the labeled plain-text form the analyzer reads. */
export function renderTranscript(events: TranscriptEvent[], opts: RenderOptions = DEFAULTS): Rendered {
  const lines: string[] = [];
  const names = new Map<string, string>();
  let elided = 0;

  for (const event of events) {
    if (!SESSION_EVENTS.has(event.type)) continue;
    const data = (event.data ?? {}) as Record<string, unknown>;

    if (event.type === "user/message") {
      const text = stripHarnessNoise(textParts(data.content));
      if (text) lines.push(`USER:\n${text}`);
      continue;
    }

    if (event.type === "assistant/message") {
      const message = (data.message ?? {}) as { content?: unknown };
      const text = textParts(message.content);
      if (text) lines.push(`AGENT:\n${text}`);
      continue;
    }

    if (event.type === "tool/call") {
      const name = String(data.name ?? "tool");
      const id = String(data.callId ?? "");
      if (id) names.set(id, name);
      const raw = typeof data.arguments === "string" ? data.arguments : JSON.stringify(data.arguments ?? {});
      const cut = clipped(raw, 2_000);
      elided += cut.elided;
      lines.push(`TOOL CALL ${name}:\n${cut.text}`);
      continue;
    }

    const message = (data.message ?? {}) as {
      toolCallId?: string;
      isError?: boolean;
      content?: unknown;
    };
    const name = names.get(String(message.toolCallId ?? "")) ?? "tool";
    const body = textParts(message.content);
    const cut = clipped(body, opts.maxResultChars);
    elided += cut.elided;
    const failed = message.isError ? " (error)" : "";
    lines.push(`TOOL RESULT (${name})${failed}:\n${cut.text}`);
  }

  const body = lines.join("\n\n");
  const trimmed = trimToBudget(body, opts.maxChars);
  return { text: trimmed.text, events: lines.length, elidedChars: elided + trimmed.elided };
}

/** A session header, so a dream can date every fact it writes and never trusts a relative date. */
export function sessionHeader(meta: { id: string; createdAt?: number; cwd?: string; parent?: string; origin?: string }): string {
  const when = meta.createdAt ? new Date(meta.createdAt).toISOString().slice(0, 10) : "undated";
  const bits = [`=== SESSION ${meta.id}`, `date: ${when}`];
  if (meta.cwd) bits.push(`cwd: ${meta.cwd}`);
  if (meta.origin) bits.push(`origin: ${meta.origin}`);
  if (meta.parent) bits.push(`parent: ${meta.parent}`);
  return bits.join("\n");
}

/** A filename this tool is willing to write, or an empty string. Never returns a path. */
export function safeName(raw: string): string {
  const clean = raw.replace(/[^A-Za-z0-9._-]/g, "-").replace(/^\.+/, "");
  if (!clean || clean === "." || clean === "..") return "";
  return clean.slice(0, 120);
}

/** DeepSeek Harness names a project's session directory after its path, dots kept. */
export function dshSlug(cwd: string): string {
  return `--${resolve(cwd).split(sep).filter(Boolean).join("-")}--`;
}

function realOrResolved(path: string): string {
  try {
    return realpathSync(path);
  } catch {
    return resolve(path);
  }
}

/**
 * True when target is the root itself or sits under it. Used to keep transcripts out of the repo.
 * Both sides go through realpath, because a symlink pointing from a temporary directory into the
 * repository would otherwise read as outside it. The caller checks again after creating the
 * directory, since a path that does not exist yet cannot be resolved.
 */
export function isInside(root: string, target: string): boolean {
  const rel = relative(realOrResolved(root), realOrResolved(target));
  if (rel === "") return true;
  // A name like "..foo" starts with two dots and is still a child. Only ".." and "../x" climb.
  const outside = rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel);
  return !outside;
}

function unzstd(file: string): string {
  const raw = readFileSync(file);
  if (file.endsWith(".zstd")) {
    // Bun ships the codec, so the tool needs no external binary. zstd on PATH is the fallback.
    const bun = Bun as unknown as { zstdDecompressSync?: (data: Uint8Array) => Uint8Array };
    if (typeof bun.zstdDecompressSync === "function") {
      return new TextDecoder().decode(bun.zstdDecompressSync(raw));
    }
    const out = spawnSync("zstd", ["-dc", file], { maxBuffer: 1 << 30 });
    if (out.status !== 0) throw new Error(`zstd failed on ${file}: ${out.stderr.toString().trim()}`);
    return out.stdout.toString("utf8");
  }
  return raw.toString("utf8");
}

export function parseEvents(text: string): { events: TranscriptEvent[]; skipped: number } {
  const events: TranscriptEvent[] = [];
  let skipped = 0;
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    try {
      events.push(JSON.parse(line) as TranscriptEvent);
    } catch {
      // A truncated final line is a crash, not a fact. Count it, because verify must show it.
      skipped += 1;
    }
  }
  return { events, skipped };
}

export type Source = {
  id: string;
  lane: "runs" | "sessions";
  inputPath: string;
  outputPath: string;
  inputBytes: number;
  outputBytes: number;
  /** Clipped from a tool result, or cut out of the middle by the per-source cap. */
  elidedChars: number;
  /** Sessions only: the plain text the log decoded to, before the renderer dropped anything. */
  decompressedBytes?: number;
  /** Sessions only: reasoning, system prompts, harness notices and the session header. */
  droppedChars?: number;
  /** Session events that reached the text. A header-only file means the log said nothing. */
  events?: number;
  /** Lines that would not parse. A nonzero count means the log was damaged, not merely long. */
  skipped?: number;
  /** Run reports folded into one corpus file. One for the runs lane, absent for a session. */
  parts?: number;
};

/**
 * The frontmatter block, or nothing. This used to read only the first 400 characters, which is less
 * than a real run report spends on a long title and its fields, so `date:` fell outside the window,
 * the date came back undefined, and --since quietly skipped every report. A regression test carries
 * a deliberately long title.
 */
function frontmatterBlock(markdown: string): string | undefined {
  return /^---\r?\n([\s\S]*?)\r?\n---/.exec(markdown)?.[1];
}

export function frontmatterDate(markdown: string): string | undefined {
  const block = frontmatterBlock(markdown);
  if (!block) return undefined;
  return /^date:\s*(\S+)/m.exec(block)?.[1];
}

export function frontmatterTitle(markdown: string): string | undefined {
  const block = frontmatterBlock(markdown);
  if (!block) return undefined;
  return /^title:\s*(.+)$/m.exec(block)?.[1].trim();
}

function runSources(root: string, outDir: string, since?: string): { source?: Source; corpus: string; parts: number; undated: number } {
  const dir = join(root, "artifacts", "runs");
  if (!existsSync(dir)) return { corpus: "", parts: 0, undated: 0 };
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .toSorted();
  const sections: string[] = [];
  let undated = 0;

  for (const file of files) {
    const path = join(dir, file);
    const markdown = readFileSync(path, "utf8");
    const date = frontmatterDate(markdown);
    // An undated report cannot be checked against a start date, so --since skips it and counts it
    // rather than silently including a report that may predate the window.
    if (since && (!date || date < since)) {
      if (!date) undated += 1;
      continue;
    }
    const title = frontmatterTitle(markdown) ?? file;
    sections.push(`## RUN ${date ?? "undated"}: ${title}\n\n${markdown.trim()}`);
  }
  return { corpus: sections.join("\n\n---\n\n"), parts: sections.length, undated };
}

function sessionSources(
  sessionsDir: string,
  outDir: string,
  opts: RenderOptions,
  since?: string,
): { sources: Source[]; skippedIds: string[]; sessionCount: number } {
  if (!existsSync(sessionsDir)) return { sources: [], skippedIds: [], sessionCount: 0 };
  const sources: Source[] = [];
  const skippedIds: string[] = [];
  let sessionCount = 0;
  const sessionOut = join(outDir, "sessions");
  mkdirSync(sessionOut, { recursive: true, mode: 0o700 });

  for (const entry of readdirSync(sessionsDir).toSorted()) {
    const dir = join(sessionsDir, entry);
    if (!statSync(dir).isDirectory()) continue;
    const log = existsSync(join(dir, "session.v4.jsonl.zstd"))
      ? join(dir, "session.v4.jsonl.zstd")
      : join(dir, "session.v4.jsonl");
    if (!existsSync(log)) continue;

    const decoded = unzstd(log);
    const parsed = parseEvents(decoded);
    const events = parsed.events;
    const meta = events.find((e) => e.type === "session") ?? ({ type: "session" } as TranscriptEvent);
    // The id becomes a filename. A log that names itself "../x" must not steer the write, so the
    // sanitized form is used for the path and the raw one is reported for a human to look at.
    const rawId = String(meta.id ?? entry);
    const id = safeName(rawId);
    if (!id) {
      skippedIds.push(rawId);
      continue;
    }
    const createdAt = Number(meta.createdAt ?? 0) || undefined;
    if (since) {
      const date = createdAt ? new Date(createdAt).toISOString().slice(0, 10) : undefined;
      if (!date || date < since) continue;
    }

    // The header and the title line are written around the rendered text, so their room comes out
    // of the same budget. Otherwise the delivered file is the cap plus a header, which is what the
    // first version shipped while claiming the cap held.
    const rendered = renderTranscript(events, { ...opts, maxChars: Math.max(1, opts.maxChars - 400) });
    const header = sessionHeader({
      id,
      createdAt,
      cwd: typeof meta.cwd === "string" ? meta.cwd : undefined,
      parent: typeof meta.parentSession === "string" ? meta.parentSession : undefined,
      origin: typeof meta.origin === "string" ? meta.origin : undefined,
    });
    const title = events.find((e) => e.type === "session/title")?.data as { title?: string } | undefined;
    sessionCount += 1;
    const body = `${header}\ntitle: ${title?.title ?? "untitled"}\n\n${rendered.text}\n`;
    const outputPath = join(sessionOut, `${id}.txt`);
    writeFileSync(outputPath, body, { mode: 0o600 });
    chmodSync(outputPath, 0o600);

    sources.push({
      id: `session:${id}`,
      lane: "sessions",
      inputPath: log,
      outputPath,
      inputBytes: statSync(log).size,
      decompressedBytes: Buffer.byteLength(decoded),
      droppedChars: Math.max(0, Buffer.byteLength(decoded) - Buffer.byteLength(body)),
      outputBytes: Buffer.byteLength(body),
      elidedChars: rendered.elidedChars,
      events: rendered.events,
      skipped: parsed.skipped,
    });
  }
  return { sources, skippedIds, sessionCount };
}

export type Manifest = {
  tool: string;
  method: typeof CREDIT;
  generatedAt: string;
  project: string;
  out: string;
  lanes: string[];
  maxChars: number;
  maxResultChars: number;
  since?: string;
  sources: Source[];
  totals: {
    sources: number;
    inputBytes: number;
    outputBytes: number;
    elidedChars: number;
    droppedChars?: number;
  };
};

/**
 * What an index promises: a line for every note that exists, and no line for a note that does not.
 * Pure, because the comparison is the whole check and it should be provable without a store.
 */
export function indexCoverage(
  indexText: string,
  files: string[],
): { missing: string[]; dead: string[]; duplicates: string[]; linked: number } {
  const linked = [...indexText.matchAll(/\]\(([^)\s]+\.md)\)/g)].map((m) => m[1]);
  const unique = [...new Set(linked)];
  const notes = files.filter((f) => f.endsWith(".md") && f !== "MEMORY.md");
  return {
    missing: notes.filter((f) => !unique.includes(f)),
    dead: unique.filter((f) => !notes.includes(f)),
    duplicates: unique.filter((f) => linked.filter((l) => l === f).length > 1),
    linked: unique.length,
  };
}

/** Every source in the manifest has an output, and the output is not empty. The cookbook's own check. */
export function coverage(manifest: Manifest): { total: number; missing: string[] } {
  const missing = manifest.sources
    .filter((s) => !existsSync(s.outputPath) || statSync(s.outputPath).size === 0)
    .map((s) => s.id);
  return { total: manifest.sources.length, missing };
}

function human(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** The repository root, not the shell's cwd. Exported so a test can prove it is the repo. */
export const ROOT = resolve(import.meta.dir, "..");

function exportCommand(args: string[]): number {
  // Run from tools/ with --out ../artifacts and a cwd-based root calls the served public tree
  // "outside the project", which is exactly the wrong answer.
  const root = ROOT;
  const lane = flag(args, "lane") ?? "both";
  if (!["both", "runs", "sessions"].includes(lane)) {
    console.error(`dream: --lane must be runs, sessions or both, not "${lane}".`);
    return 2;
  }
  const since = flag(args, "since");
  const maxChars = positiveInt(flag(args, "max-chars"), DEFAULTS.maxChars);
  const maxResultChars = positiveInt(flag(args, "max-result-chars"), DEFAULTS.maxResultChars);
  if (maxChars === null || maxResultChars === null) {
    console.error("dream: --max-chars and --max-result-chars take a positive whole number.");
    return 2;
  }
  const stamp = new Date().toISOString().replaceAll(":", "-").replace(/\..+$/, "");
  const requested = flag(args, "out") ?? join(tmpdir(), `dsh-dream-${basename(root)}-${stamp}`);
  const outDir = resolve(requested);

  if (isInside(root, outDir)) {
    console.error(
      `dream: refusing --out ${outDir}: it is inside the project. A transcript holds every tool result\n` +
        `the session saw, and this repository publishes artifacts/. Write the run dir somewhere private.`,
    );
    return 2;
  }
  mkdirSync(outDir, { recursive: true, mode: 0o700 });
  chmodSync(outDir, 0o700);
  if (isInside(root, outDir)) {
    console.error(`dream: refusing --out ${outDir}: it resolves inside the project through a symlink.`);
    return 2;
  }

  const opts: RenderOptions = { maxChars, maxResultChars };
  const lanes = lane === "both" ? ["runs", "sessions"] : [lane];
  const sources: Source[] = [];
  const notes: string[] = [];

  if (lanes.includes("runs")) {
    const { corpus, parts, undated } = runSources(root, outDir, since);
    if (parts > 0) {
      const trimmed = trimToBudget(corpus, Math.max(maxChars, 1_200_000));
      const outputPath = join(outDir, "runs.md");
      writeFileSync(outputPath, trimmed.text);
      sources.push({
        id: "runs:corpus",
        lane: "runs",
        inputPath: join(root, "artifacts", "runs"),
        outputPath,
        inputBytes: Buffer.byteLength(corpus),
        outputBytes: statSync(outputPath).size,
        elidedChars: trimmed.elided,
        parts,
      });
      if (undated) notes.push(`${undated} undated run report(s) skipped by --since`);
    }
  }

  if (lanes.includes("sessions")) {
    const sessionsDir = join(homedir(), ".dsh", "sessions", dshSlug(root));
    const read = sessionSources(sessionsDir, outDir, opts, since);
    sources.push(...read.sources);
    for (const bad of read.skippedIds) notes.push(`session id refused as a filename: ${bad}`);
    if (!read.sessionCount) notes.push(`no session log under ${sessionsDir}`);
  }

  const manifest: Manifest = {
    tool: "tools/dream.ts",
    method: CREDIT,
    generatedAt: new Date().toISOString(),
    project: root,
    out: outDir,
    lanes,
    maxChars,
    maxResultChars,
    ...(since ? { since } : {}),
    sources,
    totals: {
      sources: sources.length,
      inputBytes: sources.reduce((n, s) => n + s.inputBytes, 0),
      outputBytes: sources.reduce((n, s) => n + s.outputBytes, 0),
      elidedChars: sources.reduce((n, s) => n + s.elidedChars, 0),
      droppedChars: sources.reduce((n, s) => n + (s.droppedChars ?? 0), 0),
    },
  };
  writeFileSync(join(outDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(`dream: corpus in ${outDir}`);
  for (const laneName of lanes) {
    const group = sources.filter((s) => s.lane === laneName);
    if (!group.length) {
      console.log(`  ${laneName}: none`);
      continue;
    }
    if (laneName === "runs") {
      const corpus = group[0];
      console.log(
        `  runs: 1 corpus of ${corpus.parts} report(s), ${human(corpus.inputBytes)} in, ${human(corpus.outputBytes)} out`,
      );
      continue;
    }
    const input = group.reduce((n, s) => n + s.inputBytes, 0);
    const output = group.reduce((n, s) => n + s.outputBytes, 0);
    const elided = group.reduce((n, s) => n + s.elidedChars, 0);
    const dropped = group.reduce((n, s) => n + (s.droppedChars ?? 0), 0);
    console.log(
      `  sessions: ${group.length} session(s), ${human(input)} compressed in, ${human(output)} out` +
        (elided ? `, ${human(elided)} elided` : "") +
        (dropped ? `, ${human(dropped)} never rendered` : ""),
    );
  }
  for (const note of notes) console.log(`  ${note}`);
  console.log(`  manifest: ${join(outDir, "manifest.json")}`);
  return 0;
}

function positiveInt(raw: string | undefined, fallback: number): number | null {
  if (raw === undefined) return fallback;
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : null;
}

function verifyCommand(args: string[]): number {
  const dir = resolve(args[1] ?? "");
  const file = join(dir, "manifest.json");
  if (!existsSync(file)) {
    console.error(`dream verify: no manifest at ${file}. Run export first.`);
    return 2;
  }
  const manifest = JSON.parse(readFileSync(file, "utf8")) as Manifest;
  const { total, missing } = coverage(manifest);
  console.log(`dream verify: ${total - missing.length} of ${total} source(s) have an output in ${dir}`);

  // An output that exists is not proof that anything was read in it. A header-only session, a log
  // that would not parse, and an empty lane all pass an existence check and all make a dream lie.
  const thin = manifest.sources.filter((s) => (s.events ?? 1) === 0 || (s.inputBytes ?? 0) === 0);
  const damaged = manifest.sources.filter((s) => (s.skipped ?? 0) > 0);
  const partial = manifest.sources.filter((s) => s.elidedChars > 0);

  for (const id of missing) console.log(`  MISSING ${id}`);
  for (const s of thin) console.log(`  EMPTY ${s.id}: an output with nothing read from it`);
  for (const s of damaged) console.log(`  DAMAGED ${s.id}: ${s.skipped} line(s) would not parse`);
  for (const s of partial) {
    console.log(`  partial ${s.id}: ${human(s.elidedChars)} elided, do not record a fact it may have held`);
  }
  if (manifest.totals.droppedChars) {
    console.log(
      `  never rendered: ${human(manifest.totals.droppedChars)} of reasoning, system prompts, harness notices` +
        ` and headers, so the corpus is not the session`,
    );
  }
  const failed = missing.length + thin.length + damaged.length + (total === 0 ? 1 : 0);
  if (total === 0) console.log("  NO SOURCES: nothing was exported for this lane");
  return failed ? 1 : 0;
}

function checkIndexCommand(args: string[]): number {
  const dir = resolve(args[1] ?? "");
  const index = join(dir, "MEMORY.md");
  if (!existsSync(index)) {
    console.error(`dream check-index: no MEMORY.md in ${dir}.`);
    return 2;
  }
  const files = readdirSync(dir);
  const found = indexCoverage(readFileSync(index, "utf8"), files);
  const ok = !found.missing.length && !found.dead.length && !found.duplicates.length;
  console.log(
    `dream check-index: ${found.linked} link(s) across ${files.filter((f) => f.endsWith(".md") && f !== "MEMORY.md").length} note(s)` +
      (ok ? ", every note covered and every line real" : ""),
  );
  for (const f of found.missing) console.log(`  UNINDEXED ${f}`);
  for (const f of found.dead) console.log(`  DEAD ${f}`);
  for (const f of found.duplicates) console.log(`  TWICE ${f}`);
  return ok ? 0 : 1;
}

function flag(args: string[], name: string): string | undefined {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : undefined;
}

if (import.meta.main) {
  const [command = "help", ...rest] = Bun.argv.slice(2);
  const code =
    command === "export"
      ? exportCommand(rest)
      : command === "verify"
        ? verifyCommand([command, ...rest])
        : command === "check-index"
          ? checkIndexCommand([command, ...rest])
        : (console.log(
            `dream: build the corpus a memory dream reads.\n\n` +
              `  bun run dream export [--lane runs|sessions|both] [--since YYYY-MM-DD]\n` +
              `                      [--max-chars N] [--max-result-chars N] [--out DIR]\n` +
              `  bun run dream verify <run-dir>\n` +
              `  bun run dream check-index <store-dir>\n\n` +
              `Method: ${CREDIT.author}, "${CREDIT.title}", ${CREDIT.publication}, ${CREDIT.published}.\n${CREDIT.url}\n` +
              `Prompts and guardrails: plans/memory-dream.md.`,
          ),
          0);
  process.exitCode = code;
}
