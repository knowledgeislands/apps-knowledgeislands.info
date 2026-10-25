---
title: Tune an agent session
description: Separate standing context from growing conversation, inspect repository evidence and keep runtime claims bounded.
order: 6
permalink: /docs/ki-agentic-harness/tuning/
sources:
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/environment/ki-tokenomics/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Portable budgets, model purpose and report-only conformance'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/environment/ki-tokenomics/references/standards-tokenomics.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Budget categories, attribution and source-consumption policy'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/environment/ki-tokenomics-claude/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Bounded Claude repository evidence'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/environment/ki-tokenomics-chatgpt/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Bounded Codex repository evidence'
    reviewed: '2026-10-25'
---

# Tune an agent session

Tuning starts by separating the context an agent carries throughout a session from the material it gathers while working. That distinction helps you reduce avoidable cost while keeping the instructions, tools and judgement the task actually needs.

## What it is

**Standing surface** is the recurring context: repository instructions, available skill descriptions, tool definitions and relevant settings. **Runtime context** grows through conversation, tool results and other work during the session.

Smaller tool results help the second category. Selecting only relevant capabilities helps the first. A compression tool does not decide which instructions or MCP capabilities the task needs.

## How it works

`ki-tokenomics` owns the portable policy: budgets, attribution and model-purpose categories. `ki-tokenomics-claude` and `ki-tokenomics-chatgpt` supply bounded evidence from the selected repository.

The default budgets are 2,500 estimated instruction tokens, 1,000 for the memory index, 4,000 for skill descriptions, five MCP servers and 30,000 estimated tokens overall. A repository can declare its own values in `[skills.ki-tokenomics.budgets]`. Budget overages warn; malformed recognised configuration fails. These are guide rails, not billing figures or proof of effective loaded context.

The adapters inspect repository files, not the live session. Claude evidence includes instruction files and contained imports, rules, settings and MCP declarations. Codex evidence includes project configuration, `AGENTS.md`, custom agents and repository skills. Neither adapter infers the effective model, active tools, memory use, billing or compaction totals from those files.

## How you use it

1. Ask the portable audit to validate the repository's policy.
2. Inspect the matching runtime adapter's evidence and the limits it reports.
3. Review whether each standing instruction and capability earns its place for this work.
4. Route a change to the owner of that artefact, then check the affected runtime separately.

```bash
ki repo audit --skill ki-tokenomics
ki repo audit --skill ki-tokenomics-claude
ki repo audit --skill ki-tokenomics-chatgpt
```

Use the adapter that applies to your runtime and declared coverage. Keep portable guidance concise in `AGENTS.md`, place runtime detail in the matching runtime surface and use on-demand skills for substantial occasional procedures. Read bounded source ranges and requested fields before whole files or broad dumps; use full content when exactness requires it.

## What it provides

Model-purpose policy separates a task's needs from provider product names: `fast` for mechanical or bulk work, `standard` for well-scoped default work, `reasoning` for difficult judgement and `frontier` for long-horizon autonomous work. A coordinating thread uses a fast, low-effort model, or standard when necessary for reliable coordination, and delegates substantive reasoning.

The audits make evidence and ownership visible. MCP design belongs with the server, skill-description quality with the skill, and runtime configuration with its adapter. [Agent environment](/docs/ki-agentic-harness/agent-environment/) connects these concerns to bindings, housekeeping and the radars.

## Boundaries

Tokenomics conformance is report-only: it does not change configuration or select a model. A budget warning is a reason to review the context, not an instruction to delete material.

Runtime defaults and loaded-session behaviour require their own evidence. Do not treat a static audit as confirmation that a toggle took effect or that a session became cheaper.
