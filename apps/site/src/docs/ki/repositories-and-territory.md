---
title: Repositories and territory
description: Register and select islands, apply their declared governance, manage harnesses and preview estate changes with ki v0.13.0.
permalink: /docs/ki/repositories-and-territory/
order: 11
sources:
  - repository: knowledgeislands/tools-ki
    path: man/ki.1
    ref: v0.13.0
    governs: 'Registry, repository, selector, harness, territory and estate command groups'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/tools-ki
    path: docs/guides/user/repository-operations.md
    ref: v0.13.0
    governs: 'Selection, audit, conform, repair, upgrade and source stores'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/tools-ki
    path: docs/guides/user/territory-selection.md
    ref: v0.13.0
    governs: 'Capital membership, filters, condition reporting and local editor views'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/keystone/ki-repo/references/standards-repository.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Repository identity, explicit governance and repository write boundaries'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/keystone/ki-bootstrap/references/standards-bootstrap.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Harness installation, explicit activation and managed-state recovery'
    reviewed: '2026-10-25'
---

# Repositories and territory

You can register an island once, select the checkouts you intend to maintain, and run the governance each declares. Territory commands make that selection visible across a Capital's membership, while estate convergence previews deliberate changes to the local layout.

## What it is

A repository's `.ki.toml` declares its identity, Capital, kind, shape and governing skills. The machine-local registry connects that canonical identity to a physical checkout. A territory's Capital declares its members; the registry tells this machine where to find them.

Harnesses supply the skills those declarations select. `ki-repo` governs the repository contract and `ki-bootstrap` explains installation and activation. Registration, skill activation and a successful audit establish different facts: location, applicable governance and the result of the checks actually run.

[Repository standards](/docs/standards/repository-standards/) explains the shapes, universal contract and review loop behind these commands.

## How it works

Repository options resolve a complete target selection before an action starts. `--repo <path-or-pattern>` names explicit roots; `--territory <handle>` selects a Capital's members; `--estate` selects registered repositories; `--principals` selects registered territory Capitals. These primary scopes are mutually exclusive. Repeated `--filter <prefix>` arguments narrow directory basenames with literal, case-sensitive OR matching.

With no explicit selector, a direct-current-directory mGit workspace can supply its members; otherwise ordinary repository discovery applies. Invalid or empty selections fail visibly. Territory membership must be registered before filtering, though an unavailable registered root excluded by a filter need not block the remaining selection.

An audit reads the declared, resolved skills. Conform collects proposed repairs and completes the selected repository's initial checks before publishing eligible changes, then re-audits them. Across several repositories, earlier successful mutations remain applied if a later target fails; read each result.

## How you use it

For the fictional Lantern island, begin by checking and recording its declared checkout:

```bash
ki registry --repo /absolute/path/to/lantern add --dry-run
ki registry --repo /absolute/path/to/lantern add
ki registry list
ki repo --repo /absolute/path/to/lantern diag
```

A root without `.ki.toml` first needs `ki repo init` with its explicit identity, Capital and other required metadata; [getting started](/docs/ki/getting-started/) gives that sequence. Registry removal takes one exact key or stored path and supports `--dry-run`; it removes the registration rather than the checkout.

Inspect the territory selection before widening maintenance:

```bash
ki territory list
ki territory show --territory lantern --verbose
ki territory audit --territory lantern
ki repo --territory lantern audit
```

Use the actual handle listed by your machine. `show` combines declared maturity with the latest whole-repository audit health recorded locally. Unknown health remains unknown, and an audit narrowed by skill or paths does not replace that whole-repository reading. `ki territory open` opens the selection in a supported editor; `inspect` compares local editor projections. `roots --null` supplies a complete NUL-delimited root list for other tools, which must check success before acting on it.

In one repository, learn the rules and preview their repairs:

```bash
ki repo educate
ki repo audit
ki repo conform --dry-run
```

Apply conform only after reviewing the proposed changes. `ki repo repair --dry-run` previews reconciliation of managed projections; `ki repo upgrade` refreshes uniquely resolved providers. `ki repo roadmap list`, `summary` and `stats` inspect forward work, while lifecycle mutations retain their own approval rules. `ki repo store` lists or manages declared external source-store bindings and host availability; creating a store and binding an existing one are explicit operations.

Inspect missing capability providers with `ki harness list` and `info`; install a configured provider with `install`. Activation still uses `ki skill add` or `ki repo skill add`, as [capability lifecycle](/docs/ki/capability-lifecycle/) explains. Reinstallation refuses active user-skill providers, and the canonical harness cannot be uninstalled.

For an approved estate rearrangement, run `ki estate converge <manifest>` to preview the target layout. `--apply` performs the validated moves and records a log; `--clone` separately permits missing checkouts to be cloned. `--rollback <log>` previews reversal and refuses recorded state that has since changed. The separate `--hooks` pass reconciles supported hook bindings.

## What it provides

The registry gives local resolution a stable inventory. Repository operations turn declarations into inspectable checks and bounded repairs. Territory commands let you see and open the same selected islands together, and convergence records the local changes needed to match an explicit estate manifest.

## Boundaries

Selecting a territory grants no new write authority, and registration proves no conformance. Repair reconciles managed links without inventing declarations. Harness installation supplies capabilities without activating every skill.

Source stores are opt-in and remain separate from repository content; an unavailable store is reported with its recovery route. Convergence never deletes repositories and previews by default. Its rollback is guarded by recorded state, so it cannot promise to undo later independent changes. [Every ki command](/docs/ki/commands/) carries the exact release grammar.
