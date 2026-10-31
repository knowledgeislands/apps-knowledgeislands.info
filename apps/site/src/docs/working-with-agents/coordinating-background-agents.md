---
title: Coordinating background agents
description: Why the agent you talk to hands every real task to background agents, how those agents run and report, and how you stay in charge without waiting.
order: 3
permalink: /docs/working-with-agents/coordinating-background-agents/
sources:
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/change-management/ki-coordination/references/standards-coordination.md
    ref: 28fdc492d25435198ea8d93d605dfbd5e69cb7f3
    governs: 'The responsive coordinator, its turn budget, the heartbeat, the owner report, unattended windows and wakes'
    reviewed: '2026-10-31'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/governance/ki-delegation/references/standards-background-runs.md
    ref: 28fdc492d25435198ea8d93d605dfbd5e69cb7f3
    governs: 'Detached background runs, the brief, the status line, the report and DONE, chaining and parallel runs'
    reviewed: '2026-10-31'
  - repository: knowledgeislands/ki-principal
    path: +/_WORK/ki.prj.ways-of-working/decisions.md
    ref: 34e2f7d4ff5f849be96f6666e5eff4d25eb7050b
    governs: 'The session wake as one bounded wait and the durable wake as a headless pass'
    reviewed: '2026-10-31'
---

# Coordinating background agents

After reading this page you can run a conversation with an AI coordinator that keeps several pieces of work moving in the background and still answers you within one short turn, whenever you speak.

## The principle

The agent you talk to does not do the work itself. It hands every real task to a background agent, then goes back to listening. Three rules follow, and they are hard rules:

1. **The coordinator never does the substantive work.** It dispatches, decides things with the owner and reports. Nothing else.
2. **Every task goes to a detached background agent.** Each one runs in its own session and keeps going whatever happens to the conversation that launched it. A helper running inside the same conversation does not count, because it would block the coordinator while it worked.
3. **Your message never interrupts work in flight.** It steers: the coordinator folds it into the running and queued work and answers you straight away. A background agent stops only when you name it and say stop.

The reason is simple. If the coordinator is busy reading files and running builds, you wait. If it only dispatches and reports, it is always free to answer you, and nothing you say can accidentally cancel half-finished work.

## Small turns

To stay responsive the coordinator keeps each turn small: at most five tool calls before it comes back to you. It reads only the work package, the list of running agents, one report and one short file; it writes only the work package, the decisions log and a brief for the next agent. If it notices it has drifted into doing the work, it stops, hands the rest to an agent and tells you in one line.

## How a background agent runs

Each background agent gets a **brief**: what to do, which repository, what it may and may not do, and how to report. It then runs on its own and keeps two files up to date:

- a **status line**, one plain sentence with the time, rewritten whenever it changes activity and at least every couple of minutes, so you can always see what it is doing;
- a **report**, written when it finishes, in the same shape the coordinator uses with you: what is done, what is still in progress and any questions for you.

When it is finished it writes DONE as the last line of its status. Agents that touch the same files are chained, each waiting for the one before; agents in different repositories run side by side, about three at a time, with the rest queued.

## Staying in touch while you wait

While work is with the agents, the coordinator gives you a timed update of a line or two whenever it launches something, whenever an agent finishes and at least every five minutes. It does this by keeping one background check armed: a small waiter that wakes the coordinator when any agent finishes, or after five minutes, whichever comes first. If an agent's status has not changed for ten minutes it is shown as stuck, so silence is never mistaken for progress.

A question that blocks the work is raised the moment it arises, in one line. Everything else waits for the summary.

## The report you read

When the work comes back to you, the coordinator sends one report with three sections in a fixed order:

- **Done**: what finished, with any failures beside it rather than hidden.
- **In Progress**: what is still running or waiting, and on whom.
- **Queries**: each decision it needs from you, with enough context to decide without reading anything else, the question in one sentence, and lettered options with the recommended one first and its confidence.

You answer by speaking: by the question's short tag, in order, or with a bare letter. The coordinator reads your answer back, writes it in the decisions log in your words, and only then launches the work it allows.

## When you step away

You can give the coordinator an unattended window: an end time, the work it may do, what it may not do and the words that stop it. It records the window in the decisions log, writes its plan, and starts. During the window it never treats silence as consent: a question it cannot answer is parked for your return, and nothing is done on that matter in either direction. When the window ends it stops launching, lets running agents finish and gives you a return report of everything since you left.

Waking the coordinator works in two layers. Within a session it is one bounded wait at a time, re-armed at each wake. For wakes that must survive the session ending, the agreed answer is a short scheduled pass that checks the work and acts only within what the owner has already authorised; which machine it should run on is being designed.

## What this gives you

- A conversation that answers you in seconds, even while hours of work run underneath it.
- Work that keeps going if the conversation that launched it closes.
- A single, predictable report shape, with every decision you owe in one place.

Some of those decisions are hard to get right. The [next page](/docs/working-with-agents/blind-reviews-and-confidence/) shows how each recommendation is checked before it reaches you.
