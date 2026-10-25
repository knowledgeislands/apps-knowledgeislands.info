---
title: Repository standards
description: Choose a repository shape, declare the standards it follows and close the gaps through a bounded review.
permalink: /docs/standards/repository-standards/
order: 1
sources:
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/keystone/ki-repo/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The universal contract, repository kind, declared shapes and educate, audit and conform modes'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/keystone/ki-repo/references/standards-configuration.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Declaration ownership, dependencies, coverage and territory identity'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/keystone/ki-repo/references/standards-repository.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Root files, repository settings and directional working areas'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/keystone/ki-bootstrap/references/standards-bootstrap.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'First-time activation and verified installed capability boundaries'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/repo-structure/ki-repo-project/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The project structure and its boundary with the universal contract'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/repo-structure/ki-repo-kb/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The kb structure and its boundary with the universal contract'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/repo-structure/ki-repo-harness/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The harness structure and its boundary with the universal contract'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/repo-structure/ki-repo-tools/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The tools structure and its boundary with the universal contract'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/repo-structure/ki-repo-mcp/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The mcp structure and its boundary with the universal contract'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/repo-structure/ki-repo-specifications/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The specifications structure and its boundary with the universal contract'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/repo-structure/ki-repo-homebrew-tap/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The homebrew-tap structure and its boundary with the universal contract'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/repo-structure/ki-repo-dotfiles-chezmoi/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The dotfiles-chezmoi structure and its boundary with the universal contract'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/repo-structure/ki-repo-website/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The website structure and its boundary with the universal contract'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/repo-structure/ki-repo-website-content/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The website-content structure and its boundary with the universal contract'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/repo-structure/ki-repo-website-app/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The website-app structure and its boundary with the universal contract'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/repo-structure/ki-repo-website-cloudflare/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The website-cloudflare structure and its boundary with the universal contract'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-principal
    path: +/_WORK/ki.ways-of-working/design/repository-metadata.md
    ref: 3509b552d68156aa1d4ee7d8c569a57ad8ccc130
    governs: 'Interim metadata practice, source direction, topic derivation and current checking limits'
    reviewed: '2026-10-25'
---

# Repository standards

You can tell what a repository is, which standards govern it and how to bring it into line by reading its declarations, choosing the appropriate shape and checking each layer against its own contract.

> **Interim** - Repository metadata is maintained through the review practice described below. Its agreed source direction and topic conventions are applied explicitly; the pinned repository checker covers only the checks identified here.

{% figure "repository-shapes", "Every repository has a universal contract and an explicit primary shape. Supporting standards add capabilities without changing that identity." %}

## What it is

A Knowledge Islands repository is a Git repository with `.ki.toml` at its root. The file declares the standards it follows. It records identity, purpose and ownership alongside one table for each governing skill. A declaration makes a rule applicable; it does not install a tool, activate a runtime or prove compliance.

Every repository explicitly declares `repo_type`, either `project` or `kb`, and `primary_shape` under `[skills.ki-repo]`. A Knowledge Base chooses `ki-repo-kb`; a Project chooses a declared core shape, with `ki-repo-project` as the general baseline. Neither value is inferred from a folder name.

## How it works

The universal contract covers the root README, licence, ignore rules and configuration, alongside repository identity and GitHub settings. A README explains purpose and entry points. Visibility and licence are separate declarations. The applicable shape then governs the artefact the repository holds:

- A Knowledge Base keeps indexed zones for records, knowledge, references, work and administration, described in [Knowledge bases](/docs/knowledge/knowledge-bases/).
- A general Project supplies the non-Knowledge-Base baseline. A harness holds skills, subagents, evals and hooks, and distinguishes source from a verified installed payload.
- A tools repository holds one command-line tool and its delivery surface. A Homebrew tap holds formulae for released tools. An MCP repository governs server source, configuration injection and access boundaries.
- A Specifications repository separates proposals, specifications, schemas, templates, examples, documentation and tooling. A chezmoi repository governs configuration source and rendering discipline.
- A website declares the neutral build seam, then exactly one content or app implementation. Content uses Eleventy; an app uses React and Vite. Cloudflare hosting is an independent overlay consuming the built `dist/`.

Supporting declarations compose with the primary shape. A content website can therefore declare the website core, content implementation, hosting, engineering and writing standards without acquiring five different identities. Each standard owns its own table and concern; dependencies make required neighbours explicit.

The directional working areas have the same meaning across shapes: `+/` holds inputs for local work, including locally created working records; `-/` holds produced outputs. Specialist owners govern such subdirectories as work packages and trades. The ignored `tmp/` area is disposable. None is a second home for settled knowledge or an ungoverned roadmap.

### Repository metadata in practice

Metadata review begins with `.ki.toml` under `[skills.ki-repo]`. Description, repository URL, visibility and licence are checked against their relevant mirrors. Where a root `package.json` exists, its corresponding values agree. Public repository discovery topics are compared with package keywords where present. These are existing checks; managed topic derivation and territory-specific topics are reviewed explicitly.

The interim practice keeps description, optional homepage and discovery keywords in `.ki.toml`, then mirrors the intended values to GitHub and the root package manifest. It never promotes a mirror into authority merely because that mirror already contains a value. A homepage identifies this repository's current landing page, including a preview address where appropriate; review it before copying it, and leave workspace packages' own homepages alone. Omitting the declaration does not authorise silently clearing a live value.

Managed GitHub topics use the bare `knowledge-islands` topic, one `ki-territory-<prefix>`, one `ki-shape-<shape>` and a Capital role topic only on the designated Capital. The topic forms are:

```text
knowledge-islands
ki-territory-<prefix>
ki-shape-<shape>
ki-role-capital
```

 Territory comes from the declared Capital's prefix. Shape comes from `primary_shape` with its leading `ki-repo-` removed; supporting overlays add no shape topic. A territory can declare additional single-word types under a declared code, yielding `<territory-code>-<type>-<value>`. Discovery keywords remain separate: managed and territory topics stay out of package keywords. Only non-secret values belong in metadata, including for private repositories.

{% figure "audit-conform", "Educate establishes the foundations, audit names the gaps, conform applies approved repairs and re-audit checks the result." %}

## How you use it

Mara starts the fictional Tern Holm survey repository by describing its purpose and choosing a general Project shape. She uses [first-time setup](/docs/ki/getting-started/) to establish her local installation, then follows this loop:

1. **Educate:** establish the repository's declarative foundations and understand each selected standard. Keep machine-level activation separate from repository declarations.
2. **Audit:** inspect the universal contract and every applicable layer. Missing or incompatible capabilities stop execution rather than being guessed into existence.
3. **Conform:** review the proposed repairs, apply the authorised local changes and handle judgement-led content gaps. Live GitHub settings require their own explicit approval.
4. **Re-audit:** check that the gaps have closed and review the parts a mechanical checker cannot assess, such as whether the description fits the repository.

The [repository and territory commands](/docs/ki/repositories-and-territory/) explain how registration, harness selection and repository operations fit together. Registration records a physical checkout; it is inventory, not a compliance verdict.

## What it provides

You get a portable statement of what the repository is and which rules apply, with separate owners for universal setup, artefact shape and supporting capabilities. Audits expose drift; the review loop makes correction deliberate and repeatable.

## Boundaries

Passing an audit does not grant authority to publish, change provider settings or appoint a Capital. Source shape does not prove runtime health. Metadata review does not change visibility or licence by implication, and the interim topic practice is not presented as an automated check at this pinned revision. [Engineering and Git](/docs/standards/engineering-and-git/) govern implementation and commits; [writing](/docs/standards/writing/) governs how the resulting knowledge is expressed.
