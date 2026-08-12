// portfolio/component-refs.ts — the preflight that turns a silent hollow page into a loud failure.
//
// Why this exists, measured on 2026-08-13. The Contact tab and the builder page render their controls
// from data through grain's b-field/b-choice/b-option atoms, which shipped in grain but are not
// published yet. With the published package in place instead, nothing fails: the renderer walks only
// KNOWN component tags, so an unknown one is left exactly as it was written and passes through to the
// browser. Both pages answered 200, no warning was logged, and the Contact tab rendered its copy, its
// Send button and zero fields. The export gate passed too, because a dead-link walk has no opinion
// about a missing control.
//
// So the check is not "did the page render", it is "does every component a template asks for actually
// exist". No hand-maintained list of important components: the templates declare their own
// dependencies by using them, and this reads that. A component that stops existing fails here, at
// boot or at export, rather than in front of a visitor.

import { readdir } from "node:fs/promises";
import { join } from "node:path";

/** An HTML tag is a component reference when it is hyphenated: the renderer's own rule (a component
 *  name must contain a hyphen or the registry ignores it). Void/self-closing forms are all covered
 *  because only the NAME is captured. */
const TAG_RE = /<([a-z][a-z0-9]*-[a-z0-9-]*)(?=[\s/>])/g;

/** Strip the parts of a template that are talking ABOUT markup rather than using it: HTML comments
 *  (a commented-out tag is not a dependency) and pre/code blocks (a usage example on a demo page is
 *  the whole point of the builder page, and it must not read as a missing component). */
export function strippedForScan(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<pre\b[\s\S]*?<\/pre>/gi, " ")
    .replace(/<code\b[\s\S]*?<\/code>/gi, " ")
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ");
}

/** Every component tag a template references, deduplicated, in first-seen order. */
export function componentRefs(html: string): string[] {
  const seen = new Set<string>();
  for (const m of strippedForScan(html).matchAll(TAG_RE)) seen.add(m[1]!);
  return [...seen];
}

async function htmlFilesUnder(dir: string): Promise<string[]> {
  const out: string[] = [];
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); }
  catch { return out; }                                  // a root that does not exist is not a failure here
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...await htmlFilesUnder(full));
    else if (e.name.endsWith(".html")) out.push(full);
  }
  return out;
}

/** A component resolves when one of the component roots holds a directory of that name — the same
 *  disk convention createRenderer reads. */
async function resolvable(name: string, roots: string[]): Promise<boolean> {
  for (const root of roots) {
    const dirs = await readdir(root, { withFileTypes: true }).catch(() => []);
    if (dirs.some((d) => d.isDirectory() && d.name === name)) return true;
    // components are nested one level by layer (atoms/, molecules/, organisms/, pages/)
    for (const layer of dirs.filter((d) => d.isDirectory())) {
      const inner = await readdir(join(root, layer.name), { withFileTypes: true }).catch(() => []);
      if (inner.some((d) => d.isDirectory() && d.name === name)) return true;
    }
  }
  return false;
}

export interface MissingRef { component: string; template: string }

/** Walk every page and component template and report each referenced component that no root can
 *  resolve. An empty array is the pass. */
export async function findMissingComponents(templateDirs: string[], componentRoots: string[]): Promise<MissingRef[]> {
  const missing: MissingRef[] = [];
  const checked = new Map<string, boolean>();
  for (const dir of templateDirs) {
    for (const file of await htmlFilesUnder(dir)) {
      const html = await Bun.file(file).text();
      for (const name of componentRefs(html)) {
        if (!checked.has(name)) checked.set(name, await resolvable(name, componentRoots));
        if (!checked.get(name)) missing.push({ component: name, template: file });
      }
    }
  }
  return missing;
}

/** The message a failure prints. Kept here so the test, the export preflight and anything later all
 *  say the same thing, including the one cause that has actually happened. */
export function missingReport(missing: MissingRef[]): string {
  const lines = missing.map((m) => `  ✗ <${m.component}> is used by ${m.template} and no component root has it`);
  return [
    `[preflight] ${missing.length} unresolved component reference(s):`,
    ...lines,
    ``,
    `An unknown tag does not throw: the renderer leaves it alone and the page ships hollow.`,
    `If these are grain's, the installed @tjakoen/grain predates them. Check what`,
    `node_modules/@tjakoen/grain resolves to before believing a green build.`,
  ].join("\n");
}
