---
title: Skill catalogue
description: Browse every capability in the canonical Knowledge Islands harness and learn when to use it.
permalink: /docs/ki-agentic-harness/skill-catalogue/
order: 6
sources:
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/README.md
    ref: bd6e29b5e0d567fb5ebb83566ddd46b3f6ba778b
    governs: 'The whole inventory below, vendored from the generated capability catalogue rather than restated'
    reviewed: '2026-10-11'
---

# Skill catalogue

Every skill in the harness, grouped by [source domain](/docs/ki-agentic-harness/skills/#the-skill-domains). Each entry says what the skill governs and when to reach for it.

This inventory is **vendored, not rewritten**. The harness generates it from each skill's own declaration and publishes it as a specified block in its `skills/` README; this page takes that block verbatim at a pinned commit, so a skill renamed, added, or removed upstream cannot leave the site describing one that is not there. What the site adds is the routing around it: [choose a skill by outcome](/docs/ki-agentic-harness/skills-by-outcome/) if you know the result you want but not the name, and [skills and journeys](/docs/ki-agentic-harness/skills/) for how the set fits together.

The harness publishes **{{ skillCatalogue.counts.total }} skills** at this snapshot: {{ skillCatalogue.counts.governance }} governance skills that hold a standard, and {{ skillCatalogue.counts.process }} process skills that drive a workflow.

<!-- The `safe` filters below are correct rather than lax. This template emits Markdown, which Eleventy then renders and escapes; letting Nunjucks escape first double-escapes every code span, so an argument hint of `audit <repo>` reached the reader as `audit &lt;repo&gt;`. The values come from a strict parse of a pinned commit in this organisation's own harness. -->

{% for domain in skillCatalogue.domains %}

## {{ domain.name }}

{% for skill in domain.skills %}

### `{{ skill.name }}`

{{ skill.description | safe }}

{% for field in skill.fields %}- **{{ field.label | safe }}:** {{ field.value | safe }}
{% endfor %}

{% endfor %}

{% endfor %}

Where the set is going next is in the roadmap.
