---
title: Stoa
order: 1
description: What Stoa is, the units it holds, and how a static site shares them without a package registry or a build-time fetch.
permalink: /docs/stoa/
sources:
  - repository: knowledgeislands/packages-stoa
    path: packages/stoa/README.md
    ref: v0.27.2
    governs: 'The units, their entries and elements, light DOM and the no-dependency modules'
    reviewed: '2026-10-28'
  - repository: knowledgeislands/packages-stoa
    path: packages/stoa/units.json5
    ref: v0.27.2
    governs: 'The unit list and each unit''s one-line purpose'
    reviewed: '2026-10-28'
  - repository: knowledgeislands/packages-stoa
    path: apps/workbench/stories.js
    ref: v0.27.2
    governs: 'The live stories framed on this page and their sample inputs'
    reviewed: '2026-10-28'
---

# Stoa

Stoa is a small set of web components and styles that static sites share: a header, a page foot, a theme engine, search, filters, calendars, issue tables and a diagram viewer. Each site renders the full markup at build time, so every page reads without script, and the components then upgrade that markup in place. These pages show each unit working, live, so you can judge whether it suits a site before adopting it.

The name comes from the covered colonnade at the edge of a Greek agora: the shared structure the square was built around, where notices went up and teachers taught in public.

## What it holds

Stoa {{ stoaWorkbench.version }} holds {{ stoaWorkbench.units | length }} units. Each is a plain ES module with JSDoc types and no runtime dependency, and each element uses light DOM, so a site's own styles reach it.

| Units | What they give a page | Shown in |
| --- | --- | --- |
| Styles and tokens, Theme Engine, Theme Menu | Base styles, `--stoa-*` tokens, themes, and light, dark or solar mode | [Themes and modes](/docs/stoa/themes/) |
| Header, Page Foot, build commit | The frame: a responsive header and the notes, sources and footer strip at the end of a page | [Header and Page Foot](/docs/stoa/frame/) |
| Command Bar, Shortcuts, Search Index, Filter Bar | Searching a site from the keyboard, its shortcuts, and filtering the items on a page | [Search and filters](/docs/stoa/finding/) |
| Calendar, Timeline, Today board | Dated entries as calendar views, a chronology and today's entries, with subscribable feeds | [Calendars and dates](/docs/stoa/dates/) |
| Issues List, Diagram Viewer | Static issue tables, and diagrams to zoom and pan | [Issues and diagrams](/docs/stoa/content/) |

## How a site shares it

A site does not install Stoa from a registry. It copies the whole `packages/stoa` folder into its own repository at a chosen release, with a lock file recording a SHA-256 digest for every file, and never edits that copy. Its build reads only the copy, so nothing is fetched while a site builds, and an offline check fails the build if any file differs from the lock. [Adopting Stoa](/docs/stoa/adopting/) walks through it.

Every unit reads only `--stoa-*` custom properties. A site maps its own colours and type onto them in one bridge layer, and the units take on its look. [Themes and modes](/docs/stoa/themes/) shows the same unit in three sample themes.

## A first look

This is the Page Foot: the notes, sources and pending updates at the end of a page, then the site's footer strip. The bar above it switches the stage's theme and mode, and follows this page's light or night until you choose.

{% stoaStory "page-foot", "The Page Foot and site footer with sample notes, sources and a pending update." %}
