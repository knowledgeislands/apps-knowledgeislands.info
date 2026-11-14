---
title: chezmoi
order: 2
description: Manage dotfiles and machine-level configuration in a Git repository, including the Claude Desktop configuration an agent cannot safely edit in place.
sources: original
---

# chezmoi

A machine's configuration is state that outlives any one session and belongs in version control, but most of it sits in dotfiles scattered across a home directory where nothing tracks a change and nothing reverts one. chezmoi puts that configuration in a Git repository and applies it to the machine, which is what makes a machine-level change reviewable rather than remembered.

[chezmoi](https://www.chezmoi.io) manages the dotfiles and machine-level config this guide references — the per-repo `CLAUDE.md` imports and the `headroom-ai` and `mcporter` LaunchAgent plists. Machine-specific state (which `headroom-ai` mode is active, OAuth client secrets resolved from 1Password) is chezmoi-templated rather than hand-edited, so `chezmoi diff` / `chezmoi apply` is the way to pick up drift rather than editing the rendered files directly.

```bash
brew install chezmoi
chezmoi init <your-dotfiles-repo>
chezmoi apply
```

## Quick reference: re-add a Claude Desktop configuration

Use this only to bring an app-edited configuration back into chezmoi source state. Quit Claude Desktop first. The KI-managed MCP server list belongs in its canonical source, not in the rendered Desktop file.

```bash
chezmoi re-add --dry-run "$HOME/Library/Application Support/Claude/claude_desktop_config.json"
chezmoi re-add "$HOME/Library/Application Support/Claude/claude_desktop_config.json"
chezmoi diff
chezmoi apply -v
```

`re-add` preserves an existing chezmoi template; review `chezmoi diff` before applying. Use this path for settings outside the template-owned MCP server block.
