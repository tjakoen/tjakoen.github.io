---
title: "My AI Workflow Is Vectorless RAG and I Didn't Call It That"
audience: [build]
level: intro
subtitle: "Retrieval-augmented generation hands a model the right pages before it answers. Most systems pick those pages by similarity. Mine picks them by reading a table of contents, and I built it months before I knew it had a name."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-11-26
readingTime: "~14 min"
tags: [ai, rag, retrieval, standards, tooling]
people: [shivani-virdi]
sources: [book-vectorless-rag-post]
summary: >
  RAG gives a model the right pages before it answers. Most systems pick pages by similarity, using
  vectors, while vectorless RAG gives the model a tree of sections and lets it read down to the page it
  needs, which is what PageIndex does and what Claude Code does with grep. My setup is the tree kind for
  Claude, Codex and OpenCode alike: one contents page (CLAUDE.md, with AGENTS.md linked to it), skills
  with one-line descriptions, two code indexes and PANTRY's project index. It is traceable and cheap to
  keep, it costs extra reads, and my 37 notes still have no tree.
social: |
  I have been running vectorless RAG for months and had no word for it.

  RAG means the AI looks things up before it answers. Most setups do it with vectors: chop the
  documents into chunks, turn each chunk into numbers, fetch whatever sits nearest the question. Mine
  does it with a table of contents. One file, CLAUDE.md, symlinked as AGENTS.md so Claude, Codex and
  OpenCode all read the same one. A question about my voice rules read 36 lines of a 677-line file.

  The name came from Shivani Virdi's post on vectorless RAG. Thank you, @Shivani Virdi.

  It is easy to trace and it costs me nothing extra. It also costs more reads, and my notes are still
  a flat pile with no tree.
socialImage: "/media/notes/vectorless-rag-by-accident-social.png"
socialImageAlt: "My AI workflow is vectorless RAG and I didn't call it that: on the left a scatter of dots with a ring around the nearest few, labelled find what looks similar; on the right a small tree with one path drawn in ink down to a filled leaf, labelled read the contents, open one file."
---

My AI has never read my standards. Every session starts blank, whether it is Claude, Codex or
OpenCode, and every session has to find the one file that applies out of thirty-odd, without me
standing there pointing.

For months I called whatever makes that work "keeping good docs." The AI world calls it vectorless
RAG, a name I met in a [LinkedIn post](https://www.linkedin.com/posts/shivanivirdi_everyone-thinks-rag-chunking-embeddings-share-7527002415418732544-54j2/) by [Shivani Virdi](/people#shivani-virdi). This note explains RAG for anyone who has not met the word, what the vectorless kind does
differently, and what my version looks like with receipts, including the parts that do not work.

## What RAG is, if you have never met it

A language model knows two things: what it absorbed in training, and what is in the prompt right now.
It has never seen your syllabus, your wiki or your repository, so if you ask about them it guesses,
fluently, which is the worst way to be wrong.

If you have ever pasted a document into a chat and asked about it, you have done RAG by hand.
Retrieval-augmented generation automates the pasting. A program picks the pages most likely to hold the
answer, puts them in the prompt beside your question, and the model answers from them. The name comes
from a [2020 paper](https://arxiv.org/abs/2005.11401) by Patrick Lewis and colleagues. Their library was
Wikipedia, and they found pages with a vector index, which matters in a minute.

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

You can skip all of it for a small library. [Anthropic says](https://www.anthropic.com/news/contextual-retrieval)
a knowledge base under about 200,000 tokens, roughly 500 pages, can simply go in the prompt. RAG is for
the libraries that do not fit.

## What people use it for

Anything where the answer lives in a pile of documents that is too big to paste and too specific for
the model to know.

| Use | What gets looked up |
|---|---|
| A support bot | The help center, and past answers |
| A company assistant | The wiki, the policies, old tickets |
| Reading a contract or a financial filing | One long document with real structure |
| A coding assistant | The repository |
| A class helper (one I could picture, not one I run) | The syllabus and the assignment pages |

It took off for a boring reason. Retraining a model on your documents is slow and goes stale the day a
policy changes. Retrieval only needs the pages updated, and the answer can point back at its source.

## The usual way: find what looks similar

Most RAG systems pick pages by similarity, in three steps.

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

The numbers are positions on a very large map, and close on the map means close in meaning. That
handles the case where the question and the answer share no words at all. It also has a weakness,
because close in meaning is not the same as the right page. A question about this year's revenue sits
near every paragraph that mentions revenue, last year's included, and the map does not know which year
you meant. When the answer is wrong it is hard to say why, since the reason is a distance between two
lists of numbers.

The vector camp keeps improving. Anthropic's [contextual retrieval](https://www.anthropic.com/news/contextual-retrieval)
adds a note about where each chunk came from before it is embedded. With keyword search and a reranker
on top, it cut missed chunks in the top twenty from 5.7 percent to 1.9 percent in their tests.

## The other way: read the contents page

Vectorless RAG throws out the map and gives the model what a person would use: a table of contents. You
parse a document into a tree of sections, each with a title and a short summary. The model reads the
top, picks a branch, reads what is under it, and keeps going until it reaches the page with the answer.
No embeddings, no vector database.

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

The best-known version is [PageIndex](https://github.com/VectifyAI/PageIndex), an MIT-licensed project
from Vectify AI. It builds a tree index for each document and lets a model search the tree and read the
pages it lands on. Its README adds a complaint about vectors, that you cannot see why a chunk was
chosen, and a number: 98.7 percent on FinanceBench against 50 percent for vector RAG. Treat that as a
claim. It is self-reported, the README does not name the vector system it beat, and I did not run the
[evaluation](https://github.com/VectifyAI/Mafin2.5-FinanceBench).

A close cousin has no index at all. In a [Latent Space interview](https://www.latent.space/p/claude-code)
in May 2025, Boris Cherny, who leads Claude Code, said early versions used off-the-shelf RAG and that
"eventually, we landed on just agentic search as the way to do stuff," meaning glob, grep and file
reads. An index has to be built, the code drifts out of sync with it, and it has to live somewhere.

So there are three answers to the ink box. Vectors pick by distance. PageIndex reasons over a tree built
ahead of time. Claude Code searches live with no index. Mine is closest to the second, with the tree
written by hand. Shivani's post draws the same line, and it is fair to both sides: she says vectorless
RAG breaks on flat text and on corpora too big for the context window, and that most production
systems end up using both kinds.

## I thought I was just being tidy

None of this started as retrieval. I am disorganized and the AI is not, and I needed it to find things
without me pointing.

Every repo opens with a CLAUDE.md, and the harness loads it first. The one here has a section called
*Start here*, a numbered reading order: the philosophy, the intake skill, [voice](/standards/voice),
figures, the note standard, the README standard, the code graph, the backlog, the plan. Ten entries,
each a line on what it is and when to open it. That is a table of contents, written as onboarding for a
new teammate, and the model reads it the way PageIndex's model reads its tree.

I do not only work with Claude, so the file has a second name. [AGENTS.md](https://agents.md) is the
open convention other tools read, Codex and OpenCode among them. In this repo it is a symlink to
CLAUDE.md, as it is in the standards folder, [PANTRY](/pantry) and [GRAIN](/grain). My global
instructions work the same way: Claude, Codex and OpenCode each load a link to one shared file. One
contents page, however many readers. [The Loop Outlives the Model](one-loop-three-harnesses.md) tells
that part of the story.

> I was not building a retrieval system. I was writing a table of contents for a reader who reads
> every word and remembers none of it tomorrow.

## The tree, one layer at a time

Once I saw the root, every other layer was something I had built for a different reason.

**The standards are the named sections.** Twenty-nine of them are mounted into each session as skills
(a snapshot, since the number grows), among them [voice](/standards/voice), [figures](/standards/figures)
and the [note standard](/standards/note-standard). Each opens with a field called *when*, which becomes
the skill's description, and until the model opens a standard the description is all it sees. The
standards' own rules say it is the only thing an agent reads when deciding whether to open the file at
all. That is a node summary in a section tree. I wrote a whole contract for wording it (nearly all start with
"Read this BEFORE") without knowing I was tuning a retrieval index.

It even has a scar from a classic tree failure. My loop standard shared a name with a built-in skill,
and mine was shadowed without a sound. In a vector store a duplicate title is a non-event. In a tree it
means one branch can never be picked.

**PANTRY mounts them.** The standards live once, in this repo's standards folder. PANTRY mounts them as
skills in the other repos, so a session in GRAIN reads the same sections as one here. The mount is a
sync I still run by hand, which means a repo I forgot is reading last week's tree.

**Every folder carries its own subtree.** The standards folder has its own CLAUDE.md, and a subtree
loads when a session first reads a file inside it. That happened while I drafted this note. The session
opened the note standard and the standards folder's rules arrived with it, unasked. They were on the
branch.

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

Opening the voice standard whole would read 49,380 characters. Opening only the section reads 2,848,
which is 5.8 percent of the file. Against every standard whole (489,462 characters) it is 0.6 percent.
All of these are snapshots of today's files.

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

The tree is not free, because those 14,257 characters of descriptions ride along in every session. What
it buys is that the expensive part is read one section at a time.

## Which one to reach for

My read, not a benchmark. Nobody has run these head to head on my files, and the one number I quoted
above is a vendor's own.

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

## Why I keep it, and where it runs out

**I can trace it.** When a session gets something wrong, I can ask which file it read, and the answer is
a path. I can open it and see whether the file was wrong or the reading was. With similarity the answer
is "these five chunks scored highest," for reasons that are a number. I want to
[watch its hands](watch-its-hands.md), and a branch it chose is a hand I can watch.

**It costs me nothing I was not already paying.** The contents page is onboarding I would write anyway,
and the graphs rebuild from the code. There is no pipeline to keep alive and no store to re-embed.

Three places it runs out:

- Every drill-down is a read. A session spends its first turns walking CLAUDE.md, then a skill, then
  the file, before it has done any work. That is cheap on a big question and silly on a trivial one.
- The tree has to fit. Twenty-nine descriptions work because they are short. PANTRY's index is already
  bigger, 18,203 characters against 14,257, and it grows with every plan, finished ones included. That
  is the top of the tree I worry about first.
- Some of it is not a tree. There are 37 notes in this folder, plus run reports and finished plans in
  their own. When a session needs to know whether I have already written about something, it has grep
  and my memory, and my memory is the reason this whole setup exists.

That flat pile is where similarity earns its place, which is why I expect production systems to end up
hybrid. I have not built that half. It is a guess about what I will need, and I am labelling it one.

## What landed since the first draft

The first draft listed three pieces of work as in flight. Two landed on 2026-11-17 and one is half done.

- **A standards index.** A tool lists every standard with its sections, 31 standards and 279 sections
  today, so a session reads one section by name. The walk above runs on it.
- **A staleness check.** It warns at session start when a skill or the graph is behind its source, which
  is the warning PANTRY showed me this morning. A tree pointing at a file that changed underneath it is
  worse than no tree.
- **A retrieval trace, half done.** A run report from 2026-11-21 lists the files the session read, with
  a catch: the session writes it and no tool captures it, so it is a claim a session makes about
  itself. PANTRY's run ledger already records token use by model, plan and area, so a mechanical version
  would fit there. That is an idea and not a build.

## The name was the only part missing

I would still describe all of this as "I keep good docs," and I would still be telling the truth. Good
docs, written for a reader who reads every word and forgets them by tomorrow, turn out to be a
retrieval system with the serial numbers filed off. Other people gave it a name, a benchmark and a
GitHub repository. My version has [a longer story](ten-times-zero.md) behind it, and a symlink.

The table of contents was already there.

## Sources

What the claims above rest on, and what I did and did not check.

- Patrick Lewis and colleagues, [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401), NeurIPS 2020. The paper that named RAG.
- Anthropic, [Introducing Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval), 2024-09-19. The 200,000 token rule and the 5.7 to 1.9 percent figures. I read the page and did not reproduce the results.
- Vectify AI, [PageIndex](https://github.com/VectifyAI/PageIndex). I read the README. The FinanceBench claim links to a [write-up](https://vectify.ai/blog/Mafin2.5) and an [evaluation repo](https://github.com/VectifyAI/Mafin2.5-FinanceBench) that I did not open.
- Boris Cherny on [Latent Space](https://www.latent.space/p/claude-code), 2025-05-07. The agentic search passage is about forty-five minutes into the transcript, and I checked the quoted words against it.
- The [AGENTS.md](https://agents.md) convention. The symlinks are checked in this repo, the standards folder, PANTRY and GRAIN, and in the global links for Claude, Codex and OpenCode.
- [graphify](https://github.com/safishamsi/graphify), [tokensave](https://github.com/aovestdipaperino/tokensave) and [PANTRY](/pantry). The figures are counted from my own repository, my own tokensave and my own running PANTRY on 2026-11-26, and the August figures are from my notes on measuring graphify. None of them comes from a vendor.
- [Shivani Virdi](/people#shivani-virdi), [a LinkedIn post](https://www.linkedin.com/posts/shivanivirdi_everyone-thinks-rag-chunking-embeddings-share-7527002415418732544-54j2/), November 2026. It is where I met the name "vectorless RAG", and it is why I went looking. I read the post, and the primary sources above are what the claims rest on. Her 98.7 percent figure is the same self-reported PageIndex number I flagged earlier.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
