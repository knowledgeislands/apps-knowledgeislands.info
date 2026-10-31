---
title: Worktrees for writing runs
description: Each background agent that changes files works in its own copy of the repository and folds its work back in only when its checks pass, so parallel agents never trip over each other.
order: 5
permalink: /docs/working-with-agents/worktrees-for-writing-runs/
sources:
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/governance/ki-git/references/standards-git.md
    ref: 28fdc492d25435198ea8d93d605dfbd5e69cb7f3
    governs: 'Worktree-run self-integration, the write boundary, worktree location and retirement'
    reviewed: '2026-10-31'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/governance/ki-delegation/references/standards-background-runs.md
    ref: 28fdc492d25435198ea8d93d605dfbd5e69cb7f3
    governs: 'Worktree isolation for parallel runs and the current trial'
    reviewed: '2026-10-31'
  - repository: knowledgeislands/ki-principal
    path: +/_WORK/ki.prj.ways-of-working/design/landscape-report.md
    ref: b21377cd820d3361882138f8ab9297c639b295d8
    governs: 'The worktree baseline, its read-only opt-out, its prerequisites and the limits of isolation'
    reviewed: '2026-10-31'
  - repository: knowledgeislands/ki-principal
    path: +/_WORK/ki.prj.ways-of-working/decisions.md
    ref: 34e2f7d4ff5f849be96f6666e5eff4d25eb7050b
    governs: 'The owner adopting the baseline, and nothing left only on one machine when work stops'
    reviewed: '2026-10-31'
---

# Worktrees for writing runs

After reading this page you can let several background agents change the same repository at once, confident that none of them will overwrite another's half-finished work or leave the main copy broken.

## The problem

A repository on your machine has one main working copy. If two agents edit files in it at the same time, their changes mix: one agent's tests run against the other's half-made edit, and a commit can pick up files it never meant to touch. Worse, every other session on the machine sees the mess too.

## The answer: one worktree per writing agent

Git can check out a second, third or tenth copy of the same repository, each on its own branch, all sharing one history. Each copy is called a **worktree**. The rule is:

- **every background agent that writes files works in its own worktree**, on its own branch, kept in a private folder outside the repository;
- **an agent that only reads may stay in the main copy**, because it changes nothing;
- **there is no exception for "trivial" edits.** A one-line change still gets its own worktree, because small edits are exactly the ones nobody thinks to check.

The coordinator, the agent you talk to, stays on the main copy. It is the one place your own view of the repository comes from, so it is kept still.

## Folding the work back in

A worktree is temporary. When an agent finishes, its last step is to bring its work home:

1. move its branch on top of the latest local main, without fetching anything from outside;
2. run the repository's checks against the result;
3. take a short, exclusive turn at the main copy, so only one agent folds work in at a time;
4. fast-forward the main copy to include its commits, with no merge commit and no conflict resolution;
5. confirm the commits are now part of main, then remove the worktree and delete the branch.

If any step fails, because of a conflict, a failing check or another agent holding the main copy, the agent does not force it. It keeps its worktree and branch and reports them as stranded, with the reason, as a question for the owner. A quiet finish that leaves work behind is never acceptable.

Folding in is local only: it publishes nothing and accepts nothing. Pushing and independent review are separate steps. And because a background agent's notes and reports also land through its worktree, the coordinator waits for the work to be folded in before it treats the report as received.

## What a worktree does not isolate

A worktree separates files and Git's staging area. It does not separate anything outside the repository: credentials, shared caches, cloud services and the like are still shared, so the usual rules about what an agent may touch still apply in full.

## Where this stands

The owner has adopted this as the standard for every writing agent. It takes full effect once the tooling can fold work in with a single command and recognises a worktree as the repository it came from; that tooling is being built. Until then, code repositories already work this way, while short updates to a work package may still be made directly on the main copy, committing only the exact files they touched and checking that the commit landed.

## Leaving nothing behind

When work is stopped, paused or moved to another machine, no worktree may be left over. Each finished one is either folded in or, if its owner confirms it has no value, removed; an old or unexpected worktree is a reason to look, never a reason to delete without looking. The goal is the same as for every stop: if the local copy were deleted, nothing would be lost.

## What this gives you

- Several agents can change one repository at once without collisions.
- The main copy stays working for you and for every other session.
- Work that cannot be folded in cleanly is reported, not silently abandoned.

The [next page](/docs/working-with-agents/reading-secrets-safely/) covers one thing worktrees do not protect: the passwords and keys agents sometimes need.
