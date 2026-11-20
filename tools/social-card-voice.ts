// Render the voice file note's wording comparison as a square social card.
// Run with: bun tools/social-card-voice.ts
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE } from "../src/seo.ts";

const OUT = join(import.meta.dir, "..", "content", "media", "notes");
const FILE = "the-voice-file-social-ticket.png";
const W = 1200;
const H = 1200;
const HOST = new URL(SITE.origin).host;
const PAPER = "#E2E0D8";
const INK = "#1C1B17";
const MUTED = "#6E6C64";
const LINE = "rgba(28,27,23,.18)";

const card = `<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;background:${PAPER}}
  svg{display:block;font-family:Georgia,'Times New Roman',serif}
</style></head><body>
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"
       role="img" aria-label="The same sign-in report in elaborate AI wording and plain language. Both versions say sign-in worked on a laptop, reached the dashboard, and still needs testing on a phone. Only the wording changes.">
    <rect width="${W}" height="${H}" style="fill:${PAPER}"/>
    <text x="96" y="98" style="fill:${MUTED};font-size:25px;letter-spacing:4px">VOICE.md</text>
    <text x="96" y="199" style="fill:${INK};font-size:86px">AI says a lot.</text>
    <text x="96" y="269" style="fill:${INK};font-size:48px">Your reader still has to</text>
    <text x="96" y="325" style="fill:${INK};font-size:48px">find the point.</text>

    <rect x="96" y="370" width="1008" height="318" rx="8" style="fill:none;stroke:${LINE};stroke-width:2"/>
    <text x="128" y="416" style="fill:${MUTED};font-size:26px">THE AI DRAFT</text>
    <text x="128" y="470" style="fill:${INK};font-size:38px">The application’s sign-in functionality was</text>
    <text x="128" y="516" style="fill:${INK};font-size:38px">successfully validated on a laptop, with</text>
    <text x="128" y="562" style="fill:${INK};font-size:38px">subsequent navigation to the dashboard.</text>
    <text x="128" y="608" style="fill:${INK};font-size:38px">Validation of sign-in functionality on a</text>
    <text x="128" y="654" style="fill:${INK};font-size:38px">phone remains pending.</text>

    <rect x="96" y="716" width="1008" height="269" rx="8" style="fill:${INK}"/>
    <text x="128" y="763" style="fill:${PAPER};font-size:26px">IN YOUR OWN WORDS</text>
    <text x="128" y="824" style="fill:${PAPER};font-size:41px">I signed in on my laptop and reached</text>
    <text x="128" y="876" style="fill:${PAPER};font-size:41px">the dashboard. I still need to test</text>
    <text x="128" y="928" style="fill:${PAPER};font-size:41px">sign-in on a phone.</text>

    <text x="96" y="1050" style="fill:${INK};font-size:36px;font-style:italic">The same facts, in your own words.</text>
    <line x1="96" y1="1094" x2="1104" y2="1094" style="stroke:${LINE};stroke-width:1"/>
    <text x="96" y="1149" style="fill:${INK};font-size:24px">Write for the Person Who Has to Read It</text>
    <text x="1104" y="1149" text-anchor="end" style="fill:${MUTED};font-size:22px">${HOST}</text>
  </svg>
</body></html>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.setContent(card, { waitUntil: "networkidle" });
  const clippedText = await page.locator("svg text").evaluateAll((nodes) => nodes
    .filter((node) => {
      const box = (node as SVGGraphicsElement).getBBox();
      return box.x < 0 || box.y < 0 || box.x + box.width > 1200 || box.y + box.height > 1200;
    }).map((node) => node.textContent));
  if (clippedText.length) throw new Error(`Card text exceeds the canvas: ${clippedText.join("; ")}`);
  const buf = await page.screenshot({ clip: { x: 0, y: 0, width: W, height: H }, type: "png" });
  await mkdir(OUT, { recursive: true });
  await writeFile(join(OUT, FILE), buf);
  console.log(`Wrote content/media/notes/${FILE} (${W}×${H}, ${(buf.length / 1024).toFixed(1)}kb)`);
} finally {
  await browser.close();
}
