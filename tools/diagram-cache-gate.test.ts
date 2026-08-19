// portfolio/tools/diagram-cache-gate.test.ts — the gate has to be seen going RED.
//
// Served content holds one mermaid fence today, in docs/mill/ARCHITECTURE.md, and its SVG is
// committed, so the gate passes against the real repo. A green run proves nothing on its own: a
// gate that always returned an empty array would pass the same way. Every test here builds a
// fixture collection with a real fence and an empty cache, shows the failure, then fills the cache
// and shows it clear.
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

// ---- the second door: a fence MILL itself refuses ---------------------------------------------
// Since mill 0.4.0 an unlabelled mermaid fence never reaches the renderer. MILL warns and degrades
// it to a code block, so no diagram is produced and nothing is ever looked up in the cache. The
// miss-counting half of this gate therefore cannot see it, and for a while the gate stayed green
// while such a page published raw mermaid source, which is the exact failure it exists to stop.
//
// The gate now makes a second pass over MILL's own parse and fails an unnamed diagram fence. These
// two tests are the ones that would go quiet if that pass were ever removed, so they assert the
// message a person acts on rather than only the count.
test("RED: an unlabelled fence fails the gate, because MILL refuses it and the page ships the source", async () => {
  const unlabelled = `---
title: No label
---

\`\`\`mermaid
${FENCE_SOURCE}
\`\`\`
`;
  await withFixture({ "a.md": unlabelled }, async ({ run, cacheDir }) => {
    const failures = await run();

    expect(failures.length).toBe(1);
    const [f] = failures as [string];

    expect(f).toContain("a.md:5");                            // the line the fence opens on
    expect(f).toContain("served at /fixture/a");
    expect(f).toContain("has no accessible name");
    expect(f).toContain('Add label="…"');                     // what to do about it
    expect(f).not.toContain("has no committed SVG");          // this is the other door, not a cache miss

    expect(await readdir(cacheDir)).toEqual([]);              // and nothing was written either
  });
});

test("RED: a near-miss key is named, because caption= is the obvious thing to type", async () => {
  const captioned = `---
title: Near miss
---

\`\`\`mermaid caption="A goes to B"
${FENCE_SOURCE}
\`\`\`
`;
  await withFixture({ "a.md": captioned }, async ({ run }) => {
    const [f] = (await run()) as [string];
    expect(f).toContain("The fence spells caption");
    expect(f).toContain("the accessible name is spelled label");
  });
});

test("GREEN: adding the label and the SVG clears both doors", async () => {
  await withFixture({ "fixture-note.md": NOTE }, async ({ cacheDir, run }) => {
    await cachedRenderer(cacheDir, async () => "<svg data-fixture></svg>", TAG)("mermaid", FENCE_SOURCE);
    expect(await run()).toEqual([]);
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
