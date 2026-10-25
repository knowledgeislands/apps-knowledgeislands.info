---
title: Onboard a repository
description: Connect a repository to native KI governance with explicit capability declarations, trusted harnesses, and CI.
permalink: /docs/ki-agentic-harness/onboarding/
order: 5
sources:
  - repository: knowledgeislands/tools-ki
    path: man/ki.1
    ref: v0.4.0
    governs: 'The commands an onboarding repository runs and their order'
    reviewed: '2026-09-21'
  - repository: knowledgeislands/ki-agentic-harness
    path: docs/decisions/ADR-KI-HARNESS-012-compatible-harness-publication-and-governed-rubric-boundary.md
    ref: 7dcee9dc3aa33c863c77cb56d1bab762d026dbbb
    governs: 'The publication and rubric boundary onboarding conforms a repository to'
    reviewed: '2026-09-21'
---

# Onboard a repository to native KI governance

Knowledge Islands repository governance resolves declared capabilities from verified installed compatible harnesses and executes them through the native `ki` host.

The contract behind that sentence is ADR-KI-HARNESS-012, in the KI Agentic Harness. It is recorded in the sources at the foot of this page; you do not need to read it to follow what is here.

## Trust and installation

Each user has a KI XDG configuration and an installed compatible-harness set. `ki bootstrap` creates the configuration, installs the canonical `knowledgeislands/ki-agentic-harness`, and activates the core user skills for detected runtimes.

`ki harness install <harness-id>` adds another verified compatible harness. Installing a harness does not activate all of its capabilities or change a repository.

`ki` uses the standard XDG data, configuration, cache, and state locations. It does not define a separate KI home variable.

## Repository declaration and activation

A KI repository carries a regular `.ki.toml` at its Git worktree root. `[repo]` names the harnesses it may draw from, and each `[skills.<name>]` table declares one governance capability by bare name. [Govern a repository](/docs/ki-agentic-harness/repositories/) shows the file.

Activate a repository skill with:

```bash
ki repo skill add <skill> --repo <repository>
```

The command resolves one installed provider, updates the repository declaration, and creates managed runtime-discovery links. It refuses ambiguous providers and unfamiliar destination state.

`ki repo skill remove` reverses only the declaration and links whose ownership KI can prove. User activation is separate and uses `ki skill add` or `ki skill remove`.

`ki-repo` owns the judgment about which capabilities a repository should declare.

## Native repository maintenance

The native operations are:

```bash
ki repo educate --repo <repository>
ki repo audit --repo <repository>
ki repo conform --repo <repository> --dry-run
```

They physically resolve the selected repository, read `.ki.toml`, validate declared dependencies, and load registered compatible operations from verified installed harnesses.

AUDIT is read-only. CONFORM applies only registered safe mechanical changes; `--dry-run` validates and reports without publishing. EDUCATE renders the declared rubric guidance.

Missing, incompatible, undeclared, ambiguous, or untrusted capabilities fail before an operation runs. `--skill <skill>` narrows an operation to one declared capability without changing repository coverage.

The host never invokes copied rubric runners, repository-local wrappers, a nearby checkout, or an ad hoc child-process fallback. Harness contributors record a checkout with `ki dev local set <harness-id> <local-harness-path>` and select it explicitly with `ki dev local on [harness-id]`.

## CI and automation

CI must establish a compatible released `ki` and its required verified harness inventory before running:

```bash
ki repo audit --repo .
```

The governance audit runs before the repository test suite. Automation fails when acquisition, verification, registry loading, operation availability, or declared-skill resolution fails; it does not bootstrap a checkout-local executor.

The harness's pre-commit hook audits a complete staged snapshot when governed skill sources change. That snapshot includes unchanged siblings, shared providers, and the repository-local `ki-self` source where applicable.

## Existing repository-vendored state

The former models created `.ki/` or `.ki-meta/` executors and regular-file skill copies under repository runtime-discovery directories.

That material is now migration evidence, not an executor or a managed runtime link. Map every consumer to its native replacement, prove generated ownership, and replace unchanged runtime copies through `ki repo skill`.

If legacy state is altered, partial, unfamiliar, linked, dangling, escaping, or concurrently changed, preserve it and stop. A passing legacy runner does not prove that native governance is available.

## Scope and recovery

User-owned state comprises the XDG configuration, installed harnesses, and managed user-runtime links. Repository-owned state comprises `.ki.toml`, managed repository-runtime links, the committed repository-local `ki-self` source, and writes proposed by registered native operations.

Use `ki manage doctor` for environment health, `ki manage diag` for installation mode and paths, `ki bootstrap --refresh` to reconcile configured inventory, and `ki <command> --help` for exact grammar.
