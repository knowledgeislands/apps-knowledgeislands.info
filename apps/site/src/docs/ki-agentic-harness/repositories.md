---
title: Govern a repository
description: Declare repository coverage in .ki.toml and use educate, audit and conform to inspect and maintain it.
order: 3
permalink: /docs/ki-agentic-harness/repositories/
sources:
  - repository: knowledgeislands/tools-ki
    path: man/ki.1
    ref: v0.13.0
    governs: 'The commands and scope boundaries at the reviewed CLI release'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: docs/decisions/ADR-KI-HARNESS-012-compatible-harness-publication-and-governed-rubric-boundary.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The declarations and verified native-operation boundary'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/repo-structure/ki-repo-harness/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Harness publication and declared dependency resolution'
    reviewed: '2026-10-25'
---

# Govern a repository

A repository's declarations make its standards visible and repeatable. You can see what governs it, explain the rules, check the evidence and preview safe repairs without relying on whichever guidance an agent happens to remember.

## What it is

A KI repository has a `.ki.toml` declaration at its Git worktree root. Its `[repo]` table permits harness providers; each `[skills.<name>]` table declares one governance capability by its bare skill name.

```toml
[repo]
harnesses = ["knowledgeislands/ki-agentic-harness"]

[skills.ki-authoring]

[skills.ki-work-roadmap]
```

This excerpt shows coverage, not a complete identity declaration. `ki repo init` writes the initial declaration for an existing worktree using the identity values you supply.

## How it works

The host resolves a declared capability from permitted installed harnesses, validates its dependencies and loads its registered operations. The skill owns its rules and safe repairs; the CLI owns execution and reporting.

Repository scope describes this repository's work. User scope describes the capabilities you use across repositories. `ki repo skill add` and `ki repo skill remove` manage the former; `ki skill add` and `ki skill remove` manage the latter.

## How you use it

[Choose a skill by outcome](/docs/skills/by-outcome/), then declare the coverage the repository needs. Add a skill with `ki repo skill add <skill>`; use `--repo <path>` when selecting another repository. Start a fresh agent session after its discovery links change.

Run the three operations in this order when first inspecting a repository:

```bash
ki repo educate
ki repo audit
ki repo conform --dry-run
```

Use `ki repo conform` to apply the registered safe repairs when appropriate. The host validates the proposed write set and requires the selected initial audits to pass before publication. A dry run reports proposed changes without publishing them. Review the resulting evidence and any judgement criteria the mechanical pass leaves unassessed.

Add `--skill <skill>` to narrow an operation to one declared capability. This does not change the repository's coverage.

## What it provides

A shared declaration lets contributors and CI resolve the same intended standards. `ki repo diag` reports declaration and projection health. `ki repo repair --dry-run` previews reconciliation of recognised managed links. `ki repo upgrade` refreshes the harnesses selected by the repository's declarations.

The machine-local registry connects a repository's identity to this physical checkout. It helps commands find the work but does not replace the tracked declaration. [Onboarding](/docs/ki-agentic-harness/onboarding/) connects those two layers.

## Boundaries

Unknown files and unfamiliar links are preserved. The host does not substitute a copied checker, a repository wrapper or an unselected checkout when a declared operation cannot resolve.

An audit reports the checks it assessed. A missing declaration means missing coverage, and judgement-only criteria need review. Keep publication and other consequential actions within their separate task authority.
