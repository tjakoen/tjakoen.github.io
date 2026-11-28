---
title: "From a Chat Window to Your First Loop"
audience: [learn]
level: intro
subtitle: "A chat window forgets you the moment you close it. A loop is what you build so the next session already knows where you are, and the first version is three small files."
author: "Tjakoen Stolk"
status: DRAFT
type: note
series: harbor
seriesOrder: 11
date: 2026-11-28
readingTime: "~4 min"
tags: [ai, workflow, teaching]
summary: >
  A chat assistant answers and forgets. A harness works inside your project, so what you want it to
  remember can live in files. Your first loop is a front-door file, a plan file and one check, run in
  that order every session. Any harness works. This is the smallest version, and the full setup is
  another note.
social: |
  A chat window answers you and forgets you the moment you close it.

  The first step off that is smaller than people think: a harness that works inside your project, three
  small files, and one check you run every session.

  Here's the smallest loop I know how to explain:
socialImage: "/media/notes/from-a-chat-window-to-your-first-loop-social.png"
socialImageAlt: "A card from the Harbor path of Learn AI with me, titled From a Chat Window to Your First Loop, with the line: A chat window answers you and forgets you the moment you close it."
---

If you use ChatGPT or something like it today, you already know the rhythm. You paste in some code, ask a
question, copy the answer out, and paste it back into your project by hand. It's useful. It's also a loop where
you're the only part that remembers anything, and you're the courier between the chat and your files.

Every note so far has asked for something a chat window can't give you: a brief that stays in the project, a plan
you tick off, a check that runs, a skill saved in the folder. Those all need something that can see your files.
That's the harness from the last note, and this note is the step from there to your first loop.

## What changes when it's in your project

A harness opens in your project folder. It can read what's there, make changes, run commands, and show you
what it did. That sounds like a small upgrade and it's the whole difference. Nothing needs to be pasted.
Your plan is a file the agent opens, not a paragraph you retype.

The other half is that the session still forgets. The harness doesn't fix the forgetting, it gives you somewhere
to put what shouldn't be forgotten. So the project becomes the memory, and the loop is the habit of keeping
it up to date.

## Three small files and one check

You don't need my setup to start. You need these.

**A front-door file.** One short file at the top of your project that the agent reads first. It says what the
project is, how to run it, and the rules you care about, such as "ask before deleting anything" or "write
a test for each step". Different harnesses look for different file names, so ask yours what it expects. Keep it
to about a screen. When the agent does something you didn't want, you add a line.

**A plan file.** The one from the plan note: the goal, the steps, and a done line for each. It's what a new
session reads to find out where you are.

**One check.** A single command that says whether your project still works, such as your tests, or just
"does the page load". Pick one. Put the command in the front-door file so the agent runs it without being
asked.

**The loop itself is the order you use them in.** Start a session. Have the agent read the front door and
the plan, and say what it thinks the next step is. Build that one step. Run the check. Have it write down what
happened, in the plan. Close the session. The next one picks up from the file.

```mermaid label="The smallest loop: a session reads the front-door file and the plan, builds one step, runs the check, and writes the result back to the plan for the next session."
flowchart LR
  read["Read the front door<br/>and the plan"] --> build["Build one step"]
  build --> check["Run the check"]
  check --> write["Write what happened<br/>into the plan"]
  write -.->|next session| read
```

That's it. It isn't clever and that's the point. The loop is boring on purpose, because a boring loop is one
you'll actually run.

## Any harness works

I use Claude, Codex and DeepSeek, and the same three files work in all of them, with a different name here and
there. Use what you have. If you're not sure what yours expects, ask it: "What file do you read first when
you start in a project, and what should I put in it?" The free lessons at [Claude Academy](https://academy.claude.com)
cover getting a harness running, and this path assumes you've done them.

If something doesn't work, don't read it as a sign you did it wrong. Work with the agent to make it work.
Setups differ more than any guide can cover.

## When you want the full version

What I've described is the first week of a loop. Mine is bigger now, because it earned each addition. When
you're ready for more, [Set Up the Loop With One Prompt](loop-setup.md) gives you the whole thing in a single
prompt you paste into a fresh repo, with a checklist, a report, and a second reader. It's for people who've
run the small version a few times and felt where it runs out.

Until then, resist the urge to install more. A loop with five files you use beats one with twenty you don't.

## Your turn

Open a harness in your portfolio folder. Ask it to write a front-door file from what it can see, then edit that
file until it's true. Make sure the plan file and your one check are mentioned in it. Then run one full pass:
read, build one step, check, write down what happened. Or take a different project and set up your own
version, and tell me what you left out.

**Where I might be wrong.** Three files and a check is my version of small, and a different person might start
with two. Some harnesses remember a little between sessions, and that changes the picture; I still keep the
important parts in the project, because I can read it. A loop also makes it easy to feel organized while
building nothing. If you're writing more plan than code for a week, that's the signal to stop and build.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
