---
title: COMMIT-STANDARD.md — the commit message standard
summary: How a commit message is built in every repo - a gitmoji, a one-line title, then bullets saying what the commit did.
when: >
  Read this BEFORE writing a commit message, a squash message or a merge title in any repo. It owns
  the shape (the gitmoji, the title line, the bullet body); VOICE owns how the words read. Don't skip
  because the change is small - a one-line fix still gets its emoji and at least one bullet, and the
  log is only scannable if every entry follows the same shape.
---

# Commit standard

Every commit message in my repos has the same three parts: a gitmoji, a title line, and a body of
bullets. The log then reads as a list of headlines, and GitHub folds the bullets away until someone
asks for them. VOICE still governs every word, so this file covers the shape alone.

## The shape

```
✨ Add a bionic reading toggle to notes

- Add a Bionic tab to the note's Rendered and Source row that bolds the first part of each word.
- Leave headings, code, figures and the contents block untouched.
- Remember the choice across notes, and restore the original text when it is switched off.
- Disable the toggle once the Nest colony opens, since the colony reads the same text nodes.
```

1. **The gitmoji comes first**, followed by one space. Use the emoji character itself, not the
   colon shortcode, so it renders in every tool that shows the log.
2. **The title is one line in the imperative**: "Add", "Fix", "Remove", never "Added" or "Adds".
   It starts with a capital, ends without a full stop, and stays under 72 characters including the
   emoji. It says what the commit does, not which files it touched.
3. **A blank line follows the title.** Git and GitHub split the title from the body on it.
4. **The body is a list of bullets**, one per thing the commit did. Each bullet starts with a
   hyphen and a space and is a whole sentence in the imperative, ending with a full stop. A bullet
   that needs a reason carries it in the same sentence. Wrap long bullets at about 100 characters
   and indent the continuation by two spaces.

A one-line change still gets one bullet. If the bullets do not fit on a screen, the commit is doing
more than one thing and should be split.

## Which gitmoji

Pick the emoji for the main intent of the commit. When two apply, the one that matters to a reader
of the log wins. This is the working set; the full list lives at <https://gitmoji.dev>.

| Emoji | Use it for |
| --- | --- |
| ✨ | A new feature or a new page. |
| 🐛 | A bug fix. |
| 🚑️ | An urgent fix to something live. |
| ♻️ | A refactor that changes no behaviour. |
| 💄 | Styling and visual changes. |
| 📝 | Documentation, notes, plans and standards. |
| ✏️ | A typo or a small wording fix. |
| ✅ | Adding or updating tests. |
| 🔧 | Configuration files and tooling settings. |
| 🔨 | Development scripts. |
| 👷 | CI and build pipelines. |
| ⬆️ | Upgrading a dependency. |
| ➕ | Adding a dependency. |
| ➖ | Removing a dependency. |
| 🔥 | Removing code or files. |
| 🚚 | Moving or renaming files. |
| 🍱 | Adding or updating assets such as images and fonts. |
| ♿️ | Accessibility. |
| ⚡️ | Performance. |
| 🔒️ | Security or privacy. |
| 🔖 | A release or version tag. |
| 🚧 | Work in progress, on a branch only. |
| 🔀 | Merging branches. |
| ⏪️ | Reverting a change. |

## What stays out

- **No AI trailers.** No Co-Authored-By line for any model and no "Generated with" footer. AI use
  is disclosed through the README badge and footer, as README-STANDARD says.
- **No file lists.** The diff already says which files changed; the bullets say what changed and
  why.
- **No scope prefixes** such as "notes:" or "fix(ui):". The gitmoji carries the kind of change,
  and the title carries the area in plain words.

## Merges and squashes

A squash merge takes the same shape: the pull request title becomes the gitmoji and title line,
and the bullets summarise the whole branch. A pull request title follows the title rule too, so
the squash needs no editing. A plain merge commit keeps the 🔀 emoji and the title git writes.

## The prompt

> Write the commit message for the staged change under COMMIT-STANDARD. Start with the one gitmoji
> that fits the main intent, then a title in the imperative under 72 characters, a blank line, and
> one bullet per thing the commit did, each a whole sentence that follows VOICE. Add no trailers.
