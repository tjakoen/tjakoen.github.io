// portfolio/tools/diagram-cache-gate.test.ts — the gate has to be seen going RED.
//
// There are zero mermaid fences in served content today, so the gate passes trivially against the
// real repo. A green run proves nothing: a gate that always returns an empty array would pass the
// same way. Every test here builds a fixture collection with a real fence and an empty cache, shows
// the failure, then fills the cache and shows it clear.
//
// The cache is filled the way tools/diagram-warm.ts fills it, through MILL's own cachedRenderer,
// rather than by writing a filename this test computed. Deriving the key twice from the same helper
// the gate uses would prove only that the helper agrees with itself.
import { test, expect } from "bun:test";
import { mkdtemp, rm, writeFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { cachedRenderer } from "@tjakoen/mill/diagrams/cache.ts";
import { dirSource } from "@tjakoen/mill/serve.ts";
import { checkDiagramCache, type GatedCollection } from "./diagram-cache-gate.ts";
import { COLLECTION_DIRS } from "../src/content.ts";

const TAG = "test-tag-1";
const WARM = "bun run diagrams:warm";

const FENCE_SOURCE = "flowchart TB\n  A[\"one\"] --> B[\"two\"]";
const NOTE = `---
title: A fixture note
---

# A fixture note

Some prose above the figure.

\`\`\`mermaid label="A goes to B"
${FENCE_SOURCE}
\`\`\`

Some prose below it.
`;

/** A fixture collection plus its own empty cache, both torn down afterwards. */
async function withFixture(
  files: Record<string, string>,
  fn: (ctx: { collections: GatedCollection[]; cacheDir: string; run: () => Promise<string[]> }) => Promise<void>,
): Promise<void> {
  const contentDir = await mkdtemp(join(tmpdir(), "gate-content-"));
  const cacheDir = await mkdtemp(join(tmpdir(), "gate-cache-"));
  try {
    for (const [name, body] of Object.entries(files)) await writeFile(join(contentDir, name), body, "utf8");
    const collections: GatedCollection[] = [
      { prefix: "/fixture", dir: contentDir, source: dirSource(contentDir) },
    ];
    await fn({
      collections,
      cacheDir,
      run: () => checkDiagramCache({ collections, cacheDir, versionTag: TAG, warmCommand: WARM }),
    });
  } finally {
    await rm(contentDir, { recursive: true, force: true });
    await rm(cacheDir, { recursive: true, force: true });
  }
}

test("RED: a mermaid fence in a served collection with no cache entry fails the gate", async () => {
  await withFixture({ "fixture-note.md": NOTE }, async ({ run }) => {
    const failures = await run();

    expect(failures.length).toBe(1);
    const [f] = failures as [string];

    expect(f).toContain("fixture-note.md:9");                 // the line the fence opens on
    expect(f).toContain("served at /fixture/fixture-note");   // the page a visitor would land on
    expect(f).toContain("a mermaid fence has no committed SVG");
    expect(f).toMatch(/Expected .*[0-9a-f]{40}\.svg/);        // the exact file to produce
    expect(f).toContain('Fence opens "flowchart TB"');        // which fence, when a file holds several
    expect(f).toContain(WARM);                                // and what to run about it
  });
});

test("GREEN: the same fence passes once MILL's cache holds its SVG", async () => {
  await withFixture({ "fixture-note.md": NOTE }, async ({ cacheDir, run }) => {
    expect((await run()).length).toBe(1);

    // Fill it exactly as tools/diagram-warm.ts would: MILL's cachedRenderer, MILL's key.
    await cachedRenderer(cacheDir, async () => "<svg data-fixture></svg>", TAG)("mermaid", FENCE_SOURCE);
    expect((await readdir(cacheDir)).length).toBe(1);

    expect(await run()).toEqual([]);
  });
});

test("a cache entry written under a different version tag does NOT satisfy the gate", async () => {
  await withFixture({ "fixture-note.md": NOTE }, async ({ cacheDir, run }) => {
    await cachedRenderer(cacheDir, async () => "<svg/>", "some-older-tag")("mermaid", FENCE_SOURCE);
    // A bumped tag invalidates committed SVGs by design, and the gate is what makes that visible.
    expect((await run()).length).toBe(1);
  });
});

test("every uncached fence is reported, and the same fence twice is reported once", async () => {
  const twice = `---
title: Two fences
---

\`\`\`mermaid label="A goes to B"
${FENCE_SOURCE}
\`\`\`

\`\`\`mermaid label="A goes to B"
${FENCE_SOURCE}
\`\`\`

\`\`\`mermaid label="C goes to D"
flowchart LR
  C --> D
\`\`\`
`;
  await withFixture({ "a.md": NOTE, "b.md": twice }, async ({ run }) => {
    const failures = await run();
    expect(failures.length).toBe(3);                          // a.md once, b.md's two distinct fences
    expect(failures.filter((f) => f.includes("/b.md")).length).toBe(2);
  });
});

test("a non-diagram fence is not the gate's business", async () => {
  const code = `---
title: Just code
---

\`\`\`ts
const x: number = 1;
\`\`\`

\`\`\`
no language at all
\`\`\`
`;
  await withFixture({ "code.md": code }, async ({ run }) => {
    expect(await run()).toEqual([]);
  });
});

test("the gate never writes to the cache it checks", async () => {
  await withFixture({ "fixture-note.md": NOTE }, async ({ cacheDir, run }) => {
    await run();
    await run();
    expect(await readdir(cacheDir)).toEqual([]);              // a probe render is null, and null is never stored
  });
});

// ---- the other negative case: a fence MILL itself refuses -------------------------------------
// Since mill 0.4.0 an unlabelled mermaid fence never reaches the renderer at all. MILL warns and
// degrades it to a code block, so no diagram is produced and there is nothing for a cache to hold.
// That is why the gate stays quiet here, and the quiet is safe rather than blind: the page ships a
// code block, which is honest, instead of raw source pretending to be a figure.
//
// This case is pinned because the two versions behave in OPPOSITE directions and the difference is
// invisible from the gate's own output. Under the pinned 0.3.0 a bare fence failed the gate and a
// LABELLED one was silently skipped, because that parser stopped treating a line as a fence the
// moment it carried any info string. Anyone reading a quiet gate has to know which of those two
// worlds they are in.
test("an unlabelled fence is refused by MILL, so it never reaches the gate", async () => {
  const unlabelled = `---
title: No label
---

\`\`\`mermaid
${FENCE_SOURCE}
\`\`\`
`;
  await withFixture({ "a.md": unlabelled }, async ({ run, cacheDir }) => {
    expect(await run()).toEqual([]);                          // nothing to cache, so nothing to fail
    expect(await readdir(cacheDir)).toEqual([]);              // and nothing was written either
  });
});

// ---- the negative case: a fence outside every served collection --------------------------------
// docs/AUDIT-AI-LOOP-2026-08-13.md carries mermaid fences and reaches no page. Failing on it would
// be a gate people learn to route around, so this pins the boundary rather than trusting it.
test("a mermaid fence in an unserved file does not fail the gate", async () => {
  const audit = join(import.meta.dir, "..", "docs", "AUDIT-AI-LOOP-2026-08-13.md");
  const raw = await Bun.file(audit).text();
  expect(raw).toContain("```mermaid");                        // the file really is a live example

  const servedDirs = Object.values(COLLECTION_DIRS);
  expect(servedDirs.some((d) => audit.startsWith(d + "/"))).toBe(false);

  expect(await checkDiagramCache()).toEqual([]);              // the real repo, real collections
});
