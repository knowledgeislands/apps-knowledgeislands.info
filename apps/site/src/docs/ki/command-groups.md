---
title: How the command groups divide
description: What the ki command-line interface is for, how its command groups divide by what they can change, and the three refusals that look like bugs the first time you meet one.
order: 2
permalink: /docs/ki/command-groups/
sources:
  - repository: knowledgeislands/tools-ki
    path: man/ki.1
    ref: v0.10.1
    governs: 'The command groups, their scope boundaries, and the behaviour this page describes'
    reviewed: '2026-10-11'
  - repository: knowledgeislands/tools-ki
    path: docs/decisions/ADR-KI-TOOLS-002-compatible-harness-registry-and-native-operations.md
    ref: v0.4.0
    governs: 'The installs-but-does-not-originate boundary and the native repository operations'
    reviewed: '2026-09-22'
---

# The `ki` command line

`ki` is the one executable in the ecosystem you are expected to install. Everything else — the harness, the skills, the standards — arrives through it or is read by it.

It is deliberately not much of a program. `ki` installs verified harnesses, activates capabilities in an explicit scope, and runs the operations a repository has declared. It originates no capability content and holds no standard of its own: the harness owns what a skill says, the principal knowledge bases own the reasoning, and a repository owns what it has declared. That boundary is why the command surface is mostly verbs about _state_ — install, activate, record, report — rather than verbs about work.

[All {{ cliCommands.counts.commands }} commands are listed on one page](/docs/ki/commands/), taken verbatim from the tool's own manual. This page is for the part an inventory cannot give you: what the groups mean, and which of them you actually need.

## The one command to start with

```bash
ki bootstrap
```

This detects which agent runtimes are present on your machine, installs the canonical harness, and installs the core user skills. It does not activate anything in a repository — that stays a decision you make per repository, and [the repositories guide](/docs/ki-agentic-harness/repositories/) covers it.

After that, three commands cover most days:

| Command | What it does |
| --- | --- |
| `ki manage list` | Shows what is installed: harnesses, their capabilities, your declared user skills, and registered repositories. |
| `ki repo audit --skill <skill>` | Runs the read-only checks a repository's declared governance defines. |
| `ki repo conform --skill <skill>` | Applies the repairs that audit found, where the skill defines a safe repair. |

Everything below is the structure those sit inside.

## How the commands divide

The CLI groups commands by **what they can change**, not by subject matter. The distinction is the whole point of the grammar: you can tell from the group whether a command touches your machine, one repository, or the whole registered estate, before you read what it does.

### Your machine

`ki bootstrap`, `ki manage …`, `ki skill …`, `ki harness …` and `ki dev …` act on the user-managed KI environment — the installation, its configuration, your declared user skills, and the machine-local registry.

`ki manage` is the read-first surface. `search`, `list`, `outdated`, `missing`, `diag` and `doctor` change nothing; they report what is installed, what is stale, and what is configured but broken. [Local utility commands](/docs/ki/local-commands/) covers the ones whose boundaries are easy to misread — in particular `cleanup`, which reports only state KI itself recorded and never guesses from a directory's name.

`ki harness` and `ki skill` are two halves of one lifecycle that the CLI keeps deliberately separate: installing a harness makes capabilities _available_, and activating a skill makes one _apply_. [The capability lifecycle](/docs/ki/capability-lifecycle/) is the page on why, and on what happens when you try to remove a harness something still depends on.

`ki dev` swaps an installed harness for a local checkout and back. It is for working on a harness, not for using one.

### One repository, or many

`ki repo …` acts on repositories. Every command in the group accepts the same selectors — `--repo <path-or-pattern>`, `--territory <handle>`, `--estate` — so the same operation runs against one repository or across the registered estate without a different command.

Within that group the split is again by effect. `audit`, `diag` and `roadmap list` change nothing. `conform` and `repair` apply repairs, and take `--dry-run`. `init`, `skill add` and `skill remove` change what the repository declares.

The important property is that `ki` does not define what an audit checks. A repository declares which skills govern it, and the skill supplies the checks and the repairs; the CLI resolves and runs them. This is why the same two commands cover Markdown style, roadmap frontmatter, and toolchain configuration — and why a clean audit means only that the skills you declared are satisfied.

### The estate

`ki registry …`, `ki territory …` and `ki trade …` are about relationships between repositories: which roots this machine knows about, which territories they belong to, and which typed routes carry work or knowledge between them. They matter once you have more than a handful of repositories and not before.

`ki acquire …` is the intake surface, pulling bounded external material into a package a repository can hold. Each adapter defines its own accepted shape; [the ChatGPT capture format](/docs/ki/chatgpt-local-capture/) documents the one that asks the most of you.

## What the CLI will not do

Three refusals are worth knowing in advance, because each looks like a bug the first time you meet it.

**It will not activate a capability you did not ask for.** `ki bootstrap` installs; it does not decide which repository is governed by what. Activation is always an explicit command in an explicit scope.

**It will not claim freshness it cannot evidence.** `ki manage outdated` reports a harness as outdated only when it can compare against real release evidence. Where it cannot, it says the evidence is unavailable rather than reporting that you are up to date — the two are different facts, and only one of them is safe to act on.

**It will not remove something another declaration depends on.** `ki harness uninstall` and `ki harness reinstall` refuse while a harness supplies an active user skill. Remove the declaration first with `ki skill remove`, then repeat the lifecycle command.

## Keeping an installation current

`ki manage update` refreshes the installation; `ki repo upgrade` refreshes the harness providers one repository's declarations select. Neither activates or deactivates anything. [Update and upgrade](/docs/ki/update-upgrade/) covers which one you want and why a Homebrew or development installation is deliberately excluded from self-update.

## Where the authority is

The installed executable is always the authority on exact grammar for your version. `ki --help` and `ki <command> --help` answer from your binary; this page answers what the commands are _for_, which no help output does.

Start with [install and get started](/docs/ki/getting-started/) if you have run none of this yet. [Every `ki` command](/docs/ki/commands/) is the inventory, vendored from the manual at `v0.4.0`. The rest of `ki`'s guides are listed on [the project's page](/projects/ki/).
