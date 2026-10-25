---
title: How the skills fit together
description: The ten functional areas of the Knowledge Islands skill set, which skills each gathers and how they rely on one another, with the skill map and the ten area diagrams.
permalink: /docs/skills/how-the-skills-fit-together/
order: 2
sources:
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/README.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The skill set, its source concerns and the dependency each skill declares'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/repo-structure/ki-repo-harness/scripts/rubric/contexts/skill-functions.ts
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The ten functional areas, their groups and which skills each gathers'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: docs/diagrams/diagrams.toml
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The skill map and the ten area diagrams this page embeds, vendored at this commit'
    reviewed: '2026-10-25'
---

# How the skills fit together

After this page you can place any of the sixty-four skills in one of ten functional areas, read an area diagram to see which skills it rests on and which rest on it, and tell a formal dependency from an optional one before declaring either in a repository.

## What it is

The skill set has two groupings, and they answer different questions. A source concern is where a skill is kept: one of the eight folders in the harness `skills/` shelf, which the [catalogue](/docs/skills/catalogue/) follows. A functional area is what a skill is for, and the harness defines ten of them, each with a short purpose and, where an area is large, named groups within it. A skill has one home area and may serve a second: `ki-authoring` and `ki-diagrams` are fundamentals that the Records and code area also claims, and `ki-repo-harness` is a fundamental that Repository types also lists.

| Area | What its skills do |
| --- | --- |
| Fundamentals | Hold what every repository and every skill builds on |
| Records and code | Govern what a repository records, explains and builds |
| Coordination | Hand work between agents, threads and repositories |
| Work and delivery | Record work and move it from capture to acceptance |
| Repository types | Shape one kind of repository each |
| Agentic systems | Define agent roles and coordinate agents |
| Environment | Bind, budget and clean the agent runtimes |
| Acquire | Bring outside sources into a knowledge base |
| Signals | Watch the field and keep its radars current |
| Design | Shape how products look and feel |

{% figure "skill-map", "Every skill nested in its home area and group. Look for the shape of each node: it tells you whether the skill is always on, applies automatically, must be opted into, or is reached by command. No edges are drawn here; the area diagrams below carry them." %}

## How it works

Each area diagram draws the same relationship the skills declare in their frontmatter. A solid edge is a formal dependency: selecting the skill at the top necessarily runs the skill at the bottom first. A dashed edge is an optional dependency, used only when the lower skill is active in the same scope and never making it mandatory. Edges always point downward from the skill that relies to the skill relied on. Skills outside the area that it relies on sit below its box, and skills outside the area that rely on it sit above, so the vertical position tells you which way the reliance runs before you read a label. The node shapes match the skill map.

The harness generates these pictures from the declarations rather than drawing them by hand, so an edge missing from a diagram is an edge missing from the skills. A repository that declares a skill declares its formal prerequisites too, and `ki repo audit` runs them in dependency order.

## How you use it

Read the map to find the area a request belongs to, then read that area's diagram downward to learn what else the skill brings with it and upward to learn what would be affected by changing it. When Mara declares `ki-repo-kb-principal` for the Tern Holm knowledge base, the Repository types diagram shows her that `ki-repo-kb` and `ki-decision-records` come with it, and that the three knowledge-base overlays come with `ki-repo-kb` in turn. When she considers switching the island's writing conventions, the Fundamentals diagram shows `ki-repo`, `ki-recap` and `ki-repo-dotfiles-chezmoi` resting on `ki-authoring`, which is the measure of the change.

## What it provides

### Fundamentals

Fundamentals gathers `ki-repo`, `ki-authoring`, `ki-diagrams` and `ki-git` as the repository and writing group, `ki-skills` and `ki-repo-harness` as the skills and harness group, and `ki-bootstrap` on its own. These are the skills the rest of the set assumes.

{% figure "skill-area-fundamentals", "Look for ki-authoring and ki-git at the base: ki-repo rests on both, and skills outside the area such as ki-recap, ki-repo-dotfiles-chezmoi and ki-agent-coordination-paperclip rest on one of them. ki-repo-harness is the one fundamental that reaches outside the area for its prerequisites." %}

### Records and code

Records and code gathers `ki-decision-records`, `ki-specs` and `ki-guides` as the records group, `ki-authoring` and `ki-diagrams` as writing and figures, and `ki-engineering` for code. Together they govern what a repository says about itself and how it builds.

{% figure "skill-area-records-and-code", "Look for the absence of edges inside the area: none of these six skills relies on another of them. Every edge arrives from above, where ki-repo-harness, ki-repo-kb-principal and ki-work-design rest on ki-decision-records and ki-repo-mcp rests on ki-engineering. ki-authoring and ki-diagrams appear as members; their own edges are drawn in Fundamentals, their home." %}

### Coordination

Coordination gathers `ki-delegation`, `ki-work-package`, `ki-coordination` and `ki-work-design` as the delegation and programme group, and `ki-trades` with `ki-trade` as the trades group. It is how work passes between agents, threads and repositories.

{% figure "skill-area-coordination", "Look for ki-delegation as the skill most relied on: ki-coordination rests on it and on ki-work-package, and the delivery skills ki-plan, ki-implement and ki-batch use it optionally from above. ki-trade rests on ki-trades, and ki-work-design optionally uses ki-decision-records below the area." %}

### Work and delivery

Work and delivery gathers the work-item skills `ki-work`, `ki-work-roadmap`, `ki-work-github-issues`, `ki-work-linear` and `ki-work-recurring`, and the delivery cycle `ki-next`, `ki-plan`, `ki-batch`, `ki-implement`, `ki-accept` and `ki-recap`. Together they record work and move it from capture to acceptance.

{% figure "skill-area-work-and-delivery", "Look for the dashed edges: the delivery skills rely on nothing formally except ki-recap on ki-authoring, and reach ki-delegation and ki-batch only optionally. From above, ki-repo-harness rests on ki-work-roadmap and ki-repo-kb-activities optionally uses ki-work-recurring." %}

### Repository types

Repository types gathers the websites group `ki-repo-website`, `ki-repo-website-content`, `ki-repo-website-app` and `ki-repo-website-cloudflare`; the knowledge bases group `ki-repo-kb`, `ki-repo-kb-streams`, `ki-repo-kb-activities`, `ki-repo-kb-live-artifacts` and `ki-repo-kb-principal`; `ki-repo-project` for projects; and the single-type repositories `ki-repo-specifications`, `ki-repo-mcp`, `ki-repo-harness`, `ki-repo-tools`, `ki-repo-homebrew-tap` and `ki-repo-dotfiles-chezmoi`. Each shapes one kind of repository.

{% figure "skill-area-repository-types", "Look for the two fans: the three website implementations rest on ki-repo-website, and ki-repo-kb carries its three overlays with ki-repo-kb-principal above it. Below the area, ki-repo-mcp rests on ki-engineering, ki-repo-dotfiles-chezmoi on ki-authoring and ki-repo-kb-activities optionally on ki-work-recurring; above it, ki-binding-chezmoi rests on the dotfiles skill." %}

### Agentic systems

Agentic systems gathers `ki-subagents` with its runtime projections `ki-subagents-claude` and `ki-subagents-chatgpt`, and `ki-agent-coordination-paperclip`. It defines agent roles and how several agents are coordinated.

{% figure "skill-area-agentic-systems", "Look for ki-subagents at the centre: both runtime projections rest on it and ki-repo-harness rests on it from above. ki-agent-coordination-paperclip stands apart, resting only on ki-git below the area." %}

### Environment

Environment gathers the MCP binding group `ki-binding`, `ki-binding-claude`, `ki-binding-chatgpt` and `ki-binding-chezmoi`; the tokenomics group `ki-tokenomics`, `ki-tokenomics-claude` and `ki-tokenomics-chatgpt`; and the housekeeping pair `ki-housekeeping-claude` and `ki-housekeeping-chatgpt`. It binds, budgets and cleans the agent runtimes.

{% figure "skill-area-environment", "Look for the two portable roots: every binding adapter rests on ki-binding and every tokenomics adapter on ki-tokenomics. ki-binding-chezmoi alone also reaches below the area, to ki-repo-dotfiles-chezmoi. The housekeeping pair declares no dependency." %}

### Acquire

Acquire gathers `ki-acquire` and its source adapters `ki-acquire-chatgpt` and `ki-acquire-granola`. It brings outside sources into a knowledge base by exception rather than wholesale.

{% figure "skill-area-acquire", "Look for the single root: both adapters rest on ki-acquire and nothing rests on them. No skill outside the area appears, because none relies on acquisition or is relied on by it." %}

### Signals

Signals gathers `ki-pulse`, `ki-agentic-radar` and `ki-model-radar`. It watches the field and keeps the two radars current without adopting anything automatically.

{% figure "skill-area-signals", "Look for three nodes and no edges: the signals skills declare no dependency and nothing depends on them, so each is reached on its own." %}

### Design

Design gathers `ki-design-system` and `ki-design-inspiration`. It shapes how products look and feel.

{% figure "skill-area-design", "Look for two nodes and no edges: the design skills stand alone, with website structure left to the repository types." %}

## Boundaries

An area is a reading aid, not a declaration; a repository declares skills by name, never by area. The diagrams show declared dependencies only, so a standard that `ki-repo` detects from repository shape and audits alongside does not appear as an edge, and neither does a skill that merely points the reader to another. A skill that serves two areas is drawn with its edges in its home area's diagram and appears as a member without them in the second.
