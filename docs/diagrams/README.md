# Website diagrams

This directory holds the website-owned Archify sources, SVG figures, interactive HTML viewers and their receipts. The manifest records what each diagram answers and when to review it. Harness diagrams are vendored separately into the site assets.

Regenerate a site diagram with `bun run --cwd apps/site diagrams:build -- --svg <slug>`. See [the diagram pipeline](../guides/developer/diagrams.md) for vendoring, embedding and verification.

## Command groups

What are the eighteen `ki` command groups, and what does each operate on? The figure follows `man/ki.1` in `tools-ki` at `v0.13.0`; each node cites its manual heading.

[![The eighteen ki command groups](command-groups.svg)](command-groups.html)
