---
title: Work packages
description: The work folder and its five files, what else may sit beside them, who may write there and how the folder is tidied and closed.
order: 2
permalink: /docs/ways-of-working/work-packages/
sources:
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/governance/ki-work-package/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The package modes: create, update, resume, audit, tidy and remove'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/governance/ki-work-package/references/standards-work-package.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The closed list, entry points, tidying, messages lines, the review holding area and the exact form of each file'
    reviewed: '2026-10-25'
---

# Work packages

Every piece of work above a single record keeps its definition, state, queries, messages and decisions in one flat folder, so you can pick the work up from Git alone, without a transcript or a vendor session.

{% figure "work-folder", "Inside the work folder: the five package files, and the reports, briefs, findings and design notes that sit beside them for a while. Outside it: the few parties that may write in." %}

## What it is

A work package is the work's own record of itself, packaged the way a skill is. Its home is the work folder, `+/_WORK/<id>/`, in the repository's working area, named for the work's dotted id: the territory's own id for territory work, `<territory>.<project>` for Project work and `<territory>.regular` for regular work. A work item has no package; its roadmap record is its home. Every Project package lives in the territory's principal repository, however many repositories the Project touches.

Five files exist from the work's creation:

| File | What it holds |
| --- | --- |
| `work.md` | the definition: a routing description, the goals and the scope, read first and changed rarely |
| `state.md` | where the work lies now: its state fields, `## Now`, `## Next steps` and `## Held` |
| `queries.md` | every open and parked query in full, in the form the owner report renders |
| `messages.md` | the incoming queue, one line per message, in priority order |
| `decisions.md` | the work's own decisions log |

The last three start as `None`, so a reader never meets a missing file and a sender never has to create one.

## How it works

The folder is a closed list. Beside the five files may sit a run's report until its outcome has a durable home, a brief at `briefs/<run>.md` while its handoff is open, one `findings/<tag>.md` per open finding, an owner's feedback package, and design notes under `design/` with the diagram sources they draw. Nothing else belongs: no scripts, screenshots or scratch folders. Temporary output goes to the run's temporary directory outside the repository.

The definition and the state are split on purpose. The history of `work.md` is the history of what the work is; the history of `state.md` is the history of its moves. Nothing in the package is a log. Evidence such as commit identifiers and test counts lives in the run report and the commit, which the state file may link but never copies.

The package reads in four levels, by analogy with a skill's metadata, body and references. Routing reads only the front matter of the definition and the state. The definition's body is read when two descriptions both match, or by a new session before it reads state. The work's own worker reads the state, messages, queries, decisions and every open finding at each pick-up. Reports, briefs and design notes are read only when the state or a query names one.

Each party has one entry point. The work's own steward writes the package files, findings and briefs and makes the tidy deletions. The launcher writes a run's report into the folder when the run finishes. A background run writes its product in its owning home and never its report straight into the folder. Other work and the State of play add or replace one line in the message queue, committed alone, and edit nothing else. Only the folder's own work deletes there.

A message line names its date, a tag and its sender and carries the instruction in about sixty words, with detail linked. The queue is taken in priority order. A line flagged `IMPORTANT` is added at the top and taken first, in order, one at a time; below the important lines the worker may group similar items into one unit of work.

Tidying keeps the folder to what is still open. When the steward receives a run report it copies each of the report's queries, whole, into `queries.md`, so the report is kept only until its outcome is homed. A finding leaves once it is settled and its disposition is recorded in the decisions log; a brief leaves once its run's report has been received; a design note leaves once it graduates or is recorded as superseded. Each removal is one commit by explicit path, so Git history still holds the file.

Migrated work whose status was not certain sits in `+/_WORK_REVIEW/<id>/` with an index line saying why. It is not live: it is neither picked up nor dispatched nor counted. At the next review the owner, or the work itself at its mark, moves the folder into `+/_WORK/` when it is live or deletes it when it is not.

## How you use it

To pick up work on the fictional Tern Holm island, Mara opens `+/_WORK/tern-holm.harbour-atlas/` and reads the five files and the open findings in that order, taking the message queue first and important lines before the rest, then continuing from the next steps. The title is never used to find a folder, and no archived or nested path is searched: if the folder is missing or ambiguous, the answer is to stop and ask which work is meant. Resume creates a fresh working context; it does not reopen the conversation that last held the work.

When Mara needs the Harbour Atlas work to take something, she adds one line to its `messages.md` and commits that path alone. When she finishes a wave, she rewrites the state file in place, copies any new queries into `queries.md` and commits the package by explicit path, with the move in the commit subject.

Soft limits keep each file readable: a routing description of at most five hundred characters, a definition body of at most three hundred words, a state body of at most four hundred words with at most five lines under `## Now`, message lines of at most sixty words, and a decisions log of at most four hundred lines. The checker warns on these and never fails them. `ki work status` reads the register level of every package to show the five views.

## What it provides

You get work that survives any session: a new machine, a new runtime or a new day starts from the same five files. You get a single inbox per piece of work that other work can write to without stepping on anything else, and a folder whose contents tell you what is still open because everything settled has already left it.

Finished work keeps its package, with the state `finished`, until the mark that closes it, when the folder is deleted in one commit and Git keeps it. No retired copy, archive or timestamped duplicate is kept.

## Boundaries

The package standard owns the folder's shape and each file's form. When the folder is tidied, when a mark is struck and how the decisions log is written are the coordinator's, under [coordination](/docs/ways-of-working/coordination/). The run's own state folder, its brief and the path its report travels are the launcher's, under [background runs](/docs/ways-of-working/background-runs/). A design note's life from draft to graduation is `ki-work-design`'s.

Until each live folder has been moved, a folder may still be in an older single-file shape, in which the definition and the state share one file. Readers accept both shapes; a package whose definition still carries a state field is failed, so a session that rewrites it from memory is caught at its next gate.
