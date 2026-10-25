---
title: Onboard a repository
description: Connect an existing repository to declared KI governance and verify the runtime links and checks.
order: 5
permalink: /docs/ki-agentic-harness/onboarding/
sources:
  - repository: knowledgeislands/tools-ki
    path: man/ki.1
    ref: v0.13.0
    governs: 'The commands and scope boundaries at the reviewed CLI release'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: docs/decisions/ADR-KI-HARNESS-012-compatible-harness-publication-and-governed-rubric-boundary.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Trusted operations and the separation of user and repository state'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/keystone/ki-bootstrap/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The setup sequence and managed-state recovery'
    reviewed: '2026-10-25'
---

# Onboard a repository

Onboarding connects an existing repository to the standards it actually needs. You establish the machine environment, record the repository's identity and coverage, then check both the managed skill links and the declared governance before relying on them.

## What it is

A governed repository carries a regular `.ki.toml` at its physical Git worktree root. It records identity, permitted harnesses and the skills that govern the repository. Those declarations travel with the work; the local registry records where this checkout lives on this machine.

## How it works

There are two scopes. User setup supplies verified installed harnesses and user-level skills. Repository setup records the skills and managed discovery links for one repository. Neither scope silently activates everything in the other.

`ki-bootstrap` explains the sequence. `ki-repo` owns the judgement about repository coverage. The native host resolves declared dependencies and refuses unavailable, incompatible, ambiguous or untrusted capabilities before running their operations.

## How you use it

1. Run `ki bootstrap` to establish the user environment, then `ki doctor` to inspect its health.
2. Initialise the existing Git worktree with `ki repo init`. Supply its repository and Capital URLs, title, description, stable repository code, supported runtimes and visibility. The command records identity and registers the physical root; it does not create a Git repository or activate skills.
3. Choose the applicable capabilities and add each with `ki repo skill add <skill>`. This writes its declaration and managed runtime links.
4. Start a new agent session after changing those links, then inspect the repository and its checks.

```bash
ki repo diag
ki repo educate
ki repo audit
ki repo conform --dry-run
```

`educate` explains the declared expectations. `audit` checks without repairing. The conform preview validates the proposed safe mechanical repairs before you decide to apply them. Review judgement criteria alongside the machine results.

For Harbour Atlas, the fictional island, this could mean activating writing and knowledge-base governance, then reviewing whether the existing material fits both. The declaration follows what the island contains and how it works.

## What it provides

Onboarding gives a repository explicit coverage, discoverable skills and a repeatable way to inspect conformance. In CI, establish a compatible CLI and verified harness inventory, run `ki repo audit --repo .`, then run the repository's tests.

When a link is missing or stale, `ki repo repair --dry-run` previews reconciliation of recognised managed projections. `ki diag --full` identifies whether operations resolve from an archive or an explicitly selected development checkout.

## Boundaries

Initialisation is not conformance, and conformance is not human acceptance. Installing the harness alone does not declare repository coverage.

Repository-local executors and copied skill files are not trusted operation sources. Preserve unfamiliar or altered state and diagnose its ownership rather than deleting it to make setup pass. Managed recovery refuses unsafe state instead of guessing.
