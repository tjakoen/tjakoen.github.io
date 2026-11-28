---
title: "The Words You Will Hear"
audience: [learn]
level: intro
subtitle: "Model, prompt, context, token, harness, agent, session, skill, loop. Eleven words my older notes used without explaining them, each in one plain line."
author: "Tjakoen Stolk"
status: DRAFT
type: note
series: harbor
seriesOrder: 10
date: 2026-11-28
readingTime: "~4 min"
tags: [ai, workflow, teaching]
summary: >
  Most of the vocabulary around AI coding is eleven words. This note defines each in one plain line as I use
  it, shows how they stack from the model up to the loop, and points to the glossary I keep for the longer
  list. The definitions are mine and the tools differ, so ask your own agent where yours disagrees.
social: |
  My older notes say harness, loop and session as if you were in the room when I learned them.

  Most of the vocabulary around AI coding is about eleven words, and they stack in a way that's easy to
  draw. Here they are, one line each, in the order they fit together:
socialImage: "/media/notes/the-words-you-will-hear-social.png"
socialImageAlt: "A card from the Harbor path of Learn AI with me, titled The Words You Will Hear, with the line: My older notes say harness, loop and session as if you were in the room when I learned them."
---

I used these words for months before I wrote a single one of them down. My older notes say harness, loop and
session as if you were in the room when I learned them, and you weren't. If a word on this path has been
going past you, that's my fault and not yours.

So here they are. These are the words as I use them. Tools name things differently, and when yours
disagrees with me, believe your tool and ask your agent why.

## The bottom layer: what answers you

**Model.** The AI itself: the thing that reads text and writes text back. Claude, GPT and DeepSeek are models.
It has no memory of you and no access to your files. It only answers.

**Prompt.** What you send the model. Your question, your instructions, the file you pasted in. Everything
you've been typing into a chat window is a prompt.

**Token.** The small pieces a model reads and writes in, a bit smaller than a word. It matters because
models have a limit on how many they can hold at once, and plans and prices are counted in them.

**Context.** Everything the model can see right now: your prompt, the conversation so far, the files it
has read. It has a size limit, and when you fill it the model starts losing track of the early parts. A long
session is the usual way this happens, which is the reason a fresh session often works better.

## The middle layer: what lets it work on your project

**Harness.** The program that wraps a model and lets it act: read your files, edit them, run commands.
Claude Code and Codex are harnesses. The model thinks, and the harness is the hands.

**Agent.** A model inside a harness, working through a task with several steps and choosing its own next
move. When people say "the AI built this", they mean an agent.

**Session.** One run of an agent, from opening it to closing it. It starts with a context and ends with
whatever the files look like when you stop. It forgets everything afterwards, so what you want to keep
has to live in your project.

## The top layer: what you set up around it

**Plan.** A file in your project with the goal and the steps. It's what a new session reads to find out
where you are.

**Skill.** A saved set of instructions your agent can run on request, for a job you've repeated. You
met this one in the last note.

**Standard.** A written rule your agent reads before it works, such as how to name things or when to stop
and ask. It's the contract you write for your own project, the part of the setup that sounds like you.

**Loop.** The workflow around all of it: write the brief, make the plan, build one step, check it, report
what happened, and start the next session knowing where you are. The next note is the first small version
of it.

```mermaid label="How the words stack: you give a prompt to an agent, which is a model inside a harness, and the plan, skills and standards in your project are what the agent reads each session."
flowchart TB
  you["You: a prompt"] --> agent
  subgraph agent["Agent, in a session"]
    harness["Harness: the hands"] --- model["Model: the thinking"]
  end
  project["Your project: plan, skills, standards"] --> agent
  agent --> work["Changed files, and a check"]
```

## Where the longer list lives

There are more words than these, and I keep them in a glossary that my own agents read before they write
anything: [the glossary](/standards/glossary). Some entries are specific to my setup, and you can skip those. If you
hit a word that isn't here or there, do the same thing I do: ask your agent, "Explain this term as if I
were new, and tell me where it shows up in my project." It's very good at that.

## Your turn

Pick the three words from this list you'd have the most trouble explaining to a friend. Ask your AI to explain
each one using your portfolio as the example, then write your own one-line version in your roadmap, in your
words. If your line disagrees with mine, good. Tell me which one I got wrong.

**Where I might be wrong.** These are definitions from one person's daily use, and the field renames things
every few months. A word that means one thing in one tool means another in the next, and I've simplified
a few that deserve a longer answer. Treat the list as a map for getting started, and expect to redraw it.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
