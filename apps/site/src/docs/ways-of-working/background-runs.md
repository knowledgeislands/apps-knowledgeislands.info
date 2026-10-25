---
title: Background runs
description: Detached runs, the run packet, status and report files, authority tiers, grants and the deny list, unattended windows and the run queue.
order: 4
permalink: /docs/ways-of-working/background-runs/
sources:
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/governance/ki-delegation/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'When delegation applies and the two packet kinds it owns'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/governance/ki-delegation/references/standards-background-runs.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Detachment, the run packet, prompt shape, authority tiers, grants, the deny list, the decisions log, coordination, the run queue, monitoring and reporting'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/tools-ki
    path: man/ki.1
    ref: v0.13.0
    governs: 'The ki agent command group and its subcommands'
    reviewed: '2026-10-25'
---

# Background runs

A background run is a detached agent that does one bounded unit of work from a written brief and returns a written report, so you can hand work off, close the session and still find the result in Git.

{% figure "background-run", "The brief goes into the work folder, the launcher starts the run and keeps its runtime files, the run marks its status, and the report comes home to the folder before the brief is pruned." %}

## What it is

A run is detached: its standard input is closed, it survives an interrupted session, and its owner can walk away. An in-session subagent is not a background agent. The coordinator that launches a run is its supervisor and the run its worker, so the run follows the work model: it has one unit of work to do, it reports when that unit ends, and `DONE` as the last line of its status file is its only completion signal.

Each run has a run packet in two homes. Runtime files live in the run's state folder under the user's state directory: the prompt, the launch record, the process id, the log, the status line and the report as the run writes it. Knowledge files live in the work folder of the work the run reports to: the brief at `briefs/<run>.md` and the report, which the launcher copies in when it sees `DONE`. Temporary output goes to the run's own temporary directory, outside any repository.

## How it works

The brief is short and quotes the owner's decision it carries out. Its prompt names the task, numbered steps, verification, the report path and two standing instructions: do not use background subagents, and never end the session while waiting. One authority footer closes it.

While it works, the run overwrites its status file with one line, the local time with its zone and what it is doing, at each change of activity and at least every two minutes. Three prefixes carry events: `milestone:` for progress worth a line to the owner, `blocked:` when it stops for something it cannot settle, and `failed:` when it cannot complete. A query heading in its report marks what needs the owner. The run's working-area mark names the work, the run and when it wrote, so a second session can tell what is held by a live run.

Authority comes in four tiers, each a footer the brief carries: none, push, prune and release. Two grants may be added: fetch, allowing network reads of named kinds, and machine, allowing named changes on the machine. An unattended window keeps the deny list, which no grant lifts in an unattended window: releases, force-pushes and bypassing hooks; acceptance, cancellation or pruning beyond what the entry answers allowed; changes to DNS, hosting, repository settings, the machine, a scheduler, credentials or anything connection-critical; messages to people or new publication; and changes to standards or configuration beyond the entry answers. A connection-critical change in any run needs a tested restore path first.

Decisions a run meets are logged, not improvised. The launcher's `decide` records one in the owner's words; `reconcile` reads the log back before close. Runs that touch the same files are chained, each waiting on the one before; runs in different repositories run in parallel; a run that needs its own working tree takes a worktree under its state folder and integrates fast-forward into the main branch. A conflict run reconciles a divergence rather than any run forcing it.

The run queue holds launches that wait. About three runs dispatch at once per piece of coordinating work; a detached waiter wakes the coordinator on the next finish, and `ALL FINISHED` when the queue is empty. The launcher's `watch` follows status lines; `close` applies a strict gate, that the report is homed and the decisions reconciled, with a waiver only when the owner has reconciled by hand; `sweep` clears finished state.

The reference launcher is `ki agent`. Its subcommands at v0.13.0 are `launch`, `queue`, `dispatch`, `wait`, `status`, `send`, `watch`, `home`, `new`, `decide`, `reconcile`, `close` and `sweep`; `ki work status` reads every package's register level for the five views. A run's home is the work folder whose slug matches the run's name.

## How you use it

Suppose Mara coordinates the fictional Harbour Atlas Project on Tern Holm. She writes a brief into the Project's work folder citing the owner's decision, commits it by explicit path and launches it with `ki agent launch`. Her session replies to the owner in one timed line and arms a check. The run marks its status every two minutes; every five minutes her session reads the latest line and gives the owner one or two lines. If a status line begins `blocked:`, she raises it at once.

When the run writes `DONE`, the launcher copies the report into the work folder. Mara receives it: she copies each of its queries, whole, into the package's queries file, rewrites the state file and commits. Her owner report carries the run's `## Done` and `## Queries`. Once the report's outcome has a durable home, a commit, a record or a decision, she removes the brief and the report with `git rm` by explicit path, and Git keeps them.

An unattended window is an episode of With worker that the owner grants in the decisions log before leaving: an end time or return condition in local time and UTC, the permitted actions, the exclusions and the wake and stop words. Entering it, the coordinator unpacks the owner's answers, strikes the mark, plans the window in the state file and records the revisions it starts from. During the window it may plan adopted drafts to Ready and deliver Ready work to awaiting review in frozen waves. Adoption, promotion, acceptance and pruning stay with the owner. The window expires at its end, on the owner's return or on "stop the wake", and the return report is a recap since the window's mark.

## What it provides

You get work that continues while you are away and is still readable when you return: every run's brief, status and report are files, every decision it met is in a log in your words, and nothing it was not granted can have happened. A failed or blocked run tells you so in its status file rather than disappearing. Because a run's report goes through the launcher into the work folder, the package rather than a chat window is where the result is found, on any machine.

## Boundaries

Delegation owns the run side: the packet, the brief's shape, the footers, the queue and the close gate. How the coordinator spends its turn, when it tidies and how it replies is [coordination](/docs/ways-of-working/coordination/); the folder the report comes home to is [work packages](/docs/ways-of-working/work-packages/). A durable packet for an approved high-risk handoff is the second kind of delegation and is not a routine run.

A run never creates a work record, never accepts, cancels or prunes one and never ends its session while waiting. Its report is its only output; a run that cannot finish says so with `failed:` and still reports.
