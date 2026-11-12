// portfolio/tools/social-card-orchestration.ts — render the LinkedIn image for the orchestration note.
//
// One card in the family of tools/social-card.ts (1200×1200, paper and ink, Georgia, the host in the
// footer): the title as the hook, the split drawn as three boxes, and the loop underneath named as
// the thing that makes the cheap setting safe.
//
//   bun run social:card:orchestration   # → content/media/notes/plan-big-type-small-social.png
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
const W=1200,H=1200,PAPER="#E2E0D8",INK="#1C1B17",MUTED="#6E6C64",LINE="rgba(28,27,23,.18)",HOST="portfolio.tjakoen.com";
const TITLE="Plan on the Big Model, Type on the Small One";
const box=(x:number,y:number,w:number,a:string,b:string,dark=false)=>`<rect x="${x}" y="${y}" width="${w}" height="150" rx="10" style="fill:${dark?INK:"none"};stroke:${INK};stroke-width:2.5"/>
<text x="${x+w/2}" y="${y+66}" text-anchor="middle" style="fill:${dark?PAPER:INK};font-size:40px">${a}</text>
<text x="${x+w/2}" y="${y+110}" text-anchor="middle" style="fill:${dark?PAPER:MUTED};font-size:26px;font-style:italic">${b}</text>`;
const html=`<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0}</style></head><body>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Georgia, 'Times New Roman', serif">
<defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto"><path d="M0,0 L10,5 L0,10 z" style="fill:${MUTED}"/></marker></defs>
<rect width="${W}" height="${H}" style="fill:${PAPER}"/>
<rect x="28" y="28" width="${W-56}" height="${H-56}" rx="10" style="fill:none;stroke:${LINE};stroke-width:1.5"/>
<text x="96" y="140" style="fill:${MUTED};font-size:21px;letter-spacing:6px">ADVICE I THOUGHT WAS OBVIOUS</text>
<text x="96" y="250" style="fill:${INK};font-size:80px;letter-spacing:-1.5px">Plan on the big model.</text>
<text x="96" y="345" style="fill:${INK};font-size:80px;letter-spacing:-1.5px;font-style:italic">Type on the small one.</text>
${box(96,450,300,"Opus","plans the work")}
${box(450,450,300,"Sonnet","types each piece")}
${box(804,450,300,"Opus","reviews it")}
<line x1="398" y1="525" x2="446" y2="525" style="stroke:${MUTED};stroke-width:2.5" marker-end="url(#arr)"/>
<line x1="752" y1="525" x2="800" y2="525" style="stroke:${MUTED};stroke-width:2.5" marker-end="url(#arr)"/>
${box(96,700,1008,"Your loop","the files that let a cheap setting carry the context",true)}
<text x="600" y="680" text-anchor="middle" style="fill:${MUTED};font-size:26px;font-style:italic">all of it stands on</text>
<text x="96" y="980" style="fill:${MUTED};font-size:30px">Models get retired. The loop you build around them stays,</text>
<text x="96" y="1030" style="fill:${MUTED};font-size:30px">and it gets better every time you teach it something.</text>
<line x1="96" y1="1122" x2="${W-96}" y2="1122" style="stroke:${LINE};stroke-width:1"/>
<text x="96" y="1158" style="fill:${INK};font-size:22px">${TITLE}</text>
<text x="${W-96}" y="1158" text-anchor="end" style="fill:${MUTED};font-size:21px">${HOST}</text>
</svg></body></html>`;
const b=await chromium.launch();
try{const pg=await b.newPage({viewport:{width:W,height:H}});
const OUT=join(import.meta.dir,"..","content","media","notes");await mkdir(OUT,{recursive:true});
await pg.setContent(html,{waitUntil:"networkidle"});
await writeFile(join(OUT,"plan-big-type-small-social.png"),await pg.screenshot({clip:{x:0,y:0,width:W,height:H}}));
}finally{await b.close();}
console.log("[social:card:orchestration] wrote content/media/notes/plan-big-type-small-social.png");
