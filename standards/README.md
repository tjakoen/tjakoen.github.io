---
title: standards/ — how I build, write, and work with AI
summary: The index - one line per standard, so a reader loads one file, not six.
---

# 📐 standards/: how I build, write, and work with AI

[![Made with Claude](https://img.shields.io/badge/Made_with-Claude-D97757?logo=anthropic&logoColor=white)](https://tjakoen.github.io/notes/ten-times-zero)
[![License: Apache 2.0](https://img.shields.io/badge/license-Apache_2.0-blue)](LICENSE)
[![Published](https://img.shields.io/badge/published-tjakoen.github.io%2Fstandards-2ea44f)](https://tjakoen.github.io/standards)

The single source of truth for how I work across every repo: how I build software with an AI
partner, how anything under my byline reads, and how a new repo is set up. Public and portable:
any repo of mine references this folder instead of copying its own drifting rules.

**How to use this, human or AI:** read this index first, then fetch **only** the standard the task in
front of you needs. Each line below is the whole hook: that's the point, so you load one file, not
six.

## The standards

| Read this when you're… | Standard | In one line |
|---|---|---|
| **Building anything with an AI** | [AI-DEVELOPMENT.md](AI-DEVELOPMENT.md) | The working relationship, the definition of done, the conventions and pitfalls every change is held to. The rulebook. |
| **Structuring a repo so AI sessions compound** | [AI-REPO-STANDARD.md](AI-REPO-STANDARD.md) | The repo-side companion to AI-DEVELOPMENT: the kit you commit (the map, the contracts, the guardrails) so every AI session inherits what the last one learned. AI-DEVELOPMENT owns the working relationship; this owns the repo. |
| **Auditing a repo (or writing its AUDIT.md)** | [AUDIT-STANDARD.md](AUDIT-STANDARD.md) | The whole-repo pass: the nine quality dimensions, the severity words, the parallel subagent fan-out that runs it, and the report it owes. AI-REPO-STANDARD owns the per-repo runbook file; this owns what an audit actually looks at. |
| **Deciding where a file lives / unbloating a root** | [TREE.md](TREE.md) | The layout standard: keep the root a readable index, only load-bearing files earn a place there, everything else folds one level down into a named home. AI-REPO-STANDARD owns *which* files exist; this owns *where* they sit. |
| **Running a session / handing off** | [SESSION-LOOP.md](SESSION-LOOP.md) | The session lifecycle: orient, the loop, the recurring chores, memory (so lessons stick), the handoff, and model economy. |
| **Running one AI workflow across every repo** | [LOOP.md](LOOP.md) | The system *around* the sessions: the work-triggered heartbeat that makes skipped chores visible, the thin-kit shape, the accountability contract that keeps an unattended run honest. One floor above SESSION-LOOP. |
| **Answering a code question without burning the window** | [GRAPH.md](GRAPH.md) | Ask the code graph a scoped question before you fan out grep, reads, and subagents. Query by symbol not prose, keep it fresh with a free per-edit hook, never commit the artifact. The retrieval half of the loop. |
| **Writing prose in my name** | [VOICE.md](VOICE.md) | The writing standard: cadence, the honesty clause, the machine-tells to refuse. Owns *how it reads*. |
| **Drafting a note / blog post** | [NOTE-STANDARD.md](NOTE-STANDARD.md) | How a note is built (frontmatter, structure, footer), plus a runnable prompt. Owns the *artifact*; VOICE owns the words. |
| **Handing over a change someone has to look at** | [TOUR-STANDARD.md](TOUR-STANDARD.md) | How a CRUMB review tour is built: one step per changed surface, a verify line the reviewer can actually run, an honest status. Owns the *artifact*; LOOP owns the rule that a rendered change owes one. |
| **Asking the human something a run can't decide** | [DECISIONS.md](DECISIONS.md) | The four surfaces a question can land on (chat, the inbox, a tour's decision card, the handoff), what picks between them, what a request has to carry, and the one channel an answer comes back on. LOOP owns how much scrutiny a change earns; this owns where the question goes. |
| **Turning a pasted ask into scoped work** | [INTAKE.md](INTAKE.md) | The arrival half of the envelope: four questions a person answers before a session starts spending, the test for when no brief is needed at all, and where the brief lands. LOOP section 4b owns what an envelope is; this owns getting one written before the work rather than after. |
| **Making a diagram or chart** | [FIGURES.md](FIGURES.md) | The figure standard: two tokenized inline-SVG scaffolds (data-viz + flow), one palette each, no mermaid on the published site. |
| **Setting up a README** | [README-STANDARD.md](README-STANDARD.md) | Title emoji, the honest badge row, the "built with Claude" footer, plus a runnable prompt. |
| **Deciding which stack layers a new project needs** | [KICKSTART.md](KICKSTART.md) | A paste-in prompt that interviews you, reads the live stack and the public repos, and proposes which BREAD layers your project actually needs (and which it does not). The on-ramp before the repo exists. |
| **Starting a new repo** | [CLAUDE.starter.md](CLAUDE.starter.md) | The `CLAUDE.md` template that wires a fresh repo into all of the above from day one. |
| **Checking a repo is still wired** | [CONFORMANCE.md](CONFORMANCE.md) | A paste-in prompt for a repo that already exists: run the mechanical doctor, then judge the eight things it cannot, above all whether the loop is automated or only remembered. The upkeep pass for everything the other two on-ramps set up. |

## How they fit together

- **AI-DEVELOPMENT + SESSION-LOOP** are the engineering pair: the first is the standards, the second
  is the session mechanics that run against them. Start here for any building work.
- **LOOP** sits one floor above the pair: SESSION-LOOP owns a single session, LOOP owns the system that
  spans them: the heartbeat, the shared kit shape, the contract that holds across a whole estate of
  repos worked the same way. Read it when the question is "how does *every* repo run," not "how does
  this session run."
- **AUDIT-STANDARD** is the checking half of that same pair: AI-REPO-STANDARD says a repo commits an
  `AUDIT.md` of its own mechanical checks, and this says what a real pass looks at beyond them, how
  severe a finding is, and how to fan the reading out across subagents instead of grinding it
  serially. Read it before any full pass, and before writing a repo's runbook.
- **TREE** is the layout companion to AI-REPO-STANDARD: the latter decides *which* files a repo commits,
  TREE decides *where* each one sits and keeps the root a readable index instead of a junk drawer. Read it
  when a root has grown past a screen or a file has no obvious home.
- **GRAPH** is the retrieval half of that loop: a narrow rule for answering a structural code question
  cheaply (ask the graph before you fan out) that SESSION-LOOP's model economy and LOOP's heartbeat both
  lean on. Read it the moment you catch yourself about to grep the whole tree.
- **VOICE + NOTE-STANDARD + README-STANDARD + FIGURES** are the writing set: VOICE owns the prose,
  the others own specific artifacts and point back at it. Start here for any published words.
- **TOUR-STANDARD** is the handover half of the engineering pair: LOOP's contract says a change that
  renders owes a review tour, and this says how to write one worth walking. Read it when the thing you
  changed is something a person can look at, and read LOOP section 2 with it for the limit, because a
  tour you wrote about your own change makes review cheap without making it done.
- **DECISIONS** sits across the three of them and answers a question none of them owns: where a
  question goes. LOOP section 4b says how much scrutiny a change earns, TOUR-STANDARD says what a
  tour is, SESSION-LOOP section 5 says what a handoff contains, and DECISIONS says which of those a
  given question belongs on and how the answer gets back. Read it when you are about to interrupt a
  human, which is the moment the choice is actually made.
- **INTAKE** is the arrival half of the seam DECISIONS sits on. LOOP section 4b says a run
  declares an envelope and SESSION-LOOP section 5 says a handoff carries one out, but neither says
  where the first one comes from when work turns up as a pasted document with no lane and no cap.
  INTAKE is that step, and it is measured rather than assumed: of 54 work blobs that opened a
  session in the portfolio, 7 carried a named envelope. Read it when a paste runs longer than a
  screen and wants something changed.
- **KICKSTART + CLAUDE.starter + CONFORMANCE** are the on-ramps and the upkeep, in order: KICKSTART
  runs *before the repo exists*, deciding which layers the project needs; CLAUDE.starter is how the
  repo you then create inherits the whole set from day one; CONFORMANCE is what you run months later
  to find out whether any of it is still running. The first two are wiring, the third is the only one
  that catches wiring going quietly dead.

## The one rule this folder lives by

Single source of truth, everywhere. Each fact has exactly one home here; every other mention is a
*pointer*, never a copy. Two copies of a rule drift, and then both are suspect. If you find the same
thing stated in two of these files, one of them is a bug: fix it to a link.

---
🤖 **Built with Claude, rules included.** The standards that govern how I work with an AI were themselves written with one, which is either very meta or very honest, and I am going with both. **I don't prompt and pray, I prompt and prove.** [How I actually work with AI, receipts and all →](https://tjakoen.github.io/notes/ten-times-zero)
