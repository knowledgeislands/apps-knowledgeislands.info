---
title: Knowledge bases
description: Find the right home for knowledge, work and operational views inside an island.
permalink: /docs/knowledge/knowledge-bases/
order: 1
sources:
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/repo-structure/ki-repo-kb/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The five zones, directional working areas, routing, indexes and memory cascade'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/repo-structure/ki-repo-kb/references/standards-knowledge-base.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Index note shape, local zone aliases and canonical knowledge ownership'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/repo-structure/ki-repo-kb-principal/references/standards-principal.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Capital designation, territorial declarations and the principal governance overlay'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/repo-structure/ki-repo-kb-streams/references/standards-streams-structure.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Flat forward-work records, Capital registries and the boundary around canonical changes'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/repo-structure/ki-repo-kb-live-artifacts/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Live Artifact source and render pairing, index, frontmatter and freshness'
    reviewed: '2026-10-25'
---

# Knowledge bases

You can keep records, settled knowledge, references and work in one island without losing their different purposes, and find each again through notes that explain how its contents fit together.

{% figure "kb-zones", "Five indexed zones hold an island's knowledge and operations. The directional working areas sit beside them; a designated Capital adds the principal overlay." %}

## What it is

A Knowledge Islands knowledge base is a Markdown store with five zones: Calendar, Pillars, Resources, Streams and Admin. The whole base is an island. A Pillar is a major strand within its subject matter, such as harbour ecology or navigation, rather than a separate island.

Two directional working areas sit beside the zones: `+/` holds inputs for further local work, and `-/` holds produced outputs. They are working areas rather than additional zones. A local zone alias may change a folder's name while preserving its purpose.

## How it works

- **Calendar** holds time-stamped records, including daily, meeting and session notes.
- **Pillars** holds canonical internal knowledge, organised by the island's subjects.
- **Resources** holds external reference material that would exist independently of the island.
- **Streams** holds finite work in motion. Flat records in `Streams/Roadmap/` carry their status and horizon as metadata. The [roadmap lifecycle](/docs/ways-of-working/roadmap-lifecycle/) governs how that work moves.
- **Admin** holds governance and operations. `Admin/Governance/` includes charters, decisions and structural agreements; `Admin/Operations/` includes activities, runbooks and operational views.

Each zone has a same-name index note, such as `Resources/Resources.md`. An index opens with an Overview, then explains each direct child in its own section: what it covers, why it exists and what the reader will find. It points to knowledge rather than copying it. The working areas have no same-name zone index.

`Admin/MEMORY.md` is the root memory anchor. In a base organised by Pillars, it identifies the active Pillars; a session selects one and reads its `MEMORY.md` and relevant profiles before substantive work. Other Pillars remain outside that session's scope until you switch.

### A designated Capital

One principal island holds the Capital role for each territory. Its Charter names that territory, Capital and authority boundary. Known Lands distinguishes governed internal members from external signposting. Conventions and an Enactment Process make local governance visible, while `+/_ACQUIRED/README.md` supplies the acquired-packet scaffold.

The principal overlay reviews those declarations. Adopting it or passing an audit does not appoint a Capital or grant jurisdiction. Any island can maintain a narrower Known Lands chart without becoming a principal.

### Operational views

A Live Artifact is a mutable dashboard, queue, tracker or status board. By default, it lives under `Admin/Operations/Live Artifacts/` as a same-stem, same-directory pair: `Harbour Board.md` is authoritative and `Harbour Board.html` renders it. The Markdown carries `status: active` or `archived`, `renders: html` and `author`; `Live Artifacts.md` indexes the pairs. The default freshness threshold allows the HTML to lag its source by at most 24 hours.

## How you use it

Mara keeps the fictional Tern Holm island. She files a dated field meeting in Calendar, an established account of nesting sites in Pillars and an external survey in Resources. A proposed survey-method change becomes a Streams roadmap record; the island's approved operating procedure belongs in Admin. An uncertain incoming document waits in `+/` until its destination is clear.

She uses [querying, saving and updating](/docs/knowledge/query-save-update/) to maintain those notes. When work produces a session digest, it goes to `-/_DIGESTS/`. Her operational harbour board stays with its Markdown source and HTML render in Admin.

## What it provides

You get a stable distinction between evidence, accepted knowledge and work still being decided. Index notes give context for navigation, the memory cascade bounds a session's attention, and live views make current operations readable without becoming a second source of truth.

## Boundaries

Substantive canonical changes to Admin, Pillars or Resources follow approved forward work where the island runs an Enactment Process. Calendar entries and inbound triage remain lightweight exceptions. Streams holds the work records; durable outputs belong in their canonical zone, and the changing briefs and reports of [work packages](/docs/ways-of-working/work-packages/) stay in `+/_WORK/`.

Territory membership, a shared checkout or a Known Lands link grants no access to restricted material or permission to redistribute it. Each receiver decides its own knowledge adoption. [Acquisition](/docs/knowledge/acquiring-knowledge/) preserves selected sources; it does not settle those decisions.
