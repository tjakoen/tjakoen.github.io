---
title: "One Vocabulary, Two Operators"
subtitle: "An alternative modality for human–AI interaction: one shared vocabulary, operated as peers (the GRAIN design system)"
author: "Tjakoen Stolk"
status: DRAFT
type: whitepaper
date: 2026-07-02
updated: 2026-07-17
readingTime: "~28 min"
tags: [ai, design-systems, hci, provenance, grain]
summary: >
  A research-style positioning of GRAIN, an AI-interaction design system: a UI where a human click and
  an AI decision resolve to the same closed, semantic action-vocabulary through one write door, with the
  AI's presence disclosed as an in-surface provenance signal. The contribution is an alternative
  *modality* for AI, a design-system claim, independent of what is built with it or where it runs.
---

> **Status: working draft, revised 2026-07-17.** This is a *projection* of
> [PHILOSOPHY.md](../docs/PHILOSOPHY.md): the beliefs are canonical there; this paper situates them in
> the literature and argues the contribution. The narrative version of the same stance is
> [the origin story](origin-story.md); the working method behind the claims is
> [Ten Times Zero Is Still Zero](ten-times-zero.md). Three research passes so far: agent–UI protocols /
> GUI agents / mixed-initiative HCI (verified), provenance / generative-UI (verified), and a
> shipped-landscape sweep (2026-07-03) that added Builder.io Agent-Native and Meta Astryx as the
> closest contemporaries and narrowed the novelty claim accordingly (§3.2, §4, §8).
> **Update (2026-07-17):** the model seam this draft calls the next milestone is now filled: a small
> live model operates the vocabulary in the browser (§5, §6, §8).

## Abstract

Contemporary systems that let an AI *operate* a user interface overwhelmingly do so by **imitation**:
the model perceives pixels, the DOM, or the accessibility tree and emits low-level input (clicks,
keystrokes, coordinates) under conversational instruction. We describe the inverse. In **GRAIN** (a
design system) the interface exposes a single **closed, application-authored, semantic action-vocabulary**; a human
click and an AI decision resolve to the *same* `Intent`, enter through *one* write door
(`POST /intent`), and return as render operations pushed over SSE. There is no privileged AI→DOM back
channel: the AI has no affordance a person lacks. The AI's presence is disclosed not as a chat log but
as an **in-surface provenance signal** ("grade-as-signal"): every operable surface shows the AI's hand
in its own idiom (degraded type for text, a dashed edge for controls) and the mark *persists* after the
action commits; human, committed content stays clean. The purpose is **augmentation, not automation**: the AI is
framed as an *extension of the operator* (on equal footing, acting in full view, its work legible
enough to learn from), not a replacement working offstage. The industry is now converging on this
ground from several directions at once: agent-*ready* design systems make components legible to AI
**authors** at development time (Meta's Astryx); agent-*native* frameworks give a runtime agent and
the UI **shared actions** (Builder.io's Agent-Native); agent-UI protocols standardize the **channel**
(AG-UI, MCP Apps, A2UI), which we read as validation of the direction. The contribution is
deliberately a **synthesis and an existence proof**: the ingredients are drawn from existing work,
but their **conjunction** (human=AI **symmetry** over one closed vocabulary, a **single-writer
door**, and **provenance-as-grade**) is a coherent, opinionated position the converging traffic has
not yet reached: the nearest contemporary (Agent-Native) shares the first two properties and carries
no provenance surface at all, so the third (disclosure rendered in the operable surface, coupled to
the same door that admits the action) is load-bearing. We are equally explicit about limits: the
reference implementation enforces the door, the registry, and the grade, proven first for the human
operator and now for a live model as well: a small language model running in the browser reads the
vocabulary and drives a subset of it (navigation and choice operations) end-to-end through the same
door, turning the model seam from a declared milestone into a working, if narrow, existence proof (the
model is small and its command of the full vocabulary is unproven); and the claimed *benefits* (that
symmetry aids
controllability; that grade-as-signal is a legible, correctly-interpreted cue) require original user
studies we have not yet run.

## 1. Introduction

The dominant 2024–2026 paradigm for "AI that uses software" is the **GUI agent**: a model that drives
the human interface the way a person would, by perceiving the screen and emulating input
[Zhang et al. 2024; Anthropic 2024]. This is powerful and general, but it is also *indirect*: the model
reverse-engineers an interface that was designed for eyes and hands, and the human's role collapses to
issuing instructions and watching.

That paradigm is no longer the only current. Through 2025–2026 the industry has been converging,
from several directions at once, on the idea that software should be *legible to* and *operable by*
AI as a first-class design concern: Meta's **Astryx** ships a design system built to be read and
used by AI *authors* at development time [Astryx 2026]; Builder.io's **Agent-Native** framework
gives a runtime agent and the UI *shared actions* [Builder.io 2026]; the agent-UI protocol family
(AG-UI, MCP Apps, A2UI) standardizes the agent↔app *channel*; and position papers now argue over
what an "agent-first web" should even mean [arXiv 2606.19116]. A crowded road is evidence of a real
destination. This paper stakes out the specific point on that road the traffic has not yet reached,
and names precisely which neighbours hold which pieces of it (§3).

We take a stance summarized as one sentence:

> **Every surface is addressable and operable by both a human and an AI through one shared vocabulary,
> and the AI's presence is a visible signal.**

Concretely: the frontend publishes a small, closed set of typed **actions** over a set of semantic
**surfaces** (addresses, never CSS selectors). Triggering an action (whether by a human click or an AI
decision) produces the *same* `Intent`, which passes through *one* endpoint to a single writer and
returns as `RenderOp`s applied to the addressed surfaces. The AI is thus a **modality**, not a chat
channel: a finite set of real primitives that compose, read against a generated **index** of what is
*possible* and a live **snapshot** of what is *true now*.

This paper positions that stance against the literature, states the contribution without overclaiming,
and lays out the evaluation the claims demand. **Scope:** this is a thesis about a *design system* (the
modality GRAIN gives an AI), not about any product built with it, the substrate beneath it (BATCH), or
where it is deployed. Those are implementation; the claim is the modality.

### 1.1 Motivation: augmentation, not automation

The design goal is **AI as an extension of the operator, not a replacement for them.** This places the
work in the *intelligence-augmentation* tradition (Licklider's "man–computer symbiosis" and
Engelbart's "augmenting human intellect," the counter-current to the automate-and-replace vision that
has run through AI since 1956), and in its modern form, Shneiderman's **human-centered AI**, which
argues a system can hold *both* high automation and high human control, amplifying and empowering the
person rather than displacing them [Licklider 1960; Engelbart 1962; Shneiderman 2022]. Our three
mechanisms are how that stance becomes concrete:

- **Symmetry → equal footing.** Because a human click and an AI decision are the *same* primitive, the
  AI holds no capability the operator lacks and can act nowhere the operator cannot see; and because a
  single writer arbitrates every change, the operator holds no direct-write shortcut either. CRUD is
  inverted: neither party mutates state on its own; both submit intents to the one writer. Equal footing
  runs both ways, and it is structural, not a bolted-on "stop" button.
- **One door + visible action → observability.** The operator watches the AI act on the real surface,
  step by step: the transparency that guidelines for human–AI interaction call for [Amershi et al. 2019].
- **Grade-as-signal → legibility and learnability.** Because the AI's hand is shown in the type of the
  content it produced, its work is a *demonstration* the operator can read and learn from, not an
  opaque result delivered from offstage.

We are careful here: "equal footing" is a property of the *architecture* and can be shown by
construction; "the operator learns from watching" is a *hypothesis* about people, and belongs to the
user-study track (§5), not asserted as a result.

## 2. The approach (in brief)

- **Two registries.** *Surfaces* are stable semantic addresses (`kind:id` / slug); *actions* are a
  closed, typed, depth-tagged vocabulary. What is operable is exactly their product, enumerated in a
  machine-readable **manifest** harvested from the component tree (it cannot drift from the UI because
  it *is* a projection of it).
- **One door, one writer: CRUD is inverted.** The UI performs no direct create/update/delete. A human
  interaction is submitted as an `Intent` to `POST /intent`, *exactly* as an AI decision is; a single
  interaction layer validates `(surface, action)` against the registry and hands it to the **one writer**
  (the reasoner), which holds the only mutation capability and returns `RenderOp`s over SSE. So *neither*
  operator has a privileged path: the human does not reach the database directly any more than the AI
  reaches the DOM directly. (One documented seam exists: *user-owned ground-truth* data, meaning the
  user's own knowledge base, notes, and preferences, may take a direct route, because the write path is
  chosen by the data's **ownership category**, not by convenience; AI-behavioral state and AI reasoning
  artifacts must use the door. There is no generic direct-write endpoint, and no datum is writable
  by both paths. Details are out of scope here.)
- **Index vs. snapshot.** The manifest is the *space of the possible*; the per-request state is *what is
  true now*. The AI needs both: the former for its move set, the latter for where it stands.
- **Grade-as-signal (every surface, not only type).** The AI's hand is shown *in the operable surface
  itself*, expressed per component and keyed off two orthogonal attributes: **`data-grade`** = provenance
  (grain = AI, which **persists**; smooth = human) and **`data-commit`** = liveness (pending = in-transit,
  settling on commit). Text carries it as a degraded font grade; a button or badge as a dashed "terminal"
  edge with a block caret while acting; an input as a dashed border; a card or region as a dashed outline;
  the whole workspace as a "takeover." The two axes are independent: when an AI action commits, the
  *liveness* settles but the *grade stays grain*: provenance is permanent, not a loading state. (One
  exception: when the AI composes into a real form field it renders clean and human-like, and the
  acting-spotlight carries provenance instead.) Disclosure is a property of the surface, never a separate
  badge.
- **Legible by construction: the action log.** Because every action is a *named verb*, the AI's activity
  is narrated as a running feed of those verbs: the takeover console shows *reads → types → writes →
  revises → commits*, not an opaque spinner. A stream of pixel-clicks can't be narrated meaningfully; a
  closed vocabulary can. The same vocabulary the AI acts through makes its behaviour auditable; and because *every* interaction
  (human or AI) already enters through the one door as a `source`-tagged `Intent`, a single uniform log of
  human *and* AI actions is a natural, cheap extension (the door is the ideal choke point; not built today).

<svg viewBox="0 0 620 486" width="100%" role="img"
     aria-label="The one door: a human click and an AI decision become the same Intent, posted to one endpoint, validated against the registry, applied by a single writer (the reasoner), and pushed back as RenderOps over SSE that update the addressed surfaces. The AI's edits stay grain; the human's settle clean."
     style="display:block;width:100%;max-width:560px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="wp-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <!-- two inputs, one Intent -->
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="95" y="20" width="170" height="40" rx="6"/>
    <rect x="355" y="20" width="170" height="40" rx="6"/>
    <rect x="180" y="96" width="260" height="40" rx="6"/>
    <rect x="125" y="226" width="370" height="40" rx="6"/>
    <rect x="110" y="290" width="400" height="50" rx="6"/>
    <rect x="180" y="364" width="260" height="40" rx="6"/>
    <rect x="100" y="428" width="420" height="50" rx="6"/>
  </g>
  <!-- the door: ink-filled, the choke point (emphasis by fill, no accent — matches the stack figure) -->
  <rect x="155" y="160" width="310" height="42" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg);stroke-width:1"/>
  <!-- arrows -->
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="180" y1="60" x2="292" y2="94" marker-end="url(#wp-arrow)"/>
    <line x1="440" y1="60" x2="328" y2="94" marker-end="url(#wp-arrow)"/>
    <line x1="310" y1="136" x2="310" y2="158" marker-end="url(#wp-arrow)"/>
    <line x1="310" y1="202" x2="310" y2="224" marker-end="url(#wp-arrow)"/>
    <line x1="310" y1="266" x2="310" y2="288" marker-end="url(#wp-arrow)"/>
    <line x1="310" y1="340" x2="310" y2="362" marker-end="url(#wp-arrow)"/>
    <line x1="310" y1="404" x2="310" y2="426" marker-end="url(#wp-arrow)"/>
  </g>
  <!-- labels -->
  <g style="fill:var(--color-fg)" text-anchor="middle">
    <text x="180" y="45">human click</text>
    <text x="440" y="45">AI decision</text>
    <text x="310" y="121">one Intent (same object)</text>
    <text x="310" y="251">validate against the registry</text>
    <text x="310" y="311">single writer: the reasoner<tspan x="310" dy="17" style="fill:var(--color-muted);font-size:12px">the only mutation capability</tspan></text>
    <text x="310" y="389">RenderOps pushed over SSE</text>
    <text x="310" y="449">addressed surfaces update<tspan x="310" dy="17" style="fill:var(--color-muted);font-size:12px">AI stays grain, the human settles clean</tspan></text>
  </g>
  <text x="310" y="186" text-anchor="middle" style="fill:var(--color-bg)">POST /intent — the one door</text>
</svg>
*Figure 1. One door, one writer. A human click and an AI decision are the same `Intent`; neither
mutates state directly: a single writer arbitrates every change and pushes the result back.*

## 3. Related work and positioning

Table 1 is the map; the subsections give the detail and citations. The three axes are the three parts of
the contribution (§4): the point is that each prior cluster occupies *some* of them, and only this work
occupies all three at once.

| Approach | How the AI acts | Human = AI on one shared vocabulary? | One writer / one door? | AI-presence signal |
|---|---|:--:|:--:|---|
| GUI agents / Computer Use [Zhang'24; Anthropic'24] | imitates human input (pixels, DOM, clicks) | ✗ AI mimics; human instructs by chat | ✗ | none inherent |
| Agent–UI protocols (AG-UI, MCP-UI, MCP Apps, A2UI) | agent proposes / streams UI; app renders | ✗ asymmetric agent↔app | ✗ event / data channel | varies |
| Agent-native frameworks (Builder.io Agent-Native '26) | operates app-authored typed actions ("every agent action is also a button") | **✓** shared actions, human & agent | ~ one executor behind *many* doors (UI, HTTP, MCP, A2A, CLI) | none in-surface (permissions + audit logs) |
| Agent-ready design systems (Astryx '26) | *authors* UI code at dev time (CLI / MCP manifest) | ✗ authoring symmetry only; no runtime operation | n/a | none |
| Generative UI (Vercel; "Software as Content") | AI *assembles* the interface at runtime | ~ SaC shares a surface, but generative | ✗ | none inherent |
| Mixed-initiative / interface agents (Horvitz; Lieberman) | a separate agent observes & suggests | ✗ complementary; own affordances | ✗ | agent chrome (icon, dialog) |
| Hypermedia affordances (HATEOAS; Signifiers; "web verbs") | agent discovers & invokes affordances | ✗ machine / agent-only | n/a | none |
| Provenance systems (C2PA, SynthID, Carbon for AI, sparkle) | *disclosure only, not an interaction model* | n/a | n/a | metadata · watermark · container badge · icon |
| **GRAIN (this work)** | **operates a closed, app-authored vocabulary** | **✓ identical primitive** | **✓ one `/intent`, one writer** | **in-surface grade (type + control edges), persistent** |

*Table 1. Positioning. The contribution is the row that is ✓ on all three axes simultaneously; no
prior cluster is. The nearest, Agent-Native, holds the first two and none of the third, which is
what makes the provenance axis load-bearing. (`~` = partial; `n/a` = the axis doesn't apply.)*

### 3.1 Agent–UI interaction protocols (AG-UI, MCP-UI, MCP Apps)

The closest industry neighbours. **AG-UI** standardizes how agents connect to user-facing apps as a
continuous, multi-transport **event stream** (≈16 event types), with generative UI in which "agents
propose trees and constraints, the app validates and mounts" [AG-UI 2025]. **MCP-UI** ships UI *as*
resources rendered in a sandboxed iframe, routing UI-originated interactions back as discrete events
[MCP-UI 2025]. **MCP Apps** (Jan 2026, the first official MCP extension) returns interactive UIs over a
`ui://` scheme and a JSON-RPC-over-`postMessage` channel through which "the model stays in the loop"
[MCP Apps 2026]. Google's **A2UI** (2025) is a further open protocol in the same agent-driven family
[A2UI 2025].

**Intersect:** all three share our instinct that the AI must *not* mutate the DOM directly; notably,
MCP Apps reaches this independently via iframe sandboxing. **Differ:** each is an **asymmetric**
agent↔app negotiation, an agent-proposed generative tree, a mediated event channel, or a privileged
bidirectional model↔UI data channel. **None funnels a human click and an AI decision through one
identical closed vocabulary.** The "no AI→DOM back channel" principle is therefore *not* our novelty;
the **symmetric single-door shared vocabulary** is, with one important contemporary exception,
next.

### 3.2 Agent-native frameworks and agent-ready design systems: the closest contemporaries

**Builder.io "Agent-Native" (2026): the nearest neighbour, and the strongest validation.** An
open-source framework (announced May 2026) whose core primitive, `defineAction()`, binds a typed
schema to server-side logic such that *"every action the agent can take is also a button in the UI,
and every button the user clicks runs the same logic the agent uses"* [Builder.io 2026]. The action
set is application-authored and closed (the agent cannot invent capabilities), and every action runs
one validate → authorize → apply → broadcast pipeline.

**Intersect:** this is our symmetry claim, shipped: property 1 substantially, and property 2
functionally (one action executor). As of mid-2026, human=AI symmetry over an app-authored action
vocabulary can no longer be presented as novel *on its own*, and we cite Agent-Native as
confirmation that the point is real, buildable, and wanted. **Differ:** three things, one of them
decisive. (a) *Transport:* Agent-Native exposes its one executor through **many** doors (UI, HTTP,
MCP, A2A, CLI) where we keep **literally one** endpoint, and that choke point is itself
load-bearing: provenance is stamped at the door, which is what makes the grade trustworthy (§2).
(b) *Rendering:* Agent-Native broadcasts state to clients; we return addressed hypermedia
`RenderOp`s against named surfaces, which is what lets the operator *watch the AI act on the real
controls*. (c) *Decisive:* **Agent-Native has no provenance surface at all.** Agency is governed by
permissions and audit logs (off-surface) and an agent's completed work is visually
indistinguishable from a human's. The conjunction we claim therefore *rests* on provenance-as-grade
being coupled to the same door that enforces the symmetry (§3.6, §4).

The academic articulation of the same instinct is *"Terminal Is All You Need"* (2026): the terminal
already gives human and agent representational compatibility, same medium, same actions, the
agent's activity visible in the medium itself [arXiv 2603.10664]. We agree with the instinct and
note what the terminal lacks: the vocabulary is open (free-form text, not an application-authored
contract), there is no single writer, and visibility scrolls away rather than persisting. It is the
concept; ours is the contract. At the other pole, "agent-first web" proposals argue for **dual-layer**
content, a human-readable surface plus a separate agent-optimized one [arXiv 2606.19116], the
anti-symmetric answer to the same pressure; we take the opposite bet (one surface, two operators).

**Meta Astryx (2026): the same slogan, a different lifecycle phase.** Astryx is a React design
system (160+ components, eight years internal) that is "agent ready" in the *authoring* sense: a CLI
and an MCP server with a machine-readable manifest let an AI **build with** the components,
scaffold, browse docs, generate themes, so that "a person and an AI assistant build the same way"
[Astryx 2026]. There is no runtime story: no action vocabulary on the living page, no write door, no
disclosure of AI presence to an end user. The comparison is clarifying rather than threatening, and
it forces a terminology distinction this paper now makes explicit: **agent-ready** (Astryx) = the AI
can *author* the UI at development time; **agent-operable** (this work) = the AI can *operate* the
UI at runtime, as a peer of the person using it. The two are complementary (a design system could
be both) but they answer different questions, and only the second raises the provenance question at
all.

### 3.3 GUI agents and computer-use: the primary foil

<svg viewBox="-13 -15 336 594" width="100%" role="img"
     aria-label="The inversion. Imitation (GUI agents, computer-use): a model reads pixels, DOM and the accessibility tree, emits clicks and keystrokes, into the app. A shared vocabulary (GRAIN / BATCH): a human and an AI both address one closed action vocabulary, through one door to one writer, into the app."
     style="display:block;width:100%;max-width:430px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-whitep0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
    <rect x="3" y="-12" width="221" height="244" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1;stroke-dasharray:2 3"/>
    <text x="13" y="1" style="fill:var(--color-muted);font-size:11px;letter-spacing:.04em">IMITATION — GUI AGENTS / COMPUTER-USE</text>
    <rect x="65" y="262" width="242" height="301" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1;stroke-dasharray:2 3"/>
    <text x="75" y="275" style="fill:var(--color-muted);font-size:11px;letter-spacing:.04em">SHARED VOCABULARY — GRAIN / BATCH</text>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="79" y="16" width="69" height="36" rx="6"/>
    <rect x="23" y="72" width="181" height="36" rx="6"/>
    <rect x="16" y="128" width="195" height="36" rx="6"/>
    <rect x="87" y="184" width="53" height="36" rx="6"/>
    <rect x="78" y="290" width="72" height="36" rx="6"/>
    <rect x="245" y="290" width="46" height="36" rx="6"/>
    <rect x="87" y="346" width="207" height="36" rx="6"/>
    <rect x="144" y="458" width="94" height="36" rx="6"/>
    <rect x="164" y="514" width="53" height="36" rx="6"/>
  </g>
  <rect x="149" y="402" width="82" height="36" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg);stroke-width:1"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="113" y1="52" x2="113" y2="72" marker-end="url(#fl-whitep0)"/>
    <line x1="113" y1="108" x2="113" y2="128" marker-end="url(#fl-whitep0)"/>
    <line x1="113" y1="164" x2="113" y2="184" marker-end="url(#fl-whitep0)"/>
    <line x1="138" y1="326" x2="166" y2="346" marker-end="url(#fl-whitep0)"/>
    <line x1="245" y1="325" x2="215" y2="346" marker-end="url(#fl-whitep0)"/>
    <line x1="190" y1="382" x2="190" y2="402" marker-end="url(#fl-whitep0)"/>
    <line x1="190" y1="438" x2="190" y2="458" marker-end="url(#fl-whitep0)"/>
    <line x1="190" y1="494" x2="190" y2="514" marker-end="url(#fl-whitep0)"/>
  </g>
  <g text-anchor="middle">
    <text x="113" y="38.3" style="fill:var(--color-fg)">model</text>
    <text x="113" y="94.3" style="fill:var(--color-fg)">read pixels · DOM · a11y</text>
    <text x="113" y="150.3" style="fill:var(--color-fg)">emit clicks and keystrokes</text>
    <text x="113" y="206.3" style="fill:var(--color-fg)">app</text>
    <text x="113" y="312.7" style="fill:var(--color-fg)">human</text>
    <text x="268" y="312.7" style="fill:var(--color-fg)">AI</text>
    <text x="190" y="368.7" style="fill:var(--color-fg)">one closed action vocabulary</text>
    <text x="190" y="424.7" style="fill:var(--color-bg)">one door</text>
    <text x="190" y="480.7" style="fill:var(--color-fg)">one writer</text>
    <text x="190" y="536.7" style="fill:var(--color-fg)">app</text>
  </g>
</svg>
*Figure 2. The inversion. Instead of the AI reverse-engineering an interface built for humans, the
surface exposes an application-authored vocabulary both operators address directly.*

Mainstream LLM-brained GUI agents "emulate end-user behaviors (clicking, typing, navigating)" from
"simple conversational commands," perceiving through accessibility APIs, the DOM, and screenshots, with
action spaces from pixel coordinates to generic device primitives [Zhang et al. 2024; GUI Agents Survey
2024]. **Anthropic Computer Use** is the clearest pole: Claude operates "by looking at a screen, moving
a cursor, clicking buttons, and typing text… the way people do" [Anthropic 2024]. Benchmarks such as
**WebArena** [Zhou et al. 2023] and **OSWorld** [Xie et al. 2024] evaluate exactly this imitation mode.

**Intersect:** the shared goal, an AI that operates the *same* interface a human does. **Differ:** we
invert the mechanism. Rather than the AI reverse-engineering an interface built for humans, the surface
exposes an **application-authored symbolic vocabulary** the AI addresses directly. This is the axis on
which the "finite primitives / piano keys" claim earns its keep. *Honest caveat:* these agents already
act via primitives, so the contrast is not "chat vs. actions" but **"general imitation under
conversational instruction" vs. "a closed shared vocabulary through one door."** A recent
counter-current, "web verbs" [arXiv:2602.17245], likewise replaces pixel/click primitives with typed
semantic actions, confirming the direction of travel; but it is **agent-only**, so the human is not a
peer on that vocabulary, which is precisely our difference. We also decline to argue from capability
gaps: the "agents perform far below humans" framing (WebArena 14.4% vs. human
78%) is **already stale** (IBM's CUGA reported 61.7% by Feb 2025) and must be cited, if at all, only
as a dated baseline.

### 3.4 Mixed-initiative interaction and interface agents (the lineage)

Our intellectual ancestry, not our mechanism. **Horvitz (CHI 1999)** reframes agents-vs-direct-
manipulation as a false dichotomy and seeks "an elegant coupling of automated services with direct
manipulation"; two of his twelve principles, efficient direct invocation/termination, and agent–user
collaboration to refine results, prefigure our human-completes-what-the-AI-produced flow. But LookOut
is a *separate* probabilistic agent overlaid on Outlook, with its own affordances; direct invocation is
an **escape hatch**, not the agent's own primitive [Horvitz 1999]. **Lieberman (Letizia 1995; CHI
1997)** establishes "an agent operating the user's own interface… actions I could have done myself,"
but Letizia *observes and suggests* in a parallel process; it does not actuate the same controls
[Lieberman 1995, 1997]. **Bunt, Conati & McGrenere (2007)** frame the adaptable↔adaptive spectrum by
*who holds control*, the exact axis our symmetry sits on.

**Intersect:** "the agent shares the user's interface" is a thirty-year-old, well-founded idea, and we
cite it as such. **Differ:** none of this prior work makes the agent operate the *identical* action
vocabulary as the human through a single write door. That symmetry-as-mechanism is ours.

### 3.5 Hypermedia, HATEOAS, and affordances-as-API

Our substrate is hypermedia: state transitions are advertised by the representation itself
[htmx/HATEOAS]. Most relevant, **Vachtsevanou et al. (AAMAS 2023)** elevate *signifiers* to a
first-class hypermedia abstraction so agents discover how to interact at runtime, the closest academic
analogue to our "index of the possible vs. snapshot of the true." **Intersect:** affordances published
by the representation, discovered rather than hard-coded. **Differ (to be sharpened):** our vocabulary
is a *closed, human-facing UI* vocabulary shared symmetrically with a person, not a machine-only
hypermedia API for a multi-agent system. Whether "affordances-as-API" already subsumes our claim is an
open question (§8).

### 3.6 Provenance and disclosure; generative UI; accessibility

*(Second research pass, verification completed: 21 claims confirmed, 4 refuted. The automated synthesis
step returned a stub, so this section was merged by hand from the verified set. Provenance-**benefit**
claims remain open empirical questions, §5.)*

**Provenance.** Grade-as-signal sits in the AI-content **provenance/disclosure** space, and the
comparison sharpens the contribution. The prevailing techniques disclose provenance *adjacent to* or
*beneath* the content, not *in* it: **C2PA / Content Credentials** attach cryptographic metadata [C2PA];
**SynthID** embeds an imperceptible watermark; IBM's **Carbon for AI** applies a light metaphor to the
*container / chrome* plus a discrete AI-label component [Carbon for AI]; and even the ubiquitous
**sparkle** badge is not, on its own, a reliable signal that AI is involved (a "sparkle is sufficient"
claim did not survive our verification) [Google Design]. The *idea* of marking AI content in the
surface is also beginning to appear on its own: design-system guidance now proposes background
tints, icons, or border styles to distinguish LLM-generated from verified content [Deka 2025], and
"point-of-decision provenance" appears among the ownership-aware co-writing patterns studied by
Zhang et al. [2026], so the bare concept of in-surface disclosure is not ours either. The
defensible form is narrower, and we state it precisely: provenance rendered **in the operable
surface itself** (the type of the words, the edge of a control, the outline of a card) so the
grade *is* the mark, carried by the very thing the AI produced or touched, with nothing separate to
overlook or strip; **persistent** after the action settles (provenance, not mere liveness); and
**coupled to the action system**, so the same door that admits the `Intent` stamps the provenance the
grade renders, and the disclosure cannot drift from the act. We do not claim it is provably better
(whether such a cue is legible across sighted and non-sighted users is an open empirical question,
§5) only that it is a different and, in this coupled form, unoccupied point.

<svg viewBox="0 0 681 316" width="100%" role="img"
     aria-label="Grade-as-signal is not only typographic. One source, the AI acting on or authoring a surface (data-grade grain, data-commit pending then committed), renders in every operable surface in its own idiom: text as a degraded font grade, a button or badge as a dashed edge with a block caret, an input as a dashed border, a card or region as a dashed outline, and the whole workspace as a takeover."
     style="display:block;width:100%;max-width:560px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-whitep1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="419" y="16" width="195" height="36" rx="6"/>
    <rect x="369" y="78" width="296" height="36" rx="6"/>
    <rect x="433" y="140" width="168" height="36" rx="6"/>
    <rect x="389" y="202" width="255" height="36" rx="6"/>
    <rect x="411" y="264" width="212" height="36" rx="6"/>
  </g>
  <rect x="16" y="140" width="319" height="52" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg);stroke-width:1"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="242" y1="140" x2="471" y2="52" marker-end="url(#fl-whitep1)"/>
    <line x1="302" y1="140" x2="430" y2="114" marker-end="url(#fl-whitep1)"/>
    <line x1="335" y1="162" x2="433" y2="160" marker-end="url(#fl-whitep1)"/>
    <line x1="335" y1="191" x2="404" y2="202" marker-end="url(#fl-whitep1)"/>
    <line x1="252" y1="192" x2="464" y2="264" marker-end="url(#fl-whitep1)"/>
  </g>
  <g text-anchor="middle">
    <text x="175" y="162.3" style="fill:var(--color-bg)">AI is acting on or authored this surface</text>
    <text x="175" y="178.8" style="fill:var(--color-muted);font-size:12px">data-grade=grain · data-commit=pending → committed</text>
    <text x="517" y="38.3" style="fill:var(--color-fg)">text  →  degraded font grade</text>
    <text x="517" y="100.3" style="fill:var(--color-fg)">button / badge  →  dashed edge + block caret</text>
    <text x="517" y="162.3" style="fill:var(--color-fg)">input  →  dashed border</text>
    <text x="517" y="224.3" style="fill:var(--color-fg)">card / list / region  →  dashed outline</text>
    <text x="517" y="286.3" style="fill:var(--color-fg)">whole workspace  →  takeover</text>
  </g>
</svg>
*Figure 3. Grade-as-signal is not only typographic: every operable surface shows the AI's hand in its
own idiom, all keyed off the same `data-grade` / `data-commit` attributes. The grade encodes
**provenance** and persists after commit; only the in-transit **liveness** (block caret, pulse) settles.*

**Generative UI and the closest prior art.** Generative-UI systems have the model *assemble* the
interface at runtime (e.g. mapping tool calls to pre-registered components [NN/g; Vercel 2024]), the
opposite of a fixed, human-authored UI the AI merely *operates*. The nearest neighbour we found is
**"Software as Content"** (2026), a bidirectional human–agent surface, but a first reading that it
*parallels* our shared-vocabulary/single-door model **did not survive verification** (refuted 3-0): it
lands on the **generative-runtime** side (the application is generated as content), not a closed
vocabulary operated identically. It stays the closest neighbour to distinguish against, on exactly the
generate-vs-operate axis, but it does not occupy our point.

**Accessibility as machine-operability.** GUI-agent baselines already read the **ARIA accessibility
tree** as a semantic affordance source, so a fair adversarial reading is that "expose affordances an AI
operates" edges toward "the accessibility tree as an API." Our reply (to be hardened in the verified
pass) is that the accessibility tree describes *what exists* for assistive reading, whereas our
vocabulary defines *what may be done*, symmetrically, as the application's own contract.

## 4. Contribution

The contribution is deliberate: an **architectural synthesis and a working existence proof** of a point
in the design space the literature circles but does not occupy. We do not claim a new capability, and we
do not need one; the value is the specific, opinionated conjunction, built and demonstrated in a
working system:

1. **Symmetry.** A human click and an AI decision resolve to the *identical* `Intent` primitive over one
   closed, application-authored vocabulary, not generic device input, not agent-proposed trees.
2. **The single-writer door.** One `POST /intent`, no privileged AI→DOM channel, as an enforced
   architectural discipline that makes "what the AI may do" literally equal to "what the UI affords."
3. **Provenance-as-grade.** AI presence disclosed *in the operable surface itself*, a persistent grade
   on the content and controls the AI produced or touched (type, control edges, card outlines), rather
   than in an adjacent badge, icon, or metadata record; and coupled to the vocabulary, because the
   provenance the grade renders is stamped at the same door that admits the action.

Each ingredient has prior art (§3); no mapped system combines all three, but the map moved under
us, and we say so. A first adversarial search (July 2026) surfaced no system operating a human and
an AI through one closed, application-defined vocabulary; a second sweep days later surfaced exactly
one that does, **Builder.io Agent-Native** (§3.2), which holds properties 1 and 2 and carries no
provenance surface at all. The consequence is absorbed rather than resisted: symmetry and the
single writer are no longer individually novel, and the claim now rests where the evidence puts it,
on the **full conjunction**, in which provenance-as-grade is not a decoration on the architecture
but *enforced by it* (the door that admits the `Intent` stamps the provenance the grade renders).
We regard the arrival of a well-adopted framework on two of our three axes as validation, not
erosion: a position converged upon from independent directions is a real position. The other
near-misses hold their earlier verdicts: "Software as Content" (2026) shares a bidirectional
human–agent surface but *generates* the application at runtime rather than exposing a closed
vocabulary operated identically (§3.6); "web verbs" is agent-only; Astryx is design-time (§3.2).
Naming what is *not* ours is part of the claim: it is by drawing the borrowed pieces honestly that
the shape of the combination, and the gap it fills, becomes visible. A coherent, buildable
position is a contribution; occupying it in running code is the proof, and §6 states plainly how
much of that occupation stands today.

## 5. Evaluation

The thesis is about the **interaction model** (GRAIN); the evaluation that matters tests *that*. The
substrate (no-build, native-first) is an engineering property of **BATCH**, largely **orthogonal** to the
claim: the same interaction model could run on a heavier stack and the argument would stand. So the
evaluation has one milestone now met (a live model operating the vocabulary), one real track still to run
(the interaction claims, which require user studies), and an explicit out-of-scope note.

**What stands today: the live-model existence proof.** When this paper was first drafted the reasoner
behind the model seam was a scripted stub, and "existence proof" referred to the architecture alone. That
milestone is now met. A small language model runs entirely in the browser (WebLLM, no server, the
operator's own hardware) and reads the same vocabulary the human operates, emitting `Intent`s through the
same `POST /intent` door: it drives a subset of the vocabulary end-to-end, navigation and choice
operations, with its presence rendered in-surface as grade exactly as the architecture requires. This
turns the central "can a live model operate this contract at all" question from *argued* to
*demonstrated*. We state the limits in the same breath: the model is small and its command of the *full*
vocabulary is unproven; the demonstration is an existence proof of feasibility, not a measure of the
manifest's sufficiency as a general instruction set; and it is not a controlled study of any *benefit*
(those are below, and still to run). What it settles is the one thing the architecture could not settle by
construction, that a real model, given only the index and the snapshot, resolves to the same primitives a
human click does, through the one door, with the grade following.

**Primary: interaction claims (require user studies).** These *benefits* have **no support in the mapped
  literature**; we state them as hypotheses, not results:
  - **H1: control / predictability.** Operating an AI through the *same* closed vocabulary the human
    uses gives users more accurate expectations of, and more control over, what the AI will do than a
    chat-driven agent that executes on their behalf.
  - **H2: provenance legibility.** Grade-as-signal is noticed and correctly interpreted (human vs. AI,
    committed vs. in-transit) at least as reliably as a badge/label, including for low-vision users,
    since the literature warns visual-only cues are often missed.
  - **H3: learnability.** Watching the AI operate the visible controls step-by-step helps users learn
    the interface and the task, versus receiving an opaque result.

  **A design that would test these** (writing it costs nothing; running it is the real work): a
  between-subjects comparison of three conditions over one task set, (a) GRAIN symmetric +
  grade-as-signal, (b) a chat-agent that executes behind the scenes, (c) GRAIN with a conventional badge
  instead of grade. Measures, H1: predicted-vs-actual action agreement, error/undo rate, a control
  questionnaire; H2: provenance-recognition accuracy and reaction time, with a screen-reader/low-vision
  arm; H3: post-task ability to perform the task unaided (learning transfer). Pre-register hypotheses and
  analyses. For H2's method, the ownership-recognition instrument of Zhang et al. [2026] (N=176,
  co-writing provenance patterns) is the nearest published template. This is what moves the claims
  from *argued* to *demonstrated*.

**Out of scope (measured, but not evidence for this thesis).** What is built with GRAIN, how it is bundled,
and where it is deployed do not bear on the modality and are not evaluated here. For completeness, the
substrate's no-build / native-first cost has since been measured directly: the same reference app built
four ways and audited by one harness ([framework-bench](https://tjakoen.github.io/framework-bench/), memory `framework-comparison-methodology`). On
the one measured interaction the native / BATCH build ships about 2kb of JavaScript against Next.js's
118kb for the identical filter, roughly 163× less, with the SEO/AEO head held identical across all four so
the comparison is fair. Those numbers are real and we stand behind them, but they measure the *substrate*,
not the *modality*: a heavier stack could carry the same interaction model, so this is context, not proof
of the thesis.

## 6. Limitations and threats

- **Implementation status (honesty over rhetoric).** The reference implementation enforces the
  door, the registry validation, and grade rendering (with unit, integration, and conformance
  tests) for the *human* operator; provenance is stamped server-side and spoof-tested. The model
  seam is no longer a scripted stub: a small language model now runs in the browser, reads the
  manifest, and drives a subset of the vocabulary (navigation and choice operations) end-to-end
  through the door (§5). The manifest's adequacy is therefore *demonstrated* for that subset and
  still untested for the full vocabulary, and the model's small size is its own honest limit. The
  build order paid off as intended: the modality (vocabulary, door, grade, control lifecycle) was
  finished *first*, so the model arrived into a contract rather than a scaffold. "Existence proof"
  now covers the architecture *and* a live model operating it, within the scope §5 states. Two
  legacy direct-write routes predating the door also remain in the demo application and are being
  retired into the documented ownership seam (§2).
- **Fast-moving ground.** The agent-UI protocol landscape (AG-UI, MCP Apps) is months old and shifting;
  capability benchmarks age in weeks. Positioning must be dated, not absolute.
- **Vendor framing.** The AG-UI "tools/agents/users" layering is the ecosystem's self-description; we
  present it as such, corroborated where possible by neutral sources.
- **Scope of the claim.** Our approach suits content, dashboards, and hypermedia surfaces; rich client
  interactivity, offline, and very large dynamic UIs remain genuinely harder, an honest cost we accept
  (cf. ARCHITECTURE §0.5).
- **Symmetry has limits.** Some AI-only or push-only surfaces exist (narration/console); the claim is
  symmetry of the *operable* vocabulary, not that every surface is bidirectional.

## 7. Conclusion

The question "should an AI operate the human interface?" is largely settled, yes. The open question is
**how**. The prevailing answer is imitation under instruction. We offer the alternative: a single closed
vocabulary that a human and an AI operate *identically*, through one door, with the AI's hand shown in
the type. In the older language of the field this is an **augmentation** stance, not an automation one,
the machine extends the operator's reach without leaving their sight. The field's own trajectory
argues for the destination: authoring symmetry (Astryx), action symmetry (Agent-Native), and
standardized channels (AG-UI, MCP Apps) have all shipped; what none of them carries is the operator
seeing, in the surface itself, whose hand did what. It is a synthesis and an existence proof rather
than an invention, a coherent, under-explored point in the design space, occupied here in running
code, architecture first and now a live model operating it too (§6). That is the contribution, and it
is enough.

## 8. Open questions / next research pass

- **Model seam filled (2026-07-17): the milestone this draft called "next" is met.** A small
  in-browser model (WebLLM) now reads the vocabulary and drives navigation and choice operations
  end-to-end through the one door; the abstract, §5, §6, and §7 were revised from "scripted stub /
  declared next milestone" to a working, if narrow, existence proof. What remains open is the *scope*
  (the full vocabulary, larger models) and every *benefit* claim below, which still needs the user
  studies.
- **Third pass (2026-07-03): the landscape moved; absorbed in this revision.** An adversarial
  sweep against the *shipped* landscape (not only papers) surfaced: **Builder.io Agent-Native**
  (May 2026), symmetry + a single executor, no provenance surface; now cited as the closest
  contemporary (§3.2, Table 1) and the reason the novelty claim was narrowed to the full
  conjunction. **Meta Astryx** (June 2026), design-time "agent-ready"; prompted the
  agent-ready/agent-operable terminology split (§3.2). *Terminal Is All You Need* (arXiv
  2603.10664), concept-level symmetry + in-medium visibility; cited as the academic articulation.
  *Who Owns the Text?* (arXiv 2601.10236) and Deka (2025), in-surface provenance as an articulated
  idea; property 3 restated as shipped + persistent + door-coupled. The abstract, §1, §3, §4, and §6
  were revised accordingly, including an explicit implementation-status limitation.
- **Verification done (2026-07-02):** the second pass completed its 3-vote check (21 claims confirmed,
  4 refuted) but the automated synthesis returned a stub, so §3.6 was merged by hand from the verified
  set. Re-running only the synthesis would restore an auto-generated summary; the verdicts themselves are
  settled.
- **Prior-art hunt outcome:** no system was found that operates a human and an AI through one *closed,
  application-defined* vocabulary. The nearest candidate, "Software as Content" (2026), was examined and
  the reading that it *parallels* our model was **refuted**: it is generative-runtime. Novelty holds.
- **Prior-art hunt closed (2026-07-02):** the three loose ends were checked directly and **none
  disconfirms.** arXiv:2602.17245 ("web verbs") argues for typed semantic actions over pixels/clicks but
  is *agent-only* (no human peer on the vocabulary); **Google A2UI** is agent-driven/asymmetric, same
  family as AG-UI (humans use rendered components, agents a JSON format); **agent-native CLIs** give
  agents a *separate* scriptable interface while humans keep the GUI, the opposite of symmetry. Novelty
  survives.
- **A note we caught the hard way:** an earlier candidate citation (Ide et al. 2025, "Signals of
  Provenance") was **withdrawn by its authors** for a result-reporting error and dropped. Re-vet every
  provenance-HCI source for retraction before it goes in.
- **Evaluation design** for the two interaction hypotheses (symmetry → control; grade-as-signal →
  legible provenance).

## References

- Amershi, S., Weld, D., Vorvoreanu, M., et al. (2019). *Guidelines for Human-AI Interaction.* CHI '19. https://dl.acm.org/doi/10.1145/3290605.3300233
- Anthropic (2024). *Introducing computer use, a new Claude 3.5 Sonnet, and Claude 3.5 Haiku.* https://www.anthropic.com/news/3-5-models-and-computer-use
- Astryx / Meta (2026). *Astryx — an open source design system that's fully customizable and agent ready.* https://astryx.atmeta.com · https://astryx.atmeta.com/blog/introducing-astryx · https://github.com/facebook/astryx
- Builder.io (2026). *Agent-Native architecture.* https://www.builder.io/blog/agent-native-architecture · https://github.com/BuilderIO/agent-native · https://www.agent-native.com/docs/what-is-agent-native
- arXiv:2603.10664 (2026). *Terminal Is All You Need* (human–agent representational compatibility in the terminal medium). https://arxiv.org/abs/2603.10664
- arXiv:2606.19116 (2026). *Towards an Agent-First Web* (position; dual-layer human/agent content, cited as the anti-symmetric foil). https://arxiv.org/abs/2606.19116
- Zhang, Bu, Dhillon (2026). *Who Owns the Text?* (ownership-aware human–AI co-writing; point-of-decision provenance; N=176). arXiv:2601.10236. https://arxiv.org/abs/2601.10236
- Deka, N. (2025). *The AI-Ready Design System: the 5 components your component library must update first.* Medium (Design Bootcamp). https://medium.com/design-bootcamp/the-ai-ready-design-system-the-5-components-your-component-library-must-update-first-531309f35d85
- AG-UI (2025). *Agent-User Interaction Protocol — documentation.* https://docs.ag-ui.com/introduction · https://docs.ag-ui.com/agentic-protocols
- Bunt, A., Conati, C., McGrenere, J. (2007). *Supporting Interface Customization using a Mixed-Initiative Approach.* IUI 2007. https://www.sciencedirect.com/science/article/abs/pii/S1071581905001114
- C2PA. *Content Credentials: C2PA Technical Specification — Explainer.* https://spec.c2pa.org/specifications/specifications/2.4/explainer/Explainer.html
- CopilotKit (2025). *The State of Agentic UI: comparing AG-UI, MCP-UI and A2UI.* https://www.copilotkit.ai/blog/the-state-of-agentic-ui-comparing-ag-ui-mcp-ui-and-a2ui-protocols
- Engelbart, D. C. (1962). *Augmenting Human Intellect: A Conceptual Framework.* SRI Summary Report AFOSR-3223. https://www.dougengelbart.org/content/view/138/
- Google (2025). *Introducing A2UI: an open project for agent-driven interfaces.* https://developers.googleblog.com/introducing-a2ui-an-open-project-for-agent-driven-interfaces/
- Google Design. *Researching the AI sparkle icon* (Pozos & Schmidt). https://design.google/library/ai-sparkle-icon-research-pozos-schmidt
- Google DeepMind. *SynthID.* https://deepmind.google/technologies/synthid/
- Horvitz, E. (1999). *Principles of Mixed-Initiative User Interfaces.* CHI '99, ACM, 159–166. http://erichorvitz.com/chi99horvitz.pdf
- htmx. *HATEOAS* (essay). https://htmx.org/essays/hateoas/
- IBM. *Carbon for AI — design guidelines.* https://carbondesignsystem.com/guidelines/carbon-for-ai/
- Lieberman, H. (1995). *Letizia: An Agent That Assists Web Browsing.* AAAI Fall Symposium. https://cdn.aaai.org/Symposia/Fall/1995/FS-95-03/FS95-03-016.pdf
- Licklider, J. C. R. (1960). *Man-Computer Symbiosis.* IRE Transactions on Human Factors in Electronics, HFE-1, 4–11. https://groups.csail.mit.edu/medg/people/psz/Licklider.html
- Lieberman, H. (1997). *Autonomous Interface Agents.* CHI '97, ACM. https://dl.acm.org/doi/10.1145/258549.258592
- MCP Apps (2026). *Bringing Interactive UIs to MCP* (SEP-1865). https://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/ · https://modelcontextprotocol.io/extensions/apps/overview
- MCP-UI (2025). https://github.com/MCP-UI-Org/mcp-ui · https://mcpui.dev/guide/client/resource-renderer
- Nielsen Norman Group. *Generative UI.* https://www.nngroup.com/articles/generative-ui/
- Shneiderman, B. (2022). *Human-Centered AI.* Oxford University Press. (See also *Human-Centered AI: Three Fresh Ideas*, AIS THCI 12(3), 2020.) https://global.oup.com/academic/product/human-centered-ai-9780192845290
- *Software as Content* (2026). arXiv:2603.21334. https://arxiv.org/abs/2603.21334 *(examined; the reading that it parallels our model was refuted, it is generative-runtime.)*
- Vercel (2024). *AI SDK 3.0: Generative UI.* https://vercel.com/blog/ai-sdk-3-generative-ui
- arXiv:2602.17245 (2026). *"Web verbs": typed semantic actions for web agents* (descriptive title; confirm before final cite). https://arxiv.org/abs/2602.17245
- Vachtsevanou, D., Ciortea, A., Mayer, S., Lemée, J. (2023). *Signifiers as a First-class Abstraction in Hypermedia Multi-Agent Systems.* AAMAS 2023. https://arxiv.org/abs/2302.06970
- Xie, T. et al. (2024). *OSWorld: Benchmarking Multimodal Agents for Open-Ended Tasks in Real Computer Environments.* NeurIPS 2024. https://arxiv.org/abs/2404.07972
- Zhang, C. et al. (2024). *Large Language Model-Brained GUI Agents: A Survey.* arXiv:2411.18279. https://arxiv.org/abs/2411.18279
- *GUI Agents: A Survey* (2024). arXiv:2412.13501. https://arxiv.org/html/2412.13501v2
- Zhou, S. et al. (2023). *WebArena: A Realistic Web Environment for Building Autonomous Agents.* ICLR 2024. https://arxiv.org/abs/2307.13854
