---
title: How the harness works
description: The reusable skills, tools and guardrails around an agent, and how mechanical checks and judgement work together.
order: 1
permalink: /docs/ki-agentic-harness/how-the-harness-works/
sources:
  - repository: knowledgeislands/ki-agentic-harness
    path: docs/decisions/ADR-KI-HARNESS-003-mechanical-first-agent-judgment-progressively-enhances.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The mechanical baseline and the judgement that enhances it'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: docs/decisions/ADR-KI-HARNESS-012-compatible-harness-publication-and-governed-rubric-boundary.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Compatible publication and the boundary between harness and host'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/repo-structure/ki-repo-harness/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The parts of a compatible harness'
    reviewed: '2026-10-25'
---

# How the harness works

A harness gives people and AI agents a shared way to work: reusable knowledge, tools to act with and checks that keep a repository consistent. Understanding its parts lets you choose what to activate and what evidence a passing audit actually provides.

## What it is

An agentic harness is the working environment around an agent. The KI Agentic Harness has four source shelves: skills, specialist agent roles, evaluations and runtime hooks. Its installed payload contains skills, agent roles and hooks; evaluations stay with the source. MCP servers live in separate repositories, with a portable inventory describing the connections a runtime should use.

A skill supplies a reusable capability. Some govern an artefact, such as writing or repository structure; others guide a process, such as planning or reviewing work. [What a skill is](/docs/skills/what-a-skill-is/) explains that distinction, and [the catalogue](/docs/skills/catalogue/) lists the available capabilities.

## How it works

The harness serves both human and LLM agents. Work that a deterministic operation can decide belongs in a mechanical check. Questions that require interpretation remain judgement for a person or an AI agent.

The mechanical baseline runs without a model. The installed `ki` CLI reads a repository's declarations, resolves compatible installed harnesses and executes their registered rubrics. It reports which judgement criteria remain unassessed, so a clean mechanical result does not silently claim that those questions were reviewed.

The harness publishes capability definitions and their safe repairs. The CLI owns installation, activation, execution and reporting. A nearby checkout is used only through an explicitly selected development binding.

## How you use it

Start by [installing a harness](/docs/ki-agentic-harness/installing-a-harness/) on your machine. Then [declare the skills that govern a repository](/docs/ki-agentic-harness/repositories/) and ask the agent for the outcome you want.

For example, a fictional Harbour Atlas island can declare its writing standard, run a read-only audit and ask an agent to review whether its explanations help a newcomer. The audit checks the mechanical rules; the review supplies the judgement.

## What it provides

The same declared standards can support an interactive agent session, a human running commands and automated checks in CI. Shared rules stay with their owning skills, while repository-specific choices remain in tracked declarations and guidance.

`AGENTS.md` carries portable repository orientation. A runtime-specific file such as `CLAUDE.md` holds only the detail that belongs to that runtime. [Agent environment](/docs/ki-agentic-harness/agent-environment/) explains the separate machine and runtime layers.

## Boundaries

Installing a harness makes its capabilities available; activation selects which ones apply. A skill declaration does not prove that a running session has loaded it or that a connected service is healthy.

A passing audit covers the declared checks it ran. It does not grant permission to publish, change credentials or perform other actions outside the task's authority.
