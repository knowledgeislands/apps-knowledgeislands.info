---
title: Engineering and Git
description: Keep code comprehensible, verification meaningful and commits safe in a shared repository.
permalink: /docs/standards/engineering-and-git/
order: 3
sources:
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/governance/ki-engineering/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Common TypeScript and Bun tooling and artifact-specific layering'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/governance/ki-engineering/references/standards-engineering.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Code design, workspace boundaries, testing and declared script ownership'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/governance/ki-git/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Primary checkout use and the Git policy boundary'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/governance/ki-git/references/standards-git.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Conventional Commits, explicit staging, shared-tree safety and separate publication authority'
    reviewed: '2026-10-25'
---

# Engineering and Git

You can ask for a code change that remains understandable, verify it through the behaviour people depend on and preserve it in a focused commit without capturing another session's work or assuming permission to publish.

{% figure "standards-layers", "The universal repository contract, applicable shape and capability standards, and repository choices each own a distinct part of the result." %}

## What it is

Engineering standards govern how code is structured, built, checked and tested. Git standards govern how a verified change is preserved and how people and agents share a working tree. Together they make a change reviewable, but they remain separate from the repository's purpose, provider settings and permission to deploy.

The common engineering layer applies to repositories declaring `ki-engineering`. An artefact-specific standard adds its own requirements: an MCP server, for example, has source and access boundaries beyond the common TypeScript toolchain. A repository's `.ki.toml` selects the applicable layers.

## How it works

Code groups related responsibilities into cohesive modules and makes policy visible at the boundary where it matters. Names, types and data flow should let a maintainer follow the ordinary case. Shared code is extracted when it represents a stable concept with the same meaning and lifecycle for its callers. A format reader is extracted at its second caller, because the format's correctness must extend beyond one caller's subset.

Bun is used for installation and development. TypeScript uses strict checking; compiled output runs under the declared supported Node runtime. Biome owns TypeScript and JSON formatting and linting, while rumdl owns authored Markdown. Knip checks unused code, with entry points reviewed against real supported invocation rather than declared merely to silence findings.

A flat repository holds one package. A monorepo declares actual workspace globs: `packages/*` for libraries, `apps/*` for deployable applications and `examples/*` for authored examples. Package boundaries are explicit and mechanically checked. Task inputs include the files each task really reads, so a cached pass remains meaningful after a change.

Tests begin at a supported API, CLI or other observable contract. Coverage supports that evidence; it cannot substitute for it. Conditional tooling follows capabilities actually present. A repository shipping tests exposes the bare `test` entry point; choosing Vitest brings its stricter coverage profile. Repository-owned scripts and standard-owned scripts have distinct namespaces, and native governance commands run the declared rubrics.

Git messages use Conventional Commits: `type(scope): summary`, or `type: summary` when a scope adds nothing. The types are `chore`, `docs`, `feat`, `fix`, `refactor` and `test`. Scope is lowercase kebab-case, and the short imperative summary has no terminal punctuation. The message describes one completed unit.

## How you use it

Ivo changes how the fictional Tern Holm survey tool validates an observation. He identifies the supported command behaviour, checks the applicable engineering and artefact standards, makes the change within the responsible module and verifies the accepted and rejected cases through that command's supported boundary.

Before committing, he inspects the working tree and index, tracks the paths his session touched and stages those paths explicitly. Another session's draft remains outside his commit. In a shared tree, Git writes are serialised and each writer rechecks the current state before advancing it. Hooks run normally; a missing or failing gate is resolved rather than bypassed.

Ordinary interactive work uses the primary checkout. A branch or worktree is chosen when an explicit review or isolation requirement calls for it. A required worktree lives under a runtime-owned root outside repositories and workspace-discovery roots. Branch choice makes the review boundary explicit; it does not grant integration authority.

A verified local commit preserves the unit. Publishing, integrating into a primary branch and releasing are separate authority decisions. Where publication is authorised, inspect what the ref will carry, including earlier unpublished commits, before pushing it.

## What it provides

You get code whose responsibilities can be found, checks tied to supported outcomes and a commit containing exactly the intended change. Layered ownership keeps common rules reusable without making every artefact adopt the same layout or inventing local copies of shared standards.

## Boundaries

A passing test suite does not establish every quality property, and a configured command does not prove it ran. Review still assesses clarity, ownership and the fit of the tests. Git hygiene does not permit deleting another writer's lock, resetting their changes or stashing their work to make an operation proceed. A local commit grants no implicit push, merge, deployment or release authority. [Repository standards](/docs/standards/repository-standards/) own the universal contract; [writing](/docs/standards/writing/) owns the documents that explain it.
