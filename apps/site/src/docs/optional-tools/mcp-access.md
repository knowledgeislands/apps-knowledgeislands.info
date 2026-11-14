---
title: MCP access
order: 4
description: Consolidate the MCP servers an agent can reach, weigh the managed alternative, and evaluate a command-execution server before installing it.
sources: original
---

# MCP access

Every MCP server added to a runtime is another process to keep alive, another entry in a configuration file, and another thing holding credentials. This page covers the three ways that surface is managed here: a proxy daemon that consolidates servers behind one endpoint, the managed connectors that do the same thing without a local process, and the class of server that runs commands on your machine — which is worth evaluating carefully rather than installing because it is convenient.

## mcporter (MCP proxy daemon)

mcporter consolidates all KI-owned MCP servers behind a single keep-alive daemon and exposes them through a single HTTP MCP endpoint, reducing the `~/.claude.json` `mcpServers` block from many stdio entries to one URL entry.

```bash
brew install steipete/tap/mcporter
```

Two LaunchAgents are deployed and activated by chezmoi:

| LaunchAgent label         | Command                              | Purpose                                          |
| ------------------------- | ------------------------------------ | ------------------------------------------------ |
| `sh.mcporter.daemon`      | `mcporter daemon start --foreground` | Keep-alive process manager for all servers       |
| `sh.mcporter.http-bridge` | `mcporter serve --http 3333`         | HTTP MCP endpoint at `http://localhost:3333/mcp` |

mcporter's config lives at `~/.mcporter/mcporter.json` (chezmoi-managed). It embeds full server definitions with `"lifecycle": "keep-alive"` for each server, resolved from the same `mcp-servers-json` chezmoi template that generates the Claude Desktop config.

After `chezmoi apply` loads the plists, activate them:

```bash
launchctl load ~/Library/LaunchAgents/sh.mcporter.daemon.plist
launchctl load ~/Library/LaunchAgents/sh.mcporter.http-bridge.plist
```

Tools are exposed as `server__tool` (double underscore). `~/.claude.json` should contain only a single `ki-mcporter` URL entry under `mcpServers`:

```json
"ki-mcporter": { "type": "url", "url": "http://localhost:3333/mcp" }
```

Verify with:

```bash
mcporter daemon status          # all servers idle/running
curl http://localhost:3333/mcp  # should return a valid MCP JSON response
```

Both mcporter's `config add` and Claude Code's own `claude mcp add` only accept `http` / `sse` / `stdio` transports — a server that speaks raw WebSocket only (no HTTP/SSE/stdio front end) cannot be registered through either, mcporter included. It is not a universal bridge between transports; confirm a candidate server's transport before assuming mcporter can front it.

## claude.ai connectors — the managed alternative

For a third-party SaaS integration (GitHub, Linear, Slack, Notion, the Google and Microsoft suites, and the like) there are two ways to get its tools into a session, and a local MCP server is only one of them. The other is a **claude.ai managed connector**, authorised once in claude.ai connector settings. Given this setup, the managed route is often the lower-friction one: Anthropic handles the OAuth, so there is no local OAuth flow to complete, no keep-alive daemon or secrets on the machine, and it works on surfaces where an interactive OAuth flow cannot run (a non-interactive Claude Code session, for instance, cannot complete one — it can only use a connector that is already authorised). Managed-connector schemas load on the claude.ai web / Desktop surface, where you toggle them per-conversation in the compose-bar tools menu, rather than into the Claude Code local surface.

Which route to prefer, per integration:

| Prefer | When |
| --- | --- |
| **claude.ai connector** | A hosted connector exists and you mainly use that integration on claude.ai web / Desktop — least setup, no local OAuth. |
| **Local MCP server** | You need it in the Claude Code CLI, need tools no connector offers, or need a KI server's own access gate + audit log † |

† The KI-owned `mcp-*` servers (workspace MCPs with the annotation-driven access-level gate and audit logging) are always the local route — there is no managed equivalent.

Do not wire the same integration **both** ways on the same surface — that loads two copies of its tool schemas. `ki-env-binding` governs which surface runs which server from the single `mcps.yaml` source and audits that the surfaces agree; see [Tuning](/docs/ki-agent-backpack/tuning/) for the leanness view of the same choice.

## VS Code command-execution MCP servers — evaluate before installing

A recurring want on this surface: letting the agent trigger a VS Code command directly (e.g. "Developer: Reload Web Views" after a session `/rename`, since the extension does not refresh its own UI on rename). Community MCP servers exist that expose `vscode.commands.executeCommand()` as a callable tool — for example `louisfghbvc/mcp-vscode-commands`. Before adopting one, check two things: whether it ships a signed `.vsix`/verified publisher (unsigned third-party extensions granting arbitrary command execution over an unauthenticated local socket are a real trust boundary, not a formality), and which transport it speaks — Claude Code's `claude mcp add` and mcporter's `config add` both only accept `http` / `sse` / `stdio`, so a WebSocket-only server (as `mcp-vscode-commands` currently is) cannot be wired into either regardless of how it is packaged. No such server is currently adopted here; this is a note for the next time the want resurfaces, not a recommendation.
