---
title: Agent environment
description: How portable MCP declarations, runtime bindings, context policy, local housekeeping and the two radars fit together.
order: 7
permalink: /docs/ki-agentic-harness/agent-environment/
sources:
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/environment/ki-binding/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The portable inventory and host surface selection'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/environment/ki-binding-claude/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Claude runtime comparison and the cloud convention'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/environment/ki-binding-chatgpt/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Codex native merge boundary'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/environment/ki-binding-chezmoi/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The reviewed chezmoi rendering path'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/environment/ki-tokenomics/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Portable budgets and model-purpose policy'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/environment/ki-tokenomics-claude/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Claude repository evidence limits'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/environment/ki-tokenomics-chatgpt/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Codex repository evidence limits'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/environment/ki-housekeeping-claude/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Claude state and repository-scoped memory policy'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/environment/ki-housekeeping-chatgpt/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Opaque ChatGPT stores and Codex memory and session safeguards'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/governance/ki-agentic-radar/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Evidence-backed agentic maturity and stance'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/governance/ki-model-radar/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Models, routes and bounded evaluation evidence'
    reviewed: '2026-10-25'
---

# Agent environment

Your agent environment connects the capabilities you intend to use with the runtime that can reach them. You can keep that setup understandable by separating its portable inventory, runtime bindings, context policy and local state, and reviewing evidence before adopting a new tool or model.

{% figure "agent-environment", "The MCP inventory reaches selected runtimes through bindings; portable context policy reaches them through separate evidence adapters." %}

## What it is

The environment is the set of declarations and local controls around a Claude or Codex session. Four concerns work together: which MCP servers a client should reach, how those declarations reach its native configuration, what context and model purpose the work calls for, and how accumulated local state is reviewed.

Two radars maintain reviewed evidence about agentic technologies and model routes. They inform choices without silently changing the environment.

## How it works

The portable MCP inventory lives in `$XDG_CONFIG_HOME/ki/mcp-servers.yaml`, normally `~/.config/ki/mcp-servers.yaml`. `ki-binding` owns its schema and client targeting; an explicit `KI_MCP_SOURCE` can select another source. Each server names its clients and defines either a local command or a URL. URL entries declare a supported transport for every targeted client. Secret references can point to 1Password without making secret values part of the portable declaration.

The binding skills keep that source distinct from its projections:

- `ki-binding` checks the portable source and explicitly selected mcporter evidence. A host-bound session reaches KI services through that host's mcporter bridge.
- `ki-binding-claude` compares Claude Code and Desktop configuration. The claude.ai web surface is a cloud-connector convention, without a local render target. There is no KI Cowork plugin projection.
- `ki-binding-chatgpt` compares Codex native MCP definitions. Its renderer uses `codex mcp add` at the application-owned TOML merge boundary and preserves unrelated configuration. Unsupported replacement state is refused before removal.
- `ki-binding-chezmoi` checks the source-data, render-partial and target-template chain where chezmoi is the chosen renderer. Review `chezmoi diff` before an authorised apply.

Context policy follows a separate path. `ki-tokenomics` owns portable budgets and model-purpose categories; `ki-tokenomics-claude` and `ki-tokenomics-chatgpt` report bounded repository evidence for their runtimes. A file declaration does not establish a session's loaded context, effective model or active tools.

## How you use it

For the fictional Harbour Atlas island, first decide which client needs a server and declare that targeting in the selected inventory. Audit the portable source and matching binding, preview the supported rendering path, review the change and restart or reconnect the affected runtime. Confirm connection health separately.

When reviewing cost, use [tuning](/docs/ki-agentic-harness/tuning/) to distinguish standing instructions and tool definitions from growing conversation and tool results. The four model purposes are fast, standard, reasoning and frontier; choose for the work rather than assuming a product name establishes its purpose.

Review local state with the matching housekeeping skill. `ki-housekeeping-claude` covers Claude state and bounded native-memory evidence. `ki-housekeeping-chatgpt` distinguishes opaque ChatGPT store changes from Codex local memory and exact-repository session inventory. Both require an explicit repository memory policy: disabled, transition or enabled. Agent-local memory is off by default; enabling it is a deliberate project exception. During reconciliation, route durable learning into reviewed repository guidance or knowledge-base notes and preserve source material until its retirement is approved.

## What it provides

You get one portable declaration of intended MCP access, a clear owner for each runtime projection and a context policy that can be discussed independently of a vendor's current model names. Housekeeping keeps local state from becoming an unreviewed source of durable knowledge.

`ki-agentic-radar` records evidence about protocols, interfaces, organisations, architectures and research, separating maturity, implementation, interoperability and KI stance. `ki-model-radar` records models, executable routes and benchmark applicability, keeping recommendation, support and retirement distinct. Both retain uncertainty and counter-evidence; inward movement needs evidence of local fit. A provider claim alone does not establish adoption.

## Boundaries

Source, rendered configuration, applied state, activation and runtime health are separate claims. Each needs its own evidence. A runtime on one host does not assume access to another host's loopback bridge.

Tokenomics reports do not rewrite configuration. Radar reviews do not install integrations, buy model access or select runtime defaults. Opaque ChatGPT store bytes are not readable conversation knowledge. Session inventory and memory warnings do not authorise capture or deletion; Codex thread deletion requires exact reviewed selection and explicit permanent-deletion confirmation.
