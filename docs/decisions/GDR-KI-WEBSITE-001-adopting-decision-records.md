---
id: GDR-KI-WEBSITE-001
title: 'Adopting Decision Records'
date: 2026-07-18
status: current
decision_type: governance
decision_type_url: https://knowledgeislands.info/specifications/decision-records/gdr
---

# GDR-KI-WEBSITE-001: Adopting Decision Records

## Context

Knowledge Islands repositories make durable decisions about knowledge, governance, specifications, architecture, tooling, publication, and operations. Without a common record, later contributors and agent sessions must reconstruct the reasoning from implementation details or transient working material.

## Decision

Knowledge Islands repositories adopt Decision Records (DRs) as the canonical instrument for significant standalone decisions. A DR uses the Nygard structure: Context, Decision, Consequences, and optional References. Its prefix identifies the decision type, its scope identifies the repository or domain, and its serial is monotonically increasing per prefix within that scope.

A DR is a living present-state record. When a decision changes, its record is updated in place so it remains true now; git holds the history. KB repositories place records in `Admin/Governance/Decisions/`, while non-KB repositories place them in `docs/decisions/`. Every collection has an index in reveal order.

## Consequences

- Significant decisions remain searchable, reviewable, and available to humans and agents across context resets.
- Routine implementation details remain in commits and ordinary documentation; not every change warrants a DR.
- A repository adopting Decision Records declares `[skills.ki-decision-records]` in `.ki.toml` and carries GDR001 as its first governance decision.
- The four primary ecosystem repositories keep GDR001 consistent in substance while using their own repository scope in the record identifier.
