# How the model layer works, part two

Status: DRAFT script for Tjakoen to read aloud and edit. Cut into beats from the earlier narration; not yet read or checked by him.

How this script works. The note stays open on the page while the recording plays. Each beat is a short spoken line about one idea, and it names the phrase in the note that lights up while it plays. The wording is the earlier narration, cut to the lines that carry the idea. Format of a beat: a highlight line (section id, then a quote that must appear in that section of the note, or figure: and a figure name), then the spoken words.

## Stop 1: Money waits for me, and spawning has limits

**Beat 1**
highlight: the-paid-route-needs-my-typed-approval | Only I can give an approval, and only on a terminal.

The first lesson ended at the bottom of the light chain, with a paid request waiting for me. This one starts there. The paid DeepSeek API isn't in the light chain. It's an escalation, and every escalation leaves a record. Only I can give an approval, and only on a terminal. The approve command appends a line to an approvals file, and that file is the only place approval lives. An answer in my decisions inbox isn't approval. Neither is a sentence in chat.

**Beat 2**
highlight: the-paid-route-needs-my-typed-approval | What holds the money is simple on purpose.

What holds the money is simple on purpose. I first built a signing layer that tied approvals to Windows Hello, and I took it out as overengineering. The approvals file and the ledger are files an agent can write, and repeated audits kept showing that a file can't be made forgery proof from inside the tool that reads it. Three plain facts hold the paid route instead. I type the approval in a terminal. Agents never hold a provider key. And the paid API runs on a prepaid balance that is a ceiling no agent can raise.

**Beat 3**
highlight: spawning-context-recovery-and-the-goldfish-gate | The supervisor is code, not an agent.

The supervisor is code, not an agent. It says which tier a piece belongs to, which model it gets and whether to delegate, and it refuses a spawn past my limits. That's four agents at a time per session, delegation two deep, and two retries. Every spawn also has to carry an envelope with its lane, its scope cap, its hard stops and its ask-triggers. A spawn without one is refused.

**Beat 4**
highlight: spawning-context-recovery-and-the-goldfish-gate | fresh reviewers who get only the plan file

And the goldfish gate checks the review, not the reviewer. The names come from Google's Elephant-Goldfish model. The long session that holds the context is the elephant, and its job ends at a plan another reader can follow. The goldfish are fresh reviewers who get only the plan file and the files it links. I run three of them on the strong tier, while the elephant stays on the cheaper execution tier.

**Digest:** Paid calls are escalations that wait for an approval I type in a terminal, against a prepaid ceiling. A code supervisor caps spawning, and three fresh goldfish review a risky plan before it moves.

**Trial:** Pick the one paid action in your own setup an agent could trigger today. Write down where the approval for it lives, and whether an agent could write that place itself.

**Runes:**
the-paid-route-needs-my-typed-approval | Only I can give an approval, and only on a terminal.
the-paid-route-needs-my-typed-approval | What holds the money is simple on purpose.
spawning-context-recovery-and-the-goldfish-gate | The supervisor is code, not an agent.

## Stop 2: The work lane, and the record

**Beat 1**
highlight: work-is-a-different-lane-enforced-three-ways | so a mistake has to get past all three

The free and Go models and DeepSeek are for personal projects only. A work machine and a work repository use only the company's Claude and Codex. Three separate guards enforce that, so a mistake has to get past all three. The first guard is machine detection, and it fails closed. Each machine of mine is a directory in my private config, and a device works out which one it is from its own hostname.

**Beat 2**
highlight: work-is-a-different-lane-enforced-three-ways | An unidentified machine is the wrong place to guess

When nothing matches, the device is treated as a work machine. That doesn't mean only the company's tools can run. It means the account check applies, so a company account still works and a personal one is blocked until the machine is identified. An unidentified machine is the wrong place to guess, and guessing wrong the safe way costs me a blocked prompt I can fix in a minute. The second guard is an account check on every prompt. In work context, a hook reads which account the harness is signed in to. A company account passes. Any other account blocks the prompt, my personal Claude and my personal Codex included, and so does an account the hook can't read. So the lane is enforced by the account itself, not by which program runs.

**Beat 3**
highlight: work-is-a-different-lane-enforced-three-ways | route check refuses in work context.

The third guard is a launch gate. The wrapper that starts OpenCode asks the route check for permission first, and the route check refuses in work context. Starting it inside a work repository is a hard stop, whatever that repository's clearance says, because a work repository can never be cleared for non-private models. These constants live in the code, not in the registry or any state file, so no answer, flag or clearance can lift them. Each copy has a test.

**Beat 4**
highlight: what-gets-recorded-and-why-free-and-paid-sit-apart | A layer that cannot report is a layer you cannot tune.

Now the record. A layer that can't report is a layer you can't tune. Four rules keep that ledger honest. Counts don't overlap, so nothing is counted twice. Provider, cost class and privacy come from the registry by exact id, and an unknown id records as unknown and not private. The writer can never block a session. PANTRY, the desk I built beside my work, reads those files and reports use by project, plan, session and subagent. Free is kept apart from paid, because the point of the free model is to see how much work stopped costing anything. And every session start checks that PANTRY still reads what my config writes, so a change in the format can't quietly blind the desk.

**Digest:** Work machines and work repositories use only company Claude and Codex, behind three guards whose constants live in code. Every session and subagent writes one usage line, and free use is kept apart from paid.

**Trial:** Write down what your setup does today if it can't tell whether a machine is a work machine. If the answer is that it allows everything, write the one rule that would make it fail closed.

**Runes:**
work-is-a-different-lane-enforced-three-ways | so a mistake has to get past all three
work-is-a-different-lane-enforced-three-ways | An unidentified machine is the wrong place to guess
what-gets-recorded-and-why-free-and-paid-sit-apart | A layer that cannot report is a layer you cannot tune.

## Stop 3: Grade the check, then build your own

**Beat 1**
highlight: five-levels-and-what-a-pass-is-allowed-to-claim | A file saying the guard exists is not a guard that works.

The easiest way to lie in this kind of project is to write a check that passes on configuration alone. A file saying the guard exists is not a guard that works. So every check in the layer is graded by what its pass proves. My models standard defines five levels, and the verifier prints one line per check with its level and its result.

**Beat 2**
highlight: five-levels-and-what-a-pass-is-allowed-to-claim | Configured: registry pins for every harness. Mechanically enforced

The lowest level is configured. The file says so, and nothing has run. Next is mechanically enforced. A hook refused the wrong thing, called exactly the way the live config calls it. Then verified by test, meaning a test fed it a fixture and read the result. Then assisted, which means a session ran the probe and reported what it saw. And last is unsupported. The harness can't do it, and the report says so out loud. The other harnesses can only print the restart command and ask me, and that's assisted. I'd rather the report say that plainly than round it up.

**Beat 3**
highlight: build-your-own | You do not need my code.

Now the part you can take home. You don't need my code. You need these, in this order. Start with a registry. One file with your tiers, roles and model ids, and a rule that no other file may contain a model id. Give every model a cost class and a private flag from the start, and write every id as provider and model. Then pins that check against the registry. Every agent file and settings file is a pin, and a checker reports any that disagree.

**Beat 4**
highlight: build-your-own | Ask once, store the answer, and never default to yes.

Then a route check. One script that answers which model takes this task, from the registry and a small state file. Give it exit codes that mean ask me, nothing private available, refused, and everything spent, so the caller can't treat a refusal as a failure to retry. Then a clearance answer per repository. Ask once, store the answer, and never default to yes. Then a paid route only you can open. Keep metered spend out of the order, put paid use behind a request record and an approval typed in a terminal, keep the provider key away from agents, and let a prepaid balance be the ceiling.

**Digest:** Every check is graded on five levels by what its pass actually proves, and configured alone counts for nothing. The build list runs from a registry to a verifier, in order.

**Trial:** Take one check in your own setup that reports green. Decide honestly which of the five levels its pass reaches, and write that level next to it.

**Runes:**
five-levels-and-what-a-pass-is-allowed-to-claim | A file saying the guard exists is not a guard that works.
build-your-own | You do not need my code.
build-your-own | Ask once, store the answer, and never default to yes.

## Stop 4: What I publish, what I keep, and what is still open

**Beat 1**
highlight: what-is-public-and-what-is-private | a contract you cannot read cannot be adopted

The standards are public, because they're the contract, and a contract you can't read can't be adopted. The models standard holds the tiers, the roles, the guard and the rules on tokens. The private side is my agent-config repository. It holds the registry with real identifiers, the hook scripts, and the constants the work guard compares against, which identify an employer. It also holds each machine's settings, and those are a permission surface. A session is never allowed to write them. I apply changes myself, from a command that refuses to run unless the repository is clean and level with origin, and that backs up the live file first.

**Beat 2**
highlight: what-is-proven-and-what-is-still-being-proven | Audit is not the same as use, so this is the line.

The layer is built and in daily use. The registry, the guards, the fallback order, the usage records, the escalations with their typed approval, the supervisor, the context check, the recovery checkpoints, the goldfish gate and Model Scout have all been through seven rounds of independent audit. But audit is not the same as use. Proven in real use, so far, are three things. The Go route and its allowance check, live on my Mac. The model guard stopping a real session on the wrong model and getting me into the right one. And the checklist that proves the layer, running at the start of a session.

**Beat 3**
highlight: what-is-proven-and-what-is-still-being-proven | layer proves the routing and the privacy rules.

The layer proves the routing and the privacy rules. It doesn't prove the work is good. The fresh goldfish is still the thing that catches that. Ten times zero is still zero, and a cheaper model is still a model. The numbers in this lesson are a snapshot from 23 November 2026, and every model name in it will be out of date before long.

**Beat 4**
highlight: the-turn | the part I use most turned out to be the record

I built this to stop running out, and the part I use most turned out to be the record. Before the layer, a model going dry was a decision I made tired, by hand, at the worst moment, and nothing remembered it afterwards. Now it's a lookup with a reason attached, a skip I can read, and one line in a ledger I can open the next morning and argue with. If you take one thing, take that shape rather than my code. Put every model name in one file. Make every rule that matters a hook instead of a hope. And grade every check by what its pass actually proved.

**Digest:** The standards are public and the wiring stays private, because it names my machines and my employer. Much of the layer is audited but not yet met in real use, and it proves routing, not quality.

**Trial:** Write two short lists for your own setup, what you could publish and what must stay private. Put one reason next to each private item.

**Runes:**
what-is-public-and-what-is-private | a contract you cannot read cannot be adopted
what-is-proven-and-what-is-still-being-proven | Audit is not the same as use, so this is the line.
the-turn | the part I use most turned out to be the record
