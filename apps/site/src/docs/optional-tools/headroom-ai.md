---
title: headroom-ai
order: 3
description: Reduce the token cost of agent sessions, and measure whether the reduction is actually happening on the runtime you use.
sources: original
---

# headroom-ai

Long sessions cost money in proportion to what is in the context window, and most of what accumulates there has stopped earning its place. headroom-ai sits between an agent and its model to cut that cost. The part worth your attention is not the install; it is the coverage table below, because an installed tool, a running proxy and a healthy endpoint together establish nothing about whether your traffic is routed through it.

headroom-ai provides context compaction management (`PreCompact` hook) and shell-output compression via its bundled RTK component.

```bash
brew install headroom-ai
```

headroom-ai runs in one of two modes:

- **Proxy mode** — `headroom proxy` starts a local proxy on port 8787; Claude Code is pointed at it via `ANTHROPIC_BASE_URL=http://127.0.0.1:8787`.
- **Wrap mode** — `headroom claude` wraps the Claude CLI directly without a separate proxy process.

The current machine's chezmoi config records which mode is active.

## Coverage by runtime

Headroom is not a machine-wide or generic desktop-application proxy.

Treat an agent as covered only when its model requests appear in Headroom's proxy statistics or logs.

An installed Headroom MCP server, a running local proxy, or a healthy `/health` response does not establish model-traffic coverage.

| Runtime                      | Current model-traffic coverage | Evidence                                |
| ---------------------------- | ------------------------------ | --------------------------------------- |
| Claude Code                  | Routed once configured         | Proxy statistics or logs                |
| Claude Desktop               | Direct — not covered           | No desktop proxy route                  |
| ChatGPT / Codex Desktop      | Direct — not covered           | No active proxy route                   |
| Other API-compatible clients | Conditional                    | Explicit proxy or wrapper configuration |

Claude Code is the supported, measured path: `ANTHROPIC_BASE_URL` or the Headroom wrapper points its CLI at the local proxy.

Claude Desktop's subscription-backed traffic is not routed by the CLI integration.

Its MCP configuration is separate and does not proxy chat traffic.

The formerly managed ChatGPT/Codex proxy route is intentionally disabled until a supported path proves reliable telemetry and meaningful savings.

Verify every other client separately; coverage never carries over from another runtime.

Check a claimed route with `headroom perf --hours 1 --format json` or the local `/stats` endpoint, and confirm the relevant client appears in the result before relying on it for token savings.
