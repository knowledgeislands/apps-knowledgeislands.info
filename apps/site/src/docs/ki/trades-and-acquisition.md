---
title: Trades and acquisition
description: Inspect repository exchanges, preserve source material and search one Knowledge Base with ki v0.13.0.
permalink: /docs/ki/trades-and-acquisition/
order: 12
sources:
  - repository: knowledgeislands/tools-ki
    path: man/ki.1
    ref: v0.13.0
    governs: 'Trade, acquisition and Knowledge Base search command groups'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/tools-ki
    path: docs/guides/user/standing-knowledge-intake.md
    ref: v0.13.0
    governs: 'Capital-granted standing intake and receiver-local provenance'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/tools-ki
    path: docs/guides/user/granola-acquisition.md
    ref: v0.13.0
    governs: 'Capture-based import, explicit refresh, image evidence and confirmed marking'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/tools-ki
    path: docs/guides/user/chatgpt-capture.md
    ref: v0.13.0
    governs: 'The local-only ChatGPT capture adapter'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/tools-ki
    path: docs/guides/user/kb-search.md
    ref: v0.13.0
    governs: 'Explicit search assignment, indexing, retrieval modes and scoped citations'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/governance/ki-trades/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The current hold on new submissions and continued support for existing trades'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/governance/ki-trade/references/standards-trade-operations.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Each repository owning its own receipt, observation and release actions'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/acquire/ki-acquire/references/standards-acquisition.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Faithful capture, explicit omissions and separate dispatch and retirement authority'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/repo-structure/ki-repo-kb/references/standards-search.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Derived search boundaries and original notes remaining authoritative'
    reviewed: '2026-10-25'
---

# Trades and acquisition

You can inspect an exchange between islands, preserve an authorised source capture and retrieve evidence from one Knowledge Base. Each route keeps the receiver's authority explicit, so receiving information never silently becomes approval to act on it.

## What it is

A trade is a directional exchange of work or knowledge between registered repositories. `ki-trades` governs it and `ki-trade` operates one repository's side. New trade submissions are currently on hold under the pinned harness. Existing records remain supported for receipt, decisions, observation and release.

Acquisition preserves selected source material as a capture package. `ki-acquire` governs its scope, fidelity and omissions; `ki acquire` runs enabled adapters. Knowledge Base search serves a third need: finding evidence already held in local notes, using a rebuildable index governed by `ki-repo-kb`.

[Trades](/docs/ways-of-working/trades/), [acquiring knowledge](/docs/knowledge/acquiring-knowledge/) and [querying, saving and updating](/docs/knowledge/query-save-update/) explain the practices these commands support.

## How it works

Trade routes and standing grants come from the territory Capital's policy. Sender and receiver each write only their own repository. A submitted record is immutable; receipt creates a receiver-owned copy initially marked unconsidered. The receiver's decision remains separate from delivery. Release depends on the sender's observation policy, and receiver pruning depends on observable sender release.

The inventory retains `prepare`, `submit` and `abandon` for the preparation lifecycle, but their presence does not lift the current hold. Standing knowledge intake likewise needs an active Capital grant and commit-pinned source evidence; it gives no general peer-write authority.

Acquisition adapters are published by installed harness skills and enabled by repository declarations. ChatGPT consumes a user-prepared local directory. Granola reads a configured connection and routes meeting captures by the receiver's declared selectors. At this release, the committed capture and Git history are the record: import does not maintain a separate ledger, checkpoint or journal.

Search requires an explicitly registered KB with its own assigned trust boundary and independently provisioned qmd engine. `index` builds a derived generation; `search` validates candidates against current local source content before exposing bounded results; `status` reports the configured mapping and endpoint reachability.

## How you use it

For the fictional Lantern island, inspect the current exchange context from its checkout:

```bash
ki repo trade policy show
ki repo trade routes list
ki repo trade list
```

Use `show <trade-id>` to inspect an existing record. In the receiver, `receive <trade-id>` creates its local inbound copy through the command's confirmation flow; it does not adopt the work. Use `observe <trade-id>` to inspect a sender's committed preparation without writing into that sender. Any existing record's decision and eventual cleanup must follow its declared authority and observation policy.

For acquisition, inspect the receiving island's adapters first:

```bash
ki acquire list
ki acquire import --adapter granola --since 2026-10-01 --until 2026-10-25 --dry-run
```

Review the selected scope and routing before repeating without `--dry-run`. Existing Granola captures are found by meeting UUID and kept. An explicit `--refresh` rereads and updates the existing capture in place; `--refresh-acquired` also includes meetings already carrying the Acquired marker. Missing provider transcripts do not erase retained transcripts.

When original screenshots are exported from the desktop app, `ki acquire images` verifies the source UUID, exact image count and bytes against the existing capture and writes a checksum manifest. `ki acquire mark` previews a separate additive Acquired-folder marker; `--confirm` permits that mutation only after committed capture evidence passes its checks. Import never marks implicitly, and a marker grants no deletion clearance.

For a ChatGPT export, assemble the [local-capture format](/docs/ki/chatgpt-local-capture/) and validate it before creating a package:

```bash
ki acquire import --adapter chatgpt --capture ./capture --output ./conversation.kep --dry-run
```

For an already provisioned Lantern KB, use its actual stable registry key:

```bash
ki kb status --kb lantern
ki kb search 'harbour maintenance' --kb lantern --mode query --limit 5
ki kb search 'LANTERN-SITE-001' --kb lantern --mode search
```

`query` is hybrid retrieval, `search` is lexical and `vsearch` uses vectors. Narrow by zone or path prefix when useful. Read the cited source ranges before relying on a result, and rebuild with `ki kb index --kb lantern` after changing the notes or declared scope.

## What it provides

Trades preserve the independent facts of submission, receipt and decision. Acquisition preserves selected source material with provenance, originals where required and explicit coverage gaps. Search supplies bounded current-note citations that help you answer a question without treating an index as the knowledge authority.

## Boundaries

A trade grants no implementation, priority or publication authority in its receiver. Capture does not evaluate or harvest knowledge, reconcile the receiver, or authorise source retirement. The capture package stays the acquisition record when the receiver adds its own distinguishable triage or moves it to its durable destination.

Search does not install qmd, start a daemon, download models or silently fall back to another search method. A reachable endpoint does not attest which index it serves. Stale mappings, unavailable dependencies and mismatched source evidence fail visibly; a successful bounded result never claims exhaustive coverage. [Every ki command](/docs/ki/commands/) publishes the release's complete invocation forms.
