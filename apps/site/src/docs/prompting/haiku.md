---
title: Prompting Claude Haiku 4.5
description: Model-specific prompting guidance for Claude Haiku 4.5.
order: 5
sources:
  - url: https://www.anthropic.com/claude-haiku-4-5-system-card
    title: 'Claude Haiku 4.5 system card'
    governs: 'Capabilities (extended thinking, computer use, context awareness), benchmarks, cost/speed positioning'
    reviewed: '2026-07-13'
  - url: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
    title: 'Prompting best practices'
    governs: 'Effort-as-lever and the cross-model principles in the area index'
    reviewed: '2026-07-13'
---

# Prompting Claude Haiku 4.5

How to prompt Claude Haiku 4.5, the fastest, lowest-cost Claude tier. Read the shared [Prompting guides](/docs/prompting/) principles first; this guide carries only what is distinctive to Haiku 4.5. It is the resolution of the portable `fast` model type ([`ki-env-tokenomics`](https://github.com/knowledgeislands/ki-agent-backpack/blob/main/skills/environment/ki-env-tokenomics/references/standards-tokenomics.md), [ADR-KI-HARNESS-009](https://github.com/knowledgeislands/ki-agent-backpack/blob/main/docs/decisions/ADR-KI-HARNESS-009-portable-model-types-not-vendor-model-names-in-governance-config.md)).

## When to reach for it

Haiku 4.5 is the tier for mechanical, bulk, and high-volume steps — the fan-out members of a sub-agent orchestration, bulk classification, scaffolding, and conform-style edits — where per-step reasoning depth is not the bottleneck and throughput and cost are. It reaches near-Sonnet coding quality (SWE-bench Verified ~73% vs Sonnet's ~77%) at roughly a third of the cost and over twice the speed, which is why the recommended pattern is a **barbell**: route the bulk of traffic to Haiku and escalate only the genuinely hard cases to a `reasoning`/`frontier` type. It is the first Haiku with extended thinking, computer use, and context awareness (it tracks its remaining token budget).

## Prompting principles

| Principle | Steer |
| --- | --- |
| Bound the thinking | The single biggest lever for this tier. Limit steps, tokens, and scope explicitly ("think in 3–5 steps"; "target 120–180 tokens, never exceed 220"). It respects effort strictly at the low end — drop effort to cut thinking and cost. |
| Extended thinking is opt-in per task | Enable it for the complex cases inside an otherwise-cheap flow; thinking tokens bill as output. Leave it off for the mechanical bulk it is there to handle. |
| Prefer exemplars over prose | Short, targeted few-shots steer it more reliably than long instructions. Keep prompts tight. |
| Separate policy from task | It responds well to labelled, modular prompts (`[Context]`, `[Policy]`, `[Task]`, `[Output]`) — modular prompts scale better across a fan-out than one monolithic instruction. |
| Be explicit, request "above and beyond" | Like the larger tiers it takes prompts literally and won't infer unrequested work; if you want more than the minimum, say so. |
| Lean on context awareness | It tracks its remaining context window — useful on long tool traces, but size `max_tokens` with headroom (200k context, up to 64k output) so thinking + response don't truncate. |

## Orchestration

- **Fan-out member.** This is Haiku's home: the many parallel sub-agents in a `pipeline()` / `parallel()` block where the lever is fan-out count, not per-step quality. Keep each member's prompt bounded and self-contained.
- **Escalation, not replacement.** Default a flow to Haiku and escalate the specific steps that demonstrably need more — adversarial verify, hard synthesis — to a stronger type, rather than raising the whole flow's tier.
