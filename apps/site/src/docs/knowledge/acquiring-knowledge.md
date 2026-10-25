---
title: Acquiring knowledge
description: Preserve selected sessions, conversations, meetings and public signals with honest coverage.
permalink: /docs/knowledge/acquiring-knowledge/
order: 3
sources:
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/acquire/ki-acquire/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Source-independent acquisition ownership and provider boundaries'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/acquire/ki-acquire/references/standards-acquisition.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Scope, preservation, verification, dispatch and receiver-local knowledge dispositions'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/acquire/ki-acquire/references/standards-agent-session-acquisition.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Exception-based selection of agent sessions and faithful source coverage'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/acquire/ki-acquire-chatgpt/references/standards-chatgpt-acquisition.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Readable ChatGPT captures, end points, linked segments and read-only acquisition'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/acquire/ki-acquire-granola/references/standards-granola-acquisition.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Owned Granola notes, complete enumeration, UUID identity, attachments and separate marking'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/acquire/ki-pulse/references/standards-pulse.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Bounded public signals, evidence, dispositions and destination-owned handoffs'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/tools-ki
    path: man/ki.1
    ref: v0.13.0
    governs: 'Acquisition command group, adapter discovery, import, images and confirmed marking'
    reviewed: '2026-10-25'
---

# Acquiring knowledge

You can preserve a selected conversation, meeting or public signal with its source and limits visible, then let the receiving island decide what to retain, harvest or turn into work.

{% figure "acquisition-flow", "Selected sessions and conversations become verified capture packages through their source routes. Pulse signals use a separate authorised handoff; each island owns adoption." %}

## What it is

Acquisition faithfully preserves an authorised source scope. The capture package is its only record, with Git keeping earlier bytes. Evaluation, dispatch and source retirement are separate operations. `ki-acquire` governs the common contract, provider skills govern source completeness, and `ki acquire` executes supported adapters.

Ordinary learning moves forward through durable notes and repository guidance. Importing a full agent session is an exception for a named evidence need selected by the owner or authorised receiving work. A Pulse is another route into knowledge: one bounded inspection of a submitted source or current public developments, whose results remain transient unless a handoff is authorised.

## How it works

Establish the source, selected scope, receiver, required coverage and originals before capture. Find an existing capture by source identity before writing. Preserve source statements, uncertainty and corrections separately from interpretation, then read the destination back and compare text or byte hashes. A digest, a partial source and a complete export make different coverage claims. Unknown dates and identifiers stay unknown.

- **Agent sessions.** Select exact Claude or Codex sessions from one physical repository, including any required descendants and material assets. Use a proven read-only source route and keep missing coverage explicit. A preview cannot establish full-session capture, and no unproven importer is implied.
- **ChatGPT.** Capture readable conversation text or an official export kept outside Git. The executable bridge imports one user-prepared local capture. A digest records its inclusive last substantive message in README frontmatter, using an evidenced message ID, timestamp or distinctive exact excerpt. Later substantive knowledge becomes a dated linked segment; a requested full-thread snapshot is a new linked capture. Opaque store records and interface titles are not conversation content.
- **Granola.** Import the connected principal's own meeting notes through the official read-only MCP route. Reconciled date windows and folder sets establish coverage; UUIDs establish identity and folder IDs supply routing evidence. Preserve notes, the complete returned transcript and screenshots with byte checksums, and state omissions. Existing captures stay in place unless explicitly refreshed. Acquired-folder members are skipped unless `--refresh-acquired` is selected; that skip proves membership alone.
- **Pulse.** Capture one submitted source or scan an invocation-scoped interest or query. A scan considers at most ten leads and returns at most five cited observations. Triage gives each exactly one disposition: Read / learn, Watch, Act or Discard. Actionable technical or governance claims need primary-source evidence. Pulse keeps no standing inbox, subscription or log.

### Arrival and adoption

Dispatch moves a whole capture package, or a chosen roll-up of packages, into the receiver's `+/_ACQUIRED/`. The Git move is the record. The receiver files, parks or turns it into work locally, preserving original material and adding no return marker to the acquisition port.

For an acquired AI session, receiver-local knowledge triage is recorded in the package's existing README or capture document. Its dispositions are Harvested, Retained as source evidence, Routed onward and No residual knowledge. They name the scope reviewed, destination evidence and any remainder. Filing alone does not prove harvesting; a partial session cannot be declared fully triaged.

Pulse signals follow their destination owner's route instead: a reading candidate may go to a selected Knowledge Base, an action to the owning standard or work queue, and a watch condition to an existing record. If the destination is unavailable or unconfirmed, the signal stays transient.

## How you use it

On fictional Tern Holm, Mara needs the evidence behind a disputed survey method. She selects one meeting and names the island that should receive it. The capture preserves the returned notes, transcript, screenshot bytes and omissions; an unresolved folder route remains visible for her choice. The receiver then links the method knowledge it harvests from that package.

Use `ki acquire list` to see available adapters, activation guidance and executable status. Preview the selected Granola scope with `ki acquire import --adapter granola --since 2026-10-01 --until 2026-10-25 --dry-run`. A prepared ChatGPT capture uses `ki acquire import --adapter chatgpt --capture <path> --output <path>`. [Trades and acquisition commands](/docs/ki/trades-and-acquisition/) explains these command surfaces at `v0.13.0`.

`ki acquire images` verifies separately exported Granola originals against the capture. `ki acquire mark` previews a separate additive Acquired-folder marker; `--confirm` permits it only after committed capture evidence passes the required checks. Import never marks implicitly.

## What it provides

You get preserved evidence whose coverage can be checked, retries that respect source identity and a clear distinction between receiving material and adopting knowledge. Honest gaps remain visible instead of being mistaken for an empty source or a complete capture.

## Boundaries

Capture authorises no provider mutation, canonical adoption, source deletion or history compaction. ChatGPT acquisition is read-only; Granola marking preserves existing folder memberships and grants no retirement permission. Source retirement needs its own current approval. A Pulse disposition grants no implementation or destination-write authority. [Saving and updating](/docs/knowledge/query-save-update/) follows the island's canonical-change rules.
