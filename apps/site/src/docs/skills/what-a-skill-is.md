---
title: What a skill is
description: What a Knowledge Islands skill is, the two kinds, the modes governance skills share, which skills apply to a repository, where a skill lives and how Claude Code and Codex load it.
permalink: /docs/skills/what-a-skill-is/
order: 1
sources:
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/keystone/ki-skills/references/standards-knowledge-islands.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The two kinds, the universal modes and HELP, applicability, dependency composition and runtime restriction'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/keystone/ki-skills/references/standards-agent-skills.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The Agent Skills shape of SKILL.md: frontmatter, body, references, scripts and assets'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/repo-structure/ki-repo-harness/references/standards-compatible-harness.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The source shelves, source concerns and installed payload a skill lives in'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/keystone/ki-bootstrap/references/standards-bootstrap.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'How bootstrap installs the harness and activates skills in Claude Code and Codex'
    reviewed: '2026-10-25'
---

# What a skill is

After this page you can tell a governance skill from a process skill, say which skills a repository gets without asking, run a skill's Educate, Audit and Conform modes from the command line, and find where a skill lives on disk so that Claude Code or Codex loads it in the next session.

## What it is

A skill is a folder named for the skill, holding one `SKILL.md` and whatever that file needs beside it. The file follows the open Agent Skills standard: a short frontmatter block with the skill's name and a description, then a body of instructions the agent follows once it has decided the skill applies. Longer material sits in `references/`, executable helpers in `scripts/`, and templates in `assets/`. The description is what the runtime reads when deciding whether to load the skill at all, so it says when to reach for the skill and names the neighbouring skill that owns the adjacent concern. Every skill in this collection carries the `ki-` prefix, and its directory name is its name.

The collection has two kinds of skill, and each declares its kind in its frontmatter rather than leaving it to be guessed from a folder or a paragraph.

- **A governance skill holds a standard.** It says what a good repository, document, commit or configuration looks like, and it ships a machine-readable rubric so that the standard can be checked and, where safe, applied. Of the sixty-four skills in the [catalogue](/docs/skills/catalogue/), fifty-three are governance skills: `ki-authoring` for Markdown and TOML, `ki-git` for commits, `ki-repo-kb` for a knowledge base, and so on.
- **A process skill drives a procedure.** It carries no standard of its own and moves one piece of work from one state to the next, then stops. The eleven process skills include the delivery cycle `ki-next`, `ki-plan`, `ki-implement` and `ki-accept`, and the coordinating skills `ki-coordination` and `ki-delegation`.

Take Mara, who keeps the knowledge base for a fictional island, Tern Holm. When she asks her agent to tidy a note, `ki-repo-kb` loads because the request matches its description, and it governs the result. When she asks what to work on next, `ki-next` loads instead, and it selects a record and stops, leaving the planning to `ki-plan`. The two skills differ in kind, not in how she reached them.

## How it works

Every governance skill exposes the same four acting modes, so a reader who knows one knows the shape of all fifty-three.

| Mode | What it does |
| --- | --- |
| Educate | Renders the standard's guidance for the repository in front of it |
| Audit | Checks an artefact against the standard and reports findings without changing anything |
| Conform | Applies the safe changes the standard defines, then audits again |
| Refresh | Re-anchors the standard to the sources it restates; this mode runs only inside the harness repository |

Beside those four, every governance skill answers Help: a non-acting entry point that explains the skill and its modes, then stops. A few skills carry extra modes fixed in meaning wherever they appear, such as New, which authors one instance into a collection the skill governs. The rubric behind Audit and Conform lives in the skill's own `scripts/rubric/` directory and is executed by the `ki` command, which first verifies the installed harness it came from. A skill never ships its own runner.

Which skills a repository is held to is a separate question from which skills are installed, and the standard answers it with one declaration per skill, called applicability. Four values exist.

- **Baseline** skills hold every repository. Exactly two are baseline: `ki-repo` and `ki-authoring`.
- **Detected** skills apply when `ki-repo` finds repository evidence for them, such as a `package.json` bringing `ki-engineering` into scope.
- **Declaration-only** skills apply only when the repository names them in its `.ki.toml`, because nothing in its shape could infer them.
- **Invocation-only** skills apply when someone invokes them. Every process skill is invocation-only, and no governance skill is.

Skills also declare how they rely on one another. A formal dependency means that selecting one skill necessarily runs another first: `ki-repo-kb-principal` runs `ki-repo-kb` before adding its own overlay, so a repository declaring the first declares the second too. An optional dependency is used only when the named skill is active in the same scope and never makes it mandatory. The declared edges form a directed acyclic graph, and the harness draws its skill diagrams from them rather than by hand. A skill useful from one runtime only, such as `ki-subagents-claude` or `ki-binding-chatgpt`, declares the runtimes that support it, and activation links it into those runtimes alone.

## How you use it

Skills live in the harness repository under its `skills/` shelf, one of the four source shelves alongside `subagents/`, `evals/` and `hooks/`. Within the shelf they sit in eight source concerns, folders such as `keystone/`, `governance/` and `repo-structure/`, which say where a skill is kept rather than what it is for. The harness publishes a verified archive of that tree, and the `ki` command installs it as the canonical harness.

Installing is a three-step movement from machine to repository.

1. `ki bootstrap` creates the user configuration from the agent runtimes it detects, installs the verified canonical harness, and links the core user skills, among them `ki-bootstrap`, `ki-next`, `ki-plan` and `ki-recap`, into each runtime's user skill directory. `ki skill add` and `ki skill remove` adjust that user-scope set.
2. `ki repo skill add` declares a skill in a repository's `.ki.toml` and projects a link into the repository for each compatible runtime. Claude Code discovers skills under `.claude/skills/`; Codex discovers them under `.agents/skills/` and reads the repository's `AGENTS.md` for its instructions.
3. A new session picks the change up. A session invokes only the user-scope skills and the skills projected into the repository it started in, so a link added mid-session takes effect at the next start.

Once loaded, a skill fires in two ways: the runtime matches a request against the description, or the user names it with a slash and its name, as in `/ki-recap`. The [using skills](/docs/ki-agentic-harness/using-skills/) page walks through a first invocation. Outside a session, `ki repo audit --skill <name> --repo .` runs one declared governance skill's Audit mode, `ki repo conform --skill <name>` its Conform mode, and `ki repo educate --skill <name>` its Educate mode; with no `--skill`, each runs every skill the repository declares. `ki manage search` lists what the installed harness provides.

When Mara's colleague Tomas joins the Tern Holm repository, he runs `ki bootstrap` once on his machine and opens the repository. The skills the repository declares are already projected, so his first Claude Code session has them without any further step.

## What it provides

A skill, loaded, behaves predictably in the ways a reader can rely on.

- **Help explains and stops.** Asking a governance skill what it does changes nothing.
- **Audit reports and stops.** Findings name the artefact and the rubric item, and the repository is unchanged.
- **Conform changes only what the rubric marks safe.** Every selected audit must pass before the staged writes are published, and the result is audited again.
- **A process skill stops at its boundary.** `ki-plan` stops when a record is ready, `ki-implement` stops when its change awaits review, and `ki-accept` closes a record only with human approval.
- **A standard hard-codes no single repository.** What a repository needs differently is declared in its own `.ki.toml` and instructions, so the same skill serves Tern Holm and every other island.

## Boundaries

A skill does not run a sibling's standard unless it declares the dependency; a sentence that merely points the reader to another skill declares nothing. Installing a skill at user scope does not put it in a repository's audit scope, which the repository's `.ki.toml` alone decides. A clean source file is not proof that a runtime loaded or executed it; runtime state is checked separately. A repository may carry a local `ki-self` skill for concerns real in that repository alone; it is committed with the repository, never installed user-wide, and absent from the shared catalogue.
