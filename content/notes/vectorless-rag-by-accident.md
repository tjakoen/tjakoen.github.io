---
title: "My AI Workflow Is Vectorless RAG and I Didn't Call It That"
audience: [build]
level: intro
subtitle: "Retrieval-augmented generation hands a model the right pages before it answers. Most systems pick those pages by similarity. Mine picks them by reading a table of contents, and that is why my AI loop runs on so little effort from me."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-11-26
readingTime: "~10 min"
tags: [ai, rag, retrieval, standards, tooling]
people: [shivani-virdi]
sources: [book-vectorless-rag-post]
summary: >
  RAG gives a model the right pages before it answers. Most systems pick pages by similarity, using
  vectors, while vectorless RAG gives the model a tree of sections and lets it read down to the page it
  needs. My setup is the tree kind for Claude, Codex and OpenCode alike: one contents page, skills with
  one-line descriptions, two code indexes and PANTRY's project index. It is why a fresh session finds
  the right file without me pointing, which is most of what keeps the loop low effort. It is traceable
  and cheap to keep, it costs extra reads, and my 37 notes still have no tree.
social: |
  I have been running vectorless RAG for months and had no word for it.

  RAG means the AI looks things up before it answers. Most setups do it with vectors: chop the
  documents into chunks, turn each chunk into numbers, fetch whatever sits nearest the question. Mine
  does it with a table of contents. One file, CLAUDE.md, symlinked as AGENTS.md so Claude, Codex and
  OpenCode all read the same one. A question about my voice rules read 36 lines of a 677-line file.

  The part I care about is the effort. I do not brief a session. It reads the contents page, finds the
  file that applies, and I steer and review.

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
RAG, a name I met in a [LinkedIn post](https://www.linkedin.com/posts/shivanivirdi_everyone-thinks-rag-chunking-embeddings-share-7527002415418732544-54j2/)
by [Shivani Virdi](/people#shivani-virdi). This note covers what RAG is, what the vectorless kind does
differently, and what my version buys me, including the parts that do not work. The tool-by-tool
setup lives in a [companion note](how-my-sessions-walk-the-tree.md).

## What RAG is, if you have never met it

A language model knows two things: what it absorbed in training, and what is in the prompt right now.
It has never seen your syllabus, your wiki or your repository, so if you ask about them it guesses,
fluently, which is the worst way to be wrong.

If you have ever pasted a document into a chat and asked about it, you have done RAG by hand.
Retrieval-augmented generation automates the pasting. A program picks the pages most likely to hold the
answer, puts them in the prompt beside your question, and the model answers from them. The name comes
from a [2020 paper](https://arxiv.org/abs/2005.11401) by Patrick Lewis and colleagues, who found their
pages with a vector index, which matters in a minute.

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

## Two ways to pick the pages

**The usual way is to find what looks similar.** Cut every document into chunks. Turn each chunk into a
list of numbers, built so that similar meaning gives similar numbers. Turn the question into numbers
the same way, and fetch the chunks that sit nearest. That works even when the question and the answer
share no words.

Its weakness is that close in meaning is not the same as the right page. A question about this year's
revenue sits near every paragraph that mentions revenue, last year's included. When the answer is wrong
the reason is a distance between two lists of numbers, which is hard to read. The
[companion](how-my-sessions-walk-the-tree.md#the-usual-way-step-by-step) draws the steps.

**The other way is to read the contents page.** Vectorless RAG throws out the map and gives the model
what a person would use. You parse a document into a tree of sections, each with a title and a short
summary. The model reads the top, picks a branch, reads what is under it, and keeps going until it
reaches the page with the answer. No embeddings, no vector database.

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
from Vectify AI. Its README claims 98.7 percent on FinanceBench against 50 percent for vector RAG.
Treat that as a claim. It is self-reported, the README does not name the vector system it beat, and I
did not run the [evaluation](https://github.com/VectifyAI/Mafin2.5-FinanceBench).

A close cousin has no index at all. In a [Latent Space interview](https://www.latent.space/p/claude-code)
in May 2025, Boris Cherny, who leads Claude Code, said early versions used off-the-shelf RAG and that
"eventually, we landed on just agentic search as the way to do stuff," meaning glob, grep and file
reads. An index has to be built, the code drifts out of sync with it, and it has to live somewhere.

So there are three answers to the ink box. Vectors pick by distance. PageIndex reasons over a tree
built ahead of time. Claude Code searches live with no index. Mine is closest to the second, with the
tree written by hand. Shivani's post draws the same line, and it is fair to both sides: she says
vectorless RAG breaks on flat text and on corpora too big for the context window, and that most
production systems end up using both kinds.

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

## The tree, in one picture

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

- **Skills** are the named sections. Twenty-nine standards, each with a one-line description that says
  when to read it, and nearly all of them start with "Read this BEFORE".
- **Code graphs** are indexes looked up by symbol. [graphify](https://github.com/safishamsi/graphify)
  and [tokensave](https://github.com/aovestdipaperino/tokensave) answer where something is defined and
  what calls it, without a model in the loop.
- **PANTRY** is the project's contents page. It tells a session what is in flight, what waits on me and
  what drifted.
- **A CLAUDE.md per folder** is a subtree that loads when a session first reads a file inside it.

Each layer gets its own section in the [companion](how-my-sessions-walk-the-tree.md).

## What one question costs

Here is one real question: can I put a backtick in a note? CLAUDE.md points at the voice standard. The
skill description says to read it before any prose in my name. The standards index lists its sections.
The session opens one of them, lines 159 to 194, and the answer is no, not in prose. The
[companion](how-my-sessions-walk-the-tree.md#one-question-walked-down-the-tree) draws the walk. I traced it by hand from the index, not from a log, so read it as the route the setup allows.

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

Opening the voice standard whole reads 49,380 characters. Opening only the section reads 2,848, which
is 5.8 percent of the file, and 0.6 percent of all the standards together (489,462 characters). The
tree is not free, because the 14,257 characters of skill descriptions ride along in every session. What
it buys is that the expensive part is read one section at a time.

## What it does for the loop

The savings are the part I can measure. They are not the reason I keep it.

The reason is what I no longer do:

- **I do not brief a session.** I give one line of what I want. The session reads the contents page,
  asks PANTRY what is in flight, and finds the standard that applies.
- **I do not carry state between sessions.** A session that stops leaves a resume card in its plan:
  what stopped, what is next, what it waits on. The next one, in any of the three tools, starts there.
- **I do not babysit the index.** A hook refreshes the code graph after every edit, and a check at
  session start says when a skill or the graph has fallen behind its source.
- **I do not guess where it went wrong.** When a session gets something wrong, I ask which file it
  read and the answer is a path. That is [watching its hands](watch-its-hands.md), and a branch it
  chose is a hand I can watch.

So I steer and I review, and I rarely re-explain. That is what I mean by low effort, and it is the
same loop [one repo after another](one-loop-every-repo.md) runs on. The tree does not make the model
smarter. It makes the starting line the same every time.

Here is the limit on that claim. It is my experience and not a measurement. I have not timed sessions
with the tree against sessions without it, and every number in this note measures reading, not effort.
PANTRY's run ledger records token use by model and plan, so a real comparison could live there. That
is an idea and not a build.

## Where it runs out

Three places:

- **Every drill-down is a read.** A session spends its first turns walking CLAUDE.md, then a skill,
  then the file, before it has done any work. That is cheap on a big question and silly on a trivial
  one.
- **The tree has to fit.** Twenty-nine descriptions work because they are short. PANTRY's index is
  already bigger, 18,203 characters against 14,257, and it grows with every plan, finished ones
  included.
- **Some of it is not a tree.** There are 37 notes in this folder, plus run reports and finished plans
  in their own. When a session needs to know whether I have already written about something, it has
  grep and my memory, and my memory is the reason this whole setup exists.

That flat pile is where similarity earns its place, which is why I expect production systems to end up
hybrid. I have not built that half. It is a guess about what I will need, and I am labelling it one.

If you want the tools themselves, the graphs, PANTRY's index and the decision chain for what to build,
they are in [How My Sessions Walk the Tree](how-my-sessions-walk-the-tree.md).

## The name was the only part missing

I would still describe all of this as "I keep good docs," and I would still be telling the truth. Good
docs, written for a reader who reads every word and forgets them by tomorrow, turn out to be a
retrieval system with the serial numbers filed off. Other people gave it a name, a benchmark and a
GitHub repository. My version has [a longer story](ten-times-zero.md) behind it, and a symlink.

The table of contents was already there.

## Sources

What the claims above rest on, and what I did and did not check.

- Patrick Lewis and colleagues, [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401), NeurIPS 2020. The paper that named RAG.
- Anthropic, [Introducing Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval), 2024-09-19. The 200,000 token rule. I read the page and did not reproduce its results.
- Vectify AI, [PageIndex](https://github.com/VectifyAI/PageIndex). I read the README. The FinanceBench claim links to a [write-up](https://vectify.ai/blog/Mafin2.5) and an [evaluation repo](https://github.com/VectifyAI/Mafin2.5-FinanceBench) that I did not open.
- Boris Cherny on [Latent Space](https://www.latent.space/p/claude-code), 2025-05-07. The agentic search passage is about forty-five minutes into the transcript, and I checked the quoted words against it.
- The [AGENTS.md](https://agents.md) convention. The symlinks are checked in this repo, the standards folder, PANTRY and GRAIN, and in the global links for Claude, Codex and OpenCode.
- The loop, effort and resume-card claims are my own experience of running it, and they are not measured. The counts and character figures are from my own repository on 2026-11-26.
- [Shivani Virdi](/people#shivani-virdi), [a LinkedIn post](https://www.linkedin.com/posts/shivanivirdi_everyone-thinks-rag-chunking-embeddings-share-7527002415418732544-54j2/), November 2026. It is where I met the name "vectorless RAG", and it is why I went looking. I read the post, and the primary sources above are what the claims rest on. Her 98.7 percent figure is the same self-reported PageIndex number I flagged earlier.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
