# How to: add a component

The full rules are [`CONVENTIONS.md`](../../batch/docs/CONVENTIONS.md) §4; this is the short,
task-oriented version.

## Where it lives

A directory under `grain/components/<layer>/<name>/` (design system) or
`tjakoen.github.io/components/<layer>/<name>/` (app-specific), `layer` ∈ `atoms` / `molecules` /
`organisms`.

## The checklist

- [ ] `<name>.html` — the template, using the binding vocabulary (`data-field`, `data-bind-<attr>`, `each`, polymorphic `slot-tag prop-as=`). Header comment: `<!-- <layer>/<name> — … -->`.
- [ ] `<name>.css` — component-owned styles. **One root class, variants as attributes** (`.btn[data-variant="soft"]`, never `.btn.soft`) — never a hardcoded color, only `var(--token)`s.
- [ ] `<name>.md` — the catalog doc: `# Name`, prose, `## Section` + fenced HTML examples. This is what makes the component self-documenting at `/catalog` — there's no separate registration step.
- [ ] `<name>.ai.md` — only if the component's AI-mode behavior is distinct enough to need its own panel (otherwise the catalog grain-flips the Human view automatically).
- [ ] If it's an **addressable surface that accepts actions**, declare `data-kind` + `data-accepts="verb …"` on the root — see [`MAKE-A-SURFACE-OPERABLE.md`](MAKE-A-SURFACE-OPERABLE.md).

## CSS-only components

Some components have no `.html` (a class + docs only) — deliberate for layout shells/patterns (`app-shell`, `tab-bar`, `chat-log`) and data-driven atoms (`b-badge`, `b-list`). The `.html` file is only required for components `batch/render` expands as a tag. If a CSS-only component needs **parent context** to work (e.g. `chat-message` needs a `chat-log`'s flex column), state that in its `.md` — an unstated layout dependency is a silent-failure trap.

## Verify it landed

```sh
bun run dev
# then open /catalog — the new component appears automatically, no registration
bun run check && bun test
```

If the component wires a `data-action`, the boot-time drift guard in `server.ts` will warn on
startup if that verb isn't in `ai/contract.ts`'s `ACTIONS` registry.
