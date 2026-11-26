---
title: "My AI Loop Runs on Vectorless RAG and I Didn't Call It That"
audience: [build]
level: intro
subtitle: "I build with an AI loop, and the loop only works if a session that remembers nothing can find the right file by itself. That finding step is retrieval. Mine reads a table of contents instead of a vector index, and it is why the loop runs on so little effort from me."
author: "Tjakoen Stolk"
status: PUBLISHED
type: note
date: 2026-11-26
readingTime: "~10 min"
tags: [ai, rag, retrieval, standards, tooling]
people: [shivani-virdi]
sources: [book-vectorless-rag-post]
summary: >
  I build with an AI loop that starts blank every session, so it needs a way to find the one file that
  applies. In plain words, vectorless RAG means building your agent a map so it finds things on its own,
  and that is what mine does: the model reads a table of contents,
  picks a branch and opens one section, where most RAG systems pick pages by vector similarity. It works
  the same for Claude, Codex and OpenCode through one CLAUDE.md linked as AGENTS.md, with skills, two
  code indexes and PANTRY's project index below it. It is why I steer and review instead of briefing.
  It is traceable, it costs extra reads, and my 38 notes still have no tree.
social: |
  I build with an AI loop, and it starts blank every session. So it needs a way to find the one file
  that applies. I called that keeping good docs. It turns out to be vectorless RAG.

  RAG means the AI looks things up before it answers. Most setups chop the documents into chunks, turn
  them into numbers and fetch whatever sits nearest the question. In plain words, vectorless RAG means
  building your agent a map, a table of contents, and letting it find things on its own.

  Mine is one file, CLAUDE.md, linked as AGENTS.md so Claude, Codex and OpenCode all read the same one.
  A question about my voice rules read 36 lines of a 677-line file.

  That is what keeps the loop cheap to run. I no longer brief a session or carry state between them. I
  steer and review.

  The name came from Shivani Virdi's post on vectorless RAG. Thank you, @Shivani Virdi.

  #RAG #AIAgents #ClaudeCode #AgenticAI
socialImage:
  - "/media/notes/vectorless-rag-by-accident-social-1-finding.png"
  - "/media/notes/vectorless-rag-by-accident-social-2-setup.png"
  - "/media/notes/vectorless-rag-by-accident-social-3-effort.png"
socialImageAlt:
  - "Card one of three, how my AI loop finds the right page. Two panels side by side. Vectors, the usual way: a scatter of dots with a ring around the nearest few, and three steps: chop documents into chunks, turn chunks into numbers, fetch the nearest few. Vectorless, the way my loop runs: a small tree with one path drawn in ink down to a filled leaf, and three steps: write a contents page, the model picks a branch, it opens that one section. Below: in plain words, build your AI a map, then let it find things; my loop starts blank every session and I run the right-hand kind."
  - "Card two of three, one contents page and three AI tools. Claude, Codex and OpenCode read the same file. A box for CLAUDE.md, linked as AGENTS.md, with four branches below it: skills, 29 with one line each; code graphs, graphify and tokensave; PANTRY, the project index; and a CLAUDE.md per folder. One path in ink runs from skills to a filled box, one section, 36 of 677 lines. The loop walks down and reads only what the question needs. That is the whole trick, no vector database."
  - "Card three of three, so I stopped briefing the loop. It reads a table of contents instead. Three outcomes: no briefing, one line of what I want; no carrying state, a resume card in the plan that any of the three tools picks up; no guessing, when it is wrong I ask which file it read and the answer is a path. Under them a bar for the whole 677-line file with one narrow band lit in ink. One question about my voice rules read 36 lines. Vectorless RAG for my AI loop, a name that came from Shivani Virdi."
---

I build with an AI loop. A session starts blank, orients itself, picks up a plan, does the work,
checks it and leaves a note for the next session, whether the session is Claude, Codex or OpenCode.
The loop only works if a session that remembers nothing can find the one file that applies, out of
thirty-odd standards, without me standing there pointing.

For months I called that keeping good docs. The AI world calls it vectorless RAG, a name I met in a
[LinkedIn post](https://www.linkedin.com/posts/shivanivirdi_everyone-thinks-rag-chunking-embeddings-share-7527002415418732544-54j2/)
by [Shivani Virdi](/people#shivani-virdi). This note covers what it is and why it makes my loop cheap
and good to run. The tool-by-tool setup lives in a [companion note](how-my-sessions-walk-the-tree.md).

## The short version

The name is bigger than the idea. Vectorless RAG means pointing your agent in the right direction. You
build it a map, a contents page that says what lives where, and it uses the map to find what it needs
on its own.

<svg viewBox="0 0 520 262" width="100%" role="img"
     aria-label="Two pictures side by side. Without a map: a scatter of nine document boxes with an agent below them, marked with a question mark, reaching for a few at random. With a map: the agent reads a map, drawn in ink and labelled what is where, and the map points to the one document it needs, out of four, which is outlined in ink."
     style="display:block;width:100%;max-width:520px;height:auto;margin:0 auto 1.5rem;
            font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-vectorless7" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <line x1="260" y1="10" x2="260" y2="240" style="stroke:var(--color-line);stroke-width:1"/>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="42" y="44" width="36" height="26" rx="3"/><rect x="102" y="38" width="36" height="26" rx="3"/>
    <rect x="164" y="50" width="36" height="26" rx="3"/><rect x="62" y="96" width="36" height="26" rx="3"/>
    <rect x="132" y="90" width="36" height="26" rx="3"/><rect x="194" y="102" width="36" height="26" rx="3"/>
    <rect x="42" y="144" width="36" height="26" rx="3"/><rect x="112" y="140" width="36" height="26" rx="3"/>
    <rect x="178" y="148" width="36" height="26" rx="3"/>
  </g>
  <g style="stroke:var(--color-muted);stroke-width:1.2;stroke-dasharray:4 4;fill:none">
    <line x1="122" y1="204" x2="64" y2="172"/><line x1="130" y1="202" x2="150" y2="168"/>
    <line x1="140" y1="206" x2="196" y2="176"/>
  </g>
  <circle cx="130" cy="218" r="16" style="fill:none;stroke:var(--color-fg);stroke-width:1.5"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="318" y1="140" x2="343" y2="140" marker-end="url(#fl-vectorless7)"/>
    <line x1="417" y1="140" x2="458" y2="126" marker-end="url(#fl-vectorless7)"/>
  </g>
  <circle cx="300" cy="140" r="16" style="fill:none;stroke:var(--color-fg);stroke-width:1.5"/>
  <rect x="345" y="112" width="72" height="56" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg)"/>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="460" y="70" width="40" height="26" rx="3"/><rect x="460" y="154" width="40" height="26" rx="3"/>
    <rect x="460" y="196" width="40" height="26" rx="3"/>
  </g>
  <rect x="460" y="112" width="40" height="26" rx="3" style="fill:none;stroke:var(--color-fg);stroke-width:2.5"/>
  <g text-anchor="middle">
    <text x="130" y="24" style="fill:var(--color-fg)">Without a map</text>
    <text x="390" y="24" style="fill:var(--color-fg)">With a map</text>
    <text x="130" y="223" style="fill:var(--color-fg)">?</text>
    <text x="300" y="168" style="fill:var(--color-muted);font-size:11.5px">agent</text>
    <text x="381" y="137" style="fill:var(--color-bg)">map</text>
    <text x="381" y="154" style="fill:var(--color-bg);font-size:11px">what is where</text>
    <text x="130" y="254" style="fill:var(--color-muted);font-size:12px">guesses through the pile</text>
    <text x="390" y="254" style="fill:var(--color-muted);font-size:12px">reads the map, opens one file</text>
  </g>
</svg>

*Left: the agent guesses through a pile. Right: it reads the map and opens the one file it needs.*

## What RAG is

A language model knows what it learned in training and what is in the prompt right now. It has never
seen your syllabus, your wiki or your repository, so if you ask about them it guesses, fluently, which
is the worst way to be wrong.

Pasting a document into a chat and asking about it is RAG by hand. Retrieval-augmented generation
automates the pasting: a program picks the pages most likely to hold the answer, puts them in the prompt
beside your question, and the model answers from them. The name comes from a
[2020 paper](https://arxiv.org/abs/2005.11401) by Patrick Lewis and colleagues.  

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

Support bots search help centers, company assistants search wikis, coding assistants search
repositories. Mine is an AI loop that builds software, so it searches my standards, plans and code.
That is retrieval for an agent that works, not for a chatbot that answers, so it has to be right at the
start of every session with nobody watching.

## Two ways to pick the pages

**The usual way is to find what looks similar.** Cut the documents into chunks, turn each chunk into a
list of numbers so that similar meaning gives similar numbers, turn the question into numbers the same
way, and fetch the nearest chunks. That works even when the question and the answer share no words. The
weakness is that close in meaning is not the same as the right page: a question about this year's
revenue sits near every paragraph about revenue, last year's included. When the answer is wrong, the
reason is a distance between two lists of numbers. The
[companion](how-my-sessions-walk-the-tree.md#the-usual-way-step-by-step) draws the steps.

**The other way is to read the contents page.** You give the model a tree of sections, each with a title
and a short summary. It reads the top, picks a branch, and keeps going until it reaches the page with the
answer. No embeddings, no vector database.

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
    <line x1="390" y1="134" x2="350" y2="178"/>
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

Two real versions exist. PageIndex, an open-source project, builds the tree for you. Claude Code skips
the index and searches live with glob, grep and file reads. Mine is closest to PageIndex, with the tree
written by hand. The [companion](how-my-sessions-walk-the-tree.md#two-real-versions-of-the-contents-page-idea)
has the details, including a benchmark claim I would not repeat without running it. Shivani's post draws
the same line and is fair to both sides: she says vectorless RAG breaks on flat text and on corpora too
big for the context window, and that most production systems end up using both kinds.

## I thought I was just being tidy

None of this started as retrieval, or as a loop. I am disorganized and the AI is not, and I needed it to
find things without me pointing.

Every repo opens with a CLAUDE.md, and the harness loads it first. Mine has a section called *Start
here*, a numbered reading order of ten entries, each a line on what it is and when to open it. That is a
table of contents written as onboarding for a new teammate.

I do not only work with Claude, so the file has a second name. [AGENTS.md](https://agents.md) is the open
convention other tools read, Codex and OpenCode among them. Here it is a symlink to CLAUDE.md, as it is in
the standards folder, [PANTRY](/pantry) and [GRAIN](/grain), and my global instructions link the same way.
One contents page, however many readers. [The Loop Outlives the Model](one-loop-three-harnesses.md) tells
that story.

> I was not building a retrieval system. I was writing a table of contents for a reader who reads
> every word and remembers none of it tomorrow.

## The map, in one picture

Once I saw the root, every other layer was something I had built for a different reason.

<svg viewBox="0 0 520 352" width="100%" role="img"
     aria-label="The retrieval tree my sessions walk. At the root, CLAUDE.md, the table of contents. Four branches below it: the skills, which are named sections; the code graphs, graphify and tokensave, indexes looked up by symbol; PANTRY, the project's index; and a CLAUDE.md per folder, which is a subtree. Under the skills branch, the session reads the descriptions and opens one section, the voice standard, and reads that one file whole. Off to the side, outside the tree, sit the notes and run reports, a flat pile with no tree yet."
     style="display:block;width:100%;max-width:520px;height:auto;margin:0 auto 1.5rem;
            font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-vectorless0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="160" y="16" width="200" height="48" rx="6"/>
    <rect x="6" y="118" width="118" height="48" rx="6"/>
    <rect x="136" y="118" width="118" height="48" rx="6"/>
    <rect x="266" y="118" width="118" height="48" rx="6"/>
    <rect x="396" y="118" width="118" height="48" rx="6"/>
  </g>
  <rect x="6" y="236" width="150" height="48" rx="6"
        style="fill:var(--color-fg);stroke:var(--color-fg)"/>
  <rect x="200" y="290" width="310" height="48" rx="6"
        style="fill:none;stroke:var(--color-line);stroke-width:1;stroke-dasharray:5 4"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="210" y1="64" x2="65" y2="116" marker-end="url(#fl-vectorless0)"/>
    <line x1="240" y1="64" x2="195" y2="116" marker-end="url(#fl-vectorless0)"/>
    <line x1="280" y1="64" x2="325" y2="116" marker-end="url(#fl-vectorless0)"/>
    <line x1="310" y1="64" x2="455" y2="116" marker-end="url(#fl-vectorless0)"/>
    <line x1="65" y1="166" x2="65" y2="234" marker-end="url(#fl-vectorless0)"/>
  </g>
  <g text-anchor="middle">
    <text x="260" y="37" style="fill:var(--color-fg)">CLAUDE.md</text>
    <text x="260" y="55" style="fill:var(--color-muted);font-size:11.5px">the table of contents</text>
    <text x="65" y="139" style="fill:var(--color-fg)">skills</text>
    <text x="65" y="157" style="fill:var(--color-muted);font-size:11.5px">named sections</text>
    <text x="195" y="139" style="fill:var(--color-fg)">code graphs</text>
    <text x="195" y="157" style="fill:var(--color-muted);font-size:11.5px">graphify, tokensave</text>
    <text x="325" y="139" style="fill:var(--color-fg)">PANTRY</text>
    <text x="325" y="157" style="fill:var(--color-muted);font-size:11.5px">the project's index</text>
    <text x="455" y="139" style="fill:var(--color-fg)">folder CLAUDE.md</text>
    <text x="455" y="157" style="fill:var(--color-muted);font-size:11.5px">a subtree</text>
    <text x="81" y="257" style="fill:var(--color-bg)">the voice standard</text>
    <text x="81" y="275" style="fill:var(--color-bg);font-size:11.5px">one file, read whole</text>
    <text x="355" y="311" style="fill:var(--color-muted)">notes and run reports</text>
    <text x="355" y="329" style="fill:var(--color-muted);font-size:11.5px">a flat pile, no tree yet</text>
  </g>
  <g text-anchor="middle" style="fill:var(--color-muted);font-size:12px;
       stroke:var(--color-bg);stroke-width:3;paint-order:stroke">
    <text x="65" y="204">reads the descriptions</text>
  </g>
</svg>

*The tree my sessions walk. The root and the branches are built from files I wrote for other reasons.
The dashed box is the part with no tree.*

- **Skills** are the named sections: 29 standards, each with a one-line description of when to read it.
- **Code graphs** ([graphify](https://github.com/safishamsi/graphify) and
  [tokensave](https://github.com/aovestdipaperino/tokensave)) answer where something is defined and what
  calls it, with no model involved.
- **PANTRY** is the project's contents page: what is in flight, what waits on me, what drifted.
- **A CLAUDE.md per folder** is a subtree that loads when a session first reads a file inside it.

The [companion](how-my-sessions-walk-the-tree.md) gives each layer its own section.

## What one question costs

Here is one real question: can I put a backtick in a note? CLAUDE.md points at the voice standard, its
skill description says to read it before any prose with my byline, the standards index lists its
sections, and the session opens one of them, lines 159 to 194. The answer is no, not in prose. I traced that by hand from the index, not from a log. The
[companion](how-my-sessions-walk-the-tree.md#one-question-walked-down-the-tree) draws the walk.

<svg viewBox="0 0 620 290" width="100%" role="img"
     aria-label="What one question costs in VOICE.md, which is 677 lines and 49,380 characters. The file is drawn as a strip with one narrow band lit in ink, lines 159 to 194, the punctuation section. Below it, two bars on the same scale. Opening the whole file reads 49,380 characters, a full-width bar. Opening only the section reads 2,848 characters, 5.8 percent, a short ink bar. The point: 94 percent of the file never enters the session."
     style="max-width:560px;height:auto;font-family:Georgia,'Times New Roman',serif;
            --paper:#faf7f1;--edge:#e6ddd0;--ink:#2b2b2b;--muted:#6b6259;--bar:#cbc1b3;--accent:#d97757"
     xmlns="http://www.w3.org/2000/svg">
  <rect x="0.5" y="0.5" width="619" height="289" style="fill:var(--paper);stroke:var(--edge)"/>
  <text x="28" y="30" style="fill:var(--muted);font-size:15px">One question, one section of VOICE.md</text>
  <text x="28" y="60" style="fill:var(--ink);font-size:14px">The file: 677 lines</text>
  <rect x="28" y="68" width="564" height="36" style="fill:var(--bar)"/>
  <rect x="159.6" y="64" width="30" height="44" style="fill:var(--ink)"/>
  <text x="159" y="126" style="fill:var(--muted);font-size:12.5px">lines 159 to 194: the punctuation section</text>
  <text x="28" y="164" style="fill:var(--ink);font-size:14px">Open the whole file</text>
  <text x="592" y="164" text-anchor="end" style="fill:var(--muted);font-size:12.5px">49,380 characters</text>
  <rect x="28" y="171" width="564" height="16" style="fill:var(--bar)"/>
  <text x="28" y="216" style="fill:var(--ink);font-size:14px">Open only the section</text>
  <rect x="28" y="223" width="32.5" height="16" style="fill:var(--ink)"/>
  <text x="68" y="236" style="fill:var(--muted);font-size:12.5px">2,848 characters, 5.8 percent</text>
  <text x="28" y="272" style="fill:var(--accent);font-size:13px">94 percent of the file never enters the session.</text>
</svg>

*The same file read two ways, one scale. The lit band is everything the question needed. A snapshot of
2026-11-26, counted from the repo.*

Opening the voice standard whole reads 49,380 characters. Opening only the section reads 2,848, which is
5.8 percent of the file and 0.6 percent of all the standards together (489,462 characters). The tree is
not free, because the 14,257 characters of skill descriptions ride along in every session. What it buys
is that the expensive part is read one section at a time.

## What it does for the loop

<svg viewBox="0 0 520 400" width="100%" role="img"
     aria-label="One lap of my AI loop, top to bottom, with a path back to the top. Orient: a short brief from PANTRY on what is in flight. Find what applies, drawn in ink because it is the retrieval step: read the contents page, pick the skill, open one section. Do the work. Check it, with the gates and a second pass. Hand off: leave a resume card in the plan. From the hand-off an arrow returns to the top, labelled next session, any of the three tools."
     style="display:block;width:100%;max-width:520px;height:auto;margin:0 auto 1.5rem;
            font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-vectorless6" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="100" y="16" width="260" height="48" rx="6"/>
    <rect x="100" y="176" width="260" height="48" rx="6"/>
    <rect x="100" y="256" width="260" height="48" rx="6"/>
    <rect x="100" y="336" width="260" height="48" rx="6"/>
  </g>
  <rect x="100" y="96" width="260" height="48" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg)"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="230" y1="64" x2="230" y2="94" marker-end="url(#fl-vectorless6)"/>
    <line x1="230" y1="144" x2="230" y2="174" marker-end="url(#fl-vectorless6)"/>
    <line x1="230" y1="224" x2="230" y2="254" marker-end="url(#fl-vectorless6)"/>
    <line x1="230" y1="304" x2="230" y2="334" marker-end="url(#fl-vectorless6)"/>
    <path d="M360,360 H470 V40 H362" marker-end="url(#fl-vectorless6)"/>
  </g>
  <g text-anchor="middle">
    <text x="230" y="37" style="fill:var(--color-fg)">Orient</text>
    <text x="230" y="55" style="fill:var(--color-muted);font-size:11.5px">a short brief: what is in flight</text>
    <text x="230" y="117" style="fill:var(--color-bg)">Find what applies</text>
    <text x="230" y="135" style="fill:var(--color-bg);font-size:11.5px">contents page, skill, one section</text>
    <text x="230" y="197" style="fill:var(--color-fg)">Do the work</text>
    <text x="230" y="215" style="fill:var(--color-muted);font-size:11.5px">with that section in front of it</text>
    <text x="230" y="277" style="fill:var(--color-fg)">Check it</text>
    <text x="230" y="295" style="fill:var(--color-muted);font-size:11.5px">the gates, then a second pass</text>
    <text x="230" y="357" style="fill:var(--color-fg)">Hand off</text>
    <text x="230" y="375" style="fill:var(--color-muted);font-size:11.5px">a resume card in the plan</text>
  </g>
  <g text-anchor="middle" style="fill:var(--color-muted);font-size:12px;
       stroke:var(--color-bg);stroke-width:3;paint-order:stroke">
    <text x="494" y="200" transform="rotate(-90 494 200)">next session, any of the three tools</text>
  </g>
</svg>

*One lap of my loop. The ink box is the retrieval step, and it is the only box this note is about.*

The savings are the part I can measure. They are not why I keep it. I keep it for what I no longer do:

- **I do not brief a session.** I give one line of what I want, and it finds the standard that applies.
- **I do not carry state between sessions.** A session that stops leaves a resume card in its plan, and
  the next one, in any of the three tools, starts there.
- **I do not babysit the index.** A hook refreshes the code graph after every edit, and a check at
  session start says when a skill or the graph has fallen behind its source.
- **I do not guess where it went wrong.** I ask which file it read, and the answer is a path. That is
  [watching its hands](watch-its-hands.md).

It makes the loop better as well as cheaper. Every session starts from the same standards, so it follows
my voice rules because it reads them and not because I remembered to paste them in. A fix compounds:
when a session picks the wrong file I reword one description, and every later session in every repo
picks better. And the loop survives a switch. When I ran out of Claude mid-task, Codex finished the work
on the same branch without a changed instruction, which is the story in
[The Loop Outlives the Model](one-loop-three-harnesses.md).

So I steer and I review, and I rarely re-explain. That is what I mean by low effort, and it is my
experience, not a measurement. I have not timed sessions with the tree against sessions without it, and
every number in this note measures reading, not effort.

## Why this kind fits a loop

Nobody chose this. It grew out of onboarding docs, and I only held it up against the alternatives
afterward. It fits for reasons about what my loop needs, not about vectorless being better in general:

- **The library is small and already has headings.** Thirty-one standards and a contents page. Vectors
  earn their place when there is far more text than a model can scan and no structure to follow.
- **A wrong pick is something I can fix.** I reword one line of a description. A wrong similarity hit is
  a distance between two lists of numbers, and there is nothing there to edit.
- **It costs nothing to keep, and every tool can read it.** The pages are files I write anyway, and
  Claude, Codex and OpenCode all read plain Markdown and a symlink.

Best is the wrong word. It fits my size and my kind of material, and the decision chain in the
[companion](how-my-sessions-walk-the-tree.md#which-one-to-reach-for) says where it stops fitting. I have
not benchmarked it against a vector index on my own files.

## Where it runs out

- **Every drill-down is a read.** A session walks CLAUDE.md, then a skill, then the file before it has done any work. That is cheap on a big question and silly on a trivial one.
- **The tree has to fit.** Twenty-nine descriptions work because they are short. PANTRY's index is
  already bigger, 18,203 characters against 14,257, and it grows with every plan.
- **Some of it is not a tree.** There are 38 notes in this folder, plus run reports and finished plans in
  their own. When a session needs to know whether I have already written about something, it has grep and
  my memory, and my memory is the reason this whole setup exists.

That flat pile is where similarity would earn its place. I have not built that half, and I am labelling it a guess.

## The name was the only part missing

I would still describe all of this as "I keep good docs," and I would still be telling the truth. Good
docs, written for a reader who reads every word and forgets them by tomorrow, turn out to be a retrieval
system with the serial numbers filed off. Other people gave it a name, a benchmark and a GitHub
repository. My version has [a longer story](ten-times-zero.md) behind it, and a symlink.

The table of contents was already there.

## Sources

What the claims above rest on, and what I did and did not check.

- Patrick Lewis and colleagues, [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401), NeurIPS 2020. The paper that named RAG.

- The [AGENTS.md](https://agents.md) convention. The symlinks are checked in this repo, the standards folder, PANTRY and GRAIN, and in the global links for Claude, Codex and OpenCode.
- PageIndex, the Cherny interview and Anthropic's contextual retrieval are cited in the [companion](how-my-sessions-walk-the-tree.md), with what I checked.
- [Shivani Virdi](/people#shivani-virdi), [a LinkedIn post](https://www.linkedin.com/posts/shivanivirdi_everyone-thinks-rag-chunking-embeddings-share-7527002415418732544-54j2/), November 2026. It is where I met the name "vectorless RAG", and why I went looking. I read the post, and the primary sources are what the claims rest on.
- The loop, effort and resume-card claims are my own experience of running it, and they are not measured. The counts and character figures are from my own repository on 2026-11-26.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
