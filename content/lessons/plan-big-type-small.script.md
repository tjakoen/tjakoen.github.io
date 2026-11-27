# Plan on the big model, type on the small one

Status: DRAFT script for Tjakoen to read aloud and edit. Cut into beats from the earlier narration; not yet read or checked by him.

How this script works. The note stays open on the page while the recording plays. Each beat is a short spoken line about one idea, and it names the phrase in the note that lights up while it plays. The wording is the earlier narration, cut to the lines that carry the idea. Format of a beat: a highlight line (section id, then a quote that must appear in that section of the note, or figure: and a figure name), then the spoken words.

## Stop 1: Thinking and typing are different jobs

**Beat 1**
highlight: the-question-that-made-me-write-this | Every turn was paying top rate

Their sessions kept hitting the limit before lunch, and they wanted to know what I was doing differently.

I watched them work for a few minutes. Everything ran on the biggest model at the highest effort setting. The planning, the file reads, the one-line fixes, the renames. Every turn was paying top rate, including the turns that were just typing.

I told them two things. Plan and orchestrate on Opus, and let Sonnet subagents do the implementing. And put Opus on low effort for a while and see whether you miss anything.

**Beat 2**
highlight: thinking-and-typing-are-different-jobs | senior engineer to retype a spec.

Here's the first idea. Most of a build task is not hard. Deciding what to change, in which files, in what order, and what done looks like, that's the hard part. Writing the function once all of that is decided is mostly typing. Paying the most capable model to do the typing is like paying a senior engineer to retype a spec.

So treat the big model as the senior engineer, and treat the subagents as subroutines. You wouldn't ask your best engineer to retype a spec. You'd ask them to write it, hand the pieces out, and read what comes back.

**Beat 3**
highlight: thinking-and-typing-are-different-jobs | Only hand off work that is already decided.

The work splits in two. The main session runs on Opus. It reads the code, asks the questions, writes the plan, and cuts the work into pieces small enough that each one has a settled answer.

Opus reads it, checks it against the plan, and either accepts it or sends it back. The expensive model thinks at both ends, and the cheap one types in between.

Only hand off work that is already decided. A subagent given a piece that's still being designed will design it for you, quietly, and you'll find out in review. If you can't write the brief in a few lines, the piece isn't ready to leave.

**Beat 4**
highlight: the-biggest-model-is-not-the-default | It adds a layer on top of it.

I almost never reach for it. That's Fable on the Claude side and Astra on the Codex side. I've played with both, and they're impressive. But for what I do day to day, the tokenomics just don't work. Opus and Sol have built nearly everything I've shipped this year, and the gap between them and the top tier rarely shows up in a pull request.

But even then it doesn't replace the pattern. It adds a layer on top. Plan on Fable, orchestrate on Opus, implement with Sonnet subagents. The expensive model does the one job only it does well, and then it hands off.

**Digest:** Deciding is the hard part, typing is not. Plan and review on the big model, implement with cheaper subagents. Only hand off work that is already decided.

**Trial:** Take one task on your list and try to write its subagent brief in a few lines: the files, the contract, the finish line. If you cannot, the design is not done yet.

**Runes:**
the-question-that-made-me-write-this | Every turn was paying top rate
thinking-and-typing-are-different-jobs | Only hand off work that is already decided.
the-biggest-model-is-not-the-default | It adds a layer on top of it.

## Stop 2: Low effort, and checking what actually ran

**Beat 1**
highlight: try-low-effort-before-you-assume-high | run Opus on low effort

I run Opus on low effort almost all of the time. I want to be honest about why that works for me, because the reason is not the model.

On low effort the model doesn't have to work out from nothing how I like things done, because the repo tells it. The thinking that high effort would spend rediscovering the context is already written down.

**Beat 2**
highlight: try-low-effort-before-you-assume-high | Would more thinking have fixed this

When low effort gets something wrong, ask one question about it. Would more thinking have fixed this, or would one line in my instruction file have fixed it? Usually it's the line. Write it, and every session after that gets it for free, at any effort level. Raise the effort for the turns that earn it, like a hard design call, a bug that has already beaten one attempt, or a plan for a large change. Then drop it again. A miss fixed with thinking is paid for again tomorrow. A miss fixed with a rule is paid for once.

**Beat 3**
highlight: where-the-split-is-actually-wired | A pin in a file is a request.

First, the model is pinned in the agent file, not chosen per task. Each kind of subagent is a short file that names its job, its tools and its model.

When a subagent finishes, a hook reads its transcript and logs which model it actually ran on and how many tokens it spent. PANTRY, my project dashboard, shows that beside every subagent. A pin in a file is a request. The receipt is the proof it was honored.

**Beat 4**
highlight: where-the-split-is-actually-wired | check what actually ran, not what the config says should have.

The delegation nudge was written, tested and documented in August, and then never switched on. For three months it sat there explaining at length why it mattered, to nobody. The receipt didn't exist until this week, so before that I was taking my own setup on faith, which is exactly what I'm telling you not to do. Both are fixed now. Check what actually ran, not what the config says should have.

**Digest:** Low effort works when the repo already holds the context. Test it on your own tasks before you decide. Fix a miss with a written rule, and check what actually ran.

**Trial:** Think of the last thing a session got wrong for you, and write the one line in your instruction file that would have prevented it.

**Runes:**
try-low-effort-before-you-assume-high | Would more thinking have fixed this
where-the-split-is-actually-wired | A pin in a file is a request.
where-the-split-is-actually-wired | check what actually ran, not what the config says should have.

## Stop 3: The floor underneath the split

**Beat 1**
highlight: the-same-pattern-in-codex | the stronger model plans and reviews, the cheaper one types.

It's the same shape. The stronger model plans and reviews, and the cheaper one types. Codex reads an agents file the way Claude Code reads its own instruction file, and in my setup they're the same file. So the rules that make low effort safe in one tool make it safe in the other.

What I was really telling that junior developer is where the intelligence in a session should live. If it lives only in the model, you pay for it on every turn, at the highest rate, and you pay again tomorrow.

**Beat 2**
highlight: the-lesson | where the intelligence in a session should live.

What I was really telling that junior developer is where the intelligence in a session should live. If it lives only in the model, you pay for it on every turn, at the highest rate, and you pay again tomorrow. If it lives in your files, in the plan, the instructions, and the rules you wrote down after something went wrong, then a cheaper model on a lower setting can carry it.

**Beat 3**
highlight: where-this-goes-next | The floor it stands on took me months.

None of what I run today existed on day one. It started as one instruction file with three rules in it. Then a rule I kept repeating to the model became a line in that file. A mistake I kept catching in review became a check. A check I kept forgetting to run became a hook. Every step is something I got tired of saying twice.

That's why low effort works for me. The model is the same one everyone else gets. The floor it stands on took me months.

**Beat 4**
highlight: where-this-goes-next | loop you build around them stays

Every model you use today will be retired. The loop you build around them stays, and it gets better every time you teach it something.

So write it down, and pass it on.

**Digest:** The same split works in Codex, because the rules live in shared files. Put the intelligence in your files, not only in the model. The loop grows one repeated rule at a time.

**Trial:** Write down three rules you keep repeating to the model, and put the first one into your instruction file today.

**Runes:**
the-same-pattern-in-codex | the stronger model plans and reviews, the cheaper one types.
the-lesson | where the intelligence in a session should live.
where-this-goes-next | The floor it stands on took me months.
