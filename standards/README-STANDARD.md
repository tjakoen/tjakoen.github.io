---
title: README-STANDARD.md — the README standard
summary: How a README presents itself across every repo - the title emoji, the badge row, and the footer, plus a reusable prompt.
---

# README standard + reusable prompt

My standard for how a README presents itself across all my repos: title emoji, badge row, and the
footer, plus a copy-paste prompt that tells an AI how to apply it to any repo. Companion to
[VOICE.md](VOICE.md) (the footer follows that voice) and [NOTE-STANDARD.md](NOTE-STANDARD.md) (the
same idea for notes/blog posts instead of READMEs).

## The standard

**Two jobs badges do:**
- **Status (dynamic, self-verifying):** CI, coverage, version, license. They pull live data and
  can't be faked. Use them *only when the underlying thing actually exists*.
- **Signal (static, hand-set):** tech stack, stance, methodology. Pure communication. *I* have to
  keep them true.

**Two hard rules:**
1. **Honesty.** A badge is a claim. Never badge what the repo can't back: no "0 deps" on a repo with
   deps, no "CI passing" with no CI. Overclaiming badges is the README version of vibe-coding you
   can't explain. When in doubt, leave it off.
2. **Don't wear all of them.** Curate to ~5–7 max. Each badge earns its place. A wall of 15 pills
   reads as insecure, not impressive.

**Always on, every repo:**
- A **title emoji**: one emoji right before the H1, chosen to fit the repo's identity/name/purpose
  (e.g. GRAIN → 🍞, BATCH → 🥖). One only, tasteful. My stack repos lean into a bread/baking family;
  unrelated repos just pick whatever genuinely fits.
- The identity badge **Made with Claude** (coral `#D97757`, links to my AI post).
- The quirky **text footer** at the bottom (see snippet below); voice per [VOICE.md](VOICE.md).

**Constants:**
- Canonical AI post (badge + footer link target): `https://tjakoen.github.io/notes/ten-times-zero`
  (use this absolute URL in every repo except this one, where the note lives locally).
- Identity color: `#D97757` (Anthropic coral). "Good/true claim" green: `2ea44f`.

## Category menu (pick only what applies)

**Identity** (always): `Made_with-Claude-D97757?logo=anthropic&logoColor=white`
**Tech stack** (real runtime/langs/framework only): Bun / TypeScript / htmx / React / Node / CSS …
**Stance / thesis** (only if TRUE): `build_step-none`, `runtime_deps-0`, `client_framework-none`, `architecture-server--rendered_hypermedia`
**Methodology** (only if actually practiced): `design-atomic`, `theming-design_tokens`, `a11y-semantic_HTML`, `tests-unit_·_integration_·_e2e`
**Status (dynamic)** (only if set up): GitHub Actions CI badge, `github/license`, version.

shields.io format: `https://img.shields.io/badge/LABEL-MESSAGE-COLOR?logo=SLUG&logoColor=white`.
If a `logo=` icon doesn't render, drop the logo params; the pill still works.

## The footer snippet (bottom of every README)

```markdown
---
🤖 **Built with Claude. I don't prompt and pray, I prompt and prove.** Every commit here is co-authored with an AI, on purpose. [How I actually work with AI, receipts and all →](https://tjakoen.github.io/notes/ten-times-zero)
```

---

## The prompt (paste into Claude Code in any repo)

```text
Give this repo's README a title emoji, a curated badge row, and a footer, following my personal
standard. Be rigorous about honesty — this is built on "keep the receipts," so a false badge is
worse than no badge.

STEP 1 — READ THE CODEBASE before claiming anything. Don't guess from the name; actually look:
- Read the README, the top-level folder layout, and the main source files to understand what this
  repo genuinely IS and DOES.
- Read package.json / equivalent for the real runtime vs dev dependencies, the runtime, the
  language(s). Confirm whether there's a build step and a client framework, and count the REAL
  runtime deps.
- Check .github/workflows for CI, a LICENSE file, a published version — needed for any dynamic badge.
- Look for methodologies actually practiced in the code/docs (atomic design, design tokens,
  accessibility/semantic HTML, a real multi-tier test suite, etc.).

STEP 2 — pick a TITLE EMOJI. Choose ONE emoji that genuinely fits what you learned this repo is —
its purpose or name (e.g. GRAIN → 🍞, BATCH → 🥖). Just one, tasteful. Place it right before the H1
title: "# <emoji> <Title>". If my repos share a theme (mine lean bread/baking), fit the family; if
this repo is unrelated, pick whatever honestly fits.

STEP 3 — pick badges by these rules:
- HONESTY: include a badge only if it's demonstrably TRUE from what you found in STEP 1. No CI/
  coverage/license/version badge unless that thing actually exists and is wired up. If unsure, omit.
- DON'T WEAR ALL OF THEM: curate to about 5–7 total. Each badge must earn its place. No badge fatigue.
- ALWAYS include, first in the row, the identity badge:
  [![Made with Claude](https://img.shields.io/badge/Made_with-Claude-D97757?logo=anthropic&logoColor=white)](https://tjakoen.github.io/notes/ten-times-zero)
- Then pick from, choosing only what THIS repo actually supports: tech stack (real ones only),
  stance/thesis (only if true — e.g. no build step, 0 runtime deps, no client framework), methodology
  (only if actually practiced), and dynamic status (only if set up). Skip categories that don't apply.

STEP 4 — output:
- The updated H1 line with the title emoji.
- The exact badge markdown as a row right under the H1. Use shields.io static badges:
  https://img.shields.io/badge/LABEL-MESSAGE-COLOR?logo=SLUG&logoColor=white (drop logo params if a
  slug won't render). Green 2ea44f for "true claim" stance badges; identity coral is D97757.
- This footer at the very bottom of the README (voice: proud, a little quirky, NO backticks and NO em-dashes in prose):
  ---
  🤖 **Built with Claude. I don't prompt and pray, I prompt and prove.** Every commit here is
  co-authored with an AI, on purpose. [How I actually work with AI, receipts and all →](https://tjakoen.github.io/notes/ten-times-zero)
- A short reasoning list: one line per chosen badge on why it's TRUE (your evidence), one line on why
  you picked that emoji, and an explicit list of any badge you CONSIDERED but rejected — flagged as
  either honesty (not true / not verifiable) or curation (would've been badge #8+). Show the
  reasoning, not just the row.

Do not invent status badges or a cute emoji to look impressive. A tight, honest README beats a
padded one.
```
