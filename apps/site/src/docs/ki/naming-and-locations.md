---
title: Naming, locations and refusals
description: Where ki sits in a working day, how capabilities are named, where it keeps its files, and what its refusals mean.
permalink: /docs/ki/naming-and-locations/
order: 3
sources:
  - repository: knowledgeislands/tools-ki
    path: man/ki.1
    ref: v0.13.0
    governs: 'The declaration form, path resolution, and refusal behaviour described here'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/tools-ki
    path: docs/decisions/ADR-KI-TOOL-KI-002-compatible-harness-registry-and-native-operations.md
    ref: v0.13.0
    governs: 'The native-operation resolution boundary and what the host refuses to execute'
    reviewed: '2026-10-25'
---

# Naming, locations and refusals

You can identify a capability by its bare name, find the machine-local state that supplies it and follow a refusal back to the declaration or managed link that needs attention. These conventions apply across setup, repository maintenance and the work, agent and knowledge commands in `v0.13.0`.

[How the command groups divide](/docs/ki/command-groups/) covers the command surface itself, and [every command there is](/docs/ki/commands/) is the inventory. This page covers the parts that are about living with the tool rather than about its grammar: what a capability is called, where your files end up, and what a refusal means.

## How capabilities are named

A skill is named by its bare name - `ki-work-roadmap`, `ki-authoring`, `ki-repo-mcp`:

```bash
ki skill add ki-recap
ki repo skill add ki-work-roadmap
```

**Harness-qualified keys are invalid.** Writing `knowledgeislands/ki-agentic-harness:ki-work-roadmap` will be rejected, and a declaration in `.ki.toml` written that way is not a valid declaration. The reason is that a repository declares _what governs it_, not _where that came from_: the provider is declared separately, under `[repo]`, and is a property of the installation rather than of the governance.

```toml
[repo]
harnesses = ["knowledgeislands/ki-agentic-harness"]

[skills.ki-work-roadmap]
# this skill's own configuration goes here
```

A provider must appear in that harness list before any of its skills can be added. Each installed harness declares which capability prefixes it owns, through `[skills.ki-repo-harness]` in its own root configuration, so two harnesses cannot both claim to supply the same skill name.

If exactly one installed harness provides the name you ask for, the bare name resolves. If two do, the command stops rather than choosing - which is the same refusal `ki repo upgrade` makes, for the same reason.

## Where `ki` keeps things

Four locations, each resolved from the first non-empty value in its row:

| Contents | Resolution order |
| --- | --- |
| Data - installed harness payloads | `$KI_DATA_HOME`, then `$XDG_DATA_HOME/ki`, then `~/.local/share/ki` |
| Configuration - your user-scope declarations | `$KI_CONFIG_HOME`, then `$XDG_CONFIG_HOME/ki`, then `~/.config/ki` |
| Cache - recoverable working material | `$KI_CACHE_HOME`, then `$XDG_CACHE_HOME/ki`, then `~/.cache/ki` |
| State - the repository registry, among other things | `$KI_STATE_HOME`, then `$XDG_STATE_HOME/ki`, then `~/.local/state/ki` |

`ki diag --full` prints the values actually in force, which is faster than reasoning about the table.

The one file that does not live in any of them is `.ki.toml`, at each KI repository's root. That is deliberate: it travels with the repository, so a colleague who clones it inherits the same governance without configuring anything on their own machine.

## What the host will and will not run

`ki repo audit` and `ki repo conform` do not implement any checks. They resolve the operations a repository's declared skills register, verify them against the installed harness's integrity evidence, and run those.

It will not run anything else. Not a repository-local wrapper script, not a copied rubric runner sitting in the tree, not a package alias, not a checkout that happens to be nearby. If you want a repository to have rules of its own, the supported route is a declared `ki-self` provider - see [operator guides](/docs/ki/operator-guides/) - and it is still resolved rather than discovered.

This is why "the audit passed" is a precise claim: it means the operations registered by the skills this repository declared, from harnesses whose payloads verified, all succeeded. It does not mean the code is good, and it does not mean anything about rules nobody declared.

## When a command refuses

`ki` refuses unknown options, ambiguous capabilities, unsafe paths, and managed state it does not recognise. Each refusal names a recovery route, and following it is meaningfully safer than fixing the symptom by hand.

The reason is that most of what `ki` manages is a _link_ between two records - a declaration and a payload, a registry entry and a checkout. Deleting a file that looks stale usually breaks the other half of a pair, and the tool then cannot tell a deliberate removal from damage. `ki repo repair` and `ki repair` exist to reconcile exactly those projections; `ki doctor` tells you which are broken.

Legacy repository-vendored `.ki/` directories are the case worth stating explicitly. They are migration evidence, not an execution fallback - the host never runs anything from them. Leave unfamiliar legacy state in place until its native replacement is proven, rather than recreating it or removing it piecemeal.

## Getting the exact grammar

```bash
ki --help
ki <command> --help
```

Your installed binary is the authority for your version. [Every `ki` command](/docs/ki/commands/) is the same inventory taken from the manual at the release this site advertises, which is the right reference when you are reading rather than typing.

[Install and get started](/docs/ki/getting-started/) is the end-to-end setup path if you have not run any of this yet.
