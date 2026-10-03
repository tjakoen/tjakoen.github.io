---
title: "CONVENTIONS"
---

Conventions for BATCH itself and for apps composed from the published stack packages. BATCH is a
standalone library. The portfolio repository is the composition root that runs it with GRAIN and
MILL. When a rule and the surrounding code disagree, the surrounding code wins until this document
is updated; keep them in sync.

> Companion docs: [`PHILOSOPHY.md`](https://github.com/tjakoen/tjakoen.github.io/blob/main/docs/PHILOSOPHY.md) (the why), [`ARCHITECTURE.md`](ARCHITECTURE.md)
> (the substrate), [`GRAIN.md`](../../grain/docs/GRAIN.md) (the design system + AI layer),
> [`AI-INTERFACE.md`](../../grain/docs/AI-INTERFACE.md) (the contract),
> [`DESIGN-SYSTEM.md`](../../grain/docs/DESIGN-SYSTEM.md) (the visual identity), [`grain/README.md`](https://github.com/tjakoen/grain/blob/main/README.md) (usage).

---

## 1. Layers & boundaries

The stack is split across package repositories. BATCH provides the substrate. GRAIN owns the design
system and its interaction contract, without importing BATCH. MILL renders Markdown through GRAIN.
PROOF and CRUMB add plan-board and guided-tour features. The portfolio app brings these packages
together at its composition root.

| Package or app | Responsibility | Current source |
|---|---|---|
| BATCH | Server-rendered composition, HTTP helpers, static export, and audit tools | [BATCH repository](https://github.com/tjakoen/batch) |
| GRAIN | Design system, themes, components, and the human/AI interaction contract | [GRAIN repository](https://github.com/tjakoen/grain) |
| MILL | Markdown content routes and rendering | `@tjakoen/mill` in the GRAIN repository |
| PROOF | Read-only plan board | `@tjakoen/proof` in the GRAIN repository |
| CRUMB | Guided tours and review walkthroughs | `@tjakoen/crumb` in the GRAIN repository |
| Portfolio | Application pages, content, and the composition root | [Portfolio repository](https://github.com/tjakoen/tjakoen.github.io) |

**Hard rules:**

- BATCH imports nothing from GRAIN or a consuming app. It stays usable as a substrate on its own.
- GRAIN imports nothing from BATCH. It defines the `OpChannel` port and lets the host supply a
  compatible implementation.
- A consuming app wires packages at its composition root. The portfolio does this in
  `src/server.ts`.
- Reusable design-system work belongs in GRAIN. App-specific pages and domain components belong in
  the consuming application.

See [the package installation guide](CONSUME-AS-GIT-DEPS.md) for current package relationships,
including PROOF's pinned public BATCH dependency.

A consuming product **re-skins by overriding token slots** in its own sheet linked after
GRAIN's three (`variables.css` → `global.css` → `grain.css`) — never by editing components.

**What "no-build / native-first" governs (and what it doesn't).** The constraint is about the
*product's runtime*, not the dev toolbox. It means exactly two things: (1) **no build step** — Bun
runs the TypeScript directly, no bundler/transpiler between source and server; (2) **native-first**
— the product ships (near-)zero framework JS to the browser (the `bun run audit` numbers are the
proof). It does **not** mean "zero dependencies." Two things are always fair game and are **not**
violations: **platform builtins** (`fs`, `path`, `node:fs/promises` — provided by Bun; batch reads
files with them throughout) and **devDependencies** used by tooling that never ships to the client
(`@playwright/test` drives the e2e tests, `bun run shots`, and `bun run audit` — it measures the
product from the outside, it isn't part of it). The BATCH package itself keeps third-party runtime
dependencies out of its `dependencies` block. An app can depend on published stack packages while
keeping its browser runtime native-first. A dev tool importing Playwright, or the substrate importing
`fs`, is the stack working as intended.

**Native-first is a *positive* rule, not just an absence of framework JS.** It means: **prefer the
platform's own primitive over reimplementing it.** A `<dialog>` over a JS modal; `<details>` over a
JS accordion; the **View Transitions API** over a JS page-animation lib; **plain `<a>` + CSS** over a
JS tab/router; **native constraint validation** over JS form validators; the **Popover API** and
**CSS anchor positioning** over a floating-UI library; **`:has()`** / **`:focus-within`** /
**`color-mix()`** / **`@starting-style`** / **container queries** / scroll-driven animations over
style-computing JS. The test when reaching for JS: *does a browser primitive already do this?* If
yes, use it; only write JS when none does (in this stack the sole such case is the `/intent`
dispatcher). GRAIN's running inventory of which primitives are in use is in
[`grain/docs/GRAIN.md`](../../grain/docs/GRAIN.md) ("What GRAIN gives you"); page transitions are
worked in [ARCHITECTURE §11.3](ARCHITECTURE.md).

---

## 2. TypeScript

- **Factories, not classes**, for wiring: `createX(deps)` / `makeX(opts)` returning a small
  object of closures (e.g. `createInteractionLayer`, `makeStubReasoner`, `createStream`).
  Classes are reserved for **port implementations** (`InMemoryItemRepository implements
  ItemRepository`), domain **error types** (`HttpError`), and plain **service aggregators**.
- **Depend on interfaces, not implementations.** Every cross-layer seam is a named `interface`
  (`OpChannel`, `Reasoner`, `ReasonTools`, `ItemRepository`, `Runtime`, `Stream`). Inject the
  concrete thing at the composition root.
- **Erasable TypeScript only** (`erasableSyntaxOnly` + `verbatimModuleSyntax`): no `enum`, no
  `namespace`, no parameter-properties. Model closed sets as a **union + a const registry**
  (see `ActionName` / `ACTIONS`). Use `import type` for type-only imports.
- `any` / `as` / `!` are allowed only where genuinely necessary (the generic render engine's
  data tree; a cast right after a runtime `typeof` check). Never to silence a real type.
- One header comment per file: `// <path> — one line on what it is (+ a doc ref if useful)`.

---

## 3. Vocabularies — single source of truth (NO magic strings)

**The rule: no magic strings.** Any string referenced in more than one place is a *vocabulary* —
define it **once** and reference the definition; never re-type the literal. Server/TS code uses a
`const` or a **const registry** (union + object); a browser module that can't import TS uses a
**single named-const block** at the top of the file (e.g. the theming attributes/values/control
names in `packages/grain/scripts/theme.js` — `ATTR`/`SCHEME`/`CTRL`/`KEY`). If you're typing the same string
twice, that's the smell.

The only literals allowed are the **cross-layer** ones a static file genuinely can't import — HTML
attributes, CSS selectors, and browser JS. Those must still be (a) single-sourced on the JS side and
(b) **validated at boot by a drift guard** in `server.ts` so a typo fails loudly, not silently. Two
such guards exist today: the **action vocabulary** (harvested `data-action`/`data-accepts` checked
against `ACTIONS`) and the **theming vocabulary** (theme flavors referenced in markup checked against
the `[data-theme="…"]` blocks in `variables.css`). Add a guard whenever you add a cross-layer
vocabulary.

### The action vocabulary

`packages/grain/ai/contract.ts` is the SSOT for everything addressable/operable:

- **`SurfaceKind`** — the closed set of surface kinds; build addresses with `surface(kind, id?)`,
  never by hand-concatenating strings.
- **`ActionName` + `ACTIONS`** — the closed verb registry (`{ depth, accepts: SurfaceKind[] }`).
  Control signals get a named constant (e.g. `STOP_ACTION`), not a literal.
- A human click **and** an AI decision both become the **same `Intent`**, enter the **one door**
  (`/intent` → `interaction-layer.ts`), and return as **`RenderOp`s** addressed to surfaces.
  There is no privileged AI→DOM back channel.

**Adding a verb:** add it to `ActionName` + `ACTIONS` (with its `accepts`), handle it in the
reasoner, and reference it through the registry in TS. String literals are acceptable **only**
in HTML attributes (`data-action`, `data-accepts`) and in browser JS that can't import the
contract (the dispatcher) — both are validated server-side by the drift guard in `server.ts`.

---

## 4. Components

Each component is a self-contained directory under `packages/grain/components/<layer>/<name>/`
(design system) or `view/components/<layer>/<name>/` (the app's domain components), where
layer ∈ atoms / molecules / organisms.

### New-component checklist
- [ ] `<name>.html` — the template (binding vocabulary below). Header comment: `<!-- <layer>/<name> — … -->`.
- [ ] `<name>.css` — component-owned styles. Header comment naming the component + its rule.
- [ ] `<name>.md` — the catalog doc (Human view): `# Name`, prose, `## Section` + fenced HTML examples.
- [ ] `<name>.ai.md` — **only if** the component has AI-mode behavior distinct enough to need its
      own panel (else the catalog grain-flips the Human view automatically).
- [ ] If the component is an **addressable surface that accepts actions**, declare `data-kind`
      + `data-accepts="verb …"` on its root (harvested into the AI manifest; e.g. `mail-row`).

### CSS-only components (layout / pattern)
Some components have **no `.html` template** — they're a class + docs (`.css` + `.md`), composed by
hand rather than data-bound. This is deliberate for **layout shells and patterns** (`app-shell`,
`side-rail`, `tab-bar`, `chat-log`) and **data-driven atoms rendered as raw markup** (`b-badge`,
`b-list`). The checklist's `.html` is required only for components BATCH's render package expands as
a tag.
If a CSS-only component depends on **parent context** to work (e.g. `chat-message` needs a
`chat-log`'s flex column for its `align-self`), state that requirement in its `.md` — an unstated
layout dependency is a silent-failure trap.

### Class naming
- **One root class per component**, variants as **attributes, not extra classes**
  (`.btn[data-variant="soft"]`, never `.btn.soft`). The component **owns its styling**.
- Child elements: **BEM** (`.card__title`) when there are real sub-parts; a single semantic
  class is fine for trivial ones. Be consistent **within** a component.

### Attribute taxonomy (keep these distinct)
| Attribute | Meaning | Examples |
|---|---|---|
| `data-variant` | presentation choice | `soft`, `outline`, `sm`, `lg` |
| `data-status` | semantic/domain state | `active`, `archived`, `success`, `danger` |
| `data-state` | transient UI state | `error`, `loading` |
| `data-commit` | grade = commit state (AI/in-transit) | `pending` |
| `data-grade` | provenance grade (usually on an ancestor) | `grain`, `smooth`, `accent` |

### Template / binding vocabulary (interpreted by BATCH's render package)
| Form | Means |
|---|---|
| `slot-tag prop-as="…"` | polymorphic element (becomes `as`); for atoms that render different tags |
| `prop-attr-X="prop"` | config prop → HTML attribute `X` |
| `prop-text="prop"` | config prop → element text |
| `data-field="path"` · `data="path"` | bind text / scope a child from the data object (`"."` = self) |
| `data-bind-X="path"` | bind attribute `X` from data (e.g. `data-bind-data-surface="surface"`) |
| `each="path"` | repeat once per array item |
| `data-kind` + `data-accepts` | manifest declaration (AI capabilities) |

### AI-mode (grade-as-signal) — one idiom everywhere
A component reads "AI / in-transit" via **`[data-commit="pending"]` (live)** and
**`[data-grade="grain"]` (static/ancestor)** — never a bespoke indicator. Express it the
component's own way, but keyed off those two:
- text → grain font (inherited via `--type-font`, free);
- controls/tags → dashed "terminal" edge (`b-button`, `b-input`, `b-badge`);
- cards → dimmed + dashed outline (`task-card`, `work-card`);
- the actively-working control adds the blinking caret (`b-button`).

**The control lifecycle (one rule for any operator — human or AI).** A control the AI operates
**enters `data-commit="pending"` the moment it's used and HOLDS it until that action's *output*
commits, then releases to the clean/human state** — it does not flash and clear. `pending` is the
whole "working" span, not the click instant. The real dispatcher implements this via
`pendingTriggers` → `clearTrigger(target)` on the committed op (`ai-dispatch.js`, `AI-INTERFACE.md`
§5); **any client-side driver or demo must follow the same lifecycle** (don't hand-roll a bespoke
"running" state). Nested actions each hold their own control (a run's trigger stays pending for the
whole run while each sub-control holds for its own action).
See [`DESIGN-SYSTEM.md`](../../grain/docs/DESIGN-SYSTEM.md) §3, [`AI-INTERFACE.md`](../../grain/docs/AI-INTERFACE.md) §5, and the memory `grade-as-signal-decisions`.

---

## 5. CSS & tokens

- **Token-first. No hardcoded colors, ever** (zero `#hex`/`rgb()` in component CSS — audited).
  Use `var(--token)`. Raw `px` only for true hairlines/offsets (`1px`, `2px` outline).
- Two layers in GRAIN's `packages/grain/styles/variables.css`: **primitives** (palette, scale, grades) → **semantic
  aliases** (`--color-*`, `--type-font`, `--ai-veil`, `--ai-focus-move`). Components read **only
  the semantic aliases**; re-theming repoints them in one place.
- GRAIN's three page-level sheets are **linked** in order (`variables` → `global` → `grain`);
  per-component CSS + the AI module (`ai.css`) are **bundled** into `/components.css`.
- The self-contained islands (`cmdk.js`) may hardcode token **fallbacks**
  (`var(--ink, #1C1B17)`) so they drop onto any page — keep fallbacks matching the tokens.
- Respect `prefers-reduced-motion` for every animation/transition.

---

## 6. Testing — three tiers, write them as you build

Testing is part of the architecture, not an afterthought. Every feature should land with the
appropriate tier(s). From the portfolio root, run `bun test` for unit and integration tests,
`bun run test:e2e` for the browser suite, or `bun run test:all` for both. Package repositories keep
their own test commands in their README files.

| Tier | Runner | Files | What it covers |
|---|---|---|---|
| **Unit** | `bun test` | `*.test.ts` (colocated) | one module in isolation; deps faked. Pure logic, the reasoner, render engine, services, parsing. |
| **Integration** | `bun test` | `*.integration.test.ts` (colocated) | several **real** modules together over HTTP/SSE, no browser. The door → reasoner → push path, routes, manifest. |
| **E2E** | `playwright test` | `e2e/*.e2e.ts` in the portfolio repository | a real browser against the running app. The **client dispatcher** (click/Enter → `/intent` → SSE → DOM), the spotlight, the `<dialog>` palette, interrupts, auto-scroll, view transitions. |

**Tests travel with the code they test:** BATCH and the GRAIN-family packages carry tests beside
their source. The portfolio keeps application unit and integration tests under `src/` and its browser
suite under `e2e/`. Package tests verify a layer on its own; the portfolio suite verifies that the
installed packages work together in the running app.

**Conventions**
- Split by extension so the runners never collide: Bun owns `*.test.ts` (incl.
  `*.integration.test.ts`); Playwright owns `*.e2e.ts` (configured in `playwright.config.ts`).
- Unit/integration use fakes/doubles for ports (see `fakeStream()`, `fakeTools()` patterns) and
  `thinkMs: 0` to skip the reasoner's pacing delays. Fixtures live in `__fixtures__/`.
- E2E asserts user-visible outcomes via roles/`data-surface`, not internals; the Playwright
  `webServer` boots the app in `production` (no hot-reload noise). First browser run needs
  `bunx playwright install chromium`.
- **Coverage bar:** anything with branching logic gets a unit test; any new route/door path gets
  an integration test; any new client-JS interaction gets an e2e test. Don't ship an untested
  new path — the client dispatcher and reasoner are load-bearing.
- **Assert the EFFECT, not the marker.** A test that only checks an attribute flipped, a class was
  added, or an element exists — but never that the user-visible *result* changed — passes green while
  the feature is **inert**. That is how the terminal-expand knob shipped dead: the e2e asserted
  `toHaveAttribute("data-console-expanded", "")` (the marker) while nothing on screen grew (grain
  lesson 9). For any toggle/animation/layout change, assert the **observable consequence** — geometry,
  visibility, text, or count actually changed (e.g. main collapses to ~0 and the console fills the
  space), not that the switch was set. If a mechanism consumes a token/attr, the test must measure the
  motion or layout it produces. See AUDIT check 12 for the matching mechanical guard.
- **Visual regression baseline** (`e2e/visual.e2e.ts` in the portfolio repository): the behavior specs assert what a
  screen *does*; they don't catch a shifted margin, a dropped border, or a broken grid. `toHaveScreenshot`
  pins the pixels of the key **static** screens (welcome, `/grain`, `/batch`, `/catalog`,
  `/about`) so a silent visual regression fails loudly. Baselines are committed
  (`visual.e2e.ts-snapshots/`, per-OS) and CSS animation is frozen at capture; only deterministic
  screens qualify (mid-run/typing states are non-deterministic — leave those to `bun run shots`).
  After an **intentional** visual change, re-bless: `bun run test:e2e visual --update-snapshots`.

---

## 7. Errors & observability

- **Substrate/domain:** throw typed errors (`HttpError`); `jsonError()` logs server-side and
  returns a safe message — never leak internals to the client.
- **The AI door:** invalid intents are **rejected at the door** with a `flash` op (UI feedback),
  not an exception; failed writes **roll back** to a `flash` + `ok:false` decision.
- **htmx fragments** return a friendly error fragment with `200` so the swap still happens;
  **JSON** routes use the proper status.
- Log with a tagged prefix (`console.error("[interaction-layer]", e)`); user-facing copy stays
  plain and reassuring ("Couldn't complete that — left it as it was.").

---

## 8. Naming & files

- Files & directories: **kebab-case**. Component dir name = its tag (`b-button`, `task-card`).
- One file = one concern; colocate a module's test next to it.
- Headers everywhere (§2). Section dividers in CSS: `/* ---- label ---- */`.
- Commit messages: imperative subject, a short body explaining *why*. No AI attribution
  trailers (the AI-use receipt lives in the README badge + footer, not commit metadata).

---

## 9. Quick "add a …" recipes

- **A reusable component:** add it to the GRAIN package in the GRAIN repository. An app-specific
  component belongs in that application's component directory. Use the GRAIN tokens and add tests
  for behavior the component owns.
- **An action or verb:** extend GRAIN's contract and reasoner, then cover the interaction in the
  package tests and the host app's integration path.
- **A portfolio page:** add it under `view/pages/` in the portfolio repository, link the GRAIN
  stylesheets and component bundle, give operable regions a `data-surface`, and cover new interactions
  with a browser test.
- **A theme change:** edit GRAIN's default theme in the GRAIN repository, or override its tokens in
  the consuming app when the change is specific to that app.

---

## 10. Package boundaries in current work

The package split is complete. Make changes in the repository that owns the package or application
being changed, and test that boundary there.

| Repository | Owns | Verification |
|---|---|---|
| [BATCH](https://github.com/tjakoen/batch) | The substrate package, including rendering, HTTP helpers, export, audit, and its unit tests | Run `bun test` and `bun run check` in the BATCH checkout. |
| [GRAIN](https://github.com/tjakoen/grain) | GRAIN, MILL, PROOF, CRUMB, their package tests, and the workspace-only MCP server | Run the workspace checks from that repository. |
| [Portfolio](https://github.com/tjakoen/tjakoen.github.io) | The composition root, site routes, domain components, content, and browser tests | Run the portfolio typecheck, unit suite, and Playwright suite. |

The application owns the integration between packages. A shared feature that belongs in a package
should be implemented and released by that package's maintainers, then consumed by the app through
its package interface. Avoid restoring the old monorepo layout through copied source folders or
relative imports across repository boundaries.
