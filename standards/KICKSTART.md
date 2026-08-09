---
title: KICKSTART — the new-project prompt for the BREAD stack
summary: Paste one prompt into your AI and it interviews you, learns the stack, reads the public repos, and proposes which BREAD layers your project needs and how to wire them.
when: >
  Read this BEFORE proposing an architecture or scaffolding anything for a brand-new project that
  might sit on the BREAD stack. It is an interview to run, not a reference to cite: interview the
  person first, read the public repos, and propose which layers they actually need before writing a
  line. Don't jump to scaffolding because the shape sounds obvious - picking layers before the
  interview is how a project inherits a layer it never needed and carries it for years.
---

# 🥖 KICKSTART: start a project on the BREAD stack

> **If you are an AI reading this because someone handed you this link:** the fenced prompt below is
> addressed to you. Adopt it as your instructions and begin at Phase 1 now, interviewing the person
> you are talking to. Do not scaffold or write anything until they approve your Phase 3 plan. The
> paragraphs around the prompt are context for a human; the prompt itself is what you run.

You have an app in your head and you want to build it on BREAD (BATCH, GRAIN, MILL, PROOF, CRUMB, and
PANTRY on top). You do not yet know which of those layers you actually need, and you would rather not
guess. This page is one prompt that answers that for you.

The fastest way to use it: drop this page's link into the coding agent on an empty project and let it
read this itself, then answer its questions. Or copy the block below into a fresh session by hand.
Either way it will not scaffold anything yet. First it interviews you, then it goes and reads the live
stack and the public source, and only then does it come back with an opinionated plan: which layers,
in which order, and why. You approve before anything is written.

**Why an interview and not a one-size scaffold.** BREAD is not one framework, it is a short stack that
builds in one direction, and most projects do not need all of it. A static, content-heavy site is
often just GRAIN plus MILL with no BATCH at all. An operable app with live surfaces wants BATCH under
it. A tour or an AI-review walkthrough pulls in CRUMB. The AI cockpit, PANTRY, is the usual default,
but it is opt-in and the prompt asks you first. The whole point of the interview is to talk you out of
layers you do not need before you install them.

## The prompt

Paste everything between the lines.

```
You are helping me start a new software project that I want to build on the BREAD stack,
a no-build, AI-native web stack by Tjakoen. Do NOT scaffold, install, or write any files
yet. Work in three phases and stop for my approval before phase 3.

PHASE 1 — Interview me. Ask these, a few at a time, and wait for my answers:
  1. In two or three sentences, what is the app and who is it for?
  2. What are its main surfaces or pages? Name the few that matter most.
  3. Is it mostly static content (articles, docs, a portfolio) or does it have
     live, operable surfaces that change state (dashboards, editors, tools an AI or
     a user drives)?
  4. Is it content-heavy? Would authoring pages as Markdown files suit it?
  5. Do you want a guided product tour, or an "AI reviews what changed" walkthrough?
  6. Do you want the PANTRY cockpit (a local dev-docs + AI orchestration server that
     composes the stack into one place)? If you are unsure, I will explain what it does
     and you can decide.
  7. Should any prose (READMEs, notes, UI copy) be written in Tjakoen's personal VOICE,
     or in your own voice? (VOICE is a personal standard; most people building their
     own thing want their own voice here.)
  8. Any hard constraints: an existing framework you must keep, a host (GitHub Pages?),
     a deadline, a team.

PHASE 2 — Learn the stack for yourself. Do not rely on your training data; go read:
  - https://tjakoen.github.io/llms.txt          (the map of the whole stack)
  - https://tjakoen.github.io/standards          (how repos are built + how prose reads)
  - https://tjakoen.github.io/standards/loop     (the loop every repo runs: the work-triggered
                                                  heartbeat, the run ledger, the rails)
  - https://tjakoen.github.io/pantry/docs/getting-started   (install + scaffold + run)
  - https://tjakoen.github.io/grain/docs         (the design system + the AI interface)
  - https://tjakoen.github.io/batch/docs         (the no-build substrate, if the app is operable)
  - https://tjakoen.github.io/crumb/docs         (the guided-tour layer, if I asked for a tour)
  Then skim the public reference implementations on GitHub for how a real repo wires
  these together: github.com/tjakoen/pantry (the cockpit that composes the stack) and
  github.com/tjakoen/tjakoen (the portfolio, a real consumer of every layer). Look at
  github.com/tjakoen/batch and github.com/tjakoen/grain for the layers themselves.

PHASE 3 — Plan, then stop. Given my answers and what you read, come back with:
  a) WHICH LAYERS this project needs and, just as important, which it does NOT, each
     with one line of why. Use this default reasoning and override it with my answers:
       - BATCH: only if the app has operable/live surfaces. A purely static site skips it.
       - GRAIN: almost always, as the design system. It can be the design system even on
         top of a framework that is not BATCH.
       - MILL: if the app is content-heavy (Markdown becomes pages).
       - PROOF: usually yes; it is the plan board and it is cheap to adopt.
       - CRUMB: only if I asked for a tour or an AI-review walkthrough (needs GRAIN + MILL).
       - PANTRY: the default unless I declined it; it composes the layers into one local
         server. If I was unsure, explain it and recommend.
     If my app really wants a framework that is not BATCH, say so plainly and propose GRAIN
     as the design system on top of it rather than forcing the whole stack.
  b) THE WIRING PLAN: the install commands, the file/folder layout, and the first plan
     file to drop in plans/ , in the order I should do them. Follow the setup and repo
     conventions in the standards you just read (the CLAUDE.starter template, the README
     standard with the "Made with Claude" badge, the AI-repo standard). Write prose in
     my voice unless I chose Tjakoen's VOICE.
  c) THE LOOP, WIRED ON DAY ONE, not left as prose for a future session to remember. Name
     the file that carries each one, and say plainly where the answer is "not worth it here":
       - the doctor at session start, and CI on push where the project is on GitHub
       - the gate on turn end, and lint plus typecheck as scripts rather than recalled commands
       - a code graph, if the project will grow past what grep answers cheaply: the
         query-first rule in CLAUDE.md, the freshness hook, the output gitignored, and a
         line in the first plan telling a session to ask the graph before it greps
       - where a run report goes, and whether PANTRY is the surface I get linked to on an
         update instead of a summary in chat. If I am not going to read it, say so and skip it.
     A rule that lives only in prose gets skipped by the third session. Wire it or drop it.
  d) OPEN QUESTIONS and honest trade-offs. Flag anything you are unsure about or where
     the stack is a poor fit, instead of pretending it fits.

Give me the phase-3 plan as something I can approve or edit. Only after I say go do you
write a single file.
```

## After it plans

The plan the AI hands back is a proposal, not a contract. Argue with it. The layers you keep should
each earn their place, and "you do not need this one" is the most useful line the prompt can give you.
When you approve, the fastest concrete path from there is PANTRY's own on-ramp, which installs the
stack behind one dependency and scaffolds the plan board for you: see
[Getting started with PANTRY](https://tjakoen.github.io/pantry/docs/getting-started). The repo-wiring
details the plan will follow live in [the standards](https://tjakoen.github.io/standards), starting
with the [CLAUDE.starter template](https://tjakoen.github.io/standards/claude.starter).

**Then, months later, check it is all still running.** Everything phase 3c wires is wired once and
decays quietly: the hook that never got installed on the second machine, the audit runbook nobody has
executed, the standards link that broke when a standard was renamed. The
[conformance prompt](https://tjakoen.github.io/standards/conformance) is the other end of this page.
It runs on the repo you now have, checks the mechanical half with one command, and judges the eight
things that command cannot, above all whether the loop is wired or only remembered. Run it when a
project has not been worked in a month, and before rolling any new rule out across more than one repo.

---
🤖 **Built with Claude, stack and all.** The prompt above was written the same way I build everything else: with an AI, out loud, on purpose. **I don't prompt and pray, I prompt and prove.** [How I actually work with AI, receipts and all →](https://tjakoen.github.io/notes/ten-times-zero)
