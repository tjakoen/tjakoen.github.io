---
title: "CONVENTIONS"
---

How we build on this stack. The goal is one consistent, reusable, scalable way to do
each thing — so new code (and new sessions) extend the grain instead of fighting it.
When a rule and the surrounding code disagree, the surrounding code wins until this doc
is updated; keep them in sync.

> Companion docs: [`PHILOSOPHY.md`](../PHILOSOPHY.md) (the why), [`ARCHITECTURE.md`](ARCHITECTURE.md)
> (the substrate), [`GRAIN.md`](../../grain/docs/GRAIN.md) (the design system + AI layer),
> [`AI-INTERFACE.md`](../../grain/docs/AI-INTERFACE.md) (the contract),
> [`DESIGN-SYSTEM.md`](../../grain/docs/DESIGN-SYSTEM.md) (the visual identity), [`grain/README.md`](https://github.com/tjakoen/grain/blob/main/README.md) (usage).

---

## 1. Layers & boundaries

Four concerns, one direction of dependency (each layer builds only on those below):

```
batch/   the no-build hypermedia substrate (render, http, assets, catalog, platform)
   └─ grain/   the design system + optional AI-interaction layer (default theme lives here)
        ├─ mill/       the Markdown→GRAIN CMS (a reusable layer above grain; built)
        └─ tjakoen.github.io/  THE app + composition root — a custom BATCH+GRAIN site that uses
                               MILL for content; holds domain components, routes, pages, server.ts
   (project/   the AI-assistant product — PAUSED since 2026-07-05, a docs-only archive)
```

**Hard rules (enforced by review; verified in the audit):**
- `batch/` imports **nothing** from `grain/` (or the app). It's the substrate; it must extract cleanly.
- `grain/` imports **nothing** from `batch/`. It depends only on the **`OpChannel` port**
  (`grain/ai/contract.ts`) — never a concrete substrate. It ships its own default theme.
- `tjakoen.github.io/` wires the graph. Cross-layer dependencies are declared as **constructor/factory
  params**, and the **only place the layers meet is `tjakoen.github.io/server.ts`** (the composition root).
- New design-system work goes **in `grain/` by default** (it's reusable). Only obviously
  app-specific things (a one-off page layout, a domain component like `loop-card`) live in the app
  (`tjakoen.github.io/`). Test: *"would another product on GRAIN want this?"* → yes = grain, no = the app.

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
product from the outside, it isn't part of it). The bar to defend is the `dependencies` block in
`package.json`: keep third-party *runtime* deps at zero (today only `bun` itself). A dev tool
importing playwright, or the substrate importing `fs`, is the stack working as intended.

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
names in `grain/scripts/theme.js` — `ATTR`/`SCHEME`/`CTRL`/`KEY`). If you're typing the same string
twice, that's the smell.

The only literals allowed are the **cross-layer** ones a static file genuinely can't import — HTML
attributes, CSS selectors, and browser JS. Those must still be (a) single-sourced on the JS side and
(b) **validated at boot by a drift guard** in `server.ts` so a typo fails loudly, not silently. Two
such guards exist today: the **action vocabulary** (harvested `data-action`/`data-accepts` checked
against `ACTIONS`) and the **theming vocabulary** (theme flavors referenced in markup checked against
the `[data-theme="…"]` blocks in `variables.css`). Add a guard whenever you add a cross-layer
vocabulary.

### The action vocabulary

`grain/ai/contract.ts` is the SSOT for everything addressable/operable:

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

Each component is a self-contained directory under `grain/components/<layer>/<name>/` (design
system) or `tjakoen.github.io/view/components/<layer>/<name>/` (the app's domain components), where
layer ∈ atoms / molecules / organisms.

### New-component checklist
- [ ] `<name>.html` — the template (binding vocabulary below). Header comment: `<!-- <layer>/<name> — … -->`.
- [ ] `<name>.css` — component-owned styles. Header comment naming the component + its rule.
- [ ] `<name>.md` — the catalog doc (Human view): `# Name`, prose, `## Section` + fenced HTML examples.
- [ ] `<name>.ai.md` — **only if** the component has AI-mode behavior distinct enough to need its
      own panel (else the catalog grain-flips the Human view automatically).
- [ ] If the component is an **addressable surface that accepts actions**, declare `data-kind`
      + `data-accepts="verb …"` on its root (harvested into the AI manifest; e.g. `loop-card`).

### CSS-only components (layout / pattern)
Some components have **no `.html` template** — they're a class + docs (`.css` + `.md`), composed by
hand rather than data-bound. This is deliberate for **layout shells and patterns** (`app-shell`,
`side-rail`, `tab-bar`, `chat-log`) and **data-driven atoms rendered as raw markup** (`b-badge`,
`b-list`). The checklist's `.html` is required only for components `batch/render` expands as a tag.
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

### Template / binding vocabulary (interpreted by `batch/render`)
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
- cards → dimmed + dashed outline (`loop-card`, `item-card`);
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
- Two layers in `grain/styles/variables.css`: **primitives** (palette, scale, grades) → **semantic
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
appropriate tier(s). Run: `bun run test` (unit + integration), `bun run test:e2e` (browser),
`bun run test:all` (both).

| Tier | Runner | Files | What it covers |
|---|---|---|---|
| **Unit** | `bun test` | `*.test.ts` (colocated) | one module in isolation; deps faked. Pure logic, the reasoner, render engine, services, parsing. |
| **Integration** | `bun test` | `*.integration.test.ts` (colocated) | several **real** modules together over HTTP/SSE, no browser. The door → reasoner → push path, routes, manifest. |
| **E2E** | `playwright test` | `tjakoen.github.io/e2e/*.e2e.ts` | a real browser against the running app. The **client dispatcher** (click/Enter → `/intent` → SSE → DOM), the spotlight, the `<dialog>` palette, interrupts, auto-scroll, view transitions. |

**Tests travel with the code they test** (this is what makes the repo split clean, §10):
unit tests are colocated in `batch`/`grain`/`project`; the door **integration** test lives in
`tjakoen.github.io/src/routes/` (it exercises the app's composition); **e2e** lives in `tjakoen.github.io/e2e/` because
it drives the *product*. `batch`/`grain` carry only their own unit tests; a grain demo harness
would get its own e2e when grain is extracted.

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
- **Visual regression baseline** (`tjakoen.github.io/e2e/visual.e2e.ts`): the behavior specs assert what a
  screen *does*; they don't catch a shifted margin, a dropped border, or a broken grid. `toHaveScreenshot`
  pins the pixels of the key **static** screens (welcome, `/loop` idle, `/grain`, `/batch`, `/catalog`,
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

- Files & directories: **kebab-case**. Component dir name = its tag (`b-button`, `loop-card`).
- One file = one concern; colocate a module's test next to it.
- Headers everywhere (§2). Section dividers in CSS: `/* ---- label ---- */`.
- Commit messages: imperative subject, a short body explaining *why*. No AI attribution
  trailers (the AI-use receipt lives in the README badge + footer, not commit metadata).

---

## 9. Quick "add a …" recipes

- **A component:** make the dir + the 3–4 files (§4 checklist) in `grain/` (or `tjakoen.github.io/`
  if domain-only); use tokens (§5); express AI-mode via the shared idiom; add a `.md` example; if
  it accepts actions, declare `data-kind`/`data-accepts`. Add a unit/e2e test if it has behavior.
- **An action/verb:** extend `ActionName` + `ACTIONS` (§3), handle it in the reasoner, reference
  it via the registry; add a unit test (reasoner) + integration test (door path).
- **A page:** add `tjakoen.github.io/pages/<name>.html`, link the three GRAIN sheets + `/components.css`,
  give acting regions a `data-surface`; e2e-test any new interaction.
- **A theme tweak:** edit `grain/styles/variables.css` token values (or a project override
  sheet) — never per-component.

---

## 10. On extraction (the future repo split)

The three dirs are headed for **three repos**: `batch` (a published substrate package),
`grain` (a design-system package on a substrate), `project` (the product, on `grain`). The
boundaries (§1) are kept clean so the split is a copy, not a rewrite. What goes where:

| Repo | Takes | Tests it carries |
|---|---|---|
| **batch** | `batch/**` + its `__fixtures__/` | its colocated `*.test.ts` (no app, no e2e) |
| **grain** | `grain/**` (AI layer, components, default theme, fonts, islands, the catalog) | its colocated `*.test.ts`; **adds its own e2e** against a minimal demo harness |
| **tjakoen.github.io** (the app) | `tjakoen.github.io/**` incl. `tjakoen.github.io/e2e/` + a copy of `playwright.config.ts` | its `*.test.ts`, the door `*.integration.test.ts`, and the e2e suite |
| **project** (paused) | `project/**` — docs-only archive (`PROJECT-PLAN.md`, `docs/MVP.md`); no code/tests until the product resumes | — |

**Monorepo-level tooling** (`package.json`, `tsconfig.json`, `playwright.config.ts`, `bun.lock`,
`.gitignore`) is split/copied per repo. What changes on extraction (and **only** this — the
code doesn't):
- **`tjakoen.github.io/config.ts` paths** — `./grain/components`, `./grain/styles`, `./grain/fonts` become
  resolved package paths (or stay relative if vendored). The static/serving wiring follows.
- **Cross-layer imports** — `../batch/*` and `../grain/*` become package imports
  (`@org/batch`, `@org/grain`). Nothing else: `batch` imports nothing inward, and `grain`
  already depends only on the `OpChannel` port + the binding-vocabulary contract.
- **`playwright.config.ts`** moves into the project repo; its `webServer.command` simplifies to
  `bun server.ts` (cwd becomes the repo root, so `config.ts`'s relative roots still resolve).
- **The drift guard + manifest harvest** keep working unchanged.

Keep this true as you build: if a new cross-layer dependency can't be expressed as "project →
grain → (port) ← batch", it's a smell — add a port, don't reach across.
