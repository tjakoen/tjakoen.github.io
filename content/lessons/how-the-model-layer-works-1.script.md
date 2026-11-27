# How the model layer works, part one

Status: DRAFT script for Tjakoen to read aloud and edit. Cut into beats from the earlier narration; not yet read or checked by him.

How this script works. The note stays open on the page while the recording plays. Each beat is a short spoken line about one idea, and it names the phrase in the note that lights up while it plays. The wording is the earlier narration, cut to the lines that carry the idea. Format of a beat: a highlight line (section id, then a quote that must appear in that section of the note, or figure: and a figure name), then the spoken words.

## Stop 1: Four decisions, one file

**Beat 1**
highlight: what-a-model-intelligence-layer-is | owns four decisions: which model plays which role

The other note is about why I built a Model Intelligence Layer. This one is about how it works, piece by piece, so you can build your own. A Model Intelligence Layer is the part of your setup that owns four decisions. Which model plays which role. Whether that choice was obeyed. What happens when the model is unavailable. And what the run cost, and where the prompt went. Everything else in this lesson is one of those four, built.

**Beat 2**
highlight: what-a-model-intelligence-layer-is | it never stalls, it never overspends and it never leaks private code

It is built to buy three things. It never stalls, it never overspends, and it never leaks private code. It never stalls because a chain of fallback models moves on when one runs out. It never overspends because the paid route waits for an approval I type myself, against a prepaid balance. And it never leaks because each repository has to be cleared, and work has its own lane, so anything that isn't mine stays away from models that might keep it.

**Beat 3**
highlight: the-registry-and-tiers-instead-of-models | the registry says which model that tier is today

The first piece is the registry, and the idea behind it is simple. Work asks for a tier, and the registry says which model that tier is today. There are three words to hold on to. A tier is how much judgment a kind of work needs, and I have three of them: strong, execution and cheapest. On Claude those are Opus, Sonnet and Haiku. On Codex they are Sol, Sol at low effort, and Luna. A role is a kind of work, pinned to one tier. Orchestration and prose sit on strong. Review, implementation and research sit on execution. Lightweight jobs sit on cheapest.

**Beat 4**
highlight: the-registry-and-tiers-instead-of-models | names a tier and never a model

A cost class says whether a call is free, part of a plan I pay for monthly, or metered by the token. And a private flag says whether I would let that provider see work code. And because the registry is the only home of a model name, a handoff between harnesses names a tier and never a model. The session on the other end looks up its own.

**Digest:** A Model Intelligence Layer owns four decisions about models. Work asks for a tier, and one registry file says which model that tier is today. Every model carries a cost class and a private flag.

**Trial:** Open your own agent config and list every place a model name appears. Count how many files that is, and pick the one file you would make the only home for them.

**Runes:**
what-a-model-intelligence-layer-is | it never stalls, it never overspends and it never leaks private code
the-registry-and-tiers-instead-of-models | the registry says which model that tier is today
the-registry-and-tiers-instead-of-models | names a tier and never a model

## Stop 2: The guard, and why I never switch models mid-session

**Beat 1**
highlight: the-guard-that-restarts-a-session-on-the-wrong-model | A rule that lives in a document is a suggestion.

A rule that lives in a document is a suggestion. The first rule I enforced was the plainest one I had. Every main session runs the registry's main model, and nothing in a menu or a spawner's defaults changes that. It needed enforcing for two reasons. A session started by another session inherits that session's model. And I can pick anything I like from the picker, which, knowing me, I will. The guard is one shell script wired to four hook events. A hook is a command the harness runs at a fixed moment, such as the first prompt.

**Beat 2**
highlight: the-guard-that-restarts-a-session-on-the-wrong-model | session that drafted it opened on Opus

The note this lesson comes from is its own small proof. The session that drafted it opened on Opus. The registry says Sonnet. So the guard stopped it before it did any work. It proposed a restart card titled with the right model and effort, the card carried my original prompt, and I clicked it. The replacement session is the one that wrote the note.

**Beat 3**
highlight: the-guard-that-restarts-a-session-on-the-wrong-model | keep this model, records an exception

First, if my first prompt says keep this model, that records an exception for that one session and nothing else. There is no standing exemption. Second, a replacement that is still on the wrong model never respawns. It takes the blocking path, so a desktop app that ignores the model argument gives me one blocked session, never a loop.

**Beat 4**
highlight: hard-work-is-delegated-never-switched-to | Nothing in the light chain is ever allowed to take them.

What happens when a piece of work genuinely needs a stronger model? I don't switch to one. I delegate to one. Reaching for a stronger model means handing one piece to a subagent pinned to the strong tier, while the main session keeps its own model and its cache. A hook can't switch the main session's model in the first place. And switching mid-session would throw away the prompt cache, which is the provider's stored copy of the conversation that makes repeat turns cheaper. Switch, and the whole conversation gets paid for again at the new price. And nothing in the light chain is ever allowed to take that work.

**Digest:** A guard stops any main session on the wrong model before it does work, and offers a restart. Hard work goes to a strong subagent instead of switching the main model, so the cache survives.

**Trial:** Think of the last time you switched models halfway through a long session. Write down which single piece of that work actually needed the stronger model, and how you would have handed just that piece off.

**Runes:**
the-guard-that-restarts-a-session-on-the-wrong-model | A rule that lives in a document is a suggestion.
hard-work-is-delegated-never-switched-to | Nothing in the light chain is ever allowed to take them.

## Stop 3: Who gets to see the code

**Beat 1**
highlight: repository-clearance-and-the-privacy-flag | may keep whatever you send

Every model in my registry carries a private flag, and the reason is honest laziness. A free endpoint may keep whatever you send it, and I can't read every provider's terms every time I add a model. So I stopped reasoning about each one and wrote the answer into the registry once. A model is private when it comes from one of the two providers I would let see work code. Otherwise it isn't. The route check reads that flag, so a model nobody has classified never gets the benefit of the doubt.

**Beat 2**
highlight: repository-clearance-and-the-privacy-flag | A flag is not a decision

Every free model is not private. Every DeepSeek model is not private either, whether it runs free, on the Go plan or on the paid API. That includes the DeepSeek V4 Pro that Go serves, because the Go provider is the one serving it. And an id nobody has listed is recorded as unknown and not private. A model nobody classified is never counted as safe. A flag is not a decision, though. A flag says what a model is. It doesn't say whether this particular code may go to it. So the second piece is a question I answer once per repository.

**Beat 3**
highlight: repository-clearance-and-the-privacy-flag | Nothing is cleared by default

The first time the route check runs in a repository it has no entry for, it stops and asks me whether non-private models may see this code. If I answer yes, the repository is cleared, and the full chain applies to it. If I answer no, only Claude and Codex are candidates. The work still runs. It just never leaves those two providers. Nothing is cleared by default, and I clear repositories one at a time, by hand.

**Beat 4**
highlight: repository-clearance-and-the-privacy-flag | Not clever, and exactly as clever as it needs to be.

The answer gets stored under the lower-cased absolute path of the repository's top level. That way a subfolder, or a worktree, which is a separate checkout of the same repository, maps back to its own repository. The whole store is a small list of true and false. Not clever, and exactly as clever as it needs to be. I like this piece because of how little it asks of me. I don't have to remember which providers keep prompts. I don't have to remember which repositories are mine to share. I answered each question once, in the moment it first mattered, and the layer remembers.

**Digest:** Every model is flagged private or not, and an unlisted model counts as not private. Each repository gets asked once whether non-private models may see it, and nothing is cleared by default.

**Trial:** List the repositories you worked in this week. Mark each one yes or no for whether a free model that might keep your prompts may see its code.

**Runes:**
repository-clearance-and-the-privacy-flag | A flag is not a decision
repository-clearance-and-the-privacy-flag | Nothing is cleared by default
repository-clearance-and-the-privacy-flag | Not clever, and exactly as clever as it needs to be.

## Stop 4: The light chain, in order

**Beat 1**
highlight: the-light-chain-in-order | light work, the layer tries these in order

This is the part that fixed the running-out problem. It's the same ladder I already used inside Claude, Sonnet down to Haiku, stretched across providers and all the way down to free. For light work, the layer tries these in order and takes the first one that isn't skipped. First, one free model, DeepSeek V4.1 Flash Free. Then the same model on OpenCode Go, a flat monthly plan. Then Luna and Sol on the Codex plan I already pay for.

**Beat 2**
highlight: the-light-chain-in-order | the reason is the plan, not the model

Claude isn't in this chain, and the reason is the plan, not the model. As far as I have tested, Anthropic admits a third-party harness only through an API token, which is billed on its own and isn't tied to a plan's usage. Codex admits its plan directly, so OpenCode can spend the Codex plan I already pay for. A Claude plan can only be spent inside Claude Code. So the Anthropic plan lives one level up, in its own harness.

**Beat 3**
highlight: the-light-chain-in-order | A pick is sticky.

A pick is sticky. Once a delegated task is running on a model, it stays there as long as the model is usable. It doesn't hop back up the chain the moment something above it frees up. Then it skips what it must. A model is skipped when it isn't private and the repository isn't cleared, when it's cooling down, when it's demoted, when it's a Codex model and the Codex plan is out, or when it's Go and Go's allowance says the limit is reached.

**Beat 4**
highlight: the-light-chain-in-order | One retry, on purpose.

A rate limit or quota error puts that model on a cooldown, sixty minutes by default. A plain error only counts toward demotion, and three in a row bench the model for the day. If a child dies on a rate limit, the plugin tells the route check, takes one new pick and tries once more. One retry, on purpose. A second failure stops the task and shows me the error, because a retry loop across the whole chain is a good way to find a new way to waste an evening.

**Digest:** Light work walks one free model, then the Go plan, then Codex, and takes the first one not skipped. Picks are sticky, failures cool or bench a model, and a failed child gets exactly one retry.

**Trial:** Write your own light chain in order, cheapest first, as three or four lines. Next to each one, write the single condition that should make the layer skip it.

**Runes:**
the-light-chain-in-order | the reason is the plan, not the model
the-light-chain-in-order | A pick is sticky.
the-light-chain-in-order | One retry, on purpose.
