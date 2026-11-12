// portfolio/tools/social-card-orchestration.ts — render the LinkedIn images for the orchestration note.
//
// A three-image post in the card family of tools/social-card.ts (1200×1200, paper and ink, Georgia,
// the host in the footer), in the order it is posted: the question that started it, the split, and
// the loop underneath that makes the cheap setting safe.
//
//   bun run social:card:orchestration   # → content/media/notes/plan-big-type-small-social-*.png
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
const W=1200,H=1200,PAPER="#E2E0D8",INK="#1C1B17",MUTED="#6E6C64",LINE="rgba(28,27,23,.18)",HOST="portfolio.tjakoen.com";
const TITLE="Plan on the Big Model, Type on the Small One";
const frame=(inner:string)=>`<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0}</style></head><body>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Georgia, 'Times New Roman', serif">
<defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto"><path d="M0,0 L10,5 L0,10 z" style="fill:${MUTED}"/></marker></defs>
<rect width="${W}" height="${H}" style="fill:${PAPER}"/>
<rect x="28" y="28" width="${W-56}" height="${H-56}" rx="10" style="fill:none;stroke:${LINE};stroke-width:1.5"/>
${inner}
<line x1="96" y1="1122" x2="${W-96}" y2="1122" style="stroke:${LINE};stroke-width:1"/>
<text x="96" y="1158" style="fill:${INK};font-size:22px">${TITLE}</text>
<text x="${W-96}" y="1158" text-anchor="end" style="fill:${MUTED};font-size:21px">${HOST}</text>
</svg></body></html>`;
const kicker=(t:string)=>`<text x="96" y="140" style="fill:${MUTED};font-size:21px;letter-spacing:6px">${t}</text>`;
const box=(x:number,y:number,w:number,h:number,a:string,b:string,dark=false)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" style="fill:${dark?INK:"none"};stroke:${INK};stroke-width:2.5"/>
<text x="${x+w/2}" y="${y+h/2-4}" text-anchor="middle" style="fill:${dark?PAPER:INK};font-size:40px">${a}</text>
<text x="${x+w/2}" y="${y+h/2+38}" text-anchor="middle" style="fill:${dark?PAPER:MUTED};font-size:25px;font-style:italic">${b}</text>`;

// 1: the question, big
const A=frame(`${kicker("1 / 3 · THE QUESTION")}
<text x="90" y="380" style="fill:${INK};font-size:118px;letter-spacing:-3px">"Why do I keep</text>
<text x="90" y="520" style="fill:${INK};font-size:118px;letter-spacing:-3px">running out</text>
<text x="90" y="660" style="fill:${INK};font-size:118px;letter-spacing:-3px">of tokens</text>
<text x="90" y="800" style="fill:${INK};font-size:118px;letter-spacing:-3px;font-style:italic">before lunch?"</text>
<text x="96" y="940" style="fill:${MUTED};font-size:30px">A junior developer asked me this week.</text>
<text x="96" y="990" style="fill:${MUTED};font-size:30px">The answer was advice I thought was obvious.</text>`);

// 2: the split, as tiers
const B=frame(`${kicker("2 / 3 · THE SPLIT")}
<text x="96" y="240" style="fill:${INK};font-size:72px;letter-spacing:-1.5px">Plan on the big model.</text>
<text x="96" y="325" style="fill:${INK};font-size:72px;letter-spacing:-1.5px;font-style:italic">Type on the small one.</text>
${box(400,410,400,130,"Fable","research and audits, rarely")}
${box(250,600,700,130,"Opus","plans, briefs and reviews")}
${box(96,790,1008,130,"Sonnet subagents","type each settled piece, at the lowest rate",true)}
<line x1="600" y1="540" x2="600" y2="594" style="stroke:${MUTED};stroke-width:2.5" marker-end="url(#arr)"/>
<line x1="600" y1="730" x2="600" y2="784" style="stroke:${MUTED};stroke-width:2.5" marker-end="url(#arr)"/>
<text x="96" y="1010" style="fill:${MUTED};font-size:28px;font-style:italic">The wider the box, the more of the work it does. Try low effort first.</text>`);

// 3: the loop, the inspiring turn
const steps=[["one file","three rules"],["a rule","for every repeat"],["a check","for every miss"],["a hook","for every forget"]] as const;
const C=frame(`${kicker("3 / 3 · THE PART THAT LASTS")}
<text x="96" y="240" style="fill:${INK};font-size:72px;letter-spacing:-1.5px">Models get retired.</text>
<text x="96" y="325" style="fill:${INK};font-size:72px;letter-spacing:-1.5px;font-style:italic">Your loop stays.</text>
${steps.map(([a,b],i)=>box(96+i*258,470,234,170,a,b,i===3)).join("")}
${[0,1,2].map(i=>`<line x1="${330+i*258}" y1="555" x2="${350+i*258}" y2="555" style="stroke:${MUTED};stroke-width:2.5" marker-end="url(#arr)"/>`).join("")}
<path d="M1050,645 C1050,760 150,760 150,650" style="fill:none;stroke:${MUTED};stroke-width:2.5" marker-end="url(#arr)"/>
<text x="600" y="790" text-anchor="middle" style="fill:${MUTED};font-size:26px;font-style:italic">every session reads all of it, at any effort level</text>
<text x="96" y="940" style="fill:${INK};font-size:34px">Start today with one file, and the first rule</text>
<text x="96" y="990" style="fill:${INK};font-size:34px">you are tired of repeating.</text>`);

// 4: the single card, after the note's four-files figure: what the repo carries into every session
const files=[["Instructions","how the repo works"],["Skills","the standards"],["Hooks","start and end checks"],["Plan file","what this work is"]] as const;
const small=(x:number,y:number,a:string,b:string)=>`<rect x="${x}" y="${y}" width="228" height="150" rx="10" style="fill:none;stroke:${INK};stroke-width:2.5"/>
<text x="${x+114}" y="${y+68}" text-anchor="middle" style="fill:${INK};font-size:36px">${a}</text>
<text x="${x+114}" y="${y+108}" text-anchor="middle" style="fill:${MUTED};font-size:22px;font-style:italic">${b}</text>`;
const D=frame(`<text x="96" y="240" style="fill:${INK};font-size:72px;letter-spacing:-1.5px">Low effort works</text>
<text x="96" y="325" style="fill:${INK};font-size:72px;letter-spacing:-1.5px;font-style:italic">when the repo already knows.</text>
${files.map(([a,b],i)=>small(96+i*258,430,a,b)).join("")}
${[0,1,2,3].map(i=>{const x=210+i*258,tx=360+i*160;return `<path d="M${x},580 C${x},640 ${tx},640 ${tx},714" style="fill:none;stroke:${MUTED};stroke-width:2.5" marker-end="url(#arr)"/>`}).join("")}
${box(250,724,700,150,"The session, on low effort","starts already knowing how I work",true)}
<text x="96" y="1010" style="fill:${MUTED};font-size:28px;font-style:italic">Models get retired. The files you write around them stay.</text>`);

// 5: the split, after the note's two-lane figure: Opus thinks at both ends, Sonnet types in between
const lane=(y:number,h:number)=>`<rect x="72" y="${y}" width="1056" height="${h}" rx="12" style="fill:none;stroke:${MUTED};stroke-width:1.5;stroke-dasharray:8 8;opacity:.6"/>`;
const node=(x:number,y:number,w:number,t:string,dark=false)=>`<rect x="${x}" y="${y}" width="${w}" height="84" rx="10" style="fill:${dark?INK:"none"};stroke:${INK};stroke-width:2.5"/>
<text x="${x+w/2}" y="${y+54}" text-anchor="middle" style="fill:${dark?PAPER:INK};font-size:38px">${t}</text>`;
const sub=(x:number)=>`<rect x="${x}" y="700" width="230" height="230" rx="10" style="fill:none;stroke:${INK};stroke-width:2.5"/>
<text x="${x+115}" y="760" text-anchor="middle" style="fill:${INK};font-size:38px">Sonnet</text>
${[0,1,2].map(j=>`<rect x="${x+52+j*44}" y="800" width="34" height="44" rx="4" style="fill:none;stroke:${MUTED};stroke-width:2"/>`).join("")}
<text x="${x+115}" y="896" text-anchor="middle" style="fill:${MUTED};font-size:24px;font-style:italic">reads, types</text>`;
const arrow=(d:string)=>`<path d="${d}" style="fill:none;stroke:${MUTED};stroke-width:2.5" marker-end="url(#arr)"/>`;
const tag=(x:number,y:number,t:string)=>`<text x="${x}" y="${y}" text-anchor="middle" style="fill:${MUTED};font-size:24px;font-style:italic;stroke:${PAPER};stroke-width:8;paint-order:stroke">${t}</text>`;
const E=frame(`<text x="96" y="200" style="fill:${INK};font-size:72px;letter-spacing:-1.5px">Plan on the big model.</text>
<text x="96" y="285" style="fill:${INK};font-size:72px;letter-spacing:-1.5px;font-style:italic">Type on the small one.</text>
${lane(430,140)}${lane(670,300)}
${node(100,458,250,"Opus plans")}${node(620,458,290,"Opus reviews")}${node(950,458,150,"Done",true)}
${sub(330)}${sub(610)}
${arrow("M190,542 C190,640 400,620 420,694")}
${arrow("M290,542 C290,640 690,610 700,694")}
${arrow("M500,700 C500,620 740,630 750,548")}
${arrow("M780,700 C780,630 830,630 830,548")}
${arrow("M910,500 L944,500")}
${arrow("M765,458 C765,370 225,370 225,452")}
${tag(495,388,"sent back")}${tag(210,640,"brief")}${tag(960,630,"result only")}
<text x="870" y="800" style="fill:${MUTED};font-size:24px;font-style:italic">the files they read</text>
<text x="870" y="832" style="fill:${MUTED};font-size:24px;font-style:italic">stay down here</text>
<text x="96" y="1050" style="fill:${MUTED};font-size:28px;font-style:italic">The expensive model thinks at both ends. The cheap one types in between.</text>`);

const b=await chromium.launch();
try{const pg=await b.newPage({viewport:{width:W,height:H}});
const OUT=join(import.meta.dir,"..","content","media","notes");await mkdir(OUT,{recursive:true});
for(const [n,h] of [["1-question",A],["2-split",B],["3-loop",C],["4-files",D],["5-split",E]] as const){await pg.setContent(h,{waitUntil:"networkidle"});await writeFile(join(OUT,`plan-big-type-small-social-${n}.png`),await pg.screenshot({clip:{x:0,y:0,width:W,height:H}}));}
}finally{await b.close();}
console.log("[social:card:orchestration] wrote five cards to content/media/notes");
