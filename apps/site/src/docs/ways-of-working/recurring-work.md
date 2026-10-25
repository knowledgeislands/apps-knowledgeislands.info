---
title: Recurring work
description: Adopt a repeatable obligation, admit one occurrence and retain evidence of successful review.
permalink: /docs/ways-of-working/recurring-work/
order: 8
sources:
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/change-management/ki-work-recurring/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Recurring definitions, ordinary run records and lifecycle responsibilities'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/change-management/ki-work-recurring/references/standards-recurring-work.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Cadence, due-run reservation and approved successful-run evidence'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/repo-structure/ki-repo-kb-activities/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Activity notes, their index and the optional recurring profile'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/repo-structure/ki-repo-kb-activities/references/standards-activities.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Adopted behaviour, realisation, regular-work home and scheduler boundaries'
    reviewed: '2026-10-25'
---

# Recurring work

You can adopt work that repeats without keeping a second backlog: one repository-owned definition says when an occurrence is due, one ordinary record holds the run, and reviewed evidence establishes the next starting point.

{% figure "recurring-occurrence", "Adopt one definition, evaluate its schedule, reserve and deliver one run, retain its evidence, then review it. Approved closure updates successful-run evidence before the next evaluation." %}

## What it is

Recurring work is a durable instruction to create ordinary work when its cadence becomes due. The definition is not itself a roadmap item. `ki-work-recurring` owns its identity, scheduling inputs, single-run reservation and successful-run evidence; the usual lifecycle owns each finite occurrence.

A Project keeps definitions directly under `docs/housekeeping/`, each with a stable `<REPO>-HK-<NNN>` identifier and an identity-bearing filename. A Knowledge Base keeps one Activity note, normally under `Admin/Operations/Activities/`, indexed by `Activities.md`. `ki-repo-kb-activities` owns that note's identity, location, index and realisation type. A base may configure another collection path beneath itself.

An Activity records adopted behaviour: what it does, when it runs, why it was adopted and who adopted it. Its realisation may be manual, conversational, a skill, a scheduled task or a workflow. It joins the governed recurring-work lifecycle only when it carries a nested `housekeeping` profile. An externally scheduled Activity without that profile remains an ordinary Activity.

## How it works

1. **Adopt the definition.** Agree its purpose, procedure, capabilities, authority, cost and evidence destination. Include Goal, Procedure, Successful-run evidence and Obsolescence sections. A scheduler registration alone does not adopt or activate an obligation.
2. **Evaluate the schedule.** Active definitions are evaluated; paused definitions do not spawn. Calendar due is the last successful run plus cadence, and overdue adds grace. An optional commit threshold can make the work due from verified first-parent integration history. Due and overdue are calculated facts, not stored statuses.
3. **Reserve one run.** `ki-next` re-reads the definition and checks its reservation before creating one linked ordinary draft at the declared horizon. Creating the record and setting `active-run` are one coherent operation. An existing active run is reused or reported, never duplicated.
4. **Run and retain evidence.** The occurrence passes through planning, delivery and review under [roadmap lifecycle](/docs/ways-of-working/roadmap-lifecycle/). Durable outcomes go to the agreed repository-owned destination, where a person or another execution environment can use them.
5. **Review and reconcile.** Only approved closure through `ki-accept` marks the run done and updates the definition's evidenced completion date, reviewed revision where required and active-run link in one coherent commit. A failed or cancelled run never advances successful-run evidence.

The admission policy is `manual`, `when-due` or `when-overdue`. Manual admission needs exact confirmation even when due. A definition with no successful-run date is due immediately; it does not get a fresh grace window at every evaluation. A reached commit threshold bypasses calendar grace, but never manual confirmation, a paused definition or an existing reservation.

Commit evidence starts at the exact revision covered by the last successful review. A merge counts once on first-parent history. Missing or incomparable history leaves volume unknown; it never justifies inventing a baseline or using the current revision. An independently reached calendar boundary remains usable while that uncertainty is reported.

## How you use it

On fictional Tern Holm, Mara adopts a monthly harbour-catalogue review with a week's grace. Its Activity explains the checks, the time budget and where the review conclusions belong. She opts it into recurring work, leaving successful-run fields empty because no review has yet supplied that evidence.

When Mara admits the initial run, `ki-next` creates one draft and reserves it in the Activity. Another caller sees that reservation and reports the existing occurrence instead of creating a second review. Ivo delivers the planned assessment and records the evidence. Mara's approval lets `ki-accept` close it, enter the actual successful completion date and clear the reservation. The scheduled date stays with the run and is not substituted for the completion date.

For an Activity, the scheduling fields use snake_case inside `housekeeping`, while `id`, `title` and `status` stay at the top level. There is one definition and one status, with no copied template in Streams. Its run lives in `Streams/Roadmap/` and links to the definition's stable identifier.

## What it provides

You get a repeatable obligation whose procedure and evidence survive replacement of a scheduler, agent or machine. Every caller uses the same definition and reservation, and the next due calculation rests on what was successfully completed rather than on a launch or an optimistic timestamp.

Regular work is self-coordinating. An occurrence starts from its schedule or whoever needs it, without requiring a coordinating session, and the regular work rests on hold with more expected between occurrences. An Activity normally belongs to its territory's regular work; a recurring check needed only while a Project runs stays with that Project and names it explicitly. A theme labels the work rather than holding it.

## Boundaries

Schedule evaluation reads evidence and writes nothing. Admission permits a draft, not implementation or acceptance. Schedule activation, repairs, closure and pruning each retain their own authority requirements; no scheduler acquires an independent backlog or successful-run state.

A retired Activity retains its rationale and evidence with no active reservation and is excluded from scheduling. A Project template is explicitly deleted on retirement after its schedule and active run are disposed of. Conflicting or duplicate definitions block scheduling until approved reconciliation. Completed or cancelled run records stay until explicit selection for pruning; the definition keeps immutable evidence without depending on an unpruned run file.
