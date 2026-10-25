---
title: Decision records
description: Keep significant choices as typed, self-contained records of current rationale and consequences.
permalink: /docs/standards/decision-records/
order: 2
sources:
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/governance/ki-decision-records/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Record ownership, typed prefixes, living records and placement'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/governance/ki-decision-records/references/standards-decision-records.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Record format, naming, index, dependency graph and present-state writing'
    reviewed: '2026-10-25'
---

# Decision records

You can preserve a significant choice so another reader understands the current decision, the forces behind it and its consequences without reconstructing a conversation or following a chain of historical records.

{% figure "decision-to-record", "A logged decision becomes a durable record only when its independent rationale warrants one; an existing record is amended when it already owns the concern." %}

## What it is

A Decision Record keeps the rationale for one significant, independently reconsiderable choice. It is a concise, self-contained account of the decision as it stands now, usually around 200 to 500 words. A conversation or work package can log many decisions; only those with standalone durable value need their own record.

The type says what kind of choice it is. Strategy uses `SDR`, product `PDR`, architecture `ADR`, data `DDR`, security `XDR`, operations `ODR`, governance `GDR`, research `RDR` and knowledge `KDR`. These are types of one instrument, rather than separate record systems.

## How it works

Before creating a record, find whether one already owns the concern. Refine or change that record in place when it does. Create a new one when the decision is genuinely independent. An architecture choice about where a service runs and a governance choice about who can approve publication may therefore deserve separate records.

The filename is `<ID>-<title-slug>.md`. Its ID combines the type prefix, the repository's declared `repo_code` scope and a serial of at least three digits. A sub-domain may extend the scope. Serials begin at `001` and remain contiguous within each prefix and scope; different types can each have a `001`.

Frontmatter carries `id`, `title`, `date`, maintenance `status`, `decision_type` and its canonical `decision_type_url`. The H1 repeats the ID and title. Three sections carry the argument:

- **Context** states the current forces neutrally.
- **Decision** states the adopted response in active voice.
- **Consequences** states the resulting benefits, trade-offs and constraints.

Optional References contain followable links to earlier sibling records or canonical external sources. The body names other internal artefacts where needed and remains understandable without following links. An optional `decision_depends_on` list makes logical dependencies explicit; the graph must be acyclic and dependencies appear before dependants.

Records live in `docs/decisions/` for Projects and `Admin/Governance/Decisions/` for Knowledge Bases. The collection's README or `Decisions.md` indexes every record in reveal order, beginning with the governance decision adopting the instrument. Foundations precede decisions built on them, and each prefix's serials ascend.

## How you use it

Mara and Ivo, maintaining the fictional Tern Holm island, settle that published surveys use a reviewed observation set. They log the decision during their work, then ask whether the rationale must survive the work package. Because it controls later publication choices, it warrants a governance record.

They first check for an existing record about publication authority. If it owns this concern, they update it. Otherwise they select the governance type, allocate the next serial in their repository's scope, write Context, Decision and Consequences, then review the result with the decision owner. They add its index entry where a reader first needs the concept and run the decision-record audit.

When policy changes, they rewrite the live record to state the consolidated current choice. Git retains earlier wording. The record itself gains no changelog, rejected-options narrative or supersession chain.

## What it provides

You get durable rationale with a recognisable type, stable ownership and an intelligible reading order. The record explains why a choice governs current work, while its consequences expose the constraints the next decision must respect.

## Boundaries

A record does not turn an undecided option into authority. Owner review settles the choice. [Specifications and guides](/docs/standards/writing/) hold accepted behaviour and operating instructions; the [roadmap lifecycle](/docs/ways-of-working/roadmap-lifecycle/) holds delivery still to do. Keep those concerns out of the record, and cite a decision owned elsewhere at its canonical source rather than copying it into this repository's scope.
