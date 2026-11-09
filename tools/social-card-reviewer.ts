// portfolio/tools/social-card-reviewer.ts — render the LinkedIn images for the review kit note.
//
// A four-image post in the card family of tools/social-card.ts (1200×1200, paper and ink, Georgia,
// the host in the footer), in the order it is posted: the question that started it, how the
// reviewer learns, what the team felt, and the real board on invented pull requests.
//
//   bun run social:card:reviewer   # → content/media/notes/the-reviewer-that-learned-to-be-wrong-social-*.png
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
const W=1200,H=1200,PAPER="#E2E0D8",INK="#1C1B17",MUTED="#6E6C64",LINE="rgba(28,27,23,.18)",HOST="portfolio.tjakoen.com";
const TITLE="Seven Hundred Commits to Teach a Reviewer It Was Wrong";
const ROOT=join(import.meta.dir,"..");
const shotB64=Buffer.from(await Bun.file(join(ROOT,"content","media","review-kit","board-in-claude.jpg")).arrayBuffer()).toString("base64");
const shot=`data:image/jpeg;base64,${shotB64}`;
const frame=(inner:string,bg=PAPER)=>`<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0}</style></head><body>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Georgia, 'Times New Roman', serif">
<defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto"><path d="M0,0 L10,5 L0,10 z" style="fill:${MUTED}"/></marker></defs>
<rect width="${W}" height="${H}" style="fill:${bg}"/>
<rect x="28" y="28" width="${W-56}" height="${H-56}" rx="10" style="fill:none;stroke:${bg===INK?"rgba(226,224,216,.2)":LINE};stroke-width:1.5"/>
${inner}
<line x1="96" y1="1122" x2="${W-96}" y2="1122" style="stroke:${bg===INK?"rgba(226,224,216,.2)":LINE};stroke-width:1"/>
<text x="96" y="1158" style="fill:${bg===INK?PAPER:INK};font-size:22px">${TITLE}</text>
<text x="${W-96}" y="1158" text-anchor="end" style="fill:${MUTED};font-size:21px">${HOST}</text>
</svg></body></html>`;

// A: the question, big
const A=frame(`
<text x="96" y="140" style="fill:${MUTED};font-size:21px;letter-spacing:6px">ME, TO MY DIRECTOR, ABOUT MY AI CODE REVIEWER</text>
<text x="90" y="400" style="fill:${INK};font-size:150px;letter-spacing:-4px">"I don't</text>
<text x="90" y="560" style="fill:${INK};font-size:150px;letter-spacing:-4px">trust it."</text>
<text x="90" y="800" style="fill:${INK};font-size:190px;letter-spacing:-5px;font-style:italic">"Why not?"</text>
<text x="96" y="930" style="fill:${MUTED};font-size:30px">Three months and seven hundred commits later, I had an answer.</text>
<text x="96" y="980" style="fill:${MUTED};font-size:30px">I don't re-read its reviews any more.</text>`);

// B: the wait, as a chart
const sc=(h:number)=>Math.round(h/17.6*940);
const B=frame(`
<text x="96" y="140" style="fill:${MUTED};font-size:21px;letter-spacing:6px">"I DON'T TRUST IT." "WHY NOT?"</text>
<text x="96" y="250" style="fill:${INK};font-size:62px;letter-spacing:-1px">How long 1 in 4 of my team's</text>
<text x="96" y="330" style="fill:${INK};font-size:62px;letter-spacing:-1px">pull requests waited for</text>
<text x="96" y="410" style="fill:${INK};font-size:62px;letter-spacing:-1px">a first review</text>
<text x="96" y="530" style="fill:${MUTED};font-size:26px">Before my AI reviewer</text>
<rect x="96" y="550" width="${sc(17.6)}" height="110" rx="6" style="fill:none;stroke:${INK};stroke-width:2.5"/>
<text x="${96+sc(17.6)-24}" y="625" text-anchor="end" style="fill:${INK};font-size:56px">17.6 hours</text>
<text x="96" y="760" style="fill:${MUTED};font-size:26px">Now</text>
<rect x="96" y="780" width="${sc(3.0)}" height="110" rx="6" style="fill:${INK}"/>
<text x="${96+sc(3.0)+28}" y="855" style="fill:${INK};font-size:56px">3.0 hours</text>
<text x="96" y="980" style="fill:${MUTED};font-size:26px;font-style:italic">and cost per review down by half. A before and after, not an experiment.</text>`);

// C: the loop, drawn
const stamp=(x:number,y:number,t:string,rot:number,dark=false)=>`<g transform="rotate(${rot} ${x} ${y})"><rect x="${x-80}" y="${y-30}" width="160" height="60" rx="6" style="fill:${dark?INK:"none"};stroke:${INK};stroke-width:3"/><text x="${x}" y="${y+12}" text-anchor="middle" style="fill:${dark?PAPER:INK};font-size:32px;letter-spacing:3px">${t}</text></g>`;
const C=frame(`
<text x="96" y="140" style="fill:${MUTED};font-size:21px;letter-spacing:6px">HOW MY AI CODE REVIEWER LEARNS</text>
<text x="96" y="230" style="fill:${INK};font-size:64px;letter-spacing:-1px">Every comment it leaves</text>
<text x="96" y="310" style="fill:${INK};font-size:64px;letter-spacing:-1px;font-style:italic">gets graded.</text>
<rect x="250" y="400" width="700" height="250" rx="12" style="fill:${PAPER};stroke:${INK};stroke-width:2"/>
<line x1="250" y1="450" x2="950" y2="450" style="stroke:${LINE};stroke-width:1.5"/>
<text x="285" y="434" style="fill:${MUTED};font-size:24px">review comment · line 42</text>
<rect x="285" y="485" width="560" height="14" rx="7" style="fill:${LINE}"/>
<rect x="285" y="520" width="620" height="14" rx="7" style="fill:${LINE}"/>
<rect x="285" y="555" width="420" height="14" rx="7" style="fill:${LINE}"/>
<rect x="285" y="600" width="200" height="14" rx="7" style="fill:${MUTED}"/>
${stamp(860,420,"FIXED",-8)}
${stamp(300,690,"WRONG",6)}
<path d="M955,520 C1080,560 1080,760 900,800" style="fill:none;stroke:${MUTED};stroke-width:2.5" marker-end="url(#arr)"/>
<path d="M300,800 C130,760 120,560 245,525" style="fill:none;stroke:${MUTED};stroke-width:2.5" marker-end="url(#arr)"/>
<text x="600" y="830" text-anchor="middle" style="fill:${INK};font-size:34px">the lens that missed gets fixed,</text>
<text x="600" y="880" text-anchor="middle" style="fill:${INK};font-size:34px">then replayed on the commit it missed</text>
<text x="96" y="1000" style="fill:${MUTED};font-size:26px">It started with my director asking, "Why not?"</text>`);

// D: the board, cleaner, dark full-bleed
const D=frame(`
<defs><clipPath id="c"><rect x="60" y="300" width="1080" height="640" rx="14"/></clipPath></defs>
<text x="96" y="150" style="fill:${PAPER};font-size:66px;letter-spacing:-1.5px">"I don't trust it."</text>
<text x="96" y="236" style="fill:${PAPER};font-size:66px;letter-spacing:-1.5px;font-style:italic">"Why not?"</text>
<g clip-path="url(#c)"><image href="${shot}" x="-345" y="300" width="2160" height="750" preserveAspectRatio="xMinYMin slice"/></g>
<rect x="60" y="300" width="1080" height="640" rx="14" style="fill:none;stroke:rgba(226,224,216,.35);stroke-width:2"/>
<text x="96" y="1010" style="fill:${PAPER};font-size:30px">Three months later, it reviews my team's pull requests on its own.</text>
<text x="96" y="1056" style="fill:${MUTED};font-size:22px;font-style:italic">the real board, on invented pull requests</text>`,INK);

const b=await chromium.launch();
try{const pg=await b.newPage({viewport:{width:W,height:H}});
const OUT=join(ROOT,"content","media","notes");await mkdir(OUT,{recursive:true});
for(const [n,h] of [["1-question",A],["2-loop",C],["3-wait",B],["4-board",D]] as const){await pg.setContent(h,{waitUntil:"networkidle"});await writeFile(join(OUT,`the-reviewer-that-learned-to-be-wrong-social-${n}.png`),await pg.screenshot({clip:{x:0,y:0,width:W,height:H}}));}
}finally{await b.close();}
console.log("[social:card:reviewer] wrote four cards to content/media/notes");
