---
title: Search and filters
order: 4
description: Search a Stoa site from the keyboard with the Command Bar, list its shortcuts, and filter the items a page already shows.
permalink: /docs/stoa/finding/
sources:
  - repository: knowledgeislands/packages-portal-commons
    path: packages/stoa/README.md
    ref: v0.27.1
    governs: 'The Command Bar, its configuration and base, the Shortcut Registry, the Search Index Contract and the Filter Bar'
    reviewed: '2026-10-28'
  - repository: knowledgeislands/packages-portal-commons
    path: apps/workbench/stories.js
    ref: v0.27.1
    governs: 'The live stories framed on this page and their sample inputs'
    reviewed: '2026-10-28'
---

# Search and filters

Stoa gives a static site two ways to find things without a server: the Command Bar searches the whole site from an index written at build time, and the Filter Bar narrows the items already on a page. Both work from the keyboard and keep what you typed where you can share it.

## Command Bar and shortcuts

The Command Bar opens with Ctrl+K or ⌘K, or with / when you are not typing, and searches an index the build writes beside the pages. Results are grouped by kind, each with its badge, and an empty query offers the kinds the site chooses. Press ? for the shortcuts: one registry holds every shortcut the page has, and the help dialog lists exactly those.

{% stoaStory "command-bar", "The Command Bar over a small sample index; try lamp or survey, then press ? for the shortcuts." %}

The index is built and checked at build time by the Search Index Contract, from entries the site supplies. A site served from a folder rather than a host's root, like the workbench here, gives the Command Bar that folder as its `base`, and the index and every result resolve against it.

## Filter Bar

The Filter Bar filters the rows a build already wrote. Each row carries its fields as `data-f-<field>` attributes; the reader types `field:value` pills and free words, or picks a quick filter, and rows that do not match are hidden. The query is kept in the address as `?q=`, so a filtered view is a link.

{% stoaStory "filter-bar", "The Filter Bar over a sample table; type state:open and a space, or pick a quick filter." %}

Field values match whole values, case-insensitively, and free words match anywhere in a row's text. A site can filter without the bar's interface too, with the same query parser and matcher.
