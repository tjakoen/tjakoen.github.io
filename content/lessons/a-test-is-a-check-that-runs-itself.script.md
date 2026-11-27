# A test is a check that runs itself

Status: DRAFT script for Tjakoen to read aloud and edit. Not yet read or checked by him.

Same format as the Harbor script: one idea a beat, about 20 to 45 seconds, names the phrase in the note that lights up, and adds the story, the why or the practice instead of repeating the page. This is a journey and an invitation, not a tutorial. Define a term in a clause and tell the listener to ask their agent. Claude Academy already covered the tools.

## Stop 1: The seatbelt

**Beat 1**
highlight: intro | They're the seatbelt that lets me drive fast.

Tests are the least glamorous rule I follow, and they do the most work. They're the seatbelt that lets me drive fast. In my own repos, the type-checker and the tests have to come back green before I call anything done.

**Beat 2**
highlight: intro | you're in good company

Testing often gets skipped in school. If this is new to you, you're in good company. So here's the idea from scratch.

**Beat 3**
highlight: its-the-check-you-already-do | A test is that same check written down as a little program

You already test your work. You open the page, click the button, see if it works. A test is that same check, written down as a little program. A machine runs it in a second, as often as you want, and never forgets a step. It says pass or fail, and a fail tells you where to look.

**Digest:** A test is the check you already do by hand, written down so a machine runs it. | It says pass or fail, and a fail tells you where to look.

**Trial:** Name one check you do by hand every time you change something in your portfolio.

**Runes:**
intro | They're the seatbelt that lets me drive fast.

## Stop 2: Two kinds, by name

**Beat 1**
highlight: two-kinds-worth-knowing-by-name | it checks one small piece on its own

Two kinds to know by name. A unit test checks one small piece on its own, and you can have hundreds.

**Beat 2**
highlight: two-kinds-worth-knowing-by-name | drives the whole app the way a user would

An end-to-end test drives the whole app the way a user would. Open your portfolio, find the roadmap, click an evidence link, check it opens. Slower, fewer of them, and the closest thing to asking whether it really works. The note links to good explanations of both. I'm not teaching the tools. Every language has a standard way to test, so ask your agent what yours is.

**Beat X**
highlight: two-kinds-worth-knowing-by-name | figure: the test pyramid in words

Here is how the two kinds fit. Many unit tests at the base, because each checks one small piece and runs in a blink. A few end-to-end tests on top, because they drive the whole app the way a user would, and they're slower. The Practical Test Pyramid article linked in the note tells the longer version if you want it.

**Digest:** A unit test checks one small piece, an end-to-end test drives the whole app like a user. | Every stack has a standard way to test, so ask your agent.

**Trial:** Ask your agent what the usual way to test your stack is, and how to run the tests.

**Runes:**
two-kinds-worth-knowing-by-name | it checks one small piece on its own

## Stop 3: Make the AI write them

**Beat 1**
highlight: make-the-ai-write-them-as-it-builds | the AI writes the tests as it builds

Here's the habit I'd wire in from day one, and put right in your brief. The AI writes the tests as it builds. Every done line in your plan gets a test, and a step isn't finished until its tests pass. Now it's accountable to its own definition of done. It can't say done while a test is failing.

**Beat 2**
highlight: make-the-ai-write-them-as-it-builds | The tests are a memory that runs.

And it helps whoever comes next. Tomorrow's session is another forgetful AI. It can change the code, run the tests, and find out whether it broke something. The tests are a memory that runs.

**Beat 3**
highlight: make-the-ai-write-them-as-it-builds | ask to see a new test fail before it passes

One trick. Ask to see each new test fail before it passes. A test that has never failed might not be checking anything.

**Beat 4**
highlight: your-turn | I'd skip them

And where I might be wrong. Tests can be weak, and they cost time to keep. For a one-evening experiment I'd skip them. The moment something matters to me, I add them.

**Digest:** Tell the AI to write tests as it builds, one for each done line. | Ask to see each new test fail before it passes. | Skip them for a throwaway experiment, add them when it matters.

**Trial:** Ask your AI to add a test for one done line in your plan, show it failing first, then passing, and explain what it proves.

**Runes:**
make-the-ai-write-them-as-it-builds | the AI writes the tests as it builds
make-the-ai-write-them-as-it-builds | The tests are a memory that runs.
