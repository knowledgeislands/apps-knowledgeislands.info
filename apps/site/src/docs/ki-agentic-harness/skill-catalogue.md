---
title: Skill catalogue
description: Browse every capability in the canonical Knowledge Islands harness and learn when to use it.
permalink: /docs/ki-agentic-harness/skill-catalogue/
order: 6
sources:
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/README.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The whole inventory below, vendored from the generated capability catalogue rather than restated'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/repo-structure/ki-repo-harness/scripts/rubric/contexts/skill-functions.ts
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The functional area beside each skill, read from the table the harness draws its skill diagrams from'
    reviewed: '2026-10-25'
---

# Skill catalogue

Every skill in the harness, grouped by [source concern](/docs/ki-agentic-harness/skills/#the-skill-domains), the folder it lives in. Each entry says what the skill governs and when to reach for it, and the finder table gives the functional area each serves, which is what the skill is for rather than where it is kept.

This inventory is **vendored, not rewritten**. The harness generates it from each skill's own declaration and publishes it as a specified block in its `skills/` README; this page takes that block verbatim at a pinned commit, so a skill renamed, added, or removed upstream cannot leave the site describing one that is not there. The functional areas come from the same commit, read from the table the harness draws its skill map and area diagrams from. What the site adds is the routing around it: [choose a skill by outcome](/docs/ki-agentic-harness/skills-by-outcome/) if you know the result you want but not the name, and [skills and journeys](/docs/ki-agentic-harness/skills/) for how the set fits together.

The harness publishes **{{ skillCatalogue.counts.total }} skills** at this snapshot: {{ skillCatalogue.counts.governance }} governance skills that hold a standard, and {{ skillCatalogue.counts.process }} process skills that drive a workflow. They sit in {{ skillCatalogue.domains | length }} source concerns and serve {{ skillCatalogue.areas | length }} functional areas.

## Finding a skill

Each skill name links to its entry below. Where an area is split into capability groups, the group follows the area; a skill that serves two areas lists both, its home first.

<!-- The finder is written as an HTML table rather than a Markdown one because its rows are emitted by a Nunjucks loop, and a loop tag is not a table row to the Markdown gate. Inline HTML is permitted on this site; the table takes the prose stylesheet's treatment like any other. -->

<table>
<thead>
<tr><th>Skill</th><th>Source concern</th><th>Functional area</th></tr>
</thead>
<tbody>
{%- for domain in skillCatalogue.domains %}{%- for skill in domain.skills %}
<tr><td><a href="#{{ skill.name }}"><code>{{ skill.name }}</code></a></td><td>{{ domain.name }}</td><td>{% for area in skill.areas %}{{ area.title }}{% if area.group %} · {{ area.group }}{% endif %}{% if not loop.last %}; {% endif %}{% endfor %}</td></tr>
{%- endfor %}{%- endfor %}
</tbody>
</table>

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
