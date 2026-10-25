---
title: How command groups divide
description: The eighteen command groups in ki v0.13.0, what each operates on and when to use it.
order: 2
permalink: /docs/ki/command-groups/
sources:
  - repository: knowledgeislands/tools-ki
    path: man/ki.1
    ref: v0.13.0
    governs: 'The eighteen groups and their command scopes'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/governance/ki-trades/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The current hold on new trade submissions'
    reviewed: '2026-10-25'
---

# How command groups divide

You can choose a command by the thing you want to inspect or change: your installation, a repository, a territory, a work package or a source of knowledge. The eighteen groups below follow the manual shipped with `ki` at `v0.13.0`.

{% figure "command-groups", "The eighteen command groups in tools-ki v0.13.0, labelled by what each operates on." %}

## General

The root invocation and `ki help` operate on the command tree. Use them to discover a command path or ask for help with a nested action before supplying its arguments.

## Global options

`--help` and `--version` inspect the selected command or the installed executable. Reach for them when checking grammar or confirming which release you are actually running.

## Installation

`ki bootstrap` establishes your user environment: detected agents, the canonical harness and core user skills. Use it on a new machine, or add `--refresh` after changing the agent runtimes you use; [getting started](/docs/ki/getting-started/) carries the first-run sequence.

## Local management

These commands inspect or maintain machine-local KI state: `ki inventory`, `ki diag`, `ki doctor`, `ki repair` and `ki update`, alongside completion, documentation locations, Markdown conversion, MCP source installations and editor projections. Use [local utility commands](/docs/ki/local-commands/) to distinguish inspection from a deliberate write.

## User management

`ki skill add` and `ki skill remove` change which skills are active for you across repositories. Use them when a way of working should follow your agent rather than govern one particular island; [capability lifecycle](/docs/ki/capability-lifecycle/) explains the two activation scopes.

## Repository options

Repository selectors choose the physical checkouts a `ki repo` action will operate on. Use `--repo`, `--territory`, `--estate` or `--principals`, with optional filters, when the current repository is too narrow or an explicit selection is clearer.

## Repository management

`ki repo` declares, opens, audits, conforms, diagnoses and repairs repositories, manages their skill declarations and source stores, and reads or maintains roadmap records. Reach for it when an island's declared governance or local projections need attention; [repositories and territory](/docs/ki/repositories-and-territory/) explains selection and repair.

## Batch records

`ki repo batch` records an already-approved, exact set of Ready work items in one repository. Use it for a bounded delivery window that needs a protected authority envelope and an evidence ledger, as described in [work and agents](/docs/ki/work-and-agents/).

## Knowledge Base search

`ki kb index`, `search` and `status` operate on a derived search index for one explicitly registered Knowledge Base. Use them to retrieve current local notes with scoped citations; the notes remain authoritative and search needs explicit provisioning.

## Registry management

`ki registry` records and lists canonical repository identities and their local checkout roots. Use it when a checkout must become visible to territory selection, trades or KB search, remembering that registration records presence rather than conformance.

## Harness management

`ki harness` installs, inspects, reinstalls or removes compatible capability payloads. Use it when a skill's provider is missing or needs inspection; installing its payload and activating its skills remain separate decisions.

## Trades

`ki repo trade` inspects routes and operates each repository's local side of an exchange. New submissions are currently on hold under the pinned harness; use the supported receipt and observation commands for existing records, with [trades and acquisition](/docs/ki/trades-and-acquisition/) explaining the boundary.

## Territory management

`ki territory` resolves a Capital's declared membership and can show, audit, open or inspect the selected local roots. Use it when you need an overview or editor view of several islands without changing what each island authorises.

## Acquisition

`ki acquire` lists enabled adapters and imports supplied source material into the selected receiver. Use ChatGPT's local-capture adapter or Granola's configured connection when preserving evidence; confirmed source marking is a separate operation from import.

## Background agents

`ki agent` prepares prompts, launches detached workers, queues dependent runs and reports their progress and results. Use it to delegate a bounded task while keeping its authority, status and report visible; [work and agents](/docs/ki/work-and-agents/) gives the operating sequence.

## Work model

`ki work status` reads work packages and groups them by who holds them and whether they are moving, stuck, blocked or on hold. Use it to find what needs attention without changing any work state.

## Estate convergence

`ki estate converge` previews how local checkouts differ from a tracked target manifest, and can deliberately apply or roll back recorded moves and repairs. Use it for a planned estate rearrangement, or its separate `--hooks` pass for supported hook bindings.

## Development

`ki dev` switches installed harnesses between verified archives and remembered local development checkouts, and checks or regenerates skill surfaces. Use it while maintaining a harness; ordinary users normally stay on the verified installation.

[Every ki command](/docs/ki/commands/) publishes all {{ cliCommands.counts.commands }} entries from the release manual, including arguments and options. Your installed executable's `--help` remains the authority for the version on your machine.
