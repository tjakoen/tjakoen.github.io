// portfolio/tools/social-card-model-layer.ts — render the LinkedIn image for the Model Intelligence Layer notes.
//
// The layers of the setup on one square card, in the family of the other social cards (paper and ink,
// Georgia, the host in the footer): me, the loop, the layer with the heavy outline, the harnesses, and the
// models, with the ones that may keep a prompt drawn dashed. It is the same stack as the figure in the note.
// It is drawn on a 1200 point canvas and rendered at twice the density, so the PNG is 2400 by 2400. LinkedIn
// accepts images up to about 36 megapixels and, in practice, 5 MB, so 2400 square (5.8 MP, a few hundred KB
// for flat paper and ink) is the largest size that stays crisp in the feed and safe to upload.
//
//   bun run social:card:model-layer   # → content/media/notes/necessity-and-the-model-layer-social.png
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
const W=1200,H=1200,PAPER="#E2E0D8",INK="#1C1B17",MUTED="#6E6C64",LINE="rgba(28,27,23,.28)",HOST="portfolio.tjakoen.com";
const TITLE="Necessity Is the Mother of Innovation";
const ROOT=join(import.meta.dir,"..");
const X0=84,BW=W-2*X0;
interface Tile{t:string;s?:string[];dashed?:boolean}
interface Band{title:string;sub?:string;tiles?:Tile[];heavy?:boolean}
const bands:Band[]=[
  {title:"Me",sub:"requests, decisions, approvals"},
  {title:"The loop",tiles:[{t:"Public standards"},{t:"Plans"},{t:"Independent review"},{t:"Human gates"}]},
  {title:"The Model Intelligence Layer",heavy:true,tiles:[
    {t:"Registry",s:["every model id"]},{t:"Route check",s:["order, cooldowns,","repo clearance"]},
    {t:"Model guard",s:["wrong model","restarts itself"]},{t:"Work guard",s:["company accounts","only at work"]}]},
  {title:"Harnesses",tiles:[{t:"Claude Code",s:["Claude only"]},{t:"OpenCode",s:["all other coding"]},{t:"Codex app",s:["non-coding work"]}]},
  {title:"Models",tiles:[{t:"Claude",s:["private"]},{t:"Codex models",s:["private"]},
    {t:"Free and Go",s:["not private"],dashed:true},{t:"DeepSeek API",s:["approval only"],dashed:true}]},
];
let y=296;const out:string[]=[];
bands.forEach((b,i)=>{
  const tiles=b.tiles??[];
  const subLines=Math.max(0,...tiles.map(t=>t.s?.length??0));
  const tileH=tiles.length?(subLines?44+subLines*26:54):0;
  const h=tiles.length?42+tileH+14:84;
  out.push(`<rect x="${X0}" y="${y}" width="${BW}" height="${h}" rx="14" style="fill:none;stroke:${b.heavy?INK:LINE};stroke-width:${b.heavy?4:2}"/>`);
  out.push(`<text x="${W/2}" y="${y+36}" text-anchor="middle" style="fill:${INK};font-size:28px">${b.title}</text>`);
  if(b.sub)out.push(`<text x="${W/2}" y="${y+66}" text-anchor="middle" style="fill:${MUTED};font-size:24px">${b.sub}</text>`);
  const n=tiles.length,g=14,tw=n?(BW-36-(n-1)*g)/n:0;
  tiles.forEach((t,k)=>{
    const tx=X0+18+k*(tw+g),ty=y+46;
    out.push(`<rect x="${tx}" y="${ty}" width="${tw}" height="${tileH}" rx="9" style="fill:none;stroke:${LINE};stroke-width:2${t.dashed?";stroke-dasharray:10 8":""}"/>`);
    out.push(`<text x="${tx+tw/2}" y="${ty+(subLines?32:34)}" text-anchor="middle" style="fill:${INK};font-size:24px">${t.t}</text>`);
    (t.s??[]).forEach((ln,j)=>out.push(`<text x="${tx+tw/2}" y="${ty+60+j*26}" text-anchor="middle" style="fill:${MUTED};font-size:20px">${ln}</text>`));
  });
  y+=h;
  if(i<bands.length-1){
    out.push(`<g style="stroke:${MUTED};stroke-width:3;fill:none"><line x1="${W/2}" y1="${y+5}" x2="${W/2}" y2="${y+21}"/><path d="M${W/2-8},${y+14} L${W/2},${y+6} L${W/2+8},${y+14}"/><path d="M${W/2-8},${y+18} L${W/2},${y+26} L${W/2+8},${y+18}"/></g>`);
    y+=26;
  }
});
const card=`<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0}</style></head><body>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Georgia, 'Times New Roman', serif">
<rect width="${W}" height="${H}" style="fill:${PAPER}"/>
<rect x="28" y="28" width="${W-56}" height="${H-56}" rx="10" style="fill:none;stroke:${LINE};stroke-width:1.5"/>
<text x="${X0}" y="104" style="fill:${MUTED};font-size:21px;letter-spacing:6px">THE MODEL INTELLIGENCE LAYER</text>
<text x="${X0}" y="192" style="fill:${INK};font-size:64px;letter-spacing:-1px">I ran out with hours left.</text>
<text x="${X0}" y="264" style="fill:${INK};font-size:64px;letter-spacing:-1px;font-style:italic">So the model became a decision.</text>
${out.join("\n")}
<text x="${X0}" y="${y+54}" style="fill:${INK};font-size:30px;font-style:italic">Free, Go and DeepSeek models: personal projects only.</text>
<line x1="${X0}" y1="1104" x2="${W-X0}" y2="1104" style="stroke:${LINE};stroke-width:1"/>
<text x="${X0}" y="1148" style="fill:${INK};font-size:22px">${TITLE}</text>
<text x="${W-X0}" y="1148" text-anchor="end" style="fill:${MUTED};font-size:21px">${HOST}</text>
</svg></body></html>`;
const b=await chromium.launch();
try{const pg=await b.newPage({viewport:{width:W,height:H},deviceScaleFactor:2});
const OUT=join(ROOT,"content","media","notes");await mkdir(OUT,{recursive:true});
await pg.setContent(card,{waitUntil:"networkidle"});
await writeFile(join(OUT,"necessity-and-the-model-layer-social.png"),await pg.screenshot({clip:{x:0,y:0,width:W,height:H}}));
}finally{await b.close();}
console.log(`[social:card:model-layer] wrote content/media/notes/necessity-and-the-model-layer-social.png (2400x2400, stack ends at y=${y})`);
