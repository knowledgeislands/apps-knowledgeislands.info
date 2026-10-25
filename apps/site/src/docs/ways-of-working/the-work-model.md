---
title: The work model
description: The unit is work, not conversation. Supervisor and worker, the seven states, the two moves and the mark.
order: 1
permalink: /docs/ways-of-working/the-work-model/
sources:
  - repository: knowledgeislands/ki-principal
    path: Pillars/Philosophy/Model/Processes/Work Process/Work Process.md
    ref: c070f022217b1aefb09df718855210260b43e664
    governs: 'The unit of work, the two roles, the holder, the seven states, the two moves, the words and the homes'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/change-management/ki-coordination/references/standards-coordination.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'States and moves, the mark, the heartbeat and the five views as the coordinator applies them'
    reviewed: '2026-10-25'
---

# The work model

Knowledge Islands treats a piece of work, not a chat session, as the thing that moves, so you can tell at any moment who holds each piece of work, what move it is waiting for and where its state is written down.

{% figure "work-model", "The work lives in its package and its Git history; the supervisor and worker pass it between them with send and receive." %}

## What it is

The unit is work. A piece of work is packaged the way a skill is: a short definition saying what it is, what its goals are and what it takes, read first, and detail files for its state, its queries, its incoming messages and its own decisions, read only when needed. A chat session is only a channel through which a party works on it. The work outlives every session and is committed at every send.

Work comes in levels and forms. Territory work is the State of play for a territory, the hub that coordinates the rest. Regular work is recurring and self-coordinating. Project work is finite and coordinated in its own thread. A work item is one record, executed by a run or a person. A theme is a label a piece of work can carry; it holds no work of its own. Every piece of work above a work item has a work package, described on [work packages](/docs/ways-of-working/work-packages/).

Two roles stand either side of a handoff: the worker and the supervisor. The roles are relative. For territory work and Project work the coordinating agent is the worker and the owner is the supervisor. For a run, the coordinating agent is the supervisor and the run is the worker. A coordinator is therefore a worker to the owner and a supervisor to its runs at the same time. The holder is the party the work lies with now, derived from the state and the two roles.

## How it works

{% figure "seven-states", "The seven states: two with someone, three handed off, On hold and Finished. Only the supervisor's receive and the hold are set; the rest is derived." %}

There are four kinds of state: the work is with someone, it has been handed off, it is on hold, or it is done. The seven states take those kinds and the role words:

| Kind | State | When |
| --- | --- | --- |
| with someone | With worker | any item with a run, or the coordinator mid-turn |
| with someone | With supervisor | the supervisor has received it |
| handed off | Handoff to supervisor | the worker has sent, and the supervisor has not received |
| handed off | Handoff to worker | the supervisor has replied, and no session has yet received it |
| handed off | Handoff to `<target>` | sent to other work, a run or a person |
| on hold | On hold, paused or more expected | agreed and drained: nothing running, queued or in handoff |
| done | Finished | closed |

Only the supervisor's receive and the hold are set; every other state is derived from where the work's items lie.

There are two moves, and only the holder may make either. To send puts the work into a handoff to its target. To receive takes it out of the handoff and makes it yours. The supervisor receives with any of the words `with me`, `ack`, `got it` or `seen`. A message mid-run is a steer and moves nothing.

On hold sits between with someone and Finished: the work is not moving, nobody owes a move, and it is not over. It has two reasons. Paused means the work waits while other work goes on, with a named release condition. More expected means the work is done for now, and new work arriving releases it; regular work rests here between occurrences, and a Project may rest here between waves. A hold is agreed only by the supervisor, who says `pause` or `done for now`; the worker may propose one in its send. The worker then drains, letting a run that will finish within about a quarter of an hour finish, stopping anything else at a safe point and launching nothing new. Drain is an activity on the way into On hold, never a state. The supervisor's moves off hold and to Finished are `resume` and `finish`.

The mark is the point at which decisions are struck and the working area tidied. The move into On hold is a mark: every repository the work touched is committed and pushed fast-forward, and each open query is parked in the queries file with its tag, one line of context and its recommended option.

A heartbeat runs only while work lies with a worker: an update on change, at least every five minutes and always within ten. A worker's item that has neither moved nor beaten within ten minutes is stuck; nobody sets stuck. Work with the supervisor is never stuck, only older, so the owner's view lists it oldest first. On hold has no heartbeat, and a paused hold older than a month is flagged.

## How you use it

Suppose Imre coordinates Project work on the fictional Tern Holm island. Imre's session is the worker; the owner is the supervisor. When the session finishes a unit of work it sends: the state file records Handoff to supervisor, the report is written, and the commit carries the move in its subject. The owner reads the report and replies `with me`, so the work is With supervisor, and then answers the queries. That reply is a send back, so the work sits in Handoff to worker until Imre's next session receives it and continues.

When the owner says `done for now`, Imre drains, strikes the mark, parks the open queries and moves the work to On hold, more expected. The next message to arrive releases it. Reading the territory's five views, with you, stuck, blocked, moving and on hold, tells the owner where every piece of work lies without opening a transcript.

A work item carries the same machine one level down. Its record already has a status and a horizon, so With worker is `in-progress` with horizon `now`, Handoff to supervisor is `awaiting-review`, Handoff to worker is `ready`, and a handoff to a target is a dependency on an open record or a hold with a `waiting-for` reason. Those records are described under [roadmap lifecycle](/docs/ways-of-working/roadmap-lifecycle/).

## What it provides

You get one vocabulary for every level of work, from a territory down to a single record, and one answer to the question "whose move is it?" that does not depend on remembering a conversation. Because the work is committed at every send and its state is derived rather than typed, two sessions on two machines read the same answer, and the owner's view shows what waits on them, what is stuck and what is on hold.

Git is the logbook. The history of a work folder is the history of the work; move commits carry the move in their subjects, and the recap since the mark reads that history rather than a transcript. Shared history is never rewritten: the working area is pruned at every mark instead, with Git keeping what was removed.

## Boundaries

The work model says who holds work and how it moves. It does not say how a coordinator spends its turn or how it replies; that is [coordination](/docs/ways-of-working/coordination/). It does not say what a background run is given or how its report comes back; that is [background runs](/docs/ways-of-working/background-runs/). The exact form of the package files belongs to `ki-work-package`, and `ki-coordination` owns when the folder is tidied and when the mark is struck.

The words are agreed to be proven in use. The state names and the receive words above are the note's own, and a session that reads a different word should treat the note as the one canonical description.
