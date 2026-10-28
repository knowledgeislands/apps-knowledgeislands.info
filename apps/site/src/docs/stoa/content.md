---
title: Issues and diagrams
order: 6
description: Publish a validated issue register as static tables grouped by status, and let readers zoom and pan a diagram without leaving the page.
permalink: /docs/stoa/content/
sources:
  - repository: knowledgeislands/packages-portal-commons
    path: packages/stoa/README.md
    ref: v0.27.2
    governs: 'The Issues List, its data, statuses, columns and strict validation; the Diagram Viewer'
    reviewed: '2026-10-28'
  - repository: knowledgeislands/packages-portal-commons
    path: apps/workbench/stories.js
    ref: v0.27.2
    governs: 'The live stories framed on this page and their sample inputs'
    reviewed: '2026-10-28'
---

# Issues and diagrams

Two Stoa units present a site's own content: the Issues List turns an issue register into static tables at build time, and the Diagram Viewer opens a diagram in a dialog to zoom and pan. Both leave the content to the site and fail the build on data they cannot trust.

## Issues List

The Issues List is build-only: a renderer and an Eleventy shortcode, with no script in the browser. It validates the register before writing anything, groups issues by status, counts each group and names the next issue due for a call. The site owns the statuses, the area vocabulary, the owners and the wording; columns such as Owner and For call appear only when some issue fills them.

{% stoaStory "issues-list", "A sample register grouped by status, with its summary and next call." %}

Strict validation rejects any field it does not recognise, with an error naming it. Each row can carry the Filter Bar's attributes, so a register can be filtered on the page.

## Diagram Viewer

The Diagram Viewer writes a complete static figure, image or inline SVG, with its caption. With script, clicking the diagram or its Explore button opens it in a native dialog with zoom, pan, Fit and Reset; Escape closes it and returns focus. Without script the figure simply stays on the page.

{% stoaStory "diagram-viewer", "A sample diagram; click it or Explore, then zoom and pan." %}
