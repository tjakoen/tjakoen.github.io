// Issue only instructor-approved awards from a private manifest. Dry runs expose counts only.
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync, readFileSync, existsSync, writeFileSync, readdirSync, realpathSync, chmodSync } from "node:fs";
import { createHash, randomBytes } from "node:crypto";
import { YAML } from "bun";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://tjakoen.github.io";
export interface BadgeEvidence { url: string; commit?: string }
export interface BadgeActivity { id: string; title: string; description: string; evidence?: BadgeEvidence[]; publicEvidence?: BadgeEvidence[] }
export interface Award {
  awardKey: string; approved: boolean; badgeId: string; course: string; monogram: string;
  section: string; term: string; title: string; description: string; criteria: string;
  recipientKey: string; recipientName: string; recipientHandle: string; identityEmail: string;
  workspaceRepo: string; evidence: BadgeEvidence[]; publicEvidence?: BadgeEvidence[];
  activities: BadgeActivity[]; thresholdPercent: number;
  issuedOn?: string; certSlug?: string; certId?: string; shortId?: string;
}
type Existing = { slug: string; fm: Record<string, unknown>; assertion?: Record<string, any> };
export function existingAwards(dir: string): Existing[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(f => f.endsWith(".md")).flatMap(f => {
    const match = readFileSync(join(dir, f), "utf8").match(/^---\n([\s\S]*?)\n---/);
    if (!match) return [];
    const fm = YAML.parse(match[1]!) as Record<string, unknown>;
    if (fm.type !== "cert") return [];
    const slug = f.slice(0, -3), json = join(dir, `${slug}.ob.json`);
    return [{ slug, fm, assertion: existsSync(json) ? JSON.parse(readFileSync(json, "utf8")) : undefined }];
  });
}
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
const scalar = (s: unknown) => JSON.stringify(s);
function metadata(fields: Record<string, unknown>): string {
  return `---\n${Object.entries(fields).map(([k, v]) => `${k}: ${scalar(v)}`).join("\n")}\n---\n\n`;
}
function fail(index: number, reason: string): never { throw new Error(`Award ${index + 1}: ${reason}`); }
function https(value: unknown): boolean {
  try { const url = new URL(String(value)); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; }
}
function publicCopy(value: unknown): value is string {
  return typeof value === "string" && Boolean(value.trim()) && ![...value].some(c => c.charCodeAt(0) < 32)
    && !/[^\s@]+@[^\s@]+\.[^\s@]+/.test(value) && !/\b\d{7,}\b/.test(value);
}
function publicEvidenceAllowed(e: BadgeEvidence, workspaceRepo: string): boolean {
  if (!https(e?.url) || (e.commit && !/^[a-f\d]{40}$/i.test(e.commit))) return false;
  const url = new URL(e.url), path = decodeURIComponent(url.pathname).split("/").filter(Boolean);
  return url.hostname === "github.com" && path.length >= 2 && !url.search && !url.hash
    && !/^hau-/i.test(path[0]!) && !/^student-/i.test(path[1]!)
    && `${path[0]}/${path[1]}`.toLowerCase() !== workspaceRepo.toLowerCase()
    && !/@|\b\d{7,}\b/.test(path.slice(0,2).join("/"));
}
export function manilaDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const part = (type: string) => parts.find(p => p.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
export function planAwards(manifest: unknown, existing: Existing[] = [], today = manilaDate()) {
  const input = manifest as { schemaVersion?: number; awards?: Award[] };
  if (input?.schemaVersion !== 1 || !Array.isArray(input.awards)) throw new Error("Expected manifest schemaVersion 1 and awards array");
  const keys = new Set<string>(), slugs = new Map<string, string>(), shorts = new Map<string, string>(), ids = new Map<string, string>();
  for (const e of existing) {
    slugs.set(e.slug, String(e.fm.awardKey || `legacy:${e.slug}`));
    if (e.fm.certId) ids.set(String(e.fm.certId), e.slug);
    const short = String(e.fm.shortUrl || "").replace(/^\/b\//, "");
    if (short) shorts.set(short, e.slug);
  }
  const covered = new Set<string>();
  const claimed = new Set<string>();
  const awards = input.awards.map((a, i) => {
    if (!a || a.approved !== true) fail(i, "approval is required");
    for (const k of ["awardKey", "recipientKey", "badgeId", "course", "monogram", "section", "term", "title", "description", "criteria", "workspaceRepo"] as const)
      if (typeof a[k] !== "string" || !a[k].trim() || [...a[k]].some(c => c.charCodeAt(0) < 32)) fail(i, `invalid ${k}`);
    if (keys.has(a.awardKey)) fail(i, "duplicate award key"); keys.add(a.awardKey);
    if (![a.badgeId, a.course, a.term].every(s => /^[a-z0-9][a-z0-9-]*$/.test(s))) fail(i, "unsafe class identifier");
    if (!/^\d{4}$/.test(a.section)) fail(i, "invalid section");
    if (!/^[\p{L}][\p{L}\p{M} .'’,-]*[\p{L}.]$/u.test(a.recipientName || "")) fail(i, "verified recipient name is required");
    if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(a.recipientHandle || "") || /--/.test(a.recipientHandle)) fail(i, "verified GitHub handle is required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.identityEmail || "")) fail(i, "verified identity email is required");
    if (!/^[a-z\d_.-]+\/[a-z\d_.-]+$/i.test(a.workspaceRepo)) fail(i, "invalid workspace repository");
    if (!Array.isArray(a.evidence) || !a.evidence.length || a.evidence.some(e => !https(e.url) || (e.commit && !/^[a-f\d]{40}$/i.test(e.commit)))) fail(i, "HTTPS evidence and valid commit are required");
    if (a.thresholdPercent !== 75) fail(i, "approved badge threshold must be 75 percent");
    if (![a.title,a.description,a.criteria].every(publicCopy)) fail(i, "public badge copy contains private or invalid content");
    if (!Array.isArray(a.activities) || !a.activities.length) fail(i, "designated activity descriptions are required");
    const activityIds = new Set<string>();
    for (const activity of a.activities) {
      if (!activity || !/^m\d{1,2}a\d{1,2}$/.test(activity.id) || activityIds.has(activity.id) || !publicCopy(activity.title) || !publicCopy(activity.description)) fail(i, "invalid or duplicate activity description");
      activityIds.add(activity.id);
      if (activity.evidence && (!Array.isArray(activity.evidence) || activity.evidence.some(e => !https(e.url)))) fail(i, "invalid private activity evidence");
      if (activity.publicEvidence && (!Array.isArray(activity.publicEvidence) || activity.publicEvidence.some(e => !publicEvidenceAllowed(e,a.workspaceRepo)))) fail(i, "unsafe public activity evidence");
    }
    if (a.publicEvidence && (!Array.isArray(a.publicEvidence) || a.publicEvidence.some(e => !publicEvidenceAllowed(e,a.workspaceRepo)))) fail(i, "unsafe public award evidence");
    const prior = existing.find(e => e.fm.awardKey === hash(a.awardKey)) || (a.certSlug ? existing.find(e => e.slug === a.certSlug) : undefined);
    const classSlug = `${a.course}-${a.section}-${a.badgeId}`;
    if (prior) {
      if (prior.fm.awardKey && prior.fm.awardKey !== hash(a.awardKey)) fail(i, "existing award key conflict");
      if (prior.fm.badgeClass !== classSlug) fail(i, "existing badge class conflict");
      if (prior.fm.recipientName !== a.recipientName || String(prior.fm.recipientHandle).toLowerCase() !== a.recipientHandle.toLowerCase()) fail(i, "existing recipient conflict");
      const recipient = prior.assertion?.recipient;
      const legacyIdentity = prior.assertion?.credentialSubject?.identifier?.[0];
      if (legacyIdentity && legacyIdentity.identityHash !== `sha256$${hash(String(legacyIdentity.salt || "") + a.identityEmail.toLowerCase().trim())}`) fail(i, "existing legacy identity conflict");
      if (recipient && recipient.identity !== `sha256$${hash(a.identityEmail.toLowerCase().trim() + recipient.salt)}`) fail(i, "existing identity conflict");
      covered.add(prior.slug);
    }
    if (prior && covered.has(prior.slug) && claimed.has(prior.slug)) fail(i, "duplicate existing certificate claim");
    const digest = hash(a.awardKey);
    const certSlug = prior?.slug || a.certSlug || `award-${digest.slice(0, 24)}`;
    const shortId = String(prior?.fm.shortUrl || "").replace(/^\/b\//, "") || a.shortId || digest.slice(0, 16);
    const certId = String(prior?.fm.certId || a.certId || `hau-${digest.slice(0, 24)}`);
    const issuedOn = String(prior?.fm.issuedOn || a.issuedOn || today);
    if (ids.has(certId) && ids.get(certId) !== prior?.slug) fail(i, "certificate ID collision"); ids.set(certId, certSlug);
    if (a.certId && prior && a.certId !== prior.fm.certId || a.shortId && prior && a.shortId !== shortId || a.issuedOn && prior && a.issuedOn !== issuedOn) fail(i, "existing issuance metadata conflict");
    if (![certSlug, shortId, certId].every(s => /^[a-z\d][a-z\d._-]*$/i.test(s))) fail(i, "unsafe certificate identifier");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(issuedOn) || new Date(issuedOn).toISOString().slice(0,10) !== issuedOn) fail(i, "invalid issue date");
    if (slugs.has(certSlug) && certSlug !== prior?.slug) fail(i, "certificate slug collision"); slugs.set(certSlug, a.awardKey);
    if (shorts.has(shortId) && shorts.get(shortId) !== prior?.slug) fail(i, "short link collision"); shorts.set(shortId, certSlug);
    if (claimed.has(certSlug)) fail(i, "duplicate certificate claim"); claimed.add(certSlug);
    const salt = prior?.assertion?.recipient?.salt || randomBytes(32).toString("hex");
    const collectedPublicEvidence = [...(a.publicEvidence || []), ...a.activities.flatMap(activity => activity.publicEvidence || [])];
    const seenEvidence = new Set<string>();
    const assertionEvidence = collectedPublicEvidence.filter(e => {
      const key = `${e.url}|${e.commit || ""}`;
      if (seenEvidence.has(key)) return false; seenEvidence.add(key); return true;
    }).map(e => ({ id: e.url, type: "Evidence", narrative: e.commit ? `Reviewed commit: ${e.commit}` : undefined }));
    const assertion = {
      "@context": "https://w3id.org/openbadges/v2", id: `${ORIGIN}/badges/${certSlug}.json`, type: "Assertion",
      recipient: { type: "email", hashed: true, salt, identity: `sha256$${hash(a.identityEmail.toLowerCase().trim() + salt)}` },
      issuedOn: `${issuedOn}T00:00:00+08:00`, verification: { type: "HostedBadge" },
      image: `${ORIGIN}/media/badges/${certSlug}.png`,
      badge: { id: `${ORIGIN}/badges/${classSlug}`, type: "BadgeClass", name: a.title, description: a.description,
        image: `${ORIGIN}/media/badges/og-${classSlug}.png`, criteria: { id: `${ORIGIN}/badges/${classSlug}`, narrative: `${a.criteria}\n\nAward threshold: ${a.thresholdPercent}%.\n\n${a.activities.map(activity => `${activity.id}: ${activity.title}. ${activity.description}`).join("\n\n")}` },
        issuer: { id: `${ORIGIN}/teaching`, type: "Profile", name: "Tjakoen Stolk", url: `${ORIGIN}/teaching`, email: "tjakoen.s@gmail.com" } },
      ...(assertionEvidence.length ? { evidence: assertionEvidence } : {}),
    };
    const common = { badgeName: a.title, subtitle: a.title, course: a.course, monogram: a.monogram, term: a.term, issuer: "Tjakoen Stolk", criteriaText: a.criteria, thresholdPercent: a.thresholdPercent, activitiesJson: JSON.stringify(a.activities.map(({id,title,description}) => ({id,title,description}))) };
    const md = metadata({ ...common, activitiesJson: JSON.stringify(a.activities.map(({id,title,description,publicEvidence}) => ({id,title,description,publicEvidence:publicEvidence?.length ? publicEvidence : undefined}))), title: `${a.title}: ${a.recipientName}`, type: "cert", awardKey: digest, badgeClass: classSlug,
      shortUrl: `/b/${shortId}`, recipientName: a.recipientName, recipientHandle: a.recipientHandle,
      issuedOn, certId, criteriaUrl: `/badges/${classSlug}`, social: `I earned ${a.title}. Verify my badge: ${ORIGIN}/b/${shortId}` })
      + `${a.description}\n\nThe instructor approved this award against the [badging activity criteria](/badges/${classSlug}).\n`;
    return { a, certSlug, certId, issuedOn, shortId, classSlug, assertion, md, common };
  });
  const classes = new Map<string, typeof awards>();
  for (const award of awards) {
    const group = classes.get(award.classSlug) || [];
    if (group.length && ["title", "description", "criteria", "term", "monogram", "thresholdPercent"].some(k => (group[0]!.a as any)[k] !== (award.a as any)[k]) || group.length && group[0]!.common.activitiesJson !== award.common.activitiesJson) throw new Error("Conflicting badge class metadata");
    group.push(award); classes.set(award.classSlug, group);
  }
  return { awards, classes, uncovered: existing.filter(e => !covered.has(e.slug)).length };
}
type HubClass = { slug: string; title: string; section: string; count: number; legacy: boolean };
function privateOutput(path: string | undefined, dir: string): void {
  if (!path) return;
  const canonical = (value: string): string => {
    const absolute = resolve(value); if (existsSync(absolute)) return realpathSync(absolute);
    const parent = dirname(absolute); return parent === absolute ? absolute : join(canonical(parent), absolute.slice(parent.length + 1));
  };
  const target = canonical(path), root = canonical(ROOT), publicDir = canonical(dir);
  if (target === root || target.startsWith(root + "/") || target === publicDir || target.startsWith(publicDir + "/")) throw new Error("Manifest output must be outside the public repository and badge content directory");
}
function writePrivate(path: string, value: unknown): void {
  writeFileSync(path, JSON.stringify(value, null, 2) + "\n", {mode:0o600}); chmodSync(path,0o600);
}
export function issue(manifest: unknown, options: { dir: string; emit?: boolean; allowExisting?: boolean; hubPath?: string; issuedManifestPath?: string; previewManifestPath?: string }) {
  privateOutput(options.issuedManifestPath, options.dir); privateOutput(options.previewManifestPath, options.dir);
  const existing = existingAwards(options.dir), plan = planAwards(manifest, existing);
  if (options.emit && plan.uncovered && !options.allowExisting) throw new Error(`Emission held: ${plan.uncovered} existing certificates are not reconciled. --allow-existing preserves legacy awards.`);
  const issuedManifest = { ...(manifest as Record<string, unknown>), schemaVersion: 1, awards: plan.awards.map(award => ({ ...award.a,
    certSlug: award.certSlug, certId: award.certId, shortId: award.shortId,
    issuedOn: award.assertion.issuedOn.slice(0, 10), url: `${ORIGIN}/b/${award.shortId}`, imageUrl: award.assertion.image })) };
  const result = { approved: plan.awards.length, classes: plan.classes.size, legacy: plan.uncovered };
  if (!options.emit) {
    if (options.previewManifestPath) writePrivate(options.previewManifestPath, { ...issuedManifest, preview: true });
    return result;
  }
  // Validate aliases and prepare all class data before the first public write.
  const linksPath = join(options.dir, "shortlinks.json");
  const links = existsSync(linksPath) ? JSON.parse(readFileSync(linksPath, "utf8")) : {};
  for (const e of existing) {
    const short = String(e.fm.shortUrl || "").replace(/^\/b\//, "");
    if (short && links[short] && links[short] !== e.slug) throw new Error("Existing alias conflict");
    if (short) links[short] = e.slug;
  }
  for (const award of plan.awards) if (links[award.shortId] && links[award.shortId] !== award.certSlug) throw new Error("Existing alias conflict");
  const merged = new Map(existing.map(e => [e.slug, e.fm]));
  for (const award of plan.awards) merged.set(award.certSlug, YAML.parse(award.md.split("---\n")[1]!) as Record<string, unknown>);
  const hub = new Map<string, HubClass>();
  if (existsSync(options.dir)) for (const file of readdirSync(options.dir).filter(f => f.endsWith(".md"))) {
    const match = readFileSync(join(options.dir,file), "utf8").match(/^---\n([\s\S]*?)\n---/);
    if (!match) continue;
    const fm = YAML.parse(match[1]!) as Record<string, unknown>;
    if (fm.type === "badge-class") hub.set(file.slice(0,-3), {slug:file.slice(0,-3),title:String(fm.badgeName || fm.title || "Course badge"),section:String(fm.section || ""),count:Number(fm.recipientCount || (Array.isArray(fm.recipients) ? fm.recipients.length : 0)),legacy:!fm.criteriaText});
  }
  const classWrites = new Map<string,string>();
  for (const [slug, group] of plan.classes) {
    const first = group[0]!;
    const count = [...merged.values()].filter(fm => fm.badgeClass === slug && fm.awardKey).length;
    classWrites.set(slug, metadata({ ...first.common, title: first.a.title, section:first.a.section,type: "badge-class", recipientCount: count }) + `${first.a.description}\n\n## Award criteria\n\n${first.a.criteria}\n`);
    hub.set(slug,{slug,title:first.a.title,section:first.a.section,count,legacy:false});
  }
  mkdirSync(options.dir, { recursive: true });
  for (const [slug, md] of classWrites) writeFileSync(join(options.dir, `${slug}.md`), md);
  for (const award of plan.awards) {
    writeFileSync(join(options.dir, `${award.certSlug}.md`), award.md);
    writeFileSync(join(options.dir, `${award.certSlug}.ob.json`), JSON.stringify(award.assertion, null, 2) + "\n");
    links[award.shortId] = award.certSlug;
  }
  writeFileSync(linksPath, JSON.stringify(links, null, 2) + "\n");
  if (options.hubPath) writeFileSync(options.hubPath, hubHtml([...hub.values()], plan.uncovered));
  if (options.issuedManifestPath) writePrivate(options.issuedManifestPath, issuedManifest);
  return result;
}
function hubHtml(classes: HubClass[], legacy: number): string {
  const escape = (s: string) => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
  const rows = classes.toSorted((a,b)=>a.slug.localeCompare(b.slug)).map(group => `<div class="docs-list__item"><a class="docs-list__name" href="/badges/${escape(group.slug)}">${escape(group.title)}${group.section ? `, section ${escape(group.section)}` : ""}</a><span class="docs-list__what">${group.count} ${group.legacy ? "legacy" : "approved"} awards</span></div>`).join("\n");
  return `<!DOCTYPE html><html lang="en" data-themes="sourdough baguette brioche"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Course badges</title></head><body data-screen="badges" class="app-window-backdrop"><div class="app-shell app-window" data-section="bread" data-rail-collapsed="false"><portfolio-frame /><main class="app-shell__main" id="main-content"><div class="board" data-surface="badges:approved"><p class="eyebrow">Course credentials</p><h1 class="masthead">Badges earned in my courses.</h1><p class="lede">Awards recognize designated badging activities at their published threshold, after instructor approval. Each recipient receives a direct certificate link.</p><div class="docs-list">${rows}</div>${legacy ? `<p>${legacy} certificates outside this batch remain available. Legacy eligibility needs separate reconciliation.</p>` : ""}</div></main></div></body></html>\n`;
}
if (import.meta.main) {
  try {
    const index = process.argv.indexOf("--manifest"), path = index >= 0 ? process.argv[index + 1] : undefined;
    if (!path || path.startsWith("--")) throw new Error("Supply --manifest /private/approved-awards.json");
    const flagPath = (flag: string) => { const n = process.argv.indexOf(flag); const value = n < 0 ? undefined : process.argv[n+1]; if (n >= 0 && (!value || value.startsWith("--"))) throw new Error(`Supply a private path for ${flag}`); return value; };
    const result = issue(JSON.parse(readFileSync(path, "utf8")), { dir: join(ROOT, "content", "badges"), emit: process.argv.includes("--emit"), allowExisting: process.argv.includes("--allow-existing"), hubPath: join(ROOT, "view", "pages", "badges", "index.html"), issuedManifestPath:flagPath("--issued-manifest"),previewManifestPath:flagPath("--preview-manifest") });
    console.log(`issue-badges: ${process.argv.includes("--emit") ? "EMIT" : "DRY-RUN"}; approved=${result.approved}; classes=${result.classes}; unreconciled legacy=${result.legacy}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const safe = /^(Award \d+:|Expected manifest|Supply |Manifest output|Emission held:|Conflicting badge class|Existing alias)/.test(message);
    console.error(safe ? message : "Badge issuance failed while reading, parsing, or writing inputs. No recipient details are logged."); process.exitCode = 1;
  }
}
