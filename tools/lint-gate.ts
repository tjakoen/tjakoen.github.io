// portfolio/tools/lint-gate.ts — baseline-and-regress lint counting for the turn-end gate.
//
// The repo already carries lint debt: oxlint warnings across src/ and e2e/, and voice-lint flags in
// standards/ now that its default scope covers standards/*.md too (see tools/voice-lint.ts). A
// pass/fail gate over either would be red the day this shipped, and LOOP section 7 names exactly what
// happens next: a gate that starts red gets rationalized ("doctor is noisy, I'll deal with it later")
// and is muted within a week. So this does not grade against zero. It grades against
// tools/lint-baseline.json, a committed snapshot of today's counts, and only speaks up when a count
// goes UP. A regression gets named (which lint, old count, new count, delta); a level result gets
// said out loud too, because a check that only ever complains gets skimmed (session-guard.sh, same
// repo, states that reasoning explicitly and this mirrors it).
//
// Two modes:
//   bun tools/lint-gate.ts            # compute current counts, diff against the baseline, report
//   bun tools/lint-gate.ts --write    # regenerate tools/lint-baseline.json from real current output
//                                      # (this is what `bun run lint:baseline` runs — never hand-edit
//                                      # the JSON; a deliberate increase is updated here, not argued
//                                      # with over a PR comment)
//
// Both lints run here are already fast (oxlint is a native binary, voice-lint is a couple hundred
// lines of regex over a few dozen small files) — see the timing note in the report this script's
// caller (review-gate.sh) was verified with. Nothing here shells out to tsc or the test runner; those
// are `bun run check` / `bun test`, not lint, and are not what a turn-end gate should carry.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

const root = dirname(dirname(new URL(import.meta.url).pathname));
const baselinePath = join(root, "tools", "lint-baseline.json");

type Counts = Record<string, number>;

// oxlint's own JSON reporter gives one diagnostic object per finding with a `code` field shaped like
// `unicorn(no-array-sort)` — that code IS the rule name, so it's the natural per-lint key. Prefixed
// so it can never collide with a voice-lint id in the same flat map.
function oxlintCounts(): Counts {
  const bin = join(root, "node_modules", ".bin", "oxlint");
  if (!existsSync(bin)) return {};
  const res = spawnSync(bin, ["--format", "json"], { cwd: root, encoding: "utf8" });
  // oxlint writes its JSON to stdout and exits nonzero when it found anything — that's expected, not
  // a failure of this script, so the exit code is never checked.
  let parsed: { diagnostics?: { code: string }[] };
  try {
    parsed = JSON.parse(res.stdout || "{}");
  } catch {
    return {};
  }
  const counts: Counts = {};
  for (const d of parsed.diagnostics ?? []) {
    const key = `oxlint:${d.code}`;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

// voice-lint has no machine-readable output mode and doesn't need one just for this — its stdout
// lines are already `file:line: TAG [id] message`, so the id is pulled straight out of the bracket
// rather than reimplementing its rule table here. Running it with no args uses ITS default scope
// (content/notes/*.md + standards/*.md), so this stays in step automatically if that scope ever
// changes again.
function voiceCounts(): Counts {
  const res = spawnSync("bun", ["tools/voice-lint.ts"], { cwd: root, encoding: "utf8" });
  const counts: Counts = {};
  for (const line of (res.stdout || "").split("\n")) {
    const m = line.match(/:\s(?:TELL|warn)\s\[([a-z-]+)\]/);
    if (m) {
      const key = `voice:${m[1]}`;
      counts[key] = (counts[key] ?? 0) + 1;
    }
  }
  return counts;
}

function currentCounts(): Counts {
  return { ...oxlintCounts(), ...voiceCounts() };
}

function loadBaseline(): { generated: string; counts: Counts } | undefined {
  if (!existsSync(baselinePath)) return undefined;
  try {
    return JSON.parse(readFileSync(baselinePath, "utf8"));
  } catch {
    return undefined;
  }
}

function writeBaseline(counts: Counts): void {
  const sorted: Counts = {};
  for (const key of Object.keys(counts).sort()) sorted[key] = counts[key];
  const doc = {
    "//": [
      "Committed lint baseline for the turn-end gate (tools/review-gate.sh) and LOOP section 7's",
      "baseline-and-regress design: this repo shipped with pre-existing oxlint warnings and, once",
      "voice-lint's default scope grew to cover standards/, pre-existing voice-lint flags too. The",
      "gate does not ask for zero; it asks that today's count never becomes tomorrow's problem.",
      "Regenerate with `bun run lint:baseline` — never hand-edit the numbers below. A deliberate",
      "increase (a real new warning you're accepting on purpose) is updated here by rerunning that",
      "command, not argued with in review.",
    ],
    // Local date, not UTC: this machine's UTC offset crosses midnight relative to its wall clock, and
    // "generated" is read by a person deciding whether the baseline is stale, not machine-compared.
    generated: (() => {
      const d = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    })(),
    counts: sorted,
  };
  writeFileSync(baselinePath, `${JSON.stringify(doc, null, 2)}\n`);
}

function report(): void {
  const current = currentCounts();
  const baseline = loadBaseline();
  if (!baseline) {
    console.log("lint gate: no tools/lint-baseline.json yet. Run `bun run lint:baseline` to create one.");
    return;
  }

  const keys = new Set([...Object.keys(current), ...Object.keys(baseline.counts)]);
  const regressions: { key: string; base: number; now: number }[] = [];
  for (const key of keys) {
    const base = baseline.counts[key] ?? 0;
    const now = current[key] ?? 0;
    if (now > base) regressions.push({ key, base, now });
  }

  const totalNow = Object.values(current).reduce((a, b) => a + b, 0);
  const totalBase = Object.values(baseline.counts).reduce((a, b) => a + b, 0);

  if (regressions.length === 0) {
    console.log(
      `lint gate: level. ${totalNow} flag(s) total (oxlint + voice-lint), matching or under the ` +
        `${totalBase} in tools/lint-baseline.json (generated ${baseline.generated}).`,
    );
    return;
  }

  console.log(`lint gate: ${regressions.length} lint(s) regressed against tools/lint-baseline.json:`);
  for (const r of regressions.sort((a, b) => b.now - b.base - (a.now - a.base))) {
    console.log(`  ${r.key}: baseline ${r.base} -> now ${r.now} (+${r.now - r.base})`);
  }
  console.log(
    "A real increase is fine — rerun `bun run lint:baseline` to accept it deliberately. A surprise\n" +
      "one is a warning worth fixing before it joins the baseline permanently.",
  );
}

const args = process.argv.slice(2);
if (args.includes("--write")) {
  writeBaseline(currentCounts());
  console.log(`lint gate: wrote ${baselinePath}`);
} else {
  report();
}
