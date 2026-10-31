---
title: The work model
description: Work is the unit, not the conversation. Who holds a piece of work, how it passes between people and agents, and the states it can be in.
order: 1
permalink: /docs/working-with-agents/the-work-model/
sources:
  - repository: knowledgeislands/ki-principal
    path: Pillars/Philosophy/Model/Processes/Work Process/Work Process.md
    ref: 80ededbffff08f73fe8abfbb69ab4c8058a6c2c5
    governs: 'Work as the unit, the worker and supervisor roles, the seven states, send and receive, holds and the heartbeat'
    reviewed: '2026-10-31'
  - repository: knowledgeislands/ki-principal
    path: +/_WORK/ki.prj.ways-of-working/decisions.md
    ref: 34e2f7d4ff5f849be96f6666e5eff4d25eb7050b
    governs: 'The agreed three roles, the nested state machine with Bootstrap, Working and At rest, and the portability conditions for stopping'
    reviewed: '2026-10-31'
---

# The work model

After reading this page you can look at any piece of work and say who holds it, whose move it is next and what state it is in, without opening a chat transcript or remembering a conversation.

## The idea in one sentence

The unit is the piece of work, not the conversation about it. A chat session is only the channel through which someone works on a piece of work for a while; the work itself is written down in the repository, so it outlives every session, every machine and every model.

That one choice changes how everything else feels. You can close a session, switch from one AI tool to another, or move to a different computer, and the work is still exactly where you left it.

## Who is involved

Every piece of work passes between a **worker** and a **supervisor**:

- the **supervisor** directs the work, answers its questions and decides when it is good enough;
- the **worker** does the work and reports back.

The roles describe a relationship, not a kind of being. A person or an AI can fill either one. In practice the owner of the work is the supervisor, and the work itself is done by agents running in the background.

Between them sits the agent in the conversation thread, which keeps the work moving: it launches background agents, receives their reports, writes down the owner's decisions and talks to the owner. The current description calls it the coordinator, and treats it as worker to the owner and supervisor to its own background agents at the same time. The agreed next step names it the **orchestrator**, a role of its own, so that the three parts are easy to tell apart: the supervisor is the human in the loop, the worker is a background agent, and the orchestrator runs the work's state machine. That naming is being designed into the written method now.

## The states

At any moment a piece of work is in exactly one state. There are four kinds:

| Kind | What it means |
| --- | --- |
| With someone | The worker is working on it, or the supervisor is looking at it |
| Handed off | It has been sent and the other side has not picked it up yet |
| On hold | Nobody owes a move and it is not over |
| Finished | It is closed |

Spelled out with the role names, that gives seven states: With worker, With supervisor, Handoff to supervisor, Handoff to worker, Handoff to some other target, On hold and Finished.

Only two moves exist. To **send** puts the work into a handoff; to **receive** takes it out of the handoff and makes it yours. The supervisor receives by saying something as short as "with me", "got it" or "seen". A message sent while the worker is busy is a steer: it changes the direction and moves nothing.

## Holds and heartbeats

A hold is agreed, never assumed. The supervisor says "pause" or "done for now", and the worker then **drains**: it lets anything about to finish finish, stops everything else at a safe point and launches nothing new. Only when nothing is running, everything is committed and pushed, and every open question is parked with its recommended answer does the work count as on hold.

While a worker holds the work it gives a short update on every change and at least every five minutes. Work that has neither moved nor sent an update for ten minutes is shown as stuck. Nobody has to set that flag; it follows from the silence. Work waiting on the supervisor is never stuck, only older, so the owner's view lists the oldest first.

## Being designed: a clearer state machine

The owner has agreed a sharper picture of the same model, and it is being written into the method now. The names may still change while it is rolled out.

- **Bootstrap** is where a session picks the work up. If the work is clearly defined it goes straight to the worker; if it needs more clarity it goes to the supervisor first.
- **Working** holds the everyday loop: the worker informs the supervisor, the supervisor receives, the supervisor directs, the worker receives, and round again. The two handoffs are the short transitions between the two settled states.
- **At rest** replaces On hold, with a reason: holding while other work takes priority, waiting for an outside answer, or moving to another machine or package.
- **Finished** is the end.

Every arc in the new picture states what must be true before it starts and what must be true when it ends. The important one is the step out of Working into At rest: when it completes, nothing may exist only on one machine. No uncommitted change, no unpushed commit or branch, no leftover worktree. The test is simple: if the local copy of the repository were deleted, nothing would be lost.

## What this gives you

- One answer to "whose move is it?" at every level, from a single task to a whole programme of work.
- Work that survives sessions, tools and machines, because it lives in Git rather than in a chat.
- An owner who can step away and come back to a clear list of what is waiting on them, oldest first.

The next page, [the work package](/docs/working-with-agents/the-work-package/), shows where all of this is written down.
