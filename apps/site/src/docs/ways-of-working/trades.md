---
title: Trades
description: Exchange work or knowledge between repositories while each side keeps its own authority.
permalink: /docs/ways-of-working/trades/
order: 7
sources:
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/governance/ki-trades/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Trade governance and the separation of submission, receipt and receiver decision'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/governance/ki-trades/references/standards-trades.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Routes, record copies, local authority, observation policies and release'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/governance/ki-trade/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Operating one local side and handing receiver disposition to ki-next'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/governance/ki-trade/references/standards-trade-operations.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Local inspection, previews, receipt and cleanup procedure'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/tools-ki
    path: man/ki.1
    ref: v0.13.0
    governs: 'The Trades command surface at tools-ki v0.13.0'
    reviewed: '2026-10-25'
---

# Trades

A trade lets one repository make work or knowledge visible to another, while you keep submission, receipt and the receiver's decision separate and leave each repository in control of its own work.

{% figure "trade", "The sender prepares and freezes its record on a granted route. The receiver creates its own receipt and decides locally; only the selected observation permits sender release. Ownership never passes between repositories." %}

## What it is

A trade is a directional submission between repositories, classified as `work` or `knowledge`. `ki-trades` governs its routes, records and authority; `ki-trade` operates one repository's side. Neither transfers ownership, priority or the right to act in a peer repository.

A route is granted by the territory Capital's policy and distinguishes the sender, receiver and kind. Each repository declares participation and resolves the policy through its own Capital. A granted export permits sender-local preparation and submission; receipt needs an active route, with the peer registered unambiguously, participating and naming the same Capital. Seeing a checkout on disk establishes none of that authority.

## How it works

A record has one stable identity, such as `TRD-01234567`. The sender prepares it at `-/_TRADES/<receiver-owner>/<receiver-repository>/TRD-01234567.md`. Its context explains why it exists, its submission states the proposed outcome, and its constraints preserve authority, safety, dependencies and verification boundaries.

A committed preparation has `phase: preparing` and remains mutable. The receiver may inspect it silently, without receiving it or creating an acknowledgement. Submission changes the same record to `phase: submitted` and freezes the sender's envelope and payload. Git holds preparation history; there is no separate dialogue or revision log.

The receiver explicitly receives the submitted record into `+/_TRADES/<sender-owner>/<sender-repository>/TRD-01234567.md`, preserving the sender's content and adding only permitted local fields. Its copy has `phase: received`, starts at `decision_status: unconsidered` and records the committed sender reference when available. **Receipt proves delivery only.**

The receiver then uses `ki-next` for an exact human-confirmed disposition. It may consider the record, park it or request clarification. A work trade may be applied as one bounded local change or adopted into separately governed local work. A knowledge trade may be retained in a named canonical artefact. Either kind may be declined or superseded. Adoption does not complete the linked work, and receipt does not adopt it.

The sender chooses what it needs to observe before releasing its outbound copy:

- **`unattended`** requests no response, but still requires observable receipt.
- **`receipt`** waits for the receiver-created copy, without specifying whether a response was requested.
- **`decision`**, for work only, waits for a terminal receiver decision: applied, adopted, declined or superseded.
- **`completion`**, for work only, needs owner-valid completion evidence from the selected work adapter. The trade checker has no completion resolver and fails closed; adoption, a missing file or a claimed application does not prove completion. Decline or supersession can resolve the policy because no delivery remains due.

Parked and clarification decisions keep waiting beyond receipt. Release is an explicit sender-local removal after the policy is satisfied. The receiver can prune its own copy only after an eligible sender release is observable; premature disappearance grants no cleanup permission.

## How you use it

On fictional Tern Holm, Mara's harbour-data repository has a finding useful to Ivo's chart repository. She checks the knowledge route, prepares a self-contained record with its source and constraints, chooses receipt observation and commits it. Ivo can inspect that preparation without promising to use it. After submission, he receives the immutable record and decides whether to retain the finding in the chart repository's canonical knowledge.

Mara can release once the receipt policy is satisfied. Ivo retains his copy until that eligible release is visible. Throughout, Mara changes only the sender's records and Ivo changes only the receiver's records; the chart repository chooses its own work and knowledge.

At `v0.13.0`, `ki repo trade` provides route inspection, prepare, observe, submit, receive, list, show, release and prune operations. Select one registered repository for a mutation, inspect the exact local preview, and audit before and after it. Bulk receipt and eligible cleanup have explicit previews and confirmations. Batch receipt consists of independent attempts, so a later failure does not retract an earlier receipt. [Trades and acquisition](/docs/ki/trades-and-acquisition/) places that command group beside the other information workflows.

## What it provides

You get a durable, attributable exchange with separate evidence for what was sent, what arrived and what the receiver decided. The immutable sender content preserves the originating constraints while receiver-local reasoning records what the receiving repository actually chose.

The observation policy also gives cleanup a visible boundary. An outbound remains valid after becoming eligible until its sender explicitly releases it; neither side silently deletes the other's evidence.

## Boundaries

A trade grants no deadline, response guarantee, implementation, publication, acceptance or cross-repository write authority. Direct application is limited to a bounded, reversible, independently verifiable change with clear authority and an existing targeted check. A material design choice, dependency, migration or public-contract change enters separately prioritised local work under [roadmap lifecycle](/docs/ways-of-working/roadmap-lifecycle/).

Knowledge is retained in its owning canonical artefact; it does not use the direct-work application path. The source reference supplies provenance and never lifecycle authority. The tools inspect registered local evidence and operate locally; fetching, pushing and automatic execution are not implicit trade transport.
