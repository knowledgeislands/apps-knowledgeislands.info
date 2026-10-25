---
title: Use skills
description: Ask for an outcome, invoke a named skill and distinguish availability from activation and loading.
order: 4
permalink: /docs/ki-agentic-harness/using-skills/
sources:
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/keystone/ki-skills/SKILL.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Descriptions, modes and progressive disclosure'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/keystone/ki-skills/references/standards-agent-skills.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Portable triggers and runtime-specific invocation hints'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/tools-ki
    path: man/ki.1
    ref: v0.13.0
    governs: 'The commands and scope boundaries at the reviewed CLI release'
    reviewed: '2026-10-25'
---

# Use skills

A skill loads reusable guidance when a task needs it. You can ask for an outcome in plain language or name the skill explicitly, then check availability and activation if the agent does not select the capability you expected.

## What it is

Each skill has a `SKILL.md` containing its identity, selection description and instructions. Supporting references and scripts carry detail that can be loaded or run when needed. This keeps occasional procedures out of the standing instructions for every task.

The description says when the skill applies. An `argument-hint`, where the runtime supports it, advertises modes and expected inputs. It helps you phrase a request; it is not a portable command parser.

## How it works

First, the skill must be installed and discoverable in the relevant user or repository scope. The runtime can then match your request to its description and load its instructions. Availability, activation and actual loading are separate facts.

Governance skills commonly expose `educate`, `audit`, `conform` and `refresh`. They explain, check, repair within the capability's boundary and review the capability against its sources respectively. Process skills guide work such as planning and delivery, with their own entry conditions.

## How you use it

Describe the result you want: "Check Harbour Atlas against the Markdown standard" is a clearer trigger than "use the writing thing". The fictional island makes the target explicit without requiring you to know the skill's name.

For direct selection, name the skill in your request. Claude Code also supports slash invocation, for example:

```text
/ki-authoring audit .
```

Other runtimes expose their own skill-selection interface. A Claude-specific slash command or argument hint is not a promise that every runtime accepts the same syntax.

Three routes help you find a capability:

- [Choose a skill by outcome](/docs/skills/by-outcome/) maps a goal to the skills that serve it.
- [The catalogue](/docs/skills/catalogue/) lists the published skills by functional area.
- `ki harness search <query>` searches the verified capabilities installed on this machine.

For a deterministic repository check, invoke the native operation directly: `ki repo audit --skill ki-authoring`. No model is required to run that mechanical half.

## What it provides

Skills give an agent a reusable procedure and an explicit boundary for the work. References load progressively, and declared dependencies keep composed governance rules with their owners.

If selection goes wrong, name the intended skill, clarify the outcome and inspect its activation with `ki repo diag`. Restart the agent after managed skill links change so discovery can run again.

## Boundaries

A catalogue entry does not prove a skill is installed on your machine. Installation does not activate it everywhere, and activation does not prove an existing session loaded it.

Invoking a skill does not grant broader authority. A repair, refresh, publication or deletion still follows the skill's entry conditions and the permission already given for the task.
