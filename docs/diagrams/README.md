# Website diagrams

This directory holds the website-owned Archify sources, SVG figures, interactive HTML viewers and their receipts. The manifest records what each diagram answers and when to review it. Harness diagrams are vendored separately into the site assets.

Regenerate a site diagram with `bun run --cwd apps/site diagrams:build -- --svg <slug>`. See [the diagram pipeline](../guides/developer/diagrams.md) for vendoring, embedding and verification.

## Command groups

What are the eighteen `ki` command groups, and what does each operate on? The figure follows `man/ki.1` in `tools-ki` at `v0.13.0`; each node cites its manual heading.

[![The eighteen ki command groups](command-groups.svg)](command-groups.html)

## Agent environment

How do portable MCP inventory and context policy reach Claude and Codex? The figure shows intended configuration and bounded repository evidence, not live-session health. It follows the binding and tokenomics skills at harness `8897008f`.

[![Portable inventory, bindings and context policy](agent-environment.svg)](agent-environment.html)
