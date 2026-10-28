---
title: The workbench
order: 7
description: Try every Stoa unit with its inputs open to edit, watch the events it sends and the state it leaves, in phone, tablet and full widths.
permalink: /docs/stoa/workbench/
sources:
  - repository: knowledgeislands/packages-portal-commons
    path: apps/workbench/stories.js
    ref: v0.27.2
    governs: 'The live stories framed on this page and their sample inputs'
    reviewed: '2026-10-28'
  - repository: knowledgeislands/packages-portal-commons
    path: docs/decisions/ADR-STOA-053-preview-overrides-and-isolated-workbench.md
    ref: v0.27.2
    governs: 'The isolated stage frame and its separate keys'
    reviewed: '2026-10-28'
  - repository: knowledgeislands/packages-portal-commons
    path: README.md
    ref: v0.27.2
    governs: 'The workbench, its story view and its export'
    reviewed: '2026-10-28'
---

# The workbench

The workbench is where each Stoa unit is checked before a release: one story per unit, drawn from sample inputs you can edit as JSON, with the events the unit sends and the state it leaves shown beside it. It runs entirely in your browser from static files, so the copy published here is the same one a developer runs locally.

[Open the Stoa workbench](/stoa/workbench/index.html). This copy is Stoa {{ stoaWorkbench.version }}, exported at commit `{{ stoaWorkbench.commit | truncate(12, true, "") }}`.

## What it shows

The workbench has {{ stoaWorkbench.stories | length }} stories, in groups:

{% for story in stoaWorkbench.stories %}- **{{ story.title }}** ({{ story.group }}): {{ story.note }}
{% endfor %}

## How it keeps out of the way

Each story runs in a stage frame of its own, so a story's theme, mode or media queries never change the workbench around it. The workbench's own bar has its own theme menu and mode switch, under its own keys, and the stage keeps its choices under others: neither can overwrite the other, or a real site's choices on the same origin. The Phone and Tablet buttons narrow the stage, so each unit's breakpoints and container queries apply as they would on a phone.

The live frames on these pages are the workbench's single-story view: one story with only its theme and mode, and a link back here to edit it. Stoa exports the workbench as static files that run from any folder, and this site publishes that export as it is.
