# Plan on the big model, type on the small one

Status: DRAFT script for Tjakoen to read aloud and edit. Written from the note; not yet read or checked by him.

## Stop 1: Thinking and typing are different jobs

A junior developer came to me this week with a simple complaint. Their sessions kept hitting the limit before lunch, and they wanted to know what I was doing differently.

I watched them work for a few minutes. Everything ran on the biggest model at the highest effort setting. The planning, the file reads, the one-line fixes, the renames. Every turn was paying top rate, including the turns that were just typing.

I told them two things. Plan and orchestrate on Opus, and let Sonnet subagents do the implementing. And put Opus on low effort for a while and see whether you miss anything.

They had never heard either one. I was honestly surprised, and then I realised why. I've been knee deep in this for months. Somewhere along the way these stopped being decisions and became habits, and a habit is the easiest thing in the world to forget you ever had to learn. So I'm writing it down.

Here's the first idea. Most of a build task is not hard. Deciding what to change, in which files, in what order, and what done looks like, that's the hard part. Writing the function once all of that is decided is mostly typing. Paying the most capable model to do the typing is like paying a senior engineer to retype a spec.

So treat the big model as the senior engineer, and treat the subagents as subroutines. You wouldn't ask your best engineer to retype a spec. You'd ask them to write it, hand the pieces out, and read what comes back. A subroutine takes a clear input, does one job, and returns a result without dragging its working notes back into the caller. That is exactly what a good subagent is.

The work splits in two. The main session runs on Opus. It reads the code, asks the questions, writes the plan, and cuts the work into pieces small enough that each one has a settled answer. Each piece goes to a Sonnet subagent with a short brief. The files, the contract, the finish line. The subagent works in its own context and hands back a result. Opus reads it, checks it against the plan, and either accepts it or sends it back. The expensive model thinks at both ends, and the cheap one types in between.

There's a second saving hiding in that. Every file a subagent reads lives in the subagent's context, not the main one. The orchestrating session stays small, so every later turn in it is cheaper, and the plan doesn't get buried under a pile of file dumps.

The split has one rule that matters more than the rest. Only hand off work that is already decided. A subagent given a piece that's still being designed will design it for you, quietly, and you'll find out in review. If you can't write the brief in a few lines, the piece isn't ready to leave.

Now, what about the very top tier? I almost never reach for it. That's Fable on the Claude side and Astra on the Codex side. I've played with both, and they're impressive. But for what I do day to day, the tokenomics just don't work. Opus and Sol have built nearly everything I've shipped this year, and the gap between them and the top tier rarely shows up in a pull request.

Where Fable has earned its place is research and audits. Reading a whole project and telling me what I got wrong, or working through a question where breadth and depth matter more than speed. It's been a godsend for that. But even then it doesn't replace the pattern. It adds a layer on top. Plan on Fable, orchestrate on Opus, implement with Sonnet subagents. The expensive model does the one job only it does well, and then it hands off.

That leaves the second piece of advice, the one that surprised the junior developer more. Next, I'll talk about running the big model on low effort, and why that only works because of what's sitting in the repo.

**Digest:** Deciding is the hard part, typing is not. Plan and review on the big model, implement with cheaper subagents. Only hand off work that is already decided.

**Trial:** Take one task on your list and try to write its subagent brief in a few lines: the files, the contract, the finish line. If you cannot, the design is not done yet.

**Runes:**
the-question-that-made-me-write-this | Every turn was paying top rate
thinking-and-typing-are-different-jobs | Only hand off work that is already decided.
the-biggest-model-is-not-the-default | It adds a layer on top of it.

## Stop 2: Low effort, and checking what actually ran

I run Opus on low effort almost all of the time. I want to be honest about why that works for me, because the reason is not the model.

Over the past months I built a loop around the model. Instruction files that say how each repo works. Standards installed as skills. Hooks that check the work at the start of a session and before it's called done. And a plan file for every piece of work. On low effort the model doesn't have to work out from nothing how I like things done, because the repo tells it. The thinking that high effort would spend rediscovering the context is already written down.

A fresh setup doesn't have that, so low effort may cost you something there. Don't take my word for it either way. Run a trial. Pick twenty ordinary tasks from your backlog, the kind you do every week. Do ten on medium effort and ten on low. Have your agent log each one as it finishes, with the task, the effort setting, the tokens used, whether it needed a second attempt, and what you had to correct. Then compare the two halves.

When low effort gets something wrong, ask one question about it. Would more thinking have fixed this, or would one line in my instruction file have fixed it? Usually it's the line. Write it, and every session after that gets it for free, at any effort level. Raise the effort for the turns that earn it, like a hard design call, a bug that has already beaten one attempt, or a plan for a large change. Then drop it again. A miss fixed with thinking is paid for again tomorrow. A miss fixed with a rule is paid for once.

Advice is cheap, so here's where mine actually lives. This week I went looking to check that the split was doing what I tell people it does. It mostly was. Mostly.

First, the model is pinned in the agent file, not chosen per task. Each kind of subagent is a short file that names its job, its tools and its model. A locator, which only answers where something is defined, runs on Haiku. An implementer, which types a change that's already decided, runs on Sonnet. An auditor and a writer, the two whose mistakes are expensive, stay on Opus. The main session never decides this mid-flight. It picks the kind of subagent, and the file picks the model.

Second, a brief that can't be written doesn't get sent. A hook runs before every spawn and refuses one that's missing four things. The lane, the scope cap, the hard stops, and what should make the subagent stop and ask. That's the rule about handing off only decided work, turned from advice into a gate.

Third, the nudge to delegate counts reads, not models. Another hook watches the main session, and after fifteen file reads and searches with no subagent spawned, it says so once. I measured why it nudges toward delegating instead of toward a cheaper model. Across twelve of my sessions, cache reads were ninety-four percent of all input tokens. That's a snapshot, from August. Nothing leaves a conversation once it enters, so a file read early is paid for again on every turn after it. A subagent keeps that file out of the main thread for good, and that saving is bigger than any discount on the model.

Fourth, the model switch happens once, at the start, or not at all. A hook reads the first prompt and suggests a stronger model only when the task looks like it earns one, like a refactor across many files or a hard design call. It never suggests a switch later, because changing the model halfway through throws the whole cached conversation away and you pay to rebuild it.

And now there's a receipt. When a subagent finishes, a hook reads its transcript and logs which model it actually ran on and how many tokens it spent. PANTRY, my project dashboard, shows that beside every subagent. A pin in a file is a request. The receipt is the proof it was honored.

Here's the mostly. The delegation nudge was written, tested and documented in August, and then never switched on. For three months it sat there explaining at length why it mattered, to nobody. The receipt didn't exist until this week, so before that I was taking my own setup on faith, which is exactly what I'm telling you not to do. Both are fixed now. Check what actually ran, not what the config says should have.

Next, the same pattern outside Claude, and the part of all this that outlasts any model.

**Digest:** Low effort works when the repo already holds the context. Test it on your own tasks before you decide. Fix a miss with a written rule, and check what actually ran.

**Trial:** Think of the last thing a session got wrong for you, and write the one line in your instruction file that would have prevented it.

**Runes:**
try-low-effort-before-you-assume-high | Would more thinking have fixed this
where-the-split-is-actually-wired | A pin in a file is a request.
where-the-split-is-actually-wired | check what actually ran, not what the config says should have.

## Stop 3: The floor underneath the split

None of this is specific to Claude. I run Claude, Codex and DeepSeek side by side. In Codex my setup is Sol 6.1 on light for the main session and Luna on medium for the subagents. It's the same shape. The stronger model plans and reviews, and the cheaper one types. Codex reads an agents file the way Claude Code reads its own instruction file, and in my setup they're the same file. So the rules that make low effort safe in one tool make it safe in the other.

What I was really telling that junior developer is where the intelligence in a session should live. If it lives only in the model, you pay for it on every turn, at the highest rate, and you pay again tomorrow. If it lives in your files, in the plan, the instructions, and the rules you wrote down after something went wrong, then a cheaper model on a lower setting can carry it. And the expensive one is free for the few calls that need it.

So plan and review on the big model, and implement on the small one. Only delegate work that's already decided, with a brief of a few lines. Save the top tier for research and audits, and put it above the pattern, not in place of it. Measure low effort against medium on your own work before you decide. And fix a miss with a written rule before you reach for more thinking.

Here's what I told them at the end, and what I'd tell anyone starting out. The model split and the effort setting are the easy part. They save you tokens this week. What saves you tokens, time and frustration for the rest of your career is the thing underneath them.

None of what I run today existed on day one. It started as one instruction file with three rules in it. Then a rule I kept repeating to the model became a line in that file. A mistake I kept catching in review became a check. A check I kept forgetting to run became a hook. Every step is something I got tired of saying twice. Months of small additions later, I have a loop that orients every session, holds the work to a standard, and refuses to call something done before it is.

That's why low effort works for me. The model is the same one everyone else gets. The floor it stands on took me months.

You can build yours the same way, one rule at a time. I've written about what a harness is, about how my own loop came together and why I needed it, and about setting one up in an afternoon. Those notes are further along this path.

Every model you use today will be retired. The loop you build around them stays, and it gets better every time you teach it something. That's the real skill in working with AI, and you can start on it today, with one file and the first rule you're tired of repeating.

What feels obvious to me after months of doing this was news to someone last week. A year from now, your loop will be the obvious thing you forget you ever had to learn. So write it down, and pass it on. Start with that first rule, and then go set up the loop itself.

**Digest:** The same split works in Codex, because the rules live in shared files. Put the intelligence in your files, not only in the model. The loop grows one repeated rule at a time.

**Trial:** Write down three rules you keep repeating to the model, and put the first one into your instruction file today.

**Runes:**
the-same-pattern-in-codex | the stronger model plans and reviews, the cheaper one types.
the-lesson | where the intelligence in a session should live.
where-this-goes-next | The floor it stands on took me months.
