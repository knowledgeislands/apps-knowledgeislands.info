---
title: Choose a skill by outcome
description: Which Knowledge Islands skill to reach for by what you want to achieve, and which Ways of working, Knowledge or Standards page explains the practice behind it.
permalink: /docs/skills/by-outcome/
order: 4
sources:
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/README.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The skill names and responsibilities each outcome resolves to'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/repo-structure/ki-repo-harness/scripts/rubric/contexts/skill-functions.ts
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The functional areas the outcomes are grouped by'
    reviewed: '2026-10-25'
---

# Choose a skill by outcome

After this page you can start from a plain-language result you want, name the one skill that serves it, and know which section of this site explains the practice the skill carries, so that you reach for the narrowest skill and read no more than you need.

## What it is

Sixty-four skills is more than anyone remembers by name. This page turns the question round: it lists outcomes a reader actually wants, and beside each one names the skill to reach for and the page where the practice is explained. The skill names link to their entries in the [catalogue](/docs/skills/catalogue/), which carries each description in the harness's own words. Where the explaining page is published, it is linked; the other practices are named by the section that will explain them, Ways of working, Knowledge or Standards.

## How it works

Each outcome resolves to the smallest skill whose description claims it. A governance skill is named when the outcome is to check or shape an artefact against a standard; a process skill is named when the outcome is to move a piece of work one step. Where two skills share a territory, the row names the one that owns the outcome and the explaining page says how the neighbour differs. Mara, keeping the fictional Tern Holm knowledge base, uses the first table when a note needs saving and the fourth when she wants to know what to do next; the skill she reaches for differs, and so does the page she reads.

## How you use it

Find the group that matches the kind of result you want, read down to the outcome, and invoke the skill by name or describe the outcome to your agent. If no row fits, the fallback at the end says what to do.

### Record, keep and acquire knowledge

| Outcome | Skill | Explained in |
| --- | --- | --- |
| Create, query, update or distil a note in a knowledge base | [`ki-repo-kb`](/docs/skills/catalogue/#ki-repo-kb) | Knowledge |
| Govern the principal knowledge base of a territory | [`ki-repo-kb-principal`](/docs/skills/catalogue/#ki-repo-kb-principal) | Knowledge |
| Keep a dashboard or tracker as a Markdown and HTML pair | [`ki-repo-kb-live-artifacts`](/docs/skills/catalogue/#ki-repo-kb-live-artifacts) | Knowledge |
| Capture an agent session or meeting into the knowledge base | [`ki-acquire`](/docs/skills/catalogue/#ki-acquire), with [`ki-acquire-chatgpt`](/docs/skills/catalogue/#ki-acquire-chatgpt) or [`ki-acquire-granola`](/docs/skills/catalogue/#ki-acquire-granola) for the source | Knowledge |
| Capture a link or scan for public developments, and route the signal | [`ki-pulse`](/docs/skills/catalogue/#ki-pulse) | Knowledge |
| Recap a live session and hand its unfinished work over | [`ki-recap`](/docs/skills/catalogue/#ki-recap) | Knowledge |

### Shape and check a repository

| Outcome | Skill | Explained in |
| --- | --- | --- |
| Start using Knowledge Islands on a machine | [`ki-bootstrap`](/docs/skills/catalogue/#ki-bootstrap) | Standards |
| Audit or conform the universal repository contract | [`ki-repo`](/docs/skills/catalogue/#ki-repo) | Standards |
| Shape a project, website, harness, MCP server, tools, specification, tap or dotfiles repository | the matching `ki-repo-*` skill, such as [`ki-repo-website`](/docs/skills/catalogue/#ki-repo-website) | Standards |
| Record why a durable choice was made | [`ki-decision-records`](/docs/skills/catalogue/#ki-decision-records) | Standards |
| State what a system must do, testably | [`ki-specs`](/docs/skills/catalogue/#ki-specs) | Standards |
| Explain how to use, operate or maintain a system | [`ki-guides`](/docs/skills/catalogue/#ki-guides) | Standards |
| Write or format Markdown, TOML or a README | [`ki-authoring`](/docs/skills/catalogue/#ki-authoring) | Standards |
| Keep a diagram that explains a system and stays true | [`ki-diagrams`](/docs/skills/catalogue/#ki-diagrams) | Standards |
| Shape TypeScript and Bun code, scripts and toolchain | [`ki-engineering`](/docs/skills/catalogue/#ki-engineering) | Standards |
| Prepare a commit or work safely in a shared tree | [`ki-git`](/docs/skills/catalogue/#ki-git) | Standards |
| Create or audit a skill itself | [`ki-skills`](/docs/skills/catalogue/#ki-skills) | [What a skill is](/docs/skills/what-a-skill-is/) |

### Coordinate work between people, threads and repositories

| Outcome | Skill | Explained in |
| --- | --- | --- |
| Coordinate a piece of territory or Project work and reply in the right form | [`ki-coordination`](/docs/skills/catalogue/#ki-coordination) | [Coordination](/docs/ways-of-working/coordination/) |
| Keep a piece of work resumable from Git rather than a transcript | [`ki-work-package`](/docs/skills/catalogue/#ki-work-package) | [Work packages](/docs/ways-of-working/work-packages/) |
| Hand work to a detached background agent | [`ki-delegation`](/docs/skills/catalogue/#ki-delegation) | [Background runs](/docs/ways-of-working/background-runs/) |
| Shape a new Project or model | [`ki-work-design`][design-skill] | [Work design][design-page] |
| Exchange work or knowledge | [`ki-trade`][trade-skill], [`ki-trades`][trades-skill] | [Trades][trades-page] |
| Define a reusable agent role | [`ki-subagents`](/docs/skills/catalogue/#ki-subagents), then [`ki-subagents-claude`](/docs/skills/catalogue/#ki-subagents-claude) or [`ki-subagents-chatgpt`](/docs/skills/catalogue/#ki-subagents-chatgpt) for the runtime | Ways of working |
| Coordinate agents around a group of repositories with Paperclip | [`ki-agent-coordination-paperclip`](/docs/skills/catalogue/#ki-agent-coordination-paperclip) | Ways of working |

### Select, plan, deliver and close work

| Outcome | Skill | Explained in |
| --- | --- | --- |
| Choose where a repository records its forward work | [`ki-work`](/docs/skills/catalogue/#ki-work), then [`ki-work-roadmap`](/docs/skills/catalogue/#ki-work-roadmap), [`ki-work-github-issues`](/docs/skills/catalogue/#ki-work-github-issues) or [`ki-work-linear`](/docs/skills/catalogue/#ki-work-linear) | [Roadmap lifecycle](/docs/ways-of-working/roadmap-lifecycle/) |
| Capture new work or decide what comes next | [`ki-next`](/docs/skills/catalogue/#ki-next) | [Roadmap lifecycle](/docs/ways-of-working/roadmap-lifecycle/) |
| Make a selected record ready to implement | [`ki-plan`](/docs/skills/catalogue/#ki-plan) | [Roadmap lifecycle](/docs/ways-of-working/roadmap-lifecycle/) |
| Deliver one approved record through to review | [`ki-implement`](/docs/skills/catalogue/#ki-implement) | [Roadmap lifecycle](/docs/ways-of-working/roadmap-lifecycle/) |
| Close a reviewed record, or cancel one with approval | [`ki-accept`](/docs/skills/catalogue/#ki-accept) | [Roadmap lifecycle](/docs/ways-of-working/roadmap-lifecycle/) |
| Run an authorised window over a set of ready records | [`ki-batch`](/docs/skills/catalogue/#ki-batch) | [Roadmap lifecycle](/docs/ways-of-working/roadmap-lifecycle/) |
| Adopt and evidence recurring work | [`ki-work-recurring`][recurring-skill]† | [Recurring work][recurring-page] |

### Bind, budget and tidy the agent runtimes

| Outcome | Skill | Explained in |
| --- | --- | --- |
| Keep one portable inventory of MCP servers | [`ki-binding`](/docs/skills/catalogue/#ki-binding) | [Agent environment](/docs/ki-agentic-harness/agent-environment/) |
| Project that inventory into Claude, Codex or chezmoi | [`ki-binding-claude`](/docs/skills/catalogue/#ki-binding-claude), [`ki-binding-chatgpt`](/docs/skills/catalogue/#ki-binding-chatgpt) or [`ki-binding-chezmoi`](/docs/skills/catalogue/#ki-binding-chezmoi) | [Agent environment](/docs/ki-agentic-harness/agent-environment/) |
| Set context budgets and model-purpose policy | [`ki-tokenomics`](/docs/skills/catalogue/#ki-tokenomics), with [`ki-tokenomics-claude`](/docs/skills/catalogue/#ki-tokenomics-claude) or [`ki-tokenomics-chatgpt`](/docs/skills/catalogue/#ki-tokenomics-chatgpt) for observed evidence | [Agent environment](/docs/ki-agentic-harness/agent-environment/) |
| Tidy accumulated Claude or Codex state | [`ki-housekeeping-claude`](/docs/skills/catalogue/#ki-housekeeping-claude) or [`ki-housekeeping-chatgpt`](/docs/skills/catalogue/#ki-housekeeping-chatgpt) | [Agent environment](/docs/ki-agentic-harness/agent-environment/) |
| Assess language models or agentic protocols before adopting one | [`ki-model-radar`](/docs/skills/catalogue/#ki-model-radar) or [`ki-agentic-radar`](/docs/skills/catalogue/#ki-agentic-radar) | [Agent environment](/docs/ki-agentic-harness/agent-environment/) |

### Design a product's look and feel

| Outcome | Skill | Explained in |
| --- | --- | --- |
| Find visual references for a website or component | [`ki-design-inspiration`](/docs/skills/catalogue/#ki-design-inspiration) | the catalogue entry |
| Govern an interface design system | [`ki-design-system`](/docs/skills/catalogue/#ki-design-system) | the catalogue entry |

## What it provides

Every row names one skill that exists in the vendored catalogue at the pinned commit, so a name here can be typed after a slash and will resolve. The explaining page carries the practice: the vocabulary, the states, the files written and the boundaries between neighbouring skills. Reading the skill's entry tells you what it does; reading the explaining page tells you why the practice is shaped that way and how it is used day to day.

## Boundaries

When none of the rows fits, describe the outcome to your agent and let the runtime match a description before reaching for `ki-skills` to author a new skill; a one-off action belongs in an existing skill or a work record rather than a new capability. A skill named here is invoked only if your session can see it, which means it is a user-scope skill or is projected into the repository you started in. Naming a skill does not declare it: a repository is held to a governance skill only when its `.ki.toml` lists it.

† Knowledge Base Activity notes are provided by [`ki-repo-kb-activities`](/docs/skills/catalogue/#ki-repo-kb-activities).

[design-skill]: /docs/skills/catalogue/#ki-work-design
[design-page]: /docs/ways-of-working/work-design/
[trade-skill]: /docs/skills/catalogue/#ki-trade
[trades-skill]: /docs/skills/catalogue/#ki-trades
[trades-page]: /docs/ways-of-working/trades/
[recurring-skill]: /docs/skills/catalogue/#ki-work-recurring
[recurring-page]: /docs/ways-of-working/recurring-work/
