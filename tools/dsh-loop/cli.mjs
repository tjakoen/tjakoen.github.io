// tools/dsh-loop/cli.mjs: the repo-side half of the DSH loop.
//
// The machine plugin lives in the private agent-config repo at shared/tools/dsh. It enforces the
// two guards, refreshes the graph and injects the session checklist. This CLI carries the repo
// parts: the doctor, the turn-end gate, and a way to ask the guard about a path before a write.
//
//   bun tools/dsh-loop/cli.mjs start
//   bun tools/dsh-loop/cli.mjs end
//   bun tools/dsh-loop/cli.mjs close
//   bun tools/dsh-loop/cli.mjs guard .github/workflows/ci.yml
//   bun tools/dsh-loop/cli.mjs envelope /tmp/handoff.txt

import { spawnSync } from 'node:child_process';
import { existsSync, lstatSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { runClose } from './close.ts';

const guardPath = process.env.DSH_GUARD || join(homedir(), '.dsh', 'loop', 'guard.mjs');
let guardModule;

async function loadGuard() {
  if (guardModule) return guardModule;
  try {
    guardModule = await import(pathToFileURL(guardPath).href);
    return guardModule;
  } catch {
    console.error(`Guard not found at ${guardPath}. Install the agent-config DSH tools first.`);
    process.exitCode = 1;
    return null;
  }
}

const repo = process.cwd();
const [command = 'help', ...rest] = process.argv.slice(2);

function run(program, args, options = {}) {
  const result = spawnSync(program, args, {
    cwd: repo,
    encoding: 'utf8',
    env: options.env ?? process.env,
    timeout: options.timeout ?? 120000,
  });
  if (result.error) {
    return { status: null, stdout: '', stderr: String(result.error.message) };
  }
  return { status: result.status, stdout: result.stdout ?? '', stderr: result.stderr ?? '' };
}

function tail(result, lines = 4) {
  const text = `${result.stdout}${result.stderr}`.trim();
  return text ? text.split('\n').slice(-lines).join('\n') : '';
}

function printExit(label, result) {
  const status = result.status === 0 ? 'ok' : result.status === null ? 'not run' : `exit ${result.status}`;
  console.log(`${label}: ${status}`);
  if (result.status !== 0) {
    const detail = tail(result);
    if (detail) console.log(detail.split('\n').map((line) => `  ${line}`).join('\n'));
  }
}

function doctor() {
  const script = join(homedir(), '.claude', 'tools', 'session-doctor.sh');
  if (!existsSync(script)) {
    console.log('doctor: not run (no ~/.claude/tools/session-doctor.sh)');
    return;
  }
  const result = run('bash', [script], {
    env: { ...process.env, CLAUDE_PROJECT_DIR: repo },
  });
  const output = `${result.stdout}${result.stderr}`.trim();
  console.log(output || 'doctor: silent (nothing due, or not a kit repo)');
}

function skillsMount() {
  const live = join(repo, '.claude', 'skills');
  const mount = join(repo, '.agents', 'skills');
  if (!existsSync(live)) {
    console.log('skills: no .claude/skills; run the pantry sync first');
    return;
  }
  if (!existsSync(mount)) {
    console.log('skills: WARNING .agents/skills is missing; DSH has no repo skills');
    return;
  }
  try {
    const linked = lstatSync(mount).isSymbolicLink();
    const same = linked && realpathSync(mount) === realpathSync(live);
    console.log(
      same
        ? 'skills: .agents/skills -> .claude/skills'
        : 'skills: WARNING .agents/skills is not the live mount; DSH may read a stale copy',
    );
  } catch {
    console.log('skills: WARNING could not resolve the .agents/skills mount');
  }
}

function graphAge() {
  const file = join(repo, 'graphify-out', 'graph.json');
  if (!existsSync(file)) {
    console.log('graph: no graphify-out/graph.json');
    return;
  }
  const minutes = Math.round((Date.now() - statSync(file).mtimeMs) / 60000);
  console.log(`graph: graph.json ${minutes} minute${minutes === 1 ? '' : 's'} old`);
}

function changedFiles() {
  const result = run('git', ['diff', '--name-only', 'HEAD']);
  const untracked = run('git', ['ls-files', '--others', '--exclude-standard']);
  return `${result.stdout}${untracked.stdout}`
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function checkpoint() {
  const result = run('git', ['rev-parse', '--git-dir']);
  if (result.status !== 0) return;
  const file = resolve(repo, result.stdout.trim(), 'dsh-close.md');
  if (!existsSync(file)) return;
  const text = readFileSync(file, 'utf8').trim();
  if (!text) return;
  console.log('');
  console.log(text);
}

function start() {
  console.log(`DSH loop start: ${repo}`);
  checkpoint();
  doctor();
  skillsMount();
  graphAge();
  console.log('end: bun tools/dsh-loop/cli.mjs end');
}

function end() {
  console.log(`DSH loop end: ${repo}`);

  const graph = run('graphify', ['update', repo], { timeout: 180000 });
  printExit('graphify update', graph);

  printExit('bun run check', run('bun', ['run', 'check']));
  printExit('bun tools/lint-gate.ts', run('bun', ['tools/lint-gate.ts']));

  const status = run('git', ['status', '--short']);
  console.log(`git status: ${status.stdout.trim() ? 'dirty' : 'clean'}`);
  if (status.stdout.trim()) console.log(status.stdout.trim().split('\n').map((line) => `  ${line}`).join('\n'));

  const unpushed = run('git', ['rev-list', '--count', '@{u}..']);
  console.log(`unpushed: ${unpushed.status === 0 ? unpushed.stdout.trim() : 'no upstream'}`);

  const diffstat = run('git', ['diff', '--stat', 'HEAD']);
  if (diffstat.stdout.trim()) console.log(diffstat.stdout.trim());

  const changed = changedFiles();
  if (changed.some((path) => /^(src|content|components|pages|styles)\//.test(path))) {
    console.log('tour: a path that renders changed; show it before calling done (LOOP section 4a).');
  }

  console.log('');
  console.log('Report lines to carry into the run report:');
  console.log('  What was not done: <name it, even when the answer is nothing>');
  console.log('  What needs human eyes: <name it, even when the answer is nothing>');
  console.log('');
  console.log('Before you archive the session: bun tools/dsh-loop/cli.mjs close');
}

async function guardCommand(target) {
  if (!target) {
    console.error('usage: bun tools/dsh-loop/cli.mjs guard <path>');
    process.exitCode = 2;
    return;
  }
  const guard = await loadGuard();
  if (!guard) return;
  const path = resolve(target);
  const reason = guard.humanLaneReason(path, { tool: 'write' });
  if (reason) {
    console.log(`BLOCK ${path}`);
    console.log(`rule: ${reason}`);
    process.exitCode = 1;
  } else {
    console.log(`ALLOW ${path}`);
  }
}

async function envelopeCommand(file) {
  if (!file) {
    console.error('usage: bun tools/dsh-loop/cli.mjs envelope <file>');
    process.exitCode = 2;
    return;
  }
  let prompt;
  try {
    prompt = readFileSync(resolve(file), 'utf8');
  } catch (error) {
    console.error(`Could not read ${file}: ${error.message}`);
    process.exitCode = 1;
    return;
  }
  const guard = await loadGuard();
  if (!guard) return;
  const missing = guard.envelopeMissing(prompt);
  if (missing.length > 0) {
    console.log(`MISSING: ${missing.join(', ')}`);
    process.exitCode = 1;
  } else {
    console.log('OK: all four headings present');
  }
}

function help() {
  console.log(`usage: bun tools/dsh-loop/cli.mjs <command>

  start               run the session-start doctor, the mount check and the graph age
  end                 refresh the graph, run the typecheck and the lint gate, print the run ledger
  close               answer whether this session can be archived, from git and the event log
  guard <path>        ask the human-lane rules about a path before a write
  envelope <file>     check a handoff file for lane, scope cap, hard stops and ask-triggers
  help                this message

close options:
  --session <id>      attribute dirty paths with this session (default DSH_SESSION_ID)
  --mine <paths>      comma separated paths this session edited, for when no log exists
  --no-fetch          skip the fetch, and report merge state as of the last one
  --gate              also run the repository's own gate (check, typecheck or gate script)
  --no-worktrees      skip the worktree inventory
  --no-pr             skip the gh lookup, for a hook that must not wait on the network
  --json              machine-readable facts and verdict

close exits 0 when the verdict is CLOSE or CLOSE WITH NOTES, and 1 otherwise.

The machine plugin at ~/.dsh/loop enforces the human lane, the spawn envelope, graph refresh
and the session checklist inside DSH. This CLI is the repo part DSH has no event for.`);
}

switch (command) {
  case 'start':
    start();
    break;
  case 'end':
    end();
    break;
  case 'close':
    process.exitCode = runClose(repo, rest);
    break;
  case 'guard':
    await guardCommand(rest[0]);
    break;
  case 'envelope':
    await envelopeCommand(rest[0]);
    break;
  case 'help':
  case '--help':
  case '-h':
    help();
    break;
  default:
    console.error(`Unknown command: ${command}`);
    help();
    process.exitCode = 2;
}
