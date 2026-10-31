---
title: The work package
description: One folder per piece of work, with five files that say what the work is, where it stands, what it is asking, what has arrived for it and what has been decided.
order: 2
permalink: /docs/working-with-agents/the-work-package/
sources:
  - repository: knowledgeislands/ki-principal
    path: Pillars/Philosophy/Model/Processes/Work Process/Work Process.md
    ref: 80ededbffff08f73fe8abfbb69ab4c8058a6c2c5
    governs: 'The work folder, the five files and Git as the logbook'
    reviewed: '2026-10-31'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/governance/ki-work-package/references/standards-work-package.md
    ref: 28fdc492d25435198ea8d93d605dfbd5e69cb7f3
    governs: 'What each file holds, who may write where, and how the folder is tidied'
    reviewed: '2026-10-31'
  - repository: knowledgeislands/ki-principal
    path: +/_WORK/ki.prj.ways-of-working/decisions.md
    ref: 34e2f7d4ff5f849be96f6666e5eff4d25eb7050b
    governs: 'Five files at the top of the folder, everything else in purpose-named subfolders'
    reviewed: '2026-10-31'
---

# The work package

After reading this page you can open any piece of work in a repository, read five short files and carry on where the last session stopped, on any machine and with any AI tool.

## What it is

A work package is a folder that holds one piece of work. It lives in the repository's working area, in a folder named after the work, and it is committed to Git like everything else. Five files sit at its top:

| File | What it answers |
| --- | --- |
| `work.md` | What is this work, what is it for and what is in and out of scope? Read first, changed rarely. |
| `state.md` | Where does the work stand right now, and what are the next steps? |
| `queries.md` | What is the work waiting for the owner to decide? Every open question, in full, with its options. |
| `messages.md` | What has arrived for this work from elsewhere? One line per message, taken in order. |
| `decisions.md` | What has the owner decided about this work, in the owner's own words? |

Each file starts life with the word "None" rather than being missing, so nobody ever has to wonder whether a file was forgotten.

## Why five files

The split follows how the work is actually used. `work.md` is the entry point: a short description that lets a person or an agent decide whether this is the work they are looking for. The other four are read only when needed, which keeps every session's reading light.

Keeping the definition apart from the state matters too. The history of `work.md` is the history of what the work is; the history of `state.md` is the history of what happened to it. Neither file is a diary. Evidence, such as test counts and commit identifiers, lives in reports and commits, which the state file may point to but never copies.

## Everything else goes in a subfolder

The top of the folder holds only those five files. Anything else the work produces lives in a subfolder named for its purpose: reports from background agents, the briefs that launched them, design notes, and findings while they are open. The owner set this rule so that a glance at the folder shows the work itself, not its paperwork. Exactly how the subfolders are grouped, by kind of document or by the job that produced it, is being designed.

Those extra files are temporary. A report stays only until its outcome has a permanent home and its questions have been copied into `queries.md`; a brief stays only until its report has come back; a design note stays until it graduates into a standard or is replaced. Each is then deleted in its own commit, and Git keeps it for anyone who needs to look back.

## Git is the logbook

The package keeps no log of its own. Every move, a send to the owner, a receive, a hold, is a commit whose subject names the move. Reading the folder's Git history is reading the history of the work, and a recap since the last checkpoint is drawn from that history rather than from a transcript.

## Who writes what

- The work's own coordinator writes the five files and tidies the folder.
- A background agent writes its product in the place that owns it and its report where it was told to, never into the five files.
- Other work, and the territory's overall coordinator, may add one line to `messages.md` and nothing else. That line is the only way one piece of work asks another to do something, so nobody steps on anybody else's files.

## Picking work up

To resume, open the folder and read the five files, taking any urgent messages first, then follow the next steps in `state.md`. If the folder is missing or more than one could match, stop and ask rather than guess. Resuming starts a fresh session; it does not try to revive the last conversation.

## What this gives you

- Work that any session can pick up from Git alone.
- A single inbox per piece of work that others can write to safely.
- A folder whose contents tell you what is still open, because everything settled has already left it.

The [next page](/docs/working-with-agents/coordinating-background-agents/) shows how a coordinator uses the package to keep many background agents moving while staying available to the owner.
