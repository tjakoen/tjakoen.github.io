---
title: "How My Sessions Walk the Tree: graphify, tokensave and PANTRY"
audience: [build]
level: deep
companion: true
subtitle: "How a session steps through skills, two code graphs and a project index to reach one section instead of a whole file."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-11-26
readingTime: "~6 min"
tags: [ai, retrieval, tooling, graphify, tokensave, pantry]
summary: >
  The tool-by-tool half of the retrieval behind my AI loop: the usual similarity steps drawn out, each layer of
  the tree my sessions walk, a decision chain for what to build, and what has landed since the first
  draft.
---

> The companion to [My AI Loop Runs on Vectorless RAG and I Didn't Call It That](vectorless-rag-by-accident.md).
> Read that one first. This is the part for the reader who wants to see how it is wired.

## The usual way, step by step

The lead note describes similarity retrieval in a paragraph. Here it is in three steps: chop, turn into
numbers, fetch the nearest.

<svg viewBox="0 0 520 210" width="100%" role="img"
     aria-label="Retrieval by similarity in three steps, left to right. Step one, chop: each document is cut into chunks of a few paragraphs. Step two, turn into numbers: each chunk becomes a list of numbers, built so that chunks with similar meaning get similar lists. Step three, fetch the nearest: the question is turned into numbers the same way, and the few chunks closest to it come back."
     style="display:block;width:100%;max-width:520px;height:auto;margin:0 auto 1.5rem;
            font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-vectorless3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="10" y="40" width="150" height="130" rx="6"/>
    <rect x="185" y="40" width="150" height="130" rx="6"/>
    <rect x="360" y="40" width="150" height="130" rx="6"/>
    <rect x="28" y="56" width="114" height="18" rx="3"/>
    <rect x="28" y="80" width="114" height="18" rx="3"/>
    <rect x="28" y="104" width="114" height="18" rx="3"/>
    <rect x="28" y="128" width="114" height="18" rx="3"/>
  </g>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="160" y1="105" x2="183" y2="105" marker-end="url(#fl-vectorless3)"/>
    <line x1="335" y1="105" x2="358" y2="105" marker-end="url(#fl-vectorless3)"/>
  </g>
  <g style="fill:none;stroke:var(--color-muted);stroke-width:1.2">
    <circle cx="385" cy="70" r="3.5"/><circle cx="485" cy="68" r="3.5"/><circle cx="490" cy="135" r="3.5"/>
    <circle cx="465" cy="158" r="3.5"/><circle cx="395" cy="152" r="3.5"/><circle cx="380" cy="110" r="3.5"/>
  </g>
  <circle cx="435" cy="105" r="34" style="fill:none;stroke:var(--color-fg);stroke-width:1.2;stroke-dasharray:5 4"/>
  <g style="fill:var(--color-fg)">
    <circle cx="418" cy="92" r="3.8"/><circle cx="452" cy="96" r="3.8"/><circle cx="430" cy="126" r="3.8"/>
  </g>
  <circle cx="435" cy="105" r="5" style="fill:var(--color-bg);stroke:var(--color-fg);stroke-width:2"/>
  <g text-anchor="middle" style="font-size:11.5px">
    <text x="85" y="69" style="fill:var(--color-muted)">chunk 1</text>
    <text x="85" y="93" style="fill:var(--color-muted)">chunk 2</text>
    <text x="85" y="117" style="fill:var(--color-muted)">chunk 3</text>
    <text x="85" y="141" style="fill:var(--color-muted)">chunk 4</text>
    <text x="260" y="69" style="fill:var(--color-fg)">0.12  -0.40  0.77 ...</text>
    <text x="260" y="93" style="fill:var(--color-fg)">0.09  -0.35  0.80 ...</text>
    <text x="260" y="117" style="fill:var(--color-muted)">-0.51  0.22  0.04 ...</text>
    <text x="260" y="141" style="fill:var(--color-muted)">0.60  0.31  -0.18 ...</text>
    <text x="85" y="192" style="fill:var(--color-muted)">a few paragraphs each</text>
    <text x="260" y="192" style="fill:var(--color-muted)">similar meaning, similar numbers</text>
    <text x="435" y="192" style="fill:var(--color-muted)">the closest few come back</text>
  </g>
  <g text-anchor="middle">
    <text x="85" y="24" style="fill:var(--color-fg)">1. Chop</text>
    <text x="260" y="24" style="fill:var(--color-fg)">2. Turn into numbers</text>
    <text x="435" y="24" style="fill:var(--color-fg)">3. Fetch the nearest</text>
  </g>
</svg>

*The usual way, start to finish. The numbers are called an embedding, and a vector database stores
them. The ringed dots are the chunks that go into the prompt.*

The numbers are positions on a very large map, and close on the map means close in meaning. That is
what makes the next section different: a tree gives up that map and gets a reason in return.

## The tree, one layer at a time

**The standards are the named sections.** Each session gets 29 of them as skills, among them
[voice](/standards/voice), [figures](/standards/figures) and the [note standard](/standards/note-standard).
(That is a snapshot, since the number grows.)

Every skill carries one line of description, and that line is all the model sees until it opens the
file. So I wrote the lines to do one job: say when to read it. Nearly all of them start with "Read this
BEFORE". That is a node summary in a section tree, and I was tuning it without knowing it was a
retrieval index.

The tree has taught me one classic lesson already. My loop standard shared a name with a built-in
skill, and mine was shadowed without a sound. In a vector store a duplicate title is a non-event. In a
tree it means one branch can never be picked.

**PANTRY mounts them.** The standards live once, in this repo's standards folder. PANTRY mounts them as
skills in the other repos, so a session in GRAIN reads the same sections as one here. The mount is a
sync I still run by hand, which means a repo I forgot is reading last week's tree.

**Every folder carries its own subtree.** The standards folder has its own CLAUDE.md, and a subtree
loads when a session first reads a file inside it. That happened while I drafted this note. The session
opened the note standard and the standards folder's rules arrived with it, unasked. They were on the
branch.

## graphify and tokensave index the code

Two tools index the code, and neither ranks by closeness. [graphify](https://github.com/safishamsi/graphify)
reads the repo by static analysis, with no model, and writes a graph with a node for each function,
file and Markdown heading. Here that is about 6,400 nodes and 7,500 edges.
[tokensave](https://github.com/aovestdipaperino/tokensave) keeps a code-only graph in a database that
the session queries through tools: find a symbol, ask who calls it, ask what a change would touch. Here
it holds about 10,700 nodes and 5,450 edges over 2,455 files, and a re-sync after an edit took under a
second. (Snapshots from 2026-11-26.)

<svg viewBox="0 0 520 300" width="100%" role="img"
     aria-label="Two code indexes answering questions about the standards index tool. On the left, graphify returns a neighborhood: a hub node, the file standards-index.ts, linked to six function nodes called toc, read, find, buildIndex, summarize and indexStandard, plus one dashed stray node, the site's SEO file, that has nothing to do with the question. 31 nodes within two hops in all. On the right, tokensave returns a call chain: two test callers, a fixture and a folder test, both call buildIndex, drawn in ink, which calls one function, indexStandard."
     style="display:block;width:100%;max-width:520px;height:auto;margin:0 auto 1.5rem;
            font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-vectorless4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <line x1="262" y1="10" x2="262" y2="285" style="stroke:var(--color-line);stroke-width:1"/>
  <g style="stroke:var(--color-line);stroke-width:1;fill:none">
    <line x1="100" y1="106" x2="60" y2="70"/><line x1="130" y1="106" x2="130" y2="70"/>
    <line x1="160" y1="106" x2="200" y2="70"/>
    <line x1="100" y1="134" x2="48" y2="170"/><line x1="130" y1="134" x2="122" y2="170"/>
    <line x1="160" y1="134" x2="205" y2="170"/>
    <line x1="190" y1="120" x2="205" y2="120" style="stroke-dasharray:3 3"/>
  </g>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="33" y="48" width="54" height="22" rx="4"/>
    <rect x="103" y="48" width="54" height="22" rx="4"/>
    <rect x="173" y="48" width="54" height="22" rx="4"/>
    <rect x="11" y="170" width="74" height="22" rx="4"/>
    <rect x="89" y="170" width="66" height="22" rx="4"/>
    <rect x="163" y="170" width="84" height="22" rx="4"/>
    <rect x="205" y="108" width="50" height="24" rx="4" style="stroke-dasharray:4 3"/>
  </g>
  <rect x="70" y="106" width="120" height="28" rx="5" style="fill:none;stroke:var(--color-fg);stroke-width:1.5"/>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="280" y="50" width="100" height="26" rx="5"/>
    <rect x="400" y="50" width="100" height="26" rx="5"/>
    <rect x="320" y="210" width="140" height="30" rx="5"/>
  </g>
  <rect x="330" y="130" width="120" height="30" rx="5" style="fill:var(--color-fg);stroke:var(--color-fg)"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="330" y1="76" x2="368" y2="128" marker-end="url(#fl-vectorless4)"/>
    <line x1="450" y1="76" x2="412" y2="128" marker-end="url(#fl-vectorless4)"/>
    <line x1="390" y1="160" x2="390" y2="208" marker-end="url(#fl-vectorless4)"/>
  </g>
  <g text-anchor="middle" style="font-size:11.5px">
    <text x="60" y="63" style="fill:var(--color-fg)">toc()</text>
    <text x="130" y="63" style="fill:var(--color-fg)">read()</text>
    <text x="200" y="63" style="fill:var(--color-fg)">find()</text>
    <text x="130" y="124" style="fill:var(--color-fg)">standards-index.ts</text>
    <text x="230" y="124" style="fill:var(--color-muted)">seo.ts</text>
    <text x="48" y="185" style="fill:var(--color-fg)">buildIndex()</text>
    <text x="122" y="185" style="fill:var(--color-fg)">summarize()</text>
    <text x="205" y="185" style="fill:var(--color-fg)">indexStandard()</text>
    <text x="330" y="67" style="fill:var(--color-fg)">fixture (test)</text>
    <text x="450" y="67" style="fill:var(--color-fg)">folder test</text>
    <text x="390" y="149" style="fill:var(--color-bg)">buildIndex()</text>
    <text x="390" y="229" style="fill:var(--color-fg)">indexStandard()</text>
    <text x="130" y="272" style="fill:var(--color-muted)">31 nodes within two hops</text>
    <text x="130" y="288" style="fill:var(--color-muted)">dashed: a stray, not an answer</text>
    <text x="390" y="272" style="fill:var(--color-muted)">who calls it, what it calls</text>
    <text x="390" y="288" style="fill:var(--color-muted)">small and exact</text>
  </g>
  <g text-anchor="middle">
    <text x="130" y="24" style="fill:var(--color-fg)">graphify: a neighborhood</text>
    <text x="390" y="24" style="fill:var(--color-fg)">tokensave: a call chain</text>
  </g>
  <g style="fill:var(--color-muted);font-size:11.5px;stroke:var(--color-bg);stroke-width:3;paint-order:stroke">
    <text x="398" y="188">calls</text>
  </g>
</svg>

*The same question, asked of both: where does the standards index live and what touches it. These are
real answers from today's repo, trimmed to the interesting nodes.*

Both fail honestly. Ask graphify with a partial name and it says it found no matching nodes, a lookup
refusing to guess where a vector store would have handed back something close. So the rule is to ask
with names the code contains, never with a description of an idea. A hook refreshes graphify after every
edit in a few seconds, and nothing in the loop calls a model.

I measured the limits in August 2026. graphify does not node methods or non-exported functions, so
checking my docs against it flagged 7 symbols, 3 of them truly dead, about 43 percent precision. Labels
collide, and a graph of one repo cannot see the symbols of its siblings, so PANTRY builds a merged one.
A neighborhood is a lead, never a verdict.

My global rule for which tool gets which question:

| The question | Goes to | What kind of retrieval |
|---|---|---|
| Where is this defined, what calls it, what would a change touch | tokensave | An exact lookup, no similarity |
| How do the modules, docs and plans connect | graphify, or PANTRY's map | A walk over a structure |
| Where does this literal string appear | grep | Exact text |
| How do I work in this repo | CLAUDE.md, the skills, PANTRY's index | Read the contents page |

## PANTRY is the project's contents page

CLAUDE.md says how to work. It does not say what is going on in the project today. That is
[PANTRY](/pantry), the app I run beside the chat: one small server that serves a project's plan board,
its docs, a map of the codebase and some machine-readable pages for an agent. It runs no model of its
own.

A session's first call is to PANTRY. It returns a short brief (what is in flight, what waits on me, what
drifted) and then an index file, llms.txt: a Markdown list with one line and one link for every plan,
document, standard and run. That is 18,203 characters here today, built by a program from files I wrote
anyway. It has the same shape as CLAUDE.md, one level up. After that a session asks for one named
surface, such as the map, the run ledger or token use by plan, and leaves the rest closed.

PANTRY is also where I find out the tree went stale. Its check at the start of this session reported
that the merged graph was older than the repo's own extraction and that two mounted skills were behind
their source.

## One question, walked down the tree

Here is the path for one real question: can I put a backtick in a note? I traced it by hand with the
standards index rather than from a log, so read it as the route the setup allows.

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

The [lead note](vectorless-rag-by-accident.md) puts the cost of that walk against the whole file: 5.8
percent of the voice standard, 94 percent never read.

## Which one to reach for

My read, not a benchmark. Nobody has run these head to head on my files, and the one benchmark number
I quoted in the lead note is a vendor's own.

<svg viewBox="0 0 520 320" width="100%" role="img"
     aria-label="A decision chain for what to build, top to bottom, with answers to the right. Does it fit in the prompt, under about 500 pages? Yes: paste it all and skip retrieval. No: is it code? Yes: let the model search it live with grep and read files. No: does it have real headings, like manuals, filings and standards? Yes: a tree the model reads, drawn in ink. No: vectors, with keyword search beside them."
     style="display:block;width:100%;max-width:520px;height:auto;margin:0 auto 1.5rem;
            font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-vectorless5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="20" y="16" width="230" height="48" rx="6"/>
    <rect x="20" y="96" width="230" height="48" rx="6"/>
    <rect x="20" y="176" width="230" height="48" rx="6"/>
    <rect x="300" y="16" width="200" height="48" rx="6"/>
    <rect x="300" y="96" width="200" height="48" rx="6"/>
    <rect x="20" y="256" width="230" height="48" rx="6"/>
  </g>
  <rect x="300" y="176" width="200" height="48" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg)"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="250" y1="40" x2="298" y2="40" marker-end="url(#fl-vectorless5)"/>
    <line x1="250" y1="120" x2="298" y2="120" marker-end="url(#fl-vectorless5)"/>
    <line x1="250" y1="200" x2="298" y2="200" marker-end="url(#fl-vectorless5)"/>
    <line x1="135" y1="64" x2="135" y2="94" marker-end="url(#fl-vectorless5)"/>
    <line x1="135" y1="144" x2="135" y2="174" marker-end="url(#fl-vectorless5)"/>
    <line x1="135" y1="224" x2="135" y2="254" marker-end="url(#fl-vectorless5)"/>
  </g>
  <g text-anchor="middle">
    <text x="135" y="37" style="fill:var(--color-fg)">Does it fit in the prompt?</text>
    <text x="135" y="55" style="fill:var(--color-muted);font-size:11.5px">under about 500 pages</text>
    <text x="135" y="117" style="fill:var(--color-fg)">Is it code?</text>
    <text x="135" y="135" style="fill:var(--color-muted);font-size:11.5px">a repository</text>
    <text x="135" y="197" style="fill:var(--color-fg)">Does it have real headings?</text>
    <text x="135" y="215" style="fill:var(--color-muted);font-size:11.5px">manuals, filings, standards</text>
    <text x="135" y="277" style="fill:var(--color-fg)">Vectors</text>
    <text x="135" y="295" style="fill:var(--color-muted);font-size:11.5px">with keyword search beside them</text>
    <text x="400" y="37" style="fill:var(--color-fg)">Paste it all</text>
    <text x="400" y="55" style="fill:var(--color-muted);font-size:11.5px">skip retrieval</text>
    <text x="400" y="117" style="fill:var(--color-fg)">Search it live</text>
    <text x="400" y="135" style="fill:var(--color-muted);font-size:11.5px">grep, read files</text>
    <text x="400" y="197" style="fill:var(--color-bg)">A tree the model reads</text>
    <text x="400" y="215" style="fill:var(--color-bg);font-size:11.5px">the headings say where</text>
  </g>
  <g text-anchor="middle" style="fill:var(--color-muted);font-size:12px;
       stroke:var(--color-bg);stroke-width:3;paint-order:stroke">
    <text x="274" y="33">yes</text>
    <text x="274" y="113">yes</text>
    <text x="274" y="193">yes</text>
    <text x="150" y="84" text-anchor="start">no</text>
    <text x="150" y="164" text-anchor="start">no</text>
    <text x="150" y="244" text-anchor="start">no</text>
  </g>
</svg>

*Where a pile of documents lands. The ink box is where my own setup sits.*

## What landed since the first draft

The first draft listed three pieces of work as in flight. Two landed on 2026-11-17 and one is half done.

- **A standards index.** A tool lists every standard with its sections, 31 standards and 279 sections
  today, so a session reads one section by name. The walk above runs on it.
- **A staleness check.** It warns at session start when a skill or the graph is behind its source, which
  is the warning PANTRY showed me this morning. A tree pointing at a file that changed underneath it is
  worse than no tree.
- **A retrieval trace, half done.** A run report from 2026-11-21 lists the files the session read, with
  a catch: the session writes it and no tool captures it, so it is a claim a session makes about
  itself. A mechanical version is an idea and not a build.

## Sources

What the figures above rest on.

- [graphify](https://github.com/safishamsi/graphify), [tokensave](https://github.com/aovestdipaperino/tokensave) and [PANTRY](/pantry). The figures are counted from my own repository, my own tokensave and my own running PANTRY on 2026-11-26, and the August figures are from my notes on measuring graphify. None of them comes from a vendor.
- The research behind the explainer, with the RAG paper, Anthropic's contextual retrieval, PageIndex and the Cherny interview, is listed in the [lead note](vectorless-rag-by-accident.md).

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
