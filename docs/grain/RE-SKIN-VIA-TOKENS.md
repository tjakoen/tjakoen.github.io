# How to: re-skin via tokens

**Never edit a component's CSS to change how it looks app-wide.** GRAIN's atoms and the AI-mode
mechanism (`styles/grain.css`) read semantic token *slots*; a consumer re-skins by overriding those
slots in its own sheet, linked **after** GRAIN's.

## The slots

- **fonts:** `--type-font` (the grade switch atoms inherit), `--font-grain`, `--font-smooth`, `--font-accent`
- **ink/paper:** `--ink`, `--paper`, `--color-fg`, `--color-muted`, `--line-soft`
- **scale:** `--space-1`…`--space-8`, `--text-sm`, `--border`, `--radius-sm`, `--radius-md`
- **AI spotlight:** `--ai-veil` (the "AI is acting" backdrop) and `--ai-focus-move` (how slowly the
  spotlight glides between surfaces) — set once in the theme so every page behaves identically.

## Do this

```css
/* your-theme.css — linked AFTER grain/styles/variables.css in <head> */
:root {
  --ink: #1a1a2e;
  --paper: #f4f1ea;
  --radius-md: 12px;
}
```

No component file changes. If a component's look still doesn't move, that component is reading a
hardcoded value instead of a token — that's a bug in the component (CONVENTIONS §4 forbids it), not
something to route around in your override sheet.

## Don't do this

Don't fork a component's `.css` to change its color, spacing, or radius — that's exactly the
per-component edit tokens exist to avoid, and it'll drift the next time the component updates
upstream. If the token slots genuinely don't cover what you need, that's a gap in the token set
worth raising, not a reason to bypass it.

## Verify

```sh
bun run dev
# toggle the theme cycler in the window bar, or set data-theme on <html> —
# a real token override should be visible everywhere the slot is used, immediately
```
