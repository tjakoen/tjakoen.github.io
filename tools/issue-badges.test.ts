import { test, expect } from "bun:test";
import { mkdtempSync, readFileSync, writeFileSync, rmSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { issue, planAwards, existingAwards, manilaDate, type Award, type ImageJob } from "./issue-badges.ts";
const award: Award = { awardKey: "test-private-key", approved: true, badgeId: "backend", course: "apsi", monogram: "6APSI", section: "2240", term: "midterm", title: "Backend Skills", description: "Reviewed backend work.", criteria: "Complete both designated badging activities with a reviewed score of at least 75/100.", recipientKey: "private-recipient", recipientName: "Example Learner", recipientHandle: "example-learner", identityEmail: "learner@example.org", workspaceRepo: "example/workspace", thresholdPercent:75, policyThresholdPercent:75, activities:[{id:"m4a4",title:"Backend project",description:"Build and deploy a tested backend service."},{id:"m5a5",title:"Integration project",description:"Connect the frontend to the backend and document the integration."}], evidence: [{url: "https://github.com/example/project", commit: "a".repeat(40)}] };
const manifest = (awards = [award]) => ({schemaVersion: 1, awards});
test("requires explicit approval and verified identity fields", () => {
  for (const change of [{approved:false}, {identityEmail:""}, {recipientName:"202612345"}, {recipientHandle:"invalid handle"}]) expect(() => planAwards(manifest([{...award,...change}]))).toThrow();
});
test("rejects duplicate keys and identifier collisions", () => {
  expect(() => planAwards(manifest([award, award]))).toThrow("duplicate");
  expect(() => planAwards(manifest([{...award,shortId:"same"},{...award,awardKey:"another",shortId:"same"}]))).toThrow("collision");
});
test("uses hosted OB2 assertions without recipient email or private key", () => {
  const plan = planAwards(manifest()); const a = plan.awards[0]!.assertion;
  expect(a["@context"]).toBe("https://w3id.org/openbadges/v2"); expect(a.type).toBe("Assertion");
  expect(a.verification.type).toBe("HostedBadge"); expect(a.badge.type).toBe("BadgeClass"); expect(a.badge.issuer.type).toBe("Profile");
  expect(a.recipient.salt.length).toBe(64); expect(a.recipient.identity).toMatch(/^sha256\$[a-f0-9]{64}$/);
  expect(JSON.stringify(a)).not.toContain(award.identityEmail); expect(plan.awards[0]!.md).not.toContain(award.awardKey);
});
test("preserves issuance dates identifiers and salts on rerun; rejects identity changes", () => {
  const dir = mkdtempSync(join(tmpdir(),"badge-"));
  try {
    issue(manifest([{...award,issuedOn:"2026-09-16"}]), {dir,emit:true});
    const existing = existingAwards(dir), original = existing[0]!;
    const rerun = planAwards(manifest(), existing, "2026-10-02").awards[0]!;
    expect(rerun.certSlug).toBe(original.slug); expect(rerun.assertion.issuedOn).toBe("2026-09-16T00:00:00+08:00");
    expect(rerun.assertion.recipient.salt).toBe(original.assertion!.recipient.salt);
    expect(() => planAwards(manifest([{...award,identityEmail:"other@example.org"}]),existing)).toThrow("identity conflict");
  } finally { rmSync(dir,{recursive:true,force:true}); }
});
test("YAML scalars escape quoted text and class pages contain counts only", () => {
  const dir = mkdtempSync(join(tmpdir(),"badge-"));
  try {
    const a = {...award,recipientName:'Example "Learner"'};
    expect(() => issue(manifest([a]),{dir,emit:true})).toThrow();
    issue(manifest([{...award,title:'Skills: "Backend"'}]),{dir,emit:true});
    expect(existingAwards(dir)[0]!.fm.title).toBe('Skills: "Backend": Example Learner');
    const cls=readFileSync(join(dir,"apsi-2240-backend.md"),"utf8"); expect(cls).not.toContain(award.recipientName); expect(cls).toContain('recipientCount: 1');
  } finally {rmSync(dir,{recursive:true,force:true});}
});
test("legacy certificates hold emission and remain unchanged with explicit preservation", () => {
  const dir=mkdtempSync(join(tmpdir(),"badge-"));
  try {
    const legacy='---\ntype: cert\nrecipientName: Legacy Learner\nrecipientHandle: legacy\nshortUrl: /b/legacy\n---\nLegacy record.\n';
    writeFileSync(join(dir,"legacy.md"),legacy);
    expect(issue(manifest(),{dir}).legacy).toBe(1); expect(() => issue(manifest(),{dir,emit:true})).toThrow("held");
    issue(manifest(),{dir,emit:true,allowExisting:true}); expect(readFileSync(join(dir,"legacy.md"),"utf8")).toBe(legacy);
  } finally {rmSync(dir,{recursive:true,force:true});}
});

test("rejects malformed calendar dates and certificate ID collisions", () => {
  expect(() => planAwards(manifest([{...award,issuedOn:"2026-02-30"}]))).toThrow("date");
  expect(() => planAwards(manifest([{...award,certId:"same"},{...award,awardKey:"second",certId:"same"}]))).toThrow("ID collision");
});
test("writes private issued manifest only during emission and preserves all source fields", () => {
  const dir=mkdtempSync(join(tmpdir(),"badge-")), privateDir=mkdtempSync(join(tmpdir(),"issued-")), output=join(privateDir,"issued.json");
  try {
    const source={...award,emails:["learner@example.org","school@example.edu"],scores:[{activity:"m4a4",score:80}]};
    issue(manifest([source]),{dir,issuedManifestPath:output}); expect(() => readFileSync(output)).toThrow();
    issue(manifest([source]),{dir,emit:true,issuedManifestPath:output});
    const written=JSON.parse(readFileSync(output,"utf8")).awards[0];
    expect(written.emails).toEqual(source.emails); expect(written.scores).toEqual(source.scores); expect(written.recipientKey).toBe(source.recipientKey);
    expect(written.identityEmail).toBe(source.identityEmail); expect(written.evidence).toEqual(source.evidence);
    expect(written.url).toBe(`https://tjakoen.github.io/b/${written.shortId}`); expect(written.imageUrl).toEndWith(`${written.certSlug}.png`); expect(written.issuedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(() => issue(manifest(),{dir,issuedManifestPath:join(dir,"unsafe.json")})).toThrow("outside");
  } finally {rmSync(dir,{recursive:true,force:true});rmSync(privateDir,{recursive:true,force:true});}
});
test("incremental emits retain all class links counts and aliases", () => {
  const dir=mkdtempSync(join(tmpdir(),"badge-")),hub=join(dir,"hub.html");
  try {
    issue(manifest(),{dir,emit:true,hubPath:hub});
    const first=existingAwards(dir)[0]!, oldAlias=String(first.fm.shortUrl).slice(3);
    issue(manifest([{...award,awardKey:"second",recipientName:"Second Learner",recipientHandle:"second-learner",identityEmail:"second@example.org"}]),{dir,emit:true,allowExisting:true,hubPath:hub});
    expect(readFileSync(join(dir,"apsi-2240-backend.md"),"utf8")).toContain("recipientCount: 2");
    issue(manifest([{...award,awardKey:"third",badgeId:"frontend",term:"finals"}]),{dir,emit:true,allowExisting:true,hubPath:hub});
    expect(readFileSync(hub,"utf8")).toContain("/badges/apsi-2240-backend"); expect(readFileSync(hub,"utf8")).toContain("/badges/apsi-2240-frontend");
    expect(JSON.parse(readFileSync(join(dir,"shortlinks.json"),"utf8"))[oldAlias]).toBe(first.slug);
  } finally {rmSync(dir,{recursive:true,force:true});}
});
test("checks legacy OB3 hashed identity before reissuing", () => {
  const identityHash="sha256$"+require("node:crypto").createHash("sha256").update("hau-badges-v1"+award.identityEmail).digest("hex");
  const existing=[{slug:"legacy",fm:{type:"cert",badgeClass:"apsi-2240-backend",recipientName:award.recipientName,recipientHandle:award.recipientHandle,issuedOn:"2026-09-16",certId:"legacy",shortUrl:"/b/legacy"},assertion:{credentialSubject:{identifier:[{salt:"hau-badges-v1",identityHash}]}}}];
  expect(planAwards(manifest([{...award,certSlug:"legacy"}]),existing).awards[0]!.certSlug).toBe("legacy");
  expect(() => planAwards(manifest([{...award,certSlug:"legacy",identityEmail:"changed@example.org"}]),existing)).toThrow("legacy identity conflict");
});

test("issuance dates follow Manila at the UTC day boundary", () => {
  expect(manilaDate(new Date("2026-10-01T16:01:00Z"))).toBe("2026-10-02");
  expect(manilaDate(new Date("2026-10-01T15:59:00Z"))).toBe("2026-10-01");
});

test("existing certificate URLs cannot be reused for a different award or badge class", () => {
  const original=planAwards(manifest()).awards[0]!;
  const existing=[{slug:original.certSlug,fm: {type:"cert",awardKey:require("node:crypto").createHash("sha256").update(award.awardKey).digest("hex"),badgeClass:original.classSlug,recipientName:award.recipientName,recipientHandle:award.recipientHandle},assertion:original.assertion}];
  expect(() => planAwards(manifest([{...award,awardKey:"different",certSlug:original.certSlug}]),existing)).toThrow("award key conflict");
  expect(() => planAwards(manifest([{...award,badgeId:"different"}]),existing)).toThrow("badge class conflict");
  delete (existing[0]!.fm as Record<string,unknown>).awardKey;
  expect(() => planAwards(manifest([{...award,badgeId:"different",certSlug:original.certSlug}]),existing)).toThrow("badge class conflict");
});
test("legacy rendering labels historical metadata and avoids achievement claims", async () => {
  const {renderBadgeEntry}=await import("../src/content.ts");
  const html=renderBadgeEntry({type:"cert",course:"apsi",term:"prelim",recipientName:"Example Learner",badgeName:"Historical Badge"},"synthetic");
  expect(html).toContain("awaiting eligibility reconciliation"); expect(html).toContain("Legacy award metadata");
  expect(html).not.toContain("What the holder can do"); expect(html).not.toContain(">Open Badges assertion</a>");
  const classHtml=renderBadgeEntry({type:"badge-class",criteriaText:"Approved criteria",recipientCount:"2",badgeName:"Reviewed Badge"},"reviewed");
  expect(classHtml).toContain("Awarded to 2 recipients."); expect(classHtml).not.toContain("Historical award");
});

test("activity descriptions and 75 percent threshold explain combined badge awards", async () => {
  const {parseFrontmatter}=await import('@tjakoen/mill/core/frontmatter.ts');
  const {renderBadgeEntry}=await import('../src/content.ts');
  const publicEvidence=[{url:'https://github.com/example/public-project',commit:'a'.repeat(40)}];
  const a={...award,activities:award.activities.map((activity,index)=>({...activity,...(index===0 ? {publicEvidence} : {})}))};
  const plan=planAwards(manifest([a])), certificate=plan.awards[0]!;
  const fm=parseFrontmatter(certificate.md).data;
  const html=renderBadgeEntry(fm,certificate.certSlug);
  expect(html).toContain('Activities completed');expect(html).toContain('Award threshold: 75%');expect(html).toContain('Backend project');expect(html).toContain('Integration project');expect(html).toContain(publicEvidence[0]!.url);
  const classHtml=renderBadgeEntry({...certificate.common,type:'badge-class'},certificate.classSlug);
  expect(classHtml).toContain('Activities recognized');expect(classHtml).toContain('Integration project');expect(classHtml).not.toContain(publicEvidence[0]!.url);
  expect(certificate.assertion.badge.criteria.narrative).toContain('m5a5');expect(certificate.assertion.badge.criteria.narrative).toContain('75%');
});
test("private evidence stays in private manifests and cannot enter public badge metadata",()=>{
  const privateUrl='https://github.com/HAU-6APSI/private-submission';
  const a={...award,evidence:[{url:privateUrl}],activities:award.activities.map(activity=>({...activity,evidence:[{url:'https://canvas.example.org/submission'}]}))};
  const result=planAwards(manifest([a])).awards[0]!;
  expect(JSON.stringify(result.assertion)).not.toContain(privateUrl);expect(result.md).not.toContain(privateUrl);expect(result.md).not.toContain('canvas.example.org');expect(JSON.stringify(result.a)).toContain(privateUrl);
  for(const publicUrl of [privateUrl,'https://github.com/example/workspace','https://canvas.example.org/submission','https://github.com/example/student-apsi-workspace']) expect(()=>planAwards(manifest([{...award,publicEvidence:[{url:publicUrl}]}]))).toThrow('unsafe public');
});
test("activity requirements reject private copy and escape rendering markup",async()=>{
  for(const change of [{thresholdPercent:74},{thresholdPercent:101,policyThresholdPercent:101},{thresholdPercent:-1,policyThresholdPercent:-1},{policyThresholdPercent:undefined},{activities:[]},{activities:[{id:'m4a4',title:'Contact user@example.org',description:'Generic work.'}]},{activities:[{id:'m4a4',title:'Activity',description:'Student 202612345 completed it.'}]}]) expect(()=>planAwards(manifest([{...award,...change}]))).toThrow();
  const {renderBadgeEntry}=await import('../src/content.ts');
  const a={...award,activities:[{id:'m4a4',title:'<script>alert(1)</script>',description:'<img src=x onerror=alert(1)> "Quoted" work.'}]};
  const result=planAwards(manifest([a])).awards[0]!;
  const html=renderBadgeEntry({...result.common,type:'cert',awardKey:'synthetic'},result.certSlug);
  expect(html).not.toContain('<script>alert(1)</script>');expect(html).not.toContain('<img src=x');expect(html).toContain('&lt;img src=x');expect(html).toContain('&lt;script&gt;');
});

test("hosted OB2 evidence contains each explicitly public URL and commit once",()=>{
 const publicEvidence={url:'https://github.com/example/public-project',commit:'a'.repeat(40)};
 const differentCommit={...publicEvidence,commit:'b'.repeat(40)};
 const a={...award,publicEvidence:[publicEvidence],evidence:[{url:'https://canvas.example.org/private'}],activities:award.activities.map((activity,index)=>({id:activity.id,title:activity.title,description:activity.description,publicEvidence:index===0 ? [publicEvidence,differentCommit] : [publicEvidence],evidence:[{url:'https://github.com/HAU-6APSI/private'}]}))};
 const issued=planAwards(manifest([a])).awards[0]!.assertion;
 expect(issued.evidence).toHaveLength(2);expect(issued.evidence![0]).toEqual({id:publicEvidence.url,type:'Evidence',narrative:`Reviewed commit: ${publicEvidence.commit}`});
 expect(issued.evidence![1]).toEqual({id:differentCommit.url,type:'Evidence',narrative:`Reviewed commit: ${differentCommit.commit}`});
 expect(JSON.stringify(issued)).not.toContain('canvas.example.org');expect(JSON.stringify(issued)).not.toContain('HAU-6APSI');
});

test("the threshold follows the approved policy value rather than a fixed number",()=>{
  const plan=planAwards(manifest([{...award,thresholdPercent:80,policyThresholdPercent:80}])).awards[0]!;
  expect(plan.assertion.badge.criteria.narrative).toContain("Award threshold: 80%.");
  expect(()=>planAwards(manifest([{...award,thresholdPercent:60}]))).toThrow("policy threshold");
});
test("a badge is one page: the class slug never carries a version", () => {
  const plan = planAwards(manifest()).awards[0]!;
  expect(plan.classSlug).toBe("apsi-2240-backend");
  expect(plan.assertion.badge.id).toBe("https://tjakoen.github.io/badges/apsi-2240-backend");
  expect(plan.md).not.toMatch(/-v\d/); expect(JSON.stringify(plan.assertion)).not.toMatch(/-v\d/);
});
test("a changed policy cannot rewrite an existing class page; a new badge id is the way forward", () => {
  const dir = mkdtempSync(join(tmpdir(), "badge-"));
  try {
    issue(manifest(), { dir, emit: true });
    const before = readFileSync(join(dir, "apsi-2240-backend.md"), "utf8");
    const changed = { ...award, awardKey: "second", recipientName: "Second Learner", recipientHandle: "second-learner", identityEmail: "second@example.org", thresholdPercent: 80, policyThresholdPercent: 80 };
    expect(() => issue(manifest([changed]), { dir })).toThrow("class page");
    expect(() => issue(manifest([changed]), { dir, emit: true, allowExisting: true })).toThrow("make a new badge id");
    // A recognized-as-current page is never adoptable, even with the flag.
    expect(() => issue(manifest([changed]), { dir, emit: true, allowExisting: true, adoptLegacyClass: true })).toThrow("class page");
    expect(readFileSync(join(dir, "apsi-2240-backend.md"), "utf8")).toBe(before);
    issue(manifest([{ ...changed, badgeId: "backend-two" }]), { dir, emit: true, allowExisting: true });
    expect(readFileSync(join(dir, "apsi-2240-backend.md"), "utf8")).toBe(before);
    expect(readFileSync(join(dir, "apsi-2240-backend-two.md"), "utf8")).toContain("thresholdPercent: 80");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// A synthetic legacy tree: a participation class page, and per-student pages with OB3 salt+email hashes, as the older generator wrote them.
const legacyClass = "apsi-2240-midterm";
const legacyHash = (email: string, salt = "legacy-salt") => "sha256$" + createHash("sha256").update(salt + email).digest("hex");
function legacyTree(dir: string, students: { handle: string; email: string; issuedOn?: string }[]) {
  writeFileSync(join(dir, `${legacyClass}.md`), `---\ntitle: "Old badge"\ntype: badge-class\nbadgeName: "Old badge"\nterm: midterm\nrecipients:\n${students.map(s => `  - "Old Name | ${s.handle} | https://github.com/example/x | | ${legacyClass}--${s.handle}"`).join("\n")}\n---\n\nParticipation.\n`);
  for (const s of students) {
    const slug = `${legacyClass}--${s.handle}`;
    writeFileSync(join(dir, `${slug}.md`), `---\ntitle: "Old: Old Name"\ntype: cert\nbadgeName: "Old badge"\nterm: midterm\nbadgeClass: ${legacyClass}\nshortUrl: /b/${s.handle.slice(0, 8).padEnd(8, "0")}\nrecipientName: "Old Name"\nrecipientHandle: "${s.handle}"\nissuedOn: ${s.issuedOn || "2026-09-16"}\ncertId: "hau-old-${s.handle}"\n---\n\nOld text.\n`);
    writeFileSync(join(dir, `${slug}.ob.json`), JSON.stringify({ type: ["VerifiableCredential"], credentialSubject: { identifier: [{ type: "IdentityObject", hashed: true, salt: "legacy-salt", identityHash: legacyHash(s.email) }] } }));
  }
}
const legacyAward = { ...award, badgeId: "full-stack", legacyTerm: "midterm", emails: ["learner@example.org", "personal@example.net"] };
test("a student's existing legacy page is reused: same slug, short link, certificate id and issue date", () => {
  const dir = mkdtempSync(join(tmpdir(), "badge-"));
  try {
    legacyTree(dir, [{ handle: "oldhandle", email: "personal@example.net", issuedOn: "2026-09-16" }]);
    const planned = planAwards(manifest([{ ...legacyAward, legacySlug: `${legacyClass}--oldhandle` }]), existingAwards(dir), "2026-10-05").awards[0]!;
    expect(planned.classSlug).toBe(legacyClass); expect(planned.certSlug).toBe(`${legacyClass}--oldhandle`);
    expect(planned.issuedOn).toBe("2026-09-16"); expect(planned.assertion.issuedOn).toBe("2026-09-16T00:00:00+08:00");
    expect(planned.shortId).toBe("oldhandl"); expect(planned.certId).toBe("hau-old-oldhandle"); expect(planned.reused).toBe(true);
    expect(planned.md).not.toContain("legacy-salt"); expect(JSON.stringify(planned.assertion)).not.toContain("personal@example.net");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
test("a legacy page whose recipient hash does not match the award fails before anything is written", () => {
  const dir = mkdtempSync(join(tmpdir(), "badge-"));
  try {
    legacyTree(dir, [{ handle: "oldhandle", email: "someone-else@example.net" }]);
    const before = readFileSync(join(dir, `${legacyClass}--oldhandle.md`), "utf8");
    expect(() => issue(manifest([{ ...legacyAward, legacySlug: `${legacyClass}--oldhandle` }]), { dir, emit: true, allowExisting: true, adoptLegacyClass: true })).toThrow("recipient does not match");
    expect(readFileSync(join(dir, `${legacyClass}--oldhandle.md`), "utf8")).toBe(before);
    expect(readFileSync(join(dir, `${legacyClass}.md`), "utf8")).toContain("recipients:");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
test("legacy slugs must exist, belong to the badge's legacy class, and not be claimed twice", () => {
  const dir = mkdtempSync(join(tmpdir(), "badge-"));
  try {
    legacyTree(dir, [{ handle: "oldhandle", email: "personal@example.net" }]);
    const existing = existingAwards(dir);
    expect(() => planAwards(manifest([{ ...legacyAward, legacySlug: `${legacyClass}--missing` }]), existing)).toThrow("not found");
    expect(() => planAwards(manifest([{ ...legacyAward, legacySlug: "apsi-2240-prelim--oldhandle" }]), existing)).toThrow("legacy class");
    expect(() => planAwards(manifest([{ ...legacyAward, legacySlug: `${legacyClass}--oldhandle` }, { ...legacyAward, awardKey: "other", legacySlug: `${legacyClass}--oldhandle` }]), existing)).toThrow("duplicate");
    expect(() => planAwards(manifest([{ ...award, legacySlug: `${legacyClass}--oldhandle` }]), existing)).toThrow("legacy term");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
test("an earner with no legacy page gets a new page under the legacy class slug", () => {
  const dir = mkdtempSync(join(tmpdir(), "badge-"));
  try {
    legacyTree(dir, [{ handle: "oldhandle", email: "personal@example.net" }]);
    const planned = planAwards(manifest([legacyAward]), existingAwards(dir), "2026-10-05").awards[0]!;
    expect(planned.classSlug).toBe(legacyClass); expect(planned.certSlug).toMatch(/^award-[a-f0-9]{24}$/); expect(planned.issuedOn).toBe("2026-10-05"); expect(planned.reused).toBe(false);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
test("rewriting a legacy class page needs --adopt-legacy-class and a legacy marker", () => {
  const dir = mkdtempSync(join(tmpdir(), "badge-")), privateDir = mkdtempSync(join(tmpdir(), "unearned-")), list = join(privateDir, "unearned.json");
  try {
    legacyTree(dir, [{ handle: "oldhandle", email: "personal@example.net" }, { handle: "unearned", email: "nobody@example.net" }]);
    const reuse = manifest([{ ...legacyAward, legacySlug: `${legacyClass}--oldhandle` }]);
    expect(() => issue(reuse, { dir })).toThrow("--adopt-legacy-class");
    expect(() => issue(reuse, { dir, emit: true, allowExisting: true })).toThrow("class page");
    expect(readFileSync(join(dir, `${legacyClass}.md`), "utf8")).toContain("recipients:");
    const dry = issue(reuse, { dir, adoptLegacyClass: true, unearnedLegacyPath: list });
    expect(dry.reused).toBe(1); expect(dry.unearnedLegacy).toBe(1); expect(readFileSync(join(dir, `${legacyClass}.md`), "utf8")).toContain("recipients:");
    issue(reuse, { dir, emit: true, allowExisting: true, adoptLegacyClass: true, unearnedLegacyPath: list });
    const cls = readFileSync(join(dir, `${legacyClass}.md`), "utf8");
    expect(cls).toContain("criteriaText:"); expect(cls).not.toContain("recipients:"); expect(cls).toContain("recipientCount: 1");
    // The reused page now carries the award and the original date; the unearned page is untouched.
    const reused = existingAwards(dir).find(e => e.slug === `${legacyClass}--oldhandle`)!;
    expect(reused.fm.awardKey).toBeTruthy(); expect(reused.fm.issuedOn).toBe("2026-09-16"); expect(reused.assertion!.recipient.identity).toMatch(/^sha256\$/);
    expect(readFileSync(join(dir, `${legacyClass}--unearned.md`), "utf8")).toContain("Old text.");
    expect(JSON.parse(readFileSync(list, "utf8")).pages).toHaveLength(1);
    // A second run is idempotent and a current page is never adoptable.
    issue(reuse, { dir, emit: true, allowExisting: true });
    expect(readdirSync(dir).filter(f => /-v\d/.test(f))).toEqual([]);
    expect(() => issue(manifest([{ ...legacyAward, legacySlug: `${legacyClass}--oldhandle`, thresholdPercent: 80, policyThresholdPercent: 80 }]), { dir, adoptLegacyClass: true })).toThrow("class page");
    expect(() => issue(reuse, { dir, unearnedLegacyPath: join(dir, "inside.json") })).toThrow("outside");
  } finally { rmSync(dir, { recursive: true, force: true }); rmSync(privateDir, { recursive: true, force: true }); }
});
test("a finals badge with no legacy term gets a new class and new pages", () => {
  const dir = mkdtempSync(join(tmpdir(), "badge-"));
  try {
    legacyTree(dir, [{ handle: "oldhandle", email: "personal@example.net" }]);
    const finals = { ...award, badgeId: "builds-with-ai", term: "finals" };
    const planned = planAwards(manifest([finals]), existingAwards(dir)).awards[0]!;
    expect(planned.classSlug).toBe("apsi-2240-builds-with-ai"); expect(planned.certSlug).toMatch(/^award-/);
    issue(manifest([finals]), { dir, emit: true, allowExisting: true });
    expect(readFileSync(join(dir, "apsi-2240-builds-with-ai.md"), "utf8")).toContain("recipientCount: 1");
    expect(readFileSync(join(dir, `${legacyClass}.md`), "utf8")).toContain("recipients:");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
// A stand-in renderer: a PNG signature followed by the title the job's page carries, so a test can see which title an image was drawn from.
const fakePng = (job: ImageJob) => Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), Buffer.from(String(job.md.match(/^subtitle: (".*")$/m)?.[1] || "") + "|" + job.kind)]);
test("a reused legacy page and an adopted class page get their images regenerated in place with the current title", () => {
  const dir = mkdtempSync(join(tmpdir(), "badge-")), images = mkdtempSync(join(tmpdir(), "img-"));
  try {
    legacyTree(dir, [{ handle: "oldhandle", email: "personal@example.net" }]);
    const reuse = manifest([{ ...legacyAward, title: "Full Stack Web Development", legacySlug: `${legacyClass}--oldhandle` }]);
    const seen: ImageJob[][] = [];
    const dry = issue(reuse, { dir, adoptLegacyClass: true, imageDir: images, renderImages: jobs => { seen.push(jobs); return jobs.map(fakePng); } });
    expect(dry.images).toBe(2); expect(seen).toHaveLength(0); expect(readdirSync(images)).toEqual([]);
    const done = issue(reuse, { dir, emit: true, allowExisting: true, adoptLegacyClass: true, imageDir: images, renderImages: jobs => { seen.push(jobs); return jobs.map(fakePng); } });
    expect(done.images).toBe(2); expect(readdirSync(images).sort()).toEqual([`${legacyClass}--oldhandle.png`, `og-${legacyClass}.png`]);
    expect(readFileSync(join(images, `${legacyClass}--oldhandle.png`), "latin1")).toContain('"Full Stack Web Development"|cert');
    expect(readFileSync(join(images, `og-${legacyClass}.png`), "latin1")).toContain('"Full Stack Web Development"|og');
    expect(seen[0]!.find(j => j.kind === "cert")!.assertion).toContain("HostedBadge");
    // A new (non-legacy) award regenerates nothing: its image comes from the ordinary image tool run.
    expect(issue(manifest(), { dir: mkdtempSync(join(tmpdir(), "badge-")), imageDir: images }).images).toBe(0);
  } finally { rmSync(dir, { recursive: true, force: true }); rmSync(images, { recursive: true, force: true }); }
});
test("an image failure writes nothing", () => {
  const dir = mkdtempSync(join(tmpdir(), "badge-")), images = mkdtempSync(join(tmpdir(), "img-"));
  try {
    legacyTree(dir, [{ handle: "oldhandle", email: "personal@example.net" }]);
    const snapshot = () => readdirSync(dir).sort().map(f => `${f}:${readFileSync(join(dir, f), "utf8")}`);
    const before = snapshot();
    const reuse = manifest([{ ...legacyAward, legacySlug: `${legacyClass}--oldhandle` }]);
    expect(() => issue(reuse, { dir, emit: true, allowExisting: true, adoptLegacyClass: true, imageDir: images, renderImages: () => { throw new Error("browser died"); } })).toThrow("nothing was written");
    expect(() => issue(reuse, { dir, emit: true, allowExisting: true, adoptLegacyClass: true, imageDir: images, renderImages: jobs => jobs.map(() => Buffer.from("not a png")) })).toThrow("nothing was written");
    expect(snapshot()).toEqual(before); expect(readdirSync(images)).toEqual([]);
  } finally { rmSync(dir, { recursive: true, force: true }); rmSync(images, { recursive: true, force: true }); }
});
