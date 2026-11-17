// tools/map-freshness.test.ts: the stale map, seen both ways.
//
// The failure that matters is the quiet one: a check that says ok while a skill carries yesterday's
// standard, or while the graph predates the file the session is about to ask it about. Each case
// pairs the state that must warn with the one that must not, over a throwaway repo on disk.
import { afterEach, expect, test } from 'bun:test';
import { mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  checkAll,
  derivedFile,
  format,
  frontmatterValue,
  graph,
  isStale,
  skills,
  slugCandidates,
  splitFrontmatter,
} from './map-freshness.ts';

const dirs: string[] = [];
afterEach(() => {
  while (dirs.length) rmSync(dirs.pop()!, { recursive: true, force: true });
});

function repo(): string {
  const dir = mkdtempSync(join(tmpdir(), 'freshness-'));
  dirs.push(dir);
  spawnSync('git', ['init', '-q'], { cwd: dir });
  return dir;
}

function put(dir: string, path: string, text: string) {
  const file = join(dir, path);
  mkdirSync(join(file, '..'), { recursive: true });
  writeFileSync(file, text);
}

const VOICE = `---
title: "VOICE.md: voice and tone"
summary: How it reads.
when: >
  Read this BEFORE writing prose: docs, READMEs,
  commit messages. Don't skip because it is short.
---

# Voice

No em-dashes.
`;

/** What the pantry sync writes: name, JSON-encoded description, then the body unchanged. */
function synced(slug: string, when: string, body: string): string {
  return `---\nname: ${slug}\ndescription: ${JSON.stringify(when)}\n---\n${body}`;
}

const WHEN = "Read this BEFORE writing prose: docs, READMEs, commit messages. Don't skip because it is short.";
const BODY = '\n# Voice\n\nNo em-dashes.\n';

test('frontmatter: folded, quoted and plain values', () => {
  const { head, body } = splitFrontmatter(VOICE);
  expect(frontmatterValue(head, 'when')).toBe(WHEN);
  expect(frontmatterValue(head, 'title')).toBe('VOICE.md: voice and tone');
  expect(frontmatterValue(head, 'summary')).toBe('How it reads.');
  expect(frontmatterValue(head, 'skill')).toBeNull();
  expect(body.trim().startsWith('# Voice')).toBe(true);
});

test('slugs: the skill key wins, else the lowercased filename', () => {
  expect(slugCandidates('LOOP.md', 'skill: loop-standard')[0]).toBe('loop-standard');
  expect(slugCandidates('NOTE-STANDARD.md', '')).toEqual(['note-standard']);
  expect(slugCandidates('CLAUDE.starter.md', '')).toEqual(['claude.starter', 'claude-starter']);
});

test('skills: a fresh sync is ok, and a refolded when line still matches', () => {
  const dir = repo();
  put(dir, 'standards/VOICE.md', VOICE);
  put(dir, '.claude/skills/voice/SKILL.md', synced('voice', WHEN, BODY));
  const findings = skills.check(dir);
  expect(findings).toHaveLength(1);
  expect(findings[0].state).toBe('fresh');
  expect(isStale(findings)).toBe(false);
});

test('skills: a standard edited after the sync is stale, and the body is named', () => {
  const dir = repo();
  put(dir, 'standards/VOICE.md', VOICE.replace('No em-dashes.', 'No em-dashes. One console exception.'));
  put(dir, '.claude/skills/voice/SKILL.md', synced('voice', WHEN, BODY));
  const [finding] = skills.check(dir);
  expect(finding.state).toBe('stale');
  expect(finding.detail).toContain('body');
  expect(finding.detail).not.toContain('when line');
});

test('skills: a changed when line is stale even when the body is not', () => {
  const dir = repo();
  put(dir, 'standards/VOICE.md', VOICE);
  put(dir, '.claude/skills/voice/SKILL.md', synced('voice', 'Use when writing prose.', BODY));
  const [finding] = skills.check(dir);
  expect(finding.state).toBe('stale');
  expect(finding.detail).toBe('standards/VOICE.md when line changed since the sync');
});

test('skills: an unmounted standard is missing; a file with no when line is ignored', () => {
  const dir = repo();
  put(dir, 'standards/VOICE.md', VOICE);
  put(dir, 'standards/README.md', '---\ntitle: index\n---\n# Index\n');
  mkdirSync(join(dir, '.claude/skills'), { recursive: true });
  const findings = skills.check(dir);
  expect(findings).toEqual([
    { artifact: 'skills', subject: 'voice', state: 'missing', detail: 'standards/VOICE.md is not mounted' },
  ]);
});

test('skills: no mount at all is a skip, never a warning', () => {
  const dir = repo();
  put(dir, 'standards/VOICE.md', VOICE);
  const findings = skills.check(dir);
  expect(findings[0].state).toBe('skip');
  expect(isStale(findings)).toBe(false);
});

test('graph: older than a code file is stale and names it; newer is ok', () => {
  const dir = repo();
  put(dir, 'src/server.ts', 'export {};\n');
  put(dir, 'notes.md', 'prose does not count\n');
  put(dir, 'graphify-out/graph.json', '{}');
  put(dir, '.gitignore', 'graphify-out/\n');
  const past = new Date(Date.now() - 3 * 3600_000);
  utimesSync(join(dir, 'graphify-out/graph.json'), past, past);

  const [stale] = graph.check(dir);
  expect(stale.state).toBe('stale');
  expect(stale.detail).toContain('src/server.ts');
  expect(stale.detail).toContain('3 hours');

  const older = new Date(Date.now() - 5 * 3600_000);
  utimesSync(join(dir, 'src/server.ts'), older, older);
  expect(graph.check(dir)[0].state).toBe('fresh');
});

test('graph: no graph built is a skip', () => {
  const dir = repo();
  put(dir, 'src/server.ts', 'export {};\n');
  expect(graph.check(dir)[0].state).toBe('skip');
});

test('derivedFile: the extension point compares bytes, both ways', () => {
  const dir = repo();
  let expected: string | null = '{"standards":["voice"]}\n';
  const index = derivedFile({
    name: 'standards index',
    path: 'standards/INDEX.json',
    fix: 'regenerate the index',
    expected: () => expected,
  });
  expect(index.check(dir)[0].state).toBe('missing');
  put(dir, 'standards/INDEX.json', expected);
  expect(index.check(dir)[0].state).toBe('fresh');
  expected = '{"standards":["voice","figures"]}\n';
  expect(index.check(dir)[0].state).toBe('stale');
  expected = null;
  expect(index.check(dir)[0].state).toBe('skip');
});

test('format: a stale artifact names its subject and the fix; a check that throws is a skip', () => {
  const dir = repo();
  put(dir, 'standards/VOICE.md', VOICE);
  put(dir, '.claude/skills/voice/SKILL.md', synced('voice', 'old', BODY));
  const broken = { name: 'broken', fix: 'n/a', check: () => { throw new Error('boom'); } };
  const artifacts = [skills, graph, broken];
  const findings = checkAll(dir, artifacts);
  const lines = format(findings, artifacts);
  expect(lines[0]).toBe('freshness: WARNING skills: 1 of 1 behind their source: voice (stale)');
  expect(lines.some((line) => line.includes('fix: bun cli.ts skills sync'))).toBe(true);
  expect(lines).toContain('freshness: graph skipped, no graph built in this checkout');
  expect(lines).toContain('freshness: broken skipped, check failed: boom');
});
