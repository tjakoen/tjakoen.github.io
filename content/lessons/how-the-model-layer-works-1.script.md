# How the model layer works, part one

Status: DRAFT script for Tjakoen to read aloud and edit. Written from the note; not yet read or checked by him.

## Stop 1: Four decisions, one file

This is the technical half of a story I told somewhere else. The other note is about why I built a Model Intelligence Layer. This one is about how it works, piece by piece, so you can build your own. Everything in it comes from the setup I run every day.

So what is it? A Model Intelligence Layer is the part of your setup that owns four decisions. Which model plays which role. Whether that choice was obeyed. What happens when the model is unavailable. And what the run cost, and where the prompt went. Everything else in this lesson is one of those four, built.

It is built to buy three things. It never stalls, it never overspends, and it never leaks private code. It never stalls because a chain of fallback models moves on when one runs out. It never overspends because the paid route waits for an approval I type myself, against a prepaid balance. And it never leaks because each repository has to be cleared, and work has its own lane, so anything that isn't mine stays away from models that might keep it.

None of that means the work runs on weak models. Planning and review stay on the strong tier. That's Opus and Sol, or DeepSeek V4 Pro on Go when Codex is spent. Only light, bounded work goes down the chain.

I call it a layer because of where it sits. On one side is the harness, the program that runs a session, which for me is Claude Code, Codex or OpenCode. On the other side are the models, the rented part. The layer stays the same when either one changes. My loop contract says the model is not part of the contract. The layer is where that sentence gets a mechanism.

The first piece is the registry, and the idea behind it is simple. Work asks for a tier, and the registry says which model that tier is today.

There are three words to hold on to. A tier is how much judgment a kind of work needs, and I have three of them: strong, execution and cheapest. On Claude those are Opus, Sonnet and Haiku. On Codex they are Sol, Sol at low effort, and Luna. A role is a kind of work, pinned to one tier. Orchestration and prose sit on strong. Review, implementation and research sit on execution. Lightweight jobs sit on cheapest. And the registry is the one file where every model identifier lives. It's a single JSON file in my private config repository.

My named agents map to a tier, never to a role, so every configured choice has exactly one kind of value to check. The planner, the goldfish and the writer sit on strong. The goldfish is a fresh reviewer who only ever sees the plan and the files it links, and it comes back in the next lesson. The auditor and the implementer sit on execution. The locator, the one that finds files, sits on cheapest.

Every model entry carries two more things. A cost class says whether a call is free, part of a plan I pay for monthly, or metered by the token. And a private flag says whether I would let that provider see work code. Both of those come back later, and they matter more than they look.

The main session, the one I actually talk to, runs on the execution tier. A main session spends most of its turns typing, reading and wiring, and paying strong-tier prices for that was exactly what I was trying to stop. Effort is a registry setting too, and no pin asks for high. Sonnet runs at medium and Opus at low.

And because the registry is the only home of a model name, a handoff between harnesses names a tier and never a model. The session on the other end looks up its own.

A rule written in a file is only half the job, though. Next, the guard that makes sure the rule is obeyed.

**Digest:** A Model Intelligence Layer owns four decisions about models. Work asks for a tier, and one registry file says which model that tier is today. Every model carries a cost class and a private flag.

**Trial:** Open your own agent config and list every place a model name appears. Count how many files that is, and pick the one file you would make the only home for them.

**Runes:**
what-a-model-intelligence-layer-is | it never stalls, it never overspends and it never leaks private code
the-registry-and-tiers-instead-of-models | the registry says which model that tier is today
the-registry-and-tiers-instead-of-models | names a tier and never a model

## Stop 2: The guard, and why I never switch models mid-session

A rule that lives in a document is a suggestion. The first rule I enforced was the plainest one I had. Every main session runs the registry's main model, and nothing in a menu or a spawner's defaults changes that.

It needed enforcing for two reasons. A session started by another session inherits that session's model. And I can pick anything I like from the picker, which, knowing me, I will.

The guard is one shell script wired to four hook events. A hook is a command the harness runs at a fixed moment, such as the first prompt. The script reads the model out of the transcript, the session's saved message log, because the desktop app's start event doesn't carry one.

The note this lesson comes from is its own small proof. The session that drafted it opened on Opus. The registry says Sonnet. So the guard stopped it before it did any work. It proposed a restart card titled with the right model and effort, the card carried my original prompt, and I clicked it. The replacement session is the one that wrote the note. The stopped session then offered me two reply buttons, archive it or keep it, and it archived itself only after detaching the replacement.

That order isn't taste. Archiving a parent archives its children. And the app's automatic mode refuses an archive a hook asks for. That's why the restart is a click and the archive is a reply.

Three rules came out of the live runs. First, if my first prompt says keep this model, that records an exception for that one session and nothing else. There is no standing exemption. Second, a replacement that is still on the wrong model never respawns. It takes the blocking path, so a desktop app that ignores the model argument gives me one blocked session, never a loop. Third, on every other harness the guard exits with an error on the first prompt, prints the restart command and asks me to paste the prompt again. The prompt never goes inside a command, so there's no shell quoting to get wrong.

It took six live runs before it passed acceptance. The run report holds the evidence.

Now the obvious question. What happens when a piece of work genuinely needs a stronger model? I don't switch to one. I delegate to one.

Reaching for a stronger model means handing one piece to a subagent pinned to the strong tier, while the main session keeps its own model and its cache. A subagent is a child session the main session starts for one piece of work, and its context ends when the piece does.

There are two reasons it works this way. A hook can't switch the main session's model in the first place. And switching mid-session would throw away the prompt cache, which is the provider's stored copy of the conversation that makes repeat turns cheaper. Switch, and the whole conversation gets paid for again at the new price.

So Opus on Claude Code and Sol on Codex and OpenCode keep planning and review. When the Codex plan is spent, DeepSeek V4 Pro on the Go plan takes the strong tier, still behind the repository's clearance. And nothing in the light chain is ever allowed to take that work.

That word clearance has come up twice now, so it's time to explain it. Next stop, the private flag and the one question I answer per repository.

**Digest:** A guard stops any main session on the wrong model before it does work, and offers a restart. Hard work goes to a strong subagent instead of switching the main model, so the cache survives.

**Trial:** Think of the last time you switched models halfway through a long session. Write down which single piece of that work actually needed the stronger model, and how you would have handed just that piece off.

**Runes:**
the-guard-that-restarts-a-session-on-the-wrong-model | A rule that lives in a document is a suggestion.
hard-work-is-delegated-never-switched-to | Nothing in the light chain is ever allowed to take them.

## Stop 3: Who gets to see the code

Every model in my registry carries a private flag, and the reason is honest laziness. A free endpoint may keep whatever you send it, and I can't read every provider's terms every time I add a model. DeepSeek, the paid API included, is a service under a different jurisdiction than mine. So I stopped reasoning about each one and wrote the answer into the registry once.

A model is private when it comes from one of the two providers I would let see work code. Otherwise it isn't. The route check reads that flag, so a model nobody has classified never gets the benefit of the doubt.

In practice that means Anthropic's models and OpenAI's models are private. Every free model is not private. Every DeepSeek model is not private either, whether it runs free, on the Go plan or on the paid API. That includes the DeepSeek V4 Pro that Go serves, because the Go provider is the one serving it. And an id nobody has listed is recorded as unknown and not private. A model nobody classified is never counted as safe.

One more word before I go on. An escalation, in my setup, is a request to step outside the normal chain to a model that costs more. It waits for an approval only I can type. That gets its own stop in the next lesson.

A flag is not a decision, though. A flag says what a model is. It doesn't say whether this particular code may go to it. So the second piece is a question I answer once per repository.

The first time the route check runs in a repository it has no entry for, it stops and asks me whether non-private models may see this code. The route check is the script that picks the model for a delegated task, and it's the star of the next stop.

If I answer yes, the repository is cleared, and the full chain applies to it. If I answer no, only Claude and Codex are candidates. The work still runs. It just never leaves those two providers. Nothing is cleared by default, and I clear repositories one at a time, by hand.

The answer gets stored under the lower-cased absolute path of the repository's top level. That way a subfolder, or a worktree, which is a separate checkout of the same repository, maps back to its own repository. The whole store is a small list of true and false. Not clever, and exactly as clever as it needs to be.

I like this piece because of how little it asks of me. I don't have to remember which providers keep prompts. I don't have to remember which repositories are mine to share. I answered each question once, in the moment it first mattered, and the layer remembers.

With the flag and the clearance in place, the layer knows what it's allowed to do. Next, what it actually does when a model runs out, which is the part that fixed the problem I built all this for.

**Digest:** Every model is flagged private or not, and an unlisted model counts as not private. Each repository gets asked once whether non-private models may see it, and nothing is cleared by default.

**Trial:** List the repositories you worked in this week. Mark each one yes or no for whether a free model that might keep your prompts may see its code.

**Runes:**
repository-clearance-and-the-privacy-flag | A flag is not a decision
repository-clearance-and-the-privacy-flag | Nothing is cleared by default
repository-clearance-and-the-privacy-flag | Not clever, and exactly as clever as it needs to be.

## Stop 4: The light chain, in order

This is the part that fixed the running-out problem. It's the same ladder I already used inside Claude, Sonnet down to Haiku, stretched across providers and all the way down to free.

For light work, the layer tries these in order and takes the first one that isn't skipped. First, one free model, DeepSeek V4.1 Flash Free. Then the same model on OpenCode Go, a flat monthly plan. Then Luna and Sol on the Codex plan I already pay for.

Claude isn't in this chain, and the reason is the plan, not the model. As far as I have tested, Anthropic admits a third-party harness only through an API token, which is billed on its own and isn't tied to a plan's usage. Codex admits its plan directly, so OpenCode can spend the Codex plan I already pay for. A Claude plan can only be spent inside Claude Code. So the Anthropic plan lives one level up, in its own harness.

The chain used to hold five free models, and now it holds one. OpenCode's free models share one daily message cap, so when one runs out they all do. Five of them were one fallback in practice. I keep Go's extra usage setting off, because with it on, an exhausted allowance would bill credits with nobody approving it. And the paid DeepSeek API left the order altogether and became an escalation. The free model stays ahead of Go until a review on 30 November 2026, against a week of what my desk recorded.

A pick is sticky. Once a delegated task is running on a model, it stays there as long as the model is usable. It doesn't hop back up the chain the moment something above it frees up. The next delegation starts again from the top, so a reset cap gets used at the next task, never in the middle of one.

So what happens on a delegated light task? The route check reads the chain and my current state. Which models are cooling down, meaning resting for a set time after a rate limit. Which are demoted, meaning benched for the rest of the day after repeated failures. And which plans are marked out.

Then it skips what it must. A model is skipped when it isn't private and the repository isn't cleared, when it's cooling down, when it's demoted, when it's a Codex model and the Codex plan is out, or when it's Go and Go's allowance says the limit is reached. The plugin that launches each child reads that allowance through OpenCode's own server before a pick, so no key leaves it and Go is skipped before a request can fail.

Then it picks the first entry left and hands back one line with the model, the provider, the cost class, the private flag, the effort and the reason. And when it can't pick, it says why with a distinct exit code. Unknown harness or tier. I'm needed. No private model is available. A hard gate. Or every candidate is spent, in which case the session writes a checkpoint, stops, and asks me.

When a model fails, the type of failure decides what happens. A rate limit or quota error puts that model on a cooldown, sixty minutes by default. A plain error only counts toward demotion, and three in a row bench the model for the day. A quota failure on a Codex or Claude model marks that whole plan out until the reset time the error gives, or six hours when it gives none. Every one of those numbers is a registry setting, so tuning one is never a code change.

If a child dies on a rate limit, the plugin tells the route check, takes one new pick and tries once more. One retry, on purpose. A second failure stops the task and shows me the error, because a retry loop across the whole chain is a good way to find a new way to waste an evening.

One honest note. The chain serves delegated light work. The main OpenCode session runs Sol, and if that allowance stops it, the registry has its own recovery order, with a paid request only at the very end, waiting for me.

That paid request is where the next lesson picks up.

**Digest:** Light work walks one free model, then the Go plan, then Codex, and takes the first one not skipped. Picks are sticky, failures cool or bench a model, and a failed child gets exactly one retry.

**Trial:** Write your own light chain in order, cheapest first, as three or four lines. Next to each one, write the single condition that should make the layer skip it.

**Runes:**
the-light-chain-in-order | the reason is the plan, not the model
the-light-chain-in-order | A pick is sticky.
the-light-chain-in-order | One retry, on purpose.
