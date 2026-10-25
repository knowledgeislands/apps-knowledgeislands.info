---
title: Query, save and update
description: Use the knowledge loop to answer questions, preserve evidence and enrich existing notes.
permalink: /docs/knowledge/query-save-update/
order: 2
sources:
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/repo-structure/ki-repo-kb/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Context loading, zone routing, internal links and the operating modes'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/repo-structure/ki-repo-kb/references/mode-query.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Bounded retrieval, literal search fallback and evidence-based answers'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/repo-structure/ki-repo-kb/references/mode-save.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Destination selection, cited drafts, confirmation and canonical-change routing'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/repo-structure/ki-repo-kb/references/mode-update.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Merged updates that preserve note structure and cite each change'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/repo-structure/ki-repo-kb/references/mode-digest.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Session digest location, fields, sections, retention and trade boundary'
    reviewed: '2026-10-25'
---

# Query, save and update

You can answer a question from the island's existing evidence, save what is missing and enrich what is already there, while keeping sources, links and the island's approval boundary intact.

{% figure "query-save-update", "Load the island's context, retrieve evidence, draft a new note or a merged update, then follow confirmation and canonical-change approval. A session digest is an outbound product." %}

## What it is

The knowledge loop is the ordinary work of using a base: QUERY answers from notes, SAVE creates a note and UPDATE enriches one. DIGEST records a session's useful outcome as a temporary output. These are modes of `ki-repo-kb`; they share the [zone model](/docs/knowledge/knowledge-bases/) and context-loading rules.

## How it works

First load the root memory index, select the active Pillar where the base is Pillar-scoped, and read its memory and relevant profiles. Follow any declared pre-flight reads before drafting.

**Query from evidence.** Use the explicitly provisioned search service when it is available, scoped to the selected base, allowed zones and current access rules. Search exact identifiers literally. Inspect snippets and read targeted note lines before answering with repository paths and validated line ranges. If search is unavailable, fails or supplies insufficient evidence, use literal text search and targeted reads. An index helps find notes; the notes establish the answer. If they cannot answer, research may lead to SAVE.

**Save to a deliberate home.** Run the routing test: time-bound records go to Calendar, active work to Streams, canonical internal knowledge to Pillars and independent external references to Resources. Uncertain inputs wait in `+/` at the most specific applicable level. Produced outputs bypass that test and go to `-/`. Propose a filename, draft to the island's conventions and cite each fact. Confirm before writing.

**Update by merging.** Read the existing note before proposing an enrichment. Preserve its structure and useful content, cite the source for each update and confirm before writing. Unambiguous factual updates to profile or person notes may be auto-appended from authoritative sources; tactical or evaluative content needs a proposed diff first.

For SAVE or UPDATE in a canonical zone where the base runs an Enactment Process, route the substantive change through approved forward work. That includes the base's own operating model in Admin. Trivial fixes and the explicitly allowed profile auto-appends retain their narrower exceptions.

### Link notes together

Use descriptive, note-relative Markdown links, including in index notes. A destination with spaces can sit inside angle brackets. Existing wikilinks remain supported; use enough of the path to avoid ambiguity. Internal targets resolve in exact case. Missing or wrong-case targets normally warn, while a base that opts into strict link resolution makes those findings fail.

### End with a session digest when useful

DIGEST writes `-/_DIGESTS/<UTC timestamp> <Short Topic>.md`, with the timestamp in `YYYY-MM-DDTHHMMSSZ` form and the topic in Title Case. It carries `note_type: session-digest` and `retain_until: YYYY-MM-DD`, normally 30 days ahead. Its sections are Context, Decisions, Facts Learned, Related Work and Keywords.

The digest is a produced artefact rather than a Calendar record or a Streams work item. Extract useful knowledge or route it before discarding the digest, and retain the collection's `README.md` scaffold. A cross-repository handoff follows [trades](/docs/ways-of-working/trades/); DIGEST does not create a separate handoff format.

## How you use it

On fictional Tern Holm, Mara asks, "What did we establish about the northern nesting site?" The agent loads the ecology Pillar's memory, searches the notes and cites the dated observations behind its answer. A new survey supplies a missing fact, so Mara asks for a sourced enrichment of the existing nesting-site note rather than a competing summary.

The agent reads that note, drafts a merged update and follows the island's canonical-change route. Links connect the accepted account to its survey reference. At the end, Mara asks for a digest of the decisions and newly established facts; that output goes to `-/_DIGESTS/`.

## What it provides

You get answers you can trace, notes that grow without losing earlier context and links that make related knowledge discoverable. Digests preserve enough of a session to extract its value without making transcripts the island's normal memory.

## Boundaries

Search never provisions itself or widens access. A result label cannot establish the fidelity of an external source. Saving a note follows its destination's approval rules; selecting a folder grants no authority to change canonical knowledge. For a grounded account of unfinished session work and learning routes, use [recap and handover](/docs/knowledge/recap-and-handover/).
