---
title: Optional tools
order: 1
description: Evaluate optional machine-level tools for configuration, context management, skill discovery, and MCP access.
permalink: /docs/optional-tools/
sources: original
---

# Optional tools

Optional user- and system-level tools that affect a person's machine rather than a governed repository. Skills, MCP servers, and day-to-day sessions can benefit from them, but none is required merely to read or audit the backpack. [Install and get started](/docs/ki/getting-started/) explains `ki bootstrap`, explicit skill activation, and when optional user-environment setup is appropriate.

The pages that follow cover one tool or one class of tool each: [chezmoi](/docs/optional-tools/chezmoi/) for machine configuration, [headroom-ai](/docs/optional-tools/headroom-ai/) for context cost, [MCP access](/docs/optional-tools/mcp-access/) for the servers an agent can reach, [Codex skill discovery](/docs/optional-tools/codex-skill-discovery/) for a gap in one runtime, and [what is being watched](/docs/optional-tools/under-observation/) but not adopted. Read this page first, because the questions below are what decided each of them.

The same five questions decide every candidate, and they are worth asking in this order because each one can end the evaluation:

1. **Supply-chain provenance.** Who publishes it, from where, and is a release pinned to something immutable? A tool that installs from a moving branch into your agent's path is a standing risk regardless of how good it is.
2. **Permission model.** What can it read, and what can it send? Anything sitting between an agent and a model sees every prompt, including whatever was in context at the time.
3. **Runtime fit.** Does it work with the runtimes you actually use, or only with the one its author uses? Multi-runtime claims are common and often thin.
4. **Maintenance.** Is there evidence of sustained upkeep rather than a strong first release? Agent tooling moves fast enough that a six-month gap is usually terminal.
5. **Claimed effects, measured.** Token and cost claims are the reason most of these exist and the least often verified. Measure in a contained evaluation against your own traffic; vendor benchmarks rarely transfer.

The [Headroom coverage table](/docs/optional-tools/headroom-ai/#coverage-by-runtime) is the worked example of why the last one matters: an installed tool, a running proxy and a healthy endpoint together establish nothing about whether your model traffic is actually routed through it.
