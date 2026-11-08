// tools/dsh-loop/close.ts: the evidence behind "can we archive this session?"
//
// The close skill states the checks in prose a session has to remember to read, and then has to
// judge. This module runs the same checks and returns one of the four words that skill already
// defines, so the answer stops depending on whether the session felt finished. It is read only:
// the worktree check runs prune dry, and the commands that delete anything are printed, never run.
//
// The rule that keeps it usable instead of ignored: a dirty tree is not a verdict. Eleven paths
// from other sessions were sitting in this repository the day this was written. So every blocking
// check is scoped to the paths this session edited, read from the per-project event log the DSH
// plugin appends to. Anything that cannot be attributed is a note, and the verdict says so.
//
// The other rule is the owner's own reading of "clean on main": it means this session's work, not
// the estate. Another session's unmerged branch is not a reason to hold this one open, and
// reporting it as one is how a close gate gets muted.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { dreamClock, dreamDueLine, dreamLimits, isDreamDue } from '../dream.ts';

export type PrFacts = {
  number: number;
  state: string;
  url: string;
  mergedAt: string | null;
  /** The PR's head commit is the commit checked out now. */
  headMatches: boolean;
};

export type WorktreeFacts = {
  path: string;
  branch: string | null;
  dirty: string[];
  /** The worktree's commit is contained in the default branch. null when it could not be read. */
  merged: boolean | null;
  isMain: boolean;
};

export type ReportFacts = {
  file: string;
  status: string | null;
  branch: string | null;
  claimedUnpushed: number | null;
} | null;

export type MineFacts = {
  known: boolean;
  source: string;
  paths: string[];
};

export type CloseFacts = {
  repo: string;
  branch: string;
  head: string;
  detached: boolean;
  defaultBranch: string;
  base: string;
  /** Commits on HEAD that the default branch does not have. */
  aheadOfDefault: number;
  /** Every commit on HEAD is already applied on the default branch by patch id (squash or rebase). */
  contentOnMain: boolean;
  pr: PrFacts | null;
  upstream: string | null;
  unpushed: number;
  /** A remote branch contains HEAD, under any name. */
  onRemote: boolean;
  fetch: 'ok' | 'failed' | 'skipped';
  mine: MineFacts;
  dirtyMine: string[];
  dirtyOther: string[];
  worktrees: WorktreeFacts[];
  staleWorktrees: string[];
  /** The repository keeps a run ledger at artifacts/runs. */
  reportDir: boolean;
  report: ReportFacts;
  /** The memory store is overdue a dream, when this repository carries the dream tool. */
  dream?: { due: boolean; line: string } | null;
  gate: { ran: boolean; ok: boolean | null; script: string | null };
};

export type Verdict = {
  verdict: 'CLOSE' | 'CLOSE WITH NOTES' | 'HAND OFF' | 'DO NOT CLOSE';
  blockers: string[];
  notes: string[];
  next: string;
  onMain: boolean;
};

export type CloseOptions = {
  session?: string;
  mine?: string[];
  fetch?: boolean;
  gate?: boolean;
  worktrees?: boolean;
  /** Read the pull request state through gh. The stop hook turns this off to stay offline. */
  pr?: boolean;
};

type Run = { ok: boolean; status: number | null; stdout: string; stderr: string };

function run(program: string, args: string[], cwd: string, timeout = 20000): Run {
  const result = spawnSync(program, args, { cwd, encoding: 'utf8', timeout });
  return {
    ok: result.status === 0,
    status: result.status,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

function git(cwd: string, args: string[], timeout = 20000): Run {
  return run('git', args, cwd, timeout);
}

function out(cwd: string, args: string[]): string {
  return git(cwd, args).stdout.trim();
}

function list(paths: string[], limit = 4): string {
  if (paths.length <= limit) return paths.join(', ');
  return `${paths.slice(0, limit).join(', ')} and ${paths.length - limit} more`;
}

function has(cwd: string, args: string[]): boolean {
  return git(cwd, args).ok;
}

/** The log the DSH plugin and the Claude hooks both append to, keyed by cwd. */
export function projectSlug(cwd: string): string {
  return [...String(cwd)]
    .map((character) => (/^[A-Za-z0-9]$/.test(character) ? character : '-'))
    .join('');
}

export function sessionLogPath(cwd: string): string {
  const configDir = process.env.CLAUDE_CONFIG_DIR || join(homedir(), '.claude');
  return join(configDir, 'projects', projectSlug(cwd), 'sessions.jsonl');
}

/** Absolute paths this session edited, from the event log. Bash commands carry no path. */
export function pathsForSession(logText: string, session: string): string[] {
  const paths = new Set<string>();
  for (const line of logText.split('\n')) {
    if (!line.trim()) continue;
    let event: { kind?: string; session?: string; path?: unknown };
    try {
      event = JSON.parse(line);
    } catch {
      continue;
    }
    if (event.kind !== 'tool') continue;
    if (event.session !== session) continue;
    if (typeof event.path === 'string' && event.path) paths.add(event.path);
  }
  return [...paths];
}

export function readMine(repo: string, options: CloseOptions): MineFacts {
  const explicit = (options.mine ?? []).map((path) => resolve(repo, path));
  const session = options.session ?? process.env.DSH_SESSION_ID ?? '';
  const file = sessionLogPath(repo);
  const known = Boolean(session) && existsSync(file);
  const logged = known ? pathsForSession(readFileSync(file, 'utf8'), session) : [];
  const paths = [...new Set([...logged.map((path) => resolve(path)), ...explicit])];
  const source = !session
    ? 'no session id (set --session or DSH_SESSION_ID)'
    : !existsSync(file)
      ? `no event log at ${file}`
      : `event log for ${session}`;
  return { known: known || explicit.length > 0, source, paths };
}

/** Porcelain v1, NUL separated, so a path with spaces or a rename survives the parse. */
export function statusPaths(cwd: string): string[] {
  const result = git(cwd, ['status', '--porcelain', '-z', '--untracked-files=normal']);
  if (!result.ok) return [];
  const parts = result.stdout.split('\0');
  const paths: string[] = [];
  for (let index = 0; index < parts.length; index += 1) {
    const entry = parts[index];
    if (!entry || entry.length < 4) continue;
    const code = entry.slice(0, 2);
    const path = entry.slice(3);
    if (code[0] === 'R' || code[0] === 'C') index += 1;
    paths.push(path);
  }
  return paths;
}

export function parseFrontmatter(text: string): Record<string, string> {
  if (!text.startsWith('---')) return {};
  const end = text.indexOf('\n---', 3);
  if (end === -1) return {};
  const fields: Record<string, string> = {};
  for (const line of text.slice(3, end).split('\n')) {
    const match = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line);
    if (match) fields[match[1]] = match[2].trim();
  }
  return fields;
}

export function claimedCount(value: string | null | undefined): number | null {
  if (!value) return null;
  const match = /^(\d+)/.exec(value.trim());
  return match ? Number(match[1]) : null;
}

function readReport(repo: string, branch: string): ReportFacts {
  const directory = join(repo, 'artifacts', 'runs');
  if (!existsSync(directory)) return null;
  let best: { name: string; mtime: number; fields: Record<string, string> } | null = null;
  for (const name of readdirSync(directory)) {
    if (!name.endsWith('.md')) continue;
    const file = join(directory, name);
    let fields: Record<string, string>;
    let mtime: number;
    try {
      fields = parseFrontmatter(readFileSync(file, 'utf8'));
      mtime = statSync(file).mtimeMs;
    } catch {
      continue;
    }
    if (fields.branch !== branch) continue;
    if (!best || mtime > best.mtime) best = { name, mtime, fields };
  }
  if (!best) return null;
  return {
    file: `artifacts/runs/${best.name}`,
    status: best.fields.status ?? null,
    branch: best.fields.branch ?? null,
    claimedUnpushed: claimedCount(best.fields.unpushed),
  };
}

function readPr(repo: string, branch: string, head: string): PrFacts | null {
  if (!git(repo, ['remote']).stdout.trim() || branch === 'HEAD' || branch === '') return null;
  const result = run(
    'gh',
    ['pr', 'list', '--head', branch, '--state', 'all', '--limit', '10', '--json', 'number,state,mergedAt,url,headRefOid'],
    repo,
    12000,
  );
  if (!result.ok || !result.stdout.trim()) return null;
  let rows: { number: number; state: string; mergedAt: string | null; url: string; headRefOid: string }[];
  try {
    rows = JSON.parse(result.stdout);
  } catch {
    return null;
  }
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const chosen = rows.find((candidate) => candidate.headRefOid === head) ?? rows[0];
  return {
    number: chosen.number,
    state: chosen.state,
    url: chosen.url,
    mergedAt: chosen.mergedAt ?? null,
    headMatches: chosen.headRefOid === head,
  };
}

function readWorktrees(repo: string, base: string): { worktrees: WorktreeFacts[]; stale: string[] } {
  const porcelain = git(repo, ['worktree', 'list', '--porcelain']).stdout;
  const root = resolve(repo);
  const worktrees: WorktreeFacts[] = [];
  for (const block of porcelain.split('\n\n')) {
    const fields = new Map<string, string>();
    for (const line of block.split('\n')) {
      const index = line.indexOf(' ');
      if (index === -1) continue;
      fields.set(line.slice(0, index), line.slice(index + 1).trim());
    }
    const path = fields.get('worktree');
    if (!path) continue;
    const head = fields.get('HEAD');
    const branchRef = fields.get('branch') ?? null;
    const merged = head ? has(repo, ['merge-base', '--is-ancestor', head, base]) : null;
    worktrees.push({
      path,
      branch: branchRef ? branchRef.replace('refs/heads/', '') : null,
      dirty: statusPaths(path),
      merged,
      isMain: resolve(path) === root,
    });
  }
  const stale = git(repo, ['worktree', 'prune', '--dry-run', '--verbose'])
    .stdout.split('\n')
    .map((line) => /Removing worktrees\/(.+?):/.exec(line))
    .filter((match): match is RegExpExecArray => Boolean(match))
    .map((match) => match[1]);
  return { worktrees, stale };
}

function discoverGate(repo: string): { runner: string; script: string } | null {
  const manifest = join(repo, 'package.json');
  if (!existsSync(manifest)) return null;
  let scripts: Record<string, string> = {};
  try {
    scripts = JSON.parse(readFileSync(manifest, 'utf8')).scripts ?? {};
  } catch {
    return null;
  }
  const script = ['check', 'typecheck', 'gate'].find((name) => typeof scripts[name] === 'string');
  if (!script) return null;
  const runner = existsSync(join(repo, 'bun.lock')) || existsSync(join(repo, 'bun.lockb')) ? 'bun' : 'npm';
  return { runner, script };
}

export function gather(repo: string, options: CloseOptions = {}): CloseFacts {
  const branchRaw = out(repo, ['rev-parse', '--abbrev-ref', 'HEAD']);
  const detached = branchRaw === 'HEAD';
  const branch = branchRaw || 'HEAD';
  const fullHead = out(repo, ['rev-parse', 'HEAD']);
  const head = fullHead.slice(0, 7);

  const candidates = [
    out(repo, ['symbolic-ref', '--short', 'refs/remotes/origin/HEAD']).replace(/^origin\//, ''),
    'main',
    'master',
  ];
  const defaultBranch =
    candidates.find(
      (name) => name && has(repo, ['rev-parse', '--verify', '--quiet', `refs/remotes/origin/${name}`]),
    ) ??
    candidates.find((name) => name && has(repo, ['rev-parse', '--verify', '--quiet', `refs/heads/${name}`])) ??
    'main';

  let fetch: CloseFacts['fetch'] = 'skipped';
  if (options.fetch !== false && has(repo, ['remote'])) {
    fetch = git(repo, ['fetch', '--quiet', '--prune', 'origin', defaultBranch], 15000).ok ? 'ok' : 'failed';
  }

  const remoteBase = `refs/remotes/origin/${defaultBranch}`;
  const base = has(repo, ['rev-parse', '--verify', '--quiet', remoteBase]) ? `origin/${defaultBranch}` : defaultBranch;

  const aheadOfDefault = Number(out(repo, ['rev-list', '--count', `${base}..HEAD`]) || '0');
  const cherry = git(repo, ['cherry', base, 'HEAD']);
  const unmergedPatches = cherry.ok
    ? cherry.stdout.split('\n').filter((line) => line.startsWith('+')).length
    : null;
  const contentOnMain = aheadOfDefault > 0 && unmergedPatches === 0;

  const upstream = out(repo, ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']) || null;
  const unpushed = upstream ? Number(out(repo, ['rev-list', '--count', `${upstream}..HEAD`]) || '0') : 0;
  const containing = git(repo, ['branch', '-r', '--contains', 'HEAD']).stdout
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.includes('->'));
  const remoteBranch =
    !detached && has(repo, ['rev-parse', '--verify', '--quiet', `refs/remotes/origin/${branch}`]);
  const onRemote = containing.length > 0 || remoteBranch;

  const mine = readMine(repo, options);
  const dirty = statusPaths(repo).map((path) => path);
  const mineSet = new Set(mine.paths);
  const dirtyMine: string[] = [];
  const dirtyOther: string[] = [];
  for (const path of dirty) {
    const absolute = resolve(repo, path);
    if (mine.known && mineSet.has(absolute)) dirtyMine.push(path);
    else dirtyOther.push(path);
  }

  const worked = options.worktrees !== false ? readWorktrees(repo, base) : { worktrees: [], stale: [] };

  let gate: CloseFacts['gate'] = { ran: false, ok: null, script: null };
  if (options.gate) {
    const found = discoverGate(repo);
    if (found) {
      gate = {
        ran: true,
        ok: run(found.runner, ['run', found.script], repo, 240000).ok,
        script: `${found.runner} run ${found.script}`,
      };
    } else {
      gate = { ran: false, ok: null, script: null };
    }
  }

  return {
    repo,
    branch,
    head,
    detached,
    defaultBranch,
    base,
    aheadOfDefault,
    contentOnMain,
    pr: options.pr === false ? null : readPr(repo, branch, fullHead),
    upstream,
    unpushed,
    onRemote,
    fetch,
    mine,
    dirtyMine,
    dirtyOther,
    worktrees: worked.worktrees,
    staleWorktrees: worked.stale,
    reportDir: existsSync(join(repo, 'artifacts', 'runs')),
    report: readReport(repo, branch),
    dream: readDream(repo),
    gate,
  };
}

/**
 * The dream nudge, read from the project's own tool rather than reimplemented here. A repository
 * without tools/dream.ts has no memory store to maintain, so it reports null and says nothing.
 */
export function readDream(repo: string): CloseFacts['dream'] {
  if (!existsSync(join(repo, 'tools', 'dream.ts'))) return null;
  try {
    const clock = dreamClock(repo);
    if (!clock) return null;
    const due = isDreamDue(clock, dreamLimits());
    return { due, line: due ? dreamDueLine(clock) : '' };
  } catch {
    return null;
  }
}

export function isOnMain(facts: CloseFacts): boolean {
  if (facts.aheadOfDefault === 0) return true;
  if (facts.contentOnMain) return true;
  return Boolean(facts.pr?.mergedAt && facts.pr.headMatches);
}

export function verdictFor(facts: CloseFacts): Verdict {
  const blockers: string[] = [];
  const notes: string[] = [];
  const onMain = isOnMain(facts);

  if (facts.dirtyMine.length > 0) {
    blockers.push(`${facts.dirtyMine.length} path(s) this session edited are uncommitted: ${list(facts.dirtyMine)}`);
  }
  if (!onMain && !facts.onRemote) {
    blockers.push(`branch ${facts.branch} at ${facts.head} is on no remote branch, so the work exists only here`);
  }
  if (facts.gate.ran && facts.gate.ok === false) {
    blockers.push(`the gate is red: ${facts.gate.script}`);
  }

  if (facts.dirtyOther.length > 0) {
    notes.push(
      facts.mine.known
        ? `${facts.dirtyOther.length} dirty path(s) belong to other sessions and were left alone: ${list(facts.dirtyOther)}`
        : `${facts.dirtyOther.length} dirty path(s) and no attribution (${facts.mine.source}), so none is counted against this session`,
    );
  }
  if (facts.detached) notes.push('HEAD is detached, so there is no branch to merge or delete');
  if (facts.fetch === 'failed') notes.push('the fetch from origin failed, so merge state may be stale');
  if (facts.unpushed > 0) notes.push(`${facts.unpushed} commit(s) are not pushed to ${facts.upstream ?? 'a remote'}`);

  if (facts.pr && facts.pr.state === 'OPEN') notes.push(`PR #${facts.pr.number} is open: ${facts.pr.url}`);
  if (facts.pr && facts.pr.mergedAt && !facts.pr.headMatches) {
    notes.push(`PR #${facts.pr.number} merged a different commit than the one checked out, so this branch moved after the merge`);
  }
  if (facts.contentOnMain && facts.aheadOfDefault > 0) {
    notes.push(`${facts.aheadOfDefault} commit(s) are already on ${facts.defaultBranch} by patch, so this was a squash or rebase merge`);
  }
  if (!onMain && facts.onRemote && !facts.detached && facts.branch !== facts.defaultBranch) {
    notes.push(`${facts.branch} is pushed but not on ${facts.defaultBranch}, so archiving it drops work that no one merged`);
  }

  const dirtyWorktrees = facts.worktrees.filter((tree) => !tree.isMain && tree.dirty.length > 0);
  for (const tree of dirtyWorktrees) {
    notes.push(`worktree ${tree.path} holds ${tree.dirty.length} dirty path(s) on ${tree.branch ?? 'a detached head'}`);
  }
  const mergedClean = facts.worktrees.filter((tree) => !tree.isMain && tree.merged && tree.dirty.length === 0);
  for (const tree of mergedClean) {
    notes.push(`worktree ${tree.path} is merged and clean: git worktree remove ${tree.path}`);
  }
  if (facts.staleWorktrees.length > 0) {
    notes.push(`${facts.staleWorktrees.length} stale worktree registration(s): git worktree prune`);
  }

  if (facts.report?.status === 'complete' && !onMain && !facts.onRemote) {
    notes.push(`${facts.report.file} says complete, but ${facts.branch} exists on no remote and on no default branch`);
  }
  if (facts.report && facts.report.claimedUnpushed !== null && facts.upstream && facts.report.claimedUnpushed !== facts.unpushed) {
    notes.push(`${facts.report.file} claims ${facts.report.claimedUnpushed} unpushed commit(s), git counts ${facts.unpushed}`);
  }
  if (!facts.report && facts.reportDir && facts.aheadOfDefault > 0) {
    notes.push('no run report under artifacts/runs names this branch');
  }

  let verdict: Verdict['verdict'];
  if (blockers.length > 0) verdict = 'DO NOT CLOSE';
  else if (!onMain) verdict = 'HAND OFF';
  else if (notes.length > 0) verdict = 'CLOSE WITH NOTES';
  else verdict = 'CLOSE';

  let next: string;
  if (facts.dirtyMine.length > 0) {
    const paths = facts.dirtyMine.length <= 8 ? facts.dirtyMine.join(' ') : 'the paths named above';
    next = `commit only these paths, then run close again: git add ${paths}`;
  } else if (!onMain && !facts.onRemote) {
    next = `push the branch, then run close again: git push -u origin ${facts.branch}`;
  } else if (facts.gate.ran && facts.gate.ok === false) {
    next = `fix what ${facts.gate.script} reports, then run close again`;
  } else if (!onMain) {
    next = facts.branch === facts.defaultBranch
      ? `push the default branch, then run close again: git push origin ${facts.branch}`
      : `open or merge the pull request for ${facts.branch}, or hand off with that branch named`;
  } else if (facts.staleWorktrees.length > 0) {
    next = 'safe to archive; run git worktree prune to drop the stale registration(s)';
  } else if (notes.length > 0) {
    next = 'safe to archive; the notes belong to the estate, not to this session';
  } else {
    next = 'safe to archive';
  }

  return { verdict, blockers, notes, next, onMain };
}

function row(label: string, value: string): string {
  return `${label.padEnd(12)}${value}`;
}

export function format(facts: CloseFacts, verdict: Verdict): string {
  const lines: string[] = [];
  const state = verdict.onMain
    ? `on ${facts.defaultBranch}`
    : facts.branch === facts.defaultBranch
      ? `${facts.aheadOfDefault} ahead of origin/${facts.defaultBranch}`
      : `${facts.aheadOfDefault} ahead of ${facts.defaultBranch}`;
  lines.push(row('branch:', `${facts.branch} at ${facts.head}, ${state}`));
  if (facts.pr) {
    const merged = facts.pr.mergedAt ? `merged ${facts.pr.mergedAt}` : facts.pr.state.toLowerCase();
    lines.push(row('pr:', `#${facts.pr.number} ${merged} ${facts.pr.url}`));
  } else {
    lines.push(row('pr:', facts.repo ? 'none found for this branch' : 'none'));
  }
  lines.push(row('push:', facts.upstream ? `${facts.unpushed} ahead of ${facts.upstream}` : 'no upstream'));
  lines.push(row('remote:', facts.onRemote ? 'a remote branch contains HEAD' : 'HEAD is on no remote branch'));
  const attribution = facts.dirtyMine.length + facts.dirtyOther.length > 0
    ? ` (${facts.mine.known ? 'event log' : 'no attribution'})`
    : '';
  lines.push(row('dirty:', `${facts.dirtyMine.length} mine, ${facts.dirtyOther.length} other${attribution}`));
  if (facts.dirtyMine.length > 0) lines.push(row('', `mine: ${list(facts.dirtyMine, 8)}`));
  const trees = facts.worktrees.filter((tree) => !tree.isMain);
  lines.push(
    row(
      'worktrees:',
      trees.length === 0
        ? `none beside this one${facts.staleWorktrees.length > 0 ? `, ${facts.staleWorktrees.length} stale` : ''}`
        : `${trees.length} other, ${trees.filter((tree) => tree.dirty.length > 0).length} dirty, ${facts.staleWorktrees.length} stale`,
    ),
  );
  lines.push(row('report:', facts.report ? `${facts.report.file} (${facts.report.status ?? 'no status'})` : 'none for this branch'));
  lines.push(row('gate:', facts.gate.ran ? (facts.gate.ok ? `green (${facts.gate.script})` : `red (${facts.gate.script})`) : 'not run (--gate)'));
  lines.push('');
  if (verdict.blockers.length > 0) {
    lines.push('Blockers');
    for (const blocker of verdict.blockers) lines.push(`  - ${blocker}`);
  }
  if (verdict.notes.length > 0) {
    lines.push('Notes');
    for (const note of verdict.notes) lines.push(`  - ${note}`);
  }
  if (verdict.blockers.length > 0 || verdict.notes.length > 0) lines.push('');
  lines.push(verdict.verdict);
  lines.push(`next: ${verdict.next}`);
  return lines.join('\n');
}

export function runClose(repo: string, argv: string[] = []): number {
  const options: CloseOptions = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--session') options.session = argv[++index];
    else if (arg === '--mine') options.mine = [...(options.mine ?? []), ...(argv[++index] ?? '').split(',').filter(Boolean)];
    else if (arg === '--no-fetch') options.fetch = false;
    else if (arg === '--gate') options.gate = true;
    else if (arg === '--no-worktrees') options.worktrees = false;
    else if (arg === '--no-pr') options.pr = false;
  }
  const asJson = argv.includes('--json');
  const facts = gather(repo, options);
  const verdict = verdictFor(facts);
  if (asJson) {
    console.log(JSON.stringify({ facts, verdict }, null, 2));
  } else {
    console.log(`close: ${repo}`);
    console.log(format(facts, verdict));
  }
  return verdict.verdict === 'CLOSE' || verdict.verdict === 'CLOSE WITH NOTES' ? 0 : 1;
}
