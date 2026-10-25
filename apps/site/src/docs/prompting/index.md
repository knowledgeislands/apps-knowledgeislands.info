---
title: Prompting guides
description: Model-specific prompting guidance for leading frontier and open-weight models.
order: 1
sources:
  - repository: knowledgeislands/ki-agentic-harness
    path: docs/decisions/ADR-KI-HARNESS-009-portable-model-types-not-vendor-model-names-in-governance-config.md
    ref: 7dcee9dc3aa33c863c77cb56d1bab762d026dbbb
    governs: 'The portable model-type framing these per-model guides are indexed under'
    reviewed: '2026-09-21'
---

# Prompting guides

How to prompt the leading models — one guide per model, distilled from that vendor's own model-specific prompting page and refreshed when the guidance changes. The guides support cross-model work: building on, targeting, self-hosting, or evaluating another model. Each guide carries only the deltas that are distinctive to its model — the cross-cutting principles are below, stated once.

These are guides to other people's models, not to Knowledge Islands. Everything about using a project here — the `ki` command surface, installing a harness, governing a repository, choosing a skill — is a section of its own: [The ki CLI](/docs/ki/getting-started/) carries the command-line guides and [The Agentic Harness](/docs/ki-agentic-harness/how-the-harness-works/) carries the capability governance guides.

Filenames carry the model version (`opus-4-8`, `gpt-5-5`, `glm-5-2`) so a new generation adds a file rather than rewriting an old one in place.

## The guides

### Anthropic — the tiers the harness runs

| Model | Guide | When to reach for it |
| --- | --- | --- |
| Claude Fable 5 / Mythos 5 | [Guide](/docs/prompting/fable-5/) | The hardest long-horizon, ambiguous, autonomous work — multi-hour runs, subagent orchestrations, unsolved problems |
| Claude Opus 4.8 | [Guide](/docs/prompting/opus-4-8/) | The heavy-lifting tier: reasoning, coding, agentic work where Fable 5 is overkill |
| Claude Sonnet 5 | [Guide](/docs/prompting/sonnet-5/) | Fast, cost-efficient tier: well-scoped coding and agentic tasks, high-volume or latency-sensitive workloads |
| Claude Haiku 4.5 | [Guide](/docs/prompting/haiku/) | Fastest, lowest-cost tier: mechanical/bulk steps, sub-agent fan-out, scaffolding and conform-style edits |

The model pick — how to trade cost against capability — is governed by the `ki-tokenomics` skill, while `ki-delegation` turns banked planning reasoning into bounded, cold-agent-ready execution briefs for background runs.

### Portable model types — one vocabulary across runtimes

The KI harness declares work by a portable **model type** (purpose), not a vendor's model name; each runtime resolves the type to a concrete model ([ADR-KI-HARNESS-009](https://github.com/knowledgeislands/ki-agentic-harness/blob/main/docs/decisions/ADR-KI-HARNESS-009-portable-model-types-not-vendor-model-names-in-governance-config.md), governed by `ki-tokenomics`). The type is the stable thing; the columns below are the volatile resolution.

| Type | Purpose | Claude Code | Codex (GPT-5.6) |
| --- | --- | --- | --- |
| `frontier` | Long-horizon, minimally-supervised autonomous execution — multi-hour runs, subagent orchestration | [Fable 5](/docs/prompting/fable-5/) | [Sol @ Ultra](/docs/prompting/gpt-5-6/) |
| `reasoning` | Hardest one-shot judgment — architecture, research, novel design | [Opus 4.8](/docs/prompting/opus-4-8/) | [Sol @ High/Max](/docs/prompting/gpt-5-6/) |
| `standard` | Well-scoped default — everyday coding, high-volume or latency-sensitive work | [Sonnet 5](/docs/prompting/sonnet-5/) | [Terra @ Medium](/docs/prompting/gpt-5-6/) |
| `fast` | Mechanical/bulk steps where full reasoning is wasted | [Haiku 4.5](/docs/prompting/haiku/) | [Luna @ Light](/docs/prompting/gpt-5-6/) |

Model and effort are two independent axes on both vendors' real pickers — a single config value (`reasoning = "opus, gpt-5.6-sol"`) can list both runtimes' models and each resolves the first it supports.

### Other frontier and open-weight models — cross-model reference

| Model | Guide | When to reach for it |
| --- | --- | --- |
| OpenAI GPT-5.5 | [Guide](/docs/prompting/gpt-5-5/) | Building on or comparing against the OpenAI stack: coding, agentic, knowledge work |
| OpenAI GPT-5.6 (Sol / Terra / Luna) | [Guide](/docs/prompting/gpt-5-6/) | The Codex CLI tier family (Sol/Terra/Luna × effort); the Codex-side resolution of the portable model types |
| Google Gemini 3 | [Guide](/docs/prompting/gemini-3/) | The Gemini stack: long-context, multimodal, agentic work |
| GLM-5.2 (Z.ai) | [Guide](/docs/prompting/glm-5-2/) | Leading open-weight model for agentic/coding; self-hostable under MIT |
| DeepSeek V3.2 | [Guide](/docs/prompting/deepseek-v3-2/) | Open reasoning/maths baseline; low-cost self-hosting |
| Llama 4 (Meta) | [Guide](/docs/prompting/llama-4/) | The most-deployed open-weight family; broad tooling and long context |
| Gemma 4 31B | [Guide](/docs/prompting/gemma-4/) | Local/on-device, single-GPU; Google's open, runnable option |
| Qwen3 (small / coder) | [Guide](/docs/prompting/qwen3/) | Local all-rounder and local coding on consumer hardware |
| Ministral 3 (Mistral edge) | [Guide](/docs/prompting/ministral-3/) | Local/edge on a laptop or single GPU; instruct + reasoning variants |

## Principles

These hold across current reasoning models regardless of vendor; each guide notes where its model differs.

- **Models take prompts literally.** They do what is asked and won't generalise an instruction across items or infer unrequested work — to apply something broadly, say so, and state scope up front ("do X for every file", not "do X … first").
- **Reasoning effort is the primary lever.** A per-request effort / thinking-level setting (names vary: `effort`, `reasoning_effort`, `thinking_level`) trades intelligence against latency and cost more than prompt wording does. Set it deliberately; re-measure cost when a model or its effort scale changes.
- **Communication is concise by default.** Modern models lead with the outcome and may skip an interim status or a post-tool summary. If you need one, ask explicitly — and remove old scaffolding ("summarise every N tool calls") that assumed a chattier model.
- **Don't force the model to echo its reasoning.** Read structured `thinking`/reasoning blocks for visibility; instructing the model to reproduce or explain its internal reasoning in the response is unnecessary and can trip a safety classifier on some models.
- **Give `max_tokens` headroom.** Where the response cap also covers thinking, a tight limit truncates output (`stop_reason: "max_tokens"`). Size it generously on long agentic runs.

### Anthropic-specific notes

These apply to the Claude guides only:

- **`budget_tokens` is gone; thinking is adaptive.** Manual extended thinking (`thinking: {type: "enabled", budget_tokens: N}`) now 400s on Claude 5-class models. Set [adaptive thinking](https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking) via `effort`; whether adaptive thinking is on by default differs by model (off on Opus 4.8, on on Sonnet 5).
- **Refusal / fallback.** Fable 5 runs safety classifiers and can return a `refusal` stop reason; configure a fallback to Opus 4.8. See the per-model guides.

## Refreshing

Each guide is distilled from the vendor pages its **Sources** table lists — tagged and dated. To update a guide, re-read those pages and re-date the "Last reviewed" column. The cross-cutting Anthropic reference is [Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices).
