---
title: Coordination
description: The responsive coordinator and its turn budget, the owner report with its queries and options, the banner and thread line, and the three reply forms every session uses.
order: 3
permalink: /docs/ways-of-working/coordination/
sources:
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/change-management/ki-coordination/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'When the skill applies and the hard rules it carries into every session'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/change-management/ki-coordination/references/standards-coordination.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The responsive coordinator, reply forms, units of work, the owner report, the banner and thread line, report forms and the working rules'
    reviewed: '2026-10-25'
---

# Coordination

A coordinating session dispatches work, decides what the owner must see and reports, so you can read one short reply and know what was done, what is still running and exactly which questions wait on you.

{% figure "thread-model", "A State of play thread coordinates a territory's work; a Project thread coordinates one Project; both reply to the owner in the same forms." %}

## What it is

Coordination is the worker's side of the work model when the worker is an agent session and the supervisor is a person. The coordinator holds a piece of territory work or Project work, launches background runs to do its substantive units, receives their reports, and gives the owner one place where every decision waiting on them is set out in full. The practice is written for the threads a reader will meet: a State of play thread for a territory and a coordination thread for each Project.

Three hard rules hold in a coordinating session. The coordinator never does the substantive work itself. Every unit of work goes to a detached background agent, launched through `ki agent`, never to an in-session subagent. And an owner's message never pre-empts work in flight: a message mid-run is a steer, folded into the running and queued work, and only an express instruction to stop, naming the work, stops it.

## How it works

{% figure "coordinating-turn", "One turn: the owner's message, the pick-up files, a brief and a launch, the wake while the run works, the receive and the owner report." %}

The coordinator is responsive because its turns are small. A turn makes at most five tool calls and returns to the owner. Its reads are the work package, the launcher's status, one report and one short file; its writes are the work package, the decisions log and a brief. Anything beyond that is a launch. Reasoning happens in the agents, so the coordinator runs on a lighter model purpose and the heavier models go to the background runs. Waiting is always through a detached waiter or monitor, never a foreground wait. One mechanical one-line fix in the coordinator's own package is allowed; a fix that needs judgement, touches more than a line or touches another piece of work's files goes to a run.

While work lies with the worker, the coordinator keeps a heartbeat: an update on change, at least every five minutes and always within ten, as a timed one- or two-line line to the owner. Agents that touch the same files are chained so that no two edit a file at once; agents in different repositories run in parallel; about three run at once per piece of coordinating work, the rest waiting in the run queue.

Every reply to the owner takes one of three forms, in every session, coordinating or not:

| Form | When | Shape |
| --- | --- | --- |
| Conversational reply | The default: answers, acknowledgements, clarifying questions, plans proposed for agreement and timed progress updates | Plain prose with no heading, section or banner; a coordinator's reply that moves the mark or answers where the work stands ends with the banner |
| Completed-work report | When a unit of work ends, in any session, and as every background agent's final report | The owner report: `## Done`, `## In Progress` and `## Queries` |
| Coordinator summary | Only while coordinating territory or Project work | A report form, Summary, recap, full summary or hold report, under the report heading and form line, closing with the banner and thread line |

A unit of work ends when at least one of five things holds since the last report: a change was committed, or deliberately left uncommitted with the reason stated; work was sent to other work, a repository, a record or a person; a background run finished; a deliverable the owner asked for was produced; or the work stopped with something the owner must decide, supply or do. Answering a question, acknowledging a decision, a single check or a timed update ends nothing and gets a plain reply.

The owner report has a fixed shape. `## Done` names what finished, with its commit identifiers. `## In Progress` names what is running or queued, with an `Outstanding - no action requested now` line for what is open but needs nothing yet. An optional `## Findings` carries what was noticed but not acted on. `## Queries` carries every open query in full, each under its own tag and title with **Context**, **Query** and **Options**, the recommended option first as `a) (recommended, confidence high, medium or low - reason)`. A medium or low confidence recommendation, and any recommendation to delete or cancel, goes through a blind review before it reaches the owner. Nothing shortens a report: no output style, communication level or proxy shaping block may drop a section or a query.

A coordinator summary opens with the report heading, the theme and Project linked, and a form line giving the state glyph, the form and the time. It closes with the banner: one heading of the glyph state and when it began, one line of counts, one list of what is running, with the owner, blocked, held or committed, and last of all the thread line naming the thread and its work id. The glyphs come first and the last glyph says whose move it is: 🤖 an agent, 👤 the owner, 🎯 a named target, ⏸️ nobody until the release, 🏁 nobody. An arrow appears only in a handoff state.

## How you use it

On the fictional Tern Holm island the owner opens a Project thread for the Harbour Atlas work and gives it a decision. The coordinator records the decision in the decisions log in the owner's own words, reads the package's pick-up files, writes a short brief citing the decision and launches a run. Its reply is one timed line. Every few minutes the owner sees another line while the run works. When the run reports, the coordinator copies the report's queries into the queries file, rewrites the state file, commits the package by explicit path with the move in the subject and sends: an owner report ending in a banner whose last glyph is 👤.

The owner replies `with me`, reads the queries and answers them; each answer becomes a logged decision. When the owner says `pause` or `done for now`, the coordinator drains, commits and pushes everything stacked fast-forward in every repository it touched, parks each open query in the queries file and gives a hold report under the ⏸️ banner. `resume` releases it. A reply to the owner's return after half an hour or more away is the owner's answer first, then a Summary with every open query in full.

Territory work routes. The State of play is the territory's single dispatch coordinator: every new unit of work is matched against the routing description of each registered piece of work and sent as one line in that work's message queue, important lines at the top. It keeps three or four Project packages active at once and recommends acceptance in bundles the owner approves with one word.

## What it provides

You get a coordinator that is never mid-way through long work and so always answers promptly; a report form in which every question waiting on you is complete, with a recommended answer and the reason for it; and a banner that tells you whose move it is at a glance. Because every decision is logged in your words before the work it authorises is launched, and the package is committed at every send and receive, a second session or a second machine can pick the work up and give the same account.

The same three reply forms make an ordinary conversational session predictable too: it does bounded work directly, confirms a small asked-for change in one line and gives a completed-work report only when a unit of work has actually ended.

## Boundaries

Coordination governs the coordinator's timing and judgement: when the folder is tidied, when the mark is struck, how a hold is agreed and how every session replies. The package's shape is [work packages](/docs/ways-of-working/work-packages/). The run side, the run packet, the brief's shape, the authority footers and the queue, is [background runs](/docs/ways-of-working/background-runs/). Shaping a new Project before any record exists is [work design](/docs/ways-of-working/work-design/), and the record lifecycle its runs move is [roadmap lifecycle](/docs/ways-of-working/roadmap-lifecycle/).

A session becomes a coordinator only when the owner opens or re-bootstraps it with a coordinating opener matching its package's level. A repository declaring the skill does not make a session a coordinator, and a background run is the detached actor a coordinator briefs, not a fourth kind of session.
