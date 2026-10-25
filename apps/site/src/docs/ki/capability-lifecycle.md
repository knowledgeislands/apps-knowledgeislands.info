---
title: Capability lifecycle
description: Why installing a harness and activating a skill are separate steps, the commands for each, and the refusals that protect the boundary between them.
permalink: /docs/ki/capability-lifecycle/
order: 5
sources:
  - repository: knowledgeislands/tools-ki
    path: man/ki.1
    ref: v0.13.0
    governs: 'The harness, skill and repository skill commands, and the refusals described here'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/tools-ki
    path: docs/decisions/ADR-KI-TOOL-KI-002-compatible-harness-registry-and-native-operations.md
    ref: v0.13.0
    governs: 'The compatible-harness registry and the installs-but-does-not-activate boundary'
    reviewed: '2026-10-25'
---

# Capability lifecycle

Two things happen when a capability starts working for you, and `ki` keeps them apart on purpose.

**Installing a harness** puts a set of capabilities on your machine, verified and inventoried. Nothing about your repositories changes; nothing starts applying.

**Activating a skill** declares that one of those capabilities applies - either to you, in every repository you work in, or to one repository, for everyone who works in it.

A capability that is installed but not activated is available and inert. That is the normal, intended resting state for most of what a harness ships.

## Why the split exists

The alternative - install implies activate - fails in both directions.

It over-applies: a harness ships dozens of skills, and installing it to get one would silently subject every repository on the machine to the rest. Governance you did not choose is governance you cannot reason about, and an audit that fails on rules you never adopted teaches you to ignore audits.

And it under-records: if installation were the declaration, a repository could not state what governs it. It states that in its own `.ki.toml`, which travels with the repository, so a colleague cloning it gets the same governance without having made any choices on their machine.

So the harness is a _supply_ of capability and the declaration is the _decision_. The commands below are two vocabularies over that one distinction.

## Installing and inspecting harnesses

Harnesses are addressed by identifier in `owner/name` form - `knowledgeislands/ki-agentic-harness`, for instance. These commands never accept a bare skill name or a capability-qualified target; a lifecycle operation acts on a whole payload.

| Command | Effect |
| --- | --- |
| `ki harness list` | Lists the compatible harnesses already installed. Changes nothing. |
| `ki harness info <harness-id>` | Shows one installed harness's capability inventory. Changes nothing. |
| `ki harness install <harness-id>` | Installs a configured harness, making its skills and subagents available to add. |
| `ki harness reinstall <harness-id>` | Replaces one inactive installed harness from its verified archive. |
| `ki harness uninstall <harness-id>` | Removes one non-canonical harness whose payload directories `ki` recognises. |

`reinstall` replaces a harness only after the replacement archive passes integrity and capability inspection, so a corrupted or capability-losing archive cannot take the place of a working one.

Lifecycle commands apply once validation passes and have no `--dry-run`. Commands that offer previews include `ki repair`, `ki repo conform`, acquisition imports and repository store operations; check the selected command's help before expecting a preview.

## Activating skills

Activation has two scopes, and the command names say which.

```bash
ki skill add <skill>            # user scope: applies wherever you work
ki skill remove <skill>

ki repo skill add <skill>       # repository scope: applies to this repository
ki repo skill remove <skill>
```

User-scope skills are the ones that are about _you_ - how you plan, how you recap, how you want an agent to behave. They link into your configured agents' skill spaces, and `ki bootstrap` establishes the core set for you.

Repository-scope skills are the ones that are about _this codebase_ - its Markdown style, its toolchain, its roadmap discipline. They are recorded in the repository's `.ki.toml` and are what `ki repo audit` and `ki repo conform` resolve against. `add` in either scope takes `--replace` for an existing managed activation; removal has no replacement flag.

The two scopes are managed independently. Removing a user skill does not touch any repository declaration, and removing a repository declaration does not affect your user scope.

## The refusals

Three refusals enforce the boundary. Each looks like an obstruction the first time and is the mechanism working.

**A harness that supplies an active user skill cannot be reinstalled or uninstalled.** The declaration would be left pointing at nothing. Remove it first with `ki skill remove`, then repeat the lifecycle command. Repository declarations are managed separately, through `ki repo skill remove`.

**The canonical harness cannot be uninstalled.** `knowledgeislands/ki-agentic-harness` is what `ki bootstrap` installs and what the core user skills come from; removing it would leave an installation that cannot describe itself.

**A development-linked harness must be restored before it is reinstalled.** If `ki dev local on` has replaced a harness's root with a local checkout, run `ki dev local off` to reinstate the verified archive first. Otherwise the reinstall would be operating on a working tree rather than on a payload with integrity evidence.

## A worked sequence

Adding a capability from a harness you do not yet have:

```bash
ki harness install example/harness     # make its capabilities available
ki harness info example/harness        # see what it actually ships
ki repo skill add example-skill        # declare that it governs this repository
ki repo audit --skill example-skill    # run its checks, read-only
ki repo conform --skill example-skill  # apply the repairs it defines
```

And withdrawing it again, in the order the refusals require:

```bash
ki repo skill remove example-skill
ki skill remove example-skill          # if it was also in user scope
ki harness uninstall example/harness
```

`ki repo diag` is worth knowing for the state in between: it reports a repository's declared skills and the health of its runtime projections without changing anything, which is usually what you want when a declaration and an installation have drifted apart.

## Related

[Update and upgrade](/docs/ki/update-upgrade/) covers refreshing an installation without changing any of these declarations. [Every `ki` command](/docs/ki/commands/) has the full inventory, including the options each command accepts. [Skills and journeys](/docs/skills/what-a-skill-is/) explains what a skill actually contains, which is the other half of deciding whether to activate one.

Use `ki harness --help` and `ki skill --help` for the exact grammar your installed version supports.
