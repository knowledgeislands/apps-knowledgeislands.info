---
id: ADR-KI-WEBSITE-002
title: 'One Section For Every Project'
date: 2026-09-22
status: current
decision_type_url: https://knowledgeislands.info/specifications/decision-records/adr
decision_type: architecture
---

# ADR-KI-WEBSITE-002: One Section For Every Project

## Context

The site published two top-level sections describing repositories. `/tooling/` held the four released command-line tools, built from `tools.json5` through `tool.njk`. `/projects/` held the fourteen-entry ecosystem directory, built from `projects.json5` through `project.njk`, and rendered the tools as a sixth group by reading the other registry and linking across into `/tooling/<slug>/`.

The two registries held no duplicated data — the sets are disjoint, no repository appears in both — so the arrangement was defensible on the data. It was not defensible to a reader. Both templates opened with a navy hero carrying an overline, a tagline as the headline, and a paragraph of description; both followed with a parchment two-column block and an aside linking the repository; both ended by disclaiming themselves. Both ran a little over two hundred words. The repository owner reported the sections as overlapping and observed that the tooling pages for the tools were the project pages for the tools, which is what indistinguishable voice looks like from outside.

A second registry also carried a cost the reader never saw: `verify-projects.ts` existed partly to police the boundary, rejecting any `projects.json5` entry whose slug collided with a tool or which carried a `version`, `installer`, `formula`, or `changelog` field.

## Decision

**One section, one registry.** The four tools become `kind: 'tool'` entries in `projects.json5`, carrying six release fields — `version`, `maturity`, `formula`, `installer`, `manual`, `changelog` — that no other kind may declare. `project.njk` renders an install block when an entry has them. `/projects/` gains a "What you can install today" group, which was the tooling section's one genuine job and the thing a fourteen-entry list would otherwise lose. `/tooling/` and its templates are deleted, and the navigation entry with them.

`_data/tools.ts` derives the released set from the registry so the templates that ask the narrower question — `redirects.njk` generating one `/install/<slug>` line per tool — keep working. It is a projection, never a second declaration.

**The `/install/<slug>` contract is untouched.** It is a machine route in `dist/_redirects`, independent of where the registry entry sits, and it continues to redirect to an installer pinned at an immutable release tag.

**The retired routes redirect.** `/tooling/<slug>` to `/projects/<slug>/`, `/tooling/` to `/projects/`, permanently. This differs deliberately from how `/tooling/cli/` and `/harness/install` were retired without aliases: those were special cases whose inconsistency an alias would have preserved, whereas `/tooling/ki/` was a correct published address for a page that still exists at a different one.

**Two pages leave rather than merge.** `/tooling/harnesses/` and `/tooling/guidance/` were task guidance — how to bootstrap a harness, how to activate a skill in a scope — filed under released tools by accident of navigation. They are not tool pages, so they leave the section. Both are about the agentic harness, and both are published under it, at `/projects/ki-agentic-harness/installing-a-harness/` and `/projects/ki-agentic-harness/repositories/`.

## Consequences

- A reader has one question to answer, not two. "Where is this repository described" has a single answer for every public repository the site lists.
- The gate inverts rather than disappears. `verify-projects.ts` now requires all six release fields on a `tool` entry and forbids every one of them elsewhere. Requiring them matters as much as forbidding them: a half-declared tool would render an install block with a missing link instead of failing the build.
- `verify-tool-routes.ts` and `sync-tool-release.ts` read `projects.json5`. The release-advance machinery — the `tool-release-published` event, the receiver's five independent checks, the pull-request boundary — is unchanged; only the file it edits moved. The sync additionally refuses an entry that is not `kind: 'tool'`, which was previously implicit in the registry it read.
- The site keeps no page whose purpose is to explain the contract two sections shared, because there is one section. What `/tooling/` said about discoverability and indirection now lives in tool routes, which is where a contributor looks.
- This is structural, not editorial. The merged pages carry across intact at around two hundred words each; giving them the depth [GDR-KI-WEBSITE-002](GDR-KI-WEBSITE-002-carrying-material-for-readers.md) now requires is separate work.

## References

- Tool routes (`docs/guides/developer/tool-routes.md`) — the `/install/<tool>` contract, the release fields, and the release handoff.
- The projects directory (`docs/guides/developer/projects-directory.md`) — the registry every entry answers to.
- [GDR-KI-WEBSITE-002](GDR-KI-WEBSITE-002-carrying-material-for-readers.md) — why these pages are too thin, which this record does not fix.
