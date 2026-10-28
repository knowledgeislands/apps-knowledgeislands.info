---
title: Themes and modes
order: 2
description: How the Theme Engine resolves a reader's theme and light or dark mode, what a site supplies, and the sample themes side by side.
permalink: /docs/stoa/themes/
sources:
  - repository: knowledgeislands/packages-portal-commons
    path: docs/guides/theme-engine.md
    ref: v0.27.1
    governs: 'Mode selection, themes and Solar, and what the site and the engine each own'
    reviewed: '2026-10-28'
  - repository: knowledgeislands/packages-portal-commons
    path: packages/stoa/README.md
    ref: v0.27.1
    governs: 'Keys from a prefix, previous keys, the pre-paint script, Reset to default and the CSS bridge'
    reviewed: '2026-10-28'
  - repository: knowledgeislands/packages-portal-commons
    path: apps/workbench/stories.js
    ref: v0.27.1
    governs: 'The live stories framed on this page and their sample inputs'
    reviewed: '2026-10-28'
---

# Themes and modes

The Theme Engine decides how a Stoa page looks for its reader and tells the rest of the page. A site offers one or more themes and a choice of System, Light, Dark or Solar; the engine resolves what the reader picked into exactly two things on the page, a theme and a light or dark mode, and every unit follows them.

## What the reader picks, and what the page gets

| Part | The reader picks | The page gets |
| --- | --- | --- |
| Mode | System, Light, Dark or Solar, as the site offers | `data-mode="light"` or `"dark"` on `<html>`: the only two modes |
| Theme | One of the site's themes, when it offers more than one | `data-theme="<id>"`; every theme has a light and a dark palette |
| Solar | Follow the sun, or hold a phase of the day | `data-solar-phase`, `--sun-elevation` and events for a page that paints by time of day |

Solar works out the sun's phase from the reader's time zone, or a place they share, and turns the page light at sunrise and dark at sunset. Most themes only change between light and dark; a home page may also paint its sky by phase.

## What a site supplies

The site owns its identities, its CSS, its icons and what it offers; the engine owns resolution and the controls. One configuration feeds three build-time renderers: a small pre-paint script that goes first in `<head>`, so the right theme is on the page before it is drawn, the Theme Menu and the mode switch.

Every key the engine stores is the site's `keyPrefix` plus a name, such as `example-theme` and `example-mode`, so two sites on one origin, or a site and its test pages, never read each other's choices. `previousKeys` moves a reader's choice from an older key once. The menu ends with Reset to default, which forgets the reader's choices and applies the site's defaults.

A theme is mostly a few hue anchors. `styles/tokens.css` derives every `--stoa-*` colour from them, in both modes, and a site that already has tokens maps them in its own bridge layer instead.

## The sample themes, side by side

The workbench carries three neutral themes so a unit can be seen in more than one. Each frame below fixes its theme for this page and follows this page's light or night.

{% stoaThemes "page-foot" %}

{% for theme in stoaWorkbench.themes %}- **{{ theme.name }}**: {{ theme.detail }}
{% endfor %}

## The engine and its controls

The Theme Engine story shows the mode switch in its compact and labelled forms, the Theme Menu with its swatches, a second axis (density) and the Solar dial on its own.

{% stoaStory "theme-engine", "The Theme Engine's controls over the workbench's sample configuration." %}
