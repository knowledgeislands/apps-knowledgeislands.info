---
title: Plan and deliver governed work
description: Turn a deep audit or transferred concern into implementation-ready, governed roadmap work.
permalink: /docs/ways-of-working/roadmap-lifecycle/
order: 5
sources:
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/README.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The ki-work, ki-plan, ki-implement, and ki-accept responsibilities the request template routes through'
    reviewed: '2026-10-25'
---

# Plan and deliver governed work

The reusable pattern is a "deep audit to implementation-ready roadmap" request. It does not depend on legal work, Knowledge Islands, Streams, or even a software repository.

This is a reusable request template, not a competing planning standard. `ki-work` selects the configured work-tracking adapter; `ki-work-roadmap` owns repository-roadmap and work-item structure when Roadmap is selected. `ki-plan` owns planning through `Ready`; `ki-implement` owns delivery through `Acceptance`; `ki-accept` owns closure and confirmed pruning; and `ki-delegation` owns delegation-ready execution.

## Live work lifecycle

The process skills form three explicit cycles from a live session into governed delivery:

```text
Roadmap cycle
ki-recap → ki-next → ki-plan → Ready

Implementation cycle
ki-implement → In progress → verified Acceptance

Acceptance cycle
ki-accept → Done → confirmed prune when requested
```

The arrows show responsibility passing between processes. With the Roadmap adapter selected, `ki-work-roadmap` is the governance foundation for horizons, work-item shape, links, and transition rules; it is not an execution stage. With the Streams adapter selected for a Knowledge Base, `ki-repo-kb-streams` supplies the equivalent lifecycle.

`ki-plan` stops at `Ready`. `ki-implement` requires an approved ready item, records its immutable baseline, executes only its bounded plan, assembles verification evidence, moves it to `Acceptance`, and stops. `ki-accept` requires human approval by default before moving it to `Done`; pruning is a separate exact confirmation.

## Authorised batches

`ki-batch` applies the same boundaries to an explicitly named set in two phases:

1. **Preparation** coordinates `ki-next` selection and `ki-plan` shaping over the named candidates, producing a reviewed batch authorisation. No implementation begins.
2. **Implementation** validates that authorisation and coordinates repeated independent `ki-implement` cycles in dependency order.

Every item keeps its own baseline, lifecycle, verification, and acceptance packet. Ambiguous or out-of-authority work is parked and recorded rather than inferred. The normal batch endpoint is `Acceptance`; `ki-accept` remains the closure owner unless the authorisation expressly grants acceptance authority for named items. Pruning always remains separately confirmed.

`ki-trade` receives typed cross-repository submissions into `+/_TRADES/`. `ki-next` considers those records while grounding the portfolio and brings submitted trades to the receiver for disposition before ordinary work selection. Parked trades return for review when their trigger fires.

Adoption creates a recipient-owned work item at its honest horizon. Where transferred detail should be preserved, enrich that same item and name its origin without promoting it into the immediate queue. The inbox copy is then removed; the sender may remove its corresponding outbound copy once the durable destination is confirmed. Agent or model-tier delegation is a separate concern recorded in the item's `## Delegation` section and executed through `ki-delegation`.

## Generic principles

- Inspect the existing system thoroughly before proposing changes.
- Define an explicit scope and exclusions.
- Separate planning from implementation: change only the planning artefacts.
- Identify what already works and should be preserved.
- Find duplication, conflicting ownership, stale state, unclear status, and missing structure.
- Establish a target operating model with clear responsibilities and sources of truth.
- Record reasoning and rejected alternatives so implementers do not reopen settled decisions.
- Separate judgment-heavy decisions from mechanical execution.
- Decompose the migration into dependency-ordered, bounded plans.
- Make each plan executable by a cold, lower-reasoning agent.
- Include exact inputs, outputs, boundaries, escalation conditions, and pass/fail checks.
- Preserve existing information until a conservation or migration manifest proves nothing will be lost.
- Test the plans by giving them to someone without the original context.
- Continue around non-blocking uncertainty; record unresolved areas as explicit follow-up work.
- For long work, write regular checkpoints and create recoverable commits where appropriate.

## Reusable prompt

```text
I want a deep, planning-only audit of [topic, system, repository, process, or body of work].

The priority scope is:

- [area one]
- [area two]
- [shared or cross-cutting areas]

The following is out of scope:

- [exclusions]

Start by examining the current structure, conventions, documentation, workflows, status information, and active work. Spend enough time scanning to understand how the system actually operates, including places where practice differs from the documented model.

Do not implement the proposed changes. You may create or update only the dedicated planning footprint at [location or output format].

Before the main audit, raise any genuinely important questions or permission requirements. After that, work autonomously. If something cannot be resolved, continue with the parts that can be completed and record the unresolved area, its impact, and the follow-up needed.

Produce:

1. A proposal explaining:
   - what is working well and should be preserved;
   - what is unclear, duplicated, stale, overloaded, or missing;
   - the underlying causes rather than only the symptoms;
   - the recommended target model;
   - clear ownership and source-of-truth boundaries;
   - rejected alternatives and why they were rejected;
   - risks, safeguards, and migration principles;
   - measurable acceptance criteria.

2. A dependency-ordered roadmap showing:
   - foundational decisions and governance first;
   - work that can run concurrently;
   - migration and consolidation stages;
   - integration, cutover, and final acceptance;
   - anything deliberately deferred or out of scope.

3. A set of implementation-ready plans suitable for cold, lower-reasoning agents.

Each plan must state:

- the outcome and definition of done;
- dependencies and blockers;
- locked decisions that must not be reopened;
- questions that must be escalated;
- exact permitted inputs, outputs, and change boundaries;
- ordered implementation steps;
- which steps are judgment-heavy and which are mechanical;
- safe parallelisation and file or ownership boundaries;
- conservation or rollback safeguards;
- objective pass/fail verification;
- the handoff package for the next plan.

Do not let implementers infer unknown state, silently expand scope, or discard existing information. Unknowns must be verified, escalated, or explicitly preserved.

Test at least the foundation plans by giving them to a cold lower-tier reviewer with no inherited context. Revise them until that reviewer can execute them without rediscovering the architecture.

For a long-running filesystem task, write progress to the planning artefacts regularly and make stable, explicitly scoped checkpoint commits where authorised. Do not include unrelated changes.
```

A useful short name for this style of request is **planning-only architecture audit with cold-agent implementation handoffs**.
