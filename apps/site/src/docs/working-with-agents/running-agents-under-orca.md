---
title: Running agents under Orca
description: How Orca, an app for running and watching many agents at once, fits beside the work model, what is settled about using it, and what is still being designed.
order: 7
permalink: /docs/working-with-agents/running-agents-under-orca/
sources:
  - repository: knowledgeislands/ki-principal
    path: +/_WORK/ki.prj.ways-of-working/design/landscape-report.md
    ref: b21377cd820d3361882138f8ab9297c639b295d8
    governs: 'Layers rather than products, the durable and live split, the launcher as the floor and where Orca may run'
    reviewed: '2026-10-31'
  - repository: knowledgeislands/ki-principal
    path: +/_WORK/ki.prj.ways-of-working/design/orca-subagents/design.md
    ref: c7f4e8b972b7c239acb8effb78aaba808f69ef90
    governs: 'Runs as Orca sub-agents, the inherited identity fix, and worker close-out'
    reviewed: '2026-10-31'
  - repository: knowledgeislands/ki-principal
    path: +/_WORK/ki.prj.ways-of-working/decisions.md
    ref: 34e2f7d4ff5f849be96f6666e5eff4d25eb7050b
    governs: 'The owner choosing opt-in Orca on attended machines, the launcher staying, and the sub-agent goal'
    reviewed: '2026-10-31'
---

# Running agents under Orca

After reading this page you can use Orca to watch and steer your agents while the work itself stays written down in your repositories, and you know which parts of that arrangement are settled and which are still being worked out.

## What Orca is

Orca is a desktop app for running many AI coding agents side by side. It starts agents, gives each its own worktree, shows them all in one sidebar with live status, and lets one agent supervise others. It is very good at the live part of the job: what is running right now, and what it is doing.

## Two layers, each doing what it is good at

Knowledge Islands does not compete with tools like Orca, and it does not tie itself to any one of them. It describes the work in layers and lets each tool fill the layers it is good at:

- **The durable layer stays with Knowledge Islands.** The work package, the roadmap, the owner's decisions in the owner's own words, the open questions, and the rule that finishing a task is not the same as accepting it. All of this lives in Git beside the content, readable without any particular tool.
- **The live layer can be Orca.** Launching agents, giving them worktrees, queueing them, watching their heartbeats and pausing them for a decision.

Many tools now keep work durably and across machines. What none of them offers is the statement of the work inside the repository's own history, carrying the owner's decisions and keeping acceptance apart from completion. That is the part Knowledge Islands keeps, so it can swap the live tool without losing anything.

## What is settled

- **Orca is opt-in.** A piece of work chooses to use it. It is used on the machines where the owner is present, and the dedicated always-on agent host keeps the plain built-in launcher.
- **The built-in launcher stays.** The command-line launcher that starts background agents remains the floor that always works, with or without Orca. It keeps getting fixes for correctness, isolation and recovery, but it gains no new features that would simply copy what Orca already does.
- **Runs must not borrow the coordinator's identity.** A background agent started from inside an Orca conversation was found to inherit that conversation's Orca identity, so Orca treated it as the coordinator itself. The fix, to strip that identity from every agent the launcher starts, has been handed to the work that owns the launcher.
- **Your work survives a change of tool.** Because the durable layer never moves into Orca, closing Orca, updating it or stopping using it loses no work, decisions or questions.

## Being designed

- **Background agents as Orca sub-agents.** The owner wants agents launched from an Orca conversation to appear nested under that conversation, as Orca's own sub-agents do, rather than as dozens of separate top-level sessions crowding the sidebar. The design starts each agent through Orca's own supervised-worker route, recording which conversation started it, and falls back to today's detached launch whenever that route is unavailable. One supervised trial, with the owner watching, comes first, to settle whether the agents really nest, whether they run without permission prompts, and whether they survive the conversation ending.
- **Tidying finished workers.** Orca expects each finished worker to be either reused, kept on purpose or released, so finished terminals do not pile up. The design adds that step to the coordinator's close-out. Releasing a worker closes its terminal and keeps its output; it never deletes conversation history, which stays the owner's own choice.
- **Queued agents.** Agents waiting on another to finish would start through Orca while the conversation that queued them is still open, and as ordinary detached agents after it has closed, so they never act in the name of a conversation that has gone.
- **Where unattended checks run.** Which machine may host scheduled, unattended passes is still an open choice.

## What this gives you

- A live view of every agent, with the work still safe in Git whatever happens to the app.
- Freedom to try a better live tool later without migrating your work.
- A clear line between what is settled today and what is still being tested.

That completes the course. For the full detail behind each topic, the [Ways of working](/docs/ways-of-working/the-work-model/) section covers the same model at reference depth.
