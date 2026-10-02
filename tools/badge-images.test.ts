import { test, expect } from "bun:test";
import { frontmatter, ogCardHtml, bakeOpenBadge, bakeHostedBadge, medallionHtml } from "./badge-images.ts";
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aJxkAAAAASUVORK5CYII=','base64');
const assertion=JSON.stringify({"@context":"https://w3id.org/openbadges/v2",type:"Assertion",id:"https://example.org/award.json",verification:{type:"HostedBadge"},recipient:{type:"email",hashed:true,identity:"sha256$"+'0'.repeat(64),salt:"synthetic"},issuedOn:"2026-10-02T00:00:00+08:00"},null,2)+'\n';
function chunks(input:Buffer){const result:{type:string;data:Buffer}[]=[];let offset=8;while(offset<input.length){const len=input.readUInt32BE(offset);result.push({type:input.toString('ascii',offset+4,offset+8),data:input.subarray(offset+8,offset+8+len)});offset+=len+12;}return result;}
test("PNG baking preserves image chunks and stores exact hosted OB2 assertion",()=>{
 const baked=bakeOpenBadge(png,assertion), all=chunks(baked);expect(all.filter(c=>c.type==='iTXt')).toHaveLength(1);
 const text=all.find(c=>c.type==='iTXt')!.data;expect(text.subarray(0,15)).toEqual(Buffer.concat([Buffer.from('openbadges'),Buffer.from([0,0,0,0,0])]));expect(text.subarray(15).toString('utf8')).toBe(assertion);
 expect(all.at(-1)!.type).toBe('IEND');expect(all.filter(c=>c.type!=='iTXt')).toEqual(chunks(png));expect(JSON.parse(text.subarray(15).toString()).type).toBe('Assertion');
});
test("frontmatter round-trips YAML scalar escaping and rejects nonscalar image fields",()=>{
 const name='Example "Learner" \\ Sample';const fm=frontmatter(`---\ntype: cert\nrecipientName: ${JSON.stringify(name)}\nsubtitle: "Skills: Backend"\nrecipients: ["legacy row"]\n---\n`);
 expect(fm.recipientName).toBe(name);expect(fm.subtitle).toBe('Skills: Backend');expect(medallionHtml(fm,600)).toContain('Example &quot;Learner&quot;');
 expect(()=>frontmatter('---\nrecipientName: [invalid]\n---\n')).toThrow('scalar');
});
test("OG card text escapes injected titles course names and issuer",()=>{
 const html=ogCardHtml({course:'<script>course</script>',subtitle:'<img src=x onerror=alert(1)>',issuer:'<script>issuer</script>'});
 expect(html).not.toContain('<script>');expect(html).not.toContain('<img src=x');expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');expect(html).toContain('&lt;script&gt;issuer&lt;/script&gt;');
});
test("historical OB3 metadata is not rebaked as portable assertion",()=>{
 expect(bakeHostedBadge(png,JSON.stringify({type:['VerifiableCredential','OpenBadgeCredential']}))).toBe(png);
 expect(bakeHostedBadge(png,assertion)).not.toBe(png);expect(bakeHostedBadge(png,'')).toBe(png);
 expect(()=>bakeOpenBadge(Buffer.from('invalid'),assertion)).toThrow('PNG');
});

test("baked hosted badge retains the activity descriptions and approved threshold",async()=>{
 const {planAwards}=await import('./issue-badges.ts');
 const award={awardKey:'synthetic-activities',approved:true,badgeId:'midterm',course:'apsi',monogram:'6APSI',section:'9999',term:'midterm',title:'Combined midterm badge',description:'Reviewed backend and integration projects.',criteria:'Combined reviewed result of at least 75%.',recipientKey:'synthetic',recipientName:'Example Learner',recipientHandle:'example-learner',identityEmail:'example@example.org',workspaceRepo:'example/workspace',thresholdPercent:75,activities:[{id:'m4a4',title:'Backend project',description:'Develop a tested backend API.'},{id:'m5a5',title:'Integration project',description:'Connect and document the full stack application.'}],evidence:[{url:'https://canvas.example.org/private-submission'}]};
 const original=JSON.stringify(planAwards({schemaVersion:1,awards:[award]}).awards[0]!.assertion);
 const baked=bakeHostedBadge(png,original), stored=chunks(baked).find(chunk=>chunk.type==='iTXt')!.data.subarray(15).toString();
 expect(stored).toBe(original);expect(stored).toContain('Backend project');expect(stored).toContain('Integration project');expect(stored).toContain('75%');expect(stored).not.toContain('canvas.example.org');
});
