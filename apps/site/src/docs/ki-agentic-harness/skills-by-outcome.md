---
title: Choose a skill by outcome
description: Route a plain-language outcome to the smallest Knowledge Islands skill or journey that serves it.
permalink: /docs/ki-agentic-harness/skills-by-outcome/
order: 5
sources:
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/README.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The skill names and responsibilities the outcome routes resolve to'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/governance/ki-diagrams/references/standards-diagrams.md
    ref: f70599fc8a122c5b56ec34245749d668e1774d80
    governs: 'The ki-diagrams route and what the Diagrams standard keeps'
    reviewed: '2026-10-09'
---

# Choose a skill by outcome

Use this guide when you know what you want to achieve but do not yet know the Knowledge Islands skill name. It routes common outcomes to the smallest useful capability or journey. For the complete source-of-truth inventory, exact argument hints, runtime bindings, and formal dependencies, use the generated [capability catalogue](https://github.com/knowledgeislands/ki-agentic-harness/blob/main/skills/README.md#generated-capability-catalogue).

You can ask for an outcome in plain language or invoke the named skill directly. Start with the narrowest route below; a skill's own HELP explains its modes and off-ramps before acting.

## Establish or govern a repository

- **Start using Knowledge Islands on a machine** — use `ki-bootstrap` for first-time CLI bootstrap, canonical Harness selection, and the boundary between user skill activation and repository governance.
- **Audit or conform the universal repository baseline** — use `ki-repo`. It owns repository configuration, standard root files, GitHub settings, and the `+` / `-` working areas.
- **Shape TypeScript and Bun engineering** — use `ki-engineering` for code structure, tests, package scripts, TypeScript, Biome, and the shared toolchain.
- **Format Markdown or TOML** — use `ki-authoring`. It owns the writing conventions and mechanical Markdown pass, not the meaning of configuration keys.
- **Prepare or review a commit** — use `ki-git` for commit shape, branch choice, shared-worktree hygiene, and stale-lock safety.
- **Create or audit the skill itself** — use `ki-skills` for `SKILL.md` quality, frontmatter, descriptions, progressive disclosure, rubrics, and dependency declarations.

A normal repository-governance journey is `ki-repo` plus the structure skill matching the repository, with `ki-engineering`, `ki-authoring`, and `ki-git` applied where their concerns exist. Composition is declared by each skill; do not infer a dependency merely because two standards commonly run together.

## Record why, what, how, or when

- **Why was a durable choice made?** Use `ki-decision-records` for a living Decision Record.
- **What behaviour must a system provide?** Use `ki-specs` for testable requirements and verification hooks.
- **How does a reader use, operate, contribute to, or maintain it?** Use `ki-guides` for practical instructions under `docs/guides/`.
- **What does the system look like, and is the picture still true?** Use `ki-diagrams` to keep diagrams that explain it: traced from the code, committed as a source and a self-contained SVG under `docs/diagrams/`, listed in one manifest, and refreshed when what they draw changes. The [Diagrams standard](https://github.com/knowledgeislands/ki-agentic-harness/blob/main/skills/governance/ki-diagrams/references/standards-diagrams.md) sets the rules.
- **When should repository work happen?** Use `ki-work` to select the adapter, then the matching adapter skill: `ki-work-roadmap`, `ki-work-github-issues`, or `ki-work-linear`.
- **What recurring work is due?** Use `ki-work-recurring` to govern a recurrence's identity and cadence, reserve each due run, and record the evidence of a successful one.
- **How can work be picked up without a transcript?** Use `ki-work-package` for the work folder that holds a piece of work's definition, state, queries, messages and decisions, so a fresh session resumes from Git rather than from a vendor transcript. Use `ki-recap` instead when summarising the current live session and routing durable learning; when explicitly authorised, `ki-recap checkpoint <thread>` supplies grounded recap evidence to the work package's own update procedure and refuses an incomplete hand-off.

Keep these instruments separate. A guide may link to the decision or specification that supports it, but it should not become a second copy of either. A future action belongs in the selected work adapter rather than a Decision Record.

## Select, plan, deliver, and close work

The standard local delivery journey is:

1. Use `ki-next` to deduplicate and capture substantive prospective work into draft Triage without prior approval, then explicitly adopt, select, promote, defer, or spawn work from the shared queue. Leaving Triage requires human approval. It can identify and confirm an independent batch candidate when the adapter and candidates support one; `ki-batch` requires separate explicit authorisation before execution.
2. Use `ki-plan` to make selected Now or Next work honestly ready. It enriches the canonical record and stops at `ready`.
3. Use `ki-implement` to deliver one explicitly approved ready record through the local adapter. It establishes a baseline, applies bounded changes, verifies them, and stops at `awaiting-review`.
4. Use `ki-accept` after human approval to close an evidence-backed delivery record or a rejected, duplicate, or merged Triage disposition as retained done, and optionally prune an explicitly selected eligible done record later.

Use `ki-batch` for one explicitly authorised, single-repository autonomous window over an exact set of Ready work records. Reviewed-item authority uses the approved set; explicit outcome authority lets the orchestrator complete selection and readiness, freeze the eligible set, deliver it, and consolidate acceptance without another gate. The batch is a lean authority envelope and ledger; canonical items retain their plans and evidence. Use `ki-recap` at a session boundary to summarise completed changes, surface only genuinely unfinished work, and route durable learning.

## Delegate work or define a subagent

These concerns are related but distinct:

- **Let the current process use runtime subagents for bounded work** — the active process skill, such as `ki-implement` or `ki-batch`, decides whether delegation is useful and retains coordination, human interaction, review, and integration.
- **Make a high-risk hand-off durable** — use `ki-delegation` when an approved delegated change needs locked decisions, explicit authority, isolation, escalation, verification, and return boundaries that must survive a runtime hand-off. Ordinary bounded subagent use does not require a durable packet.
- **Define a reusable subagent role** — use `ki-subagents` for the portable role identity, purpose, lane, grounding, hand-offs, orchestration intent, and outcome evidence.
- **Project that role into a runtime format** — use `ki-subagents-claude` for Claude Code Markdown/YAML or `ki-subagents-chatgpt` for Codex TOML. A valid source projection does not by itself prove installation, activation, selection, or execution.

Cross-repository transfer is not subagent delegation. Use the trade route below when another repository owns the work or knowledge.

## Choose a repository structure

Start with `ki-repo` for the common baseline, then select the structural capability that matches the repository's purpose:

- **Source Harness** — `ki-repo-harness` for the five shelves, compatible payload, capability identities, and generated skill catalogue.
- **General project** — `ki-repo-project` for a non-Knowledge-Base project baseline.
- **Knowledge Base** — `ki-repo-kb` for the base island structure; add `ki-repo-kb-principal`, `ki-repo-kb-streams`, `ki-repo-kb-activities`, or `ki-repo-kb-live-artifacts` only for the corresponding structure.
- **MCP server** — `ki-repo-mcp` for the MCP source, tool, access, and packaging delta.
- **Website** — start with `ki-repo-website`, then choose exactly one purpose-specific implementation: `ki-repo-website-content` for a Markdown/data page collection or `ki-repo-website-app` for one interactive React/Vite app. Add `ki-repo-website-cloudflare` independently for Workers Static Assets hosting.
- **CLI or developer tooling repository** — `ki-repo-tools`.
- **Specification repository** — `ki-repo-specifications`.
- **Dotfiles managed by chezmoi** — `ki-repo-dotfiles-chezmoi`.
- **Homebrew tap** — `ki-repo-homebrew-tap`.

Repository structures compose with the universal baseline; they do not replace it. Use each catalogue entry's dependency list to distinguish a formal dependency from a common pairing.

## Bind runtimes and manage context cost

- **Define a portable MCP inventory** — use `ki-binding` for the canonical XDG source, server schema, client targeting, and vendor-neutral target.
- **Project bindings into a runtime or user environment** — use `ki-binding-claude`, `ki-binding-chatgpt`, or `ki-binding-chezmoi` for the matching native surface. These adapters do not replace the portable source.
- **Set runtime-neutral context budgets or model-purpose guidance** — use `ki-tokenomics`.
- **Assess language models and executable agent routes** — use `ki-model-radar`; it keeps recommendation, support, retirement, and movement state separate and routes approved consumer changes instead of mutating runtime defaults.
- **Assess agentic protocols, formats, and architectural signals** — use `ki-agentic-radar`; it separates specification maturity, implementation evidence, interoperability evidence, structural patterns, and Knowledge Islands stance without adopting a protocol automatically.
- **Inspect bounded runtime filesystem evidence** — use `ki-tokenomics-claude` or `ki-tokenomics-chatgpt` after the portable policy. These adapters do not establish undocumented live-session state.
- **Govern Claude-specific runtime housekeeping** — use `ki-housekeeping-claude`; use `ki-work-recurring` instead for portable recurring repository maintenance.
- **Review and explicitly delete repository-scoped Codex sessions** — use `ki-housekeeping-chatgpt`; it is opt-in while its app-server binding remains experimental, and it never provides automatic retention.

Runtime binding and runtime evidence are separate from capability activation. A source file or clean source audit is not proof that a runtime loaded or executed it.

## Find website design inspiration

Use `ki-design-inspiration` to find visual references for a website or component, explain why selected examples fit, and suggest adaptations. Its curated sources cover navigation, footers, calls to action, page sections, 404 pages, bento grids, and motion. For example, ask “find navigation inspiration for this documentation site” or “suggest restrained motion references for this product page”. Website repository structure remains with `ki-repo-website` and its purpose-specific skills.

## Capture and triage new signals

- **Capture an interesting link or source** — use `ki-pulse` with an explicit destination; inaccessible material remains an unread candidate rather than an invented summary.
- **Scan for relevant public developments** — use `ki-pulse` with an invocation-scoped brief; it inspects at most ten leads and returns at most five cited observations.
- **Route a signal without creating another inbox** — use `ki-pulse` to assign one read / learn, watch, act, or discard disposition, then hand any durable result to its owning capability.

## Exchange work or knowledge across repositories

- **Select a territory's repositories** — use `ki-repo`: the Capital's `territory_members` is the one membership roster, and territory selection runs a command across it.
- **Define or audit the cross-repository protocol** — use `ki-trades` for routes, record identity, authority, immutable submitted projections, receipt, disposition, and retention.
- **Operate one repository's side of a trade** — use `ki-trade` to prepare, inspect, submit, receive, release, prune, or manage routes without writing the peer checkout.
- **Decide what the receiver does next** — use `ki-next` to record the receiver's confirmed disposition of a validated inbound trade and place accepted work in its own queue.

The sender proposes; the receiver owns priority, planning, and execution. A trade is directional repository coordination, not a shared worktree or a delegated agent lane.

## Verify the choice

Before acting, check three things:

1. The selected skill's HELP describes the intended outcome and names the adjacent off-ramps.
2. The generated catalogue shows the expected kind, argument hint, runtime binding, and formal dependencies.
3. The target repository declares the governance capabilities that `ki repo audit` or `ki repo conform` must execute; user-level installation alone does not add them to repository audit scope.

If none of the routes fits, start with `ki-skills` only when the missing outcome may warrant a new reusable capability. A one-off repository action normally belongs in the existing owning skill or local work record rather than a new skill.
