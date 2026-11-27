// tools/social-card-harbor.ts — the social card for each Harbor note: one family, set from the note's own words.
//   bun run social:card:harbor   # → content/media/notes/<slug>-social.png for every note the Harbor region lists
// Each card carries the note's title and the first line of its social post, on the same paper as the other cards. It also writes
// socialImage and socialImageAlt into the note's front matter when they are missing, so a note cannot ship a card with no alt text.
import { chromium } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE } from "../src/seo.ts";

const ROOT = join(import.meta.dir, "..");
const OUT = join(ROOT, "content", "media", "notes");
const W = 1200, H = 1200;
const HOST = new URL(SITE.origin).host;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const harbor = (JSON.parse(await readFile(join(ROOT, "content", "quests", "regions.json"), "utf8")) as { regions: { id: string; notes: string[] }[] }).regions.find((r) => r.id === "harbor")!.notes;

const card = (n: number, title: string, line: string) => `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0}
.c{box-sizing:border-box;width:${W}px;height:${H}px;background:#E2E0D8;color:#1C1B17;font-family:Georgia,'Times New Roman',serif;padding:96px;position:relative}
.c::before{content:"";position:absolute;inset:28px;border:1.5px solid rgba(28,27,23,.18);border-radius:10px}
.k{font-size:21px;letter-spacing:6px;color:#6E6C64;text-transform:uppercase}
h1{font-weight:400;font-size:${title.length > 52 ? 72 : 86}px;line-height:1.08;letter-spacing:-1.5px;margin:48px 0 0}
.l{position:absolute;left:96px;right:96px;bottom:250px;font-size:38px;line-height:1.35;font-style:italic;color:#1C1B17}
.f{position:absolute;left:96px;right:96px;bottom:70px;border-top:1px solid rgba(28,27,23,.18);padding-top:30px;display:flex;justify-content:space-between;font-size:22px;color:#6E6C64}
</style></head><body><div class="c"><div class="k">The Harbor · Learn AI with me · ${n}</div><h1>${esc(title)}</h1><div class="l">${esc(line)}</div><div class="f"><span>A journey and an invitation, not a tutorial</span><span>${HOST}</span></div></div></body></html>`;

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await mkdir(OUT, { recursive: true });
  for (const [i, slug] of harbor.entries()) {
    const file = join(ROOT, "content", "notes", `${slug}.md`);
    const text = await readFile(file, "utf8");
    const fm = Bun.YAML.parse(/^---\n([\s\S]*?)\n---/.exec(text)![1]!) as Record<string, unknown>;
    const title = String(fm.title), line = String(fm.social ?? "").trim().split("\n")[0]!.trim();
    await page.setContent(card(i + 1, title, line), { waitUntil: "networkidle" });
    const buf = await page.screenshot({ clip: { x: 0, y: 0, width: W, height: H }, type: "png" });
    await writeFile(join(OUT, `${slug}-social.png`), buf);
    if (!fm.socialImage) {
      const alt = `A card from the Harbor path of Learn AI with me, titled ${title}, with the line: ${line}`;
      const next = text.replace(/\n---\n/, `\nsocialImage: "/media/notes/${slug}-social.png"\nsocialImageAlt: ${JSON.stringify(alt)}\n---\n`);
      await writeFile(file, next);
    }
    console.log(`[social:card:harbor] ${slug} (${(buf.length / 1024).toFixed(0)}kb)`);
  }
} finally { await browser.close(); }
