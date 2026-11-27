# The AI says it's done. Make it prove it.

Status: DRAFT script for Tjakoen to read aloud and edit. Not yet read or checked by him.

Same format as the other scripts: one idea a beat, about 20 to 45 seconds, names the phrase in the note that lights up, and adds the why or the practice instead of repeating the page. Define a term in a clause and tell the listener to ask their agent. Claude Academy already covered the tools.

## Stop 1: Done is a claim

**Beat 1**
highlight: intro | Done! Everything is working and all the tests pass.

You've heard this. It feels great for ninety seconds, and then the button does nothing. The AI isn't lying. It's telling you what it believes, like a teammate who says "yeah, I looked at it" without opening the file.

**Beat 2**
highlight: done-is-a-claim-not-a-result | They're what you check against.

This is why the brief, the drawing and the plan matter. They're what you check against. Without them, "is it done?" has no answer. With them it has three.

**Beat 3**
highlight: make-it-show-you-the-evidence | show me the evidence that it's true

Don't ask "is it done?" Ask for evidence for every done line. Something you can see. Command output, a screenshot, a test that failed before and passes now. A claim without evidence goes back in the pile.

**Digest:** Done is a claim, not a result. Check it against the brief, the drawing and the plan, and ask for evidence you can see for each done line.

**Trial:** Take the last thing your AI called finished and ask it to show evidence for each done line.

**Runes:**
done-is-a-claim | They're what you check against.

## Stop 2: Let tests do the checking

**Beat 1**
highlight: let-tests-do-the-checking | you're in good company

Testing often gets skipped in school. If it's new to you, you're in good company. So here's the idea from scratch. You already test your work. You open the page, click the button, and see if it works.

**Beat 2**
highlight: let-tests-do-the-checking | a little program

A test is that same check, written down as a little program. A machine runs it in a second, as many times as you want, and never forgets a step. Make a task, mark it done, check that it's done. It says pass or fail, and a fail tells you where to look.

**Beat 3**
highlight: let-tests-do-the-checking | drives the whole app the way a user would

Two kinds to know by name. A unit test checks one small piece, and you can have hundreds. An end-to-end test drives the whole app the way a user would. Open the page, add a task, tick it, refresh. Slower, fewer, and the closest to asking whether it really works. The note links to good explanations of both. I'm not teaching the tools. Ask your agent how your stack does it.

**Beat 4**
highlight: let-tests-do-the-checking | the AI writes the tests as it builds

Here's the habit I'd wire in from day one. The AI writes the tests as it builds. Every done line in your plan gets a test, and a step isn't finished until its tests pass. Now it's accountable to its own definition of done. It can't say "done" while a test is failing.

**Beat 5**
highlight: let-tests-do-the-checking | The tests are a memory that runs.

And it helps whoever comes next. Tomorrow's session is another forgetful AI. It can change the code, run the tests, and find out whether it broke something. The tests are a memory that runs.

**Beat 6**
highlight: let-tests-do-the-checking | ask to see a new test fail before it passes

One trick. Ask to see each new test fail before it passes. A test that has never failed might not be checking anything. Watching it go from failing to passing is how you know it can tell the difference.

**Digest:** A test is the check you already do by hand, written down so a machine runs it. A unit test checks one small piece, an end-to-end test drives the whole app like a user. Tell the AI to write tests as it builds, one for each done line, and to show each new test fail before it passes.

**Trial:** Ask your AI to add a test for one done line in your plan, show it failing first, then passing, and explain what it proves.

**Runes:**
ai-writes-the-tests | the AI writes the tests as it builds
tests-are-memory | The tests are a memory that runs.

## Stop 3: Run it, then ask fresh eyes

**Beat 1**
highlight: run-it-yourself | Open the thing and use it the way a user would.

Then do the part nobody can do for you. Open it and use it like a user. A minute or two. And skim the list of changed files against your leave-alone list. Reading a diff gets easier fast, and it's the skill I'd most encourage you to build.

**Beat 2**
highlight: then-ask-a-fresh-pair-of-eyes | the session that built something is the worst judge of it

Now the trick. Open a brand new session, give it the brief, the plan and the changes, and ask it to find what's wrong. In my experience the session that built something is a poor judge of it, because it remembers its own reasoning and agrees with itself.

**Beat 3**
highlight: then-ask-a-fresh-pair-of-eyes | That's my experience, not a measurement

And be honest about that. It's my experience, not a measurement. Test it yourself on something small. If it finds nothing, you've earned a little trust in that piece of work.

**Digest:** Use it yourself like a user and read the list of changed files. Then give a fresh session the brief, the plan and the changes, and ask it to find problems.

**Trial:** Run your last piece of work yourself, then open a new session and ask it to review the brief, plan and changes.

**Runes:**
fresh-eyes | the session that built something is the worst judge of it

## Stop 4: Write down what it keeps missing

**Beat 1**
highlight: write-down-what-it-keeps-missing | Write it down

When you catch the same miss twice, don't just fix it. Write it down in the file where your brief lives. Next session reads it. That list is your checklist, and it's the start of making this yours.

**Beat 2**
highlight: write-down-what-it-keeps-missing | worth automating

My loop runs checks like these automatically, and PANTRY has a doctor that checks the loop is wired up. But I'd do it by hand first, because that's how you learn which checks are worth automating. That's also where a skill starts, which is the next lesson.

**Beat 3**
highlight: checking-is-not-proof | You're still the person accountable

One honest limit. None of this makes mistakes impossible. A fresh reviewer can miss things or invent problems. You're still accountable for what ships, so you still have to understand it.

**Beat 4**
highlight: try-this | Write down anything the review found

Your trial is the whole thing. Evidence, run it yourself, fresh session, and write down what the review found that the first session didn't.

**Digest:** When you catch the same miss twice, write it in the file your sessions read. Do the checks by hand first, so you learn which ones are worth automating. You're still accountable for what ships.

**Trial:** Ask for evidence, run it yourself, review it in a fresh session, and write down anything the review found that the first session missed.

**Runes:**
write-it-down | Write it down
accountable | You're still the person accountable
