---
title: Work design
description: Shape an undecided Project or model through independent reviews, owner decisions and a pilot.
permalink: /docs/ways-of-working/work-design/
order: 6
sources:
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/change-management/ki-work-design/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'When to use the design loop and where ordinary delivery takes over'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/change-management/ki-work-design/references/standards-work-design.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The five stages, review independence, artefact homes and piloted rollout'
    reviewed: '2026-10-25'
---

# Work design

When a new Project or shared model still has an undecided shape, you can test the proposal against independent reviews, record the owner's choices and try one pilot before committing to a wider rollout.

{% figure "work-design-loop", "A brief receives independent reviews before one report reaches the owner. The owner's decisions govern the pilot, whose lessons shape each wider wave." %}

## What it is

Work design is a five-stage loop for a subject whose shape is open and whose wrong choices would be costly to unwind. It can shape a new Project, a theme, a model shared by several repositories or an estate-wide migration before any finite work record exists. `ki-work-design` carries that loop from the owner's proposal to approved decisions and a rollout of ordinary work records.

The loop belongs to named work. A Project's design sits with that Project's work; a new Project or a concern that no Project holds yet sits with territory work. Its brief, reviews, report and decisions share a descriptive filename prefix in `+/_WORK/<id>/design/`. Each is committed as it is produced, so another session can resume from the first missing stage.

## How it works

1. **Brief.** The orchestrator records the problem, the owner's proposal in the owner's own words, established facts with their sources and a numbered reflection. Each reflection point is a claim a reviewer can agree with, differ from or extend.
2. **Independent reviews.** At least two reviewers, using different models or runtimes, form their views before reading another review. They work read-only, check the brief against its sources and mark Agree, Differ or Add against every numbered point. A difference needs evidence.
3. **Merged report.** The orchestrator settles disputes using cited evidence and governing standards. The report gives corrections, the proposed model, an agree-and-differ table, a rollout plan and a changes-after-review log. Unsettled choices go to the owner as tagged decisions with lettered options and a recommendation, normally no more than about eight.
4. **Owner decisions.** A decisions file keeps the owner's words verbatim against the report's tags. It quotes any authority grant, its completion target and its push and prune scope. The owner's words govern wherever they differ from the report.
5. **Piloted rollout.** `ki-next` captures the records the decisions call for and selects one pilot. The pilot is delivered before any parallel wave, and its lessons go into every wave's brief before it starts.

The report is a synthesis of evidence, not a vote. Review diversity tests the proposal from different positions; neither agreement between reviewers nor an orchestrator's preference decides for the owner.

## How you use it

On the fictional Tern Holm island, Mara wants a shared harbour-observation model for several repositories. She names the territory work that holds the design and supplies her proposal. An agent writes the brief, two independent reviewers test it, and the merged report makes the unresolved choices clear enough for Mara to decide.

Mara approves a model and a bounded pilot. The agent records her words, captures the pilot through `ki-next` and readies it through `ki-plan`. A pilot that exposes a missing boundary supplies a lesson for the next brief; it does not silently expand the grant. Later waves use `ki-batch` only within the approved envelope, and closure uses `ki-accept` only under the authority given.

The design stops if the proposal, owning work or work folder is missing, if fewer than two independent reviews exist, or if continuing would make a decision on the owner's behalf. A delivery record that still needs a choice returns that choice to the owner.

## What it provides

You get one traceable route from an idea to decisions that ordinary work can deliver. The reviews expose assumptions, the merged report separates evidence from choice, and the pilot tests the model before its cost spreads across repositories.

Design material is temporary. A note graduates when every decision it carries has a durable home in the Project note, standards, delivery records or a Decision Record where a decision changed. It is deleted in the same change, leaving Git history. By readiness, a work record quotes the context it needs; a durable Decision Record never depends on a design note that will disappear.

## Boundaries

Use [roadmap lifecycle](/docs/ways-of-working/roadmap-lifecycle/) when the goal and shape are already clear. Work design does not create the rollout records itself, choose on the owner's behalf or grant authority to push, prune, release or accept. A Decision Record is produced only when a decision changes, refining an existing record where one already owns the concern.

[Work packages](/docs/ways-of-working/work-packages/) owns the folder's shape and closed list; [coordination](/docs/ways-of-working/coordination/) governs its tidying at the mark. Design notes live in the work folder, never in a design folder under `Streams/`, and Project or theme notes do not link into that temporary home.
