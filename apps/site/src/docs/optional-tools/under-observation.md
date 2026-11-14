---
title: Under observation
order: 6
description: Research leads in model routing, MCP gateways, context compression and rival harnesses — recorded as places an evaluation could start, not as recommendations.
sources: original
---

# Under observation

Nothing on this page is adopted here, and a link on it is not a recommendation. These are the areas where something better than the current arrangement might appear — routing requests between models, consolidating MCP servers, compressing context, and other people's answers to the problem Knowledge Islands exists to solve. Each entry is a place an evaluation could start; the five questions on [Optional tools](/docs/optional-tools/) are how one would finish.

These are research leads, not backpack dependencies or recommendations. Nothing on this page has been assessed by this site, and a link here is a record of where an evaluation could start — not evidence that a project is secure, active, maintained, compatible, or suitable for Knowledge Islands use.

## Model routing and identity

The problem is sending different requests to different models — cheap ones for mechanical work, capable ones for reasoning — without rewriting how each agent is configured. The risk is that a router becomes an undeclared dependency sitting in the credential path of every request.

[Claude Code Router releases](https://github.com/musistudio/claude-code-router/releases), [routectl releases](https://github.com/meepolabs/routectl/releases), [9router](https://github.com/decolua/9router).

## MCP aggregation and gateways

The problem is that each MCP server added to a runtime is another process, another entry in a configuration file, and another thing to keep alive. A gateway consolidates them behind one endpoint. This is the area where something is already adopted here — [mcporter](/docs/optional-tools/mcp-access/) — so the watch is for whether a better consolidation appears, particularly around discovery.

[MCPorter change log](https://github.com/openclaw/mcporter/blob/main/CHANGELOG.md), [AIRIS MCP Gateway](https://github.com/agiletec-inc/airis-mcp-gateway).

## Context compression

The problem is that long sessions fill a context window with material that has stopped earning its place, and the compaction a runtime does by itself is blunt. The risk is specific and worth naming: a compressor that silently drops or rewrites content changes what the agent believes, and a wrong answer produced from a lossily compressed context looks exactly like a wrong answer produced from a complete one.

[RTK releases](https://github.com/rtk-ai/rtk/releases), [Headroom releases](https://github.com/chopratejas/headroom/releases), [LeanCTX](https://github.com/yvgude/lean-ctx).

## Harnesses and working methods

The problem is the one Knowledge Islands exists to solve, approached differently. These are other people's answers to how an agent should be given capability and discipline, and they are worth reading for their ideas whether or not anything is adopted. The evaluation question is not "is this good" but "does this contain a mechanism that would work better than ours" — which is a reading exercise, not an installation.

[Superpowers](https://github.com/obra/superpowers), [OpenClaw 2026.7.1](https://github.com/openclaw/openclaw/releases/tag/v2026.7.1), [Pi releases](https://github.com/earendil-works/pi/releases), [caveman releases](https://github.com/JuliusBrussee/caveman/releases), [Odysseus](https://github.com/pewdiepie-archdaemon/odysseus), [Omnigent](https://github.com/omnigent-ai/omnigent), [Claurst](https://github.com/Kuberwastaken/claurst).

The watch sources on this page were last reviewed on 2026-07-20.
