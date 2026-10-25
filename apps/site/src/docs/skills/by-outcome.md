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

Sixty-four skills is more than anyone remembers by name. This page turns the question round: it lists outcomes a reader actually wants, and beside each one names the skill to reach for and the page where the practice is explained. The skill names link to their entries in the [catalogue](/docs/skills/catalogue/), which carries each description in the harness's own words. Each outcome links to the published page explaining its practice, or to the catalogue entry for a design capability.

## How it works

Each outcome resolves to the smallest skill whose description claims it. A governance skill is named when the outcome is to check or shape an artefact against a standard; a process skill is named when the outcome is to move a piece of work one step. Where two skills share a territory, the row names the one that owns the outcome and the explaining page says how the neighbour differs. Mara, keeping the fictional Tern Holm knowledge base, uses the first table when a note needs saving and the fourth when she wants to know what to do next; the skill she reaches for differs, and so does the page she reads.

## How you use it

Find the group that matches the kind of result you want, read down to the outcome, and invoke the skill by name or describe the outcome to your agent. If no row fits, the fallback at the end says what to do.

### Record, keep and acquire knowledge

| Outcome | Skill | Explained in |
| --- | --- | --- |
| Create, query, update or distil a note in a knowledge base | [`ki-repo-kb`][l1] | [Query, save and update][l2] |
| Govern the principal knowledge base of a territory | [`ki-repo-kb-principal`][l3] | [Knowledge bases][l4] |
| Keep a dashboard or tracker as a Markdown and HTML pair | [`ki-repo-kb-live-artifacts`][l5] | [Knowledge bases][l4] |
| Capture an agent session or meeting into the knowledge base | Skills† | [Acquiring knowledge][l9] |
| Capture a link or scan for public developments, and route the signal | [`ki-pulse`][l10] | [Acquiring knowledge][l9] |
| Recap a live session and hand its unfinished work over | [`ki-recap`][l11] | [Recap and handover][l12] |

† [`ki-acquire`][l6], with [`ki-acquire-chatgpt`][l7] or [`ki-acquire-granola`][l8] for the source

### Shape and check a repository

| Outcome | Skill | Explained in |
| --- | --- | --- |
| Start using Knowledge Islands on a machine | [`ki-bootstrap`][l13] | [Repository standards][repository-standards] |
| Audit or conform the universal repository contract | [`ki-repo`][l14] | [Repository standards][repository-standards] |
| Repository shape‡ | Skills† | [Repository standards][repository-standards] |
| Record why a durable choice was made | [`ki-decision-records`][l16] | [Decision records][decision-records] |
| State what a system must do, testably | [`ki-specs`][l17] | [Writing][writing] |
| Explain how to use, operate or maintain a system | [`ki-guides`][l18] | [Writing][writing] |
| Write or format Markdown, TOML or a README | [`ki-authoring`][l19] | [Writing][writing] |
| Keep a diagram that explains a system and stays true | [`ki-diagrams`][l20] | [Diagrams][diagrams] |
| Shape TypeScript and Bun code, scripts and toolchain | [`ki-engineering`][l21] | [Engineering and Git][engineering-and-git] |
| Prepare a commit or work safely in a shared tree | [`ki-git`][l22] | [Engineering and Git][engineering-and-git] |
| Create or audit a skill itself | [`ki-skills`][l23] | [What a skill is][l24] |

† the matching `ki-repo-*` skill, such as [`ki-repo-website`][l15]

‡ Shape a project, website, harness, MCP server, tools, specification, tap or dotfiles repository

### Coordinate work between people, threads and repositories

| Outcome | Skill | Explained in |
| --- | --- | --- |
| Coordinate a piece of territory or Project work and reply in the right form | [`ki-coordination`][l25] | [Coordination][l26] |
| Keep a piece of work resumable from Git rather than a transcript | [`ki-work-package`][l27] | [Work packages][l28] |
| Hand work to a detached background agent | [`ki-delegation`][l29] | [Background runs][l30] |
| Shape a new Project or model | [`ki-work-design`][design-skill] | [Work design][design-page] |
| Exchange work or knowledge | [`ki-trade`][trade-skill], [`ki-trades`][trades-skill] | [Trades][trades-page] |
| Define a reusable agent role | Skills† | [Coordination][coordination-page] |
| Coordinate agents around a group of repositories with Paperclip | Skills‡ | [Coordination][coordination-page] |

† [`ki-subagents`][l31], then [`ki-subagents-claude`][l32] or [`ki-subagents-chatgpt`][l33] for the runtime

‡ [`ki-agent-coordination-paperclip`][l34]

### Select, plan, deliver and close work

| Outcome | Skill | Explained in |
| --- | --- | --- |
| Choose where a repository records its forward work | Skills† | [Roadmap lifecycle][l39] |
| Capture new work or decide what comes next | [`ki-next`][l40] | [Roadmap lifecycle][l39] |
| Make a selected record ready to implement | [`ki-plan`][l41] | [Roadmap lifecycle][l39] |
| Deliver one approved record through to review | [`ki-implement`][l42] | [Roadmap lifecycle][l39] |
| Close a reviewed record, or cancel one with approval | [`ki-accept`][l43] | [Roadmap lifecycle][l39] |
| Run an authorised window over a set of ready records | [`ki-batch`][l44] | [Roadmap lifecycle][l39] |
| Adopt and evidence recurring work | [`ki-work-recurring`][recurring-skill]† | [Recurring work][recurring-page] |

† [`ki-work`][l35], then [`ki-work-roadmap`][l36], [`ki-work-github-issues`][l37] or [`ki-work-linear`][l38]

### Bind, budget and tidy the agent runtimes

| Outcome | Skill | Explained in |
| --- | --- | --- |
| Keep one portable inventory of MCP servers | [`ki-binding`][l45] | [Agent environment][l46] |
| Project that inventory into Claude, Codex or chezmoi | Skills† | [Agent environment][l46] |
| Set context budgets and model-purpose policy | Skills‡ | [Agent environment][l46] |
| Tidy accumulated Claude or Codex state | [`ki-housekeeping-claude`][l53] or [`ki-housekeeping-chatgpt`][l54] | [Agent environment][l46] |
| Assess language models or agentic protocols before adopting one | Skills§ | [Agent environment][l46] |

† [`ki-binding-claude`][l47], [`ki-binding-chatgpt`][l48] or [`ki-binding-chezmoi`][l49]

‡ [`ki-tokenomics`][l50], with [`ki-tokenomics-claude`][l51] or [`ki-tokenomics-chatgpt`][l52] for observed evidence

§ [`ki-model-radar`][l55] or [`ki-agentic-radar`][l56]

### Design a product's look and feel

| Outcome | Skill | Explained in |
| --- | --- | --- |
| Find visual references for a website or component | [`ki-design-inspiration`][l57] | [Catalogue entry][design-inspiration-entry] |
| Govern an interface design system | [`ki-design-system`][l58] | [Catalogue entry][design-system-entry] |

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

[repository-standards]: /docs/standards/repository-standards/

[decision-records]: /docs/standards/decision-records/

[writing]: /docs/standards/writing/

[diagrams]: /docs/standards/diagrams/

[engineering-and-git]: /docs/standards/engineering-and-git/

[coordination-page]: /docs/ways-of-working/coordination/

[design-inspiration-entry]: /docs/skills/catalogue/#ki-design-inspiration

[design-system-entry]: /docs/skills/catalogue/#ki-design-system

[l1]: /docs/skills/catalogue/#ki-repo-kb
[l2]: /docs/knowledge/query-save-update/
[l3]: /docs/skills/catalogue/#ki-repo-kb-principal
[l4]: /docs/knowledge/knowledge-bases/
[l5]: /docs/skills/catalogue/#ki-repo-kb-live-artifacts
[l6]: /docs/skills/catalogue/#ki-acquire
[l7]: /docs/skills/catalogue/#ki-acquire-chatgpt
[l8]: /docs/skills/catalogue/#ki-acquire-granola
[l9]: /docs/knowledge/acquiring-knowledge/
[l10]: /docs/skills/catalogue/#ki-pulse
[l11]: /docs/skills/catalogue/#ki-recap
[l12]: /docs/knowledge/recap-and-handover/
[l13]: /docs/skills/catalogue/#ki-bootstrap
[l14]: /docs/skills/catalogue/#ki-repo
[l15]: /docs/skills/catalogue/#ki-repo-website
[l16]: /docs/skills/catalogue/#ki-decision-records
[l17]: /docs/skills/catalogue/#ki-specs
[l18]: /docs/skills/catalogue/#ki-guides
[l19]: /docs/skills/catalogue/#ki-authoring
[l20]: /docs/skills/catalogue/#ki-diagrams
[l21]: /docs/skills/catalogue/#ki-engineering
[l22]: /docs/skills/catalogue/#ki-git
[l23]: /docs/skills/catalogue/#ki-skills
[l24]: /docs/skills/what-a-skill-is/
[l25]: /docs/skills/catalogue/#ki-coordination
[l26]: /docs/ways-of-working/coordination/
[l27]: /docs/skills/catalogue/#ki-work-package
[l28]: /docs/ways-of-working/work-packages/
[l29]: /docs/skills/catalogue/#ki-delegation
[l30]: /docs/ways-of-working/background-runs/
[l31]: /docs/skills/catalogue/#ki-subagents
[l32]: /docs/skills/catalogue/#ki-subagents-claude
[l33]: /docs/skills/catalogue/#ki-subagents-chatgpt
[l34]: /docs/skills/catalogue/#ki-agent-coordination-paperclip
[l35]: /docs/skills/catalogue/#ki-work
[l36]: /docs/skills/catalogue/#ki-work-roadmap
[l37]: /docs/skills/catalogue/#ki-work-github-issues
[l38]: /docs/skills/catalogue/#ki-work-linear
[l39]: /docs/ways-of-working/roadmap-lifecycle/
[l40]: /docs/skills/catalogue/#ki-next
[l41]: /docs/skills/catalogue/#ki-plan
[l42]: /docs/skills/catalogue/#ki-implement
[l43]: /docs/skills/catalogue/#ki-accept
[l44]: /docs/skills/catalogue/#ki-batch
[l45]: /docs/skills/catalogue/#ki-binding
[l46]: /docs/ki-agentic-harness/agent-environment/
[l47]: /docs/skills/catalogue/#ki-binding-claude
[l48]: /docs/skills/catalogue/#ki-binding-chatgpt
[l49]: /docs/skills/catalogue/#ki-binding-chezmoi
[l50]: /docs/skills/catalogue/#ki-tokenomics
[l51]: /docs/skills/catalogue/#ki-tokenomics-claude
[l52]: /docs/skills/catalogue/#ki-tokenomics-chatgpt
[l53]: /docs/skills/catalogue/#ki-housekeeping-claude
[l54]: /docs/skills/catalogue/#ki-housekeeping-chatgpt
[l55]: /docs/skills/catalogue/#ki-model-radar
[l56]: /docs/skills/catalogue/#ki-agentic-radar
[l57]: /docs/skills/catalogue/#ki-design-inspiration
[l58]: /docs/skills/catalogue/#ki-design-system
