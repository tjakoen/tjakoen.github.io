# One Vocabulary, Two Operators

Status: DRAFT script for Tjakoen to read aloud and edit. Written from the note; not yet read or checked by him.

## Stop 1: The AI that pretends to be a person

This one is the whitepaper. It is the most academic thing I have written, full of citations, and I am going to say it in plain words. If you want the references, they are all in the note.

It starts with how most AI uses software today. The usual answer is imitation. The model looks at the screen, or the page structure, or the accessibility tree, and then it clicks and types the way a person would, because somebody asked it to in a chat. That is a GUI agent. It is powerful and it is general. It is also indirect. The model is reverse-engineering an interface that was built for eyes and hands, and the human is reduced to giving instructions and watching.

I describe the inverse. In GRAIN, which is my design system, the interface publishes one small, closed list of actions. The application writes that list, and the AI cannot add to it. A human click and an AI decision turn into the same thing, which I call an Intent. Both go through one door, a single endpoint, and both come back as updates to the page. There is no side channel where the AI reaches into the page on its own. The AI has no move that a person lacks.

The second half is disclosure. Most systems tell you an AI was involved with a chat log, or a badge, or a label off to the side. I put the AI's hand in the surface itself. Text the AI wrote is set in a degraded grade of the type. A control the AI is touching gets a dashed edge. And the mark stays after the action is done. Human work settles clean. AI work keeps its grain.

The sentence the whole paper hangs on is this. Every surface can be addressed and operated by both a human and an AI through one shared vocabulary, and the AI's presence is a visible signal.

Why bother? Because the goal is augmentation, not automation. I want the AI to be an extension of the person at the controls, not a replacement working somewhere offstage. That puts the work in an old tradition, Licklider and Engelbart, and in its modern form, Shneiderman's human-centered AI, which argues you can have a lot of automation and a lot of human control at once.

The three mechanisms each carry part of that. Because a click and an AI decision are the same primitive, the AI can't act anywhere the person can't see. And because one writer arbitrates every change, the person has no shortcut either. Equal footing runs both ways, and it's built into the structure rather than bolted on as a stop button. Because everything goes through one door, you can watch the AI work on the real page, step by step. And because the AI's hand shows in the type, its work is something you can read and maybe learn from.

I have to be careful there, and the paper is. Equal footing is a property of the architecture, so I can show it by construction. The idea that a person learns by watching is a hypothesis about people. I have not tested it.

The industry is also heading this way from several directions at once. Meta's Astryx makes a design system readable by AI authors. Builder.io's Agent-Native gives an agent and the UI shared actions. A family of protocols, AG-UI, MCP Apps and A2UI, standardizes the channel between agent and app. I read a crowded road as a sign the destination is real. The paper's job is to name the spot on that road nobody has reached yet, and to say honestly which neighbor holds which piece.

The limits are in the abstract, not hidden at the end. A small model running in the browser now drives part of the vocabulary through the same door, navigation and choices. That is narrow. Its command of the full vocabulary is unproven, and the benefits I claim need user studies I have not run.

Next, the approach itself, in brief: the registries, the one door, and how the grade works.

**Digest:** Most AI agents imitate a person clicking. GRAIN gives a human and an AI one closed list of actions and one door. The AI's hand shows in the surface, and the limits are stated up front.

**Trial:** Pick one AI tool you use that acts on a page or an app. Write down, in two sentences, whether it imitates your clicks or calls actions the app defines, and how it tells you what it did.

**Runes:**
abstract | the AI has no affordance a person lacks
1-introduction | A crowded road is evidence of a real destination.
1-introduction | the operator holds no direct-write shortcut either

## Stop 2: One door, one writer

Here is how the thing is actually put together. There are five parts, and I'll take them one at a time.

First, two registries. One is surfaces. A surface is a stable, meaningful address on the page, a name rather than a CSS selector. The other is actions, a closed and typed list of what can be done. What you can operate is exactly those two lists multiplied together, and that gets written out as a manifest the machine can read. The manifest is harvested from the component tree, so it can't drift from the UI. It is a projection of the UI.

Second, one door and one writer. The usual way a web app works is create, read, update and delete, straight to the data. I turned that around. The UI does no direct writes at all. When you click something, that becomes an Intent sent to one endpoint, exactly like an AI decision does. One layer checks the surface and the action against the registry and hands it to the one writer, which I call the reasoner. Only the reasoner can change state, and it pushes the result back. So neither operator has a privileged path. The human does not reach into the database any more than the AI reaches into the page.

There is one documented seam, and I'd rather say it than hide it. Data the user owns outright, their own notes and knowledge base and preferences, may take a direct route. The path is chosen by who owns the data, not by what is convenient. Anything the AI reasons with or about has to use the door. No piece of data can be written both ways.

Third, the index and the snapshot. The manifest is the space of what is possible. The current state is what is true right now. The AI needs both. One is its set of moves, the other is where it is standing.

Fourth, the grade as a signal, and it is on every surface, not only type. Two separate attributes drive it. One is provenance, whether the AI or a human made this. The other is liveness, whether it is still in transit or committed. Text shows the AI as a degraded font grade. A button gets a dashed edge and a block caret while it is acting. An input gets a dashed border, a card gets a dashed outline, and when the AI takes over the whole workspace, the whole workspace shows it. The two attributes are independent. When an AI action commits, the liveness settles, but the grade stays grain. That is provenance, and it is permanent, not a loading state.

There is one exception. When the AI types into a real form field, the field renders clean, and a spotlight on the acting area carries the provenance instead. The point stands, though. Disclosure belongs to the surface. It is never a separate badge.

Fifth, the action log. Because every action is a named verb, the AI's activity can be narrated as a running feed of those verbs. You see it read, type, write, revise and commit, instead of watching a spinner. You can't narrate a stream of pixel clicks in any useful way. A closed vocabulary you can. And since every interaction, human or AI, already comes through the one door with its source tagged, a single log of both is a cheap extension. I have not built that log yet.

Next comes the long part, where I put this next to everyone else's work and say who already has which piece.

**Digest:** Two lists define what can be operated, and the manifest of them is harvested from the UI itself. A human and an AI both send Intents through one door to one writer. The AI's mark stays after the action commits.

**Trial:** Take one screen of an app you know. List three surfaces on it by a plain name and three actions a person can take there. You have just drafted a tiny vocabulary.

**Runes:**
2-the-approach-in-brief | it cannot drift from the UI because
2-the-approach-in-brief | provenance is permanent, not a loading state
2-the-approach-in-brief | A stream of pixel-clicks cannot be narrated meaningfully

## Stop 3: Who already holds which piece

This is the reference stop. The related-work section is the longest in the paper, and the note has a table that maps it all. I'll walk the map out loud and leave the citations on the page.

The table has three columns that matter. Is the human and the AI on one shared vocabulary? Is there one writer and one door? And is there a signal that the AI was here? My point is that every cluster of prior work holds some of those, and only this work holds all three at once.

Start with the agent and UI protocols, AG-UI, MCP-UI, MCP Apps and Google's A2UI. They're my closest industry neighbors. They share my instinct that the AI must not change the page directly. MCP Apps got there on its own by sandboxing. But each of them is a negotiation between an agent and an app, and the two sides are not the same. None of them sends a human click and an AI decision through one identical closed vocabulary. So no back channel from the AI is not my novelty. Lots of people have it.

Then the closest contemporary, Builder.io's Agent-Native, announced in May 2026. Its pitch is that every action the agent can take is also a button in the UI, and every button runs the same logic the agent uses. That is my symmetry claim, shipped by someone else. As of mid-2026 I can't call symmetry novel on its own, and I cite them as proof the idea is real and wanted. Where we differ, there are three things. They expose that one executor through many doors, and I keep literally one, which matters because provenance is stamped at that door. They broadcast state, and I send updates addressed to named surfaces, so you watch the AI act on the real controls. And the decisive one: they have no provenance surface. An agent's finished work looks exactly like a human's. So my claim now rests on the grade being tied to the same door that enforces the symmetry.

There is an academic paper called Terminal Is All You Need that argues the terminal already puts human and agent in the same medium. I agree with the instinct. But the terminal's vocabulary is open text, there's no single writer, and what the agent did scrolls away. It is the concept. Mine is the contract.

Meta's Astryx uses almost the same slogan for a different moment. It is agent ready for authoring. An AI can build with the components at development time. There is no runtime story, no action list on the living page, no door, no disclosure. That forced a split in my words. Agent ready means the AI can author the UI. Agent operable means the AI can operate it at runtime, as a peer of the person using it.

Then the main foil, GUI agents and computer use, which imitate input, and the benchmarks that score that. I have to be fair here. Those agents already act through primitives, so the contrast is not chat against actions. It is general imitation against a closed shared vocabulary through one door. I also refuse to argue from how bad agents are at it, because the numbers people quote go stale in months.

Older still is the research lineage, Horvitz and Lieberman and others. The idea that an agent shares your interface is about thirty years old, and I cite it as such. None of it has the agent use the identical vocabulary through a single door.

Last, provenance. Content Credentials attach metadata, SynthID hides a watermark, Carbon for AI marks the container, and the sparkle icon is not on its own a reliable sign. Even the bare idea of marking AI content in the surface has appeared elsewhere, so that isn't mine either. My narrower claim is the mark in the operable surface itself, persistent, and coupled to the action system. I do not claim it is better. Whether people read it correctly is open.

Next, the contribution in three properties, and what has actually been shown.

**Digest:** Every neighbor holds some of the three properties. Agent-Native holds two and has no provenance surface. The claim is the conjunction, and the bare ideas are named as borrowed.

**Trial:** Draw the three columns from this stop on paper: shared vocabulary, one door, AI signal. Place two AI tools you know in it and mark which columns each fills.

**Runes:**
3-related-work-and-positioning | an agent's completed work is visually indistinguishable from a human's
3-related-work-and-positioning | It is the concept; ours is the contract.
3-related-work-and-positioning | so the bare concept of in-surface disclosure is not ours either

## Stop 4: A synthesis and an existence proof

So what is the contribution? I'll say it the way the paper does, because I worked hard on not overclaiming it. It is an architectural synthesis and a working existence proof. I do not claim a new capability, and I don't need one. The value is the specific combination, built and running.

There are three properties. One is symmetry. A human click and an AI decision become the identical Intent, over one closed vocabulary the application writes. Not generic device input, and not trees the agent proposes. Two is the single-writer door. One endpoint, no privileged path from the AI into the page, enforced as a rule of the architecture. That makes what the AI may do literally equal to what the UI offers. Three is provenance as grade. The AI's presence shows in the surface it produced or touched, and it is stamped at the same door that admits the action.

Each of those has prior art. I said so in the last stop. What no mapped system has is all three together. And I have to be honest that the map moved under me. My first adversarial search, in July 2026, found nothing that ran a human and an AI through one closed vocabulary. A second sweep days later found exactly one, Agent-Native, with the first two properties and no provenance at all. So I narrowed the claim. Symmetry and the single writer are no longer new on their own. The claim rests on the full combination, where the grade is not decoration but is enforced by the door.

I read that as validation, not erosion. When people arrive at the same position from different directions, the position is real. Naming what is not mine is part of the claim, because that's how the shape of the gap becomes visible.

Now the evaluation. The thesis is about the interaction model, so that's what has to be tested. The substrate underneath, BATCH, with no build step, is an engineering property. It's mostly beside the point. The same model could run on a heavier stack and the argument would stand.

What stands today is the live model. When I first drafted this, the reasoner behind the model seam was a scripted stub. Now a small language model runs entirely in the browser, on WebLLM, with no server, on your own hardware. It reads the same vocabulary the human uses and sends Intents through the same door. It drives a subset end to end, navigation and choices, and its presence shows as grade, the way the architecture requires.

And here are the limits, in the same breath. The model is small. Its command of the full vocabulary is unproven. This shows the thing is feasible. It doesn't measure whether the manifest is enough as a general instruction set, and it's not a study of any benefit. What it settles is one thing. A real model, given only the index and the snapshot, lands on the same primitives a human click does, through the one door, with the grade following.

The benefits are hypotheses. There are three. Using the AI through the same vocabulary gives people better expectations and more control than a chat agent working behind the scenes. The grade is noticed and read correctly at least as well as a badge, including for low-vision users. And watching the AI work step by step helps people learn the task. The literature I mapped supports none of these. The paper sketches a study with three conditions that would test them. Writing that design costs nothing. Running it is the real work, and I haven't.

One more honest line. I did measure the substrate. On one interaction, the native build ships about 2kb of JavaScript against 118kb for Next.js on the same filter. That's real, but it measures the stack, not the modality, so it's context, not proof.

Next, the limits and threats, the conclusion, and what is still open.

**Digest:** The claim is three properties together, not a new capability. A small live model now drives a narrow slice through the door. Every benefit is still a hypothesis waiting on a user study.

**Trial:** Write one of the three hypotheses as a test you could run with two friends in ten minutes: what they do, and what you would measure.

**Runes:**
4-contribution | We do not claim a new capability
4-contribution | a position converged upon from independent directions is a real position
5-evaluation | we state them as hypotheses, not results

## Stop 5: What I have not earned yet

The paper has a section on limits and threats, and I'd rather you heard it from me than found it.

First, what is built. The reference implementation enforces the door, the registry check and the grade, with unit, integration and conformance tests, for the human operator. Provenance is stamped on the server and tested against spoofing. The model seam is no longer a stub. The small in-browser model reads the manifest and drives navigation and choices through the door. So the manifest is shown to be adequate for that subset, and untested for the rest. The model's small size is its own limit. The build order did pay off. I finished the vocabulary, the door, the grade and the control lifecycle first, so the model arrived into a contract instead of a scaffold. And two older direct-write routes still exist in the demo app. They predate the door and are being retired into the documented ownership seam.

Second, the ground moves fast. The agent and UI protocols are months old. Benchmarks age in weeks. So every claim about where I stand has to carry a date.

Third, vendor framing. Some of how that ecosystem describes itself is the ecosystem's own description. I present it that way, and check it against neutral sources where I can.

Fourth, the scope. This approach suits content, dashboards and hypermedia surfaces. Rich client interactivity, offline work and very large dynamic interfaces stay genuinely harder. That's a cost I accept.

Fifth, symmetry has edges. Some surfaces only the AI writes to, like the narration console. The claim is symmetry of the operable vocabulary, not that every surface goes both ways.

The conclusion is short. Should an AI operate the human interface? Largely settled, yes. The open question is how. The common answer is imitation under instruction. Mine is one closed vocabulary that a human and an AI operate identically, through one door, with the AI's hand shown in the type. In the older language of the field, the machine extends the operator's reach without leaving their sight. Authoring symmetry, action symmetry and standard channels have all shipped somewhere. None of them lets the operator see, in the surface, whose hand did what. It's a synthesis and an existence proof, not an invention. That is the contribution, and it is enough.

Then the open questions, which read like a lab notebook. The model seam was filled in July 2026. What is still open is the scope, the full vocabulary and larger models, and every benefit claim. A third research pass that month swept the shipped landscape, not only papers, and that's where Agent-Native and Astryx came in and the claim got narrowed. A second pass checked its claims by vote, twenty-one confirmed and four refuted, but the automated summary came back as a stub, so I merged that section by hand. The prior-art hunt checked its loose ends and none of them disproved the claim.

And one I caught the hard way. A source I had lined up on provenance was withdrawn by its own authors for a reporting error, and I dropped it. So now every provenance source gets checked for a retraction before it goes in. That's the kind of mistake I'd rather print than repeat.

That closes the whitepaper. The plain-language version of the same argument, without the citations, is the note called Watch Its Hands, if you want it told the other way.

**Digest:** The door, registry and grade are built and tested, and the live model covers a narrow slice. The claim is dated, scoped and not proven to help anyone yet. Retracted sources get checked before they go in.

**Trial:** Take any claim you have published or posted about a tool you built. Write one honest limit next to it, with a date on it.

**Runes:**
6-limitations-and-threats | Positioning must be dated, not absolute.
7-conclusion | That is the contribution, and it is enough.
8-open-questions-next-research-pass | Re-vet every provenance-HCI source for retraction before it goes in.
