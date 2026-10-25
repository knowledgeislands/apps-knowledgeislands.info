---
title: Tune an agent session
description: Reduce standing context and runtime cost while retaining the capabilities an agent needs.
permalink: /docs/ki-agentic-harness/tuning/
order: 6
sources:
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/environment/ki-tokenomics/references/standards-tokenomics.md
    ref: 77ec746d2c16cb0e46d15bd175d8d27c35ca3285
    governs: 'The standing-surface and runtime budget model this operator guide defers to'
    reviewed: '2026-09-27'
---

# Tune an agent session

How to make a session lean — which tools, skills, and MCP servers actually load, and where to cut. This is the operator _how_; the _why_ and the normative budget live in the `ki-tokenomics` skill and its tokenomics standard, which this guide defers to throughout.

A note on invocations: this guide uses the native repository host. Run a focused audit as `ki repo audit --skill <skill> --repo <repository>`; omit `--repo` when the current directory resolves to the intended KI worktree. Package aliases and repository-local checker paths are not governance entrypoints.

## The one distinction that matters

Every token in a session is either **standing surface** or **runtime**.

- **Standing surface** — the tool definitions, skill descriptions, MCP tool schemas, `CLAUDE.md`, and memory index that are sent in the request prefix on _every_ turn. This dominates a long session because it is re-paid each turn, and it is part of the cacheable prefix. You shrink it by _not loading things_, not by compressing them.
- **Runtime** — the tool results, logs, and conversation that accrue as the session runs. You shrink this by compression (Headroom), verbosity discipline, and compaction.

The levers below are grouped by which of the two they act on. The single biggest mistake is reaching for a runtime tool (a compression proxy) to solve a standing-surface problem (too many MCP schemas loaded) — see [Why a compression proxy is the wrong tool for MCP schemas](#why-a-compression-proxy-is-the-wrong-tool-for-mcp-schemas).

## Standing surface — cut what the session does not need

### Disable built-in tools you never use

Claude Code's own built-in tools (Workflow, Artifact, the advisor, background tasks, …) are not connectors with a settings menu — they ship with the client. A subset can be **fully removed** from the toolset — not just permission-gated — via environment variables in the `env` block of `~/.claude/settings.json`. Because the `env` block is read once at startup and is stable for the whole session, disabling here shrinks the fixed prefix without churning the prompt cache.

```json
{
  "env": {
    "CLAUDE_CODE_DISABLE_WORKFLOWS": "1",
    "CLAUDE_CODE_DISABLE_ARTIFACT": "1"
  }
}
```

The context-relevant toggles, each verified to exist as a literal string in the shipped CLI binary:

| Environment variable | Removes from the toolset | Notes |
| --- | --- | --- |
| `CLAUDE_CODE_DISABLE_WORKFLOWS` | The `Workflow` tool | Largest single built-in description — it inlines a scripting DSL |
| `CLAUDE_CODE_DISABLE_ARTIFACT` | The `Artifact` tool | Drop if you never publish claude.ai artifacts |
| `CLAUDE_CODE_DISABLE_ADVISOR_TOOL` | The advisor tool | — |
| `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS` | `Monitor` and background-shell tooling | Keep if you rely on long-running watches |
| `CLAUDE_CODE_DISABLE_CRON` | `CronCreate` / `CronList` / `CronDelete` | — |
| `CLAUDE_CODE_DISABLE_AGENT_VIEW` | Background-agent view / `--bg` support | — |
| `CLAUDE_CODE_DISABLE_BUNDLED_SKILLS` | _All_ of Claude Code's own bundled skills | This repo's own `ki-*` skills are unaffected † |
| `CLAUDE_CODE_DISABLE_CLAUDE_API_SKILL` | Just the bundled `claude-api` skill | Finer-grained than the all-or-nothing flag above |
| `CLAUDE_CODE_DISABLE_CLAUDE_CODE_SKILL` | Just the bundled `claude-code` guide skill | — |
| `CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS` | The git-guidance block of the system prompt | Drop if you don't want git conventions in-session |

† The bundled skills are Claude Code's own (dataviz, web-perf, and the like), discovered separately from the `~/.claude/skills/` and project-local `.claude/skills/` links this harness installs.

The flag _names_ are confirmed present in the binary; each flag's precise effect is inferred from its name and the settings schema. After setting any of them, restart and confirm the tool or skill has actually left the surface with `/context`.

**Do not disable these** — they save tokens but break the harness:

- `CLAUDE_CODE_SAFE_MODE` — the blunt instrument: also stops `CLAUDE.md`, hooks, MCP servers, and custom commands from loading.
- `CLAUDE_CODE_DISABLE_AUTO_MEMORY` — drops the whole `memory_*` tool block; this harness relies on per-project auto-memory.
- `CLAUDE_CODE_DISABLE_CLAUDE_MDS` — drops `CLAUDE.md` loading, i.e. the harness's entire always-on orientation.

### Load only the MCP servers a surface needs

MCP tool schemas are the **largest standing cost** in a session with several servers connected. The lever is _not loading the server_, not compressing it:

- **Per surface** — `ki-binding` governs the single `mcp-servers.yaml` inventory and each server's `clients:` targeting. `ki-binding-claude` and `ki-binding-chatgpt` govern their runtime-native surfaces. A server the current surface never uses should not be enabled on it.
- **Per project** — scope servers to the repos that need them rather than enabling them globally.
- **Connectors vs plugins** — on claude.ai / Desktop, the MCP tools bucket is driven by _connectors_ (e.g. Google Calendar / Drive / Slack), toggled per-conversation in the compose-bar tools menu. These are distinct from _plugins_ (which surface under Skills / Custom agents). Turn off a connector for a conversation that does not need it. For a SaaS integration, a managed connector is often the lower-friction route than a local MCP server in the first place — see [Optional tools](/docs/optional-tools/#claudeai-connectors--the-managed-alternative).
- **The mcporter caveat** — mcporter (see [Optional tools](/docs/optional-tools/)) consolidates the `~/.claude.json` `mcpServers` block from many entries to one URL. That trims _config_, not the in-session tool _schemas_ — every consolidated server's tools still load into the prefix. mcporter and schema curation are complementary, not substitutes.

### Manage the MCP inventory

The list lives across several layers, and the `/mcp` command only touches one of them:

- **This session (transient)** — `/mcp reconnect|enable|disable [<server>|all]` retries or toggles a server for the current session only. A "not connected" server usually means it is not _authorized_ rather than misconfigured; run `/mcp` in the interactive terminal to complete the OAuth flow (it cannot run in a non-interactive session).
- **Local Claude Code config (`~/.claude.json`)** — the machine-local, per-user Claude Code state file. Among other things it holds the `mcpServers` block; in this setup that block is reduced to a single `ki-mcporter` URL entry, because the KI-owned servers are consolidated behind mcporter rather than listed one by one. It is not chezmoi-managed, so treat it as generated — do not hand-edit the `mcpServers` block.
- **mcporter config (`~/.mcporter/mcporter.json`, chezmoi-managed)** — the inventory of local KI servers the daemon keeps alive; `mcporter daemon status` lists them. Add or remove a _local_ server here, not in `~/.claude.json`.
- **Source of truth (`$XDG_CONFIG_HOME/ki/mcp-servers.yaml`, governed by `ki-binding`)** — the single list carrying each server's `clients:` targeting. `ki-binding-chezmoi` may materialise it from chezmoi; the runtime adapters own their native projections. Edit the managed source, apply its renderer when present, then restart the affected runtime.
- **Cloud connectors (claude.ai settings)** — Calendar / Drive / Slack / M365 / Notion-type connectors are managed in claude.ai connector settings and the compose-bar tools menu, not in any local file.

### Defer tool schemas with the Tool Search Tool — and beware the proxy gap

Claude Code has a native **Tool Search Tool**: rather than materialising every built-in and MCP schema into the prefix up front, it defers them server-side and loads each on demand when a task needs it. The `Workflow` tool relies on the same mechanism ("Workflow agents can reach all session-connected MCP tools via ToolSearch — schemas load on demand per agent"). At the protocol level an MCP server can also vary its advertised surface at runtime via `tools/list_changed`, and Claude Code has a tool-availability lifecycle (`CLAUDE_CODE_MCP_TOOL_IDLE_TIMEOUT`).

**The gap that bites this harness:** a custom `ANTHROPIC_BASE_URL` — which this setup sets to point Claude Code at the local headroom proxy — **silently disables the deferral** unless `ENABLE_TOOL_SEARCH` is _also_ set explicitly. Without it, every schema (built-in plus every connected MCP server) is eagerly loaded on every session. One observed session spent **71.1k tokens (≈36% of a 200k window) on tool definitions alone** — 44.1k built-in plus 27.0k MCP — before any conversation content. The fix is one line in the `env` block of `~/.claude/settings.json`:

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "http://127.0.0.1:8787",
    "ENABLE_TOOL_SEARCH": "true"
  }
}
```

It takes effect on the _next_ session start — it does not shrink an already-loaded context. Confirm with `/context`: the deferred tools move out of the standing surface and appear only once searched. In one measured before/after, built-in tools fell from **44.1k to ≈9k** tokens and the MCP schemas dropped out of the standing surface entirely. (The silent-disable is a known headroom interaction, tracked upstream as chopratejas/headroom issue #746.)

The trade-off is the prompt cache: deferral shifts cost from a fixed standing tax to a per-first-use discovery cost. With a large surface that is mostly idle — the common case here — it is a decisive win; it only approaches a wash if nearly every tool is used every turn.

### Trim CLAUDE.md, memory, and skill descriptions

The prose surface — `CLAUDE.md` and its `@imports`, the `MEMORY.md` index, and each installed skill's `description` — is standing cost too. The `ki-tokenomics` skill catalogues and budgets it; `ki repo audit --skill ki-tokenomics` measures it. Keeping the always-needed set small and the rest scoped to the active repository keeps unrelated skills' descriptions out of a session in the first place.

Memory is the one layer where two different audits apply, and they are complementary — do the hygiene pass first, because it usually shrinks the surface the cost pass then measures:

- **Hygiene (Claude housekeeping)** — whether the `memory/*.md` entries are still true, correctly typed (user / feedback / project / reference), agree with the index, and are reconciled (a fact promoted to a `CLAUDE.md` must be _deleted_ from memory, not left in both). `ki repo audit --skill ki-housekeeping-claude` runs the memory audit over the selected repository's Claude store.
- **Cost (Claude tokenomics evidence)** — how many tokens the `MEMORY.md` index and the injected memory block add to the standing prefix. `ki repo audit --skill ki-tokenomics-claude` reports the runtime evidence; `ki-tokenomics` owns the portable budget.

The scope rule the hygiene pass enforces is also the cheapest way to keep the index small: repo-specific guidance belongs in that repo's `CLAUDE.md`, cross-project personal preferences in `~/.claude/*.md`, and only genuine user/reference facts stay in memory. Machine-generated noise — stale "learned patterns" blocks, another repo's paths — is both a hygiene failure and dead standing cost; prune it here rather than compressing it at runtime.

There is a fourth route for substantial guidance that is relevant only to a recognisable class of task: promote it from always-on `CLAUDE.md` prose into an on-demand skill. The skill's `description` remains a small standing selection cost, but its body loads only when triggered, so a self-contained occasional procedure or domain playbook can become much cheaper. Do not lift one-line rules or default-behaviour gates blindly — the description may cost more than the line saves, and a behaviour the agent must apply without an explicit task trigger still needs a concise always-loaded anchor. Invoke the [`ki-skills` skill](/docs/skills/catalogue/#ki-skills) to judge whether the material is substantial, situational, self-contained, discoverable, and safely anchored before promoting it.

### When the hygiene audit reports issues

`ki repo audit --skill ki-housekeeping-claude` is only the mechanical, read-only half — it reports; it does not fix. When it flags anything, hand the store to the skill's CONFORM mode rather than hand-editing against the findings: `/ki-housekeeping-claude` CONFORM applies the judgment the checker can't — deciding whether an entry is still true, which layer it belongs in (memory vs. a `CLAUDE.md`), and what to prune vs. reword. Re-running that audit afterwards confirms `FAIL=0`; `ki repo audit --skill ki-tokenomics-claude` then shows whether the prune moved the cost number.

### Watch what `headroom learn` writes into the prefix

Headroom's `--learn` mode (the `proxy_args` lever, not a runtime one) mines live traffic for command-substitution and error-recovery patterns and writes them back — between `<!-- headroom:learn:start -->` / `<!-- headroom:learn:end -->` markers — into `MEMORY.md` and the project `CLAUDE.md`. This is the one Headroom feature that _adds_ to the standing surface rather than compressing runtime: every learned line is re-paid on every turn. Left unattended the block grows, and because it is machine-generated from whatever repo you happened to be in, it accumulates cross-repo paths and stale commands — dead weight in the always-on prefix (this harness's `MEMORY.md` had picked up ~1.5k tokens of another repo's entries).

Treat it as a curated cache, not an append-only log:

- **Keep, don't hand-tune** the entries — the block regenerates, so edits inside the markers are lost. Prune by clearing the content and leaving the two markers in place (that preserves the injection point and keeps the hygiene checker's `IDX-5` marker check green).
- **Re-learn after moving repos** so the patterns reflect where you actually work, rather than carrying another island's recovery commands.
- **Fold it into the audits above** — the learned block counts against the `MEMORY.md` / `CLAUDE.md` budget (tokenomics) and is exactly the "machine-generated noise" the hygiene pass prunes. If either audit flags the memory or `CLAUDE.md` layer, check this block first.

## Runtime — compress and cache what does load

- **Headroom** compresses tool _results_ — it reversibly substitutes large output blocks it has already seen in the stream (see [Optional tools](/docs/optional-tools/) for proxy vs wrap mode). This is a runtime lever; it does not touch tool definitions.
- **Prompt caching** rewards a stable prefix. Set your `env` disables once and leave them; avoid anything that mutates the tool list mid-session.
- **Model tier, compaction, verbosity** — right-cost model for the work, compaction hygiene on long conversations, and not dumping raw logs into the turn. The `ki-tokenomics` standard covers each.

## Why a compression proxy is the wrong tool for MCP schemas

A recurring temptation is to have Headroom (or any `ANTHROPIC_BASE_URL` proxy) strip MCP tool definitions from the request when the session's task does not need them. It does not do this, and should not:

- A proxy sees bytes, not intent — it cannot safely know which tools a task will call. Strip one the model then invokes and the turn errors.
- The `tools` array is part of the cacheable prefix. Mutating it per turn busts the prompt cache for everything downstream, trading a fixed standing cost for repeated cache-miss costs.

"This session does not need these tools" is answered by _not loading the server_ (per-surface `ki-binding`, per-project scoping) or by deferred loading (ToolSearch) — both above — not by compressing a schema that was loaded anyway.

## When the cost audit reports issues

`ki repo audit --skill ki-tokenomics` is the mechanical, read-only half — it measures and flags; it does not cut. Budgets are **WARN-only** (a `warn` is a prompt to look, not a build break) and every figure is a `~chars/4` estimate, so treat them as directional. When it flags a layer, hand it to `/ki-tokenomics` CONFORM rather than working codes by hand: the mode applies the judgment the checker can't — whether an over-budget layer earns its size or should be cut, which layer a fact belongs in, and whether a model-tier or Headroom setting actually fits the work. The concrete cuts it draws on — disabling unused built-ins, scoping MCP servers per surface, trimming the standing prose — are the levers documented earlier in this guide.

The memory layer is the one exception worth calling out: a `MEMORY.md` overage is the same content the [hygiene pass](#when-the-hygiene-audit-reports-issues) prunes, so fix it upstream in the store (via `/ki-housekeeping-claude` CONFORM), not with a runtime lever. Re-run the audit afterwards to confirm the number moved.

## A starting profile for this harness

This repo is a governance-skills repo: it does not lean on `Workflow`, and it keeps several MCP servers connected. A reasonable, fully reversible starting point:

1. **First, and highest-value:** because this setup points `ANTHROPIC_BASE_URL` at headroom, set `ENABLE_TOOL_SEARCH: "true"` in the `env` block so tool-schema deferral is not silently off. This alone reclaims tens of thousands of standing tokens.
2. Optionally disable built-ins you never use — `WORKFLOWS`, `ARTIFACT`, `ADVISOR_TOOL`, and the two bundled guide skills (`CLAUDE_API_SKILL`, `CLAUDE_CODE_SKILL`). With deferral on this matters less, but it removes them from discovery entirely.
3. Keep memory, `CLAUDE.md`, and background/cron tooling unless you have measured they go unused.
4. Treat MCP curation via `ki-binding` (and per-conversation connector toggles) as the structural lever — audit which servers each surface actually needs.
5. Restart, confirm with `/context`, then re-measure with `ki repo audit --skill ki-tokenomics-claude` and iterate against the budgets in the portable `ki-tokenomics` standard.
