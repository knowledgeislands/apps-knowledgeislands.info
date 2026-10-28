---
title: Calendars and dates
order: 5
description: Show a site's dated entries as calendar views, a month-by-month timeline and today's board, all from one calendar set with subscribable feeds.
permalink: /docs/stoa/dates/
sources:
  - repository: knowledgeislands/packages-portal-commons
    path: packages/stoa/README.md
    ref: v0.27.1
    governs: 'The calendar set, its views, feeds and recurrence; the Timeline; the Today board'
    reviewed: '2026-10-28'
  - repository: knowledgeislands/packages-portal-commons
    path: apps/workbench/stories.js
    ref: v0.27.1
    governs: 'The live stories framed on this page and their sample inputs'
    reviewed: '2026-10-28'
---

# Calendars and dates

Stoa's three date units read one shared description of a site's dates, a calendar set: its calendars, each with a code and colour, and their entries, from a single event to a weekly series. The Calendar shows the set as views and writes an ICS feed per calendar; the Timeline and the Today board show the same entries another way.

## Calendar

The Calendar has three views of the set, Months, Runway and List, and a panel to choose which calendars show. Entries keep their real precision: a date known only to the month or the year stays that way rather than being pinned to a day. A calendar's feed can be subscribed to, so its dates appear in a reader's own calendar app and update there when the site changes.

{% stoaStory "calendar", "The Calendar over a sample set of two calendars, starting from a fixed today." %}

Weekly series may skip single dates, and times are shown in the set's time zone with an optional second zone. Colour is never the only signal: every entry carries its calendar's code too.

## Timeline

The Timeline renders every entry once, in date order across calendars, grouped by its starting month, with what has passed and what comes next marked as of the build's day.

{% stoaStory "timeline", "The Timeline of the same sample set." %}

## Today board

The Today board lists each calendar's entries for one day, including empty calendars. In the browser it refreshes at midnight in the set's time zone, so a page left open moves on to the next day by itself.

{% stoaStory "today-board", "The Today board of the same sample set." %}
