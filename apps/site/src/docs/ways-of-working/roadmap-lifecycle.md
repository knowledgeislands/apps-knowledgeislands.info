---
title: Roadmap lifecycle
description: How a work record moves from triage through draft, ready, in progress and awaiting review to done, which skill owns each move, and how horizons, holds and batches fit around it.
permalink: /docs/ways-of-working/roadmap-lifecycle/
order: 5
sources:
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/change-management/ki-work/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The adapter declaration and the shared lifecycle vocabulary'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/change-management/ki-work-roadmap/references/standards-repository-roadmaps.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Statuses, horizons, triage, the lifecycle moves and the commit boundaries'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/change-management/ki-next/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Capture, adoption, selection, deferral, hold and release'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/change-management/ki-plan/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Shaping a draft to ready'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/change-management/ki-implement/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Delivery from ready through in progress to awaiting review'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/change-management/ki-accept/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Closure, cancellation and pruning'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/change-management/ki-batch/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The batch envelope over an exact set of ready records'
    reviewed: '2026-10-25'
---

# Roadmap lifecycle

Every work record moves through the same seven statuses under four skills, so you can read any record's status and horizon and know what has happened to it, what may happen next and who is allowed to make that move.

{% figure "record-lifecycle", "A record passes from triage through draft, ready, in progress and awaiting review to done; hold and cancelled sit beside the path, and a terminal record is pruned by its own commit." %}

## What it is

A work record is one finite piece of forward work: a Markdown file in a repository's roadmap, or the equivalent record in a Knowledge Base's Streams. Its lifecycle is the shared vocabulary every KI repository uses to say how far a piece of work has got and when it is intended, whichever tracker holds it. The repository declares one work adapter in its configuration, local roadmap by default for a Project repository and Streams for a Knowledge Base, and that adapter owns where records live and how they are named. Four process skills own the moves between states, and no other skill closes or deletes a record.

The vocabulary has two independent axes. `status` says how far the work has got and is one of `triage`, `draft`, `ready`, `in-progress`, `awaiting-review`, `done` or `cancelled`. `horizon` says when it is intended and is one of `now`, `next`, `soon`, `future` or `hold`. The horizon rule is one line: a record carries a horizon if and only if it is adopted and open. A triage record, a done record and a cancelled record have none.

## How it works

Work enters as `triage`: a substantive outcome, concern or decision captured without prior approval, but only within a capture gate. Only a blocker, a defect seen failing or an item the owner asked for is captured, by the owning coordinator, never by a background run. Creating a triage record adopts nothing. Every exit from triage needs a person's explicit approval: adoption to `draft` with a horizon and a kind, or cancellation.

| Status | Allowed horizon | Meaning |
| --- | --- | --- |
| `triage` | none | captured but not adopted |
| `draft` | `now`, `next`, `soon`, `future`, `hold` | adopted, being shaped or waiting its turn |
| `ready` | `now`, `next`, `hold` | plan and verification reviewable, approved to start |
| `in-progress`, `awaiting-review` | `now`, `hold` | being delivered, or delivered and awaiting review |
| `done`, `cancelled` | none | terminal, kept as history until pruned |

Each move has one owner. `ki-next` adopts, defers, holds and releases: a defer changes the horizon and keeps the status, so ready work moves only among now, next and hold, and work in flight leaves now only for hold. A hold names its reason, a release condition and a review date, and keeps the record's status, baseline and completed steps. `ki-plan` shapes a now or next draft until it is `ready`, and a replan takes a ready record back to draft. `ki-implement` starts: `ready` to `in-progress`, moving the record to now in the same change, then delivers the approved plan from an immutable baseline, assembles the six-heading review packet and leaves the record at `awaiting-review`. `ki-accept` closes: `awaiting-review` to `done` with the horizon removed, a failed review back to `in-progress`, or any open record to `cancelled` with an approved resolution. Only `ki-accept` prunes, and only a record already committed as done or cancelled, in a commit of its own with the subject `chore(roadmap): prune <N> done work record(s)`.

Git need not hold every intermediate state. A record may first land already `ready` when capture, shaping and approval form one unit, and the move to in progress is operational and needs no commit of its own. What must land is the terminal state, before any prune.

When nothing is immediately eligible, selection reads now and next first, then soon, then future. Held records are left out until released, and triage is never selected without adoption. Within one horizon, priority orders records, then the nearer target date, then size, smallest first, and a high priority at a later horizon never overtakes an earlier one.

## How you use it

Suppose the fictional Tern Holm archive repository keeps its roadmap locally. Mara notices during a run that the ferry timetable import fails on a leap day; it is a defect seen failing, so the coordinator captures it as a triage record. The owner reads it the next morning and adopts it to `draft` at `next`. When it is selected, `ki-plan` adds the execution sections, states the verification and, once the owner approves, marks it `ready`. A background run under `ki-implement` records the baseline, moves it to `in-progress` at `now`, delivers the fix, runs the checks, writes the review packet and leaves it at `awaiting-review`. The owner's acceptance, given in the coordination thread, lets `ki-accept` record `done` and remove the horizon. A later prune commit removes the file, and Git keeps it.

A set of ready records that share a bounded delivery advantage and stay independently executable may be run as a batch. `ki-batch` is an authority envelope, not another plan: one repository, one window, an exact human-approved set, with each record keeping its own baseline, delivery and review packet, and closure granted only when the authorisation names it. An item outside the envelope is parked, never admitted dynamically.

## What it provides

You get one lifecycle that reads the same in every repository and Knowledge Base you work in, so a status and horizon mean one thing everywhere. Because every move has one owner and every exit from triage, every start and every closure needs a person's approval, nothing is adopted, started, accepted or deleted by an agent on its own. Terminal records stay as history until a prune commit removes them, and that commit is recognisable in the log.

## Boundaries

The lifecycle governs the record, not the work around it. Coordinating the sessions and runs that move a record is [coordination](/docs/ways-of-working/coordination/) and [background runs](/docs/ways-of-working/background-runs/); the folder where a Project's state and queries live is [work packages](/docs/ways-of-working/work-packages/); the states a piece of work passes between a worker and a supervisor are [the work model](/docs/ways-of-working/the-work-model/) and are not these statuses. A handoff to another repository is one line in that work's message queue, never a record written into its roadmap. Durable rationale that outlives a record belongs in a decision record, and continuous practice belongs in a standard, not among finite work items.
