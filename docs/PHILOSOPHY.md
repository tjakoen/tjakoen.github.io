# PHILOSOPHY.md — the *why*

The beliefs behind this stack. This is the single source of truth for **why** the project is
built the way it is; the linked docs are the single source of truth for **how**. If a belief here
and a mechanism there ever disagree, the mechanism doc wins for *how*, and we fix the wording here.

> Altitude: this file states values in a sentence or two and points *down* to the doc that
> implements each. It does not re-explain mechanisms. Read it first; follow the arrows for detail.

## The thesis (the one thing everything serves)

> **Every surface is addressable and operable by both a human and an AI through one shared
> vocabulary, and the AI's presence is a visible signal (*grain = AI*).**

A human click and an AI decision become the **same `Intent`**, enter through **one door**
(`POST /intent`), and return as **`RenderOp`s** pushed over SSE. There is **no privileged AI→DOM
back channel**. The AI earns no shortcut a person doesn't have — it drives the same controls.
→ *how:* [CONVENTIONS §3](../../batch/docs/CONVENTIONS.md) · [ARCHITECTURE §17](../../batch/docs/ARCHITECTURE.md) · [AI-INTERFACE.md](../../grain/docs/AI-INTERFACE.md)

### The stance behind it: augmentation, not automation

The AI is an **extension of you, not a replacement.** That is *why* it uses the same interface: a
human click and an AI decision are the same primitive, which puts human and AI on **equal footing** —
the AI gets no affordance you lack, and does nothing behind your back. Because it acts through the
visible controls and shows its hand (grain = AI), you can **watch what it does, see how it works, and
learn from it** — a demonstration, not an opaque result handed back from offstage. This is the
*intelligence-augmentation* tradition (Licklider's man–computer symbiosis, Engelbart's augmenting
human intellect) and its modern form, human-centered AI (Shneiderman): amplify and empower the person,
keep them in control, don't automate them away. → the argued, cited version:
[the whitepaper](../notes/whitepaper-one-vocabulary.md).

## The bets

Each is a conviction, not a preference. We hold them until the code proves one wrong.

- **Built for a human, more so for an AI.** Every surface must be easy for a person *and even more*
  legible and operable for an AI — because the AI has no eyes, only the vocabulary, the manifest, and
  the grade. If a person can use a surface but the AI stumbles on it, the surface isn't done. This is
  the harder half of the symmetry bar (never a privilege for the AI — see *equal footing* above), and
  it's the half we optimize for. → [AI-INTERFACE.md](../../grain/docs/AI-INTERFACE.md)
- **A mistake is a design signal, not just a bug.** When something breaks, a check flags, or an AI (or
  a person) trips on the system, we fix the *cause* — the contract, the doc, the architecture — not
  only the instance, so it can't recur. An operator tripping is a measurement of the system's clarity,
  not just the operator's; if the AI got it wrong, suspect the contract first. → the layer meta-lessons
  that live this out: [grain/CLAUDE.md](../../grain/CLAUDE.md) (lesson 5), [batch/CLAUDE.md](../../batch/CLAUDE.md).
- **No build step.** The server *is* the build step — it composes final HTML on every request.
  Edit, refresh, done. A `dist/` only ever appears as a *projection* of the running server, never a
  second renderer. → [ARCHITECTURE §0.5](../../batch/docs/ARCHITECTURE.md), [§18](../../batch/docs/ARCHITECTURE.md)
- **Native-first.** Standards → runtime-native → library, in that order. Modern HTML/CSS/JS are
  strong enough that a framework is a cost, not a given. No Tailwind, no SCSS, no client framework.
  In practice the browser's own primitives do the work the framework used to: the native **View
  Transitions API** animates page navigation, **`<dialog>`** and **`<details>`** are the modals and
  disclosures, **native form validation** replaces JS validators, and **`:has()`** / **`color-mix()`**
  drive behavior and theming — so the only client JS the product ships is the one interaction
  dispatcher. Native-first is not just *avoiding* framework JS; it's *preferring the platform's own
  primitive* over reinventing it. → [ARCHITECTURE §0](../../batch/docs/ARCHITECTURE.md),
  [§11.3](../../batch/docs/ARCHITECTURE.md), [CONVENTIONS §2](../../batch/docs/CONVENTIONS.md),
  [GRAIN.md](../../grain/docs/GRAIN.md) ("What GRAIN gives you")
- **Hypermedia, server-rendered.** Fragments over the wire, htmx for reads/nav; avoids a client
  framework, a build, and client/server state-sync bugs. → [ARCHITECTURE §0.5](../../batch/docs/ARCHITECTURE.md)
- **Fast because there's less.** No client framework, no hydration, static-serveable output → fast
  by construction. *This is a claim we intend to measure, not just assert* (Lighthouse + real SEO
  wins are an open task before we print numbers on the `/batch` page).
- **The AI gets a modality, not a chat channel.** A finite vocabulary of real action primitives —
  like keys on a piano: structured at the primitive level, infinitely expressive in combination.
  The AI reads a generated **index** (what's *possible*) against a live **snapshot** (what's *true
  now*), and the surface's own affordances are its **physics**. → [AI-INTERFACE.md](../../grain/docs/AI-INTERFACE.md)
- **Grade-as-signal.** Type grade carries meaning: **grain = AI / in-transit**, clean = human /
  committed. The AI's presence is always shown, never hidden. → [CONVENTIONS §4.5](../../batch/docs/CONVENTIONS.md) ·
  [DESIGN-SYSTEM.md](../../grain/docs/DESIGN-SYSTEM.md)
- **Tokens only.** No hardcoded colors, ever. Components read semantic `var(--token)`s; re-skinning
  repoints tokens in one place, never edits a component. → [CONVENTIONS §5](../../batch/docs/CONVENTIONS.md)
- **Atomic design, credited.** Components compose bottom-up as atoms → molecules → organisms — the
  method **Brad Frost** named ([*Atomic Design*, 2013](https://atomicdesign.bradfrost.com/)). We use
  the taxonomy deliberately; the atomic layer lives in GRAIN. → [ARCHITECTURE §2](../../batch/docs/ARCHITECTURE.md) ·
  [DESIGN-SYSTEM.md](../../grain/docs/DESIGN-SYSTEM.md)
- **Layers point inward; seams are ports.** `batch` imports nothing outward; `grain` imports nothing
  from `batch` except the `OpChannel` port; consumers wire the rest. Reach across a layer → add a
  port, don't reach. → [CONVENTIONS §1](../../batch/docs/CONVENTIONS.md), [§10](../../batch/docs/CONVENTIONS.md)
- **Tests are part of the work.** Three tiers — unit / integration / e2e — written as you build, not
  after. → [CONVENTIONS §6](../../batch/docs/CONVENTIONS.md)
- **Content is Markdown; pages are a projection of it.** Human-authored content lives as `.md` +
  images and is rendered to GRAIN pages by **MILL** — one content source, many consumers (human page,
  RAG corpus, published docs). → [mill/PLAN.md](../../mill/PLAN.md)

## What we reject

- A build step that turns source into a separate artifact (export stays a crawl-and-freeze).
- A privileged AI back channel, or any hidden AI action (grain always shows).
- Hardcoded styling in components; per-component theme overrides.
- Framework/library reached for before standards and native APIs are exhausted.
- Skeuomorphic chrome and generic template polish (see `tjakoen.github.io/docs/architecture/FEATURES.md` anti-features).
- Unbounded model trust — the AI is grounded (RAG) and acts only through the closed vocabulary.

## The four concerns (one direction of dependency)

```
batch/   BATCH — the substrate (Bun · Addressable · TypeScript · CSS · htmx); no build step
  └─ grain/   GRAIN — an AI-interaction design system + its default theme
       ├─ project/     the product ("Project")
       ├─ mill/        the Markdown→GRAIN CMS (a layer above grain; PLANNED)
       └─ tjakoen.github.io/   the personal site (a custom BATCH+GRAIN app that *uses* MILL for content)
```

`project/`, `mill/`, and `tjakoen.github.io/` are independent consumers of `grain` + `batch`.
→ canonical diagram + rules: [CLAUDE.md](../../CLAUDE.md) · [CONVENTIONS §1](../../batch/docs/CONVENTIONS.md)

## Where each truth lives (so nothing forks)

| For the… | Read |
|---|---|
| **why / beliefs** | **this file** |
| substrate mechanism + trade-offs | [ARCHITECTURE.md](../../batch/docs/ARCHITECTURE.md) |
| build rules (layering, tokens, testing, vocabulary) | [CONVENTIONS.md](../../batch/docs/CONVENTIONS.md) |
| AI contract (surfaces, ops, manifest, "AI acts") | [AI-INTERFACE.md](../../grain/docs/AI-INTERFACE.md) |
| visual identity / grade-as-signal | [DESIGN-SYSTEM.md](../../grain/docs/DESIGN-SYSTEM.md) |
| the design system overview | [GRAIN.md](../../grain/docs/GRAIN.md) |
| the CMS | [mill/PLAN.md](../../mill/PLAN.md) |
| the operable SSOT (types) | `grain/ai/contract.ts` |

Showcase pages (`/grain`, `/batch`) and the whitepaper are **projections** of these docs —
teasers that link back, never forks.
