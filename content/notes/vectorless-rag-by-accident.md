---
title: "My AI Workflow Is Vectorless RAG and I Didn't Call It That"
audience: [build]
level: intro
subtitle: "A LinkedIn post gave a name to something I had been building for months by accident. My sessions do not search for what looks similar. They read a table of contents and open the one file they need."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-11-17
readingTime: "~7 min"
tags: [ai, retrieval, standards, tooling]
summary: >
  Retrieval by similarity chunks documents, embeds them and hands back whatever sits nearest the
  question. Retrieval by reasoning, which Shivani Virdi set beside it in a LinkedIn post, gives the
  model a tree of sections and lets it drill down. My setup with Claude is the second kind and I never
  named it. CLAUDE.md is the table of contents, the standards are skills with a one-line description
  each, PANTRY resolves them into every repo, a code graph answers structural questions by symbol, and
  each package carries its own CLAUDE.md as a subtree. It is precise and I can trace it. It also costs
  extra reads, the tree has to fit in context, and my notes and run reports have no tree at all yet.
social: |
  I read a LinkedIn post by Shivani Virdi about vectorless RAG and recognized my own repo in it.

  No embeddings, no vector store. The model reads a table of contents and drills down to the one
  section it needs. That is what my CLAUDE.md, my standards and my code graph have been doing for
  months. I would have called it "keeping good docs."

  It is precise and I can trace every read. It also costs more reads, and my notes are still a flat
  pile with no tree.
socialImage: "/media/notes/vectorless-rag-by-accident-social.png"
socialImageAlt: "My AI workflow is vectorless RAG and I didn't call it that: on the left a scatter of dots with a ring around the nearest few, labelled find what looks similar; on the right a small tree with one path drawn in ink down to a filled leaf, labelled read the contents, open one file."
---

I read a LinkedIn post by Shivani Virdi last week and recognized my own repo in it, which is a strange
way to find out what you built.

The post set two kinds of retrieval side by side. The familiar one is retrieval by similarity. You
chop your documents into chunks, turn each chunk into a vector, and when a question comes in you hand
back the chunks whose vectors sit closest to it. The other one is retrieval by reasoning. You parse
the documents into a tree of sections, give the model the tree, and let it read the headings and drill
down to the part that answers the question. No embeddings, no vector store. People have started
calling it vectorless RAG.

She was fair to both. Reasoning over a tree is precise, and you can trace every step, because each
step is the model picking a branch for a reason it can say out loud. It also costs more calls, since
every level down is another read, and the tree has to fit in the context window or the whole trick
falls over. Her bet was that production systems end up hybrid. I think she is right, and my own setup
already shows where the other half is missing.

The idea is hers. What I can add is a receipt. I have been running the reasoning kind for months to
feed Claude its context, and until that post I would have described it as "I keep good docs."

## I thought I was just being tidy

None of this started as retrieval. It started because I am disorganized and the AI is not, and I
needed it to find things without me standing there pointing.

Every repo I work in opens with a CLAUDE.md, and the harness loads it before anything else happens.
The one in this portfolio has a section called *Start here*, and it is a numbered reading order. The
philosophy first. Then the intake skill, for when someone pastes me a brief. Then voice, figures, the
note standard, the README standard, the code graph, the content backlog, the plan. Ten entries, each a
line saying what the thing is and when to open it.

That is a table of contents. I wrote it as onboarding for a new teammate, and the model reads it
exactly the way the post describes. It looks at the headings and decides which branch to open.

> I was not building a retrieval system. I was writing a table of contents for a reader who reads
> every word and remembers none of it tomorrow.

## The whole tree, one layer at a time

Once I saw the root, the rest of the tree was obvious, because I had built every layer of it for some
other reason.

**The standards are the named sections.** Twenty-one of them are mounted into each session as skills:
voice, figures, the note standard, the loop, the graph, and the rest. Each one opens with a short
frontmatter field called *when*, and that field becomes the skill's description. Until the model
decides to open a standard, the description is all it sees. The rules for the standards folder say it
flatly: the description "is the only thing an agent reads when deciding whether to open the file at
all." That is a node summary in a section tree. I wrote a whole contract for how to word it (start
with "Read this BEFORE", spell out the literal words a real prompt will contain) without knowing I was
tuning a retrieval index.

The contract even has a scar from a classic tree failure. Two sections shared a name. The loop
standard mounted as *loop*, the harness already ships a built-in skill called *loop*, and mine was
shadowed without a sound. It sat on disk and never fired. It carries a different name now. In a vector
store, two documents with the same title are a non-event. In a tree, a duplicate heading means one
branch can never be picked.

**PANTRY resolves them.** The standards live once, here, in this repo's standards folder. PANTRY
resolves them out of the portfolio package and mounts them as skills in the other repos, so a session
in GRAIN reads the same sections as a session in this one. One copy of each section, many readers. The
honest bit is that the mount is a sync I still run by hand, and a repo I forgot to sync is reading
last week's tree.

**The code graph is the index at the back of the book.** For questions about code, the graph standard
says to ask the graph before reaching for grep. graphify builds it by static analysis, no model and no
API cost, and it answers "where is this defined" and "what calls it" with a handful of file and line
nodes. It is an exact index, and you can tell by how it fails. Give it a partial name and it answers
*No matching nodes found*, which reads like a broken tool and is really a lookup refusing to guess. A
vector store would have handed back something close. Sometimes close is what I want, and the graph
will never give it to me.

**Every package carries its own subtree.** The standards folder has its own CLAUDE.md, with its own
reading order and its own rules, and each package in the stack keeps a CLAUDE.md and a PLAN.md of its
own. A subtree loads when the session first reads a file inside it. That happened while this note was
being drafted. The session opened the note standard, and the standards folder's rules arrived with it,
unasked. Nobody searched for them. They were on the branch.

<svg viewBox="0 0 520 352" width="100%" role="img"
     aria-label="The retrieval tree my sessions walk. At the root, CLAUDE.md, the table of contents. Three branches below it: the skills, which are named sections; graphify, an index looked up by symbol; and a CLAUDE.md per folder, which is a subtree. Under the skills branch, the session reads the descriptions and opens one section, the voice standard, and reads that one file whole. Off to the side, outside the tree, sit the notes and run reports, a flat pile with no tree yet."
     style="display:block;width:100%;max-width:520px;height:auto;margin:0 auto 1.5rem;
            font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-vectorless0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="160" y="16" width="200" height="48" rx="6"/>
    <rect x="10" y="118" width="150" height="48" rx="6"/>
    <rect x="185" y="118" width="150" height="48" rx="6"/>
    <rect x="360" y="118" width="150" height="48" rx="6"/>
  </g>
  <rect x="10" y="236" width="150" height="48" rx="6"
        style="fill:var(--color-fg);stroke:var(--color-fg)"/>
  <rect x="200" y="290" width="310" height="48" rx="6"
        style="fill:none;stroke:var(--color-line);stroke-width:1;stroke-dasharray:5 4"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="230" y1="64" x2="95" y2="116" marker-end="url(#fl-vectorless0)"/>
    <line x1="260" y1="64" x2="260" y2="116" marker-end="url(#fl-vectorless0)"/>
    <line x1="290" y1="64" x2="425" y2="116" marker-end="url(#fl-vectorless0)"/>
    <line x1="85" y1="166" x2="85" y2="234" marker-end="url(#fl-vectorless0)"/>
  </g>
  <g text-anchor="middle">
    <text x="260" y="37" style="fill:var(--color-fg)">CLAUDE.md</text>
    <text x="260" y="55" style="fill:var(--color-muted);font-size:11.5px">the table of contents</text>
    <text x="85" y="139" style="fill:var(--color-fg)">skills</text>
    <text x="85" y="157" style="fill:var(--color-muted);font-size:11.5px">named sections</text>
    <text x="260" y="139" style="fill:var(--color-fg)">graphify</text>
    <text x="260" y="157" style="fill:var(--color-muted);font-size:11.5px">an index, by symbol</text>
    <text x="435" y="139" style="fill:var(--color-fg)">CLAUDE.md per folder</text>
    <text x="435" y="157" style="fill:var(--color-muted);font-size:11.5px">a subtree</text>
    <text x="85" y="257" style="fill:var(--color-bg)">the voice standard</text>
    <text x="85" y="275" style="fill:var(--color-bg);font-size:11.5px">one file, read whole</text>
    <text x="355" y="311" style="fill:var(--color-muted)">notes and run reports</text>
    <text x="355" y="329" style="fill:var(--color-muted);font-size:11.5px">a flat pile, no tree yet</text>
  </g>
  <g text-anchor="middle" style="fill:var(--color-muted);font-size:12px;
       stroke:var(--color-bg);stroke-width:3;paint-order:stroke">
    <text x="85" y="204">reads the descriptions</text>
  </g>
</svg>

*The tree my sessions walk. The root and three branches are files I wrote for other reasons. The
dashed box is the part with no tree.*

## Why I would keep the tree

**I can trace it.** When a session gets something wrong, I can ask which file it read, and the answer
is a path. I can open that path and see whether the file was wrong or the reading was. With similarity
the answer is "these five chunks scored highest," and why they scored highest is a number nobody can
argue with. I want to [watch its hands](watch-its-hands.md), and a branch it chose is a hand I can
watch.

**It costs me nothing I was not already paying.** The table of contents is onboarding I would write
anyway. The skill descriptions are the standards' own frontmatter. The graph rebuilds from the code.
There is no pipeline to keep alive, no store to re-embed when a file changes, no second copy of the
docs that can drift from the first. Small and owned, which is how I like most things.

## Where it runs out

Shivani named the costs, and I pay every one of them.

Every drill-down is a read. A session spends its first turns walking CLAUDE.md, then a skill, then the
file the skill points at, before it has done any work. That is cheap on a small question and silly on
a trivial one.

The tree has to fit. All twenty-one skill descriptions load into every session whether the task needs
them or not. That works because they are short. At a hundred it would not, and I would be paying for a
table of contents longer than the chapter I came for.

And some of what I have is not a tree. There are twenty-six notes in this folder as of today, counting this one. There
are run reports and finished plans piling up in their own folders. None of them has a table of
contents a model could walk. When a session needs to know whether I have already written about
something, the only tools it has are grep and my memory, and my memory is the reason this whole setup
exists.

That flat pile is where similarity earns its place, and it is why I think she is right about hybrid. I
have not built that half. It is a guess about what I will need, and I am labelling it one.

## What is in flight

Three sibling sessions are working on the tree while this sits in draft. None of it has landed.

- **A standards index**, so the top of the tree is one file a session can read whole instead of
  twenty-one descriptions it gets handed.
- **A retrieval trace in the run report**, listing which files the session opened and why. The
  traceability argument above is a claim until that exists. With it, every run carries the receipt.
- **A staleness check**, because a tree that points at a file which changed underneath it is worse
  than no tree. The model trusts a heading the way I trust a street sign.

## The name was the only part missing

I would still describe all of this as "I keep good docs," and I would still be telling the truth. It
turns out good docs, written for a reader who reads every word and forgets them by tomorrow, already
had a name somewhere else. Shivani gave me the name.

The table of contents was already there.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
