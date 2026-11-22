// portfolio/tools/social-card-model-layer.ts — render the LinkedIn image for the necessity-and-the-model-layer note.
//
// The full architecture of the Model Intelligence Layer on one square card, in the family of the other
// social cards (paper and ink, Georgia, the host in the footer). It is drawn on a 1200 point canvas and
// rendered at twice the density, so the PNG is 2400 by 2400. LinkedIn accepts images up to about 36
// megapixels and, in practice, 5 MB, so 2400 square (5.8 MP, well under 5 MB for flat paper and ink) is the
// largest size that stays crisp in the feed and safe to upload.
//
//   bun run social:card:model-layer   # → content/media/notes/necessity-and-the-model-layer-social.png
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
const W=1200,H=1200,PAPER="#E2E0D8",INK="#1C1B17",MUTED="#6E6C64",LINE="rgba(28,27,23,.18)",HOST="portfolio.tjakoen.com";
const TITLE="Necessity Is the Mother of Innovation";
const ROOT=join(import.meta.dir,"..");
const box=(x:number,y:number,w:number,h:number,a:string,b:string,dash=false)=>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" style="fill:none;stroke:${INK};stroke-width:2.5${dash?";stroke-dasharray:10 8":""}"/>
<text x="${x+w/2}" y="${y+h/2-4}" text-anchor="middle" style="fill:${INK};font-size:30px">${a}</text>
<text x="${x+w/2}" y="${y+h/2+30}" text-anchor="middle" style="fill:${MUTED};font-size:22px">${b}</text>`;
const arrow=(x:number,y1:number,y2:number)=>`<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" style="stroke:${MUTED};stroke-width:3"/><path d="M${x-9},${y2-14} L${x},${y2} L${x+9},${y2-14}" style="fill:none;stroke:${MUTED};stroke-width:3"/>`;
const part=(x:number,a:string,b:string,c:string)=>`<text x="${x}" y="548" text-anchor="middle" style="fill:${PAPER};font-size:28px">${a}</text><text x="${x}" y="580" text-anchor="middle" style="fill:${PAPER};opacity:.8;font-size:21px">${b}</text><text x="${x}" y="606" text-anchor="middle" style="fill:${PAPER};opacity:.8;font-size:21px">${c}</text>`;
const card=`<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0}</style></head><body>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Georgia, 'Times New Roman', serif">
<rect width="${W}" height="${H}" style="fill:${PAPER}"/>
<rect x="28" y="28" width="${W-56}" height="${H-56}" rx="10" style="fill:none;stroke:${LINE};stroke-width:1.5"/>
<text x="84" y="112" style="fill:${MUTED};font-size:21px;letter-spacing:6px">THE MODEL INTELLIGENCE LAYER</text>
<text x="84" y="196" style="fill:${INK};font-size:64px;letter-spacing:-1px">I ran out with hours left.</text>
<text x="84" y="270" style="fill:${INK};font-size:64px;letter-spacing:-1px;font-style:italic">So the model became a decision.</text>
${box(84,340,300,100,"Claude Code","main session, Claude")}
${box(450,340,300,100,"OpenCode","all other coding")}
${box(816,340,300,100,"Codex app","non-coding work")}
${arrow(234,440,486)}${arrow(600,440,486)}${arrow(966,440,486)}
<rect x="84" y="490" width="1032" height="140" rx="10" style="fill:${INK}"/>
${part(215,"Registry","every model id","lives in one file")}
${part(475,"Model guard","wrong model","restarts itself")}
${part(735,"Route check","cooldowns, repo","clearance, order")}
${part(990,"Work guard","company accounts","only at work")}
${arrow(189,630,690)}${arrow(439,630,690)}${arrow(759,630,690)}${arrow(1020,630,690)}
${box(84,694,210,110,"Claude","private")}
${box(334,694,210,110,"Codex","private")}
${box(634,694,250,110,"Free chain","may keep prompts",true)}
${box(924,694,192,110,"DeepSeek","paid, capped",true)}
<rect x="84" y="852" width="1032" height="76" rx="10" style="fill:none;stroke:${INK};stroke-width:2.5"/>
<text x="600" y="898" text-anchor="middle" style="fill:${INK};font-size:28px">One usage record per session and subagent. Free and paid kept apart.</text>
<text x="84" y="1000" style="fill:${INK};font-size:34px">Free models and DeepSeek are for personal projects only.</text>
<text x="84" y="1048" style="fill:${INK};font-size:34px;font-style:italic">Work uses only the company's Claude and Codex.</text>
<line x1="84" y1="1100" x2="${W-84}" y2="1100" style="stroke:${LINE};stroke-width:1"/>
<text x="84" y="1146" style="fill:${INK};font-size:22px">${TITLE}</text>
<text x="${W-84}" y="1146" text-anchor="end" style="fill:${MUTED};font-size:21px">${HOST}</text>
</svg></body></html>`;
const b=await chromium.launch();
try{const pg=await b.newPage({viewport:{width:W,height:H},deviceScaleFactor:2});
const OUT=join(ROOT,"content","media","notes");await mkdir(OUT,{recursive:true});
await pg.setContent(card,{waitUntil:"networkidle"});
await writeFile(join(OUT,"necessity-and-the-model-layer-social.png"),await pg.screenshot({clip:{x:0,y:0,width:W,height:H}}));
}finally{await b.close();}
console.log("[social:card:model-layer] wrote content/media/notes/necessity-and-the-model-layer-social.png (2400x2400)");
