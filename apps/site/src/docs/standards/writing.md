---
title: Writing
description: Put rationale, accepted behaviour, procedures and future work in their right homes, with readable Markdown and TOML.
permalink: /docs/standards/writing/
order: 4
sources:
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/governance/ki-authoring/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Mechanical authoring tools and judgement-led conventions'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/governance/ki-authoring/references/standards-markdown.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Paragraphs, descriptive links and readable table footnotes'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/governance/ki-authoring/references/standards-toml.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'TOML presentation without changing configuration meaning'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/governance/ki-authoring/references/standards-readme.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Purpose-first entry points and proportional README navigation'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/governance/ki-authoring/references/standards-knowledge-promotion.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Placement of durable learning in its governing document'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/governance/ki-guides/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Repository-local guides and their scope'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/governance/ki-guides/references/standards-guides.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Audience folders, self-contained procedures and supplementary links'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/governance/ki-specs/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Accepted behaviour, quality properties and truthful conformance'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/governance/ki-specs/references/standards-specs.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Requirement identity, lifecycle fields, gaps and append-only numbering'
    reviewed: '2026-10-25'
---

# Writing

You can turn a useful explanation into a document another reader can act on, choose the right home for its knowledge and keep rationale, accepted behaviour, instructions and future work from becoming competing accounts.

## What it is

Writing standards make knowledge readable and place it under the owner that can keep it true. They cover Markdown and TOML presentation, the README that introduces a repository, guides that explain how to do something and specifications that state accepted behaviour and quality properties.

The distinction begins with the reader's question. A [Decision Record](/docs/standards/decision-records/) answers why. A specification answers what must be true. A guide answers how to use, operate, contribute to or maintain a system. A [work record](/docs/ways-of-working/roadmap-lifecycle/) holds delivery still to do. A README opens the repository and gives each reader a proportionate route into it.

## How it works

Authoring has mechanical and judgement layers. rumdl formats and lints authored Markdown; Biome handles TypeScript and JSON. TOML formatting and table readability remain reviewed conventions. Formatting TOML does not authorise renaming keys or changing what a table means.

Write one paragraph per line, with blank lines between paragraphs. Keep headings, list items and table rows on their own lines. Use descriptive link text that carries information even if the link is removed. Tables earn their space when readers compare values; when a long cell makes a row unwieldy, move its detail into a footnote marked with `†`, `‡`, `§`, `¶` or `‖`.

A README starts with purpose: what the repository is and what it lets its readers do. Entry points and worked examples follow the reader's likely route. Navigation grows with the material, rather than becoming a catalogue of every internal file. Reusable procedure belongs in a guide; durable rationale belongs in its record.

### Guides

Repository-local guides live under `docs/guides/`, with a root README that explains the collection and gives readers a route. Each guide sits in an audience folder, such as `user`, `operator` or `developer`. Those names are local choices; the requirement is that the folder identifies its reader.

A guide has one H1 and makes its task, outcome or operating context explicit. It carries the conditions, actions, verification and recovery needed to complete that outcome. Supporting material stays inside the guide collection; external links supplement an answer the prose already gives. A user-facing guide names commands and configuration the user can reach, rather than relying on internal work records for its explanation.

### Specifications

Specifications live flat under `docs/specs/`, with one file per comprehensible feature area and an `index.md` registering the areas and prefixes. Requirements describe user-observable behaviour or a reviewable quality property, rather than arbitrary internal implementation detail.

Each accepted requirement has a unique prefix and serial, a normative statement using an uppercase BCP 14 keyword such as MUST or SHOULD, and explicit fields:

- **Conformance:** `conforming`, `pending` or `divergent` states the system's current relationship to the accepted contract.
- **Verify:** names the concrete check that can decide whether the requirement is met.
- **Evidence:** names current proof and is required for a conforming claim.

IDs are append-only and never reused. Retired requirements retain their numbers. Unaccepted candidates can sit as unnumbered Gaps; an accepted requirement that is not implemented belongs in the contract with truthful conformance, rather than being hidden as a Gap.

## How you use it

Mara documents the fictional Tern Holm survey tool. Its README explains what the tool does and how to begin. A user guide explains how to enter and validate an observation. A specification states that invalid coordinates are rejected with an actionable message, gives the next requirement ID, names the planned command-level check and records the current evidence. The rationale for rejecting partial observations belongs in a Decision Record.

When a session discovers a better recovery procedure, Mara updates the owning guide. A changed accepted behaviour updates the specification and its conformance evidence. A useful observation is routed into the island's knowledge rather than copied into several documents. She finishes the intended edits, runs the authoring formatter once and reviews the result for meaning.

## What it provides

You get a clear path from purpose to action, a testable account of accepted behaviour and one durable home for each kind of knowledge. Mechanical formatting removes routine variation while review checks that the document answers its reader's question.

## Boundaries

Formatting cannot establish procedural truth, and a well-formed requirement does not prove conformance. Review still checks the evidence and whether the reader can complete the outcome. Specifications do not settle rationale, guides do not grant publication authority and READMEs do not replace governed collections. [Diagrams](/docs/standards/diagrams/) explain relationships and processes alongside prose under their own source and freshness rules.
