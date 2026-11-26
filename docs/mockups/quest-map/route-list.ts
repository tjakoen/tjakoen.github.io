// Renders the region, quest and stop lists as plain HTML from the JSON block in fullscreen.html, so the route reads without JavaScript.
// bun docs/mockups/quest-map/route-list.ts rewrites the block between the qm-route markers; the tests fail when the block has drifted.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export type QuestData = {
  quests: { id: string; region: number; title: string; level: string; min: number; stops: string[] }[];
  regions: { n: number; name: string; sub: string; blurb: string }[];
};

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const LEVEL: Record<string, string> = { intro: "Intro", intermediate: "Intermediate", deep: "Deep" };

export function renderRoute(d: QuestData): string {
  const regions = d.regions
    .map((r) => {
      const qs = d.quests.filter((q) => q.region === r.n);
      const quests = qs.length
        ? `<ol>\n${qs
            .map(
              (q) =>
                `<li><h3>${esc(q.title)}</h3>\n<p>${LEVEL[q.level] ?? esc(q.level)} · ${q.min} min · ${q.stops.length} stops</p>\n<ol>\n${q.stops.map((s) => `<li>${esc(s)}</li>`).join("\n")}\n</ol></li>`,
            )
            .join("\n")}\n</ol>`
        : "";
      return `<li><h2>${esc(r.name)}</h2>\n<p>${esc(r.sub)}. ${esc(r.blurb)}</p>\n${quests}</li>`;
    })
    .join("\n");
  return `<div id="route" class="route">\n<h1>Learn AI with me</h1>\n<p>This is the route through the notes, in order: six regions, the quests in each and the stops in each quest. The interactive map needs JavaScript.</p>\n<ol>\n${regions}\n</ol>\n</div>`;
}

const OPEN = "<!--qm-route-->", CLOSE = "<!--/qm-route-->";
export const readData = (html: string): QuestData => JSON.parse(html.match(/<script type="application\/json" id="qm-data">([\s\S]*?)<\/script>/)![1]);
export const currentBlock = (html: string) => html.slice(html.indexOf(OPEN) + OPEN.length, html.indexOf(CLOSE)).trim();

if (import.meta.main) {
  const file = join(dirname(new URL(import.meta.url).pathname), "fullscreen.html");
  const html = readFileSync(file, "utf8");
  const next = html.slice(0, html.indexOf(OPEN) + OPEN.length) + "\n" + renderRoute(readData(html)) + "\n" + html.slice(html.indexOf(CLOSE));
  writeFileSync(file, next);
  console.log(next === html ? "route list already current" : "route list rewritten");
}
