---
title: Header and Page Foot
order: 3
description: The responsive header and the notes, sources and footer strip that frame a Stoa page, and what stays the site's own.
permalink: /docs/stoa/frame/
sources:
  - repository: knowledgeislands/packages-portal-commons
    path: packages/stoa/README.md
    ref: v0.27.2
    governs: 'The Header frame, its slots, collapse and identity area; the Page Foot, its data keys and the site strip; the build commit helper'
    reviewed: '2026-10-28'
  - repository: knowledgeislands/packages-portal-commons
    path: apps/workbench/stories.js
    ref: v0.27.2
    governs: 'The live stories framed on this page and their sample inputs'
    reviewed: '2026-10-28'
---

# Header and Page Foot

The Header and the Page Foot are the frame of a Stoa page: one row of brand, navigation and controls at the top, and the page's notes, sources and the site's footer strip at the end. Both render complete static markup at build time and only enhance it in the browser, so a reader without script loses nothing but the folding menu.

## Header

`renderHeader` takes a brand, the navigation and three slots, search, preferences and an end slot, and writes the whole `<stoa-header>`. The brand, the links and whatever goes in the slots belong to the site; the Header lays them out, marks the current page with `aria-current` and provides a skip link to the page's main content.

The Header folds by its own width, not the window's. Below the site's `collapseAt` width, 1100 pixels by default, the links move behind a burger and a compact search button stays beside it. On a phone the frame below shows it folded; in the workbench, the Phone and Tablet buttons narrow the stage to show it.

{% stoaStory "header", "The Header with a brand, a link group, a separator, search and the mode switch in its preferences slot." %}

On a site behind Cloudflare Access, the Header also shows who is signed in: a round profile button with the person's initial, opening a panel with their email and a real Sign out link on the same origin. Nothing about the person is in the built page; the area asks the site's own Access once the page loads. A site with no Access in front of it, as here, turns the area off with `identity: false`.

The Header reads its colours from `--stoa-header-bg`, `--stoa-header-fg` and `--stoa-header-border`, so a site paints it once, in its bridge layer.

## Page Foot

The Page Foot closes a page with up to three sections, notes, sources and pending updates, and then the site's footer strip with its name, links and build stamp. A page lists its sources by id in front matter; the site resolves each id against its own source register, and an unknown id fails the build. Empty sections disappear.

{% stoaStory "page-foot", "A Page Foot with notes, one source and one pending update, above a site footer strip." %}

Notes are trusted HTML the site renders; source titles and update text are escaped. The strip's build stamp comes from the build commit helper, which reads the deployed commit and its date at build time, so a page says which revision built it.
