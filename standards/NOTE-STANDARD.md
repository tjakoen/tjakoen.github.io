---
title: NOTE-STANDARD.md — the note / blog-post standard
summary: How a note is put together - frontmatter, structure, the sign-off footer, plus a reusable drafting prompt.
when: >
  Read this BEFORE creating or finishing any file under content/notes: a blog post, a note, the
  whitepaper. It owns the artifact (the frontmatter block, the stakes-first opener, the figure
  requirement, the exact sign-off footer, where the file lives); VOICE owns how the words read, so
  the two are read together, not instead of each other. Don't skip because the note is only a draft
  or because you already know the voice - a note missing its frontmatter, its figure, or its footer
  is unfinished no matter how well it reads.
---

# Note / blog-post standard + reusable prompt

My standard for how a note (a blog post on tjakoen.github.io/notes) is put together: the frontmatter
template, the structure, the sign-off footer, and the guardrails, plus a copy-paste prompt that tells
an AI how to draft or finish one in my voice. Companion to [`VOICE.md`](VOICE.md) (**the** source of
truth for *how it reads*) and [`README-STANDARD.md`](README-STANDARD.md) (the sibling standard, for
repo READMEs).

> Split of responsibility: **VOICE.md owns the prose** (cadence, the machine-tells, figures, the
> honesty clause). **This file owns the artifact** (frontmatter, structure, footer, file placement,
> the runnable prompt). When they overlap, VOICE.md wins on wording; this file wins on shape. Don't
> duplicate VOICE.md here, point at it.

## Before you write

0. **Decide which kind of note it is** (see *Two kinds of note* below). Personal note or guide. Get
   this wrong and the piece gets rewritten from scratch rather than edited, which is the failure the
   section exists to prevent.
1. **Read [`VOICE.md`](VOICE.md) first.** Every word that ships under his byline matches it. If a
   draft is clean, correct, and forgettable, it isn't done.
2. **Check [`CONTENT-BACKLOG.md`](https://github.com/tjakoen/tjakoen.github.io/blob/main/docs/CONTENT-BACKLOG.md).** See if the piece is already planned,
   what its angle is, and what it must *not* say. Update the backlog when a note lands.
3. **Notes live in [`/notes`](/notes)** as `kebab-case.md`. Cross-link sibling notes with a
   relative link (`[Ten Times Zero Is Still Zero](ten-times-zero.md)`), never an absolute URL, they
   travel together and MILL renders them.

## Frontmatter template

Every note opens with this block. Fields are required unless marked optional.

```yaml
---
title: "Sentence-case, specific, a hook not a label"
subtitle: "One or two sentences that set the stake. This is the social-preview text."
author: "Tjakoen Stolk"
status: DRAFT            # DRAFT until he says otherwise; PUBLISHED when live
type: note               # note | whitepaper
date: 2026-07-03         # ISO, the day it's written/updated
readingTime: "~8 min"    # honest estimate, "~N min" format
tags: [teaching, ai, native-first]   # lowercase, real topics, ~3–6
summary: >
  A 1–3 sentence abstract for listing pages and AI/SEO. Says what the piece argues, in his voice,
  not "this post will discuss…". This is the AEO surface, make it a real answer.
---
```

| Field | What it's for | Rules |
|---|---|---|
| `title` | The hook | Specific and human, a stake or a confession, never a generic label. |
| `subtitle` | The stake / social preview | 1–2 sentences. The pull-quote energy, not a summary. |
| `author` | Byline | Always `"Tjakoen Stolk"`. |
| `status` | Publish state | `DRAFT` by default. Only he flips it to `PUBLISHED`. |
| `type` | Kind | `note` for a blog post; `whitepaper` for the long-form formal piece. |
| `date` | ISO date | The write/update day. |
| `readingTime` | Honest estimate | `"~N min"`. Don't inflate it. |
| `tags` | Topics | Lowercase, real, ~3–6. Reuse existing tags where they fit. |
| `summary` | Abstract for listings + AI/SEO | A real answer in his voice. This is the AEO payload; treat it as first-class. |

## Structure

Follow VOICE.md's *Structure of a typical piece* and *Signature moves*, as a **repertoire, not a
template**, hitting every beat every time is itself the machine tell VOICE.md warns about. The hard
requirements that live here, not there:

- **Open stakes-first, not thesis-first.** A confession, a number, or mid-problem. Rotate the opener
  across pieces.
- **Carry a figure.** He loves visuals; don't ship an all-prose note. Use inline SVG (data) or
  mermaid (flows) per VOICE.md's *Figures* section, in the e-ink palette. A prose
  `> *Figure: what it shows*` placeholder is a to-do, not a finished state.
- **Close on a callback or a punch**, never a "In conclusion…" wrap-up.
- **End with the sign-off footer** (below).

## Two kinds of note, and picking the wrong one is expensive

Everything above this section describes **the personal note**, and for years that was the only kind
this standard had. The confessional opener, the callback close, the wink at his own expense: those
are right for a piece where the reader is following *him*.

They are wrong for a piece where the reader is a company.

That distinction went unwritten until the substrate-gap pair (2026-08-18), which was drafted three
times before it landed, each rebuild caused by this gap in the standard rather than by bad writing.
So it is written down now.

| | **The personal note** | **The guide** |
|---|---|---|
| Reader | Someone following his work | Someone with a decision and a budget |
| Examples | origin-story, ten-times-zero, why-i-teach | the-substrate-gap, ninety-days-substrate-gap |
| Opens with | A confession, a number, or mid-problem | The thesis, in the first sentence |
| First person | The spine of it | None, or one line where it is genuinely load-bearing |
| His experience | Is the subject | Is evidence for a claim, a sentence at a time |
| Humor | Load-bearing, at his own expense | Rare. Dry understatement at most, never a wink |
| Closes on | A callback to the opening image | A turn: the one line the reader repeats afterwards |
| Honest limits | Woven through, personal | Stated flat, as two drawn futures rather than caveats |
| Reads like | A smart friend explaining something he cares about | A smart friend who has done this before, telling you what to do |

**Both are VOICE.** The guide is not a corporate register with the personality sanded off, and if a
draft reads that way it has failed in the other direction. Plain strong verbs, real specifics,
opinions with the reason attached, no corporate verbs, no machine tells. What changes is *who the
sentences are about*, not how they sound.

**The tell that a guide has drifted back into a personal note:** the reader's problem does not appear
until several paragraphs in, because the piece is still establishing why he is worth listening to.
In a guide, credibility comes from handling the evidence well and being right about the plan.

## What a guide owes on top of everything above

Derived from a comparison pass against [Addy Osmani's blog](https://addyosmani.com/blog/) run on
2026-08-18, which is the closest public writing to what these guides are trying to be. Take these as
a repertoire like the signature moves, not a checklist: the formula tell in
[VOICE.md](VOICE.md) applies here too, and a piece that visibly completes every row reads as
manufactured.

- **Name the idea.** Osmani coins a term in nearly every post: Loop Engineering, Comprehension Debt,
  The Intent Debt, The Orchestration Tax. The name is the persuasion, because it gives a reader
  something to repeat in a meeting they are walking into. If a piece has one central idea, name it
  once, define it in a sentence, and refer back to that name rather than re-describing it.
  **The honest limit:** a name earns its place only if the idea underneath it is load-bearing. A
  coined term wrapped around a thin observation is the buzzword move, and it reads as one.
- **The skim path has to carry the argument.** Lead each section with its conclusion in bold, then
  explain. The test is mechanical: read only the headings and the bold text, and check whether the
  argument survives. If it does not, the piece only works for a reader who has time, and a guide's
  reader does not.
- **Land the thesis in the first sentence.** Not the fourth. The scene-setting paragraph is a
  personal-note move.
- **Two futures instead of a caveat.** Where a personal note admits a limit, a guide draws both
  outcomes and says what to do in either. Same honesty, and it reads as command of the material
  rather than retreat. The honesty clause is not negotiable in either kind.
- **Label the actionable parts.** A block of bullets a reader can act on gets a heading that says so
  (*What to do about it:*), so it can be found without reading the argument around it.
- **Cite people, not only institutions.** Where a source is a person, name them. Institutional
  citation alone is solid and cold; the genre runs on practitioners crediting practitioners.
- **Close on the turn, not the appendix.** The last section is the one line worth repeating. Move
  the week-by-week, the checklist, the reference table to just before it.

### The pair pattern, when a guide runs long

Practitioner blogs in this genre run 1,500 to 3,000 words, and a guide with a real plan in it will
not. Rather than cutting the plan, split:

- **A short lead piece** (~1,200 to 1,800 words) carrying the argument, the one figure that proves
  it, and the reader's next action. This is the one that gets promoted.
- **A long companion** carrying the full plan. It opens with a blockquote pointing back at the lead
  piece, and the lead piece hands off to it near the end.

Both get full frontmatter and the footer. They cross-link each other. In the backlog they are logged
as one entry, because they are one argument.

## The footer (bottom of every note)

The sign-off speaks only to the **content's authorship**, the same way a repo footer speaks to the
code's. Standard note:

```markdown
---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
```

- The link on *judgment is human* points at [`ten-times-zero.md`](/notes/ten-times-zero), the
  "how I actually work with AI, receipts and all" post, mirroring how every repo footer links it
  (see [`README-STANDARD.md`](README-STANDARD.md)).
- **The flagship post, `ten-times-zero.md`, doesn't self-link** and swaps the tail:
  `*The judgment is human. The typing, by design, is not. On this one, nearly all of it.*`
- **Not in this footer:** *"Rendered by the stack it is about"* and the grain legend describe the
  *page*, not the post. They live in the site/page-chrome footer (rendered once), never per-note.

This replaced the older *"Written by a human"* line, which overclaimed: the AI drafts the prose; the
human owns the content, the direction, and the approval. The honest split is the point.

## Guardrails (this repo is public)

Non-negotiable, and they *precede* voice, a specific being real doesn't make it publishable:

- **No em-dashes, no backticks in prose.** The two loudest machine tells. (This standard doc uses
  backticks for filenames/fields, that exception is for reference docs only; a note never does.)
- **Money stays vague.** Never a salary figure or an exact ratio. Relative only ("a sliver of what
  my day job pays").
- **No student data, ever.** No names, numbers, emails, or private course internals. Class-size
  counts are fine; flag them as snapshots.
- **Company is "Career Team"** (exactly). Name-drops = public professional info + LinkedIn only.
- **The honesty clause.** Never claim a benefit not shown. Hypothesis? Say so. Snapshot number? Flag
  it. See VOICE.md.

## The prompt (paste into Claude Code to draft or finish a note)

```text
Draft/finish a note for tjakoen.github.io/notes following my personal standard. This ships under my
byline, so voice and honesty are the whole job.

STEP 1 — READ THE STANDARDS FIRST, don't wing it:
- tjakoen.github.io/standards/VOICE.md — how it must READ. Match it. If a passage is clean, correct, and
  forgettable, it sounds like AI; make it mine (a confession up front, a real number, a wink at my
  own expense, a sentence that's too short).
- tjakoen.github.io/standards/NOTE-STANDARD.md (this file) — the artifact: frontmatter, structure, footer.
- tjakoen.github.io/docs/CONTENT-BACKLOG.md — is this piece planned? what's its angle? what must it NOT say?

STEP 1b — PICK THE KIND. Personal note (reader is following me) or guide (reader is a company with
a decision and a budget)? The standard's "Two kinds of note" table says what changes. If it's a
guide: thesis in the first sentence, no first person, bold conclusion at the head of every section
so the skim path carries the argument, name the central idea once, two drawn futures instead of
caveats, close on the turn. If the plan makes it run past ~3,000 words, propose the pair pattern
rather than cutting it.

STEP 2 — WRITE:
- Frontmatter block per the template (title/subtitle/author/status: DRAFT/type/date/readingTime/
  tags/summary). Make the summary a real answer, it's the AI/SEO surface.
- Open stakes-first (confession, number, or mid-problem), not thesis-first.
- Argue MY side with MY reasons (see VOICE.md's opinion stack). Take a side; no both-sides mush.
- Name real specifics (Bun, Claude, the real project) instead of vague placeholders.
- Include at least one figure (inline SVG for data, mermaid for flows, e-ink palette) or a
  `> *Figure: …*` placeholder flagged as a to-do.
- Close on a callback or a punch, not a wrap-up paragraph.
- End with the exact footer:
  ---
  *The [judgment is human](ten-times-zero.md). The typing, by design, is not.*

STEP 3 — GUARDRAILS (check before you hand it back):
- NO em-dashes, NO backticks in the prose. NO corporate verbs (leverage/utilize/empower/unlock).
- NO "it's not just X, it's Y", no eager sign-offs, no everything-in-threes.
- Money vague, no student data, company spelled "Career Team", benefits not overclaimed.

STEP 4 — HAND BACK: the note, plus a short list of every bracketed [ ... ] spot only I can fill
(specifics you didn't invent), and any claim that needs a receipt before it can go from DRAFT to
PUBLISHED. Don't fabricate specifics to look finished; a flagged gap beats a confident guess.
```

---

*A projection of how these notes already get made. Update it when the shape changes, not the other
way around.*
