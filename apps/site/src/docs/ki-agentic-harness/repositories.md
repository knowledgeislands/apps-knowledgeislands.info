---
title: Repositories
description: What makes a repository a KI repository, what its .ki.toml declares, and the educate–audit–conform cycle that acts on those declarations.
permalink: /docs/ki-agentic-harness/repositories/
order: 3
sources:
  - repository: knowledgeislands/tools-ki
    path: man/ki.1
    ref: v0.4.0
    governs: 'The repository commands, their options, and the declaration form they read'
    reviewed: '2026-09-22'
  - repository: knowledgeislands/tools-ki
    path: docs/decisions/ADR-KI-TOOLS-002-compatible-harness-registry-and-native-operations.md
    ref: v0.4.0
    governs: 'Native operation resolution and what the host refuses to execute'
    reviewed: '2026-09-22'
  - repository: knowledgeislands/ki-agentic-harness
    path: docs/decisions/ADR-KI-HARNESS-012-compatible-harness-publication-and-governed-rubric-boundary.md
    ref: 7dcee9dc3aa33c863c77cb56d1bab762d026dbbb
    governs: 'The boundary between what a harness publishes and what a repository declares'
    reviewed: '2026-09-22'
---

# Repositories

A repository becomes a Knowledge Islands repository by carrying a `.ki.toml` at its Git worktree root. That file is the whole of the claim: it names the repository, names the harnesses it draws from, and declares which capabilities govern it.

Everything else follows from reading it. There is no server, no account, and no per-machine configuration that a colleague has to reproduce — they clone the repository and get the same governance, because the declaration travelled with the code.

## What `.ki.toml` declares

```toml
[repo]
harnesses = ["knowledgeislands/ki-agentic-harness"]

[skills.ki-authoring]
# this capability's own configuration, where it takes any

[skills.ki-work-roadmap]
```

Two parts, and the split is the point.

`[repo]` says where capability may come from. A provider must appear in that list before any of its skills can be declared.

Each `[skills.<name>]` table declares that one capability governs this repository. The name is bare — `ki-authoring`, not `knowledgeislands/ki-agentic-harness:ki-authoring`. **Harness-qualified keys are invalid**, because a repository declares _what governs it_, not _where that came from_; the provider is a property of the installation, recorded once above.

`ki repo init` writes the initial file for an existing worktree:

```bash
ki repo init \
  --repository https://github.com/example/example \
  --title "Example" \
  --description "What this repository is for." \
  --repo-code EXAMPLE \
  --runtime claude \
  --visibility public
```

It declares identity for exactly one existing Git worktree root and registers that root in your machine-local registry. It does not create a Git repository.

## Declaring what governs it

```bash
ki repo skill add <skill> [--replace]
ki repo skill remove <skill>
```

Adding resolves one installed provider for the bare name, writes the declaration, and creates the managed runtime-discovery links your agent reads. If two installed harnesses supply the name, it stops rather than choosing. Removing reverses only the declaration and the links whose ownership `ki` can prove — unfamiliar state is preserved rather than cleaned up.

Both take `--repo <path>` to act on a repository other than the one you are standing in.

Repository scope is about _this codebase_: its Markdown style, its toolchain, its roadmap discipline. It is separate from user scope, which is about how _you_ work and is managed with `ki skill add`. Removing one never touches the other. [The capability lifecycle](/docs/ki/capability-lifecycle/) covers both scopes together.

Choosing what to declare is its own question — [choose a skill by outcome](/docs/skills/by-outcome/) routes a plain-language goal to the capability that serves it.

## The three operations

```bash
ki repo educate    # explain what the declared skills expect. Changes nothing.
ki repo audit      # run their read-only checks. Changes nothing.
ki repo conform --dry-run   # report the repairs it would make.
ki repo conform             # apply them.
```

In increasing order of consequence, and worth running in that order the first time. `educate` renders the guidance behind the rules, which is usually more useful than reading a list of failures and inferring the rule from each.

`conform` applies only the registered, safe, mechanical repairs a skill defines. It stages its writes and re-audits before publishing them, and aborts before anything is written if the initial audit has a blocking finding — so a `conform` that fails leaves the tree exactly as it was.

All three take `--skill <skill>` to narrow to one declared capability without changing what the repository declares, and `--progress` and `--reporter-levels` to control output. That narrowing matters more than it sounds: when you have just produced an artefact a particular skill governs, `ki repo audit --skill <that-skill>` is the check that looks at it.

## What the host will not run

`audit` and `conform` implement no checks of their own. They resolve the operations that this repository's declared skills register, verify them against the installed harness's integrity evidence, and run those.

They will not run anything else — not a repository-local wrapper script, not a copied rubric runner sitting in the tree, not a package alias, not a checkout that happens to be nearby. Missing, incompatible, undeclared, ambiguous or untrusted capabilities fail _before_ an operation runs, rather than falling back to something that looks similar.

This is why "the audit passed" is a precise claim. It means the operations registered by the declared skills, from harnesses whose payloads verified, all succeeded. It says nothing about rules nobody declared.

A repository that needs rules of its own declares a `ki-self` provider, and those are still resolved rather than discovered. [Operator guides](/docs/ki/operator-guides/) covers that route.

## When declarations and reality drift

```bash
ki repo diag              # declared skills and the health of their projections
ki repo repair [--dry-run]  # reconcile the managed links
ki repo upgrade           # refresh the harnesses this repository's declarations select
```

`diag` is the first thing to run when a skill you expect is not firing: it reports what the repository declares and whether the runtime projections for those declarations are healthy, and changes nothing.

Most of what `ki` manages is a _link_ between two records — a declaration and a payload, a registry entry and a checkout. Deleting a file that looks stale usually breaks the other half of a pair. `repair` exists to reconcile exactly those projections, so reach for it rather than tidying by hand.

## Roadmap and registry

Two smaller surfaces attach to a repository and are easy to miss.

`ki repo roadmap` reads the work records a repository keeps under its own roadmap convention — `list` filtered by horizon or status, `stats` for staleness, and `promote`, `demote` and `prune` for moving an item through its lifecycle. It is a reader and mover of records, not a planner.

`ki registry add` records a repository in your machine-local registry, and `ki registry list` reports what is recorded. The registry is what lets other commands find a repository by path or pattern rather than by you standing in it.

## In CI

CI establishes a compatible released `ki` and the verified harness inventory the repository needs, then runs:

```bash
ki repo audit --repo .
```

Run the governance audit before the test suite. Automation fails when acquisition, verification, registry loading, operation availability or declared-skill resolution fails — it does not bootstrap a checkout-local executor to get past a missing payload.

## Related

[Onboard a repository](/docs/ki-agentic-harness/onboarding/) covers the trust, migration and legacy-state boundaries in full, including what to do with a repository-vendored `.ki/` directory from an older layout. [Install and get started](/docs/ki/getting-started/) is the end-to-end first run, and [every `ki` command](/docs/ki/commands/) is the full inventory.
