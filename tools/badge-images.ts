// tools/badge-images.ts — raster the badge art into the PNGs the share layer needs.
//
// Two outputs, both headless via Playwright (already a devDependency, same path as tools/og-card.ts,
// no new runtime dep):
//   1. media/badges/og-<class>.png   — the 1200x630 unfurl card (og:image) for each badge class:
//      medallion + course name + what it covers + issuer. One per class, not per recipient.
//   2. media/badges/<cert>.png        — the downloadable badge for each cert: the medallion on paper,
//      with that cert's Open Badges assertion BAKED into a PNG iTXt "openbadges" chunk (the OB
//      image-baking spec), for approved hosted OB2 awards. Historical images do not gain a portable assertion.
//
// It reads the EMITTED content/badges/*.md (so it runs after tools/issue-badges.ts --emit) and the
// sibling *.ob.json for the assertion. Nothing here reads the gradebooks.
//
//   bun tools/badge-images.ts            # render everything found in content/badges/
//   bun tools/badge-images.ts --og-only  # just the class unfurl cards (skip per-cert baking)

import { YAML } from "bun";
import { chromium, type Browser } from "@playwright/test";
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { badgeMedallionSvg, BADGE_COURSE_NAMES } from "../src/content.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const BADGES = join(HERE, "..", "content", "badges");
const OUT = join(HERE, "..", "content", "media", "badges");
const OG_ONLY = process.argv.includes("--og-only");

// Course hue hex — the literal values behind BADGE_STYLE's --badge-* custom properties (the page uses
// the property, this headless render has no site CSS so it needs the resolved colour).
const HUE: Record<string, string> = { apsi: "#d07f4a", adet: "#3fa89e", introweb: "#8877d6" };
const PAPER = "#E2E0D8", INK = "#1C1B17", MUTED = "#6E6C64";

// The issuer writes JSON-quoted YAML scalars. Parse them rather than stripping their quotes.
export function frontmatter(md: string): Record<string, string> {
  const m = md.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const parsed = YAML.parse(m[1]!) as Record<string, unknown>;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Expected badge frontmatter object");
  const out: Record<string, string> = {};
  for (const key of ["type", "course", "subtitle", "badgeName", "issuer", "year", "issuedOn", "recipientName"]) {
    const value = parsed[key]; if (value === undefined || value === null) continue;
    if (typeof value !== "string" && typeof value !== "number") throw new Error(`Expected scalar badge field: ${key}`);
    out[key] = String(value);
  }
  return out;
}
const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]!);

// --- PNG iTXt baking (Open Badges) -------------------------------------------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
function crc32(buf: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]!) & 0xff]! ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
// Insert an iTXt chunk (keyword "openbadges") carrying the assertion, right before IEND.
export function bakeOpenBadge(png: Buffer, assertion: string): Buffer {
  if (png.length < 20 || !png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) || png.subarray(png.length-8,png.length-4).toString("ascii") !== "IEND") throw new Error("Expected PNG with terminal IEND chunk");
  const keyword = "openbadges";
  const data = Buffer.concat([
    Buffer.from(keyword, "latin1"), Buffer.from([0, 0, 0, 0, 0]), // keyword\0 compFlag compMethod lang\0 transKeyword\0
    Buffer.from(assertion, "utf8"),
  ]);
  const type = Buffer.from("iTXt", "latin1");
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([type, data])), 0);
  const chunk = Buffer.concat([len, type, data, crc]);
  // IEND is the last 12 bytes; splice the new chunk before it.
  const iendAt = png.length - 12;
  return Buffer.concat([png.subarray(0, iendAt), chunk, png.subarray(iendAt)]);
}

export function bakeHostedBadge(png: Buffer, assertion: string): Buffer {
  if (!assertion) return png;
  const parsed = JSON.parse(assertion) as {type?: unknown; verification?: {type?:unknown}; "@context"?:unknown};
  if (parsed.type !== "Assertion" || parsed.verification?.type !== "HostedBadge" || parsed["@context"] !== "https://w3id.org/openbadges/v2") return png;
  return bakeOpenBadge(png, assertion);
}

// --- render helpers ----------------------------------------------------------
const FONT = "Georgia, 'Times New Roman', serif";
function badgeYear(fm: Record<string, string>): string {
  return (String(fm.year || fm.issuedOn || "").slice(0, 4)) || String(new Date().getFullYear());
}
function badgeSvg(fm: Record<string, string>, size: number): string {
  return badgeMedallionSvg({
    courseName: BADGE_COURSE_NAMES[fm.course!] || fm.course || "", subtitle: fm.subtitle || "",
    year: badgeYear(fm), issuerName: fm.issuer || "Tjakoen Stolk", course: fm.course,
    recipient: fm.recipientName || undefined,   // a cert file carries the recipient; a class file does not
    hue: HUE[fm.course!] ?? INK, ink: INK, muted: MUTED, paper: "#FFFFFF", font: FONT, size,
  });
}
export function medallionHtml(fm: Record<string, string>, size: number): string {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    html,body{margin:0} .wrap{width:${size}px;height:${Math.round(size * 340 / 300) + 40}px;background:${PAPER};display:flex;align-items:center;justify-content:center}
  </style></head><body><div class="wrap">${badgeSvg(fm, size - 40)}</div></body></html>`;
}
// The unfurl card, in the Claude-Academy layout: the course name as the eyebrow + the skill as the
// headline on the left, the badge on the right, on the course hue. The foot names the instructor who
// issues it, with the school as affiliation rather than as the issuing body.
export function ogCardHtml(fm: Record<string, string>): string {
  const hue = HUE[fm.course!] ?? INK;
  const courseName = BADGE_COURSE_NAMES[fm.course!] || fm.course || "";
  const skill = fm.subtitle || fm.badgeName || "";
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    html,body{margin:0}
    .card{box-sizing:border-box;width:1200px;height:630px;background:${hue};color:#FFFFFF;
      font-family:${FONT};display:flex;align-items:center;justify-content:space-between;gap:40px;padding:70px 80px;position:relative}
    .txt{display:flex;flex-direction:column;max-width:640px}
    .brand{display:flex;align-items:center;gap:14px;font-size:30px;font-weight:700;margin:0 0 40px}
    .brand .star{font-size:34px}
    .eyebrow{font-size:22px;letter-spacing:.22em;text-transform:uppercase;opacity:.85;margin:0 0 18px}
    .skill{font-size:64px;line-height:1.04;margin:0;font-weight:400}
    .issuer{font-size:22px;opacity:.85;margin:28px 0 0}
    .art{flex:0 0 auto;background:#FFFFFF;border-radius:24px;padding:14px;display:flex}
  </style></head><body>
    <div class="card">
      <div class="txt">
        <p class="brand">${escapeHtml(courseName)}</p>
        <p class="eyebrow">Course badge</p>
        <h1 class="skill">${escapeHtml(skill)}</h1>
        <p class="issuer">Issued by ${escapeHtml(fm.issuer || "Tjakoen Stolk")} · Instructor, Holy Angel University</p>
      </div>
      <div class="art">${badgeSvg(fm, 300)}</div>
    </div></body></html>`;
}

async function shot(browser: Browser, html: string, w: number, h: number): Promise<Buffer> {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: "networkidle" });
  const buf = await page.locator(w === h ? ".wrap" : ".card").screenshot({ type: "png" });
  await page.close();
  return buf;
}

// Batch render for tools/issue-badges.ts: jobs arrive as JSON on stdin, PNGs leave as <index>.png in the directory after --render-jobs.
export interface ImageJob { kind: "cert" | "og"; path: string; md: string; assertion?: string }
export async function renderJobs(browser: Browser, jobs: ImageJob[]): Promise<Buffer[]> {
  const out: Buffer[] = [];
  for (const job of jobs) {
    const fm = frontmatter(job.md);
    out.push(job.kind === "og" ? await shot(browser, ogCardHtml(fm), 1200, 630) : bakeHostedBadge(await shot(browser, medallionHtml(fm, 600), 600, 600), job.assertion || ""));
  }
  return out;
}
const JOBS_FLAG = process.argv.indexOf("--render-jobs");
if (import.meta.main && JOBS_FLAG >= 0) {
  const dir = process.argv[JOBS_FLAG + 1]!, jobs = JSON.parse(await Bun.stdin.text()) as ImageJob[];
  const browser = await chromium.launch();
  try { (await renderJobs(browser, jobs)).forEach((png, i) => writeFileSync(join(dir, `${i}.png`), png)); } finally { await browser.close(); }
}

// --- run ---------------------------------------------------------------------
if (import.meta.main && JOBS_FLAG < 0) {
mkdirSync(OUT, { recursive: true });
const files = readdirSync(BADGES).filter((f) => f.endsWith(".md"));
const classes = files.filter((f) => frontmatter(readFileSync(join(BADGES, f), "utf8")).type === "badge-class");
const certs = files.filter((f) => frontmatter(readFileSync(join(BADGES, f), "utf8")).type === "cert");
console.log(`badge-images: ${classes.length} classes, ${certs.length} certs`);

const browser = await chromium.launch();
// Class OG cards use the GENERIC badge art (no recipient). Cert badges now bake the recipient's name
// into the medallion, so each is rendered per cert rather than reused from a per-class cache.
for (const f of classes) {
  const fm = frontmatter(readFileSync(join(BADGES, f), "utf8"));
  const slug = f.replace(/\.md$/, "");
  writeFileSync(join(OUT, `og-${slug}.png`), await shot(browser, ogCardHtml(fm), 1200, 630));
}
console.log(`  wrote ${classes.length} og-*.png`);

if (!OG_ONLY) {
  let rendered = 0, baked = 0;
  for (const f of certs) {
    const fm = frontmatter(readFileSync(join(BADGES, f), "utf8"));
    const slug = f.replace(/\.md$/, "");
    const medallion = await shot(browser, medallionHtml(fm, 600), 600, 600); // per cert: carries the name
    const obPath = join(BADGES, `${slug}.ob.json`);
    const assertion = existsSync(obPath) ? readFileSync(obPath, "utf8") : "";
    const png = bakeHostedBadge(medallion, assertion);
    writeFileSync(join(OUT, `${slug}.png`), png);
    rendered++; if (png !== medallion) baked++;
    if (rendered % 100 === 0) console.log(`  ...${rendered} cert badges`);
  }
  console.log(`  wrote ${rendered} per-cert PNGs: ${baked} hosted OB2 assertions baked; ${rendered-baked} historical images without portable assertions`);
}
await browser.close();
console.log("done.");

}
