---
title: WHICH-SKILL — the router, so a cold session finds the one standard that governs the task
summary: >
  One table from "what am I about to do" to "which standard to load first", covering every skill the
  estate mounts. It exists so a session does not read four standards looking for the one that fires,
  and so a standard nobody remembers is still reachable by the situation that needs it.
when: >
  Read this BEFORE choosing which standard or skill to load, when a task seems to fit more than one,
  when a session is new to this estate, or when you are about to answer from memory instead of
  opening the standard that owns the rule. It routes only: the standard it names owns the rule, and
  the two together are the point. Don't skip because you already know the obvious one - the failure
  this file prevents is the standard nobody thought to open.
---

# WHICH-SKILL

The standards are mounted as skills, so each one fires on its own description. This file is the
second half: a route from the task in front of you to the one you should read before starting. When
two rows both look right, load the one whose rule you are about to break.

## Before the work

| If you are about to | Load | Because |
|---|---|---|
| Start a session in a repo you have not worked today | [`SESSION-LOOP`](SESSION-LOOP.md) | How to orient cold, and how to end so the next session starts oriented |
| Work across repos, or close a session | [`LOOP`](LOOP.md) | The heartbeat, the gates, the evidence a close owes |
| Take a pasted brief, a handoff, or an ask longer than a screen | [`INTAKE`](INTAKE.md) | Lane, scope cap, hard stops, ask-triggers, finish line |
| Decide whether a question is yours to answer | [`DECISIONS`](DECISIONS.md) | Which surface the question goes on; chat, plan, card or file |
| Write anything the owner reads | [`BRIEF`](BRIEF.md) | Ask first, numbered steps, links that run |
| Meet a word that does not resolve in one read | [`GLOSSARY`](GLOSSARY.md) | The estate's vocabulary, one line each |

## While building

| If you are about to | Load | Because |
|---|---|---|
| Add, move or remove a table, column, policy, screen or data flow | [`DESIGN-STANDARD`](DESIGN-STANDARD.md) | ERD, dictionary, DFD, ADR, traceability |
| Choose between two architectures, or scaffold a new project | [`KICKSTART`](KICKSTART.md) | Interview first, then pick the layers |
| Write or restructure a `CLAUDE.md` | [`CLAUDE-STARTER`](CLAUDE.starter.md) | The template every repo copies |
| Change the machinery that carries knowledge between sessions | [`AI-REPO-STANDARD`](AI-REPO-STANDARD.md) | Sync tables, memory, the hardening ladder |
| Hand a real build task to an AI | [`AI-DEVELOPMENT`](AI-DEVELOPMENT.md) | The bar a change is held to, and the recurring pitfalls |
| Add a file to a repo root or a new top-level directory | [`TREE`](TREE.md) | Where things live, and what earns a root slot |
| Answer "where is X" or "what calls Y" | [`GRAPH`](GRAPH.md) | Query the graph before grepping |
| Touch a hook, or trust that a written rule is enforced | [`HOOKS`](HOOKS.md) | Which event fires, what the limits are, the off switch |
| Pin a model, add an agent, or switch models mid-session | [`MODELS`](MODELS.md) | Which role sits on which tier |
| Claim a harness runs the model policy | [`MODELS-VERIFY`](MODELS-VERIFY.md) | The probes only a running session can show |
| Add a browser-local model or change its prompt | [`LOCAL-AI-STANDARD`](LOCAL-AI-STANDARD.md) | Audit before tuning |
| Build or restyle a dashboard, report or home page | [`DASHBOARD`](DASHBOARD.md) | What goes on the page, in what order |

## While writing

| If you are about to | Load | Because |
|---|---|---|
| Write the first line of prose under his byline | [`VOICE`](VOICE.md) | The writing standard, no off switch |
| Create or finish anything in `content/notes` | [`NOTE-STANDARD`](NOTE-STANDARD.md) | Frontmatter, share block, figure, footer |
| Draw a chart, diagram, flow or timeline | [`FIGURES`](FIGURES.md) | The two scaffolds, the palette, the accessible name |
| Write or restyle a README | [`README-STANDARD`](README-STANDARD.md) | Badges, made-with, footer |
| Write a commit message | [`COMMIT-STANDARD`](COMMIT-STANDARD.md) | Gitmoji, imperative title, bullet body |
| Write a review tour for a rendered change | [`TOUR-STANDARD`](TOUR-STANDARD.md) | Which surfaces become steps, what a verify line says |
| Improve a prompt, or edit an instruction file | [`PROMPT`](PROMPT.md) | The five checks, and the debt rules |

## While closing

| If you are about to | Load | Because |
|---|---|---|
| Run an audit, a health check, a quality sweep | [`AUDIT-STANDARD`](AUDIT-STANDARD.md) | The nine dimensions, severity, fan-out, the report |
| Check whether a repo is still wired into the standards | [`CONFORMANCE`](CONFORMANCE.md) | The pass that asks whether the loop actually runs |
| Create a skill, or measure one | `skill-creator` (harness built-in) | How a skill is shaped, tested and scored |
| Learn a technique by practising it | `doubt-driven-development` (external) | Argue the design before writing it |
| Ship in small vertical slices | `incremental-implementation` (external) | One working seam at a time |

## The two names that collide

`loop` is a harness built-in, so [`LOOP.md`](LOOP.md) mounts as **loop-standard**. `brief`, `models`,
`glossary` and `which-skill` are estate names; if a harness ships one of them later, add a `skill:`
key to the standard rather than renaming the file.

## When nothing here fits

Load [`MAIN-FLOW`](MAIN-FLOW.md) for the spine of a whole piece of work, then come back. If the task
is genuinely new to the estate, say so in one line in the plan and write the missing standard with
the work, rather than inventing a rule in chat.
