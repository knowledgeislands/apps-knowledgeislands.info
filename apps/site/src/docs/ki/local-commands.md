---
title: Local utility commands
description: Inspect the local installation, reconcile managed links and editor views, and find the right maintenance command.
permalink: /docs/ki/local-commands/
order: 7
sources:
  - repository: knowledgeislands/tools-ki
    path: man/ki.1
    ref: v0.13.0
    governs: 'Local management commands and their inspection or mutation boundaries'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/tools-ki
    path: docs/guides/user/local-installation.md
    ref: v0.13.0
    governs: 'Inventory, diagnostics, repair, completion and MCP source installations'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/tools-ki
    path: docs/guides/user/vscode-management.md
    ref: v0.13.0
    governs: 'The chezmoi source boundary and editor-projection reconciliation'
    reviewed: '2026-10-25'
---

# Local utility commands

You can inspect what is installed, diagnose a broken user-skill link and preview its repair without changing a repository's governance. The local management commands at `v0.13.0` also cover completion, documentation locations and deliberate maintenance of machine-local projections.

## Find installed capabilities

`ki inventory` lists verified installed harnesses and capabilities alongside declared user skills and registered repositories. `ki harness search <query>` searches only verified installed capability names, kinds and harness identifiers, case-insensitively. A non-empty query is required; no match is a successful empty result.

`ki harness outdated` reports comparable newer release evidence and names unavailable evidence rather than claiming freshness. `ki harness missing` reports desired user capabilities without an installed provider. [Update and upgrade](/docs/ki/update-upgrade/) explains the next step when something is stale.

## Diagnose and repair

```bash
ki diag
ki doctor
ki repair --dry-run
```

`diag` gives a share-safe installation summary. Add `--full` for resolved paths and identities. `doctor` evaluates user configuration, installed harnesses and managed user-skill links, reports direct-current-directory legacy state and validates a direct `.ki.toml` without resolving its providers. Its complete report distinguishes passes, warnings, failures and skipped checks; health does not establish release freshness.

Repair previews by default. After reviewing the plan, `ki repair --apply` creates missing managed user-skill links and repoints stale or dangling symbolic links. It can remove a recognised legacy user-configuration schema marker. It never installs a harness or overwrites an unsafe ordinary file. A repository projection needs `ki repo repair` instead.

`ki cleanup` currently reports that no eligible managed stale state exists and changes no files. It recognises only a persisted, versioned KI-owned stale format; it does not guess that unfamiliar caches or directories are disposable.

## Print documentation and completion

`ki docs` prints the canonical documentation locations. Select `overview`, `site`, `manual` or `roadmap` for one location. It does not open a browser or fetch the destination. The overview points at [the ki project](/projects/ki/).

`ki completion bash` and `ki completion zsh` print shell completion generated from the registered command tree. It completes known command options and closed values locally, delegates paths to the shell and leaves opaque identifiers for you to enter.

`ki link <identifier...>` prints Markdown links to work records, including a committed historical location for a pruned record when it can establish one. It reports an unresolved identifier rather than inventing a destination.

## Reconcile editor projections

```bash
ki vscode check
ki vscode sync
```

`check` compares the local registry and declared source-store bindings with chezmoi source state. `sync` previews the reconciliation; `sync --write` updates that source after review. Review `chezmoi diff` before applying through the owning dotfiles workflow. KI never runs `chezmoi apply`.

Unavailable bound stores are omitted with an actionable warning. Store creation and binding belong to `ki repo store`, covered in [repositories and territory](/docs/ki/repositories-and-territory/).

## Other local operations

`ki markdown gfm` plans Obsidian-to-GFM link conversion for supplied files. Its preview and manifest protect a reviewed conversion, and undecided or changed input stops application. It is a conversion tool rather than a formatter.

`ki mcp install` and `update` build a governed source release in staging and activate it only after verification. `list` inspects source installations; `rollback` activates a retained complete version without fetching or building; `uninstall` removes the owned installation. These commands do not bind a server into an agent client.

`ki git check-message <file>` validates a supplied commit-message file against the portable Git message grammar without reading configuration or changing files.

[Every ki command](/docs/ki/commands/) carries the exact arguments. Use `ki <command> --help` for the grammar your installed executable supports.
