// tools/map-freshness.ts: is the map an agent navigates by older than the ground it describes?
//
// Two things here are derived and gitignored: the skills under .claude/skills, generated from
// standards/ by the pantry sync, and the code graph under graphify-out. Both go stale quietly, and a
// stale one answers confidently about text or code that has moved. This module compares each derived
// artifact with its source and says which ones fell behind.
//
// Content beats time wherever the content is readable. A skill is judged by hashes recorded in a stamp
// beside the mount: it is behind when its standard's hash moved while the SKILL.md's did not. Comparing
// the standard's text with the skill's directly does not work, because the sync rewrites the text on
// the way in, and mtimes move on every checkout. The graph is
// the exception: this repo cannot read per-file hashes out of it, so it falls back to mtime and says so.
//
// Adding an artifact is one entry in ARTIFACTS. derivedFile covers the common shape, a generated file
// whose expected bytes can be built in memory, which is how the standards index will plug in.
//
//   bun tools/map-freshness.ts            the summary lines
//   bun tools/map-freshness.ts --json     the findings
//   bun tools/map-freshness.ts --strict   exit 1 when anything is stale
//   bun tools/map-freshness.ts --hook     print only when something is stale (session start)

import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

export type State = 'fresh' | 'stale' | 'missing' | 'skip';

export type Finding = {
  /** Which artifact this is about, as named in ARTIFACTS. */
  artifact: string;
  /** The one thing compared: a skill slug, a file path. */
  subject: string;
  state: State;
  /** What differs, or why it was skipped. */
  detail: string;
};

export type Artifact = {
  name: string;
  /** The command that brings it back in line, printed beside a stale finding. */
  fix: string;
  check: (repo: string) => Finding[];
};

export function sha(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

/** Collapse runs of whitespace, so a refolded line hashes the same as the original. */
export function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/** Split a leading frontmatter block from a markdown file. */
export function splitFrontmatter(text: string): { head: string; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (!match) return { head: '', body: text };
  return { head: match[1], body: text.slice(match[0].length) };
}

/**
 * Read one key from a frontmatter block. Handles the three shapes the standards use: a plain value,
 * a quoted value, and a folded or literal block (the when line is usually folded).
 */
export function frontmatterValue(head: string, key: string): string | null {
  const lines = head.split(/\r?\n/);
  const index = lines.findIndex((line) => line.startsWith(`${key}:`));
  if (index < 0) return null;
  const rest = lines[index].slice(key.length + 1).trim();
  if (rest === '>' || rest === '|' || rest === '>-' || rest === '|-') {
    const block: string[] = [];
    for (const line of lines.slice(index + 1)) {
      if (line.trim() && !/^\s/.test(line)) break;
      block.push(line.trim());
    }
    return block.join(' ').trim();
  }
  if (rest.startsWith('"')) {
    try {
      return JSON.parse(rest);
    } catch {
      return rest.slice(1, -1);
    }
  }
  if (rest.startsWith("'") && rest.endsWith("'")) return rest.slice(1, -1).replace(/''/g, "'");
  return rest;
}

/** Slugs a standard may mount under: the skill key, else the lowercased filename. */
export function slugCandidates(file: string, head: string): string[] {
  const stem = basename(file, '.md').toLowerCase();
  const override = frontmatterValue(head, 'skill');
  return [...new Set([override, stem, stem.replace(/\./g, '-')].filter(Boolean) as string[])];
}

/**
 * The sync stamp: per skill, the hash of the standard and of the SKILL.md as last seen together.
 * The pantry sync rewrites a standard on its way into a skill (description, links, wrapping), so
 * comparing the two texts directly calls every skill stale forever. Comparing each side with its own
 * earlier hash does not depend on what the sync does to the text. It lives in the gitignored mount,
 * so it is per machine, like the skills it describes.
 */
export type Stamp = { skills: Record<string, { source: string; skill: string }>; unreadable?: boolean };
export const STAMP_FILE = '.freshness.json';

export function readStamp(skillsDir: string): Stamp {
  try {
    const parsed = JSON.parse(readFileSync(join(skillsDir, STAMP_FILE), 'utf8'));
    return { skills: parsed?.skills ?? {} };
  } catch (error) {
    // A missing stamp is a first run and re-baselining it is correct. A corrupt or unreadable one is
    // not: silently returning empty makes every skill print "baselined (first time seen)", and the
    // next writeStamp then records the moved hashes, so a stale skill reads fresh from then on.
    // Say so, and let the caller decide not to write.
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error(
        `[freshness] ${join(skillsDir, STAMP_FILE)} is unreadable, so the skills check cannot compare: ${(error as Error).message}`,
      );
      return { skills: {}, unreadable: true };
    }
    return { skills: {} };
  }
}

function writeStamp(skillsDir: string, stamp: Stamp): void {
  try {
    writeFileSync(join(skillsDir, STAMP_FILE), JSON.stringify(stamp, null, 2) + '\n');
  } catch {
    // A read-only mount keeps working; it just baselines again next time.
  }
}

export const skills: Artifact = {
  name: 'skills',
  fix: 'bun cli.ts skills sync ../tjakoen.github.io (from the pantry repo)',
  check(repo) {
    const standardsDir = join(repo, 'standards');
    const skillsDir = join(repo, '.claude', 'skills');
    if (!existsSync(standardsDir)) {
      return [{ artifact: 'skills', subject: 'standards', state: 'skip', detail: 'no standards/ dir' }];
    }
    if (!existsSync(skillsDir)) {
      return [
        {
          artifact: 'skills',
          subject: '.claude/skills',
          state: 'skip',
          detail: 'no mounted skills (a cloud or unsynced checkout)',
        },
      ];
    }
    const findings: Finding[] = [];
    const stamp = readStamp(skillsDir);
    const next: Stamp['skills'] = {};
    for (const file of readdirSync(standardsDir).filter((name) => name.endsWith('.md')).toSorted()) {
      const source = readFileSync(join(standardsDir, file), 'utf8');
      const { head } = splitFrontmatter(source);
      const when = frontmatterValue(head, 'when');
      if (!when) continue; // the index, the directory rules and the symlink carry no when on purpose
      const slugs = slugCandidates(file, head);
      const slug = slugs.find((candidate) => existsSync(join(skillsDir, candidate, 'SKILL.md')));
      if (!slug) {
        findings.push({ artifact: 'skills', subject: slugs[0], state: 'missing', detail: `standards/${file} is not mounted` });
        continue;
      }
      const skillSha = sha(readFileSync(join(skillsDir, slug, 'SKILL.md'), 'utf8'));
      const sourceSha = sha(source);
      const seen = stamp.skills[slug];
      // A skill file that changed since the stamp was re-synced: whatever the standard says now is
      // what it was built from. Only a moved standard under an unchanged skill file is behind.
      const stale = seen !== undefined && seen.skill === skillSha && seen.source !== sourceSha;
      if (!stale) next[slug] = { source: sourceSha, skill: skillSha };
      else next[slug] = seen;
      findings.push({
        artifact: 'skills',
        subject: slug,
        state: stale ? 'stale' : 'fresh',
        detail: stale
          ? `standards/${file} changed since the sync`
          : seen
            ? `standards/${file} unchanged since the sync, or re-synced`
            : `standards/${file} baselined (first time seen on this machine)`,
      });
    }
    // An unreadable stamp is reported by readStamp; writing would re-baseline the very drift the
    // check could not see, so this run only says so.
    if (!stamp.unreadable) writeStamp(skillsDir, { skills: next });
    return findings;
  },
};

const CODE = /\.(ts|tsx|js|jsx|mjs|cjs|py|sh)$/;

/** Tracked and untracked code files, as git sees them, so ignored output never counts as source. */
export function codeFiles(repo: string): string[] {
  const result = spawnSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
    cwd: repo,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.status !== 0) return [];
  return result.stdout.split('\n').filter((path) => CODE.test(path));
}

function ago(ms: number): string {
  const minutes = Math.round(ms / 60000);
  if (minutes < 120) return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} hours`;
  return `${Math.round(hours / 24)} days`;
}

export const graph: Artifact = {
  name: 'graph',
  fix: 'graphify update .',
  check(repo) {
    const file = join(repo, 'graphify-out', 'graph.json');
    if (!existsSync(file)) {
      return [{ artifact: 'graph', subject: 'graphify-out/graph.json', state: 'skip', detail: 'no graph built in this checkout' }];
    }
    const built = statSync(file).mtimeMs;
    let newest = { path: '', mtime: 0 };
    for (const path of codeFiles(repo)) {
      let mtime: number;
      try {
        mtime = statSync(join(repo, path)).mtimeMs;
      } catch {
        continue; // deleted in the working tree
      }
      if (mtime > newest.mtime) newest = { path, mtime };
    }
    if (!newest.path) {
      return [{ artifact: 'graph', subject: 'graphify-out/graph.json', state: 'skip', detail: 'no code files found to compare' }];
    }
    const stale = newest.mtime > built;
    return [
      {
        artifact: 'graph',
        subject: 'graphify-out/graph.json',
        state: stale ? 'stale' : 'fresh',
        detail: stale
          ? `${newest.path} changed ${ago(newest.mtime - built)} after the graph was built (by mtime)`
          : `newer than every code file (newest ${newest.path}, by mtime)`,
      },
    ];
  },
};

/**
 * A generated file whose expected bytes can be built in memory. Stale when the bytes on disk hash
 * differently, missing when the file is absent. The standards index plugs in here:
 *
 *   derivedFile({ name: 'standards index', path: 'standards/INDEX.json',
 *                 fix: '<its generator command>', expected: (repo) => buildIndex(repo) })
 *
 * expected returns null when the generator cannot run here, which reads as a skip.
 */
export function derivedFile(spec: {
  name: string;
  path: string;
  fix: string;
  expected: (repo: string) => string | null;
}): Artifact {
  return {
    name: spec.name,
    fix: spec.fix,
    check(repo) {
      const file = join(repo, spec.path);
      const want = spec.expected(repo);
      if (want === null) return [{ artifact: spec.name, subject: spec.path, state: 'skip', detail: 'generator not available here' }];
      if (!existsSync(file)) return [{ artifact: spec.name, subject: spec.path, state: 'missing', detail: 'not generated' }];
      const same = sha(readFileSync(file, 'utf8')) === sha(want);
      return [
        {
          artifact: spec.name,
          subject: spec.path,
          state: same ? 'fresh' : 'stale',
          detail: same ? 'matches its sources' : 'differs from what its generator builds now',
        },
      ];
    },
  };
}

/** Every derived artifact checked at session start. Add the standards index here when it lands. */
export const ARTIFACTS: Artifact[] = [skills, graph];

export function checkAll(repo: string, artifacts: Artifact[] = ARTIFACTS): Finding[] {
  return artifacts.flatMap((artifact) => {
    try {
      return artifact.check(repo);
    } catch (error) {
      return [{ artifact: artifact.name, subject: artifact.name, state: 'skip' as State, detail: `check failed: ${(error as Error).message}` }];
    }
  });
}

export function isStale(findings: Finding[]): boolean {
  return findings.some((finding) => finding.state === 'stale' || finding.state === 'missing');
}

/** One line per artifact. A stale or missing one names its subjects and the fix. */
export function format(findings: Finding[], artifacts: Artifact[] = ARTIFACTS): string[] {
  const lines: string[] = [];
  for (const artifact of artifacts) {
    const mine = findings.filter((finding) => finding.artifact === artifact.name);
    if (!mine.length) continue;
    const bad = mine.filter((finding) => finding.state === 'stale' || finding.state === 'missing');
    const skipped = mine.filter((finding) => finding.state === 'skip');
    if (bad.length) {
      const names = bad.slice(0, 8).map((finding) => `${finding.subject} (${finding.state})`).join(', ');
      const more = bad.length > 8 ? `, and ${bad.length - 8} more` : '';
      lines.push(`freshness: WARNING ${artifact.name}: ${bad.length} of ${mine.length} behind their source: ${names}${more}`);
      for (const finding of bad.slice(0, 3)) lines.push(`  ${finding.subject}: ${finding.detail}`);
      lines.push(`  fix: ${artifact.fix}`);
    } else if (skipped.length === mine.length) {
      lines.push(`freshness: ${artifact.name} skipped, ${skipped[0].detail}`);
    } else {
      const detail = mine.length === 1 ? mine[0].detail : `${mine.length} match their source`;
      lines.push(`freshness: ${artifact.name} ok, ${detail}`);
    }
  }
  return lines;
}

if (import.meta.main) {
  const args = new Set(process.argv.slice(2));
  const repo = process.cwd();
  const findings = checkAll(repo);
  if (args.has('--json')) {
    console.log(JSON.stringify({ stale: isStale(findings), findings }, null, 2));
  } else if (args.has('--hook')) {
    // Session start: silent when the map is current, so the line means something when it appears.
    if (isStale(findings)) console.log(format(findings).join('\n'));
  } else {
    console.log(format(findings).join('\n'));
  }
  if (args.has('--strict') && isStale(findings)) process.exitCode = 1;
}
