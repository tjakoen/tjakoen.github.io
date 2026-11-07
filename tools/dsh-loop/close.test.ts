// portfolio/tools/dsh-loop/close.test.ts: the four words, seen deciding each way.
//
// verdictFor is the whole point of the command, and the failure that matters is the quiet one: a
// gate that says CLOSE while this session's own work sits uncommitted, or while the branch it just
// pushed was never merged. So every test here pairs the case that must block with the case that
// must not, and the fixture builder makes the suite read as facts rather than as a mock.
import { test, expect } from "bun:test";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  claimedCount,
  format,
  gather,
  isOnMain,
  parseFrontmatter,
  pathsForSession,
  verdictFor,
} from "./close.ts";
import type { CloseFacts } from "./close.ts";

function facts(overrides: Partial<CloseFacts> = {}): CloseFacts {
  return {
    repo: "/tmp/repo",
    branch: "feat/thing",
    head: "abc1234",
    detached: false,
    defaultBranch: "main",
    base: "origin/main",
    aheadOfDefault: 0,
    contentOnMain: false,
    pr: null,
    upstream: "origin/feat/thing",
    unpushed: 0,
    onRemote: true,
    fetch: "ok",
    mine: { known: true, source: "event log for session-1", paths: ["/tmp/repo/a.ts"] },
    dirtyMine: [],
    dirtyOther: [],
    worktrees: [],
    staleWorktrees: [],
    reportDir: false,
    report: null,
    gate: { ran: false, ok: null, script: null },
    ...overrides,
  };
}

test("merged, pushed and clean is CLOSE", () => {
  const verdict = verdictFor(facts({ aheadOfDefault: 0 }));
  expect(verdict.verdict).toBe("CLOSE");
  expect(verdict.next).toContain("safe to archive");
});

test("a path this session edited, uncommitted, is DO NOT CLOSE", () => {
  const verdict = verdictFor(facts({ aheadOfDefault: 2, dirtyMine: ["tools/a.ts"] }));
  expect(verdict.verdict).toBe("DO NOT CLOSE");
  expect(verdict.blockers.join(" ")).toContain("tools/a.ts");
  expect(verdict.next).toContain("git add tools/a.ts");
});

test("another session's dirty path is a note, never a blocker", () => {
  const verdict = verdictFor(facts({ aheadOfDefault: 0, dirtyOther: ["CLAUDE.md"] }));
  expect(verdict.verdict).toBe("CLOSE WITH NOTES");
  expect(verdict.blockers).toEqual([]);
  expect(verdict.notes.join(" ")).toContain("CLAUDE.md");
});

test("unattributed dirty paths are named as unattributed, and still do not block", () => {
  const verdict = verdictFor(
    facts({
      aheadOfDefault: 0,
      mine: { known: false, source: "no session id", paths: [] },
      dirtyOther: ["a.ts", "b.ts"],
    }),
  );
  expect(verdict.verdict).toBe("CLOSE WITH NOTES");
  expect(verdict.notes.join(" ")).toContain("no attribution");
});

test("pushed but unmerged is HAND OFF, and says what archiving would drop", () => {
  const verdict = verdictFor(facts({ aheadOfDefault: 3 }));
  expect(verdict.verdict).toBe("HAND OFF");
  expect(verdict.blockers).toEqual([]);
  expect(verdict.notes.join(" ")).toContain("no one merged");
  expect(verdict.next).toContain("pull request");
});

test("a branch that exists only on this machine is DO NOT CLOSE", () => {
  const verdict = verdictFor(facts({ aheadOfDefault: 3, onRemote: false, upstream: null }));
  expect(verdict.verdict).toBe("DO NOT CLOSE");
  expect(verdict.blockers.join(" ")).toContain("only here");
  expect(verdict.next).toContain("git push -u origin feat/thing");
});

test("a squash merge counts as on main even though the commits are not ancestors", () => {
  const verdict = verdictFor(facts({ aheadOfDefault: 3, contentOnMain: true }));
  expect(isOnMain(facts({ aheadOfDefault: 3, contentOnMain: true }))).toBe(true);
  expect(verdict.verdict).toBe("CLOSE WITH NOTES");
  expect(verdict.notes.join(" ")).toContain("squash or rebase");
});

test("a merged PR whose head has moved is HAND OFF, not CLOSE", () => {
  const verdict = verdictFor(
    facts({
      aheadOfDefault: 4,
      pr: { number: 7, state: "MERGED", url: "https://x/7", mergedAt: "2026-01-01T00:00:00Z", headMatches: false },
    }),
  );
  expect(verdict.verdict).toBe("HAND OFF");
  expect(verdict.notes.join(" ")).toContain("moved after the merge");
});

test("a merged PR whose head is checked out is on main", () => {
  const merged = facts({
    aheadOfDefault: 4,
    pr: { number: 7, state: "MERGED", url: "https://x/7", mergedAt: "2026-01-01T00:00:00Z", headMatches: true },
  });
  expect(isOnMain(merged)).toBe(true);
  expect(verdictFor(merged).verdict).toBe("CLOSE");
});

test("a red gate blocks, and names what to rerun", () => {
  const verdict = verdictFor(facts({ gate: { ran: true, ok: false, script: "bun run check" } }));
  expect(verdict.verdict).toBe("DO NOT CLOSE");
  expect(verdict.next).toContain("bun run check");
});

test("a stale worktree registration is a note with the command, not a blocker", () => {
  const verdict = verdictFor(facts({ staleWorktrees: ["old-thing"] }));
  expect(verdict.verdict).toBe("CLOSE WITH NOTES");
  expect(verdict.notes.join(" ")).toContain("git worktree prune");
  expect(verdict.next).toContain("git worktree prune");
});

test("a dirty worktree is reported with its path and branch", () => {
  const verdict = verdictFor(
    facts({
      worktrees: [
        { path: "/tmp/wt", branch: "feat/other", dirty: ["a.ts"], merged: true, isMain: false },
      ],
    }),
  );
  expect(verdict.notes.join(" ")).toContain("/tmp/wt");
  expect(verdict.notes.join(" ")).toContain("feat/other");
});

test("a run report claiming complete over work that exists nowhere else is caught", () => {
  const verdict = verdictFor(
    facts({
      aheadOfDefault: 2,
      onRemote: false,
      upstream: null,
      report: { file: "artifacts/runs/x.md", status: "complete", branch: "feat/thing", claimedUnpushed: 2 },
    }),
  );
  expect(verdict.notes.join(" ")).toContain("says complete");
});

test("a run report whose unpushed count disagrees with git is caught", () => {
  const verdict = verdictFor(
    facts({
      aheadOfDefault: 0,
      unpushed: 1,
      report: { file: "artifacts/runs/x.md", status: "complete", branch: "feat/thing", claimedUnpushed: 4 },
    }),
  );
  expect(verdict.notes.join(" ")).toContain("claims 4 unpushed");
});

test("frontmatter reads the fields the report check needs, and ignores list bodies", () => {
  const fields = parseFrontmatter(
    "---\ntitle: A run\nstatus: complete\nbranch: feat/thing\nunpushed: 1 | local\nscope:\n  - src\n  - docs\n---\nbody",
  );
  expect(fields.status).toBe("complete");
  expect(fields.branch).toBe("feat/thing");
  expect(fields.unpushed).toBe("1 | local");
  expect(claimedCount(fields.unpushed)).toBe(1);
  expect(claimedCount(undefined)).toBeNull();
});

test("no frontmatter is an empty object, not a crash", () => {
  expect(parseFrontmatter("# just prose")).toEqual({});
  expect(parseFrontmatter("---\nstatus: done")).toEqual({});
});

test("session paths come only from this session's tool events that carry a path", () => {
  const log = [
    '{"kind":"tool","session":"a","tool":"edit","path":"/r/one.ts"}',
    '{"kind":"tool","session":"b","tool":"edit","path":"/r/two.ts"}',
    '{"kind":"tool","session":"a","tool":"Bash"}',
    '{"kind":"start","session":"a"}',
    "not json",
    '{"kind":"tool","session":"a","tool":"write","path":"/r/one.ts"}',
  ].join("\n");
  expect(pathsForSession(log, "a")).toEqual(["/r/one.ts"]);
});

test("format prints the evidence above the verdict, and reaches every labelled row", () => {
  const fixture = facts({ aheadOfDefault: 2, dirtyMine: ["a.ts"] });
  const text = format(fixture, verdictFor(fixture));
  for (const label of ["branch:", "pr:", "push:", "remote:", "dirty:", "worktrees:", "report:", "gate:"]) {
    expect(text).toContain(label);
  }
  expect(text.indexOf("DO NOT CLOSE")).toBeGreaterThan(text.indexOf("branch:"));
});

function gitIn(cwd: string, args: string[]) {
  return spawnSync("git", args, { cwd, encoding: "utf8" });
}

test("gather reads a real repository: clean main is CLOSE, a local-only branch is not", () => {
  const directory = mkdtempSync(join(tmpdir(), "dsh-close-"));
  try {
    gitIn(directory, ["init", "-b", "main"]);
    gitIn(directory, ["config", "user.email", "test@example.com"]);
    gitIn(directory, ["config", "user.name", "Test"]);
    writeFileSync(join(directory, "a.txt"), "one\n");
    gitIn(directory, ["add", "a.txt"]);
    gitIn(directory, ["commit", "-m", "first"]);

    const clean = gather(directory, { session: "none", fetch: false, worktrees: false });
    expect(clean.defaultBranch).toBe("main");
    expect(clean.aheadOfDefault).toBe(0);
    expect(verdictFor(clean).verdict).toBe("CLOSE");

    gitIn(directory, ["checkout", "-b", "feat/local"]);
    writeFileSync(join(directory, "b.txt"), "two\n");
    gitIn(directory, ["add", "b.txt"]);
    gitIn(directory, ["commit", "-m", "second"]);

    const local = gather(directory, { session: "none", mine: ["b.txt"], fetch: false, worktrees: false });
    expect(local.aheadOfDefault).toBe(1);
    expect(local.onRemote).toBe(false);
    expect(verdictFor(local).verdict).toBe("DO NOT CLOSE");

    writeFileSync(join(directory, "b.txt"), "changed\n");
    const dirty = gather(directory, { session: "none", mine: ["b.txt"], fetch: false, worktrees: false });
    expect(verdictFor(dirty).verdict).toBe("DO NOT CLOSE");
    expect(verdictFor(dirty).blockers.join(" ")).toContain("b.txt");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}, 30000);
