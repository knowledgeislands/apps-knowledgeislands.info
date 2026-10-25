---
title: Recap and handover
description: Ground a live session recap in current evidence and carry forward only what remains relevant.
permalink: /docs/knowledge/recap-and-handover/
order: 4
sources:
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/change-management/ki-recap/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Exact invocation arguments, three recap legs, outputs and live-session scope'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/change-management/ki-recap/references/standards-session-recap.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Grounding, Discussion coverage, Actions, carry-forward digest and portable checkpoint hand-off'
    reviewed: '2026-10-25'
---

# Recap and handover

You can finish a live session with a grounded account of its changes and decisions, identify what is still unfinished and route useful learning before another work cycle begins.

{% figure "recap-handover", "Ground the whole live thread, then Summarise, Surface what is outstanding and Harvest the learnings. Actions and the carry-forward digest preserve the next cycle's scope." %}

## What it is

`ki-recap` is a process skill for the live session in which it runs. It covers the whole current thread through the invocation, including every repository touched. An earlier recap or compaction does not reset that scope. Historical session acquisition and the [coordinator's summaries](/docs/ways-of-working/coordination/) have their own procedures.

## How it works

The skill follows three legs in order:

1. **Summarise.** Account for the changes, decisions and files touched across the whole live thread. Recheck claims against current repository evidence before saying that a commit landed, a gate passed or a file has a particular state.
2. **Surface what is outstanding.** Include only work still open in this thread. Check session-owned files in each touched repository separately. A substantive agreed follow-up needs a verified canonical roadmap or Stream home; once captured, it is a recorded deferral whose later lifecycle does not keep this thread open. An agreed but unwritten handoff remains outstanding.
3. **Harvest the learnings.** Identify dead-ends, workarounds and conventions discovered in the session, distinguish them from unfinished work and propose the narrowest appropriate durable owner. Confirm with the user before writing anywhere durable. A new reusable repository-review concept is raised as a repository-review checklist candidate, with an offered canonical update.

A grounding helper checks each physical Git root and its staged, unstaged and untracked evidence. Unavailable Git evidence is reported as unavailable. Transcript evidence is advisory and bounded; a repository match alone does not identify the invoking thread, and no transcript selection narrows the live-thread scope.

### Arguments

The pinned skill names its invocation grammar exactly as follows:

```text
checkpoint <thread> | help | recap [--runtime detect|claude|codex] [--transcript <session-file>]
```

With no argument, it runs the three-leg procedure over the whole current thread. `help`, `-h` or `?` explains the skill and stops. Grounding defaults to `--runtime detect`; `--runtime claude` or `--runtime codex` forces one runtime. `--transcript <session-file>` selects an eligible candidate by basename when concurrent sessions make modification time ambiguous. These options select evidence, not a different recap scope.

`checkpoint <thread>` is an optional, explicit request for an exact human-selected thread in a repository declaring a valid `ki-work-package` capability. The skill validates portable hand-off inputs and invokes that capability's UPDATE procedure. Ordinary recap does not automatically create a checkpoint.

### Outputs

After the three legs, **Discussion coverage** is shown when requested or when materially different discussion points need tracing. Its columns are Discussion point, Owning home, Disposition and Evidence. Dispositions are `delivered`, `captured`, `deferred`, `out-of-scope` and `decision-needed`. Missing or uncertain transcript evidence makes the matrix bounded and non-exhaustive; the matrix cannot establish transcript completeness.

The recap closes with **Actions**, a concrete imperative checklist containing only current-thread unfinished work. Each item has a short, unique uppercase hyphenated label such as `FIX-AUTHORING-AUDIT`. It is a checklist for the user, not work performed unprompted. An empty list yields either a truthful no-actions state or the fixed evidence-bearing completion banner, depending on the procedure's completion checks. Committed, verified session work and decided learning routes are required for that banner; unrelated dirty files and a captured record's future acceptance are outside its claim.

The **carry-forward digest** uses Context, Next scope, Decisions, Files Touched, Outstanding, Learnings Routed and Keywords. It preserves only what the next cycle needs. It is a carry-forward artefact, not a reduction of the live context window. The skill offers the documented runtime compaction mechanism at a safe boundary and never autonomously invokes a user-facing compaction command. Active unfinished work and the minimum-footprint condition can withhold the offer.

An explicitly requested **portable checkpoint hand-off** supplies repository identity, thread, authority scope, result destination, verification plan and a committed baseline or complete portable-patch reference. The receiving agent must be able to reconstruct the task without the original transcript or shared filesystem. [Work packages](/docs/ways-of-working/work-packages/) owns its identity, schema and lifecycle.

## How you use it

Mara finishes a session on fictional Tern Holm in which she changed a survey note and agreed a later diagram correction. She asks for `ki-recap`. The agent checks the actual note changes, verifies the correction's roadmap home and reports it as a recorded deferral. A useful convention still awaiting her approval remains an undecided learning route and an Action.

If Mara wants another agent to resume an exact work thread from portable evidence, she explicitly requests `ki-recap checkpoint <thread>` with that thread's identifier. Merely assigning the correction to another person would not preserve an agreed handoff.

## What it provides

You get a session account tied to current evidence, a precise distinction between unfinished work and recorded deferrals, and proposed homes for reusable learning. The next cycle can start from a scoped digest or an explicitly requested portable hand-off rather than reconstructing the entire conversation.

## Boundaries

Recap does not select or sequence future work; a separate request goes to `ki-next`. It does not promote learning without confirmation or claim unavailable evidence is complete. Normal recap applies the narrowly authorised Batch retention rule to eligible inactive batch records and reports exact removals; it never prunes roadmap records.

A work-record mini recap requested by `ki-accept` stays within that record's delivered outputs, verification evidence, outstanding concerns and proposed learning routes. Closing the record grants no permission to write learning elsewhere. A [session digest](/docs/knowledge/query-save-update/) and an [acquired source package](/docs/knowledge/acquiring-knowledge/) serve different purposes and retain their own formats.
