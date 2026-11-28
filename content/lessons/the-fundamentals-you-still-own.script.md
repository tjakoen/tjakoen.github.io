# The fundamentals you still own

Status: DRAFT script for Tjakoen to read aloud and edit. Not yet read or checked by him.

Same format as the Harbor script: one idea a beat, about 20 to 45 seconds, names the phrase in the note that lights up, and adds the story, the why or the practice instead of repeating the page. This is a journey and an invitation, not a tutorial. Why your job turns into reviewing, and four fundamentals that matter more for it: reading a diff, git, code a stranger can follow, and tests.

## Stop 1: Your job turns into reading

**Beat 1**
highlight: intro | my job is to say yes, no, or not like that

Here is what I did not see coming. I expected to write less and think the same amount. Instead I read more than ever. Every step the agent takes comes back as a pile of changes, and my job is to say yes, no, or not like that.

**Beat 2**
highlight: reading-a-diff | Look hardest at what was deleted

A diff is the list of changes: these lines out, these lines in. If you cannot read one, you are approving on trust. Read the files before the lines, ask what each change is for, and look hardest at what was deleted, because that is where quiet damage hides.

**Beat 3**
highlight: reading-a-diff | what to look for in a code review

Google publishes a short list of what a reviewer looks for. It was written for people reviewing people. It works on an agent too, and that is the version that matters now.

**Digest:** When an AI types, you read more than you write. | A diff is the list of changes, and approving one you cannot read is approving on trust. | Read the files, ask what each change is for, and look hardest at what was deleted.

**Trial:** After your next small change, ask your AI to explain the diff line by line, then find one line it glossed over and ask about that one.

**Runes:**
intro | my job is to say yes, no, or not like that
reading-a-diff | Look hardest at what was deleted

## Stop 2: Undo, and code a stranger can read

**Beat 1**
highlight: git-so-every-step-can-be-undone | If your last commit is clean, a bad session costs you nothing.

Git is an undo button that goes back days instead of seconds. It matters more with an agent, because an agent changes many files at once and can be confidently wrong about all of them. If your last commit is clean, a bad session costs you nothing.

**Beat 2**
highlight: git-so-every-step-can-be-undone | small commits

The habit that does the most work is small commits, one per step of your plan. When one goes wrong, throw it away and ask again with a better brief, instead of patching it.

**Beat 3**
highlight: code-a-stranger-can-follow | A new session never remembers why you did a thing

The next reader of your code is a stranger. It might be a teammate, or the AI in a fresh session, or you in three months. A new session never remembers why you did a thing, so the code itself has to say. Clear names and small functions. You ask for that now, and you check that you got it.

**Digest:** Git is an undo button that goes back days. | Commit small, one per plan step, with a message that says what it did. | Write code a stranger can follow, because the next session is a stranger.

**Trial:** Commit before the next step of your plan. When a step goes wrong, throw it away and ask again with a better brief.

**Runes:**
git-so-every-step-can-be-undone | If your last commit is clean, a bad session costs you nothing.
code-a-stranger-can-follow | A new session never remembers why you did a thing

## Stop 3: Tests, and what you still own

**Beat 1**
highlight: tests-so-done-means-something | A diff can look perfect and break something three files away

You met tests in the last note, so here is only where they sit. Reading the diff tells you what changed. A test tells you whether the thing still works. A diff can look perfect and break something three files away, and a test can pass while testing the wrong thing. Neither is enough alone.

**Beat 2**
highlight: tests-so-done-means-something | figure: The review loop

The whole routine fits in one loop. The AI changes something, you read the diff, the tests run, and you commit if it passes. If it fails, or the diff looks wrong, you throw it away and ask again.

**Beat 3**
highlight: what-im-not-saying | Could I explain this, and fix it, if the AI weren't here tomorrow?

You do not need to master all four before you begin. You learn them by using them, and the AI is a patient tutor for each. The question I keep coming back to is the one from the plan note. Could I explain this, and fix it, if the AI were not here tomorrow? These four are how you keep saying yes.

**Beat 4**
highlight: your-turn | Pick the one that

And where I might be wrong. A different person would give you five or six. Pick the one that would hurt most to be missing, and start there.

**Digest:** A diff tells you what changed. A test tells you whether it still works. You want both. | Skipping the fundamentals does not make you faster. It makes you someone who cannot finish or fix things. | Could I explain this, and fix it, if the AI were not here tomorrow?

**Trial:** Ask your AI for one small change, then do the whole routine by hand: commit first, read the diff yourself, run the tests, and note what you caught.

**Runes:**
tests-so-done-means-something | A diff can look perfect and break something three files away
what-im-not-saying | Could I explain this, and fix it, if the AI weren't here tomorrow?
