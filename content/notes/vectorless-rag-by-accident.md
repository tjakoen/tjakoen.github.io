---
title: "My AI Workflow Is Vectorless RAG and I Didn't Call It That"
audience: [build]
level: intro
subtitle: "Retrieval-augmented generation hands a model the right pages before it answers. Most systems pick those pages by similarity. Mine picks them by reading a table of contents, and I built it months before I knew it had a name."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-11-26
readingTime: "~16 min"
tags: [ai, rag, retrieval, standards, tooling]
summary: >
  RAG gives a model the right pages before it answers. The common version picks pages by similarity,
  using vectors. Vectorless RAG gives the model a tree of sections instead and lets it read down to the
  page it needs, which is what PageIndex does and what Claude Code does in its own way with grep. My
  setup with Claude is the tree kind: CLAUDE.md is the contents page, 29 standards are skills with a
  one-line description each, and a standards index lets a session read 2,848 characters of a library of
  494,868. It is traceable and cheap to keep, it costs extra reads, and my 37 notes still have no tree.
social: |
  I have been running vectorless RAG for months and had no word for it.

  RAG means the AI looks things up before it answers. Most setups do it with vectors: chop the
  documents into chunks, turn each chunk into numbers, fetch whatever sits nearest the question. Mine
  does it with a table of contents. CLAUDE.md lists the standards, each standard has a one-line
  description, and a session opens the one section it needs. One answer cost 2,848 characters of
  reading out of a library of 494,868.

  It is easy to trace and it costs me nothing extra. It also costs more reads, and my notes are still
  a flat pile with no tree.
socialImage: "/media/notes/vectorless-rag-by-accident-social.png"
socialImageAlt: "My AI workflow is vectorless RAG and I didn't call it that: on the left a scatter of dots with a ring around the nearest few, labelled find what looks similar; on the right a small tree with one path drawn in ink down to a filled leaf, labelled read the contents, open one file."
---

Claude has never read my standards. Every session starts blank, and every session has to find the one
file that applies out of thirty-odd, without me standing there pointing.

For months I called whatever makes that work "keeping good docs." It turns out the AI world has a
name for it, vectorless RAG, and at least one open-source project is built around the idea. This note
explains what RAG is for anyone who has not met the word, what the vectorless kind does differently,
what both are used for, and what my own version looks like with the receipts, including the parts that
do not work.

## What RAG is, if you have never met it

A language model knows two things: what it absorbed during training, and whatever is in the prompt
right now. It has never seen your syllabus, your company wiki or your repository. Ask it about them and
it will guess, fluently, which is the worst way to be wrong.

If you have ever pasted a document into a chat and asked a question about it, you have done the manual
version of the fix. The model answered from the page you handed it, not from memory. RAG, short for
retrieval-augmented generation, is that move with the pasting automated. A program looks through your
documents, picks the pages most likely to hold the answer, puts them in the prompt beside your
question, and the model writes its answer from them. The name came from a 2020 paper by Patrick Lewis
and colleagues, presented at NeurIPS. Their library was Wikipedia, and they found the pages with a
vector index, which matters later in this note.

<svg viewBox="0 0 520 320" width="100%" role="img"
     aria-label="How RAG works, top to bottom. Your question comes in. A retrieve step, drawn in ink because it is the only part that differs between systems, searches the library of your documents and picks the right pages. The question and those pages go into the prompt together. The model writes its answer from them."
     style="display:block;width:100%;max-width:520px;height:auto;margin:0 auto 1.5rem;
            font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-vectorless1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="160" y="16" width="200" height="48" rx="6"/>
    <rect x="160" y="176" width="200" height="48" rx="6"/>
    <rect x="160" y="256" width="200" height="48" rx="6"/>
  </g>
  <rect x="160" y="96" width="200" height="48" rx="6"
        style="fill:var(--color-fg);stroke:var(--color-fg)"/>
  <rect x="385" y="96" width="125" height="48" rx="6"
        style="fill:none;stroke:var(--color-line);stroke-width:1;stroke-dasharray:5 4"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="260" y1="64" x2="260" y2="94" marker-end="url(#fl-vectorless1)"/>
    <line x1="260" y1="144" x2="260" y2="174" marker-end="url(#fl-vectorless1)"/>
    <line x1="260" y1="224" x2="260" y2="254" marker-end="url(#fl-vectorless1)"/>
    <line x1="385" y1="120" x2="362" y2="120" marker-end="url(#fl-vectorless1)"/>
  </g>
  <g text-anchor="middle">
    <text x="260" y="37" style="fill:var(--color-fg)">Your question</text>
    <text x="260" y="55" style="fill:var(--color-muted);font-size:11.5px">in plain words</text>
    <text x="260" y="117" style="fill:var(--color-bg)">Retrieve</text>
    <text x="260" y="135" style="fill:var(--color-bg);font-size:11.5px">pick the right pages</text>
    <text x="260" y="197" style="fill:var(--color-fg)">Question plus those pages</text>
    <text x="260" y="215" style="fill:var(--color-muted);font-size:11.5px">one prompt</text>
    <text x="260" y="277" style="fill:var(--color-fg)">The model answers</text>
    <text x="260" y="295" style="fill:var(--color-muted);font-size:11.5px">from the pages, not from memory</text>
    <text x="447" y="117" style="fill:var(--color-fg)">The library</text>
    <text x="447" y="135" style="fill:var(--color-muted);font-size:11.5px">your documents</text>
  </g>
</svg>

*RAG in four boxes. Every RAG system has all four. The ink box is where they differ, and it is the
whole argument of this note.*

Anthropic is blunt about when you can skip all of this. In its write-up on retrieval, it says a
knowledge base under about 200,000 tokens, roughly 500 pages, can simply go into the prompt, and that
prompt caching makes doing so cheaper and faster. RAG is for the libraries that do not fit.

## What people use it for

Anything where the answer lives in a pile of documents that is too big to paste and too specific for
the model to know. The common shapes:

| Use | What gets looked up |
|---|---|
| A support bot | The help center, and past answers |
| A company assistant | The wiki, the policies, old tickets |
| Reading a contract or a financial filing | One long document with real structure |
| A coding assistant | The repository |
| A class helper (the kind I could picture, not one I run) | The syllabus and the assignment pages |

The reason it took off is boring and good. Retraining a model on your documents is slow and expensive,
and it goes stale the day a policy changes. Retrieval stays current, because you only have to update
the pages. It also lets the answer point back at its source, which is the part a teacher or a manager
actually wants.

## The usual way: find what looks similar

Most RAG systems pick pages by similarity, and it works in three steps.

1. Chop every document into chunks, a few paragraphs each.
2. Turn each chunk into a long list of numbers, called an embedding, built so that chunks about the
   same thing get similar lists. Store them in a vector database.
3. When a question arrives, turn it into numbers the same way and fetch the chunks whose numbers sit
   nearest.

The numbers are positions on a very large map. Close on the map means close in meaning. It is a
clever idea, and it handles the case where the question and the answer share no words at all.

Its weakness is the same property. Close in meaning is not the same as the right page. Picture a
question about this year's revenue. It sits near every paragraph that mentions revenue, including last
year's, and nothing in the map knows which year you meant. The system hands back a ranked pile and
leaves the model to sort it out, and when the answer is wrong it is hard to say why, because the reason
is a distance between two lists of numbers.

The vector camp is not standing still, to be fair. In September 2024 Anthropic published a technique
called contextual retrieval: before embedding a chunk, add a short note saying where the chunk came
from. Combined with keyword search and a reranking step, it cut the share of relevant chunks missing
from the top twenty from 5.7 percent to 1.9 percent in their tests. Similarity can be tuned a long way.

## The other way: read the contents page

Vectorless RAG throws out the map and gives the model something a person would use: the table of
contents. You parse a document into a tree of sections, each with a title and a short summary. The model
reads the top of the tree, picks a branch, reads what is under it, and keeps going until it reaches the
page that holds the answer. No embeddings, no vector database.

<svg viewBox="0 0 520 290" width="100%" role="img"
     aria-label="Two ways to retrieve, side by side. On the left, find what looks similar: a scatter of dots with the question in the middle and a dashed ring around the three nearest dots, which are the chunks that come back, the rest left out. On the right, read the contents, open one file: a small tree with a root called contents and three branches called figures, voice and graph. One path is drawn in ink, from contents to voice to a leaf called punctuation, which is the one section opened."
     style="display:block;width:100%;max-width:520px;height:auto;margin:0 auto 1.5rem;
            font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <line x1="260" y1="10" x2="260" y2="280" style="stroke:var(--color-line);stroke-width:1"/>
  <g style="fill:none;stroke:var(--color-muted);stroke-width:1.2">
    <circle cx="45" cy="95" r="3.5"/><circle cx="85" cy="68" r="3.5"/><circle cx="190" cy="72" r="3.5"/>
    <circle cx="160" cy="98" r="3.5"/><circle cx="222" cy="115" r="3.5"/><circle cx="228" cy="175" r="3.5"/>
    <circle cx="185" cy="222" r="3.5"/><circle cx="105" cy="218" r="3.5"/><circle cx="60" cy="190" r="3.5"/>
    <circle cx="35" cy="140" r="3.5"/>
  </g>
  <circle cx="130" cy="150" r="46" style="fill:none;stroke:var(--color-fg);stroke-width:1.2;stroke-dasharray:5 4"/>
  <g style="fill:var(--color-fg)">
    <circle cx="110" cy="135" r="3.8"/><circle cx="150" cy="128" r="3.8"/><circle cx="138" cy="178" r="3.8"/>
  </g>
  <circle cx="130" cy="150" r="5" style="fill:var(--color-bg);stroke:var(--color-fg);stroke-width:2"/>
  <g style="fill:var(--color-muted);font-size:11.5px;stroke:var(--color-bg);stroke-width:3;paint-order:stroke">
    <text x="138" y="154">question</text>
  </g>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <line x1="390" y1="70" x2="310" y2="108"/>
    <line x1="390" y1="70" x2="470" y2="108"/>
    <line x1="390" y1="134" x2="350" y2="178" style="stroke:var(--color-line)"/>
    <rect x="275" y="108" width="70" height="26" rx="5"/>
    <rect x="435" y="108" width="70" height="26" rx="5"/>
    <rect x="312" y="178" width="76" height="26" rx="5"/>
  </g>
  <g style="fill:none;stroke:var(--color-fg);stroke-width:2.5">
    <line x1="390" y1="70" x2="390" y2="108"/>
    <line x1="390" y1="134" x2="430" y2="178"/>
  </g>
  <g style="fill:none;stroke:var(--color-fg);stroke-width:1.5">
    <rect x="345" y="44" width="90" height="26" rx="5"/>
    <rect x="355" y="108" width="70" height="26" rx="5"/>
  </g>
  <rect x="392" y="178" width="76" height="26" rx="5" style="fill:var(--color-fg);stroke:var(--color-fg)"/>
  <g text-anchor="middle" style="font-size:11.5px">
    <text x="390" y="61" style="fill:var(--color-fg)">contents</text>
    <text x="310" y="125" style="fill:var(--color-muted)">figures</text>
    <text x="390" y="125" style="fill:var(--color-fg)">voice</text>
    <text x="470" y="125" style="fill:var(--color-muted)">graph</text>
    <text x="350" y="195" style="fill:var(--color-muted)">principles</text>
    <text x="430" y="195" style="fill:var(--color-bg)">punctuation</text>
  </g>
  <g text-anchor="middle">
    <text x="130" y="24" style="fill:var(--color-fg)">Find what looks similar</text>
    <text x="390" y="24" style="fill:var(--color-fg)">Read the contents, open one file</text>
    <text x="130" y="268" style="fill:var(--color-muted);font-size:11.5px">the ringed chunks are what comes back</text>
    <text x="390" y="268" style="fill:var(--color-muted);font-size:11.5px">pick a branch, then a section</text>
  </g>
</svg>

*The same job done two ways. Left: the nearest chunks win. Right: the model chooses a branch at each
level, for a reason it can say out loud.*

The best-known version is PageIndex, an open-source project from Vectify AI under the MIT license.
Its README describes the two steps plainly: build a tree index for each document, then have a language
model search that tree and read the pages it lands on. Its stated complaint about vectors is the one
above, that similarity is not relevance, plus a second one: you cannot see why a chunk was chosen.

PageIndex also publishes a number. It reports 98.7 percent accuracy on FinanceBench, a benchmark of
questions about financial filings, against 50 percent for vector RAG in its own chart. Treat that as a
claim and not a result. It is self-reported by the people selling the product, the README does not
name the vector system it beat, and I have not run the evaluation. Its write-up and evaluation repo
are linked at the end for anyone who wants to. The same README is honest about a limit: the
open-source mode reads text-based PDFs only, and scanned files need the paid cloud version.

A close cousin is plain agentic search, where there is no index at all and the model searches with
ordinary tools. This is what Claude Code does. In a Latent Space interview in May 2025, Boris Cherny,
who leads Claude Code, said early versions used off-the-shelf RAG with Voyage embeddings, and that
"eventually, we landed on just agentic search as the way to do stuff," meaning glob, grep and file
reads. His reasons were practical. An index has to be built, the code drifts out of sync with it, and
the index has to live somewhere, which brings its own security questions.

That is three different answers to the same box in the first figure. Vectors pick by distance.
PageIndex reasons over a tree it built ahead of time. Claude Code searches live with no index. Mine is
closest to the second, with the tree written by hand.

## I thought I was just being tidy

None of this started as retrieval. It started because I am disorganized and the AI is not, and I
needed it to find things without me standing there pointing.

Every repo I work in opens with a CLAUDE.md, and the harness loads it before anything else happens.
The one in this portfolio has a section called *Start here*, and it is a numbered reading order. The
philosophy first. Then the intake skill, for when someone pastes me a brief. Then voice, figures, the
note standard, the README standard, the code graph, the content backlog, the plan. Ten entries, each a
line saying what the thing is and when to open it.

That is a table of contents. I wrote it as onboarding for a new teammate, and the model reads it
exactly the way PageIndex's model reads its tree. It looks at the headings and decides which branch to
open.

> I was not building a retrieval system. I was writing a table of contents for a reader who reads
> every word and remembers none of it tomorrow.

## The whole tree, one layer at a time

Once I saw the root, the rest of the tree was obvious, because I had built every layer of it for some
other reason.

**The standards are the named sections.** Twenty-nine of them are mounted into each session as skills
(a snapshot, since the number grows): voice, figures, the note standard, the loop, the graph, and the
rest. Each one opens with a short frontmatter field called *when*, and that field becomes the skill's
description. Until the model decides to open a standard, the description is all it sees. The rules for
the standards folder say it flatly: the description "is the only thing an agent reads when deciding
whether to open the file at all." That is a node summary in a section tree. I wrote a whole contract
for how to word it (start with "Read this BEFORE", spell out the literal words a real prompt will
contain) without knowing I was tuning a retrieval index.

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
own. A subtree loads when the session first reads a file inside it. That happened the first time I
drafted this note. The session opened the note standard, and the standards folder's rules arrived with
it, unasked. Nobody searched for them. They were on the branch.

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

## One question, walked down the tree

Here is the path for a real question: can I put a backtick in a note? I traced it by hand with the
index tool rather than from a captured log, so read it as the route the setup allows, not a recording.

<svg viewBox="0 0 520 360" width="100%" role="img"
     aria-label="One question walked down the tree, top to bottom. The question: can I put a backtick in a note. The reading order in CLAUDE.md points at the voice standard for prose in my name. The voice skill description says to read it before writing any prose that carries my byline. The standards index lists the voice standard's sections. The session opens only the punctuation section, lines 159 to 194 of 677, and finds the answer: no, not in prose."
     style="display:block;width:100%;max-width:520px;height:auto;margin:0 auto 1.5rem;
            font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-vectorless2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="95" y="16" width="330" height="48" rx="6"/>
    <rect x="95" y="86" width="330" height="48" rx="6"/>
    <rect x="95" y="156" width="330" height="48" rx="6"/>
    <rect x="95" y="226" width="330" height="48" rx="6"/>
  </g>
  <rect x="95" y="296" width="330" height="48" rx="6"
        style="fill:var(--color-fg);stroke:var(--color-fg)"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="260" y1="64" x2="260" y2="84" marker-end="url(#fl-vectorless2)"/>
    <line x1="260" y1="134" x2="260" y2="154" marker-end="url(#fl-vectorless2)"/>
    <line x1="260" y1="204" x2="260" y2="224" marker-end="url(#fl-vectorless2)"/>
    <line x1="260" y1="274" x2="260" y2="294" marker-end="url(#fl-vectorless2)"/>
  </g>
  <g text-anchor="middle">
    <text x="260" y="37" style="fill:var(--color-fg)">Can I put a backtick in a note?</text>
    <text x="260" y="55" style="fill:var(--color-muted);font-size:11.5px">the question</text>
    <text x="260" y="107" style="fill:var(--color-fg)">CLAUDE.md, Start here</text>
    <text x="260" y="125" style="fill:var(--color-muted);font-size:11.5px">voice is the standard for prose in my name</text>
    <text x="260" y="177" style="fill:var(--color-fg)">The skill description for voice</text>
    <text x="260" y="195" style="fill:var(--color-muted);font-size:11.5px">read before any prose with my byline</text>
    <text x="260" y="247" style="fill:var(--color-fg)">The standards index for voice</text>
    <text x="260" y="265" style="fill:var(--color-muted);font-size:11.5px">lists the sections, one of them punctuation</text>
    <text x="260" y="317" style="fill:var(--color-bg)">Open lines 159 to 194 of 677</text>
    <text x="260" y="335" style="fill:var(--color-bg);font-size:11.5px">answer: no, not in prose</text>
  </g>
</svg>

*Five stops, and the last one reads thirty-six lines.*

The numbers are the point, so here they are. A session that opened the voice standard whole would read
49,431 characters. A session that opens only the section it needs reads 2,848. And the library the
tree sits on top of, every standard whole, is 494,868. These are snapshots of today's files.

<svg viewBox="0 0 620 262" width="100%" role="img"
     aria-label="Characters a session reads, by approach, on a linear scale. Every standard read whole: 494,868. The voice standard read whole: 49,431. The 29 skill descriptions every session carries: 14,315. The one section the question needed: 2,848, a bar too thin to see much of. The point: one answer cost 2,848 characters of reading plus the descriptions every session carries."
     style="max-width:560px;height:auto;font-family:Georgia,'Times New Roman',serif;
            --paper:#faf7f1;--edge:#e6ddd0;--ink:#2b2b2b;--muted:#6b6259;--bar:#cbc1b3;--accent:#d97757"
     xmlns="http://www.w3.org/2000/svg">
  <rect x="0.5" y="0.5" width="619" height="261" style="fill:var(--paper);stroke:var(--edge)"/>
  <text x="28" y="30" style="fill:var(--muted);font-size:15px">Characters read to answer one question</text>
  <text x="28" y="62" style="fill:var(--ink);font-size:14px">Every standard, read whole</text>
  <rect x="28" y="68" width="470" height="14" style="fill:var(--bar)"/>
  <text x="506" y="80" style="fill:var(--muted);font-size:12.5px">494,868</text>
  <text x="28" y="108" style="fill:var(--ink);font-size:14px">The voice standard, read whole</text>
  <rect x="28" y="114" width="47" height="14" style="fill:var(--bar)"/>
  <text x="83" y="126" style="fill:var(--muted);font-size:12.5px">49,431</text>
  <text x="28" y="154" style="fill:var(--ink);font-size:14px">The 29 descriptions every session carries</text>
  <rect x="28" y="160" width="14" height="14" style="fill:var(--ink)"/>
  <text x="50" y="172" style="fill:var(--muted);font-size:12.5px">14,315</text>
  <text x="28" y="200" style="fill:var(--ink);font-size:14px">The one section this question needed</text>
  <rect x="28" y="206" width="3" height="14" style="fill:var(--ink)"/>
  <text x="39" y="218" style="fill:var(--muted);font-size:12.5px">2,848</text>
  <text x="28" y="248" style="fill:var(--accent);font-size:13px">One answer: 2,848 characters, on top of the descriptions.</text>
</svg>

*Same scale on every bar. A snapshot of 2026-11-26, counted from the repo.*

Read that chart with its own caveat attached. The tree is not free: those 14,315 characters of
descriptions ride along in every session, whether the task needs them or not. What the tree buys is
that the expensive part, the standards themselves, is read one section at a time.

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

Every drill-down is a read. A session spends its first turns walking CLAUDE.md, then a skill, then the
file the skill points at, before it has done any work. That is cheap on a small question and silly on
a trivial one.

The tree has to fit. All twenty-nine skill descriptions load into every session, and they work because
they are short. At a few hundred they would not, and I would be paying for a table of contents longer
than the chapter I came for. PageIndex's README makes the same point from the other side, since its
whole pitch depends on the tree being small enough for the model to hold.

And some of what I have is not a tree. There are 37 notes in this folder as of today, counting this
one. There are run reports and finished plans piling up in their own folders. None of them has a table
of contents a model could walk. When a session needs to know whether I have already written about
something, the only tools it has are grep and my memory, and my memory is the reason this whole setup
exists.

That flat pile is where similarity earns its place, which is why I expect production systems to end up
hybrid. I have not built that half. It is a guess about what I will need, and I am labelling it one.

## Which one to reach for

This is my read, not a benchmark. Nobody has run these head to head on my files, and the one number I
quoted above is the vendor's own.

| Your pile | Reach for | Why |
|---|---|---|
| Under about 200,000 tokens, roughly 500 pages | Paste it all and skip retrieval | Anthropic's own rule of thumb, and caching makes it cheap |
| Long documents with real headings: manuals, filings, contracts, a standards folder | A tree the model reads | The structure already says where things are |
| A big flat pile of short items: tickets, notes, chat logs | Vectors, with keyword search beside them | There are no headings to walk |
| A code repository | Let the model search it live with grep and read files | What Claude Code settled on |

## What landed since the first draft

The first draft of this note listed three pieces of work as in flight. Two have landed, and one has
half landed.

- **A standards index** landed on 2026-11-17. It is a tool that lists every standard with the sections
  inside it, 31 standards and 279 sections today, so a session reads one section by name instead of
  the whole file. The question walk above runs on it.
- **A staleness check** landed the same day. It warns at session start when a skill or the code graph is
  behind its source. It fired at the start of the session that revised this note: one of the 29 skills
  was behind, and the graph predated the repo's own extraction. The model trusts a heading the way I
  trust a street sign, so a tree pointing at a file that changed underneath it is worse than no tree.
- **A retrieval trace** is half done. A run report from 2026-11-21 carries a section listing which files
  the session read. That is the receipt I wanted, with a catch: the session writes it, and no tool
  captures it. It is a claim a session makes about itself.

The flat pile of notes is still flat.

## The name was the only part missing

I would still describe all of this as "I keep good docs," and I would still be telling the truth. Good
docs, written for a reader who reads every word and forgets them by tomorrow, turn out to be a
retrieval system with the serial numbers filed off. Other people gave it a name, a benchmark and a
GitHub repository.

The table of contents was already there.

## Sources

What the claims above rest on, and what I did and did not check.

- Patrick Lewis and colleagues, [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401), NeurIPS 2020. The paper that named RAG.
- Anthropic, [Introducing Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval), 2024-09-19. The 200,000 token rule and the 5.7 to 1.9 percent figures. I read the page, and I did not reproduce the results.
- Vectify AI, [PageIndex](https://github.com/VectifyAI/PageIndex). The README is what I read. The FinanceBench claim links to a [write-up](https://vectify.ai/blog/Mafin2.5) and an [evaluation repo](https://github.com/VectifyAI/Mafin2.5-FinanceBench) that I did not open.
- Boris Cherny on [Latent Space](https://www.latent.space/p/claude-code), 2025-05-07. The agentic search passage is about forty-five minutes into the transcript, and I checked the quoted words against it.
- The name "vectorless RAG" reached me through a LinkedIn post by Shivani Virdi, and it is why I went looking. Nothing above rests on it.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
