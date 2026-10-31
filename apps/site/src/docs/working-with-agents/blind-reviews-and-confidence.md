---
title: Blind reviews and confidence
description: Every recommendation carries a confidence level, and an uncertain or risky one is checked by an independent agent that cannot see the answer it is meant to check.
order: 4
permalink: /docs/working-with-agents/blind-reviews-and-confidence/
sources:
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/change-management/ki-coordination/references/standards-coordination.md
    ref: 28fdc492d25435198ea8d93d605dfbd5e69cb7f3
    governs: 'Confidence levels, the masked blind review, lifting and splitting, and one recommendation per question'
    reviewed: '2026-10-31'
  - repository: knowledgeislands/ki-principal
    path: +/_WORK/ki.prj.ways-of-working/decisions.md
    ref: 34e2f7d4ff5f849be96f6666e5eff4d25eb7050b
    governs: 'Reviewers free to challenge earlier decisions'
    reviewed: '2026-10-31'
  - repository: knowledgeislands/ki-principal
    path: +/_WORK/ki.prj.ways-of-working/design/landscape-report.md
    ref: b21377cd820d3361882138f8ab9297c639b295d8
    governs: 'Two independent design reviews merged claim by claim'
    reviewed: '2026-10-31'
---

# Blind reviews and confidence

After reading this page you can tell how much weight to give each recommendation an agent puts in front of you, and why an uncertain one has already been checked by a second, independent agent before you see it.

## Confidence on every recommendation

Every question an agent brings to the owner has lettered options, and exactly one is marked as recommended. That recommendation always carries a confidence level and a one-line reason:

| Level | Read it as |
| --- | --- |
| High | The evidence was checked directly and the course is safe to take on the agent's word |
| Medium | The course looks right, but something it rests on is inferred or untested |
| Low | A judgement call, offered to start the conversation rather than to end it |

One rule keeps the scale honest: a course that deletes, resets or otherwise cannot be undone is never marked high when it rests on claims the agent has not verified itself.

## The blind review

Before a question reaches the owner, every medium- or low-confidence question, and any high-confidence one whose recommended course is destructive, goes to one **blind review**.

- The reviewer is a separate background agent on the strongest model available, working at high effort. Where independence matters it runs on a different AI product from the one that wrote the question, so the two do not share the same blind spots.
- The review is **masked**. The reviewer gets the context and the question, and the options in no particular order. It is not told which option was recommended, how confident the first agent was or why, and it never reads the work's decisions, open questions or earlier reports.
- The reviewer is free to challenge earlier decisions. The owner asked for this explicitly: a review exists to catch the case where the work has gone down the wrong avenue, so it must not simply defer to what was decided before.

The reviewer then picks its own answer and checks what it can for itself.

## What happens next

- **The reviewer agrees.** The confidence goes up one level, and its reason begins with "reviewed", so you can see the check happened. A medium becomes a reviewed high.
- **The reviewer disagrees.** Both views are shown to you side by side, and the confidence stays where it was.
- **Still below high after review.** The question is split into smaller parts, each answerable with one instruction, so that the parts the agents are sure of are not held up by the part they are not.

No question ever marks more than one option as recommended.

## The same idea at a larger scale

Design work uses the same pattern. When the shape of something is undecided, one agent writes a design brief, then two independent reviewers, on different models, read the same frozen brief without seeing each other's work. A merge then takes the brief claim by claim: agreed by both, agreed with additions, or differing. Each difference is either settled against the evidence or left open for the owner, with both views shown.

## What this gives you

- A quick way to decide how much to read: a reviewed high can usually be taken as it stands, while a disagreement deserves your attention.
- Recommendations that have survived someone trying to disagree with them, rather than an agent agreeing with itself.
- Fewer, smaller decisions, because anything still uncertain is broken down before it reaches you.

Checking the answer is one safeguard. The [next page](/docs/working-with-agents/worktrees-for-writing-runs/) covers another: keeping agents that write files out of each other's way.
