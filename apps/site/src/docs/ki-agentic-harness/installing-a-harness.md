---
title: Installing a harness
description: Install verified harness capabilities, inspect what is available and keep installation separate from activation.
order: 2
permalink: /docs/ki-agentic-harness/installing-a-harness/
sources:
  - repository: knowledgeislands/tools-ki
    path: man/ki.1
    ref: v0.13.0
    governs: 'The commands and scope boundaries at the reviewed CLI release'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/tools-ki
    path: docs/decisions/ADR-KI-TOOL-KI-002-compatible-harness-registry-and-native-operations.md
    ref: v0.13.0
    governs: 'Verified installation and native capability resolution'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: docs/decisions/ADR-KI-HARNESS-012-compatible-harness-publication-and-governed-rubric-boundary.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The compatible harness payload and host boundary'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/keystone/ki-bootstrap/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Bootstrap and explicit development-source selection'
    reviewed: '2026-10-25'
---

# Installing a harness

Installing a harness puts a verified collection of capabilities on your machine. You can inspect what it contains, activate only what you need and distinguish an installation problem from a skill that has not been enabled in the right scope.

## What it is

A compatible harness is a named package of skills and supporting material. Its identifier has the form `owner/name`. The canonical harness is `knowledgeislands/ki-agentic-harness`; it supplies the core skills used to set up and operate the KI environment.

Installation and activation are separate. An installed capability is available for selection. A user or repository declaration selects it for that scope.

## How it works

`ki bootstrap` detects supported runtimes, creates or reconciles the user environment, installs the canonical harness and links the core user skills into the configured runtimes. Existing agent configuration is reused.

```bash
ki bootstrap
ki harness list
ki harness info knowledgeislands/ki-agentic-harness
```

The CLI verifies installed payloads and capability inventories. A repository declaration can then resolve a capability from its permitted providers. An unfamiliar directory or copied checker is not an alternative operation source.

## How you use it

For an additional configured harness, run `ki harness install <harness-id>`. Inspect it before activating its capabilities. [Using skills](/docs/ki-agentic-harness/using-skills/) covers selection during a session; [onboarding](/docs/ki-agentic-harness/onboarding/) covers repository activation.

Use the current command names when checking the machine:

```bash
ki harness search authoring
ki harness missing
ki harness outdated
ki doctor
ki diag
```

`ki update` refreshes configured installed harnesses. The CLI executable is updated only when installation evidence establishes that the updater owns it; `--cli` requires that executable target. `ki bootstrap --refresh` redetects runtimes and reconciles the managed inventory.

## What it provides

The installed inventory tells you which capabilities this machine can supply. Managed links let supported runtimes discover the skills selected for them. A fresh session after activation lets the runtime rescan those links.

A harness contributor can explicitly select a local checkout with `ki dev local set` and `ki dev local on`. That is a live development source: uncommitted edits can change the governance other sessions resolve. `ki dev local off` restores the verified archive.

## Boundaries

Installing an additional harness does not activate its skills in every repository. `ki harness reinstall` refuses a harness that supplies active user skills, and a development-linked harness must first be restored to archive mode. `ki harness uninstall` also refuses active user providers, and cannot remove the canonical harness.

A successful installation proves the payload was accepted. It does not prove an already-running agent has loaded the new skills or that an MCP connection works.
