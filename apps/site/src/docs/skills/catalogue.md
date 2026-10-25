---
title: Skill catalogue
description: Every skill in the canonical Knowledge Islands harness at one pinned commit, with what each governs, when to reach for it, and the functional area it serves.
permalink: /docs/skills/catalogue/
order: 3
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

After this page you can look up any of the {{ skillCatalogue.counts.total }} skills by name, read what it governs and when to reach for it in the harness's own words, and find the same skill in your runtime so that you can invoke it or declare it for a repository.

## What it is

This inventory is **vendored, not rewritten**. The harness generates it from each skill's own declaration and publishes it as a marked block in its `skills/` README; this page takes that block verbatim at a pinned commit, so a skill renamed, added or removed upstream cannot leave the site describing one that is not there. The functional area beside each skill comes from the same commit, read from the table the harness draws its skill map and area diagrams from.

The harness publishes **{{ skillCatalogue.counts.total }} skills** at this snapshot: {{ skillCatalogue.counts.governance }} governance skills that hold a standard, and {{ skillCatalogue.counts.process }} process skills that drive a procedure. They sit in {{ skillCatalogue.domains | length }} source concerns, the folders of the harness `skills/` shelf, and serve {{ skillCatalogue.areas | length }} functional areas. The entries below are grouped by source concern, which is where a skill is kept; the finder table gives each skill's functional area, which is what it is for. [What a skill is](/docs/skills/what-a-skill-is/) explains the kinds and modes the entries assume, and [how the skills fit together](/docs/skills/how-the-skills-fit-together/) draws the areas.

## How you use it

Each entry carries the skill's description, the sentence a runtime reads when deciding whether to load it, and a short list of fields: its kind, the argument hint for its modes, any runtime it is bound to, and the skills it formally depends on. To find a skill in your own runtime, start from its name here.

- **In a session**, name it with a slash and its name, as in `/ki-recap`, or describe the outcome and let the runtime match the description. A session sees only the user-scope skills and those projected into the repository it started in.
- **On disk**, Claude Code finds a projected skill under `.claude/skills/<name>/` and Codex under `.agents/skills/<name>/`; `ki manage search` lists every skill the installed harness provides.
- **For a repository**, `ki repo skill add <name>` declares it and projects the link; `ki repo audit --skill <name> --repo .` then runs its Audit mode. A skill named in a dependency list comes with the skill that names it.

If you know the result you want but not the name, [choose a skill by outcome](/docs/skills/by-outcome/) first and return here for the entry.

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

## Boundaries

The catalogue describes the skills as the harness declares them at the pinned commit and nothing more. It does not say which skills a given repository has declared, which the repository's own `.ki.toml` records, and it does not include a repository's local `ki-self` skill, which is never part of the shared set. A dependency listed in an entry is the formal kind that runs its prerequisite first; a skill that merely points to a neighbour declares nothing, and the entry does not list it.
