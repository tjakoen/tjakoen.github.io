// portfolio/tools/social-card-same-reviewer.ts — render the LinkedIn image for the same-reviewer-twice note.
//
// One 1200×1200 card in the family of tools/social-card-reviewer.ts (paper and ink, Georgia, the host
// in the footer): eleven filled marks for the parts of my review kit that matched Anthropic's
// reviewer, five hollow ones for where it was behind, and the risk question underneath.
//
//   bun run social:card:same-reviewer   # → content/media/notes/same-reviewer-twice-social.png
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
const W=1200,H=1200,PAPER="#E2E0D8",INK="#1C1B17",MUTED="#6E6C64",LINE="rgba(28,27,23,.18)",HOST="portfolio.tjakoen.com";
const TITLE="Anthropic Built My Code Reviewer. Separately.";
const ROOT=join(import.meta.dir,"..");
const dots=Array.from({length:16},(_,i)=>{const x=150+(i%8)*120,y=i<8?520:640,on=i<11;
  return `<circle cx="${x}" cy="${y}" r="38" style="fill:${on?INK:"none"};stroke:${INK};stroke-width:3"/>`;}).join("");
const card=`<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0}</style></head><body>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Georgia, 'Times New Roman', serif">
<rect width="${W}" height="${H}" style="fill:${PAPER}"/>
<rect x="28" y="28" width="${W-56}" height="${H-56}" rx="10" style="fill:none;stroke:${LINE};stroke-width:1.5"/>
<text x="96" y="140" style="fill:${MUTED};font-size:21px;letter-spacing:6px">MY REVIEW KIT, HELD UP AGAINST ANTHROPIC'S</text>
<text x="96" y="250" style="fill:${INK};font-size:72px;letter-spacing:-1px">Eleven of sixteen,</text>
<text x="96" y="340" style="fill:${INK};font-size:72px;letter-spacing:-1px;font-style:italic">before I had seen theirs.</text>
${dots}
<text x="96" y="760" style="fill:${MUTED};font-size:26px">Filled: we built the same thing. Hollow: they were ahead.</text>
<text x="96" y="900" style="fill:${INK};font-size:40px">The part I care about most is the one</text>
<text x="96" y="955" style="fill:${INK};font-size:40px;font-style:italic">neither of us has finished: how much risk needs me.</text>
<line x1="96" y1="1122" x2="${W-96}" y2="1122" style="stroke:${LINE};stroke-width:1"/>
<text x="96" y="1158" style="fill:${INK};font-size:22px">${TITLE}</text>
<text x="${W-96}" y="1158" text-anchor="end" style="fill:${MUTED};font-size:21px">${HOST}</text>
</svg></body></html>`;
const b=await chromium.launch();
try{const pg=await b.newPage({viewport:{width:W,height:H}});
const OUT=join(ROOT,"content","media","notes");await mkdir(OUT,{recursive:true});
await pg.setContent(card,{waitUntil:"networkidle"});
await writeFile(join(OUT,"same-reviewer-twice-social.png"),await pg.screenshot({clip:{x:0,y:0,width:W,height:H}}));
}finally{await b.close();}
console.log("[social:card:same-reviewer] wrote content/media/notes/same-reviewer-twice-social.png");
