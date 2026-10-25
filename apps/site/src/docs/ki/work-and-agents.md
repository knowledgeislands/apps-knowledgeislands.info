---
title: Work and agents
description: Read work packages, launch and follow detached agents, and record a bounded batch with ki v0.13.0.
permalink: /docs/ki/work-and-agents/
order: 10
sources:
  - repository: knowledgeislands/tools-ki
    path: man/ki.1
    ref: v0.13.0
    governs: 'Work status, background-agent commands and repository batch commands'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/tools-ki
    path: docs/guides/user/background-agents.md
    ref: v0.13.0
    governs: 'Prompt preparation, launch, queue, wait, reports and run closure'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/tools-ki
    path: docs/guides/user/batch-records.md
    ref: v0.13.0
    governs: 'The exact-set batch envelope, result ledger and completion evidence'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/governance/ki-work-package/references/standards-work-package.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The five-file work package and its separation from runtime state'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/governance/ki-delegation/references/standards-background-runs.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Detached runs, prompt authority and completion reports'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/change-management/ki-batch/references/standards-batch.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Batch authority and the lifecycle boundaries command mechanics preserve'
    reviewed: '2026-10-25'
---

# Work and agents

You can see who holds a piece of work, delegate a bounded task without keeping its launching session open, and follow its result back to a reviewable report. Work packages, detached runs and batch records each preserve a different part of that account.

## What it is

A work package describes one piece of work under `+/_WORK/<id>/`. Its five files hold the definition in `work.md`, current state in `state.md`, outstanding queries, incoming messages and decisions. The `ki-work-package` skill governs that durable package; `ki work status` reads it.

A detached run is a worker's execution of a supplied brief. `ki agent` provides the launcher and monitoring surface governed by `ki-delegation`. A batch envelope, governed by `ki-batch`, records authority for one exact set of Ready items in one repository. Neither a running process nor a batch ledger replaces the canonical work records.

## How it works

`ki work status` groups work into **with you**, **stuck**, **blocked**, **moving** and **on hold**. It reads the package's state, message count and running-agent evidence. A worker silent for more than ten minutes appears stuck; finished work is omitted. The command changes nothing, and `--format json` supplies the same structured view to other tools.

Each background run has a recorded repository home. `ki agent new` writes a prompt skeleton; `launch` appends the chosen authority footer and starts the worker detached. Machine-local state holds its prompt, launch details, status and log. The worker writes its report there, then writes `DONE` as its final status line. Monitoring homes the report in the owning work folder. A process that exits without `DONE` is a failure requiring attention.

`queue` retains a prepared brief until `dispatch` can launch it within the concurrency limit. `--wait-for <name>` holds a dependent worker until its predecessor finishes with `DONE`; a failed predecessor blocks the gate. `wait --next` reports the next event, including a result or owner query. `watch` gives a continuing event view, while `status` is a snapshot.

## How you use it

Suppose the fictional Lantern island holds an approved writing review in `+/_WORK/lantern.writing/`, whose run slug is `lantern-writing`. From its checkout, first inspect the work and create a brief:

```bash
ki work status
ki agent new lantern-writing review
```

Complete the generated brief with the approved task, bounded paths, verification, authority and the state-folder report path it supplies. Then launch it using that actual prompt filename:

```bash
ki agent launch lantern-writing review . /absolute/path/to/review.draft.md --rules none
ki agent status lantern-writing
ki agent wait lantern-writing --next
```

The runtime must be installed and the canonical harness must supply the run assets. Choose `--runtime claude` or `--runtime codex` explicitly when needed; optional model and effort settings pass to that runtime. Use the lowest sufficient authority tier. A tier does not invent the owner's permission for a task.

For several prepared tasks, queue their briefs and start a bounded dispatcher:

```bash
ki agent queue lantern-writing links /absolute/path/to/links.draft.md --workdir . --wait-for review
ki agent dispatch lantern-writing --max 2
```

Read each report on wake and re-arm the waiter until it says `ALL FINISHED`. A brief must stand on its own: name the approved task, numbered steps, checks and report path, then let the launcher append its authority rules and progress protocol. Use `ki agent send` for a line to another live run; this inbox is separate from a work package's durable message queue.

For an approved batch, use `ki repo batch prepare` with every `--item` in dependency order, the approval assertion, authority mode, expiry and completion target. `validate` checks the protected envelope; `run` binds execution and later appends each supplied result with its baseline and result commit; `close` records evidence that every canonical item already reached the agreed target. The [roadmap lifecycle](/docs/ways-of-working/roadmap-lifecycle/) explains how those item states are reached.

## What it provides

Work status tells you what needs attention. A run gives you a prompt, visible progress, events and a report that survives the launching session. A batch adds a digest-protected authority envelope and a concise evidence ledger across the exact approved set.

Before retiring a run, house its decisions, preserve useful temporary output, integrate finished worktrees and commit the owning folder. `ki agent close` checks these conditions; `decide` records an owner's decision and `reconcile` links it to its durable home.

## Boundaries

Reading status never sends, receives, accepts or closes work. Launching a worker grants only the task's existing authority. Concurrent writers need isolation, and a queued dependency is an execution gate rather than a review or acceptance decision.

Batch commands supply file mechanics: they do not select work, implement it, accept it, prune it, push or release. An expiry or changed protected payload invalidates execution rather than silently widening the envelope. Use [the command inventory](/docs/ki/commands/) for the release's complete arguments and `--help` for your installed version.
