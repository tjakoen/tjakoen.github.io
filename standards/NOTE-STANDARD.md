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

1. **Read [`VOICE.md`](VOICE.md) first.** Every word that ships under his byline matches it. If a
   draft is clean, correct, and forgettable, it isn't done.
2. **Check [`../CONTENT-BACKLOG.md`](../CONTENT-BACKLOG.md).** See if the piece is already planned,
   what its angle is, and what it must *not* say. Update the backlog when a note lands.
3. **Notes live in [`../notes/`](../notes/)** as `kebab-case.md`. Cross-link sibling notes with a
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

## The footer (bottom of every note)

The sign-off speaks only to the **content's authorship**, the same way a repo footer speaks to the
code's. Standard note:

```markdown
---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
```

- The link on *judgment is human* points at [`ten-times-zero.md`](../notes/ten-times-zero.md), the
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
- portfolio/standards/VOICE.md — how it must READ. Match it. If a passage is clean, correct, and
  forgettable, it sounds like AI; make it mine (a confession up front, a real number, a wink at my
  own expense, a sentence that's too short).
- portfolio/standards/NOTE-STANDARD.md (this file) — the artifact: frontmatter, structure, footer.
- portfolio/CONTENT-BACKLOG.md — is this piece planned? what's its angle? what must it NOT say?

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
