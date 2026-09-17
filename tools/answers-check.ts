// portfolio/tools/answers-check.ts — count answers in the decision log that nothing has acked.
//
// DECISIONS section 4 built a channel where a question raised by one run is answered and read by
// another, and then said out loud that nothing obliged anyone to look at it. The session-start
// doctor closed half of that: a session opening in this repo sees the count. The half it does not
// close is the week nobody opens a session, which is exactly the week an answer sits longest.
//
// So this is the same count, callable from a hosted runner, with no pantry dependency (LOOP section
// 6 explains why a runner cannot resolve pantry, and a step that silently skips is worse than an
// honest absence). It reads one append-only file and does arithmetic on dates.
//
//   bun tools/answers-check.ts              # human-readable, exits 1 when something is stale
//   bun tools/answers-check.ts --days 14    # a different staleness threshold
//   bun tools/answers-check.ts --markdown   # the shape the weekly sweep pastes into its issue
//
// It is the LOOP section 2a promotion gate condition 1 in miniature: an exit code, not a judgment.
// Nonzero means there is an answer older than the threshold that no session has acted on, which is
// a fact about the log rather than an opinion about whether it mattered.

import { readFile } from "node:fs/promises";

const LOG = "plans/decisions/answers.jsonl";

type Record = {
  kind?: string;
  id?: string;
  at?: string;
  for?: string;
  request?: { question?: string; ref?: string };
  choice?: string;
};

const args = Bun.argv.slice(2);
const markdown = args.includes("--markdown");
const daysFlag = args.indexOf("--days");
const THRESHOLD_DAYS = daysFlag === -1 ? 7 : Number(args[daysFlag + 1] ?? 7);

if (!Number.isFinite(THRESHOLD_DAYS) || THRESHOLD_DAYS < 0) {
  console.error("--days wants a non-negative number");
  process.exit(2);
}

let raw: string;
try {
  raw = await readFile(LOG, "utf8");
} catch {
  // No log is not a failure. A repo that has never routed a decision through the channel has
  // nothing stale in it, and reporting that as red would teach whoever sees it to ignore this check.
  console.log(markdown ? "" : `no answer log at ${LOG}, nothing to check`);
  process.exit(0);
}

const records: Record[] = [];
for (const [i, line] of raw.split("\n").entries()) {
  const trimmed = line.trim();
  if (!trimmed) continue;
  try {
    records.push(JSON.parse(trimmed) as Record);
  } catch {
    // A malformed line is itself worth failing on: this file is appended to by tooling, and a
    // half-written record means a writer crashed mid-append.
    console.error(`${LOG}:${i + 1} is not valid JSON`);
    process.exit(2);
  }
}

const acked = new Set(records.filter((r) => r.kind === "ack" && r.for).map((r) => r.for as string));
const now = Date.now();
const DAY = 86_400_000;

const stale = records
  .filter((r) => r.kind === "answer" && r.id && !acked.has(r.id))
  .map((r) => ({
    id: r.id as string,
    age: Math.floor((now - new Date(r.at ?? 0).getTime()) / DAY),
    question: r.request?.question ?? r.request?.ref ?? "(no question recorded)",
    choice: r.choice ?? "",
  }))
  .filter((r) => r.age >= THRESHOLD_DAYS)
  .toSorted((a, b) => b.age - a.age);

if (markdown) {
  // Silent when clean, because the weekly sweep concatenates these and a section reading "all good"
  // is a section that makes the real findings harder to see.
  if (stale.length > 0) {
    console.log(`### Answers nobody has acted on (${stale.length})\n`);
    for (const r of stale) {
      console.log(`- **${r.age}d** ${r.question}${r.choice ? ` &rarr; answered *${r.choice}*` : ""}`);
    }
    console.log(
      `\nActing on one or deferring it are both one command, and both make this count go down honestly.`,
    );
  }
} else if (stale.length === 0) {
  console.log(`answers: none unacked past ${THRESHOLD_DAYS}d`);
} else {
  console.log(`answers: ${stale.length} unacked past ${THRESHOLD_DAYS}d`);
  for (const r of stale) console.log(`  ${String(r.age).padStart(4)}d  ${r.question}`);
}

process.exit(stale.length > 0 ? 1 : 0);
